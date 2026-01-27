/////////////////////////////配置说明///////////////////////////////
/**
 * The default luckysheet config object.
 */
export default {
    container: "luckysheet", //容器的ID
    loading:{}, //自定义loading
    column: 60, //空表格默认的列数量
    row: 84, //空表格默认的行数据量
    allowCopy: true, //是否允许拷贝
    showtoolbar: true, //是否第二列显示工具栏
    showinfobar: false, //是否显示顶部名称栏
    showsheetbar: true, //是否显示底部表格名称区域
    showstatisticBar: true, //是否显示底部计数栏
    pointEdit: false, //是否是编辑器插入表格模式
    pointEditUpdate: null, //编辑器表格更新函数
    pointEditZoom: 1, //编辑器表格编辑时缩放比例
    // menu: "undo|redo|freezenrow|freezencolumn|download|share|chart|pivot",
    data: [{ "name": "Sheet1", color: "", "status": "1", "order": "0", "data": [], "config": {}, "index":0 }, { "name": "Sheet2", color: "", "status": "0", "order": "1", "data": [], "config": {}, "index":1  }, { "name": "Sheet3", color: "", "status": "0", "order": "2", "data": [], "config": {}, "index":2  }], //客户端sheet数据[sheet1, sheet2, sheet3]
    title: "题库", //表格的名称
    userInfo:false,// 右上角的用户信息展示样式，支持 1. boolean类型：false:不展示，true:展示默认 '<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> rabbit' ，2. HTML模板字符串或者普通字符串，如：'<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> Lucky'或者'用户名'， 3. 对象格式，设置 userImage：用户头像地址 和 userName：用户名 4. 不设置或者设置undefined同设置false
    userMenuItem: [{url:"www.baidu.com", "icon":'<i class="fa fa-folder" aria-hidden="true"></i>', "name":"我的表格"}, {url:"www.baidu.com", "icon":'<i class="fa fa-sign-out" aria-hidden="true"></i>', "name":"退出登陆"}], //点击右上角的用户信息弹出的菜单
    myFolderUrl: "/#/workbench/index", //左上角<返回按钮的链接
    config: {}, //表格行高、列宽、合并单元格、公式等设置
    fullscreenmode: true, //是否全屏模式，非全屏模式下，标记框不会强制选中。
    devicePixelRatio: window.devicePixelRatio, //设备比例，比例越大表格分标率越高
    allowEdit: true, //是否允许前台编辑
    loadUrl: "", // 配置loadUrl的地址，luckysheet会通过ajax请求表格数据，默认载入status为1的sheet数据中的所有data，其余的sheet载入除data字段外的所有字段
    loadSheetUrl: "", //配置loadSheetUrl的地址，参数为gridKey（表格主键） 和 index（sheet主键合集，格式为[1,2,3]），返回的数据为sheet的data字段数据集合
    gridKey: "", // 表格唯一标识符
    updateUrl: "", //表格数据的更新地址
    updateImageUrl: "", //缩略图的更新地址
    allowUpdate: false, //是否允许编辑后的后台更新
    functionButton: "", //右上角功能按钮，例如'<button id="" class="btn btn-primary" style="padding:3px 6px;font-size: 12px;margin-right: 10px;">下载</button>    <button id="" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">分享</button>    <button id="luckysheet-share-btn-title" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">秀数据</button>'
    showConfigWindowResize: true, //图表和数据透视表的配置会在右侧弹出，设置弹出后表格是否会自动缩进
    enableAddRow: true,//允许添加行
    enableAddBackTop: true,//允许回到顶部
    // enablePage: false,//允许加载下一页
    autoFormatw: false,  //自动格式化超过4位数的数字为 亿万格式 例：true or "true" or "TRUE"
    accuracy: undefined,  //设置传输来的数值的精确位数，小数点后n位 传参数为数字或数字字符串，例： "0" 或 0
    pageInfo:{
        'queryExps':'',
        'reportId':'',
        'fields':'',
        'mobile':'',
        'frezon':'',
        'currentPage':'',
        "totalPage":10,
        "pageUrl":"",
    },
    editMode: false, //是否为编辑模式
    beforeCreateDom: null,//表格创建之前的方法
    fireMousedown: null, //单元格数据下钻
    lang: 'zh', //language
    plugins: [], //plugins, e.g. ['chart']
    forceCalculation:false,//强制刷新公式，公式较多会有性能问题，慎用
    rowHeaderWidth: 46,
    columnHeaderHeight: 20,
    defaultColWidth:73,
    defaultRowHeight:19,
    defaultFontSize:10,
    limitSheetNameLength:true,    //是否限制工作表名的长度
    defaultSheetNameMaxLength:31,  //默认工作表名称的最大长度
    sheetFormulaBar:true, //是否显示公式栏
    showtoolbarConfig:{
      // 自定义配置工具栏
      undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
      paintFormat: true, //格式刷
      currencyFormat: true, //货币格式
      percentageFormat: true, //百分比格式
      numberDecrease: true, // '减少小数位数'
      numberIncrease: true, // '增加小数位数
      moreFormats: true, // '更多格式'
      font: true, // '字体'
      fontSize: true, // '字号大小'
      bold: true, // '粗体 (Ctrl+B)'
      italic: true, // '斜体 (Ctrl+I)'
      strikethrough: true, // '删除线 (Alt+Shift+5)'
      underline: true, // '下划线 (Alt+Shift+6)'
      textColor: true, // '文本颜色'
      fillColor: true, // '单元格颜色'
      border: true, // '边框'
      mergeCell: true, // '合并单元格'
      horizontalAlignMode: true, // '水平对齐方式'
      verticalAlignMode: true, // '垂直对齐方式'
      textWrapMode: true, // '换行方式'
      textRotateMode: true, // '文本旋转方式'
      image: true, // '插入图片'
      link: true, // '插入链接'
      chart: true, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
      postil: true, //'批注'
      pivotTable: true, //'数据透视表'
      function: true, // '公式'
      frozenMode: true, // '冻结方式'
      sortAndFilter: true, // '排序和筛选'
      conditionalFormat: true, // '条件格式'
      dataVerification: true, // '数据验证'
      splitColumn: true, // '分列'
      screenshot: true, // '截图'
      findAndReplace: true, // '查找替换'
      protection: true, // '工作表保护'
      print: true, // '打印'
    }, //自定义工具栏
    showsheetbarConfig:{
        add: true, //新增sheet
        menu: true, //sheet管理菜单
        sheet: true, //sheet页显示
    }, //自定义底部sheet页
    showstatisticBarConfig:{
        count: true, // 计数栏
        view: true, // 打印视图
        zoom: true, // 缩放
    }, //自定义计数栏
    cellRightClickConfig:{
      copy: true, // 复制
      copyAs: true, // 复制为
      paste: true, // 粘贴
      insertRow: true, // 插入行
      insertColumn: true, // 插入列
      deleteRow: true, // 删除选中行
      deleteColumn: true, // 删除选中列
      deleteCell: true, // 删除单元格
      hideRow: true, // 隐藏选中行和显示选中行
      hideColumn: true, // 隐藏选中列和显示选中列
      rowHeight: true, // 行高
      columnWidth: true, // 列宽
      clear: true, // 清除内容
      matrix: true, // 矩阵操作选区
      sort: true, // 排序选区
      filter: true, // 筛选选区
      chart: true, // 图表生成
      image: true, // 插入图片
      link: true, // 插入链接
      data: true, // 数据验证
      cellFormat: true, // 设置单元格格式
    }, //自定义单元格右键菜单
    sheetRightClickConfig:{
        delete: true, // 删除
        copy: true, // 复制
        rename: true, //重命名
        color: true, //更改颜色
        hide: true, //隐藏，取消隐藏
        move: true, //向左移，向右移
    }, //自定义底部sheet页右击菜单
    imageUpdateMethodConfig:{}, //自定义图片同步方式
}


