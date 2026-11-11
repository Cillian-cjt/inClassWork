import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

const createPost = async (req, res) => {
  try {
    const { name, description, age, createdBy } = req.body;
    if (!name?.trim() || !description?.trim() || age === undefined || age === "") {
      return res.status(400).json({ message: "Name, description, and age are required" });
    }

    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 150) {
      return res.status(400).json({ message: "Age must be a whole number between 1 and 150" });
    }

    if (createdBy) {
      if (!mongoose.isValidObjectId(createdBy)) {
        return res.status(400).json({ message: "createdBy must be a valid User ID" });
      }
      const userExists = await User.exists({ _id: createdBy });
      if (!userExists) return res.status(404).json({ message: "User for createdBy was not found" });
    }

    const post = await Post.create({ name, description, age: numericAge, ...(createdBy ? { createdBy } : {}) });
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("createdBy", "username email");
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Could not load posts", error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }
    const allowedFields = ["name", "description", "age"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields supplied for update" });
    }
    if (updates.age !== undefined) {
      updates.age = Number(updates.age);
      if (!Number.isInteger(updates.age) || updates.age < 1 || updates.age > 150) {
        return res.status(400).json({ message: "Age must be a whole number between 1 and 150" });
      }
    }
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate("createdBy", "username email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    return res.status(status).json({ message: "Could not update post", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ message: "Post deleted successfully", deleted });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;
    return res.status(status).json({ message: "Could not delete post", error: error.message });
  }
};

export { createPost, getPosts, updatePost, deletePost };
