const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

/*
  =========================================
  GET ALL POSTS
  =========================================
*/
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/*
  =========================================
  CREATE POST
  =========================================
*/
router.post("/", async (req, res) => {
  try {
    const { title, content, category, company, author } = req.body;
    
    const newPost = await Post.create({
      title,
      content,
      category,
      company,
      author
    });
    
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/*
  =========================================
  DELETE POST
  =========================================
*/
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({
      message: "Post deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/*
  =========================================
  TOGGLE LIKE/UNLIKE POST
  =========================================
*/
router.put("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required to toggle likes." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Safety fallback initialization
    if (!post.likes) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike logic: filter it out
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like logic: push the id string
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/*
  =========================================
  ADD COMMENT TO POST
  =========================================
*/
router.post("/:id/comment", async (req, res) => {
  try {
    const { userName, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text cannot be empty." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Append the subdocument fields aligning with your Post model schema
    post.comments.push({
      text,
      userName: userName || "Anonymous"
    });

    await post.save();
    res.json(post);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;