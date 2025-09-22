// src/components/CreateJobModal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import down from "../assets/down.svg";
import dArrowRight from "../assets/darrowright.svg";
import dArrowDown from "../assets/darrowdown.svg";

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

  const { register, handleSubmit, formState, watch, reset } =
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

  // rerender on value change (dirtyFields updates)
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
    if (
      [
        "full-time",
        "full time",
        "fulltime",
        "fulltime",
        "full",
        "fulltime",
      ].includes(s) ||
      s === "fulltime"
    )
      return "Full-time";
    if (["part-time", "part time", "parttime", "part"].includes(s))
      return "Part-time";
    if (["contract"].includes(s)) return "Contract";
    if (["internship", "intern"].includes(s)) return "Internship";
    if (["freelance", "contractor", "gig"].includes(s)) return "Freelance";
    // Some of your select values are "FullTime" / "PartTime" — check those explicitly
    if (s === "fulltime") return "Full-time";
    if (s === "parttime") return "Part-time";
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

      // Use env var if present, else fallback
      const envUrl = import.meta.env.VITE_API_URL as string | undefined;
      const finalUrl = envUrl?.startsWith("http")
        ? envUrl
        : envUrl
        ? `http://${envUrl}`
        : "http://localhost:5000/";

      console.log("Submitting normalized payload:", payload, "to", finalUrl);

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
            /* Centered responsively and constrained to viewport height so it never goes off-screen.
               Note: preserved all existing classes; inline styles only adjust positioning/size. */
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
              <label className="block text-[20px] font-satoshi-bold text-[#222222] mb-[6px]">
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
              <label className="block text-[20px] font-satoshi-bold text-[#222222] mb-[6px]">
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
              <label className="block text-[20px] font-[600] text-[#636363] mb-2">
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
                  style={{ color: "#222222" }}
                  className="w-full h-full px-[1rem] pr-10 text-[16px] font-satoshi-med appearance-none bg-transparent outline-none custom-datalist-arrow placeholder:text-[#BCBCBC]"
                  onFocus={() => setFocusedField("location")}
                  onBlur={() => setFocusedField(null)}
                />
                <datalist id="location-options">
                  <option value="Chennai" />
                  <option value="Remote" />
                  <option value="Delhi" />
                </datalist>
                <img
                  src={down}
                  alt="dropdown arrow"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                />
              </div>
            </div>

            {/* Job Type */}
            <div className="w-[376px]">
              <label className="block text-[20px] font-[600] text-[#636363] mb-[6px]">
                Job Type
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("jobType")}
              >
                <select
                  {...register("jobType")}
                  className="w-full h-full px-4 pr-10 text-[18px] font-[600] appearance-none bg-transparent outline-none placeholder-[#BCBCBC]"
                  onFocus={() => setFocusedField("jobType")}
                  onBlur={() => setFocusedField(null)}
                >
                  <option value="" className="text-[#BCBCBC]">
                    Select Job Type
                  </option>
                  <option value="FullTime">FullTime</option>
                  <option value="PartTime">PartTime</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-[1rem] mt-[1rem]">
            {/* Salary Range */}
            <div className="w-[376px]">
              <label className="block text-[20px] font-[600] text-[#636363] mb-2">
                Salary Range
              </label>
              <div className="flex gap-2">
                <div
                  className="w-1/2 h-[58px] border rounded-[10px]"
                  style={wrapperStyleFor("salaryMin")}
                >
                  <input
                    {...register("salaryMin")}
                    placeholder="₹0"
                    className="w-full h-full px-[1rem] outline-none placeholder:text-[#BCBCBC]"
                    onFocus={() => setFocusedField("salaryMin")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div
                  className="w-1/2 h-[58px] border rounded-[10px]"
                  style={wrapperStyleFor("salaryMax")}
                >
                  <input
                    {...register("salaryMax")}
                    placeholder="₹12,00,000"
                    className="w-full h-full px-[1rem] outline-none placeholder:text-[#BCBCBC]"
                    onFocus={() => setFocusedField("salaryMax")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
            </div>

            {/* Application Deadline */}
            <div className="w-[376px]">
              <label className="block text-[20px] font-[600] text-[#636363] mb-2">
                Application Deadline
              </label>
              <div
                className="h-[58px] bg-white border rounded-[10px]"
                style={wrapperStyleFor("deadline")}
              >
                <input
                  {...register("deadline")}
                  type="date"
                  className="w-full h-full border-0 px-3 outline-none date-input-no-placeholder"
                  onFocus={() => setFocusedField("deadline")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="w-[768px] mt-[1rem]">
            <label className="block text-[20px] font-[600] text-[#636363] mb-[6px]">
              Job Description
            </label>
            <div
              className="border rounded-[10px]"
              style={wrapperStyleFor("description")}
            >
              <textarea
                {...register("description")}
                placeholder="Please share a description to let the candidate know more about the job role"
                className="w-full h-[169px] p-4 text-[16px] resize-none outline-none border-0 placeholder-[#BCBCBC]"
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
              />
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
