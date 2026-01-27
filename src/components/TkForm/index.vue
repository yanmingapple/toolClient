<!-- components/Form/index.vue -->
<template>
  <div class="cus-form" :class="'cus-form-' + styleType">
    <el-form
      :class="[searchFormObj.formType === 'normal' ? 'dlg-form' : 'search-con']"
      :model="searchFormObj.formData"
      :rules="searchFormObj.rules"
      ref="ruleForm"
      :label-width="searchFormObj.labelWidth"
      :label-position="searchFormObj.labelPosition"
      :inline="isDrawer ? false : searchFormObj.inline"
      :validateOnRuleChange="searchFormObj.validateOnRuleChange"
      @submit.prevent
    >
      <div
        :class="[
          'form-item-con' + (searchFormObj.inline ? ' inline-dom' : ' block-dom'),
          item.type === 'labelLine' ? 'labelLine' : '',
          item.drawer === false ? 'show-card-item' : '',
          item.classStr,
        ]"
        v-for="(item, index) in searchFormObj.formConfig.filter(el => {
          if (isDrawer) return el.drawer;
          else return !el.drawer;
        })"
        :key="index + '_' + item.label"
      >
        <!-- 自定义内容 -->
        <template v-if="item.type === 'customize'">
          <slot :name="item.slotName" :item="item"></slot>
        </template>

        <!-- 操作按钮 -->
        <!-- <template v-if="item.type === 'slotName'">
          <slot :name="item.slotName"></slot>
        </template>-->
        <!-- { 'is-required': item.isRequiredClass } -->
        <template v-else>
          <el-form-item
            v-show="item.showFun ? item.showFun(item) : true"
            :class="(item.isRequiredClass ? 'is-required ' : '') + item.className"
            :label="
              (item.label ? item.label : '') +
              (!item.label || searchFormObj.hideColon ? '' : '：')
            "
            :prop="item.prop"
            :required="item.isRequired"
            v-if="
              !(
                item.hideItem ||
                (item.hiddenFun &&
                  typeof item.hiddenFun === 'function' &&
                  item.hiddenFun(item))
              )
            "
          >
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'input'"
              :autocomplete="item.autocomplete || 'new'"
              v-model.trim="searchFormObj.formData[item.prop]"
              :disabled="item.disabled"
              :style="{ width: item.width }"
              :maxlength="item.maxlength || 50"
              :placeholder="
                item.placeholder || `${item.label ? '请输入' + item.label : '请输入信息'}`
              "
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

            <TkRegionAreaPlus
              v-if="item.type === 'regionArea'"
              :style="{ width: item.width }"
              :gap="item.gap"
              v-model:areaRange="searchFormObj.formData[item.prop]"
            ></TkRegionAreaPlus>

            <el-input-number
              v-if="item.type === 'number'"
              :style="{ width: item.width }"
              v-model="searchFormObj.formData[item.prop]"
              :min="item.min"
              :max="item.max"
              :disabled="item.disabled"
              :placeholder="item.placeholder || ''"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
              :precision="item.precision ? item.precision : 0"
            ></el-input-number>

            <!-- 密码框 -->
            <el-input
              v-if="item.type === 'password'"
              type="password"
              :placeholder="item.placeholder || `请输入${item.label || ''}`"
              v-model.trim="searchFormObj.formData[item.prop]"
              :autocomplete="item.autocomplete || 'new-password'"
              :style="{ width: item.width }"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
              clearable
              show-password
              :show-word-limit="searchFormObj.showWordLimit && !item.hiddenWordLimit"
              :debounce="0"
              auto-complete="new-password"
            >
              <template #prefix>
                <i v-if="item.prevIcon" :class="'el-input__icon ' + item.prevIcon"></i>
              </template>
            </el-input>

            <el-autocomplete
              v-if="item.type === 'autocomplete'"
              v-model.trim="searchFormObj.formData[item.prop]"
              :fetch-suggestions="item.fetchSuggestions"
              :maxlength="item.maxlength || 50"
              :placeholder="item.placeholder || `请输入${item.label || ''}`"
              v-permission="item.permission || []"
              @select="item.handleSelect"
              style="width: 100%"
              :show-word-limit="searchFormObj.showWordLimit && !item.hiddenWordLimit"
            ></el-autocomplete>

            <!-- 文本域 -->
            <el-input
              v-if="item.type === 'textarea'"
              type="textarea"
              v-model="searchFormObj.formData[item.prop]"
              :disabled="item.disabled"
              :style="{ width: item.width }"
              :maxlength="item.maxlength || 200"
              :placeholder="
                item.placeholder ||
                `请输入${item.label || '备注'}   最多${
                  item.maxlength || 200
                }个字符(包括英文，汉字)`
              "
              :rows="item.rows"
              :show-word-limit="searchFormObj.showWordLimit && !item.hiddenWordLimit"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
            ></el-input>

            <!-- 下拉框 -->
            <template v-if="item.type === 'select'">
              <el-select
                :collapse-tags="item.collapseTags > 0"
                :max-collapse-tags="
                  typeof item.collapseTags === 'number' ? item.collapseTags : 2
                "
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
                v-permission="item.permission || []"
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
                    <el-button
                      v-if="btn.type == 'button'"
                      size="small"
                      type="primary"
                      @click="btn.func"
                    >
                      {{ btn.name }}
                    </el-button>
                  </template>
                </div>
              </template>
            </template>

            <div
              class="input-range-con"
              v-if="item.type === 'inputRange'"
              :style="{ width: item.width }"
            >
              <el-input-number
                class="editNum"
                :maxlength="3"
                v-model.number="searchFormObj.formData[item.prop][0]"
                :disabled="item.disabled"
                :step="item.step || 0.1"
                :max="item.max || 1"
                :min="item.min || 0"
                :precision="item.precision !== undefined ? item.precision : undefined"
                placeholder="起始值"
              ></el-input-number>
              <span class="input-range-separator-con">-</span>
              <el-input-number
                class="editNum"
                :maxlength="3"
                v-model.number="searchFormObj.formData[item.prop][1]"
                :disabled="item.disabled"
                :step="item.step || 0.1"
                :max="item.max || 1"
                :min="searchFormObj.formData[item.prop][0] || 0"
                :precision="item.precision !== undefined ? item.precision : undefined"
                placeholder="结束值"
              ></el-input-number>
            </div>
            <div
              class="select-range-con"
              v-if="item.type === 'selectRange'"
              :class="item.classStr"
              :style="{ width: item.width }"
            >
              <el-select
                v-model="searchFormObj.formData[item.prop][0]"
                :disabled="item.disabled"
                :clearable="item.clearable === false ? false : true"
              >
                <el-option
                  v-for="(option, oIndex) in item.optionsL"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                  :key="item.prop + oIndex + '_' + option.value"
                ></el-option>
              </el-select>
              <span class="select-range-separator-con">-</span>
              <el-select
                v-model="searchFormObj.formData[item.prop][1]"
                :disabled="item.disabled"
                :clearable="item.clearable === false ? false : true"
              >
                <el-option
                  v-for="(option, oIndex) in item.optionsR"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                  :key="item.prop + oIndex + '_' + option.value"
                ></el-option>
              </el-select>
            </div>

            <!-- 选择年份范围 -->
            <div
              v-if="item.type === 'yearRange'"
              :class="'year-range-con ' + item.classStr"
              :style="{ width: item.width }"
            >
              <el-date-picker
                type="year"
                v-model="searchFormObj.formData[item.prop][0]"
                :disabled="item.disabled"
                :value-format="item.valueFormat || 'YYYY'"
                :format="item.format || 'YYYY'"
                :placeholder="item.placeholder || '请选择开始年份'"
                :change="item.change"
              ></el-date-picker>
              <span class="year-range-separator-con">-</span>
              <el-date-picker
                type="year"
                v-model="searchFormObj.formData[item.prop][1]"
                :disabled="item.disabled"
                :value-format="item.valueFormat || 'YYYY'"
                :format="item.format || 'YYYY'"
                :placeholder="item.placeholder || '请选择结束年份'"
                :change="item.change"
              ></el-date-picker>
            </div>

            <el-tabs
              v-if="item.type === 'tab'"
              :type="item.tabType"
              v-model="searchFormObj.formData[item.prop]"
              @tab-click="item.change && item.change(searchFormObj.formData[item.prop])"
            >
              <el-tab-pane
                v-for="(option, tIndex) in item.options"
                :key="tIndex"
                :label="option.label"
                :name="option.value"
              ></el-tab-pane>
            </el-tabs>
            <!-- 单选框 -->
            <el-radio-group
              v-if="item.type === 'radio'"
              v-model="searchFormObj.formData[item.prop]"
              :disabled="item.disabled"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
            >
              <el-radio
                v-for="radio in item.radios"
                :value="radio.value"
                :key="radio.label"
              >
                {{ radio.label }}
              </el-radio>
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
                :value="checkbox.value"
                :key="checkbox.value"
                :style="{ width: item.curWidth || '40%' }"
              >
                {{ checkbox.label }}
              </el-checkbox>
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

            <!-- 选择时间 -->
            <el-date-picker
              v-if="item.type === 'datePicker'"
              :type="item.dateType || 'datetime'"
              v-model="searchFormObj.formData[item.prop]"
              :disabled="item.disabled"
              :style="{ width: item.width }"
              :value-format="item.valueFormat || 'YYYY-MM-DD HH:mm'"
              :format="item.format || 'YYYY-MM-DD HH:mm'"
              :placeholder="item.placeholder || '请选择日期时间'"
              :disabled-date="item.disabledDate"
              :range-separator="item.rangeSeparator || '-'"
              :start-placeholder="item.startPlaceholder || '开始日期时间'"
              :end-placeholder="item.endPlaceholder || '结束日期时间'"
              :shortcuts="item.shortcuts"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
            ></el-date-picker>

            <!-- 新的图片上传组件 -->
            <TkImageUpload
              v-if="item.type === 'newImageUpload'"
              v-model="searchFormObj.formData[item.prop]"
              :accept="item.accept"
              :multiple="item.multiple"
              :limit="item.limit"
              :max-size="item.maxSize"
              @change="item.handleChange"
            />

            <!-- 上传 -->
            <el-upload
              v-if="item.type === 'upload'"
              ref="uploadFile"
              :name="item.name || 'file'"
              :action="item.action || upLoadFileUrl"
              :data="item.data || { action: 'uploadimage' }"
              :accept="item.accept"
              :multiple="item.multiple || false"
              :limit="item.limit || 1"
              :show-file-list="item.showFileList || false"
              :on-success="item.handleSuccess"
              :on-change="item.handleFileChange"
              :before-upload="item.beforeUpload"
              :on-preview="item.handlePreview"
              :on-remove="item.handleRemove"
              :on-error="item.handleError"
            >
              <slot name="upload">
                <el-button size="small" type="primary" :loading="item.loading">
                  {{ item.text || '导入文件' }}
                </el-button>
              </slot>
            </el-upload>

            <ul
              v-if="item.type === 'uploadImgage'"
              class="el-upload-list el-upload-list--picture-card"
            >
              <li
                tabindex="0"
                class="el-upload-list__item is-success"
                v-for="(subItem, index) in searchFormObj.formData.oldImgFiles"
                :key="index"
              >
                <!-- 图片文件显示预览图 -->
                <img
                  v-if="isImageFile(subItem)"
                  :src="subItem.url"
                  alt
                  class="el-upload-list__item-thumbnail"
                />
                <!-- 非图片文件显示文件图标 -->
                <div v-else class="el-upload-list__item-thumbnail file-thumbnail">
                  <el-icon class="file-icon">
                    <Document />
                  </el-icon>
                </div>
                <a class="el-upload-list__item-name">
                  <i class="el-icon-document"></i>
                  {{
                    subItem.name ||
                    subItem.filename ||
                    subItem.tnetAttachment?.filename ||
                    subItem.fileName ||
                    '文件'
                  }}
                </a>
                <label class="el-upload-list__item-status-label">
                  <i class="el-icon el-icon--upload-success el-icon--check">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="currentColor"
                        d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"
                      />
                    </svg>
                  </i>
                </label>
                <i class="el-icon-close"></i>
                <span class="el-upload-list__item-actions">
                  <!-- 图片文件显示预览按钮 -->
                  <span
                    v-if="isImageFile(subItem)"
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(subItem)"
                  >
                    <i class="el-icon el-icon--zoom-in">
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill="currentColor"
                          d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704zm-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64h96z"
                        />
                      </svg>
                    </i>
                  </span>
                  <span class="el-upload-list__item-delete" @click="deleteOldPic(index)">
                    <i class="el-icon el-icon--delete">
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill="currentColor"
                          d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                        />
                      </svg>
                    </i>
                  </span>
                </span>
              </li>
            </ul>
            <el-upload
              v-if="item.type === 'uploadImgage'"
              ref="uploadImage"
              list-type="picture-card"
              style="display: inline"
              :accept="item.accept"
              :name="item.name || 'file'"
              action="#"
              auto-upload="true"
              :http-request="
                data => {
                  item.action(data);
                }
              "
              :data="item.data || { action: 'uploadimage' }"
              :on-success="item.handleSuccess"
              :on-change="item.handleFileChange"
              :before-upload="item.beforeUpload"
              :on-preview="handlePictureCardPreview"
              :on-remove="item.handleRemove"
              :on-error="item.handleError"
            >
              <i class="el-icon-plus"></i>
              <svg-icon class="ic_plus" icon-class="ic_plus"></svg-icon>
            </el-upload>

            <el-dialog :close-on-click-modal="false" v-model="dialogVisible" draggable>
              <img w-full style="width: 100%" :src="dialogImageUrl" alt />
            </el-dialog>

            <!-- 级联 -->
            <el-cascader
              v-if="item.type === 'cascader'"
              size="small"
              v-model="searchFormObj.formData[item.prop]"
              :options="item.options"
              :style="{ width: item.width }"
              @change="item.change && item.change(searchFormObj.formData[item.prop])"
              clearable
            ></el-cascader>
            <el-color-picker
              v-if="item.type === 'colorPicker'"
              v-model="searchFormObj.formData[item.prop]"
            ></el-color-picker>

            <!-- 操作按钮 -->
            <template v-if="item.type === 'slotName'">
              <slot :name="item.slotName" :configItem="item"></slot>
            </template>

            <!-- 线 -->
            <template v-if="item.type === 'labelLine'">
              <el-divider content-position="left">
                <svg-icon :icon-class="item.svgIcon || 'ic_text_editor'" />
                {{ item.title }}
              </el-divider>
            </template>

            <!-- 纯文字  -->
            <template v-if="item.type === 'text'">
              <label
                class="label-item"
                v-html="item.text || searchFormObj.formData[item.prop]"
              ></label>
            </template>

            <!-- 链接 -->
            <template v-if="item.type === 'link'">
              <el-link
                :underline="false"
                class="link-item"
                @click="item.clickHan && item.clickHan(searchFormObj.formData[item.prop])"
              >
                {{ item.text || searchFormObj.formData[item.prop] }}
              </el-link>
            </template>

            <div
              class="tableBtn-item"
              v-if="item.type === 'tableBtn'"
              style="width: 100%"
            >
              <TkTableBtn
                :tableBtnData="item.btnData"
                new-mode
                v-model:selectedList="item.btnData.selectedList"
                v-model:param="item.btnData.param"
              ></TkTableBtn>
            </div>

            <!-- 动态插槽 -->
            <template v-if="item.type === 'slot'">
              <slot :name="item.slot" :row="{ item }"></slot>
            </template>

            <!-- 表单元素后缀内容 -->
            <template v-if="item.suffixCon">
              <span class="suffix-con" v-html="item.suffixCon"></span>
            </template>
            <slot name="formItemSuffix"></slot>
          </el-form-item>
        </template>
      </div>
      <slot></slot>

      <slot name="search"></slot>
    </el-form>
    <div class="table-opt-btns">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
  import TkTableBtn from '@/components/TkTableBtn/index.vue';
  import TkRegionAreaPlus from './TkRegionAreaPlus/index.vue';
  import TkImageUpload from '@/components/TkImageUpload/index.vue';
  import { ref, nextTick, watch } from 'vue';
  import { Document } from '@element-plus/icons-vue';

  const props = defineProps({
    // 表单数据
    searchFormObj: {
      type: Object,
      required: true,
      default: () => {},
    },
    isDrawer: {
      type: Boolean,
      default: false,
    },
    // form-表单风格， card-卡片风格
    styleType: {
      type: String,
      default: 'form',
    },
  });
  const upLoadFileUrl = ref('SRV_UPLOAD');

  const ruleForm = ref(null);
  const uploadFile = ref(null);
  const uploadImage = ref(null);

  // 表单字段校验方法(自定义检验)
  const validateField = valid => {
    ruleForm.value.validateField(valid);
  };
  // 提交判断方法
  const submitForm = callback => {
    ruleForm.value.validate(valid => {
      callback(valid);
    });
  };
  // 重置方法
  const resetForm = () => {
    nextTick(() => {
      ruleForm.value.resetFields();
    });
  };

  //图片控件操作区域
  const dialogVisible = ref(false);
  const dialogImageUrl = ref('');

  // 清空校验
  const clearValidate = () => {
    nextTick(() => {
      ruleForm.value?.clearValidate();
    });
  };

  // props.searchFormObj.resetForm =()=>{

  //   nextTick(() => {
  //     ruleForm.value.resetFields()
  //   })

  // }
  props.searchFormObj.submitForm = callback => {
    submitForm(callback);
  };

  props.searchFormObj.clearValidate = () => {
    clearValidate();
  };

  //清除上传数据绑定
  props.searchFormObj.clearUploadFiles = () => {
    nextTick(() => {
      if (uploadFile.value && uploadFile.value.length > 0) {
        uploadFile.value.forEach(el => {
          el.clearFiles();
        });
      }
      if (uploadImage.value && uploadImage.value.length > 0) {
        uploadImage.value.forEach(el => {
          el.clearFiles();
        });
      }

      return false;
    });
  };
  // 判断是否为图片类型
  function isImageFile(file) {
    if (!file) return false;
    const fileName =
      file.name || file.filename || file.tnetAttachment?.filename || file.fileName || '';
    if (!fileName) return false;
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.svg',
      '.ico',
    ];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  //查看图片
  function handlePictureCardPreview(file) {
    dialogImageUrl.value = file.url;
    dialogVisible.value = true;
  }
  //删除老图片
  function deleteOldPic(index) {
    tkMessage.succ('文件删除成功！');
    props.searchFormObj.formData.fileUpdateFlag = 1;
    props.searchFormObj.formData.oldImgFiles.splice(index, 1);
  }
  //旧列表变化时候监控
  watch(
    () => props.searchFormObj.formData.oldImgFiles,
    () => {
      computedImageFileList();
    },
    { immediate: true, deep: true }
  );

  //新上传列表变化时候监控
  watch(
    () => props.searchFormObj.formData.picFileList,
    (newVal, oldVal) => {
      computedImageFileList();
    },
    { immediate: true, deep: true }
  );

  const getAddress = data => {};

  //重新计算图片列表
  function computedImageFileList() {
    //specialistFileList
    let oldImageFileLength = props.searchFormObj.formData.oldImgFiles
      ? props.searchFormObj.formData.oldImgFiles.length
      : 0;
    if (oldImageFileLength > 0) {
      props.searchFormObj.formData.oldImgFiles.forEach((item, index) => {
        item.sort = index + 1;
      });
    }

    //新图片列表
    let newImageFileLength = props.searchFormObj.formData.picFileList
      ? props.searchFormObj.formData.picFileList.length
      : 0;
    if (newImageFileLength > 0) {
      props.searchFormObj.formData.imageFileList = []; // TNetSpecialistFile
      props.searchFormObj.formData.fileUpdateFlag = 1;
      props.searchFormObj.formData.picFileList.forEach((item, index) => {
        if (item.response && item.response.ret && item.response.ret.tnetAttachment) {
          props.searchFormObj.formData.imageFileList.push({
            tnetAttachment: {
              filename: item.response.ret.tnetAttachment.filename,
              filenewname: item.response.ret.tnetAttachment.filenewname,
              filepath: item.response.ret.tnetAttachment.filepath,
              id: item.response.ret.tnetAttachment.id,
            },
            specialistId: props.searchFormObj.formData.id || null,
            fileId: item.response.ret.tnetAttachment.id,
            sort: index + oldImageFileLength + 1,
            creater: null,
            createTime: null,
          });
        }
      });
      props.searchFormObj.formData.imageFileList =
        props.searchFormObj.formData?.oldImgFiles?.concat(
          props.searchFormObj.formData.imageFileList
        );
    } else {
      if (oldImageFileLength > 0)
        props.searchFormObj.formData.imageFileList =
          props.searchFormObj.formData.oldImgFiles;
    }
  }

  defineExpose({
    validateField,
    submitForm,
    resetForm,
    clearValidate,
  });
