<template>
  <div class="AIEnter">
    <div class="AIEnter_title">
      <span class="art">AI题库小助手</span>
    </div>

    <div class="AIEnter_history_prompt" v-if="aiType === 'history'">
      <template v-if="aiHistoryList.length">
        <div
          class="AIEnter_history_prompt_item"
          v-for="(historyItem, historyIndex) in aiHistoryList"
          :key="
            historyItem.id + historyItem.time + '_historyItem_' + historyIndex
          "
        >
          <div class="AIEnter_history_prompt_item_title">
            <div>
              {{ historyItem.subjectName }}
              {{ historyItem.subjectItemTypeName }}
            </div>
            <div>{{ historyItem.time }}</div>
          </div>
          <div v-html="historyItem.content"></div>

          <div class="markdown_box" v-if="historyItem?.markdown">
            <div v-html="markedInstance(historyItem?.markdown)"></div>
          </div>
          <template v-if="historyItem?.questionItem">
            <ItemContent
              :aiItem="historyItem?.questionItem"
              :btnList="itemBtnList"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <div class="noData">暂无数据</div>
      </template>
    </div>

    <template v-else>
      <div class="load_main">
        <div class="load-container" v-if="isLoading">
          <div class="load load1"></div>
          <div class="load load2"></div>
          <div class="load"></div>
        </div>

        <div class="load_text art">
          {{
            isLoading
              ? "正在生成"
              : isStop
              ? "已停止"
              : processData
              ? "生成完成"
              : ""
          }}
        </div>
      </div>

      <div class="AIEnter_prompt" ref="processDataRef">
        <div v-html="processData"></div>

        <template v-if="!isLoading && !isStop">
          <div class="markdown_box" v-if="historyList[0]?.markdown">
            <div v-html="markedInstance(historyList[0]?.markdown)"></div>
          </div>
          <div class="markdown_box" v-else-if="historyList[0]?.questionItem">
            <ItemContent
              :aiItem="historyList[0]?.questionItem"
              :btnList="itemBtnList"
            />
          </div>
        </template>
      </div>

      <div class="AIEnter_footer" v-if="isLoading">
        <el-button type="primary" round @click="handleStop">停止生成</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineEmits, ref, watch, nextTick } from "vue";
import ItemContent from "@/components/TKAI/ItemContent";
import { marked } from "marked";
const props = defineProps({
  // 打印机效果文本
  processData: {
    type: [String, Array],
  },
  //   加载效果模拟
  isLoading: {
    type: Boolean,
    default: true,
  },
  //   ai历史 还是 实时ai
  aiType: {
    type: String,
    default: "sendQuestion",
  },
  //   历史信息
  historyList: {
    type: Array,
    default: () => [],
  },
  //   历史信息
  itemBtnList: {
    type: Array,
    default: () => [],
  },
});

const isStop = ref(false);
const processDataRef = ref(null);
const emits = defineEmits(["stop"]);

watch(
  () => props.isLoading,
  (val) => {
    if (val) {
      isStop.value = false;
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

function handleStop() {
  isStop.value = true;
  emits("stop");
}
// 创建带有选项的 marked 实例
const renderer = new marked.Renderer();
const options = {
  renderer,
  gfm: true, // GitHub Flavored Markdown (https://github.github.com/gfm/)
  breaks: true, // Convert '\n' in paragraphs into <br>
};

const markedInstance = marked.setOptions(options);

const convertMarkdown = ref(null);
const aiHistoryList = ref([]);
watch(
  () => props.historyList,
  (val) => {
    if (val?.length) {
      aiHistoryList.value = val;
    }
  },
  { deep: true, immediate: true }
);

// 滚动到最底下
async function scrollLastBottom() {
  await nextTick();
  if (processDataRef.value?.scrollHeight) {
    // 确保容器总是滚到底部
    processDataRef.value.scrollTop = processDataRef.value.scrollHeight;
  }
}

defineExpose({ scrollLastBottom });
</script>

<style lang="less" scoped>
.AIEnter {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  background: url("@/assets/imgs/tk_aiEnter_bg_1.png") no-repeat
    rgba(240, 248, 251, 0.8);
  background-size: 100% 100%;
  padding-top: 40px;
  &:hover {
    ::-webkit-scrollbar {
      opacity: 1 !important;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #eee !important;
      opacity: 1;
      visibility: visible;
    }
  }

  ::-webkit-scrollbar {
    width: 4px !important;
    height: 4px !important;
    opacity: 0;
    visibility: hidden;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #eee !important;
    opacity: 0;
    visibility: hidden;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent !important;
  }
  &_title {
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 3.5px;
    margin-bottom: 15px;
    .art {
      background: linear-gradient(to right, #1ba1d9, #7b4cf2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 20px;
    }
  }

  &_prompt {
    font-size: 16px;
    color: #333;
    letter-spacing: 1.3px;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 20px;
    width: 80%;
    border-radius: 10px;
    text-align: justify;
    height: calc(100vh - 340px);
    overflow: auto;
    margin-bottom: 20px;
  }
  &_footer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.load_main {
  display: flex;
  align-items: center;
  margin: 20px auto;
  .load-container {
    width: 70px;
    text-align: center;
    .load {
      width: 12px;
      height: 12px;
      background-color: #00adb5;

      border-radius: 100%;
      display: inline-block;
      -webkit-animation: bouncedelay 1.4s infinite ease-in-out;
      animation: bouncedelay 1.4s infinite ease-in-out;
      /* Prevent first frame from flickering when animation starts */
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
    }
    .load1 {
      -webkit-animation-delay: -0.32s;
      animation-delay: -0.32s;
    }
    .load2 {
      -webkit-animation-delay: -0.16s;
      animation-delay: -0.16s;
    }
  }

  .load_text {
    color: #00adb5;
    font-size: 16px;
    letter-spacing: 1.5px;
    font-weight: bold;
  }
}

@-webkit-keyframes bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}

@keyframes bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  40% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}

.AIEnter_history_prompt {
  font-size: 16px;
  color: #333;
  letter-spacing: 1.3px;
  background-color: rgba(255, 255, 255, 0.2);
  width: 80%;
  text-align: justify;
  height: calc(100vh - 250px);
  overflow: auto;

  &_item {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    border: 2px dashed #dfdfdf;
    &_title {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      background-color: rgba(247, 225, 194, 0.4);
      color: rgb(213, 139, 34);
      font-weight: bold;
    }
  }
  .noData {
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 24px;
  }
}

.markdown_box {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 8px 15px;
}
</style>
