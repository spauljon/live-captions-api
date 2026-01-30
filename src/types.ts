import type { WebSocket } from "ws";

// ---- Producer Event Types (from Swift CLI) ----

export interface BaseProducerEvent {
  v: number;
  kind: string;
  streamId?: string;
  seq?: number;
  ts?: number;
}

export interface FinalEvent extends BaseProducerEvent {
  kind: "final";
  text: string;
}

export interface StatusEvent extends BaseProducerEvent {
  kind: "status";
  detail: string;
}

export interface ErrorEvent extends BaseProducerEvent {
  kind: "error";
  detail: string;
}

export type ProducerEvent = FinalEvent | StatusEvent | ErrorEvent | BaseProducerEvent;

// ---- Ring Buffer Segment ----

export interface Segment {
  v: number;
  kind: string;
  streamId?: string;
  seq?: number;
  ts?: number;
  text?: string;
  detail?: string;
}

// ---- WebSocket Messages (Server → Client) ----

export interface SnapshotMessage {
  type: "snapshot";
  at: number;
  segments: Array<{
    ts?: number;
    seq?: number;
    text?: string;
  }>;
}

export interface StatusMessage {
  type: "status";
  at: number;
  detail: string;
  clientId?: string;
  code?: number | null;
  sig?: NodeJS.Signals | null;
}

export interface FinalMessage {
  type: "final";
  at: number;
  ts?: number;
  seq?: number;
  text: string;
}

export interface ProducerStatusMessage {
  type: "producer_status";
  at: number;
  detail: string;
  [key: string]: unknown;
}

export interface ProducerErrorMessage {
  type: "producer_error";
  at: number;
  detail: string;
  [key: string]: unknown;
}

export type WebSocketMessage =
  | SnapshotMessage
  | StatusMessage
  | FinalMessage
  | ProducerStatusMessage
  | ProducerErrorMessage;

// ---- Extended WebSocket with custom properties ----

export interface ExtendedWebSocket extends WebSocket {
  _clientId?: string;
  _connectedAt?: number;
}

// ---- Config ----

export interface ServerConfig {
  port: number;
  swiftCwd: string;
  swiftCmd: string;
  swiftArgs: string[];
  maxSegments: number;
}

// ---- Caption Page Options ----

export interface CaptionPageOptions {
  title?: string;
}
