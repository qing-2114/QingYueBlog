---
title: '分支管任务，worktree 管目录：AI 时代的 Git 协作'
description: '当多个 AI Agent 并行改代码时，用 Git 提交建立检查点，用分支隔离任务，再用 worktree 管理多个工作目录。'
pubDate: 'Sep 9 2026'
category: 'AI Agent'
tags: ['AI Agent', 'Git', 'worktree', '开发协作']
heroImage: '../../assets/git-agent-worktree/01-cover-branch-map.png'
---

AI Agent 改代码的速度越来越快，新的问题也随之出现：一个 Agent 在重构目录，另一个在修测试，第三个又要试新的提示词。它们都在改同一个文件夹，最后得到的往往不是三个可比较的结果，而是一堆分不清来源的改动。

这时真正需要的不是继续催模型“谨慎一点”，而是给开发过程建立清晰的版本边界。Git 负责记录每一步变化，分支负责隔离任务，worktree 则负责把不同分支放进不同目录。三者配合，才适合 Agent 时代的并行开发。

![面向右侧抽象分支图的技术工作者](../../assets/git-agent-worktree/01-cover-branch-map.png)

## 先把 Git 当成检查点

Git 可以理解为项目的时间轴。一次 commit 是一个可追踪的快照，分支是指向某个提交的名字。你可以在主分支保留当前可运行版本，再从这里分出一个功能分支交给 Agent 修改。

开始前先记住 Git 的三层结构：工作区是你正在编辑的文件，暂存区是 `git add` 标记好、但还没写进历史的改动，仓库是 `git commit` 固定下来的全部快照。改动总是先落在工作区，`add` 把它放上暂存区，`commit` 再把暂存区的内容封装成一个快照。

日常不需要背完所有命令，先形成一个固定节奏即可：

```bash
git status
git diff
git add -p
git commit -m "实现工具调用"
```

`status` 告诉你工作区发生了什么，`diff` 让你看到具体改动，`add -p` 可以只暂存相关片段，commit 则把这次修改变成一个能随时回到的检查点。提交越小，越容易定位问题，也越容易让另一个 Agent 接手。

当 Agent 的结果不理想时，先判断它有没有提交。未提交的修改用 `git restore` 撤回（默认撤工作区，加 `--staged` 撤已暂存未提交的内容）；已经提交且需要撤销时，用 `git revert` 生成一个新的反向提交。执行 `git restore` 前要确认不再需要这些未提交改动。

![将项目卡放入归档盒的 Git 检查点场景](../../assets/git-agent-worktree/02-git-checkpoint.png)

## 给每个 Agent 一条分支

最简单的规则：一项任务一条分支。例如：

```bash
git switch main
git pull
git switch -c agent/tool-calling
```

如果仓库使用其他默认分支名，请替换 `main`；没有远程仓库时可以跳过 `git pull`。功能开发、评测脚本、文档整理，各用各的分支。某条路线走不通，只需放弃对应分支。

分支只是 Git 历史里的一个名字，并不等于新的文件夹。想同时打开多个分支，复制仓库会让依赖和修改状态各走各的、容易混；worktree 正是为此准备的。

## worktree：一个仓库，多个工作目录

`git worktree` 让同一个仓库可以同时拥有多个工作目录。它们共享同一份 Git 对象和历史，但每个目录能检出不同的分支：

```bash
git worktree add ../agent-feature -b agent/feature
git worktree add ../agent-evaluation -b agent/evaluation
git worktree list
```

执行后得到两个并列目录，Agent 各自在自己的目录里工作，生成的文件不会直接覆盖别的任务。

任务完成后，先在对应目录里检查、跑测试，再回到主目录合并：

```bash
git switch main
git merge agent/feature
git worktree remove ../agent-feature
```

`worktree remove` 清理工作目录。注意：目录里还有未提交的改动或未跟踪文件时，它会直接拒绝删除，需先提交、清干净，或加 `--force`。分支是否一并删除，取决于你还要不要保留这段实验历史。

![三个独立工作区连接同一中央仓库的 worktree 场景](../../assets/git-agent-worktree/03-worktree-isolation.png)

## 一套适合 Agent 的协作节奏

开始任务前，确认主分支干净，为任务创建分支或 worktree，并写清目标、允许修改的目录和验证命令。

执行过程中，让 Agent 频繁提交小改动，例如“增加重试逻辑”“补充离线测试”，别把半天的工作压成一个巨大的 commit。每次提交后看 `git show` 或 `git diff`，确认没有误改配置、凭据和无关文件。

合并前跑一遍测试，检查变更文件列表，读一遍关键差异。Git 只保证变化可追踪，不能证明代码逻辑正确。

worktree 解决的是目录隔离。多个 Agent 仍可能改同一数据库、抢占端口，或生成不兼容的依赖缓存，共享资源需要单独设计。

## 结语

AI Agent 让写代码变快，Git 让试错可控。把提交当检查点，把分支当任务边界，把 worktree 当并行实验的容器，就能同时推进多个方向，并知道每个结果如何产生、如何回退。最小习惯只有一句话：先隔离，再修改；先检查，再合并。

## 参考资料

- [Git Book：Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
- [Git 文档：git-worktree](https://git-scm.com/docs/git-worktree)
- [Git 文档：git-revert](https://git-scm.com/docs/git-revert)
