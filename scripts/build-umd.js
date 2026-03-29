const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Copy the UMD file into dist/
const src = path.join(__dirname, '..', 'dist', 'flexdate.umd.js');
console.log('dist/ ready.');
