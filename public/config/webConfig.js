

window.webConfig = {
  baseUrl: '', //baseUrl为空时，开发环境使用localhost,会自动获取本地IP并更新baseUrl
  port: '8050',//默认端口8050,开发环境使用8050,生产环境使用浏览器端口
}


window.tkZjConfig = {
  //试卷用途
  PAPER_USER: [
    { label: "正式考试", value: "1" },
    // { label: "山大仿真", value: "2" },
    // { label: "海云天仿真", value: "3" },
  ],
  // 试卷选项顺序
  PAPER_OPTION_ORDER: [
    { label: "不乱序", value: "0" },
    { label: "乱序", value: "1" },
  ],
  // 试卷语言
  PAPER_LANG: [
    { label: "汉语简体", value: "1" },
    // { label: "蒙古文", value: "2" },
    // { label: "维吾尔文", value: "3" },
    // { label: "哈沙克文", value: "4" },
    // { label: "朝鲜文", value: "5" },
    // { label: "藏文", value: "6" },
    // { label: "英文", value: "7" },
    // { label: "汉语繁体", value: "8" },
  ],
  // 试卷是否包含答案
  PAPER_HAS_ANSWER: [
    { label: "不包含", value: "0" },
    { label: "包含", value: "1" },
  ],
  //试卷对应的项目
  PAPER_USE_PROJECT: [
      { label: "学考", value: "0"},
      { label: "会计", value: "1" },
    ]
}

