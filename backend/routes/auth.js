// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import our User model
const nodemailer = require('nodemailer');

// Signup (Register) Route
router.post('/signup', async (req, res) => {
  try {
    // Get username, email, and password from the request body
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Username, email, and password are required." });
    }

    // Check if the user already exists (by email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user using our User model with username, email, and hashed password
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    // Expect a field "username" (which may contain either email or username) along with password
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and password are required." });
    }

    // Find the user by email or username
    const user = await User.findOne({ $or: [{ email: username }, { username: username }] });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    // Create a JWT (JSON Web Token) that expires in 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, userType: "user" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    // Create a reset token valid for 15 minutes
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Configure the email transporter using Mailgun SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,    // e.g., smtp.mailgun.org
      port: process.env.SMTP_PORT,      // e.g., 587
      secure: false,                    // false for port 587
      auth: {
        user: process.env.EMAIL_USER,   // Your Mailgun SMTP username
        pass: process.env.EMAIL_PASS    // Your Mailgun SMTP password
      }
    });

    // Set up email details
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Please use the following token to reset your password: ${resetToken}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error);
        return res.status(500).json({ success: false, message: "Error sending email." });
      }
      res.json({ success: true, message: "Password reset email sent." });
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error during forgot password." });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    let { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required." });
    }

    // Trim extra whitespace/newlines from token and newPassword
    token = token.trim();
    newPassword = newPassword.trim();

    // Verify the token using your JWT secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password without revalidating the entire document
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ success: true, message: "Password has been reset." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error during password reset." });
  }
});

module.exports = router;
