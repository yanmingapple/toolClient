<template>
  <tk-dialog :dlgObj="messageDlg">
    <div class="warning-message-container">
      <div class="warning-icon">
        <svg-icon
          class-name="tips-icon"
          icon-class="ic_circle_exclamationMark"
          color="#cc6018"
        ></svg-icon>
      </div>
      <div class="warning-content" v-html="messageHtml"></div>
    </div>
  </tk-dialog>
</template>

<script setup>
  import tkSocket from '@/utils/tkSocket';
  import { useRouter } from 'vue-router';
  import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
  import { Warning } from '@element-plus/icons-vue';
  const router = useRouter();

  const messageDlg = ref(useDlg());
  messageDlg.value.hasConfirm = false;
  messageDlg.value.cancelBtn = '已知晓';
  messageDlg.value.handlerCancel = () => {
    if (notTipMessage.length > 0) {
      const messageObj = notTipMessage.splice(0, 1)[0];
      dlgMessage(messageObj.title, messageObj.message);
    }
  };

  const messageHtml = ref();

  // const socketStatus = ref('Disconnected');
  // const socket = ref(null);
  let loginUserInfo = ref({});

  var notTipMessage = [];

  function playMp3(audioName) {
    if (audioName) {
      try {
        var audio = new Audio('./static/sound/' + audioName);
        // 播放声音
        audio.play();
      } catch (e) {}
    }
  }

  function dlgMessage(title, message) {
    messageHtml.value = message;
    messageDlg.value.openDlg(title);
  }

  function tipMessage(title, message, audioName) {
    // 创建一个新的Audio对象并指定音频文件的路径
    if (audioName) {
      playMp3(audioName);
    }

    if (messageDlg.value.visible) {
      notTipMessage.push({
        title: title,
        message: message,
        audioName: audioName,
      });
      return;
    }
    // messageDlg.value.closeDlg();
    dlgMessage(title, message);
  }

  function notifyMessage(title, message, audioName, duration) {
    // 创建一个新的Audio对象并指定音频文件的路径
    // playMp3(audioName);
    tkNotify({
      title: title,
      type: 'success',
      dangerouslyUseHTMLString: true,
      position: 'bottom-left',
      message: message,
      duration: duration,
    });
  }

  function systemMessage(json) {
    let messageMp3 = 'gril_message.mp3';
    const data = JSON.parse(json.data ?? '{}');
    let title = data.title ?? '';
    if (data.dlgType == '00') {
      tipMessage(title, data.message, messageMp3);
    } else if (data.dlgType == '01') {
      notifyMessage(title, data.message, messageMp3, data.duration ?? 5000);
    }
  }

  function executeMessage(json) {
    //如果强制执行：type:quit 退出,activity_start 活动开始,activity_end 活动结束 task_start 任务开始,task_end 任务结束  data: 任务id,活动id
    const data = JSON.parse(json.data ?? '{}');
    let title = data.title ?? '';

    const EnterActivityDetailPageData = tkTransferParamsData('/activity/activityDetail');

    if (data.type == 'quit' || data.type == 'activity_quit') {
      if (!router.currentRoute.value.fullPath.includes('/login')) {
        localStorage.removeItem('sessionLoginData');
        router.replace({ name: 'login' });
        tipMessage(title, data.message, null);
      }
      tkSocket.end();
      return;
    } else if (data.type == 'activity_start') {
      if (router.currentRoute.value.fullPath.includes('/workbench/teacherIndex')) {
        tipMessage(title, data.message, null);
        window.location.reload();
      }
    } else if (data.type == 'task_start') {
      if (router.currentRoute.value.fullPath.includes('/workbench/teacherIndex')) {
        tipMessage(title, data.message, null);

        tkCommit('SET_QUERY_DATA', { location: '/activity/activityDetail', data: {} });
        window.location.reload();
      }
    } else if (data.type == 'activity_end') {
      if (EnterActivityDetailPageData?.activityInfo?.id == json.bussId) {
        router.push({ path: '/workbench/teacherIndex' });
        tipMessage(title, data.message, null);
      } else if (router.currentRoute.value.fullPath.includes('/workbench/teacherIndex')) {
        tkCommit('SET_QUERY_DATA', { location: '/activity/activityDetail', data: {} });
        window.location.reload();
        tipMessage(title, data.message, null);
      }
    } else if (data.type == 'task_end' || data.type == 'jump_teacher_home') {
      console.log('---------------data.type---------------',data.type)
      if (EnterActivityDetailPageData?.activityInfo?.id == json.bussId) {
        router.push({ path: '/workbench/teacherIndex' });
        tipMessage(title, data.message, null);
      } else if (router.currentRoute.value.fullPath.includes('/workbench/teacherIndex')) {
        tkCommit('SET_QUERY_DATA', { location: '/activity/activityDetail', data: {} });
        window.location.reload();
        tipMessage(title, data.message, null);
      }
    }
  }

  onMounted(() => {
    tkSocket.setSystemMessage(systemMessage);
    tkSocket.setExecuteMessage(executeMessage);
  });
</script>

<style lang="less" scoped>
  .warning-message-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    min-height: 60px;

    .warning-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .warning-content {
      flex: 1;
      line-height: 1.8;
      color: #333;
      word-break: break-word;
      padding-left: 0;

      // 优化 HTML 内容样式
      :deep(p) {
        margin: 0 0 8px 0;
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(ul),
      :deep(ol) {
        margin: 8px 0;
        padding-left: 24px;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(strong) {
        color: #faad14;
        font-weight: 600;
      }

      :deep(a) {
        color: #1890ff;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  // 响应式优化
  @media (max-width: 768px) {
    .warning-message-container {
      gap: 12px;

      .warning-icon {
        width: 28px;
        height: 28px;
      }

      .warning-content {
        font-size: 14px;
      }
    }
  }
</style>
