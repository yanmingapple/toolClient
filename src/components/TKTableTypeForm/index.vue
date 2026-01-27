<template>
  <el-form
    class="TKTableTypeForm"
    ref="TKTableTypeFormRef"
    :model="searchFormObj.formData"
    :rules="searchFormObj.rules"
    @submit.prevent
  >
    <el-form-item
      v-for="(item, index) in searchFormObj.formConfig"
      :key="index + '_' + item.label"
      label-class-name="TKTableTypeForm_label"
      :class="[{ 'is-required': item.isRequiredStyle }, item.className]"
      :prop="item.prop"
      :required="item.isRequired"
      :label="item.label"
    >
      <!-- 输入框 -->
      <el-input
        v-if="item.type === 'input'"
        :autocomplete="item.autocomplete || 'new'"
        v-model.trim="searchFormObj.formData[item.prop]"
        :disabled="item.disabled"
        :style="{ width: item.width }"
        :maxlength="item.maxlength || 50"
        :placeholder="item.placeholder || `${item.label ? '请输入' + item.label : '请输入信息'}`"
        @input="item.input && item.input(searchFormObj.formData[item.prop])"
        @change="item.change && item.change(searchFormObj.formData[item.prop])"
        clearable
        @keydown.enter.prevent
        :show-word-limit="searchFormObj.showWordLimit && !item.hiddenWordLimit"
      >
        <template #prefix>
          <i v-if="item.prevIcon" :class="'el-input__icon ' + item.prevIcon"></i>
        </template>

        <template #append v-if="item.appendIcon">
          <svg-icon
            :icon-class="'ic_' + item.appendIcon"
            class-name="mr10"
            style="cursor: pointer"
            @click="item.appendFun"
          ></svg-icon>
        </template>
      </el-input>

      <!-- 下拉框 -->
      <template v-if="item.type === 'select'">
        <el-select
          :collapse-tags="item.collapseTags > 0"
          :max-collapse-tags="typeof item.collapseTags === 'number' ? item.collapseTags : 2"
          :collapse-tags-tooltip="true"
          v-model="searchFormObj.formData[item.prop]"
          :allow-create="item.allowCreate"
          :filterable="item.filterable || item.allowCreate || !!item.remoteMethod"
          :remote="!!item.remoteMethod"
          :remote-method="item.remoteMethod"
          :loading="item.loading"
          :disabled="item.disabled"
          :multiple="item.isMultiple"
          :multiple-limit="item.multipleLimit"
          :style="{ width: item.width }"
          :class="item.classStr"
          :default-first-option="item.allowCreate"
          :placeholder="item.placeholder || `请选择${item.label || ''}`"
          @change="item.change && item.change(searchFormObj.formData[item.prop])"
          :clearable="item.clearable === false ? false : true"
          value-key="value"
        >
          <el-option
            v-for="(option, oIndex) in item.options"
            :label="option.label"
            :value="option.value"
            :disabled="option.disabled"
            :key="item.prop + oIndex + '_' + option.value"
          ></el-option>
        </el-select>

        <template v-if="item.btns && item.btns.length > 0">
          <div style="margin-left: 10px">
            <template v-for="(btn, btnIndex) in item.btns" :key="btnIndex">
              <el-button v-if="btn.type == 'button'" size="small" type="primary" @click="btn.func">{{
                btn.name
              }}</el-button>
            </template>
          </div>
        </template>
      </template>

      <!-- 单选框 -->
      <el-radio-group
        v-if="item.type === 'radio'"
        v-model="searchFormObj.formData[item.prop]"
        :disabled="item.disabled"
        @change="item.change && item.change(searchFormObj.formData[item.prop])"
      >
        <el-radio v-for="radio in item.radios" :label="radio.value" :key="radio.label">{{ radio.label }}</el-radio>
      </el-radio-group>

      <!-- 复选框 -->
      <el-checkbox-group
        v-if="item.type === 'checkbox'"
        v-model="searchFormObj.formData[item.prop]"
        :disabled="item.disabled"
        @change="item.change && item.change(searchFormObj.formData[item.prop])"
      >
        <el-checkbox
          v-for="checkbox in item.checkboxs"
          :label="checkbox.value"
          :key="checkbox.value"
          :style="{ width: item.curWidth || '40%' }"
          >{{ checkbox.label }}</el-checkbox
        >
      </el-checkbox-group>

      <!-- 开关 -->
      <el-switch
        v-if="item.type === 'switch'"
        v-model="searchFormObj.formData[item.prop]"
        :disabled="item.disabled"
        :active-text="item.activeTxt"
        :inactive-text="item.inActiveTxt"
        @change="item.change && item.change(searchFormObj.formData[item.prop])"
      ></el-switch>

      <el-input-number
        v-if="item.type === 'number'"
        :style="{ width: item.width }"
        v-model="searchFormObj.formData[item.prop]"
        :min="item.min"
        :max="item.max"
        :disabled="item.disabled"
        :placeholder="item.placeholder || ''"
        @change="item.change && item.change(searchFormObj.formData[item.prop])"
        :precision="item.precision ? item.precision : 2"
        :controls="false"
      ></el-input-number>

      <!-- 纯文字  -->
      <template v-if="item.type === 'text'">
        <label class="label-item" v-html="item.text || searchFormObj.formData[item.prop]"></label>
      </template>

      <!-- 链接 -->
      <template v-if="item.type === 'link'">
        <el-link
          :underline="false"
          class="link-item"
          type="primary"
          @click="item.clickHan && item.clickHan(searchFormObj.formData[item.prop])"
          >{{ item.text || searchFormObj.formData[item.prop] }}</el-link
        >
      </template>

      <!-- 动态插槽 -->
      <template v-if="item.type === 'slot'">
        <slot :name="item.slot" :row="{ item }"></slot>
      </template>
    </el-form-item>
  </el-form>
  <!-- 动态插槽 -->
  <slot name="rowSlot"></slot>
