import http from "node:http";
import crypto from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";

import { config } from "./config.js";
import { getLikelyLanIPv4, sendResponse } from "./utils.js";
import { captionPageHtml } from "./captionPage.js";
import { startProducer, type ProducerState } from "./producer.js";
import type { ExtendedWebSocket, WebSocketMessage, Segment } from "./types.js";

// ---- In-memory state ----
const state: ProducerState = {
  ring: [],
  lastStreamId: null,
};

// ---- HTTP Server ----
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname === "/" || url.pathname === "/captions") {
    return sendResponse(
      res,
      200,
      "text/html; charset=utf-8",
      captionPageHtml({ title: "Live Captions" })
    );
  }

  if (url.pathname === "/health") {
    return sendResponse(
      res,
      200,
      "application/json; charset=utf-8",
      JSON.stringify({
        ok: true,
        clients: wss.clients.size,
        segments: state.ring.length,
      })
    );
  }

  if (url.pathname === "/qr") {
    // Simple helper page for printing / sanity checking the URL.
    const host = req.headers.host ?? `${getLikelyLanIPv4()}:${config.port}`;
    const pageUrl = `http://${host}/`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Caption Link</title>
      <style>body{font-family:system-ui;margin:20px} code{background:#f3f3f3;padding:2px 6px;border-radius:6px}</style>
      </head><body>
      <h2>Caption page URL</h2>
      <p>Use this URL in your QR code:</p>
      <p><code>${pageUrl}</code></p>
      <p>(Next step: generate QR image for this URL.)</p>
      </body></html>`;
    return sendResponse(res, 200, "text/html; charset=utf-8", html);
  }

  return sendResponse(res, 404, "text/plain; charset=utf-8", "Not found");
});

// ---- WebSocket Server ----
const wss = new WebSocketServer({ server });

/**
 * Broadcast a message to all connected WebSocket clients.
 */
function broadcast(message: WebSocketMessage): void {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

/**
 * Create a snapshot of segments for sending to new clients.
 */
function createSnapshot(segments: Segment[]): Array<{ ts?: number; seq?: number; text?: string }> {
  return segments.map((s) => ({
    ts: s.ts,
    seq: s.seq,
    text: s.text,
  }));
}

wss.on("connection", (ws: ExtendedWebSocket) => {
  const clientId = crypto.randomUUID();
  ws._clientId = clientId;
  ws._connectedAt = Date.now();

  // Initial snapshot (tail)
  ws.send(
    JSON.stringify({
      type: "snapshot",
      at: Date.now(),
      segments: createSnapshot(state.ring),
    })
  );

  ws.send(
    JSON.stringify({
      type: "status",
      at: Date.now(),
      detail: "connected",
      clientId,
    })
  );
});

// ---- Start Producer ----
startProducer(config, state, {
  onBroadcast: broadcast,
  onRingUpdate: (ring) => {
    state.ring = ring;
  },
});

// ---- Start Server ----
server.listen(config.port, () => {
  const lan = getLikelyLanIPv4();
  console.log(`captions server listening on:`);
  console.log(`  local: http://localhost:${config.port}/`);
  console.log(`  lan  : http://${lan}:${config.port}/   (use this for QR codes on church Wi-Fi)`);
  console.log(`ws endpoint: ws://${lan}:${config.port}/`);
});
