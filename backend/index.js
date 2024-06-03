require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "fullName is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "password is required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ error: true, message: "user already exists" });
  } else {
    const newUser = new User({ fullName, email, password });
    await newUser.save();
  }

  const accessToken = jwt.sign(
    { id: newUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1hr" }
  );

  return res.json({
    error: false,
    user: newUser,
    accessToken,
    message: "Registration Successful",
  });
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "password is required" });
  }

  const userInfo = await User.findOne({ email });

  if (!userInfo) {
    return res.status(400).json({ error: true, message: "user not found" });
  }

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1hr",
    });
    return res.json({
      error: false,
      message: "login successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "invalid credentials",
    });
  }
});

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token:", token);
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Token Verification Error:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log("Verified User:", user);
    next();
  });
}

app.post("/add-notes", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "content is required" });
  }
  try {
    const newNote = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await newNote.save();
    return res.json({ error: false, message: "note added successfully" });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "internal error",
    });
  }
});

app.put("/edit-notes/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags && typeof isPinned === "undefined") {
    return res
      .status(400)
      .json({ error: true, message: "no changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "note not found",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== "undefined") note.isPinned = isPinned;

    await note.save();
    return res.json({ error: false, message: "note updated successfully" });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "internal error",
    });
  }
});





mongoose.connect(
  "mongodb+srv://monesh:Monesh23@monesh.brclugk.mongodb.net/monesh",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.listen(8000, () => {
  console.log("server is running on port 8000");
});

module.exports = app;
