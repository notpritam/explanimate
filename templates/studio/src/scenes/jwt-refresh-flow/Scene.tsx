// ABOUTME: Scene explaining silent JWT refresh — short-lived access tokens vs one long-lived, rotating refresh token.
// ABOUTME: Patterns: lifetime-comparison bars (hero) + multi-zoom into one expiry + assembly-line exchange + evidence artifact.

import { Stage, Node, Edge, Label, Dot, Reveal, theme, nodeColors } from "../../shared/primitives";

const ACCESS = nodeColors.start; // green = a live access token
const REFRESH = nodeColors.data; // violet = the long-lived refresh token
const AMBER = nodeColors.decision.stroke; // a rotation event

// Lifetime track geometry — the access token's life is sliced into equal cells.
const TRACK_X = 300;
const TRACK_W = 916;
const CELLS = 6;
const GAP = 12;
const CELL_W = (TRACK_W - GAP * (CELLS - 1)) / CELLS;
const cellLeft = (i: number) => TRACK_X + i * (CELL_W + GAP);
const dividers = Array.from({ length: CELLS - 1 }, (_, i) => cellLeft(i) + CELL_W + GAP / 2);

const ACCESS_Y = 178;
const REFRESH_Y = 220;
const FOCUS = 2; // the access token we zoom into
const focusX = cellLeft(FOCUS) + CELL_W / 2;

// Past = solid, the focus cell = amber "expiring now", future cells = faint "not yet".
const cellStyle = (i: number) =>
  i === FOCUS
    ? { fill: nodeColors.decision.fill, stroke: AMBER, opacity: 1 }
    : { fill: ACCESS.fill, stroke: ACCESS.stroke, opacity: i > FOCUS ? 0.4 : 1 };

