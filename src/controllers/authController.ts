import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import db from '../config/db';

class AuthController {
  private validation(req: Request, res: Response): null | Response {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return null;
  }

  // Register User
  public async registerUser(req: Request, res: Response): Promise<void> {
    const validationError = this.validation(req, res);
    if (validationError) {
      return; // Express will handle the response.
    }

    const { first_name, last_name, email, password, confirm_password, contact_number, address } = req.body;

    if (password !== confirm_password) {
      res.status(400).json({
        status: "error",
        message: "Password and confirm password must be the same",
        code: 400,
      });
      return; // Ensure to return to prevent further execution
    }

    try {
      // Check if the email already exists
      const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
      const [existingUser] = await db.promise().query<any[]>(emailCheckQuery, [email]);

      if (existingUser.length > 0) {
        res.status(400).json({ message: "Email already exists" });
        return; // Ensure to return to prevent further execution
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
      await db.promise().query(insertQuery, [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.contact_number,
        userData.address,
      ]);

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error registering user" });
    }
  }

  // Login User
  public async loginUser(req: Request, res: Response): Promise<void> {
    const validationError = this.validation(req, res);
    if (validationError) {
      return; // Express will handle the response.
    }

    try {
      const { email, password } = req.body;

      const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
      const [result] = await db.promise().query<any[]>(emailCheckQuery, [email]);

      if (result.length === 0) {
        res.status(400).json({ message: "Invalid email" });
        return; // Ensure to return to prevent further execution
      }

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid password" });
        return; // Ensure to return to prevent further execution
      }

      const payload = {
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: "1h",
      });

      res.status(200).json({
        message: "Login successful",
        token,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error logging in" });
    }
  }
}

const authController = new AuthController();
export const { loginUser, registerUser } = authController;
