const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const swal = require("sweetalert")
const { redisclient } = require("../configs/redis");
const { UserModel } = require("../models/user.model");
const UserRouter = express.Router();

const { authentication } = require("../middlewares/authentication");

// UserRouter.get("/",(req,res)=>{
//     res.jsonFile(__dirname+"/index.html");
// })

UserRouter.post("/register", async (req, res) => {
  let user = req.body;
  console.log(req.body)
  try {
    let findUser = await UserModel.findOne({ email: user.email });
    console.log(findUser)
    if (findUser.email == user.email) {
      console.log(true)
      return res.json("the user is already registered");
    }
    bcrypt.hash(user.password, 6, async (err, hash) => {
      if (err) return res.json("something went wrong");
      else {
        user.password = hash;

        user = new UserModel(user);
        await user.save();
        res.json("The user user has now been registered");
      }
    });
  } catch (err) {
    console.log(err);
    res.json("something went wrong while registering!!!");
  }
});

//login router
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ msg: "the user does not exist, please signup first" });
    } else {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.json({ msg: "Invalid username or password" });
      }
      //an access token is generated.
      const token = jwt.sign(
        { userid: user._id, email: user.email, name: user.name },
        process.env.token
      );
      console.log(token);
      res.json({ msg: "login successful", token });
    }
  } catch (err) {
    console.log(err);
    res.send("something went wrong in login route");
  }
});


// Render All Users
UserRouter.get("/getall",async(req,res)=>{
  const all = await UserModel.find()
  res.json(all)
})


module.exports = {
  UserRouter,
};
