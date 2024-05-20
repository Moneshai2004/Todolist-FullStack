require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
mongoose
  .connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({error: true, message: "fullName is required" });
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
    return res.status(400).json({
      error: true,
      message: "user already exists",
    });
  }

  const newUser = new User({
    fullName,
    email,
    password,
  });

  await newUser.save();

  const accessToken = jwt.sign(
    { user: newUser },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "36000m",
    }
  );

  return res.json({
    error: false,
    user: newUser,
    accessToken,
    message: "Registration Successful",
  });
});

app.listen(8000, () => {
  console.log("server is running on port 8000");
});

module.exports = app;
