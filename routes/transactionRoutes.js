const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Deposit money
router.post('/deposit', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const user = await User.findById(req.user.userId);
  user.balance += amount;
  await user.save();

  const transaction = new Transaction({ userId: user._id, type: 'deposit', amount });
  await transaction.save();

  res.json({ message: 'Deposit successful', balance: user.balance });
});

// Withdraw money
router.post('/withdraw', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user.userId);

  if (amount <= 0 || amount > user.balance) return res.status(400).json({ error: 'Invalid withdrawal amount' });

  user.balance -= amount;
  await user.save();

  const transaction = new Transaction({ userId: user._id, type: 'withdraw', amount });
  await transaction.save();

  res.json({ message: 'Withdrawal successful', balance: user.balance });
});

// Transfer money
router.post('/transfer', authMiddleware, async (req, res) => {
  const { recipientEmail, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const sender = await User.findById(req.user.userId);
  const recipient = await User.findOne({ email: recipientEmail });

  if (!recipient || sender.balance < amount) return res.status(400).json({ error: 'Invalid transaction' });

  sender.balance -= amount;
  recipient.balance += amount;

  await sender.save();
  await recipient.save();

  const transaction = new Transaction({ userId: sender._id, type: 'transfer', amount, recipient: recipient._id });
  await transaction.save();

  res.json({ message: 'Transfer successful', balance: sender.balance });
});

// Fetch user transactions
router.get('/history', authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.userId }).sort({ timestamp: -1 });
  res.json(transactions);
});

module.exports = router;
router.post('/deposit', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user.userId);
  user.balance += amount;
  await user.save();

  const transaction = new Transaction({ userId: user._id, type: 'deposit', amount });
  await transaction.save();

  // Emit notification
  req.app.get('io').emit(`notification-${user._id}`, { message: `Deposited $${amount}` });

  res.json({ message: 'Deposit successful', balance: user.balance });
});
const sendEmail = req.app.get('sendEmail');

router.post('/deposit', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user.userId);

  user.balance += amount;
  await user.save();

  const transaction = new Transaction({ userId: user._id, type: 'deposit', amount });
  await transaction.save();

  // Send email notification
  sendEmail(user.email, 'Deposit Confirmation', `You have deposited $${amount}`);

  res.json({ message: 'Deposit successful', balance: user.balance });
});
