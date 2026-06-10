<!-- ABOUTME: Defines the build-log protocol — how every prompt, decision, and action on this repo is recorded. -->
<!-- ABOUTME: Append-only; the record of WHY the skill is shaped the way it is. -->

# Build Log

This directory is the **append-only record of how this skill was built** — every prompt the human
gave, every decision taken, every architectural choice and its rationale. We over-document on
purpose: the rationale strings are what future maintainers (human or agent) need most.

## Files

| File                 | Format     | Purpose                                                             |
| -------------------- | ---------- | ------------------------------------------------------------------- |
| `sessions.jsonl`     | JSON Lines | Machine-readable, append-only event stream. One JSON object / line. |
| `NNNN-session-DD.md` | Markdown   | Human narrative for a working session — the story + reasoning.      |

## The event stream: `sessions.jsonl`

One JSON object per line. Append only — never edit past lines. Schema:

```jsonc
{
  "seq": 1, // monotonic integer, never reused
  "ts": "2026-06-10T00:00:00Z", // ISO-8601 UTC
  "session": "2026-06-10-01", // groups events
  "actor": "user" | "assistant" | "system",
  "type": "prompt" | "decision" | "question" | "research" | "action" | "review" | "note",
  "summary": "one-line gist",
  "prompt_verbatim": "...", // REQUIRED when actor=user,type=prompt — copy EXACTLY, typos and all
  "decision": "...", // what was chosen (type=decision)
  "options": ["...", "..."], // alternatives considered (type=decision/question)
  "rationale": "...", // WHY — the part future maintainers need most
  "artifacts": ["path", "..."], // files created/changed
  "tags": ["skill", "remotion"] // free-form, for later grouping
}
```

### Rules

1. **Record the prompt verbatim.** Do not clean up the user's wording. Put it in `prompt_verbatim`.
2. **Every decision records its `rationale` and the `options` not taken.**
3. **Append, never rewrite.** Corrections are new `type:"note"` events.
4. **`seq` is monotonic** and globally unique across all sessions.
5. Each working session also gets a Markdown narrative (`NNNN-session-DD.md`).
