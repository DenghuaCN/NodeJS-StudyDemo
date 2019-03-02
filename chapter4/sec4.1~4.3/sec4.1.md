### 4.1 全局对象

JavaScript中有一个特殊的对象，称为全局对象（Global Object），它及其所有属性都可以在程序的任何地方访问，即全局变量。在浏览器JavaScript中，window是全局对象，在Node.js中全局对象是global，所有全局变量（除了global本身）都是global对象的属性。

#### 4.1.1 全局对象与全局变量
global最根本的作用是作为全局变量的宿主。按照ECMAScript的定义，满足一下条件的变量是全局变量：
- 在最外层定义的变量；
- 全局对象的属性；
- 隐式定义的变量（未定义直接赋值的变量）。
定义一个全局变量的时候，这个变量同时也会成为全局对象的属性。反之亦然。

值得注意的是，Node.js不可能在最外层定义变量，因为所有用户代码都是属于当前模块的，而模块本身不是最外层上下文。

#### 4.1.2 process
process是一个全局变量，即global对象的属性。它用于**描述当前Node.js进程状态的对象**，提供了一个与操作系统的简单接口。通常在你写本地命令的时候，少不了要它打交道。

- **process.argv**

process.argv是命令行参数数组，第一个元素是node，第二个元素是脚本文件名，从第三个元素开始每个元素是一个运行参数。

```
console.log(process.argv);
```

通过命令行运行：`node argv.js 1991 name=name --v "something"`;

```
[ 'C:\\Program Files\\nodejs\\node.exe',
  'F:\\denghua\\Demo\\NodeJS-StudyDemo\\chapter4\\sec4.1\\argv.js',
  '1991',
  'name=name',
  '--v',
  'something' 
]
```

- **process.stdout**
`process.stdout`是标准输出流，通常我们使用的`console.log()`向标准输出打印字符，而`process.stdout.write()`函数提供了更底层的接口。

- **process.stdin**
`process.stdin`是标准输入流，初始时它是被暂停的，要想从标准输入读取数据，你必须恢复流，并手动编写流的事件响应函数。

```
process.stdin.resume();

process.stdin.on('data',function(data) {
    process.stdout.write('read from console: ' + data.toString());
})
```

- **process.nextTick(callback)**

为事件循环设置一项任务，Node.js会在下次事件循环响应时调用callback。

初学者可能不理解这个函数的作用，有什么任务不能当下执行完，需要交给下次事件循环响应来做呢？我们讨论过，Node.js适合IO密集型的应用，而不是计算密集型的应用，因为一个Node.js进程只有一个线程，因此在任何时刻都只有一个事件在执行。如果这个事件占用大量的CPU时间。process.nextTick()就提供了一个这样的工具，可以把复杂的工作拆散，变成一个个较小的事件。

```
function doSomething(args,callback) {
    somethingComplicated(args);
    callback();
}

doSomething(function onEnd() {
    compute();
})

```
我们假设`compute()`和`somethingComplicated()`是两个较为耗时的函数，以上的程序在调用`doSomething()`时会先执行`somethingComplicated()`，然后立即调用回调函数，在`onEnd()`中又会执行`compute()`。

下面用`process.nextTick()`改写程序：

```
function doSomething(args,callback) {
    somethingComplicated(args);
    process.nextTick(callback);
}
doSomething(function onEnd() {
    compute();
})
```

改写后的程序会把上面耗时的操作分为两个事件，减少每个事件的执行时间，提高事件响应速度。

**警告：**不要使用`setTimeout(fn,0)`代替`process.nextTick(callback)`，前者比后者效率要低得多。


#### 4.1.3 console

console用于提供控制台标准输出，它是由IE的JScript引擎提供的调试工具，后来逐渐成为浏览器的事实标准。Node.js沿用了这个标准，提供与习惯行为一致的console对象，用于向标准输出流（stdout）或者标准错误流（stderr）输出字符。

- **console.log()**

向标准输出流打印字符并以换行符结束。console.log接受若干个参数，如果只有一个参数，则输出这个参数的字符串形式。如果有多个参数，则以类似于C语言printf()命令的格式输出。第一个参数是一个字符串，如果没有参数，只打印一个换行。

