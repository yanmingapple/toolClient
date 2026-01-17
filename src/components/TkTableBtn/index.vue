<template>
  <div class="TkTableBtn" v-if="!tableBtnData.isCustom" :style="newMode ? 'margin:0':''">
    <div class="TkTableBtn-title"><span v-if="!newMode">* </span>{{ tableBtnData.title }}</div>
    <div class="tableBtnFlex">
      <div class="TkTableBtn-main">
        <ul class="selected-box" v-if="selectedList.length">
          <li class="selected-item" v-for="(item, index) in selectedList" :key="item.id + 'btn' + index">
            <div class="selected-item-title">
              {{ item[tableBtnData.showKey || "name"] }}
            </div>
            <div class="selected-item-icon" title="删除" @click="handleDel(item)">
              <svg-icon class-name="ic_close" icon-class="ic_close"></svg-icon>
            </div>
          </li>
        </ul>

        <div class="TkTableBtn-main-placeholder" v-else>
          请选择<span v-if="!newMode">{{ tableBtnData.title }}</span>
        </div>
      </div>

      <div class="ic_expand_box" @click="handleOpen">
        <svg-icon class-name="ic_expand" icon-class="ic_expand"></svg-icon>
      </div>
    </div>
  </div>

  <div v-else class="slotBtn" @click="handleOpen">
    <slot name="slotBtn"></slot>
  </div>

  <tk-dialog :dlgObj="tableDlg" v-if="tableDlg.visible">
    <div class="TkTableBtnDlg">
      <slot name="afterTableSlot"></slot>
      <div class="search-item" v-if="tableBtnData.searchProp">
        <el-input :placeholder="tableBtnData.searchPlaceholder || '请输入内容'" v-model="tableBtnData.param[tableBtnData.searchProp]" clearable @keyup.enter="handleSearch">
          <template #prepend v-if="tableBtnData.typeProp">
            <el-select v-model="tableBtnData.param[tableBtnData.typeProp]" :placeholder="tableBtnData.typePlaceholder || '全部'" :style="{ width: tableBtnData.typeWidth || '10rem' }" :clearable="
              tableBtnData.typeClearable == null
                ? tableBtnData.typeClearable
                : true
            ">
              <el-option v-for="(item, index) in tableBtnData.typeOptions" :key="item.value + 'tableBtnDataOption' + index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
          <template #append>
            <svg-icon @click="handleSearch" class-name="ic_search" icon-class="ic_search"></svg-icon>
          </template>
        </el-input>
      </div>
      <!-- 表格组件 -->
      <tk-table :tableObj="tbl"></tk-table>
    </div>
  </tk-dialog>
</template>

<script setup>
import { reactive, watch, nextTick, ref } from 'vue';

const props = defineProps({
  tableBtnData: {
    type: Object,
    default: () => {
      return { title: '', param: {} };
    },
  },
  selectedList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  param: {
    type: Object,
    default: () => {
      return {};
    },
  },
  rowData: {
    type: Object,
    default: () => {
      return {};
    },
  },
  newMode: {
    type: Boolean,
    default: false,
  },
});
const parentRowData = ref({});
const emits = defineEmits(['update:selectedList', 'update:param']);
//表格数据
const tbl = reactive(useTable());
tbl.height = props.tableBtnData?.height??'44vh';
tbl.path = props.tableBtnData.path;
tbl.column = props.tableBtnData.column;
tbl.isPagination = props.tableBtnData?.isPagination ?? true;
tbl.param = props.tableBtnData.param || {};
// 设置单选 设置showSelection为false 添加label：'选择’.  否则默认为多选
tbl.showSelection = props.tableBtnData.showSelection !== false;
tbl.singleVal = '';
tbl.rowKey = props.tableBtnData?.bindKey ?? 'id';
tbl.isClearCheckedRow = false;

tbl.succ = res => {  try{
  if (props.tableBtnData.tblSuccess) {
    tbl.pageObj.total = tbl.tableData?.length ?? 0;
    tbl.tableData = props.tableBtnData.tblSuccess(res, tbl);
  } else {
    const { ret = [] } = res;
    tbl.tableData = ret?.filter(ele=>ele);
  }}catch(e){
        console.log("🚀 ~ watch ~ e:", e)
      }
};

// 选中项勾选和去勾选
watch(
  () => tbl.tableData,
  (newV, oldV) => {
    nextTick(() => {
      try{
      if (props.tableBtnData.isBackShow && newV.length) {
        tbl.tableData.forEach(_r => {
          props.selectedList.forEach(ele => {
            if (
              ele[props.tableBtnData?.bindKey ?? 'id'] ===
                _r[props.tableBtnData?.bindKey ?? 'id'] ||
              _r[props.tableBtnData?.bindKey ?? 'id'] == ele
            ) {
              tbl.tableRef.toggleRowSelection(_r, true);
            }
          });
        });
      }}catch(e){
        console.log("🚀 ~ watch ~ e:", e)
      }
    });
  },
  { deep: true }
);
watch(
  () => props.rowData,
  newVal => {
    parentRowData.value = newVal;
  },
  { immediate: true } // 立即触发一次
);