如何使用
1、 参考其他已经做的导入，先写一个配置文件
2. 在模板设计器中设计后，点击获取配置，自动复制，替换data 节点
export class DanxuanConfig {
	constructor() {
	  }

	getData() {

		var config = {
			title: "",
			lang: "zh",
			showinfobar: false,
			showsheetbar: false, // 底部sheet页
			sheetFormulaBar: true, // 是否显示公示栏
			showstatisticBar: false, // 自定义计数栏
			showtoolbar: true, // 默认工具栏都不显示
			enableAddRow: true, // 底部添加行按钮
			devicePixelRatio: 1.1,
			showtoolbarConfig: {
				undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
				paintFormat: true, //格式刷
				currencyFormat: false, //货币格式
				percentageFormat: false, //百分比格式
				numberDecrease: false, // '减少小数位数'
				numberIncrease: false, // '增加小数位数
				moreFormats: true, // '更多格式'
				font: true, // '字体'
				fontSize: true, // '字号大小'
				bold: true, // '粗体 (Ctrl+B)'
				italic: true, // '斜体 (Ctrl+I)'
				strikethrough: true, // '删除线 (Alt+Shift+5)'
				underline: true, // '下划线 (Alt+Shift+6)'
				textColor: true, // '文本颜色'
				fillColor: true, // '单元格颜色'
				border: true, // '边框'
				mergeCell: true, // '合并单元格'
				horizontalAlignMode: true, // '水平对齐方式'
				verticalAlignMode: true, // '垂直对齐方式'
				textWrapMode: false, // '换行方式'
				textRotateMode: false, // '文本旋转方式'
				image: false, // '插入图片'
				link: false, // '插入链接'
				chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
				postil: true, //'批注'
				pivotTable: false, //'数据透视表'
				function: false, // '公式'
				frozenMode: false, // '冻结方式'
				sortAndFilter: false, // '排序和筛选'
				conditionalFormat: false, // '条件格式'
				dataVerification: false, // '数据验证'
				splitColumn: false, // '分列'
				screenshot: false, // '截图'
				findAndReplace: false, // '查找替换'
				protection: false, // '工作表保护'
				print: false, // '打印'
				exportXlsx: false
			},
			cellRightClickConfig: {
				copy: true, // 复制
				copyAs: false, // 复制为
				paste: true, // 粘贴
				insertRow: true, // 插入行
				insertColumn: false, // 插入列
				deleteRow: true, // 删除选中行
				deleteColumn: false, // 删除选中列
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
			data:
			[{"name":"Sheet1","color":"","status":"1","order":"0","data":[[{"m":"教师名称","ct":{"fa":"General","t":"g"},"v":"教师名称","bl":1,"bg":"#b6d7a8","ht":"0"},{"m":"身份证号","ct":{"fa":"General","t":"g"},"v":"身份证号","bl":1,"bg":"#b6d7a8","ht":"0"},{"m":"电话","ct":{"fa":"General","t":"g"},"v":"电话","bl":1,"bg":"#b6d7a8","ht":"0"},{"m":"院系","ct":{"fa":"General","t":"g"},"v":"院系","bl":1,"bg":"#b6d7a8","ht":"0"},{"m":"备注","ct":{"fa":"General","t":"g"},"v":"备注","bl":1,"bg":"#b6d7a8","ht":"0"}],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]],"config":{"columnlen":{"0":133,"1":213,"2":174,"3":250,"4":246},"customWidth":{"0":1,"1":1,"2":1,"3":1,"4":1,"5":1,"6":1},"merge":{},"colhidden":{},"rowlen":{"0":43},"customHeight":{"0":1}},"index":0,"column":5,"jfgird_select_save":[],"luckysheet_select_save":[{"left":0,"width":133,"top":44,"height":19,"left_move":0,"width_move":133,"top_move":44,"height_move":19,"row":[1,1],"column":[0,0],"row_focus":1,"column_focus":0}],"load":"1","visibledatarow":[44,64,84,104,124,144,164,184,204,224,244,264,284,304,324,344,364,384,404,424,444,464,484,504,524,544,564,584,604,624,644,664,684,704,724,744,764,784,804,824,844,864,884,904,924,944,964,984,1004,1024,1044,1064,1084,1104,1124,1144,1164,1184,1204,1224,1244,1264,1284,1304,1324,1344,1364,1384,1404,1424,1444,1464,1484,1504,1524,1544,1564,1584,1604,1624,1644,1664,1684,1704],"visibledatacolumn":[134,348,523,774,1021],"ch_width":1141,"rh_height":1784,"luckysheet_selection_range":[],"zoomRatio":1,"images":{},"scrollTop":0,"calcChain":[],"filter_select":null,"filter":null,"luckysheet_conditionformat_save":[],"luckysheet_alternateformat_save":[],"dataVerification":{},"hyperlink":{},"scrollLeft":305,"frozen":{"type":"row"},"freezen":{"horizontal":{"freezenhorizontaldata":[44,1,0,[64,84,104,124,144,164,184,204,224,244,264,284,304,324,344,364,384,404,424,444,464,484,504,524,544,564,584,604,624,644,664,684,704,724,744,764,784,804,824,844,864,884,904,924,944,964,984,1004,1024,1044,1064,1084,1104,1124,1144,1164,1184,1204,1224,1244,1264,1284,1304,1324,1344,1364,1384,1404,1424,1444,1464,1484,1504,1524,1544,1564,1584,1604,1624,1644,1664,1684,1704],62],"top":62}}}]
		
			,hook:{
				cellUpdated:(r,c,oldValue,newValue,isRefresh)=>{
					  if(oldValue && oldValue.v != null && oldValue.v != undefined && oldValue != ''){
					    this.luckSheet.delComment(r,c)
					  }
					},
					commentInsertAfter:(r,c, d)=>{
						this.luckSheet.hideResizeComment(r,c)
					}
			}
		}

		return config;
	}
}


