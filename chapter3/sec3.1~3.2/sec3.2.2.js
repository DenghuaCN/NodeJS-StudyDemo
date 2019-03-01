// Node.js用异步方式读取一个文件

const fs = require('fs');

fs.readFile('file.txt','utf-8',(error,data) => {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
})
console.log('end.');

/*
end.
Contents of the file. 
*/


/**
 * Node.js也提供了同步读取文件的API
 */

let data = fs.readFileSync('file.txt','utf-8');
console.log(data);
console.log('end.');

/* 
 * 同步式读取文件的方式比较容易理解，将文件名作为参数传入`fs.readFileSync`函数，阻塞等待读取完成后，将文件的内容
 * 作为函数的返回值赋给`data`变量，接下来控制台输出`data`的值，最后输出`end.`。
 * 
 * 异步式读取文件就稍微有些违反直觉了，`end.`先被输出。要想理解结果，我们必须先知道在Node.js中，异步式I/O是通过
 * 回调函数来实现的。`fs.readFile`接收了三个参数，文件名、编码方式、回调函数。JavaScript支持匿名的函数定义方式，
 * 譬如我们例子中回调函数的定义就是嵌套在`fs.readFile`的参数表中的。这种定义方式在JavaScript程序中极为普遍。
 * 与下面这种定义实现的功能一样：
*/

function readFileCallback(err, data) {
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
}

fs.readFile('file.txt','utf-8',readFileCallback);
console.log('end.');

/**
 * `fs.readFile`调用时所作的工作只是将异步式I/O请求发送给了操作系统，然后立即返回并执行后面的语句，
 * 执行完毕进入事件循环监听事件。当fs接收到I/O请求完成的事件时，事件循环会主动调用回调函数以完成后续工作。
 * 因此我们会先看到`end.`，在看到file.txt文件的内容。
 * 
 * PS：Node.js中，并不是所有的API都提供了同步和异步版本。Node.js不鼓励使用同步I/O。
 */
