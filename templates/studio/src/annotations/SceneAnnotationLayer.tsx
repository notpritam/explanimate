// ABOUTME: Idle-by-default HTML annotation tray for comments, highlights, replay, and agent payload generation.
// ABOUTME: Keeps annotation capture explicit so normal scene interaction never creates feedback comments.

import { useMemo, useRef, useState, type PointerEvent } from "react";

type Tool = "comment" | "highlight";
type Severity = "question" | "low" | "medium" | "high" | "blocker";

interface AnnotationBase {
  id: string;
  x: number;
  y: number;
  text: string;
  severity: Severity;
  tags: string[];
}

interface CommentAnnotation extends AnnotationBase {
  kind: "comment";
}

interface HighlightAnnotation extends AnnotationBase {
  kind: "highlight";
  w: number;
  h: number;
}

type SceneAnnotation = CommentAnnotation | HighlightAnnotation;

interface DragState {
  startX: number;
  startY: number;
  x: number;
  y: number;
}

interface SceneAnnotationLayerProps {
  sceneId: string;
  onReplay: () => void;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function nextId(items: SceneAnnotation[]) {
  const max = items.reduce((highest, item) => {
    const numeric = Number(item.id.replace(/^A/, ""));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0);
  return `A${String(max + 1).padStart(3, "0")}`;
}

function parseTags(raw: string) {
  return raw
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function payloadFor(sceneId: string, annotations: SceneAnnotation[]) {
  return {
    schema_version: 1,
    source: {
      scene_id: sceneId,
      url: window.location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    },
    annotations,
  };
}

function agentPrompt(sceneId: string, annotations: SceneAnnotation[]) {
  const payload = payloadFor(sceneId, annotations);
  return [
    "Use these human scene annotations to revise the explanimate scene.",
    "",
    "Rules:",
    "- Inspect the scene code before making edits.",
    "- Keep annotation capture idle unless Comment or Highlight is explicitly armed.",
    "- Rerun the relevant screenshot, UI, typecheck, and build gates after changes.",
    "- Ask a blocking question if an annotation is unclear.",
    "",
    "Annotation payload:",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
  ].join("\n");
}

export function SceneAnnotationLayer({ sceneId, onReplay }: SceneAnnotationLayerProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [text, setText] = useState("");
  const [severity, setSeverity] = useState<Severity>("question");
  const [tags, setTags] = useState("");
  const [annotations, setAnnotations] = useState<SceneAnnotation[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("Open feedback, then choose Comment or Highlight.");
  const payloadText = useMemo(() => agentPrompt(sceneId, annotations), [annotations, sceneId]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const armed = tool !== null;
  const commentText = text.trim() || "Review this area";
  const editingAnnotation = annotations.find((item) => item.id === editingId) ?? null;

  function coords(event: PointerEvent<HTMLDivElement>) {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp01((event.clientX - rect.left) / rect.width),
      y: clamp01((event.clientY - rect.top) / rect.height),
    };
  }

  function resetForm() {
    setEditingId(null);
    setText("");
    setTags("");
    setSeverity("question");
  }

  function arm(nextTool: Tool) {
    if (editingId) {
      setStatus("Save or cancel the edit first.");
      return;
    }
    setPanelOpen(true);
    setTool(nextTool);
    setStatus(
      nextTool === "comment"
        ? "Comment armed: click one place in the scene."
        : "Highlight armed: drag across the scene.",
    );
  }

  function addComment(event: PointerEvent<HTMLDivElement>) {
    const point = coords(event);
    setAnnotations((current) => [
      ...current,
      {
        id: nextId(current),
        kind: "comment",
        x: point.x,
        y: point.y,
        text: commentText,
        severity,
        tags: parseTags(tags),
      },
    ]);
    setTool(null);
    setStatus("Comment added. Choose Comment again to add another.");
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!armed || event.target !== overlayRef.current) return;
    if (tool === "comment") {
      addComment(event);
      return;
    }
    const point = coords(event);
    setDrag({ startX: point.x, startY: point.y, x: point.x, y: point.y });
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag || tool !== "highlight") return;
    const point = coords(event);
    setDrag((current) => (current ? { ...current, x: point.x, y: point.y } : null));
  }

  function pointerUp() {
    if (!drag || tool !== "highlight") return;
    const left = Math.min(drag.startX, drag.x);
    const top = Math.min(drag.startY, drag.y);
    let width = Math.abs(drag.x - drag.startX);
    let height = Math.abs(drag.y - drag.startY);
    let x = left;
    let y = top;

    if (width < 0.02 || height < 0.02) {
      width = 0.16;
      height = 0.1;
      x = clamp01(drag.startX - width / 2);
      y = clamp01(drag.startY - height / 2);
    }

    width = Math.min(width, 1 - x);
    height = Math.min(height, 1 - y);
    setAnnotations((current) => [
      ...current,
      {
        id: nextId(current),
        kind: "highlight",
        x,
        y,
        w: width,
        h: height,
        text: commentText,
        severity,
        tags: parseTags(tags),
      },
    ]);
    setDrag(null);
    setTool(null);
    setStatus("Highlight added. Choose Highlight again to add another.");
  }

  async function sendToAgent() {
    if (annotations.length === 0) {
      setStatus("Add an annotation first.");
      return;
    }
    localStorage.setItem(`explanimate:${sceneId}:agent-payload`, payloadText);
    try {
      await navigator.clipboard.writeText(payloadText);
      setStatus("Agent payload copied.");
    } catch {
      setStatus("Agent payload ready.");
    }
  }

  function replay() {
    setTool(null);
    onReplay();
    setStatus("Animation replayed.");
  }

  function startEdit(item: SceneAnnotation) {
    setPanelOpen(true);
    setTool(null);
    setEditingId(item.id);
    setText(item.text);
    setSeverity(item.severity);
    setTags(item.tags.join(" "));
    setStatus(`Editing ${item.id}.`);
  }

  function cancelEdit() {
    resetForm();
    setStatus("Edit canceled.");
  }

  function saveEdit() {
    if (!editingAnnotation) return;
    setAnnotations((current) =>
      current.map((item) =>
        item.id === editingAnnotation.id
          ? {
              ...item,
              text: commentText,
              severity,
              tags: parseTags(tags),
            }
          : item,
      ),
    );
    const savedId = editingAnnotation.id;
    resetForm();
    setStatus(`${savedId} updated.`);
  }

  function removeAnnotation(id: string) {
    setAnnotations((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setStatus(`${id} removed.`);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40" data-scene-annotation-ui data-scene-mode={tool ?? "idle"}>
      <div
        ref={overlayRef}
        data-scene-capture
        className={`absolute inset-0 ${armed ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"}`}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
      >
        {annotations.map((item) =>
          item.kind === "highlight" ? (
            <div
              key={item.id}
              data-scene-highlight
              className="absolute rounded-[8px] border-2 border-amber-500 bg-amber-300/20 shadow-[0_0_0_1px_rgba(255,255,255,0.85)]"
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                width: `${item.w * 100}%`,
                height: `${item.h * 100}%`,
              }}
            >
              <span className="absolute -top-3 -left-3 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {item.id}
              </span>
            </div>
          ) : (
            <div
              key={item.id}
              data-scene-comment
              className="absolute max-w-[220px] -translate-x-1/2 -translate-y-full rounded-[8px] border border-accent bg-surface px-2.5 py-1.5 text-[12px] text-ink shadow-sm"
              style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
            >
              <div className="font-mono text-[10px] text-accent">{item.id}</div>
              <div className="truncate">{item.text}</div>
            </div>
          ),
        )}
        {drag ? (
          <div
            data-scene-draft-highlight
            className="absolute rounded-[8px] border-2 border-dashed border-amber-500 bg-amber-300/10"
            style={{
              left: `${Math.min(drag.startX, drag.x) * 100}%`,
              top: `${Math.min(drag.startY, drag.y) * 100}%`,
              width: `${Math.abs(drag.x - drag.startX) * 100}%`,
              height: `${Math.abs(drag.y - drag.startY) * 100}%`,
            }}
          />
        ) : null}
      </div>

      {panelOpen ? (
        <aside
          data-scene-panel
          className="pointer-events-auto fixed top-4 right-4 bottom-20 flex w-[336px] flex-col gap-3 overflow-auto rounded-[8px] border border-line bg-surface p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[14px] font-semibold text-ink">Feedback</div>
              <div className="mt-1 text-[12px] text-muted">{status}</div>
            </div>
            <button
              className="rounded-[6px] border border-line px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setTool(null);
              }}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium ${tool === "comment" ? "bg-accent text-white" : "border border-line text-muted hover:text-ink"}`}
              type="button"
              data-scene-arm-comment
              onClick={() => arm("comment")}
            >
              Comment
            </button>
            <button
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium ${tool === "highlight" ? "bg-accent text-white" : "border border-line text-muted hover:text-ink"}`}
              type="button"
              data-scene-arm-highlight
              onClick={() => arm("highlight")}
            >
              Highlight
            </button>
          </div>

          <textarea
            className="min-h-[76px] resize-none rounded-[6px] border border-line px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Comment for the selected area"
          />
          {editingId ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-[6px] bg-accent px-3 py-1.5 text-[12px] font-medium text-white"
                type="button"
                data-scene-save-edit
                onClick={saveEdit}
              >
                Save edit
              </button>
              <button
                className="rounded-[6px] border border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink"
                type="button"
                data-scene-cancel-edit
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-[1fr_1.1fr] gap-2">
            <select
              className="rounded-[6px] border border-line px-2 py-1.5 text-[12px] text-ink"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
            >
              <option value="question">Question</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="blocker">Blocker</option>
            </select>
            <input
              className="rounded-[6px] border border-line px-2 py-1.5 text-[12px] text-ink"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Tags"
            />
          </div>

          <div className="space-y-2">
            {annotations.map((item) => (
              <div
                key={item.id}
                className={`rounded-[6px] border px-2.5 py-2 ${item.id === editingId ? "border-accent bg-canvas" : "border-line"}`}
                data-scene-annotation-card={item.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-accent">{item.id}</span>
                  <span className="text-[11px] text-faint">{item.kind}</span>
                </div>
                <div className="mt-1 truncate text-[12px] text-ink">{item.text}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded-[6px] border border-line px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
                    type="button"
                    data-scene-edit
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-[6px] border border-line px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
                    type="button"
                    data-scene-remove
                    onClick={() => removeAnnotation(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <button
              className="rounded-[6px] border border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:text-ink"
              type="button"
              data-scene-replay
              onClick={replay}
            >
              Replay
            </button>
            <button
              className="rounded-[6px] bg-ink px-3 py-1.5 text-[12px] font-medium text-white"
              type="button"
              data-scene-send-agent
              onClick={sendToAgent}
            >
              Send to agent
            </button>
          </div>

          <pre
            data-scene-payload
            className="max-h-[140px] overflow-auto rounded-[6px] bg-ink p-2 font-mono text-[10px] whitespace-pre-wrap text-evidence-text"
          >
            {annotations.length ? JSON.stringify(payloadFor(sceneId, annotations), null, 2) : status}
          </pre>
        </aside>
      ) : null}

      <div className="pointer-events-auto fixed right-4 bottom-4 flex items-center gap-2">
        <button
          className="rounded-[8px] border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-sm hover:border-accent"
          type="button"
          data-scene-replay-inline
          onClick={replay}
        >
          Replay
        </button>
        <button
          className="rounded-[8px] border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-sm hover:border-accent"
          type="button"
          data-scene-feedback-toggle
          onClick={() => setPanelOpen((open) => !open)}
        >
          Feedback {annotations.length ? `(${annotations.length})` : ""}
        </button>
      </div>
    </div>
  );
}
