import express from "express";

import Post from "../models/Post.js";

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
      result = await Post.find({}).limit(4);
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/", async (req, res) => {
  const { startDate, endDate } = req.query;

  const result = await Post.find({
    created_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).limit(4);

  res.json({ result });
});

router.get("/stats", async (req, res) => {});

export default router;
