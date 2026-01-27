<template>
  <tk-drawer :dlgObj="dlgData">
    <div class="content">
      <tk-sheet
        ref="mytksheet"
        :sheetConfig="sheetConfig"
        container="luckysheetDiv"
      ></tk-sheet>
    </div>
  </tk-drawer>
</template>
<script setup>
  import { ref, onMounted, onBeforeUnmount, reactive, defineProps, nextTick } from 'vue';
  import TkSheet from '@/components/TkSheet';
  import { DanxuanConfig } from './excelTemp/danXuansheetTable.js';

  const dlgData = reactive(useDlg());
  dlgData.appendToBody = true;
  dlgData.destroyOnClose = true;
  dlgData.width = '100%';
  const sheetConfig = ref();

  const mytksheet = ref({});

  dlgData.footer = true;
  dlgData.handlerCancel = () => {
    mytksheet.value.destroySheet();
  };

  // 命题模式选项
  const ACTIVITY_TYPES = ['分散命题', '审题改题', '抽题组卷', '集中命题'];

  // 验证单行数据
  const validateRow = (rowData, rowIndex, header) => {
    const errors = [];
    const getCellValue = colIndex => rowData[colIndex]?.m;

    // 验证活动名称
    if (!getCellValue(0)) {
      errors.push({ col: 0, msg: `${header[0].m}没有填写` });
    }

    // 验证科目
    if (!getCellValue(1)) {
      errors.push({ col: 1, msg: `${header[1].m}没有填写` });
    }

    // 验证命题模式
    const activityType = getCellValue(2);
    if (!activityType) {
      errors.push({ col: 2, msg: `${header[2].m}没有填写` });
    } else if (!ACTIVITY_TYPES.includes(activityType)) {
      errors.push({ col: 2, msg: `${header[2].m} 必须是下拉选项内的数据` });
    }

    // 验证开始日期
    if (!getCellValue(3)) {
      errors.push({ col: 3, msg: `${header[3].m}没有填写` });
    }

    // 验证结束日期
    const endDate = getCellValue(4);
    if (!endDate) {
      errors.push({ col: 4, msg: `${header[4].m}没有填写` });
    } else {
      // 验证日期逻辑：开始日期必须小于等于结束日期
      const startDate = getCellValue(3);
      if (startDate && endDate.tkDate().getTime() - startDate.tkDate().getTime() < 0) {
        errors.push({ col: 4, msg: `开始日期必须小于等于结束日期` });
      }
    }

    return errors;
  };

  // 构建提交数据
  const buildSubmitData = rowData => ({
    projectId: projectId,
    name: rowData[0]?.m ?? '',
    subjectName: rowData[1]?.m ?? '',
    activityTypeName: rowData[2]?.m ?? '',
    startTime: rowData[3]?.m + ' 00:00:00',
    endTime: rowData[4]?.m + ' 23:59:59',
    description: rowData[5]?.m ?? '',
  });

  dlgData.handlerConfirm = () => {
    // 先完成当前编辑，确保正在输入的单元格内容被保存
    mytksheet.value.finishEditing();

    // 等待编辑完成后再获取数据（使用 setTimeout 确保编辑操作完成）
    setTimeout(() => {
      const sheetData = mytksheet.value.getSheetData();
      if (sheetData.length <= 1) {
        tkMessage.warn('没有内容需要提交');
        return;
      }

      const header = sheetData[0];
      const dataRows = sheetData.slice(1);
      let hasError = false;

      // 先清除所有数据行的批注（清除之前验证留下的批注）
      dataRows.forEach((rowData, index) => {
        const rowIndex = index + 1;
        // 清除该行所有列的批注（0-5列）
        for (let col = 0; col <= 5; col++) {
          try {
            mytksheet.value.delComment(rowIndex, col);
          } catch (error) {
            // 忽略删除不存在的批注时的错误
          }
        }
      });

      // 验证所有行数据
      dataRows.forEach((rowData, index) => {
        const rowIndex = index + 1;
        const errors = validateRow(rowData, rowIndex, header);

        if (errors.length > 0) {
          hasError = true;
          errors.forEach(({ col, msg }) => {
            mytksheet.value.insertComment(rowIndex, col, msg);
          });
        }
      });

      // 如果验证通过，提交数据
      if (!hasError) {
        const paramArray = dataRows.map(buildSubmitData);

        tkReq()
          .path('batchCreateActivity')
          .param({
            projectId: projectId,
            data: paramArray,
          })
          .succ(res => {
            if (res?.ret?.length > 0) {
              // 先清除所有批注
              dataRows.forEach((rowData, index) => {
                const rowIndex = index + 1;
                for (let col = 0; col <= 5; col++) {
                  try {
                    mytksheet.value.delComment(rowIndex, col);
                  } catch (error) {
                    // 忽略删除不存在的批注时的错误
                  }
                }
              });
              // 添加服务器返回的错误批注
              res.ret.forEach(el => {
                mytksheet.value.insertComment(el.index + 1, 0, el.msg);
              });
            } else {
              // 验证通过且提交成功，清除所有批注
              dataRows.forEach((rowData, index) => {
                const rowIndex = index + 1;
                for (let col = 0; col <= 5; col++) {
                  try {
                    mytksheet.value.delComment(rowIndex, col);
                  } catch (error) {
                    // 忽略删除不存在的批注时的错误
                  }
                }
              });
              tkMessage.succ('批量创建成功');
              mytksheet.value.destroySheet();
              dlgData.closeDlg();
              succCallbackFun();
            }
          })
          .send();
      }
    }, 100);
  };

  let projectId, succCallbackFun;

  const openDlg = ({ projectData, subjectLabelList, callbackMethod }) => {
    projectId = projectData.id;
    succCallbackFun = callbackMethod;
    dlgData.openDlg('批量创建活动');
    const danxuanConfig = new DanxuanConfig();

    sheetConfig.value = danxuanConfig.getData();

    const dataVerification = sheetConfig.value.data[0].dataVerification;
    const subjectOptions = subjectLabelList.join(',');
    const activityTypeOptions = ACTIVITY_TYPES.join(',');

    // 设置第一行的下拉验证
    dataVerification['1_1'].value1 = subjectOptions;
    if (!dataVerification['1_2']) {
      dataVerification['1_2'] = {
        type: 'dropdown',
        type2: false,
        value1: activityTypeOptions,
        value2: '',
        checked: false,
        remote: false,
        prohibitInput: false,
        hintShow: false,
        hintText: '',
      };
    } else {
      dataVerification['1_2'].value1 = activityTypeOptions;
    }

    // 为至少30行设置下拉数据验证（科目列，索引为1；命题模式列，索引为2）
    const minRows = 30;
    const dataList = sheetConfig.value.data[0].data;

    // 计算日期：使用项目的开始和结束时间
    const startDate =
      typeof projectData.startTime === 'number'
        ? new Date(projectData.startTime)?.format('yyyy-MM-dd')
        : projectData.startTime?.tkDateStringFormart('yyyy-MM-dd') || '';
    const endDate =
      typeof projectData.abortTime === 'number'
        ? new Date(projectData.abortTime)?.format('yyyy-MM-dd')
        : projectData.abortTime?.tkDateStringFormart('yyyy-MM-dd') || '';

    // 获取默认值：科目和命题模式的第一个选项
    const defaultSubject = subjectLabelList[0] || '';
    const defaultActivityType = ACTIVITY_TYPES[0] || '';

    for (let i = 1; i <= minRows; i++) {
      // 确保行数据存在
      if (!dataList[i]) {
        dataList[i] = [null, null, null, null, null, null];
      }

      // 设置科目列（索引1）的下拉验证
      const subjectRowKey = `${i}_1`;
      if (!dataVerification[subjectRowKey]) {
        dataVerification[subjectRowKey] = {
          type: 'dropdown',
          type2: false,
          value1: subjectOptions,
          value2: '',
          checked: false,
          remote: false,
          prohibitInput: false,
          hintShow: false,
          hintText: '',
        };
      }

      // 设置命题模式列（索引2）的下拉验证
      const activityTypeRowKey = `${i}_2`;
      if (!dataVerification[activityTypeRowKey]) {
        dataVerification[activityTypeRowKey] = {
          type: 'dropdown',
          type2: false,
          value1: activityTypeOptions,
          value2: '',
          checked: false,
          remote: false,
          prohibitInput: false,
          hintShow: false,
          hintText: '',
        };
      }

      // 第一行填充默认数据，其他行不填充内容
      if (i === 1) {
        // 填充科目列（索引1）
        if (!dataList[i][1]) {
          dataList[i][1] = {};
        }
        dataList[i][1].v = defaultSubject;
        dataList[i][1].m = defaultSubject;

        // 填充命题模式列（索引2）
        if (!dataList[i][2]) {
          dataList[i][2] = {};
        }
        dataList[i][2].v = defaultActivityType;
        dataList[i][2].m = defaultActivityType;

        // 所有行都填充开始日期列（索引3）
        if (!dataList[i][3]) {
          dataList[i][3] = {};
        }
        dataList[i][3].v = startDate;
        dataList[i][3].m = startDate;
        dataList[i][3].ct = { fa: '@', t: 's' };

        // 所有行都填充结束日期列（索引4）
        if (!dataList[i][4]) {
          dataList[i][4] = {};
        }
        dataList[i][4].v = endDate;
        dataList[i][4].m = endDate;
        dataList[i][4].ct = { fa: '@', t: 's' };
      }
    }

    sheetConfig.value.hook.workbookCreateAfter = book => {
      danxuanConfig.luckSheet = mytksheet.value.getLuckysheet();
    };

    nextTick(() => {
      mytksheet.value.buildOption();
    });
  };
  defineExpose({ openDlg });
</script>

<style lang="less" scoped>
  .content {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 0.75rem);
    height: calc(100% - 0.75rem);
    box-sizing: border-box;

    .content_left {
      display: inline-block;
      width: 70%;
      height: 100%;
      box-sizing: border-box;
    }

    .content_right {
      border: 1px solid;
      width: 30%;
      margin-left: 1rem;
    }
  }
</style>
