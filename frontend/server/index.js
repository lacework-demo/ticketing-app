const path = require('path');
const morgan = require('morgan');
const express = require('express');
const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();
const PORT = process.env.PORT || 3001
const app = express();
const got = require("got")
const bodyParser = require('body-parser')

let ticketsService = process.env.BACKEND || 'http://localhost:8999'
let contactsService = process.env.CONTACTS || 'http://localhost:9001'
let assetsService = process.env.ASSETS || 'http://localhost:9000'

// Set from K8s if present
if (process.env.BACKEND_SERVICE_HOST !== "" && process.env.BACKEND_SERVICE_PORT) {
  ticketsService = `http://${process.env.BACKEND_SERVICE_HOST}:${process.env.BACKEND_SERVICE_PORT}`
}
if (process.env.TICKETING_CONTACTS_SERVICE_HOST !== "" && process.env.TICKETING_CONTACTS_SERVICE_PORT) {
  contactsService = `http://${process.env.TICKETING_CONTACTS_SERVICE_HOST}:${process.env.TICKETING_CONTACTS_SERVICE_PORT}`
}
if (process.env.TICKETING_ASSETS_SERVICE_HOST !== "" && process.env.TICKETING_ASSETS_SERVICE_PORT) {
  assetsService = `http://${process.env.TICKETING_ASSETS_SERVICE_HOST}:${process.env.TICKETING_ASSETS_SERVICE_PORT}`
}

function selectProxyHost() {
  const hsts = ticketsService.split(",")
  return hsts[Math.floor(Math.random() * hsts.length)];
}

console.log(`configured backend ${ticketsService}`)
app.use(morgan('combined'))
app.use(express.static(path.resolve(__dirname, '.')));


app.get("/tickets", async (req, res) => {
  const backendHost = selectProxyHost()
  console.log(`backend server(s): ${backendHost}`)
  try {
    // Get tickets
    const tickets = await got.get(`${backendHost}/tickets`).json()
    // Get contacts
    const contacts = await got.get(`${contactsService}/contacts`).json()
    // Get assets
    const assets = await got.get(`${assetsService}/assets`).json()

    const goodTickets = []
    tickets.forEach(t => {
      const contact = contacts.filter(c => {
        return c.id === t.contactId
      })
      t.contactId = contact[0].email

      if (t.assetId !== "" || t.assetId !== undefined) {
        const asset = assets.filter(a => a.id === t.assetId)
        if (asset[0] !== undefined) {
          t.assetId = asset[0].name
        }
      }
      goodTickets.push(t)
    })

    res.status(200)
    res.send(goodTickets)
  } catch (e) {
    console.log(e)
    res.status(500)
    res.send("")
  }
});

app.post("/tickets", bodyParser.json(), async (req, res) => {
  // {
  //   email: string,
  //   asset: nil or id
  //   subject: string
  //   body: string
  //   metadata: string
  // }
  //
  let contactId
  try {
    // Fetch or create contact
    try {
      const contact = await got.get(`${contactsService}/contacts/${req.body.email}`).json()
      contactId = contact[0].id
    } catch (e) {
      const contact = await got.post(`${contactsService}/contacts`, {
        json: {
          email: req.body.email
        }
      }).json()
      contactId = contact.id
    }

    // Fetch or create asset
    let assetId
    if (req.body.asset !== undefined) {
      try {
        const asset = await got.get(`${assetsService}/assets/${req.body.asset}`).json()
        assetId = asset.name
      } catch (e) {
        const asset = await got.post(`${assetsService}/assets`, {
          json: {
            name: req.body.asset
          }
        }).json()
        assetId = asset.name
      }
    }

    // Create ticket
    const backendHost = selectProxyHost()
    const ticket = await got.post(`${backendHost}/tickets`, {
      json: {
        subject: req.body.subject || "untitled ticket",
        body: req.body.body,
        contactId: contactId,
        metadata: req.body.metadata || "",
        assetId: assetId || "",
      }
    })
    res.status(200).send(ticket.body)
  } catch (e) {
    console.log(e)
    res.status(500).send({message: "something went wrong"})
  }
});

app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, '.', 'index.html'));
});
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
