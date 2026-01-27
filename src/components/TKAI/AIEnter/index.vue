<template>
  <tk-drawer class="no-padding-body" :dlgObj="aiEnterDlg">
    <div class="AIEnter">
      <div class="AIEnter_main">
        <div class="AIEnter_main_title">
          <div class="AIEnter_main_title_left">
            <img :src="require('@/assets/imgs/tk_aiEnter_icon_1.png')" alt />
          </div>
          <div class="AIEnter_main_title_right">
            <div class="AIEnter_main_title_right_top">AI题库小助手</div>
            <div class="AIEnter_main_title_right_bottom">
              您好，欢迎来到AI题库小助手
            </div>
          </div>
        </div>

        <!-- <div class="AIEnter_main_prompt">请选择创建方式</div> -->
        <div class="AIEnter_main_nav">
          <div
            class="AIEnter_main_nav_item"
            v-for="(navItem, navIndex) in navList"
            :key="`${navItem.value}_AIEnter_nav_item_${navIndex}`"
            @click="navItem.handleClick"
          >
            <div class="AIEnter_main_nav_item_text">
              {{ navItem.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </tk-drawer>

  <tk-drawer class="no-padding-body" :dlgObj="AIGetQuestionDlg">
    <AIGetQuestion @callParentMethod="callMethod"></AIGetQuestion>
  </tk-drawer>
</template>

<script setup>
import { reactive, ref } from "vue";
import AIGetQuestion from "@/components/TKAI/AIGetQuestion";

const navList = ref([
  {
    label: "AI出题",
    value: "aiSendQuestion",
    icon: "ic_singlePaper",
    handleClick: () => {
      //   $push("/questions/AIGetQuestion");
      AIGetQuestionDlg.openDlg("AI出题");
    },
  },
  //   {
  //     label: "以题出题",
  //     value: "intelligentWriting",
  //     icon: "ic_collect",
  //     handleClick: () => {
  //       componentName.value = "intelligentWriting";
  //     },
  //   },
  {
    label: "试题AI打标签",
    value: "aiDetection",
    icon: "ic_label",
  },
  {
    label: "难度预测",
    value: "difficultyPrediction",
    icon: "ic_static",
  },
  {
    label: "公式识别",
    value: "formulaRecognition",
    icon: "ic_init",
  },
]);

const aiEnterDlg = reactive(useDlg());
aiEnterDlg.appendToBody = true;
aiEnterDlg.destroyOnClose = true;
aiEnterDlg.width = "100%";

const AIGetQuestionDlg = reactive(useDlg());
AIGetQuestionDlg.appendToBody = true;
AIGetQuestionDlg.destroyOnClose = true;
AIGetQuestionDlg.width = "100%";

let callMethod = null;
const doComInit = (callBack) => {
  callMethod = ({ questionId, type }) => {
    if (type == "open") {
      callBack(questionId);
    } else {

    }
  };

  aiEnterDlg.openDlg("AI题库小助手");
};

defineExpose({ doComInit });
</script>

<style lang="less" scoped>
.AIEnter {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background: url("@/assets/imgs/tk_aiEnter_bg_1.png") no-repeat;
  background-size: cover; /* 背景图像覆盖整个区域 */
  box-sizing: border-box;
  &_main {
    &_title {
      letter-spacing: 1.5px;
      margin-bottom: 12%;
      display: flex;
      align-items: center;
      &_left {
        img {
          width: 130px;
          height: 130px;
        }
      }
      &_right {
        &_top {
          font-weight: 600;
          font-size: 30px;
          color: #000000;
          line-height: 42px;
          margin-bottom: 10px;
        }
        &_bottom {
          font-size: 22px;
          color: #000000;
          line-height: 30px;
        }
      }
    }

    // &_prompt {
    //   font-size: 26px;
    //   line-height: 37px;
    //   color: #000000;
    //   margin-bottom: 64px;
    //   letter-spacing: 1.3px;
    // }
    &_nav {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* 定义 4 列 */
      gap: 29px; /* 网格间距 */
      padding-bottom: 10%;
      &_item {
        position: relative;
        width: 230px;
        padding: 177px 0 40px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 12px 17px 0 #a0c5fa4d;
        border-radius: 10px;
        font-weight: 600;
        font-size: 22px;
        color: #000000;
        line-height: 30px;
        background: linear-gradient(to bottom, #ffffff, #ffffff, #ecf1fa);
        border-bottom: 2px solid transparent;
        &::after {
          content: "";
          width: 220px;
          height: 220px;
          position: absolute;
          left: 50%;
          top: -63px;
          transform: translateX(-50%);
        }
        &:hover {
          &:first-child {
            color: #7b4cf2;
            border-bottom: 2px solid #7b4cf2;
          }
          &:nth-child(2) {
            color: #24a616;
            border-bottom: 2px solid #24a616;
          }
          &:nth-child(3) {
            color: #4176da;
            border-bottom: 2px solid #4176da;
          }
          &:nth-child(4) {
            color: #d0782a;
            border-bottom: 2px solid #d0782a;
          }
        }
        &:first-child {
          &::after {
            background: url("@/assets/imgs/tk_aiEnter_icon_2.png") no-repeat center center;
          }
        }
        &:nth-child(2) {
          &::after {
            background: url("@/assets/imgs/tk_aiEnter_icon_3.png") no-repeat center center;
          }
        }
        &:nth-child(3) {
          &::after {
            background: url("@/assets/imgs/tk_aiEnter_icon_4.png") no-repeat center center;
          }
        }
        &:nth-child(4) {
          &::after {
            background: url("@/assets/imgs/tk_aiEnter_icon_5.png") no-repeat center center;
          }
        }
      }
    }
  }
}
</style>
