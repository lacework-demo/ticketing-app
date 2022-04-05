import {Request, Response} from "express";
import {AssetModel} from "./model";
import MD5 from "crypto-js/md5";

export const create = (req: Request, res: Response) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "asset cannot have an empty name"
    })
  }

  const asset = new AssetModel({
    name: req.body.name,
    id: MD5(req.body.name),
  });

  asset.save()
    .then(data => {
      res.send(data)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred"
      })
    })
}

export const findAll = (req: Request, res: Response) => {
  AssetModel.find()
    .then(assets => {
      res.send(assets)
    }).catch(err => {
      res.status(500).send({
        message: err.message || "error occurred fetching assets"
      })
    })
}

export const findOne = (req: Request, res: Response) => {
  AssetModel.find()
  .then(assets => {
    let asset = undefined
    assets.forEach(a => {
      if (a.name === req.params.name) {
        asset = a
      }
    })
    if (asset !== undefined) {
      res.status(200).send(asset)
    } else {
      res.status(404).send({message: 'contact not found'})
    }
  })
}

export const deleteOne = (req: Request, res: Response) => {
  AssetModel.findByIdAndRemove(req.params.assetId)
    .then(asset => {
      if (!asset) {
        return res.status(404).send({
          message: "asset not found with id " + req.params.assetId
        });
      }
      res.send({message: "asset deleted successfully!"});
    }).catch(err => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: "asset not found with id " + req.params.assetId
        });
      }
      return res.status(500).send({
        message: "Could not delete asset with id " + req.params.assetId
      });
    });
}
