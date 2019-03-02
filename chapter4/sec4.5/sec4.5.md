### 4.5 HTTP服务器与客户端

Node.js标准库提供了http模块，其中封装了一个高效的HTTP服务器和一个简易的HTTP客户端。`http-server`是一个基于事件的HTTP服务器，它的核心由Node.js下层C++部分实现，而接口由JavaScript封装，兼顾了高性能与简易性。`http-request`则是一个HTTP客户端工具，用于向HTTP服务器发起请求。

#### 4.5.1 HTTP服务器

http.Server是http模块中的HTTP服务器对象，用Node.js做的所有基于HTTP协议的系统，如网站、社交应用甚至代理服务器，都是基于`http.Server`实现的。它提供了一套封装级别很低的API，仅仅是流控制和简单的消息解析，所有的高层功能都要通过它的接口来实现。

在之前使用http实现了一个服务器：

```
const http = require('http');

http.createServer((req,res) => {
    res.writeHead(200, {'Content-Type':"text/html"});
    res.write('<h1 style="color:red">Node.js</h1>');
    res.end('<p>hello world</p>');
}).listen(3000);

console.log('HTTP server is listening at port 3000');
```

这段代码中，`http-createServer`创建了一个`http.Server`的实例，将一个函数作为**HTTP请求处理函数**。这个函数接受两个参数，分别是请求对象`req`和响应对象`res`。
在函数体内，`res`显式地写回了响应代码200，指定响应头为`'Content-Type': 'text/html'`。
然后写入响应体`<h1>Node.js</h1>`，通过`res.end`结束并发送。最后该实例还调用了listen函数，启动服务器并监听3000端口。

1. **http.Server的事件**

`http.Server`是一个基于事件的HTTP服务器，**所有的请求都被封装为独立的事件**，开发者只需要对它的事件编写响应函数即可实现HTTP服务器的所有功能。它继承自`EventEmitter`，提供几个事件。

- **requet** : 当客户端请求到来时，该事件被触发，提供两个参数`req`和`res`，分别是`http.ServerRequest`和`http.ServerResponse`的实例，表示请求和响应信息。

- **connection** : 当TCP连接建立时，该事件被触发，提供一个参数socket，为`net.Alive`的实例。connection事件的粒度要大于request，因为客户端在Keep-Alive模式下可能会在同一个连接内发送多次请求。

- **close** : 当服务器关闭时，该事件触发，注意不是在用户连接断开时。

当然，还有其他更深度详细的事件类型，这里不一一列举。

在这些事件中，最常用的是`request`了，因此http提供了一个捷径：`http-createServer([requestListener])`，功能是创建一个HTTP服务器并将`requestListener`作为request事件的监听函数，这也是前面例子的方法。

事实上，它显示的写法为：
```
const http = require('http');
const server = new http.Server();

server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': "text/html" });
    res.write('<h1 style="color:red">Node.js</h1>');
    res.end('<p>hello world</p>');
});

server.listen(3000);

```

2. **http.ServerRequest**

`http.ServerRequest`是HTTP请求的信息，是后端开发者最关注的内容。一般由`http-Server`的`request`事件发送，作为第一个参数传递，通常简称`request`或`req`。
ServerRequest提供一些属性：

```
---------名称--------------------含义----------

       complete              客户端请求是否发送完成
       httpVersion           HTTP协议版本
       method                HTTP请求方法
       url                   原始请求路径
       headers               请求头
       trailers              请求尾（少见）
       connection            连接套接字
       soket                 connection属性别名
       client                client属性别名
```

HTTP请求一般分为两部分：请求头(Request Header)和请求体(Rquest Body)。以上内容由于长度较短都可以在请求头解析完成后立即读取。而请求体可能相对较长，需要一定时间传输，因此http.ServerRequest提供了以下3个事件用于控制请求体传输。

- data：当请求数据到来时，该事件触发。该事件提供一个chunk，表示接收到的数据。如果该事件没有被监听，那么请求体将会抛弃。该事件可能被调用多次。

- end：请求体数据传输完成时，该事件被触发，此后将不会再有数据到来。

- close：用户当前请求结束时，该事件被触发。不同于end，如果用户强制终止了传输，也还是调用close。

3. **获取GET内容**

GET请求直接被嵌入在路径中，URL是完整的请求路径，包括了`?`后面的部分，可以手动解析后面的内容作为GET请求的参数。Node.js的url模块中的parse函数提供了这个功能，例如：
```
const http = require('http');
const url = require('url');
const util = require('util');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(util.inspect(url.parse(req.url, true)));
}).listen(3000);

```
浏览器访问：`http://localhost:3000/user?name=youname&email=youemail@you.com`

