# 秘语 — AI 陪伴 Telegram Mini App

基于 React 18 + TypeScript + Vite 构建的 Telegram Mini App，提供 AI 角色聊天平台。

## 技术栈

React 18 + TypeScript / Vite 5 / react-router-dom v6 / CSS Modules / React Context / Telegram WebApp JS SDK / Docker (Node 18 + Nginx 1.27)

## 功能模块

### 探索页 (`/`)
角色卡片网格，标签筛选（全部/热门/甜蜜/撩人/内敛/傲娇），无限滚动加载。

### 角色详情页 (`/role/:roleId`)
全屏背景图，可展开玻璃卡片（职业、亲密度进度条、个人简介），"开始聊天" 按钮。

### 消息页 (`/messages`)
已激活角色的对话列表，左滑手势删除，空状态引导。

### 聊天页 (`/chat/:roleId`)
历史消息游标分页，流式打字效果（60ms/字），乐观更新 + 打字指示器。

### 个人页 (`/profile`)
用户资料、订阅管理、隐私锁、收藏角色、应用设置。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles` | 获取角色列表 (分页/筛选) |
| GET | `/api/myroles` | 获取我的角色列表 |
| POST | `/api/roles/select` | 选择角色开始对话 |
| GET | `/api/conversations` | 获取对话历史 (游标分页) |
| POST | `/api/chat/messages` | 发送消息 (返回 AI 回复) |
| POST | `/api/myroles/delete` | 删除角色对话 |

返回格式：`{ ok: boolean, message: string, data: T }`

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器 http://localhost:8090
npm run build      # 类型检查 + 构建
```

开发模式下自动使用固定用户 `dev_user_001`，无需 Telegram 环境。

## 部署

```bash
# 一键部署 (构建 → 打包 → 上传 → 远端重建)
./deploy/deploy-webapp.sh

# 仅构建
./deploy/deploy-webapp.sh --build-only

# 仅上传 (跳过构建)
./deploy/deploy-webapp.sh --upload-only
```

远端配置通过环境变量覆盖：

```bash
REMOTE_HOST=1.2.3.4 REMOTE_PASS='xxx' ./deploy/deploy-webapp.sh
```

## 访问

- **网页端**: https://doug-items-immigrants-courtesy.trycloudflare.com （固定测试用户，可直接打开）
- **Telegram**: 搜索 `@whisper_chat_bot` → 发送 `/miniapp` → 点击按钮打开
