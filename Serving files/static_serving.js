const http = require('http');
const fs = require('fs');
const path = require('path');

function serveStaticFile(res, filepath, contentType, responseCode = 200) {
    fs.readFile(filepath, (err, data) => {
        if (err) {
            const statusCode = err.code === 'ENOENT' ? 404 : 500;
            res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
            res.end(statusCode === 404 ? '404 Not Found' : '500 Internal Server Error');
            if (statusCode === 500) {
                console.error(err);  // Log the specific error to the console for internal errors
            }
        } else {
            res.writeHead(responseCode, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Using an object to map file extensions to MIME types
const mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    const defaultFile = 'index.html';
    const baseDir = path.join(__dirname, 'public');
    let safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    let filepath = path.join(baseDir, safeSuffix);

    if (req.url === '/' || !path.extname(req.url)) {
        filepath = path.join(baseDir, safeSuffix, defaultFile);
    }

    const extname = path.extname(filepath);
    const contentType = mimeType[extname] || 'text/plain';

    serveStaticFile(res, filepath, contentType);
});

const PORT = 3200;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
