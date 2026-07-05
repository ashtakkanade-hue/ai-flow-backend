const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Home Route
app.get("/", (req, res) => {
  res.send("AI Flow Backend is running 🚀");
});

// AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    res.json({
      reply: response.output_text,
    });

  } catch (err) {
    console.error("Chat Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// Stripe Checkout Route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Premium Access",
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
    });

    res.json({
      url: session.url,
    });

  } catch (err) {
    console.error("Stripe Error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// Contact Route
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  console.log("========== CONTACT ==========");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);
  console.log("=============================");

  res.json({
    success: true,
    message: "Message received successfully!",
  });
});

// Start Server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
