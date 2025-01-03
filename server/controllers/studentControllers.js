const Student = require("../modals/studentModals")
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { response } = require("express");

exports.registerStudent = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);
        const salt = await bcrypt.genSalt(8);
        const studentpassword = req.body.studentpassword; // Fix to match the frontend field name
        const securePassword = await bcrypt.hash(studentpassword, salt);

        const token = jwt.sign(
            { studentemail: req.body.studentemail }, // Fix to match the frontend field name
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        function generateSixDigitCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        const studentcode = generateSixDigitCode();

        const studentData = {
            studentfirstname: req.body.studentfirstname, // Fix to match frontend field names
            studentmiddlename: req.body.studentmiddlename,
            studentlastname: req.body.studentlastname,
            studentfathername: req.body.studentfathername,
            studentemail: req.body.studentemail,
            studentpassword: securePassword,
            studentnumber: req.body.studentnumber,
            studentlocation: req.body.studentlocation,
            studentdob: req.body.studentdob,
            studentgender: req.body.studentgender,
            studentbiography: req.body.studentbiography,
            studentimage: req.file ? req.file.filename : null,
            studenttermsaccepted: req.body.studenttermsaccepted,
            studentcode: studentcode,
            token: token,
        };

        // Check if email exists
        const studentExist = await Student.findOne({ studentemail: req.body.studentemail }); 
        if (studentExist) {
            res.status(404).send("Email already exists! Please try another one.");
        }
        if(!studentExist){
            const student = await Student.create(studentData);
            res.status(200).send(`Tutor has registered successfully ${student.token}`)
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error. Please try again later.");
    }
};


exports.verifyOTP = async(req, res)=>{
    try{
        const student = await Student.findOne({studentcode:req.body.studentcode});
        if(!student){
            res.status(404).send('Wrong OTP')
        }else{
            res.status(200).send('Otp is verified')
        }
    }catch(error){
        console.log(error);
        res.status(500).send('Internal server error');
    }
}

exports.loginStudent = async(req, res)=>{
    try{
        const {studentemail, studentpassword} = req.body;
        console.log(studentemail, studentpassword)
        const student = await Student.findOne({studentemail: studentemail});
        const matchPassword = await bcrypt.compare(studentpassword, student.studentpassword)

        const token = jwt.sign(
            {studentemail: req.body.studentemail},
            process.env.SECRET_KEY,
            {expiresIn: '24h'}
        )
        if(!student){
            res.status(404).send('Invalid Student');
        }
        // if(student){
            if(!matchPassword){
                res.status(404).send('Password did not match');
            }else{
                student.token = token;
                student.save();
                console.log(student)
                res.status(200).send(student);
            }
        // }
    }catch(error){
        console.log(error);
        res.status(500).send('Internal server error')
    }
}

exports.singleStudent = async(req, res)=>{
    try{
        const token = req.headers['authorization']?.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ message: "Token is required." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY); 
        const studentemail = decoded.studentemail;

        const student = await Student.findOne({studentemail:studentemail});
        if(!student){
            res.status(404).send('Student not found');
        }
        if(student){
            res.status(200).send({success:true, message:student});
            console.log(student)
        }
    }catch(error){
        console.log(error)
        res.status(500).send('Internal server error');
    }
}



exports.studentUpdate = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log(`token student update ${token}`)
        if (!token) {
            return res.status(401).json({ message: "Token is required." });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const studentemail = decoded.studentemail;
        
        const student = await Student.findOne({ studentemail: studentemail });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if(student){
            const studentUpdate = await Student.findByIdAndUpdate({_id:student._id})
            console.log("studentID", studentUpdate)
            student.studentfirstname = req.body.studentfirstname ;
            student.studentmiddlename = req.body.studentmiddlename;
            student.studentlastname = req.body.studentlastname ;
            student.studentfathername = req.body.studentfathername;
            student.studentlocation = req.body.studentlocation;
            student.studentdob = req.body.studentdob;
            student.studentgender = req.body.studentgender;
            student.studentbiography = req.body.studentbiography;
            student.save();
            res.status(200).json({ success: true, message: 'Student information updated successfully.', student: student});
            console.log(student)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.StudentUpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check if required fields are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old password and new password are required.' });
    }

    // Get the token from headers
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token is required." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    // Get student email from decoded token
    const studentemail = decoded.studentemail;
    const student = await Student.findOne({ studentemail });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Compare old password with hashed password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, student.studentpassword);
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Incorrect old password.' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const hashNewPassword = await bcrypt.hash(newPassword, salt);
    student.studentpassword = hashNewPassword;
    await student.save();

    res.status(200).json({ success: true, message: "Password updated successfully." });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