进阶钩子函数
单元格
cellEditBefore
类型：Function

默认值：null

作用：进入单元格编辑模式之前触发。在选中了某个单元格且在非编辑状态下，通常有以下三种常规方法触发进入编辑模式

双击单元格
敲Enter键
使用API：enterEditMode
参数：

{Array} [range]: 当前选区范围
cellUpdateBefore
类型：Function
默认值：null
作用：更新这个单元格值之前触发，return false 则不执行后续的更新。在编辑状态下修改了单元格之后，退出编辑模式并进行数据更新之前触发这个钩子。
参数：
{Number} [r]: 单元格所在行数
{Number} [c]: 单元格所在列数
{Object | String | Number} [value]: 要修改的单元格内容
{Boolean} [isRefresh]: 是否刷新整个表格

cellUpdated
类型：Function
默认值：null
作用：更新这个单元格后触发
参数：
{Number} [r]: 单元格所在行数
{Number} [c]: 单元格所在列数
{Object} [oldValue]: 修改前的单元格对象
{Object} [newValue]: 修改后的单元格对象
{Boolean} [isRefresh]: 是否刷新整个表格

cellRenderBefore
类型：Function
默认值：null
作用：单元格渲染前触发，return false 则不渲染该单元格
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context
cellRenderAfter
类型：Function

