// src/pages/JobGrid.tsx
import JobCard from "../components/JobCard";
import { useJobsContext } from "../context/JobContext";

export default function JobsGrid() {
  const { jobs } = useJobsContext();

  // only take first 8 (2 rows * 4 cols)
  const visibleJobs = jobs.slice(0, 8);

  return (
    <div className="w-full px-16 pt-12 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleJobs.length > 0 ? (
          visibleJobs.map((job) => (
            <JobCard key={job._id ?? job.id} job={job} />
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-10 text-gray-500">
            <p>
              Since the backend is currently hosted on Render’s free tier, the
              server may spin down when idle.
            </p>
            <p>
              As a result, if the website is opened after a long time, the
              initial data load may take slightly longer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
