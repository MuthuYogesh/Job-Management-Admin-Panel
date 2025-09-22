// src/components/Filters.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { RangeSlider } from "@mantine/core";
import searchIcon from "../assets/search.svg";
import locationIcon from "../assets/location.svg";
import downIcon from "../assets/down.svg";
import JobIcon from "../assets/jobType.svg";
import { useJobsContext } from "../context/JobContext";

type FormValues = {
  query: string;
  location: string;
  jobType: string;
  salary: [number, number];
};

export default function Filters() {
  const { filters, setFilters } = useJobsContext();

  const { control, watch } = useForm<FormValues>({
    defaultValues: filters,
  });

  // keep watch so UI shows live changes; when user types we update context filters directly (debounce in provider)
  const filterValues = watch();

  React.useEffect(() => {
    // update context filters whenever controlled form values change
    // small guard to avoid unnecessary updates: merge only if changed
    setFilters((prev) => {
      // shallow compare relevant fields
      const same =
        prev.query === filterValues.query &&
        prev.location === filterValues.location &&
        prev.jobType === filterValues.jobType &&
        prev.salary[0] === filterValues.salary[0] &&
        prev.salary[1] === filterValues.salary[1];
      if (same) return prev;
      return {
        ...prev,
        query: filterValues.query ?? "",
        location: filterValues.location ?? "",
        jobType: filterValues.jobType ?? "",
        salary: filterValues.salary ?? [0, 200],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterValues.query,
    filterValues.location,
    filterValues.jobType,
    filterValues.salary,
  ]);

  const salary = filterValues.salary;

  return (
    <form className="w-[1440px] h-auto flex items-center mt-[2.4375rem]">
      {/* Search input */}
      <div className="w-[20.875rem] h-[3rem] ml-[4rem] flex items-center justify-center border-r-2 border-light-grey">
        <Controller
          control={control}
          name="query"
          render={({ field }) => (
            <div className="relative w-full">
              <img
                src={searchIcon}
                alt="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[1.125rem] h-[1.125rem]"
              />
              <input
                {...field}
                type="text"
                placeholder="Search By Job Title, Role"
                className="pl-10 w-full h-[2.5rem] rounded-md border-none outline-none text-base font-[var(--font-satoshi)] font-satoshi-med text-[var(--font-color1)] placeholder:text-[var(--font-color2)] placeholder:opacity-100 ml-[1.6875rem]"
                style={{
                  fontFamily: "var(--font-satoshi)",
                  fontWeight: 500,
                  fontSize: "1rem",
                  background: "transparent",
                }}
              />
            </div>
          )}
        />
      </div>

      {/* Location input */}
      <div className="w-[20.875rem] h-[3rem] flex items-center justify-center border-r-2 border-light-grey">
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <div className="relative w-full">
              <img
                src={locationIcon}
                alt="location"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[1rem] h-[1.313125rem]"
              />
              <input
                {...field}
                type="text"
                list="location-options"
                placeholder="Search By Location"
                className="pl-10 pr-10 w-full h-[2.5rem] rounded-md border-none outline-none text-base font-[var(--font-satoshi)] font-medium text-fontgrey1 placeholder:text-[var(--font-color2)] placeholder:opacity-100 ml-[1.6875rem] custom-datalist-arrow"
                style={{
                  fontFamily: "var(--font-satoshi)",
                  fontWeight: 500,
                  fontSize: "1rem",
                  background: "transparent",
                }}
              />
              <img
                src={downIcon}
                alt="dropdown"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-[1.5rem] h-[1.5rem] pointer-events-none hover:cursor-pointer"
              />
              <datalist id="location-options">
                <option value="Remote" />
                <option value="Delhi" />
                <option value="Mumbai" />
                <option value="Bangalore" />
                <option value="Hyderabad" />
              </datalist>
            </div>
          )}
        />
      </div>

      {/* Job Type input */}
      <div className="w-[20.875rem] h-[3rem] flex items-center justify-center border-r-2 border-light-grey">
        <Controller
          control={control}
          name="jobType"
          render={({ field }) => (
            <div className="relative w-full">
              <img
                src={JobIcon}
                alt="job type"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[1rem] h-[1.313125rem]"
              />
              <select
                {...field}
                className="pl-10 pr-10 w-full h-[2.5rem] rounded-md border-none outline-none text-base font-[var(--font-satoshi)] font-medium text-fontgrey1 bg-transparent appearance-none ml-[1.6875rem] custom-datalist-arrow"
                style={{
                  fontFamily: "var(--font-satoshi)",
                  fontWeight: 500,
                  fontSize: "1rem",
                  background: "transparent",
                }}
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <img
                src={downIcon}
                alt="dropdown"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-[1.5rem] h-[1.5rem] pointer-events-none hover:cursor-pointer"
              />
            </div>
          )}
        />
      </div>

      {/* Salary Range input */}
      <div className="flex flex-col justify-center align-center">
        <div className=" flex justify-evenly">
          <span className="text-[var(--font-color1)] font-[var(--font-satoshi)] font-semibold text-base">
            Salary Per Month
          </span>
          <span className="text-[var(--font-color1)] font-[var(--font-satoshi)] font-semibold text-base">
            ₹{salary[0]}k - ₹{salary[1]}k
          </span>
        </div>
        <div className="w-[20.875rem] h-[3rem] flex flex-col justify-center">
          <Controller
            control={control}
            name="salary"
            render={({ field }) => (
              <RangeSlider
                min={0}
                max={200}
                step={1}
                value={field.value}
                onChange={field.onChange}
                size="xs"
                color="#000000"
                className="mb-[2.09375rem] mt-[1.46875rem] ml-[3.125rem]"
                styles={{
                  root: { width: "15.53125rem" },
                  track: { backgroundColor: "#eaeaea" },
                  bar: { backgroundColor: "#111" },
                  thumb: {
                    border: "5px solid #000000",
                    background: "#ffffff",
                    width: "15px",
                    height: "15px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  },
                }}
              />
            )}
          />
        </div>
      </div>
    </form>
  );
}