默认值：null

作用：单元格渲染结束后触发，return false 则不渲染该单元格

参数：

{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context


cellAllRenderBefore
类型：Function
默认值：null
作用：所有单元格渲染之前执行的方法。在内部，这个方法加在了luckysheetDrawMain渲染表格之前。
参数：
{Object} [data]: 当前工作表二维数组数据
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context
rowTitleCellRenderBefore
类型：Function
默认值：null
作用：行标题单元格渲染前触发，return false 则不渲染行标题
参数：
{String} [rowNum]:行号
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [top]:单元格左上角的垂直坐标
{Number} [width]:单元格宽度
{Number} [height]:单元格高度
{Object} [ctx]: 当前画布的context
rowTitleCellRenderAfter
类型：Function
默认值：null
作用：行标题单元格渲染后触发，return false 则不渲染行标题
参数：
{String} [rowNum]:行号
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [top]:单元格左上角的垂直坐标
{Number} [width]:单元格宽度
{Number} [height]:单元格高度
{Object} [ctx]: 当前画布的context
columnTitleCellRenderBefore
类型：Function
默认值：null
作用：列标题单元格渲染前触发，return false 则不渲染列标题
参数：
{Object} [columnAbc]:列标题字符
{Object} [position]:
{Number} [c]:单元格所在列号
{Number} [left]:单元格左上角的水平坐标
{Number} [width]:单元格宽度
{Number} [height]:单元格高度
{Object} [ctx]: 当前画布的context
columnTitleCellRenderAfter
类型：Function
默认值：null
作用：列标题单元格渲染后触发，return false 则不渲染列标题
参数：
{Object} [columnAbc]:列标题字符
{Object} [position]:
{Number} [c]:单元格所在列号
{Number} [left]:单元格左上角的水平坐标
{Number} [width]:单元格宽度
{Number} [height]:单元格高度
{Object} [ctx]: 当前画布的context
鼠标钩子
cellMousedownBefore
类型：Function
默认值：null
作用：单元格点击前的事件，return false则终止之后的点击操作
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context
cellMousedown
类型：Function
默认值：null
作用：单元格点击后的事件，return false则终止之后的点击操作
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context
sheetMousemove
类型：Function
默认值：null
作用：鼠标移动事件，可通过cell判断鼠标停留在哪个单元格
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [moveState]:鼠标移动状态，可判断现在鼠标操作的对象，false和true
{Boolean} [functionResizeStatus]:工具栏拖动
{Boolean} [horizontalmoveState]:水平冻结分割栏拖动
{Boolean} [verticalmoveState]:垂直冻结分割栏拖动
{Boolean} [pivotTableMoveState]:数据透视表字段拖动
{Boolean} [sheetMoveStatus]:sheet改变你位置拖动
{Boolean} [scrollStatus]:鼠标触发了滚动条移动
{Boolean} [selectStatus]:鼠标移动框选数据
{Boolean} [rowsSelectedStatus]:通过行标题来选择整行操作
{Boolean} [colsSelectedStatus]:通过列标题来选择整列操作
{Boolean} [cellSelectedMove]:选框的移动
{Boolean} [cellSelectedExtend]:选框下拉填充
{Boolean} [colsChangeSize]:拖拽改变列宽
{Boolean} [rowsChangeSize]:拖拽改变行高
{Boolean} [chartMove]:图表移动
{Boolean} [chartResize]:图表改变大小
{Boolean} [rangeResize]:公式参数高亮选区的大小拖拽
{Boolean} [rangeMove]:公式参数高亮选区的位置拖拽
{Object} [ctx]: 当前画布的context
sheetMouseup
类型：Function
默认值：null
作用：鼠标按钮释放事件，可通过cell判断鼠标停留在哪个单元格
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [moveState]:鼠标移动状态，可判断现在鼠标操作的对象，false和true
{Boolean} [functionResizeStatus]:工具栏拖动
{Boolean} [horizontalmoveState]:水平冻结分割栏拖动
{Boolean} [verticalmoveState]:垂直冻结分割栏拖动
{Boolean} [pivotTableMoveState]:数据透视表字段拖动
{Boolean} [sheetMoveStatus]:sheet改变你位置拖动
{Boolean} [scrollStatus]:鼠标触发了滚动条移动
{Boolean} [selectStatus]:鼠标移动框选数据
{Boolean} [rowsSelectedStatus]:通过行标题来选择整行操作
{Boolean} [colsSelectedStatus]:通过列标题来选择整列操作
{Boolean} [cellSelectedMove]:选框的移动
{Boolean} [cellSelectedExtend]:选框下拉填充
{Boolean} [colsChangeSize]:拖拽改变列宽
{Boolean} [rowsChangeSize]:拖拽改变行高
{Boolean} [chartMove]:图表移动
{Boolean} [chartResize]:图表改变大小
{Boolean} [rangeResize]:公式参数高亮选区的大小拖拽
{Boolean} [rangeMove]:公式参数高亮选区的位置拖拽
{Boolean} [cellRightClick]:单元格右击
{Boolean} [rowTitleRightClick]:行标题右击
{Boolean} [columnTitleRightClick]:列标题右击
{Boolean} [sheetRightClick]:底部sheet页右击
{Boolean} [hyperlinkClick]:点击超链接
{Object} [ctx]: 当前画布的context
scroll
类型：Function
默认值：null
作用：鼠标滚动事件
参数：
{Object} [position]:
{Number} [scrollLeft]:横向滚动条的位置
{Number} [scrollTop]:垂直滚动条的位置
{Number} [canvasHeight]:canvas高度
cellDragStop
类型：Function
默认值：null
作用：鼠标拖拽文件到Luckysheet内部的结束事件
参数：
{Object} [cell]:单元格对象
{Object} [position]:
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Number} [start_r]:单元格左上角的垂直坐标
{Number} [start_c]:单元格左上角的水平坐标
{Number} [end_r]:单元格右下角的垂直坐标
{Number} [end_c]:单元格右下角的水平坐标
{Object} [sheet]:当前sheet对象
{Object} [ctx]: 当前画布的context
{Object} [event]: 当前事件对象
选区操作（包括单元格）
rangeSelect
类型：Function
默认值：null
作用：框选或者设置选区后触发
参数：
{Object} [sheet]:当前sheet对象
{Object | Array} [range]: 选区范围，可能为多个选区
rangeMoveBefore
（TODO）

