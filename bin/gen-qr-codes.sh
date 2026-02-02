#!/usr/bin/env bash

# Usage: ./generate-qr.sh [url] [filename]
# Generates both PNG and SVG

URL="${1:-http://192.168.1.71:8080/}"
NAME="${2:-captions-qr-home}"

node -e "
import qrcode from 'qrcode';
import fs from 'fs';

const url = '$URL';
const name = '$NAME';

// PNG
await qrcode.toFile(name + '.png', url, { margin: 2, scale: 10 });
console.log('Wrote ' + name + '.png');

// SVG
const svg = await qrcode.toString(url, { type: 'svg', margin: 2 });
fs.writeFileSync(name + '.svg', svg);
console.log('Wrote ' + name + '.svg');
"
