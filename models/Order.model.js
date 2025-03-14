const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        flatNo:{
             type:Number,
             required:true
        },
        Area:{
            type:String,
            required:false            
        },
        landmark:{

        },
        city:{

        },
        state:{

        },
        country:{

        },
        phoneNo:{

        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
})