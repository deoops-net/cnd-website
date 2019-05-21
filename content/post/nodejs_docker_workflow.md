---
title: "Nodejs Docker 工作流"
date: 2019-05-20T16:55:23+08:00
draft: false
---

翻译至：[https://medium.com/@guillaumejacquart/node-js-docker-workflow-12febcc0eed8](https://medium.com/@guillaumejacquart/node-js-docker-workflow-12febcc0eed8)

翻译：于洋

校稿：李飞

阅读时间：7分钟

![](/img/nodejs_docker_workflow/0.jpeg)

我已经使用Docker大约一年了，经过一段时间的适应，令我产生极大兴趣的是，它使得应用的整个生命周期（开发到上线）得到了极大的提升。

在本文中，我将讨论三个部分，这三个部分意味着docker可以给应用程序带到一个新的高度：

1. 优化生产工件
2. 规范化环境
3. 改善集成和交付

我的这些见解也适用于除Node.js之外的其他技术栈，主要来自小型到大型应用程序开发的经验，因为我一直在努力增加工作和个人项目的实现流程。

## 1.使用Docker优化生产工件
Docker的主要功能之一是打包您的应用，以便它可以部署在任何与Docker兼容的环境中(译者注：这听起来是不是很像Java？JVM负责帮你解决底层的适配。)。您的Docker镜像应包含应用程序运行所需的一切。

但是，同时当您和您的IT团队在使用Docker在生产中发布您的应用时，您可以进行某些优化，用以提高应用程序的性能，增强安全性并减少程序包的占用空间。如：

* 使用alpine镜像

Alpine linux是一个基于musl libc和busybox的轻量级Linux发行版。使用Alpine的主要好处是docker镜像的很小（`node：alpine` 的体积事24M，与之相比`node: latest`的体积267M）。

Alpine发行版的轻量化也让黑客只有较少的攻击面。

请注意，如果使用专门用glibc(译者注：alpine镜像是musl libc )编译的软件，可能会遇到一些问题，如node-alpine仓库中所述（https://github.com/mhart/alpine-node#caveats）

但是，如果您在容器内部使用单个技术栈（如Node），这不应该影响您的应用程序，强烈建议将其用于云原生应用程序（请参阅https://12factor.net/）

* 仅包括应用程序需要运行的内容

这意味着只包含生产依赖项，而不包括开发依赖项：

```Dockerfile
RUN npm install --only=production
```

还可以使用.dockerignore(译者注：类似.gitignore,出于ignore文件中的列表将不会被包含)文件来排除生产所不需要的文件，例如从Dockerfile中拉取(译者注：如：RUN npm i)的node_modules，测试文件，文档，docker文件本身等等......

如果您使用像Babel这样的工具用来在Node应用中使用ES6或更新的语法，那么在Dockerfile中的npm run构建脚本中执行转换脚本部分，并在构建成功执行后删除源代码。使用Docker多级构建可以更加优雅地完成这些步骤，您可以在下面的代码中看到这些步骤（文档：https：//docs.docker.com/develop/develop-images/multistage-build/）。

* 将源码复制(步骤)到容器映像之前运行npm install

这允许docker运行时缓存源码层下面的所有依赖项的层(译者注：简单的说就是把不经常变动的部分放到Dockerfile的上面指令中去，这样之前的指令构建过就会被缓存起来，之后的构建都会用缓存，这样就提升了每次构建的速度)。这意味着如果您的源代码比依赖配置更频繁地更新（可能），您的Docker构建时间平均会快得多。

Node.js官方文档有一个关于如何为Node.js应用程序构建docker镜像的简洁教程，他们在这里提到了这一部分：

[Docker化Node.js Web应用程序| Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

* 使用指定版本的Node docker镜像

即使您可能没有意识到这一点，您的应用也可能与特定版本的语言库（Node或任何其他技术栈）紧密耦合。为了防止docker重新构建的时候拉取更新而导致崩溃，您应该确定要在生产平台上运行的Node版本(译者注：如果你用的是latest tag的镜像，这种情况就很可能发生)。

这里有一个gist，其中包含了如何使用ES6和Babel来的docker化Node程序的基本文件（https://gist.github.com/guillaumejacquart/676627dd862e70fd6e45e8361f513abf）

(`译者注：原文中有gist的相关摘要，出于排版考虑，这里没有摘录`)

## 2.使用Docker Compose规范化环境
Docker compose是Docker的一个工具，它允许您将整个应用程序技术栈（应用程序服务，数据库，缓存层......）定义到单个文件（docker-compose.yml）中，并管理这些容器的状态。也可以使用CLI管理底层资源（持久卷，网络）。

在我看来，docker-compose的酷炫之处在于它可以让您在开发环境中轻松运行完全类似生产的一整套环境。

假设您有一个由以下组件组成的应用程序：

* Node.JS的API服务
* 与MySQL数据库交互
* 使用Redis作为缓存和会话层
* Traefik作为API的反向代理

顺便说一句，如果您不了解[Traefik](https://traefik.io/)，我建议您查看它，它是一个动态反向代理，可以检查您正在运行的Web容器并反向代理它们。

Docker compose允许您为所有环境配置打包（开发，升级，生产，即使运维团队也喜欢这样），因为非常简单并且是以某种分解的方式。

以下是我为促进简化环境之间的iso生产设置和配置分解而提出的步骤：

* 给Node.js应用的专用配置库

这允许您将配置保存在集中位置，并以多种方式使其可覆盖，例如dotenv文件或环境变量。就个人而言，我发现[convict](https://github.com/mozilla/node-convict)（由Mozilla开发）是个很好的工具。

通过这样，在不同的环境中Node.js项目唯一需要做的是，更改dotenv文件或环境变量列表

在我们的示例中，配置应至少包含MySQL和Redis连接信息。

* 在一个位置定义所有配置

这可以在源环境脚本中，或者使用.env文件（这样更简单，因为可以通过docker-compose读取）

在我们的示例中，此文件应包含与Node.js应用程序中的配置文件相同的变量。

* 使用变量创建docker-compose.yml文件

Docker Compose可以替换配置文件中的环境变量（请参阅https://docs.docker.com/compose/environment-variables/）。在所有环境中都可以使用单个docker-compose文件。

dev和prod之间的唯一区别是在开发中我使用不同的Dockerfile作为Node.js应用程序，这样我就可以对我的代码进行nodemon实时重载更改（安装在Docker卷中）

下面是docker-compose.yml和docker-compose.dev.yml文件，.env文件和用于开发的Dockerfile：

.env文件：

```Dockerfile
MYSQL_ROOT_PASSWORD = 123456 
MYSQL_DATABASE = database

APP_HOST = app.test.localhost.tv
```

Dockerfile-env：

```Dockerfile
FROM node:9-alpine

WORKDIR: /home/node/app

# Install deps
COPY ./package* ./
RUN npm install && \
    npm cache clean --force
COPY . .

# Expose ports 
EXPOSE 3000

# Start the app
CMD npm start
```

docker-compose.yml文件：

```Dockerfile
version: '3'

services:
  reverse-proxy:
    image: traefik # The official Traefik docker image
    command: --api --docker.exposedbydefault=false # Enables the web UI and tells Træfik to listen to docker, without exposing by default
    ports:
      - "80:80"     # The HTTP port
      - "8080:8080" # The Web UI (enabled by --api)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # So that Traefik can listen to the Docker events
db:
    image: mysql:5
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD
      - MYSQL_DATABASE
redis:
    image: redis:alpine
app:
    build: .
    environment:
      - DB_HOST=db
      - DB_NAME=${MYSQL_DATABASE}
      - DB_USER=root
      - DB_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - REDIS_HOST=redis
    labels:
      - "traefik.enable=true"
      - "traefik.frontend.rule=Host:${APP_HOST}"
    depends_on:
      - db
	  - redis
```

docker-compose.dev.yml文件：

```Dockerfile
version: '3'

services:
  app:
    build:
      dockerfile: Dockerfile-dev
      context: .
    command: npm run dev
    volumes:
      - "./src:/home/node/app/src"
```

您可以在docker-compose.yml文件的“app”部分中看到我正在使用localhost.tv，这是一个很好的远程DNS服务器，它将所有* .localhost.tv绑定到您的localhost。我使用它来避免使用应用程序端点的相对路径（如localhost / api），当转移到生产中的子域名时（例如，嵌入式链接，内部路由，类似的东西），它总会带来不良副作用。

用于开发环境的镜像Dockerfile有点烦人，因为它使开发配置与生产配置不同，因此在将应用程序部署到另一个环境时引入了一些额外工作（因此存在一些风险）。到目前为止，我提出的唯一解决方案是使用模板系统（简单脚本或更多演进的配置工具，如ansible）来使Dockerfile动态化。

上述文件配置好后，您可以使用以下命令在开发环境中运行你的程序：

首先，从Dockerfile-dev文件构建您的app容器：

```Dockerfile
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
```

然后，使用以下命令运行：

```Dockerfile
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

您现在有一个docker化的，反向代理，iso-production开发环境，并且nodejs服务是热重载的。

您可以在此处找到完整的示例应用：

https://github.com/guillaumejacquart/node-docker-example

## 3.丝滑的交付和与CI / CD集成
现在您已拥有可移植且可自定义的应用程序环境，您可以将其用于持续集成和部署的所有步骤。

以下是我在使用Docker和Node.js时在测试方面尝试为每个项目做的事情：

* 构建Docker镜像时运行单元测试。您还可以为此构建自定义图像，例如：

```Dockerfile
# Use the builder image as base image
FROM builder
# Copy the test files
COPY tests tests
# Override the NODE_ENV environment variable to 'dev', in order to get required test packages
ENV NODE_ENV dev
# 1. Get test packages; AND
# 2. Install our test framework - mocha
RUN npm update && \
    npm install -g mocha
# Override the command, to run the test instead of the application
CMD ["mocha", "tests/test.js", "--reporter", "spec"]
```

您可以通过docker run函数的返回，以确定CI管道是否可以继续运行。

* 使用CI工具中的docker-compose运行集成测试，例如运行docker-compose以使整个包可操作，并调用特殊端点(endpoint)以检查Node.js应用是否可以正确访问其所需组件（数据库和redis）在示例中）
* 使用CI工具内的docker -compose运行真正的API测试，并在运行测试之前使用[Sequelize](https://github.com/sequelize/sequelize)中的fixture等工具填充数据库。

如果是可以运行docker化的环境，则可以在CI（Jenkins，Gitlab-CI，Travis）中运行所有这些步骤。例如在gitlab-ci中你可以使用这个镜像：https：//hub.docker.com/r/gitlab/dind/ ，它是docker image中的docker ，包括docker-compose。

## 结论
我希望这些见解对于考虑将Docker用于基于Node.js的应用程序开发或部署的任何人都有帮助。

它们绝不是完整的必须步骤，而是旨在提供有关如何使用新容器工具来改进现代应用程序制作的视图。

你可以在评论区随意分享使用的Docker和Node.js的其他实践。