- **console.error()**

与console.log()用法相同，只是向标准错误流输出。


- **console.trace()**

向标准错误流输出当前的调用栈

```
// console.trace()
Trace
    at repl:1:9
    at Script.runInThisContext (vm.js:96:20)
    at REPLServer.defaultEval (repl.js:332:29)
    at bound (domain.js:395:14)
    at REPLServer.runBound [as eval] (domain.js:408:12)
    at REPLServer.onLine (repl.js:639:10)
    at REPLServer.emit (events.js:194:15)
    at REPLServer.EventEmitter.emit (domain.js:441:20)
    at REPLServer.Interface._onLine (readline.js:290:10)
    at REPLServer.Interface._line (readline.js:638:8)

```

### 4.2 常用工具

util是一个Node.js核心模块，提供常用函数的集合，用于弥补核心JavaScript的功能过于精简的不足。

#### 4.2.1 util.inherits

`util.inherits(constructor,superConstructor)`是一个实现对象间原型集成的函数。JavaScript的面向对象特性是基于原型的，与常见的基于类的不同。JavaScript没有提供对象继承的语言级别特性，而是通过原型复制来实现的。

`util.inherits`用法：
```
function Base() {
    this.name = "base";
    this.base = 1991;

    this.sayHello = function() {
        console.log('Hello ' + this.name);
    };
}
Base.prototype.showName = function() {
    console.log(this.name);
}

function Sub() {
    this.name = 'sub';
}

var objBase = new Base();
objBase.showName();
objBase.sayHello();
console.log(objBase);

var objSub = new Sub();
objSub.showName();
// objSub.sayHello();
console.log(objSub);
```
我们定义了一个基础对象Base和一个继承自Base的Sub，Base有三个在构造函数内定义的属性和一个原型中定义的函数，通过util.inherits实现继承。

运行结果如下：
```
base
Hello base
Base { name: 'base', base: 1991, sayHello: [Function] }
sub
Sub { name: 'sub' }
```

注意，Sub仅仅继承了Base在原型中定义的函数，而构造函数内部创造的base属性和sayHello函数都没有被Sub继承，同时，在原型中定义的属性不会被console.log作为对象的属性输出。如果去掉`objSub.sayHello()`这行的注释，将会看到：
```
objSub.sayHello();
       ^

TypeError: objSub.sayHello is not a function
    at Object.<anonymous> (F:\denghua\Demo\NodeJS-StudyDemo\chapter4\sec4.1\test.js:30:8)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
```

#### 4.2.2 util.inspect
util.inspect(object,[showHidden],[depath],[colors])是一个将任意对象转换为字符串的方法，通常用于调试和错误输出。它至少接受一个参数object，即要转换的对象。
`showHidden`是一个可选参数，如果值为true，将会输出更多隐藏信息。
`depth`表示最大递归的层数，如果对象很复杂，你可以指定层数以控制输出信息的多少。不指定depth，默认递归2层，指定为null表示将不限递归层数完整遍历对象。
如果color值为true，输出格式将会以ANSI颜色编码，通常用于在终端显示更漂亮的的效果。

特别要指出的是，util.inspect并不会简单的直接把对象转换为字符串，即使该对象定义了toString方法也不会调用。

```
Person {
  name: 'name',
  toString:
   { [Function]
     [length]: 0,
     [name]: '',
     [arguments]: null,
     [caller]: null,
     [prototype]: { [constructor]: [Circular] } } }
```

### 4.3 事件驱动events

**events是Node.js最重要的模块**，没有“之一”，原因是Node.js本身架构就是事件式的，而它提供了唯一的接口，所以堪称Node.js事件编程的基石。events模块不仅用于用户代码与Node.js下层事件循环的交互，还几乎被所有的模块依赖。

#### 4.3.1 事件发射器

