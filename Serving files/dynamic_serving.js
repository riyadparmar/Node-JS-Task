const http = require("http");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const PORT = 3100;

const mimeType = {
    '.html': 'text/html',
    '.ejs': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
    console.log("Request URL:", req.url); // Log the requested URL

    let filePath = path.join(__dirname, "views", req.url);
    if (req.url === "/") {
        filePath = path.join(__dirname, "views", "index.ejs");
    }

    console.log("Resolved File Path:", filePath); // Log the resolved file path

    const ext = path.extname(filePath);
    const contentType = mimeType[ext] || 'text/plain';

    if (!mimeType[ext]) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Not Found" }));
        return;
    }

    fs.readFile(filePath, "utf8", (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "File not found" }));
            console.log(err); // Log the error details
        } else {
            if (ext === '.ejs') {
                const renderedContent = ejs.render(content, { isTrue: true, names: ["Isobelle Kerr", "Ray Bates", "Nathaniel Kim"] });
                res.writeHead(200, { "Content-Type": contentType });
                res.end(renderedContent);
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

// Server is listening on http://localhost:3100
// Request URL: /
// Resolved File Path: F:\Internship\Node\Node Modules Practice\Serving files\views\index.ejs
// Request URL: /tags.ejs
// Resolved File Path: F:\Internship\Node\Node Modules Practice\Serving files\views\tags.ejs
