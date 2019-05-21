---
title: "理解语义化版本规范"
date: 2019-05-21T10:15:02+08:00
draft: true
---

翻译至：[https://medium.com/bhargav-bachina-angular-training/understanding-semantic-versioning-spec-635b87397eec](https://medium.com/bhargav-bachina-angular-training/understanding-semantic-versioning-spec-635b87397eec)

翻译：于洋

校稿：李飞

阅读时间：6分钟

![](https://cdn-images-1.medium.com/max/2600/1*WoSWxl7iwLvxZ0ahgj-04A.png)

在软件开发管理的过程中，我们经常会修改我们的代码并且这些修改需要被追踪。当项目不断变大的时候，所有的项目依赖包也会跟着增长。这时候如果你想修改能够正常工作，那么你同时还需要确保这些依赖也能够正常工作。如果依赖耦合度过高或者缺少相关的文档描述，那么这将变成*依赖地狱(dependency hell)*

在这篇文章中，你将看到我们是如何来规避依赖地狱的，下面是一些我主要会谈到的主题：

* 什么是语义化版本
* 基本规则
* 示例项目
* 版本历史和优先权
* 如何安装指定的版本
* (~)与(^)的不同之处
* 最佳实践

## 什么是语义化版本

上面已经讨论了，语义化版本可以避免依赖地狱以及可以保证我们的javascript 生态系统处于健康，安全和可依赖。每当我们修改我们的包的时候，我们应该同时修改package.json中的版本号。

按照下面图所示的版本规范，你可以让其他依赖你的包的开发者了解到你有哪些变化，并且能够对应的调整他们的代码。

![](https://cdn-images-1.medium.com/max/1600/1*X0AvlnrTy5Vt2-cGiJCSvg.png)

## 基本规则

当你遵从上述语义化版本规范的时候，下面有一些基本规则推荐。

* 如果是一个新创建的项目，那么版本号应该从**1.0.0**开始
* 如果你做了不向下兼容的修改，那么你应该增加你的主版本号如：
*1.0.0* 变成 *2.0.0*
* 如果你只是添加了一些方法或特性而没有断崖式修改或者不兼容的修改，那么你应该增长你的小版本号如：**1.0.0** 变成 **1.1.0**
* 如果你只是修复了一些已知的BUG并且没有断崖式修改或者不兼容的修改，那么你应该增长你的*补丁*版本号如：**1.0.0** 变成 **1.0.1**
* 如果你的包还不是稳定版本，你应该给你的包版本添加一个*LABEL*标识此包还没达到预期的要求。如：**1.0.0** 变成 **1.0.0-beta** 或者 **1.0.0-beta.1**
* 最后你可以给你的版本号最后追加一些构建时的**元数据**，如：**1.0.0-beta.1+1122**

_____ 
## 为什么我们应该这样做

遵从这些规则其实有很多很多的优点，下面会列举一些

* 所有的代码层面的变化都能够很好的很简单的从版本控制的层面得到追踪
* 有了版本号，那么从这些版本数字很容易看出这次发布有哪些变化
* 有了版本记录，那么开发者当遇到问题时，可以选择过去的历史版本


## 示例项目

让我们用示例项目来化理论为实践一下。

我们有一个模块叫**NameUtils**，这个模块有两个方法**firstName**和**lastName**, 两个方法的参数都是名字的全称，两个方法分别返回方法对应的名字的部分。

**第一次发布**

当我们第一次发布的时候我们从**1.0.0**开始

index.js

```js
var NameUtils = function(){};

NameUtils.prototype.firstName = function(name) {
    return name.split(' ')[0];
}

NameUtils.prototype.lastName = function(name) {
    return name.split(' ')[1];
}

module.exports = new NameUtils();
```

package.json

```js
{
  "name": "nameutils",
  "version": "1.0.0",
  "description": "this package is for formatting name",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "name",
    "format"
  ],
  "author": "Bhargav Bachina",
  "license": "ISC"
}
```

我们来试一下发布，并且检查他的版本。

![](https://cdn-images-1.medium.com/max/1600/1*ElNUNefvI6teGyTCvTF0pQ.png)

**补丁发布**

如果我们修复了任何的错误，那么我们应该去修改**补丁**版本号。

你应该注意到上面`index.js`中的代码会有一些问题，所以现在我们来加一些基本的边界检查，然后重新发布一个补丁版本**1.0.1**。

index.js

```js
NameUtils.prototype.firstName = function(name) {
    return undefined !== name?name.split(' ')[0]:'';
}

NameUtils.prototype.lastName = function(name) {
    return undefined !== name?name.split(' ')[1]:'';
}
```

下面是发布到npm后的版号

![](https://cdn-images-1.medium.com/max/1600/1*CUsFGXCRolAKMpcgyNrUvQ.png)


** 小版本号发布**

如果我们只是加了一些方法，并且修改之后是向下兼容的，那么我们应该发布一次**小版本号**发布。

我们现在给我们的包添加一个方法**getLength**, 同时我们也给包添加一个`README.md`

index.js

```js

NameUtils.prototype.getLength = function(name) {
    return name.length;
}
```

现在我们提升小版本号到**1.1.1**，然后发布到npm仓库

![](https://cdn-images-1.medium.com/max/1600/1*Pg4Emh-J4qa3aaY5zkU0pQ.png)

**主版本号发布**

如果我们对包做了断崖式的不兼容的修改，那么我们就必须来提升我们的朱版本号。

比如，我们修改了`NameUtils`的两个原型方法的名字，从`firstName` 到 `getFirstName`。那么我们就应该发布**2.0.0**

index.js

```js
NameUtils.prototype.getFirstName = function(name) {
    return undefined !== name?name.split(' ')[0]:'';
}

NameUtils.prototype.getLastName = function(name) {
    return undefined !== name?name.split(' ')[1]:'';
}
```

下面是更新后的版本号

![](https://cdn-images-1.medium.com/max/1600/1*hVeH3ZLboMysWFtyrHnr5g.png)


## 版本历史后优先权

我们可以在npm仓库中点击`versions`选项卡来查看版本历史和详细记录。

![](https://cdn-images-1.medium.com/max/1600/1*uWOEnjH9J6L5X_yWSgdS5A.png)

如图所示，优先权是基于各个版本号的比较，这里我们发布了4个版本，那么优先权顺序是 **1.0.0 \< 1.0.1 \< 1.1.1 \< 2.0.0**

## 如何安装指定的版本

现在我们的npm仓库里有了几个版本的包，让我们来了解如何安装指定的版本并且能够对应的更新我们的包。

如果安装的时候不指定版本`npm i nameutils`，那么默认会安装最高优先权的版本即**2.0.0**。

如果需要安装指定的版本在报名后面加上`@`和版本号即可如：`npm i nameutils@1.1.1`

__ 
## (~)和(^)的不同之处

如果你在安装某一些包的时候用了`--save`选项，那么你能够在`package.json`的依赖项中看到上面的符号如：`~1.3.4`这样。

**~**

~符号的意思是兼容最近的**补丁版本**，意思就是说如果你的`package.json`中某个包是`\~1.3.4`而且这个包有两个最新的版本发布，`1.3.6`和`1.4.0`，那么当我们`npm install` 的时候会安装`1.3.6`的版本


**^**

和上面类似**^**表示小版本兼容，比如：你的`package.json`中已经有了某个包的版本`^2.2.0`，而且这个包还有两个最新的版本发布，分别是`2.3.0`和`3.0.0`，那么当你`npm install`的时候，`2.3.0`的小版本兼容会被安装

## 最佳实践

* 对于已经发布的版本不要修改任何内容，如果有任何的更改，那么发布的时候也要有对应的版本的更改。
* 如果你的包还不是稳定的，那么最好是从**0.x.y**开始，这有利于快速开发。
* 只有在你的包稳定后才开始发布你的第一个版本**1.0.0**
* 总是保证你的包有一个书写良好的README
* 如果有一些**废弃**修改，那么请在文档里说明
* 你可以把这些**废弃**的修改放到小版本发布里，有利于平滑迁移。


