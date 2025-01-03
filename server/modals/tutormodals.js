const mongoose = require("mongoose");

// Define Schema

const TutorSchema = new mongoose.Schema({
  
tutorfirstname: String,
tutormiddlename: String,
tutorlastname: String,
tutoremail: String,
tutorpassword: String,
tutornumber: String,
tutorimage: String,
tutorlocation: String,
tutorqualifications: String,
tutorshift: String,
tutorexperience: String,
tutorsubject: String,
tutoravailability: String,
tutorphilosphy: String,
tutorbiography: String,
termsAccepted: String,
tutorcode: String,
token: String
});
// Create Model

const Tutor = mongoose.model('Tutor', TutorSchema);

// Export Model
module.exports = Tutor;
