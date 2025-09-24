import { useNavigate } from "react-router-dom";
import { AppShell } from "@mantine/core";
import Filters from "./Filters";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <>
      <AppShell.Header>
        <div
          className="mx-auto mt-[1.3125rem] w-[55.625rem] h-[5rem] 
           rounded-full border border-[#FCFCFC] 
           shadow-pill-lg bg-white flex items-center
           font-(family-name:--font-satoshi) 
           font-[weight:var(--font-weight-satoshi-bold)] text-[16px] gap-[42px]"
        >
          <div className="flex items-center justify-start gap-[53px] ml-[26px]">
            <img
              src="logo.svg"
              alt="Logo Here"
              className="w-[2.75rem] h-[2.7925rem]"
            ></img>
            <p className="max-w-[44px] max-h-[22px] leading-[22px]">Home</p>
            <p className="max-w-[72px] max-h-[22px] leading-[22px] whitespace-nowrap">
              Find Jobs
            </p>
            <p className="max-w-[88px] max-h-[22px] leading-[22px] whitespace-nowrap">
              Find Talents
            </p>
            <p className="max-w-[65px] max-h-[22px] leading-[22px] whitespace-nowrap">
              About us
            </p>
            <p className="max-w-[90px] max-h-[22px] leading-[22px] whitespace-nowrap">
              Testimonials
            </p>
          </div>
          <div className="w-[7.6875rem] h-[2.375rem] flex items-center px-[17px] py-[8px] rounded-[30px] bg-gradient-to-b from-[#A128FF] to-[#6100AD]">
            <p
              className="max-w-[75px] max-h-[22px] leading-[22px] text-white font-medium cursor-pointer whitespace-nowrap text-center"
              onClick={() => navigate("/create")}
            >
              Create Jobs
            </p>
          </div>
        </div>
        <Filters></Filters>
      </AppShell.Header>
    </>
  );
}
