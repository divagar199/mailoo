require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const mailRoutes = require("./routes/mailRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB connection error: ", err));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
    res.send("MAILOO Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
