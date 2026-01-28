const electron = require('electron')
const { Menu } = electron
import { isMac, getTranslated, formatKeyText } from './utils'
import mainMenuDefinition from './mainMenuDefinition'

// 全局变量（需要在 electron.ts 中设置）
export let commands: Record<string, any> = {}
export let dbgateWindow: any = null
export let runCommandOnLoad: string | null = null

export function setCommands(newCommands: Record<string, any>) {
  commands = newCommands
}

export function getCommands(): Record<string, any> {
  return commands
}

export function setDbgateWindow(window: any | null) {
  dbgateWindow = window
}

export function getDbgateWindow(): any | null {
  return dbgateWindow
}

export function setRunCommandOnLoad(command: string | null) {
  runCommandOnLoad = command
}

export function getRunCommandOnLoad(): string | null {
  return runCommandOnLoad
}

/**
 * 简单的深拷贝函数（用于菜单构建）
 */
function cloneDeepWith(obj: any, customizer: (value: any) => any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map(item => {
      const result = customizer ? customizer(item) : undefined
      return result !== undefined ? result : cloneDeepWith(item, customizer)
    })
  }
  const cloned: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = customizer ? customizer(obj[key]) : undefined
      cloned[key] = result !== undefined ? result : cloneDeepWith(obj[key], customizer)
    }
  }
  return cloned
}

/**
 * 创建命令菜单项
 */
function commandItem(item: any, disableAll: boolean = false, createWindow: () => void): any {
  const id = item.command
  const command = getCommands()[id]
  
  if (item.skipInApp) {
    return { skip: true }
  }
  
  // 如果命令不存在，跳过这个菜单项（与原始代码保持一致）
  // 当收到 update-commands 后，菜单会被重建，此时命令数据已加载
  if (!command) {
    return { skip: true }
  }
  
  return {
    id,
    label: getTranslated(command.menuName) || getTranslated(command.toolbarName) || getTranslated(command.name) || id,
    accelerator: formatKeyText(command.keyText),
    enabled: command.enabled && (!disableAll || command.systemCommand),
    click() {
      const window = getDbgateWindow()
      if (window) {
        window.webContents.send('run-command', id)
      } else {
        setRunCommandOnLoad(id)
        createWindow()
      }
    },
  }
}

/**
 * 构建菜单
 */
export function buildMenu(disableAll: boolean = false, createWindow: () => void): typeof Menu {
  const _cloneDeepWith = cloneDeepWith
  
  let template = _cloneDeepWith(mainMenuDefinition({ editMenu: true, isMac: isMac() }), (item: any) => {
    if (item.divider) {
      return { type: 'separator' }
    }
    if (item.command) {
      return commandItem(item, disableAll, createWindow)
    }
  })

  template = _cloneDeepWith(template, (item: any) => {
    if (Array.isArray(item) && item.find((x: any) => x.skip)) {
      return item.filter((x: any) => x && !x.skip)
    }
  })

  if (isMac()) {
    template = [
      {
        label: 'DbGate',
        submenu: [
          commandItem({ command: 'about.show' }, disableAll, createWindow),
          { role: 'services' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { role: 'quit' },
        ],
      },
      ...template,
    ]
  }

  return Menu.buildFromTemplate(template)
}

