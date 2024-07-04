const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authRole = require("../middleware/authRole");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send("User registered");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put(
  "/user/:id",
  authRole(["Admin", "Moderator", "User"]),
  async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
      const updateUser = {};
      if (username) updateUser.username = username;
      if (email) updateUser.email = email;
      if (password) updateUser.password = await bcrypt.hash(password, 10);

      const user = await User.findByIdAndUpdate(id, updateUser, { new: true });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  "/user/:id",
  authRole(["Admin", "Moderator", "User"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) return res.status(404).send("User not found");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get(
  "/users",
  authRole(["Admin", "Moderator", "User"]),
  async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
      const users = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

module.exports = router;
