---
title: "用Docker做开发环境"
date: 2019-05-23T12:16:29+08:00
draft: false
---

翻译至：[https://medium.com/rate-engineering/using-docker-containers-to-run-a-distributed-application-locally-eeabd360bca3](https://medium.com/rate-engineering/using-docker-containers-to-run-a-distributed-application-locally-eeabd360bca3)
阅读时间：约8分钟
## 前言
本文假设你对Docker，Docker Compose以及其生态系统中使用的关键术语有一些基本的了解。 如果你需要快速了解这些基本概念，Docker官方文档中的“Get Started”一节是一个很好的阅读起点。这是我们两篇介绍容器应用技术经验系列文章中的第一篇。

在第1部分（本文）中，我们将讨论将Docker容器转换为开发机器所采取的步骤，以及我们在此过程中学到的经验教训。在[第2部分](https://blog.wegeek.fun/post/use_dockercompose_run_your_apps/)中，我们将讨论如何使用Docker容器来运行分布式应用程序并改进我们的测试工作流程。
## 我们的动机
开发人员通常必须下载许多工具来设置一套开发环境。 用一个简单的Web服务器来举例，这意味着下载和安装语言库，数据库客户端，执行数据库迁移的外部CLI工具，GUI代码编辑器，GUI数据库客户端。 更复杂的是，其他开发人员也可能使用不同操作系统的不同机器。 这很有可能导致初始设置或日常工作流程中可能出现的跨平台兼容性问题。

一个在macbook terminal下工作正常的迁移脚本，往往会在windows powershell或其他命令行工具中执行时出现问题。我们亲身经历过这样的问题，这些问题往往不能直接解决。原因很明显，例如终端和Powershell之间的字符编码差异，以及CRLF / LF转换等更为突出的原因。

我们还希望全面简化所有应用程序的初始设置过程。 这将加速加入我们团队的新工程师的入职流程。

最后，我们希望多个开发人员能够在本地运行集成测试，而不必依赖单个共享远程服务器。 这将允许不同的开发人员在应用程序的不同版本/分支上执行集成测试，而无需在我们的远程服务器上轮流托管它。 当然，某些测试需要在远程实例上进行测试，以便最好地复制生产环境。 但是对于更简单的测试，开发人员不需要依赖远程服务器。

这些要点可归纳为以下要求：

1. **缓解跨平台兼容性问题。**
2. **简化开发环境的设置。**
3. **允许开发人员进行独立的集成测试。**
## 解决方案
在寻找解决方案时，我们意识到Docker可能符合要求。使用容器作为开发机器将允许开发人员以最少的设置开始。 原则上，开发环境将通过在容器中运行来从主机OS中抽象出来。

这允许开发人员在基于相同操作系统和工具集上运行的通用容器配置下工作，从而几乎完全消除跨平台兼容性问题。 这符合我们的第一个要求。

从理论上讲，开发人员只需要下载Docker和他们选择的代码编辑器，而不必安装外部工具和依赖项。 代码编辑将按照正常情况从编辑器完成，并且所有修改将从主机同步到容器。 这简化了初始设置，符合我们的第二个要求。

实际上，使用正在运行的容器进行开发是可选的。 开发人员可能只是使用一些容器来开发他/她正在处理的服务，而其他容器将仅用于托管和运行应用程序。 这使开发人员能够通过为所需服务启动容器来进行按需集成测试，从而满足我们的第三个要求。

然而，在实践中，它并不像我们想象的那样无缝和直接，正如我们将在下文中看到的那样。

## 探索和实践
### **示例应用**
为了提供出现问题的上下文，我们假设我们正在构建一个简单的Go Web服务器。 我们将它作为一个多容器应用程序运行，并使用Docker Compose进行编排。 这个应用程序将包含2个服务，1个用于我们的服务器，1个用于我们的数据库。

**Compose file**
```
version: "3"
services: 

  web-server:
    build: .
    depends_on:
      - database
    ports: 
      - "4200:5000"
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

**Dockerfile**
```
FROM golang:latest

# Install tools required for project  (postgres, git, gcc, curl, glide) less 
# likely to change, so put it up here to take advantage of cache
RUN apk add postgresql;\
    apk add git; \
    apk add build-base; \
    apk add curl; \
    curl https://glide.sh/get | sh;

# Set working directory 
WORKDIR /go/src/github.com/balibone/web-server

# Copy over glide files. Build cache will only be invalidated if glide files were changed. 
COPY glide.* ./

# Copy over bash script used to install CLI tools. Build cache will only be 
# invalidated if this bash script was changed. 
COPY get_dependencies.sh ./

# Install CLI tools & dependecies 
RUN /bin/sh ./get_dependencies.sh &&\
    glide install

# Copy over source code
COPY . .
```

### **实现双向文件同步**
第一项业务是确保我们在主机上执行的任何代码编辑都自动同步到容器中。这使得开发体验感觉更自然。

这只能通过绑定挂载系统目录实现，它的工作方式类似于Linux的mount命令。当我们将主机中的路径挂载到容器中的路径时，无论容器目录是否具有挂载时主机目录中不存在的文件，主机目录的内容都将完全覆盖容器目录中的任何内容。结果是容器目录将是主机目录的精确快照。

### **问题：没有依赖关系/过时的依赖关系**
这就是我们的第一个问题。到目前为止，新开发人员只克隆了项目，并且没有安装任何依赖项。由于我们最初需求是不要求开发人员去下载工具，开发人员无法运行滑动安装。 因此，主机目录将不具有依赖项文件夹，或者它们将过时。然后将这种错误的依赖状态复制到容器中。

即使我们在镜像构建过程中将依赖项作为Dockerfile中的指令安装，它们也无效，因为目录绑定会覆盖这些文件夹。这意味着一旦创建容器，我们就无法编译和运行服务器，因为它没有完整的依赖项集。这首先会破坏我们使用这些容器的目的。

因此，我们需要防止在镜像构建期间安装的依赖项文件夹被绑定的系统目录覆盖，这可以通过多种方式完成。
### **可能的解决方案：将依赖项绑定到named volumes**
Named Volume 就是自己取名字手动创建一个数据卷，负责容器的数据持久化
这样做会使这些文件夹免受绑定系统目录的影响。它们将从存储在附加目录的数据中拉取和推送。 缺点是这些文件夹对系统目录是透明的，因此它们也不会从容器同步到主机。

事实上，这不是我们想要的。 我们需要在主机上存在依赖项文件夹，这样我们的代码编辑器就不会在外部库已经导入后仍提示代码错误。

![](/img/using_docker_containers_as_development_machines/dFwKOSWDvJsWXEDM.png)

当然，如果你认为这不会妨碍你的开发体验，那么你会很高兴这么做，因为依赖已经存在于容器中，并且服务器可以在那里编译。但是如果你想解决这个问题，那就意味着我们需要找到一种方法来满足以下3个标准：

1. 绑定挂载没有依赖项的主机目录。
2. 必须在从镜像生成的容器中安装依赖项。
3. 然后必须将依赖关系同步回主机目录。

这意味着我们需要尝试另一种方法。

### **现实的解决方案：将容器依赖项安装到缓存文件夹**
这是通过将容器依赖项安装到挂载目标目录之外的目录来完成的。这与以前的解决方案具有相同的效果，其中依赖项文件夹不受绑定目录的影响。 例如，如果要挂载到/app_workdir，则安装依赖到/dependencies。

之后，将/dependencies的所有内容复制到/app_workdir。 感谢bind mount，我们的依赖项现在也将出现在主机上。 但是......有一个警告。 从/cache到/app_workdir的复制操作是通过SSH进入容器并运行cp SOURCE DEST来完成的。对于具有许多依赖关系的大型项目，复制可能需要大约10分钟。 这可能会因主机性能而异，但实质上，你必须注意这个缺点。

### **另一个替代解决方案：在容器启动时安装依赖项**
由于容器创建是在卷安装之后进行的，因此我们可以在此步骤中安装依赖项，而不会在之后覆盖它们。它将依赖项安装过程保留在容器中，但由于绑定安装，它们在主机端可用。 但是，这样做也会延长容器启动所需的时间。

![](/img/using_docker_containers_as_development_machines/8KRsQihwbUwwGqFm.png)

所以请注意，在解决方案1中复制和在解决方案2中安装所需的时间都会随着依赖项的数量而增加。

### **开发过程改进结果：实时重新加载**
现在我们已经解决了依赖问题，我们已经准备好在Docker上开发了。 事实上，我们可以通过在容器中实现实时重新加载来进一步改善开发体验。

对于Go应用程序，您可以使用文件观察来执行此操作。 在app root中运行realize start启动方式将导致它构建并运行应用程序入口点并跟踪对.go文件的任何更改（注意：记得使用轮询模式。请参阅此处）。现在我们可以在主机上编写代码，并确保容器将检测到更改并自动重新启动服务器。

## 结论
### **缺点**
为了使容器达到与本机开发环境相同的生产力水平，我们需要执行上述两种可用的解决方法中的一种来解决依赖性问题。 随着项目规模的扩大，我们在两个解决方案中安装/复制依赖关系所需的时间将会增加。 这意味着即使初始环境设置得到简化，我们也在开发过程中引入了一个减速问题。

另一个权衡是，现在您在传统非docker环境中运行的每个命令都需要通过SSH连接到容器内部。这些命令在容器中的运行速度可能比在主机上慢。

### **优点**
从设置Docker获得的经验将是将其用作部署工具的良好开端。你还可以很好地理解Docker的细微差别和其使用局限性。这就引出了一个问题：Docker在哪里真正发光？

在所有试验和犯错之后我们已经意识到Docker容器最适合开发人员快速，轻松地运行自托管应用程序。然后，开发人员可以通过连接到这些本地实例而不是连接到远程托管实例来测试其代码。

在第2部分中，我们将探讨如何使用Docker容器轻松运行分布式应用程序。


