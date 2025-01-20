const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;

app.use(express.json());

// database connection
mongoose
  .connect("mongodb+srv://weunboxstore:unboxmajor1@unboxmajor.n8un7.mongodb.net/?retryWrites=true&w=majority&appName=Unboxmajor")
  .then(console.log("database connected successfully"))
  .catch((err) => {
    console.log("error in connecting with db", err);
  });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    // unique: true,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Hello from server");
});

// signup api
app.post("/signup", async (req, res) => {
  try {
    // name, email & password user se le lo
    const { name, email, password } = req.body;

    console.log(req.body);

    // check kro usne sahi mai name, email aur password diya hai ya nahi
    // agar nahi hai to usko vapas bhej do saying "please enter required crendentials"
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Enter Required Credentials" });
    }

    // check kro ki yeh insan pehle se hi registered hai ya nahi
    // if the email exists return an error saying email already exists
    // existing user
    const existingUser = await User.findOne({ email });

    console.log("basic check", existingUser);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists, Please Login" });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(200).json({ msg: "user signup successfull", data: savedUser });

    //save the entire user
  } catch (err) {
    res.status(400).json({ error: "Environment Fat gaya", error: err });
  }
});

app.post("/login", async (req, res) => {
  try {
    // take user info
    const { email, password } = req.body;

    // check user info -- if one of the fields is missing apply validation to respond with error
    if (!email || !password) {
      return res.status(400).json({ msg: "Enter required credentials" });
    }

    //if the user already exist
    // true -- login

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(500).json({ msg: "User does not exists" });
    }

    //password check -- bcrypt.compare

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    // generate token -- it need secret key

    const token = await jwt.sign({ userId: user._id }, "my_secret", {
      expiresIn: "1h",
    });

    // login user and retur token

    res.status(200).json({ msg: "user loggedin successfully", data: token });
  } catch {}
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
