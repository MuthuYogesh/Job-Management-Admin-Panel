// src/App.tsx
import "./App.css";
import "@mantine/core/styles.css";
import { Routes, Route } from "react-router-dom";
import { JobProvider } from "./context/JobContext";
import Home from "./pages/Home";
import Create from "./pages/Create";

function App() {
  return (
    <JobProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </JobProvider>
  );
}

export default App;
