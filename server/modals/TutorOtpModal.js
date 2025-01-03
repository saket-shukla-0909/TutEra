const mongoose = require('mongoose');

const tutorOTPSchema = new mongoose.Schema({
    tutorOTP: { type: String, required: true },
    tutornumber: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
}, { timestamps: true });

const TutorOTP = mongoose.model('TutorOTP', tutorOTPSchema);
module.exports = TutorOTP;