类型：Function
默认值：null
作用：移动选区前，包括单个单元格
参数：
{Array} [range]: 当前选区范围，只能为单个选区
rangeMoveAfter
（TODO）

类型：Function
默认值：null
作用：移动选区后，包括单个单元格
参数：
{Array} [oldRange]: 移动前当前选区范围，只能为单个选区
{Array} [newRange]: 移动后当前选区范围，只能为单个选区
rangeEditBefore
（TODO）

类型：Function
默认值：null
作用：选区修改前
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 选区范围所对应的数据
rangeEditAfter
（TODO）

类型：Function
默认值：null
作用：选区修改后
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [oldData]: 修改前选区范围所对应的数据
{Object} [newData]: 修改后选区范围所对应的数据
rangeCopyBefore
（TODO）

类型：Function
默认值：null
作用：选区复制前
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 选区范围所对应的数据
rangeCopyAfter
（TODO）

类型：Function
默认值：null
作用：选区复制后
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 选区范围所对应的数据
rangePasteBefore
类型：Function
默认值：null
作用：选区粘贴前
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 要被粘贴的选区范围所对应的数据
rangePasteAfter
（TODO）

类型：Function
默认值：null
作用：选区粘贴后
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [originData]: 要被粘贴的选区范围所对应的数据
{Object} [pasteData]: 要粘贴的数据
rangeCutBefore
（TODO）

