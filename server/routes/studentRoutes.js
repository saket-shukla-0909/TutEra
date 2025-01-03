const express = require("express");
const multer = require("multer");
const path = require("path");
const studentsController = require("../controllers/studentControllers")

const router = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagesStudent');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route for registering a student with image upload
router.post("/register", upload.single('studentimage'), studentsController.registerStudent);
router.post("/verifyOTP", studentsController.verifyOTP);
router.post("/login", studentsController.loginStudent);
router.get("/singleStudent", studentsController.singleStudent);
router.put("/updateStudent", studentsController.studentUpdate);
router.put("/newPassword", studentsController.StudentUpdatePassword);

module.exports = router;
