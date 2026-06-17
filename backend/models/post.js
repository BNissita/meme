const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    content:{
        type:String,
        required:true
    },

    category:{
        type:String,
        default:"General"
    },
    company:{
    type:String,
    default:"General"
},

    author:{
    type:String,
    default:"Anonymous"
},
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },

            text:String,

            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ],

    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
},
{
    timestamps:true
});

module.exports = mongoose.model("Post",postSchema);