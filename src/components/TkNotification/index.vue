<template>
  <div v-if="notificationData.visible" :class="`notification position_${positionMap[notificationData.position]||'top_right'} color_${notificationData.color} visible_${notificationData.panelOrButtonVisible}`">
    <div class="notification-tigger" @click="showHandler">
      <el-tooltip
        effect="dark"
        content="错误提示"
        placement="left-start"
        v-if="!notificationData.panelOrButtonVisible"
      >
        <div class="notification-tigger-box">
          <svg-icon class-name="notification-tigger-icon" :icon-class="'ic_check_warning'" />
        </div>
      </el-tooltip>

      <div v-else class="notification-tigger-box">
          <svg-icon class-name="notification-tigger-icon" :icon-class="notificationData.panelOrButtonVisible ? 'ic_close' : 'ic_check_warning'" />
        </div>
    </div>
    <div v-show="notificationData.panelOrButtonVisible" class="notification-main" :style="{width: notificationData.width || '400px',}">
      <div class="notification-main-title" v-html="notificationData.title +'('+notificationData?.list?.length+')' || '&nbsp;'"></div>
      <div class="notification-main-con show-scrollbar" :style="{height: notificationData.height || 'auto',}">
        <div v-for="(item, index) in notificationData.list" class="msg-item-box" :key="'no_'+index">
        <!--  @mouseover="hoverItemHandler(item, index, true)" @mouseout="hoverItemHandler(item, index, false)" -->
          <div class="msg-item" v-html="getMsgFunc(item, index)"></div>
          <div class="msg-btns" v-if="notificationData.showBtns">
            <el-link type="primary" :underline="false" @click="optHandler(item, index)"><svg-icon icon-class="ic_enter" /></el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive } from "vue";
import store from "@/store";
import { getTkNotificationConfig } from "@/store/tkStore";

const isExist = ref(false)
 , positionMap = {
  topLeft: 'top_left',
  topRight: 'top_right',
  bottomLeft: 'bottom_left',
  bottomRight: 'bottom_right',
 }
//  , panelOrButtonVisible = ref(true)//控制图标与面板切换
 ,notificationData = getTkNotificationConfig()

//  处理显示的内容
function getMsgFunc(item, index) {
  return notificationData?.value?.hideIndex ? item.msg : `${index+1}. ${item.msg}`
}
// 显示隐藏
function showHandler() {
    setTkNotificationConfig({
      panelOrButtonVisible: !notificationData.value.panelOrButtonVisible
    });
  // panelOrButtonVisible.value = !panelOrButtonVisible.value
}
// 点击按钮事件
function optHandler(item, index) {
  if(notificationData.value.optHander && notificationData.value.optHander instanceof Function) {
    notificationData.value.optHander(item, index)
  } else {
  }
}
</script>

<style lang="less" scoped>
.notification {
  position: fixed;
  z-index: 9999;
  &.position_top_left {
    top: 50px;
    left: 4px;
  }
  &.position_top_right {
    top: 50px;
    right: 4px;
  }
  &.position_bottom_left {
    bottom: 6px;
    left: 4px;
  }
  &.position_bottom_right {
    bottom: 6px;
    right: 4px;
  }

  &-tigger {
    text-align: right;
    &-box {
      display: inline-block;
      border: 1px solid #9bcdff;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
    }
    &-icon {
      width: 24px;
      height: 24px;
      padding: 8px;
      color: #409eff;
    }
  }
  &.color_red {
    .notification-tigger-box{
      border-color: #ed3f4b;
    }
    .notification-tigger-icon {
        color: #ee3545;
        &:hover {
        cursor: pointer;
        }
    } 
  }
  
  &.visible_true {
    .notification-tigger{
      position: absolute;
      right: 4px;
      top: 4px;
      transform-origin: 100% 0;
      transform: scale(0.8);
      &-box {
        border: none;
      }
      &-icon {
        color: #ee3545;
      }
    }
  }

  .notification-main {
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 0 2px 2px #efefef inset;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    &-title {
      font-size: 18px;
      font-weight: 600;
      padding: 10px 10px 5px;
      background-color: bisque;
      border-top-right-radius: 10px;
      border-top-left-radius: 10px;
    }
    &-con {
      max-height: 80vh;
      overflow: auto;
      margin-bottom: 10px;
      .msg-item-box {
        padding: 5px 10px 5px 1em;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-bottom: 1px solid #dcdfe6;
        &:last-of-type {
          border-bottom: none;
        }
        &:hover {
          background-color: #dfefff;
        }
        .msg-item {
          line-height: 1.5;
        }
        .msg-btns {
          margin-left: 4px;
        }
      }
    }
  }
}
</style>  
