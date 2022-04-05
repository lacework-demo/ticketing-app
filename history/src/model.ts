import * as mongoose from "mongoose";

export const TicketSchema = new mongoose.Schema({
  subject: String,
  body: String,
  metadata: String,
}, {
  timestamps: true,
})

export const TicketModel = mongoose.model("Ticket", TicketSchema)
