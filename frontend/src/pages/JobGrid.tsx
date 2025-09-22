// src/pages/JobGrid.tsx
import React from "react";
import JobCard from "../components/JobCard";
import { useJobsContext } from "../context/JobContext";

export default function JobsGrid() {
  const { jobs } = useJobsContext();
  console.log("Rendering JobGrid with jobs:", jobs);

  return (
    <div className="w-full px-16 pt-12 mx-auto">
      {/* Grid:
          - 4 columns on large screens
          - 2 columns on md
          - 1 column on small
          - gap 4 (adjust as you like)
          - auto rows that size to content (auto-rows-min)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job._id ?? job.id} job={job} />)
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-10 text-gray-500">
            No jobs found
          </div>
        )}
      </div>
    </div>
  );
}
