const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE = 'c:\\basim\\eza auto';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Add CORS headers so fonts and assets load properly everywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    if (req.method === 'POST' && req.url.startsWith('/save-image')) {
        let body = '';
        const targetName = req.url.includes('name=') ? req.url.split('name=')[1].split('&')[0] : 'p16_villa_entrance.jpg';
        req.on('data', c => body += c);
        req.on('end', () => {
            const base64Data = body.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(path.join(BASE, targetName), Buffer.from(base64Data, 'base64'));
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK: ' + targetName);
        });
        return;
    }
    
    let safePath = req.url.split('?')[0];
    if (safePath === '/') safePath = '/index.html';
    
    const filePath = path.join(BASE, decodeURIComponent(safePath));
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
