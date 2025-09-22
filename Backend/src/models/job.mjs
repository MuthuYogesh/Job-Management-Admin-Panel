import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    jobType: String,
    salaryMin: Number,
    salaryMax: Number,
    description: String,
    deadline: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
