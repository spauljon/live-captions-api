# Church Captions

Real-time live captions for church services, designed for hearing-impaired congregants to access on their own mobile devices via a QR code.

This system runs entirely on your local network:
- No cloud services
- No accounts
- No audio leaves the building

---

## Overview

System architecture:

    [ Microphone ]
          ↓
    [ Swift CLI (speech → text) ]
          ↓   (NDJSON over stdout)
    [ Node.js server (broker) ]
          ↓   (WebSockets)
    [ Mobile web clients (phones) ]

Congregants scan a QR code, open a web page, and see live captions as the service proceeds.

---

## Components

### 1. Swift Caption Producer (live-captions-cli)

Responsibilities:
- Capture microphone audio
- Transcribe speech using Apple Speech
- Emit final-only caption segments
- Write output as newline-delimited JSON (NDJSON) to stdout
- Act as a pure producer (no UI, no networking, no windowing)

Example output event (one line):

    {
      "v": 1,
      "kind": "final",
      "streamId": "UUID",
      "seq": 42,
      "ts": 1769784484835,
      "text": "Where is the lazy dog?"
    }

---

### 2. Node.js Server (church-captions)

Responsibilities:
- Spawn the Swift caption producer
- Read NDJSON from stdout
- Maintain a rolling in-memory buffer of recent caption segments
- Serve:
   - A mobile-friendly caption web page
   - A WebSocket endpoint for live updates

The server acts as a broker only; no database is required.

---

### 3. Mobile Caption Page

Characteristics:
- Accessible via a simple URL (shared by QR code)
- Optimized for phones:
   - Large, readable text
   - High contrast / dark mode
   - Automatic scrolling
- User controls:
   - Increase / decrease font size
   - Pause / resume updates
   - Clear captions

No app installation required.

---

## Requirements

### Swift side
- macOS (Apple Silicon or Intel)
- Xcode or Command Line Tools
- Microphone access
- Speech Recognition permission

### Node side
- Node.js 18 or newer
- npm

All devices (server and phones) must be on the same Wi-Fi network.

---

## Installation

### Swift caption producer

From the live-captions-cli directory:

    swift build -c release

On first run, grant permissions for:
- Microphone
- Speech Recognition

---

### Node server

From the church-captions directory:

    npm install

Ensure package.json includes:

    {
      "type": "module"
    }

---

## Running the System

Start the server:

    node server.js

Expected startup output:

    captions server listening on:
      local: http://localhost:8080/
      lan  : http://192.168.1.71:8080/
    ws endpoint: ws://192.168.1.71:8080/

The server automatically spawns the Swift caption producer.

---

## Accessing Captions

On a phone connected to the same Wi-Fi network, open:

    http://192.168.1.71:8080/

---

## QR Code

Generate a QR code pointing to:

    http://192.168.1.71:8080/

Recommended formats:
- SVG for printing (bulletins, posters)
- PNG for screens (slides, projector)

Suggested text to print alongside the QR code:

    Live captions available
    Scan this code to view real-time captions on your phone
    (No app required)

---

## Operational Notes

- This system is intentionally local-network only.
- The server machine should:
   - Remain powered on
   - Stay connected to the same Wi-Fi network
   - Ideally have a reserved LAN IP via DHCP

If Wi-Fi is unstable, users can refresh the page to reconnect.

---

## Design Philosophy

- Accessibility first
- Minimal moving parts
- Clear separation of responsibilities
- Producers emit data; consumers decide presentation
- Everything debuggable with simple tools (stdout, browser dev tools)

---

## Future Enhancements (Optional)

- Per-client reconnect / resume
- Multiple rooms (sanctuary, overflow)
- Persistent caption archives
- Language selection
- External display support

None of these are required for the system to be immediately useful.

---

## License

MIT

---

## Acknowledgements

Built to support accessibility in live worship settings using:
- Apple Speech framework
- Node.js
- WebSockets
- Standard web technologies