类型：Function
默认值：null
作用：选区剪切前
参数：
{Array} [range]: 选区范围，只能为单个范围
{Object} [data]: 要被剪切的选区范围所对应的数据
rangeCutAfter
（TODO）

类型：Function
默认值：null
作用：选区剪切后
参数：
{Array} [range]: 选区范围，只能为单个范围
{Object} [data]: 被剪切的选区范围所对应的数据
rangeDeleteBefore
（TODO）

类型：Function
默认值：null
作用：选区删除前
参数：
{Array} [range]: 选区范围，只能为单个范围
{Object} [data]: 要被删除的选区范围所对应的数据
rangeDeleteAfter
（TODO）

类型：Function
默认值：null
作用：选区删除后
参数：
{Array} [range]: 选区范围，只能为单个范围
{Object} [data]: 被删除的选区范围所对应的数据
rangeClearBefore
（TODO）

类型：Function
默认值：null
作用：选区清除前
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 要被清除的选区范围所对应的数据
rangeClearAfter
（TODO）

类型：Function
默认值：null
作用：选区清除后
参数：
{Object | Array} [range]: 选区范围，可能为多个选区
{Object} [data]: 被清除的选区范围所对应的数据
rangePullBefore
（TODO）

类型：Function
默认值：null
作用：选区下拉前
参数：
{Array} [range]: 当前选区范围，只能为单个范围
rangePullAfter
（TODO）

类型：Function
默认值：null
作用：选区下拉后
参数：
{Array} [range]: 下拉后的选区范围，只能为单个范围
工作表
sheetCreateBefore
类型：Function
默认值：null
作用：创建sheet页前触发，sheet页新建也包含数据透视表新建
sheetCreateAfter
类型：Function
默认值：null
作用：创建sheet页后触发，sheet页新建也包含数据透视表新建
参数：
{Object} [sheet]: 当前新创建的sheet页的配置
sheetCopyBefore
类型：Function
默认值：null
作用：拷贝创建sheet页前触发，sheet页新建也包含数据透视表新建
参数：
{Object} [targetSheet]: 被拷贝的sheet页配置
{Object} [copySheet]: 拷贝得到的sheet页的配置
sheetCopyAfter
类型：Function
默认值：null
作用：拷贝创建sheet页后触发，sheet页新建也包含数据透视表新建
参数：
{Object} [sheet]: 当前创建的sheet页的配置
sheetHideBefore
类型：Function
默认值：null
作用：隐藏sheet页前触发
参数：
{Object} [sheet]: 将要隐藏的sheet页的配置
sheetHideAfter
类型：Function
默认值：null
作用：隐藏sheet页后触发
参数：
{Object} [sheet]: 要隐藏的sheet页的配置
sheetShowBefore
类型：Function
默认值：null
作用：显示sheet页前触发
参数：
{Object} [sheet]: 将要显示的sheet页的配置
sheetShowAfter
类型：Function
默认值：null
作用：显示sheet页后触发
参数：
{Object} [sheet]: 要显示的sheet页的配置
sheetMoveBefore
（TODO）

类型：Function
默认值：null
作用：sheet移动前
参数：
{Number} [i]: 当前sheet页的index
{Number} [order]: 当前sheet页order
sheetMoveAfter
（TODO）

