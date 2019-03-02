const http = require("http");

let req = http.get({host: 'www.domain.com'});

req.on('response', (res) => {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
        console.log(data);
    })
})