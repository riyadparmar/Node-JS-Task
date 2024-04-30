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
    const filePath = path.join(
        __dirname,
        "views",
        req.url === "/" ? "index.ejs" : req.url
    );

    const ext = path.extname(filePath);
    const contentType = mimeType[ext] || 'text/plain';

    if (!mimeType[ext]) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Not Found" }));
        return;
    }

    const names = ["Isobelle Kerr", "Ray Bates", "Nathaniel Kim", "Niall Copeland",
        "Diane Flores", "Ellie Decker", "Freya Cline", "Jamil Dean",
        "Jesse Harrison", "Vinny Villegas"];

    fs.readFile(filePath, "utf8", (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "File not found" }));
        } else {
            if (ext === '.ejs') {
                const renderedContent = ejs.render(content, { isTrue: true, names });
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
