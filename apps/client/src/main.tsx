import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initBuiltinComponents } from "@codigo/materials";

initBuiltinComponents();

// import { I18nProvider } from "./i18n/I18nProvider.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <I18nProvider> */}
    <App />
    {/* </I18nProvider> */}
  </StrictMode>,
);
