import { body } from 'express-validator';

export const registrationValidator = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 8 characters long"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];