/**
 * 表单hooks公用组件
 * 2023-3-16 闫明
 */
import { reactive, toRefs, nextTick } from 'vue';
export default function () {
  let formTemp = reactive({
    labelWidth: '7rem', //表单域标签的宽度
    labelPosition: 'right', // 表单域标签的位置
    validateOnRuleChange: false, //el中，改变校验规则后自动触发校验，我们不需要，故设置false
    formConfig: [], //表单配置
    formData: {}, //表单数据
    initFormData: {}, //初始化赋值表单元素数据
    rules: {}, //表单规则
    formType: 'normal',
    inline: false, //行内模式
    showWordLimit: true,
    submitForm: () => {},
    //构建表单配置数据
    buildFormConfig: (type = 'input', key = '', value = '', config = {}, index) => {
      if (type === 'tableBtn') {
        const newConfig = {
          prop: key,
          type: type,
          btnData: reactive(value),
        };
        //加入配置中
        formTemp.formConfig.push(newConfig);
        formTemp.formData[key] = '';
        return false;
      }

      let newConfig = {
        prop: key,
        type: type,
      };
      if (type == 'input') {
        Object.assign(newConfig, {
          label: '',
          width: '100%',
          placeholder: '',
        });
      } else if (type == 'checkbox') {
        Object.assign(newConfig, {
          label: '',
          width: '100%',
          checkboxs: [],
        });
      } else if (type == 'slot') {
        Object.assign(newConfig, {
          slot: key,
        });
      }

      //复制自定义配置信息
      Object.assign(newConfig, config);
      // index 添加的位置，如果大于总长度，则push到最后
      if ((index || index == 0) && index < formTemp.formConfig.length && index >= 0) {
        formTemp.formConfig.splice(index, 0, newConfig);
      } else {
        //加入配置中
        formTemp.formConfig.push(newConfig);
      }

      //表单数据
      formTemp.formData[key] = value;

      //返回对象，可用于修改
      return newConfig;
    },
    // 删除表单配置数据
    delFormConfig: props => {
      let tempFormConfig = [];
      formTemp.formConfig.forEach(item => {
        if (!props.includes(item.prop)) {
          tempFormConfig.push(item);
        }
      });
      formTemp.formConfig = tempFormConfig;
    },
    //表单赋值

    reset: () => {
      formTemp.resetFormData();
    }, //重置表单
    resetForm: null, //清楚表单校验
    clearValidate: () => {}, //清楚表单校验
    clearUploadFiles: () => {}, //清除表单中的上传控件
    //重置查询数据
    resetFormData: () => {
      for (var key in formTemp.formData) {
        const configItem = formTemp.formConfig?.find(_c => _c.prop === key);

        let type = typeof formTemp.formData[key];
        if (configItem && configItem.type == 'tableBtn') {
          configItem.btnData.selectedList = [];
        } else if (type == 'string') {
          formTemp.formData[key] = '';
        } else if (type == 'object' && formTemp.formData[key] instanceof Array) {
          formTemp.formData[key] = [];
        } else if (type == 'number') {
          if (configItem?.type === 'select') {
            formTemp.formData[key] = '';
          } else {
            formTemp.formData[key] = 0;
          }
        } else if (type == 'boolean') {
          formTemp.formData[key] = false;
        } else if (type == 'regionArea') {
          formTemp.formData[key] = { name: [], code: [] };
        } else if (type == 'uploadImgage') {
          formTemp.formData[key] = [];
        } else {
          formTemp.formData[key] = '';
        }
      }
      //清除上传组件
      formTemp.clearUploadFiles();

      //重新赋值，如果设置initFormData
      if (formTemp.initFormData) {
        //重新合并数据
        tkTools.merge(formTemp.initFormData, formTemp.formData);
      }

      //清除表单数据
      if (formTemp.resetForm) {
        formTemp.resetForm();
      }

      //清除表单校验
      if (formTemp.clearValidate) {
        nextTick(() => {
          formTemp.clearValidate();
        });
      }
    },
    setInitData: (spcProp, formConfig) => {
      let tempData = spcProp && spcProp instanceof Object ? { ...spcProp } : {};
      formConfig.forEach(_f => {
        if (_f && _f.prop) {
          if (_f.isMultiple) tempData[_f.prop] = [];
          else if (_f.type == 'number' || _f.dataType == 'number')
            tempData[_f.prop] = tempData[_f.prop] || undefined;
          else if (!(tempData[_f.prop] || tempData[_f.prop] === 0))
            tempData[_f.prop] = '';
        }
      });
      return { ...tempData };
    },
    //设置 表单数据 formData 和初始化的数据 initFormData
    setFormData: _formData => {
      formTemp.initFormData = _formData;
      formTemp.formData = tkTools.deepClone(_formData);

      for (const key in _formData) {
        if (!_formData[key]) {
          formTemp.formData[key] = _formData[key];
        }
      }
    },
    // 设置编辑的数据 需要编辑的行数据和表单的数据key值一直
    setEditData: curRow => {
      for (const key in formTemp.formData) {
        if (curRow[key]) {
          formTemp.formData[key] = curRow[key];
        }
      }
    },
    setInitFormData: spcProp => {
      formTemp.setFormData(formTemp.setInitData(spcProp || {}, formTemp.formConfig));
    },
    // 处理搜索数据
    dealParam: (param, spcCallback) => {
      for (const key in formTemp.formData) {
        const configItem = formTemp?.formConfig?.find(_c => _c.prop === key);
        if (configItem && configItem.type == 'tableBtn') {
          const value = configItem.btnData?.selectedList?.map(_c => _c.id) ?? [];
          if (value && value.length > 0) {
            formTemp.formData[key] = value;
          }
        } else if (formTemp.formData[key] && formTemp.formData[key] instanceof Array) {
          param[key] = formTemp.formData[key].join(',');
        } else {
          param[key] = formTemp.formData[key];
        }
      }
      if (spcCallback && spcCallback instanceof Function) spcCallback();
    },
    dealFormConfig: ({ prop, newValue, key = 'options' }) => {
      if (!prop) return '';
      const index = formTemp.formConfig.findIndex(ele => ele.prop === prop);
      if (index > 0) {
        formTemp.formConfig[index][key] = newValue;
      }
    },
    succ: () => {},
  });

  return { ...toRefs(formTemp) };
}
