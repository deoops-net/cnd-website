---
title: "Docker是什么"
date: 2019-06-21T11:08:27+08:00
draft: false
---

![](https://cdn-images-1.medium.com/max/2600/1*k8n7Jx9UaLRAxum9HMp8nQ.png)

如果你是程序员或是技术人员，那么你应该至少听说过Docker：一个用来打包，运输和运行应用程序的“容器“技术。难以置信，但是确实全世界的开发者和大公司诸如谷歌，亚马逊都在支持这个项目。

无论你脑海中是否能马上想到一些相关的使用场景，我认为“容器”的一些基本概念还是很有必要了解的。即使现在网上已经有非常多的Docker使用手册，但是我没有找到对新手友好的一些概念性的指导，特别是诸如：容器是怎样构成的。所以，我希望这篇文章可以解决这类问题：）

首先我们来看看虚拟机和容器都是些什么，有哪些区别。

## 什么是容器和虚拟机？

容器和虚拟机在使用目的上是很相似的：通过隔离应用程序及其依赖到一个自包含的单元中，使他们能够随处运行。

更进一步说，容器和虚拟机技术移除了对物理硬件的依赖，更高效的利用计算资源，都是为了减少能源消耗和节约成本。

最主要的区别是容器和虚拟机用了不同的架构和实现方式，我们来更进一步了解一下。

## 虚拟机

虚拟机本质上是对真实计算机的模拟，执行应用程序的方式和计算机是一样的。虚拟机是跑在虚拟化硬件虚拟化的**hypervisior**之上的，虚拟化设施可以是一个主机也可以是一些裸金属硬件。

**译者注：**
此处删减了一部分关于hypervisor的内容，此部分不是太切合主题并占用较大篇幅，感兴趣的读者可以查看英文原文部分，这里只贴出插图部分：

![](https://cdn-images-1.medium.com/max/1600/1*RKPXdVaqHRzmQ5RPBH_d-g.png)


## 容器

容器不像虚拟机一样提供对硬件的虚拟化，容器只提供操作系统层的“虚拟化”。接下来我们详细看看容器技术。

容器在大部分表现上和虚拟机很像，隔离的运行空间，文件系统，网络命名空间，挂载隔离等。

一个很大的一点不同是，容器与容器之间是共享一个系统内核的。看看下图：

![](https://cdn-images-1.medium.com/max/1600/1*V5N9gJdnToIrgAgVJTtl_w.png)

可以看到容器只是处于用户空间，不像虚拟机拥有虚拟的硬件和独立的内核。每一个容器都有隔离的用户空间，单个主机中可以运行很多个容器。我们可以看到所有的操作系统层面的东西都是被容器见共享的。唯一不同的方式他们只创建了自己的bins和libs。这就是容器更轻量的原因。

## Docker又是干什么的呢？

Docker是一个基于Linux容器化技术的开源项目。它使用了很多linux内核的隔离技术像`namespaces`和`cgroups`来创建隔离的容器。

容器不是新技术，谷歌很多年前就有自己的容器化技术了。其他的基于Linux 的容器化技术像Solaris Zones，BSD jails和LXC等都已经存在很多年了。

那么为什么Docker发展的这么迅速呢？

1. **简单易用**：Docker对任何人来说—-开发者，系统管理员，架构师等都能够简单快速的使用容器化技术来构建和测试可移植应用。每个人都能够在自己的笔记本上来打包一个应用，然后运行在任何公有云，私有云上甚至裸金属上。真正做到了：“一次构建，随处运行”。
2. **速度**：Docker容器非常的快速和轻量。因为容器就是运行在内核之上的沙箱，只需要很少的资源即可。创建和运行Docker容器只需几秒钟，而虚拟机则要每次启动一个完整的操作系统。
3. **Docker Hub**Docker用户也从Docker Hub日渐丰富的生态系统中获得很多好处。你可以把它看作是一个Docker镜像版的App Store。Docker Hub已经有成千上万的由社区创建的公共镜像可用。几乎不用修改任何东西，你就可以轻松的找到和使用你需要的各种镜像。
4. **模块化和扩展能力**Docker可以帮助你更简单的把应用拆分成独立的容器。比如，你可以让Postgres数据库跑在一个容器中，一个Redis数据库跑在另一个容器中，而你的Node.js应用也在一个独立的容器中。通过Docker，可以很简单的把这些容器连接起来构架你的应用，未来需要扩展的时候更新这些组件也会更轻松。

话说回来， 谁不爱Docker的小蓝鲸呢？：）
（PS：这一杯谁不爱？😂）

![](https://cdn-images-1.medium.com/max/1600/1*sGHbxxLdm87_n7tKQS3EUg.png)

## Docker 基本概念

我们这里有一幅比较大的图，我们来一点点的了解Docker的基础部分。

![](https://cdn-images-1.medium.com/max/1600/1*K7p9dzD9zHuKEMgAcbSLPQ.png)

### Docker引擎

Docker引擎是用来供Docker运行的一层。它是管理容器，镜像，构建等步骤的一个轻量的运行时。它运行在原生的Linux系统中，主要包括：

1. 一个运行在主机Docker守护进程。
2. 一个Docker客户端用来和Docker守护进程通信发送命令。
3. 一个REST API用来远程和Docker守护进程通信。

### Docker 客户端

Docker 客户端才是终端用户用的东西，它就像是Docker的UI，比如，像下面的命令：

```c
docker build -t foo/bar .
```

你把指令发个了Docker客户端，Docker客户端又解析成Docker守护进程的命令发送给守护进程。

### Docker 守护进程

Docker 守护进程是真正执行客户端发来的命令的一方，比如build，run这些。Docker守护进程运行在主机中，但是作为用户你永远不会直接和它交互。Docker客户端也是运行在主机上的，但不是必须的，客户端也可以在其他的机器上远程和Docker守护进程通信

### Dockerfile

Dockerfile就是你写一系列指令用来构建镜像用的。这些指令都是：

* `RUN apt-get -y install some-package`： 来安装一个包。
* `EXPOSE 8000`: 暴露一个端口。
* `ENV ANT_HOME /usr/local/apache-ant`: 传递一个环境变量。

诸如这些，当你准备好你的Dockerfile时，就可以用Build命来构建镜像了。下面是一个Dockerfile的示例：

```c
# Start with ubuntu 14.04
FROM ubuntu:14.04

MAINTAINER preethi kasireddy iam.preethi.k@gmail.com

# For SSH access and port redirection
ENV ROOTPASSWORD sample

# Turn off prompts during installations
ENV DEBIAN_FRONTEND noninteractive
RUN echo "debconf shared/accepted-oracle-license-v1-1 select true" | debconf-set-selections
RUN echo "debconf shared/accepted-oracle-license-v1-1 seen true" | debconf-set-selections

# Update packages
RUN apt-get -y update

# Install system tools / libraries
RUN apt-get -y install python3-software-properties \
    software-properties-common \
    bzip2 \
	ssh \
    net-tools \
    vim \
    curl \
    expect \
    git \
    nano \
    wget \
    build-essential \
    dialog \
	make \
    build-essential \
    checkinstall \
    bridge-utils \
    virt-viewer \
    python-pip \
    python-setuptools \
    python-dev
# Install Node, npm
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get install -y nodejs

# Add oracle-jdk7 to repositories
RUN add-apt-repository ppa:webupd8team/java

# Make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
# Update apt
RUN apt-get -y update

# Install oracle-jdk7
RUN apt-get -y install oracle-java7-installer

# Export JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-7-oracle

# Run sshd
RUN apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo "root:$ROOTPASSWORD" | chpasswd
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Expose Node.js app port

# Run sshd
RUN apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo "root:$ROOTPASSWORD" | chpasswd
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Expose Node.js app port
EXPOSE 8000

# Create tap-to-android app directory
RUN mkdir -p /usr/src/my-app
WORKDIR /usr/src/my-app

# Install app dependencies
COPY . /usr/src/my-app
RUN npm install

# Add entrypoint
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "start"]
```

### Docker 镜像

Dokcer镜像是通过你写的Dockerfile构建出来的一个只读的文件包，和一个启动入口。镜像主要用来定义你打包的应用和其依赖是什么样子的，然后是定义哪个命令来启动进程。

### 联合文件系统

Docker使用联合文件系统的特性来构建镜像。你可以把联合文件系统想象成一个栈，很多个独立的文件系统层透明的覆盖于一个初始文件系统层。

如果多个目录的路径相同，那么他们会最终合并成一个目录，这样可以避免创建很多副本目录。但是当一个层需要写入时时什么样的呢？联合文件系统的“写时复制”技术是专门处理写操作的，当需要在某一层写入时会在可写层创建一个对应的副本，然后所有的修改都覆盖这个副本，只读层并没有收到影响。

分层的文件系统有两点主要的好处：
1. **利于复用**：分层可以在每次创建和运行容器时利用已有的只读层，这样启动Docker容器就会变得很快，很容易。
2. **易于修改**：修改也会变得很快，当你修改一个镜像的时候，Docker只会去告诉那些需要变动的层作出修改即可。

### 卷

卷是容器“数据”的部分，初始化于容器被创建的时候。卷可以持久化容器产生的数据。卷和联合文件系统不是一体的，卷主要有主机文件系统提供一个外部的目录给容器使用。所以当你重建，更新，或者销毁容器时数据卷将会被保留下来不被销毁。

### Docker 容器

一个Docker容器，像上面讨论的一样主要是用来包装应用到一个不可见的盒子里，这个盒子包含了应用程序运行所需要的所有东西。包括代码，运行时，系统接口等。由于镜像是只读的，Docker在镜像的顶层创建可读写的文件系统来创建一个容器，如下图：

![](https://cdn-images-1.medium.com/max/1600/1*hZgRPWerZVbaGT8jJiJZVQ.png)

还需要说的是，当创建容器的时候，Docker还会创建一个网络接口给容器，让他能够和主机的本地网络进行通信。

当你成功的运行起一次容器之后，在任何地方运行这个容器都不会有问题了，并且不需要任何的修改。


### “双击“容器

我一直很好奇的一件事是容器时如何实现的呢？尤其是容器并没有使用任何基础设施的抽象。通过大量的阅读，我终于可以试着给你解释清楚：）

容器本身只是一个不可见的抽象概念用来描述一些不同的共同工作的特性（“进程”，“文件系统”，“网络”）。我们来进一步看看：

**1. 命名空间 Namespaces**

命名空间给了容器一个隔离的视角在系统之中。这就可以用来限制容器可以看到什么和访问什么。当运行容器的时候，Docker负责创建这些命名空间。

Docker主要用了下面的几种命名空间：

a. **网络 命名空间**:  网络命名空间可以让容器拥有隔离的网络设备，IP地址，IP路由表等。

b. **PID 命名空间**：PID是进程唯一编号。如果你运行`ps aux`可以看到当前系统中正在运行的所有进程的PID. PID命名空间就是给容器一个独立的空间这个空间如果运行`ps aux`只能看到一个**PID1**的进程。

c. **挂载 命名空间**： Linux的文件系统和设备都是通过挂载才可使用的。所以独立的挂载命名空间，将会拥有一个独立的关于挂载信息的视角。

d. **IPC 命名空间**： IPC是进程间通信的意思，所以顾名思义IPC命名空间可以现在多个容器中的进程间的通信。

f. **用户 命名空间**：用户命名空间主要是让进程拥有对UID（user ID）和GID（group ID）不同的视野，所以容器内部的用户和容器外部的用户PID，GID会有不同。（PS：这块其实是有一些安全隐患的）

Docker使用这些命名空间来让一个进程和其他进程处于相对隔离的空间中。另一个用来隔离的特性是**cgroups**。

**2. Control groups**

cgroup是Linux内核提供的另一个特性用来对进程使用的系统资源进行限制如：CPU，内存，网络等。cgroup可是让Docker容器只是用它需要的资源。换句话说通过限制容器可用的最大资源来保障系统不会应为某一个容器超载而是主机系统崩溃。

最后，联合文件系统是Docker用到的另一个特性。

**3. 隔离的联合文件系统**

Docker镜像的部分已经有过讨论：）

这些基本上就是Docker容器实现的部分（然而魔鬼存在于细节中，内部的实现还是有很多复杂的部分的）。

## Docker未来：Docker和虚拟机将会并存

即使Docker发展的十分迅速。我不太相信它会完全替代虚拟机。容器将会有更多的市场，但是还有很多场景使用虚拟机是更好的选择。

比如，你需要在多个服务器运行多个不同应用，用虚拟机可能会更好。另一方面，如果你需要运行很多相同应用的实例，Docker用处更大。

此外，即使容器允许你将用用拆分为不同的独立服务，随着越来的越多的部分需要维护，那也意味着将会有更多的管理成本。

Docker容器的安全问题也是经常被提及的部分。由于容器是共享内核，容器间的屏障相对虚拟机来说跟脆弱。当安全问题对业务很敏感时，开发者更倾向于使用虚拟机。

当然，随着容器不断发展，这些安全类的问题也会逐步完善。

## 总结

我希望现在你对Docker有了更进一步的理解，或者未来某一天真的应用到你的项目中。

和以往一样，如果我有写错的地方或者你需要一些帮助，欢迎在评论区留言。：）
