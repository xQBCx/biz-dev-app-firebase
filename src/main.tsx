import { createRoot } from "react-dom/client";
import { WhiteLabelProvider } from "@/hooks/useWhiteLabel";
import { ThemeLockProvider } from "@/providers/ThemeLockProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeLockProvider>
    <WhiteLabelProvider>
      <App />
    </WhiteLabelProvider>
  </ThemeLockProvider>
);
