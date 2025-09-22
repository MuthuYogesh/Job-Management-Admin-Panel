// src/types/job.ts
export type Job = {
  id: string | number;
  companyLogo?: string;
  title: string;
  postedAgo?: string;
  experience?: string;
  workType?: string;
  salary?: string;
  description?: string[];
  // any extra backend fields allowed
  [key: string]: any;
};
