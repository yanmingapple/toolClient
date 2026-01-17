/**
 * 弹窗hooks公用组件
 * 2023-3-16 闫明
 */
import { reactive, toRefs } from "vue";
export default function () {
  let dlgData = reactive({
    isCenterDlg: true,
    isConfirmLoading: true,
    closeOnClickModal: false,
    hasConfirm: true,
    hasCancel: true,
    showClose: true,
    appendToBody: true,
    confirmDisabled: false,
    fullscreen:false,//是否全屏
    sureBtn: "确定",
    cancelBtn: "取消",
    closeButtonCustomText:'关闭',
    top: "0",
    width: "600px",
    customClass:'',
    visible: false,
    title: "",//弹出框，抽屉的标题
    isCreate:true,//是否新增
    isConfirmClose:false,//是否为确认操作关闭窗口
    isShowFooter:true,//footer显示控制 默认显示
    args:[],
    destroyOnClose:false,
    headerData:undefined,//头部数据
    //弹出框与抽屉，绑定确认按钮点击后，回调,用于，点击确认按钮需要处理的业务逻辑，比如提交，组合业务表单参数
    handlerConfirm: () => {},
    //取消回调方法回调,该方法，在弹出框取消，关闭按钮时候触发
 	  handlerCancel: () => {
      //默认关闭错误消息
      setTkNotificationConfig({visible:false,list:[]});
    }, //取消按钮回调
    open: () => {}, //打开回调方法
    beforeClose:(args,done)=>{done()},///手动关闭方法closeDlg触发，关闭前回调方法，即业务手动关闭前处理
    afterClose: () => {}, //手动关闭方法closeDlg触发，关闭后回调方法，即业务手动关闭后处理

    //绑定弹出框确认按钮
    confirm: () => {
      if (dlgData.handlerConfirm && typeof dlgData.handlerConfirm === "function") {
        dlgData.handlerConfirm(dlgData.isCreate,...dlgData.args);
      }
    },
    // 绑定弹出框、抽屉 关闭事件，弹出框自动关闭
    cancel: () => {
      dlgData.isConfirmClose = false;
      dlgData.visible = false;
       //取消回调方法,该方法，在弹出框取消，关闭按钮时候触发
       if (dlgData.handlerCancel && typeof dlgData.handlerCancel === "function") {
        dlgData.handlerCancel();
      }
    },
    //绑定弹出框、抽屉 关闭事件，弹出框自动关闭，该方法在
    //弹出框visible = false时候自动触发
    //抽屉，触发关闭事件就是对应本身，没有取消按钮
    //参数hide，是抽屉关闭前触发，传递进入关闭方法
    close: (hide) => {
      //取消回调方法,该方法，在弹出框取消，关闭按钮时候触发
      if (!dlgData.isConfirmClose && dlgData.handlerCancel && typeof dlgData.handlerCancel === "function") {
        dlgData.handlerCancel();
      }

      //关闭回调方法，该方法在手动关闭窗口时候触发，其他情况不触发
      if (dlgData.isConfirmClose && dlgData.afterClose && typeof dlgData.afterClose === "function") {
        dlgData.afterClose();
      }


      dlgData.isConfirmClose = false;

      if(hide){
        hide();
      }
    },
    // 手动打开弹框事件，所有的非触发打开调用该方法
    openDlg: (title,isCreate,...args) => {
      if(isCreate != undefined){
        dlgData.isCreate = isCreate
      }
      if(args) dlgData.args = args

      dlgData.title = title || dlgData.title || "";
      dlgData.visible = true;
      //打开回调方法，暴露接口道外层处理
      if (dlgData.open && typeof dlgData.open === "function") {
        dlgData.open(dlgData.isCreate,args);
      }
    },
    // 手动关闭弹框操作事件,所有的手动关闭，即业务处理完了，手动关闭
    closeDlg: (args) => {
      const  _close = ()=>{
        dlgData.args = [];//清空传递的参数
        dlgData.isConfirmClose = true;
        dlgData.visible = false;
      }

      //手动触发，关闭前回调，可用于弹出框提示用户一些信息操作，比如离开窗口，数据不报错之类的，供用户选择
      if(dlgData.beforeClose && typeof dlgData.beforeClose === "function"){
        dlgData.beforeClose(args,_close);
      }else{
        _close();
      }
    },
  });
  return { ...toRefs(dlgData) };
}
