<template>
  <!-- 全屏遮罩 -->
  <div v-if="!isOnline" class="network-overlay">
    <!-- 网络异常信息卡片 -->
    <div class="network-status">
      <div><svg-icon class-name="ic_404" icon-class="ic_404" /></div>
      <div>
        <div class="warn_text">网络已断开，请检查您的连接。</div>
        <div class="normal_text">请检查网络，可"重新连接"检查网络</div>

        <div v-show="countDownSecond > 0" class="connect_btn" @click="handleClickReconnect">
          重新连接（{{ countDownSecond }}S）
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import tkSocket from "@/utils/tkSocket";
import { ref, computed, watch, onMounted, onBeforeMount, nextTick, watchEffect } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const isOnline = ref(true);
let heartbeatInterval = null;
const countDownSecond = ref(10);
const initialSeconds = ref(30);

watch(
  () => isOnline.value,
  (val, oldValue) => {
    if (oldValue === false && val === true){
      if(route.name != "login"){
        //   重新登录
        loginReq();
      }else{
        clearHeartbeat();
      }
    }
  }
);

watchEffect(async () => {
  if (!route.name) return;
  
  // if(route.name == 'login'){
  //   debugger
  //   isOnline.value = true;
  //   clearHeartbeat();
  //   return;
  // }
  await nextTick();

  const sessionLoginData = localStorage.getItem("sessionLoginData")
    ? JSON.parse(localStorage.getItem("sessionLoginData"))
    : {};
  if(sessionLoginData.isOnline){
    return;
  }
  initialSeconds.value = 30;
  // 初始倒计时 1.登录页面 10s   2.考试中页面30s
  countDownSecond.value = initialSeconds?.value ?? 30;
  tkReq()
    .path("heartbeat")
    .noLoading()
    .errNetWork(false)
    .succ((res) => {
      isOnline.value = !!(res?.code == "000000" ?? "");
      localStorage.setItem(
        "sessionLoginData",
        JSON.stringify({
          ...sessionLoginData,
          isOnline: isOnline.value,
        })
      );
    })
    .err((err) => {
      isOnline.value = false;
      localStorage.setItem(
        "sessionLoginData",
        JSON.stringify({
          ...sessionLoginData,
          isOnline: isOnline.value,
        })
      );
       startHeartbeat();
    })
    .send();

 
});

function loginReq() {
  const sessionLoginData = localStorage.getItem("sessionLoginData")
    ? JSON.parse(localStorage.getItem("sessionLoginData"))
    : {};

  const paramObj = {
    loginName: sessionLoginData.loginName,
    password: sessionLoginData.encryptedPassword,
  };

  tkReq()
    .path("login")
    .param(paramObj)
    .succ((res) => {
      localStorage.setItem(
        "sessionLoginData",
        JSON.stringify({
          ...sessionLoginData,
          hasResetPw: res.ret.hasResetPw,
          userName: res.ret.userName,
          userId: res.ret.id,
          isOnline: isOnline.value,
          token:res.ret.token
        })
      );
    })
    .send();
}

function startHeartbeat() {
  clearHeartbeat();

  //   倒计时
  heartbeatInterval = setInterval(async () => {
    // FIX:由于setInterval是个异步的，tkReq封装接口不可使用同步，所以只能暂时使用isFirst变量，让接口只触发一次。
    if (countDownSecond.value < 30 && countDownSecond.value %5==0) {
      tkReq()
        .path("heartbeat")
        .noLoading()
        .errNetWork(false)
        .succ((res) => {
          isOnline.value = !!(res?.code == "000000" ?? "");
          countDownSecond.value = initialSeconds.value;
        })
        .err((err) => {
          isOnline.value = false;
        })
        .send();
    }
    if(countDownSecond.value==0){
      countDownSecond.value = initialSeconds.value;
    }
    countDownSecond.value = countDownSecond.value - 1;
  }, 1000);
}

function clearHeartbeat() {
  heartbeatInterval && clearInterval(heartbeatInterval);
  heartbeatInterval = null;
  // 这里需要重新赋值
  let loginUserInfo = JSON.parse(localStorage.getItem("sessionLoginData"));
  if(loginUserInfo){
    tkSocket.userInfo = {
      userId:loginUserInfo.userId,
      userName:loginUserInfo.userName
    }
  }
  console.log("socket连接成功后，关闭心跳heartbeatInterval")
}

function handleClickReconnect() {
  countDownSecond.value = -1;
}

onMounted(() => {
  if(tkSocket){
    tkSocket.open = ()=>{
      if(isOnline.value){
        console.log("打开连接后，关闭clearHeartbeat")
        clearHeartbeat();
      }
    }

    tkSocket.close = (isNetWorkError)=>{
      if(isOnline.value){
        if(isNetWorkError || route.name != "login"){
          isOnline.value = false;
          startHeartbeat();
        }else{
          isOnline.value = true;
        }


        const sessionLoginData = localStorage.getItem("sessionLoginData")
        ? JSON.parse(localStorage.getItem("sessionLoginData"))
        : {};
        localStorage.setItem(
          "sessionLoginData",
          JSON.stringify({
            ...sessionLoginData,
            isOnline: false,
          })
        );
        
      }
    }
  }
});

onBeforeMount(() => {
  clearHeartbeat();
});
</script>

<style lang="less" scoped>
/* 全屏遮罩 */
.network-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0); /* 透明度为0的遮罩 */
  z-index: 9999; /* 确保在最上层 */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 允许点击遮罩 */
}

/* 网络状态卡片 */
.network-status {
  display: flex;
  align-items: center;
  width: 530px;
  height: 250px;
  background: #fff;
  color: #3282dc;
  padding: 10px;
  background: linear-gradient(to bottom, #c0d9ef, #fff, #c0d9ef);
  box-shadow: 2px 5px 15px 9px rgba(182, 208, 246, 0.1), inset 0px 1px 2px 1px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  pointer-events: auto; /* 允许点击卡片内容 */

  .ic_404 {
    width: 150px;
    height: 150px;
    margin-right: 20px;
  }
  
  .warn_text {
    color: #ec6100;
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
    margin-bottom: 8px;
  }

  .normal_text {
    font-size: 14px;
    color: #666666;
    line-height: 20px;
    margin-bottom: 24px;
  }

  .connect_btn {
    display: inline-block;
    background-color: #3282dc;
    color: #fff;
    padding: 6px 10px 6px 20px;
    border-radius: 4px;
    cursor: pointer;
    letter-spacing: 1.2px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #2a6bb8;
    }
  }
}
</style>
