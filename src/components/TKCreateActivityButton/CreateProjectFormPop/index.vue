<template>
  <tk-dialog :dlgObj="dlgData">
    <tk-form ref="dlgForm" :searchFormObj="editorForm"></tk-form>
  </tk-dialog>
</template>

<script setup>
  import { ref, reactive } from 'vue';

  let callbackMethod = null;
  const dlgForm = ref(null); //表单Dom

  // 弹窗
  let dlgData = reactive(useDlg());
  dlgData.width = '40rem';
  // 提交弹窗,调用接口
  dlgData.handlerConfirm = () => {
    dlgForm.value.submitForm(valid => {
      if (valid) {
        let param = {
          name: editorForm.formData.name,
          startTime: editorForm.formData.dateRange[0] + ' 00:00:00',
          abortTime: editorForm.formData.dateRange[1] + ' 23:59:59',
          projectOpter: editorForm.formData.projectOpter,
          description: editorForm.formData.description,
        };
        let msg;
        if (editorForm.formData.id) {
          param['id'] = editorForm.formData.id;
          msg = '项目修改成功!';
        } else msg = '项目新建成功!';

        tkReq()
          .path('ApiEditProject')
          .param(param)
          .succ(res => {
            tkMessage.succ(msg);
            dlgData.closeDlg();
            callbackMethod && callbackMethod();
          })
          .send();
      } else {
        return false;
      }
    });
  };

  //表单初始结构
  const A_DAY_SECOND = 86400000,
    editorForm = reactive(useForm());

  editorForm.setFormData({
    name: '',
    dateRange: [],
    description: '',
  });
  editorForm.formConfig = [
    {
      label: '项目名称',
      prop: 'name',
      type: 'input',
      placeholder: '请输入项目名称',
    },
    {
      label: '起止时间',
      prop: 'dateRange',
      type: 'datePicker',
      dateType: 'daterange',
      rangeSeparator: '',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      shortcuts: [
        {
          text: '一周',
          value: () => {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
            return [start, end];
          },
        },
        {
          text: '二周',
          value: () => {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 14);
            return [start, end];
          },
        },
        {
          text: '三周',
          value: () => {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 24);
            return [start, end];
          },
        },
        {
          text: '半个月',
          value: () => {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 15);
            return [start, end];
          },
        },
        {
          text: '一个月',
          value: () => {
            const end = new Date();
            const start = new Date();
            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
            return [start, end];
          },
        },
      ],
      disabledDate: time => {
        if (editorForm.formData.abortTimeString)
          return (
            time.getTime() > new Date(editorForm.formData.abortTimeString).getTime() ||
            time.getTime() + A_DAY_SECOND <= Date.now()
          );
        else return time.getTime() + A_DAY_SECOND <= Date.now();
      },
    },
    {
      label: '备注信息',
      prop: 'description',
      type: 'textarea',
      placeholder: '请输入备注信息',
    },
  ];
  // 校验
  editorForm.rules = {
    name: [{ required: true, trigger: 'blur', message: '请输入项目名称' }],
    dateRange: [{ required: true, trigger: 'blur', message: '请选择起止日期' }],
    description: [
      { min: 0, max: 200, message: '长度在 0 到 200 个字符', trigger: 'blur' },
    ],
  };

  //-------------------- 生命周期 ---------------------------
  function doComInit({ assginFormData, callbackFunc }) {
    // 保存成功后的回调
    callbackMethod = callbackFunc;
    // 清空数据以及校验提示
    editorForm.resetFormData();
    // 编辑项目 赋值
    if (assginFormData?.id) {
      editorForm.formData.id = assginFormData.id;
      editorForm.formData.name = assginFormData.name;
      editorForm.formData.dateRange = [
        (assginFormData.startTime + '').tkDateStringFormart('yyyy-MM-dd'),
        (assginFormData.abortTime + '').tkDateStringFormart('yyyy-MM-dd'),
      ];
      editorForm.formData.description = assginFormData.description;
    }
    //  打开弹窗
    const title = assginFormData?.id ? '修改命题项目' : '新增命题项目';
    dlgData.openDlg(title);
  }

  defineExpose({ doComInit });
</script>

<style lang="less" scoped></style>
