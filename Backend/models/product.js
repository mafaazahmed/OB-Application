const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema ({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    profit :  {
        type : Number,
        required : true,
        default : 0
    },
})

module.exports = mongoose.model("products", productSchema);