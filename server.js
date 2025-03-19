const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

dotenv.config();

const app = express();
app.use(express.json())
app.use(express.static(path.join(__dirname, '/src/public')));
app.use(express.static(path.join(__dirname, '/src/image')));

app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});