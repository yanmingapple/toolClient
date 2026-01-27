<template>
  <div v-if="aiBtnList.length > 0">
    <div
      ref="container"
      class="draggable-button"
      :style="{
        left: draggableData.position.x + 'px',
        top: draggableData.position.y + 'px',
      }"
      @mousedown="startDrag"
      @mouseleave="hideBtnList"
      @click.stop="isShowBtnList = true"
    >
      <div>AI</div>

      <div class="btnList" v-if="isShowBtnList">
        <div
          class="btnList_item"
          v-for="(btnItem, btnIndex) in aiBtnList"
          :key="btnItem.value + '_btnItem_' + btnIndex"
          @click="btnItem.handleClick"
        >
          {{ btnItem.label }}
          <svg-icon
            class-name="ic_right"
            icon-class="ic_right"
            color="#1b1c21"
          ></svg-icon>
        </div>
      </div>

      <div class="icon">
        <svg-icon
          class-name="ic_AICompute"
          icon-class="ic_AICompute"
          color="#fff"
        ></svg-icon>
      </div>

      <!-- 背景区 -->
      <div v-if="isShowBtnList" class="overlay"></div>
    </div>

    <tk-drawer
      class="no-padding-body"
      :dlgObj="ProcessDlgControl"
      direction="ltr"
    >
      <ProcessDlg
        ref="ProcessDlgRef"
        :processData="processData"
        :historyList="historyList"
        :isLoading="isLoading"
        :aiType="aiType"
        :itemBtnList="itemBtnList"
        @stop="stopGenerate"
      ></ProcessDlg>
    </tk-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed,onMounted } from "vue";
import { formatQuestionList } from "@/components/TKAI/formatQuestion.js";
import ProcessDlg from "@/components/TKAI/ProcessDlg";
// ----------------------------- 变量 ------------------------------------------
const props = defineProps({
  aiFormData: {
    type: Object,
    defalut: () => {},
  },
});

const aiType = ref("sendQuestion"); //AISendQuestion出题 AISendQuestionHistory出题历史

// 控制createItemCom父组件的编辑器回显
const emits = defineEmits(["setFormData"]);

// 拖拽对象
const draggableData = reactive({
  isDragging: false,
  position: {
    x: 100, // 初始x坐标
    y: 100, // 初始y坐标
  },
});

// 显示悬浮按钮列表
const isShowBtnList = ref(false);
// 存储返回思考过程拼接字符串
let allText = "";
// 打字机效果显示和关闭
const isLoading = ref(false);
// 打字机效果显示字符串
const processData = ref("");
// 思考弹窗
const ProcessDlgRef = ref(null);
// 思考弹窗控制对象
const ProcessDlgControl = reactive(useDlg());
ProcessDlgControl.appendToBody = true;
ProcessDlgControl.destroyOnClose = true;
ProcessDlgControl.width = "40%";

// 思考历史存储列表
const historyList = ref([]);

// 悬浮按钮列表
const aiBtnList = computed(() => {
  const btnList = [];
  if(props.aiFormData.aiConfig?.aiItem){
  btnList.push( {
    label: "AI出题",
    value: "getQuestionByAI",
    handleClick: () => {
      aiType.value = "sendQuestion";
      startConversation();
      hideBtnList();
    },
  });
}


if(props.aiFormData.aiConfig?.aiGrammar){
  btnList.push(  {
    label: "语法纠错",
    value: "wordCorrection",
    handleClick: () => {
      aiType.value = "wordCorrection";
      startConversation();
      hideBtnList();
    },
  });
}
if(props.aiFormData.aiConfig?.aiDiff){
  btnList.push({
    label: "难度预估",
    value: "difficultyEvaluate",
    handleClick: () => {
      aiType.value = "difficultyEvaluate";
      startConversation();
      hideBtnList();
    },
  });
}
if(props.aiFormData.aiConfig?.aiTag){
  btnList.push({
    label: "打标签",
    value: "setLabel",
    handleClick: () => {
      aiType.value = "setLabel";
      startConversation();
      hideBtnList();
    },
  });
}

if(btnList.length >0){
  btnList.push({
    label: "AI记录",
    value: "getQuestionByAIHistory",
    handleClick: () => {
      aiType.value = "history";
      showHistory();
      hideBtnList();
    },
  })
}

  return btnList;
});

const itemBtnList = [
  {
    label: "应用",
    icon: "ic_edit",
    handleClick: (item) => {
      // 控制父页面显示编辑器内容
      emits("setFormData", item);
      ProcessDlgControl.closeDlg();
    },
  },
];
// ----------------------------- computed ------------------------------------------





