<template>
  <div class="vxe_table">
    <div class="tbl-top-con">
      <div class="tbl-top-slot-con">
        <div class="top-left">
          <slot name="tblTopLeft"></slot>
        </div>
        <div class="top-right">
          <slot name="tblTopRight"></slot>
        </div>
      </div>
      <div class="tbl-top-init">
        <div v-if="searchFormObj" class="searchPanel">
          <el-button
            v-if="searchFormObj.searchBtn"
            @click="handleSearch"
            plain
            type="primary"
          >
            <svg-icon icon-class="ic_search" class-name="mr10"></svg-icon>
            搜索
          </el-button>
          <tk-form
            v-else-if="
              searchFormObj &&
              searchFormObj.formData !== null &&
              searchFormObj.formData !== 'null'
            "
            :searchFormObj="searchFormObj"
          >
            <template v-if="tableObj.hasSearchBtn" v-slot:search>
              <el-form-item class="search-box">
                <el-button @click="handleSearch" plain type="primary">
                  <svg-icon icon-class="ic_search" class-name="mr10"></svg-icon>
                  搜索
                </el-button>

                <el-button
                  v-if="tableObj.hasResetBtn"
                  plain
                  @click="handleReset"
                  type="primary"
                >
                  重置
                </el-button>

                <el-button
                  v-if="tableObj.hasMoreSearchBtn"
                  plain
                  @click="moreSearchDrawer = true"
                  type="primary"
                >
                  更多条件
                  <svg-icon
                    icon-class="ic_to_next"
                    style="margin-left: 0.2rem"
                  ></svg-icon>
                </el-button>
              </el-form-item>
            </template>
            <template v-slot:right>
              <slot name="formright"></slot>
            </template>

            <template v-for="item in tableObj.specialSearchSlotData" v-slot:[item]>
              <slot :name="item"></slot>
            </template>

            <slot name="cusformRight"></slot>
          </tk-form>
        </div>
        <div class="RightLayout" v-if="tableObj.isFilterColumn">
          <slot name="filterColumnCon"></slot>
          <el-dropdown :hide-on-click="false">
            <svg-icon class-name="ic_columFilter" icon-class="ic_colum_filter"></svg-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-scrollbar>
                  <el-checkbox-group v-model="check">
                    <el-dropdown-item v-for="(item, index) in checkList" :key="index">
                      <el-checkbox :label="item" :key="item"></el-checkbox>
                    </el-dropdown-item>
                  </el-checkbox-group>
                </el-scrollbar>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <slot name="tblInfoCon"></slot>

    <div
      :class="['vxe_table_main', { tableDataEmpty: !tableObj.tableData?.length }]"
      :style="{ height: tableObj.height }"
    >
      <vxe-table
        ref="vxeTableRef"
        border
        stripe
        show-overflow
        :footer-method="getSummaries"
        :show-footer="tableObj.showSummary"
        height="100%"
        :row-config="{ ...tableObj.rowConfig, isHover: true }"
        :data="tableObj.tableData"
        :scroll-y="{ enabled: true }"
        align="center"
      >
        <template
          v-for="(columnItem, index) in tableObj.column"
          :key="`vxe-column${index}${columnItem.label}`"
        >
          <vxe-column
            v-if="columnItem.type === 'operations'"
            :title="columnItem.label"
            :width="columnItem.width ? shiftColWidth(columnItem.width) : ''"
            :min-width="columnItem.minWidth"
            :max-width="columnItem.maxWidth"
            :align="columnItem.align || 'center'"
          >
            <template #default="{ row, $rowIndex }">
              <div class="opt-con">
                <div
                  v-for="(btnItem, btnIndex) in columnItem.btnList"
                  :key="'opt_' + btnIndex"
                  :class="['opt-item-con', { danger: btnItem.type === 'danger' }]"
                  v-show="
                    btnItem.showFunc && typeof btnItem.showFunc === 'function'
                      ? btnItem.showFunc(row)
                      : true
                  "
                >
                  <slot
                    v-if="btnItem.slot"
                    :name="btnItem.slot"
                    :row="row"
                    :rowIndex="$rowIndex"
                    :col="columnItem"
                  ></slot>
                  <el-popover
                    popper-class="more-opt-con"
                    v-else-if="btnItem.type === 'moreOpt'"
                    placement="bottom"
                    title
                    width="110px"
                    trigger="click"
                    content
                    @show="popoverShow(row, $rowIndex)"
                    @hide="popoverHide(row, $rowIndex)"
                  >
                    <div class="more-opt-btn-con">
                      <span
                        v-for="(moreOptItem, moreOptIndex) in btnItem.moreOptArr"
                        v-permission="moreOptItem.permission || []"
                        :class="'tk-link' + (moreOptItem.disabled ? ' tk-disabled' : '')"
                        :key="`more-opt_+${moreOptIndex}`"
                        v-show="
                          moreOptItem.showFunc &&
                          typeof moreOptItem.showFunc === 'function'
                            ? moreOptItem.showFunc(row, $rowIndex)
                            : true
                        "
                        @click="btnItem.func(moreOptItem, row, $rowIndex)"
                      >
                        {{ moreOptItem.label }}
                      </span>
                    </div>
                    <template #reference>
                      <span
                        :class="[
                          'tk-link',
                          {
                            'tk-disabled':
                              btnItem.disabled ||
                              (btnItem.disabledFun &&
                              typeof btnItem.disabledFun === 'function'
                                ? btnItem.disabledFun(row, $rowIndex)
                                : false),
                          },
                        ]"
                        v-show="
                          btnItem.showFunc && typeof btnItem.showFunc === 'function'
                            ? btnItem.showFunc(row)
                            : true
                        "
                        @click="btnItem.func(row)"
                      >
                        {{ btnItem.label }}
                        <i
                          :key="popoverKey"
                          :class="
                            (row && row.expanded ? 'more-expanded ' : '') +
                            'el-icon-caret-right el-icon--right expand-icon'
                          "
                        ></i>
                      </span>
                    </template>
                  </el-popover>

                  <!-- 导入功能 -->
                  <el-upload
                    v-if="btnItem.type === 'upload'"
                    v-show="
                      btnItem.showFunc && typeof btnItem.showFunc === 'function'
                        ? btnItem.showFunc(row)
                        : true
                    "
                    ref="uploadFile"
                    v-loading.fullscreen.lock="btnItem.loading"
                    element-loading-text="上传中"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(255,255,255,0.7)"
                    :name="btnItem.name || 'file'"
                    :action="btnItem.action"
                    :data="btnItem.data || { action: 'uploadimage' }"
                    :accept="btnItem.accept"
                    :multiple="btnItem.multiple || false"
                    :limit="btnItem.limit || 1"
                    :show-file-list="btnItem.showFileList || false"
                    :on-success="btnItem.handleSuccess"
                    :on-change="btnItem.handleFileChange"
                    :before-upload="btnItem.beforeUpload"
                    :disabled="
                      btnItem.disabled ||
                      (btnItem.disabledFun && typeof btnItem.disabledFun === 'function'
                        ? btnItem.disabledFun(row, $rowIndex)
                        : false)
                    "
                  >
                    <slot name="upload">
                      <span
                        :class="{
                          'tk-link': true,
                          'tk-disabled':
                            btnItem.disabled ||
                            (btnItem.disabledFun &&
                            typeof btnItem.disabledFun === 'function'
                              ? btnItem.disabledFun(row, $rowIndex)
                              : false),
                        }"
                        :loading="btnItem.loading"
                        @click="btnItem.clickHan(row)"
                      >
                        {{ btnItem.label || '导入文件' }}
                      </span>
                    </slot>
                  </el-upload>

                  <span
                    v-else-if="btnItem.type !== 'moreOpt'"
                    :class="[
                      'tk-link',
                      {
                        'tk-disabled':
                          btnItem.disabled ||
                          (btnItem.disabledFun &&
                          typeof btnItem.disabledFun === 'function'
                            ? btnItem.disabledFun(row, $rowIndex)
                            : false),
                      },
                    ]"
                    v-show="
                      btnItem.showFunc && typeof btnItem.showFunc === 'function'
                        ? btnItem.showFunc(row)
                        : true
                    "
                    v-permission="btnItem.permission || []"
                    @click="btnItem.func(row)"
                  >
                    {{
                      (btnItem.formatLabel && typeof btnItem.formatLabel === 'function'
                        ? btnItem.formatLabel(row)
                        : btnItem.label) || ''
                    }}
                  </span>
                </div>
              </div>
            </template>
          </vxe-column>

          <!-- slot列 -->
          <template v-else-if="columnItem.slot">
            <vxe-column
              :field="columnItem.prop"
              :title="columnItem.label"
              :width="columnItem.width ? shiftColWidth(columnItem.width) : ''"
              :min-width="columnItem.minWidth"
              :max-width="columnItem.maxWidth"
              :align="columnItem.align || 'center'"
            >
              <template #default="{ row, $rowIndex }">
                <slot
                  :name="columnItem.slot"
                  :row="row"
                  :rowIndex="$rowIndex"
                  :prop="columnItem.prop"
                  :col="columnItem"
                ></slot>
              </template>
            </vxe-column>
          </template>

          <template v-else-if="columnItem.type">
            <vxe-column
              :field="columnItem.prop"
              :type="columnItem.type"
              :title="columnItem.label"
              :width="columnItem.width ? shiftColWidth(columnItem.width) :shiftColWidth(90)"
              :align="columnItem.align || 'center'"
            ></vxe-column>
          </template>

          <template v-else-if="columnItem.formatter">
            <vxe-column
              :field="columnItem.prop"
              :title="columnItem.label"
              :width="columnItem.width ? shiftColWidth(columnItem.width) : ''"
              :min-width="columnItem.minWidth"
              :max-width="columnItem.maxWidth"
              :align="columnItem.align || 'center'"
              :formatter="({ row }) => columnItem.formatter(row)"
            ></vxe-column>
          </template>
          <template v-else>
            <vxe-column
              :field="columnItem.prop"
              :title="columnItem.label"
              :width="columnItem.width ? shiftColWidth(columnItem.width) : ''"
              :min-width="columnItem.minWidth"
              :max-width="columnItem.maxWidth"
              :align="columnItem.align || 'center'"
            ></vxe-column>
          </template>
        </template>

        <template #empty>
          <!-- 由于加载接口默认会显示初始的内容 需要增加一个tableLoading来显示一个空页面 -->
          <div
            class="empty_div"
            v-if="TkProjectUIStyle === 'LatestStyle' && !tableLoading"
          >
            <div class="empty_div_icon">
              <img :src="require(`@/assets/imgs/tk_workbench_main_icon1.png`)" alt="" />
              <div class="text">暂无数据</div>
            </div>
          </div>
          <div
            v-else-if="TkProjectUIStyle !== 'LatestStyle' && !tableLoading"
            class="text-center"
          >
            暂无数据
          </div>

          <div v-else></div>
        </template>
      </vxe-table>
    </div>

    <!-- 分页 -->
    <div v-if="tableObj.isPagination">
      <tk-pagination
        v-model:pageObj="tableObj.pageObj"
        :showTotal="tableObj.showTotal"
        :isHasSize="tableObj.isHasSize"
        :isPagination="tableObj.isPagination"
        @handlePagination="handlePagination"
      ></tk-pagination>
    </div>

    <!--更多搜索-->
    <el-drawer
      class="tableDrawer"
      :append-to-body="true"
      v-model="moreSearchDrawer"
      title="更多搜索条件"
      direction="ltr"
    >
      <slot name="afterOthersSlot"></slot>
      <template
        v-if="
          searchFormObj &&
          searchFormObj.formData !== null &&
          searchFormObj.formData !== 'null'
        "
      >
        <tk-form :searchFormObj="searchFormObj" :isDrawer="true">
          <template v-for="item in tableObj.specialSearchSlotData" v-slot:[item]>
            <slot :name="item"></slot>
          </template>
        </tk-form>
      </template>
      <slot name="befterOthersSlot"></slot>
    </el-drawer>
  </div>
