<template>
  <div
    class="cus-form el-form el-form--inline"
    :class="'cus-form-' + styleType"
    v-if="isShowAttr"
  >
    <div
      :class="[
        'el-form-item',
        'asterisk-left',
        { 'is-required': attrData.mustFlag == '1' && !isSearch },
      ]"
    >
      <div
        class="el-form-item__label"
        :style="
          styleType !== 'card'
            ? {
                width:
                  labelWidth ||
                  calculatedTextWidth(attrData.attrName + (attrData.attrDesc || '')),
              }
            : {}
        "
      >
        {{ attrData.attrName }}
      </div>

      <div
        class="el-form-item__content"
        :class="styleType == 'card' ? 'card-content' : ''"
      >
        <!-- 0:文本 -->
        <el-input
          v-if="attrData.dataType == 0"
          v-model="attrData.attrValue"
          :placeholder="styleType == 'card' ? '请输入' : '请输入' + attrData.attrName"
          :style="{ width: inputWidth }"
          clearable
        ></el-input>
        <!-- 1:单选 -->
        <!-- 2:多选 -->
        <el-select
          v-if="attrData.dataType == 1 || attrData.dataType == 2"
          v-model="attrData.attrValue"
          :placeholder="styleType == 'card' ? '请选择' : '请选择' + attrData.attrName"
          :multiple="attrData.dataType == 2"
          :style="{ width: inputWidth }"
          allow-create
          clearable
        >
          <el-option
            v-for="(item, index) in attrData.subitemtypeAttrDataList"
            :key="index + 'subitemtypeAttrDataList' + item.id"
            :label="item.attrValue"
            :value="item.id"
          ></el-option>
        </el-select>
        <!-- 3:文件 -->
        <div v-if="attrData.dataType == 3">
          <div v-if="attrData?.defaultData?.length > 0">
            <ul class="file-item-box">
              <li
                v-for="fileItem in attrData?.defaultData"
                :key="fileItem.id"
                class="file-item"
              >
                <span class="tk-link" @click="handleDownloadFile(fileItem.id)">
                  <svg-icon
                    icon-class="ic_down_file"
                    style="margin-right: 8px"
                  ></svg-icon>
                  {{ fileItem.filename }}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="attrData.dataType == 4">
          <el-button
            type="primary"
            @click="openTree(attrData)"
            :style="{ width: inputWidth }"
          >
            选择{{ attrData.attrName }}
          </el-button>
          <AttrTree
            ref="treeRef"
            :itemData="itemData"
            :attrData="attrData"
            :showFullName="showFullName"
            :onlySelectLowestLevel="isSetConfigOnlySelectLowestLevel"
          ></AttrTree>
        </div>
        <!-- 5:数字 -->
        <div v-if="attrData.dataType == 5">
          <template v-if="attrData?.ruleConfigObj?.isSearch">
            <el-input-number
              v-model="attrData.attrValue[0]"
              :style="{ width: inputWidth / 1.5 }"
            ></el-input-number>
            至
            <el-input-number
              v-model="attrData.attrValue[1]"
              :style="{ width: inputWidth / 1.5 }"
            ></el-input-number>
          </template>

          <template v-else>
            <el-input-number
              v-model="attrData.attrValue"
              :style="{ width: inputWidth || '100%' }"
              :min="attrData.ruleConfigObj?.minNumber ?? undefined"
              :max="attrData.ruleConfigObj?.maxNumber ?? undefined"
              :precision="attrData.ruleConfigObj?.decimal ?? 0"
              :controls="false"
            ></el-input-number>
          </template>
        </div>
      </div>
    </div>
  </div>
  <div
    class="selecttree"
    v-if="attrData.dataType == 4 && attrData?.itemExpandAttrs?.length > 0"
  >
    <template
      v-for="(pointItem, pointIndex) in attrData?.itemExpandAttrs"
      :key="pointItem.id + pointIndex"
    >
      <div :class="['attr-selected-item']">
        <!--   pointItem.main === '1'
            ? 'attr-selected-item--main'
            : 'attr-selected-item--folder', -->
        <span class="attr-selected-text">
          <template v-if="showFullName">
            {{ attrData?.itemExpandAttrs[pointIndex].parentFullName }}
          </template>
          <template v-else>
            {{ attrData?.itemExpandAttrs[pointIndex].name }}
          </template>
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import AttrTree from './AttrTree';
  const props = defineProps({
    itemData: {
      type: Object,
      default: () => {},
    },
    attrData: {
      type: Object,
      default: () => {},
    },
    showFullName: {
      //显示全名
      type: Boolean,
      default: true,
    },
    labelWidth: String,
    inputWidth: String,
    isSearch: Boolean,
    // form-表单风格， card-卡片风格
    styleType: {
      type: String,
      default: 'form',
    },
    isSetConfigOnlySelectLowestLevel: {
      type: Boolean,
      default: false,
    },
  });

  const $treeName = ref('\u6811\u5f62');

  const treeRef = ref();

  const isShowAttr = computed(() => {
    // 文件类型=》搜索状态 需要隐藏文件类型
    if (props.attrData.dataType == 3) {
      return !props.isSearch;
    } else if (props.isSearch && props.attrData.searchFlag == '0') {
      return true;
    }

    return !props.isSearch;
  });

  const isSetConfigOnlySelectLowestLevel = computed(() => {
    if (props.isSetConfigOnlySelectLowestLevel) {
      return props.attrData.ruleConfigObj?.onlySelectLowestLevel;
    }

    return props.isSetConfigOnlySelectLowestLevel;
  });

  const calculatedTextWidth = word => {
    const wordWidth = word.length * 20;
    return wordWidth < 80 ? '5rem' : wordWidth > 240 ? '240px' : wordWidth + 'px';
  };

  const handleDownloadFile = id => {
    const param = { id: id };
    tkReq()
      .path('downFileCom')
      .param(param)
      .responseType('blob')
      .succ(res => {})
      .send();
  };

  function openTree(d) {
    treeRef.value.doComInit();
  }
</script>

<style lang="less" scoped>
  .selecttree {
    position: relative;
    margin-bottom: 8px;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid #dcdcdc;
    border-radius: 2px;

    .attr-selected-item {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%);
      width: 100%;
      padding: 0 8px;
      margin-bottom: 8px;
      line-height: 1.2;
      border-left: 3px solid rgba(3, 128, 255);
      border-radius: 2px;
      color: #000;
      font-size: 14px;
      box-sizing: border-box;

      &:last-child {
        margin-bottom: 0;
      }

      .attr-selected-text {
        flex: 1;
        word-break: break-all;
      }

      // &.attr-selected-item--main {
      //   border-left-color: #ef2626;
      // }
    }
  }

  // 卡片风格
  .cus-form-card {
    // display: inline-table;
    margin-bottom: 1.125rem !important;
    width: 100%;
    position: relative;
    margin: 10px 0 10px 0;
    border: 1px solid #dcdcdc;
    box-sizing: border-box;

    :deep(.el-form-item) {
      padding: 20px 10px 0 10px;
      box-sizing: border-box;
    }

    :deep(.el-form-item__label) {
      position: absolute;
      left: 10px;
      top: -16px;

      font-size: 14px;
      margin: 0 8px;
      padding-left: 4px;
      color: #0380ff;
      background-color: #fff;
    }
    :deep(.el-form-item__content.card-content) {
      width: 100% !important;
    }
  }
</style>