类型：Function
默认值：null
作用：sheet移动后
参数：
{Number} [i]: 当前sheet页的index
{Number} [oldOrder]: 修改前当前sheet页order
{Number} [newOrder]: 修改后当前sheet页order
sheetDeleteBefore
类型：Function
默认值：null
作用：sheet删除前
参数：
{Object} [sheet]: 要被删除sheet页的配置
sheetDeleteAfter
类型：Function
默认值：null
作用：sheet删除后
参数：
{Object} [sheet]: 已被删除sheet页的配置
sheetEditNameBefore
类型：Function
默认值：null
作用：sheet修改名称前
参数：
{Number} [i]: sheet页的index
{String} [name]: 当前sheet页名称
sheetEditNameAfter
类型：Function
默认值：null
作用：sheet修改名称后
参数：
{Number} [i]: sheet页的index
{String} [oldName]: 修改前当前sheet页名称
{String} [newName]: 修改后当前sheet页名称
sheetEditColorBefore
（TODO）

类型：Function
默认值：null
作用：sheet修改颜色前
参数：
{Number} [i]: sheet页的index
{String} [color]: 当前sheet页颜色
sheetEditColorAfter
（TODO）

类型：Function
默认值：null
作用：sheet修改颜色后
参数：
{Number} [i]: sheet页的index
{String} [oldColor]: 修改前当前sheet页颜色
{String} [newColor]: 修改后当前sheet页颜色
sheetZoomBefore
（TODO）

类型：Function
默认值：null
作用：sheet缩放前
参数：
{Number} [i]: sheet页的index
{String} [zoom]: 当前sheet页缩放比例
sheetZoomAfter
（TODO）

类型：Function
默认值：null
作用：sheet缩放后
参数：
{Number} [i]: sheet页的index
{String} [oldZoom]: 修改前当前sheet页缩放比例
{String} [newZoom]: 修改后当前sheet页缩放比例
sheetActivate
类型：Function
默认值：null
作用：激活工作表前
参数：
{Number} [i]: sheet页的index
{Boolean} [isPivotInitial]: 是否切换到了数据透视表页
{Boolean} [isNewSheet]: 是否新建了sheet页
sheetDeactivateBefore
（TODO）

类型：Function
默认值：null
作用：工作表从活动状态转为非活动状态前
参数：
{Number} [i]: sheet页的index
sheetDeactivateAfter
（TODO）

类型：Function
默认值：null
作用：工作表从活动状态转为非活动状态后
参数：
{Number} [i]: sheet页的index
imageDeleteBefore
类型：Function
默认值：null
作用：图片删除前触发
参数：
{Object} [imageItem]: 要删除的图片配置对象
imageDeleteAfter
类型：Function
默认值：null
作用：图片删除后触发，如果自定义了图片上传，可在此处发请求删除图片
参数：
{Object} [imageItem]: 删除的图片配置对象
{
	hook: {
		imageDeleteAfter: function (imageItem) {
			var src = imgItem.src;
			$.post('/rest/file/deletebyurl', {downloadUrl: src});
		}
	}
}
 
        Copied!
    
工作簿
workbookCreateBefore
类型：Function
默认值：null
作用：表格创建之前触发。旧的钩子函数叫做beforeCreateDom
参数：
{Object} [book]: 整个工作簿的配置（options）
workbookCreateAfter
类型：Function
默认值：null
作用：表格创建之后触发
参数：
{Object} [book]: 整个工作簿的配置（options）
workbookDestroyBefore
（TODO）

类型：Function
默认值：null
作用：表格销毁之前触发
参数：
{Object} [book]: 整个工作簿的配置（options）
workbookDestroyAfter
（TODO）

类型：Function
默认值：null
作用：表格销毁之后触发
参数：
{Object} [book]: 整个工作簿的配置（options）
updated
类型：Function
默认值：null
作用：协同编辑中的每次操作后执行的方法，监听表格内容变化，即客户端每执行一次表格操作，Luckysheet将这次操作存到历史记录中后触发，撤销重做时因为也算一次操作，也会触发此钩子函数。
参数：
{Object} [operate]: 本次操作的历史记录信息，根据不同的操作，会有不同的历史记录，参考源码 历史记录(opens new window)
resized
（TODO）

类型：Function
默认值：null
作用：resize执行之后
参数：
{Object} [size]: 整个工作簿区域的宽高
scroll
类型：Function
默认值：null
作用：监听表格滚动值
参数：
{Number} [scrollLeft]: 水平方向滚动值
{Number} [scrollTop]: 垂直方向滚动值
{Number} [canvasHeight]: 滚动容器的高度
协作消息
cooperativeMessage
类型：Function
默认值：null
作用：接受协作消息，二次开发。拓展协作消息指令集
参数：
{Object} : 收到服务器发送的整个协作消息体对象
图片
imageInsertBefore
（TODO）

