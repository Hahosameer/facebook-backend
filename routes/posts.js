import express, { application } from "express";
const router = express.Router();
import Post from "../models/Poste.js";
import User from "../models/User.js";

// Create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savePost = await newPost.save();

    res.status(200).json(savePost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update a post\
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can updated only post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can deleted only post");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been likes");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been dislikes");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});
//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
  const currentUser = await User.findById(req.params.userId);
  const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    console.error("Error ho time line ka:", error);
    res.status(500).json(error);
  }
});



//get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ userId: user._id });
    if (!posts) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
});

export { router as postRoute };
