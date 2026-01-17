<template>
  <div class="aiItem">
    <div class="aiItem_header">
      <div class="aiItem_header_left">
        {{ aiItem.questionTypeName }}
      </div>

      <div class="aiItem_header_right">
        <div
          v-for="(btnItem, btnIndex) in btnList"
          :key="btnItem.label + '_aibtnItem_' + btnIndex"
          @click="btnItem.handleClick(aiItem)"
        >
          <div class="text">
            <svg-icon
              :class-name="btnItem.icon"
              :icon-class="btnItem.icon"
              :color="btnItem.color || '#3282dc'"
            ></svg-icon
            >{{ btnItem.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="aiItem_main">
      <div class="aiItem_main_content">
        {{ aiItem.content }}
      </div>
      <div
        class="aiItem_main_options"
        v-for="(optionItem, optionIndex) in aiItem.options"
        :key="
          optionItem.label + '_aiItem_main_options_' + optionIndex + new Date()
        "
      >
        {{ optionItem.label }}. {{ optionItem.value }}
      </div>

      <div class="correctAnswer">正确答案：{{ aiItem.answer }}</div>
      <div class="analysis">答案解析：{{ aiItem.analysis }}</div>
      <div class="knowledgePoints">
        知识点：<el-button
          v-for="(knowledgeItem, knowledgeIndex) in aiItem.knowledge_points"
          :key="
            knowledgeItem + '_knowledge_points_' + knowledgeIndex + new Date()
          "
          :disabled="true"
          >{{ knowledgeItem }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup name="TopicContent">
const props = defineProps({
  aiItem: {
    type: Object,
    default: () => {},
  },
  btnList: {
    type: Array,
    default: () => [],
  },
});
</script>

<style lang="less" scoped>
.aiItem {
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 15px;
  margin-bottom: 15px;

  &:hover {
    background-color: rgba(97, 147, 204, 0.1);
  }

  &_header {
    display: flex;
    justify-content: space-between;
    &_left {
      color: #999;
      font-size: 14px;
    }
    &_right {
      display: flex;

      & > div {
        margin-left: 20px;
        cursor: pointer;
        .text {
          font-size: 14px;
          color: #364c66;
          &:hover {
            color: #3282dc;
          }
          .svg-icon {
            width: 16px;
            height: 16px;
            margin-right: 4px;
          }
        }
      }
    }
  }

  &_main {
    color: #333;
    font-weight: bold;
    line-height: 32px;

    .correctAnswer {
      color: #34dba0;
    }
  }
}
</style>
