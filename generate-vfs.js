const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'fonts');
const outputFile = path.join(__dirname, 'dist/vfs_fonts.js');

const vfs = {};
const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.ttf'));

fontFiles.forEach(file => {
    const filePath = path.join(fontsDir, file);
    const fontData = fs.readFileSync(filePath).toString('base64');
    vfs[file] = fontData;
});

const vfsContent = `var pdfMake = pdfMake || {}; pdfMake.vfs = ${JSON.stringify(vfs)};`;
fs.writeFileSync(outputFile, vfsContent, 'utf8');
console.log('vfs_fonts.js успешно сгенерирован.');