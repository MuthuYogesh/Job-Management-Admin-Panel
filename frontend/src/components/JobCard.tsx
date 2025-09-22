// src/components/JobCard.tsx
import React from "react";
import { Badge } from "@mantine/core";
import expLogo from "../assets/expLogo.svg";
import wrkType from "../assets/workType.svg";
import packageLogo from "../assets/package.svg";
import logoBrand from "../assets/logoBrand.png";
import type { UIJob } from "../context/JobContext";

type Props = {
  job: UIJob;
  // optionally: onApply?: (jobId: string) => void
};

const JobCard: React.FC<Props> = ({ job }) => {
  const {
    title,
    postedAgo = "24h Ago",
    experience = "",
    workType = "",
    salary = "",
    onApply,
  } = job;

  const descriptionLines: string[] = React.useMemo(() => {
    if (!job.description) return [];

    // Split by newlines, trim, drop empties
    const lines = String(job.description)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Only take first 2 lines
    return lines.slice(0, 2);
  }, [job.description]);

  return (
    <div className="w-[19.75rem] h-[22.5rem] bg-white rounded-[0.75rem] shadow-[0_0_14px_rgba(211,211,211,0.15)] flex flex-col p-[1rem] relative">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center justify-center 
             w-[83.46px] h-[82px] 
             bg-gradient-to-b from-[#FEFEFD] to-[#F1F1F1] 
             border-2 border-[#FFFFFF] 
             shadow-[0px_0px_10.25px_rgba(148,148,148,0.25)] 
             rounded-[13.1786px]"
        >
          <img
            src={logoBrand}
            alt={title || "company logo"}
            className="w-[4.118125rem] h-[4.118125rem] rounded-full"
          />
        </div>

        {/* Badge */}
        <Badge
          className="absolute left-[222px] top-[16px] 
             flex flex-row items-center justify-center 
             w-[75px] h-[33px] 
             px-[10px] py-[7px] 
             rounded-[10px] bg-[#B0D9FF] normal-case"
          styles={
            {
              root: {
                boxShadow: "none",
                background: "#B0D9FF",
                borderRadius: "10px",
                width: "4.6875rem",
                height: "2.0625rem",
                color: "#000000",
                fontFamily: "Satoshi",
                fontSize: "14px",
                fontWeight: "500",
                textTransform: "none",
                overflow: "none",
              },
            } as any
          }
        >
          {postedAgo}
        </Badge>
      </div>

      {/* Title */}
      <div className="h-[1.6875rem] text-[1.25rem] text-[var(--font-color1)] font-satoshi-xbold mt-[1.1875rem] mb-[1rem]">
        {title}
      </div>

      {/* Info Row */}
      <div className="flex justify-start items-center mb-[1.25rem] text-[1rem] font-satoshi-med text-fontgrey2 gap-[1rem]">
        <span className="flex items-center gap-[4px] ">
          <img
            src={expLogo}
            alt="experience"
            className="w-[1.13625rem] h-[1.25rem]"
          />
          {experience}
        </span>
        <span className="flex items-center gap-[4px]">
          <img
            src={wrkType}
            alt="work type"
            className="w-[1.1875rem] h-[1.025625rem]"
          />
          {workType}
        </span>
        <span className="flex items-center gap-[4px]">
          <img
            src={packageLogo}
            alt="package"
            className="w-[1.13625rem] h-[1.25rem]"
          />
          {salary}
        </span>
      </div>

      {/* Description */}
      <div className="mb-[1.25rem] mt-0 w-[18.75rem] h-[4.75rem] text-overflow: ellipsis; white-space: nowrap;">
        <ul className="leading-tight list-disc pl-5 text-[0.875rem] text-[#555555]">
          {descriptionLines.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <button
        className="apply-btn
             flex items-center justify-center
             w-[17.75rem] h-[2.875rem]
             text-white text-base font-semibold normal-case
             rounded-[10px] transition pl-[10px] pr-[10px] pt-[12px] pb-[12px]"
        onClick={() =>
          typeof onApply === "function"
            ? onApply()
            : console.log("Apply clicked:", job.title)
        }
        type="button"
      >
        Apply Now
      </button>
    </div>
  );
};

export default JobCard;
