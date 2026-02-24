import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { trackTrafficSource } from "@/lib/traffic-source";

trackTrafficSource();
createRoot(document.getElementById("root")!).render(<App />);
