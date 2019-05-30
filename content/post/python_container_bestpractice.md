---
title: "python项目-容器化最佳实践"
date: 2019-05-30T10:40:08+08:00
draft: false
---

![](/img/python_container_bestpractice/code.png)

这是一篇关于python项目容器化的最佳实践(maybe)，如果你有更好的办法欢迎评论交流。本文基于`sanic`web框架演示如何容器化python项目，因为`sanic`不依赖外部服务器，有一个内建的性能不错的http库，所以我用这个来演示容器化python项目，理由就是：随着云原生的概念和微服务架构不断的普及，用一个微服务框架视乎跟切合需求，第二，sanic的启动是通过python来启动的`python app.py`，我觉得这更契合python容器化，而不是类似`nginx+python`容器化。
当然如果你没使用过sanic也不重要，下面关于最佳实践的相关章节都是普适性的，不妨接着读读看。

## 版本、环境控制

### [pyenv](https://github.com/pyenv/pyenv)

`pyenv`是一个python版本控制工具，优点类似于`nvm`这类工具，可以方便你控制和切换本地开发python的版本，对于容器化来说你需要你的基础镜像的python和本地版本一致。所以统一的版本是很必要的。

`brew install pyenv`

基本的使用配置方法参考连接中的官方文档即可，你不需要知道太多的特性，只需要能够了解如何使用和控制自己本地环境的python版本即可。

### [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv) 插件

python下比较流行的包管理工具`pip`，一般我们都用来装python的三方库，很方便但是同时也引入了一些问题，及时在`pyenv`下使用`pip`安装也会安装包到对应python版本的下的全局目录，这对单个项目来说引入了不必要的负担，所以我们可以用python**虚拟环境(venv)**来保证每个项目的包环境隔离，这样我们通过`requirements.txt`来控制包版本就方便多了，`pyenv`有`virtualenv`插件方便我们使用

`brew install pyenv-virtualenv`

同`pyenv`一样我们不需要关注过多的特性，你只需要能够在对应的项目下创建一个对应的虚拟环境，能够知道如何进入/退出虚拟环境即可。


## docker 镜像

接下来是重头戏的部分了，作为一个开发者你应该或多或少的了解到`Docker`和容器相关的东西了，首先我们就是需要一个本地docker环境，你可以到官网查看安装方法，这里就不占用篇幅了。我们集中在如何构建和优化一个python的容器化项目。

如果你遵照在`venv`中管理包版本，那么Dockerfile就很好写了，很简单：
```Dockerfile
# 基础镜像
FROM python:3.7.3

# 添加项目，安装依赖
ADD . /app
WORKDIR /app
RUN pip install -r requirements.txt

# 运行
ENTRYPOINT ["python", "app.py"]

```

这基本就是一个python项目最基本的必须步骤了，是不是很简单，你可以打包这个项目来跑一下看看

`docker build -t my-test-app .`

如果你只是了解docker，到这里基本就可以结束了，你创建了一个`sanic`项目，然后你打包了docker镜像，最后你通过`docker run -p`也成功的运行起来了这个项目。上面的步骤已经是笔者绕过了一些坑后总结的直达容器化的最简方法。

但是如果你想要生产可用，那么后两个章节你要注意一下。因为后两个章节主要是针对生产环境做相关优化的。

## 合理利用镜像缓存

你应该注意到`Dockerfile`里面就像脚本命令一样是一步一步的，所以如果你有一些其他项目的经验比如`Makefile`你肯定知道，这些构建系统都是可以利用缓存优化构建速度的，docker也一样，这里为了方便你需要记住简单几点原则就可以为日后构建任何项目来提供缓存优化思路了。
* 构建顺序从Dockerfile书写的*由上至下*顺序
* 如果某一处**命令**未发生文件变动，那么就能够被缓存
* 如果你是在构建镜像的过程中安装项目依赖比如`npm install`, `go mod install` ,`pip install`那么优先这些安装依赖的步骤在Dockerfile前面（上面），添加执行代码的部分在后面（下面）

举个栗子就更清晰了，我们试着优化一下上面的`Dockerfile`

```Dockerfile
# 基础镜像  ## 无需变化
FROM python:3.7.3

# 添加项目，安装依赖   ## 注意这里
# 我们单独添加了包文件，然后单独先安装依赖
COPY ./requirements.txt /
RUN pip install -r /requirements.txt

# 后面的部分也不需要变化
ADD . /app
WORKDIR /app

# 运行
ENTRYPOINT ["python", "app.py"]
```


注意由于我们把不经常变化的部分**安装依赖**放到了前面，而经常变动的部分**修改代码**放到了后面，这样就可以利用缓存来缩短大量的构建时间！

## 最小化镜像体积

这个部分对于初学者可能会稍微难理解一点，首先如果你完成了上面的步骤，你可以使用`docker images`来查看你构建的镜像的体积，你可以看到光是一个python基础镜像就有900+M，惊不惊喜？意不意外？一部分同学肯定能想到可以用`alpine`的python镜像来缩减体积，但是别忘了我们的安装依赖的部分也在`docker build`的过程中，所以如果你真的只是把基础镜像换成了`python:3.73-alpine`,那么你极有可能会在`pip install ..`的部分遭遇挫折！因为安装依赖的时候`alpine`缺少了很多必要组件如`gcc`等。所以你可能需要基于`alpine`镜像再包一个包含必要组件的基础镜像，这听起来有点可能有点绕口~。但是这么做，你就可能需要为每个项目单独写wapper image。

笔者这里抛出一个简单的更具普适性的方法，先看看`Dockerfile`吧：

```Dockerfile
# 从基础镜像安装依赖
FROM python:3.7.3 AS builder
RUN mkdir /install
WORKDIR /install
COPY requirements.txt /requirements.txt
RUN pip install --install-option="--prefix=/install" -r /requirements.txt

# 从alpine镜像运行程序
FROM python:3.7.3-alpine
# 注意from, 这里我们把之前安装好的依赖“偷”过来
COPY --from=builder /install /usr/local

# 最后就可以添加源码层，并运行了
COPY . /app
WORKDIR /app

ENTRYPOINT ["python", "app.py"]
```

这个`Dockerfile`使用的是docker的**分步构建**方法，有兴趣的同学可以自己看看官方文档，如果你比较懒直接用这个`Dockerfile`就可以了，因为这个是一个普适性的`Dockerfile`,试试构建以下把，你会发现镜像体积变成了90+M,惊不惊喜？意不意外？

### one more thing

有读者不太清楚为什么这里体积变小了，其实这里的最终体积是接近`alpine`基础镜像体积的，只不过因为上面说了`alpine`下构建会有一些问题，这里用了一个稍微巧妙一点的方法：

1. 用一个更完善的基础镜像(builder)执行构建过程比如`python:3.7.3`
2. 用另一个精简镜像(runner)来存放我们的源码比如`python:3.7.3-alpine`
3. 从builder里面把依赖偷到runner里面
4. runner运行项目

总结一下就是：**我们从一个完善的基础镜像来安装好我们的所有依赖，然后在`alpine`精简镜像里把这些构建好的依赖COPY过来**。这也是docker**分步构建**的主要优点之一（因为最终的镜像只依赖最后一步的基础镜像也就是`python:3.7.3-alpine`），说到这你再回头看看上面的`Dockerfile`是不是更清晰了？

## 总结

如果你是一个开发者，之前你还未使用过或者重视过容器化，那么从现在开始你就应该专注这一领域的知识了，因为容器不是运维的玩具，在持续交付中的一个非常有用的工具，他就是给开发者用的。对于本篇你如果有什么疑问或者建议都欢迎留言评论！