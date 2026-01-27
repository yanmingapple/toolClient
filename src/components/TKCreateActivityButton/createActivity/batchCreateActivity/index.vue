<template>
  <tk-sheet
    ref="mytksheet"
    :sheetConfig="sheetConfig"
    container="batchCreateActivityDiv"
  ></tk-sheet>
</template>
<script setup>
  import { ref, onBeforeUnmount, reactive, defineProps, nextTick } from 'vue';
  import TkSheet from '@/components/TkSheet';
  import { DanxuanConfig } from './excelTemp/danXuansheetTable.js';

  const sheetConfig = ref();
  const mytksheet = ref({});

  //mytksheet.value.destroySheet();

  let projectId;
  let subjectList = ref([]);

  const doComInit = async (_project, treeData) => {
    projectId = _project?.id;

    const { ret = [] } = await tkReq()
      .path('getSubjectListOfSel')
      .param({ delFlag: 0 })
      .noLoading()
      .send();
    subjectList.value =
      ret?.map(item => {
        return { value: item.id, label: item.name };
      }) ?? [];

    try {
      const danxuanConfig = new DanxuanConfig();
      sheetConfig.value = danxuanConfig.getData();
      const subjectLabelList = subjectList.value.map(_el => _el.label);

      // 安全检查：确保 data 数组存在且第一个元素存在
      if (!sheetConfig.value?.data || !Array.isArray(sheetConfig.value.data) || !sheetConfig.value.data[0]) {
        console.error('sheetConfig.data 结构不正确');
        return;
      }

      // 确保 dataVerification 存在，如果不存在则创建
      if (!sheetConfig.value.data[0].dataVerification) {
        sheetConfig.value.data[0].dataVerification = {};
      }
      let dataVerification = sheetConfig.value.data[0].dataVerification;

      // 确保 data 存在，如果不存在则创建
      if (!sheetConfig.value.data[0].data) {
        sheetConfig.value.data[0].data = [];
      }
      let dataList = sheetConfig.value.data[0].data;

      // 初始化30行空数据，并设置数据验证类型
      const initRowCount = 30;
      const activityTypeOptions = '分散命题,审题改题,抽题组卷,集中命题';
      const subjectOptions = subjectLabelList?.join(',') ?? '';

      // 获取项目的开始和结束时间，格式化为 YYYY-MM-DD
      const projectStartTime = _project?.startTime
        ? _project.startTime.replace(' 00:00:00', '').replace(' 23:59:59', '').split(' ')[0]
        : '';
      const projectEndTime = _project?.abortTime
        ? _project.abortTime.replace(' 00:00:00', '').replace(' 23:59:59', '').split(' ')[0]
        : '';

      // 获取科目列表的第一个科目作为默认值
      const defaultSubject = subjectLabelList?.length > 0 ? subjectLabelList[0] : '';

      // 设置日期验证的日期范围（设置一个很宽泛的范围，不限制具体日期）
      const minDate = '1900-01-01';
      const maxDate = '2099-12-31';

      // 初始化30行空数据
      for (let row = 1; row <= initRowCount; row++) {
        // 确保行数据存在
        if (!dataList[row]) {
          dataList[row] = [];
        }

        // 初始化空单元格（不填充内容，只创建结构）
        for (let col = 0; col < 6; col++) {
          if (!dataList[row][col]) {
            dataList[row][col] = {
              v: '',
              m: '',
              ct: { fa: 'General', t: 'g' },
            };
          }
        }

        // 只有第一行设置默认值
        if (row === 1) {
          // 设置默认的开始日期（第3列，索引3）
          if (projectStartTime) {
            dataList[row][3] = {
              v: projectStartTime,
              m: projectStartTime,
              ct: { fa: 'General', t: 'g' },
            };
          }

          // 设置默认的结束日期（第4列，索引4）
          if (projectEndTime) {
            dataList[row][4] = {
              v: projectEndTime,
              m: projectEndTime,
              ct: { fa: 'General', t: 'g' },
            };
          }

          // 设置默认的科目（第1列，索引1）
          if (defaultSubject) {
            dataList[row][1] = {
              v: defaultSubject,
              m: defaultSubject,
              ct: { fa: 'General', t: 'g' },
            };
          }
        }

        // 设置科目列（第1列，索引1）的下拉验证
        const subjectKey = `${row}_1`;
        if (!dataVerification[subjectKey]) {
          dataVerification[subjectKey] = {
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
        } else {
          dataVerification[subjectKey].value1 = subjectOptions;
        }

        // 设置命题模式列（第2列，索引2）的下拉验证
        const activityTypeKey = `${row}_2`;
        if (!dataVerification[activityTypeKey]) {
          dataVerification[activityTypeKey] = {
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
          dataVerification[activityTypeKey].value1 = activityTypeOptions;
        }

        // 设置开始日期列（第3列，索引3）的日期验证
        const startDateKey = `${row}_3`;
        if (!dataVerification[startDateKey]) {
          dataVerification[startDateKey] = {
            type: 'date',
            type2: 'bw', // 介于
            value1: minDate,
            value2: maxDate,
            checked: false,
            remote: false,
            prohibitInput: false,
            hintShow: false,
            hintText: '',
          };
        }

        // 设置结束日期列（第4列，索引4）的日期验证
        const endDateKey = `${row}_4`;
        if (!dataVerification[endDateKey]) {
          dataVerification[endDateKey] = {
            type: 'date',
            type2: 'bw', // 介于
            value1: minDate,
            value2: maxDate,
            checked: false,
            remote: false,
            prohibitInput: false,
            hintShow: false,
            hintText: '',
          };
        }
      }

      let index = 1;
      if (treeData?.length) {
        function loop(el) {
          //当前行数据有没有，没有创建
          if (!dataList[index]) {
            dataList[index] = [];
          }
          dataList[index][0] = { m: el.name, v: el.name, ct: { fa: 'General', t: 'g' } };
          dataList[index][1] = {
            m: el.subjectName,
            v: el.subjectName,
            ct: { fa: 'General', t: 'g' },
          };
          dataList[index][2] = {
            m: el.activityTypeName,
            v: el.activityTypeName,
            ct: { fa: 'General', t: 'g' },
          };
          dataList[index][3] = {
            m: el?.startTime?.replace(' 00:00:00', '') ?? '',
            v: el?.startTime?.replace(' 00:00:00', '') ?? '',
            ct: { fa: 'General', t: 'g' },
          };
          dataList[index][4] = {
            m: el?.endTime?.replace(' 23:59:59', '') ?? '',
            v: el?.endTime?.replace(' 23:59:59', '') ?? '',
            ct: { fa: 'General', t: 'g' },
          };
          dataList[index][5] = {
            m: el.description,
            v: el.description,
            ct: { fa: 'General', t: 'g' },
          };

          index++;
        }

        treeData.forEach((el, index) => {
          loop(el);
        });
      }

      sheetConfig.value.hook.workbookCreateAfter = book => {
        danxuanConfig.luckSheet = mytksheet.value.getLuckysheet();
      };

      await nextTick();
      mytksheet.value.buildOption();
    } catch (err) {
      console.log('🚀 ~ batchCreateActivity/index.vue - doComInit ~ err:', err);
    }
  };

  function doSubmit() {
    const ret = {
      succ: true,
      data: [],
    };

    // 安全检查：确保 mytksheet.value 存在
    if (!mytksheet.value) {
      tkMessage.warn('表格组件未初始化');
      ret.succ = false;
      return ret;
    }

    // 先完成当前编辑，确保获取到最新输入的数据
    mytksheet.value.finishEditing();

    const sheetData = mytksheet.value.getSheetData();
    if (!sheetData || sheetData.length <= 1) {
      tkMessage.warn('没有内容需要提交');
      ret.succ = false;
      return ret;
    }

    let isError = false;
    const hearder = sheetData[0];

    // 安全检查：确保 hearder 存在
    if (!hearder || !Array.isArray(hearder)) {
      tkMessage.warn('数据格式错误');
      ret.succ = false;
      return ret;
    }

    // 先清除所有数据行的批注，避免之前验证留下的错误提示残留
    // 安全检查：确保 mytksheet.value 存在且有 delComment 方法
    if (mytksheet.value && typeof mytksheet.value.delComment === 'function') {
      for (var i = 1; i < sheetData.length; i++) {
        // 清除所有需要验证的列的批注（0-4列）
        for (var col = 0; col <= 4; col++) {
          try {
            mytksheet.value.delComment(i, col);
          } catch (error) {
            // 忽略删除批注时的错误（可能批注不存在）
          }
        }
      }
    }

    for (var i = 1; i < sheetData.length; i++) {
      const data = sheetData[i];

      if (!data[0] || !data[0].m) {
        isError = true;
        mytksheet.value.insertComment(i, 0, `${hearder[0]?.m || '活动名称'}没有填写`);
      }

      const unHasSubject =
        subjectList.value.findIndex(_el => _el.label == data[1]?.m ?? '') < 0;
      if (!data[1] || !data[1].m) {
        isError = true;
        mytksheet.value.insertComment(i, 1, `${hearder[1]?.m || '科目'}没有填写`);
      } else if (unHasSubject) {
        isError = true;
        mytksheet.value.insertComment(i, 1, `${hearder[1]?.m || '科目'} 必须是下拉选项内的数据`);
      }

      if (!data[2] || !data[2].m) {
        isError = true;
        mytksheet.value.insertComment(i, 2, `${hearder[2]?.m || '命题模式'}没有填写`);
      } else if ('分散命题,审题改题,抽题组卷,集中命题'.indexOf(data[2].m) < 0) {
        isError = true;
        mytksheet.value.insertComment(i, 2, `${hearder[2]?.m || '命题模式'} 必须是下拉选项内的数据`);
      }

      if (!data[3] || !data[3].m) {
        isError = true;
        mytksheet.value.insertComment(i, 3, `${hearder[3]?.m || '开始日期'}没有填写`);
      }

      if (!data[4] || !data[4].m) {
        isError = true;
        mytksheet.value.insertComment(i, 4, `${hearder[4]?.m || '结束日期'}没有填写`);
      }
      // 只有在开始日期和结束日期都存在时才进行日期比较
      if (data[3]?.m && data[4]?.m) {
        const startDate = data[3].m.tkDate();
        const endDate = data[4].m.tkDate();
        // 确保 tkDate() 返回的不是 null
        if (startDate && endDate && endDate.getTime() - startDate.getTime() < 0) {
          isError = true;
          mytksheet.value.insertComment(i, 4, `开始日期必须小于等于结束日期`);
        }
      }
    }

    if (isError) {
      tkMessage.warn('请关注有错误提示的行');
      ret.succ = false;
      return ret;
    }

    const findActivityType = _name => {
      const data = tkEnumData.ALL_ACTTYPE_LIST_TYPE.find(_el => _el.label == _name);
      if (data) return data.value;
      return '';
    };

    let paramArray = [];
    for (var i = 1; i < sheetData.length; i++) {
      const data = sheetData[i];
      let newCurrData = {
        projectId: projectId,
        name: data[0]?.m ?? '',
        subjectId:
          subjectList.value.find(_el => _el.label == data[1]?.m ?? '')?.value ?? '',
        subjectName: data[1]?.m ?? '',
        activityType: findActivityType(data[2]?.m ?? ''),
        activityTypeName: data[2]?.m ?? '',
        startTime: data[3]?.m + ' 00:00:00',
        endTime: data[4]?.m + ' 23:59:59',
        description: data[5]?.m ?? '',
      };

      paramArray.push(newCurrData);
    }

    ret.data = paramArray;
    return ret;
  }

  function doSubmitTemp() {
    const ret = {
      succ: true,
      data: [],
    };

    // 安全检查：确保 mytksheet.value 存在
    if (!mytksheet.value) {
      return ret;
    }

    // 先完成当前编辑，确保获取到最新输入的数据
    mytksheet.value.finishEditing();

    const sheetData = mytksheet.value.getSheetData();
    if (!sheetData || sheetData.length <= 1) {
      return ret;
    }
    let paramArray = [];
    for (var i = 1; i < sheetData.length; i++) {
      const data = sheetData[i];
      let newCurrData = {
        projectId: projectId,
        name: data[0]?.m ?? '',
        subjectId:
          subjectList.value.find(_el => _el.label == data[1]?.m ?? '')?.value ?? '',
        subjectName: data[1]?.m ?? '',
        activityTypeName: data[2]?.m ?? '',
        startTime: data[3]?.m ? data[3]?.m + ' 00:00:00' : '',
        endTime: data[4]?.m ? data[4]?.m + ' 23:59:59' : '',
        description: data[5]?.m ?? '',
      };

      paramArray.push(newCurrData);
    }

    ret.data = paramArray;
    return ret;
  }

  defineExpose({ doComInit, doSubmit, doSubmitTemp });
</script>

<style lang="less" scoped></style>
