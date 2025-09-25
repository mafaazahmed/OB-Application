const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema ({
    bill_id : {
        type : String,
        required : true,
        unique : true,
    },
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
    }],
    deliveryCharge : {
        type : Number,
        required : true
    },
    total : {
        type : Number,
        required : true
    },
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