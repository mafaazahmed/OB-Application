const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema ({
    order_id : {
        type : String,
        required : true,
        unique : true,
    },
    products : [{
        _id : {
        type : String,
        required : true
        },
        name : {
        type : String,
        required : true
        },
        quantity : {
        type : Number,
        required : true
        },
        price : {
        type : Number,
        required : true 
        }
                ,
                profit: {
                    type: Number,
                    required: false,
                    default: 0
                }
    }],
    deliveryCharge : {
        type : Number,
        required : true
    },
    total : {
        type : Number,
        required : true
    },
    profit : {
        type : Number,
        required : true,
        default : 0
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
    Date : {
        type : String,
        required : true
    },
    status : {
        type : String,
        enum : ['Pending', 'Cash', 'Online'],
        required : true,
        default : 'Pending',
    }
})

module.exports = mongoose.model("bills", billSchema);