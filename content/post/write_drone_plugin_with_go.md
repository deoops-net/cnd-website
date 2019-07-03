---
title: "用Go写drone插件"
date: 2019-07-03T17:17:51+08:00
draft: false
---

![](https://www.markeditor.com/file/get/d8f0c7fa2eebbb1dbede8d6b078c2b8d.png)

**Drone**是一个CI/CD的新起之秀，drone的主要特性就是所有的CI/CD流程都是借助Docker容器来构建。所以Drone的pipline非常容易书写和维护。并且由于直接把Docker容器当做一等公民，那么我们在各种场景下定制化自己的插件也将变得非常便利。因为最终Drone都是调用的插件Docker容器，所以开发团队可以使用任意自己熟练擅长的语言去定制内部自定义插件。

本文我们一起动手用Go写一个drone插件！通过一个完整的简单的流程，我们一起学习如何定制化自己的CI/CD流程。baba再也不用担心CI/CD不够完善了！

## 前期准备

1. Docker Hub 账户，为了简化流程，所以我们此次把我们的插件镜像发布到公共镜像仓库。
2. Golang 开发环境，这个不用多说了😉
3. Docker 本地环境，用来构建和发布我们插件的镜像。

## 设计插件接口

首先我们要关注，当我们在写Dronefile(.drone.yml)的时候，我们需要Drone给我们的插件传递什么信息：

![](https://www.markeditor.com/file/get/23fcb78ec2c7ddaf4d24f07ded61d609.png)

> Drone在启动我们的镜像的时候会把`settings`字段下的参数以前缀为`PLUGIN_`的**全大写环境变量**的方式传入给插件。

```bash
PLUGIN_CHANNEL=general
PLUGIN_WEBHOOK=https://hooks.slack.com/services/...
PLUGIN_TEXT=hello
```

**注意**： Drone传递给插件的环境变量支持大部分的数据类型比如：string, integer, float, boolean, arrary等。传入数组时是一个以逗号分隔的字符串。比如有如下配置文件：

```yaml
...
    settings:
        names: [ john, tom]
```

那么传递的参数是下面这样的：

`PLUGIN_NAMES=john,tom`


## 开始写代码

我们在之前的设置中给我们讲要写的插件传递了两个参数

* webhook：一个需要插件去请求的URL
* data：代表我们想传递给插件的数据

接下来我们就在我们的Go代码中使用它们，下面是一个简单的示例：

![](https://www.markeditor.com/file/get/5bcf9df72607ba7138263e1e8a67cde1.png)


## 发布测试

接下来我们将要把我们写好的插件打包成Docker镜像，然后发不到Docker Hub上，最终我们在我们的Drone平台上来测试这个插件。

### 编译

为了最小化我们的插件，我们将要使用`alpine`镜像来构建我们的插件，如果你不清楚如何最小化构建Docker镜像，可以翻阅作者的历史文章，里面记录了一些Dockerfile最佳实践的方法。话不多说开始吧！

先编译好alpine的目标二进制文件：

`GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o my-awesome-plugin`

然后基于此可执行二进制我们就可以构建我们的插件了，下面是一个简单的Dockerfile示例：

![](https://www.markeditor.com/file/get/aa50ea2daad8950387917628ef7a494a.png)


### 构建发布

下面的流程就比较简单了，使用Docker来构建你自己的公有镜像并发不到Docker Hub就可以了，如果你对这里不太熟悉的话，可以去看看官网文档，或者使用`docker build -h`和`docker push -h`来查看帮助文档。这里笔者只列出自己构建的命令：

`docker build -t dayuoba/my-awesome-plugin .`
`docker push dayuoba/my-awesome-plugin`

等待一会儿就好了，如果这里你想偷懒你可以直接用笔者构建好的镜像来测试。`docker pull dayuoba/my-awesome-plugin`

### 测试插件
接下来我们就可以测试我们的插件了，初始化好一个Drone下的项目，添加`.drone.yml`文件。然后push等待测试即可。

![](https://www.markeditor.com/file/get/23fcb78ec2c7ddaf4d24f07ded61d609.png)

接下来就是去Drone上面看看我们的构建日志来测试我们的插件了。

![](https://www.markeditor.com/file/get/fc5f5097a32c59a7d84e60952f37bd14.png)


## 总结

到这儿，这篇文章基本就结束了，参照这个思路你就可以按照自己业务的需求来构建自己的Drone插件了。