// ----------------------------- methods ------------------------------------------
// 开始拖拽
function startDrag(event) {
  draggableData.isDragging = true;

  // 记录鼠标和按钮的偏移
  const offsetX = event.clientX - draggableData.position.x;
  const offsetY = event.clientY - draggableData.position.y;

  const onMouseMove = (event) => {
    if (draggableData.isDragging) {
      draggableData.position.x = event.clientX - offsetX;
      draggableData.position.y = event.clientY - offsetY;
    }
  };

  const onMouseUp = () => {
    draggableData.isDragging = false;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

// 隐藏下拉
function hideBtnList() {
  isShowBtnList.value = false;
}

// 设置思考打印机效果
const setProcessData = tkTools.debounce(() => {
  // 未停止&&未完成思考 赋值
  if ((!allText.includes("</details>") && !allText.includes("</think>")) && isLoading.value) {
    processData.value = allText;

    // 滚动到最底下
    ProcessDlgRef.value?.scrollLastBottom &&
      ProcessDlgRef.value.scrollLastBottom();
  }
}, 60,true);

// 停止思考
function stopGenerate() {
  isLoading.value = false;
}

// 查询字段
function formatQuery() {
  let queryStr = "";
  const attrList =
    props.aiFormData?.itemTypeAttrs?.map((ele) => {
      const attrName = ele.attrName;
      let value = "";
      if (+ele.dataType === 4) {
        value = ele?.attrValueContent?.join(" ") ?? "";
      } else if (+ele.dataType === 3) {
        value = "";
      } else if (+ele.dataType === 2) {
        value =
          ele.subitemtypeAttrDataList
            ?.filter((_c) => ele.attrValue?.includes(_c.id))
            ?.map((item) => item?.attrValue)
            ?.join(" ") ?? "";
      } else if (+ele.dataType === 1) {
        value =
          ele.subitemtypeAttrDataList?.find((_c) => _c.id === ele.attrValue)
            ?.attrValue ?? "";
      } else {
        value = ele.attrValue;
      }

      return value ? attrName + "：" + value : "";
    }) ?? [];

  const additionalAttributes = attrList?.filter((ele) => ele)?.join("；") ?? "";

  if (props.aiFormData.abilityLevelLabel) {
    queryStr = queryStr + `能力层次：${props.aiFormData.abilityLevelLabel}；`;
  }

  if (props.aiFormData.difficult) {
    queryStr = queryStr + `预估难度：${+props.aiFormData.difficult / 10}；`;
  }

  if (props.aiFormData.score) {
    queryStr = queryStr + `分值：${props.aiFormData.score}；`;
  }

  if (props.aiFormData?.selectedKnowledgePoint?.length) {
    const KnowledgePointPath =
      props.aiFormData?.selectedKnowledgePoint
        ?.map((ele) => ele.parentFullName)
        ?.join("、") ?? "";
    queryStr = queryStr + `知识点为：${KnowledgePointPath}；`;
  }

  return queryStr + additionalAttributes || "";
}

// 打开思考过程面板
function handleShowProcess() {
  const title =
    aiBtnList.value.find((ele) => ele.value === aiType.value)?.label ?? "AI思考过程";
  ProcessDlgControl.openDlg(title);
}
// ai出题
function startConversation() {
  if (!props.aiFormData?.subItemTypeId) {
    tkMessage.err("请选择题型！");
    return;
  }
  allText = "";
  processData.value = "";
  isLoading.value = true;
  let aiFormDataParams = {};
  if (aiType.value === "sendQuestion") {
    aiFormDataParams = {
      query: formatQuery() || "试题",
      subjectId: props.aiFormData.subjectId,
      itemTypeId: props.aiFormData.subItemTypeId,
      itemNum: 1,
    };
  } else {
    if (!props.aiFormData?.content) {
      tkMessage.err("请输入题干！");
      return;
    }
    const options =
      props.aiFormData?.options
        ?.filter((ele) => ele.content)
        ?.map((ele) => {
          return ele.name + ":" + getInnerHTML(ele.content);
        })
        ?.join(" ") ?? "";

    const contentInnerHTML = getInnerHTML(props.aiFormData?.content);
    const analysisInnerHTML = getInnerHTML(props.aiFormData?.analysis);

    aiFormDataParams = {
      query: `${contentInnerHTML ? "题干：" + contentInnerHTML : ""} ${
        options ? "选项：" + options : ""
      } ${
        props.aiFormData?.answer ? "答案：" + props.aiFormData?.answer : ""
      } ${analysisInnerHTML ? "解析：" + analysisInnerHTML : ""} `,
    };
  }

  const pathUrl =
    aiType.value === "sendQuestion"
      ? "aiAutoSetItemFlow"
      : aiType.value === "difficultyEvaluate"
      ? "difficultyEvaluate"
      : aiType.value === "setLabel"
      ? "setLabel"
      : "wordCorrection";

  try {
    handleShowProcess();
    tkReq()
      .path(pathUrl)
      .param(aiFormDataParams)
      .onMessage(async (data) => {
        console.log(data)
        if (data.type == "message") {
          // 返回拼接字符串
          allText = allText + data.answer;
          // 设置打印机效果内容
          setProcessData();
        } else if (data.type == "close") {
          // 完成思考处理
          if (isLoading.value) {
            const { list, othersContent ,markdown} =
              formatQuestionList(aiType.value,allText);
            processData.value = othersContent;
            const item = {
              time: new Date().format("yyyy/MM/dd HH:mm:ss"),
              content: othersContent,
              subjectName: props.aiFormData?.subjectName ?? "",
              subjectItemTypeName: props.aiFormData?.subjectItemTypeName ?? "",
              questionItem: list?.[0]??undefined,
              markdown,
            };
            // 存储历史记录
            historyList.value = [
              {
                ...item,
              },
              ...historyList.value,
            ];

            // 滚动条到最底下
            ProcessDlgRef.value?.scrollLastBottom &&
              ProcessDlgRef.value.scrollLastBottom();

            stopGenerate();
          }
        }
      })
      .onError(() => {
        stopGenerate();
      })
      .onClose(() => {
        tkMessage.succ("生成结束");
        stopGenerate();
      })
      .onOpen(() => {})
      .onOpenError((text) => {
        tkMessage.err(text);
        stopGenerate();
      })
      .sendStream();
  } catch (error) {
    console.log("🚀 ~ startConversation ~ error:", error);
    stopGenerate();
  }
}

function getInnerHTML(htmlStr) {
  if (!htmlStr) return "";
  // 使用 DOMParser 解析 HTML 字符串
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div class="htmlStr">${htmlStr}<div>`,
    "text/html"
  );
  if (!doc) return "";
  // 获取最外层 .htmlStr
  const outerParagraph = doc.querySelector(".htmlStr");
  if (!outerParagraph) return "";
  // 获取 .htmlStr的 innerHTML
  const contentInnerHTML = outerParagraph.textContent;
  let result = contentInnerHTML ? contentInnerHTML.replace(/\n/g, "") : "";
  return result;
}

// 显示历史列表
function showHistory() {
  const title =
    aiBtnList.value.find((ele) => ele.value === aiType.value)?.label ?? "AI思考过程";
  ProcessDlgControl.openDlg(title);
}

// ----------------------------- 生命周期 ------------------------------------------
// 设置按钮初始位置
onMounted(() => {
  //   拖拽按钮起始位置在右下角
  // draggableData.position.x = window.innerWidth - 100; // 右下角的初始位置
  // draggableData.position.y = window.innerHeight - 220;
  draggableData.position.x = window.innerWidth - 400; // 右下角的初始位置
  draggableData.position.y = 10;
});
</script>

<style lang="less" scoped>
.draggable-button {
  position: fixed;

  width: 56px;
  height: 56px;
  background: linear-gradient(
    to right,
    #0ea3f0,
    #3592e2,
    #5783d7,
    #6f79cf,
    #9871c9,
    #a960bd
  );
  border-radius: 50%;
  cursor: move;
  user-select: none; /* 禁止文本选择 */
  box-shadow: 0 0 20px rgba(20, 161, 238, 0.3), 0 0 40px rgba(20, 161, 238, 0.4); /* 荧光透白色阴影 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  letter-spacing: 1.3px;
  font-weight: bold;
  .icon {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.7),
      0 0 40px rgba(255, 255, 255, 0.5); /* 荧光透白色阴影 */
    position: absolute;
    right: -5px;
    top: -5px;
    width: 26px;
    height: 26px;
    background-color: rgba(20, 161, 238, 0.8);
    border-radius: 50%;
    .svg-icon {
      width: 100%;
      height: 100%;
    }
  }
}

.btnList {
  position: absolute;
  left: -150px;
  top: 0px;
  background-color: #f5faff;
  padding: 8px 10px;
  box-shadow: 0 0 10px rgba(20, 161, 238, 0.2), 0 0 20px rgba(20, 161, 238, 0.2); /* 荧光透白色阴影 */
  border-radius: 4px;
  z-index: 99;

  &_item {
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 120px;
    height: 36px;
    background: #ffffff;
    border: 0.8px solid rgba(160, 164, 187, 0.26);
    border-radius: 4px;
    padding-left: 13.51px;
    padding-right: 13.28px;
    margin-bottom: 4px;
    font-size: 14px;
    color: #1b1c21;
    letter-spacing: 1.5px;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: -140px;
  width: 200px;
  height: 90px;
  background: rgba(0, 0, 0, 0);
}
</style>
