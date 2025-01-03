const mongoose = require("mongoose");


const messageSchema = new mongoose.model({
    sender:{
        typeof: mongoose.Schema.Types.ObjectId,
        ref: "Tutor" || "Student"
    },
    content:{
        typeof: String,
        trim: true,
    },
    chat:{
        typeof:mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }
})

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;