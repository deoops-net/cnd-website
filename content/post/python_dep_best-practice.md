---
title: "python包管理-最佳实践"
date: 2019-06-19T15:24:27+08:00
draft: false
---


原文链接：[https://medium.com/python-pandemonium/better-python-dependency-and-package-management-b5d8ea29dff1](https://medium.com/python-pandemonium/better-python-dependency-and-package-management-b5d8ea29dff1)

我花了很长的一段时间来琢磨如何写这篇文章，并且进行了大量的查阅并且在不同的项目中进行尝试。但是直到今天发布了这篇文章，我依然不能百分之百的确认这些方法是否是最有效的管理python包依赖的方法。

## 什么是包依赖管理？

我们可以想象一个软件是由很多个不同的包捆绑在一起的一个超级包，这样安装软件就会变得更简单。

**包管理器**主要是管理**库**的集合，这样能够一次下载某一个包，而不是单独下载所有的库。

包中的所有库也应该由一个依赖管理器所管理。

**依赖关系管理**用来帮助一个应用管理所有的库依赖。当你在多个环境中工作，这能够提供很大的好处。并且依赖管理能够让你追中库版本，更快更简单的更新库，当然也会处理类如一个包依赖另一个包的情况。

## 现在比较典型的项目依赖管理

现在python最流行的包管理器是`pip`，主要用来安装和管理python 的三方库。pip可以帮助开发者不费力气的安装那些线上库，并且pip可以升级，查看和卸载这些库。

只需要`pip install <somepackage>`即可安装库，pip会自动在home目录帮你构建好库文件。

## 项目配置

在构建好项目之后，通常你需要做一些工作来让这个项目能够在不同的环境中运行，比如像下面这样：

* 创建一个虚拟环境：`$python3 -m venv /path/to/new/virtual/env`
* 用pip安装包依赖：`$pip install <package>` 
* 将依赖写入文件：`$pip freeze > requirements.txt`。记住，这个方式会将所有(此python环境中的)的安装过的包加入的依赖文件中，不论你是在任何地方运行的`pip install`。
* 锁定安装的包的版本。意思是说你应该为每一个安装的包固定好一个版本。
* 把requirements.txt移动到项目根目录，完成。

## 安装项目依赖

当你把项目共享到其他的地方时，你就需要重新来安装这些依赖了，通过：`$pip install -r requirements.txt`。

你可以通过`pip show <packagename>`的方式来查看某一个依赖的具体信息。但是这些信息真的有用么？

![](https://cdn-images-1.medium.com/max/1600/1*MaCm_07a9iGqTcJQEQuZnw.png)

## 如何能简单地维护项目依赖呢？

对我个人来说，我认为上面的方法并不利于维护，有几个原因：

1. 有时候requirements.txt里面有上千条的信息。维护和更新来说将会很麻烦，并且这更难自动化（比如：如何删除其中的某一个依赖等）。
2. 如果版本信息没有固定在requirements中那么当你用`pip install`安装包依赖的时候就有可能安装一个不同的版本（多数会安装最新的版本）。
3. pip没有依赖解析
4. 有时候你需要创建一个空的requirements 文件（但是pip freeze不能做到这点）

## 有什么替代方案吗？

**方案一：多个requirements文件？**

有很多示例项目用了多个requirements。开发者有不同版本的requirements文件来管理不同的环境，比如测试环境或者本地环境。

多个requreiments文件是一个好的方案吗？我并不同意……维护多个不同的requirements文件并不是一个好主意，尤其是当他们大于五十行的时候。

**方案二：利用pipreqs和pipdeptree会有好效果吗？**

我最近开始尝试`pipreqs`，它能够通过分析项目中的`import`来自动生成requirements.txt文件。你可以通过`pipreqs /path/to/project`来生成requirements.txt。

![](https://cdn-images-1.medium.com/max/1600/1*cvPF9PpsbuiGiZuHuDJblg.png)

## pipdeptree

我想到同时使用`pipdeptree`来帮助显示安装包的树形依赖。在你的虚拟环境中使用`pipdeptree`命令可以看到pathon的整个依赖树：

![](https://cdn-images-1.medium.com/max/1600/1*xBA4uG5zES7BAptcWK9O3w.png)

很酷的一点是，`pipdeptree`可以发出警告来告诉你维护了多个不同版本的依赖。

我发现在一些场景下它很有用：

* 如果你为一个git仓库创建一个requirements并且你只想查看某个脚本的所有依赖。它能列出所有的imports需要的，并且不会有额外的被列出来。
* 支持`clean`选项
* 可以用`pipdeptree`来检查项目依赖

当然也有一些不足的地方，pipreqs不能够识别出项目里的某一些依赖，你必须手动的把这些依赖添加到requirements.txt中。它还不是一个非常完善的工具。

**方案三：你试过pip-compile吗？**

`pip-compile`包提供了两个命令`pip-compile`和`pip-sync`。

pip-compile命令能够生成requirements.in和requirements.txt两个包含顶层依赖的文件，并且都是版本固定的。你可以保存`.in`和`.txt`来进行版本控制，对吗？

这意味着我们可以在任何时候安装同样版本的依赖，不论最新的版本是什么。

`-generate-hashes`参数可以帮助我们生成哈希摘要。这样`pip-compile`就能够根据PyPI中的包索引来验证包是否符合哈希摘要。

如果需要更新所有的包依赖，可以通过命令`pip-compile --upgrade`。

如果需要更新某一个指定的包到最新或者指定的版本可以通过命令`--upgrade-package` 或者 `-p` 参数。

`pip-sync`命令用来同步你本地的虚拟环境，安装/更新/卸载等方式来保证你本地的环境和requirements.txt中一致。

## 软件依赖通常是最容易受到攻击的地方

通常去了解你的项目都有哪些依赖，依赖中都有什么事非常有用的事情。

组织通常认为大多的风险来自于那些公网上的web应用。web应用中有大量的小组件，欺骗手段可以来自于这些代码的任何地方。

目前使用`pip freeze`只能够列出所有的依赖。

我比较推荐用`pipdeptree`，它可以帮助指导依赖冲突，然后可以显示项目中真正用到的依赖。

`pipdeptree --reverse` 可以让子包先安装。

另一个不错的建议是用**Docker**来构建应用。我们本地用的工具都会打包在docker中，所以随处可用将会更快更方便。但这是另一个主题了。

## 相关链接

[WIKI](https://www.kennethreitz.org/essays/announcing-pipenv)
[锁定版本](http://nvie.com/posts/pin-your-packages/)
[Docker](https://www.fullstackpython.com/docker.html)





