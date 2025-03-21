const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { loginValidator,  registrationValidator} = require("../helpers/validation");
const router = express.Router();

router.post("/register", registrationValidator, registerUser);
router.post("/login", loginValidator, loginUser);

module.exports = router;