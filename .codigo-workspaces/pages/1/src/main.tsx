import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initBuiltinComponents } from "@codigo/materials";
import App from "./App";
import "./styles.css";

initBuiltinComponents();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
