import request from "@/utils/request";
import store from "../store";
// import router from "@/router";
import tkPageParams from "@/global/tkPageParams";
import { fetchEventSource } from "./fetchEventSource/index";
import { useRouter } from "vue-router";
const $router = useRouter();

let netWorkErr;
let tkInterface = {};
let tkInterfaceCatch = {};
let networkErr = 0,
  networkLastSendTime = 0; //上次请求时间
export function setInterFace(bizCode) {
  bizCode.map((item) => {
    tkInterfaceCatch[item.name] = {
      cacheQueryData: item.cacheQueryData ? true : false, //缓存查询结果
    };
    // ai流方式返回接口bizCode另外处理
    if (item.type === "stream") {
      tkInterface[item.name] = {
        bizCode: item.code,
        method: item.method || "post",
        url:
          (process.env.NODE_ENV == "production" && window.webConfig?.baseUrl ? window.webConfig.baseUrl : "") +
          (item.url || "/apps/appSrvRequestStream.do"),
      };
    } else {
      tkInterface[item.name] = (paramObj) => {
        paramObj.url =
          (process.env.NODE_ENV == "production" && window.webConfig?.baseUrl ? window.webConfig.baseUrl : "") +
          (item.url || "/apps/appSrvRequest.do");
        paramObj.method = item.type || "post";
        paramObj.bizCode = item.code;
        return request(paramObj);
      };
    }
  });

  netWorkErr = tkTools.debounce(()=>{
    tkMessage.err("网络连接异常，请重新登录");
    tkSocket&&tkSocket.close&&tkSocket.close(true)
  },500)
}

/**zhi
 * 题库接口请求类
 */
export class TkReq {
  init() {
    return new TkReq();
  }

  /**
   * 设置请求缓存的名称
   * @param {*} subPageName
   */
  catchName(catchName) {
    this._catchName = catchName;
    return this;
  }

  /**
   * 设置数据缓存的名称
   * @param {*} catchDataName
   */
  catchDataName(catchName) {
    this._catchDataName = catchName;
    return this;
  }

  /**
   * 设置当前页面的名称
   * @param {*} subPageName
   */
  routePath(routePath) {
    this._routePath = routePath;
    return this;
  }

  /**
   * 设置上级请求缓存的数据
   * @param {*} subPageName
   */
  preData(preData) {
    this._preData = preData;
    return this;
  }

  /**
   * 设置请示接口
   * @param {*} path
   */
  path(path) {
    this._interface = path;
    this._errNetWork = true;
    return this;
  }
  /**
   * 网络异常处理
   * @param {*} errBadRespnse 
   */
  errNetWork(errNetWork){
    this._errNetWork = errNetWork;
    return this;
  }
  /**
   * 设置reqSsn
   * @param {*} reqSsn
   */
  reqSsn(reqSsn) {
    if (reqSsn) this._reqSsn = reqSsn;
    return this;
  }

  /**
   * 设置请求参数
   * @param {*} params
   */
  param(params) {
    if (this._interface && params) this._params = params;
    return this;
  }

  /**
   * 设置请求参数
   * @param {*} responseType
   */
  responseType(responseType) {
    if (this._interface && responseType) this._responseType = responseType;
    else this._responseType = "";
    return this;
  }

  /**
   * 设置请求参数
   * @param {*} responseType
   */
  contentType(contentType) {
    if (this._interface && contentType) this._contentType = contentType;
    else this._contentType = "application/x-www-form-urlencoded; charset=UTF-8";
    return this;
  }

  /**
   * 设置页码，不传值默认1
   * @param {*} page
   * @returns
   */
  page(page) {
    if (page) this._page = page;
    else this._page = 1;
    return this;
  }
  /**
   * 设置页码，不传值默认99999
   *
   * @param {*} pageSize
   * @returns
   */
  pageSize(pageSize) {
    if (pageSize) this._pageSize = pageSize;
    else this._pageSize = 99999;
    return this;
  }
  /**
   * 设置是否loading 默认 loading:true
   *
   * @returns
   */
  noLoading() {
    this._loading = false;
    return this;
  }

  /**
   * 设置是否loading 默认 loading:true
   *
   * @returns
   */
  isLoading(isLoading) {
    this._loading = isLoading;
    return this;
  }

  /**
   * 导入文件处理
   *
   * @returns
   */
  file(raw) {
    this._fileObj = raw;
    return this;
  }

  /**
   * 设置导入文件的key值
   *
   * @returns
   */
  fileName(name) {
    this._fileName = name || "file";
    return this;
  }
  /**
   * 成功回调
   * @param {*} succFn
   * @returns
   */
  succ(succFn) {
    if (succFn && succFn instanceof Function) {
      this._succFn = succFn;
    }

    return this;
  }

