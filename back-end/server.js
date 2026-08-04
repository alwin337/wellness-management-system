const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRouter");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("MindCare API is running");
});


// Authentication routes
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});