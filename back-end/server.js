const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRouter");
const userRoutes = require('./routes/userRouter')
const counsellorRoutes = require('./routes/counsellorRouter')
const scheduleRoutes = require('./routes/scheduleRouter')
const appointmentRoutes = require('./routes/appointmentRoutes')
const statisticsRoutes = require('./routes/statisticsRoutes')
const resourceRoutes = require('./routes/resourceRoutes')
const sessionRoutes = require('./routes/sessionRouter')

dotenv.config();

connectDB();

const app = express();

//allows frontend to communicate w backend
app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("MindCare API is running");
});


// Authentication routes
app.use("/api/auth", authRoutes);

//User management route
app.use("/api/users", userRoutes)

//counsellor management
app.use("/api/counsellors",counsellorRoutes)

//schedule management
app.use(
  "/api/schedules",
  scheduleRoutes
)
//appointment management
app.use(
  "/api/appointments",
  appointmentRoutes
)

//admin statistics
app.use(
  "/api/statistics",statisticsRoutes
)

app.use(
  "/api/resources",resourceRoutes
)

app.use(
  "/api/sessions",sessionRoutes
)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});