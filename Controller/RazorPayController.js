import Razorpay from "razorpay";

// Initialize Razorpay with Test Mode keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID, // e.g., rzp_test_XXXX
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});

// Controller function to create a Razorpay order
// export const createOrder = async (req, res) => {
//   const { amount } = req.body; // Amount in INR
//   // amount = Number(amount);
//   console.log("amount", amount);

//   // Validate input
//   const parsedAmount = parseFloat(amount); // Use parseFloat to handle decimals
//   if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
//     return res.status(400).json({ error: "Invalid amount provided" });
//   }
//   const options = {
//     amount: parsedAmount * 100, // Convert to paise
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.json({
//       order_id: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ error: "Failed to create order" });
//   }
// };

export const createOrder = async (req, res) => {
  const { amount } = req.body; // Amount in INR
  console.log("Received amount:", amount);

  // Convert amount to a number and validate
  const parsedAmount = parseFloat(amount);
  console.log("Parsed amount (INR):", parsedAmount);

  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount provided" });
  }

  // Convert to paise and ensure it’s an integer
  const amountInPaise = Math.round(parsedAmount * 100);
  console.log("Amount in paise:", amountInPaise);

  // Additional check to ensure it’s an integer
  if (!Number.isInteger(amountInPaise)) {
    return res
      .status(400)
      .json({ error: "Amount in paise must be an integer" });
  }

  const options = {
    amount: amountInPaise, // Guaranteed integer in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
// Export as CommonJS module
