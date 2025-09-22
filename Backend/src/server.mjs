import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import jobRoutes from "./routes/jobRoutes.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://muthuyogeshmy:x0PQ7LAOMEzUqwD0@cluster0.ebbhaiu.mongodb.net/JobAdminPanel";//process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", jobRoutes);

// Connect Mongo + Start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
