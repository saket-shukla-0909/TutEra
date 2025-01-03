const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');




dotenv.config();
app.use(bodyParser.json());
app.use(express.json())
app.use(cors());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


app.use(express.static('./public'));

app.use("/tutors", require("./routes/tutorroutes"));
app.use("/students", require("./routes/studentRoutes"));
app.use("/chats", require("./routes/chatUserRoutes"));
app.listen(process.env.PORT, (error)=>{
    if(error){
        console.log(error);
    }else{
        console.log(`Server has started on PORT ${process.env.PORT}`);
    }
})