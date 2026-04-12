import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initNetworkDetection } from "@/lib/networkDetection";

function showFatalError(message: string) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui, sans-serif;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
        <pre style="white-space: pre-wrap; background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 0.5rem;">${message}</pre>
      </div>
    `;
  }
  // Ensure it is also logged to the console for debugging.
  console.error(message);
}

window.addEventListener("error", (event) => {
  showFatalError(event.error?.stack || event.message || String(event));
});

window.addEventListener("unhandledrejection", (event) => {
  showFatalError(event.reason?.stack || event.reason || String(event));
});

// Initialize network detection for performance optimization
initNetworkDetection();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