  /**
   * 失败回调
   * @param {*} errFn
   * @returns
   */
  err(errFn) {
    if (errFn && errFn instanceof Function) {
      this._errFn = errFn;
    }
    return this;
  }

  //////////////////流式/////////////////////////
  /**
   * 处理流式消息的回调函数，每当服务器发送一条消息时会调用。
   * @param {*} onMessageFun
   * @returns
   */
  onMessage(onMessageFun) {
    if (onMessageFun && onMessageFun instanceof Function) {
      this._onMessageFun = onMessageFun;
    }

    return this;
  }
  /**
   * @param {*} onErrorFun
   * @returns
   */
  onError(onErrorFun) {
    if (onErrorFun && onErrorFun instanceof Function) {
      this._onErrorFun = onErrorFun;
    }
    return this;
  }

  /**
   * @param {*} onCloseFun
   * @returns
   */
  onClose(onCloseFun) {
    if (onCloseFun && onCloseFun instanceof Function) {
      this._onCloseFun = onCloseFun;
    }
    return this;
  }

  /**
   * @param {*} onOpenFun
   * @returns
   */
  onOpen(onOpenFun) {
    if (onOpenFun && onOpenFun instanceof Function) {
      this._onOpenFun = onOpenFun;
    }
    return this;
  }

  /**
   * @param {*} onOpenErrorFun
   * @returns
   */
  onOpenError(onOpenErrorFun) {
    if (onOpenErrorFun && onOpenErrorFun instanceof Function) {
      this._onOpenErrorFun = onOpenErrorFun;
    }
    return this;
  }

