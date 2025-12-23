/**
 * 格式化工具类
 */

/**
 * 将字节转换为人类可读的格式 (KB, MB, GB, etc.)
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 KB'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  // 对于小于1KB的，直接显示为0 KB
  if (i < 1) return '0 KB'
  
  // 使用2位小数，避免科学计数法
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
