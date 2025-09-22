import Job from "../models/job.mjs";
import { validationResult } from "express-validator";

// POST /api/jobs → Create job
export const createJob = async (req, res) => {
    try {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const job = new Job(req.body);
        const saved = await job.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/jobs → Fetch jobs with query params
// src/controllers/jobController.mjs
function escapeRegex(str = "") {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getJobs(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(100, parseInt(req.query.limit || "20", 10));

        const q = (req.query.q || "").toString().trim();
        const location = (req.query.location || "").toString().trim();
        const rawJobType = (req.query.jobType || "").toString().trim();

        const salaryMin = req.query.salaryMin ? Number(req.query.salaryMin) : undefined;
        const salaryMax = req.query.salaryMax ? Number(req.query.salaryMax) : undefined;

        const query = { isActive: true };

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { company: { $regex: q, $options: "i" } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (rawJobType) {
            console.log("Filtering by jobType (raw):", JSON.stringify(rawJobType));
            const safe = escapeRegex(rawJobType);
            query.jobType = { $regex: `^${safe}$`, $options: "i" };
        }

        if (!Number.isNaN(salaryMin) && !Number.isNaN(salaryMax) && salaryMin !== undefined && salaryMax !== undefined) {
            // range overlap: job.salaryMin <= requestedMax && job.salaryMax >= requestedMin
            query.$and = query.$and || [];
            query.$and.push({ salaryMin: { $lte: salaryMax } });
            query.$and.push({ salaryMax: { $gte: salaryMin } });
        } else if (!Number.isNaN(salaryMin) && salaryMin !== undefined) {
            query.salaryMax = { $gte: salaryMin };
        } else if (!Number.isNaN(salaryMax) && salaryMax !== undefined) {
            query.salaryMin = { $lte: salaryMax };
        }

        console.log("Mongo query:", JSON.stringify(query, null, 2)); // debug, remove in prod

        const [data, total] = await Promise.all([
            Job.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Job.countDocuments(query)
        ]);

        res.json({ data, meta: { page, limit, total } });
    } catch (err) {
        next(err);
    }
}
