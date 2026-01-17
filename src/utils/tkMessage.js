import { ElMessage,ElMessageBox,ElNotification } from "element-plus";

export default class ShowMessage {
  succ(options,duration) {
    this.m("success", options,duration);
  }

  warn(options,duration) {
    this.m("warning", options,duration);
  }

  info(options,duration) {
    this.m("info", options,duration);
  }

  err(options,duration) {
    this.m("error", options,duration);
  }

  m(type, options,duration) {
    // const messageDom = document.getElementsByClassName("el-message")[0];
    // if (messageDom === undefined) {
      ElMessage({
        showClose: true,
        message: options,
        type,
        duration: duration? duration*1000 : 5000,
      });
    // }
  }

  //消息弹出框
  mba(options) {
    ElMessageBox.alert(options)
  }
  
  //消息弹出框
  mb(options) {
    ElMessageBox(options)
  }
    
  //消息弹出框
  prompt(title,confirmFun,calcelFun,tip,confirmButtonText="确认",cancelButtonText="取消",inputPattern,inputErrorMessage) {
    ElMessageBox.prompt(title, tip, {
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      inputPattern:inputPattern,
      inputErrorMessage: inputErrorMessage,
    })
      .then(({ value }) => {
        if(confirmFun)confirmFun(value)
      })
      .catch(() => {
        if(calcelFun)calcelFun()
      })
  }

  //右侧通知
  /**
   * 使用方法
  {
      title: 'Prompt',
      type: 'success', warning info Error
      position: 'bottom-right','bottom-left' 'top-left' 'Top Right'
      offset: 100,
      message: 'This is a message that does not automatically close',
      dangerouslyUseHTMLString:true,设置这个属性后才能使用网页标签
      message: '<strong>This is <i>HTML</i> string</strong>',
      message: h('i', { style: 'color: teal' }, 'This is a reminder'),
      duration: 0,
      showClose: false,
  }
   * 
   */
  n(options){
    ElNotification(options)
  }
}
