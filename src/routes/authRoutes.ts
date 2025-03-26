import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { loginValidator, registrationValidator } from '../helpers/validation';

class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.post("/register", registrationValidator, registerUser);
    this.router.post("/login", loginValidator, loginUser);
  }
}

const authRoutes = new AuthRoutes();
export default authRoutes.router;