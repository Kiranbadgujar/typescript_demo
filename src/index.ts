import express, { Application } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(express.static(path.join(__dirname, 'image')));
  }

  private routes() {
    this.app.use('/', authRoutes);
  }

  public start() {
    const PORT = process.env.PORT || 5000;
    this.app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}

const server = new App();
server.start();