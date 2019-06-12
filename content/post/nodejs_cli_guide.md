---
title: "Node.js构建CLI工具"
date: 2019-06-11T09:21:21+08:00
draft: false
keywords: nodejs, cli, guide
---

![](https://cdn-images-1.medium.com/max/1600/1*aFcxuEzjtUg-1C9XxHpmHQ.jpeg)

原文链接：[https://medium.com/free-code-camp/how-to-build-a-cli-tool-in-nodejs-bc4f67d898ec](https://medium.com/free-code-camp/how-to-build-a-cli-tool-in-nodejs-bc4f67d898ec)


做为开发者，我们都会或多或少的用到CLi工具。比如git，cloud shell是，我们在任何地方都会用到。是时候构建你自己的命令行工具了，我们将会使用heroku的oclif框架来做这些事情。

## 什么是oclif

这是一个快速构建CLI工具的开源框架，并且是知名的Heroku开发的。

## 构建什么工具？

我们将会构建一个TODO列表命令行工具，主要有四个命令：

* 创建新任务
* 查看所有任务
* 更新任务
* 删除任务

## 初始化项目

Oclif可以生成两种类型的项目 —

1. 只有一个命令的项目
2. 包含多个命令的项目，并且允许有嵌套命令

在这篇文章中，我们需要的是一个多命令工具，所以我们可以用下面的方法生成：

```c
npx oclif multi todocli
```

运行上面的命令然后跟着指令继续就可以在当前目录生成一个叫做todocli的命令行项目。

现在，让我们进入到项目目录，然后运行help命令：

```c
cd todocli && ./bin/run --help
```

显示如下：

```c
> USAGE   
    $ todocli [COMMAND]  
  COMMANDS
    hello   
    help   display help for todocli
```

通过help可以查看有哪些可用命令以及相关的文档。

![](https://cdn-images-1.medium.com/max/1600/1*gN-2A6sZ5ZgC8t1XOEsxZA.png)

## 项目结构

我们需要一个存储系统来保存我们的任务，我们将是用一个叫lowdb的数据，他是一个非常简单的json文件存储系统。刚刚好适合这个项目😊

安装：

```c
npm i lowdb --save
```

在项目的根目录下创建一个db.json文件。这个文件将用来存储我们的数据。然后我们安装lowdb。现在让我们在src目录下创建db.js，主要是我们数据库相关的代码：

![](https://cdn-images-1.medium.com/max/1600/1*-VzgTdKmAoVX54hUzPeGHg.png)

这里我们简单的引入了数据库包，然后定义了一个空的todos数组，数据就代表我们将要存储的数据（就像你平时用的SQL那样）

## 添加任务

oclif提供了一个非常平滑的生成命令的方法。运行下面的指令：

```c
oclif command add
```

这个命令会创建一个叫add.js的文件到src/commands目录下。现在把这个文件的内容替换成下图的代码：

![](https://cdn-images-1.medium.com/max/1600/1*UrD0XgynHAEs6uKwPT4saQ.png)

这个文件有一些关键的组件：

* 一个运行函数，是这个命令的入口函数
* 一个命令描述，用来显示这个命令的文档
* 参数，用来描述传递给命令的命令行参数

这里我们用一个字符串参数task，像下面这样

```c
./bin/run add --task="welcome task"
```

这个命令将会添加一个新的任务到我们的数据库中，然后打印出相关的的返回。

## 显示任务

![](https://cdn-images-1.medium.com/max/1600/1*P6ya9RW2QXI_R-g_ew0wnQ.png)

上图是show.js，我们将要升序的显示所有的命令。这里我们还通过chalkjs来给我们的命令添加一点颜色，这样会更好看一些。

![](https://cdn-images-1.medium.com/max/1600/1*durlaPJdXJxx-d6L8aRXyg.png)

## 更新任务

![](https://cdn-images-1.medium.com/max/1600/1*caWjcxJFrDWrE3KfOEpz0A.png)

为了简单，我们只把任务更新为已完成即可。这样我们就只需要传递一个任务id的命令行参数就行了。

```c
./bin/run update --id=1
```


## 删除任务

![](https://cdn-images-1.medium.com/max/1600/1*6gPOA9f-JgJ2Xwik-uihYg.png)

删除任务更加直观了：我们传递一个id参数然后从数据库中移除这个id的任务即可。

## 即将完成！

就这样，我们构建了一个非常简单的todocli。如果我们希望像其他一般的cli那样或者让我们的朋友使用它，我们需要发布一个npm包。下面我们就演示如何发布到npm。

## 构建并发布到npm

首先你需要确定你已经有一个npm账户了，然后通过命令行登录npm

```c
npm login
```

然后在项目目录下运行

```c
npm run prepack
```

这个命令会打包好项目，然后对npm发布做一些预处理工作，比如一个说明文档以及相关的命令描述等。

现在就可以发布到npm了：

```c
npm publish
```

如果一切正常，包就已经发布到npm上了。如果不太正常，你可以检查一下项目名称和版本。

现在，我们可以直接通过npm来使用我们自己写的工具了：

```c
npm i -g togocli
```

然后任何人都可以在任何地方来使用我们的命令行工具了😊

```c
> todocli add --task="Great task!!"
> todocli show
> todocli update --id=1
> todocli remove --id=1
```

如果你已经跟着文章到了这里，那么恭喜😃你很棒！你可以完成一个小任务：

## 任务

分配给任务的id不适合，如何处理？你可以在评论区写出答案。
祝你好运，感谢你的阅读！