events模块只提供了一个对象：`events.EventEmitter`。EventEmitter的核心就是事件发射与事件监听器的功能的封装。EventEmitter的每个事件由一个事件名和若干个参数组成，事件名是一个字符串，通常表达一定的语义。对于每个事件，`EventEmitter`支持若干个事件监听器。当事件发射时，注册到这个事件的监听器被依次调用，事件参数作为回调函数参数传递。

```
var events = require('events');

var emitter = new events.EventEmitter();

emitter.on('someEvent', function (arg1, arg2) {
    console.log('listener1', arg1, arg2)
})

emitter.on('someEvent', function (arg1, arg2) {
    console.log('listener2', arg1, arg2);
})

emitter.emit('someEvent', '1', '2');
```
运行结果为：
```
listener1 1 2
listener2 1 2
```
以上例子中，`emitter`为事件`someEvent`注册了两个事件监听器，然后发射了`someEvent`事件。运行结果中可以看到两个事件监听器回调函数被先后调用。

这就是EventEmitter最简单的用法。接下来介绍EventEmitter常用的API。

- **EventEmitter.on(event, [arg1], [arg2],[...])**

为指定事件注册一个事件监听器，接受一个字符串event，和一个回调函数listener。

- **EventEmitter.emit(event, [arg1], [arg2], [...])**

发射event事件，传递若干可选参数到事件监听器的参数表。

- **EventEmitter.once(event, listener)**

为指定事件注册一个**单次**监听器，即监听器最多只会只会触发一次，触发后立刻解除该监听器。

- **EventEmitter.removeListener(event, listener)**

移除指定事件的某个监听器，listener必须是该事件已经注册过得监听器。

- **EventEmitter.removeAllListeners([event])**

移除所有事件的所有监听器，如果指定event，则移除指定事件的所有监听器。

---

#### 4.3.2 error事件

EventEmitter定义了一个特殊的事件error，它包含了“错误”的定义，遇到异常的时候通常会发射error事件。当error被发射时，EventEmitter规定如果没有响应的监听器，Node.js会把它当做异常，退出程序并打印调用栈。一般会为发射error事件的对象设置监听器，避免遇到错误后整个程序崩溃。如：
```
const events = require("events");
const emitter = new events();

emitter.emit('error');
```
运行时会显示以下错误：

```
C:\Program Files\nodejs\node.exe --inspect-brk=34820 chapter4\sec4.1\test.js 
Debugger listening on ws://127.0.0.1:34820/9b64c045-a1bc-44f7-bc9c-2434870fca4e

For help, see: https://nodejs.org/en/docs/inspector

Debugger attached.

events.js:180

    throw err; // Unhandled 'error' event

    ^



Error [ERR_UNHANDLED_ERROR]: Unhandled error.

    at EventEmitter.emit (events.js:178:17)

    at Object.<anonymous> (f:\denghua\Demo\NodeJS-StudyDemo\chapter4\sec4.1\test.js:4:9)

    at Module._compile (internal/modules/cjs/loader.js:686:14)

    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)

    at Module.load (internal/modules/cjs/loader.js:599:32)

    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)

    at Function.Module._load (internal/modules/cjs/loader.js:530:3)

    at Function.Module.runMain (internal/modules/cjs/loader.js:742:12)

    at startup (internal/bootstrap/node.js:283:19)

    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)

Waiting for the debugger to disconnect...

NodeError: Unhandled error.
    at EventEmitter.emit (events.js:178:17)
    at Object.<anonymous> (f:\denghua\Demo\NodeJS-StudyDemo\chapter4\sec4.1\test.js:4:9)
    at Module._compile (internal/modules/cjs/loader.js:686:14)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
    at Function.Module._load (internal/modules/cjs/loader.js:530:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:742:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:743:3)

```

#### 4.3.3 继承EventEmitter
大多数时候不会直接使用EventEmitter，而是在对象中继承它。包括fs、net、http在内的，只要是支持事件响应的核心模块都是EventEmitter的子类。
为什么？首先，具有某个实体功能的对象实现事件符合语义，事件的监听器和发射应该是一个对象的方法。其次JavaScript对象机制是基于原型的，支持多部分多重继承，继承EventEmitter不会打乱对象原有的继承关系。

---





































