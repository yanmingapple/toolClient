import axios from "axios";
import tkTools from "@/utils/tkTools";
import store from "@/store";
// import router from "@/router";
const DEFINE_REQUEST_HEADER_SRV = "appSrvRequest=";

// create an axios instance
const service = axios.create({
  baseURL: "", // (process.env.NODE_ENV == 'production' && window.webConfig?.baseUrl) ? window.webConfig.baseUrl : "",
  timeout: 5000000000, // request timeout
  a: process.env.NODE_ENV,
});
// 处理get请求参数
function requestParamOfGet(paramObj) {
  let paramsStr = "";
  for (const propName of Object.keys(paramObj)) {
    const value = paramObj[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          let params = propName + "[" + key + "]";
          var subPart = encodeURIComponent(params) + "=";
          paramsStr += subPart + encodeURIComponent(value[key]) + "&";
        }
      } else {
        paramsStr += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return paramsStr.slice(0, -1);
}
// 处理post请求参数
function requestParamOfPost(params) {
  let reqDate = tkTools.serialNumber();
  let reqSsn = tkTools.reqSsnCre(18);
  let version = "1.0";
  if (!params) params = {};
  return {
    bizCode: params.bizCode || "",
    page: params.paramData ? params.paramData.page : 1,
    pageSize: params.paramData ? params.paramData.pageSize : 10,
    paramObj: params.paramData ? params.paramData.paramObj : {},
    reqDate: params.reqDate || reqDate,
    reqSsn: params.reqSsn || reqSsn, // reqDate +
    sign: params.sign || reqDate + reqSsn + version + reqDate,
    termType: "PCB",
    userId: "9968",
    version,
  };
}

function setSystemInfoTips(msg) {
  setTkNotificationConfig({
    visible: true,
    panelOrButtonVisible: true,
    showBtns: false,
    position: "bottomLeft",
    hideIndex: true,
    height: "120px",
    list: msg,
  });
}


// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent
    // config.url = config.url || (process.env.NODE_ENV == 'production' ? (config.baseURL + "/apps/appSrvRequest.do") : config.baseURL + process.env.VUE_APP_BASE_API + "/apps/appSrvRequest.do");
    // config.url = config.url || (config.baseURL + (process.env.NODE_ENV != 'production' ? process.env.VUE_APP_BASE_API : '') + "/apps/appSrvRequest.do");
    // get 请求处理参数
    if (config.method === "get" && config.paramData) {
      let paramsStr = requestParamOfGet(config.paramData);
      config.params = {};
      if (config.paramData?.paramObj?.paramsOfGet)
        config.url = config.url + `?${config.paramData.paramObj.paramsOfGet}`;
      else
        config.url =
          config.url + `?${DEFINE_REQUEST_HEADER_SRV}${JSON.stringify(paramsStr).tkEncodeBase64()}`;
    }
    if (config.method === "post") {
      let params = requestParamOfPost(config);
      if (config.actType === "upload") {
        config.url =
          config.url + `?${DEFINE_REQUEST_HEADER_SRV}${JSON.stringify(params).tkEncodeBase64()}`;
         config.data = config.paramFileData;
        delete config.actType;
      } else {
        config.data = `${DEFINE_REQUEST_HEADER_SRV}${JSON.stringify(params).tkEncodeBase64()}`;
       }
    }
    config["headers"] = {
      "Content-Type": config.contentType,
      "X-Requested-With": "XMLHttpRequest",
    };

    config && config.loading ? store.commit("app/SET_LOADING", 1) : "";

    return config;
  },
  (error) => {
    console.log(error); // for debug
    store.commit("app/SET_LOADING", -1);
    return Promise.reject(error);
  }
);
let isFirst = true;
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    // response.config.paramData && response.config.paramData.loading ? tkLoading.loadingHide() : ''
    response.config && response.config.loading ? store.commit("app/SET_LOADING", -1) : "";

    let res = response.data;
    function processResult() {
      if (res.code === "000000") {
        return Promise.resolve({
          msg: res.errMsg,
          pageNumber: res.pageNumber,
          pageSize: res.pageSize,
          reqSsn: res.reqSsn,
          ret: res.ret,
          totalCount: res.totalCount,
          reqSuccess: true,
          code: "000000",
        });
      } else if (response?.config?.paramData?.paramObj?.unNormal) {
        return Promise.resolve(res);
      } else if (res.code === "-S00001") {
        if (router.currentRoute.value.name !== "login") {
          let { isRememberPassword } = localStorage.getItem("sessionLoginData")
            ? JSON.parse(localStorage.getItem("sessionLoginData"))
            : {};
          !isRememberPassword && localStorage.removeItem("sessionLoginData");
          location.href = "#/login";
        }
        return Promise.reject({
          code: res.code,
          msg: res.errMsg,
          reqSuccess: false,
          ret: res.ret,
        });
      } else if (res && res.errMsg) {
        return Promise.reject({
          code: res.code,
          msg: res.errMsg,
          reqSuccess: false,
          ret: res.ret,
        });
      } else {
        if (res && res.response) {
          let response = JSON.parse(res.response);
          if (res.status && res.status == 404 && response.path.indexOf("/html/e-login.html") >= 0) {
            if (router.currentRoute.value.name !== "login") {
              location.href = "#/login";
            }
            //   return Promise.reject();
          }
        } else {
          if (router.currentRoute.value.name !== "login") {
            let { isRememberPassword } = localStorage.getItem("sessionLoginData")
              ? JSON.parse(localStorage.getItem("sessionLoginData"))
              : {};
            !isRememberPassword && localStorage.removeItem("sessionLoginData");
            location.href = "#/login";
          }
        }
      }
    }

    function processBlobJson() {
      var reader = new FileReader();
      reader.readAsText(res, "utf-8");
      reader.onload = function (e) {
        res = JSON.parse(reader.result);

        let r = processResult();

        r.then((res) => {
          if (!res) return;
          resolve(res);
        }).catch((res) => {
          if (!res) return;
          tkMessage.err(res.msg || "未知异常");
        });
      };
    }

    function processBlobStream() {
      const link = document.createElement("a"); //创建一个a标签
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" })); //将blob文件对象通过URL.createObjectURL()方法转为为url
      link.href = url; //为a标签设置href属性，并赋值为url
      link.download = response.headers["downloadname"].tkDecodeV1(); //定义下载的文件名，文件名要包含后缀哟！如'导出EXCEL.xlsx'
      document.body.appendChild(link); //把a标签放在body上
      link.click(); //出发a标签点击下载
      document.body.removeChild(link); //在body中移除这个a标签
      window.URL.revokeObjectURL(url); //释放blob对象
    }

    if (res instanceof Blob) {
      if (res.type == "application/json") {
        processBlobJson();
      } else if (res.type == "application/octet-stream") {
        processBlobStream();
      }
    } else {
      return processResult();
    }
  },
  (error) => {
    store.commit("app/SET_LOADING", -1);
    console.log(error);

    // ERR_BAD_REQUEST: 无对应请求地址   ERR_NETWORK: 跨域
    //网络异常时候
    // let baseUrl = process.env.NODE_ENV == 'production' ? webConfig?.baseUrl??process.env.VUE_APP_API_PROXY_TARGET : process.env.VUE_APP_API_PROXY_TARGET
    // if (error && error.code == "ERR_BAD_REQUEST") {
    //   if (error?.request?.status == 404) {
    //     // response 有值服务器正常，请求地址无对应服务
    //     if (error?.request?.response) {
    //       setSystemInfoTips([{msg: `<span style="color: red;">非法请求地址:
    //       <br/>当前请求地址 : ${error?.request?.responseURL}
    //       <br/>服务器地址 : ${baseUrl}
    //       </span>`}])
    //     } else {
    //       setSystemInfoTips([{msg: `<span style="color: red;">请配置正确服务器地址:
    //       <br/>服务器地址 : ${baseUrl}
    //       <br/>配置文件路径 : config/webConfig.js
    //       </span>`}])
    //     }
    //   } else {
    //     ElMessage({
    //       message: '非法请求地址，请确认服务器版本是否正确',
    //       type: "error",
    //       duration: 1000,
    //     });
    //   }
    //   return;
    // }else if (error && error.code == "ERR_BAD_RESPONSE") {
    //   if (error?.request?.status == 500) {
    //     // response 有值服务器正常，请求地址无对应服务
    //     if (error?.request?.response) {
    //       setSystemInfoTips([{msg: `<span style="color: red;">服务器异常:
    //       <br/>当前请求地址 : ${error?.request?.responseURL}
    //       <br/>服务器地址 : ${baseUrl}
    //       </span>`}])
    //     }
    //   } else {
    //     ElMessage({
    //       message: '非法请求地址，请确认服务器版本是否正确',
    //       type: "error",
    //       duration: 1000,
    //     });
    //   }
    //   return;
    // }
    // else if(error && error.code == "ERR_NETWORK"){
    //   setSystemInfoTips([{msg: `<span style="color: red;">请配置正确服务器地址:
    //   <br/>服务器地址 : ${baseUrl}
    //   <br/>配置文件路径 : config/webConfig.js
    //   </span>`}])

    //   // location.href = "#/login";
    //   // localStorage.setItem("isLogin", 0);
    //   return;
    // }

    // ElMessage({
    //   message: error.message,
    //   type: "error",
    //   duration: 1000,
    // });
    return Promise.reject(error);
  }
);

export default service;
