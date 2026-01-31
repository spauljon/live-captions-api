#!/usr/bin/env bash

node -e "
import qrcode from 'qrcode';
const url='http://192.168.1.71:8080/';
await qrcode.toFile('captions-qr.png',url,{margin:2,scale:10});
console.log('Wrote captions-qr.png');
"
