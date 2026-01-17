<template>
  <el-drawer
    v-model="drawerVisible"
    destroy-on-close
    direction="rtl"
    size="100%"
    :title="`${drawerProps.title}`"
    :close-on-click-modal="false"
    :append-to-body="true"
  >
    <div class="tk-flex-center mb20">
      <el-button
        :disabled="isSecondLevelMenuExpand || isContentExpand"
        @click="changeIsFirstLevelMenuExpand"
      >
        <svg-icon icon-class="ic_turn_down" v-show="!isFirstLevelMenuExpand" />
        <svg-icon icon-class="ic_turn_up" v-show="isFirstLevelMenuExpand" />
        {{ isFirstLevelMenuExpand ? "收起" : "展开" }}一级节点</el-button
      >

      <el-button
        :disabled="isFirstLevelMenuExpand || isContentExpand"
        @click="changeIsSecondLevelMenuExpand"
      >
        <svg-icon icon-class="ic_turn_down" v-show="!isSecondLevelMenuExpand" />
        <svg-icon icon-class="ic_turn_up" v-show="isSecondLevelMenuExpand" />
        {{ isSecondLevelMenuExpand ? "收起" : "展开" }}二级节点</el-button
      >
      <el-button
        :disabled="isSecondLevelMenuExpand || isFirstLevelMenuExpand"
        @click="changeIsContentExpand"
      >
        <svg-icon icon-class="ic_turn_down" v-show="!isContentExpand" />
        <svg-icon icon-class="ic_turn_up" v-show="isContentExpand" />
        {{ isContentExpand ? "收起" : "展开" }}有抽取试题的节点</el-button
      >

      <el-button class="ml15" @click="handeleExportExcel" type="primary" plain
        ><svg-icon icon-class="ic_excel" />导出EXCEL</el-button
      >
    </div>

    <div style="height: calc(100vh - 120px)" id="templateTableId">
      <vxe-table
        height="100%"
        ref="TreeTableRef"
        :column-config="{ resizable: true }"
        :scroll-y="{ enabled: true, gt: 20 }"
        :data="tableData"
        :tree-config="{ transform: true, rowField: 'id', parentField: 'pId' }"
        border
        size="mini"
      >
        <vxe-column width="40">
          <template #default="{ row }">
            <TkPointsAndModelsIcon
              :rowData="row"
              :type="drawerProps.knowVersion ? 'point' : 'model'"
            ></TkPointsAndModelsIcon> </template
        ></vxe-column>
        <vxe-column
          field="name"
          :title="`${drawerProps.knowVersion ? '知识点' : '知识模型'}`"
          tree-node
          minWidth="200"
          show-overflow="title"
        >
          <template #default="{ row }">
            <div>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </vxe-column>

        <vxe-column
          :title="questionItem.labelAndSum"
          v-for="(questionItem, quesionIndex) in drawerProps.itemTypeList"
          :key="questionItem.subItemTypeId + '_itemType_' + quesionIndex"
          minWidth="150"
          align="center"
          :field="questionItem.subItemTypeId"
        >
          <template #default="{ row }">
            <div
              :class="[
                { highlight: row.itemTypeNums[quesionIndex] && row.itemTypeNums[quesionIndex].itemNum > 0 },
              ]"
            >
              <span class="question-number" style="color: #f56c6c">
                <span v-show="row.itemTypeNums[quesionIndex] && row.itemTypeNums[quesionIndex].itemNum > 0">
                  {{ row.itemTypeNums[quesionIndex] && row.itemTypeNums[quesionIndex].itemNum || "" }}</span
                ></span
              >
              <el-button title="余量试题查看" type="primary" link :class="row.itemTypeNums[quesionIndex].itemNum > 0 ? 'item-detail-btn ml10 show-con' : 'hide-con'" @click="preivewItemListHandler(row, quesionIndex)">
                <svg-icon icon-class="ic_lookDetail"></svg-icon>
              </el-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </el-drawer>
  <QuestionListDrawer ref="questionListDrawerRef"></QuestionListDrawer>
</template>

<script setup>
import QuestionListDrawer from '@/views/activityDetail/assembly/TestPaperExtract/QuestionListDrawer'
import { ref } from "vue";
import TkPointsAndModelsIcon from "@/components/TkPointsAndModelsIcon";
import tkTools from "@/utils/tkTools";
import axios from 'axios'
const drawerVisible = ref(false);
const drawerProps = ref({
  title: "",
});

const tableData = ref([]);

const TreeTableRef = ref(null);

///////////////////导出excel///////////////////
const handeleExportExcel = () => {
  // tkTools.exportElTbl("templateTableId", drawerProps.value.title, 0);
  const {subjectId, qryFlag, activityId, paperId} = drawerProps.value
  // let params = `subjectId=${subjectId}&qryFlag=${qryFlag}&activityId=${activityId}`
  // if (paperId) {
  //   params += `&paperId=${paperId}`
  // }
  // console.log(params)
  // window.open(`/storeNumber/out.do?${params}`)
  let url = (process.env.NODE_ENV == 'production' && window.webConfig?.baseUrl ? window.webConfig.baseUrl : "") + '/storeNumber/out.do'
  axios.post(url, {
    subjectId,
    qryFlag,
    activityId,
    paperId
  }, { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }).then(function (res) {
    if (res?.data?.errMsg) {
      tkMessage.err(res.data.errMsg)
    } else if (res.status == 200) {
      tkTools.fileDownload(res.data, '试题余量统计.xlsx')
    }
  })
};

