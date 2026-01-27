<template>
  <div :class="'tk-pagination ' + pageObj.cssSize">
    <div>
      <template v-if="pageObj.isShowSelRows && selRowsLen">
        已选择：<span class="red">{{selRowsLen}}</span>
      </template>
    </div>
    <el-pagination
      v-if="isPagination"
      background
      :layout="pageData.layout || 
        (isHasSize
          ? 'total, sizes, prev, pager, next,jumper'
          : 'total, prev, pager, next,jumper')
      "
      :page-sizes="pageData.pageSizes"
      :current-page="pageData.currentPage || 1"
      :page-size="pageData.pageSize || 10"
      :total="pageData.total || 0"
      :pager-count="pageData.pagerCount"
   
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    <!--    :hide-on-single-page="true" -->
    </el-pagination>
    <div class="table-total" v-else-if="showTotal">
      共{{ pageData.total || 0 }}条
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect } from "vue";
const emit = defineEmits(["handlePagination"]);
const props = defineProps({
  isPagination: { type: Boolean, default: true },
  isHasSize: { type: Boolean, default: true },
  showTotal: { type: Boolean, default: true },
  pageObj: {
    type: Object,
    default: () => {
      return {};
    },
  },
  selRows: { type: Array, default: () => []}
});
let pageData = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100, 200, 500,1000],
  total: 0,
  pagerCount: 5,
  layout: ''
});
let selRowsLen = ref(0)
watchEffect(() => {
  selRowsLen.value = props.selRows?.length??0
  pageData.currentPage = props.pageObj.currentPage;
  pageData.pageSize = props.pageObj.pageSize;
  pageData.pageSizes = props.pageObj.pageSizes || pageData.pageSizes;
  pageData.total = props.pageObj.total;
  pageData.pagerCount = props.pageObj.pagerCount;
  pageData.layout = props.pageObj.layout
});
// pageData.pageSize 每页条数 改变时会触发
const handleSizeChange = (val) => {
  const page = JSON.parse(
    JSON.stringify({
      currentPage: pageData.currentPage,
      pageSize: val,
      total: pageData.total,
    })
  );
  emit("handlePagination", page);
};
// pageData.currentPage 当前页 改变时会触发
const handleCurrentChange = (val) => {
  const page = JSON.parse(
    JSON.stringify({
      currentPage: val,
      pageSize: pageData.pageSize,
      total: pageData.total,
    })
  );

  emit("handlePagination", page);
};
</script>
<style lang="less" scoped>
.tk-pagination {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0 0;
  box-sizing: border-box;
}
.table-total {
  padding: 6px 10px 4px 0;
  text-align: right;
  letter-spacing: 1.5px;
}
</style>
