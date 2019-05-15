---
title: "记住这4个DevOps技巧，你的云服务将会更稳定"
date: 2019-05-15T18:41:25+08:00
draft: false
---

In the startup world, there is a balancing act when it comes to where you invest your time. I’ve been in many situations where, due to the need to ship an MVP, DevOps practices take a backseat.
在创业领域，当涉及到时间投入的分配问题时，这其中往往需要找到一个平衡。 我曾经遇到过很多情况，由于需要发布最小化可行产品(minimum viable product, MVP)时，DevOps的相关工作内容往往会占据一席之地。

I consider this to be normal and not really a bad thing because “MVP” should be “Minimal” , and most problems that are solved by good DevOps are not problems at such a small scale.
我认为这是正常的，且并不是一件坏事，因为“最小化可行产品”应该是“最小化”，好的DevOps解决的大多数问题都不是小规模的问题。

But here are a few things that should definitely be done (or at least considered). Because there aren’t many things worse in the startup world than having your cloud infrastructure go down.
但是这里有一些事情应该提前完成（或者至少要提前考虑）。 因为没有比在创业过程中发生云基础设施瘫痪从而业务停滞类似的事情更糟糕的了。

![图片](https://uploader.shimo.im/f/YhjErXA812Y7vpvC.png!thumbnail)
Tip #1: Schedule Backups of your data 💾
This is a must for any startup that cares about having persistent data. You need to be automatically backing up your critical data or you risk losing more than just files, you also will lose customer trust which will impact your future growth.
**建议 #1: 定期进行数据备份**
对于任何关心拥有持久数据的初创公司来说，这都是必须的。 您需要定期自动备份关键数据，否则您可能失去的不仅仅是文件，还会失去客户的信任，这将影响您未来的发展。

I generally automate two types of backup methods when starting projects
我通常在启动项目时自动执行下面两种备份方法

Database backups
This generally takes the form of a scheduled script, like a cron job which runs every night and pushes a database dump somewhere on the cloud like a private S3 bucket. You can have more fancy solutions with some backup solutions but those tend to be more enterprise focused and will cost you a lot of time and money (not startup friendly) .
数据库备份
通常采用定时执行脚本的形式，例如每晚运行的cron作业，并像私有S3存储桶上那样在云上的某处推送数据库转储。你也可以使用一些更精美的备份解决方案，但这些解决方案往往更注重为企业服务，并且会花费您大量的时间和金钱（不适合初创公司）。

![图片](https://uploader.shimo.im/f/Kp9S2hh5CHMOa3vI.png!thumbnail)

Disk snapshots
When all else fails, if you have a copy of your disk you are generally going to be safe. Most major cloud providers have solutions in place that let you take disk snapshots on a schedule of your choosing, so try and avoid writing scripts that connect directly to the cloud api since you will be responsible for maintaining them.
磁盘快照
当所有其他方法都失败时，如果您有磁盘副本，通常会安全。大多数主要云提供商都有适当的解决方案，可让您按照自己选择的时间周期进行磁盘快照，因此请尽量避免编写直接连接到云服务的API的脚本，因为你还要负责维护它们。

🚨 🚨Make sure to test your backup restore method or risk what happened to GitLab where all 5 of their backup methods failed because they never tested the restoration🚨🚨
🚨🚨确保测试你的备份恢复方法或尝试类似[GitLab发生的数据丢失事件](https://about.gitlab.com/2017/02/01/gitlab-dot-com-database-incident/)，因为他们从未测试过恢复数据，因此所有5种备份方法都失败了。

**建议＃2：设置监控并提醒关键问题👁️**
你是否知道服务器何时出现故障或应用程序因磁盘空间不足而崩溃？如果没有，你应该考虑解决这个问题（不需要太多时间）。

设置监控的最简单方法通常是直接使用云提供商解决方案，如Amazon CloudWatch或GCP Stackdriver或阿里云监控服务。您可以设置要监控的指标，并针对云基础架构中发生的事件提供不同类型的警报，例如在磁盘运行不足时收到电子邮件、手机短信，必要时候云服务商还可以提供电话提醒服务。

如果您不想使用服务商的解决方案 - 还有与云无关的选项可以监控您的云服务。存在简单的解决方案，例如定期运行shell脚本调度发送电子邮件报告，但是更全面的解决方案为你提供系统的仪表板视图功能通常更好，更具可扩展性。企业私有云存在收费服务Blue Medora和Solar Winds等选项，但大多数创业公司需要省钱，这意味着通常会转向Countly等开源免费解决方案。

总而言之，我建议使用基于云提供商的解决方案，因为这些解决方案将保证稳定，易于设置，并且在初创公司的规模上不会花费额外的费用。









