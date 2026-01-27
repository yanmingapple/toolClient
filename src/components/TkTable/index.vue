<template>
  <div :class="`table-auto ${tableObj.height === undefined ? '' : 'height100'}`">
    <!-- 表格顶部 -->

    <div v-if="tableObj.isShowTblTopCon" class="tbl-top-con" ref="searchTopDom">
      <div class="tbl-top-slot-con" v-if="tableObj.isShowTblSlotTopCon">
        <div class="top-left">
          <slot name="tblTopLeft"></slot>
        </div>
        <div class="top-right">
          <slot name="tblTopRight"></slot>
        </div>
      </div>
      <div
        class="tbl-top-init"
        v-if="
          (searchFormObj && !tableObj.unRenderTbl) ||
          tableObj.isFilterColumn ||
          tableObj.isShowSortList
        "
      >
        <div v-if="searchFormObj && !tableObj.unRenderTbl" class="searchPanel">
          <!-- 仅一个搜索按钮处理 -->
          <div v-if="searchFormObj.searchBtn">
            <el-button @click="handleSearch" plain type="primary">
              <svg-icon icon-class="ic_search" class-name="mr10"></svg-icon>
              搜索
            </el-button>

            <slot name="searchBtnRight"></slot>
          </div>
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
                  <svg-icon
                    :icon-class="tableObj.searchIcon || 'ic_search'"
                    class-name="mr10"
                  ></svg-icon>
                  {{ tableObj.searchText || '搜索' }}
                </el-button>

                <el-button
                  v-if="tableObj.hasResetBtn"
                  plain
                  @click="handleReset"
                  type="primary"
                >
                  {{ tableObj.resetText }}
                </el-button>

                <el-button
                  v-if="tableObj.hasMoreSearchBtn"
                  plain
                  @click="moreSearchDrawer = true"
                  :type="
                    (!!tableObj.setMoreSearchBtnType && setComMoreSearchBtnType) ||
                    tableObj.setMoreSearchBtnType ||
                    'primary'
                  "
                  class="more-search-btn"
                >
                  <span class="more-search-btn-content">更多条件</span>
                  <span v-if="hasDrawerValues" class="more-search-indicator">...</span>
                  <svg-icon
                    icon-class="ic_to_next"
                    style="margin-left: 0.2rem"
                  ></svg-icon>
                </el-button>
              </el-form-item>

              <el-form-item class="search-box">
                <slot name="searchBtnRight"></slot>
              </el-form-item>
            </template>

            <template v-for="item in tableObj.specialSearchSlotData" v-slot:[item]>
              <slot :name="item"></slot>
            </template>

            <slot name="cusformRight"></slot>
          </tk-form>
          <div>
            <slot name="formright"></slot>
          </div>
        </div>
        <!-- 过滤表头 -->
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
        <div
          class="tbl-sort-con"
          v-if="tableObj.isShowSortList"
          :style="tableObj?.sortIsRight ? '' : 'flex-basis: 100%;'"
        >
          <slot name="sortList"></slot>
        </div>
      </div>
    </div>
    <div
      v-if="!tableObj.unRenderTbl"
      :class="[
        'tableMain',
        tableObj.tblInfoIsInBorder
          ? 'pt10 pb10 tool_js_border tool_js_borderRadius4'
          : '',
      ]"
      :style="`${
        tableObj.height === undefined
          ? ''
          : 'height: calc(100% - ' + (headerHeight + 0) + 'px);'
      } ${tableObj.tblInfoCss || ''}`"
    >
      <!-- tableObj.height === undefined ? '' : 'height: calc(100% - '+ (headerHeight + 10) + 'px)' -->
      <div class="tbl-info-con">
        <slot name="tblInfoCon"></slot>
      </div>

      <div
        :class="['tablePanel scroll ', { tableDataEmpty: !tableObj.tableData?.length }]"
        ref="tablePanelDom"
      >
        <template v-if="tableObj.type == 'table'">
          <el-table
            v-loading="tableObj.tableLoading"
            element-loading-text="数据加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.8)"
            :class="tableObj.tblClassStr"
            :id="tableObj.tableId || 'elTable_' + tableId"
            ref="tableRef"
            borderlogAudit
            :border="tableObj.border"
            header-row-class-name="tbl-header"
            header-cell-class-name="table-header-cell"
            :row-class-name="tableObj.rowClassNameHan"
            :highlight-current-row="tableObj.highlightCurrentRow"
            :show-summary="tableObj.showSummary"
            :show-header="tableObj.showHeader"
            :summary-method="tableObj.summaryMethod || summaryMethod"
            :data="tableObj.tableData"
            :span-method="objectSpanMethod"
            :row-key="getRowKey"
            :stripe="TkProjectUIStyle === `LatestStyle`"
            :tree-props="tableObj.treeProps"
            :default-expand-all="tableObj.defaultExpandAll"
            @row-click="handleRowClick"
            @row-dblclick="handleRowDblclick"
            @row-contextmenu="handleRowContextmenu"
            :height="
              tableObj.height !== undefined && tableObj.height !== ''
                ? tableObj.height
                : props.isAutoCalcHeight && tablePanelDomHeight
                ? tablePanelDomHeight
                : undefined
            "
          >
            <!-- 是否需要全选， showSelection控制  isSelect禁用复选框方法-->
            <el-table-column
              v-if="tableObj.showSelection"
              type="selection"
              align="center"
              :width="shiftColWidth(70)"
              fixed
              :selectable="tableObj.rowSelectale"
              :reserve-selection="!!tableObj.reserveSelection"
            ></el-table-column>

            <el-table-column v-if="tableObj.showExpand" type="expand">
              <template #default="{ row }">
                <slot name="expand" :row="{ row }"></slot>
              </template>
            </el-table-column>

            <template
              v-for="(columnItem, index) in tableObj.column"
              :key="`column_wrapper_${index}`"
            >
              <template v-if="columnItem">
                <el-table-column
                  v-if="index == 0 && tableObj.treeProps"
                  :label="columnItem.label"
                  :prop="columnItem.prop || ''"
                  :align="columnItem.align || 'center'"
                  :min-width="columnItem.minWidth || 100"
                  :width="
                    columnItem.width
                      ? shiftColWidth(columnItem.width)
                      : ['序号', '选择'].includes(columnItem.label)
                      ? shiftColWidth(70)
                      : ''
                  "
                ></el-table-column>
                <el-table-column
                  v-else-if="columnItem.ispass !== false"
                  :key="`column_index_${index}`"
                  :prop="columnItem.prop || ''"
                  :type="!columnItem.prop && columnItem.label === '序号' ? 'index' : ''"
                  :align="columnItem.align || 'center'"
                  :label="columnItem.label"
                  :min-width="columnItem.minWidth || 100"
                  :width="
                    columnItem.width
                      ? shiftColWidth(columnItem.width)
                      : ['序号', '选择'].includes(columnItem.label)
                      ? shiftColWidth(70)
                      : ''
                  "
                  :formatter="columnItem.formatter"
                  header-align="center"
                  :show-overflow-tooltip="
                    columnItem.showOverflowToolTip === true ? true : false
                  "
                  :sortable="columnItem.sortable || false"
                >
                  <template v-if="columnItem.headerSlot" #header>
                    <!-- 操作列/自定义列 -->
                    <slot
                      :name="columnItem.headerSlot"
                      :prop="columnItem.prop"
                      :col="columnItem"
                    ></slot>
                  </template>

                  <template #default="scope">
                    <el-radio
                      v-if="!columnItem.prop && columnItem.label === '选择'"
                      v-model="tableObj.singleVal"
                      :label="scope.row[tableObj.rowKey]"
                      :disabled="
                        columnItem.disabledFun
                          ? columnItem?.disabledFun(scope.row, scope.$index)
                          : false
                      "
                    >
                      <i></i>
                    </el-radio>
                    <div v-if="!columnItem.prop && columnItem.label === '序号'">
                      <!-- 有合并单元格序号显示 -->
                      <span v-if="tableObj.needMergeArr">
                        {{ scope.row['sequence'] }}
                      </span>
                      <!-- 有分页时，序号显示 -->
                      <span v-else-if="tableObj.pageObj">
                        {{
                          (tableObj.pageObj.currentPage - 1) * tableObj.pageObj.pageSize +
                          scope.$index +
                          1
                        }}
                      </span>
                      <!-- 无分页时，序号显示 -->
                      <span v-else>{{ scope.$index + 1 }}</span>
                    </div>
                    <el-switch
                      v-else-if="columnItem.type === 'status'"
                      :key="statusKey"
                      :active-text="
                        scope.row[columnItem.prop] === columnItem.typeArr[0].value
                          ? columnItem.typeArr[0].label
                          : columnItem.typeArr[1].label
                      "
                      :model-value="
                        scope.row[columnItem.prop] === columnItem.typeArr[0].value
                      "
                      @change="
                        v => {
                          // statusKey++;
                          columnItem.func(v, scope.row);
                        }
                      "
                    />

                    <!-- 跳转页面 按钮 -->
                    <span
                      v-else-if="columnItem.type === 'link'"
                      :class="
                        'tk-link' +
                        (columnItem.disabledLink &&
                        typeof columnItem.disabledLink === 'function' &&
                        columnItem.disabledLink(scope.row)
                          ? ' tk-disabled'
                          : '')
                      "
                      @click="columnItem.func(scope.row, $event, scope.$index)"
                      v-html="
                        columnItem.formatter
                          ? columnItem.formatter(scope.row, columnItem)
                          : columnItem.text || scope.row[columnItem.prop]
                      "
                    ></span>

                    <!-- tag标签显示 -->
                    <template v-else-if="columnItem.type === 'tag' && scope.row">
                      <el-tag
                        :type="
                          columnItem.tagTypeFun
                            ? columnItem.tagTypeFun(scope.row, columnItem)
                            : 'primary'
                        "
                      >
                        {{
                          columnItem.formatter
                            ? columnItem.formatter(scope.row, columnItem)
                            : scope.row[columnItem.prop] || ''
                        }}
                      </el-tag>
                    </template>

                    <!-- 自定义标签显示 -->
                    <template
                      v-else-if="
                        columnItem.type === 'autoTag' &&
                        columnItem.getTagData &&
                        columnItem.getTagData(scope.row)
                      "
                    >
                      <b
                        class="tagItem"
                        :style="{
                          color: columnItem.getTagData(scope.row).color,
                          backgroundColor: columnItem.getTagData(scope.row).color + '20',
                          borderColor: columnItem.getTagData(scope.row).color + '50',
                        }"
                      >
                        {{ columnItem.getTagData(scope.row).label }}
                      </b>
                    </template>

                    <!-- 操作列/自定义列 -->
                    <slot
                      v-else-if="columnItem.slot"
                      :name="columnItem.slot"
                      :row="scope.row"
                      :rowIndex="scope.$index"
                      :prop="columnItem.prop"
                      :col="columnItem"
                    ></slot>

                    <!-- 判断是否可跳转 按钮 -->
                    <div v-else-if="columnItem.type === 'isLink'">
                      <span
                        v-if="scope.row[columnItem.prop] || scope.row[columnItem.prop]"
                        class="tk-link"
                        @click="columnItem.func(scope.row)"
                      >
                        {{ columnItem.text || scope.row[columnItem.prop] }}
                      </span>
                      <span v-else>{{ columnItem.noText || '无' }}</span>
                    </div>

                    <div
                      v-else-if="
                        columnItem.type === 'operations' &&
                        columnItem.btnList &&
                        columnItem.btnList.length > 0
                      "
                      class="opt-con"
                      :style="{ 'justify-content': columnItem.align ?? 'space-around' }"
                    >
                      <template
                        v-for="(btnItem, btnIndex) in columnItem.btnList"
                        :key="'opt_' + btnIndex"
                      >
                        <template v-if="btnItem.slot">
                          <div
                            :class="[
                              'opt-item-con',
                              { danger: btnItem.type === 'danger' },
                            ]"
                          >
                            <slot
                              :name="btnItem.slot"
                              :row="scope.row"
                              :rowIndex="scope.$index"
                              :col="columnItem"
                            ></slot>
                          </div>
                        </template>

                        <template v-else-if="btnItem.type === 'moreOpt'">
                          <div
                            :class="[
                              'opt-item-con',
                              { danger: btnItem.type === 'danger' },
                            ]"
                          >
                            <el-popover
                              popper-class="more-opt-con"
                              placement="bottom"
                              title
                              width="110px"
                              trigger="click"
                              content
                              @show="popoverShow(scope.row, scope.$index)"
                              @hide="popoverHide(scope.row, scope.$index)"
                            >
                              <div class="more-opt-btn-con">
                                <template
                                  v-for="(
                                    moreOptItem, moreOptIndex
                                  ) in btnItem.moreOptArr"
                                  :key="`more-opt_+${moreOptIndex}`"
                                >
                                  <span
                                    :class="
                                      'tk-link' +
                                      (moreOptItem.disabled ? ' tk-disabled' : '')
                                    "
                                    v-if="
                                      hasPermissionNew(moreOptItem.permission) &&
                                      (moreOptItem.showFunc &&
                                      typeof moreOptItem.showFunc === 'function'
                                        ? moreOptItem.showFunc(scope.row, scope.$index)
                                        : true)
                                    "
                                    @click="
                                      rowBtnHan(moreOptItem, scope.row, scope.$index)
                                    "
                                  >
                                    {{ moreOptItem.label }}
                                  </span>
                                </template>
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
                                          ? btnItem.disabledFun(scope.row, scope.$index)
                                          : false),
                                    },
                                  ]"
                                  v-if="
                                    btnItem.showFunc &&
                                    typeof btnItem.showFunc === 'function'
                                      ? btnItem.showFunc(scope.row, scope.$index)
                                      : true
                                  "
                                  @click="
                                    btnItem.disabled ||
                                    (btnItem.disabledFun &&
                                      typeof btnItem.disabledFun === 'function' &&
                                      btnItem.disabledFun(scope.row, scope.$index))
                                      ? () => {}
                                      : rowBtnHan(btnItem, scope.row, scope.$index)
                                  "
                                >
                                  {{ btnItem.label }}
                                  <i
                                    :key="popoverKey"
                                    :class="
                                      (scope.row && scope.row.expanded
                                        ? 'more-expanded '
                                        : '') +
                                      'el-icon-caret-right el-icon--right expand-icon'
                                    "
                                  ></i>
                                </span>
                              </template>
                            </el-popover>
                          </div>
                        </template>

                        <template v-if="btnItem.type === 'upload'">
                          <div
                            v-if="
                              btnItem.showFunc && typeof btnItem.showFunc === 'function'
                                ? btnItem.showFunc(scope.row, scope.$index)
                                : true
                            "
                            :class="[
                              'opt-item-con',
                              { danger: btnItem.type === 'danger' },
                            ]"
                          >
                            <!-- 导入功能 -->
                            <el-upload
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
                                (btnItem.disabledFun &&
                                typeof btnItem.disabledFun === 'function'
                                  ? btnItem.disabledFun(scope.row, scope.$index)
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
                                        ? btnItem.disabledFun(scope.row, scope.$index)
                                        : false),
                                  }"
                                  :loading="btnItem.loading"
                                  @click="btnItem.clickHan(scope.row)"
                                >
                                  {{ btnItem.label || '导入文件' }}
                                </span>
                              </slot>
                            </el-upload>
                          </div>
                        </template>

                        <template v-else-if="btnItem.type !== 'moreOpt'">
                          <div
                            v-if="
                              hasPermissionNew(btnItem.permission) &&
                              (btnItem.showFunc && typeof btnItem.showFunc === 'function'
                                ? btnItem.showFunc(scope.row, scope.$index)
                                : true)
                            "
                            :class="[
                              'opt-item-con',
                              { danger: btnItem.type === 'danger' },
                            ]"
                          >
                            <span
                              :class="[
                                'tk-link',
                                {
                                  'tk-disabled':
                                    btnItem.disabled ||
                                    (btnItem.disabledFun &&
                                    typeof btnItem.disabledFun === 'function'
                                      ? btnItem.disabledFun(scope.row, scope.$index)
                                      : false),
                                },
                              ]"
                              @click="
                                btnItem.disabled ||
                                (btnItem.disabledFun &&
                                  typeof btnItem.disabledFun === 'function' &&
                                  btnItem.disabledFun(scope.row, scope.$index))
                                  ? () => {}
                                  : rowBtnHan(btnItem, scope.row, scope.$index)
                              "
                            >
                              {{
                                (btnItem.formatLabel &&
                                typeof btnItem.formatLabel === 'function'
                                  ? btnItem.formatLabel(scope.row)
                                  : btnItem.label) || ''
                              }}
                            </span>
                          </div>
                        </template>
                      </template>
                    </div>

                    <!-- 正常渲染 -->
                    <span
                      v-else
                      :disabled="columnItem.disabled || false"
                      v-html="
                        (columnItem.formatter
                          ? columnItem.formatter(scope.row, columnItem)
                          : columnItem.type && columnItem.type == 'time'
                          ? getTime(scope.row[columnItem.prop], columnItem.formatVal)
                          : scope.row[columnItem.prop] == 0
                          ? scope.row[columnItem.prop]
                          : scope.row[columnItem.prop]
                          ? scope.row[columnItem.prop] || ''
                          : columnItem.defaultValue || '') +
                        (columnItem.suffixFun &&
                        typeof columnItem.suffixFun === 'function'
                          ? columnItem.suffixFun(scope.row)
                          : '')
                      "
                    ></span>

                    <svg-icon
                      v-if="columnItem.iconSvgClass"
                      v-show="
                        typeof columnItem.iconSvgShowFun === 'function'
                          ? columnItem.iconSvgShowFun(scope.row, columnItem)
                          : true
                      "
                      class="tableColumnSvg"
                      :icon-class="columnItem.iconSvgClass"
                      @click="
                        columnItem.iconSvgFunc
                          ? columnItem.iconSvgFunc(scope.row, $event, scope.$index)
                          : defaultFunc(scope.row, columnItem)
                      "
                    />

                    <span
                      v-if="columnItem.suffixHtmlFun"
                      v-html="
                        columnItem.suffixHtmlFun && columnItem.suffixHtmlFun(scope.row)
                      "
                    ></span>
                  </template>
                </el-table-column>
              </template>
            </template>
            <template #empty>
              <slot name="empty">
                <!-- 由于加载接口默认会显示初始的内容 需要增加一个tableLoading来显示一个空页面 -->
                <div
                  class="empty_div"
                  v-if="TkProjectUIStyle === 'LatestStyle' && !tableLoading"
                >
                  <div class="empty_div_icon">
                    <img
                      :src="require(`@/assets/imgs/tk_workbench_main_icon1.png`)"
                      alt=""
                    />
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
              </slot>
            </template>
          </el-table>
          <div>
            <slot name="tablePanel"></slot>
          </div>
        </template>

        <div v-if="tableObj.type == 'panel'" style="overflow-y: auto">
          <slot name="tablePanel"></slot>
        </div>
      </div>

      <!-- 分页 -->
      <div class="page-con" v-if="tableObj.isPagination">
        <tk-pagination
          v-model:pageObj="tableObj.pageObj"
          :showTotal="tableObj.showTotal"
          :isHasSize="tableObj.isHasSize"
          :isPagination="tableObj.isPagination"
          :selRows="tableObj.getSelectedRow()"
          @handlePagination="handlePagination"
        ></tk-pagination>
      </div>
    </div>
    <div
      v-else
      class="un-render-tbl-con"
      :style="'height: calc(100% - ' + (headerHeight + 100) + 'px)'"
    >
      <slot name="unRenderTblCon"></slot>
    </div>

    <!--更多搜索-->
    <el-drawer
      v-if="tableObj.hasMoreSearchBtn"
      class="tableDrawer more-search-drawer LatestStyle"
      :append-to-body="true"
      v-model="moreSearchDrawer"
      title="更多搜索条件"
      direction="ltr"
    >
      <div class="more-search-drawer-content">
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
      </div>

      <template #footer>
        <div class="pd15">
          <el-button @click="moreSearchDrawer = false">关闭</el-button>
          <el-button
            type="primary"
            @click="
              handleSearch();
              moreSearchDrawer = false;
            "
          >
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>
    
    <!-- 右键菜单 -->
    <tk-context-menu
      v-if="hasContextMenuItems()"
      v-model:visible="tableObj.contextMenuVisible"
      :x="tableObj.contextMenuX"
      :y="tableObj.contextMenuY"
      :title="getContextMenuTitle()"
      :menu-height="tableObj.contextMenuHeight || 250"
      :menu-items="getContextMenuItems()"
      @close="handleContextMenuClose"
    />
  </div>
</template>

<script setup>
  import { onMounted, ref, onUnmounted, nextTick, watch, computed } from 'vue';
  import TkPagination from '@/components/TkPagination/index.vue';
  import TkContextMenu from '@/components/TkContextMenu/index.vue';
  import { getTkProjectUIStyle, getTkLoading } from '@/store/tkStore';
  const TkProjectUIStyle = getTkProjectUIStyle();
  const emits = defineEmits(['search', 'reset']);

  const tableLoading = getTkLoading();
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
    // 自定义单元格合并逻辑
    customSpanMethod: {
      type: Function,
      default: () => {},
    },
    // 是否自动计算高度（当没有配置高度时，根据容器高度自动计算）
    isAutoCalcHeight: {
      type: Boolean,
      default: false,
    },
  });

  //表格id
  const tableId = tkTools.reqSsnCre(18);
  const dataSource = ref([]);
  const check = ref([]);
  const checkList = ref([]);
  const popoverKey = ref(0);
  const statusKey = ref(0);
  const tableRef = ref(null);
  const moreSearchDrawer = ref(false); //更多搜索条件
  const tablePanelDom = ref(null);
  const searchTopDom = ref(null);
  const headerHeight = ref(0),
    tablePanelDomHeight = ref(0);

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

  ///监控选中的列，动态变化
  watch(
    () => check.value,
    (newVal, oldVal) => {
      if (newVal) {
        var arr = checkList.value.filter(i => newVal.indexOf(i) < 0); //未选中
        props.tableObj.column.map(i => {
          if (arr.indexOf(i.label) !== -1) {
            i.ispass = false;
          } else {
            i.ispass = true;
          }
        });
      }
    }
  );

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

  watch(
    () => props.tableObj.tableData,
    val => {
      if (val) {
        if (props.tableObj?.needMergeArr?.length > 0) {
          rowspan([...val], 0, props.tableObj.needMergeArr[0]);
        }
      }
    }
  );

  // 监听分页大小变化，重新计算高度（仅在启用自动计算高度时）
  watch(
    () => props.tableObj.pageObj?.pageSize,
    () => {
      if (
        props.isAutoCalcHeight &&
        (props.tableObj.height === undefined || props.tableObj.height === '')
      ) {
        nextTick(() => {
          props.tableObj.autoHeight();
          // 强制 table 重新布局
          if (tableRef.value) {
            tableRef.value.doLayout?.();
          }
        });
      }
    }
  );

  // 监听 tablePanelDomHeight 变化，确保高度正确应用（仅在启用自动计算高度时）
  watch(
    () => tablePanelDomHeight.value,
    newVal => {
      if (
        props.isAutoCalcHeight &&
        newVal > 0 &&
        (props.tableObj.height === undefined || props.tableObj.height === '')
      ) {
        nextTick(() => {
          // 强制 table 重新布局
          if (tableRef.value) {
            tableRef.value.doLayout?.();
          }
        });
      }
    }
  );

  // 点击当前行 选中
  const handleRowClick = row => {
    //点击选中操作
    if (
      props.tableObj.rowClickSelect &&
      !props.tableObj.tableData.includes(row[props.tableObj.rowKey])
    ) {
      props.tableObj.tableRef.toggleRowSelection(row);
    }

    //当前选中行数据
    props.tableObj.currSelectRow = row;

    //点击行触发事件
    if (
      props.tableObj.handlerSelectedRow &&
      typeof props.tableObj.handlerSelectedRow === 'function'
    ) {
      props.tableObj.handlerSelectedRow(row);
    }
  };

  // 双击行事件处理
  const handleRowDblclick = (row, column, event) => {
    //当前选中行数据
    props.tableObj.currSelectRow = row;

    //双击行触发事件
    if (
      props.tableObj.handlerRowDblclick &&
      typeof props.tableObj.handlerRowDblclick === 'function'
    ) {
      props.tableObj.handlerRowDblclick(row, column, event);
    }
  };

  // 右键行事件处理
  const handleRowContextmenu = (row, column, event) => {
    //当前选中行数据
    props.tableObj.currSelectRow = row;

    // 如果配置了右键菜单项，自动处理右键菜单显示
    if (props.tableObj.contextMenuItems && props.tableObj.contextMenuItems.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      
      // 关闭之前的菜单（如果有）
      props.tableObj.contextMenuVisible = false;
      
      // 设置菜单数据
      props.tableObj.contextMenuData = row;
      
      // 设置菜单位置
      props.tableObj.contextMenuX = event.clientX;
      props.tableObj.contextMenuY = event.clientY;
      props.tableObj.contextMenuVisible = true;
    }

    //右键行触发事件（保留原有功能，允许自定义处理）
    if (
      props.tableObj.handlerRowContextmenu &&
      typeof props.tableObj.handlerRowContextmenu === 'function'
    ) {
      props.tableObj.handlerRowContextmenu(row, column, event);
    }
  };

  // 获取右键菜单标题
  const getContextMenuTitle = () => {
    if (!props.tableObj.contextMenuTitle) return '';
    if (typeof props.tableObj.contextMenuTitle === 'function') {
      return props.tableObj.contextMenuTitle(props.tableObj.contextMenuData);
    }
    return props.tableObj.contextMenuTitle;
  };

  // 检查是否有右键菜单项
  const hasContextMenuItems = () => {
    if (!props.tableObj.contextMenuItems) return false;
    // 如果是函数，返回 true（函数会在调用时判断）
    if (typeof props.tableObj.contextMenuItems === 'function') return true;
    // 如果是数组，检查长度
    if (Array.isArray(props.tableObj.contextMenuItems)) {
      return props.tableObj.contextMenuItems.length > 0;
    }
    // 如果是 computed ref，获取其值
    if (props.tableObj.contextMenuItems && typeof props.tableObj.contextMenuItems.value !== 'undefined') {
      const value = props.tableObj.contextMenuItems.value;
      return Array.isArray(value) ? value.length > 0 : !!value;
    }
    return false;
  };

  // 获取右键菜单项（处理动态菜单项）
  const getContextMenuItems = () => {
    if (!props.tableObj.contextMenuItems) {
      return [];
    }
    
    let menuItems = [];
    
    // 如果是 computed ref，获取其值
    if (props.tableObj.contextMenuItems && typeof props.tableObj.contextMenuItems.value !== 'undefined') {
      menuItems = props.tableObj.contextMenuItems.value;
    }
    // 如果菜单项是函数，调用它获取菜单项
    else if (typeof props.tableObj.contextMenuItems === 'function') {
      menuItems = props.tableObj.contextMenuItems(props.tableObj.contextMenuData);
    } 
    // 如果是数组，直接使用
    else if (Array.isArray(props.tableObj.contextMenuItems)) {
      menuItems = props.tableObj.contextMenuItems;
    }
    
    // 处理菜单项中的 handler 和 disabled，绑定当前行数据
    return menuItems.map(item => {
      const processedItem = { ...item };
      
      // 处理 handler
      if (item.handler && typeof item.handler === 'function') {
        processedItem.handler = () => {
          // 在 handler 中自动关闭菜单
          props.tableObj.contextMenuVisible = false;
          // 调用原始的 handler，传入行数据
          item.handler(props.tableObj.contextMenuData);
        };
      }
      
      // 处理动态 disabled（支持函数）
      if (typeof item.disabled === 'function') {
        processedItem.disabled = item.disabled(props.tableObj.contextMenuData);
      }
      
      return processedItem;
    });
  };

  // 右键菜单关闭处理
  const handleContextMenuClose = () => {
    props.tableObj.contextMenuData = null;
  };

  onMounted(() => {
    moreSearchDrawer.value = false;
    if (props.tableObj.isFilterColumn) {
      props.tableObj.column.forEach(ele => {
        ele.ispass = !ele.hidden;
        if (!ele.hidden) check.value.push(ele.label);
        checkList.value.push(ele.label);
      });
    }

    nextTick(() => {
      props.tableObj.autoHeight();
      props.tableObj.setTableRef(tableRef.value);
    });
  });

  onUnmounted(() => {
    moreSearchDrawer.value = false;
  });

  props.tableObj.autoHeight = function () {
    nextTick(() => {
      headerHeight.value = searchTopDom?.value?.offsetHeight ?? 0;
      tablePanelDomHeight.value = tablePanelDom?.value?.offsetHeight ?? 0;
    });
  };
  const rowBtnHan = (btnItem, row, index) => {
    if (btnItem.func && typeof btnItem.func === 'function') {
      btnItem.func(row, index);
    }
  };

  const popoverShow = (row, index) => {
    row['expanded'] = true;
    popoverKey.value++;
  };

  const popoverHide = (row, index) => {
    row['expanded'] = false;
    popoverKey.value--;
  };

  // 合并 index 得显示
  const rowspan = (list, sPosition, spanProp) => {
    let spanArr = [];
    let newPosition = sPosition;
    list.forEach((_c, index) => {
      spanArr.push(_c[spanProp]);
      if (index === 0 && sPosition === 0) {
        newPosition = newPosition + 1;
        _c.sequence = newPosition;
      } else {
        if (index === 0 || spanArr[index - 1] === _c[spanProp]) {
          _c.sequence = newPosition;
        } else {
          newPosition = newPosition + 1;
          _c.sequence = newPosition;
        }
      }
      dataSource.value[index] = _c;
    });
  };

  // 给表格行赋值唯一标识
  const getRowKey = row => {
    return row[props.tableObj.rowKey] || row.id || row.rowIndex || row.index;
  };

  // 表格合并行
  const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    if (
      props.tableObj.customSpanMethod &&
      typeof props.tableObj.customSpanMethod === 'function'
    ) {
      return props.tableObj.customSpanMethod(row, column, rowIndex, columnIndex);
    }
    return !props.tableObj.needMergeArr || props.tableObj.needMergeArr.length === 0
      ? false
      : spanMethodFunc(
          dataSource.value,
          props.tableObj.needMergeArr,
          rowIndex,
          columnIndex,
          column
        );
  };

  // 合并行
  //参数:dataSource-表格数据,needMergeArr-需要进行合并计算的字段列表,rowIndex-当前行数,columnIndex-当前列数,column-当前列
  const spanMethodFunc = (
    dataSource = [],
    needMergeArr = [],
    rowIndex,
    columnIndex,
    column
  ) => {
    if (!needMergeArr.includes(column.property)) {
      // 根据传入的字段列表,判断不需要合并的列
      if (column.type === 'index' && dataSource && dataSource[rowIndex]) {
        // 判断是否从本行开始合并
        let merge = [needMergeArr[0]].some(item => {
          // 如果当前行所需要判断合并的字段中有一个跟前一条数据不一样,本条数据即为合并的起点,第一条数据直接为合并起点
          return (
            rowIndex == 0 ||
            (item && dataSource[rowIndex][item] != dataSource[rowIndex - 1][item])
          );
        });
        // 如果本条数据是合并起点,获取需要合并的数据条数
        if (merge) {
          let _list = dataSource.slice(rowIndex); //截取从本条数据开始的列表
          // 获取合并行数
          let _lineNum = _list.findIndex((item, index) => {
            //同merge判断,找到合并的终点
            return (
              index &&
              [needMergeArr[0]].some(item1 => {
                return item1 && item[item1] != _list[0][item1];
              })
            );
          });
          // 合并行数为-1时,输出_list的长度,否则输出_lineNum
          return [_lineNum === -1 ? _list.length : _lineNum, 1];
        } else {
          // 否则,返回[0,0],即本条数据被合并
          return [0, 0];
        }
      } else {
        return [1, 1];
      }
    } else {
      try {
        // 过滤出需要合并的当前列字段
        let _spanProps = needMergeArr.filter(item => item == column.property);
        // 判断是否从本行开始合并
        let merge = _spanProps.some(item => {
          // 如果当前行所需要判断合并的字段中有一个跟前一条数据不一样,本条数据即为合并的起点,第一条数据直接为合并起点
          return (
            rowIndex == 0 ||
            (item &&
              dataSource &&
              dataSource[rowIndex] &&
              dataSource[rowIndex][item] != dataSource[rowIndex - 1][item])
          );
        });
        // 如果本条数据是合并起点,获取需要合并的数据条数
        if (merge) {
          let _list = dataSource.slice(rowIndex); //截取从本条数据开始的列表
          // 获取合并行数
          let _lineNum = _list.findIndex((item, index) => {
            //同merge判断,找到合并的终点
            return (
              index &&
              _spanProps.some(item1 => {
                return item1 && item[item1] != _list[0][item1];
              })
            );
          });
          // 合并行数为-1时,输出_list的长度,否则输出_lineNum
          return [_lineNum === -1 ? _list.length : _lineNum, 1];
        } else {
          // 否则,返回[0,0],即本条数据被合并
          return [0, 0];
        }
      } catch (err) {
        console.error('spanMethodFunc error:', err);
      }
    }
  };

  const clearSelectRows = () => {
    props.tableObj.tableRef.clearSelection();
  };

  // 表格单元格内容后默认事件
  const defaultFunc = (row, col) => {
    if (col?.iconSvgClass == 'ic_copy_id') {
      tkClipboard.copy(row.id, '成功复制编号：' + row.id);
    } else {
    }
  };

  const summaryMethod = param => {
    const { columns, data } = param;
    const sums = [];
    columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = '合计';
        return;
      }
      const values = data.map(item => Number(item[column.property]));
      if (!values.every(value => !value || Number.isNaN(value))) {
        sums[index] = `${values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!Number.isNaN(value)) {
            return tkTools.formatterNumber2(prev + curr);
          } else {
            return prev;
          }
        }, 0)}`;
      } else {
        sums[index] = props.tableObj?.defaultSumObj?.[index] ?? '';
      }
    });

    return sums;
  };

  // 设置列宽度
  function shiftColWidth(colWidth) {
    const oldRootFontSize = 16;
    const newRootFontSize = window.getComputedStyle(document.documentElement).fontSize;

    if (!colWidth || newRootFontSize == '16px') return colWidth;
    // 先换算成 rem，再用新的根字体大小换回 px
    const rem = +colWidth / oldRootFontSize;
    return rem * parseFloat(newRootFontSize);
  }

  // 时间转换
  function getTime(val, formatVal) {
    if (val) {
      return (val + '').tkDateStringFormart(formatVal || 'yyyy-MM-dd');
    }
    return '';
  }

  // 更多条件是否有值
  let setComMoreSearchBtnType = computed(() => {
    // 普通的更多搜索数据
    let moreFormConfigs = props.searchFormObj?.formConfig.filter(_f => _f.drawer),
      moreFormData = {},
      moreFormFlag = false;
    moreFormConfigs?.forEach(_m => {
      let tempData = props.searchFormObj?.formData?.[_m.prop],
        arrIsBlank = false; // 数组是否有效数据

      // 处理数组类型（如多选、范围选择等）
      if (tempData instanceof Array && tempData.length > 0) {
        tempData.forEach(_t => {
          if (_t !== null && _t !== undefined && _t !== '') {
            arrIsBlank = true;
          }
        });
      }

      // 处理对象类型（如区域选择 rangeArea）
      if (tempData && typeof tempData === 'object' && !(tempData instanceof Array)) {
        // 检查对象中是否有有效值
        const hasValue = Object.values(tempData).some(val => {
          if (val instanceof Array) {
            return val.length > 0;
          }
          return val !== null && val !== undefined && val !== '';
        });
        if (hasValue) {
          moreFormData[_m.prop] = tempData;
          moreFormFlag = true;
        }
      }
      // 处理字符串类型
      else if (typeof tempData == 'string' && tempData.trim()) {
        moreFormData[_m.prop] = tempData;
        moreFormFlag = true;
      }
      // 处理数字类型（包括0）
      else if (
        typeof tempData == 'number' &&
        tempData !== null &&
        tempData !== undefined
      ) {
        moreFormData[_m.prop] = tempData;
        moreFormFlag = true;
      }
      // 处理数组类型
      else if (arrIsBlank) {
        moreFormData[_m.prop] = tempData;
        moreFormFlag = true;
      }
    });
    return moreFormFlag ? 'success' : '';
  });

  // 检查是否有 drawer 项有值（用于显示状态点）
  const hasDrawerValues = computed(() => {
    if (!props.searchFormObj?.formConfig || !props.searchFormObj?.formData) {
      return false;
    }
    const drawerConfigs = props.searchFormObj.formConfig.filter(_f => _f.drawer);
    const initFormData = props.searchFormObj.initFormData || {};

    return drawerConfigs.some(_m => {
      const tempData = props.searchFormObj.formData?.[_m.prop];
      const initValue = initFormData[_m.prop];

      // 如果值为 null 或 undefined，视为没有值
      if (tempData === null || tempData === undefined) {
        return false;
      }

      // 处理数组类型
      if (tempData instanceof Array) {
        if (tempData.length === 0) return false;
        // 检查数组中是否有有效值
        const hasValue = tempData.some(
          _t => _t !== null && _t !== undefined && _t !== ''
        );
        if (!hasValue) return false;
        // 如果初始值也是数组，比较是否与初始值相同
        if (initValue instanceof Array) {
          // 如果当前值与初始值相同，视为没有值
          if (
            JSON.stringify([...tempData].sort()) === JSON.stringify([...initValue].sort())
          ) {
            return false;
          }
        }
        return true;
      }

      // 处理对象类型（如区域选择 rangeArea）
      if (typeof tempData === 'object' && !(tempData instanceof Array)) {
        const hasValue = Object.values(tempData).some(val => {
          if (val instanceof Array) {
            return val.length > 0;
          }
          return val !== null && val !== undefined && val !== '';
        });
        if (!hasValue) return false;
        // 如果初始值也是对象，比较是否与初始值相同
        if (initValue && typeof initValue === 'object' && !(initValue instanceof Array)) {
          if (JSON.stringify(tempData) === JSON.stringify(initValue)) {
            return false;
          }
        }
        return true;
      }

      // 处理字符串类型
      if (typeof tempData === 'string') {
        const trimmed = tempData.trim();
        // 如果为空字符串，视为没有值
        if (trimmed.length === 0) return false;
        // 如果与初始值相同，视为没有值
        if (initValue === trimmed || initValue === tempData) return false;
        return true;
      }

      // 处理数字类型
      if (typeof tempData === 'number') {
        // 如果为 0，且初始值不是 0（可能是 undefined、null、空字符串或不存在），视为没有值
        if (tempData === 0) {
          // 如果初始值不存在、为 undefined、null、空字符串或不是数字，视为没有值
          if (
            initValue === undefined ||
            initValue === null ||
            initValue === '' ||
            typeof initValue !== 'number'
          ) {
            return false;
          }
          // 如果初始值也是 0，但当前值也是 0，视为没有值（没有变化）
          if (initValue === 0) {
            return false;
          }
        }
        // 如果与初始值相同，视为没有值
        if (tempData === initValue) return false;
        return true;
      }

      return false;
    });
  });
</script>

<style lang="less">
  .tableDrawer .cus-form .el-form--inline .form-item-con.inline-dom .el-form-item {
    margin-bottom: 12px !important;
  }

  .tableDrawer.el-drawer.ltr {
    width: 500px !important;
  }

  .table-auto {
    width: 100%;
    .tableMain {
      display: flex;
      flex-direction: column;
    }
    .tablePanel {
      flex: 1;
      /* 让表格区域占满中间剩余高度 */
      min-height: 0;
      /* 自身不滚动，由内部表格 body 滚动 */
      overflow: hidden;

      /* 让 el-table 作为中间 flex 区域，占满父容器高度 */
      .el-table {
        height: 100%;
        display: flex;
        flex-direction: column;

        .el-table__inner-wrapper {
          /* 强制不被内容撑开，只能是父盒子的高 */
          height: 100%;
          max-height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;

          .el-table__body-wrapper {
            flex: 1;
            min-height: 0;
          }
        }
      }
    }

    /*定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸*/
    ::-webkit-scrollbar {
      width: 4px !important;
      /*对垂直流动条有效*/
      height: 6px !important;
      /*对水平流动条有效*/
    }

    .el-table {
      *,
      .el-table__expand-icon {
        font-size: 14px !important;
      }

      .table-header-cell {
        background: #3282dc !important;
        color: white;
      }

      .opt-con {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 20px;
        box-sizing: border-box;
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

      .el-radio {
        margin: 0;

        .el-radio__label {
          padding: 0;
        }
      }

      .noData-icon {
        width: 150px;
        height: 150px;
      }

      .is-left {
        .cell {
          padding: 0 12px;
        }
      }

      .cell {
        padding: 0;
      }
    }

    .el-switch {
      margin-top: -2px;
    }

    .el-button-group {
      > * {
        padding-left: 6px;

        &:first-child {
          padding-left: 0;
        }
      }
    }

    .more-expanded {
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);
    }

    .cus-form {
      display: flex;

      form.el-form {
        flex: 1;
      }
    }
  }

  .el-popover.more-opt-con {
    min-width: 60px !important;
    padding: 0 !important;
    margin: 0 !important;

    .el-button {
      margin: 0;
      padding: 12px 20px;
      border-bottom: 1px solid #ebeef5;

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-disabled {
        border: none;
      }
    }
  }

  .cus-form {
    .el-form--inline {
      display: flex;
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .more-search-drawer {
    .el-form--inline {
      display: block;
    }
  }

  // 更多条件按钮样式
  .more-search-btn {
    position: relative;
    .more-search-btn-content {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .more-search-indicator {
      font-size: 24px;
    }
  }

  .table-auto .ic_columFilter {
    color: #3282dc;
    width: 20px;
    height: 20px;
  }

  .table-auto .el-table .el-tooltip__trigger {
    border: none !important;
  }
  .table-auto {
    // 表格顶部样式
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    &.no-top-padding-tbl .tbl-top-con {
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      .searchPanel {
        padding: 0 15px;
      }
    }
    &.no-padding-tbl .tbl-top-con {
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      .searchPanel {
        padding: 0;
      }
    }
    .tbl-top-con {
      padding: 0 10px 4px 10px;
    }

    .tablePanel {
      padding: 0;
    }
    .page-con {
      padding: 0 10px 10px 10px;
      box-sizing: border-box;
      border: 1px solid #dcdcdc;
      border-top: 1px solid transparent;
    }

    .tbl-top-con {
      // padding-top: 10px;
      .tbl-top-slot-con {
        padding-top: 10px;
        display: flex;
        & > .top-left {
          flex: 1;
        }
      }
      .tbl-top-init {
        margin-bottom: 4px;
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        padding-top: 10px;
        .searchPanel {
          flex: 1;
          display: flex;
          justify-content: space-between;
        }
        .RightLayout {
          align-items: center;
          .el-dropdown {
            margin-left: 8px;
          }
        }
      }
      .tbl-sort-con {
        display: flex;
        align-items: center;
      }
    }
  }

  .tableColumnSvg {
    cursor: pointer;
    margin-left: 5px;
  }
  .tagItem {
    display: inline-block;
    padding: 0 4px;
    border-radius: 2px;
    border: 1px solid #ccc;
  }
  .un-render-tbl-con {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .el-dialog .table-auto .tbl-top-con .tbl-top-init {
    padding-top: 0 !important;
  }
  .el-dialog .table-auto .tbl-top-con {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  // -------------- 最新风格样式 开始---------------------------
  .LatestStyle,
  #LatestStyle {
    .table-auto {
      height: 100%;
      background-color: #fff;
      .tableMain {
        height: 100%;
      }
      .tbl-top-con {
        padding: 0 10px 4px 10px;
      }
      .tablePanel {
        padding: 0;
      }
      .tableMain {
        padding: 0 10px;
      }
      .page-con {
        padding: 0 10px 10px 10px;
        box-sizing: border-box;
        border: 1px solid #dcdcdc;
        border-top: 1px solid transparent;
      }
      .el-table--striped {
        height: 100%;
        /* 由内部 body 区域滚动，这里不再滚动 */
        // overflow: hidden;

        // .el-table__inner-wrapper {
        //   /* 宽高都不超过父元素 */
        //   width: 100%;
        //   height: 100%;
        //   max-height: 100%;
        //   box-sizing: border-box;

        //   display: flex;
        //   flex-direction: column;

        //   .el-table__body-wrapper {
        //     flex: 1;
        //     /* 让表格主体占满中间剩余高度，内容超出时内部滚动 */
        //     min-height: 0;
        //   }
        // }
      }

      .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
        --el-fill-color-lighter: #f5f7fb;
      }

      .el-table {
        --el-table-text-color: #000;
        *,
        .el-table__expand-icon {
          font-size: 16px !important;
        }
        .table-header-cell {
          background: #f5f7fb !important;
          color: #000;
        }
        tbody {
          .el-table__cell {
            padding: 5.5px 0;
          }
        }
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

        .danger {
          color: #ff3600 !important;
          .tk-link {
            color: #ff3600 !important;
          }
        }
      }
    }

    .smallSize .table-auto .el-table .empty_div .empty_div_icon .text,
    .el-dialog .table-auto .el-table .empty_div .empty_div_icon .text {
      font-size: 16px !important;
    }
  }
  .LatestStyle .large_table > .table-auto .el-table tbody .el-table__cell,
  #LatestStyle .large_table > .table-auto .el-table tbody .el-table__cell {
    padding: 27px 0 !important;
  }
  // -------------- 最新风格样式 结束---------------------------
  .unPadding .table-auto .tbl-top-con .tbl-top-init,
  .unPadding .table-auto .tbl-top-con .tbl-top-slot-con {
    padding: 0;
  }
  .searchPanel {
    .el-form--inline
      .form-item-con.inline-dom
      .el-form-item
      .el-form-item__content
      .el-checkbox-group {
      padding-left: 15px;
      padding-right: 15px;
    }
  }
  .LatestStyle
    .el-dialog__body
    .table-auto
    .tableMain
    .el-table--striped
    .el-table__body-wrapper {
    max-height: 48vh;
    overflow-y: auto !important;
  }
  .LatestStyle
    .el-dialog__body
    .table-auto
    .tableMain
    .el-table--striped
    .el-table__body-wrapper
    .el-scrollbar__wrap--hidden-default {
    width: 101%;
  }

  .more-search-drawer-content {
    padding: 15px 20px;
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;

    // 优化滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }

    // 确保表单在抽屉中的间距
    .cus-form {
      padding: 0;
    }
  }

</style>
