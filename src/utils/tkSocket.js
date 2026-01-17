var tksocket;
var socketCallBack = {
  bussId: "",
  bussData: {},
  bussMessage: () => {},
  executeMessage:()=>{},
  systemMessage: () => {},
};

var pingIntervalId;
function openPing(){
  pingIntervalId =  setInterval(()=>{
      tksocket.send("p");
  },60000)
}
function closePing(){
  if(pingIntervalId){
    clearInterval(pingIntervalId);
  }else{
    pingIntervalId = undefined
  }
}

setInterval(() => {
  const { userId, isOnline } = localStorage.getItem("sessionLoginData")
    ? JSON.parse(localStorage.getItem("sessionLoginData"))
    : {};

   const islogin =  window.location.href.includes("login");

  //已经登录
  if (userId && isOnline && !islogin) {
    if (!tksocket || ![WebSocket.OPEN, WebSocket.CONNECTING].includes(tksocket.readyState)) {
      openTkSocket();
    }
  } else {
    if (tksocket) {
      colseTkSocket();
    }
  }
}, 2000);

const openTkSocket = () => {
  try {
    let loginUserInfo = JSON.parse(localStorage.getItem("sessionLoginData"));
    const token  = {
      userId:loginUserInfo.userId,
      token:loginUserInfo.token,
      math:Math.random()
    }
    tksocket = new WebSocket(
      window.webConfig.socketUrl + "?token=" + (JSON.stringify(token)).tkEncodeBase64()
    );
    tksocket.addEventListener("open", handleOpen, false);
    tksocket.addEventListener("close", handleClose, false);
    tksocket.addEventListener("error", handleError, false);
    tksocket.addEventListener("message", handleMessage, false);
  } catch (error) {}
};

const colseTkSocket = () => {
  if (tksocket) {
    closePing()
    tksocket.close();
    tksocket = null;
  }
};

//打开socket
function handleOpen() {
  console.log(Date.nowF() + " 连接成功！");

  let loginUserInfo = JSON.parse(localStorage.getItem("sessionLoginData"));
  tkSocket.userInfo = {
    userId:loginUserInfo.userId,
    userName:loginUserInfo.userName
  }

  if (socketCallBack.bussId) {
    tkSocket.send({ type: "4", bussId: socketCallBack.bussId, data: socketCallBack.bussData });
  }

  openPing();

  //连接成功后通知
  if(tkSocket.open){
    tkSocket.open();
  }
}

function handleClose() {
  closePing()
  tkSocket.userInfo = {};
  console.log(Date.nowF() + " 连接断开！");
   //连接成功后通知
   if(tkSocket.close){
    tkSocket.close();
  }
}

function handleError() {
  tkSocket.userInfo = {};
  console.log(Date.nowF() + " 连接错误！");
  //连接成功后通知
  if(tkSocket.close){
    tkSocket.close();
  }
}

function handleMessage(msg) {
  const messageJson = JSON.parse(msg.data);
  console.log(Date.nowF(), messageJson);
  // SYSTEM("0","系统内部消息"),

  if (messageJson.type == "0") {
    if (socketCallBack.systemMessage) {
      socketCallBack.systemMessage(messageJson);
    }
  }
  //EXECUTE("1","强制执行"),
  else if (messageJson.type == "1") {
    if (socketCallBack.systemMessage) {
      socketCallBack.executeMessage(messageJson);
    }
  }
  // BUSS("4","业务"),
  else if (messageJson.type == "4") {
    if (socketCallBack.bussMessage && socketCallBack.bussId && socketCallBack.bussId == messageJson.bussId) {
      socketCallBack.bussMessage(messageJson);
    }
  }
}

//系统消息回调接口，需要用到的对应地方重新改方法
const tkSocket = {
  end:()=>{colseTkSocket()},
  //连接成功与端口连接暴露接口，通知网络连接中断处理
  open:()=>{},
  close:()=>{},
  //发送消息
  send: (json) => {
    if (tksocket && tksocket.readyState == 1) {
      if(tkSocket.userInfo.userId){
        json.fromUser = tkSocket.userInfo.userId;
        json.data.fromUser = tkSocket.userInfo.userId;
        tksocket.send(JSON.stringify(json));
      }
    }
  },
  //设置系统消息连接配置,用法在通用消息组件TkSocketNotify中监听
  setSystemMessage: (callback) => {
    socketCallBack.systemMessage = callback;
  },
  //设置强制执行操作,用法在通用消息组件TkSocketNotify中监听
  setExecuteMessage: (callback) => {
      socketCallBack.executeMessage = callback;
    },
  //设置业务消息连接配置，用法为当前业务页面进入后，设置该配置
  setBussMessage: (bussId, callback, bussData) => {
    try{
      //业务id，用于连接中断，重新连接的时候，自动发送业务加入消息
      if (bussId) {
        //如果上一次有值，不相当时候清空后再重新赋值
        if(socketCallBack.bussId != bussId){
          try {
            tkSocket.send({
              type: "4",
              bussId: socketCallBack.bussId,
              data: {
                fromUser: tkSocket.userInfo.userId,
                type: "leave",
                message: bussData ?? "",
              },
            });
          } catch (error) {
            
          }
          socketCallBack.bussId = "";
          socketCallBack.bussMessage = () => {};
        }
        socketCallBack.bussId = bussId;
        socketCallBack.bussMessage = callback;
        socketCallBack.bussData = bussData ?? {fromUser:tkSocket.userInfo.userId, type: "join" };

        tkSocket.send({ type: "4", bussId: bussId, data: socketCallBack.bussData });
      } else {
        if(socketCallBack.bussId){
          tkSocket.send({ type: "4", bussId: socketCallBack.bussId, data: {fromUser:tkSocket.userInfo.userId, type: "leave" ,message:bussData??'' }});
          socketCallBack.bussId = "";
          socketCallBack.bussMessage = () => {};
        }
      }
    }catch(e){

    }
   
  },
};

export default tkSocket;
