const mongoose = require("mongoose");


const studentSchema = new mongoose.Schema({
    studentfirstname: String,
    studentmiddlename: String,
    studentlastname: String,
    studentfathername: String,
    studentemail: String,
    studentpassword: String,
    studentnumber: String,
    studentlocation: String,
    studentdob: String,
    studentgender: String,
    studentbiography: String,
    studentimage: String,
    studenttermsaccepted: String,
    studentcode: String,
    token: String,

});
// Create Model

const Student = mongoose.model('Student', studentSchema);

// Export Model
module.exports = Student;