类型：Function
默认值：null
作用：图片插入之前
参数：
{Object} [url]: 图片地址
imageInsertAfter
（TODO）

类型：Function
默认值：null
作用：图片插入之后
参数：
{Object} [item]]: 图片地址、宽高、位置等信息
imageUpdateBefore
（TODO）

类型：Function
默认值：null
作用：图片修改之前，修改的内容包括宽高、位置、裁剪等操作
参数：
{Object} [item]]: 图片地址、宽高、位置等信息
imageUpdateAfter
（TODO）

类型：Function
默认值：null
作用：图片修改之后，修改的内容包括宽高、位置、裁剪等操作
参数：
{Object} [oldItem]]: 修改前图片地址、宽高、位置等信息
{Object} [newItem]]: 修改后图片地址、宽高、位置等信息
imageDeleteBefore
（TODO）

类型：Function
默认值：null
作用：图片删除之前
参数：
{Object} [item]]: 图片地址、宽高、位置等信息
imageDeleteAfter
（TODO）

类型：Function
默认值：null
作用：图片删除之后
参数：
{Object} [item]]: 图片地址、宽高、位置等信息
批注
commentInsertBefore
类型：Function
默认值：null
作用：插入批注之前，return false 则不插入批注
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
commentInsertAfter
类型：Function
默认值：null
作用：插入批注之后
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Object} [cell]: 被插入批注所在的单元格信息，如：{ r:0,c:2,v:{m:'233',v:'233'}}，包含批注信息
commentDeleteBefore
类型：Function
默认值：null
作用：删除批注之前，return false 则不删除批注
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Object} [cell]: 要删除的批注所在的单元格信息，如：{ r:0,c:2,v:{m:'233',v:'233'}}，可以看到批注信息
commentDeleteAfter
类型：Function
默认值：null
作用：删除批注之后
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Object} [cell]: 被删除批注所在的单元格信息，如：{ r:0,c:2,v:{m:'233',v:'233'}}，可以看到批注已被删除
commentUpdateBefore
类型：Function
默认值：null
作用：修改批注之前，return false 则不修改批注
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{String} [value]: 新的批注内容
commentUpdateAfter
类型：Function
默认值：null
作用：修改批注之后
参数：
{Number} [r]:单元格所在行号
{Number} [c]:单元格所在列号
{Object} [oldCell]: 修改前批注所在的单元格信息，如：{ r:0,c:2,v:{m:'233',v:'233'}}
{Object} [newCell]: 修改后批注所在的单元格信息，如：{ r:0,c:2,v:{m:'233',v:'233'}}
数据透视表
pivotTableEditBefore
（TODO）

类型：Function
默认值：null
作用：修改数据透视表之前，操作如：拖动字段等
参数：
{Object} [sheet]: 数据透视表所在sheet页配置
pivotTableEditAfter
（TODO）

类型：Function
默认值：null
作用：修改数据透视表之后，操作如：拖动字段等
参数：
{Object} [oldSheet]: 修改前数据透视表所在sheet页配置
{Object} [newSheet]: 修改后数据透视表所在sheet页配置
冻结
frozenCreateBefore
（TODO）

类型：Function
默认值：null
作用：设置冻结前
参数：
{Object} [frozen]: 冻结类型信息
frozenCreateAfter
（TODO）

类型：Function
默认值：null
作用：设置冻结后
参数：
{Object} [frozen]: 冻结类型信息
frozenCancelBefore
（TODO）

类型：Function
默认值：null
作用：取消冻结前
参数：
{Object} [frozen]: 冻结类型信息
frozenCancelAfter
（TODO）

类型：Function
默认值：null
作用：取消冻结后
参数：
{Object} [frozen]: 冻结类型信息
打印
printBefore
（TODO）

类型：Function
默认值：null
作用：打印前
旧版钩子函数
fireMousedown
类型：Function
默认值：null
作用：单元格数据下钻自定义方法，注意此钩子函数是挂载在options下：options.fireMousedown
分页器
onTogglePager
类型：Function
默认值：null
作用：点击分页按钮回调函数，返回当前页码，具体参数参照sPage backFun(opens new window)
参数：
{Object} [page]: 返回当前分页对象