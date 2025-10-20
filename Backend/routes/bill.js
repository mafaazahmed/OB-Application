const express = require("express");
const router = express.Router();
const Bill = require('../models/bill');

// Regex to extract common size patterns (e.g., "1/2", "1.5", "200") and their units ("kg" or "gm")
const sizeRegex = /((\d{1,2}\/\d{1,2})|(\d+(\.\d+)?))\s*(kg|gm)/i;

const convertToKgs = (numericPart, unit) => {
  unit = unit.toLowerCase().trim();
  if (unit === 'kg') {
    if (numericPart.includes('/')) {
      const parts = numericPart.split('/');
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(numericPart);
  } else if (unit === 'gm') {
    return parseFloat(numericPart) / 1000;
  }
  return 0;
};

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

    // Calculate kgsSold based on products, their quantity, and size for each specific category
    const kgsByCategoryMap = {};

    products.forEach(product => {
      const productName = product.name.toLowerCase();
      const quantity = Number(product.quantity) || 0;
      const productSize = product.size; 
      const productCategory = product.category; // Get the specific category

      let numericPartFromMatch = null;
      let unitFromMatch = null;

      if (productSize) {
        const sizeMatch = productSize.match(sizeRegex);
        if (sizeMatch) {
          numericPartFromMatch = sizeMatch[2] || sizeMatch[3];
          unitFromMatch = sizeMatch[5];
        }
      } else if (productName.includes('.')) {
        return; 
      } else {
        const nameSizeMatch = productName.match(sizeRegex);
        if (nameSizeMatch) {
          numericPartFromMatch = nameSizeMatch[2] || nameSizeMatch[3];
          unitFromMatch = nameSizeMatch[5];
        }
      }

      if (numericPartFromMatch && unitFromMatch && productCategory) {
        const kgs = convertToKgs(numericPartFromMatch, unitFromMatch) * quantity;

        // Only accumulate kgs for relevant meat categories
        const lowerCaseCategory = productCategory.toLowerCase();
        if (kgs > 0 && (lowerCaseCategory.includes('chicken') || lowerCaseCategory.includes('beef') || lowerCaseCategory.includes('mutton'))) {
            // Apply specific exclusion for "ghat kaliji" only if it's a mutton category
            if (lowerCaseCategory.includes('mutton') && productName.includes('ghat kaliji')) {
                return; // Skip this product for kg calculation
            }
            const categoryKey = productCategory; // Use productCategory directly as it matches enum
            kgsByCategoryMap[categoryKey] = (kgsByCategoryMap[categoryKey] || 0) + kgs;
        }
      }
    });

    const kgsSold = Object.keys(kgsByCategoryMap).map(cat => ({
        category: cat,
        kg: Math.round(kgsByCategoryMap[cat] * 100) / 100
    }));

    // ✅ Directly save bill from frontend (no calculations)
    console.log(profit);
    const newBill = await Bill.create({
      order_id,
      products: products.map(p => ({ ...p, size: p.size || "1kg" })), // Ensure size is stored in bill products
      deliveryCharge,
      total,
      profitByCategory,
      profit,
      Date : billDate,
      kgsSold, // Add calculated kgsSold to the bill
    });

    console.log("✅ Bill saved successfully for order:", newBill);

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

// Calculate kgs for Chicken, Beef, and Mutton from bill products
router.post('/calculateKgs', async (req, res) => {
  try {
    const { billObject } = req.body;
    
    if (!billObject || !billObject.products || !Array.isArray(billObject.products)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bill object or missing products array'
      });
    }

    // Initialize variables for total kgs
    let chickenKgs = 0;
    let beefKgs = 0;
    let muttonKgs = 0;

    // Helper function to convert size to kgs
    const convertToKgs = (size) => {
      size = size.toLowerCase().trim();
      
      // Handle kg sizes
      if (size.includes('1kg')) return 1;
      if (size.includes('3/4kg')) return 0.75;
      if (size.includes('1/2kg')) return 0.5;
      if (size.includes('1/4kg')) return 0.25;
      
      // Handle gram sizes for mutton
      if (size.includes('100gm')) return 0.1;
      if (size.includes('150gm')) return 0.15;
      if (size.includes('200gm')) return 0.2;
      if (size.includes('300gm')) return 0.3;
      if (size.includes('350gm')) return 0.35;
      if (size.includes('400gm')) return 0.4;
      
      return 0;
    };

    // Process each product in the bill
    billObject.products.forEach(product => {
      const productName = product.name.toLowerCase();
      const quantity = product.quantity || 0;
      
      // Extract size from product name
      let size = '';
      
      // Check for Chicken products
      if (productName.includes('chicken')) {
        if (productName.includes('boneless')) {
          // Extract size for boneless chicken
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
        } else {
          // Extract size for regular chicken
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
        }
        
        if (size) {
          chickenKgs += convertToKgs(size) * quantity;
        }
      }
      
      // Check for Beef products
      else if (productName.includes('beef')) {
        if (productName.includes('boneless')) {
          // Extract size for boneless beef
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
        } else {
          // Extract size for regular beef
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
        }
        
        if (size) {
          beefKgs += convertToKgs(size) * quantity;
        }
      }
      
      // Check for Mutton products
      else if (productName.includes('mutton')) {
        if (productName.includes('boneless')) {
          // Extract size for boneless mutton
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
          else if (productName.includes('100gm')) size = '100gm';
          else if (productName.includes('150gm')) size = '150gm';
          else if (productName.includes('200gm')) size = '200gm';
          else if (productName.includes('300gm')) size = '300gm';
          else if (productName.includes('350gm')) size = '350gm';
          else if (productName.includes('400gm')) size = '400gm';
        } else {
          // Extract size for regular mutton
          if (productName.includes('1kg')) size = '1kg';
          else if (productName.includes('3/4kg')) size = '3/4kg';
          else if (productName.includes('1/2kg')) size = '1/2kg';
          else if (productName.includes('1/4kg')) size = '1/4kg';
          else if (productName.includes('100gm')) size = '100gm';
          else if (productName.includes('150gm')) size = '150gm';
          else if (productName.includes('200gm')) size = '200gm';
          else if (productName.includes('300gm')) size = '300gm';
          else if (productName.includes('350gm')) size = '350gm';
          else if (productName.includes('400gm')) size = '400gm';
        }
        
        if (size) {
          muttonKgs += convertToKgs(size) * quantity;
        }
      }
    });

    // Round to 2 decimal places
    chickenKgs = Math.round(chickenKgs * 100) / 100;
    beefKgs = Math.round(beefKgs * 100) / 100;
    muttonKgs = Math.round(muttonKgs * 100) / 100;

    return res.status(200).json({
      success: true,
      message: 'Kgs calculated successfully',
      data: {
        chickenKgs,
        beefKgs,
        muttonKgs,
        totalKgs: Math.round((chickenKgs + beefKgs + muttonKgs) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error calculating kgs:', error);
    return res.status(500).json({
      success: false,
      message: 'Error calculating kgs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
