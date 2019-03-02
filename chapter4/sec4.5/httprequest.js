const http = require('http');
const querystring = require('querystring');

let contents = querystring.stringify({
    name: 'name',
    email: 'emailname@name.com',
    address: 'address'
});

let options = {
    host: 'www.name.com',
    path: '/application/node/post.php',
    method: 'POST',
    headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': contents.length
    }
};

let req = http.request(options, (res)=> {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
        console.log(data);
    })
})


req.write(contents);
req.end();
