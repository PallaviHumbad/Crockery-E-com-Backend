import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const otpStore = new Map(); // Temporary store for OTPs (use Redis/DB for production)

// Send OTP Controller
export const otpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

    // Save OTP and expiration in the temporary store
    otpStore.set(email.toLowerCase(), { otp: otp.toString(), expiresAt });

    // Create Nodemailer transporter using env variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Mahendra Namkin" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Mahendra Namkin OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Your OTP Code is:</h2>
          <h1 style="font-size: 36px; font-weight: bold; color: #4CAF50;">${otp}</h1>
          <p>Please use the following OTP to complete your process. This code is valid for 2 minutes.</p>
        </div>
      `,
    };

    console.log("Sending OTP to:", email);

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully!", otp }); // ⚠️ Remove otp from response in production
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP!", error: error.message });
  }
};

// Verify OTP Controller
export const verifyOtp = (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedOtpData = otpStore.get(normalizedEmail);

    if (!storedOtpData) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    const { otp: storedOtp, expiresAt } = storedOtpData;

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP verified
    otpStore.delete(normalizedEmail);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Error verifying OTP!", error: error.message });
  }
};
