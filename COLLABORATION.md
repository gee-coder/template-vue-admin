# 协作流程说明

## 1. 目标

本文件用于说明后台模板在 GitHub 上的协作、分流、评审与发布建议，帮助团队长期维护统一的前端基座。

## 2. 建议启用的协作能力

如果你是 fork 后自行维护的团队，建议启用：

- Discussions：承接使用问题、交互建议与经验分享
- Projects：管理需求池、缺陷池与迭代节奏
- Releases：输出版本说明和升级清单

## 3. 建议的 Discussions 分类

- `Q&A`：环境问题、接口联调、构建排障
- `Ideas`：后台交互、权限设计、组件抽象建议
- `Show and tell`：二次开发成果展示
- `Announcements`：版本计划、兼容性提醒、迁移通知

## 4. 建议的 Projects 看板泳道

- `Inbox`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

## 5. 标签治理建议

建议采用以下标签分层：

- 类型：`type:bug`、`type:feature`、`type:docs`、`type:chore`、`type:breaking`
- 状态：`status:needs-triage`、`status:ready`、`status:blocked`
- 优先级：`priority:p1`、`priority:p2`、`priority:p3`

管理后台模板建议保留的领域标签：

- `area:ui`
- `area:auth`
- `area:rbac`
- `area:infra`

## 6. Pull Request 协作链路

1. 开发者提交 Pull Request
2. `CODEOWNERS` 自动拉维护者评审
3. `pr-labeler` 自动打领域标签
4. `release-drafter` 汇总到版本草稿
5. CI 通过后进入评审、联调与验证

## 7. 发布协作建议

- 发布前更新 [CHANGELOG.md](./CHANGELOG.md)
- 按 [RELEASE.md](./RELEASE.md) 执行类型检查与构建
- 如涉及接口变化，需同步通知后端模板维护者
