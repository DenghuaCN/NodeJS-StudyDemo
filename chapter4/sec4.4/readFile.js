const fs = require('fs');

fs.open('content.txt', 'r', (err, fd) => {
    if (err) {
        console.log(err);
        return 
    };

    let buf = new Buffer.alloc(8);

    fs.read(fd, buf, 0, 8, null, (err, bytesRead, buffer) => {
        if (err) {
            console.error(err);
            return
        }

        console.log('bytesRead:' + bytesRead);
        console.log(buffer);
    })
});