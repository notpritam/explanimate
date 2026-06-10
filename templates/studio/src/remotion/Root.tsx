// ABOUTME: Remotion root — maps the VIDEOS registry to <Composition> entries for the CLI and Remotion Studio.
// ABOUTME: Never define compositions inline here; register them in videos.ts so the gallery Player sees them too.

import { Composition } from "remotion";
import { VIDEOS } from "./videos";

export const Root: React.FC = () => {
  return (
    <>
      {VIDEOS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={v.component}
          durationInFrames={v.durationInFrames}
          fps={v.fps}
          width={v.width}
          height={v.height}
        />
      ))}
    </>
  );
};