```
[Object: null prototype] { '/user?name': 'youname', email: 'youemail@you.com' }
```

通过url.parse，原始的path被解析为一个对象。

4. **获取POST请求内容**

POST请求内容全在请求体中。`http.ServerRequest`并没有一个属性内容为请求体，原因是等待请求体传输可能是一件耗时工作，譬如上传文件。而很多时候我们可能并不需要理会请求体的内容，恶意的POST请求会消耗大量服务器资源。所以Node.js默认不会解析请求体，需要手动实现：

```
const http = require('http');
const querystring = require('querystring');
const util = require('util');

http.createServer((req, res) => {
    let post;

    req.on('data', (chunk) => {
        post += chunk;
    });

    req.on('end', () => {
        post = querystring.parse(post);
        res.end(util.inspect(post));
    })
}).listen(3000);

```

上例并没有在请求响应函数中向客户端返回信息，而是定义了一个`post`变量，用于在闭包中暂存请求体的信息。通过`req`的`data`事件监听函数，每当接受到请求体的数据，就累加到`post`变量中，在`end`事件触发后，通过`querystring.parse`将`post`解析为真正的POST请求格式，然后向客户端返回。

**警告：** 不要在真正的生产应用上使用上面这种简单的方法来获取POST请求，因为它有严重的效率问题和安全问题，这是一个帮助理解的示例。


5. **http.ServerResponse**

`http.ServerResponse`是返回给客户端的信息，决定了用户最终看到的效果。也是有`http.Server`的request事件发送的，作为第二个参数传递，一般简称为response或res。

`http.ServerResponse`有三个重要的成员成员函数，用于返回响应头、响应内容以及内容请求。

- response.writeHead(statusCode, [headers]):向请求的客户端发送响应头。`statusCode`是HTTP状态码。`headers`是一个类似关联数组的对象，表示响应头的每个属性。该函数在一个请求内最多只能调用一次，如果不调用，则会自动生成一个响应头。

- response.write(data, [encoding])：向请求的客户端发送响应内容。data是一个Buffer或字符串，表示要发送的内容。如果data是字符串，那么需要指定`encoding`来说明它的编码方式，默认是utf-8.在response.end调用之前，response.write可以被多次调用。

- response.end([data], [encoding])：结束响应，告知客户端所有发送已经完成。当所有要返回的内容发送完毕的时候，该函数必须被调用一次。它接受两个可选参数，意义和`response.write`相同。如果不调用该函数，客户端将永远处于等待状态。

#### 4.5.2 HTTP客户端

http模块提供了两个函数http.request和http.get，功能作为客户端向HTTP服务器发起请求。

- http-request(options, callback)发起HTTP请求。接受两个参数，option是一个类似关联数组的对象，表示请求的参数，callback是请求的回调函数。option常用的参数：
- host：请求域名或者IP地址
- port：端口，默认80
- method：请求方法，默认GET
- path：请求的相对于根的路径，默认是"/"。QueryString应该包含在其中。
- headers：关联数组对象，为请求头内容。
- callback：传递一个参数，为http.ClientResponse的实例。htt.request返回一个http.ClientRequest实例。

通过http.request发送POST请求示例：

```
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

```
- `http.get(options, callback)`模块还提供了一个更加简便的方法用于处理GET请求：http.get。它是http.request的简化版，唯一区别在于http.get自动将请求方法设置为GET请求，同时不需要手动调用req.end()。

```
const http = require('http');

http.get({ host: 'www.domain.com' }, (res) => {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
        console.log(data);
    })
})

```

1. http.ClientRequest
http.ClientRequest是由http.request或http.get返回产生的对象，表示一个已经产生而且正在进行中的HTTP请求。它提供一个response事件，即http.request或http.get，第二个参数指定的回调函数的绑定对象。也可以显式地绑定这个事件的监听函数：

```
const http = require("http");

let req = http.get({host: 'www.domain.com'});

req.on('response', (res) => {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
        console.log(data);
    })
})
```

http.ClientRequest像http.ServerResponse一样也提供了write和end函数，用于向服务器发送请求体，通常用于POST，PUT等操作。所有写结束后必须调用end函数以通知服务器，否则请求无效。http.ClientRequest还提供了以下函数。

- request.abort(): 终止正在发送的请求。
- request.setTimeout(timeout, [callback]): 设置请求超时时间，timeout为毫秒数。当请求超时后，callback将会被调用。

此外还有`request.setNoDelay([noDelay])`、`request.setSocketKeepAlive([enable], [initialDelay])`等。

2. http.ClientResponse
`http.ClientResponse`与`http.ServerRequest`相似，提供了三个事件data、end和close，分别在数据到达、传输结束和连接结束时触发，其中data事件传递一个参数chunk，表示接收到的数据。

---






