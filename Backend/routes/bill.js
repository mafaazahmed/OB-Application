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

router.post('/createBill', async (req,res) => {
     let id = req.body.order_id;
     console.log('Creating bill with ID:', id);
     try {
        let data = await Bill.findOne({order_id : id});
        if(data){
          console.log('Bill already exists with ID:', id);
          return res.status(409).json({ 
            success: false, 
            message: 'Bill with this ID already exists',
          });
        }else{
          const newBill = await Bill.create({
            bill_id : req.body.id,
            order_id : req.body.order_id,
            products : req.body.products,
            deliveryCharge : req.body.deliveryCharge,
            total : req.body.total,
            Date : req.body.Date
        });
        console.log('New bill created successfully:', newBill.bill_id);
        return res.status(201).json({ 
          success: true, 
          message: 'Bill created successfully',
          data: {
            billId: newBill.bill_id,
            order_id : newBill.order_id,
            total: newBill.total,
            status: newBill.status,
            createdAt: new Date().toISOString()
          }
        });
        }
      } catch (error) {
        console.error('Error creating bill:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error creating bill',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
      }
})

router.get('/lastBill', async (req, res) => {
  try {
    const lastBill = await Bill.findOne().sort({ _id: -1 }).limit(1);
    if (lastBill) {
      res.json(lastBill);
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'No bills found in database' 
      });
    }
  } catch (error) {
    console.error('Error fetching last bill:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching last bill from database',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
})

router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, products, deliveryCharge } = req.body;

    // Fetch existing bill first
    const existingBill = await Bill.findById(id);
    if (!existingBill) {
      return res.status(404).json({ success: false, message: 'Bill not found with the provided ID' });
    }

    const updateFields = {};

    // If status provided, validate and set
    if (typeof status !== 'undefined') {
      const validStatuses = ['Pending', 'Cash', 'Online'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be one of: Pending, Cash, Online', validStatuses });
      }
      updateFields.status = status;
    }

    let willRecomputeTotal = false;
    let newProducts = existingBill.products;
    let newDelivery = typeof deliveryCharge !== 'undefined' ? deliveryCharge : existingBill.deliveryCharge;

    // If products provided, validate type and set
    if (typeof products !== 'undefined') {
      if (!Array.isArray(products)) {
        return res.status(400).json({ success: false, message: 'Products must be an array' });
      }
      updateFields.products = products;
      newProducts = products;
      willRecomputeTotal = true;
    }

    // If deliveryCharge provided, set and mark for total recompute
    if (typeof deliveryCharge !== 'undefined') {
      updateFields.deliveryCharge = deliveryCharge;
      newDelivery = deliveryCharge;
      willRecomputeTotal = true;
    }

    // Recompute total if products or delivery changed
    if (willRecomputeTotal) {
      const productsTotal = (newProducts || []).reduce((sum, p) => {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        return sum + qty * price;
      }, 0);
      updateFields.total = productsTotal + (Number(newDelivery) || 0);
    }

    // If nothing to update, return early
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const updatedBill = await Bill.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    res.json({ success: true, message: 'Bill updated successfully', data: updatedBill });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ success: false, message: 'Internal server error while updating bill', error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong' });
  }
});

//check for the existing order_id
router.post('/checkId', async (req, res) => {
  let id = req.body.orderId;
  console.log(req.body)
  console.log("Checking orderId:", id);

  try {
    let order = await Bill.findOne({ order_id: id }); // 👈 confirm your schema field

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
