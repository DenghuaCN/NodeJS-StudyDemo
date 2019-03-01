const http = require("http");

http.createServer((req,res) => {
    res.writeHead(200,{"Content-Type": "text/html"});
    res.write("<h1>Node.js</h1>");
    res.end("<p>Hello World</p>");    
}).listen(3000);

console.log("localhost:3000");

/**
 * 这个程序调用了Node.js提供的http模块，对**所有的HTTP请求答复同样的内容**并监听3000端口
 * 在终端中运行脚本时，它并不会输出后立即退出，而是一直等待着，知道按下 ctrl+C 才回结束
 * 这是因为**listen函数中创建了事件监听器**，似的Node.js进程不会退出事件循环。
 */