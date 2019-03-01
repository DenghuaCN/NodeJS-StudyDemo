/**
 * Node.js**所有的异步IO操作在完成时都会发送一个事件到事件队列**。在开发者看来，事件由`EventEmitter`对象提供。
 * 前面提到的`fs.readFile`和`http.createServer`的回调函数都是通过`EventEmitter`来实现的。
 * 用一个简单例子说明EventEmitter用法：
*/

let EventEmitter = require('events').EventEmitter;
let event = new EventEmitter();

event.on("some_event",() => {
    console.log("some_event occured.");
})

setTimeout(() => {
    event.emit('some_event');
}, 1000);

/**
 * 运行后，1s后控制台输出了`some_event occured.`。其原理是**event对象注册了事件`some_event`的一个监听器**，
 * 然后通过`setTimeout`在1000ms后，向event`对象发送事件`some_event`，此时会调用`some_event`的监听器。
 * 
 * (注册事件监听器 ——> 触发事件 ——> 注册在事件上的事件监听器执行)
 */

 
/**
 * Node.js会在什么时候进入事件循环呢？答案是**Node.js程序由事件循环开始，到事件循环结束**，所有的逻辑都是事件的回调函数
 * 所以Node.js**始终在事件循环中**，程序入口就是事件循环第一个事件的回调函数。事件的回调函数在执行过程中，
 * 可能会发出IO请求或直接发射(emit)事件，**执行完毕后在返回事件循环**，事件循环会检查事件队列(event queue)中有没有未处理的事件，直到程序结束。
 * 
*/

