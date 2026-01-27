# CommonJS 模块导入问题解决方案

## 问题说明

在使用 Rollup 打包时，经常会遇到 CommonJS 模块的默认导出问题，例如：

```
Error: 'default' is not exported by ../../node_modules/lodash/lodash.js
Error: 'default' is not exported by ../../node_modules/localforage/dist/localforage.js
Error: 'default' is not exported by ../../node_modules/json-stable-stringify/index.js
```

## 原因

这些模块是 **CommonJS 模块**，使用 `module.exports = ...` 导出，而不是 ES 模块的 `export default ...`。Rollup 的 `commonjs` 插件需要正确配置才能将它们转换为 ES 模块的默认导出。

## 解决方案

### 1. 配置 `rollup.config.js`（已配置）

在 `rollup.config.js` 中，`commonjs` 插件已经配置了：

```javascript
commonjs({
  defaultIsModuleExports: true,
  transformMixedEsModules: true,
  requireReturnsDefault: 'preferred',  // 关键配置
})
```

`requireReturnsDefault: 'preferred'` 会尝试将所有 `module.exports` 转换为默认导出。

### 2. 如果配置不够，使用命名空间导入

如果某些模块仍然无法工作，可以使用命名空间导入：

```typescript
// ❌ 不工作
import lodash from 'lodash';

// ✅ 工作
import * as lodashModule from 'lodash';
const lodash = (lodashModule as any).default || lodashModule;
```

### 3. 使用辅助函数（可选）

如果有很多文件需要处理，可以使用 `src/utils/commonjs-imports.ts` 中的辅助函数：

```typescript
import * as lodashModule from 'lodash';
import { getDefaultExport } from './utils/commonjs-imports';
const _ = getDefaultExport(lodashModule);
```

## 常见问题模块

以下模块已知需要特殊处理（已全部修复）：

- `lodash` - 已修复为 `import * as _ from 'lodash'`
- `localforage` - 已修复为命名空间导入
- `json-stable-stringify` - 已修复为命名空间导入
- `@messageformat/core` - 已修复为命名空间导入
- `moment` - 已修复为命名空间导入
- `dbgate-query-splitter` - 已修复为命名空间导入（命名导出）
- `ace-builds` - 已修复为命名空间导入（命名导出）
- `highlight.js` - 已修复为使用 ES 模块版本 `highlight.js/es/core`
- `xml-formatter` - 已修复为命名空间导入
- `sql-formatter` - 已修复为命名空间导入
- `compare-versions` - 已修复为命名空间导入
- `fuzzy` - 已修复为命名空间导入
- `mainMenuDefinition` - 已修复为命名空间导入

## 未来遇到新模块时

1. **首先尝试**：确保 `requireReturnsDefault: 'preferred'` 配置存在
2. **如果仍然失败**：使用命名空间导入方式
3. **批量修复**：可以创建临时脚本批量替换（参考之前的修复脚本）

## 为什么会有这个问题？

这不是版本问题，而是：
- **模块系统差异**：CommonJS (`module.exports`) vs ES 模块 (`export default`)
- **打包工具限制**：Rollup 需要明确配置才能正确转换
- **模块导出方式**：某些旧模块只支持 CommonJS，没有提供 ES 模块版本

## 最佳实践

1. **优先使用 ES 模块版本**：如果包提供了 ES 模块版本（如 `lodash-es`），优先使用
2. **统一配置**：在 `rollup.config.js` 中统一配置 `requireReturnsDefault: 'preferred'`
3. **必要时使用命名空间导入**：对于顽固的模块，使用命名空间导入是最可靠的方法