</script>

<style lang="less" scoped>
  :deep(textarea) {
    resize: none;
  }
  .form-item-con {
    margin-bottom: 1rem;
  }

  .form-item-con:has(.tableBtn-item) .filter-content .el-form-item:has(.tableBtn-item) {
    margin-bottom: 5px;
  }
  :deep(.el-form-item__content) {
    text-align: left;
  }
  //:deep(.el-form-item__content > .el-input--suffix.el-input .el-input__inner) {
  //  padding-right: 32px;
  //}
  :deep(.el-date-editor) {
    box-sizing: border-box;
  }
  //:deep(.el-input--suffix.el-input.el-date-editor--date .el-input__inner) {
  //  padding-right: 32px;
  //}
  :deep(.link-item.el-link.el-link--default) {
    color: #3282dc;
    &:hover {
      color: #409eff;
    }
  }

  .el-dialog__body {
    .cus-form {
      padding: 15px 20px 15px 0;
    }
  }

  .cus-form {
    position: relative;
    //   min-height: 40px;
    :deep(.el-date-editor .el-range__icon) {
      margin-right: 4px;
    }
    :deep(.el-range-editor.el-input__wrapper) {
      padding-right: 6px;
    }
    :deep(.el-date-editor .el-range-input::placeholder) {
      font-size: 0.875rem;
    }
    :deep(.el-date-editor .el-range__close-icon) {
      margin-left: 4px;
    }
    .table-opt-btns {
      position: absolute;
      right: 0;
      top: 0;
    }
    .select-range-con {
      display: inline-block;
      .el-select {
        width: calc(50% - 10px);
      }
      .select-range-separator-con {
        width: 20px;
        display: inline-block;
        text-align: center;
      }
    }
    .input-range-con {
      display: inline-block;
      .el-input-number {
        width: calc(50% - 15px);
      }
      .input-range-separator-con {
        width: 30px;
        display: inline-block;
        text-align: center;
      }
    }
    .year-range-con {
      :deep(.el-date-editor--year) {
        width: calc(50% - 15px);
      }
      .year-range-separator-con {
        width: 30px;
        display: inline-block;
        text-align: center;
      }
    }
    .search-box {
      margin-bottom: 0;
    }

    :deep(.el-form--inline) {
      .form-item-con.inline-dom {
        margin-bottom: 0;
        .el-form-item {
          margin-bottom: 0;
          margin-right: 6px;
          display: flex;
          .el-form-item__content {
            flex: 1;

            .el-checkbox-group {
              padding-top: 10px;
              .el-checkbox {
                height: auto;
                align-items: stretch;
                margin-bottom: 12px;
                .el-checkbox__label {
                  word-break: break-all;
                  word-wrap: break-word;
                  white-space: pre-wrap;
                }
              }
            }
          }
        }
      }
    }
    .suffix-con {
      margin-left: 8px;
      color: #909399;
    }
  }

  // :deep(.el-upload--picture-card){
  //     width: 100px;
  //     height: 100px;
  //     line-height: 100px;
  // }

  // :deep(.el-upload-list--picture-card .el-upload-list__item){
  //     width: 100px;
  //     height: 100px;
  // }

  // 文件图标样式
  :deep(.el-upload-list--picture-card) {
    .file-thumbnail {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      width: 100%;
      height: 100%;

      .file-icon {
        font-size: 48px;
        color: #909399;
      }
    }
  }

  .ic_plus {
    color: #8c939d;
    width: 3em !important;
    height: 3em !important;
  }

  :deep(.labelLine .el-form-item__content) {
    margin-left: 0 !important;
  }

  :deep(.el-divider__text) {
    color: #409eff;
    font-weight: bold;
    font-size: 14px;
    padding: 0 10px;
  }

  :deep(.el-divider--horizontal) {
    border-color: rgba(106, 191, 253, 0.5);
    border-width: 1px;
  }

  // 卡片风格
  .cus-form-card {
    // display: inline-table;
    .form-item-con.show-card-item {
      width: 100%;
      position: relative;
      margin: 15px 0;
      border: 1px solid #dcdcdc;
      box-sizing: border-box;
      :deep(.el-form-item) {
        padding: 20px 6px 0 6px;
      }

      :deep(.el-form-item__label) {
        position: absolute;
        left: 10px;
        top: -16px;

        font-size: 14px;
        padding: 0 8px;
        color: #0380ff;
        background-color: #fff;
      }
    }
  }

  .label-item {
    font-size: 16px;
    color: #000;
    letter-spacing: 1.3px;
  }

  :deep(.el-form-item__content .el-date-editor.el-input) {
    width: 100%;
  }

  .el-checkbox-group {
    width: 100%;
    .el-checkbox {
      --el-checkbox-height: 28px;
    }
  }
</style>