//////////////////// 合计表格数据 开始 //////////////////////////
const computedTypeItemSum = () => {
  drawerProps.value.itemTypeList.forEach((ele) => {
    const sum = tableData.value.reduce((pre, cur) => {
      return (
        parseFloat(pre || 0) +
        parseFloat(
          cur.itemTypeNums.find(
            (_c) => _c.subItemTypeId === ele.subItemTypeId && cur.pId == "-1"
          )?.itemNum ?? 0
        )
      );
    }, 0);
    ele.labelAndSum = `${ele.label} 【${sum}】`;
  });
};
//////////////////// 合计表格数据 结束 //////////////////////////

// 接收父组件传过来的参数
const acceptParams = async (params) => {
  drawerProps.value = params;
  drawerVisible.value = true;

  const treeAllData = drawerProps.value.knowVersion
    ? drawerProps.value.knowledgePointTree
    : JSON.parse(JSON.stringify(drawerProps.value.knowModelData));

  //  schemeJson 为空 1.组卷模板列表-》编辑=》schemeJson为空状态  2.抽卷-》手动创建 =》回显
  tableData.value = treeAllData.filter((_c) =>
    _c.itemTypeNums.find((ele) => ele.itemNum > 0)
  );
  computedTypeItemSum();
};

defineExpose({
  acceptParams,
});
//////////////////// 展开菜单操作 开始 /////////////////////////

// 一级菜单
const isFirstLevelMenuExpand = ref(false);
const changeIsFirstLevelMenuExpand = () => {
  const $table = TreeTableRef.value;
  const treeExpandRecords = $table.getTreeExpandRecords();
  const expandList = tableData.value.filter((_c) => _c.level == 1);
  const closeList = tableData.value.filter(
    (_c) => _c.level != 1 && treeExpandRecords.find((ele) => ele.id === _c.id)
  );

  if ($table && expandList.length) {
    isFirstLevelMenuExpand.value = !isFirstLevelMenuExpand.value;
    $table.setTreeExpand(expandList, isFirstLevelMenuExpand.value);
  }

  if ($table && closeList.length) {
    $table.setTreeExpand(closeList, false);
  }
};

// 二级菜单
const isSecondLevelMenuExpand = ref(false);
const changeIsSecondLevelMenuExpand = () => {
  const $table = TreeTableRef.value;
  const expandList = tableData.value.filter(
    (_c) => _c.level == 1 || _c.level == 2
  );
  if ($table && expandList.length) {
    isSecondLevelMenuExpand.value = !isSecondLevelMenuExpand.value;
    $table.setTreeExpand(expandList, isSecondLevelMenuExpand.value);
  }
};

// 有节点菜单
const isContentExpand = ref(false);
const changeIsContentExpand = () => {
  const $table = TreeTableRef.value;
  const expandIdList = [];
  tableData.value.forEach((_c) => {
    if (!!_c.itemTypeNums.find((ele) => ele.itemNum)) {
      const nodeList = _c.line.split("_");
      nodeList.pop();
      nodeList.forEach((nodeId) => {
        if (!expandIdList.find((item) => item === nodeId)) {
          expandIdList.push(nodeId);
        }
      });
    }
  });
  const expandList = tableData.value.filter((_c) =>
    expandIdList.find((ele) => ele === _c.id)
  );
  const closeList = tableData.value.filter(
    (_c) => !expandList.find((ele) => ele.id === _c.id)
  );
  if ($table && expandList.length) {
    isContentExpand.value = !isContentExpand.value;
    $table.setTreeExpand(expandList, isContentExpand.value);
  }

  if ($table && closeList.length) {
    $table.setTreeExpand(closeList, false);
  }
};
//////////////////// 展开菜单操作 结束 /////////////////////////

// 查看余量试题列表试题
let questionListDrawerRef = ref()
function preivewItemListHandler(r, quesionIndex) {
  if (questionListDrawerRef.value?.doComInit) {
    questionListDrawerRef.value.doComInit({
      knowId: r?.id,
      knowName: r?.name,
      itemTypeId: r?.itemTypeNums?.[quesionIndex]?.subItemTypeId,
      itemTypeName: r?.itemTypeNums?.[quesionIndex]?.subItemTypeName,
      subjectId: drawerProps.value?.subjectId,
      activityId: drawerProps.value?.activityId,
    })
  }
}
</script>

<style lang="less" scoped>
:deep(.vxe-table--body-wrapper) {
  .vxe-table--body {
    .editor_option {
      margin-left: 8px;
      margin-bottom: 4px;
      opacity: 0;
    }
    .item-detail-btn {
      opacity: 0;
    }
    .vxe-body--row {
      td {
        &:hover {
          border: 1px solid #1989ff;
          background-color: rgba(#1989ff, 0.2);
          .editor_option {
            opacity: 1 !important;
          }
          .item-detail-btn {
            opacity: 1;
          }
        }
      }
    }
  }
}

.highlight {
  &:after {
    content: "";
    position: absolute;
    top: -2px;
    left: -6px;
    width: 0;
    height: 0;
    border-top: 8px solid #ef3e1e;
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    transform: rotate(134deg);
  }
}

:deep(
    .vxe-table--render-default.size--mini .vxe-body--column:not(.col--ellipsis)
  ) {
  --vxe-table-column-padding-mini: 0px !important;
}

.question-number {
  font-size: 14px;
  font-weight: bold;
  color: #909399;
}

:deep(.vxe-cell .vxe-input) {
  display: inline-block;
}
.hide-con {
  visibility: hidden;
}
</style>
