---
title: "用Node.js写网络爬虫"
date: 2019-06-10T09:23:13+08:00
draft: false
keywords: nodejs,scraper,crawler
---

![](https://cdn-images-1.medium.com/max/2600/1*M8LBMPs4yrl5lisL8F5kTA.jpeg)

原文链接：https://medium.com/@bretcameron/how-to-build-a-web-scraper-using-javascript-11d7cd9f77f2

如果你想要在网络上收集数据，那么你可以找到一堆的资源来告诉你如何用一些后端技术比如python，PHP。但是很少有一些用来给新手的指导，比如Node.js。

多亏了Nodejs，JavaScript变成了一个非常棒的爬虫工具，不单单是因为Node.js很快，更是因为你直接可以使用那些前端用来处理DOM的方法。Node.js有很多工具用来请求动态、或者静态的网页，而且它也很好的整合了很多有用的API，`node modules`等。

在这篇文章中，我将讲解一个非常有效的方法来用javascript构建网络爬虫。我们也会了解书写健壮的数据获取代码的一个很重要的概念：异步编程。

## 异步编程

通过网络请求数据，通常是大多新手第一次接触到异步的代码。默认情况下JavaScript是同步的，意思就是说当中的事件都是一行一行的被执行的。无论什么时候，当一个函数被执行的时候，整个程序就会等待着个函数返回后才会接着往下执行。

但是请求网络数据通常需要使用异步的代码。异步代码通常会在同步的事件中让出，来让其他的同步代码来先执行，而异步代码则是等待被某些事件触发，比如从某个网站请求数据。

同步和异步的两种执行类型组合在一起通常会给新手带来一些困扰。我们将会用到ES7中的`async`和`await`关键字来就解决这个麻烦，他们是ES6中`promise`的语法糖，而`promise`又是之前系统中那些`callback`的语法糖。

## 传递回调函数

在只有callbacks的时候，我们都依赖于通过在一个异步函数中传入另一个函数来处理异步事件。然而这也导致了被熟知的”回调地狱“。下面我们可以看看示例代码！

```c
/* Passed-in Callbacks */
doSomethin(function(result) {
	doSomethingElse(result, function(newResult) {
		doThirdThing(newResult, function(finalReuslt) {
			console.log(finalResult)
		}, failureCallback)
	}, failureCallback)
}, failureCallback)
```

## Promise,Then 和 Catch

在ES6中，加入了一个新的语法，使得处理异步函数更加的简单。这是通过使用`Promise`对象，以及`then`和`catch`方法。

```c
/* "Vanilla" Promise Syntax */
doSomething()
.then(result => doSomethingElse(result))
.then(newResult => doThirdThing(newResult))
.then(finalResult => {
  console.log(finalResult);
})
.catch(failureCallback);
```

## Async 和 Await

最终，ES7带来了`async`和`await`关键字，在下面的例子中，这两个关键字可以让异步代码看起来更像是同步的JavaScript代码。这个最现代的开发方式才是最容易阅读的处理异步的JavaScript代码，并且相对于Promise语法，还[增强了内存效率](https://blog.pusher.com/promises-async-await/)。

```c
/* Async/Await Syntax */
(async () => {
  try {
    const result = await doSomething();
    const newResult = await doSomethingElse(result);
    const finalResult = await doThirdThing(newResult);
    console.log(finalResult); 
  } catch(err) {
    console.log(err);
  }
})();
```

## 静态网站

在过去，从其他域名来获取数据通常涉及到XMLHttpRequest和XHR对象。现在，我们可以使用JavaScript的Fetch API。`fetch()`方法是用一个参数（通常是URL）来表示资源路径并返回一个Promise对象。

如果想在Node.js中使用，你需要引入一个实现包。`Isomorphic Fetch`是一个不错的选择，在命令行中键入`npm i isomorphic-fetch es6-promise`来安装，然后在你的文件顶部引入:`const fetch = require('ismorphic-fetch`。

## JSON

如果你需要获取JSON数据，那么你需要在处理数据前先使用response的json()方法。

```c
 (async () => {
  const response = await fetch('https://wordpress.org/wp-json');
  const json = await response.json();
  console.log(JSON.stringify(json));
})()
```

JSOn通常可以使你更直接的来获取和处理你想要的数据，但是如果没有JSON数据可以用呢？

## HTML

对于大多数网站来说，nixuyaocongHTML中来解析数据。对于静态网站来说，你通常有两种方法来做这件事。

### 方案一：正则表达式

如果你只需要简单的方法并且你也习惯于书写正则，你可以很简单的使用text()方法，然后用match方法来拿到你需要的数据。举个例子，下面是一个用来从`h1`标签中获取内容的代码：

```c
(async () => {
  const response = await fetch('https://example.com');
  const text = await response.text();
  console.log(text.match(/(?<=\<h1>).*(?=\<\/h1>)/));
})()
```

### 方案二：DOM解析器

如果你正在处理一个更复杂的文档，用JavaScript的内建函数来处理DOM将会更有帮助，比如：`getElementById`，`querySelector`等。

如果我们写的是前端代码，那么我们可以直接使用DOM的接口。然而现在我们用的是Node.js，我们可以用一个包来做到，比如一个非常流行的包jsdom，你可以通过`npm i jsdom`来安装，然后像下面的方式来引入：

```c
const jsdom = require('jsdom')
const { JSDOM } = jsdom;
```

通过jsdom，我们可以使用querySelector这样的方法来处理获取到的HTML数据：

```c
(async () => {
  const response = await fetch('https://example.com');
  const text = await response.text();
  const dom = await new JSDOM(text);
  console.log(dom.window.document.querySelector("h1").textContent);
})()
```

## 动态网站

如果你想抓取动态网站的数据该怎么办，那些内容是实时加载的，或者像社交媒体那样的网站？但是执行一次fetch是不行的，因为那只会抓到网站的静态代码，而不是那些你需要的动态内容。

puppeteer是处理这类事情最好的Node.js包，因为同为做个事的PhantomJS已经不维护了。

Puppeteer可以让你通过开发者工具协议来运行Chrome或者Chromium，诸如自动的页面导航或者屏幕控制等特性。默认情况下，他运行的是一个无头浏览器，但是有时候修改这个配置也会对Debug有帮助。

## Getting Started

安装，在你的项目的命令行下输入`npm i puppeteer`,下面是一个方便你开始使用的模板代码：

```
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  headless: false,
});
const page = await browser.newPage();
await page.setRequestInterception(true);
await page.goto('http://www.example.com/');
```

最初，我们运行puppeteer（禁用headless模式，这样我们可以看到我们在做的事情）。然后我们打开了一个新的tab。`page.setRequestInterception(true)`方法是可选的，这个方法可以让我们能够在请求的过程中加入一些控制函数。最后我们访问我们需要去的站点。

## 登录

如果我们需要登录，我们可以轻松的使用type和click方法，type可以像querySelector方法一样来定位到DOM：

```
await page.type('#username', 'UsernameGoesHere');
await page.type('#password', 'PasswordGoesHere');
await page.click('button');
await page.waitForNavigation();
```

## 处理无限滚动

越来越多的动态站点开始使用无限滚动机制来不断加载新的内容。你可以根据实际情况来设置puppeteer向下滚动。

下面是一个向下滚动5次的示例代码，在每次滚动之间间隔一秒来等待内容加载：

```
for (let j = 0; j < 5; j++) {
  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  await page.waitFor(1000);
}
```


## 做一些优化

最后，有一些方法来优化你的代码，使得你可以更快的更顺滑的来爬去页面。下面这个例子是关于如何让puppeteer来禁止加载字体的和图片的：

```
await page.setRequestInterception(true);
page.on('request', (req) => {
 if (req.resourceType() == 'font' || req.resourceType() == 'image'){
   req.abort();
 }
 else {
   req.continue();
 }
});
```

你也可以通过类似的方法来禁止css，但是有些时候css也是你需要的动态数据的一部分，所以我可能不建议你这么做。


## 总结

上述基本上就是关于JavaScript构建网络爬虫所需要的全部内容了。如果你已经能够用内存来存储你的数据了，你可以进一步的使用本地存储来持久化这些数据，比如fs模块或者数据库或者通过网络API来发送到别的地方。

如果你刚开始接触网络爬虫—或者你已经了解网络爬虫但是对Node.js比较陌生，我希望本篇可以让你了解到通过使用那些非常棒的工具，Node.js也可以是非常棒的爬虫选择。我非常愿意在评论区回答任何问题！

