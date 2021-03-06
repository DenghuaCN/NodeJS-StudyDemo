### 阻塞与线程

什么是阻塞（block）呢？线程在执行中如果遇到磁盘读写或网络通信（统称I/O操作），通常要耗费较长的时间，这时**操作系统会剥夺这个线程的CPU控制权，使其暂停执行，同时将资源让给其他的工作线程**，这个线程调度方式称为**阻塞**。当I/O操作完毕时，操作系统将这个线程的阻塞状态解除，恢复其对CPU的控制权，令其继续执行。这种I/O模式就是通常的**同步式I/O（Synchronous I/O）**或**阻塞式I/O（Blocking I/O）**。

相应的，**异步式I/O（Asynchronous I/O）或非阻塞式I/O（Non-blocking I/O）则针对所有I/O操作不采用阻塞的策略**。当线程遇到I/O操作时，不会以阻塞的方式等待I/O操作的完成或数据的返回，而只是将I/O请求发送给操作系统，继续执行下一条语句。当操作系统完成I/O操作时，以事件的形式通知执行I/O操作的线程，线程会在特定时候处理这个事件。为了处理异步I/O，线程必须有**事件循环**，不断的检查有没有未处理的事件，依次予以处理。

阻塞模式下，一个线程只能处理一项任务，要想提高吞吐量必须通过多线程。而非阻塞模式下，一个线程永远在执行计算操作，这个线程所使用的CPU核心利用率永远是100%，I/O以事件的方式通知。在阻塞模式下，多线程往往能提高系统吞吐量，因为一个线程阻塞时还有其他线程工作，多线程可以让CPU资源不被阻塞中的线程浪费。而在非阻塞模式下，线程不会被I/O阻塞，永远在利用CPU。多线程带来的好处仅仅是在多核CPU的情况下利用更多的核，而Node.js的单线程也能带来同样的好处。这就是为什么Node.js使用了单线程、非阻塞的事件编程模式。

单线程事件驱动的异步式I/O比传统的多线程阻塞式I/O究竟好在哪里呢？简而言之，异步式I/O就是少了多线程的开销。多操作系统来说，创建一个线程的代价是十分昂贵的，需要给它分配内存、列入调度，同时在线程切换的时候还要执行内存换页，CPU的缓存被清空，切换回来的时候还有重新从内存中读取信息，破坏了数据的局部性。
当然，异步式编程的缺点在于不符合人们一般的程序设计思维，容易让控制流变得晦涩难懂，给编码和调试都带来不小的困难，但慢慢习惯以后会好很多。尽管如此，异步式编程还是较为困难。不过可喜的是现在已经有了不少专门解决异步式编程问题的库（async等）。

```
-----------同步式I/O（阻塞式）----------------------异步式I/O（非阻塞式）----------------
          利用多线程提供吞吐量                       单线程即可实现高吞吐量
    通过事件片分割和线段调度利用多核CPU               通过功能划分利用多核CPU
    需要由操作系统调度多线程使用多核CPU               可以将单进程绑定到单核CPU
          难以充分利用CPU资源                        可以充分利用CPU资源
        内存轨迹大，数据局部性弱                    内存轨迹小，数据局部性强
          符合线性的编程思维                         不符合传统的编程思维
--------------------------------------------------------------------------------------
```