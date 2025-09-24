// src/components/JobTypeCombo.tsx
import React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";

import { useController } from "react-hook-form";
import type { UseControllerProps } from "react-hook-form";

type Option = { value: string; label: string };

const jobOptions: Option[] = [
  { value: "FullTime", label: "Full Time" },
  { value: "PartTime", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
} & UseControllerProps<any>; // accept control + rules etc.

export default function JobTypeCombo({
  name,
  control,
  label,
  placeholder = "Select Job Type",
  rules,
}: Props) {
  // useController binds this field to react-hook-form without FormProvider
  const {
    field: { value, onChange, ref },
  } = useController({ name, control, rules });

  // local filter for combobox
  const [query, setQuery] = React.useState("");
  const filtered =
    query === ""
      ? jobOptions
      : jobOptions.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        );

  console.log("Filtered: ", filtered);
  // helper used in your modal to compute shared label/border color
  // you can replace these with your existing labelColorFor / wrapperStyleFor
  const isFilled = Boolean(value && String(value).trim() !== "");

  return (
    <Combobox value={value || ""} onChange={(v) => onChange(v)}>
      <div className="relative">
        <ComboboxInput
          as="input"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          displayValue={(v: string) => {
            const opt = jobOptions.find((o) => o.value === v);
            return opt ? opt.label : "";
          }}
          placeholder={placeholder}
          ref={ref}
          className={`w-full h-[58px] px-4 pr-[48px] text-[18px] font-[600] bg-white
              border rounded-[10px]
              transition-colors duration-150
              ${isFilled ? "text-[#222222]" : "text-[#BCBCBC]"}`}
          onFocus={() => {
            // if you need to propagate focus to parent modal logic:
            const ev = new CustomEvent("combobox-focus", { detail: name });
            window.dispatchEvent(ev);
          }}
          onBlur={() => {
            const ev = new CustomEvent("combobox-blur", { detail: name });
            window.dispatchEvent(ev);
          }}
        />

        {/* custom chevron */}
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          {/* replace with your exact SVG if you prefer */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Options panel */}
        <ComboboxOptions
          static={false}
          className="absolute mt-2 w-[376px] max-h-[192px] overflow-auto bg-white rounded-[10px]
                       shadow-[0_0_14px_rgba(147,147,147,0.25)] z-50 p-0"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-[16px] text-[#999]">No results</div>
          ) : (
            filtered.map((opt) => (
              <ComboboxOption
                value={opt.value}
                className="w-full px-4 py-3 text-[16px] font-[500] cursor-pointer select-none text-[#222]
    data-[focus]:bg-[#F0F0F0] data-[focus]:text-[#222]
    data-[selected]:bg-[#F5F5F5]"
              >
                {opt.label}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
