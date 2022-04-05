import * as mongoose from "mongoose";

export const AssetSchema = new mongoose.Schema({
  id: String,
  name: String,
}, {
  timestamps: true,
})

export const AssetModel = mongoose.model("Asset", AssetSchema)
