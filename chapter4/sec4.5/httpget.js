const http = require('http');

http.get({ host: 'www.domain.com' }, (res) => {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
        console.log(data);
    })
})

