import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
const { app } = require('electron')
import { fillMissingSettings } from './utils'

let initialConfig: any = {}
let settingsJson: any = {}

/**
 * 加载配置
 */
export function loadConfig(): void {
  const configRootPath = path.join(app.getPath('userData'), 'dbgate-config-root.json')
  
  try {
    initialConfig = JSON.parse(fs.readFileSync(configRootPath, { encoding: 'utf-8' }))
  } catch (err: any) {
    console.log('Error loading dbgate config-root:', err.message)
    initialConfig = {}
  }

  // 加载设置
  const datadir = path.join(os.homedir(), '.dbgate')
  try {
    settingsJson = fillMissingSettings(
      JSON.parse(fs.readFileSync(path.join(datadir, 'settings.json'), { encoding: 'utf-8' }))
    )
  } catch (err: any) {
    console.log('Error loading dbgate settings.json:', err.message)
    settingsJson = fillMissingSettings({})
  }
}

/**
 * 保存配置
 */
export function saveConfig(dbgateWindow: any, saveConfigOnExit: boolean): void {
  if (!dbgateWindow || !saveConfigOnExit) {
    return
  }

  try {
    const configRootPath = path.join(app.getPath('userData'), 'dbgate-config-root.json')
    fs.writeFileSync(
      configRootPath,
      JSON.stringify({
        winBounds: dbgateWindow.getBounds(),
        winIsMaximized: dbgateWindow.isMaximized(),
        winZoomLevel: dbgateWindow.webContents.zoomLevel,
      }),
      'utf-8'
    )
  } catch (err: any) {
    console.log('Error saving dbgate config-root:', err.message)
  }
}

/**
 * 获取初始配置
 */
export function getInitialConfig(): any {
  return initialConfig
}

/**
 * 获取设置 JSON
 */
export function getSettingsJson(): any {
  return settingsJson
}

