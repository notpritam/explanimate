// ABOUTME: Vite entry — mounts the studio app (gallery + scene viewer + video player).
// ABOUTME: The Remotion render pipeline does NOT pass through here; its entry is src/remotion/index.ts.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
