import mongoose from "mongoose";

const schema = new mongoose.Schema({
  username: String,
  img_url: String,
  created_date: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", schema);

export default Post;
