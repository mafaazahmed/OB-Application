const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema ({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true,
        default : 0,
    },
    category : {
        type : String,
        required : true,
        enum: ['Vegetable', 'Other Vegetable', 'Chicken', 'Beef', 'Mutton', 'Other', 'Chicken Boneless', 'Live Chicken', 'Nati Chicken', 'Special Chicken', 'Beef Boneless', 'Mutton Boneless']
    },
    profit :  {
        type : Number,
        required : true,
        default : 0
    },
    actual_price : {
        type : Number,
        required : true,
        default : 0
    },
    size : {
        type : String,
        required : true,
        default : "1kg"
    }
})

module.exports = mongoose.model("products", productSchema);