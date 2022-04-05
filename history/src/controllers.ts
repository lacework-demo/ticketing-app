import {Request, Response} from "express";
import {TicketModel} from "./model";

export const create = (req: Request, res: Response) => {
  if (!req.body.body) {
    return res.status(400).send({
      message: "ticket cannot have an empty body"
    })
  }
  if (!req.body.subject) {
    return res.status(400).send({
      message: "ticket cannot have an empty subject"
    })
  }

  var metadata = ""
  if (req.body.metadata) {
    // parse JSON
    metadata = req.body.metadata
    try {
      eval(`var metadata = ${metadata}`)
    } catch (e) {
      console.log("couldn't parse")
    }
  }

  const ticket = new TicketModel({
    subject: req.body.subject || "untitled ticket",
    body: req.body.body,
    metadata: req.body.metadata,
  });

  ticket.save()
    .then(data => {
      res.send(data)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred"
      })
    })
}

export const findAll = (req: Request, res: Response) => {
  TicketModel.find()
    .then(tickets => {
      res.send(tickets)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred fetching tickets"
      })
    })
}

export const findOne = (req: Request, res: Response) => {
  TicketModel.findById(req.params.ticketId)
    .then(ticket => {
      if (!ticket) {
        return res.status(404).send({
          message: `ticket not found by id (${req.params.ticketId})`,
        })
      }
      res.send(ticket)
    })
    .catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "ticket not found with id " + req.params.ticketId
        });
      }
      return res.status(500).send({
        message: "Error retrieving ticket with id " + req.params.ticketId
      });
    })
}

export const update = (req: Request, res: Response) => {
  // Validate Request
  if (!req.body.content) {
    return res.status(400).send({
      message: "ticket content can not be empty"
    });
  }

  // Find ticket and update it with the request body
  TicketModel.findByIdAndUpdate(req.params.ticketId, {
    title: req.body.title || "Untitled ticket",
    content: req.body.content
  }, {new: true})
    .then(ticket => {
      if (!ticket) {
        return res.status(404).send({
          message: "ticket not found with id " + req.params.ticketId
        });
      }
      res.send(ticket);
    }).catch(err => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: "ticket not found with id " + req.params.ticketId
        });
      }
      return res.status(500).send({
        message: "Error updating ticket with id " + req.params.ticketId
      });
    });
}


export const deleteOne = (req: Request, res: Response) => {
  TicketModel.findByIdAndRemove(req.params.noteId)
    .then(ticket => {
      if (!ticket) {
        return res.status(404).send({
          message: "ticket not found with id " + req.params.ticketId
        });
      }
      res.send({message: "ticket deleted successfully!"});
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "ticket not found with id " + req.params.ticketId
        });
      }
      return res.status(500).send({
        message: "Could not delete ticket with id " + req.params.ticketId
      });
    });
}
