import {Request, Response} from "express";
import {ContactModel} from "./model";
import MD5 from "crypto-js/md5";

export const create = (req: Request, res: Response) => {
  if (!req.body.email) {
    return res.status(400).send({
      message: "contact cannot have an empty email"
    })
  }

  const contact = new ContactModel({
    email: req.body.email,
    id: MD5(req.body.email),
  });

  contact.save()
    .then(data => {
      res.send(data)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred"
      })
    })
}

export const findAll = (req: Request, res: Response) => {
  ContactModel.find()
    .then(contacts => {
      res.send(contacts)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred fetching contacts"
      })
    })
}

export const findOne = (req: Request, res: Response) => {
  ContactModel.find()
  .then(contacts => {
    let contact = undefined
    contacts.forEach(c => {
      if (c.email === req.params.email) {
        contact = c
      }
    })
    if (contact !== undefined) {
      res.status(200).send(contact)
    } else {
      res.status(404).send({message: 'contact not found'})
    }
  })
}

export const deleteOne = (req: Request, res: Response) => {
  ContactModel.findByIdAndRemove(req.params.contactId)
    .then(contact => {
      if (!contact) {
        return res.status(404).send({
          message: "contact not found with id " + req.params.contactId
        });
      }
      res.send({message: "contact deleted successfully!"});
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "contact not found with id " + req.params.contactId
        });
      }
      return res.status(500).send({
        message: "Could not delete contact with id " + req.params.contactId
      });
    });
}
