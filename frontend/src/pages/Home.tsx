import "@mantine/core/styles.css";
import { MantineProvider, AppShell } from "@mantine/core";
import Navbar from "../components/Navbar";
import JobGrid from "./JobGrid";

export default function Home() {
  return (
    <MantineProvider
      theme={{
        fontFamily: "Satoshi Variable, Inter, system-ui, sans-serif",
        colors: {
          brand: [
            "#f7f2ff",
            "#efe6ff",
            "#d8cfff",
            "#bfa9ff",
            "#a982ff",
            "#9060f0",
            "#6F42C1",
            "#5A2EA0",
            "#3f1c80",
            "#2a0d66",
          ],
        },
        primaryColor: "brand",
        primaryShade: 6,
        defaultRadius: "md",
      }}
    >
      <AppShell header={{ height: "13.375rem" }}>
        <Navbar />
        <AppShell.Main>
          <JobGrid />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
