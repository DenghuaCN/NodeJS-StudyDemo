### 模块和包

模块（module）和包（package）是Node.js最重要的支柱，开发一个具有一定规模的程序不可能只用一个文件。模块正是为了实现这种方式而诞生的，在浏览器JavaScript中，脚本模块的拆分和组合通常使用HTML script标签实现。Node.js提供了require函数来调用其他模块，模块都是基于文件的，机制十分简单。

Node.js的模块和包机制部分参考了CommonJS的标准，但并未完全遵循。

#### 3.3.1 什么是模块
模块是Node.js应用程序的基本组成部分，文件和模块是一一对应的。换言之，一个Node.js文件就是一个模块，这个文件可能是JavaScript代码，JSON或者编译过得C/C++扩展。
比如http模块，是Node.js的一个核心模块，内部是用C++实现的，外部用JavaScript封装。通过require这个函数获取。

#### 3.3.2 创建及加载模块

1.

```
// sec3.3.2.js
var name;

exports.setName = function(thyName) {
    name = thyName;
}
exports.sayHello = () => {
    console.log(name);
}

}


// sec3.3.2-2.js

var myModule = require('./sec3.3.2.js');
myModule.setName("test");
myModule.sayHello();
```

exports对象把setName和sayHello作为模块的访问接口，使用require加载这个模块，然后就可以直接访问exports对象的成员函数了。

2. 单次加载
`require`不会重复加载模块，也就是无论调用多少次require，获得的模块也都是同一个。


3. 覆盖exports
有时候我们只想把一个东西封装到模块中，如：
```
function Hello() {
    var name;

    this.setName = function (thyName) {
        name = thyName;
    }
    this.sayHello = function () {
        console.log("Hello " + name);
    }
}

exports.Hello = Hello;
```
此时需要在其他文件通过`require('./singlebobject').Hello`获取Hello对象，这略显冗余，可以这样简化：
```
// sec3.3.2.js
function Hello() {
    var name;
    this.num = 10;

    this.setName = function (thyName) {
        name = thyName;
    }
    this.sayHello = function () {
        console.log("Hello " + name);
    }
    this.test = function() {
        console.log(this);
    }
}

module.exports = Hello;

```

这样就能直接获得这个对象了：

```
// sec3.3.2-2.js
var Hello = require('./sec3.3.2');
var num = 100;

var hello = new Hello();
hello.setName('name');
hello.sayHello();
hello.test();

```
注意，模块接口的唯一变化是使用`module.exports = Hello`代替了`exports.Hello = Hello`。在外部引用该模块时，其接口对象就是要输出的Hello对象本身，而不是原先的exports。

**警告** 不可以通过exports直接赋值代替对`module.exports`赋值。exports实际上只是一个module.exports指向同一个对象的变量，它本身会在模块执行结束后释放，但module不会，因此只能通过指定module.exports来改变访问接口。

**3.2.3 创建包**
包是在模块基础上更深一步的抽象，Node.js的包类似于C/C++的函数库或者JAVA/.Net的类库。它将某个独立的功能封装起来，用于发布、更新、依赖管理和版本控制。Node.js根据CommonJS规范实现了包机制，开发了npm来解决包的发布和获取需求。

严格符合CommonJS规范的包应该具备以下特征：
- package.json必须在包的顶层目录下
- 二进制文件应该在bin目录下
- JavaScript代码应该在lib目录下
- 文档应该在doc目录下
- 单元测试应该在test目录下。
Node.js对包的要求没有这么严格，只要顶层目录下有package.json，并符合一些规范即可。当然为了提高兼容性，我们还是建议你在制作包的时候，严格遵守CommonJS规范。

1. 作为文件夹的模块。

文件不仅可以是JavaScript代码或二进制代码，还可以是一个文件夹。最简单的包，就是一个作为文件夹的模块。
建立一个名为somepackage的文件夹，创建index.js，写入：
```
// ./somepackage/index.js
exports.hello = function() {
    console.log('Hello.');
};

```
然后在somepackage之外建立getpackage.js，写入：
```
// ../getpackage.js
var somePackage = require('./somepackage');

somePackage.hello();
```
运行`node getpackage.js`，控制台将输出结果Hello。

使用这种方法可以把文件封装为一个模块，既所谓的包。包通常是一些模块的集合，在模块的基础上提供了更高层的抽象，相当于提供了一些固定接口的函数库。通过定制package.json，可以创建更复杂，更完善，更符合规范的包用于发布。

2. package.json

Node.js在调用某个包时，会首先检查包中的package.json文件的main字段，将其作为包的接口模块，如果package.json或main字段不存在，会尝试寻找index.js或index.node作为包的接口。

---

#### 3.3.4 Node.js包管理器

1. 获取一个包
使用npm安装包
```
npm install express
```
或者
```
npm i express
```

安装成功后，会放置在当前目录下的node_modules子目录下。npm获取express的时候还将自动解析其依赖，并获取express依赖的mime、mkdirp、qs和econnect。

2. 本地模式和全局模式
默认情况，npm会将包安装到当前目录的node_modules子目录下。

全局模式安装
```
npm [install/i] -g [package._name]
```
多数时候**并不是因为**许多程序都要用到它，为了减少多重副本而使用全局模式。而是**因为本地模式不会注册PATH环境变量**，举例说明，supervisor是为了在命令行中使用它，譬如直接运行supervisor script.js，这时需要在PATH环境变量中注册supervisor。npm本地模式仅仅是把包安装到node_modules子目录下，其中的bin目录没有包含在PATH环境变量中，不能直接命令行运行。

而当我们使用全局模式安装时，npm会将包安装到系统目录，譬如`/usr/local/bin/`，`/usr/local/bin/`是在PATH环境变量中默认定义的，因此就可以在命令行中运行`supervisor script.js`命令了。

**提示：**使用全局模式安装的包不能直接在JavaScript文件中用`require`获得，因为`require`不会搜索`/usr/local/lib/node_modules/`。

```
-----模式---------可通过require------------注册PATH

    本地模式          是                    否
    全局模式          否                    是

```

3. 创建全局链接
npm提供了一个有趣的命令npm link，它的功能是在本地包和全局包之间创建符号链接。之前说全局模式不能使用require到，但是通过npm link可以打破这一限制。

警告：npm link命令不支持Windows

4. 包的发布
npm有一套CommonJS为基础包规范，但与CommonJS并不完全一致，其主要差别在于必填字段不同。通过使用npm init可以交互式产生一个符合标准的package.json。

....

#### 3.4 调试

[debugger（调试器）](http://nodejs.cn/api/debugger.html)

[Node 调试工具入门教程](http://www.ruanyifeng.com/blog/2018/03/node-debugger.html)

[nodejs调试指南](https://juejin.im/post/5b60202df265da0f8145f887)











