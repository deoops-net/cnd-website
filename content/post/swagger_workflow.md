---
title: "基于swagger的前后端工作流协同"
date: 2019-07-29T11:46:55+08:00
draft: false
---


![](/img/swagger_workflow/theme.jpeg)

## 什么是swagger和openapi

关于如何使用swagger的文章已经足够多，本文将从实践角度说说如何将swagger用到生产环境以及如何提供协同效率。

说起swagger首先应该说说**文档先行**，这个思想对小团队尤为有用。文档先行的意思想必大家都能从字面及实际的工作过往中有所理解。软件工程中最大的复杂性来自于不一致性，而文档先行给这种不一致性提供了很实用的办法。

你有注意到，我前面提到了小团队，是的很多大厂在文档建设和工作流协同上已经比较成熟，无论是自研的还是高价的付费协同产品。但是这对于小团队来说是不可承受的，创业团队更多的时间会用来迭代和测试市场反应。而对于saas来说，第一有不小的资金成本，第二小团队的人员流动会导致这类工具的培训成本极高。

但是这不能代表小团队就不需要文档建设不需要协同，只是在有限的条件中我们寻找更适合自己的路径而已。今天我们就来说说如何通过swagger来践行开发团队中的前后端协同。

有些同学分不清swagger和openapi有什么不同，他们经常被同时提起，但是我们写的swagger文档又何openapi有什么不同之处么？

其实open api最早就是swagger api，只不过open api后来被单独分离出来用来描述restful api的部分，而swagger自身则更关注围绕openapi建立一系列工具。我们实际环境中就是使用swagger的工具来快速构建符合open api的restful文档。


## 如何提高效率

说了这么多你一定迫不及待的想知道到底如何在自己的利用起来swagger呢？其实真正在自己的团队中推行一个新工具或工作流的难度是很大的，因为软件行业似乎人们总能找到替代品，并且大多数情况下他们总是能用替代品来说服你。我的建议是不如自己先用起来，先让自己爽，真正的让自己的效率提高了，团队就会慢慢被你影响的，我们先说说作为个人开发者可以如何使用swagger这套体系。


### 安装

我比较推荐用Docker的方式安装，如果你喜欢[npm方式](https://github.com/swagger-api/swagger-editor#running-locally)也可以自行查看一下文档。
Docker安装的方式及其简单命令如下：

```bash
 docker run -d -p 8080:8080 --name swagger-editor swaggerapi/swagger-editor
```

接着你打开浏览器（`http://localhost:8080`）就能看到一个页面编辑器了，左侧是你书写的文档，右侧则是文档的预览，同时预览也集成了rest api的测试按钮。

![](/img/swagger_workflow/swagger-editor.png)

无论你负责前端还是后端，首先日常中你会有一些需求列表，需求拆解下来就是最后的一些列CURD和业务逻辑，最后就是一些restful接口的开发，别急着写代码，还记得我们说的**文档先行**么？这时候我们可以用上面工具来书写我们即将实现的restful api文档，其实还有一个插件也很方便书写文档，vscode中的swagger插件`OpenAPI (Swagger) editor `。如果第一次使用，你大概需要半小时左右时间先熟悉一下swagger的一些基本语法，不用担心都是一些固定语式的描述语法，文中介绍的两个书写工具都有补全提示：）

写好了一个简单的restful文档，vscode的`Swagger Viewer`插件以及swagger-editor同样为我们提供了文档的预览和测试功能，你可以用简单的工具比如nodejs-express写一个简单的fileserver来对这个swagger api进行线上的serving，这样的好处是：

* 团队有统一的地方查阅文档
* 多项目文档可以汇总在一个domain的不同项目路径下

下面我们用一个简单的`express`示例来看看如何做一个简单的静态文件服务。

1. 准备安装好`node.js`
2. 全局安装`express-generator`： `$ npm i -g express-generator`
3. 初始化一个express项目：`$ express -e swagger-server`
4. 安装项目依赖：`cd swagger-server; npm i`

这样一个express项目就建立好了，接下来我们进行简单的配置即可，首先在swagger-server根目录下创建一个用来存放swagger api文件的目录：

```bash
cd swagger-server;
mkdir swagger-api
```

然后我们修改`app.js`将静态目录设置成swagger-api目录：

![](/img/swagger_workflow/express.png)

接下来我们把用swagger-editor写好的文档保存到swagger-api目录下即可，这里我比较推荐为每个项目单独在swagger-api下创建一个项目目录，这样我们就可以通过访问不同的项目路径来查看不同的项目文档。现在运行`npm start`然后在浏览器查看吧：

![](/img/swagger_workflow/swagger-json.png)

如果你创建了项目目录就可以像截图中一样来访问文档。你会有疑问这个线上文档可读性这么差为什么要做这个事情，后面你就知道了：）

之后团队的人都可以通过这个URL来查看api文档的更新及测试接口是否正常工作。你还记得之前写swagger api文档的swagger-editor吗，他同样是一个文档预览工具，而且他支持从一个url导入文档，所以其他人随时可以通过这个你写好的服务导入文档，并且能够在线测试！

这里我同时推荐一个工具可以很好的集成swagger api，工具的线上地址是[easy-mock.com](easy-mock.com),在这上面可以直接通过写好的swagger.json或者swagger.yml来同步生成用于测试的mock api，很爽吧。(PS: easy-mock 目前的v2的文档支持较好，v3还在持续优化中)

![](/img/swagger_workflow/easy-mock.png)

现在你可以回头看一下这个过程：

* 通过编辑器快速书写restful文档swagger.yml或者swagger.json
* 通过预览工具自动生成在线文档及测试集成
* 通过easy-mock自动集成swagger到mock api

**整个过程中你只需要一次书写swagger文档即可，后面的过程全是自动化的了**！

还有更酷的事情，你甚至连大部分的面条代码都不用写了，当你写好swagger文档后，通过swagger-editor的菜单你可以看到generate code，是的！swagger可以帮助你生成基于此restful文档的前后端代码！而且重要的是市面主流语言都支持，你一定想生成的代码靠谱吗？别担心，像kubernetes这种明星项目也是用swagger去生成restful代码！

这里我们以nodejs为例看看生成的服务端代码应该怎样使用起来。

![](/img/swagger_workflow/server-tree.png)

整个目录结构还算比较清晰，入口文件`index.js`负责创建http server，然后通过swagger-tools三方模块来把`swagger.yml`转换问`connect`中间件，对应的路由会调用对应的controller下的模块，然后controller会对应的调用service下对应的model方法。 我们要做的就是在对应的controller和service中实现我们的业务逻辑可以，还蛮简单吧！

当然官方文档中也对整合到已有的项目代码中做了足够的介绍，这里就不展开了。

## 总结

本文从实践角度，梳理了基于swagger的前后端协同工作流，良好的技术规范及文档规范可以在早起帮我们避免掉很多技术债，合理的利用以后工具在提升协作效率的同时也可以帮我们建立更好的交流协作规范，不妨试试吧！

如果你有任何问题欢迎在评论区讨论：）



