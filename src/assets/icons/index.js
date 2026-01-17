import SvgIcon from '@/components/SvgIcon/index.vue'// svg component

//在src 目录下util新建   directive.js 文件 用于输出指令
export const globallyComponent=(app)=>{
	app.component('svg-icon', SvgIcon)
}

// 使用 Vite 的 import.meta.glob 替代 require.context
// 导入所有 SVG 文件作为原始字符串
const svgModules = import.meta.glob('./svg/*.svg?raw', { 
  eager: true 
})

// 初始化 SVG sprite
function initSvgSprite() {
  // 确保在浏览器环境中执行
  if (typeof document === 'undefined') {
    return []
  }

  // 创建一个 SVG sprite 容器
  const svgSpriteId = 'tk-svg-sprite'
  let svgSprite = document.getElementById(svgSpriteId)

  if (!svgSprite) {
    svgSprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgSprite.id = svgSpriteId
    svgSprite.style.display = 'none'
    svgSprite.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    // 确保 body 存在后再追加
    if (document.body) {
      document.body.appendChild(svgSprite)
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(svgSprite)
      })
    }
  }

  // 处理每个 SVG 文件，将其转换为 symbol 并添加到 sprite 中
  const avgIcons = []
  Object.keys(svgModules).forEach((path) => {
    const svgContent = svgModules[path]
    if (typeof svgContent === 'string') {
      // 从路径中提取文件名（不含扩展名）
      // 例如: ./svg/ic_folder.svg -> ic_folder
      const fileName = path.match(/\/([^/]+)\.svg$/)?.[1]
      if (fileName) {
        // 解析 SVG 内容
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
        const svgElement = svgDoc.querySelector('svg')
        
        if (svgElement) {
          // 创建 symbol 元素
          const symbolId = `icon-${fileName}`
          
          // 检查是否已存在该 symbol，避免重复添加
          if (!document.getElementById(symbolId) && svgSprite) {
            const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
            symbol.id = symbolId
            
            // 复制 SVG 元素的 viewBox 属性（如果存在）
            if (svgElement.getAttribute('viewBox')) {
              symbol.setAttribute('viewBox', svgElement.getAttribute('viewBox'))
            }
            
            // 递归函数：处理 SVG 元素及其子元素，设置 fill 为 currentColor
            const processSvgElement = (element) => {
              // 处理当前元素
              const fill = element.getAttribute('fill')
              // 如果没有 fill 属性，或者是黑色/默认值/none，设置为 currentColor
              // 这样图标可以继承父元素的文字颜色
              if (!fill || fill === '#000' || fill === '#000000' || fill === 'black' || fill === 'none') {
                element.setAttribute('fill', 'currentColor')
              }
              // 递归处理所有子元素
              Array.from(element.children).forEach(child => {
                processSvgElement(child)
              })
            }
            
            // 复制子元素（排除 script、style 等）
            Array.from(svgElement.childNodes).forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName?.toLowerCase()
                if (tagName && !['script', 'style'].includes(tagName)) {
                  const clonedNode = node.cloneNode(true)
                  // 处理 fill 属性
                  processSvgElement(clonedNode)
                  symbol.appendChild(clonedNode)
                }
              } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                symbol.appendChild(node.cloneNode(true))
              }
            })
            
            svgSprite.appendChild(symbol)
          }
          
          avgIcons.push({ id: `icon-${fileName}`, path, content: svgContent })
        }
      }
    }
  })

  return avgIcons
}

// 初始化 SVG sprite（延迟执行以确保 DOM 已准备好）
const avgIcons = typeof window !== 'undefined' 
  ? (document.readyState === 'loading' 
      ? (document.addEventListener('DOMContentLoaded', () => { window.tkAvgIcons = initSvgSprite() }), [])
      : initSvgSprite())
  : []

window.tkAvgIcons = avgIcons
