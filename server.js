// const express = require("express");
// const path = require("path");
// const mongoose = require("mongoose");

// const app = express();
// app.use(express.urlencoded({ extended: true }));

// // 🔹 Connect MongoDB
// mongoose.connect("mongodb+srv://root:123@cluster0.zgyngz9.mongodb.net/")
// .then(() => console.log("MongoDB Connected ✅"))
// .catch(err => console.log(err));

// // 🔹 Create Schema
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String
// });

// // 🔹 Create Model
// const User = mongoose.model("User", userSchema);

// // Serve page
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// // Handle registration
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     const newUser = new User({ name, email });
//     await newUser.save();

//     res.send(`
//       <h2>Registration Successful ✅</h2>
//       <p>Name: ${name}</p>
//       <p>Email: ${email}</p>
//       <a href="/">Go Back</a>
//     `);

//   } catch (error) {
//     res.send("Error saving data ❌");
//   }
// });

// // View all users
// app.get("/users", async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// });

// app.listen(5000, () => console.log("Server running on port 5000"));





const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔹 MongoDB Connection
mongoose.connect("mongodb+srv://root:123@cluster0.zgyngz9.mongodb.net/")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error:", err));

// 🔹 AWS S3 Config (IAM role preferred)
AWS.config.update({
  region: ap-south-1
});

const s3 = new AWS.S3();

// 🔹 Multer (store file in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 🔹 Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String
});

const User = mongoose.model("User", userSchema);

// 🔹 Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 Register + Upload Image
app.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!req.file) {
      return res.send("Please upload an image ❌");
    }

    // 🔹 Upload to S3
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: Date.now() + "-" + req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const result = await s3.upload(params).promise();

    // 🔹 Save to MongoDB
    const user = new User({
      name,
      email,
      image: result.Location
    });

    await user.save();

    res.send(`
      <h2>Registration Successful ✅</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <img src="${result.Location}" width="200"/>
      <br><br>
      <a href="/">Go Back</a>
    `);

  } catch (err) {
    console.log("ERROR:", err);
    res.send("Error uploading ❌");
  }
});

// 🔹 View users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 🔹 Start server
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});