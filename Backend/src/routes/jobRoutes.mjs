import express from "express";
import { body } from "express-validator";
import { createJob, getJobs } from "../controllers/jobController.mjs";

const router = express.Router();

// Validation rules for POST
const jobValidationRules = [
    body("title")
        .isString().withMessage("Title must be a string")
        .isLength({ min: 2 }).withMessage("Title must be at least 2 characters long"),
    body("company")
        .isString().withMessage("Company must be a string")
        .notEmpty().withMessage("Company is required"),
    body("location").optional().isString().withMessage("Location must be a string"),
    body("jobType")
        .optional()
        .isIn(["Full-time", "Part-time", "Contract", "Internship", "Freelance"])
        .withMessage("Invalid job type"),
    body("salaryMin").optional().isNumeric().withMessage("Salary min must be a number"),
    body("salaryMax").optional().isNumeric().withMessage("Salary max must be a number"),
    body("deadline").optional().isISO8601().withMessage("Deadline must be a valid date")
];

// Routes
router.post("/", jobValidationRules, createJob);
router.get("/", getJobs);

export default router;
