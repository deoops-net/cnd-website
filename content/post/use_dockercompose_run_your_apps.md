---
title: "用Docker Compose来运行你的应用"
date: 2019-05-22T10:43:03+08:00
draft: false
---

翻译至：[https://medium.com/rate-engineering/using-docker-containers-to-run-a-distributed-application-locally-eeabd360bca3](https://medium.com/rate-engineering/using-docker-containers-to-run-a-distributed-application-locally-eeabd360bca3)

翻译：于洋

校稿：李飞

阅读时间：约8分钟

![](https://cdn-images-1.medium.com/max/1600/1*QVFjsW8gyIXeCUJucmK4XA.png)

### 前言

本文假设您对Docker，Docker Compose以及生态系统中使用的关键术语有一些基本的了解。如果您需要加快速度，Docker Docs 的“入门”部分是一个很好的起点。

本篇是系列文章的第2部分，系列文章主要分享了我们如何用Docker来容器化我们应用的相关经验。在第1部分中，我们讨论了如何将Docker容器安装于开发环境。在这篇文章中，我们将讨论如何利用Docker容器的优势来运行多容器应用程序（译者注：很多时候你可能不单单需要跑某一个服务，更多的时候你需要相关的依赖服务被部署，如你可能需要部署一个java服务但同时还需要依赖tomcat服务器）。

### 动机

此时，我们意识到Docker容器不应该用作开发环境，而应该用作托管环境。我们仍然看到了容器化的好处，主要是作为开发人员轻松自我托管应用程序的一种方式。这允许开发人员独立进行集成测试，我们认为这使得生产力得到显着提升。

因此，我们继续将我们的应用程序配置为Compose服务。以下文本详细介绍了构建Compose配置所采取的步骤。

### 格式

[官方文档](https://docs.docker.com/compose/gettingstarted/)已经做了很棒的工作来教你如何在Compose中运行多个服务。这篇文章不是重复他们所做的，而是旨在为任何寻求构建Compose配置的开发人员提供简明扼要的指导。我们将重点关注您需要注意的关键组件。

### 构建步骤

构建Compose配置可分为6个主要步骤：

1. 将您的应用拆分为服务
2. 拉取或构建镜像
3. 配置环境变量
4. 配置网络
5. 设置持久卷

### 建立和运行

1. 将您的应用拆分为服务
第一项业务是考虑如何将服务拆分为不同的服务。在第1部分的简单Web服务器示例的基础上，我们可以引入一个充当视图层的简单客户端应用程序。与服务器和数据库一起，它将运行由3个不同的服务组成的一个简单的Web应用程序：client ，server ，database。

client和server服务从内置的指令（即Dockerfiles）构建，而database服务是一个公开镜像（即postgres）。这意味着您需要1个Dockerfile用于客户端，1个Dockerfile用于服务器。

假设我们有一个用React编写的示例客户端应用程序，以下可能是一个简单的Dockerfile：

```Dockerfile

# Base image is Alpine with latest stale Node installed. 
FROM node:alpine

# set working directory for subsequent commands
WORKDIR /front-end

# leverage build cache by copying npm package files first
COPY ./package*.json ./

RUN npm install
```

我已经在第1部分中为我们的Go服务器包含了[Dockerfile](https://medium.com/@balibone/using-docker-containers-as-development-machines-4de8199fc662) 。

2. 拉取或构建图像

对于某些服务，您可能不需要使用自定义Dockerfile构建，并且DockerHub上的公共映像就足够了。您可以通过声明以下内容来指示Compose从DockerHub中提取：
`image: "<repository_name>:<tag>"`

例如，我们的数据库服务 通过声明以下内容来提取在Alpine Linux上运行的Postgres的公共映像：
`image: "postgres:alpine"`

但是，在大多数情况下，您可能会使用自定义Dockerfiles来构建镜像，这将需要指定构建上下文。这样compose file才能够根据路径找到服务所需的镜像。此路径必须包含Dockerfile。以下是定义构建上下文的一些常用方法：
```Dockerfile
# 1. Absoulute path
build: .

# 2. Relative path
build: ../path/to/app/

# 3. Git repo URL 
build: https://github.com/docker/rootfs.git

# 4. Git repo URL with branch 
build: https://github.com/docker/rootfs.git#develop

# 5. Git repo URL with access token (for accessing private repos)
build: https://<ACCESS_TOKEN>:@github.com/docker/rootfs.git
view raw
```

提示1：从远端构建无疑比从磁盘上的位置构建要慢，所以如果您的开发人员事先已经克隆了repo，那么最好从本地路径构建。但是，注意：使用Git URL对CI构建脚本特别有用！

提示2：您可以通过最小化构建层数来实现精益图像。您可以使用[Dive](https://github.com/wagoodman/dive)来帮助您完成此任务。它通过研究每次添加图像层时如何在构建过程中更改其内容来分析Docker镜像。

3. 配置环境变量
大多数应用程序使用环境变量进行初始化和启动。例如，我们可以提供环境变量POSTGRES_USER并POSTGRES_DB定义服务的默认超级用户和数据库database。这些变量可以在compose文件中定义，如下所示：

```Dockerfile
database: 
    image: "postgres:alpine"
    environment: 
      POSTGRES_USER: postgres
      POSTGRES_DB: mydb
```

除此之外，您还可以在.env文件中定义环境变量  ，并将其放在与撰写文件相同的目录中。它将在Compose启动时自动读取。如：
```Dockerfile
POSTGRES_USER=postgres
POSTGRES_DB=mydb
```

然后，您可以通过包含其名称而不指定值来将这些变量传递到容器中。

4. 配置网络
容器通过Compose创建的内部网络相互通信。容器通过其服务名称相互引用。因此，如果Web服务器在容器中的端口5000上运行，则客户端应用程序可以通过内部Compose网络连接到服务器web-server:5000 (`译者注：假设web-server是服务器的容器名`)。

如果您尝试从宿主机连接，则需要在主机端口上公开服务，格式`<host port>:<container port>`如下：`4200:5000 `。

5. 设置(持久)卷
在大多数情况下，我们不希望每次database关闭服务时都会丢失数据库内容(`译者注：Docker 容器是无状态的，默认情况下所有容器内部服务产生的数据都会随着容器的销毁而销毁`)。保留数据库数据的常用方法是挂载docker volume。如下：
```Dockerfile
database: 
    image: "postgres:alpine"
    environment: 
      POSTGRES_USER: postgres
      POSTGRES_DB: mydb
    ports: 
      - "4201:5432"
    # persist to a named volume
    volumes:
      - server_db:/var/lib/postgresql/data

volumes: 
  server_db:
```


提示：我们使用的任何命名卷都必须在顶级volumes键中声明。

6. 构建和运行
现在，你将为你的服务构建容器镜像并运行容器。

构建服务：`docker-compose build [SERVICE]`
生成并运行容器：`docker-compose up [SERVICE]`
查看正在运行的容器：`docker-compose ps [SERVICE]`

![](https://cdn-images-1.medium.com/max/1600/1*2qCOF1pXoHe79J48Zhlhsg.png)
提示：docker-compose up 的 标准输出可能会偶尔挂起，让您认为应用程序没有响应。因此，您可以使用-d标志运行分离的容器，并手动`tail`容器日志`docker-compose logs --follow [SERVICE...]`

### 结论

如果您已经按照上面提到的所有步骤操作，那么最终会得到一个简单的撰写文件，如下所示：

```Dockerfile
version: "3"
services: 
  web-client: 
    build: https://github.com/youraccount/web-client.git
    ports: 
      - "4210::5000"
    entrypoint: "npm run dev"

  web-server:
    build: https://github.com/youraccount/web-server.git
    ports: 
      - "4200:5000"
    # just keep server alive
    entrypoint: "tail -f /dev/null"

  database: 
    image: "postgres:alpine"
    environment: 
      POSTGRES_USER: postgres
      POSTGRES_DB: mydb
    ports: 
      - "4201:5432"
    volumes:
      - server_db:/var/lib/postgresql/data

volumes: 
  server_db:
```

通过此设置，任何开发人员都可以运行这些服务，甚至无需克隆存储库。他们只需要在他们的机器上安装Docker。 无论您是何种类型的工程师，Docker和Compose的“构建一次，随处运行”性质对于开发和测试都非常有用。

接下来，您可以轻松地向Compose配置添加更多服务，并在系统增长时使用副本进行扩展。这样就可以将系统作为多容器应用程序部署到生产环境中。

以下部分提供了一些示例，说明如何将Compose集成到软件开发生命周期的不同阶段。

**用例示例**

[LaraDock](https://github.com/laradock/laradock)

![](https://cdn-images-1.medium.com/max/1600/1*9CoXjqN6KMqHrs3uGzmG0A.jpeg)

LaraDock提供了一个预先配置且易于使用的PHP开发环境，类似于第1部分中讨论的环境。通过大量使用Compose服务来代表LaraDock技术堆栈中的“层”，LaraDock的高度可定制性质是可能的。例如，如果您使用LaraDock运行LAMP堆栈（即Linux，Apache，MySQL，PHP），则4个组件中的每一个都将作为Compose服务运行。

看看他们的[compose file](https://github.com/laradock/laradock/blob/master/docker-compose.yml)，了解Compose应用程序可以获得多大的成果！

**测试**：
[Stellar 集成测试](https://github.com/stellar/integration-tests)

Stellar团队利用Compose对Travis CI执行集成测试。对Stellar区块链网络进行集成测试需要其不同的组件（即金融机构（FI）服务器，合规服务器，DB等）同时启动和运行。为了实现这一点，不同的组件被封装在不同的容器中，然后由Compose提出。

![](https://cdn-images-1.medium.com/max/1600/1*rBobbYbYxgJT9vYOyh8P_w.png)

一旦所有组件都启动，Travis CI将执行script.sh以运行集成测试。在[这里](https://github.com/stellar/integration-tests/blob/master/docker-compose.yml)查看他们的撰写文件 。

**生产**：
[蓝绿发布](https://octopus.com/docs/deployment-patterns/blue-green-deployments)

在将代码库更改部署到生产环境时，蓝绿部署是一种重要的技术，可最大限度地减少服务停机时间。使用这种技术，软件将被部署到具有相同配置的两个不同的生产环境（即“蓝色”和“绿色”）。在任何时候，其中至少有一个将处于活动状态并在生产中处理请求，而另一个处于空闲状态并用作故障转移。假设活动环境为蓝色，闲置环境为绿色(`译者注：蓝绿发布类似于A/B测试方法，通过全量切换负载到新的版本中来测试功能，一旦出现故障马上切换/回滚负载到另一个区域`)。

如果要发布新版本的软件，可以先将其部署到空闲的绿色环境中。一旦确保软件以绿色正常工作，您可以将路由切换为指向绿色而不是蓝色。与简单地将新版本部署到单个共享环境相比，部署后的这种热交换环境可以导致更短的停机时间。

要在绿色和蓝色环境之间进行热交换，需要一种服务发现机制。此机制将自动获取活动的环境，并使用它为传入的HTTP请求提供内容。然后，开发人员可以通过保持适当的环境保持活动来选择在生产中运行的代码库版本。当然，您也可以将绿色和蓝色同时作为故障转移系统运行。然后，您可以指定发现工具在两个环境都处于活动状态时应优先考虑哪个环境。

GitHub上的这个概念证明项目使用Compose实现蓝绿色部署。正在使用的示例应用程序是Nginx Web服务器。它通过Registrator 和Consul实现服务发现。Registrator是一种通过检查其容器是否在线来跟踪Compose服务可用性的工具。然后，它会将这些服务注册/注销到它所连接的服务注册表，在这种情况下是Consul。

![](https://cdn-images-1.medium.com/max/1600/1*aE4ALY3R8CipUZzpD2XPKQ.png)

仓库中关键的文件是：

* [docker-compose-consul.yml](https://github.com/Sinkler/docker-nginx-blue-green/blob/master/docker-compose-consul.yml)  - 定义Consul和Registrator服务。
* [docker-compose.yml](https://github.com/Sinkler/docker-nginx-blue-green/blob/master/docker-compose.yml)  - 定义蓝色和绿色服务，以及负载均衡器Nginx 服务。
* [deploy.sh](https://github.com/Sinkler/docker-nginx-blue-green/blob/master/deploy.sh)  - 用于模拟应用程序部署。
* [rollback.sh](https://github.com/Sinkler/docker-nginx-blue-green/blob/master/rollback.sh)  - 用于模拟从1个环境到另一个环境的应用程序回滚。
事实上，Consul，Registrator和Compose的这种组合是在Docker应用程序中实现服务发现的流行选择。

### 还很好奇？
如果您想探索更多与Docker相关的项目，这个页面提供了一个很好的选择：https://github.com/veggiemonk/awesome-docker