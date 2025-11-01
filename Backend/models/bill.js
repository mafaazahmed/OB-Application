const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema({
    order_id: {
        type: String,
        required: true,
        unique: true,
    },
    products: [{
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
        ,
        profit: {
            type: Number,
            required: false,
            default: 0
        },
        size: { // Added size field to product sub-schema
            type: String,
            required: true, // Not strictly required if some products don't have size
            default: "1kg"
        }
    }],
    deliveryCharge: {
        type: Number,
        required: true
    },
    processingFee: {
        type: Number,
        required: false,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true,
        default: 0
    },
    profitByCategory: [{
        category: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        }
    }],
    kgsSold: [{
        category: {
            type: String,
            required: true,
            enum: ['Chicken', 'Beef', 'Mutton', 'Chicken Boneless', 'Live Chicken', 'Nati Chicken', 'Special Chicken', 'Beef Boneless', 'Mutton Boneless'] // Updated enum
        },
        kg: { // Changed from 'amount' to 'kg'
            type: Number,
            required: true,
            default: 0
        }
    }],
    Date: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        // required: true
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Cash', 'Online'],
        required: true,
        default: 'Pending',
    },
    receivedamount: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model("bills", billSchema);