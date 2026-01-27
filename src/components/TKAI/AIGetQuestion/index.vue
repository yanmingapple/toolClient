<template>
  <div class="AIGetQuestion-page">
    <div class="AIGetQuestion-form">
      <div class="AIGetQuestion-form_title">
        <div class="AIGetQuestion-form_title_icon">
          <svg-icon
            class-name="ic_ai"
            icon-class="ic_ai"
            color="#3282dc"
          ></svg-icon>
        </div>
        <div class="AIGetQuestion-form_title_text">Hi,欢迎使用AI出题</div>
      </div>

      <div class="AIGetQuestion-form_nav">
        <div
          :class="[
            'AIGetQuestion-form_nav_item',
            { isActive: currNavValue === navItem.value },
          ]"
          v-for="(navItem, navIndex) in navList"
          :key="`${navItem.value}_AIGetQuestion-form_nav_item_${navIndex}`"
          @click="navItem.handleClick(navItem)"
        >
          <div class="AIGetQuestion-form_nav_item_icon">
            <svg-icon
              :class-name="navItem.icon"
              :icon-class="navItem.icon"
              color="#3282dc"
            ></svg-icon>
          </div>
          <div class="AIGetQuestion-form_nav_item_text">
            {{ navItem.label }}
          </div>
        </div>
      </div>

      <el-form
        v-model="aiFormData"
        class="AIGetQuestion-form_main"
        size="large"
      >
        <el-form-item class="AIGetQuestion-form_main_title">
          <div class="AIGetQuestion-form_main_title_row">
            <div class="AIGetQuestion-form_main_title_col">
              <svg-icon
                class-name="ic_confirm"
                icon-class="ic_confirm"
                color="#375eed"
              ></svg-icon
              >出题范围
            </div>
            <div class="AIGetQuestion-form_main_title_col">
              <div
                class="selectButton"
                v-if="currNavValue === 'knowledgePoints'"
              >
                <svg-icon
                  class-name="ic_more"
                  icon-class="ic_more"
                  color="#8c67bf"
                ></svg-icon>
                选择知识点
              </div>
              <div class="selectButton" v-else-if="currNavValue === 'question'">
                <svg-icon
                  class-name="ic_more"
                  icon-class="ic_more"
                  color="#8c67bf"
                ></svg-icon>
                选择试题
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item style="margin-bottom: 30px">
          <el-input
            v-model="aiFormData.query"
            style="width: 100%"
            type="textarea"
            :rows="6"
            :placeholder="`${
              currNavValue === 'knowledgePoints'
                ? '请输入选择知识点 或者输入知识点'
                : '请选择试题 或者输入试题 '
            } `"
          />
        </el-form-item>

        <el-form-item class="AIGetQuestion-form_main_title">
          <svg-icon
            class-name="ic_setting"
            icon-class="ic_setting"
            color="#375eed"
          ></svg-icon>
          出题设置
        </el-form-item>

        <el-form-item label="题数" label-width="74px">
          <el-input-number
            v-model="aiFormData.itemNum"
            :controls="false"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>

        <el-form-item :label="$subjectName" label-width="74px">
          <el-select
            v-model="aiFormData.subjectId"
            :placeholder="`请选择${$subjectName}`"
            style="width: 100%"
            filterable
            @change="handleChangeSubject"
          >
            <el-option
              v-for="(item, index) in subjectList"
              :key="index + '_subjectKey_' + item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="题型" label-width="74px">
          <el-select
            v-model="aiFormData.itemTypeId"
            :placeholder="`请选择题型`"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="(item, index) in subjectItemTypes"
              :key="index + '_subjectItemTypeKey_' + item.id"
              :label="item.itemTypeName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="难度系数" label-width="74px">
          <el-input
            v-model="aiFormData.difficulty"
            clearable
            :placeholder="`请输入难度系数`"
            style="width: 100%"
          ></el-input>
        </el-form-item>
      </el-form>

      <div class="AIGetQuestion-form_btns">
        <div class="generate_btn" @click.stop.prevent="toGenerate">
          <div class="generate_btn_icon">
            <svg-icon
              class-name="ic_multipleStars"
              icon-class="ic_multipleStars"
              color="#fff"
            ></svg-icon>
          </div>

          <div class="generate_btn_circle" v-if="isLoading">
            <div class="generate_btn_circle_loader"></div>

            <!-- <div class="generate_btn_circle_square"></div> -->
          </div>

          <div>
            {{ isLoading ? "正在生成..." : "去生成" }}
          </div>
        </div>
      </div>

      <div class="AIGetQuestion-form_annotation">内容由AI生成 仅供参考</div>
    </div>

    <div class="AIGetQuestion_right">
      <div class="AIGetQuestion_right_container">
        <div class="AIGetQuestion_right_container_data" v-if="aiList.length">
          <div class="AIGetQuestion_right_container_data_header">
            <div class="AIGetQuestion_right_container_data_header_left">
              <div class="AIGetQuestion_right_container_data_header_left_icon">
                <svg-icon
                  class-name="ic_confirm"
                  icon-class="ic_confirm"
                  color="#3282dc"
                ></svg-icon>
              </div>

              <div class="AIGetQuestion_right_container_data_header_left_text">
                本次出题结果
              </div>
              <div class="AIGetQuestion_right_container_data_header_left_info">
                （ AI一共为您生成了<span class="emphasisOnColor">{{
                  aiList.length
                }}</span
                >道试题 ）
              </div>
            </div>

            <div class="AIGetQuestion_right_container_data_header_btns">
              <el-button round type="primary" plain @click="handleReset"
                >一键清空</el-button
              >
              <el-button round type="primary" @click="handleShowProcess"
                >思考过程</el-button
              >
            </div>
          </div>

          <div class="AIGetQuestion_right_container_data_main">
            <ItemContent
              v-for="(aiItem, aiIndex) in aiList"
              :key="aiItem.id + '_aiItem_' + aiIndex + new Date()"
              :aiItem="aiItem"
              :btnList="btnList"
            />
          </div>
        </div>

        <div class="AIGetQuestion_right_container_notData" v-else>
          <div class="load-container" v-if="isLoading">
            <div class="boxLoading"></div>
          </div>
          <div v-else class="ai_empty">
            <div class="ai_empty_svg">
              <svg-icon
                class-name="ic_gongxiangwenjianjia"
                icon-class="ic_gongxiangwenjianjia"
                color="#409eff"
              ></svg-icon>
            </div>
            <div class="ai_empty_text">AI出题</div>
            <div class="ai_empty_text_normal">智能出题，精准直达</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <tk-drawer class="no-padding-body" :dlgObj="ProcessDlgControl">
    <ProcessDlg
      ref="ProcessDlgRef"
      :processData="processData"
      :isLoading="isLoading"
      @stop="stopGenerate"
    ></ProcessDlg>
  </tk-drawer>
</template>

<script setup>
import ItemContent from "@/components/TKAI/ItemContent";
import { ref, reactive, computed, onBeforeMount } from "vue";
import ProcessDlg from "@/components/TKAI/ProcessDlg";
import { formatQuestionList } from "@/components/TKAI/formatQuestion.js";
import _, { update } from "lodash";

const aiType = ref("sendQuestion"); 

//  ------------------------ 变量 -------------------------
const $subjectName = tkGlobalData().value.subName;
const navList = [
  {
    label: "知识点出题",
    value: "knowledgePoints",
    icon: "ic_ai",
    handleClick: (item) => {
      const { value } = item;
      currNavValue.value = value;
      aiFormData.query = "";
      isLoading.value = false;
    },
  },
  {
    label: "以题出题",
    value: "question",
    icon: "ic_ai",
    handleClick: (item) => {
      const { value } = item;
      currNavValue.value = value;
      aiFormData.query = "";
      isLoading.value = false;
    },
  },
];
const btnList = [
  {
    label: "编辑",
    icon: "ic_edit",
    handleClick: handleAddQuestion,
  },
  {
    label: "删除",
    icon: "ic_delete",
    handleClick: (item) => {
      aiList.value = aiList.value.filter((ele) => ele.id !== item.id);
    },
  },
];
const aiList = ref([]); //ai试题列表
const processData = ref(""); //思考过程
const isLoading = ref(false); //加载状态
const ProcessDlgRef = ref(null); //

let allText = "";

// 科目列表
const subjectList = ref([]);

const aiFormData = reactive({
  subjectId: "",
  query: "",
  itemTypeId: "",
  itemNum: 1,
  difficulty: "",
});

// 选择出题方式
const currNavValue = ref("knowledgePoints");

//  ------------------------ computed -------------------------

// 当前科目item
const currSubjectItem = computed(() => {
  return subjectList.value?.find((ele) => ele.id === aiFormData.subjectId);
});

// 当前题型item
const subjectItemTypes = computed(() => {
  return currSubjectItem.value?.subjectItemTypes ?? [];
});
//  ------------------------ watch -------------------------

//  ------------------------ method -------------------------
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

// 在每次调用时进行数据初始化
function startConversation() {
  if (!aiFormData.subjectId) {
    tkMessage.err(`请选择${$subjectName}`);
    return;
  }
  if (!aiFormData.itemTypeId) {
    tkMessage.err("请选择题型！");
    return;
  }
  allText = "";
  aiList.value = [];
  isLoading.value = true;
  processData.value = "";
  try {
    aiFormData.query = aiFormData.query || "试题";
    handleShowProcess();

    const urlPath =
      currNavValue.value === "knowledgePoints"
        ? "aiAutoSetItemFlow"
        : "aiAutoChangeQuestion";

    tkReq()
      .path(urlPath)
      .param(aiFormData)
      .onMessage(async (data) => {
        if (data.type == "message") {
          allText = allText + data.answer;

          setProcessData();
        } else if (data.type == "close") {
          if (isLoading.value) {
            const { list, othersContent } = formatQuestionList(aiType.value,allText);
            aiList.value = list;
            processData.value = othersContent;
            stopGenerate();
          }
        }
      })
      .onError(() => {
        stopGenerate();
      })
      .onClose(() => {
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

function stopGenerate() {
  isLoading.value = false;
}

function handleReset() {
  stopGenerate();
  aiFormData.query = "";
  aiList.value = [];
}

function handleChangeSubject() {
  aiFormData.itemTypeId = subjectItemTypes?.value?.[0].id ?? "";
}

const emit = defineEmits(["callParentMethod"]);

function handleAddQuestion(item) {
  if (!aiFormData.subjectId) {
    tkMessage.err(`请选择${$subjectName}！`);
    return;
  }
  if (!aiFormData.itemTypeId) {
    tkMessage.err("请选择题型！");
    return;
  }
  const currSubjectItemTypesItem = subjectItemTypes.value.find(
    (ele) => ele.id === aiFormData.itemTypeId
  );

  const followAutoParams = {
    itemEntity: {
      itemContent: {
        nodeText: item.content,
      },
      itemOptions: {
        optionEntity:
          item.options?.map((ele) => {
            return {
              optionName: ele.label,
              optionContent: ele.value,
            };
          }) ?? [],
      },
      description: {
        nodeText: item.analysis,
      },
      answer: {
        nodeText: item.answer,
      },
    },
    subjectItemTypeRelationDetail: {
      subjectId: aiFormData.subjectId,
      subjectItemTypeRelationId: aiFormData.itemTypeId,
      subjectItemTypeName: currSubjectItemTypesItem.itemTypeName,
      itemTypeId: currSubjectItemTypesItem.itemTypeId,
      itemTypeSystemId: currSubjectItemTypesItem.systemItemTypeCode,
    },
  };

  tkReq()
    .path("checkQuestionByIntelligentEntry")
    .param(followAutoParams)
    .succ((res) => {
      const { ret = "" } = res;
      emit("callParentMethod", { questionId: ret, type: "open" }); // 触发父组件的方法
    })
    .send();
}

function onSuccess() {
  emit("callParentMethod", { type: "close" }); // 触发父组件的方法
  handleReset();
}

function toGenerate() {
  if (isLoading.value) {
    stopGenerate();
  } else {
    startConversation();
  }
}
const ProcessDlgControl = reactive(useDlg());
ProcessDlgControl.appendToBody = true;
ProcessDlgControl.destroyOnClose = true;
ProcessDlgControl.width = "40%";
function handleShowProcess() {
  ProcessDlgControl.openDlg("AI思考过程");
}

// 获取科目列表
function getSubjectListReq() {
  tkReq()
    .path("getSubjectAboutData")
    .param({ otherData: "subjectItemType,subjectItemTypeAttr,examSyllabus" })
    .succ((res) => {
      const { ret = [] } = res;
      const { subjects = [] } = ret;
      subjectList.value = subjects;
    })
    .send();
}

//  ------------------------ 生命周期 -------------------------
onBeforeMount(() => {
  // 获取科目列表
  getSubjectListReq();
});
</script>

<style lang="less" scoped>
@import "./AIGetQuestion.less";
</style>
