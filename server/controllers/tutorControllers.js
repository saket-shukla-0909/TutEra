const Tutor = require("../modals/tutormodals");
const TutorOTP = require("../modals/TutorOtpModal")
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();



// OTP Generation and Sending
exports.sendTutorOTP = async (req, res) => {
    try {
        const { tutornumber } = req.body;
        console.log(tutornumber);
        if (!tutornumber) {
            return res.status(400).send('Number is required');
        }

        // Generate 6-digit OTP
        function generateSixDigitCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }

        const otp = generateSixDigitCode();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        const tutorOTPData = {
            tutorOTP: otp,
            tutornumber,
            otpExpiresAt,
        };

        const tutor = new TutorOTP(tutorOTPData);
        await tutor.save();
        console.log(tutor)
        res.status(200).send({ success: true, message: 'OTP sent successfully.', otp }); // For testing, remove `otp` in production
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};

// Tutor Registration with OTP Verification
exports.registerTutor = async (req, res) => {
    try {
        const { tutorcode, tutoremail, tutorpassword, tutornumber } = req.body;

        // Fetch the OTP data for the provided email or phone
        const otpData = await TutorOTP.findOne({ tutornumber }).sort({ createdAt: -1 });

        if (!otpData || otpData.tutorOTP !== tutorcode) {
            return res.status(400).send({ success: false, message: "Invalid OTP. Please try again." });
        }

        // Check if OTP is expired
        if (otpData.otpExpiresAt < new Date()) {
            return res.status(400).send({ success: false, message: "OTP has expired. Please request a new one." });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(tutorpassword, salt);

        // Generate token
        const token = jwt.sign(
            { tutoremail },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        const tutorData = {
            tutorimage: req.file ? req.file.filename : null,
            tutorfirstname: req.body.tutorfirstname,
            tutormiddlename: req.body.tutormiddlename,
            tutorlastname: req.body.tutorlastname,
            tutoremail,
            tutorpassword: securePassword,
            tutornumber: req.body.tutornumber,
            tutorlocation: req.body.tutorlocation,
            tutorqualifications: req.body.tutorqualifications,
            tutorshift: req.body.tutorshift,
            tutorexperience: req.body.tutorexperience,
            tutorsubject: req.body.tutorsubject,
            tutoravailability: req.body.tutoravailability,
            tutorphilosphy: req.body.tutorphilosphy,
            tutorbiography: req.body.tutorbiography,
            termsAccepted: req.body.termsAccepted,
            token,
        };

        // Check if the tutor already exists
        const tutorExist = await Tutor.findOne({ tutoremail });
        if (tutorExist) {
            return res.status(400).send("Email already exists!");
        }

        // Create the new tutor
        await Tutor.create(tutorData);

        res.status(200).send({ success: true, message: "Tutor has successfully registered." });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};



exports.loginTutor = async(req, res)=>{
    try{

         console.log("Controllers",req.body.tutoremail)
        const token = jwt.sign(
            {tutoremail: req.body.tutoremail},
            process.env.SECRET_KEY,
            {expiresIn: '24h'}
        )

        const tutor = await Tutor.findOne({tutoremail: req.body.tutoremail});
        if(!tutor){
            res.status(404).send(`Tutor not found`);
        }
        const password = req.body.tutorpassword;
        const matchPassword = await bcrypt.compare(password, tutor.tutorpassword)
        // If Tutor not exist
        if(tutor){
            // If Password did not match
            if(!matchPassword){
                res.status(404).send('Incorrect password!')
            }else{
                tutor.token = token;
                tutor.save();
                res.status(200).send(tutor)
            }
        }
    }catch(error){
        console.log(error);
    }
}


exports.logoutTutor = async(req, res)=>{
    try{
        const tutor = await Tutor.findOne({tutoremail:req.body.tutoremail});
        if(!tutor){
            res.status(404).send(`Token has expired`);
        }else{
            tutor.token='';
            tutor.save();
            res.status(200).send('Tutor has logged out successfully');
        }
    }catch(error){
        console.log(error);
    }
}

exports.passwordTutor = async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1]; 
      if (!token) {
        return res.status(401).json({ message: "Token is required." });
      }
  
      // Decode token and extract tutor email
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const tutoremail = decoded.tutoremail;
  
      // Find tutor by email
      const tutor = await Tutor.findOne({ tutoremail });
      if (!tutor) {
        return res.status(404).json({ message: 'Tutor not found' });
      }
  
      // Check if old password matches
      const oldPassword = req.body.oldPassword
      const isMatch = await bcrypt.compare(oldPassword, tutor.tutorpassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      // Check if new passwords match
      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'New password and confirmation do not match' });
      }
  
      // Hash new password and update
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.newPassword, salt);
  
      tutor.tutorpassword = securePassword;
      await tutor.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.singleTutor = async(req, res)=>{
    try{
        const token = req.headers['authorization']?.split(' ')[1]; 
        console.log('token in controllers');

        // If token is not available 
        if (!token) {
            return res.status(401).json({ message: "Token is required." });
        }

        // Decode email through by using token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use your secret key
        const tutoremail = decoded.tutoremail;
        console.log(tutoremail)
        const tutor = await Tutor.findOne({tutoremail: tutoremail});
        if(!tutor){
            res.status(404).send('Tutor not found');
        }
        
        if(tutor){
            res.status(200).send({success:true, message:tutor});
        }
    }catch(error){
        console.log(error);
        res.status(500).send('Internal server error');
    }
}

// exports.updateTutor = async(req, res)=>{
//     try{
//         const token = req.headers['authorization']?.split(' ')[1]; 
//         console.log('token in controllers')

//         // If token is not available 
//         if (!token) {
//             return res.status(401).json({ message: "Token is required." });
//         }

//         // Decode email through by using token
//         const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use your secret key
//         const tutoremail = decoded.tutoremail;
  
//         const tutor = await Tutor.findOne({tutoremail: tutoremail});
//         if(!tutor){
//             res.status(404).send('Tutor not found');
//         }
//         if(tutor){
            
//         }
//     }catch(error){
//         console.log(error);
//         res.status(500).send('Internal server error');
//     }
// }