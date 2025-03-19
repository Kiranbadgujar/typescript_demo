const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../config/db");

const validation = (req,res) => {
  const error = validationResult(req,res);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
};

// register
const registerUser = async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    contact_number,
    address,
  } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({
      status: "error",
      message: "Password and confirm password must be the same",
      code: 400,
    });
  }

  try {
    // Check if the email already exists
    const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
    const [existingUser] = await db.promise().query(emailCheckQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      contact_number,
      address,
    };

    // Insert new user into the database
    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password, contact_number, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await db
      .promise()
      .query(insertQuery, [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.contact_number,
        userData.address,
      ]);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error registering user" });
  }
};

// login
const loginUser = async (req, res) => {
  const validationError = validation(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const { email, password } = req.body;

    const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
    db.query(emailCheckQuery, [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error checking email" });
      }

      if (result.length === 0) {
        console.log(result);
        return res.status(400).json({ message: "Invalid email" });
      }

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const payload = {
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = { loginUser, registerUser };
