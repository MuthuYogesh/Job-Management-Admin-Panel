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
           shadow-pill-lg bg-white flex items-center gap-[11.14px]
           justify-evenly font-(family-name:--font-satoshi) 
           font-[weight:var(--font-weight-satoshi-bold)] text-[16px]"
        >
          <img
            src="logo.svg"
            alt="Logo Here"
            className="w-[2.75rem] h-[2.7925rem]"
          ></img>
          <p>Home</p>
          <p>Find Jobs</p>
          <p>Find Talents</p>
          <p>About Us</p>
          <p>Testimonials</p>
          <div className="w-[7.6875rem] h-[2.375rem] flex items-center justify-center px-2 py-2 rounded-[30px] bg-gradient-to-b from-[#A128FF] to-[#6100AD]">
            <p
              className="text-white font-medium text-sm cursor-pointer"
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
