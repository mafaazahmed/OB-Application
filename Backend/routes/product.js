const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// ✅ Show all products
router.get("/show", async (req, res) => {
  try {
    let product = await Product.find();
    res.send(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

// ✅ Add product
router.post("/add", async (req, res) => {
  try {
    await Product.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      profit : req.body.profit,
      actual_price : req.body.actual_price
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

// ✅ Update product
router.put("/update/:id", async (req, res) => {
  let { id } = req.params;
  let product = req.body;

  try {
    let updatedProduct = await Product.findByIdAndUpdate(id, { ...product });
    res.json({ success: true, updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

// ✅ Delete product
router.delete("/delete/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let deletedProduct = await Product.findByIdAndDelete(id);
    res.json({ success: true, deletedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
