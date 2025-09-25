const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/show", async (req, res) => {
  try {
    let data = await User.find();
    res.send(data);
  } catch (e) {
    console.log(e);
    res.json({ success: true });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.password, salt);
    await User.create({
      username: req.body.username,
      password: secPassword,
      role: req.body.role,
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

router.post("/login", async (req, res) => {
  let username = req.body.username;
  try {
    let userData = await User.findOne({ username });
    if (!userData) {
      return res
        .status(400)
        .json({ error : "user does not exist" });
    }
    const pwdCompare = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!pwdCompare) {
      return res
        .status(400)
        .json({ error : "Try logging with correct credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET;

     const data = {
        user : {
          id : userData.id
        }
      }
      console.log(data);

      const authToken = jwt.sign(data, jwtSecret);

    if (userData.role === "Admin") {
      return res.json({ success: true, admin: true, cashier : false, authToken});
    }

    //localStorage.setItem('cashier', true);
    return res.json({ success: true, admin: false, cashier : false, authToken}); 
  } catch (e) {
    console.log(e);
    res.json({ success: false });
  }
});

router.put("/update/:id", async (req, res) => {
  let { id } = req.params;
  let user = req.body;
 
  try {
    let editedUser = await User.findByIdAndUpdate(id, { ...user });
    console.log(editedUser);
    res.json({success : true});
  } catch (e) {
    console.log(e);
    res.json({success : false});
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let deletedUser = await User.findByIdAndDelete(id);
    console.log(deletedUser);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
