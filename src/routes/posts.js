import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import Jimp from "jimp";

import Post from "../models/Post.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let result;
    const hasFilters = Boolean(startDate) || Boolean(endDate);

    if (hasFilters) {
      result = await Post.find({
        created_date: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) }),
        },
      }).sort({ created_date: -1 });
    } else {
      result = await Post.find({}).sort({ created_date: -1 }).limit(4);
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const JPEG_FILE_BUFFER = req.file.buffer;
    const workingImage = await Jimp.read(JPEG_FILE_BUFFER);
    const PNG_FILE_BUFFER = await workingImage.getBufferAsync(Jimp.MIME_PNG);

    const uploadedImage = await s3
      .upload({
        Body: PNG_FILE_BUFFER,
        Bucket: process.env.AWS_S3_BUCKETNAME,
        Key: `${Date.now()}.png`,
      })
      .promise();

    await Post.create({
      username: req.body.username,
      img_url: uploadedImage.Location,
    });

    res.status(201).json({ result: "OK" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const result = await Post.aggregate([
      {
        $project: {
          year: {
            $year: "$created_date",
          },
          hour: {
            $hour: "$created_date",
          },
        },
      },
      {
        $match: {
          year: currentYear,
        },
      },
      {
        $project: {
          hour: 1,
        },
      },
      {
        $group: {
          _id: "$hour",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
