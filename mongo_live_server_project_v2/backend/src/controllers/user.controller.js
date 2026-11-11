import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username?.trim() || !password || !email?.trim()) {
      return res.status(400).json({ message: "Please provide username, email and password" });
    }
    const normalisedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ $or: [{ username: username.trim() }, { email: normalisedEmail }] });
    if (existing) return res.status(409).json({ message: "Username or email already exists" });

    const user = await User.create({ username: username.trim(), email: normalisedEmail, password });
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
    return res.status(200).json({
      message: "User logged in",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User logged out" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Could not load users", error: error.message });
  }
};

export { registerUser, loginUser, logoutUser, getUsers };
