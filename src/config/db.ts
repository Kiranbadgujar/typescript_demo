import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private connection: mysql.Connection;

  constructor() {
    this.connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    this.connect();
  }

  private connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
      }
      console.log('Connected to the database.');
    });
  }

  public getConnection() {
    return this.connection;
  }
}

const db = new Database();
export default db.getConnection();