import type { ServerConfig } from "./types.js";

function parseJsonArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item): item is string => typeof item === "string")) {
      return parsed;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): ServerConfig {
  return {
    port: parseNumber(process.env["PORT"], 8080),
    swiftCwd: process.env["SWIFT_CWD"] ?? "/Users/paul/repositories/live-captions-cli",
    swiftCmd: process.env["SWIFT_CMD"] ?? "swift",
    swiftArgs: parseJsonArray(process.env["SWIFT_ARGS"], ["run", "-c", "release"]),
    maxSegments: parseNumber(process.env["MAX_SEGMENTS"], 200),
  };
}

export const config = loadConfig();
