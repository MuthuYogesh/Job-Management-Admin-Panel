// src/components/CreateJobModal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import downSharp from "../assets/downSharp.svg";
import dArrowRight from "../assets/darrowright.svg";
import dArrowDown from "../assets/darrowdown.svg";
import CustomSelect from "./CustomSelect";
import calender from "../assets/calender.svg";

type FormValues = {
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
  deadline: string;
  description: string;
  requirements: string;
  responsibilities: string;
};

export default function CreateJobModal() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState, watch, reset, setValue } =
    useForm<FormValues>({
      defaultValues: {
        title: "",
        company: "",
        location: "",
        jobType: "",
        salaryMin: "",
        salaryMax: "",
        deadline: "",
        description: "",
      },
      mode: "onChange",
    });

  watch();

  const [focusedField, setFocusedField] = useState<keyof FormValues | null>(
    null
  );

  const { dirtyFields } = formState as {
    dirtyFields: Partial<Record<keyof FormValues, boolean>>;
  };

  const close = () => navigate("/", { replace: true });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // helper: border color based on focus/dirty
  const borderColorFor = (name: keyof FormValues) => {
    if (focusedField === name) return "#222222";
    if (dirtyFields && dirtyFields[name]) return "#222222";
    return "#BCBCBC";
  };

  const watchedValues = watch();

  const hasValue = (name: keyof FormValues) => {
    const v = watchedValues?.[name];
    if (v === undefined || v === null) return false;
    const s = String(v).trim();
    return s !== "";
  };

  // fields grouped for Salary Range
  const salaryFieldNames: Array<keyof FormValues> = ["salaryMin", "salaryMax"];

  // returns true if any of the salary fields has a non-empty value
  const salaryHasValue = () => salaryFieldNames.some((n) => hasValue(n));

  // returns true if any of the salary fields is currently focused
  const salaryIsFocused = () =>
    salaryFieldNames.some((n) => focusedField === n);

  // combined color decision for Salary Range label
  const salaryLabelColor = () => {
    if (salaryIsFocused()) return "#222222";
    if (salaryHasValue()) return "#222222";
    return "#636363";
  };

  const salaryPlaceholderColor = (name: keyof FormValues) => {
    if (focusedField === name) return "#222222";
    if (hasValue(name)) return "#222222";
    return "#BCBCBC";
  };

  // label color: slightly different default than border, but active color same
  const labelColorFor = (name: keyof FormValues) => {
    if (focusedField === name) return "#222222";
    if (hasValue(name)) return "#222222";
    return "#636363";
  };

  const wrapperStyleFor = (name: keyof FormValues) => ({
    borderColor: borderColorFor(name),
  });

  // normalize helpers
  const toNumberSafe = (v: any): number | undefined => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    if (s === "") return undefined;
    // remove commas and spaces
    const cleaned = s.replace(/[,\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  };

  const mapJobType = (v?: string): string | undefined => {
    if (!v) return undefined;
    const s = v.trim().toLowerCase();
    if (["full-time", "full time", "fulltime", "full"].includes(s))
      return "Full-time";
    if (["part-time", "part time", "parttime", "part"].includes(s))
      return "Part-time";
    if (s === "contract") return "Contract";
    if (["internship", "intern"].includes(s)) return "Internship";
    if (["freelance", "contractor", "gig"].includes(s)) return "Freelance";
    return undefined;
  };

  // Submit handler: POST to backend
  const onSubmit = async (data: FormValues) => {
    try {
      // Build normalized payload
      const payload: Record<string, any> = {
        title: String(data.title ?? "").trim(),
        company: String(data.company ?? "").trim(),
        description: data.description
          ? String(data.description).trim()
          : undefined,
        location: data.location ? String(data.location).trim() : undefined,
      };

      // Normalize jobType to backend enum
      const jt = mapJobType(data.jobType);
      if (jt) payload.jobType = jt;

      // Normalize salaries to numbers
      const sMin = toNumberSafe(data.salaryMin);
      const sMax = toNumberSafe(data.salaryMax);
      if (sMin !== undefined) payload.salaryMin = sMin;
      if (sMax !== undefined) payload.salaryMax = sMax;

      // Normalize deadline to ISO if valid date provided
      if (data.deadline) {
        const d = new Date(data.deadline);
        if (!Number.isNaN(d.getTime())) payload.deadline = d.toISOString();
      }

      const envUrl = import.meta.env.VITE_API_URL as string | undefined;
      const finalUrl = envUrl?.startsWith("http")
        ? envUrl
        : envUrl
        ? `http://${envUrl}`
        : "https://job-management-admin-panel-1.onrender.com/";

      const res = await axios.post(finalUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Job published:", res.data);
      reset(); // clear form
      navigate("/", { replace: true });
    } catch (err: any) {
      // detailed logging to inspect server validation errors
      console.error("Error publishing job:", err);
      console.error("status:", err?.response?.status);
      console.error("response data:", err?.response?.data);

      // friendly fallback: show server validation messages if any
      const serverData = err?.response?.data;
      if (serverData) {
        if (Array.isArray(serverData.errors)) {
          // express-validator style
          const messages = serverData.errors
            .map((e: any) => `${e.param}: ${e.msg}`)
            .join("\n");
          alert(messages);
        } else if (serverData.message) {
          alert(serverData.message);
        } else {
          alert("Failed to publish job. Check console for details.");
        }
      } else {
        alert(
          err.message || "Failed to publish job. Check console for details."
        );
      }
    }
  };

  // Draft handler: Save to localStorage
  const saveDraft = () => {
    const formData = watch();
    localStorage.setItem("jobDraft", JSON.stringify(formData));
    console.log("Draft saved:", formData);
    navigate("/", { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pointer-events-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div
        className="w-[53rem] h-[48.6875rem] mx-auto relative bg-white rounded-[16px] shadow-[0_0_24px_rgba(169,169,169,0.25)] pl-[2.5rem] pr-[2.5rem] pt-[1.875rem] pb-[2.3125rem] overflow-auto"
        style={
          {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            position: "absolute",
            maxHeight: "90vh",
          } as React.CSSProperties
        }
      >
        <div className="pb-4 text-center">
          <h2 className="text-[24px] font-[700] text-[#222222]">
            Create Job Opening
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto" noValidate>
          {/* Top row: Job Title & Company */}
          <div className="flex justify-center gap-[1rem]">
            <div className="w-[376px]">
              <label
                className="block text-[20px] font-satoshi-bold text-[#636363] mb-[6px]"
                style={{ color: labelColorFor("title") }}
              >
                Job Title
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("title")}
              >
                <input
                  {...register("title", { required: true })}
                  placeholder="Full Stack Developer"
                  className="w-full h-full px-[1rem] text-[16px] font-satoshi-med placeholder-[#BCBCBC] outline-none"
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            <div className="w-[376px]">
              <label
                className="block text-[20px] font-satoshi-bold text-[#636363] mb-[6px]"
                style={{ color: labelColorFor("company") }}
              >
                Company Name
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("company")}
              >
                <input
                  {...register("company")}
                  placeholder="Amazon"
                  className="w-full h-full px-[1rem] text-[16px] font-satoshi-med placeholder-[#BCBCBC] outline-none"
                  onFocus={() => setFocusedField("company")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-[1rem] mt-[1rem]">
            {/* Location */}
            <div className="w-[376px]">
              <label
                className="block text-[20px] font-[600] text-[#636363] mb-2"
                style={{ color: labelColorFor("location") }}
              >
                Location
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px] relative"
                style={wrapperStyleFor("location")}
              >
                <input
                  {...register("location")}
                  list="location-options"
                  placeholder="Choose Preferred Location"
                  className="custom-input w-full h-full px-[1rem] pr-10 text-[16px] font-satoshi-med appearance-none bg-transparent outline-none custom-datalist-arrow placeholder:text-[#BCBCBC]"
                  onFocus={() => setFocusedField("location")}
                  onBlur={() => setFocusedField(null)}
                />
                <datalist id="location-options">
                  <option value="Chennai" />
                  <option value="Remote" />
                  <option value="Delhi" />
                </datalist>
                <img
                  src={downSharp}
                  alt="dropdown arrow"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                />
              </div>
            </div>

            {/* Job Type */}
            <div className="w-[376px]">
              <label
                className="block text-[20px] font-[600] mb-[6px]"
                style={{ color: labelColorFor("jobType") }}
              >
                Job Type
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("jobType")}
              >
                <CustomSelect
                  options={[
                    { value: "Internship", label: "Internship" },
                    { value: "FullTime", label: "Full Time" },
                    { value: "PartTime", label: "Partime" },
                    { value: "Contract", label: "Contract" },
                  ]}
                  value={watch("jobType") || ""}
                  onChange={(v) => {
                    setValue("jobType", v, { shouldDirty: true });
                  }}
                  placeholder="Select Job Type"
                  onFocus={() => setFocusedField("jobType")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-[1rem] mt-[1rem]">
            {/* Salary Range */}
            <div className="w-[376px]">
              <label
                className="block text-[20px] font-[600] text-[#636363] mb-2"
                style={{ color: salaryLabelColor() }}
              >
                Salary Range
              </label>

              <div className="flex gap-2">
                <div
                  className="w-1/2 h-[58px] border rounded-[10px] flex items-center"
                  style={wrapperStyleFor("salaryMin")}
                >
                  <span
                    className="pointer-events-none ml-[1rem]"
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 12L4 15M4 15L1 12M4 15V1M9 4L12 1M12 1L15 4M12 1V15"
                        stroke={salaryPlaceholderColor("salaryMin")}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    {...register("salaryMin")}
                    placeholder="₹0"
                    className="w-full h-full px-[4px] outline-none placeholder:text-[#BCBCBC]"
                    onFocus={() => setFocusedField("salaryMin")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div
                  className="w-1/2 h-[58px] border rounded-[10px] flex items-center"
                  style={wrapperStyleFor("salaryMax")}
                >
                  <span
                    className="pointer-events-none ml-[1rem]"
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 12L4 15M4 15L1 12M4 15V1M9 4L12 1M12 1L15 4M12 1V15"
                        stroke={salaryPlaceholderColor("salaryMax")}
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    {...register("salaryMax")}
                    placeholder="₹12,00,000"
                    className="w-full h-full px-[4px] outline-none placeholder:text-[#BCBCBC]"
                    onFocus={() => setFocusedField("salaryMax")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
            </div>

            {/* Application Deadline */}
            <div className="w-[376px]">
              <label
                className="block text-[20px] font-[600] text-[#636363] mb-2"
                style={{ color: labelColorFor("deadline") }}
              >
                Application Deadline
              </label>
              <div
                className="relative h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("deadline")}
              >
                {/* White overlay to hide native mm/dd/yyyy placeholder */}
                <div className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[200px] h-[40px] bg-white pointer-events-none"></div>

                <input
                  {...register("deadline")}
                  type="date"
                  className="w-full h-full border-0 pl-3 pr-10 outline-none"
                  onFocus={() => setFocusedField("deadline")}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Custom calendar icon (click passes through to native indicator) */}
                <img
                  src={calender}
                  alt="calendar"
                  className="absolute right-[20px] top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                />

                {/* Style native calendar picker so it's invisible but still clickable */}
                <style>{`
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    position: absolute;
                    right: 12px;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="w-[768px] mt-[1rem]">
            <label
              className="block text-[20px] font-[600] text-[#636363] mb-[6px]"
              style={{ color: labelColorFor("description") }}
            >
              Job Description
            </label>

            {/* wrapper must be relative so overlay can be positioned */}
            <div
              className="border rounded-[10px]"
              style={wrapperStyleFor("description")}
            >
              <div className="relative">
                <textarea
                  {...register("description")}
                  placeholder="Please share a description to let the candidate know more about the job role"
                  className="w-full h-[169px] p-4 pr-10 text-[16px] resize-y outline-none border-0 placeholder-[#BCBCBC]"
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Custom resize handle (visual only). pointer-events-none lets pointer go to textarea */}
                <div className="absolute bottom-2 right-2 w-6 h-6 pointer-events-none flex items-center justify-center">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 23 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#BCBCBC]"
                  >
                    <path
                      d="M1 16.5564L16.5563 1.00005"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5.94971 17.2634L17.2634 5.94972"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.8994 17.9707L17.9705 10.8996"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <style>{`
        /* Chrome, Edge, Safari */
        textarea::-webkit-resizer {
          display: none;
        }
        /* Firefox (best-effort) */
        textarea::-moz-resizer {
          display: none;
        }
        /* keep mobile tap highlight off for cleaner UI */
        textarea {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="w-full flex items-center justify-between mt-[2.5rem]">
            <button
              type="button"
              onClick={saveDraft}
              className="draft-btn w-[14.5rem] h-[3.6875rem] flex items-center justify-center gap-2 px-[60px] py-[16px] bg-white border border-[#222222] rounded-[10px] shadow-sm"
            >
              Save Draft
              <img src={dArrowDown} alt="v"></img>
            </button>
            <button
              type="submit"
              className="save-btn w-[12.9375rem] h-[3.6875rem] flex items-center gap-2 px-[60px] py-[16px] bg-[#00AAFF] text-white rounded-[10px]"
            >
              Publish
              <img src={dArrowRight} alt=">>"></img>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
