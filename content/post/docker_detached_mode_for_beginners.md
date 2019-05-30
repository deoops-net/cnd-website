---
title: "docker初学者指南一:用detach模式让容器在后台运行"
date: 2019-05-30T18:03:16+08:00
draft: true
---
翻译至：[https://medium.com/the-code-review/dockers-detached-mode-for-beginners-c53095193ee9](https://medium.com/the-code-review/dockers-detached-mode-for-beginners-c53095193ee9)  
翻译：李飞  
校稿：于洋  
阅读时间：约5min  

```
docker run --detach IMAGE
```

后台模式（添加--detach或-d选项），表示让Docker容器在终端的后台运行。它不接收输入或显示输出。如果您在后台运行容器，你就能通过将终端重新连接到其输入和输出找到它们的详细信息。  
本教程面向初学者。 我将向您展示如何以 detach 模式运行容器。 然后根据需要将它们重新连接到终端输入和输出。  

[Detached mode](#detach模式)  
[View containers](#查看容器)  
[View container logs](#查看容器日志)  
[Execute commands in running containers](#在运行容器中执行命令)  
[Attach](#Attach)  

### detach模式  
启动Docker容器时，必须首先确定是要在后台模式下还是在默认前台模式下在后台运行容器。如果您希望容器运行但不想查看并跟踪其所有输出，则可能需要使用此选项。  
detach选项的简短版本是参数 -d，而较长的版本是 --detach。  
```
docker run -d IMAGE
```
以后台模式运行容器，可能需要检查其状态或在其上运行命令。接下来，我将解释如何在终端中查看它们。

### 查看容器  
在后台模式下启动容器后，可以使用CLI命令 docker ps 查看它们的运行情况。  
默认情况下，会列出正在运行的容器，一些有用的选项包括：  
```
-a / -all 表示所有容器（默认显示刚刚运行）
```
```
--quiet / -q 列出它们的id（当你想查看所有容器时很有用）。
```
要查看有关容器的更多信息，您可以查看其日志。

### 查看容器日志  
获得有关容器的某些详细信息（例如，其名称或ID）后，你可以使用命令 docker logs 查看其输出。  
```
docker logs [OPTIONS] CONTAINER
```
此命令的两个最有用的选项是：
```
--tail 虽然默认值是所有行，但您可以指定从日志末尾显示指定行数。
```
```
--follow，-f 跟随日志输出，这意味着它将把正在运行容器的日志打印到标准输出。  
```

### 在运行容器中执行命令  
Docker exec 是一种常用的CLI命令，允许您在现有运行容器中运行命令。  
例如，您可能希望使用docker exec和-i（交互式）标志来保持stdin打开，并使用-t来分配终端。  
```
docker exec -i -t container_name /bin/bash
```

### Attach  
你可能希望再次连接终端以查看容器的输出。接下来，我将向你展示如何做到这一点。  
这允许你查看其正在进行的输出或以交互方式控制它，就像命令直接在你的终端中运行一样。  
```
docker run -d --name topdemo ubuntu /usr/bin/top -b
docker attach topdemo
```
