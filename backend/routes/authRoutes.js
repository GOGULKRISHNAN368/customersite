const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Customer = require('../models/Customer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server reachability verified');
  }
});

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Check if user already exists
    let customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // 4. Create new customer
    customer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    });

    await customer.save();

    // 5. Send OTP via email
    try {
      if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your_gmail')) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Registration - Your Verification OTP',
          text: `Your Registration OTP is: ${otp}\nValid for 5 minutes.`
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent successfully to ${email}`);
      } else {
        console.warn(`⚠️ EMAIL_USER not configured. For development, use mock OTP: ${otp}`);
      }
    } catch (emailErr) {
      console.error('📧 Nodemailer Error:', emailErr.message);
      // Don't crash registration if email fails in dev mode, just log the OTP
      console.warn(`🚀 Registration saved. Dev Mock OTP: ${otp}`);
    }

    res.status(201).json({ 
      message: 'Registration successful. OTP sent to email.', 
      email,
      otp // Display to user in dev mode
    });
  } catch (err) {
    console.error('💥 Registration API Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 3. Generate new OTP for login verification
    const otp = generateOTP();
    customer.otp = otp;
    customer.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await customer.save();

    // 4. Send OTP via email
    try {
       if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your_gmail')) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Login - Your Verification OTP',
          text: `Your Login OTP is: ${otp}\nValid for 5 minutes.`
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Login OTP sent successfully to ${email}`);
      } else {
        console.warn(`⚠️ EMAIL_USER not configured. For development, use mock OTP: ${otp}`);
      }
    } catch (emailErr) {
       console.error('📧 Login Nodemailer Error:', emailErr.message);
       console.warn(`🚀 Saved Login OTP for dev check: ${otp}`);
    }

    res.json({ 
      message: 'OTP sent to email for verification', 
      email,
      otp // Display to user in dev mode
    });
  } catch (err) {
    console.error('💥 Login API Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Check OTP and Expiry
    if (customer.otp !== otp || customer.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    // Mark as verified
    customer.isVerified = true;
    customer.otp = undefined; // Clear OTP after verification
    customer.otpExpiry = undefined;
    await customer.save();

    // Generate JWT (optional but good practice)
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({
      message: 'OTP verified successfully',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/send-otp (Resend functionality)
router.post('/send-otp', async (req, res) => {
   try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    const otp = generateOTP();
    customer.otp = otp;
    customer.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await customer.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification OTP - Resend',
      text: `Your Verification OTP is: ${otp}\nValid for 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP resent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/customers
router.get('/all', async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
