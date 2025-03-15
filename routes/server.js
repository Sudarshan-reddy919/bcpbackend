const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bank API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch(err => console.error(err));
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/transactions', transactionRoutes);
const helmet = require('helmet');
app.use(helmet());
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

app.set('io', io);

const PORT1= process.env.PORT || 5000;
server.listen(PORT1, () => console.log(`Server running on port ${PORT}`));
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

app.set('sendEmail', sendEmail);
