import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'

/**
 * 检查是否为 Mac 系统
 */
export function isMac(): boolean {
  return os.platform() === 'darwin'
}

/**
 * 获取翻译文本
 */
export function getTranslated(key: any): string {
  if (typeof key === 'string' && (global as any).TRANSLATION_DATA?.[key]) {
    return (global as any).TRANSLATION_DATA[key]
  }
  if (typeof key?._transKey === 'string') {
    return (global as any).TRANSLATION_DATA?.[key._transKey] ?? key._transOptions?.defaultMessage
  }
  return key
}

/**
 * 格式化快捷键文本
 */
export function formatKeyText(keyText?: string): string | undefined {
  if (!keyText) {
    return keyText
  }
  if (os.platform() === 'darwin') {
    return keyText.replace('CtrlOrCommand+', 'Command+')
  }
  return keyText.replace('CtrlOrCommand+', 'Ctrl+')
}

/**
 * 确保窗口边界在可见区域内
 */
export function ensureBoundsVisible(bounds: Electron.Rectangle): Electron.Rectangle {
  const { screen } = require('electron')
  const area = screen.getDisplayMatching(bounds).workArea

  let { x, y, width, height } = bounds

  const isWithinDisplay =
    x >= area.x && x + width <= area.x + area.width && y >= area.y && y + height <= area.y + area.height

  if (!isWithinDisplay) {
    width = Math.min(width, area.width)
    height = Math.min(height, area.height)

    if (width < 400) width = 400
    if (height < 300) height = 300

    x = area.x
    y = area.y
  }

  return { x, y, width, height }
}

/**
 * 填充缺失的设置
 */
export function fillMissingSettings(value: any): any {
  const res = { ...value }
  if (value['app.useNativeMenu'] !== true && value['app.useNativeMenu'] !== false) {
    res['app.useNativeMenu'] = false
  }
  return res
}

/**
 * 智能查找 dbgate 文件路径
 * 支持开发环境和生产环境（打包后）
 */
export function findDbgatePath(relativePath: string): string | null {
  // 可能的根目录路径（从 dist/electron/service 向上查找）
  const possibleRoots = [
    // 开发环境：从 dist/electron/service 向上三级到达项目根目录
    path.join(__dirname, '../../..'),
    // 生产环境：从 resources/app/electron/service 向上三级
    path.join(__dirname, '../../../..'),
    // 如果打包在 app.asar 中，从 resources 目录查找
    process.resourcesPath ? path.join(process.resourcesPath, 'app') : null,
    // 当前工作目录
    process.cwd(),
    // 从 app.getAppPath() 查找（Electron 应用路径）
    app ? app.getAppPath() : null,
  ].filter(Boolean) as string[]

  // 需要查找的路径模式
  const searchPatterns = [
    // 模式1：直接在根目录下的 dbgate-master
    (root: string) => path.join(root, 'dbgate-master', relativePath),
    // 模式2：在 dist 目录下的 dbgate-master（开发环境构建后）
    (root: string) => path.join(root, 'dist', 'dbgate-master', relativePath),
    // 模式3：在 app/packages 中（dbgate app 打包后的结构）
    (root: string) => path.join(root, 'dbgate-master', 'app', relativePath),
    // 模式4：直接在根目录（如果 relativePath 已经包含 dbgate-master）
    (root: string) => path.join(root, relativePath),
  ]

  for (const root of possibleRoots) {
    for (const pattern of searchPatterns) {
      const fullPath = pattern(root)
      if (fs.existsSync(fullPath)) {
        return fullPath
      }
    }
  }

  return null
}

