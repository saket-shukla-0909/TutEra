const express = require("express");
const chatUsersController = require("../controllers/chatUserControllers");
const router = express.Router();

router.get("/allChatUsers", chatUsersController.allChatUser);

module.exports = router;