const express = require("express");
const multer = require("multer");
const path = require("path");
const tutorscontroller = require("../controllers/tutorControllers");
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/imagesTutor')
    },
    filename: (req, file, cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})

router.post("/register", upload.single('file'), tutorscontroller.registerTutor);
router.post("/sendTutorOTP", tutorscontroller.sendTutorOTP)
router.post("/login", tutorscontroller.loginTutor);
router.post("/logout", tutorscontroller.logoutTutor);
router.put("/password", tutorscontroller.passwordTutor);
router.get("/singleTutor", tutorscontroller.singleTutor);

module.exports = router;