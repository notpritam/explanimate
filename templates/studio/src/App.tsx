// ABOUTME: Studio shell — tiny hash router: #/ gallery, #/scene/<id> fullscreen scene, #/video/<id> Remotion Player.
// ABOUTME: Exposes window.__SCENES__ for shoot.mjs --all; hides all chrome in shot mode so screenshots stay clean.

import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { SCENES } from "./scenes/registry";
import { VIDEOS } from "./remotion/videos";
import { useShotMode } from "./shared/primitives";

declare global {
  interface Window {
    __SCENES__?: string[];
  }
}

type Route = { view: "gallery" } | { view: "scene"; id: string } | { view: "video"; id: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path] = hash.split("?");
  const [section, id] = path.split("/");
  if (section === "scene" && id) return { view: "scene", id };
  if (section === "video" && id) return { view: "video", id };
  return { view: "gallery" };
}

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function BackLink() {
  const shot = useShotMode();
  if (shot) return null;
  return (
    <a
      href="#/"
      className="fixed top-4 left-4 z-50 rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-muted shadow-sm hover:text-ink"
    >
      ← gallery
    </a>
  );
}

function Gallery() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="text-[28px] font-bold tracking-tight">explanimate studio</h1>
      <p className="mt-1 text-[15px] text-muted">
        Animated visual explainers as code — scenes (Motion) and videos (Remotion).
      </p>

      <h2 className="mt-10 text-[14px] font-semibold tracking-wider text-muted uppercase">Scenes</h2>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {SCENES.map((s) => (
          <a
            key={s.id}
            href={`#/scene/${s.id}`}
            className="rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-accent"
          >
            <div className="text-[16px] font-semibold">{s.title}</div>
            <div className="mt-1 text-[13.5px] text-muted">{s.description}</div>
            <div className="mt-3 font-mono text-[12px] text-faint">#/scene/{s.id}</div>
          </a>
        ))}
      </div>

      <h2 className="mt-10 text-[14px] font-semibold tracking-wider text-muted uppercase">Videos</h2>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {VIDEOS.map((v) => (
          <a
            key={v.id}
            href={`#/video/${v.id}`}
            className="rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-accent"
          >
            <div className="text-[16px] font-semibold">{v.title}</div>
            <div className="mt-1 text-[13.5px] text-muted">{v.description}</div>
            <div className="mt-3 font-mono text-[12px] text-faint">
              {v.width}×{v.height} · {v.fps}fps · {(v.durationInFrames / v.fps).toFixed(1)}s
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function SceneView({ id }: { id: string }) {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) {
    return (
      <div className="p-10 font-mono text-[14px] text-muted">unknown scene: {id} — check src/scenes/registry.ts</div>
    );
  }
  const Component = scene.component;
  return (
    <div className="h-screen w-screen">
      <BackLink />
      <Component />
    </div>
  );
}

function VideoView({ id }: { id: string }) {
  const video = VIDEOS.find((v) => v.id === id);
  if (!video) {
    return (
      <div className="p-10 font-mono text-[14px] text-muted">unknown video: {id} — check src/remotion/videos.ts</div>
    );
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 px-8">
      <BackLink />
      <div className="w-full max-w-5xl">
        <div className="mb-2 text-[16px] font-semibold">{video.title}</div>
        <Player
          component={video.component}
          durationInFrames={video.durationInFrames}
          fps={video.fps}
          compositionWidth={video.width}
          compositionHeight={video.height}
          style={{ width: "100%", aspectRatio: `${video.width} / ${video.height}` }}
          controls
          loop
          autoPlay
        />
        <div className="mt-2 font-mono text-[12px] text-faint">
          render: pnpm video:render {video.id} → out/{video.id}.mp4
        </div>
      </div>
    </div>
  );
}

export function App() {
  const route = useHashRoute();

  useEffect(() => {
    window.__SCENES__ = SCENES.map((s) => s.id);
  }, []);

  if (route.view === "scene") return <SceneView id={route.id} />;
  if (route.view === "video") return <VideoView id={route.id} />;
  return <Gallery />;
}
