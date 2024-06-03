require("dotenv").config();
const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(req.body);
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
    return res.status(400).json({
      error: true,
      message: "user already exists",
    });
  } else {
    const newUser = new User({
      fullName,
      email,
      password,
    });

    await newUser.save();
  }

  const accessToken = jwt.sign(
    { id: newUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1hr",
    }
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

  const userInfo = await User.findOne({ email: email });

  if (!userInfo) {
    return res.status(400).json({ error: true, message: "user not found" });
  }

  if (userInfo.email == email && userInfo.password == password) {
    const User = { user: userInfo };
    const accessToken = jwt.sign(User, process.env.ACCESS_TOKEN_SECRET, {
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

app.post("/add-notes",authenticateToken,async(req,res)=>{
  const {title,content,tags}=req.body;
  const{User}=req.user;

  if(!title){
    return res.status(400).json({error:true,message:"title is required"});
  }
  if (!content){
    return res.status(400).json({error:true,message:"content is required"});
  }
  try{
    const Note=new Note({
      title,
      content,
      tags:tags||[],
      userId:user._id,
  })
  await Note.save();
  return res.json
  ({error:false,message:"note added successfully"})
  
}
catch(err){
  return res.status(500).json({
    error:true,
    

  })
});

mongoose.connect(
  "mongodb+srv://monesh:Monesh23@monesh.brclugk.mongodb.net/monesh"
);

app.listen(8000, () => {
  console.log("server is running on port 8000");
});

module.exports = app;
