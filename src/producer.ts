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

// ---- Parsing ----

function parseEvent(line: string): ProducerEvent | null {
  try {
    return JSON.parse(line) as ProducerEvent;
  } catch {
    console.error(`[producer] bad JSON: ${line}`);
    return null;
  }
}

// ---- Stream ID tracking ----

function handleStreamIdChange(
  evt: ProducerEvent,
  state: ProducerState,
  callbacks: ProducerCallbacks
): void {
  if (evt.streamId && state.lastStreamId && evt.streamId !== state.lastStreamId) {
    state.ring = [];
    callbacks.onRingUpdate(state.ring);
    callbacks.onBroadcast({ type: "status", at: Date.now(), detail: "producer_restarted" });
  }
  if (evt.streamId) {
    state.lastStreamId = evt.streamId;
  }
}

// ---- Event handlers by kind ----

function handleStatusEvent(evt: ProducerEvent, onBroadcast: ProducerCallbacks["onBroadcast"]): boolean {
  if (evt.kind === "status" && "detail" in evt) {
    const { detail, ...rest } = evt;
    onBroadcast({ type: "producer_status", at: Date.now(), detail, ...rest });
    return true;
  }
  return false;
}

function handleErrorEvent(evt: ProducerEvent, onBroadcast: ProducerCallbacks["onBroadcast"]): boolean {
  if (evt.kind === "error" && "detail" in evt) {
    const { detail, ...rest } = evt;
    onBroadcast({ type: "producer_error", at: Date.now(), detail, ...rest });
    return true;
  }
  return false;
}

function handleFinalEvent(
  evt: ProducerEvent,
  state: ProducerState,
  maxSegments: number,
  callbacks: ProducerCallbacks
): void {
  if (evt.kind !== "final" || !("text" in evt)) {
    return;
  }

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
  callbacks.onRingUpdate(state.ring);

  callbacks.onBroadcast({
    type: "final",
    at: Date.now(),
    ts: evt.ts,
    seq: evt.seq,
    text: evt.text,
  });
}

// ---- Line processing ----

function processLine(
  line: string,
  state: ProducerState,
  maxSegments: number,
  callbacks: ProducerCallbacks
): void {
  const evt = parseEvent(line);
  if (!evt) return;

  handleStreamIdChange(evt, state, callbacks);

  if (handleStatusEvent(evt, callbacks.onBroadcast)) return;
  if (handleErrorEvent(evt, callbacks.onBroadcast)) return;

  handleFinalEvent(evt, state, maxSegments, callbacks);
}

// ---- Process lifecycle ----

function setupExitHandler(
  child: ChildProcess,
  config: ServerConfig,
  state: ProducerState,
  callbacks: ProducerCallbacks
): void {
  child.on("exit", (code, sig) => {
    console.error(`[producer] exited code=${code} sig=${sig}`);
    callbacks.onBroadcast({
      type: "status",
      at: Date.now(),
      detail: "producer_exited",
      code,
      sig,
    });
    setTimeout(() => startProducer(config, state, callbacks), 1000);
  });
}

function setupStderrHandler(child: ChildProcess): void {
  child.stderr?.on("data", (data: Buffer) => {
    console.error(`[producer:stderr] ${data.toString("utf8").trimEnd()}`);
  });
}

function setupStdoutHandler(
  child: ChildProcess,
  state: ProducerState,
  maxSegments: number,
  callbacks: ProducerCallbacks
): void {
  if (!child.stdout) {
    console.error("[producer] No stdout available");
    return;
  }

  const rl = readline.createInterface({ input: child.stdout });
  rl.on("line", (line) => processLine(line, state, maxSegments, callbacks));
}

// ---- Main entry point ----

export function startProducer(
  config: ServerConfig,
  state: ProducerState,
  callbacks: ProducerCallbacks
): ChildProcess {
  const { swiftCmd, swiftArgs, swiftCwd, maxSegments } = config;

  console.log(`[producer] starting: ${swiftCmd} ${swiftArgs.join(" ")} (cwd=${swiftCwd})`);

  const child = spawn(swiftCmd, swiftArgs, {
    cwd: swiftCwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  setupExitHandler(child, config, state, callbacks);
  setupStderrHandler(child);
  setupStdoutHandler(child, state, maxSegments, callbacks);

  return child;
}
