// controllers/otpController.js
import axios from "axios";

// Environment variables for your SMS gateway
const SMS_GATEWAY_API_KEY = process.env.SMS_GATEWAY_API_KEY;
const SMS_SENDER_ID = process.env.SMS_SENDER_ID;
const DLT_TEMPLATE_ID = process.env.DLT_TEMPLATE_ID;
const ENTITY_ID = process.env.ENTITY_ID;

// In-memory store for OTPs
const OTP_STORE = new Map();

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via SMS
const sendOTPtoSMS = async (mobileNo, otp) => {
  try {
    const messageText = `Your OTP for Brahmin Milan platform is ${otp}. Do not share with anyone. - Appwin Info Tech`;

    // Clean the mobile number and add country code if necessary
    let cleanNumber = mobileNo.replace(/[^0-9]/g, "");
    if (!cleanNumber.startsWith("91")) {
      cleanNumber = "91" + cleanNumber;
    }
    console.log("Original number:", mobileNo);
    console.log("Cleaned number:", cleanNumber);

    const url = `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=${SMS_GATEWAY_API_KEY}&senderid=${SMS_SENDER_ID}&channel=2&DCS=0&flashsms=0&number=${cleanNumber}&text=${messageText}&route=1&EntityId=${ENTITY_ID}&dlttemplateid=${DLT_TEMPLATE_ID}`;

    console.log(url);
    const response = await axios.get(url);
    console.log("API Response:", response.data);

    if (response.data && response.data.ErrorCode === "000") {
      return { success: true, message: "OTP sent successfully" };
    } else {
      return {
        success: false,
        message: `SMS Gateway Error: ${
          response.data?.ErrorMessage || "Unknown error"
        }`,
        errorCode: response.data?.ErrorCode,
      };
    }
  } catch (error) {
    console.error("Error details:", error);
    return { success: false, message: `Failed to send OTP: ${error.message}` };
  }
};

// Controller to send OTP
export const sendOTP = async (req, res) => {
  try {
    const { mobileNo } = req.body;
    if (!mobileNo) {
      return res.status(400).json({ message: "Mobile number is required!" });
    }

    // Generate OTP and set expiry for 2 minutes (120,000 ms)
    const otp = generateOTP();
    const otpExpires = Date.now() + 120000;

    // Delete any previous OTP for this number
    OTP_STORE.delete(mobileNo);
    OTP_STORE.set(mobileNo, { otp, otpExpires });

    const smsResponse = await sendOTPtoSMS(mobileNo, otp);
    if (!smsResponse.success) {
      return res
        .status(500)
        .json({ success: false, message: smsResponse.message });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOTP error:", error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Controller to verify OTP
export const verifyOTP = (req, res) => {
  try {
    const { mobileNo, otp } = req.body;
    if (!mobileNo || !otp) {
      return res
        .status(400)
        .json({ message: "Mobile number and OTP are required!" });
    }

    const record = OTP_STORE.get(mobileNo);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    if (Date.now() > record.otpExpires) {
      OTP_STORE.delete(mobileNo);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (record.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Once verified, remove OTP from the store
    OTP_STORE.delete(mobileNo);
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("verifyOTP error:", error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
