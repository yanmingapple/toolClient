export class DanxuanConfig {
  constructor() {}

  getData() {
    // 保存 this 引用，以便在钩子函数中使用
    const self = this;
    var config = {
      title: '',
      lang: 'zh',
      showinfobar: false,
      showsheetbar: false, // 底部sheet页
      sheetFormulaBar: true, // 是否显示公示栏
      showstatisticBar: false, // 自定义计数栏
      showtoolbar: false, // 默认工具栏都不显示
      enableAddRow: true, // 底部添加行按钮
      devicePixelRatio: 1.1,
      zoomRatio: 1,
      showtoolbarConfig: {
        undoRedo: false, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
        paintFormat: false, //格式刷
        currencyFormat: false, //货币格式
        percentageFormat: false, //百分比格式
        numberDecrease: false, // '减少小数位数'
        numberIncrease: false, // '增加小数位数
        moreFormats: false, // '更多格式'
        font: false, // '字体'
        fontSize: false, // '字号大小'
        bold: false, // '粗体 (Ctrl+B)'
        italic: false, // '斜体 (Ctrl+I)'
        strikethrough: false, // '删除线 (Alt+Shift+5)'
        underline: false, // '下划线 (Alt+Shift+6)'
        textColor: false, // '文本颜色'
        fillColor: false, // '单元格颜色'
        border: false, // '边框'
        mergeCell: false, // '合并单元格'
        horizontalAlignMode: false, // '水平对齐方式'
        verticalAlignMode: false, // '垂直对齐方式'
        textWrapMode: false, // '换行方式'
        textRotateMode: false, // '文本旋转方式'
        image: false, // '插入图片'
        link: false, // '插入链接'
        chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
        postil: false, //'批注'
        pivotTable: false, //'数据透视表'
        function: false, // '公式'
        frozenMode: false, // '冻结方式'
        sortAndFilter: true, // '排序和筛选'
        conditionalFormat: false, // '条件格式'
        dataVerification: false, // '数据验证'
        splitColumn: false, // '分列'
        screenshot: false, // '截图'
        findAndReplace: true, // '查找替换'
        protection: false, // '工作表保护'
        print: false, // '打印'
        exportXlsx: false,
      },
      cellRightClickConfig: {
        copy: true, // 复制
        copyAs: false, // 复制为
        paste: true, // 粘贴
        insertRow: true, // 插入行
        insertColumn: true, // 插入列
        deleteRow: true, // 删除选中行
        deleteColumn: true, // 删除选中列
        deleteCell: false, // 删除单元格
        hideRow: false, // 隐藏选中行和显示选中行
        hideColumn: false, // 隐藏选中列和显示选中列
        rowHeight: false, // 行高
        columnWidth: false, // 列宽
        clear: true, // 清除内容
        matrix: false, // 矩阵操作选区
        sort: false, // 排序选区
        filter: false, // 筛选选区
        chart: false, // 图表生成
        image: false, // 插入图片
        link: false, // 插入链接
        data: false, // 数据验证
        cellFormat: false, // 设置单元格格式
      }, //自定义单元格右键菜单
      showsheetbarConfig: {
        add: false, //新增sheet
        menu: false, //sheet管理菜单
        sheet: false, //sheet页显示
      },
      showstatisticBarConfig: {
        count: false, // 计数栏
        view: false, // 打印视图
        zoom: false, // 缩放
      },
      data: [
        {
          name: 'Sheet1',
          color: '',
          status: '1',
          order: '0',
          data: [
            [
              {
                v: '活动名称',
                ct: { fa: 'General', t: 'g' },
                m: '活动名称',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '科目',
                ct: { fa: 'General', t: 'g' },
                m: '科目',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '命题模式',
                ct: { fa: 'General', t: 'g' },
                m: '命题模式',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '开始日期',
                ct: { fa: 'General', t: 'g' },
                m: '开始日期',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '结束日期',
                ct: { fa: 'General', t: 'g' },
                m: '结束日期',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '描述',
                ct: { fa: 'General', t: 'g' },
                m: '描述',
                bg: 'rgb(255, 229, 153)',
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
            ],
            [
              null,
              {
                v: '',
                ct: { fa: 'General', t: 'g' },
                m: '',
                bg: null,
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '分散命题',
                ct: { fa: 'General', t: 'g' },
                m: '分散命题',
                bg: null,
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '2024-09-27',
                ct: { fa: '@', t: 's' },
                m: '2024-09-27',
                bg: null,
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              {
                v: '2024-09-27',
                ct: { fa: '@', t: 's' },
                m: '2024-09-27',
                bg: null,
                bl: 0,
                it: 0,
                ff: 1,
                fs: 11,
                fc: 'rgb(102, 102, 102)',
                ht: 1,
                vt: 0,
              },
              null,
            ],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
            [null, null, null, null, null, null],
          ],
          config: {
            merge: {},
            rowlen: { 0: 19.0909, 1: 19.0909 },
            columnlen: { 0: 230, 1: 192, 2: 141, 3: 141, 4: 178, 5: 193 },
            colhidden: {},
            customWidth: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
          },
          index: 0,
          column: 5,
          jfgird_select_save: [],
          luckysheet_select_save: [
            {
              left: 424,
              width: 141,
              top: 20,
              height: 19,
              left_move: 424,
              width_move: 141,
              top_move: 20,
              height_move: 19,
              row: [1, 1],
              column: [2, 2],
              row_focus: 1,
              column_focus: 2,
            },
          ],
          load: '1',
          visibledatarow: [
            20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320,
            340, 360, 380, 400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620,
            640, 660, 680, 700, 720, 740, 760, 780, 800, 820, 840, 860, 880, 900, 920,
            940, 960, 980, 1000, 1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180,
            1200, 1220, 1240, 1260, 1280, 1300, 1320, 1340, 1360, 1380, 1400, 1420, 1440,
            1460, 1480, 1500, 1520, 1540, 1560, 1580, 1600, 1620, 1640, 1660, 1680,
          ],
          visibledatacolumn: [231, 424, 566, 708, 887, 1081],
          ch_width: 1201,
          rh_height: 1760,
          luckysheet_selection_range: [],
          zoomRatio: 1,
          scrollTop: 0,
          calcChain: [],
          filter_select: null,
          filter: null,
          luckysheet_conditionformat_save: [],
          luckysheet_alternateformat_save: [],
          dataVerification: {
            '1_1': {
              type: 'dropdown',
              type2: false,
              value1: '分散命题,审题改题,抽题组卷,集中命题',
              value2: '',
              checked: false,
              remote: false,
              prohibitInput: false,
              hintShow: false,
              hintText: '',
            },
            '1_2': {
              type: 'dropdown',
              type2: false,
              value1: '分散命题,审题改题,抽题组卷,集中命题',
              value2: '',
              checked: false,
              remote: false,
              prohibitInput: false,
              hintShow: false,
              hintText: '',
            },
          },
          hyperlink: {},
          images: {},
          scrollLeft: 0,
        },
      ],
      hook: {
        cellUpdated: (r, c, oldValue, newValue, isRefresh) => {
          if (
            oldValue &&
            oldValue.v != null &&
            oldValue.v != undefined &&
            oldValue != ''
          ) {
            if (self.luckSheet && self.luckSheet.delComment) {
              self.luckSheet.delComment(r, c);
            }
          }
        },
        commentInsertAfter: (r, c, d) => {
          if (self.luckSheet && self.luckSheet.hideResizeComment) {
            self.luckSheet.hideResizeComment(r, c);
          }
        },
      },
    };
    return config;
  }
}