const tableDlg = reactive(useDlg());
tableDlg.width = '60rem';
tableDlg.appendToBody = true;
tableDlg.open = () => {
  if (props.tableBtnData.isBackShow) {
    tbl.setSelectedRow(props.selectedList);
  } else {
    tbl.setSelectedRow([]);
  }

  // 清空处理
  let getParameter = null;
  if (props.tableBtnData.getParam) {
    getParameter = props.tableBtnData.getParam();
  }
  let obj = getParameter ? { ...getParameter } : { ...props.param };
  if (props.tableBtnData.searchProp) {
    obj[props.tableBtnData.searchProp] = '';
  }
  if (props.tableBtnData.typeProp) {
    obj[props.tableBtnData.typeProp] = '';
  }
  // 创建新对象，避免直接修改 props 的响应式对象
  const baseParam = props.tableBtnData?.param ? { ...props.tableBtnData.param } : {};
  const mergedParam = { ...baseParam, ...obj };
  tbl.param = mergedParam;
  // 更新 props.tableBtnData.param，逐个属性赋值以避免 proxy 陷阱问题
  if (props.tableBtnData.param) {
    // 逐个属性赋值，避免 Object.assign 触发 proxy 陷阱
    Object.keys(mergedParam).forEach(key => {
      try {
        props.tableBtnData.param[key] = mergedParam[key];
      } catch (e) {
        // 如果某个属性无法设置，跳过
        console.warn(`Failed to set property ${key}:`, e);
      }
    });
  } else {
    props.tableBtnData.param = mergedParam;
  }
  emits('update:param', mergedParam);

  //   tbl.loadTable();
};

// 打开弹窗
const handleOpen = () => {
  try{
  if (props.tableBtnData.openCallback) {
    props.tableBtnData.openCallback(parentRowData.value);
  }

  if (props.tableBtnData.isOk === undefined || props.tableBtnData.isOk) {
    tableDlg.openDlg(props.tableBtnData.title || '提示');
    handleSearch();
  }
  }catch(e){
    console.log("🚀 ~ handleOpen ~ e:", e)

  }
};

/**
 * param1 => getSelectedRow() 多选元素
 * param2 => singleVal 单选元素
 */
// 点击确认
tableDlg.handlerConfirm = () => {
  if (props.tableBtnData.successCallback) {
    const selectedRow = tbl.showSelection ? tbl.getSelectedRow() : tbl.singleVal;
    const singleVal = tbl.tableData.find(_c => _c.id === tbl.singleVal);
    props.tableBtnData.successCallback(selectedRow, singleVal, parentRowData.value,tbl.tableData);
  }

  if (props.tableBtnData.selectedList) {
    emits('update:selectedList', tbl.getSelectedRow());
  }

  if (props.tableBtnData.isOk === undefined || props.tableBtnData.isOk) {
    tableDlg.closeDlg();
  }

  props.tableBtnData.isOk = undefined;
};

// 删除显示数据
const handleDel = item => {
  const list = props.selectedList.filter(_c => _c.id !== item.id);
  emits('update:selectedList', list);
};

// 查询
function handleSearch  ()  {
  tbl.pageObj.currentPage = 1;
  tbl.param = props.tableBtnData.param;
  tbl.loadTable();
};

// 对外暴露：打开对话框
defineExpose({
  open: handleOpen,
});
</script>

<style lang="less" scoped>
.TkTableBtn ::-webkit-scrollbar {
  width: 0 !important;
}
.TkTableBtn {
  width: 100%;
  position: relative;
  margin: 15px 0 20px 0;
  border: 1px solid #dcdcdc;
  box-sizing: border-box;
  .TkTableBtn-title {
    position: absolute;
    left: 10px;
    top: -16px;
    padding: 0 8px;
    color: #0380ff;
    font-size: 14px;
    background-color: #fff;
  }
  .tableBtnFlex {
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .TkTableBtn-main {
      max-height: 100px;
      overflow: auto;
      padding: 20px 10px 0 10px;
      flex: 1;

      &-placeholder {
        margin-bottom: 10px;
        color: #999;
      }
      .selected-box {
        display: flex;
        flex-wrap: wrap;

        .selected-item {
          display: flex;
          align-items: center;
          margin-right: 10px;
          margin-bottom: 10px;
          // border: 1px solid #dcdcdc;
          background-color: #f4f4f5;
          color: #000;
          .selected-item-title {
            padding: 4px 10px;
          }
          .selected-item-icon {
            padding: 4px 10px 4px 0px;
            cursor: pointer;
            &:hover {
              color: #0380ff;
            }
          }
        }
      }
    }
    .ic_expand_box {
      padding: 0 6px;
      border: 1px solid #dcdcdc;
      margin-right: 8px;
      cursor: pointer;
      .ic_expand {
        color: #0380ff;
      }
      &:hover {
        background-color: rgba(34, 161, 255, 0.3);
        border: #0380ff;
      }
    }
  }
}

.search-item {
  margin-bottom: 12px;
}

:deep(.el-input-group__append) {
  padding: 0;
}
.ic_search {
  padding: 0 20px;
  cursor: pointer;
  &:hover {
    color: #0380ff;
  }
}
.slotBtn {
  display: inline-block;
  width: 100%;
}

.TkTableBtnDlg {
  margin: 10px 0;
}
</style>
