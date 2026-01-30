import type { CaptionPageOptions } from "./types.js";

/**
 * Generate the HTML for the caption display page.
 * Single-file page: works great for QR-code usage.
 * Mobile-first: big type, dark background, tap size, autoscroll.
 */
export function captionPageHtml(options: CaptionPageOptions = {}): string {
  const { title = "Live Captions" } = options;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0b0c;
      --fg: #f4f4f5;
      --muted: #a1a1aa;
      --card: rgba(255,255,255,0.06);
      --border: rgba(255,255,255,0.10);
    }
    html, body {
      height: 100%;
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    .wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    header {
      padding: 14px 14px 10px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 6px;
    }
    .status {
      font-size: 12px;
      color: var(--muted);
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .pill {
      padding: 3px 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
    }
    main {
      flex: 1;
      overflow: auto;
      padding: 14px;
    }
    .hint {
      color: var(--muted);
      font-size: 12px;
      margin: 0 0 10px;
    }
    .line {
      font-size: var(--fontSize, 28px);
      line-height: 1.25;
      padding: 10px 12px;
      margin: 0 0 10px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }
    button {
      appearance: none;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.06);
      color: var(--fg);
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 13px;
      cursor: pointer;
    }
    button:active { transform: translateY(1px); }
    footer {
      padding: 10px 14px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="title">${escapeHtml(title)}</div>
      <div class="status">
        <span class="pill" id="conn">Connecting…</span>
        <span class="pill" id="lat">—</span>
        <span class="pill" id="mode">Final-only</span>
      </div>
      <div class="controls">
        <button id="bigger" type="button">A+</button>
        <button id="smaller" type="button">A−</button>
        <button id="clear" type="button">Clear</button>
        <button id="pause" type="button">Pause</button>
      </div>
    </header>

    <main id="scroll">
      <div class="hint">If captions stop, refresh this page. (Wi-Fi can be flaky.)</div>
      <div id="lines"></div>
    </main>

    <footer>
      Tip: add this page to your Home Screen for one-tap access.
    </footer>
  </div>

<script>
(() => {
  const connEl = document.getElementById("conn");
  const latEl = document.getElementById("lat");
  const linesEl = document.getElementById("lines");
  const scrollEl = document.getElementById("scroll");

  const biggerBtn = document.getElementById("bigger");
  const smallerBtn = document.getElementById("smaller");
  const clearBtn = document.getElementById("clear");
  const pauseBtn = document.getElementById("pause");

  const sizes = [22, 26, 30, 36, 42];
  let sizeIdx = 2;
  let paused = false;

  function applySize() {
    document.documentElement.style.setProperty("--fontSize", sizes[sizeIdx] + "px");
  }
  applySize();

  biggerBtn.onclick = () => { sizeIdx = Math.min(sizes.length - 1, sizeIdx + 1); applySize(); };
  smallerBtn.onclick = () => { sizeIdx = Math.max(0, sizeIdx - 1); applySize(); };
  clearBtn.onclick = () => { linesEl.innerHTML = ""; };
  pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
    pauseBtn.style.opacity = paused ? "0.8" : "1";
  };

  function addLine(text) {
    if (paused) return;
    const div = document.createElement("div");
    div.className = "line";
    div.textContent = text;
    linesEl.appendChild(div);
    // autoscroll to bottom
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  function setConn(text) { connEl.textContent = text; }

  function wsUrl() {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    return proto + "//" + location.host + "/";
  }

  let ws;
  let lastPingAt = 0;

  function connect() {
    setConn("Connecting…");
    ws = new WebSocket(wsUrl());

    ws.onopen = () => {
      setConn("Connected");
      latEl.textContent = "live";
      lastPingAt = Date.now();
    };

    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      if (msg.type === "snapshot" && Array.isArray(msg.segments)) {
        // Render snapshot
        linesEl.innerHTML = "";
        for (const s of msg.segments) {
          if (s && typeof s.text === "string") addLine(s.text);
        }
        return;
      }

      if (msg.type === "final" && typeof msg.text === "string") {
        addLine(msg.text);
        return;
      }

      if (msg.type === "producer_error") {
        // Show errors quietly (optional)
        // addLine("[error] " + msg.detail);
        return;
      }

      if (msg.type === "producer_status") {
        // ignore or display if you want
        return;
      }
    };

    ws.onclose = () => {
      setConn("Disconnected — retrying…");
      latEl.textContent = "—";
      setTimeout(connect, 1000);
    };

    ws.onerror = () => {
      // Let onclose handle retry
    };
  }

  connect();
})();
</script>
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
