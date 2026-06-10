// ABOUTME: Remotion entry point — registers the Root and pulls in the Tailwind stylesheet for renders.
// ABOUTME: remotion.config.ts points the CLI here; removing the styles import would render unstyled video.

import { registerRoot } from "remotion";
import { Root } from "./Root";
import "../styles.css";

registerRoot(Root);