</template>

<script setup>
import { ref } from "vue";
const TKTableTypeFormRef = ref(null);
const props = defineProps({
  // 表单数据
  searchFormObj: {
    type: Object,
    required: true,
    default: () => {},
  },
});

// 表单字段校验方法(自定义检验)
const validateField = (valid) => {
  TKTableTypeFormRef.value.validateField(valid);
};

// 提交判断方法
const submitForm = (callback) => {
  TKTableTypeFormRef.value.validate((valid) => {
    callback(valid);
  });
};

// 重置方法
const resetForm = () => {
  nextTick(() => {
    TKTableTypeFormRef.value.resetFields();
  });
};

// 清空校验
const clearValidate = () => {
  nextTick(() => {
    TKTableTypeFormRef.value?.clearValidate();
  });
};

props.searchFormObj.submitForm = (callback) => {
  submitForm(callback);
};

props.searchFormObj.clearValidate = () => {
  clearValidate();
};

defineExpose({
  validateField,
  submitForm,
  resetForm,
  clearValidate,
});
</script>

<style lang="less">
.TKTableTypeFormUI,
.TKTableTypeForm.el-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 重复三次1fr */
  .el-form-item {
    height: 42px;
    margin-bottom: 0 !important;
    border: 1px solid #d8d8d8;
    border-top: none;
    &:nth-child(1),
    &:nth-child(2),
    &:nth-child(3) {
      border-top: 1px solid #d8d8d8;
    }
    .el-form-item__label {
      height: 100%;
      width: 200px;
      background: #f5f7fb;
      border-right: 1px solid #d8d8d8;
      line-height: 42px;
      justify-content: center;
      padding-right: 0;
    }
    .el-select__wrapper,
    .el-input__wrapper {
      border: none !important;
      box-shadow: none;
    }
    .el-radio-group {
      width: 100%;
      padding-left: 0.9375rem;
      padding-right: 0.9375rem;
    }
  }
}
</style>
