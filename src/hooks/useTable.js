/**
 * 表格hooks公用组件
 * 2023-3-16 闫明
 */
import { reactive, toRefs, nextTick } from 'vue';

//表格公用组件
export default function (param) {
  //表格配置
  let tableConfig = reactive({
    type: 'table',
    tableRef: undefined,
    tableData: [], //表格数据
    column: [], //表格列
    pageObj: {
      isShowSelRows: true, //是否显示多选的数量
      pageSize: param?.pageObj?.pageSize ?? 10,
      currentPage: 1,
      total: 0,
    }, //表格分页数据
    height: '',
    param: {}, //表格加载数据的参数
    path: '', //表格加载数据的请求地址
    catchName: '', //本地缓存参数名称，保存查询条件
    routePath: '', // 当前页面path
    reqSsn: '', //请求序列号，返回结果成功后，自动获取
    rowKey: 'id', //默认id
    border: true, //显示边框
    isShowTblTopCon: true, //由于上部分隐藏有高度，没搜索header的时候需要销毁dom
    showSummary: false, //显示统计
    showHeader: true, //显示表头
    isShowFooter: false, //是否显示下面的确认按按钮
    hasConfirm: false, //下面的确认按钮
    hasCancel: false, //下面的取消按钮
    showTotal: false, //不显示分页的情况下，显示共多少页
    isPagination: true, //默认显示分页，不显示分页手动改为false
    isLoading: true, //是否显示加载项
    tableLoading: false, //表格局部加载状态
    hasSearchBtn: true, //默认有查询按钮
    searchText: "搜索", //查询按钮文字
    hasResetBtn: false, //默认无重置按钮
    resetText: "重置", //查询按钮重置
    sortValue: '', // 排序默认值
    hasMoreSearchBtn: false, //默认无更多搜索按钮
    showSelection: false, //显示多选按钮
    isFilterColumn: false,
    rowSelectale: () => {
      return true;
    }, //行是否可以选择
    selectedRow: [], //多选操作，当前选中的行数据
    succ: undefined,
    isClearCheckedRow: false, //是否清空数据
    currSelectRow: {}, //当前单击选中的行数据
    singleVal: undefined, //单选按钮时候数据值
    //单击一行时候触发操作
    rowClickSelect: false, //打开行操作触发事件
    handlerSelectedRow: row => {},
    handlerRowDblclick: (row, column, event) => {}, // 双击行事件处理
    handlerRowContextmenu: (row, column, event) => {}, // 右键行事件处理
    reserveSelection: true, //全选标记
    // 右键菜单配置
    contextMenuItems: [], // 右键菜单项配置数组
    contextMenuTitle: '', // 右键菜单标题，支持函数：(row) => string
    contextMenuHeight: 250, // 右键菜单高度
    contextMenuVisible: false, // 右键菜单显示状态（内部使用）
    contextMenuX: 0, // 右键菜单位置X（内部使用）
    contextMenuY: 0, // 右键菜单位置Y（内部使用）
    contextMenuData: null, // 右键菜单关联的行数据（内部使用）
    autoHeight: () => {}, // 计算表格高度，表格实际渲染时候调用
    setTableRef: _tableRef => {
      tableConfig.tableRef = _tableRef;
    },
    //设置单选
    setSingleVal: _singleVal => {
      tableConfig.singleVal = _singleVal;
    },
    //获取单选值
    getSingleVal: () => {
      return tableConfig.singleVal;
    },
    getSingleRow: () => {
      return tableConfig.tableData.find(el => el[tableConfig.rowKey||'id'] == tableConfig.singleVal);
    },
    clearSingleVal: () => {
      tableConfig.singleVal = undefined;
    },
    //设置多选回显
    setSelectedRow: _selectRow => {
      //设置选中缓存对象，内部使用，当element表格对象拿到控制权后，则不更新缓存，
      //只在赋值回显的时候有用
      tableConfig.selectedRow = _selectRow;
      nextTick(() => {
        //移交控制权限给element表格对象
        tableConfig.tableRef && tableConfig.tableRef.clearSelection();

        if (_selectRow && _selectRow.length > 0) {
          tableConfig.selectedRow.forEach(el => {
            tableConfig.tableRef.toggleRowSelection(el, true);
          });
        }
      });
    },
    //获取多选数据
    getSelectedRow: () => {
      //如果对象存在，说明已经赋值成功，将数据获取的移交给element组件
      if (tableConfig.tableRef) {
        const selectedRowList = tableConfig.tableRef.getSelectionRows();
        const filterSelectedRowList = selectedRowList.filter(el => {
          return el[tableConfig.rowKey] !== undefined;
        });
        return tkTools.unique(filterSelectedRowList, tableConfig.rowKey) || [];
      }
      //未移交，则返回我们自己设置的缓存对象
      return tableConfig.selectedRow;
    },
    search: data => {
      tableConfig.loadTable(data);
    }, //搜索方法
    //重置
    restParam: () => {
      tableConfig.pageObj = {
        isShowSelRows: true, //是否显示多选的数量
        pageSize: param?.pageObj?.pageSize ?? 10,
        currentPage: 1,
        total: 0,
      };
      tableConfig.param = {};
    },
    //加载表格
    loadTable: data => {
      // tableConfig.tableData = []
      tableConfig.tableLoading = true;
      if (data) {
        success(data);
        return;
      }

      tkReq()
        .path(tableConfig.path)
        .catchName(tableConfig.catchName)
        .routePath(tableConfig.routePath)
        .isLoading(tableConfig.isLoading)
        .page(tableConfig.pageObj.currentPage)
        .pageSize(tableConfig.pageObj.pageSize)
        .param(tableConfig.param)
        .succ(res => {
          success(res);
        })
        .err(err => {
          error(err);
        })
        .send();
    },

    request: () => {
      return tkReq()
        .path(tableConfig.path)
        .catchName(tableConfig.catchName)
        .routePath(tableConfig.routePath)
        .isLoading(tableConfig.isLoading)
        .page(tableConfig.pageObj.currentPage)
        .pageSize(tableConfig.pageObj.pageSize)
        .param(tableConfig.param);
    },

    pagination(page) {
      tableConfig.pageObj = { ...tableConfig.pageObj, ...page };
      tableConfig.search();
    },
  });

  //成功后数据处理
  function success(res) {
    tableConfig.tableLoading = false;
    //缓存请求序列表
    tableConfig.reqSsn = res.reqSsn;
    //兼容直接传入数组
    if (res instanceof Array) {
      tableConfig.pageObj.total = res.length;
      if (tableConfig.succ && typeof tableConfig.succ === 'function') {
        tableConfig.tableData = res;
        tableConfig.succ(res, tableConfig.tableData);
      } else {
        tableConfig.tableData = res;
      }
    } else {
      //赋值总数量
      tableConfig.pageObj.total = res.totalCount || 0;
      if (tableConfig.succ && typeof tableConfig.succ === 'function') {
        tableConfig.tableData = res.ret;
        tableConfig.succ(res, tableConfig.tableData);
      } else {
        tableConfig.tableData = res.ret;
      }
    }

    //清除勾选
    if (tableConfig.isClearCheckedRow) {
      tableConfig.selectedRow = [];
      nextTick(() => {
        tableConfig.tableRef && tableConfig.tableRef.clearSelection();
      });
      tableConfig.currSelectRow = {};
      tableConfig.singleVal = undefined;
    }
  }

  //失败后数据处理
  function error(err) {
    tableConfig.tableLoading = false;
    if (tableConfig.err && typeof tableConfig.err === 'function') tableConfig.err(err);
    else {
      if (tkMessage && tkMessage.err) {
        tkMessage.err(err.msg || err);
      } else {
        tkMessage.err(err.msg || err);
      }
    }
  }
  return {
    ...toRefs(tableConfig),
  };
}
