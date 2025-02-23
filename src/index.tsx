import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Redirect to landing page
window.location.href = "/landing_page/index.html";

// Optional: Keep React root for future integration
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