</template>

<script setup>
  import {
    onMounted,
    ref,
    onUnmounted,
    nextTick,
    watch,
    defineExpose,
    onBeforeUnmount,
  } from 'vue';
  import TkPagination from '@/components/TkPagination/index.vue';
  import { getTkProjectUIStyle, getTkLoading } from '@/store/tkStore';
  const TkProjectUIStyle = getTkProjectUIStyle();
  const tableLoading = getTkLoading();
  const emits = defineEmits(['search', 'reset']);
  const props = defineProps({
    //表格对象
    tableObj: {
      type: Object,
      default: () => {},
    },
    //搜索表单对象
    searchFormObj: {
      type: Object,
      default: () => {},
    },
  });

  const moreSearchDrawer = ref(false); //更多搜索条件
  const handleReset = () => {
    props.tableObj.pageObj.currentPage = 1;
    props.searchFormObj.reset();
  };
  const handleSearch = () => {
    props.tableObj.pageObj.currentPage = 1;
    props.tableObj.search();
  };

  //分页触发
  const handlePagination = page => {
    props.tableObj.pagination(page);
  };

  ///监控搜索弹框开启
  watch(moreSearchDrawer, (newVal, oldVal) => {
    if (newVal) {
      if (
        props.searchFormObj &&
        typeof props.searchFormObj.openMoreSearch == 'function'
      ) {
        props.searchFormObj.openMoreSearch();
      }
    }
  });

  const vxeTableRef = ref();
  // 导出表格
  const exportDataEvent = options => {
    vxeTableRef.value.exportData({ type: 'csv', ...options });
  };

  defineExpose({ exportDataEvent });

  function getSummaries({ columns, data }) {
    const footerData = [
      columns.map((column, _columnIndex) => {
        if (_columnIndex === 0) {
          return '合计';
        }
        if (data && data.length > 0) {
          if (props.tableObj?.showSummaryColumn?.includes(column.field)) {
            return sumNum(data, column.field);
          }
        }

        return null;
      }),
    ];
    return footerData;
  }

  // 进行合计
  function sumNum(costForm, type) {
    if (type) {
      let total = 0;
      for (let i = 0; i < costForm.length; i++) {
        total += costForm[i][type];
      }
      return sumFilter(total);
    }
  }
  function sumFilter(value) {
    if (!value) return '0';
    value = value - 0;
    return value;
    // return value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }

  // 设置列宽度
  function shiftColWidth(colWidth) {
    const newRootFontSize = window.getComputedStyle(document.documentElement).fontSize;
    if (!colWidth || newRootFontSize == 16) return colWidth;
    const oldRootFontSize = 16;

    // 先换算成 rem，再用新的根字体大小换回 px
    const rem = colWidth / oldRootFontSize;

    return Math.ceil(rem * parseFloat(newRootFontSize));
  }

  onMounted(() => {
    if (props.tableObj.isFilterColumn) {
      props.tableObj.column.forEach(ele => {
        ele.ispass = !ele.hidden;
        if (!ele.hidden) check.value.push(ele.label);
        checkList.value.push(ele.label);
      });
    }

    nextTick(() => {
      props.tableObj.autoHeight();
      props.tableObj.setTableRef(vxeTableRef.value);
    });

    window.addEventListener('resize', props.tableObj.autoHeight, false);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', props.tableObj.autoHeight);
  });
</script>

<style lang="less">
  .vxe_table {
    height: 100%;
    background-color: #fff;
    padding: 22px;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;

    .opt-con {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      & > div {
        .expand-icon {
          margin-left: 0;
        }
      }
      .opt-item-con {
        .tk-link {
          font-weight: 500;
          font-size: 16px;
          color: #3282dc;
        }

        &.danger {
          .tk-link {
            color: #ff3600 !important;
          }
        }
      }
    }

    .more-expanded {
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);
    }
    .cus-form {
      margin-bottom: 14px;
    }
    &_main {
      flex: 1;
    }

    // 表格顶部样式
    .tbl-top-con {
      .tbl-top-slot-con {
        display: flex;
        & > .top-left {
          flex: 1;
        }
      }
      .tbl-top-init {
        margin-bottom: 4px;
        display: flex;
        .searchPanel {
          flex: 1;
        }
        .RightLayout {
          align-items: center;
          .el-dropdown {
            margin-left: 8px;
          }
        }
      }
    }
  }

  :deep(.vxe-table) {
    --vxe-font-color: #333;
    --vxe-table-border-color: #c4c2c2;

    .vxe-table--render-default {
      .vxe-body--column.col--ellipsis > .vxe-cell {
        max-height: none !important;
      }
      .vxe-body--row.row--hover {
        --vxe-table-row-hover-background-color: rgba(50, 130, 220, 0.2);
        color: #333;
        font-weight: bold;
      }
      .size--mini {
        --vxe-font-size-mini: 14px !important;
        .vxe-body--column.col--ellipsis > .vxe-cell {
          max-height: none !important;
        }
      }
    }

    .vxe-select--panel {
      z-index: 8000 !important;
    }

    .vxe-table--header-wrapper {
      --vxe-table-header-font-color: #fff;
      --vxe-table-header-background-color: rgba(50, 130, 220, 0.9);
      --vxe-font-color: #333;
      --vxe-table-border-color: #999;
    }
  }

  // -------------- 最新风格样式 开始---------------------------
  #LatestStyle {
    .danger {
      color: #ff3600 !important;
      .tk-link {
        color: #ff3600 !important;
      }
    }

    .vxe-table {
      --vxe-font-color: #000;
      --vxe-table-border-color: #d8d8d8;
    }

    .vxe-table--render-default.border--default .vxe-table--header-wrapper,
    .vxe-table--render-default.border--full .vxe-table--header-wrapper,
    .vxe-table--render-default.border--outer .vxe-table--header-wrapper {
      --vxe-table-header-font-color: #000 !important;
      --vxe-table-header-background-color: #f5f7fb !important;
      --vxe-font-color: #000 !important;
      --vxe-table-border-color: #d8d8d8 !important;
    }

    .vxe-table--render-default .vxe-body--row.row--stripe {
      --vxe-table-row-striped-background-color: #f5f7fb;
    }

    .vxe-table--render-default .vxe-body--column.col--ellipsis,
    .vxe-table--render-default .vxe-footer--column.col--ellipsis,
    .vxe-table--render-default .vxe-header--column.col--ellipsis,
    .vxe-table--render-default.vxe-editable .vxe-body--column {
      --vxe-table-row-height-default: 42px;
    }

    .vxe-table--render-default .vxe-body--column,
    .vxe-table--render-default .vxe-footer--column,
    .vxe-table--render-default .vxe-header--column {
      --vxe-table-row-line-height: 42px;
    }

    .vxe-table--render-default {
      --vxe-font-size: 16px;
      --vxe-font-color: #000;
      --vxe-font-family: '微软雅黑', Arial, Helvetica, sans-serif;
    }

    .vxe-table--render-default .vxe-body--column:not(.col--ellipsis),
    .vxe-table--render-default .vxe-footer--column:not(.col--ellipsis),
    .vxe-table--render-default .vxe-header--column:not(.col--ellipsis) {
      --vxe-table-column-padding-default: 3px;
    }

    .vxe-table--empty-content {
      height: 100%;

      .empty_div {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100%;

        .empty_div_icon {
          width: 35%;
          max-width: 300px;
          min-width: 110px;
          img {
            width: 100%;
            height: auto;
          }
          .text {
            font-weight: 500 !important;
            font-size: 1.2rem !important;
            color: #000000d9 !important;
            text-align: center;
          }
        }
      }
    }
  }

  .vxe-table--body-wrapper,
  .vxe-table--fixed-left-body-wrapper,
  .vxe-table--fixed-right-body-wrapper {
    overflow-y: auto;
    overflow-x: auto;

    &:hover {
      ::-webkit-scrollbar {
        opacity: 1 !important;
      }

      ::-webkit-scrollbar-thumb {
        background-color: #ccc !important;
        opacity: 1;
        visibility: visible;
      }
    }

    &::-webkit-scrollbar {
      width: 4px !important;
      height: 4px !important;
      opacity: 0;
      visibility: hidden;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ccc !important;
      opacity: 0;
      visibility: hidden;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent !important;
    }
  }

  // -------------- 最新风格样式 结束---------------------------
</style>