  //流式发送
  sendStream() {
    const onMessageFun = (res) => {
      this._onMessageFun(res);
    };
    const onError = () => {
      this._onErrorFun();
    };
    const onClose = () => {
      this._onCloseFun();
    };
    const onOpenError = (text) => {
      this._onOpenErrorFun(text);
    };
    const onOpen = () => {
      this._onOpenFun();
    };

    //封装参数
    let params = {};
    if (this._params) {
      params["paramObj"] = this._params;
    }

    //封装翻页
    params["page"] = this._page || "1";
    params["pageSize"] = this._pageSize || "10";
    // params['loading'] = this._loading === false ? false : true

    let param = {
      dataType: "json",
      contentType: this._contentType,
      responseType: this._responseType,
      paramData: params,
      success: this._succFn,
      error: this._errFn,
      loading: this._loading === false ? false : true,
    };

    if (this._reqSsn) param["reqSsn"] = this._reqSsn;
    if (this._fileObj) {
      param["contentType"] = "multipart/form-data";
      let fd = new FormData(); // FormData 对象
      if (typeof this._fileObj == "object" && this._fileObj instanceof Array) {
        this._fileObj.forEach((_file) => {
          fd.append(this._fileName || "files", _file); // 文件对象
        });
      } else {
        fd.append(this._fileName || "files", this._fileObj); // 文件对象
      }
      for (const key in this._params) {
        if (Object.hasOwnProperty.call(this._params, key)) {
          fd.append(key, this._params[key]);
        }
      }
      // fd.append('loading', true)
      // fd.append('action', 'uploadimage')
      param["paramFileData"] = fd;
      param["actType"] = "upload";
    }

    // 处理post请求参数
    function requestParamOfPost(params) {
      let reqDate = tkTools.serialNumber();
      let reqSsn = tkTools.reqSsnCre(18);
      let version = "1.0";
      if (!params) params = {};
      return {
        bizCode: params.bizCode,
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

    const interfaceObj = tkInterface[this._interface];
    param["bizCode"] = interfaceObj.bizCode;
    let paramsData = requestParamOfPost(param);
    let path = interfaceObj.url; ///v1/completion-messages

    let fdBody = new FormData(); // FormData 对象
    fdBody.append("appSrvRequest", encodeURIComponent(JSON.stringify(paramsData).tkEncodeBase64()));

    fetchEventSource(path, {
      method: interfaceObj.method,
      body: interfaceObj.method == "GET" ? undefined : fdBody,
      headers: {
        // "Content-Type":"application/json",
        Authorization: `${this._token ?? ""}`,
        Accept: "application/json",
        // "Authorization":"Bearer app-jiPGKnD1xazSdmezv9HD2zVt"
      },
      openWhenHidden: true,
      onmessage: (event) => {
        if (event.data) {
          //服务返回的数据
          const data = JSON.parse(event.data);
          onMessageFun(data);
        }
      },
      onerror(event) {
        // 服务异常
        console.log("sse Error:", event);
        onError();
        throw event;
      },
      onclose() {
        // 服务关闭
        console.log("sse Closed!");
        onClose();
      },
      onopen(res) {
        console.log("sse open!");
        onOpen();
      },
    });
  }

  //////////////////END 流式/////////////////////////

  /**
   * 发送请求
   */
  async send() {
    const _this = this;
    if (!this._interface) {
      tkMessage.err("接口参数未设置");
      return Promise.reject();
    } else if (!tkInterface[this._interface]) {
      tkMessage.err("接口【" + this._interface + "】接口未定义");
      return Promise.reject();
    }

    //封装参数
    let params = {};
    if (this._params) {
      params["paramObj"] = this._params;
    } else {
      params["paramObj"] = {};
    }

    //封装翻页
    params["page"] = this._page || "1";
    params["pageSize"] = this._pageSize || "10";
    // params['loading'] = this._loading === false ? false : true

    let param = {
      dataType: "json",
      contentType: this._contentType,
      responseType: this._responseType,
      paramData: params,
      success: this._succFn,
      error: this._errFn,
      loading: this._loading === false ? false : true,
    };

    if (this._reqSsn) param["reqSsn"] = this._reqSsn;
    if (this._fileObj) {
      param["contentType"] = "multipart/form-data";
      let fd = new FormData(); // FormData 对象
      if (typeof this._fileObj == "object" && this._fileObj instanceof Array) {
        this._fileObj.forEach((_file) => {
          fd.append(this._fileName || "files", _file); // 文件对象
        });
      } else {
        fd.append(this._fileName || "files", this._fileObj); // 文件对象
      }
      for (const key in this._params) {
        if (Object.hasOwnProperty.call(this._params, key)) {
          fd.append(key, this._params[key]);
        }
      }
      // fd.append('loading', true)
      // fd.append('action', 'uploadimage')
      param["paramFileData"] = fd;
      param["actType"] = "upload";
    }

    return new Promise(function (resolve, reject) {
      //缓存的数据直接返回
      if (_this._catchDataName && tkInterfaceCatch[_this._interface][_this._catchDataName]) {
        if (_this._succFn && _this._succFn instanceof Function)
          _this._succFn(tkInterfaceCatch[_this._interface][_this._catchDataName]);
        resolve(tkInterfaceCatch[_this._interface][_this._catchDataName]);
        _this._setQueryCatch();
        _this._clean();
        return;
      }
      var ret = tkInterface[_this._interface](param);

      ret
        .then((res) => {
          if (!res) {
            if (_this._responseType == "blob") {
              resolve(res);
              return;
            }
            if (new Date().getTime() - networkLastSendTime > 5 * 1000) {
              networkErr = 0;
            }
            if (networkErr > 0) {
              networkErr++;
              return;
            }
            networkErr++;
            networkLastSendTime = new Date().getTime();
            store.commit("app/SET_LOADING", -1);
            let { isRememberPassword } = localStorage.getItem("sessionLoginData")
              ? JSON.parse(localStorage.getItem("sessionLoginData"))
              : {};
            !isRememberPassword && localStorage.removeItem("sessionLoginData");
            $router.replace({ name: "login" });
            return;
          }

          networkErr = 0;

          //缓存数据
          if (_this._catchDataName) {
            tkInterfaceCatch[_this._interface][_this._catchDataName] = res;
          }
          if (_this._succFn && _this._succFn instanceof Function) _this._succFn(res);
          resolve(res);
          _this._setQueryCatch();
          _this._clean();
        })
        .catch((res) => {
          if (res) {
            if(res.code == "ERR_BAD_RESPONSE" && _this._errNetWork){
                netWorkErr()
                return;
            }
            else if (_this._errFn && _this._errFn instanceof Function) {
              _this._errFn(res);
            } else if (res.code == "-S00001") {
              //返回登陆页面，不提示
            } else if (res.msg != "成功" && res.msg) {
              console.log("🚀 ~ file: index.js:265 ~ TkReq ~ res:", res);
              tkMessage.err(res.msg);
            }
          }

          resolve(res);
          _this._clean();
        });
    }).catch((err) => {
      console.log("🚀 ~ file: index.js:270 ~ TkReq ~ err:", err);
      if (res.code == "-S00001") {
        //返回登陆页面，不提示
      } else if (err.msg != "成功" && err.msg) {
        tkMessage.err(err.msg);
      }

      resolve(res);
      _this._clean();
    });
  }

  /**
   * 设置查询缓存
   */
  _setQueryCatch() {
    let path = this._routePath || router.currentRoute.value.path;
    let catchObj = tkPageParams(path) || {};
    if (this._catchName) {
      catchObj[this._catchName] = {
        currentPage: this._page,
        pageSize: this._pageSize,
        searchData: this._params,
      };
    }

    if (this._preData) {
      for (var key in this._preData) {
        catchObj[key] = this._preData[key];
      }
    }
    if (this._catchName || this._preData) {
      store.commit("app/SET_REQ_QUERY_DATA", {
        location: path,
        data: catchObj,
      });
    }
  }

  /**
   * 清理对象数据
   */
  _clean() {
    delete this._interface;
    delete this._params;
    delete this._succFn;
    delete this._errFn;
    delete this._page;
    delete this._pageSize;
    delete this;
  }
}

/**
 * 题库接口请求类
 */
export class TkHttp {
  constructor() {
    Object.assign(this, {});
    //等待执行的接口
    this.wait = [];
  }

  /**
   * 成功回调
   * @param {*} succFn
   * @returns
   */
  succ(succFn) {
    if (succFn && succFn instanceof Function) {
      this._succFn = succFn;
    }

    return this;
  }

  /**
   * 失败回调
   * @param {*} errFn
   * @returns
   */
  err(errFn) {
    if (errFn && errFn instanceof Function) {
      this._errFn = errFn;
    }
    return this;
  }

  // g函数
  async _run1() {
    let _t = this,
      //中断任务
      isbreak = !1,
      result = [];

    for (let [i, v] of _t.wait.entries()) {
      await v
        .send()
        .catch((res) => {
          //同步流中断
          _t.clearWait();
          isbreak = !0;
        })
        .then((res) => {
          //任务执行成功
          result.push(res);
          if (v.succ) v.succ(res);
        });

      if (!!isbreak) {
        break;
      }
    }

    if (result.length === _t.wait.length) {
      if (this._succFn) this._succFn(result);
      this._clean();
    } else {
      if (this._errFn) this._errFn(result);
      this._clean();
    }
  }

  // g函数
  async _run() {
    let sendArrays = [];
    for (let [i, v] of this.wait.entries()) {
      sendArrays.push(v.send());
    }

    let result = Promise.all(sendArrays)
      .then((res) => {
        if (this._succFn) this._succFn(res);
        this._clean();
      })
      .catch((res) => {
        if (this._errFn) this._errFn(res);
        this._clean();
      });
  }

  //清空任务
  clearWait() {
    this.wait = [];
  }

  /**
   * 清理对象数据
   */
  _clean() {
    delete this.wait;
    delete this;
  }

  //异步串行
  run1() {
    const _t = this;
    return (function (arg) {
      if (arg.length === 0) {
      } else {
        [].push.apply(_t.wait, arg);
        _t._run1();
      }
    })(arguments);
  }

  //异步并行
  run() {
    const _t = this;
    return (function (arg) {
      if (arg.length === 0) {
      } else {
        [].push.apply(_t.wait, arg);
        _t._run();
      }
    })(arguments);
  }
}

//跨域请求
export class TkReqCrossDomain {
  init() {
    return new TkReqCrossDomain();
  }

  /**
   * 设置请示接口
   * @param {*} path
   */
  path(path) {
    this._path = path;
    return this;
  }

  /**
   * 设置请示接口
   * @param {*} path
   */
  param(param) {
    this._param = param;
    return this;
  }

  dataType(dataType) {
    this._dataType = dataType;
    return this;
  }

  /**
   * 设置请求参数
   * @param {*} responseType
   */
  contentType(contentType) {
    if (contentType) this._contentType = contentType;
    else this._contentType = "application/x-www-form-urlencoded; charset=UTF-8";
    return this;
  }

  /**
   * 导入文件处理
   *
   * @returns
   */
  file(raw) {
    this._fileObj = raw;
    return this;
  }

  /**
   * 设置导入文件的key值
   *
   * @returns
   */
  fileName(name) {
    this._fileName = name || "file";
    return this;
  }

  /**
   * 成功回调
   * @param {*} succFn
   * @returns
   */
  succ(succFn) {
    if (succFn && succFn instanceof Function) {
      this._succFn = succFn;
    }

    return this;
  }

  /**
   * 失败回调
   * @param {*} errFn
   * @returns
   */
  err(errFn) {
    if (errFn && errFn instanceof Function) {
      this._errFn = errFn;
    }
    return this;
  }

  post() {
    const succFun = (res) => {
      this._succFn(res);
    };
    const errFun = (err) => {
      console.log(err);
    };

    let fd = {
      ...this._param,
    };

    if (this._fileObj) {
      this._contentType = false;
      fd = new FormData(); // FormData 对象
      if (typeof this._fileObj == "object" && this._fileObj instanceof Array) {
        this._fileObj.forEach((_file) => {
          fd.append(this._fileName || "files", _file); // 文件对象
        });
      } else {
        fd.append(this._fileName || "files", this._fileObj); // 文件对象
      }

      for (const key in this._param) {
        if (Object.hasOwnProperty.call(this._param, key)) {
          fd.append(key, this._param[key]);
        }
      }
    }

    $.ajax({
      type: "POST", // 请求类型
      contentType: this._contentType,
      processData: false,
      cache: false,
      url: this._path,
      data: fd,
      success: succFun,
      error: errFun,
    });
  }

  get() {}
}
