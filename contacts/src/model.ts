import * as mongoose from "mongoose";

export const ContactSchema = new mongoose.Schema({
  id: String,
  email: String,
}, {
  timestamps: true,
})

export const ContactModel = mongoose.model("Contact", ContactSchema)
