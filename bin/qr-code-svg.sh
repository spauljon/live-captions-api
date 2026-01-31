#!/usr/bin/env bash

node -e "
import qrcode from 'qrcode';
import fs from 'fs';
const url='http://192.168.1.71:8080/';
const svg=await qrcode.toString(url,{type:'svg',margin:2});
fs.writeFileSync('captions-qr.svg',svg);
console.log('Wrote captions-qr.svg');
"
