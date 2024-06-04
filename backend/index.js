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

// Create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      error: false,
      user: newUser,
      accessToken,
      message: "Registration successful",
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const userInfo = await User.findOne({ email });

    if (!userInfo || userInfo.password !== password) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: userInfo._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1hr" }
    );

    return res.json({
      error: false,
      message: "Login successful",
      email,
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});
//get user
app.get("/get-user", authenticateToken ,async (req, res) => {
  const { user} =req.user;

  const isUser = await User.findOne({ _id: user._id });


  if(!isUser){
    return res.sendStatus(401);

  }
  return res.json({
    user:isUser,
    message:"",
  })
})


// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Token Verification Error:", err);
      return res.sendStatus(403);
    }
    req.user = user; // Assign the decoded payload to req.user
    next();
  });
}

// Add note
app.post("/add-notes", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({ error: true, message: "Title and content are required" });
  }

  try {
    const newNote = new Note({
      title,
      content,
      tags: tags || [],
      userId: req.user.id,
    });

    await newNote.save();
    return res.json({ error: false, message: "Note added successfully" });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});

// Edit note
app.put("/edit-notes/:noteId", authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  const { title, content, tags, isPinned } = req.body;

  if (!title && !content && !tags && typeof isPinned === "undefined") {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

    await note.save();
    return res.json({ error: false, message: "Note updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});

// Get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id });
    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Error retrieving notes" });
  }

});

// Delete note
app.delete("/delete-notes/:noteId", authenticateToken, async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await note.deleteOne();
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});

// Pin/Unpin note
app.put("/update-notes/:noteId", authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  const { isPinned } = req.body;

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (typeof isPinned !== "undefined") note.isPinned = isPinned;

    await note.save();
    return res.json({ error: false, message: "Note updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Internal error" });
  }
});

mongoose.connect(
  "mongodb+srv://monesh:Monesh23@monesh.brclugk.mongodb.net/monesh",
  { socketTimeoutMS: 30000 }
);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

module.exports = app;
