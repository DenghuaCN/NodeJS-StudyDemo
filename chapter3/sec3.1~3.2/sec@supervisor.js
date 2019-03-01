/**
 * 在开发Node.js实现的HTTP应用时会发现，无论你想修改了代码的哪一部分，
 * 都必须终止Node.js再重新运行才回奏效。这是因为Node.js**只有在第一次引用到某部分时
 * 才会去解析脚本文件，以后都会直接访问内存**，避免重复载入。Node.js的这种设计虽然有利于提高性能，
 * 却不利于开发调试，因为我们在开发过程中总是希望修改后立即看到效果，而不是每次都要终止进程并重启。
 * 
 * supervisor可以帮助实现这个功能，它会监视你对代码的改动，并自动重启Node.js。
 * (只是监视代码改动，并不包括刷新浏览器页面)
 * 
 * 首先使用npm安装supervisor。
 * 
 * `npm install -g supervisor`
 * 
 * 接下来使用supervisor命令启动http服务器
 * 
 * `supervisor filename.js`
 */

