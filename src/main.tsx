import { createRoot } from "react-dom/client";
import { WhiteLabelProvider } from "@/hooks/useWhiteLabel";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <WhiteLabelProvider>
    <App />
  </WhiteLabelProvider>
);
