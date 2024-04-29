const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const PORT = 5050;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

function readUsersData() {
    return new Promise((resolve, reject) => {
        fs.readFile('users.json', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    console.error("Error parsing JSON from file:", parseErr);
                    reject(parseErr);
                }
            }
        });
    });
}

function writeUsersData(data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data, 2);
        fs.writeFile('users.json', jsonData, (err) => {
            if (err) {
                console.error("Error writing to file:", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function hashPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}

async function deleteUser(id) {
    let users = await readUsersData();
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
        users.splice(index, 1);
        await writeUsersData(users);
        return true;
    }
    return false;
}

async function updateUser(id, updates) {
    let users = await readUsersData();
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
        if (updates.email && !emailRegex.test(updates.email)) {
            throw new Error("Invalid email format");
        }

        users[index] = { ...users[index], ...updates };
        if (updates.password) {
            users[index].password = hashPassword(updates.password);
        }
        await writeUsersData(users);
        return users[index];
    }
    return null;
}

function validateUserInput(user) {
    const { name, password, email } = user;
    if (!name || !password || !email) {
        throw new Error('Missing required fields: name, password, and email are required.');
    }
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format.');
    }
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/users' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const user = JSON.parse(body);

                validateUserInput(user);
                const users = await readUsersData();

                if (users.some(u => u.email === user.email)) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email already exists' }));
                    return;
                }

                user.password = hashPassword(user.password);
                user.id = users.length + 1;
                users.push(user);
                await writeUsersData(users);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } catch (error) {
                console.error("Failed to handle POST request:", error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else if (req.url.match(/\/users\/\d+/) && req.method === 'GET') {
        const id = req.url.split('/')[2];
        try {
            const users = await readUsersData();
            const user = users.find(u => u.id === parseInt(id));
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error("Failed to handle GET request:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    } else if (req.url.match(/\/users\/\d+/) && req.method === 'DELETE') {
        const id = req.url.split('/')[2];
        try {
            const success = await deleteUser(parseInt(id));
            if (success) {
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error("Failed to handle DELETE request:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    } else if (req.url.match(/\/users\/\d+/) && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const updates = JSON.parse(body);

                validateUserInput({...updates, password: updates.password || "dummyPass"});

                const updatedUser = await updateUser(parseInt(id), updates);
                if (updatedUser) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(updatedUser));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
            } catch (error) {
                console.error("Failed to handle PUT request:", error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});