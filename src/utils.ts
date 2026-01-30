import http from "node:http";
import os from "node:os";

/**
 * Get the most likely LAN IPv4 address for the machine.
 * Useful for displaying URLs that other devices on the network can reach.
 */
export function getLikelyLanIPv4(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const ifaceList = ifaces[name];
    if (!ifaceList) continue;
    for (const info of ifaceList) {
      if (info.family === "IPv4" && !info.internal) {
        return info.address;
      }
    }
  }
  return "localhost";
}

/**
 * Send an HTTP response with standard headers.
 */
export function sendResponse(
  res: http.ServerResponse,
  status: number,
  contentType: string,
  body: string
): void {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(body);
}
