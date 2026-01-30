# 事件提醒模块 (Event Reminder)

这是一个独立的功能模块，提供完整的日历事件管理和提醒功能。

## 目录结构

```
event-reminder/
├── index.vue          # 主组件文件（原 EventReminder.vue）
└── README.md          # 本说明文件
```

## 功能特性

- ✅ 多视图日历（月历、周历、日历、日程列表）
- ✅ 事件管理（创建、编辑、删除）
- ✅ 代办事项管理
- ✅ 事件提醒（基于时间提前提醒）
- ✅ 数据库持久化（SQLite）
- ✅ 农历显示

## 使用方式

该模块通过 `DialogEventReminder.vue` 入口文件加载，在独立窗口中显示。

### 入口文件

- `src/entries/DialogEventReminder.vue` - 对话框入口，负责加载本模块

### 窗口创建

通过 `electronUtils.openEventReminderDialog()` 函数创建窗口。

## 数据存储

- **事件数据**: 存储在 SQLite 数据库的 `events` 表中
- **代办数据**: 存储在 SQLite 数据库的 `todos` 表中

## 技术栈

- Vue 3 (Composition API)
- Element Plus
- FullCalendar.js
- lunar-javascript (农历支持)

## 未来扩展

根据 `docs/AI日历提醒集成方案.md`，未来将集成：
- AI 自然语言解析
- 智能事件分类
- 上下文感知提醒
- 工作日志自动生成
- 分层记忆系统（Clawdbot 思路）

