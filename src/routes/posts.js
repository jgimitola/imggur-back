import express from "express";
import multer from "multer";

import Post from "../models/Post.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
      });
    } else {
      result = await Post.find({}).sort({ created_date: -1 }).limit(4);
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  console.log(req.file);

  await Post.create({
    username: req.body.username,
    img_url: "https://pixlr.com/images/index/collage.webp",
  });

  res.status(201).json({ result: "OK" });
});

router.get("/stats", async (req, res) => {});

export default router;
