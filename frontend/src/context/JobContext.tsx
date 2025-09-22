// src/context/JobContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type { Job as BackendJob } from "../types/job"; // backend job type

// UI shape expected by JobCard
export type UIJob = {
  id: string;
  _id?: string;
  companyLogo: string | null;
  title: string;
  postedAgo: string;
  experience: string;
  workType: string;
  salary: string;
  description: string[]; // up to 2 lines
  onApply: () => void;
  _raw: BackendJob; // original backend doc
};

type Filters = {
  query: string;
  location: string;
  jobType: string;
  salary: [number, number]; // values in "k" units (0..200)
};

type JobContextType = {
  jobs: UIJob[]; // always an array of UIJob
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (fn: Partial<Filters> | ((prev: Filters) => Filters)) => void;
  setJobs: React.Dispatch<React.SetStateAction<UIJob[]>>;
  fetchJobs: (overwriteFilters?: Partial<Filters>) => Promise<void>;
};

const DEFAULT_FILTERS: Filters = {
  query: "",
  location: "",
  jobType: "",
  salary: [0, 200],
};

const JobContext = createContext<JobContextType | undefined>(undefined);

/** Convert backend number -> display "k" format (used when formatting UI salary) */
function formatK(n?: number | null) {
  if (n === undefined || n === null || Number.isNaN(n)) return "";
  const v = Math.round(Number(n) / 10000); // matches your earlier formatK
  return `${v}k`;
}

function humanizePostedAgo(isoDate?: string | Date | null) {
  if (!isoDate) return "24h Ago";
  const d = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  const diffMs = Date.now() - d.getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return "Just now";

  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function deriveCompanyLogo(company?: string | null) {
  if (!company) return null;
  const domainCandidate = company
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  if (!domainCandidate) return null;
  return `https://logo.clearbit.com/${domainCandidate}.com`;
}

function normalizeDescriptionToTwoLines(desc?: string | string[] | null) {
  if (!desc) return [];
  if (Array.isArray(desc)) {
    return desc
      .map((d) => (d == null ? "" : String(d).trim()))
      .filter(Boolean)
      .slice(0, 2);
  }
  const byLines = String(desc)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (byLines.length >= 2) return byLines.slice(0, 2);

  if (byLines.length === 1) {
    const sentenceSplit = byLines[0]
      .split(/(?<=[.!?;])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentenceSplit.length >= 2) return sentenceSplit.slice(0, 2);
    return [byLines[0]];
  }

  return [];
}

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<UIJob[]>([]);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setFilters = (fn: Partial<Filters> | ((prev: Filters) => Filters)) => {
    setFiltersState((prev) =>
      typeof fn === "function"
        ? (fn as (p: Filters) => Filters)(prev)
        : { ...prev, ...fn }
    );
  };

  const fetchJobs = async (overwriteFilters?: Partial<Filters>) => {
    const usedFilters = overwriteFilters
      ? { ...filters, ...overwriteFilters }
      : filters;

    // sanitize: trim and remove quotes/semicolons only — keep hyphens (for "Full-time")
    const sanitize = (v?: string) => (v || "").trim().replace(/['";]/g, "");

    const q = sanitize(usedFilters.query);
    const location = sanitize(usedFilters.location);
    // for jobType we only trim (no character removal) to preserve hyphens
    const jobType = (usedFilters.jobType || "").trim();
    // usedFilters.salary is in "k" units (0..200). Convert to backend numbers:
    const salaryKMin = Number(usedFilters.salary[0] ?? 0);
    const salaryKMax = Number(usedFilters.salary[1] ?? 200);

    // Convert slider k-values back to backend raw numbers:
    // Reverse of formatK: multiply by 10,000 (since formatK did n/10000)
    // e.g. 100 (k) -> 100 * 10000 = 1,000,000
    const salaryMinRaw = Math.max(0, Math.round(salaryKMin * 10000));
    const salaryMaxRaw = Math.max(0, Math.round(salaryKMax * 10000));

    // Base host: VITE_API_URL (if present) or default to http://localhost:5000
    const envUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
    const baseHost = envUrl
      ? envUrl.startsWith("http")
        ? envUrl.replace(/\/$/, "")
        : `http://${envUrl.replace(/\/$/, "")}`
      : "http://localhost:5000";

    // Per your instruction the API endpoint is the root (baseHost) + query params.
    const endpoint = `${baseHost}`; // e.g. http://localhost:5000

    const params: Record<string, string | number> = {};
    if (q) params.q = q;
    if (location) params.location = location;
    if (jobType) params.jobType = jobType; // now preserves hyphen like "Full-time"
    // include raw numbers expected by backend
    params.salaryMin = salaryMinRaw;
    params.salaryMax = salaryMaxRaw;

    // DEBUG: log what we are sending to the server — inspect Network tab too
    // Remove this console.log in production.
    console.log("fetchJobs -> sending params:", params, "to", endpoint);

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(endpoint, { params });

      // res.data could be { data, meta } or an array. Normalize to array of backend jobs.
      const backendJobs: BackendJob[] =
        (res.data?.data as BackendJob[] | undefined) ??
        (res.data as BackendJob[] | undefined) ??
        [];

      // Map backend job -> UIJob
      const uiJobs: UIJob[] = backendJobs.map((b) => {
        const id = (b as any)._id ?? (b as any).id ?? String(Math.random());

        let salaryStr = "";
        if (b.salaryMin != null && b.salaryMax != null) {
          salaryStr = `₹${formatK(b.salaryMin)} - ₹${formatK(b.salaryMax)}`;
        } else if (b.salaryMin != null) {
          salaryStr = `₹${formatK(b.salaryMin)}`;
        } else if (b.salaryMax != null) {
          salaryStr = `₹${formatK(b.salaryMax)}`;
        }

        const descriptionArr = normalizeDescriptionToTwoLines(
          (b as any).description
        );

        const ui: UIJob = {
          id,
          _id: (b as any)._id,
          companyLogo: deriveCompanyLogo(b.company ?? null),
          title: b.title ?? "",
          postedAgo: humanizePostedAgo(
            (b as any).createdAt ?? (b as any).updatedAt
          ),
          experience: "",
          workType: (b.jobType as string) ?? "",
          salary: salaryStr,
          description: descriptionArr,
          onApply: () => {
            console.log("Apply clicked for job", id, b);
            window.alert(`Apply for ${b.title} at ${b.company}`);
          },
          _raw: b,
        };

        return ui;
      });

      setJobs(uiJobs);
    } catch (err: any) {
      console.error("fetchJobs error", err);
      setError(err?.message ?? "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchJobs().catch(() => {});
    }, 350);
    return () => clearTimeout(id);
  }, [
    filters.query,
    filters.location,
    filters.jobType,
    filters.salary[0],
    filters.salary[1],
  ]);

  const value: JobContextType = {
    jobs,
    loading,
    error,
    filters,
    setFilters,
    setJobs,
    fetchJobs,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export function useJobsContext() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error("useJobsContext must be used within JobProvider");
  return ctx;
}
