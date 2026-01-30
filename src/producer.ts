import { spawn, type ChildProcess } from "node:child_process";
import readline from "node:readline";
import type { ServerConfig, ProducerEvent, Segment, WebSocketMessage } from "./types.js";

export interface ProducerState {
  ring: Segment[];
  lastStreamId: string | null;
}

export interface ProducerCallbacks {
  onBroadcast: (message: WebSocketMessage) => void;
  onRingUpdate: (ring: Segment[]) => void;
}

/**
 * Start the Swift producer process and handle NDJSON output.
 */
export function startProducer(
  config: ServerConfig,
  state: ProducerState,
  callbacks: ProducerCallbacks
): ChildProcess {
  const { swiftCmd, swiftArgs, swiftCwd, maxSegments } = config;
  const { onBroadcast, onRingUpdate } = callbacks;

  console.log(`[producer] starting: ${swiftCmd} ${swiftArgs.join(" ")} (cwd=${swiftCwd})`);

  const child = spawn(swiftCmd, swiftArgs, {
    cwd: swiftCwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  child.on("exit", (code, sig) => {
    console.error(`[producer] exited code=${code} sig=${sig}`);
    onBroadcast({
      type: "status",
      at: Date.now(),
      detail: "producer_exited",
      code,
      sig,
    });
    // Restart after delay
    setTimeout(() => {
      startProducer(config, state, callbacks);
    }, 1000);
  });

  child.stderr?.on("data", (data: Buffer) => {
    const str = data.toString("utf8");
    console.error(`[producer:stderr] ${str.trimEnd()}`);
  });

  if (!child.stdout) {
    console.error("[producer] No stdout available");
    return child;
  }

  const rl = readline.createInterface({ input: child.stdout });

  rl.on("line", (line: string) => {
    let evt: ProducerEvent;
    try {
      evt = JSON.parse(line) as ProducerEvent;
    } catch {
      console.error(`[producer] bad JSON: ${line}`);
      return;
    }

    // Detect producer restarts
    if (evt.streamId && state.lastStreamId && evt.streamId !== state.lastStreamId) {
      state.ring = [];
      onRingUpdate(state.ring);
      onBroadcast({ type: "status", at: Date.now(), detail: "producer_restarted" });
    }
    if (evt.streamId) {
      state.lastStreamId = evt.streamId;
    }

    // Forward status/errors to clients (optional)
    if (evt.kind === "status" && "detail" in evt) {
      const { detail, ...rest } = evt;
      onBroadcast({
        type: "producer_status",
        at: Date.now(),
        detail,
        ...rest,
      });
      return;
    }

    if (evt.kind === "error" && "detail" in evt) {
      const { detail, ...rest } = evt;
      onBroadcast({
        type: "producer_error",
        at: Date.now(),
        detail,
        ...rest,
      });
      return;
    }

    // Final segments
    if (evt.kind === "final" && "text" in evt && typeof evt.text === "string") {
      const segment: Segment = {
        v: evt.v,
        kind: evt.kind,
        streamId: evt.streamId,
        seq: evt.seq,
        ts: evt.ts,
        text: evt.text,
      };

      state.ring.push(segment);
      if (state.ring.length > maxSegments) {
        state.ring.splice(0, state.ring.length - maxSegments);
      }
      onRingUpdate(state.ring);

      onBroadcast({
        type: "final",
        at: Date.now(),
        ts: evt.ts,
        seq: evt.seq,
        text: evt.text,
      });
    }
  });

  return child;
}
