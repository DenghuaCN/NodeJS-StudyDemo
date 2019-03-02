const http = require('http');
const server = new http.Server();

server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': "text/html" });
    res.write('<h1 style="color:red">Node.js</h1>');
    res.end('<p>hello world</p>');
});

server.listen(3000);

