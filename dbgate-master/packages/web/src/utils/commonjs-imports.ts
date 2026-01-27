/**
 * 统一的 CommonJS 模块导入辅助函数
 * 
 * 用于处理那些使用 module.exports 而不是 ES 模块默认导出的 CommonJS 模块
 * 这样可以避免在每个文件中重复处理导入逻辑
 */

/**
 * 从 CommonJS 模块导入默认导出
 * @param module - 导入的模块命名空间
 * @returns 模块的默认导出或模块本身
 */
export function getDefaultExport<T>(module: any): T {
  return (module.default || module) as T;
}

/**
 * 使用示例：
 * 
 * import * as lodashModule from 'lodash';
 * import { getDefaultExport } from './utils/commonjs-imports';
 * const _ = getDefaultExport<typeof import('lodash')>(lodashModule);
 * 
 * import * as localforageModule from 'localforage';
 * const localforage = getDefaultExport<typeof import('localforage')>(localforageModule);
 */

