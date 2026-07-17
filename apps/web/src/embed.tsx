import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { EmbedWidget } from "./EmbedWidget";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("The ScottLab embed could not find its root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <EmbedWidget />
  </StrictMode>,
);
