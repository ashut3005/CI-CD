const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔹 Connect MongoDB
mongoose.connect("mongodb+srv://root:123@cluster0.zgyngz9.mongodb.net/")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// 🔹 Create Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

// 🔹 Create Model
const User = mongoose.model("User", userSchema);

// Serve page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle registration
app.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;

    const newUser = new User({ name, email });
    await newUser.save();

    res.send(`
      <h2>Registration Successful ✅</h2>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <a href="/">Go Back</a>
    `);

  } catch (error) {
    res.send("Error saving data ❌");
  }
});

// View all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(5000, () => console.log("Server running on port 5000"));