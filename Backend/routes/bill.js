const express = require("express");
const router = express.Router();
const Bill = require('../models/bill');


router.get('/show', async (req,res) => {
     try {
        let data = await Bill.find();
        res.json({ 
          success: true, 
          message: `Found ${data.length} bills`,
          data: data 
        });
      } catch (e) {
        console.error('Error fetching bills:', e);
        res.status(500).json({ 
          success: false, 
          message: 'Error fetching bills from database',
          error: process.env.NODE_ENV === 'development' ? e.message : 'Something went wrong'
        });
      }
})

router.post("/createBill", async (req, res) => {
  try {
    const {
      order_id,
      products,
      deliveryCharge = 0,
      total,
      profitByCategory,
      profit,
      billDate,
    } = req.body;

    console.log("Creating bill with Order ID:", order_id);

    // ✅ Prevent duplicate bills by order_id
    const existingBill = await Bill.findOne({ order_id });
    if (existingBill) {
      console.log("Bill already exists with ID:", order_id);
      return res.status(409).json({
        success: false,
        message: "Bill with this ID already exists",
      });
    }

    // ✅ Validate required fields
    if (!order_id || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid data format",
      });
    }

    // ✅ Directly save bill from frontend (no calculations)
    console.log(profit);
    const newBill = await Bill.create({
      order_id,
      products,
      deliveryCharge,
      total,
      profitByCategory,
      profit,
      Date : billDate,
    });

    console.log("✅ Bill saved successfully for order:", newBill.order_id);

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: {
        order_id: newBill.order_id,
        total: newBill.total,
        profit: newBill.profit,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error creating bill:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating bill",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
});

// router.get('/lastBill', async (req, res) => {
//   try {
//     const lastBill = await Bill.findOne().sort({ _id: -1 }).limit(1);
//     if (lastBill) {
//       // return the whole bill document, order_id will be present
//       res.json(lastBill);
//     } else {
//       res.status(404).json({ 
//         success: false, 
//         message: 'No bills found in database' 
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching last bill:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching last bill from database',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
//   }
// })

router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, receivedamount } = req.body;

    const existingBill = await Bill.findById(id);
    if (!existingBill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const updates = {};

    // Optional status update (must be valid if provided)
    if (typeof status !== 'undefined') {
      const validStatuses = ['Pending', 'Cash', 'Online'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      updates.status = status;
    }

    // Optional received amount update
    if (typeof receivedamount !== 'undefined') {
      const num = Number(receivedamount);
      if (Number.isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, message: 'Invalid receivedamount. Must be a non-negative number.' });
      }
      updates.receivedamount = num;
    }

    // Apply updates and save
    Object.assign(existingBill, updates);
    await existingBill.save();

    return res.json({ success: true, message: 'Bill updated', data: existingBill });
  } catch (error) {
    console.error('Error updating bill:', error);
    return res.status(500).json({ success: false, message: 'Error updating bill', error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' });
  }
});

// DELETE a bill by its Mongo document _id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'No bill id provided' });
    }

    const existing = await Bill.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await Bill.findByIdAndDelete(id);

    return res.json({ success: true, message: 'Bill deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return res.status(500).json({ success: false, message: 'Error deleting bill', error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' });
  }
});

//check for the existing order_id
router.post('/checkId', async (req, res) => {
  let id = req.body.orderId.toUpperCase().trim();
  console.log(req.body)
  console.log("Checking orderId:", id);

  try {
    let order = await Bill.findOne({ order_id: id }); // confirm schema field

    if (order) {
      return res.status(200).json({
        success: true,
        message: 'Bill already exists with this Order ID',
        orderId: order.order_id   // 👈 send this back to frontend
      });
    }

    // ✅ Always send a response even if not found
    return res.status(200).json({
      success: false,
      message: 'No bill found with this Order ID'
    });

  } catch (e) {
    console.error('Error checking order ID:', e);
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking order ID in database',
      error: e.message
    });
  }
});

module.exports = router;