export default function Scene() {
  return (
    <Stage w={1280} h={720} grid>
      <Label x={64} y={40} level="title" delay={0}>
        Silent token refresh
      </Label>
      <Label x={64} y={86} level="caption" delay={0.1}>
        the access token expires every few minutes — the refresh token quietly mints a new one, and the user never logs
        in again
      </Label>

      {/* ── Section A: the hero argument — two tokens, same window, very different cadence ── */}
      <Label x={64} y={140} level="section" delay={0.05}>
        token lifetimes
      </Label>

      <Label x={64} y={ACCESS_Y - 4} level="body" color={ACCESS.text} delay={0.4}>
        access token
      </Label>
      <Label x={64} y={ACCESS_Y + 18} level="caption" delay={0.45}>
        ~15 min · Bearer, every request
      </Label>
      <Label x={64} y={REFRESH_Y - 2} level="body" color={REFRESH.text} delay={0.5}>
        refresh token
      </Label>
      <Label x={64} y={REFRESH_Y + 18} level="caption" delay={0.55}>
        30 days · one use, then rotates
      </Label>

      {/* the long refresh bar underlies many short access lives */}
      <div className="absolute" style={{ left: TRACK_X, top: REFRESH_Y }}>
        <Reveal delay={0.3}>
          <div
            style={{
              width: TRACK_W,
              height: 16,
              borderRadius: 8,
              background: REFRESH.fill,
              border: `1.5px solid ${REFRESH.stroke}`,
            }}
          />
        </Reveal>
      </div>

      {/* access token, sliced into equal lives */}
      {Array.from({ length: CELLS }, (_, i) => {
        const s = cellStyle(i);
        return (
          <div key={i} className="absolute" style={{ left: cellLeft(i), top: ACCESS_Y }}>
            <Reveal delay={0.35 + i * 0.07}>
              <div
                style={{
                  width: CELL_W,
                  height: 28,
                  borderRadius: 7,
                  background: s.fill,
                  border: `1.5px solid ${s.stroke}`,
                  opacity: s.opacity,
                }}
              />
            </Reveal>
          </div>
        );
      })}

      {/* rotation ticks: every access expiry is also a refresh-token rotation */}
      {dividers.map((dx, i) => (
        <div key={i} className="absolute" style={{ left: dx - 1, top: ACCESS_Y - 6 }}>
          <Reveal delay={0.6 + i * 0.05}>
            <div style={{ width: 2, height: REFRESH_Y + 16 - (ACCESS_Y - 6), background: AMBER, opacity: 0.4 }} />
          </Reveal>
        </div>
      ))}
      {dividers.map((dx, i) => (
        <Dot key={i} x={dx} y={ACCESS_Y - 6} r={3} color={AMBER} delay={0.6 + i * 0.05} />
      ))}

      <Label x={focusX} y={ACCESS_Y - 30} level="caption" align="center" color={AMBER} delay={0.8}>
        expires now ↓
      </Label>
      <Label x={1216} y={REFRESH_Y + 34} level="caption" align="right" delay={0.7}>
        ↻ rotation — old refresh token dies, a new one is issued
      </Label>

      {/* ── multi-zoom: drop from the expiring access token into one real exchange ── */}
      <Edge from={{ x: focusX, y: ACCESS_Y + 30 }} to={{ x: 455, y: 414 }} dashed width={1} arrow />

      {/* ── Section B: one expiry, up close — the assembly-line exchange ── */}
      <Label x={64} y={360} level="section" delay={0.85}>
        one expiry, up close
      </Label>

      <Node x={64} y={430} w={170} h={86} kind="start" title="App" sub="holds both tokens" enter="rise" delay={0.9} />
      <Edge from={{ x: 234, y: 473 }} to={{ x: 330, y: 473 }} label="GET /orders" enter="draw" delay={1.0} />
      <Node
        x={330}
        y={430}
        w={210}
        h={86}
        kind="danger"
        title="401"
        sub="access token expired"
        enter="rise"
        delay={1.05}
      />
      <Edge
        from={{ x: 540, y: 473 }}
        to={{ x: 636, y: 473 }}
        label="refresh"
        color={theme.accent}
        width={2.5}
        enter="draw"
        delay={1.15}
      />
      <Node
        x={636}
        y={430}
        w={230}
        h={86}
        kind="process"
        title="Auth server"
        sub="verify + rotate"
        enter="rise"
        delay={1.2}
      />
      <Edge from={{ x: 866, y: 473 }} to={{ x: 962, y: 473 }} label="retry" enter="draw" delay={1.3} />
      <Node
        x={962}
        y={430}
        w={180}
        h={86}
        kind="end"
        title="200 OK"
        sub="user never noticed"
        enter="rise"
        delay={1.35}
      />

      {/* evidence: what actually comes back from /oauth/token */}
      <Edge from={{ x: 751, y: 516 }} to={{ x: 751, y: 556 }} dashed width={1} arrow={false} />
      <Node kind="evidence" x={560} y={556} w={540} h={94} title="200 · POST /oauth/token" delay={1.25}>
        <code>
          {`{ `}
          <span className="k">{`"access_token"`}</span>
          {`: `}
          <span className="v">{`"eyJhbGci…"`}</span>
          {`,`}
        </code>
        <code>
          {`  `}
          <span className="k">{`"refresh_token"`}</span>
          {`: `}
          <span className="v">{`"rt_a17f…"`}</span>
          {`,`}
          <span className="d">{`   // old one now invalid`}</span>
        </code>
        <code>
          {`  `}
          <span className="k">{`"expires_in"`}</span>
          {`: `}
          <span className="v">{`900`}</span>
          {` }`}
        </code>
      </Node>

      <Label x={64} y={566} level="body" color={theme.muted} maxW={460} delay={1.45}>
        The whole exchange happens between two API calls — no login screen, no user interaction.
      </Label>

      <Label x={1216} y={688} level="caption" align="right" delay={1.5}>
        explanimate · jwt refresh
      </Label>
    </Stage>
  );
}
