### 4.4 文件系统fs

fs模块是文件操作的封装，它提供了文件的读取、写入、更名、删除、遍历目录、链接等POSIX文件系统操作。与其他模块不同的时，**fs模块中所有的操作都提供了异步和同步两个版本**，例如读取文件内容的函数有异步的`fs.readFile()`和同步的`fs.readFileSync()`。

#### 4.4.1 fs.readFile

`fs.readFile(filename, [encoding], [callback(err,data)])`是最简单的读取文件的函数。它接受一个**必选参数**`filename`，表示要读取的文件名。第二个参数`encoding`是可选的，表示文件的字符编码。`callback`是回调函数，用于接收文件的内容。如果不指定`encoding`，则`callback`是第二个参数。回调函数提供两个参数`err`和`data.err`表示有没有错误发生，`data`是文件内容。如果指定了`encoding`，`data`是一个解析后的字符串，否则`data`将会是以`Buffer`形式表示的二进制数据。

例如下例，从content.txt中读取数据，但是不指定编码：
```
const fs = require('fs');

fs.readFile('./chapter4/sec4.4/content.txt', (err,data) => {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
})
```

```
Buffer(4) [84, 101, 120, 116]
```
这个程序以二进制的模式读取了文件的内容，data的值是Buffer对象。如果我们给fs.readFile的encoding指定编码则会直接输出编码后的字符。

```
Text
```
当读取文件出现错误时，err将会是Error对象。如果content.txt不存在，运行前面的代码则会出现以下结果：
```
{ [Error: ENOENT: no such file or directory, open 'F:\denghua\Demo\NodeJS-StudyDemo\chapter4\sec4.4\chapter4\sec4.4\content2.txt']
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path:
   'F:\\denghua\\Demo\\NodeJS-StudyDemo\\chapter4\\sec4.4\\chapter4\\sec4.4\\content2.txt' }
```

**提示：** Node.js的异步编程接口习惯是以函数的最后一个参数为回调函数，通常一个函数只有一个回调函数。回调函数实际参数中第一个是err，其余的参数是其他返回的内容。如果没有发生错误，err的值是null或undefined。如果有错误发生，err通常是Error对象的实例。

#### 4.4.2 fs.readFileSync

fs.readFileSync(filename, [encoding])是fs.readFile同步的版本。它接受的参数和fs.readFile相同，而读取到的文件内容会以函数返回值的形式返回。如果有错误发生，fs将会抛出异常，需要使用`try`和`catch`捕捉并处理异常。

**提示：** 与同步IO函数不同，Node.js中异步函数大多没有返回值。

#### 4.4.3 fs.open

`fs.open(path, flags, [mode], [callback(err, fd)])`是POSIX open函数的封装，与C语言标准库的fopen函数类似。它接受两个**必选参数**，`path`为文件路径，`flags`可以是以下值：

- r : 以读取模式打开文件
- r+ : 以读写模式打开文件
- w : 以写入模式打开文件，如果文件不存在则创建。
- w+ : 以读写模式打开文件，如果文件不存在则创建。
- a : 以追加模式打开文件，如果文件不存在则创建。
- a+ : 以读取追加模式打开文件，如果文件不存在则创建。

`mode`参数用于创建文件时给文件指定权限，默认是0666.回调函数将会传递一个文件描述符`fd`。

> 文件权限指的是POSIX操作系统中对文件读取和访问权限的规范，通常用一个八进制数来表示。例如0754表示文件所有者的权限是7（读、写、执行），同组的用户权限是5（读、执行），其他用户权限是4（读），写成字符表示就是`-rwxr-xr--`。

> 文件描述符是一个非负整数，表示操作系统内核为当前进程所维护的打开文件的记录表索引。

#### 4.4.4 fs.read

`fs.read(fd, buffer, offset, length, position, [callback(err, bytesRead, buffer)])`是`POSIX read`函数的封装，相比`fs.readFile`提供了更底层的接口。
- `fs.read`的功能是从指定的文件描述符fd中读取数据并写入`buffer`指向的缓冲对象。

- `offset`是`buffer`的写入偏移量。`length`是要从文件中读取的字节数。

- `position`是文件读取的起始位置，如果`position`值为`null`，则会从当前文件指针的位置读取。

- 回调函数传递`bytesRead`和`buffer`，分别表示读取的字节数和缓冲区对象。

`fs.open`和`fs.read`的示例：

```
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
```

content.txt内容为
```
Text
```

输出结果
```
bytesRead:4
<Buffer 54 65 78 74 00 00 00 00>
```
一般来说，除非必要，否则不要使用这种方式读取文件，因为他要求你手动管理缓冲区和文件指针，尤其是在你不知道文件大小的时候，这将会是一件很麻烦的事情。

[Node.js中文文档 —— fs模块](http://nodejs.cn/api/fs.html#fs_threadpool_usage)

---