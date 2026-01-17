<!--选择项目弹窗-->
<template>
  <tk-dialog :dlgObj="dlgData">
    <div class="SwitchProjectPop">
      <tk-table :tableObj="tbl" :searchFormObj="searchForm">
        <template #status="scope">
          <el-tag :type="statusMap[scope.row.status || 0].color">
            {{ statusMap[scope.row.status || 0].label }}
          </el-tag>
        </template>
      </tk-table>
    </div>
  </tk-dialog>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  const limitState = ref();
  // 弹窗
  let dlgData = reactive(useDlg());
  dlgData.width = '70rem';
  dlgData.isShowFooter = false;

  let statusMap = [
    { label: '待开始', color: 'success' },
    { label: '进行中', color: 'danger' },
    { label: '已结束', color: 'info' },
  ];

  //表格上方查询
  const searchForm = reactive(useForm());
  searchForm.inline = true;
  searchForm.formConfig = [
    {
      type: 'input',
      prop: 'searchKey',
      width: '12rem',
      placeholder: '请输入项目名称',
      hiddenWordLimit: true,
    },
    {
      type: 'select',
      prop: 'status',
      width: '12rem',
      showFun: () => {
        // 不限制状态时，显示状态选择
        return !limitState.value;
      },
      placeholder: '请选择状态',
      options: [
        { label: '待开始', value: 0 },
        { label: '进行中', value: 1 },
        { label: '已结束', value: 2 },
      ],
    },
  ];

  //表格数据
  const tbl = reactive(useTable());
  tbl.path = 'ApiGetProjectList';
  tbl.isLoading = false;
  tbl.height = '43vh';
  tbl.column = [
    { label: '序号' },
    { label: '命题项目', prop: 'name' },
    {
      label: '起止时间',
      prop: 'abortTimeString',
      width: 240,
      formatter: row => {
        if (row['startTime']) {
          return (
            (row['startTime'] + '').tkDateStringFormart('yyyy-MM-dd') +
            ' 至 ' +
            (row['abortTime'] + '').tkDateStringFormart('yyyy-MM-dd')
          );
        }
      },
    },
    { label: '备注信息', prop: 'description', minWidth: 60 },
    { label: '新建人员', prop: 'projectOpterName', minWidth: 60 },
    {
      label: '状态',
      prop: 'status',
      slot: 'status',
      width: 80,
    },
    {
      label: '操作',
      type: 'operations',
      width: 100,
      btnList: [
        {
          label: '选择',
          func: handleSwitch,
        },
      ],
    },
  ];

  tbl.search = () => {
    tbl.param.searchKey = searchForm.formData.searchKey;
    tbl.param.status = searchForm.formData.status;
    tbl.loadTable();
  };

  // ----------------- mehthod -------------------
  function handleSwitch(row) {
    if (callBack.value) {
      callBack.value(row);
    }

    dlgData.closeDlg();
  }

  //-------------------- 生命周期 ---------------------------
  const callBack = ref();

  function doComInit(_callBack, param = {}) {
    const { _limitState } = param;
    if (_limitState && !isNaN(_limitState)) {
      limitState.value = _limitState;
      searchForm.formData.status = _limitState;
    } else {
      limitState.value = null;
      searchForm.formData.status = 1;
    }
    dlgData.openDlg('选择项目');
    callBack.value = _callBack;
    tbl.search();
  }

  defineExpose({ doComInit });
</script>

<style lang="less" scoped></style>
