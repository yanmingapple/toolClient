//view project
function ini_snakeFun() {
   var iTs = this;
   this.getMarbot = function() { //container marginbot
      var h = $("footer").height();
      $(".container").css("margin-bottom", h + "px");
   };
   this.clNameSetSize = function() {
      if ($(".js-box-wid-pad").length > 0) { //框架尺寸，左右两侧是否有pad14的边框
         $(".js-box-wid-pad").css('width', basicFE.bws.getWindowSize('windWidth') - 28 + 'px');
      }
      if ($(".js-box-wid-mar").length > 0) {
         $(".js-box-wid-mar").css('width', basicFE.bws.getWindowSize('windWidth') - 28 + 'px');
      }
      if ($(".box-wid-full").length > 0) { //设备分辨率宽度一屏制
         $(".box-wid-full").css('width', basicFE.bws.getWindowSize('windWidth') + 'px');
      }
      if ($(".box-hgt-noTB").length > 0) {
         $(".box-hgt-noTB").css('height', GuiyiMidol_H() + 'px');
      }
   }
   this.witW_boxSet = function(adit, call) {
      if ($(".js-witW-box").length > 0) {
         var obj = $(".js-witW-box");
         obj.each(function(i, elm) {
            var am = 0,
               oi = obj.eq(i);
            $(this).find(".js-witW-o").each(function(idx, elem) {
               am += basicFE.elm.getObjSize($(this), 1);
               var i = oi.find(".js-witW-i"),
                  ado = 0;
               if (adit != null && typeof(adit) !== 'undefined') {
                  ado = adit;
               }
               if (idx == oi.find(".js-witW-o").length - 1) {
                  var wwm = oi.width() - (am + basicFE.elm.getObjSize(i, 3) + ado);
                  i.css("width", wwm + "px");
               }
            });
            if (i == obj.length - 1) {
               if (typeof(call) == "function") {
                  call();
               }
            }
         });
      }
   }
   this.eachTop_Elm = function() {
      var cont = $(".container"),
         marTop = 0;
      if (basicFE.bws.getIosEdition() == true) { //apple ios4以上的版本会有顶部的20px系统信息
         $("header").css("border-top", "20px solid #333");
         if ($(".fix-cont").length > 0) {
            $(".fix-cont").css({
               "top": basicFE.elm.getObjSize($("header"), 2) + "px"
            });
         }
      }
      cont.prevAll().each(function(i, elm) {
         if ($(this).attr("class").indexOf("js-inipage-NotBeingCalculated") == -1) { //扫描条件
            marTop += basicFE.elm.getObjSize($(this), 2);
         }
      });
      cont.css("margin-top", marTop + "px");
      return marTop;
   }
   this.allStart = function() {
      iTs.getMarbot();
      iTs.clNameSetSize();
      iTs.witW_boxSet(1);
      iTs.eachTop_Elm();
   }
}

/*---------------2016.03.16---------------*/
function _$log(str) { //快捷打印
   if (window.top.fneVar.controller.viewLog) {
      try {
         throw new Error();
      } catch (e) {
         basicFE.oth.consoleLogLine(e, str);
      }
   }
}

function cloneModalToParent(id) { //creatclone
   var windW = window.top.document.documentElement.clientWidth,
      farBy = $(window.top.document.body),
      copyModal = $(id).clone(),
      widx = '';
   copyModal.appendTo(farBy);
   if (windW >= 1600) {
      widx = '50%';
   } else {
      widx = '70%';
   }
   farBy.find(id).find(".modal-dialog").css("width", widx);
   farBy.find(id).modal({
      backdrop: false
   });
   farBy.append("<div id='backdropId' class='modal-backdrop fade in'></div>");
   var icont = farBy.find(".js-mousescroll-content"),
      iwid = parseInt(icont.height()) - basicFE.elm.getObjSize(icont.find("iframe"), 6),
      ibdy = $(parent.frames.iframeBox.window.document.getElementsByTagName('body')[0]);
   if (iwid < ibdy.height()) {
      ibdy.addClass('jsAdd-marR-17').css('margin-right', '-17px');
   }
}

function BtsModalBuildChange(obj, fn) { //this is --> .modal-dialog
   var winVar = window.top,
      uH = winVar.document.documentElement.clientHeight,
      headH = basicFE.elm.getObjSize(obj.find(".modal-header"), 6) + obj.find(".modal-header").height(),
      footH = basicFE.elm.getObjSize(obj.find(".modal-footer"), 6) + obj.find(".modal-footer").height(),
      rst = obj.height() - headH - footH;
   if (basicFE.elm.getObjSize(obj.find(".modal-body"), 6) + obj.find(".modal-body").height() > (uH - headH - footH - 60)) {
      rst = (uH - headH - footH - 60);
      obj.find(".modal-body").css({
         'height': rst + 'px',
         'overflow-x': 'hidden',
         'overflow-y': 'auto'
      });
   }
   if (typeof(fn) == "function") {
      fn(rst);
   }
}

function bindCloseEventToModal(id, fn) { //removeElement
   var farBy = $(window.top.document.body),
      son = farBy.find(id);
   json = {
      "name": '',
      "son": ''
   };
   son.on('hidden.bs.modal', function(e) {
      farBy.find(".js-efrexp-bubbleTilTex-box").remove();
      farBy.find("#backdropId").remove();
      son.remove();
      if ($("body").hasClass("jsAdd-marR-17")) {
         $("body").removeClass("jsAdd-marR-17").css('margin-right', '0');
      }
   });
   son.find(".js-botsModal-reset").off('click');
   son.find(".js-botsModal-reset").on('click', function() {
      son.find(".js-botsReset-igt").val('');
      // if(ue != null) {
      // 	ue.setContent("");
      // }
      son.find(".js-botsReset-igt").eq(0).focus();
      if (typeof(fn) == "function") {
         json = {
            "name": 'reset',
            "son": son
         };
         fn(json);
      }
   });
   son.find(".js-botsModal-submit").off('click');
   son.find(".js-botsModal-submit").on('click', function() {
      //son.trigger('hidden.bs.modal');
      if (typeof(fn) == "function") {
         json = {
            "name": 'submit',
            "son": son
         };
         fn(json);
      }
   });
}

function creatIframeModalToParent(settings, fn) { //创建iframe modal
   var obj = {
      set: {
         zId: "modal-type-iframe",
         title: '弹窗标题',
         mission: false,
         src: '' //iframeSRC
      },
      windx: window.top, //window 指向
      farBy: null, //父级body
      init: function() { //初始化
         obj.extend().getVal().appendModel().cloneModel();
         return this;
      },
      extend: function() { //重载深拷贝
         if (typeof(settings) == 'object' && !settings.length)
            obj.set = $.extend({}, obj.set, settings);
         return this;
      },
      getVal: function() { //获取值及赋予变量
         var windx = obj.windx;
         obj.farBy = $(windx.document.body);
         return this;
      },
      cloneModel: function() { //克隆创建
         var oSe = obj.set,
            copyModal = $('#' + oSe.zId).clone();
         obj.farBy.append(copyModal);
         obj.countSize();
         obj.bindEvent();
      },
      appendModel: function() { //插入模型
         if ($('#' + obj.set.id).length < 1) { //模型不存在,插入本地模型
            $("body").append(obj.doms());
         };
         return this;
      },
      countSize: function() { //样式调整
         var oSe = obj.set,
            windW = obj.windx.document.documentElement.clientWidth,
            widx = 0;

         if (oSe.mission) {
            widx = '90%';
         } else {
            if (windW >= 1600) {
               widx = '50%';
            } else {
               widx = '70%';
            }
         }
         var modalBox = obj.farBy.find('#' + obj.set.zId);
         modalBox.find(".modal-dialog").css("width", widx);
         modalBox.find(".modal-title").text(oSe.title);
         modalBox.addClass('in').css('display', 'block');
         modalBox.find("#modal-iframe").attr('src', oSe.src);
         obj.farBy.append("<div id='backdropId' class='modal-backdrop fade in'></div>");
         var icont = obj.farBy.find(".js-mousescroll-content"),
            iwid = parseInt(icont.height()) - basicFE.elm.getObjSize(icont.find("iframe"), 6);
         if (typeof(parent.frames.iframeBox) !== 'undefined') {
            var ibdy = $(parent.frames.iframeBox.window.document.getElementsByTagName('body')[0]);
            if (iwid < ibdy.height()) {
               ibdy.addClass('jsAdd-marR-17').css('margin-right', '-17px');
            }
         };
         if (typeof(fn) == 'function') {
            fn();
         }
      },
      doms: function() { //模型结构
         var oSe = obj.set;
         var winheight = $(window.top).height() - 200;
         var missHeight = oSe.mission ? winheight : 480;
         return '<div id="' + oSe.zId + '" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content" style="width:100%; margin:0 auto;">' +
            '<div class="modal-header">' +
            '<button class="close" type="button" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '<h3 id="myModalLabel" class="modal-title">' + oSe.title + '</h3>' +
            '</div>' +
            '<div class="modal-body">' +
            '<iframe id="modal-iframe" class="modal-iframeClass" name="iframeModal" style="height:' + missHeight + 'px" src=""></iframe>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
      },
      bindEvent: function() {
         var farBy = obj.farBy,
            box = farBy.find('#' + obj.set.zId);
         box.find('.close').on('click', function(e) {
            farBy.find("#backdropId").remove();
            box.remove();
         });
      }
   };
   obj.init();
   return obj;
}

function modalPositionSizeBindSubmitEvent(fn) { //modal弹框按钮控制 及 scroll容器高度设置
   if (typeof(parent.frames["iframeModal"]) !== 'undefined') { //确保内容一屏制,方便scroll居中
      var uH = parent.frames["iframeModal"].window.document.documentElement.clientHeight;
      $("body").css({
         'height': uH,
         'opacity': 1
      });
   }
   $('.js-modalBtn-unify').off('click').on('click', function() { //按钮被点击
      var rest = {};
      if ($(this).is('.js-modalBtn-submit')) { //确定
         rest = {
            'cName': 'submit'
         };
      } else if ($(this).is('.js-modalBtn-cancel')) {
         rest = {
            'cName': 'cancel'
         };
      };
      if (typeof(fn) == 'function')
         fn(rest);
   });
}

function removeIframeModalToParent(settings) { //删除指定显示的Modal框 - [子级页调用]
   var obj = {
      set: {
         zId: 'modal-type-iframe', //id值
         windx: window.top //window 指向
      },
      init: function() { //初始化
         obj.extend().remove();
         return this;
      },
      extend: function() { //重载深拷贝
         if (typeof(settings) == 'object' && !settings.length)
            obj.set = $.extend({}, obj.set, settings);
         return this;
      },
      remove: function() {
         var oS = obj.set,
            windx = oS.windx,
            farBy = $(windx.document.body);
         farBy.find('#' + oS.zId).remove();
         farBy.find('#backdropId').remove();
      }
   };
   obj.init();
   return obj;
}

function pageTitleControl(model) { //修改子试题页面标题 新增or编辑
   var attr = [];
   if (model == 'edit') {
      attr = ['edit', '编辑'];
   } else if (model == 'creat') {
      attr = ['creat', '新增'];
   }
   $(".js-sonPage-title").attr('model-data', attr[0]).find(".crux").text(attr[1]);
}

function computeViewTreeHeightSetting() { //树高度设置
   var treeElm = $("#treeView"),
      header = $(".js-computeViewHeight-header"),
      contai = $(".js-computeViewHeight-container"),
      foot = $(".js-computeViewHeight-footer"),
      cHa = 0;
   cHa = header.height() + foot.height() + 30; //抛出5px误差值
   function set() {
      var h = window.innerHeight;
      treeElm.css({
         'height': h - cHa + 'px'
      });
   }
   set();
   $(window).resize(function() {
      set();
   });
}
function fePositionTexTips(str, data) {
   var set = {
      window: window.top,
      box: {
         sty: {
            "z-index": 1050
         }
      },
      duration: 3000
   };
   if (typeof(data) != "undefined") {
      for (i in data) {
         for (n in set) {
            if (i == n) {
               set[n] = data[i];
            }
         }
      }
   }
   $.positionTexTips({
      window: set.window,
      str: str,
      box: set.box,
      EnvSciModel: 'pc',
      clearAlien: true, //是否排除异己
      SpecialCode: '',
      duration: set.duration
   });
}

function baseTipsAreaBigAlerts(str, data) {
   var set = {
      window: window.top,
      body: $(window.top.document.body),
      menBan: {
         sty: {
            "z-index": 1050
         }
      }
   };
   if (typeof(data) != "undefined") {
      for (i in data) {
         for (n in set) {
            if (i == n) {
               set[n] = data[i];
            }
         }
      }
   }
   $.tipsAreaBigAlerts({
      window: set.window,
      body: set.body,
      text: str,
      menBan: set.menBan
   });
}

function baseConfrimTipsImportOrErorr(data, fn, erfn) {
   var set = {
         type: "alert", //erorr,alert
         window: window.top,
         title: "confirm组件框",
         class: "",
         btnType: "full", //full or half
         text: "我是一段提示文字",
         src: "/images/component/",
         removeCtrl: false,
         clickBtnArt: [
            ["type-no", "okBtn-IdB", "取消"],
            ["type-yes", "okBtn-IdA", "确定"]
         ],
         posIdx: 1060
      },
      dom = '',
      photos = 'HighPriorityFilled-75.png';
   if (typeof(data) != "undefined") {
      for (i in data) {
         for (n in set) {
            if (i == n) {
               set[n] = data[i];
            }
         }
      }
   }
   if (set.type == "erorr") {
      photos = 'ErorrWindowFilled-75.png';
   }
   dom = '<p style="padding-left:30px; height:25px; box-sizing:border-box; background:url(' + set.src + photos + ') left center no-repeat; background-size:20px; display:inline-block;">' +
      set.text +
      '</p>';
   $.creat_confirm({
      window: set.window,
      title: set.title,
      class: set.class,
      btnType: set.btnType,
      EnvSciModel: "pc",
      contJson: [{
         freeDom: [true, dom, "js-typeId-crtConfirm-3", "js-typeClas-crtConfirm-3"]
      }],
      removeCtrl: set.removeCtrl,
      posBoxSty: {
         "z-index": set.posIdx
      },
      typeContSty: {
         aButton: {
            public: {
               "color": "#05a9e6",
               "text-decoration": "none"
            }
         }
      },
      clickBtnArt: set.clickBtnArt,
      callback: function(iThis) {
         if (typeof(fn) == "function" && iThis.is("#okBtn-IdA")) {
            fn();
         }
         if (typeof(erfn) == "function" && iThis.is("#okBtn-IdB")) {
            erfn();
         }
      }
   });
}

function requestPubVarArr(str, type) { //负责请求列队操作
   var rst = true;
   if (!str && str !== 'undefined' && str !== undefined) {
      if (window.top.fneVar.controller.requesCodeArr.length == 0) {
         if (type == 'goIn') {
            window.top.fneVar.controller.requesCodeArr.push(str);
         }
      } else {
         for (var i = 0; i < window.top.fneVar.controller.requesCodeArr.length; i++) {
            if (type == 'goIn') {
               if (window.top.fneVar.controller.requesCodeArr[i] == str) {
                  rst = false;
                  break;
               }
               if (window.top.fneVar.controller.requesCodeArr.length - 1 == i) {
                  if (window.top.fneVar.controller.requesCodeArr[i] !== str) {
                     window.top.fneVar.controller.requesCodeArr.push(str);
                     break;
                  }
               }
            }
            if (type == 'goOut') {
               if (typeof window.top.fneVar.controller.requesCodeArr[i] !== 'undefined' && window.top.fneVar.controller.requesCodeArr[i].indexOf(str) > -1) {
                  window.top.fneVar.controller.requesCodeArr.splice(i, 1);
                  break;
               }
            }
         }
      }
   }
   return rst;
}

function clearThePageRequesCodeArr(stringDou) { //清除指定 fneVar.controller.requesCodeArr 常用于复杂请求页面初始化执行
   if (typeof(stringDou) == 'string') {
      var arr = [];
      if (stringDou.indexOf(',') > -1) {
         arr = stringDou.split(',');
      } else {
         arr.push(stringDou);
      }
      for (var i = 0; i < arr.length; i++) {
         for (var n = 0; n < window.top.fneVar.controller.requesCodeArr.length; n++) {
            if (arr[i] == window.top.fneVar.controller.requesCodeArr[n]) {
               window.top.fneVar.controller.requesCodeArr.splice(n, 1);
            }
         }
      }
   }
}

function requestFrontEnd(rType, url, data, succfn, errfn) { //front-end request
   var newDatas
   if (data && data.encryption === false) { // 不加密参数
      newDatas = data
   } else {
      var rqstr = "appSrvRequest=",
         neir = data.substring(data.indexOf(rqstr) + (rqstr.length), data.length - 1),
         clearn = neir.substring(1, neir.length),
         arr = clearn.split(','),
         aisa = ""
      for (var i = 0; i < arr.length; i++) {
         aisa = arr[i].split(':');
         if (aisa[0].indexOf("bizCode") > -1) {
            break;
         }
      }
      if (requestPubVarArr(aisa[1], 'goIn')) {
         $.base64.utf8encode = true;
         newDatas = data !== 'requestPaper' ? data : '',
            prefix = "appSrvRequest=";
         if (data.indexOf(prefix) > -1) {
            newDatas = newDatas.substring(prefix.length);
         }
         var base64Str = encodeURIComponent($.base64.encode(newDatas));
         newDatas = base64Str === '' ? base64Str : prefix + base64Str;
      } else return
   }
   $.ajax({
      type: rType,
      dataType: "json",
      cache: false,
      url: url,
      data: newDatas,
      // beforeSend: function() {},
      complete: function (xhr, ts) {
         var cJson = {};
         if (xhr && xhr.responseText && xhr.responseText.length > 0) {
            cJson = JSON.parse(xhr.responseText);
         }
         var resetBizCode = aisa[1]; //不标准返回时采用请求前的bizCode
         if (undefined != cJson.bizCode) { //标准返回的采用返回bizCode
            resetBizCode = cJson.bizCode;
         }
         requestPubVarArr(resetBizCode, 'goOut');
      },
      success: function (jsonData) {
         if (data == 'requestPaper' && typeof (succfn) == "function") {
            succfn(jsonData);
         }
         // excessiveViewOverbase(); //clear loadMask
         else if (typeof (jsonData.code) != "undefined") {
            var jsRet = jsonData;
            if (jsRet.code == "000000") {
               if (typeof (succfn) == "function") {
                  succfn(jsonData);
               }
            } else {
               if (jsRet.code == "-S00001" || jsRet.code == "-S00002") { //登录超时、未有权限
                  if ($(".js-apdful-farw").find(".js-s00001or2").length == 0) {
                     baseConfrimTipsImportOrErorr({
                        type: "erorr",
                        title: "系统提示",
                        class: "js-s00001or2",
                        text: jsRet.errMsg,
                        src: fneVar.controller.baseIMG.imgA
                     }, function () {
                        if (jsRet.code == "-S00001") {
                           window.top.location.href = '' + jsRet.ret.redirectUrl;
                        }
                     });
                  }
               } else {
                  baseConfrimTipsImportOrErorr({
                     type: "erorr",
                     title: "系统提示",
                     text: jsRet.errMsg,
                     src: fneVar.controller.baseIMG.imgA
                  }, function () {
                     $.removeSvgload({
                        body: $(window.document.body),
                        time: 0
                     });
                  });
               }
               if (typeof (errfn) == "function") {
                  errfn(jsRet);
               }
            }
         }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
         //XMLHttpRequest={"readySate":0, "responseText":"", "status":0, "statusText":"error"} 
         // console.log("XMLHttpRequest=" + JSON.stringify(XMLHttpRequest));
         //textStatus=error
         excessiveViewOverbase(); //clear loadMask
         requestPubVarArr(aisa[1], 'goOut');
         if (undefined != XMLHttpRequest.errMsg) {
            baseConfrimTipsImportOrErorr({
               type: "erorr",
               title: "系统提示",
               text: XMLHttpRequest.errMsg,
               src: fneVar.controller.baseIMG.imgA
            }, null);
         }
         if (typeof (errfn) == "function") {
            errfn(XMLHttpRequest, textStatus);
         }
      }
   });
}

function cropDateForNumbers(dateString) { //合计切割时间 格式为 -> 2016-12-23 07:32
   var rst = '';
   aArr = dateString.split(' '),
      fh = '-';
   for (var i = 0; i < aArr.length; i++) {
      if (i == 1) {
         fh = ":";
      }
      aArr[i] = aArr[i].split(fh);
   }
   for (var i = 0; i < aArr.length; i++) {
      for (var n = 0; n < aArr[i].length; n++) {
         var g = aArr[i][n];
         if (g.length == 1) {
            g = '0' + g;
         }
         rst += g;
      }
   }
   return rst;
}

function creatAddsNewOptions(joData) { //创建按钮集合框体
   var obj = {
      result: {
         cName: '',
         data: null
      },
      randerOption: [1, 2, 3], //arr default [1,2,3],1~5种题型排序,渲染对应题型
      var: {
         uWid: '', //指定window尺寸 w or h
         uHgt: '',
         setWid: 770, //框体成像尺寸 允许格式(1,'1px','1%')
         setHgt: '50%', //h
         commonDOM: '', //普通题	common
         listenDOM: '', //听力题	listen
         spokenDOM: '', //口语题	spoken
         materialDOM: '', //素材		material
         baseSpkDOM: '', //基础口语	baseSpk
         insdData: {
            window: window.top,
            renderType: 1, //默设1,试题录制为1、组题规则为2;
            title: "这是窗体标题",
            stilA: "普通题型",
            stilB: "听力题型",
            stilC: "口语题型",
            stilD: "口语素材题型",
            stilE: "口语基本题型",
            data: {}
         }
      },
      matchData: [{
         code: 'prompt',
         icon: 'exclamation-sign',
         cname: '提示音'
      }, {
         code: 'broadcast',
         icon: 'music',
         cname: '播音'
      }, {
         code: 'video',
         icon: 'film',
         cname: '视频'
      }, {
         code: 'countdown',
         icon: 'time',
         cname: '倒计时'
      }, {
         code: 'welcome',
         icon: 'send',
         cname: '欢迎'
      }, {
         code: 'picture',
         icon: 'picture',
         cname: '图片'
      }, {
         code: 'word',
         icon: 'list-alt',
         cname: '文字'
      }, {
         code: 'everyoneTalks',
         icon: 'user',
         cname: '人人对话题'
      }, {
         code: 'articleSummary',
         icon: 'list-alt',
         cname: '文章概括题'
      }, {
         code: 'articleReading',
         icon: 'list-alt',
         cname: '文章朗读题'
      }, {
         code: 'articleAsk',
         icon: 'list-alt',
         cname: '文章问答题'
      }, {
         code: 'videoSummary',
         icon: 'film',
         cname: '视频朗读题'
      }, {
         code: 'videoReading',
         icon: 'film',
         cname: '视频朗读题'
      }, {
         code: 'videoAsk',
         icon: 'film',
         cname: '视频问答题'
      }, {
         code: 'figureSummary',
         icon: 'picture',
         cname: '看图概括题'
      }, {
         code: 'figureAsk',
         icon: 'picture',
         cname: '看图问答题'
      }, {
         code: 'audioSummary',
         icon: 'music',
         cname: '音频概括题'
      }, {
         code: 'audioAsk',
         icon: 'music',
         cname: '音频问答题'
      }, {
         code: 'singleTalk',
         icon: 'user',
         cname: '单向对话题'
      }],
      elm: {
         wObj: '' //当前$body
      },
      ini: function() {
         var insd = obj.var.insdData;
         for (i in joData) {
            for (n in insd) {
               if (i == n) {
                  obj.var.insdData[n] = joData[i];
               }
            }
         }
         obj.result['cName'] = 'ini';
         obj.elm.wObj = $(insd.window.document.body),
            obj.var.uWid = insd.window.document.documentElement.clientWidth,
            obj.var.uHgt = insd.window.document.documentElement.clientHeight;
         obj.forCreatDoms();
         obj.creatDoms();
         obj.bindEvent();
      },
      creatButtonBase: function(oJs) { //基础按钮
         return '<a class="btn btn-sm ' + oJs['btnName'] + '" fne-id="' + oJs['idata'].id + '" fne-codeName="' + oJs['idata'].code + '" itemTypeId="' + oJs['idata'].id + '" url="' + oJs['url'] + '" jump-href="' + oJs['url'] + '" href="javascript:;">' + oJs['idata'].name + '</a>';
      },
      creatButtonPic: function(oJs) { //图片按钮
         return '<a class="btn btn-sm ' + oJs['btnName'] + ' glyphicon glyphicon-' + obj.codeNameMacthInfo(oJs['idata'].code).icon + '" fne-id="' + oJs['idata'].id + '" fne-codeName="' + oJs['idata'].code + '" itemTypeId="' + oJs['idata'].id + '" url="' + oJs['url'] + '" jump-href="' + oJs['url'] + '" href="javascript:;">&nbsp;' + oJs['idata'].name + '</a>';
      },
      codeNameMacthInfo: function(code) { //根据code匹配相关信息
         var arr = obj.matchData;
         for (var i = 0; i < arr.length; i++) {
            if (arr[i].code == code) {
               return arr[i];
            }
         }
      },
      forCreatDoms: function() { //数据分析拼存结构
         var joData = obj.var.insdData.data,
            renderType = obj.var.insdData.renderType;
         for (var i = 0; i < joData.length; i++) {
            var urls = '';
            if (typeof(joData[i].pageName) !== "undefined") {
               urls = obj.typeIsTemplateOrDianti(renderType, joData[i]);
            }
            if (joData[i].type == 1) { //基础题
               obj.var.commonDOM += obj.creatButtonBase({
                  btnName: 'btn-success',
                  url: urls,
                  idata: joData[i]
               });
            } else if (joData[i].type == 2) { //听力题
               obj.var.listenDOM += obj.creatButtonBase({
                  btnName: 'btn-warning',
                  url: urls,
                  idata: joData[i]
               });
            } else if (joData[i].type == 3) { //口语题
               obj.var.spokenDOM += obj.creatButtonBase({
                  btnName: 'btn-success',
                  url: urls,
                  idata: joData[i]
               });
               /*测试创建大量
               for(var p=0;p<30;p++){
               	var ookk={'name':'第'+(p+1)+'题', 'id':p};
               	obj.var.spokenDOM+=obj.creatButtonPic({btnName:'btn-success', url:'ooxxxxx.html', idata:ookk});
               }*/
            } else if (joData[i].type == 4) { //口语素材题
               obj.var.materialDOM += obj.creatButtonPic({
                  btnName: 'btn-success',
                  url: urls,
                  idata: joData[i]
               });
            } else if (joData[i].type == 5) { //口语基础题
               obj.var.baseSpkDOM += obj.creatButtonPic({
                  btnName: 'btn-warning',
                  url: urls,
                  idata: joData[i]
               });
            }
         }
      },
      typeIsTemplateOrDianti: function(type, idata) { //分析为模板or试题
         return (1 == type ? idata['pageName'] : idata['rulePage']);
      },
      componentStyle: function() { //组件样式
         var menb = '.addsNewOption-menban .wrap';
         return '<style>' +
            menb + '{ position:relative; text-align:left; padding:46px 10px 60px; background:#fff; border-radius:6px; }' +
            menb + ' .title{ position:absolute; left:0; top:10px; padding:0 10px; width:100%; line-height:26px; }' +
            menb + ' .title span{ float:left; padding:0 10px; width:100%; color:#fff; background:#c7c7c7; border-radius:4px; box-sizing:border-box;}' +
            menb + ' .insbtnContent-wrap{ float:left; width:100%;}' +
            menb + ' .aBx{ float:left; margin-top:10px; padding:0 14px; width:100%; box-sizing:border-box;}' +
            menb + ' .aBx a{ margin:4px;}' +
            menb + ' .closebtn{ position:absolute; bottom:16px; margin:0 auto; padding:0 14px; text-align:center; width:100px; line-height:28px; color:#b7b7b7; background:#f1f1f1; border:1px solid #ccc; border-radius:2px; display:inline-block;}' +
            menb + ' .closebtn:hover{ background:#e6e6e6;}' +
            menb + ' .closeX{ position:absolute; right:10px; top:10px; width:26px; height:26px; background:url(../images/general/icons-white-delete.png) center no-repeat; box-sizing:border-box; transition:all ease 0.5s;}' +
            menb + ' .closeX:hover{ transform:rotate(180deg);}' +
            '</style>';
      },
      creatContentBtn: function() { //根据渲染规则创建内容按钮结构 randerOption
         var rop = obj.randerOption;
         if (typeof(rop) == 'object' && rop.length > 0) {
            var allDom = '',
               title = null,
               dom = null;
            for (var i = 0; i < rop.length; i++) {
               if (rop[i] == 1) { //基本题型
                  title = obj.var.insdData.stilA;
                  dom = obj.var.commonDOM;
               }
               if (rop[i] == 2) { //听力题型
                  title = obj.var.insdData.stilB;
                  dom = obj.var.listenDOM;
               }
               if (rop[i] == 3) { //口语题型
                  title = obj.var.insdData.stilC;
                  dom = obj.var.spokenDOM;
               }
               if (rop[i] == 4) { //口语素材
                  title = obj.var.insdData.stilD;
                  dom = obj.var.materialDOM;
               }
               if (rop[i] == 5) { //口语基础题型
                  title = obj.var.insdData.stilE;
                  dom = obj.var.baseSpkDOM;
               }
               allDom += '<div class="aBx"><h5>' + title + '</h5>' + dom + '</div>';
            };
            return allDom;
         } else {
            throw 'the component obj.randerOption is not array';
         }
      },
      creatDoms: function() {
         var cDoms = '<div class="addsNewOption-menban" style="position:absolute; left:0; top:0; width:100%; height:' + obj.var.uHgt + 'px; background:rgba(0,0,0,0.5); z-index:90;">' +
            '<div class="wrap clearfix">' +
            '<div class="title"><span>' + obj.var.insdData.title + '</span></div>' +
            '<a class="closeX js-closed-btn" href="javascript:;"></a>' +
            '<div class="insbtnContent-wrap">' +
            obj.creatContentBtn() +
            '</div>' +
            '<a class="closebtn js-closed-btn" href="javascript:;">关闭窗口</a>' +
            '</div>' +
            obj.componentStyle() +
            '</div>';
         $(obj.var.insdData.window.document.body).append(cDoms);
         obj.setWidAndHgt();
      },
      setWidAndHgt: function() { //设置尺寸
         var oJs = obj.analyseSetValue(),
            menb = obj.elm.wObj.find(".addsNewOption-menban"),
            wrap = menb.find(".wrap"),
            clsbtn = wrap.find(".closebtn");
         menb.css('height', obj.var.uHgt);
         wrap.css({
            "margin-left": oJs['left'] + "px",
            "margin-top": oJs['top'] + "px",
            "width": oJs['width'] + "px"
         });
         if (oJs.height < wrap.find(".insbtnContent-wrap").height()) { //超出高时存在scroll样式
            wrap.find(".insbtnContent-wrap").css('overflow-y', 'scroll');
         }
         wrap.find(".insbtnContent-wrap").css({
            "height": oJs.height + "px"
         });
         clsbtn.css({
            "left": (oJs.width - clsbtn.width() - (parseInt(wrap.css('padding-left')) + parseInt(wrap.css('padding-right')))) / 2 + "px"
         });
      },
      analyseSetValue: function() { //分析设置数据
         var wid = obj.analyseOnceValue('width', obj.var.setWid),
            hgt = obj.analyseOnceValue('height', obj.var.setHgt);
         return {
            left: (obj.var.uWid - wid) * .5,
            top: (obj.var.uHgt - hgt) * .38,
            width: wid,
            height: hgt
         }
      },
      analyseOnceValue: function(type, value) { //分析单个数据 number/string/%
         var val = '',
            bwsSize = '';
         if (type == 'width') {
            bwsSize = obj.var.uWid;
         } else {
            bwsSize = obj.var.uHgt;
         }
         if (typeof(value) == 'number' || (!isNaN(parseInt(value)) && value.indexOf('%') < 0)) {
            val = parseInt(value);
         } else if (value.indexOf('%') > 0) {
            if (parseInt(value) == 100) {
               throw "don't setting the component height 100%!!!";
            }
            val = bwsSize * (parseInt(value) * 0.01);
         }
         if (type == 'height') {
            val -= basicFE.elm.getObjSize(obj.elm.wObj.find(".addsNewOption-menban").find(".wrap"), 6);
         }
         return val;
      },
      removeWids: function() { //删除窗口
         $(obj.var.insdData.window).off('resize');
         if (obj.elm.wObj.find(".addsNewOption-menban").length > 0) {
            obj.elm.wObj.find(".addsNewOption-menban").remove();
         }
      },
      bindEvent: function() { //事件绑定
         var wrap = obj.elm.wObj.find(".addsNewOption-menban"),
            btn = wrap.find(".btn"),
            clb = wrap.find(".js-closed-btn");
         btn.off('click');
         btn.on('click', function() {
            obj.result['cName'] = 'clickJumpHref';
            obj.result['data'] = {
               'this': $(this),
               'self': obj
            };
            obj.callback(obj.result);
         });
         clb.off('click');
         clb.on('click', function() {
            obj.removeWids();
         });
         $(obj.var.insdData.window).resize(function() {
            var insd = obj.var.insdData;
            obj.var.uWid = insd.window.document.documentElement.clientWidth,
               obj.var.uHgt = insd.window.document.documentElement.clientHeight;
            obj.setWidAndHgt();
         });
      },
      callback: function(rst) {}
   };
   return obj;
}

function basefncreatViewtree() { //creat kendo tree
   this.id = "#treeView";
   this.tempId = "#treeview-template";
   //this.HierarchicalDataSource=[{categoryName:"第一部分  听力",expanded:true,subCategories:[{subCategoryName:"第一节"},{subCategoryName:"第二节"},{subCategoryName:"第三节"}]},{categoryName:"第二部分  阅读",expanded:true,subCategories:[{subCategoryName:"第一节"},{subCategoryName:"第二节"},{subCategoryName:"第三节"}]},{categoryName:"第三部分 写作",expanded:true,subCategories:[{subCategoryName:"第一节"},{subCategoryName:"第二节"},{subCategoryName:"第三节"}]}];
   this.HierarchicalDataSource = [{
      id: 1,
      text: "mydocument",
      expanded: true,
      items: [{
         id: 2,
         text: "mydocumentSD",
         expanded: true,
         items: [{
            id: 3,
            text: 'aaaaaaa'
         }, {
            id: 3,
            text: 'bbbbbbb'
         }, {
            id: 3,
            text: 'ccccccc'
         }]
      }]
   }];
   this.Hierarchicalmodel = {
      model: {
         children: "subCategories"
      }
   };
   this.dataTextField = ["categoryName", "subCategoryName"];
   this.creatHierarchical = function() {
      var viewData = new kendo.data.HierarchicalDataSource({
         data: this.HierarchicalDataSource,
         schema: this.Hierarchicalmodel
      });
      return viewData;
   }
   this.creatViewtree = function(func) {
      $(this.id).kendoTreeView({
         animation: false,
         template: kendo.template($(this.tempId).html()),
         dataSource: this.creatHierarchical(),
         dataTextField: this.dataTextField,
         select: func
      });
   }
}

function UEditorRegister(id, settings) { //baidu-UEditor 编辑器插件注册生成
   UE.delEditor('_editor'); //防止其报错
   var defualts = {
      allowDivTransToP: false, //阻止转换div 为p
      // serverUrl : "",  
      // imageActionName : "http://127.0.0.1:8942/nets-web/fileupload/upload.do",
      // imageFieldName: "upfile", /* 提交的图片表单名称 */
      // imageMaxSize: 2048000, /* 上传大小限制，单位B */
      // imageAllowFiles: [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
      // imageCompressEnable: true, /* 是否压缩图片,默认是true */
      // imageCompressBorder: 1600, /* 图片压缩最长边限制 */
      // imageInsertAlign: "none", /* 插入的图片浮动方式 */
      // imagePathFormat : "/nets-web/resources/{filename}"
      // 这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
      toolbars: [
         [ //工具栏配置器
            'source', //html源码
            'undo', //撤销
            'redo', //重做
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'selectall', //全选
            'horizontal', //分隔线
            'removeformat', //清除格式
            'unlink', //取消链接
            'insertrow', //前插入行
            'insertcol', //前插入列
            'mergeright', //右合并单元格
            'mergedown', //下合并单元格
            'deleterow', //删除行
            'deletecol', //删除列
            'splittorows', //拆分成行
            'splittocols', //拆分成列
            'splittocells', //完全拆分单元格
            'deletecaption', //删除表格标题
            'inserttitle', //插入标题
            'mergecells', //合并多个单元格
            'inserttable', //插入表格
            'deletetable', //删除表格
            'cleardoc', //清空文档
            'insertparagraphbeforetable', //"表格前插入行"
            'fontfamily', //字体
            'fontsize', //字号
            'paragraph', //段落格式
            'simpleupload', //单图上传
            'edittable', //表格属性
            'edittd', //单元格属性
            'link', //超链接
            'spechars', //特殊字符
            'searchreplace', //查询替换
            'justifyleft', //居左对齐
            'justifyright', //居右对齐
            'justifycenter', //居中对齐
            'justifyjustify', //两端对齐
            'forecolor', //字体颜色
            'backcolor', //背景色
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'directionalityltr', //从左向右输入
            'directionalityrtl', //从右向左输入
            'rowspacingtop', //段前距
            'rowspacingbottom', //段后距
            'imagenone', //默认
            'imageleft', //左浮动
            'imageright', //右浮动
            'imagecenter', //居中
            'lineheight', //行间距
            'edittip ', //编辑提示
            'customstyle', //自定义标题
            'autotypeset', //自动排版
            'touppercase', //字母大写
            'tolowercase', //字母小写
            'background', //背景
            'charts', //图表
         ]
      ],
      //focus时自动清空初始化时的内容
      //autoClearinitialContent:true,
      wordCount: true, //关闭字数统计
      elementPathEnabled: false, //关闭elementPath
      initialFrameWidth: '100%',
      initialFrameHeight: 240, //默认的编辑区域高度
      autoFloatEnabled: false,
      autoHeightEnabled: false,
      scaleEnabled: false, //编辑器是否支持拖拽
      //指定富文本框里换行用<br/>标签（如果不指定的话每段换行文字都会用<p>标签包裹）
      enterTag: 'br',
   //    pasteplain:true,
   //    'filterTxtRules' : function(){
   //       return {
   //          //直接删除及其字节点内容
   //          '-' : 'script style object iframe embed input select',
   //          'img': function (node) {
   //             var src = node.getAttr('src');
   //             node.setAttr();
   //             node.setAttr({'src':src})
   //          },
   //          'table': function (node) {
   //             UE.utils.each(node.getNodesByTagName('table'), function (t) {
   //                 UE.utils.each(t.getNodesByTagName('tr'), function (tr) {
   //                     var p = UE.uNode.createElement('p'), child, html = [];
   //                     while (child = tr.firstChild()) {
   //                         html.push(child.innerHTML());
   //                         tr.removeChild(child);
   //                     }
   //                     p.innerHTML(html.join('&nbsp;&nbsp;'));
   //                     t.parentNode.insertBefore(p, t);
   //                 })
   //                 t.parentNode.removeChild(t)
   //             });
   //             var val = node.getAttr('width');
   //             node.setAttr();
   //             if (val) {
   //                 node.setAttr('width', val);
   //             }
   //         },
   //         'tbody': {$: {}},
   //         'th': {$: {}},
   //         'td': {$: {valign: 1, align: 1,rowspan:1,colspan:1,width:1,height:1}},
   //         'tr': {$: {}}
   //       }
   //   }()
         ///,iframeCssUrl:"css/bootstrap/css/bootstrap.css" //引入自身 css使编辑器兼容你网站css
         //更多其他参数，请参考ueditor.config.js中的配置项
   }
   if (typeof(settings) == 'object') { //数据重载
      defualts = $.extend(true, defualts, settings, true);
      if (settings['toolbarSchemeModel'] != undefined) { //有传入工具栏方案
         defualts['toolbars'] = [toolbarSchemeModel(settings['toolbarSchemeModel'])];
      }
   }

   function toolbarSchemeModel(type) { //工具栏方案任意扩充
      if (type == 1) {
         if (window.top.location.href.indexOf('demo=true&') >= 0) {
            return ['undo', 'redo', 'bold', 'italic', 'underline', 'inserttable', 'deletetable', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', 'simpleupload'];
         } else {
            return [
               'undo', //撤销
               'redo', //重做
               'bold', //加粗
               'italic', //斜体
               'underline', //下划线
               'fontborder', //字符边框
               'strikethrough', //删除线
               'superscript', //上标
               'subscript', //下标
               'forecolor', //字体颜色
               'backcolor', //背景色
               'rowspacingtop', //段前距
               'rowspacingbottom', //段后距
               'lineheight', //行间距
               'inserttitle', //插入标题
               'paragraph', //段落格式
               'fontfamily', //字体
               'fontsize', //字号
               'justifyleft', //居左对齐
               'justifyright', //居右对齐
               'justifycenter', //居中对齐
               'justifyjustify', //两端对齐
               'touppercase', //字母大写
               'tolowercase', //字母小写
               'simpleupload', //单图上传
               'horizontal', //分隔线
               'spechars', //特殊字符
               'inserttable', //插入表格
               'deletetable', //删除表格
               'insertrow', //前插入行
               'insertcol', //前插入列
               'mergeright', //右合并单元格
               'mergedown', //下合并单元格
               'deleterow', //删除行
               'deletecol', //删除列
               'splittorows', //拆分成行
               'splittocols', //拆分成列
               'splittocells', //完全拆分单元格
               'deletecaption', //删除表格标题
               'inserttitle', //插入标题
               'mergecells', //合并多个单元格
               'waveline',// 波浪线
               'circle',// 圆点
            ];
         }
      }
      return '!!!Please check the incoming type --> toolbarSchemeModel';
   }
   defualts.enableAutoSave = false;
   return UE.getEditor(id, defualts);
}

function createFormDesign(id, height) { //UEditor 编辑器插件
   if (!height || typeof(height) != "number") {
      height = 300;
   }
   UE.delEditor('_editor');
   var leipiEditor = UE.getEditor(id, {
      allowDivTransToP: false, //阻止转换div 为p
      // serverUrl : "",  
      // imageActionName : "http://127.0.0.1:8942/nets-web/fileupload/upload.do",
      // imageFieldName: "upfile", /* 提交的图片表单名称 */
      // imageMaxSize: 2048000, /* 上传大小限制，单位B */
      // imageAllowFiles: [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
      // imageCompressEnable: true, /* 是否压缩图片,默认是true */
      // imageCompressBorder: 1600, /* 图片压缩最长边限制 */
      // imageInsertAlign: "none", /* 插入的图片浮动方式 */
      // imagePathFormat : "/nets-web/resources/{filename}"
      // 这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
      toolbars: [
         [
            'undo', //撤销
            'redo', //重做
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            //'subscript',   //下标
            'fontborder', //字符边框
            //'superscript', //上标
            //'formatmatch',    //格式刷
            //@'selectall',   //全选
            //@'horizontal',  //分隔线
            'removeformat', //清除格式
            'unlink', //取消链接
            //'insertrow',   //前插入行
            //'insertcol',   //前插入列
            //'mergeright',  //右合并单元格
            //'mergedown',   //下合并单元格
            //'deleterow',   //删除行
            //'deletecol',   //删除列
            //'splittorows', //拆分成行
            //'splittocols', //拆分成列
            //'splittocells',//完全拆分单元格
            'deletecaption', //删除表格标题
            'inserttitle', //插入标题
            //'mergecells',  //合并多个单元格
            'inserttable', //插入表格
            'deletetable', //删除表格
            'cleardoc', //清空文档
            //'insertparagraphbeforetable', //"表格前插入行"
            'fontfamily', //字体
            'fontsize', //字号
            'paragraph', //段落格式
            'simpleupload', //单图上传
            //'edittable',      //表格属性
            //'edittd',      //单元格属性
            'link', //超链接
            'spechars', //特殊字符
            'searchreplace', //查询替换
            'justifyleft', //居左对齐
            'justifyright', //居右对齐
            'justifycenter', //居中对齐
            'justifyjustify', //两端对齐
            'forecolor', //字体颜色
            //'backcolor',      //背景色
            //'insertorderedlist',   //有序列表
            //'insertunorderedlist', //无序列表
            //@'directionalityltr',   //从左向右输入
            //@'directionalityrtl',   //从右向左输入
            //'rowspacingtop',       //段前距
            //'rowspacingbottom',    //段后距
            //@'imagenone',   //默认
            //@'imageleft',   //左浮动
            //@'imageright',  //右浮动
            //'imagecenter', //居中
            //'lineheight',     //行间距
            //'edittip ',       //编辑提示
            //'customstyle',    //自定义标题
            //'autotypeset',    //自动排版
            //@'touppercase', //字母大写
            //@'tolowercase', //字母小写
            //@'background',     //背景
            //@'charts',      //图表
         ]
      ],
      //focus时自动清空初始化时的内容
      //autoClearinitialContent:true,
      //关闭字数统计
      //wordCount:false,
      //关闭elementPath
      elementPathEnabled: false,
      //默认的编辑区域高度
      initialFrameHeight: height,
      autoFloatEnabled: false,
      autoHeightEnabled: false,
      initialFrameWidth: '100%',
      //指定富文本框里换行用<br/>标签（如果不指定的话每段换行文字都会用<p>标签包裹）
      enterTag: 'br'
         ///,iframeCssUrl:"css/bootstrap/css/bootstrap.css" //引入自身 css使编辑器兼容你网站css
         //更多其他参数，请参考ueditor.config.js中的配置项
   });
   //自定义插件1
   /*UE.registerUI('插入占位符', function(editor, uiName) {
       //注册按钮执行时的command命令，使用命令默认就会带有回退操作
       editor.registerCommand(uiName, {
           execCommand: function() {
               alert('execCommand:' + uiName)
           }
       });
       //创建一个button
       var btn = new UE.ui.Button({
           //按钮的名字
           name: uiName,
           //提示
           title: uiName,
           //添加额外样式，指定icon图标，这里默认使用一个重复的icon
           cssRules: 'background-position: -500px 0;',
           //点击时执行的命令
           onclick: function() {
               //这里可以不用执行命令,做你自己的操作也可
               //editor.execCommand(uiName);
               editor.execCommand('inserthtml', '<span>##</span>');
               //editor.destroy();
           }
       });
       //当点到编辑内容上时，按钮要做的状态反射
       editor.addListener('selectionchange', function() {
           var state = editor.queryCommandState(uiName);
           if (state == -1) {
               btn.setDisabled(true);
               btn.setChecked(false);
           } else {
               btn.setDisabled(false);
               btn.setChecked(state);
           }
       });
       //因为你是添加button,所以需要返回这个button
       return btn;
   });*/
   //自定义插件2
   /*
   UE.registerUI('inputbox',function(editor,uiName){
       //创建dialog
       var dialog = new UE.ui.Dialog({
           //指定弹出层中页面的路径，这里只能支持页面,因为跟addCustomizeDialog.js相同目录，所以无需加路径
           iframeUrl: '/js/ueditor1_4_3/dialogs/inputbox/inputboxPage.html',
           //需要指定当前的编辑器实例
           editor:editor,
           //指定dialog的名字
           name:uiName,
           //dialog的标题
           title:"插入占位符",
           //指定dialog的外围样式
           cssRules:"width:300px;height:80px;",
           //如果给出了buttons就代表dialog有确定和取消
           buttons:[
               {
                   className:'edui-okbutton',
                   label:'确定',
                   onclick:function () {
                       dialog.close(true);
                   }
               },
               {
                   className:'edui-cancelbutton',
                   label:'取消',
                   onclick:function () {
                       dialog.close(false);
                   }
               }
           ]});
       //参考addCustomizeButton.js //指定toolbars上自定义插件按钮
       var btn = new UE.ui.Button({
           name:'inputbox' + uiName,
           title:'插入占位符',
           //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
           cssRules : 'background-position: -241px -19px;',
           onclick: function () {
               //渲染dialog
               dialog.render();
               dialog.open();
           }
       });
       //当点到编辑内容上时，按钮要做的状态反射
       editor.addListener('selectionchange', function() {
           var state = editor.queryCommandState(uiName);
           if (state == -1) {
               btn.setDisabled(true);
               btn.setChecked(false);
           }else {
               btn.setDisabled(false);
               btn.setChecked(state);
           }
       });
       return btn;
   });*/
   return leipiEditor;
}
//增加UE编辑器
starsId = 1, 
couter = 1; // 确保完型填空选择项id不重复
var prefixArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'i', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var ues = [];
var fillItemsUes = {}
function addUeInfo(type, seleEle, htmlContent) {
   if (seleEle && !fillItemsUes[seleEle]) {
      fillItemsUes[seleEle] = 'init'
   }
   var isFillItems = seleEle
   var seleEle = seleEle || '#answer-singleULwrap'
   couter++
   starsId++;
   if (isFillItems) { // 完型填空的选项创建开始值计算不同
      starsId = ($(seleEle).find('input').length += 2)
   }
   if ((starsId - 1) >= 27) {
      window.top.fePositionTexTips('最大创建26条选项');
      return false;
   }
   var option = prefixArr[$(seleEle).find('input').length],
      Id = isFillItems ? isFillItems + '-myEditor' + (starsId - 1) + '-' + couter : 'myEditor' + (starsId - 1), // 完型填空的id
      checkType = '';
   if (type == 1) {
      checkType = 'radio';
   } else {
      checkType = 'checkbox';
   }
   /**
    * modify by ZhangH 2018-7-26
    * 变更初级命题业务需求
    */
   // var isShowAnalyzeAndModel = gUrlParam && [4, 5].indexOf(parseInt(gUrlParam.subjectId)) > -1;
   var isShowAnalyzeAndModel = (function() {
      if (gUrlParam.KnowMByCreItem) return gUrlParam.KnowMByCreItem === '1';
      return window.top.isGetKnowM;
   })();

   // 给选项容器追加选项dom
   var html = '<li class="li clear-fix option-item' + (isShowAnalyzeAndModel ? " knowledgemodel-item" : "") + '">' +
      '<div class="labelbox">' +
      '<label class="choiceCheckLabel">' +
      '<span class="name">' + option + '</span>&nbsp;' +
      '<input data="' + option + '" name="' + seleEle + '" vale="' + option + '" type="' + checkType + '" />' + // check[]
      '</label>' +
      '</div>' +
      '<div class="edit-box">'; //  style="float:left; width:100%;"
   /**
    * modify by ZhangH 2018-7-26
    * 变更初级命题业务需求
    */
   if (isShowAnalyzeAndModel) {
      html += '<label style="font-weight: normal; margin-top: 8px; margin-bottom: 4px;">内容</label>';
   }
   html += '<div id="' + Id + '" name="' + Id + '"></div>';
   //  type="text/plain"
   /**
    * modify by ZhangH 2018-7-26
    * 变更初级命题业务需求
    */
   if (isShowAnalyzeAndModel) {
      //   html += '<label style="font-weight: normal; margin-top: 8px; margin-bottom: 4px;">解析</label>' +
      //  '<div id="analyze_' + Id + '" name="analyze_' + Id + '" type="text/plain"></div>' +
      html += '<div class="knowledgeModelbox" style="margin-top: 8px;">' +
         '<button id="knowledgeModel" class="btn btn-info btn-mini knowledgeModel">知识模型</button><div class="knowledgeModelCon"></div>' +
         //  '<button id="abilityModel" class="btn btn-info btn-mini">能力模型</button>
         '</div>';
   }
   html += '</div>' +
      '<div>' + //  style="position:absolute; right:0; ' + (isShowAnalyzeAndModel ? 'top: 30px' : '') + '"
      // '<a class="btn btn-danger btn-xs glyphicon glyphicon-trash dele-seleOpt" href="javascript:;"></a>' +
      '</div><div class="move-box"><span class="down-move">下移选项</span><span class="up-move">上移选项</span></div></li>'; //  onclick="delUe(this)"
   $(seleEle).append(html);
   // 删除选项
   $(seleEle).on('click', '.dele-seleOpt', function () {
      var idx = $(this).parents('li.clear-fix').index();
      if (idx < 0) return
      delUe(this, seleEle, isFillItems ? fillItemsUes[seleEle] : ues)
   })
   if (fillItemsUes[seleEle]) { // 完型填空每个空格选项分开
      fillItemsUes[seleEle] = fillItemsUes[seleEle] === 'init' ? [] : fillItemsUes[seleEle]
      
      var optionTinymceObj = new TinymceFun({tinymceId: Id, content: htmlContent || ''})
      optionTinymceObj.initTiny()
      fillItemsUes[seleEle].push(optionTinymceObj);
      // UEditorRegister(Id, {
      //    toolbarSchemeModel: 1,
      //    initialFrameHeight: 60,
      //    wordCount: false,
      //    scaleEnabled: true,
      //    group: seleEle,
      //    OptName: option
      // })
   } else {
      var optionTinymceObj = new TinymceFun({tinymceId: Id, content: htmlContent || ''})
      optionTinymceObj.initTiny()
      ues.push(optionTinymceObj);
      // UEditorRegister(Id, {
      //    toolbarSchemeModel: 1,
      //    initialFrameHeight: 60,
      //    wordCount: false,
      //    scaleEnabled: true,
      //    group: seleEle,
      //    OptName: option
      // })
   }
   $('#answer-singleULwrap').find('li.option-item').find('.up-move').css({'display': 'inline-block'})
   $('#answer-singleULwrap').find('li.option-item').find('.down-move').css({'display': 'inline-block'})
   $('#answer-singleULwrap').find('li.option-item:first').find('.up-move').css({'display': 'none'})
   $('#answer-singleULwrap').find('li.option-item:last').find('.down-move').css({'display': 'none'})
   /**
    * modify by ZhangH 2018-7-26
    * 变更初级命题业务需求
    */
   /*if (isShowAnalyzeAndModel) {
      ues.push(UEditorRegister('analyze_' + Id, {
         toolbarSchemeModel: 1,
         initialFrameHeight: 40,
         wordCount: false,
         scaleEnabled: true
      }));
   }*/
}
//删除UE编辑器选项
function delUe(obj, seleEle, curUes) {
   var seleEle = seleEle || '#answer-singleULwrap'
   var idx = $(obj).parents('li.clear-fix').index();
   $(obj).parents('li.clear-fix').remove();
   // for (var key in pubData) {
   // 	pubData[key].attributeList.splice(idx, 1);
   curUes.splice(idx, 1);
   // }
   for (var i = 0; i < prefixArr.length; i++) {
      $(seleEle).find('input:eq("' + i + '")').attr('data', prefixArr[i]).attr('vale', prefixArr[i]);
      $(seleEle).find('.name:eq("' + i + '")').text(prefixArr[i]);
   }
}
//拖拽table标题大小
function dragTableThead() {
   var tTD; //用来存储当前更改宽度的Table Cell,避免快速移动鼠标的问题   
   var table = document.getElementById("table");
   for (var j = 0; j < table.rows[0].cells.length; j++) {
      table.rows[0].cells[j].onmousedown = function() {
         //记录单元格   
         tTD = this;
         if (event.offsetX > tTD.offsetWidth - 10) {
            tTD.mouseDown = true;
            tTD.oldX = event.x;  
            tTD.oldWidth = tTD.offsetWidth;
         }
      };
      table.rows[0].cells[j].onmouseup = function() {
         //结束宽度调整   
         if (tTD == undefined) tTD = this;
         tTD.mouseDown = false;
         tTD.style.cursor = 'default';
      };
      table.rows[0].cells[j].onmousemove = function() {
         //更改鼠标样式   
         if (event.offsetX > this.offsetWidth - 10) {
            this.style.cursor = 'col-resize';
         } else {
            this.style.cursor = 'default';
         }
         //取出暂存的Table Cell   
         if (tTD == undefined) {
            tTD = this;
         }
         //调整宽度   
         if (tTD.mouseDown != null && tTD.mouseDown == true) {
            tTD.style.cursor = 'default';
            if (tTD.oldWidth + (event.x - tTD.oldX) > 0) {
               tTD.width = tTD.oldWidth + (event.x - tTD.oldX);
               //调整列宽   
               tTD.style.width = tTD.width;
               tTD.style.cursor = 'col-resize';
               //调整该列中的每个Cell   
               table = tTD;
               while (table.tagName != 'TABLE') table = table.parentElement;
            }
            for (j = 0; j < table.rows.length; j++) {
               table.rows[j].cells[tTD.cellIndex].width = tTD.width;
            }
         }
      };
   }
}

function UEeditorTextAreaEmptyPlaceholder(json) { //向指定UE编辑器 绑定插入占位符文本框功能
   var o = {
      ueObj: null //载入完成的ue对象
   };
   for (i in json) {
      for (n in o) {
         if (i == n) {
            o[n] = json[i];
         }
      }
   }
   $(".js-addUEedit-textarea").off("click").on("click", function() {
      var ueObj = o.ueObj;
      bd = $(ueObj.body);
      if (bd.find(".js-UEedit-textareaIGT").length == 0) {
         ueObj.execCommand('inserthtml', '<input class="js-UEedit-textareaIGT" disabled=true value="考生答题文本区域" style="margin:8px 1%; text-align:center; width:98%; height:200px; line-height:200px; font-size:30px; border:1px solid #ccc; border-radius:5px;"/>'); //inserthtml
      } else {
         fePositionTexTips("文本框已存在，请勿多余添加！");
      }
   });
}

function treeOpenAndClosePush(odata) {
   var o = {
      treeId: "treeView",
      thisKendoId: ""
   }
   for (i in odata) {
      for (n in o) {
         if (i === n) {
            o[n] = odata[i];
         }
      }
   }
   if (o['thisKendoId'] == "") {
      alert('请编码人员检查是否未填入kendo事件对象id。');
   } else {
      var tree = $('#' + o.treeId),
         fOne = tree.find(".k-item").eq(0),
         viewTree = $("#treeView").data('kendoTreeView'),
         viewData;
      window.top.fneVar.controller.kendoTreeArr = [];
      fOne.find("ul").eq(0).children("li").each(function(i) {
         viewData = viewTree.dataItem($(this));
         window.top.fneVar.controller.kendoTreeArr.push({
            id: viewData.id,
            expand: $(this).attr("aria-expanded"),
            thisKendoId: o['thisKendoId']
         });
      });
   }
}

function treeSettingExpand(odata) { //设置树展开
   var o = {
      treeId: "treeView"
   }
   for (i in odata) {
      for (n in o) {
         if (i === n) {
            o[n] = odata[i];
         }
      }
   }
   var tree = $('#' + o.treeId),
      fOne = tree.find(".k-item").eq(0),
      viewTree = $("#treeView").data('kendoTreeView'),
      viewData,
      kdTree = window.top.fneVar.controller.kendoTreeArr;
   fOne.find("ul").eq(0).children("li").each(function(i) {
      viewData = viewTree.dataItem($(this));
      for (var g = 0; g < kdTree.length; g++) {
         if (viewData.id === kdTree[g].id) {
            if (kdTree[g].expand === 'false' && kdTree[g].id !== kdTree[g].thisKendoId) {
               viewTree.collapse($(this));
            } else if (kdTree[g].expand === 'false' && kdTree[g].id === kdTree[g].thisKendoId) {
               viewTree.expand($(this));
            }
         }
      }
   });
}

function basefncreatGrid(oData) {
   this.datas = {
      "bizCode": "00001202",
      "page": 1,
      "pageSize": 10,
      "reqDate": "2016-03-15 11:12:30",
      "reqSsn": "10000001",
      "sign": "999986",
      "termType": "PCB",
      "paramObj": {},
      "userId": "sessiontest01",
      "version": "1.0"
   }
   if (typeof(oData) != 'undefined') {
      if (!$.isEmptyObject(oData)) {
         for (i in oData) {
            for (n in this.datas) {
               if (i == n) {
                  this.datas[n] = oData[i];
               }
            }
         }
      }
   }
   var iTs = this,
      datas = this.datas;
   this.id = "#grid";
   //this.pageSize=datas.pageSize;
   this.toolbar = "<button class='floatR marR-14 btn btn-default js-creatbtn-manage'>新增</button>";
   this.columns = [];
   this.selectable = false;
   this.reload = function(iJson) {
      if (typeof(iJson) != 'undefined') {
         if (!$.isEmptyObject(iJson)) {
            for (i in iJson) {
               for (n in datas) {
                  if (i == n) {
                     datas[n] = iJson[i];
                  }
               }
            }
         }
      }
   }
   this.pageable = {
      refresh: true,
      pageSizes: true,
      buttonCount: 5,
      page: 1,
      pageSize: datas.pageSize,
      pageSizes: [5, 10, 15],
      messages: {
         display: "共 {2} 项",
         empty: "没有数据",
         itemsPerPage: "每页显示数量",
         first: "第一页",
         last: "最后一页",
         next: "下一页",
         previous: "上一页"
      }
   }
   this.detailTemplate = '';
   this.detailInit = '';
   this.gridCreat = function(fn) {
      var gridObj = $(this.id).kendoGrid({
         dataSource: {
            transport: {
               read: function(options) {
                  datas.page = options.data.page;
                  datas.pageSize = options.data.pageSize;
                  window.top.requestFrontEnd('POST', reqSERVICE, "appSrvRequest=" + JSON.stringify(datas),
                     function(result) {
                        options.success(result);
                        if ($(window.top.document.body).find("#js-svgFarIdName").length > 0) {
                           $.removeSvgload({
                              body: $(window.top.document.body),
                              time: 0
                           });
                        }
                        if (typeof(fn) == "function") {
                           fn(result);
                        }
                     },
                     function(result) {
                        options.error(result);
                     });
               }
            },
            serverPaging: true,
            schema: {
               data: "ret",
               total: "totalCount"
            },
            pageSize: datas.pageSize
         },
         sortable: true,
         pageable: this.pageable,
         toolbar: this.toolbar,
         selectable: this.selectable,
         columns: this.columns
      });
      return gridObj;
   }
}

function basefncreatGridDisable() { //禁用为导入数据
   //var
   var baseData = {
      id: "", //html element id
      dataSource: {
         data: [], //GridTrdata type=arr:json  [{},{}...]
         schemaModelFields: {} //titleType
         //{code:{type:"string"},courseCode:{type:"string"},courseName:{type:"string"},courseNameJc:{type:"string"},courseNameEn:{type: "string"},content:{type: "string"}}
      }
   };
   this.id = "#grid";
   this.dataSource = {};
   this.dataSource.data = [];
   this.dataSource.schemaModelFields = {};
   this.pageSize = 5;
   this.toolbar = "<button class='floatR marR-14 btn btn-default js-creatbtn-manage'>新增</button>";
   this.columns = [];
   this.gridCreat = function() {
      $(this.id).kendoGrid({
         dataSource: {
            data: this.dataSource.data,
            schema: {
               model: {
                  fields: this.dataSource.schemaModelFields
               }
            },
            pageSize: this.pageSize
         },
         sortable: true,
         pageable: {
            input: true,
            numeric: false
         },
         toolbar: this.toolbar,
         columns: this.columns
      });
   }
}

function baseFromRegExpression(data, succFn) {
   var op = {
      cut: "|#|"
   };
   for (i in data) {
      if (i == "cut") {
         op.cut = data.cut;
      }
   }
   $.fromRegularExpression({
      eachSign: data.mark,
      cutSymbol: op.cut,
      //自定义分割符号等待挖坑
      body: data.bodys,
      successCallback: function(ElmArry) {
         for (var i = 0; i < ElmArry.length; i++) {
            ElmArry[i].css("border-color", "#ccc");
         }
         succFn();
      },
      eventSuccessCallback: function(iTs) {
         iTs.css("border-color", "#ccc");
      },
      errorCallback: function(ErorArr) { //{iTs,errorText}
         for (var i = ErorArr.length - 1; i > -1; i--) {
            var elm = ErorArr[i].elm,
               etxt = ErorArr[i].txt;
            elm.css("border-color", "rgba(115,0,0,0.65)");
            elm.bubbleTilTex({
               body: data.bodys,
               Tex: etxt,
               top: 5,
               left: -120,
               sty: {
                  "background": "rgba(115,0,0,0.65)",
                  "border-radius": 4 + "px",
                  "z-index": 1050
               },
               duration: 3000
            });
            /*	需要能够引入window才能够修改
                baseBubbleTilTex({
	            	window:insO.window,
	            	elem:elm,
	            	tex:etxt
	            });*/
         }
      }
   });
}

function eventFromRegularExpression(data, fn, erfn) {
   var insO = {
      window: window,
      bizCode: "",
      paramObj: "",
      iputClass: "js-evtFromRegExp-iput",
      eachSign: "u1",
      delay: 350,
      caseType: "kmCode Or number Or other Or nothing" //科目代码重复校验 或 数字总合超出校验 或 其他
   };
   for (i in data) {
      for (n in insO) {
         if (i == n) {
            insO[n] = data[i];
         }
      }
   }
   if (insO.caseType == "kmCode Or number Or other Or nothing") {
      alert('惊天BUG！请设置正确的caseType模式');
      return false;
   }
   if (insO.caseType !== "other" && insO.caseType !== "nothing") {
      if (insO.bizCode.length !== 8 || isNaN(insO.bizCode)) {
         alert('请编码人员检查bizCode输入是否正确');
         return false;
      }
   }
   var bodys = $(insO.window.document.body);
   $.eventFromRegularExpression({
      windows: insO.window,
      iPut: insO.iputClass,
      eachSign: insO.eachSign,
      delay: insO.delay,
      onCallback: {
         oninput: false
      },
      callback: function(val, obj, runStaut) {
         bodys.find(".js-efrexp-bubbleTilTex-box").remove();
         obj.css("border-color", "#ccc");
         if ((insO.caseType == "kmCode" || insO.caseType == "number") && runStaut[1] == true) {
            var nJson, zanS, valP = {};
            if (insO.caseType == "kmCode") {
               zanS = {
                  "code": val
               };
               insO.paramObj.code = "";
            }
            if (insO.caseType == "number") {
               zanS = {
                  "score": val
               };
               insO.paramObj.score = "";
            }
            if (typeof(insO.paramObj) == "object" && Object.prototype.toString.call(insO.paramObj).toLowerCase() == "[object object]" && !insO.paramObj.length) {
               for (i in insO.paramObj) {
                  valP[i] = insO.paramObj[i];
               }
               for (i in valP) {
                  for (n in zanS) {
                     if (i == n) {
                        valP[i] = zanS[n];
                     }
                  }
               }
            }
            nJson = setRequestJson({
               "bizCode": insO.bizCode,
               "paramObj": valP
            });
            requestFrontEnd('POST', reqSERVICE, "appSrvRequest=" + JSON.stringify(nJson),
               function(rst) {
                  if (insO.caseType == "kmCode") {
                     if (rst.ret.staut) {
                        obj.attr("efrexp-pass-staut", "true");
                        if (runStaut[0] == 'event') {
                           baseBubbleTilTex({
                              window: insO.window,
                              elem: obj,
                              tex: '验证成功',
                              bubble: {
                                 sty: {
                                    "background": "rgba(13,158,16,0.5)"
                                 }
                              }
                           });
                        }
                        if (typeof(fn) == "function") {
                           fn(obj, '验证成功');
                        }
                     } else {
                        obj.attr({
                           "efrexp-pass-staut": "false",
                           "efrexp-tips-error": rst.ret.msg
                        });
                        if (runStaut[0] == 'event') {
                           obj.css("border-color", "rgba(115,0,0,0.65)");
                           baseBubbleTilTex({
                              window: insO.window,
                              elem: obj,
                              tex: rst.ret.msg
                           });
                        }
                        if (typeof(erfn) == "function") {
                           erfn(obj, rst.ret.msg);
                        }
                     }
                  }
                  if (insO.caseType == "number") {
                     if (rst.ret.staut) {
                        obj.attr("efrexp-pass-staut", "true");
                        if (runStaut[0] == 'event') {
                           baseBubbleTilTex({
                              window: insO.window,
                              elem: obj,
                              tex: '验证成功',
                              bubble: {
                                 sty: {
                                    "background": "rgba(13,158,16,0.5)"
                                 }
                              }
                           });
                        }
                        if (typeof(fn) == "function") {
                           fn(obj, '验证成功');
                        }
                     } else {
                        obj.attr({
                           "efrexp-pass-staut": "false",
                           "efrexp-tips-error": rst.ret.msg
                        });
                        if (runStaut[0] == 'event') {
                           obj.css("border-color", "rgba(115,0,0,0.65)");
                           baseBubbleTilTex({
                              window: insO.window,
                              elem: obj,
                              tex: rst.ret.msg
                           });
                        }
                        if (typeof(erfn) == "function") {
                           erfn(obj, rst.ret.msg);
                        }
                     }
                  }
               }, null);
         } else if (insO.caseType == "nothing") {
            obj.attr("efrexp-pass-staut", "true");
            if (runStaut[0] == 'event') {
               if (obj.is("#ensurePassword")) {
                  if (obj.val() !== $(insO.window.document.body).find("#operatorPassword").val()) {
                     obj.attr({
                        "efrexp-pass-staut": "false",
                        "efrexp-tips-error": '两次密码不一致'
                     });
                     obj.css("border-color", "rgba(115,0,0,0.65)");
                     baseBubbleTilTex({
                        window: insO.window,
                        elem: obj,
                        tex: '两次密码不一致'
                     });
                  } else {
                     baseBubbleTilTex({
                        window: insO.window,
                        elem: obj,
                        tex: '验证成功',
                        bubble: {
                           sty: {
                              "background": "rgba(13,158,16,0.5)"
                           }
                        }
                     });
                  }
               } else {
                  baseBubbleTilTex({
                     window: insO.window,
                     elem: obj,
                     tex: '验证成功',
                     bubble: {
                        sty: {
                           "background": "rgba(13,158,16,0.5)"
                        }
                     }
                  });
               }
            }
         }
      },
      errorCallback: function(msg, obj, runStaut) {
         if (runStaut[0] == 'event') {
            obj.attr({
               "efrexp-pass-staut": "false",
               "efrexp-tips-error": msg
            }).css("border-color", "rgba(115,0,0,0.65)");
            baseBubbleTilTex({
               window: insO.window,
               elem: obj,
               tex: msg
            });
         } else if (runStaut[0] == 'ini') {
            obj.attr({
               "efrexp-pass-staut": "false",
               "efrexp-tips-error": msg
            });
         }
      }
   });
}

function requestAnmiateListenExp(json, fn) { //监听列队,不存在指定bizCode后抛出回调
   var bizCod = json.bizCode,
      state, tim;
   tim = setInterval(function() {
      state = true;
      if (window.top.fneVar.controller.requesCodeArr.length > 0) {
         for (var i = 0; i < window.top.fneVar.controller.requesCodeArr.length; i++) {
            var fI = window.top.fneVar.controller.requesCodeArr[i].substring(1, 9); //列队中bizCode前后带引号,故(1,9)
            if (state == false) {
               break;
            }
            for (var n = 0; n < bizCod.length; n++) {
               var nI = parseInt(bizCod[n]);
               if (fI == nI) {
                  state = false;
                  break;
               } else {
                  if (i == window.top.fneVar.controller.requesCodeArr.length - 1 && n == bizCod.length - 1 && state == true) {
                     if (typeof(fn) == 'function') {
                        clearInterval(tim);
                        fn();
                     }
                  }
               }
            }
         }
      } else {
         if (typeof(fn) == 'function') {
            clearInterval(tim);
            fn();
         }
      }
   }, 100);
}

function baseBubbleTilTex(data) {
   var defualt = {
         window: window.top,
         elem: '', //bind view object
         tex: '显示文本',
         style: {
            position: "absolute",
            padding: "0 13px",
            "height": "24px",
            fontSize: "13px",
            display: "block",
            "opacity": 0
         },
         bubble: {
            top: 5,
            left: 5,
            class: "js-efrexp-bubbleTilTex-box",
            sty: {
               "background": "rgba(115,0,0,0.65)",
               "border-radius": 4 + "px",
               "z-index": 1050
            },
            duration: 3000
         }
      },
      styles = '';
   defualt = jsonCropy(data, defualt);
   if (typeof(defualt.elem) !== "object" && defualt.elem.length <= 0) {
      throw 'error:please make sure that the elem object is a JQ object!'; //请检查elem对象是否为jq对象
   }
   for (i in defualt.style) {
      var t = i;
      if (i == "fontSize") {
         t = "font-size"
      }
      styles += t + ':' + defualt.style[i] + '; ';
   }
   var bodys = $(window.top.document.body),
      moniDom = '<span id="j8esq9643wy9faiwuhongcc99" style="' + styles + '">' + defualt.tex + '</span>';
   bodys.append(moniDom);
   var obj = bodys.find("#j8esq9643wy9faiwuhongcc99"),
      numWid = obj.width() + basicFE.elm.getObjSize(obj, 5),
      numHgt = obj.height() + basicFE.elm.getObjSize(obj, 6);
   obj.remove();
   defualt.elem.bubbleTilTex({
      body: $(defualt.window.document.body),
      Tex: defualt.tex,
      class: defualt.bubble.class,
      top: 5,
      left: -1 * (defualt.bubble.left + numWid),
      sty: defualt.bubble.sty,
      duration: defualt.bubble.duration
   });
}

function searchGet(fn) { //通用多格搜索
   var result = {},
      sbtn = $(".js-searchSubmit"),
      cbtn = $(".js-searchReset");
   sbtn.off('click');
   sbtn.on('click', function() {
      result.cName = "搜索";
      result.o = {};
      $('.js-searchEach-collective').each(function(i, elmt) {
         result.o[$(this).attr("discriminate-type")] = $(this).val();
      });
      fn(result);
   });
   cbtn.off('click');
   cbtn.on('click', function() {
      result.cName = "重置";
      $('.js-searchEach-collective').each(function(i, elmt) {
         $(this).val('');
      });
      fn(result);
   });
}

//base modalwindow - creat input list
function modelCreatMana(fn) {
   cloneModalToParent("#myModal");
   bindCloseEventToModal("#myModal", fn);
}
//base modalwindow - delete confrim
function modelDelete(fn) {
   cloneModalToParent("#myModal-delete");
   bindCloseEventToModal("#myModal-delete", fn);
}

function GetArgsFromHref(sHref, sArgName) {
   var args = sHref.split("?"),
      retval = "";
   if (args[0] == sHref) {
      return retval;
   }
   var str = args[1];
   args = str.split("&");
   for (var i = 0; i < args.length; i++) {
      str = args[i];
      var arg = str.split("=");
      if (arg.length <= 1) continue;
      if (arg[0] == sArgName) retval = arg[1];
   }
   return retval;
}

function baseSelectFillsData(aJson) {
   var elm = aJson.elm,
      fill = aJson.fill,
      dom = '<option value="-1">— 请选择 —</option>‍';
   for (var i = 0; i < fill.length; i++) {
      dom += "<option value='" + fill[i].id + "'>" + fill[i].name + "</option>";
   }
   elm.append(dom);
}

function excessiveViewLoadbase(fn) { //显示load盒子
   var doFri = window.top.frames["iframeBox"],
      zWdx = $(window.top.document.body),
      // ifr = zWdx.find(".js-index-iframe"),
      ifrLoad = zWdx.find(".js-iframe-load");
   ifrLoad.css({
      "opacity": 1
   });
   var imgTop = zWdx.height() / 2 - 86;
   ifrLoad.find(".js-loadImgBox").css("top", imgTop > 0 ? imgTop : 0 + "px");
   // setTimeout(function() {
   zWdx.find(".idx-load-menban").css("display", "block");
   ifrLoad.css("display", "block");
   if (typeof(fn) == "function") {
      fn();
   }
   // }, 350);
}

function excessiveViewOverbase() { //隐藏load盒子
   var zWdx = $(window.top.document.body),
      // ifrLoad = zWdx.find(".js-index-iframe").find(".js-iframe-load");
      ifrLoad = zWdx.find(".js-iframe-load");
   ifrLoad.css({
      "opacity": 0
   });
   // setTimeout(function() {
   ifrLoad.css("display", "none");
   zWdx.find(".idx-load-menban").css("display", "none");
   // }, 350);
}

function baseJumphrefViewloads(elm) { //发生iframe跳转出现内置loading, load事件仅在执行于e-index页有效,被摧毁页均无效
   if (typeof(elm.attr("jump-href")) != "undefined") {
      var ifam = $(window.top.document.body).find("#js-index-iframe");
      ifam.attr("src", elm.attr("jump-href")).off("load").on("load", function() { //跳转载入完成
         fneVar.controller.menuNoCreazy = true;
      });
   } else if (elm.is("iframe")) {
      window.top.frames["iframeBox"].location.reload();
      elm.on("load", function() { //跳转载入完成
         excessiveViewOverbase();
      });
   }
}

function publicSortPageDownbtn(fn) {
   var rOst = {},
      iTs = this,
      jumpBtnUP = $(".js-jumpUp"),
      jumpBtnDown = $(".js-jumpDown"),
      creatJumpBtn = $(".js-submit");
   jumpBtnUP.on('click', function() {
      rOst.obj = $(this);
      rOst.eName = "jumpUP";
      fn(rOst);
   });
   jumpBtnDown.on('click', function() {
      rOst.obj = $(this);
      rOst.eName = "jumpDOWN";
      fn(rOst);
   });
   creatJumpBtn.on("click", function() {
      rOst.obj = $(this);
      rOst.eName = "submit";
      fn(rOst);
   });
   rOst.viewsJump = function(itss) {
      if (fneVar.controller.menuNoCreazy) {
         fneVar.controller.menuNoCreazy = false;
         excessiveViewLoadbase();
         baseJumphrefViewloads(itss);
      }
   }
}

function publicSortPageUrlbtn(json) {
   var iTs = this,
      wrap = $(".js-publicBottsJumpWrap");
   this.joinJson = function() {
      var dt = '?';
      for (i in json) {
         dt += i + '=' + json[i] + '&';
      }
      return dt.substring(0, dt.length - 1);
   }
   this.getUrlBefor = function(tiss) {
      if (typeof(tiss.attr('jump-href')) !== "undefined") {
         var end = tiss.attr('jump-href').indexOf('.html') + 5;
         return tiss.attr('jump-href').substring(0, end);
      }
   }
   wrap.find("a").each(function() {
      var url = iTs.getUrlBefor($(this)) + iTs.joinJson();
      $(this).attr("jump-href", url);
   });
}
// 判断各种浏览器，找到正确的方法
function launchFullScreen(element) {
   if (element.requestFullscreen) {
      element.requestFullscreen();
   } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
   } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
   } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
   }
}

// 判断浏览器种类
function exitFullscreen() {
   if (document.exitFullscreen) {
      document.exitFullscreen();
   } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
   } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
   }
}

function creatAlertWindow(arguments, fn) {
   var uSc = window.top.document.body.scrollTop || window.top.document.documentElement.scrollTop,
      uBw = window.top.document.documentElement.clientWidth,
      uBh = window.top.innerHeight,
      uAh = $(window.top).height(),
      seW = 480,
      seH = 310,
      dom = '';
   if ($(window.top.document.body).find(".js-grantMoney-Mask").length == 0) {
      var cont = '<div class="grantMoney-order">' +
         '<div class="floatLwidth padLR-10 hei-45 line-45" style=" box-sizing:border-box; border-bottom:1px dashed #e3e3e3;">' +
         '<span class="floatL font-15">打包进度</span>' +
         '<a class="floatR padLR-10 close" href="javascript:;" style="margin-top:15px; color:#000; font-size:14px;">关闭</a>' +
         '</div>' +
         '<div class="floatLwidth padLR-10 hei-40 line-40" style="box-sizing:border-box; border-bottom:1px solid #e3e3e3;">' +
         '<span class="floatL fontb-c-13">有<i class="marLR-3 font-ari fontb-c-16 font-w-b js-grantMoyset-run">6</i>个<span class="font-ari font-c-13">（共<i class="js-grantMoyset-all">29</i>个）</span></span>' +
         '<span class="floatR" style="color:#ac8937;">进行中</span>' +
         '</div>' +
         '<div class="floatLwidth padLR-10 hei-40 line-40" style="box-sizing:border-box; border-bottom:1px solid #e3e3e3;">' +
         '<span class="floatL fontb-c-13">有<i class="marLR-3 font-ari js-grantMoyset-ok">23</i>个</span>' +
         '<span class="floatR" style="color:#2c8c33;">已完成</span>' +
         '</div>' +
         '<div class="floatLwidth padLR-10 hei-40 line-40" style="box-sizing:border-box; border-bottom:1px solid #e3e3e3;">' +
         '<span class="floatL fontb-c-13">有<i class="marLR-3 font-ari js-grantMoyset-fail">6</i>个</span>' +
         '<span class="floatR" style="color:#9e222d;">打包失败</span>' +
         '</div>' +
         '<div class="floatL relaTv" style="margin:20px 0 0 120px; width:260px;">' +
         '<div class="js-grantMoney-progarssNav"></div>' +
         '<div style="margin:12px 0 0 112px; text-align:center; width:32px; height:32px; line-height:32px; color:#3e9159; border:1px solid #3e9159; border-radius:50%; background:url(../images/general/icon-arcDashed-green.png) center center no-repeat; background-size:32px;"><i class="marLR-3 font-16 js-grantMoyset-ok">0</i></div>' +
         '<div class="posAbs" style="color:#3e9159; right:-28px; top:-8px;"><i class="marLR-3 js-grantMoyset-bili">0</i>%</div>' +
         '</div>' +
         '</div>';
      dom = '<div class="js-grantMoney-Mask" style="position:absolute; left:0; top:0px; width:100%; height:' + uAh + 'px; background:rgba(0,0,0,0.3); z-index:21;">' +
         '<div class="js-grantMoney-Main" style="position:absolute; left:0; top:' + uSc + 'px; width:100%; height:' + uBh + 'px;">' +
         '<div class="js-grantMoney-cont" style=" margin-top:' + ((uBh - seH) * .5) + 'px; margin-left:' + ((uBw - seW) * .5) + 'px; width:' + seW + 'px; height:' + seH + 'px; background:rgba(255,255,255,1); border-radius:10px; border:1px solid rgba(0,0,0,0.3); box-shadow:1px 1px 2px #666;">' +
         cont +
         '</div>' +
         '</div>' +
         '</div>';
      $(window.top.document.body).append(dom);
   }
   var argmt = arguments,
      oMask = $(window.top.document.body).find(".js-grantMoney-Mask"),
      oCont = oMask.find(".js-grantMoney-cont"),
      oOrder = oCont.find(".grantMoney-order"),
      oClose = oOrder.find(".close"),
      set_run = oOrder.find('.js-grantMoyset-run'), //run 运行中
      set_all = oOrder.find('.js-grantMoyset-all'), //all 总共值
      set_ok = oOrder.find('.js-grantMoyset-ok'), //ok 完成
      set_fail = oOrder.find('.js-grantMoyset-fail'), //fail 失败
      set_bili = oOrder.find('.js-grantMoyset-bili'), //bili 比例
      jrs = parseInt((parseInt(argmt.run) / parseInt(argmt.all)) * 100);
   if (jrs > 100) {
      jrs = 100;
      fn(['已达成100%']);
   }
   if (parseInt(argmt.run) <= parseInt(argmt.all)) {
      //setting
      set_run.text(argmt.run);
      set_all.text(argmt.all);
      set_ok.text(argmt.ok);
      set_fail.text(argmt.fail);
      set_bili.text(jrs);
      //evt
      oClose.off('click');
      oClose.on('click', function() {
         fn(['窗口被关闭']);
         oMask.remove();
      });
      $(window.top.document.body).find('.js-grantMoney-progarssNav').colprogressBar({
         window: window.top,
         num: jrs + '%', //parseInt or 100%
         width: 245,
         height: 5,
         insBor: 0,
         cssClas: "colprogressBarTran",
         track: {
            space: 1,
            sty: {
               "border": "0",
               "border-radius": "0"
            }
         },
         bar: {
            sty: {
               "border-radius": "0",
               "background": "#11c00d"
            }
         }
      });
   }
}

function progressWindowComPonenT() { //进度弹窗封装组件
   var obj = {
      import: {},
      elm: {
         inWdox: window.top,
         $body: null, //$(body)
         mask: null, //蒙层
         cont: null, //窗体
         wrap: null, //中心容器
         close: null, //关闭按钮
         okbtn: null, //成功按钮
         nav: null, //进度条
         bili: null //比例
      },
      var: {
         uSc: null, //滚动高度
         uBw: null, //可视区 width
         uBh: null, //可视区 height
         seW: 480,
         seH: 200,
         setIntime: null, //循环计时器存储
         speed: 100, //循环频率
         random: basicFE.num.GetRandomNum(50, 70), //随机值50~70
         accumulation: 0, //累加值
         infoStr: {
            title: '打包进度', //框体标题
            close: '关闭', //关闭按钮
            wait: '正在打包，请耐心等待...', //进行中打包
            succse: '完成', //打包完成按钮
         }
      },
      ini: function() {
         obj.regditVarBase();
         obj.elm.$body.append(obj.creatDomMenBan()); //插入结构
         obj.regditVarOther();
         obj.setStyle();
         obj.intervalTime();
         obj.bindEvent();
      },
      creatDomMenBan: function() { //创建蒙版
         return '<div class="js-grantMoney-Mask">' +
            '<div class="js-grantMoney-Main">' +
            '<div class="js-grantMoney-cont">' +
            obj.creatDomWidows() +
            '</div>' +
            '</div>' +
            obj.styleLabel() +
            '</div>';
      },
      creatDomWidows: function() { //创建窗体
         return '<div class="grantMoney-order">' +
            '<div class="js-grantMoney-head floatLwidth padLR-10 hei-45 line-45">' +
            '<span class="floatL font-15">' + obj.var.infoStr.title + '</span>' +
            '<a class="floatR padLR-10 close" href="javascript:;">' + obj.var.infoStr.close + '</a>' +
            '</div>' +
            '<div class="js-grantMoney-texWrap"><p>' + obj.var.infoStr.wait + '</p></div>' +
            '<div class="floatL relaTv" style="margin:20px 0 0 120px; width:260px;">' +
            '<div class="js-grantMoney-progarssNav"></div>' +
            '<a class="js-grantMoney-succse" href="javascript:;">' + obj.var.infoStr.succse + '</a>' +
            //'<div style="margin:12px 0 0 112px; text-align:center; width:32px; height:32px; line-height:32px; color:#3e9159; border:1px solid #3e9159; border-radius:50%; background:url(../images/general/icon-arcDashed-green.png) center center no-repeat; background-size:32px;"><i class="marLR-3 font-16 js-grantMoyset-ok">0</i></div>'+
            '<div class="posAbs" style="color:#3e9159; right:-28px; top:-8px;"><i class="marLR-3 js-grantMoyset-bili">0</i>%</div>' +
            '</div>' +
            '</div>';
      },
      styleLabel: function() {
         var seW = obj.var.seW,
            seH = obj.var.seH,
            uBw = obj.var.uBw,
            uBh = obj.var.uBh,
            _msk = '.js-grantMoney-Mask',
            _mai = _msk + ' .js-grantMoney-Main',
            _cot = _mai + ' .js-grantMoney-cont',
            _head = _cot + ' .js-grantMoney-head';
         return '<style>' +
            _msk + '{position:absolute; left:0; top:0px; width:100%; height:' + uBh + 'px; background:rgba(0,0,0,0.3); z-index:21;}' +
            _mai + '{position:absolute; left:0; top:' + obj.var.uSc + 'px; width:100%; height:' + uBh + 'px;}' +
            _cot + '{margin-top:' + ((uBh - seH) * .5) + 'px; margin-left:' + ((uBw - seW) * .5) + 'px; width:' + seW + 'px; height:' + seH + 'px; background:rgba(255,255,255,1); border-radius:10px; border:1px solid rgba(0,0,0,0.3); box-shadow:1px 1px 2px #666;}' +
            _head + '{box-sizing:border-box; border-bottom:1px dashed #d5d5d5;}' +
            _head + ' .close{margin-top:15px; color:#000; font-size:14px;}' +
            _cot + ' .js-grantMoney-succse{margin-top:14px; text-align:center; width:80px; height:30px; line-height:28px; color:#666; background:#eee; border:1px solid #ccc; border-radius:4px; display:none;}' +
            '</style>';
      },
      regditVarBase: function() { //基础值获取
         obj.elm.$body = $(obj.elm.inWdox.document.body);
         obj.var.uSc = obj.elm.inWdox.document.body.scrollTop || obj.elm.inWdox.document.documentElement.scrollTop;
         obj.var.uBw = obj.elm.inWdox.document.documentElement.clientWidth;
         obj.var.uBh = obj.elm.inWdox.document.documentElement.clientHeight;
      },
      regditVarOther: function() { //对象生成后赋予变量
         obj.elm.mask = obj.elm.$body.find(".js-grantMoney-Mask");
         obj.elm.cont = obj.elm.mask.find(".js-grantMoney-cont");
         obj.elm.wrap = obj.elm.cont.find(".js-grantMoney-texWrap");
         obj.elm.close = obj.elm.cont.find(".close");
         obj.elm.okbtn = obj.elm.cont.find(".js-grantMoney-succse");
         obj.elm.nav = obj.elm.cont.find(".js-grantMoney-progarssNav");
         obj.elm.bili = obj.elm.cont.find('.js-grantMoyset-bili');
      },
      setStyle: function() { //赋值样式
         obj.elm.wrap.css({
            "float": "left",
            "margin-top": 20 + "px",
            "width": "100%",
            "line-height": 32 + "px"
         }).find("p").css({
            "margin": 0
         });
      },
      bindEvent: function() {
         var mask = obj.elm.mask,
            okbtn = obj.elm.okbtn,
            close = obj.elm.close;
         close.off('click').on('click', function() {
            mask.remove();
            obj.callback({
               cName: 'close'
            });
         });
         okbtn.off('click').on('click', function() {
            mask.remove();
            obj.callback({
               cName: 'succse',
               data: obj.import
            });
         });
      },
      intervalTime: function(state) { //执行
         clearInterval(obj.var.setIntime);
         obj.var.setIntime = setInterval(function() {
            var color = "#11c00d";
            if (obj.var.accumulation == obj.var.random) {
               obj.var.speed = 3000;
               obj.intervalTime();
            }
            if (obj.var.accumulation < 100) {
               if (obj.var.accumulation == 99) {
                  if (state != null) {
                     clearInterval(obj.var.setIntime);
                  }
               }
               if (state == "fail") {
                  clearInterval(obj.var.setIntime);
                  obj.elm.wrap.find("p").text("打包失败：（");
                  color = "#ee3542";
               }
               if (state == "succse") {
                  obj.elm.close.css('display', 'none');
                  obj.elm.wrap.find("p").text("恭喜，打包成功");
                  obj.var.accumulation = 99;
                  obj.elm.okbtn.css({
                     'display': 'inline-block'
                  });
               }
               obj.var.accumulation++;
               obj.progarss({
                  num: obj.var.accumulation,
                  bgCol: color
               });
            } else {
               clearInterval(obj.var.setIntime);
            }
         }, obj.var.speed);
      },
      progarss: function(o) {
         obj.elm.nav.colprogressBar({
            window: obj.elm.inWdox,
            num: o.num + '%', //parseInt or 100%
            width: 245,
            height: 5,
            insBor: 0,
            cssClas: "colprogressBarTran",
            track: {
               space: 1,
               sty: {
                  "border": "0",
                  "border-radius": "0"
               }
            },
            bar: {
               sty: {
                  "border-radius": "0",
                  "background": o.bgCol
               }
            }
         });
         obj.elm.bili.text(o.num);
      },
      callback: function() {}
   };
   return obj;
}

function creatBagWindow(arguments) { //废弃
   var uSc = window.top.document.body.scrollTop || window.top.document.documentElement.scrollTop,
      uBw = window.top.document.documentElement.clientWidth,
      uBh = window.top.innerHeight,
      uAh = $(window.top).height(),
      seW = 480,
      seH = 200,
      dom = '',
      setIntime = null,
      tSpeed = 100
   sui = basicFE.num.GetRandomNum(50, 70);
   if ($(window.top.document.body).find(".js-grantMoney-Mask").length == 0) {
      var cont = '<div class="grantMoney-order">' +
         '<div class="floatLwidth padLR-10 hei-45 line-45" style=" box-sizing:border-box; border-bottom:1px dashed #e3e3e3;">' +
         '<span class="floatL font-15">打包进度</span>' +
         '<a class="floatR padLR-10 close" href="javascript:;" style="margin-top:15px; color:#000; font-size:14px;">关闭</a>' +
         '</div>' +
         '<div class="js-grantMoney-texWrap"><p>正在打包，请耐心等待...</p></div>' +
         '<div class="floatL relaTv" style="margin:20px 0 0 120px; width:260px;">' +
         '<div class="js-grantMoney-progarssNav"></div>' +
         '<div style="margin:12px 0 0 112px; text-align:center; width:32px; height:32px; line-height:32px; color:#3e9159; border:1px solid #3e9159; border-radius:50%; background:url(../images/general/icon-arcDashed-green.png) center center no-repeat; background-size:32px;"><i class="marLR-3 font-16 js-grantMoyset-ok">0</i></div>' +
         '<div class="posAbs" style="color:#3e9159; right:-28px; top:-8px;"><i class="marLR-3 js-grantMoyset-bili">0</i>%</div>' +
         '</div>' +
         '</div>';
      dom = '<div class="js-grantMoney-Mask" style="position:absolute; left:0; top:0px; width:100%; height:' + uAh + 'px; background:rgba(0,0,0,0.3); z-index:21;">' +
         '<div class="js-grantMoney-Main" style="position:absolute; left:0; top:' + uSc + 'px; width:100%; height:' + uBh + 'px;">' +
         '<div class="js-grantMoney-cont" style=" margin-top:' + ((uBh - seH) * .5) + 'px; margin-left:' + ((uBw - seW) * .5) + 'px; width:' + seW + 'px; height:' + seH + 'px; background:rgba(255,255,255,1); border-radius:10px; border:1px solid rgba(0,0,0,0.3); box-shadow:1px 1px 2px #666;">' +
         cont +
         '</div>' +
         '</div>' +
         '</div>';
      $(window.top.document.body).append(dom);
   }
   var Its = this,
      argmt = arguments,
      oMask = $(window.top.document.body).find(".js-grantMoney-Mask"),
      oCont = oMask.find(".js-grantMoney-cont"),
      oOrder = oCont.find(".grantMoney-order"),
      oOtexWrap = oCont.find(".js-grantMoney-texWrap"),
      oClose = oOrder.find(".close"),
      //set_run=oOrder.find('.js-grantMoyset-run'),			//run 运行中
      set_all = oOrder.find('.js-grantMoyset-all'), //all 总共值
      //set_ok=oOrder.find('.js-grantMoyset-ok'),				//ok 完成
      //set_fail=oOrder.find('.js-grantMoyset-fail'),			//fail 失败
      set_bili = oOrder.find('.js-grantMoyset-bili'), //bili 比例
      jrs = 0;
   oOtexWrap.css({
      "float": "left",
      "margin-top": 20 + "px",
      "width": "100%",
      "line-height": 32 + "px"
   });
   oOtexWrap.find("p").css({
      "margin": 0
   });
   //setting
   //set_run.text(argmt.run);
   set_all.text(argmt.all);
   //set_ok.text(argmt.ok);
   //set_fail.text(argmt.fail);
   //evt
   oClose.off('click').on('click', function() {
      oMask.remove();
   });
   this.times = function(state) { //succse / fail
      if (state != null && state != undefined) {

      }
      clearInterval(setIntime);
      setIntime = setInterval(function() {
         if (jrs == sui) {
            tSpeed = 3000;
            Its.times();
         }
         if (jrs < 100) {
            if (jrs == 99) {
               if (state != null) {
                  clearInterval(setIntime);
               }
            }
            if (state == "fail") {
               clearInterval(setIntime);
               oOtexWrap.find("p").text("打包失败：（");
               Its.progarss({
                  num: jrs,
                  bgCol: "#ee3542"
               });
               return false;
            }
            if (state == "succse") {
               oOtexWrap.find("p").text("恭喜，打包成功");
               jrs = 99;
            }
            jrs++;
            Its.progarss({
               num: jrs,
               bgCol: "#11c00d"
            });
         } else {
            clearInterval(setIntime);
         }
      }, tSpeed);
   }
   this.progarss = function(o) {
      $(window.top.document.body).find('.js-grantMoney-progarssNav').colprogressBar({
         window: window.top,
         num: o.num + '%', //parseInt or 100%
         width: 245,
         height: 5,
         insBor: 0,
         cssClas: "colprogressBarTran",
         track: {
            space: 1,
            sty: {
               "border": "0",
               "border-radius": "0"
            }
         },
         bar: {
            sty: {
               "border-radius": "0",
               "background": o.bgCol
            }
         }
      });
      set_bili.text(o.num);
   }
   this.times();
}

function creatBagWindowSecond(arguments) {
   var uSc = document.body.scrollTop || document.documentElement.scrollTop,
      uBw = document.documentElement.clientWidth,
      uBh = window.innerHeight,
      uAh = $(window).height(),
      seW = 480,
      seH = 200,
      dom = '',
      setIntime = null,
      tSpeed = 100
   sui = basicFE.num.GetRandomNum(50, 70);
   var cont = '<div class="grantMoney-order">' +
      '<div class="floatLwidth padLR-10 hei-45 line-45" style=" box-sizing:border-box; border-bottom:1px dashed #d5d5d5;">' +
      '<span class="floatL font-15">打包进度</span>' +
      '<a class="floatR padLR-10 close" href="javascript:;" style="margin-top:15px; color:#000; font-size:14px;">关闭</a>' +
      '</div>' +
      '<div class="js-grantMoney-texWrap"><p>正在打包，请耐心等待...</p></div>' +
      '<div class="floatL relaTv" style="margin:20px 0 0 120px; width:260px;">' +
      '<div class="js-grantMoney-progarssNav"></div>' +
      '<div style="margin:12px 0 0 112px; text-align:center; width:32px; height:32px; line-height:32px; color:#3e9159; border:1px solid #3e9159; border-radius:50%; background:url(../images/general/icon-arcDashed-green.png) center center no-repeat; background-size:32px;"><i class="marLR-3 font-16 js-grantMoyset-ok">0</i></div>' +
      '<div class="posAbs" style="color:#3e9159; right:-28px; top:-8px;"><i class="marLR-3 js-grantMoyset-bili">0</i>%</div>' +
      '</div>' +
      '</div>';
   dom = '<div class="js-grantMoney-cont" style="float:left; text-align:center; width:' + seW + 'px; height:' + seH + 'px; background:#f1f1f1; border-radius:10px; border:1px solid rgba(0,0,0,0.3); box-shadow:1px 1px 2px #666;">' +
      cont +
      '</div>';
   $(".js-creatBagSecond-wrap").append(dom);
   var Its = this,
      argmt = arguments,
      oCont = $(".js-grantMoney-cont"),
      oOrder = oCont.find(".grantMoney-order"),
      oOtexWrap = oCont.find(".js-grantMoney-texWrap"),
      oClose = oOrder.find(".close"),
      set_all = oOrder.find('.js-grantMoyset-all'), //all 总共值
      set_bili = oOrder.find('.js-grantMoyset-bili'), //bili 比例
      jrs = 0;
   oOtexWrap.css({
      "float": "left",
      "margin-top": 20 + "px",
      "width": "100%",
      "line-height": 32 + "px"
   });
   oOtexWrap.find("p").css({
      "margin": 0
   });
   //setting
   set_all.text(argmt.all);
   //evt
   oClose.off('click');
   oClose.on('click', function() {
      oMask.remove();
   });
   this.times = function(state) { //succse / fail
      if (state != null && state != undefined) {

      }
      clearInterval(setIntime);
      setIntime = setInterval(function() {
         if (jrs == sui) {
            tSpeed = 3000;
            Its.times();
         }
         if (jrs < 100) {
            if (jrs == 99) {
               if (state != null) {
                  clearInterval(setIntime);
               }
            }
            if (state == "fail") {
               clearInterval(setIntime);
               oOtexWrap.find("p").text("打包失败：（");
               Its.progarss({
                  num: jrs,
                  bgCol: "#ee3542"
               });
               return false;
            }
            if (state == "succse") {
               oOtexWrap.find("p").text("恭喜，打包成功");
               jrs = 99;
            }
            jrs++;
            Its.progarss({
               num: jrs,
               bgCol: "#11c00d"
            });
         } else {
            clearInterval(setIntime);
         }
      }, tSpeed);
   }
   this.progarss = function(o) {
      $('.js-grantMoney-progarssNav').colprogressBar({
         window: window,
         num: o.num + '%', //parseInt or 100%
         width: 245,
         height: 5,
         insBor: 0,
         cssClas: "colprogressBarTran",
         track: {
            space: 1,
            sty: {
               "border": "0",
               "border-radius": "0"
            }
         },
         bar: {
            sty: {
               "border-radius": "0",
               "background": o.bgCol
            }
         }
      });
      set_bili.text(o.num);
   }
   this.times();
}
/**
 * bootstrap fileinput 上传控件 :)
 */
function initFIleInput(elem, elemClassName, data) { //页面渲染
   if (data["fne-id"] != undefined && data["fne-id"] != null) {
      elem.parents(".js-item-audio").attr({
         "fne-id": data["fne-id"],
         "fne-filename": data["fne-filename"]
      });
      var initialPreviewStr = ["<audio controls=''><source type='audio/mpeg' src='" + downloadSERVICE + "?id=" + data["fne-id"] + "'></source></audio>"];
      if (data.fileType == 'image') {
         initialPreviewStr = ["<img style='width:auto;height:160px' src='" + downloadSERVICE + "?id=" + data["fne-id"] + "'/>"];
      } else if (data.fileType == 'video') {
         initialPreviewStr = ["<video controls=''><source type='video/mp4' src='" + downloadSERVICE + "?id=" + data["fne-id"] + "'></source></video>"];
      } else {};
      runOnceCtrollerFileInput({
         elm: elemClassName.indexOf('#') == -1 ? "." + elemClassName : elemClassName,
         initialPreview: initialPreviewStr,
         initialPreviewConfig: [{
            caption: data["fne-filename"]
         }],
         type: "reinitialize"
      });
      elem.closest(".js-item-audio").find(".file-caption-name").attr("title", data["fne-filename"]).html('<span class="glyphicon glyphicon-file kv-caption-icon"></span>&nbsp;' + data["fne-filename"]);
   } else { //文件选择控件初始化及回调
      runOnceCtrollerFileInput({
         elm: elemClassName.indexOf('#') == -1 ? "." + elemClassName : elemClassName,
         fileType: data.fileType
      });
   }
}
//初始化音频选项（返回有只值得情况下）
function runOnceCtrollerFileInput(data, fn) { //由于fileIput书写太多重复，进行再封装
   var ida = {
      window: window.document.body,
      elm: "?",
      type: 'ini'
   }
   for (i in data) {
      for (n in ida) {
         if (i == n) {
            ida[n] = data[i];
         }
      }
   }
   var allowedFileType = ['audio'],
      allowedFileExtension = ['mp3'];
   if (data.fileType == 'image') {
      allowedFileType = ['image'];
      allowedFileExtension = ['jpeg', 'jpg', 'png', 'gif'];
   } else if (data.fileType == 'video') {
      allowedFileType = ['video'];
      allowedFileExtension = ['mp4'];
   } else {};
   var setJson = {
      windows: $(ida.window),
      elm: ida.elm,
      uploadUrl: uploadSERVICE,
      allowedFileTypes: allowedFileType,
      allowedFileExtensions: allowedFileExtension,
      previewFileIcon: "<i class='glyphicon glyphicon-music'></i>",
      type: ida.type
   };
   if (data['initialPreview'] != undefined) {
      setJson['initialPreview'] = data['initialPreview'];
   }
   if (data['initialPreviewConfig'] != undefined) {
      setJson['initialPreviewConfig'] = data['initialPreviewConfig'];
   }
   newMyFileInput(setJson, function(result) {
      if (result.cName == "asyncUploadRet" || result.cName == "syncUploadRet") {
         var obj = result.data.data.response;
         result.data.this.closest(".js-item-audio").attr({
            "fne-id": obj.ret.resMap.id,
            "fne-filename": obj.ret.resMap.original
         });
      }
      if (typeof(fn) == 'function') {
         fn(result);
      }
   });
}

function newMyFileInput(data, backfn) {
   var rObject = {},
      uploadExt = {},
      set = {
         windows: $(window.document.body),
         elm: ".js-file-modelIput",
         type: "init"
      };
   if (typeof($.url.param('paperId')) !== 'undefined' && typeof($.url.param('structId')) !== 'undefined' && typeof($.url.param('itemTypeId')) !== 'undefined' && typeof($.url.param('subjectId')) !== 'undefined') {
      uploadExt = {
         "paperId": $.url.param('paperId'), //试卷编号
         "structId": $.url.param('structId'), //试卷结构区域编号
         "itemTypeId": $.url.param('itemTypeId'), //题型编号
         "subjectId": $.url.param('subjectId')
      }
   }
   var initData = {
      language: 'zh', //设置语言
      uploadUrl: data.uploadUrl, //you must set a valid URL here else you will get an error
      uploadExtraData: uploadExt, //可传额外数据
      uploadAsync: false, //默认是异步上传uploadAsync: true          
      showCaption: true, //是否显示文件标题(即文本框)
      showUpload: true, //是否显示上传按钮
      showRemove: true, //是否显示移除按钮
      showPreview: true, //是否显示预览
      dropZoneEnabled: false, //是否显示拖拽区域
      autoReplace: true, //自动替换
      maxFileCount: 1,
      maxFileSize: 15000,
      enctype: 'multipart/form-data',
      allowedFileTypes: data.allowedFileTypes, //允许的文件类型
      allowedFileExtensions: data.allowedFileExtensions,
      browseClass: "btn btn-primary btn-sm",
      previewFileIcon: data.previewFileIcon, //设置默认预览图标
      previewSettings: {
         video: {
            width: "95%",
            height: "480px"
         }
      }
   };
   if (typeof(data) != "undefined") {
      for (i in data) {
         for (n in set) {
            if (i == n) {
               set[n] = data[i];
            }
         }
      }
   }
   var idEs = set.windows.find(set.elm);
   if (set.type == "reinitialize") {
      initData.initialPreview = data.initialPreview;
      initData.initialPreviewConfig = data.initialPreviewConfig;
      //自定义的footer按钮都不可用,所以注释掉采用系统默认的footer
      /*var domz =  '<div class="file-thumbnail-footer">\n' +
						'<div class="file-caption-name" title="{caption}">{caption}</div>\n' +
						'<div class="file-actions">' +
							'<div class="file-footer-buttons">' +
								'<button title="上传文件" class="kv-file-upload btn btn-xs btn-default" type="button" style="display: none;"><i class="glyphicon glyphicon-upload text-info"></i></button>' +
						   		'<button title="删除文件" class="kv-file-remove btn btn-xs btn-default" type="button"><i class="glyphicon glyphicon-trash text-danger"></i></button>' +
							'</div>' +
							'<div title="上传" class="file-upload-indicator"><i class="glyphicon glyphicon-ok-sign text-success"></i>'+
							'</div>' +
							'<div class="clearfix"></div>' +
						'</div>' +
					'</div>';	    
   	 	initData.layoutTemplates = {footer: domz};*/
   }
   if (idEs.data('fileinput')) { //存在则销毁
      idEs.fileinput('destroy');
   }
   //重新初始化
   idEs.fileinput(initData);
   if (idEs.val()) {
      idEs.trigger('change');
   }
   //对音频预览的处理
   if (set.type == "reinitialize") {
      set.windows.find("audio").parents(".file-preview-initial").attr("style", "width:auto; height:80px;");
   }
   idEs.off('fileloaded').on("fileloaded", function(event, file, previewId, index, reader) { //选中本地文件加载完毕触发
      var far = $(event.target).parents(".file-input").find(".file-preview-thumbnails"),
         su = far.find(".file-preview-success");
      if (far.children().length == 2 && su.length > 0) { //使得上传不会出现多个
         su.remove();
      }
      rObject.cName = "fileloaded";
      rObject.data = {
         'this': $(this),
         'event': event,
         'file': file,
         'previewId': previewId,
         'index': index,
         'reader': reader
      };
      if (typeof(backfn) == 'function') {
         backfn(rObject);
      }
   });
   //****上传返回处理
   idEs.off('fileerror').on('fileerror', function(event, data, msg) { //异步上传错误处理
      alert(msg);
   });
   idEs.off('fileuploaded').on("fileuploaded", function(event, data, previewId, index) { //异步上传返回结果处理
      rObject.cName = "asyncUploadRet";
      rObject.data = {
         'this': $(this),
         'event': event,
         'data': data,
         'previewId': previewId,
         'index': index
      };
      basefileUpAnalysis(rObject);
   });
   idEs.off('filebatchuploaderror').on('filebatchuploaderror', function(event, data, msg) { //同步上传错误处理
      alert(msg);
   });
   idEs.off('filebatchuploadsuccess').on("filebatchuploadsuccess", function(event, data, previewId, index) { //同步上传返回结果处理
      rObject.cName = "syncUploadRet";
      rObject.data = {
         'this': $(this),
         'event': event,
         'data': data,
         'previewId': previewId,
         'index': index
      };
      basefileUpAnalysis(rObject);
   });
   //****删除按钮
   idEs.off('filecleared').on('filecleared', function(event) { //大移除按钮
      if (data.allowedFileTypes == "image") {
         $(this).parents(".js-item-option").removeAttr("fne-id fne-filename");
      } else if (data.allowedFileTypes == "audio" || data.allowedFileTypes == "video") {
         $(this).parents(".js-item-audio").removeAttr("fne-id fne-filename");
      }
   });
   idEs.off('filesuccessremove').on('filesuccessremove', function(event) { //小图标删除按钮
      if (data.allowedFileTypes == "image") {
         $(this).parents(".js-item-option").removeAttr("fne-id fne-filename");
      } else if (data.allowedFileTypes == "audio" || data.allowedFileTypes == "video") {
         $(this).parents(".js-item-audio").removeAttr("fne-id fne-filename");
      }
   });
   //选择其他文件时先清除
   idEs.off('fileselect').on('fileselect', function(event, numFiles, label) {
      rObject.cName = "fileselect";
      if (typeof(backfn) == 'function') {
         backfn(rObject);
      }
      //if(data.allowedFileTypes == "image") $(this).parents(".js-item-option").removeAttr("fne-id").removeAttr("fne-filename");
      //if(data.allowedFileTypes == "audio")$(this).parents(".js-item-audio").removeAttr("fne-id").removeAttr("fne-filename");
   });
   /*
   idEs.on('filebatchpreupload', function(event, data){//文件批量上传前
   	if(data.files.length>0){
   		if(undefined != data.files[0]){
   			console.log(data.files[0].name);
   		}else{
   			//无法中断bootstrap fileinput执行
   		}
   	}
   });*/
   function basefileUpAnalysis(oData) { //统一错误重定向处理
      var rest = oData.data.data.response;
      if (typeof(oData.data.data) !== undefined) {
         if (rest.code == "000000") {
            backfn(oData);
         } else {
            if (rest.code == "-S00001" || rest.code == "-S00002") {
               baseConfrimTipsImportOrErorr({
                  type: "erorr",
                  title: "系统提示",
                  text: rest.errMsg,
                  src: fneVar.controller.baseIMG.imgA
               }, function() {
                  window.top.location.href = ''+rest.ret.redirectUrl;
               });
            } else {
               baseConfrimTipsImportOrErorr({
                  type: "erorr",
                  title: "系统提示",
                  text: rest.errMsg,
                  src: fneVar.controller.baseIMG.imgA
               }, null);
            }
         }
      } else {
         baseConfrimTipsImportOrErorr({
            type: "erorr",
            title: "上传错误",
            text: "文件格式类型不正确",
            src: fneVar.controller.baseIMG.imgA
         }, null);
      }
   }
}

function eachRegExpAllResult(oDs) {
   var oOs = {
      window: window,
      class: "js-evtFromRegExp-iput",
      eachsign: "efrexp-eachsign-data",
      eachsignVal: "u1",
      passStaut: "efrexp-pass-staut",
      succss: true
   };
   for (i in oDs) {
      for (n in oOs) {
         if (i == n) {
            oOs[n] = oDs[i];
         }
      }
   }
   $(oOs.window.document.body).find('.' + oOs.class).each(function(i) {
      if (typeof($(this).attr(oOs.eachsign)) !== 'undefined') {
         if ($(this).attr(oOs.eachsign) == oOs.eachsignVal) {
            if (typeof($(this).attr(oOs.passStaut)) == 'undefined') {
               $(this).attr(oOs.passStaut, false);
            }
            if ($(this).attr(oOs.passStaut) == 'false') {
               $(this).css("border-color", "rgba(115,0,0,0.65)");
               baseBubbleTilTex({
                  window: oOs.window,
                  elem: $(this),
                  tex: $(this).attr("efrexp-tips-error")
               });
               oOs.succss = false;
               return false;
            }
         }
      }
   });
   return oOs.succss;
}

function eachFreeFill(data, fn) { //快捷modal填充
   var igt = data.elm,
      fill = data.fill;
   igt.find("#baseModal-title").text(data.title);
   if (typeof(fill) == "object" && Object.prototype.toString.call(fill).toLowerCase() == "[object object]" && !fill.length) { //is Json
      for (i in fill) {
         if (igt.find("#" + i).length > 0) {
            var elm = igt.find("#" + i);
            if (typeof(igt.find("#" + i).attr("modal-fill-type")) !== undefined) {
               var type = elm.attr("modal-fill-type");
               if (type == "input") {
                  elm.val(fill[i]);
               } else if (type == "select") {
                  var selStr = "<option m-id='-1'>— 请选择 —</option>‍";
                  for (var x = 0; x < fill[i]; x++) {
                     selStr += "<option m-id='" + fill[i][x].id + "'>" + fill[i][x].name + "</option>";
                  }
                  elm.html(selStr);
               } else if (type == "video") { //filesIput video

               } else if (type == "imgs") { //filesIput imgs

               }
            }
         }
      }
   }
   if (typeof(fn) == "function") {
      fn(igt, fill);
   }
}

function publicDataMatchFill() { //通用数据 抓取、设值
   var obj = {
      model: 'template', //设置模式 template(模板题型) 和 dianti(录题制卷)
      var: {
         body: null, //iframe内body
         pubClass: ".js-sgST-target", //被遍历对象
         disabledId: [ //非通用性质结构渲染id
            'chapter'
         ],
         attributes: [ //存在于 attributes 结构下(模板)
            'layoutMode'
         ],
         itemAttributes: [ //存在于 itemAttributes 结构下(制题)

         ],
         dataMatchType: { //数据相关类型  key(ID):value(type) 没有声明将默认作为字符串处理
            //包含类型:int(整数)
            'count': 'int',
            'layoutMode': 'int'
         }
      },
      get: function() { //抓取 配套set使用
         var rD = {},
            add;
         if (obj.model == 'template') {
            add = 'attributes';
         } else {
            add = 'itemAttributes';
         }
         rD[add] = {};
         obj.var.body.find(obj.var.pubClass).each(function(i) {
            var id = $(this).attr('id'),
               igt = obj.getThevalue(id);
            if (igt !== false) {
               if (obj.discriminateIdDisable(id)) { //特殊题型
                  if (id == "chapter") {
                     rD['chapterId'] = obj.getThevalue('chapterId');
                     rD['chapterName'] = obj.getThevalue('chapterName');
                  }
               } else if (obj.attributesIdsonJson(id)) {
                  rD[add][id] = igt;
               } else {
                  rD[id] = igt;
               }
            }
         });
         return rD;
      },
      set: function(data) { //写入 顺便吸收了抓取规则，用于get使用
         if (obj.isJson(data)) {
            for (i in data) {
               if (i == "itemAttributes" || i == "attributes") { //特殊处理(文档显示非空必传)
                  //itemAttributes array(试题) {"attrType": "option","sort": 1,"optionContent": "Right",}
                  if (i == "attributes") {
                     for (n in data[i]) {
                        if (obj.attributesIdsonJson(n)) { //检查是否存在
                           obj.writeInString(n, data[i][n]);
                        }
                     }
                  }
               } else {
                  obj.writeInString(i, data[i]);
               }
            }
         } else {
            throw 'publicDataMatchFill:the import data is not json!';
         }
      }, //fn
      fillScore: function(score) { //填空、拖拽情况
         if ($(".js-zongScore-iput").length > 0 && $(".js-xt-pub-fillblank-wrap").length > 0) {
            var _score = score + '',
               feA = parseInt(score);
            if (_score.indexOf('.') > -1) {
               feA = parseFloat(score);
            }
            var feB = $(".js-xt-pub-fillblank-wrap").find(".fill-li").length,
               feN = feA / feB;
            if (feB == 0) {
               feN = 0;
            }
            $(".js-zongScore-iput").val(feN);
            $(".js-ZongScore-pargram").text(score);
         }
      },
      isJson: function(data) {
         if (typeof(data) == "object" && Object.prototype.toString.call(data).toLowerCase() == "[object object]" && !data.length) {
            return true;
         }
         return false;
      },
      writeInString: function(objId, strings) { //设值 仅会对存在元素进行设置
         var body = obj.var.body,
            elm = body.find('#' + obj.PDobjectId(objId));
         if (elm.length > 0) {
            if (objId == "chapterId" || objId == "chapterName") { //特殊 大题节点
               var noSp = elm.find(".js-sgST-nodeName");
               if (objId == "chapterId") {
                  noSp.attr('chapterId', strings);
               }
               if (objId == "chapterName") {
                  noSp.text(strings);
               }
            } else {
               obj.PDelenmtType(elm, 'set', strings);
            }
         }
      },
      getThevalue: function(objId) {
         var body = obj.var.body,
            elm = body.find('#' + obj.PDobjectId(objId));
         if (elm.length > 0) {
            if (objId == "chapterId" || objId == "chapterName") { //特殊 大题节点
               var noSp = elm.find(".js-sgST-nodeName");
               if (objId == "chapterId") {
                  var atr = '';
                  if (typeof(noSp.attr('chapterId')) !== 'undefined') {
                     atr = noSp.attr('chapterId');
                  }
                  return atr;
               }
               if (objId == "chapterName") {
                  return noSp.text();
               }
            } else {
               return obj.PDelenmtType(elm, 'get');
            }
         } else {
            return false;
         }
      },
      PDobjectId: function(id) { //判断对象id [可考虑将方法外置]
         var iid = id;
         if (id == "chapterId" || id == "chapterName") {
            iid = 'chapter';
         }
         return iid;
      },
      PDelenmtType: function(elm, type, strings) { //对象集合处理 赋值、取值
         var tagName = elm.get(0).tagName.toLowerCase();
         if (type == 'set') {
            if (tagName == "input" || tagName == "textarea" || tagName == "select") {
               elm.val(strings);
            } else {
               elm.text(strings);
            }
         } else if (type == 'get') {
            var sV = '';
            if (tagName == "input" || tagName == "textarea" || tagName == "select") {
               sV = elm.val();
            } else {
               sV = elm.text();
            }
            return obj.changeReturType(elm.attr('id'), sV);
         }
      },
      discriminateIdDisable: function(id) { //识别id是否为特殊结构
         var arr = obj.var.disabledId;
         for (var i = 0; i < arr.length; i++) {
            if (arr[i] == id) {
               return true;
            }
         }
         return false;
      },
      attributesIdsonJson: function(id) { //是否为attributes or/ itemAttributes 下的子集参数
         var arr = obj.var.attributes;
         if (obj.model == 'dianti') {
            arr = obj.var.itemAttributes;
         }
         for (var i = 0; i < arr.length; i++) {
            if (arr[i] == id) {
               return true;
            }
         }
         return false;
      },
      changeReturType: function(id, value) { //查看类型是否需要转换
         var json = obj.var.dataMatchType;
         for (i in json) {
            if (i == id) {
               if (json[i] == 'int') { //整数类型
                  return parseInt(value);
               }
            }
         }
         return value;
      }
   }
   return obj;
}

function publicTestIframeSubmit(btn, iframeId, iframeName, fn) { //通用试卷、模板 提交
   var times = null;
   if ($(iframeId).length > 0) {
      $(iframeId).off('load').on('load', function() {
         var wid = window.frames[iframeName].window,
            doc = $(window.frames[iframeName].window.document);
         /*
         btn.off('click').on('click',function(){
         	$(this).attr('disabled',true);
         	if(typeof(fn)=='function'){fn(wid, doc);}
         });*/
         //btn.removeAttr('disabled');
         //btn.off('click').on('click', {widx:wid, doc:doc, fn:fn}, publicTestIfCallback);
         btn.off('click').on('click', function() {
            fn(wid, doc);
         });
      });
   }
}
var tiemms = null;

function publicTestIfCallback(e) { //publicTestIframeSubmit 方法的指定回调执行
   var iTs = $(this);
   clearTimeout(tiemms);
   tiemms = setTimeout(function() {
      if (typeof(iTs.attr('disabled')) == 'undefined') {
         iTs.attr('disabled', true); //.off('click', publicTestIfCallback);
         if (typeof(e.data.fn) == 'function') {
            e.data.fn(e.data.widx, e.data.doc);
         }
      }
   }, 200);
}

function timesChoiceWindow() { //时间选择窗口
   var obj = {
      import: { //初始预设值
         type: 'pm', //am or pm
         hour: 0, //小时
         minute: 0 //分钟
      },
      var: {
         widox: window.top, //window域
         $body: null, //jq body 对象
         uSc: null, //滚动高度
         uBw: null, //可视区 width
         uBh: null, //可视区 height
         timeResult: {
            type: "am",
            hour: "-",
            minute: "-"
         }, //时间结果存储
      },
      elm: {
         mask: null, //蒙版
         wrap: null, //框体
         wAPM: null, //AM-PM父容器
         wHour: null, //小时父容器
         wMint: null, //分钟父容器
         wTool: null //yes cancel容器
      },
      ini: function() {
         obj.setVar();
         obj.var.$body.append(obj.creatDoms());
         obj.getElement();
         obj.elm.wrap.css('margin-top', ((obj.var.uBh - obj.elm.wrap.height()) * .5) + 'px');
         obj.bindEvent();
         obj.runCase();
      },
      runCase: function() { //执行import数据
         var impt = obj.import;
         if (impt.type == 'am') {
            obj.elm.wAPM.find("a").eq(0).trigger('click');
         } else {
            obj.elm.wAPM.find("a").eq(1).trigger('click');
         }
         obj.elm.wHour.find(".cont").find("a").each(function() {
            if (parseInt($(this).text()) == parseInt(impt.hour)) {
               $(this).trigger('click');
            }
         });
         obj.elm.wMint.find(".cont").find("a").each(function() {
            if (parseInt($(this).text()) == parseInt(impt.minute)) {
               $(this).trigger('click');
            }
         });
      },
      setVar: function() { //变量赋值
         var wI = obj.var.widox;
         obj.var.$body = $(wI.document.body);
         obj.var.uSc = wI.document.body.scrollTop || wI.document.documentElement.scrollTop;
         obj.var.uBw = wI.document.documentElement.clientWidth;
         obj.var.uBh = wI.document.documentElement.clientHeight;
      },
      getElement: function() { //对象赋值
         obj.elm.mask = obj.var.$body.find(".timesChoiceWindow-mask");
         obj.elm.wrap = obj.elm.mask.find(".timsHM-wrap");
         obj.elm.wAPM = obj.elm.wrap.find(".timsHM-AMorPM");
         obj.elm.wHour = obj.elm.wrap.find(".timsHM-hour");
         obj.elm.wMint = obj.elm.wrap.find(".timsHM-minute");
         obj.elm.wTool = obj.elm.wrap.find(".timsHM-tool");
      },
      bindEvent: function() { //事件绑定
         var wAPM = obj.elm.wAPM,
            wHour = obj.elm.wHour,
            wMint = obj.elm.wMint;
         wAPM.find("a").off("click").on("click", function() { //AM or PM 切换
            wAPM.find("a").removeClass("act");
            $(this).addClass("act");
            if ($(this).is(".am")) {
               obj.var.timeResult.type = "am";
            } else {
               obj.var.timeResult.type = "pm";
            }
            var arr = obj.AmOrPm();
            for (var i = 0; i < arr[obj.var.timeResult.type].length; i++) {
               wHour.find("a").eq(i).text(arr[obj.var.timeResult.type][i]);
            }
            obj.expSumb();
         });
         wHour.find("a").off("click").on("click", function() { //选择小时
            wHour.find("a").removeClass("act");
            $(this).addClass("act");
            obj.var.timeResult.hour = $(this).text();
            obj.expSumb();
         });
         wMint.find("a").off("click").on("click", function() { //选择分钟
            wMint.find("a").removeClass("act");
            $(this).addClass("act");
            obj.var.timeResult.minute = $(this).text();
            obj.expSumb();
         });
         obj.elm.wTool.find("a").off("click").on("click", function() { //yes or cancel
            if ($(this).is(".submit") && $(this).is(".on")) {
               obj.callback(obj.var.timeResult, obj.elm.wrap.find(".result-time em").text());
               obj.elm.mask.remove();
            } else if ($(this).is(".cancel")) {
               obj.elm.mask.remove();
            }
         });
      },
      appendSonOption: function() { //插入子项内容
         obj.elm.wHour.find(".cont").html();
      },
      creatDoms: function() { //创建大结构
         return '<div class="timesChoiceWindow-mask">' +
            '<div class="timsHM-wrap">' +
            '<span class="result-time">结果时间：<em>-</em></span>' +
            '<div class="timsHM-AMorPM">' +
            '<a class="act am" href="javascript:;">AM</a>' +
            '<a class="pm" href="javascript:;">PM</a>' +
            '</div>' +
            '<div class="timsHM-hour">' +
            '<p class="til">选择小时</p>' +
            '<div class="cont">' + obj.creatHour() + '</div>' +
            '</div>' +
            '<div class="timsHM-minute">' +
            '<p class="til">选择分钟</p>' +
            '<div class="cont">' + obj.creatMinute() + '</div>' +
            '</div>' +
            '<div class="timsHM-tool">' +
            '<a class="submit" href="javascript:;">确定</a>' +
            '<a class="cancel" href="javascript:;">取消</a>' +
            '</div>' +
            '</div>' +
            obj.styleLabel() +
            '</div>';
      },
      creatHour: function() { //创建小时 结构
         var dom = '';
         for (var i = 0; i < 12; i++) {
            dom += '<a href="javascript:;">0</a>';
         }
         return dom;
      },
      creatMinute: function() { //创建分钟 结构
         var dom = '<p>';
         for (var i = 0; i < 60; i++) {
            var ii = i;
            if (i < 10) {
               ii = '0' + i;
            }
            dom += '<a href="javascript:;">' + ii + '</a>';
            if (i == 19) {
               dom += '</p><p style="margin:4px 0">';
            }
            if (i == 39) {
               dom += '</p><p>';
            }
            if (i == 59) {
               dom += '</p>';
            }
         }
         return dom;
      },
      styleLabel: function() {
         var wrap = '.timesChoiceWindow-mask .timsHM-wrap';
         return '<style>' +
            '.timesChoiceWindow-mask{ position:absolute; left:0; top:0; width:100%; height:' + obj.var.uBh + 'px; background:rgba(0,0,0,0.5); z-index:99;}' +
            wrap + '{ position:relative; margin:0 auto; padding:20px 10px 10px; max-width:600px; width:80%; border-radius:8px; background:#fff; }' +
            wrap + ' .timsHM-AMorPM{ margin-bottom:10px; width:100%; border-bottom:1px solid #dedede; }' +
            wrap + ' .timsHM-AMorPM a{ padding:0 8px; color:#666; border:1px solid #fff; border-bottom:0; border-radius:6px 6px 0 0; display:inline-block; }' +
            wrap + ' .timsHM-AMorPM a:hover{ border:1px solid #ccc; border-bottom:0; }' +
            wrap + ' .timsHM-AMorPM .act{ color:#fff; background: #fb636b; }' +
            wrap + ' .timsHM-AMorPM .act:hover{ border:1px solid #fff; border-bottom:0; }' +
            wrap + ' .til{ margin-bottom:6px; color:#bbb; }' +
            wrap + ' .result-time{ position:absolute; right:14px; top:10px; color:#666; }' +
            wrap + ' .result-time em{ margin-left:2px; color:#333; font-family:Arial,Helvetica, sans-serif; }' +
            wrap + ' .timsHM-hour{ margin:10px 0; }' +
            wrap + ' .timsHM-hour a{ margin:0 2px; padding:0 12px; line-height:36px; color:#cacaca; font-size:16px; border:1px solid #cecece; border-radius:5px; display:inline-block; font-family:Arial,Helvetica, sans-serif;}' +
            wrap + ' .timsHM-hour a:hover{ color:#fff; background:#ccc; }' +
            wrap + ' .timsHM-hour .act{ color:#fff; background:#fb636b; border:1px solid #fb636b;}' +
            wrap + ' .timsHM-hour .act:hover{ color:#fff; background: #fb636b;}' +
            wrap + ' .timsHM-minute p.til{ margin-bottom:6px;}' +
            wrap + ' .timsHM-minute p{ margin:0;}' +
            wrap + ' .timsHM-minute a{ margin:0 2px; padding:0 4px; line-height:18px; color:#cacaca; border:1px solid #cecece; border-radius:3px; display:inline-block; font-family: Arial,Helvetica, sans-serif;}' +
            wrap + ' .timsHM-minute a:hover{ color:#fff; background:#ccc; }' +
            wrap + ' .timsHM-minute .act{ color:#fff; background:#fb636b; border:1px solid #fb636b;}' +
            wrap + ' .timsHM-minute .act:hover{ color:#fff; background:#fb636b;}' +
            wrap + ' .timsHM-tool{margin-top:10px; padding-top:8px; width:100%; border-top:1px solid #dedede; }' +
            wrap + ' .timsHM-tool a{ margin:0 2px; padding:0 12px; line-height:32px; border-radius:4px; color: #999; background:#dfdfdf; display:inline-block;}' +
            wrap + ' .timsHM-tool .submit{ cursor:not-allowed;}' +
            wrap + ' .timsHM-tool .submit[class*="on"]{ color:#fff; background:#fb636b; cursor:pointer; }' +
            wrap + ' .timsHM-tool .cancel{ color:#999; background:#dfdfdf;}' +
            wrap + ' .timsHM-tool .cancel:hover{ color:#fff; background:#bababa;}' +
            '</style>';
      },
      AmOrPm: function() { //时段 am pm 存储
         return {
            am: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            pm: ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00"]
         };
      },
      expSumb: function() {
         var st = "",
            fu = "-";
         for (i in obj.var.timeResult) {
            if (obj.var.timeResult[i] == "-") {
               return false;
            } else {
               if (i == "hour") {
                  fu = ":";
                  obj.var.timeResult[i] = obj.elm.wHour.find(".act").text();
               }
               st += obj.var.timeResult[i] + fu;
            }
         }
         st = st.substring(0, st.length - 1);
         obj.elm.wrap.find(".result-time em").text(st);
         obj.elm.wTool.find(".submit").addClass("on");
      },
      callback: function() {}
   };
   return obj;
}

function timsHM(fn) { //时分选择
   var widows = $(window.top.document.body),
      uSc = window.top.document.body.scrollTop || window.top.document.documentElement.scrollTop,
      uBw = window.top.document.documentElement.clientWidth,
      uBh = window.top.innerHeight,
      uAh = $(window.top).height(),
      dom = "";
   dom = '<div class="timsHM-mask">' +
      '<div class="timsHM-wrap">' +
      '<span class="result-time">结果时间：<em>-</em></span>' +
      '<div class="timsHM-AMorPM">' +
      '<a class="act am" href="javascript:;">AM</a>' +
      '<a class="pm" href="javascript:;">PM</a>' +
      '</div>' +
      '<div class="timsHM-hour">' +
      '<p class="til">选择小时</p>' +
      '<a href="javascript:;">01</a>' +
      '<a href="javascript:;">02</a>' +
      '<a href="javascript:;">03</a>' +
      '<a href="javascript:;">04</a>' +
      '<a href="javascript:;">05</a>' +
      '<a href="javascript:;">06</a>' +
      '<a href="javascript:;">07</a>' +
      '<a href="javascript:;">08</a>' +
      '<a href="javascript:;">09</a>' +
      '<a href="javascript:;">10</a>' +
      '<a href="javascript:;">11</a>' +
      '<a href="javascript:;">12</a>' +
      '</div>' +
      '<div class="timsHM-minute">' +
      '<p class="til">选择分钟</p>' +
      '<p>' +
      '<a href="javascript:;">00</a>' +
      '<a href="javascript:;">01</a>' +
      '<a href="javascript:;">02</a>' +
      '<a href="javascript:;">03</a>' +
      '<a href="javascript:;">04</a>' +
      '<a href="javascript:;">05</a>' +
      '<a href="javascript:;">06</a>' +
      '<a href="javascript:;">07</a>' +
      '<a href="javascript:;">08</a>' +
      '<a href="javascript:;">09</a>' +
      '<a href="javascript:;">10</a>' +
      '<a href="javascript:;">11</a>' +
      '<a href="javascript:;">12</a>' +
      '<a href="javascript:;">13</a>' +
      '<a href="javascript:;">14</a>' +
      '<a href="javascript:;">15</a>' +
      '<a href="javascript:;">16</a>' +
      '<a href="javascript:;">17</a>' +
      '<a href="javascript:;">18</a>' +
      '<a href="javascript:;">19</a>' +
      '</p>' +
      '<p style="margin:4px 0">' +
      '<a href="javascript:;">20</a>' +
      '<a href="javascript:;">21</a>' +
      '<a href="javascript:;">22</a>' +
      '<a href="javascript:;">23</a>' +
      '<a href="javascript:;">24</a>' +
      '<a href="javascript:;">25</a>' +
      '<a href="javascript:;">26</a>' +
      '<a href="javascript:;">27</a>' +
      '<a href="javascript:;">28</a>' +
      '<a href="javascript:;">29</a>' +
      '<a href="javascript:;">30</a>' +
      '<a href="javascript:;">31</a>' +
      '<a href="javascript:;">32</a>' +
      '<a href="javascript:;">33</a>' +
      '<a href="javascript:;">34</a>' +
      '<a href="javascript:;">35</a>' +
      '<a href="javascript:;">36</a>' +
      '<a href="javascript:;">37</a>' +
      '<a href="javascript:;">38</a>' +
      '<a href="javascript:;">39</a>' +
      '</p>' +
      '<p>' +
      '<a href="javascript:;">40</a>' +
      '<a href="javascript:;">41</a>' +
      '<a href="javascript:;">42</a>' +
      '<a href="javascript:;">43</a>' +
      '<a href="javascript:;">44</a>' +
      '<a href="javascript:;">45</a>' +
      '<a href="javascript:;">46</a>' +
      '<a href="javascript:;">47</a>' +
      '<a href="javascript:;">48</a>' +
      '<a href="javascript:;">49</a>' +
      '<a href="javascript:;">50</a>' +
      '<a href="javascript:;">51</a>' +
      '<a href="javascript:;">52</a>' +
      '<a href="javascript:;">53</a>' +
      '<a href="javascript:;">54</a>' +
      '<a href="javascript:;">55</a>' +
      '<a href="javascript:;">56</a>' +
      '<a href="javascript:;">57</a>' +
      '<a href="javascript:;">58</a>' +
      '<a href="javascript:;">59</a>' +
      '</p>' +
      '</div>' +
      '<div class="timsHM-tool">' +
      '<a class="submit" href="javascript:;">确定</a>' +
      '<a class="cancel" href="javascript:;">取消</a>' +
      '</div>' +
      '</div>' +
      '</div>';
   widows.append(dom);
   var result = {
         type: "am",
         hour: "-",
         minute: "-"
      },
      mask = widows.find(".timsHM-mask"),
      wrap = mask.find(".timsHM-wrap"),
      wAPM = wrap.find(".timsHM-AMorPM"),
      wHour = wrap.find(".timsHM-hour"),
      wMint = wrap.find(".timsHM-minute"),
      wTool = wrap.find(".timsHM-tool");
   mask.css({
      "height": uBh + "px"
   });
   wrap.css({
      "margin-top": (uBh - wrap.height()) * .5 + "px"
   })
   wAPM.find("a").off("click").on("click", function() { //AM or PM 切换
      var arr = {
         am: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
         pm: ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00"]
      };
      wAPM.find("a").removeClass("act");
      $(this).addClass("act");
      if ($(this).is(".am")) {
         result.type = "am";
      } else {
         result.type = "pm";
      }
      for (var i = 0; i < arr[result.type].length; i++) {
         wHour.find("a").eq(i).text(arr[result.type][i]);
      }
      expSumb();
   });
   wHour.find("a").off("click").on("click", function() { //选择小时
      wHour.find("a").removeClass("act");
      $(this).addClass("act");
      result.hour = $(this).text();
      expSumb();
   });
   wMint.find("a").off("click").on("click", function() { //选择分钟
      wMint.find("a").removeClass("act");
      $(this).addClass("act");
      result.minute = $(this).text();
      expSumb();
   });
   wTool.find("a").off("click").on("click", function() { //yes or cancel
      if ($(this).is(".submit") && $(this).is(".on")) {
         fn(result, wrap.find(".result-time em").text());
         mask.remove();
      } else if ($(this).is(".cancel")) {
         mask.remove();
      }
   });

   function expSumb() {
      var st = "",
         fu = "-";
      for (i in result) {
         if (result[i] == "-") {
            return false;
         } else {
            if (i == "hour") {
               fu = ":";
               result[i] = wHour.find(".act").text();
            }
            st += result[i] + fu;
         }
      }
      st = st.substring(0, st.length - 1);
      wrap.find(".result-time em").text(st);
      wTool.find(".submit").addClass("on");
   }
}

function bindKendoViewTreeBTn() { //kendo viewtree bind tool btn
   var obj = {
      result: { //每次回调数据
         cName: 'ini', //事件类型
         this: null, //事件对象
         dItem: null, //当前选择的 kendo 数据
         obj: null
      },
      elm: {
         wrap: $('.js-viewtree-simGrid'),
         kendoBx: $("#treeView")
      },
      ini: function() {
         obj.result['cName'] = 'ini';
         obj.result['obj'] = obj;
         obj.widSize();
         $(window).resize(function() {
            obj.widSize();
         });
         obj.bindClick();
         obj.callback(obj.result);
      },
      bindClick: function() {
         var li = obj.elm.wrap.find("li");
         li.off('click').on('click', function(e) {
            li.removeClass('act');
            $(this).addClass('act');
            var tKen = $("#treeView").data('kendoTreeView');
            tKen.select($(this).closest('.k-in'));
            obj.result['cName'] = 'examChoiese';
            obj.result['this'] = $(this);
            obj.result['dItem'] = {
               fatherData: tKen.dataItem($(this).closest('.k-in')),
               papertmplstructid: $(this).attr("papertmplstructid"),
               papertmplid: $(this).attr("papertmplid"),
               ruleid: $(this).attr("ruleid"),
               itemtypeid: $(this).attr("itemTypeId")
            }
            obj.callback(obj.result); //选中
            return false;
         });
         obj.elm.wrap.find(".js-vtsim-btn").off('click').on('click', function(e) {
            /*li.removeClass('act');
            $(this).closest('li').addClass('act');*/
            if ($(this).is(".js-vtsim-del")) {
               var tKen = $("#treeView").data('kendoTreeView'),
                  iTs = $(this),
                  parent = iTs.parent('li');
               tKen.select(iTs.closest('.k-in'));
               baseConfrimTipsImportOrErorr({
                  type: "info",
                  btnType: "half",
                  title: "删除填空",
                  text: "是否删除<b>（题号 " + iTs.siblings("span").text() + "）</b>？"
               }, function() {
                  obj.result['cName'] = 'del';
                  obj.result['this'] = iTs.closest('li');
                  obj.result['dItem'] = {
                     fatherData: tKen.dataItem(iTs.closest('.k-in')),
                     itemtypeid: parent.attr("itemTypeId"),
                     papertmplstructid: parent.attr("papertmplstructid"),
                     papertmplid: parent.attr("papertmplid"),
                     ruleid: parent.attr("ruleid")
                  }
                  obj.callback(obj.result); //功能按钮
               });
            }
            return false;
         });
         $("#treeView").find("span.k-in").on('click', function(e) {
            if ($(this).is(".k-state-selected")) {
               //console.log($(this))
               //$("#treeView").data("kendoTreeView").select();
               //$("#treeView").data("kendoTreeView").select($(this));
               var treeview = $("#treeView").data("kendoTreeView"),
                  dataItem = treeview.dataItem(this); //属于文本范畴查找，text不能同名
               obj.result['cName'] = 'farChoineseAgin';
               obj.result['this'] = $(this);
               obj.result['dItem'] = dataItem;
               obj.callback(obj.result); //功能按钮
            }
         });
      },
      choieseNodes: function(id) {
         var wrap = obj.elm.wrap,
            li = wrap.find("li");
         li.removeClass('act');
         li.each(function(i) {
            if ($(this).attr('ruleid') == id) {
               $(this).click();
            }
         });
      },
      widSize: function() {
         var uW = window.top.document.documentElement.clientWidth,
            _class = '',
            _r = '';
         if (Math.abs(uW - 1366) <= 20) { //w1366
            _class = 'vitsim-w33';
            _r = 'vitsim-w25 vitsim-w20';
         } else if (Math.abs(uW - 1400) <= 20) { //w1400
            _class = 'vitsim-w33';
            _r = 'vitsim-w25 vitsim-w20';
         } else if (Math.abs(uW - 1440) <= 20) { //w1440
            _class = 'vitsim-w33';
            _r = 'vitsim-w25 vitsim-w20';
         } else if (Math.abs(uW - 1600) <= 20) { //w1600
            _class = 'vitsim-w25';
            _r = 'vitsim-w33 vitsim-w20';
         } else if (Math.abs(uW - 1680) <= 20) { //w1680
            _class = 'vitsim-w25';
            _r = 'vitsim-w33 vitsim-w20';
         } else if (Math.abs(uW - 1920) <= 20) { //w1920
            _class = 'vitsim-w20';
            _r = 'vitsim-w33 vitsim-w25';
         }
         obj.elm.wrap.addClass(_class).removeClass(_r);
      },
      changeKendoCis: function(igt, e) { //选择事件传递kendo 设置当前act样式
         obj.elm.kendoBx.find(".k-in").removeClass("k-state-selected");
         igt.addClass("k-state-selected").removeClass("k-state-hover");
         obj.elm.kendoBx.find("li.k-item").attr('aria-selected', false);
         igt.closest("li.k-item").attr('aria-selected', true);
         obj.result['dItem'] = $("#treeView").data("kendoTreeView").dataItem($(e.target)); //属于文本范畴查找，text不能同名
      },
      callback: function(data) {}
   };
   return obj;
}

function creatDomChoieseNode() { //添加大题及小节
   var obj = {
      result: {
         cName: 'ini', //事件类型
         data: null,
         obj: null
      },
      var: {
         importData: null, //导入数据
         uW: window.top.document.documentElement.clientWidth,
         uH: window.top.document.documentElement.clientHeight,
         title: "框体标题(添加大题及小节)", //标题
         stW: 760, //框体width
         cIgt: null, //当前选中对象整体数据
      },
      elm: {
         widow: $(window.top.document.body),
         wrap: null,
      },
      ini: function() {
         obj.baseDom();
         obj.setAttr();
         obj.render();
         obj.bindEvent.base();
      },
      render: function() {
         obj.forEachDataCreat();
         obj.bindEvent.creat();
      },
      style: function() {
         return '<style>' +
            '.choieseNodes-menban{ position:absolute; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99;}' +
            '.choieseNodes-wrap{ position:relative; padding:41px 15px 15px; width:' + obj.var.stW + 'px; background:#fff; box-shadow:1px 1px 2px #555; box-sizing:border-box; border-radius:4px;}' +
            '.choieseNodes-wrap .cins-title{ position:absolute; left:15px; top:15px; padding:0 10px; text-align:left; width:730px; line-height:26px; color:#fff; background:#b7b7b7; border-radius:2px; box-sizing:border-box;}' +
            '.choieseNodes-wrap .cins-title *{ display:inline-block;}' +
            '.choieseNodes-wrap .cins-title .close-btn{ position:absolute; right:0px; top:0px; text-align:center; width:26px; height:26px; line-height:22px; color:#fff; font-size:19px;}' +
            '.choieseNodes-wrap .cins-contai{ float:left; position:relative; padding:10px 0 10px 145px; width:100%; box-sizing:border-box;}' +
            '.choieseNodes-wrap .cins-contai .cins-left{ position:absolute; left:0; top:10px; width:135px;}' +
            '.choieseNodes-wrap .cins-contai .cins-right{ float:left; padding:12px; width:100%; height:320px; border:1px solid #ccc; border-radius:4px; overflow-x:hidden; overflow-y:auto;}' +
            '.choieseNodes-wrap .cins-contai .cins-load{ position:absolute; right:1px; width:100%; height:100%; background:rgba(255,255,255,1); border-radius:4px; display:none;}' +
            '.choieseNodes-wrap .cins-contai .cins-load div{ margin:0 auto; width:80px; height:86px;}' +
            '.choieseNodes-wrap .cins-contai .cins-load img{ margin:0 auto; width:60px; height:60px;}' +
            '.choieseNodes-wrap .cins-contai .cins-load span{ line-height:26px; display:block;}' +
            '.choieseNodes-wrap .cins-contai .cins-empty{ position:absolute; right:1px; width:100%; height:100%; background:rgba(255,255,255,1); border-radius:4px;}' +
            '.choieseNodes-wrap .cins-contai .cins-empty span{ height:inherit; line-height:inherit; font-weight:bold; font-size:14px;}' +
            '.choieseNodes-wrap .cins-contai .cins-empty img{ float:left; margin-left:65px; width:160px; height:204px;}' +
            //大题
            '.cins-right .cins-mtxli{ float:left; width:49%;}' +
            '.cins-right .cins-mtxli:nth-last-child{ margin-left:2%;}' +
            '.cins-right .cins-mtxli .cins-mtxTitle{ float:left; width:100%;}' +
            '.cins-right .cins-mtxli .cins-normal,.cins-right .cins-mtxli .cins-edit{ float:left; text-align:left; width:100%; height:26px; line-height:26px; overflow:hidden;}' +
            '.cins-right .cins-mtxli .cins-normal span{ float:left; margin-right:7px; padding:0 0 0 30px; width:120px; border-radius:3px; background:url(../images/component/u646.png) 7px center no-repeat; background-size:17px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;}' +
            '.cins-right .cins-mtxli .cins-normal span:hover,.cins-right .cins-mtxli .cins-normal span.act:hover{ background-color:rgba(0,0,0,0.08);}' +
            '.cins-right .cins-mtxli .cins-normal span.act{ background-image:url(../images/component/u646b.png); background-color:rgba(0,0,0,0.16);}' +
            '.cins-right .cins-mtxli .cins-normal .btn{ margin:2px 1px 0; vertical-align:top; opacity:0;}' +
            '.cins-right .cins-mtxli .cins-normal .btn.js-add{ opacity:1;}' +
            '.cins-right .cins-mtxli .cins-normal:hover .btn{ opacity:1;}' +
            '.cins-right .cins-mtxli .cins-edit{ display:none;}' +
            '.cins-right .cins-mtxli .cins-edit input{ float:left; margin-right:1px; padding:0 4px; width:152px; height:26px; line-height:26px; color:#333; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;}' +
            '.cins-right .cins-mtxli .cins-edit .btn{ margin:2px 1px 0; vertical-align:top;}' +
            //小节
            '.cins-right .cins-mtxli .cins-mtxTable{ float:left; margin-bottom:0; width:100%;}' +
            '.cins-right .cins-mtxli .cins-mtxTable li{ float:left; width:100%;}' +
            '.cins-right .cins-mtxli .cins-mtxTable .cins-normal span{ padding-left:50px; width:144px; background-position:28px center;}' +
            '</style>';
      },
      baseDom: function() { //创建大框架
         var dom = '<div class="choieseNodes-menban">' +
            '<div class="choieseNodes-wrap clear-fix">' +
            '<div class="cins-title">' +
            '<span>' + obj.var.title + '</span>' +
            '<a class="js-close-btn close-btn" href="javascript:;">x</a>' +
            '</div>' +
            '<div class="cins-contai">' +
            '<div class="cins-left">' +
            '<img src="../images/general/theBigIcons-upupup.png"/>' +
            '<button class="js-creat marT-14 width-60 btn btn-sm btn-default">新增大题</button>' +
            '<div style="margin:16px 0; width:90%; border-top:1px solid #d5d5d5;"></div>' +
            '<button class="js-allsave-btn width-60 btn btn-sm btn-default">保存</button>' +
            '<button class="js-close-btn marT-7 width-60 btn btn-sm btn-default">关闭</button>' +
            '</div>' +
            '<div class="cins-right">' +
            //will js append
            '</div>' +
            '<div class="cins-load"><div><img src="../images/component/svg/oval-second.svg"/><span>正在载入中</span></div></div>' +
            '<div class="cins-empty"><img src="../images/figure/happy.jpg"/><span>暂无大题小节数据项噢，赶紧添加吧！：）</span></div>' +
            '</div>' +
            '</div>' +
            '</div>';
         obj.elm.widow.append(obj.style() + dom);
         obj.elm.wrap = obj.elm.widow.find('.choieseNodes-wrap');
      },
      setAttr: function() { //样式设置
         var wrp = obj.elm.wrap;
         wrp.css({
            'margin-left': (obj.var.uW - basicFE.elm.getObjSize(wrp, 5) - wrp.width()) * .5 + 'px',
            'margin-top': (obj.var.uH - basicFE.elm.getObjSize(wrp, 6) - wrp.height()) * .5 + 'px'
         });
         //loading settings
         var rBx = wrp.find(".cins-right"),
            pad = parseInt(rBx.css('padding-top')) * 2,
            bor = 0;
         //bor=parseInt(rBx.css('border-left-width'))*2;
         wrp.find(".cins-empty").css({
            'top': parseInt(wrp.find(".cins-contai").css('padding-top')) + 1,
            'width': pad + rBx.width() + bor + 'px',
            'height': pad + rBx.height() + bor + 'px',
            'line-height': pad + rBx.height() + bor + 'px'
         }).find("img").css({
            "margin-top": ((pad + rBx.height() + bor) - wrp.find(".cins-empty").find('img').height()) * .5
         });
         wrp.find(".cins-load").css({
            'top': parseInt(wrp.find(".cins-contai").css('padding-top')) + 1,
            'width': pad + rBx.width() + bor + 'px',
            'height': pad + rBx.height() + bor + 'px'
         }).find("div").css({
            "margin-top": ((pad + rBx.height() + bor) - wrp.find(".cins-load").find('div').height()) * .5
         });
      },
      bindEvent: {
         base: function() {
            var cls = obj.elm.wrap.find('.js-close-btn'),
               btn = obj.elm.wrap.find('.js-creat'),
               sav = obj.elm.wrap.find('.js-allsave-btn');
            btn.on('click', function() { //创建大题
               obj.result['cName'] = 'DTcreatAdd';
               obj.callback(obj.result);
            });
            sav.on('click', function() { //全局保存
               obj.result['cName'] = 'allSave';
               obj.result['data'] = obj.var.cIgt;
               obj.callback(obj.result);
            });
            cls.on('click', function() { //关闭窗口
               obj.result['cName'] = 'closedWindow';
               obj.callback(obj.result);
               obj.closed();
            });
         },
         creat: function() { //临时创建控件
            var wp = obj.elm.wrap,
               tWp = wp.find('.cins-mtxTitle'),
               bWp = wp.find('.cins-mtxTable');
            wp.on('click', function() { //取消所有编辑状态
               wp.find(".cins-edit").css('display', 'none');
               wp.find(".cins-normal").css('display', 'block');
            });
            wp.find('.title').on('click', function() { //大题或小题被选择
               wp.find('.title').removeClass('act');
               $(this).addClass('act');
               obj.result['cName'] = 'nodesChioese';
               obj.result['data'] = obj.searchUID(obj.objAnalyse($(this)));
               obj.var.cIgt = obj.result['data'];
               obj.callback(obj.result);
               return false;
            });
            wp.find(".cins-normal").find('.btn').on('click', function() { //节点操作按钮
               var iTs = $(this);
               if ($(this).is(".js-add")) {
                  obj.result['cName'] = 'XTcreatAdd';
                  obj.result['data'] = obj.searchUID(obj.objAnalyse($(this)));
                  obj.callback(obj.result);
               }
               if ($(this).is(".js-edit")) {
                  var pr = $(this).parent();
                  wp.find(".cins-edit").css('display', 'none');
                  wp.find(".cins-normal").css('display', 'block');
                  pr.css('display', 'none');
                  pr.siblings('.cins-edit').css('display', 'block').find('input').val($(this).siblings('.title').text());
                  setTimeout(function() {
                     pr.siblings('.cins-edit').find('input').focus();
                  }, 100);
               }
               if ($(this).is(".js-del")) {
                  obj.result['cName'] = 'nodesDelete';
                  obj.result['data'] = obj.searchUID(obj.objAnalyse(iTs));
                  obj.callback(obj.result);
               }
               return false;
            });
            wp.find(".cins-edit").on('click', function() {
               return false;
            });
            wp.find(".cins-edit").find('.btn').on('click', function() { //某节点保存
               var pr = $(this).parent();
               pr.css('display', 'none');
               pr.siblings('.cins-normal').css('display', 'block').find('.title').text($(this).siblings('input').val());
               obj.result['cName'] = 'nodesEditor';
               obj.result['data'] = obj.searchUID(obj.objAnalyse($(this)));
               obj.result['text'] = $(this).siblings('input').val();
               obj.callback(obj.result);
               return false;
            });
         }
      },
      objAnalyse: function(jqObj) { //分析对象 是 标题 还是 子节
         if (jqObj.parents(".cins-mtxTitle").length > 0) {
            return jqObj.parents(".cins-mtxli").attr('cins-uid');
         } else {
            return jqObj.parents("li").attr('cins-uid');
         }
      },
      searchUID: function(uid) { //uid查询数据
         for (var i = 0; i < obj.var.importData.length; i++) {
            if (obj.var.importData[i]['uid'] == uid) {
               return obj.var.importData[i];
            }
            for (var n = 0; n < obj.var.importData[i].childrenChapters.length; n++) {
               if (obj.var.importData[i].childrenChapters[n]['uid'] == uid) {
                  return obj.var.importData[i].childrenChapters[n];
               }
            }
         }
      },
      forEachDataCreat: function() { //数据循环
         var data = obj.var.importData,
            dom = '';
         if (data !== null) {
            if (typeof(data) == "object" && data.length > 0) {
               for (var i = 0; i < data.length; i++) {
                  dom += obj.creatBigExama(data[i], basicFE.str.uuid(), i) + '<ul class="cins-mtxTable">';
                  for (var n = 0; n < data[i].childrenChapters.length; n++) {
                     dom += obj.creatSimNode(data[i].childrenChapters[n], basicFE.str.uuid(), i, n);
                  }
                  dom += '</ul></div>';
               }
               obj.elm.wrap.find(".cins-right").html(dom);
               obj.loadEnd();
            } else {
               obj.elm.wrap.find(".cins-empty").css('display', 'block');
            }
         } else {
            alert('在创建节点数据前，请导入正确的参数数据');
         }
      },
      creatBigExama: function(data, uuid, i) { //创建大题
         obj.var.importData[i]['uid'] = uuid;
         var dom = '<div class="cins-mtxli" cins-uid="' + uuid + '">' +
            '<div class="cins-mtxTitle">' +
            '<div class="cins-normal">' +
            '<span class="title' + obj.renderSelectNodes(data) + '" title="' + data.name + '">' + data.name + '</span>' +
            '<a class="btn btn-xs btn-default js-add" title="新增小节" href="javascript:;"><i class="glyphicon glyphicon-plus"></i></a>' +
            '<a class="btn btn-xs btn-default js-edit" title="编辑题名" href="javascript:;"><i class="glyphicon glyphicon-edit"></i></a>' +
            '<a class="btn btn-xs btn-default js-del" title="删除大题" href="javascript:;"><i class="glyphicon glyphicon-trash"></i></a>' +
            '</div>' +
            '<div class="cins-edit">' +
            '<input type="text" placeholder="大题名称" />' +
            '<a class="btn btn-xs btn-success" title="保存" href="javascript:;"><i class="glyphicon glyphicon-saved"></i></a>' +
            '</div>' +
            '</div>';
         //+'</div>';
         return dom;
      },
      creatSimNode: function(data, uuid, i, n) { //创建小节
         obj.var.importData[i].childrenChapters[n]['uid'] = uuid;
         var dom = '<li cins-uid="' + uuid + '">' +
            '<div class="cins-normal">' +
            '<span class="title' + obj.renderSelectNodes(data) + '" title="' + data.name + '">' + data.name + '</span>' +
            '<a class="btn btn-xs btn-default js-edit" title="编辑题名" href="javascript:;"><i class="glyphicon glyphicon-edit"></i></a>' +
            '<a class="btn btn-xs btn-default js-del" title="删除小节" href="javascript:;"><i class="glyphicon glyphicon-trash"></i></a>' +
            '</div>' +
            '<div class="cins-edit">' +
            '<input type="text" placeholder="小节名称" />' +
            '<a class="btn btn-xs btn-success" title="保存" href="javascript:;"><i class="glyphicon glyphicon-saved"></i></a>' +
            '</div>' +
            '</li>';
         return dom;
      },
      loadStar: function() {
         obj.elm.wrap.find(".cins-load").css('display', 'block');
      },
      loadEnd: function() {
         obj.elm.wrap.find(".cins-load").css('display', 'none');
         obj.elm.wrap.find(".cins-empty").css('display', 'none');
      },
      renderSelectNodes: function(idata) { //渲染时 设置 选中nodes
         if (idata.select == true) {
            obj.var.cIgt = idata;
            return ' act';
         }
         return '';
      },
      selectNodes: function() { //指定对象选中    与后台约定一个数据keyName为select，当为true时被选中

      },
      closed: function() {
         obj.elm.wrap.parent().remove();
         obj.var.cIgt = null;
         obj.result['data'] = null;
      },
      callback: function(rst) {}
   };
   obj.result['obj'] = obj;
   return obj;
}

function vigorousFillBlank() { //填空题组件
   var obj = {
      result: {
         cName: 'ini',
         data: null
      },
      var: {
         model: 'template', //使用模式 default-->(template)模板模式 和 (dianti)制题模式(!!卧槽我模式写反了，就反着用吧)
         items: 4, //仅在(dianti 模式)下生效,初始创建空格数量
         starNum: 1, //创建编号排序起点数,默认起点1
         import: "", //导入数据
         uEditor: null, //UEditor对象
         uEBody: null, //UEditor编辑器body容器
         appendLimit: 1, //插入UE编辑器的同个uid填空框允许上限数量
         apdLimitTipsText: "同类填空项无法创建更多", //上限时提示文字
         uEiPutClass: "xt-pubUE-iput" //插入的input对象class值，其包含样式，样式存于../ueditor1_4_3/themes/iframe.css
      },
      elm: {
         wrap: $(".js-xt-pub-fillblank-wrap"), //填空父级
         srap: $(".js-xt-pub-fillAnswer-wrap"), //填空答案
         numb: $(".js-xt-startNumber") //起步题号显示及设置
      },
      ini: function() {
         obj.appendFB.ini();
         obj.inPutWid.ini();
         obj.render();
         obj.allBind();
         obj.result['cName'] = 'iniFillBlank';
         obj.callback(obj.result);
      },
      appendFB: {
         var: {},
         ini: function() {
            obj.appendFB.bindEvent.base();
         },
         creatMatrx: function(dt) {
            var apd = '';
            if (obj.var.model == 'template') {
               apd = '<a class="js-drag btn btn-xs glyphicon glyphicon-plus-sign btn-success" title="插入" href="javascript:;"></a>';
            }
            return '<div class="fill-li" uid="' + dt.uid + '">' +
               '<span class="til">' + dt.num + '</span>' +
               '<div class="tool-box">' +
               apd +
               '<a class="js-del btn btn-xs glyphicon glyphicon-trash btn-danger" title="删除" href="javascript:;"></a>' +
               '</div>' +
               '</div>';
         },
         creatAnswer: function(dt) {
            var wid = 0;
            if (dt.answer.length > 0) {
               wid = obj.analysisStringLength(dt.answer);
            } else {
               wid = obj.inPutWid.var.beW;
            }
            return '<li uid="' + dt.uid + '"><span class="Answ-ecoNum">' + dt.num + '</span><input class="Answ-iput" type="text" style="width:' + wid + 'px;" title="填入正确答案" value="' + dt.answer + '"/></li>';
         },
         creatUEiput: function(dt) {
            return '<input class="' + obj.var.uEiPutClass + '" uid="' + dt.uid + '" answer="' + dt.answer + '" contenteditable="false" value="' + dt.num + '"/>';
         },
         bindEvent: {
            base: function() {
               var wrap = obj.elm.wrap,
                  srap = obj.elm.srap,
                  numb = obj.elm.numb;
               wrap.find(".js-fill-AddBtn").off('click').on('click', function() { //创建新填空项
                  obj.creatDom();
                  obj.allBind();
                  obj.sortWiterIput();
                  obj.result['cName'] = 'AddFillBlank';
                  obj.result['data'] = wrap.find(".fill-li").length;
                  obj.callback(obj.result);
               });
               numb.on('input', function() { //输入限制
                  var val = $(this).val();
                  if (isNaN(val) || val.indexOf(" ") > -1 || val.indexOf(".") > -1 || val.length > 3) {
                     $(this).val(val.substring(0, val.length - 1));
                  }
               });
               numb.on('focus', function() {
                  var val = $(this).val();
                  if (val.indexOf("-") > -1) {
                     $(this).val(val.substring(0, val.indexOf("-")));
                  }
               });
               numb.on('blur', function() { //改变序列
                  var val = parseInt($(this).val());
                  if (!isNaN(val)) {
                     obj.var.starNum = parseInt(val);
                  }
                  obj.renderSort();
                  obj.sortWiterIput();
               });
            },
            uePosBind: function() {
               obj.appendFB.bindEvent.crt();
            },
            crt: function() {
               var bd = $(obj.var.uEBody),
                  wrap = obj.elm.wrap,
                  srap = obj.elm.srap,
                  drg = wrap.find('.js-drag'),
                  del = wrap.find('.js-del'),
                  fli = wrap.find('.fill-li'),
                  asw = srap.find('li'),
                  ueipt = bd.find('.' + obj.var.uEiPutClass);
               if (obj.var.model == 'template') {
                  drg.off('click').on('click', function() { //插入按钮
                     var fli = $(this).closest(".fill-li"),
                        uid = fli.attr("uid"),
                        aws = '';
                     srap.find('li').each(function(i) {
                        if ($(this).attr('uid') == uid) {
                           aws = $(this).find(".Answ-iput").val();
                        }
                     });
                     var dt = {
                        'num': fli.find(".til").text(),
                        'uid': fli.attr('uid'),
                        'answer': aws
                     };
                     if (obj.var.appendLimit > obj.eachfBlankNumberUE(dt.uid)) { //上限是否满足
                        obj.var.uEditor.removeListener('contentChange', obj.appendFB.bindEvent.uePosBind);
                        obj.var.uEditor.addListener('contentChange', obj.appendFB.bindEvent.uePosBind);
                        obj.var.uEditor.execCommand('inserthtml', obj.appendFB.creatUEiput(dt)); //inserthtml
                     } else {
                        fePositionTexTips(obj.var.apdLimitTipsText);
                     }
                  });
               }
               del.off('click').on('click', function() { //删除该项
                  var iTs = $(this);
                  baseConfrimTipsImportOrErorr({
                     type: "info",
                     btnType: "half",
                     title: "删除填空",
                     text: "是否将填空项<b>（题号 " + $(this).parent().siblings(".til").text() + "）</b>删除<br/>删除后所有题目将重新排列序号？"
                  }, function() {
                     var uid = iTs.closest('.fill-li').attr("uid");
                     obj.deleteDom(uid);
                     obj.deleteTargetUE(uid);
                     obj.renderSort();
                     obj.sortWiterIput();
                     obj.result['cName'] = 'DeleteFillBlank';
                     obj.result['data'] = wrap.find(".fill-li").length;
                     obj.callback(obj.result);
                  });
               });
               //变色联动
               fli.off('mouseenter mouseleave');
               fli.on({
                  mouseenter: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                  },
                  mouseleave: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                  }
               });
               asw.off('mouseenter mouseleave');
               asw.on({
                  mouseenter: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                  },
                  mouseleave: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                  }
               });
               if (ueipt.length > 0 && obj.var.model == 'template') {
                  ueipt.off('mouseenter mouseleave');
                  ueipt.on({
                     mouseenter: function(e) {
                        obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                        var html = $(this).parents("html"),
                           uW = html.width(),
                           uH = html.height(),
                           sW = $(this).width(),
                           sH = $(this).height(),
                           sT = $(this).offset().top,
                           sL = $(this).offset().left;
                        bd.append('<div class="xt-pos-messge" style="opacity:0;">' + $(this).attr('answer') + '</div>');
                        setTimeout(function() {
                           var msg = bd.find(".xt-pos-messge"),
                              zw = basicFE.elm.getObjSize(bd.find(".xt-pos-messge"), 5) + bd.find(".xt-pos-messge").width(),
                              zh = basicFE.elm.getObjSize(bd.find(".xt-pos-messge"), 6) + bd.find(".xt-pos-messge").height(),
                              l, t;
                           if (sL - zw - 2 > 0) {
                              l = sL - zw - 2;
                           } else {
                              l = sL + sW + 2;
                           }
                           if (sT - zh - 2 > 0) {
                              t = sT - zh - 2;
                           } else {
                              t = sT + sH + 2;
                           }
                           msg.css({
                              'top': t + 'px',
                              'left': l + 'px',
                              'opacity': 1
                           });
                        }, 200);
                     },
                     mouseleave: function() {
                        obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                        bd.find(".xt-pos-messge").remove();
                     },
                     focus: function() {
                        $(this).blur();
                     }
                  });
               }
            }
         }
      },
      eachfBlankNumberUE: function(uid) { //判断UEiput数量
         var bd = $(obj.var.uEBody),
            num = 0;
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            if (typeof($(this).attr("uid")) !== "undefined") {
               if ($(this).attr("uid") == uid) {
                  num++;
               }
            }
         });
         return num;
      },
      linkageColorView: function(uid) { //联动变色
         var oAr = [],
            bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         for (var i = 0; i < wrap.find(".fill-li").length; i++) {
            if (wrap.find(".fill-li").eq(i).attr('uid') == uid) {
               oAr[0] = wrap.find(".fill-li").eq(i).find(".til");
               oAr[1] = srap.find("li").eq(i).find(".Answ-iput");
            }
         }
         if (obj.var.model == 'template') {
            bd.find('.' + obj.var.uEiPutClass).each(function(i) {
               if ($(this).attr("uid") == uid) {
                  oAr[2] = $(this);
               }
            });
         }
         return oAr;
      },
      linkageChangeColor: function(objAr, type) { //对象变色
         var s = '';
         if (type == 'set') {
            s = '#ffffa0';
         } else if (type == 'clear') {
            s = 'transparent';
         }
         for (var i = 0; i < objAr.length; i++) {
            if (typeof(objAr[i]) !== 'undefined') {
               objAr[i].css('background-color', s);
            }
         }
      },
      //控制input长度随内容
      //为在输入时，时刻改变input尺寸，为其结果非常精确固有此复杂延伸,单个字符尺寸有待确定
      inPutWid: {
         var: {
            beW: 46, //空字符状态宽度
            ZWF: 'QxiiixQ' //占位符
         },
         ini: function() {
            obj.inPutWid.setStyle();
         },
         setStyle: function() {
            obj.elm.srap.find(".Answ-iput").css('width', obj.inPutWid.var.beW);
         },
         bindEvent: function() { //根据内容时刻变换填空项尺寸
            var srap = obj.elm.srap,
               iput = srap.find(".Answ-iput");
            iput.off('input').on('input', function() {
               /*var val=$(this).val(),
                   beW=obj.inPutWid.var.beW,
                   CASEarr=0;              //大写字母数量
               if(val.length==0){
                   $(this).css('width',beW);
                   CASEarr=0;
               }else{
                   var len=val.replace(/[^\u0000-\u00ff]/g,obj.inPutWid.var.ZWF),
                       Ar=len.split(obj.inPutWid.var.ZWF).length-1,                     //利用切割计算汉字数量
                       srt=len.replace(/QxiiixQ/g,''),                 //清除占位符
                       wid='';                                         //设置长度
                   len=srt.length;
                   basicFE.str.allCaps(srt,function(){CASEarr++;});    //大写++
                   wid=(len-CASEarr)*8+(CASEarr+Ar)*13;                //汉字、大写13px、小写、数字8px
                   $(this).css('width',beW+wid);
               }*/
               var val = $(this).val(),
                  uid = $(this).closest('li').attr('uid'),
                  beW = obj.inPutWid.var.beW;
               if (val.length == 0) {
                  $(this).css('width', beW);
               } else {
                  $(this).css('width', obj.analysisStringLength(val));
               }
               var bd = $(obj.var.uEBody);
               bd.find('.' + obj.var.uEiPutClass).each(function() {
                  if ($(this).attr('uid') == uid) {
                     $(this).attr('answer', val);
                  }
               });
            });
         }
      },
      allBind: function() {
         obj.appendFB.bindEvent.crt();
         obj.inPutWid.bindEvent();
      },
      render: function() { //渲染填空 和 答案
         var atrb = null;
         if (obj.var.model == "template") { //制题模式
            if (typeof(obj.var.import.testName) !== 'undefined') {
               obj.var.starNum = parseInt(obj.var.import.testName);
            }
            atrb = obj.var.import.itemAttributes;
         }
         if (obj.var.model == "dianti") { //模板模式
            if (obj.var.import == "") {
               atrb = obj.diantiCreatItems();
               //obj.var.import={testName:1, itemAttributes:atrb};
               obj.var.import = atrb;
            } else { //fillItems maybe = '' is NaN
               if (obj.var.import['fillItems'] !== '') {
                  var starM = parseInt(obj.var.import.fillItems.split(',')[0]);
                  if (!isNaN(starM)) {
                     obj.var.starNum = starM;
                  }
               }
            }
         }
         if (obj.var.import !== "") {
            if (obj.var.starNum > 0) {
               obj.clearDom();
               var filb = [],
                  answer = [],
                  itcm = '';
               if (obj.var.model == "template") { //制题模式
                  for (var i = 0; i < atrb.length; i++) {
                     var icont = atrb[i]['optionContent'];
                     if (atrb[i]['attrType'] == "fillblank") {
                        if (icont.indexOf(',') > 0) {
                           filb = icont.split(',');
                        } else {
                           if (icont == "") {
                              filb = [];
                           } else if (icont.length > 0) {
                              filb = [icont];
                           }
                        }
                     }
                     if (atrb[i]['attrType'] == "answer") {
                        if (icont.indexOf(',') > 0) {
                           answer = icont.split(',');
                        } else {
                           if (icont == "") {
                              answer = [];
                           } else if (icont.length > 0) {
                              answer = [icont];
                           }
                        }
                     }
                     if (atrb[i]['attrType'] == "itemContent") {
                        itcm = atrb[i]['optionContent'];
                        obj.var.uEditor.ready(function() { //必须加载完毕，否则protorty错误
                           obj.var.uEditor.setContent(itcm);
                           setTimeout(function() {
                              obj.changeUidUEinput();
                              obj.appendFB.bindEvent.crt();
                           }, 200);
                           obj.result['cName'] = 'UEditorReadyComplete';
                           obj.callback(obj.result);
                        });
                     }
                  }
                  if (filb.length !== answer.length) { //制题模式 初始进入 未有答案情况
                     for (var n = 0; n < filb.length; n++) {
                        answer.push('');
                     }
                  }
                  if (filb.length == answer.length) {
                     for (var i = 0; i < filb.length; i++) {
                        obj.renderCreatDom({
                           fillblank: filb[i],
                           answer: answer[i]
                        });
                     }
                     obj.sortWiterIput();
                  } else {
                     throw 'fillblank number !== answer number';
                  }
               }
               if (obj.var.model == "dianti") { //模板模式
                  atrb = obj.var.import;
                  for (i in atrb) {
                     if (i == 'fillItems') {
                        if (atrb[i].indexOf(',') > -1) {
                           filb = atrb[i].split(',');
                        } else {
                           filb = [];
                        }
                     }
                  }
                  obj.renderCreatDomTemp({
                     fillItems: filb
                  });
                  obj.sortWiterIput();
               }
            }
         }
      },
      sortWiterIput: function() { //题号修改
         var wrap = obj.elm.wrap,
            numb = obj.elm.numb,
            sNum = (wrap.find('.fill-li').length - 1 + obj.var.starNum);
         if (wrap.find('.fill-li').length == 0) {
            sNum = obj.var.starNum;
         }
         numb.val(obj.var.starNum + '-' + sNum);
      },
      diantiCreatItems: function() { //dianti模式 制造数据
         var num = parseInt(obj.var.items),
            arr = [],
            nub = 0;
         if (isNaN(num)) {
            throw 'obj.var.items is not number!';
         } else {
            for (var i = 0; i < num; i++) {
               nub += (i + 1);
               if (i < num - 1) {
                  nub += ',';
               }
            }
            //arr=[{"attrType":"fillItems", "sort":0, "optionContent":nub},{"attrType":"answer", "sort":0, "optionContent":",,,"}];
            arr = {
               "fillItems": nub
            };
         };
         return arr;
      },
      renderSort: function() { //序列赋数字值
         var bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         for (var i = 0; i < wrap.find(".fill-li").length; i++) {
            var nu = obj.var.starNum + i;
            wrap.find(".fill-li").eq(i).find(".til").text(nu);
            srap.find("li").eq(i).find(".Answ-ecoNum").text(nu);
            //和UEeditor里的input中的编号
         }
         bd.find('.' + obj.var.uEiPutClass).each(function() {
            var iTs = $(this),
               uid = iTs.attr('uid');
            for (var i = 0; i < wrap.find(".fill-li").length; i++) {
               var li = wrap.find(".fill-li").eq(i);
               if (li.attr('uid') == uid) {
                  iTs.val(li.find(".til").text()).attr('value', li.find(".til").text());
               }
            }
         });
      },
      changeUidUEinput: function() { //修正初始渲染的UE内的iput元素uid
         var bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            var iTs = $(this),
               val = iTs.val();
            wrap.find(".fill-li").each(function(i) {
               if (val == parseInt($(this).find(".til").text())) {
                  iTs.attr({
                     'uid': $(this).attr('uid'),
                     'answer': srap.find('li').eq(i).find('.Answ-iput').val()
                  });
                  return false;
               }
            });
         });
      },
      analysisStringLength: function(strings) { //分析字符长度
         var len = 0;
         $("body").append('<div class="js-analysisStringLength-div" style="position:absolute; opacity:0; width:auto; height:32px; display:inline-block;">' + strings + '</div>');
         len = $(".js-analysisStringLength-div").width() + 16; //16为border-width + padding
         $(".js-analysisStringLength-div").remove();
         if (len < obj.inPutWid.var.beW) {
            len = obj.inPutWid.var.beW;
         }
         return len;
      },
      renderCreatDom: function(dtx) { //渲染创建结构
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            dt = {
               'num': dtx['fillblank'],
               'uid': basicFE.str.uuid(),
               'answer': dtx['answer']
            };
         wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx(dt));
         srap.append(obj.appendFB.creatAnswer(dt));
      },
      renderCreatDomTemp: function(dtx) { //渲染创建结构--模板模式
         if (dtx['fillItems'].length > 0) { //is array And length > 0
            var wrap = obj.elm.wrap;
            for (var i = 0; i < dtx['fillItems'].length; i++) { //
               wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx({
                  'num': dtx['fillItems'][i],
                  'uid': basicFE.str.uuid()
               }));
            }
         }
      },
      creatDom: function() { //创建执行
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            dt = {
               'num': wrap.find(".fill-li").length + obj.var.starNum,
               'uid': basicFE.str.uuid(),
               'answer': ''
            };
         wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx(dt));
         srap.append(obj.appendFB.creatAnswer(dt));
      },
      clearDom: function() { //清空dom
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         wrap.find(".fill-li").remove();
         srap.empty();
      },
      deleteTargetUE: function(uid) { //清空指定UE对象
         var bd = $(obj.var.uEBody);
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            if (typeof($(this).attr('uid')) !== "undefined") {
               if ($(this).attr('uid') == uid) {
                  $(this).remove();
               }
            }
         });
      },
      deleteDom: function(uid) { //删除填空项 及 对应答案
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         wrap.find(".fill-li").each(function(i) {
            if ($(this).attr("uid") == uid) {
               $(this).remove();
            }
         });
         srap.find("li").each(function(i) {
            if ($(this).attr("uid") == uid) {
               $(this).remove();
            }
         });
      },
      getPushAttributes: function() { //抓取数据将此返出
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            numb = obj.elm.numb,
            o = {},
            arr = [],
            str = '';
         wrap.find(".fill-li").each(function(i) {
            str += $(this).find('.til').text();
            if (i < wrap.find(".fill-li").length - 1) {
               str += ',';
            }
         });
         arr.push({
            attrType: 'fillblank',
            sort: 0,
            optionContent: str
         });
         str = '';
         srap.find("li").each(function(i) {
            str += $(this).find('.Answ-iput').val();
            if (i < srap.find("li").length - 1) {
               str += ',';
            }
         });
         arr.push({
            attrType: 'answer',
            sort: 0,
            optionContent: str
         });
         arr.push({
            attrType: 'itemContent',
            sort: 0,
            optionContent: obj.var.uEditor.getContent()
         });
         return arr;
      },
      regExperssion: function() { //验证
         var rlst = true,
            bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            fli = wrap.find('.fill-li'),
            asw = srap.find('li'),
            ueipt = bd.find('.' + obj.var.uEiPutClass);
         //public exp
         if (obj.var.model == 'template') { //制题模式
            if (fli.length > 0) {
               if (fli.length !== ueipt.length) { //填空项是否全部插入文章
                  obj.tips({
                     text: '请将填空项全部插入文章中'
                  });
                  return false;
               }
               //验证标准答案是否填写完整
               var eR = [null, 0];
               asw.each(function(i) { //可返回多个未填 或 单个情况下的某个
                  if ($(this).find(".Answ-iput").val() == '') {
                     eR[1]++;
                     if (eR[1] == 1) {
                        eR[0] = $(this).find(".Answ-ecoNum").text();
                     }
                     rlst = false;
                  }
               });
               if (eR[1] > 0) { //校验上each
                  var str = '';
                  if (eR[1] > 1) {
                     str = '多个标准答案值不能为空';
                  } else if (eR[1] == 1) {
                     str = '标准答案<b>(' + eR[0] + ')</b>不能为空';
                  }
                  obj.tips({
                     text: str
                  });
                  return false;
               }
            }
         }
         return rlst;
      },
      tips: function(dt) {
         baseConfrimTipsImportOrErorr({
            type: "erorr",
            title: "验证提示",
            text: dt['text']
         }, null);
      },
      callback: function() {}
   }
   return obj;
}

function jsonCropy(a, b) {
   for (i in a) {
      for (n in b) {
         if (i == n) {
            if ((typeof(a[i]) == "object" && Object.prototype.toString.call(a[i]).toLowerCase() == "[object object]" && !a[i].length) && (typeof(b[n]) == "object" && Object.prototype.toString.call(b[n]).toLowerCase() == "[object object]" && !b[n].length)) {
               jsonCropy(a[i], b[n]);
            } else {
               b[n] = a[i];
            }
         }
      }
   }
   return b;
}

function setRequestJson() { //可填入任何数量数据，部分数据可以智能分析的，也可以通过json
   //参考-可随意填写 var aaaa=setRequestJson("00000856","8865",{"version":"1.01","userId":"8868"},{page:"1000"},{paramObj:{"id":"A0001","name":"物价"}});
   var format = basicFE.str.getNowFormatDate(),
      reqssn = basicFE.str.reqSsnCreat(),
      insJson = { //u can at uritdate.js find the prototype --> iJson
         "reqDate": format,
         "bizCode": "",
         "termType": "PCB",
         "pageSize": 10,
         "page": 0,
         "reqSsn": format + reqssn,
         "sign": format + reqssn + "1.0" + format,
         "userId": "9968",
         "version": "1.0",
         "paramObj": {}
      };
   for (var i = 0; i < arguments.length; i++) {
      var aI = arguments[i];
      if (typeof(aI) !== "object") {
         if (!isNaN(aI)) { //is number
            // if (aI.length == 8) { //bizCode
               insJson.bizCode = aI;
            // }
            if (aI.length == 4) { //userId
               insJson.userId = aI;
            }
         }
      } else if (typeof(aI) == "object" && Object.prototype.toString.call(aI).toLowerCase() == "[object object]" && !aI.length) { //is Json
         for (x in aI) {
            for (n in insJson) {
               if (x == n) {
                  insJson[n] = aI[x];
               }
            }
         }
      }
   };
   return insJson;
}

function vigorousDragOptions() { //拖拽题
   var obj = {
      result: {
         cName: 'ini',
         data: null
      },
      var: {
         model: 'template', //使用模式 default-->(template)模板模式 和 (dianti)制题模式(!!卧槽我模式写反了，就反着用吧)
         pageType: 'word', //页面模式类型 word(文字) / pic(图片)
         items: 4, //仅在(dianti 模式)下生效,初始创建空格数量
         starNum: 1, //创建编号排序起点数,默认起点1
         import: "", //导入数据
         uEditor: null, //UEditor对象
         uEBody: null, //UEditor编辑器body容器
         appendLimit: 1, //插入UE编辑器的同个uid填空框允许上限数量
         apdLimitTipsText: "同类填空项无法创建更多", //上限时提示文字
         uEiPutClass: "xt-pubUE-iput", //插入的input对象class值，其包含样式，样式存于../ueditor1_4_3/themes/iframe.css
         storeroomNum: 3, //初始存在题库元素数量
         dragTag: [false, null], //拖拽数据存储  是否开始拖拽状态、拖拽对象
         attrKeyName: 'wordDragOption', //导出数据时的attrType所用名
         fileImgbfhttp: '',
         fileImgbfName: 'imgfile', //fileUpload 元素通用id前缀
         initialPreviewStr: null, //载入时结构
      },
      elm: {
         wrap: $(".js-xt-pub-fillblank-wrap"), //填空父级
         srap: $(".js-dragAnswerSR-asw-wrap"), //填空答案
         numb: $(".js-xt-startNumber"), //起步题号显示及设置
         stmw: $(".js-dragAnswerStoreroom-wrap"), //storeroom wrap
         crtStorm: $(".js-dragAnswerSR-creatbtn"), //创建storeroom
         posDrag: "js-storeroomDragtaget-box"
      },
      ini: function() {
         obj.appendFB.ini();
         obj.inPutWid.ini();
         obj.render();
         obj.allBind();
         obj.result['cName'] = 'iniFillBlank';
         obj.callback(obj.result);
      },
      appendFB: {
         var: {},
         ini: function() {
            obj.appendFB.bindEvent.base();
         },
         creatMatrx: function(dt) {
            var apd = '';
            if (obj.var.model == 'template') {
               apd = '<a class="js-drag btn btn-xs glyphicon glyphicon-plus-sign btn-success" title="插入" href="javascript:;"></a>';
            }
            return '<div class="fill-li" uid="' + dt.uid + '">' +
               '<span class="til">' + dt.num + '</span>' +
               '<div class="tool-box">' +
               apd +
               '<a class="js-del btn btn-xs glyphicon glyphicon-trash btn-danger" title="删除" href="javascript:;"></a>' +
               '</div>' +
               '</div>';
         },
         creatAnswer: function(dt) {
            var wid = 0;
            wid = obj.inPutWid.var.beW;
            /*if(dt.answer.length>0){wid=obj.analysisStringLength(dt.answer);
            }else{wid=obj.inPutWid.var.beW;}*/
            return '<li uid="' + dt.uid + '"><span class="Answ-ecoNum">' + dt.num + '</span><input class="Answ-iput" type="text" style="width:' + wid + 'px;" title="填入正确答案" value="' + dt.answer + '"/></li>';
         },
         creatUEiput: function(dt) {
            return '<input class="' + obj.var.uEiPutClass + '" uid="' + dt.uid + '" answer="' + dt.answer + '" contenteditable="false" value="' + dt.num + '"/>';
         },
         creatStoreroom: function(dt) {
            var dom = '',
               dbt = '<a class="js-del btn btn-xs glyphicon glyphicon-trash btn-danger" title="删除" href="javascript:;" style="margin-top:3px; margin-left:4px; display:none;"></a>';
            if (obj.var.model == 'template') { //制题模式
               var iput = '';
               if (obj.var.pageType == 'word') { //制题-->文字模式
                  iput = '<input class="js-answer answer form-control" type="text" placeholder="答案内容" value="' + dt.val + '" />';
               } else if (obj.var.pageType == 'pic') { //制题-->图片模式
                  var filname = obj.var.fileImgbfName + (obj.appendFB.getNowLiNumber() + 1);
                  iput = '<input id="' + filname + '" class="file-loading" type="file" name="' + filname + '" accept="image/*"/>';
                  obj.var.initialPreviewStr = ["<img src='" + downloadSERVICE + "?id=" + dt["fne-id"] + "' class='file-preview-image'>"];
                  //obj.var.initialPreviewStr=["<img src='http://192.168.56.202:8942/nets-web/fileDown/down.do?id=26' class='file-preview-image'>"];
               }
               var idAttr = '';
               if (dt['fne-id'] != undefined && dt['fne-filename'] != undefined) {
                  idAttr = ' fne-id="' + dt['fne-id'] + '" fne-filename="' + dt['fne-filename'] + '"';
               }
               dom = '<li class="dragItem-li"' + idAttr + '>' +
                  '<div class="js-sorts sorts">' + dt.chart + '</div>' +
                  '<span class="points">.</span>' +
                  iput +
                  dbt +
                  '</li>';
            } else if (obj.var.model == 'dianti') { //模板模式
               dom = '<li class="dragItem-li">' +
                  '<div class="js-sorts sorts">' + dt.chart + '</div>' +
                  '<span class="points">.</span>' +
                  '<input class="js-answer answer form-control" type="text" placeholder="答案内容" disabled="disabled"/>' +
                  dbt +
                  '</li>';
            }
            return dom;
         },
         creatDragTarget: function() {
            return '<div class="storeroomDragtaget-t dragDashedRun ' + obj.elm.posDrag + '">' +
               '<div class="storeroomDragtaget-r dragDashedRun">' +
               '<div class="storeroomDragtaget-b dragDashedRun">' +
               '<div class="storeroomDragtaget-l dragDashedRun"></div>' +
               '</div>' +
               '</div>' +
               '</div>';
         },
         addDragItemOptions: function(dt) { //增加填空项 word or pic
            var pModel = obj.var.pageType, //文字or图片
               cswrap = obj.elm.stmw,
               ipuDt = {};
            if (cswrap.find("li").length < 27) {
               var i = cswrap.find("li").length - 1,
                  chart = 0; //序列
               var oi = 65 + i;
               if (oi > 90) {
                  oi = 90;
               }
               chart = String.fromCharCode(oi);
               if (i < 0) {
                  i = 0;
               }
               if (obj.var.model == 'template') { //制题模式
                  var val = ''; //值
                  if (typeof(dt) !== 'undefined') { //数据载入
                     chart = obj.appendFB.numberToEn(dt['sort']);
                     val = dt['optionContent'];
                     if (pModel == 'pic') {
                        ipuDt['fne-id'] = dt['fne-id'];
                        ipuDt['fne-filename'] = dt['fne-filename'];
                     }
                  }
                  ipuDt['chart'] = chart;
                  ipuDt['val'] = val;
                  //ipuDt['runType']=typeof(dt)!=='undefined'?'load':'creat';//包含数据需要初始fileUpload后，再执行载入
                  obj.elm.crtStorm.parent("li").before(obj.appendFB.creatStoreroom(ipuDt));
                  //渲染完成动作
                  if (pModel == 'word') { //创建模式--文字
                     cswrap.find("li").eq(cswrap.find("li").length - 2).find(".js-answer").focus();
                  } else if (pModel == 'pic') {
                     obj.appendFB.loadFileInput('creat');
                     if (typeof(dt) !== 'undefined') {
                        if (dt['fne-id'] !== undefined) {
                           obj.appendFB.loadFileInput('load', ipuDt);
                        }
                     }
                  }
               }
               if (obj.var.model == 'dianti') { //模板模式
                  ipuDt['chart'] = chart;
                  obj.elm.crtStorm.parent("li").before(obj.appendFB.creatStoreroom(ipuDt));
               }
               obj.allBind();
               obj.viewValueOptionDelbtn();
               $("body").scrollTop(9999);
            } else {
               fePositionTexTips("不得超过最大选项上限");
            }
         },
         loadFileInput: function(type, dt) { //载入fileUpload组件    type=creat(新建)/load(重载)
            var json = {
               windows: $(window.document.body),
               elm: "#" + obj.var.fileImgbfName + obj.appendFB.getNowLiNumber(),
               uploadUrl: uploadSERVICE,
               allowedFileTypes: ['image'],
               allowedFileExtensions: ['jpg', 'gif', "png"],
               previewFileIcon: "<i class='glyphicon glyphicon-picture'></i>"
            }
            if (type == 'load') {
               json['initialPreview'] = obj.var.initialPreviewStr;
               json['initialPreviewConfig'] = [{
                  caption: dt['fne-filename']
               }];
               json['type'] = 'reinitialize';
            } else if (type == 'creat') {
               json['type'] = 'init';
            }
            newMyFileInput(json, function(result) {
               obj.appendFB.fileInputCallback(result);
            });
         },
         fileInputCallback: function(result) { //fileUpload回调
            if (result.cName == "asyncUploadRet" || result.cName == "syncUploadRet") {
               var obj = result.data.data.response;
               result.data.this.closest(".dragItem-li").attr({
                  "fne-id": obj.ret.tnetAttachment.id,
                  "fne-filename": obj.ret.tnetAttachment.filename
               });
            }
         },
         getNowLiNumber: function() { //获取当前拖拽项li.length
            return obj.elm.stmw.find('li').length;
         },
         numberToEn: function(num) { //数字转换为字母
            return String.fromCharCode(64 + parseInt(num));
         },
         bindEvent: {
            base: function() {
               var wrap = obj.elm.wrap,
                  srap = obj.elm.srap,
                  numb = obj.elm.numb,
                  csbtn = obj.elm.crtStorm;
               wrap.find(".js-fill-AddBtn").off('click').on('click', function() { //创建新填空项
                  obj.creatDom();
                  obj.allBind();
                  obj.sortWiterIput();
                  obj.result['cName'] = 'AddFillBlank';
                  obj.result['data'] = wrap.find(".fill-li").length;
                  obj.callback(obj.result);
               });
               numb.off('input').on('input', function() { //输入限制
                  var val = $(this).val();
                  if (isNaN(val) || val.indexOf(" ") > -1 || val.indexOf(".") > -1 || val.length > 3) {
                     $(this).val(val.substring(0, val.length - 1));
                  }
               });
               numb.off('focus').on('focus', function() {
                  var val = $(this).val();
                  if (val.indexOf("-") > -1) {
                     $(this).val(val.substring(0, val.indexOf("-")));
                  }
               });
               numb.off('blur').on('blur', function() { //改变序列
                  var val = parseInt($(this).val());
                  if (!isNaN(val)) {
                     obj.var.starNum = parseInt(val);
                  }
                  obj.renderSort();
                  obj.sortWiterIput();
               });
               csbtn.off('click').on('click', function() {
                  obj.appendFB.addDragItemOptions();
               });
            },
            uePosBind: function() {
               obj.appendFB.bindEvent.crt();
            },
            crt: function() {
               var bd = $(obj.var.uEBody),
                  wrap = obj.elm.wrap,
                  srap = obj.elm.srap,
                  cswrap = obj.elm.stmw,
                  drg = wrap.find('.js-drag'),
                  del = wrap.find('.js-del'),
                  fli = wrap.find('.fill-li'),
                  asw = srap.find('li'),
                  ueipt = bd.find('.' + obj.var.uEiPutClass);
               if (obj.var.model == 'template') {
                  drg.off('click').on('click', function() { //插入按钮
                     var fli = $(this).closest(".fill-li"),
                        uid = fli.attr("uid"),
                        aws = '';
                     srap.find('li').each(function(i) {
                        if ($(this).attr('uid') == uid) {
                           aws = $(this).find(".Answ-iput").val();
                        }
                     });
                     var dt = {
                        'num': fli.find(".til").text(),
                        'uid': fli.attr('uid'),
                        'answer': aws
                     };
                     if (obj.var.appendLimit > obj.eachfBlankNumberUE(dt.uid)) { //上限是否满足
                        obj.var.uEditor.removeListener('contentChange', obj.appendFB.bindEvent.uePosBind);
                        obj.var.uEditor.addListener('contentChange', obj.appendFB.bindEvent.uePosBind);
                        obj.var.uEditor.execCommand('inserthtml', obj.appendFB.creatUEiput(dt)); //inserthtml
                     } else {
                        fePositionTexTips(obj.var.apdLimitTipsText);
                     }
                  });
               }
               del.off('click').on('click', function() { //删除该项
                  var iTs = $(this);
                  baseConfrimTipsImportOrErorr({
                     type: "info",
                     btnType: "half",
                     title: "删除填空",
                     text: "是否将填空项<b>（题号 " + $(this).parent().siblings(".til").text() + "）</b>删除<br/>删除后所有题目将重新排列序号？"
                  }, function() {
                     var uid = iTs.closest('.fill-li').attr("uid");
                     obj.deleteDom(uid);
                     obj.deleteTargetUE(uid);
                     obj.renderSort();
                     obj.sortWiterIput();
                     obj.result['cName'] = 'DeleteFillBlank';
                     obj.result['data'] = wrap.find(".fill-li").length;
                     obj.callback(obj.result);
                  });
               });
               //变色联动
               fli.off('mouseenter mouseleave').on({
                  mouseenter: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                  },
                  mouseleave: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                  }
               });
               asw.off('mouseenter mouseleave').on({
                  mouseenter: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                     if (obj.var.dragTag[0]) {
                        $(this).find(".Answ-iput").css({
                           'border-color': '#888'
                        });
                     }
                  },
                  mouseleave: function() {
                     obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                     if (obj.var.dragTag[0]) {
                        $(this).find(".Answ-iput").css({
                           'border-color': '#ccc'
                        });
                     }
                  }
               });
               if (ueipt.length > 0 && obj.var.model == 'template') {
                  ueipt.off('mouseenter mouseleave focus');
                  ueipt.on({
                     mouseenter: function(e) {
                        obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'set');
                        var html = $(this).parents("html"),
                           uW = html.width(),
                           uH = html.height(),
                           sW = $(this).width(),
                           sH = $(this).height(),
                           sT = $(this).offset().top,
                           sL = $(this).offset().left;
                        bd.append('<div class="xt-pos-messge" style="opacity:0;">' + $(this).attr('answer') + '</div>');
                        setTimeout(function() {
                           var msg = bd.find(".xt-pos-messge"),
                              zw = basicFE.elm.getObjSize(bd.find(".xt-pos-messge"), 5) + bd.find(".xt-pos-messge").width(),
                              zh = basicFE.elm.getObjSize(bd.find(".xt-pos-messge"), 6) + bd.find(".xt-pos-messge").height(),
                              l, t;
                           if (sL - zw - 2 > 0) {
                              l = sL - zw - 2;
                           } else {
                              l = sL + sW + 2;
                           }
                           if (sT - zh - 2 > 0) {
                              t = sT - zh - 2;
                           } else {
                              t = sT + sH + 2;
                           }
                           msg.css({
                              'top': t + 'px',
                              'left': l + 'px',
                              'opacity': 1
                           });
                        }, 200);
                     },
                     mouseleave: function() {
                        obj.linkageChangeColor(obj.linkageColorView($(this).attr('uid')), 'clear');
                        bd.find(".xt-pos-messge").remove();
                     },
                     focus: function() {
                        $(this).blur();
                     }
                  });
               }
               //拖拽
               cswrap.find(".js-sorts").off('mousedown').on('mousedown', function(e) {
                  if ($('.' + obj.elm.posDrag).length > 0) {
                     $('.' + obj.elm.posDrag).remove();
                  }
                  $("body").append(obj.appendFB.creatDragTarget());
                  var dElm = $('.' + obj.elm.posDrag),
                     w = basicFE.elm.getObjSize($(this), 5) + $(this).width(),
                     h = basicFE.elm.getObjSize($(this), 6) + $(this).height(),
                     osL = $(this).offset().left,
                     osT = $(this).offset().top - 1,
                     Dvelue = [e.pageX - osL, e.pageY - osT]; //x,y
                  dElm.css({
                     'width': w,
                     'left': osL,
                     'top': osT
                  });
                  dElm.children().css({
                     'top': h * .5 + 'px',
                     'right': (-1 * (h * .5)) + 'px',
                     'width': h
                  });
                  dElm.children().children().css({
                     'top': w * .5 + 'px',
                     'right': (-1 * (w * .5)) + 'px',
                     'width': w
                  });
                  dElm.children().children().children().css({
                     'top': h * .5 + 'px',
                     'right': (-1 * (h * .5)) + 'px',
                     'width': h
                  });
                  $(this).css({
                     'color': '#fff',
                     'background-color': '#333'
                  });
                  obj.var.dragTag = [true, $(this)];
                  $(document).on('mousemove', function(x) {
                     dElm.css({
                        'left': x.pageX - Dvelue[0],
                        'top': x.pageY - Dvelue[1]
                     });
                     return false;
                  });
               });
               cswrap.find(".js-sorts").off('mouseup').on('mouseup', function(e) {

               });
               $(document).off('mouseup').on('mouseup', function(e) {
                  $('.' + obj.elm.posDrag).remove();
                  if (obj.var.dragTag[0]) {
                     obj.var.dragTag[1].css({
                        'color': '#333',
                        'background-color': 'transparent'
                     });
                  }
                  $(document).off('mousemove');
                  obj.var.dragTag = [false, null];
               });
               asw.off('mouseup').on('mouseup', function() {
                  if (obj.var.dragTag[0]) {
                     obj.var.dragTag[1].css({
                        'color': '#333',
                        'background-color': 'transparent'
                     });
                     $(this).find(".Answ-iput").val(obj.var.dragTag[1].text()).css({
                        'border-color': '#ccc'
                     });
                  }
               });
               //列项删除
               cswrap.find(".js-del").off('click').on('click', function() {
                  if (obj.var.model == 'template') {}
                  if (obj.var.model == 'dianti') {}
                  var iTs = $(this),
                     sortZ = iTs.siblings(".js-sorts").text();
                  baseConfrimTipsImportOrErorr({
                     type: "info",
                     btnType: "half",
                     title: "删除填空",
                     text: "是否将列项<b>（编号 " + sortZ + "）</b>删除？<br/>删除后该设置答案对应项将被清空"
                  }, function() {
                     iTs.closest('.dragItem-li').remove();
                     obj.viewValueOptionDelbtn();
                     srap.find('li').each(function() { //与被删除吻合将清空该值
                        if ($(this).find(".Answ-iput").val() == sortZ) {
                           $(this).find(".Answ-iput").val('');
                        }
                     });
                  });
               });
            }
         }
      },
      eachfBlankNumberUE: function(uid) { //判断UEiput数量
         var bd = $(obj.var.uEBody),
            num = 0;
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            if (typeof($(this).attr("uid")) !== "undefined") {
               if ($(this).attr("uid") == uid) {
                  num++;
               }
            }
         });
         return num;
      },
      linkageColorView: function(uid) { //联动变色
         var oAr = [],
            bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         for (var i = 0; i < wrap.find(".fill-li").length; i++) {
            if (wrap.find(".fill-li").eq(i).attr('uid') == uid) {
               oAr[0] = wrap.find(".fill-li").eq(i).find(".til");
               oAr[1] = srap.find("li").eq(i).find(".Answ-iput");
            }
         }
         if (obj.var.model == 'template') {
            bd.find('.' + obj.var.uEiPutClass).each(function(i) {
               if ($(this).attr("uid") == uid) {
                  oAr[2] = $(this);
               }
            });
         }
         return oAr;
      },
      linkageChangeColor: function(objAr, type) { //对象变色
         var s = '';
         if (type == 'set') {
            s = '#ffffa0';
         } else if (type == 'clear') {
            s = 'transparent';
         }
         for (var i = 0; i < objAr.length; i++) {
            if (typeof(objAr[i]) !== 'undefined') {
               objAr[i].css('background-color', s);
            }
         }
      },
      //控制input长度随内容
      //为在输入时，时刻改变input尺寸，为其结果非常精确固有此复杂延伸,单个字符尺寸有待确定
      inPutWid: {
         var: {
            beW: 46, //空字符状态宽度
            ZWF: 'QxiiixQ' //占位符
         },
         ini: function() {
            obj.inPutWid.setStyle();
         },
         setStyle: function() {
            obj.elm.srap.find(".Answ-iput").css('width', obj.inPutWid.var.beW);
         },
         bindEvent: function() { //根据内容时刻变换填空项尺寸
            var srap = obj.elm.srap,
               stmw = obj.elm.stmw,
               iput = srap.find(".Answ-iput");
            iput.off('input').on('input', function() {
               var val = $(this).val(),
                  uid = $(this).closest('li').attr('uid'),
                  beW = obj.inPutWid.var.beW,
                  reg = /^[A-Za-z]+$/;
               if (!reg.test(val)) {
                  $(this).val(val.substring(0, val.length - 1));
               }
               val = $(this).val();
               if (val.length > 1) { //==2
                  $(this).val(val.substring(1));
               }
               val = $(this).val();
               if (val.charCodeAt() >= 91 && val.charCodeAt() <= 122) {
                  var touVal = val.toUpperCase(),
                     len = stmw.find('.dragItem-li').length;
                  if (touVal.charCodeAt() <= (len + 64) && len > 0) { //65即A
                     $(this).val(val.toUpperCase());
                  } else {
                     $(this).val('');
                     fePositionTexTips("输入编号不存在");
                  }
               }
               $(this).css('width', beW);
               var bd = $(obj.var.uEBody);
               bd.find('.' + obj.var.uEiPutClass).each(function() {
                  if ($(this).attr('uid') == uid) {
                     $(this).attr('answer', val);
                  }
               });
            });
         }
      },
      allBind: function() {
         obj.appendFB.bindEvent.crt();
         obj.inPutWid.bindEvent();
      },
      render: function() { //渲染填空 和 答案
         var atrb = null;
         if (obj.var.model == "template") { //制题模式
            if (typeof(obj.var.import.testName) !== 'undefined') {
               obj.var.starNum = parseInt(obj.var.import.testName);
            }
            atrb = obj.var.import.itemAttributes;
         }
         if (obj.var.model == "dianti") { //模板模式
            if (obj.var.import == "") {
               atrb = obj.diantiCreatItems();
               //obj.var.import={testName:1, itemAttributes:atrb};
               obj.var.import = atrb;
            } else { //fillItems maybe = '' is NaN
               if (obj.var.import['fillItems'] !== '') {
                  var starM = parseInt(obj.var.import.fillItems.split(',')[0]);
                  if (!isNaN(starM)) {
                     obj.var.starNum = starM;
                  }
               }
            }
         }
         if (obj.var.import !== "") { //数据已导入 开始渲染
            if (obj.var.starNum > 0) {
               obj.clearDom();
               var filb = [],
                  answer = [],
                  filc = [],
                  itcm = '';
               if (obj.var.model == "template") { //制题模式
                  for (var i = 0; i < atrb.length; i++) {
                     var icont = atrb[i]['optionContent'];
                     if (atrb[i]['attrType'] == "fillItems") {
                        if (icont.indexOf(',') > 0) {
                           filb = icont.split(',');
                        } else {
                           if (icont == "") {
                              filb = [];
                           } else if (icont.length > 0) {
                              filb = [icont];
                           }
                        }
                     }
                     if (atrb[i]['attrType'] == "answer") {
                        if (icont.indexOf(',') > 0) {
                           answer = icont.split(',');
                        } else {
                           if (icont == "") {
                              answer = [];
                           } else if (icont.length > 0) {
                              answer = [icont];
                           }
                        }
                     }
                     if (atrb[i]['attrType'] == "itemContent") {
                        itcm = atrb[i]['optionContent'];
                        obj.var.uEditor.ready(function() { //必须加载完毕，否则protorty错误
                           obj.var.uEditor.setContent(itcm);
                           setTimeout(function() {
                              obj.changeUidUEinput();
                              obj.appendFB.bindEvent.crt();
                           }, 200);
                           obj.result['cName'] = 'UEditorReadyComplete';
                           obj.callback(obj.result);
                        });
                     }
                     if (atrb[i]['attrType'] == obj.var.attrKeyName) {
                        filc.push(atrb[i]); //将所谓填空项插入该数组
                     }
                  }
                  filc = filc.sort(function(a, b) { //有序化
                     return a.sort - b.sort;
                  });
                  for (var i = 0; i < filc.length; i++) {
                     obj.appendFB.addDragItemOptions(filc[i]);
                  }
                  if (filb.length !== answer.length) { //制题模式 初始进入 未有答案情况
                     for (var n = 0; n < filb.length; n++) {
                        answer.push('');
                     }
                  }
                  if (filb.length == answer.length) {
                     for (var i = 0; i < filb.length; i++) {
                        obj.renderCreatDom({
                           fillItems: filb[i],
                           answer: answer[i]
                        });
                     }
                     obj.sortWiterIput();
                  } else {
                     throw 'fillItems number !== answer number';
                  }
               }
               if (obj.var.model == "dianti") { //模板模式
                  atrb = obj.var.import;
                  for (i in atrb) {
                     if (i == 'fillItems') {
                        if (atrb[i].indexOf(',') > 0) {
                           filb = atrb[i].split(',');
                        } else {
                           filb = atrb[i];
                        }
                     }
                     if (i == 'answer') {
                        if (typeof(atrb[i]) == 'string' && atrb[i].indexOf(',') > -1) {
                           answer = atrb[i].split(',');
                        } else { //初始创建情况 空值
                           answer = atrb[i]; //'empty'
                        }
                     }
                  }
                  obj.renderCreatDomTemp({
                     fillItems: filb,
                     answer: answer
                  });
                  obj.sortWiterIput();
               }
               obj.viewValueOptionDelbtn();
               //模板和制题中answer代表的不是一个东西,模板是选项A,B,C、制题是答案value..
            }
         }
      },
      viewValueOptionDelbtn: function() { //永久最后一个option后显示del-btn
         var opwrap = obj.elm.stmw,
            opi = opwrap.find(".dragItem-li"),
            oEq = opi.length - 1 < 0 ? 0 : opi.length - 1;
         opi.find('.js-del').css('display', 'none');
         if (oEq > 0) {
            opi.eq(oEq).find('.js-del').css('display', 'inline-block');
         }
      },
      sortWiterIput: function() { //题号修改
         var wrap = obj.elm.wrap,
            numb = obj.elm.numb,
            sNum = (wrap.find('.fill-li').length - 1 + obj.var.starNum);
         if (wrap.find('.fill-li').length == 0) {
            sNum = obj.var.starNum;
         }
         numb.val(obj.var.starNum + '-' + sNum);
      },
      diantiCreatItems: function() { //制造数据
         var num = parseInt(obj.var.items),
            arr = [],
            nub = 0;
         if (isNaN(num)) {
            throw 'obj.var.items is not number!';
         } else {
            for (var i = 0; i < num; i++) {
               nub += (i + 1);
               if (i < num - 1) {
                  nub += ',';
               }
            }
            if (obj.var.model == 'template') { //制题格式返回
               arr = [{
                  "attrType": "fillItems",
                  "sort": 0,
                  "optionContent": nub
               }, {
                  "attrType": "answer",
                  "sort": 0,
                  "optionContent": ",,,"
               }];
            } else if (obj.var.model == 'dianti') { //模板格式返回
               arr = {
                  fillItems: nub,
                  answer: 'empty'
               };
            }
         }
         return arr;
      },
      renderSort: function() { //序列赋数字值
         var bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         for (var i = 0; i < wrap.find(".fill-li").length; i++) {
            var nu = obj.var.starNum + i;
            wrap.find(".fill-li").eq(i).find(".til").text(nu);
            srap.find("li").eq(i).find(".Answ-ecoNum").text(nu);
            //和UEeditor里的input中的编号
         }
         bd.find('.' + obj.var.uEiPutClass).each(function() {
            var iTs = $(this),
               uid = iTs.attr('uid');
            for (var i = 0; i < wrap.find(".fill-li").length; i++) {
               var li = wrap.find(".fill-li").eq(i);
               if (li.attr('uid') == uid) {
                  iTs.val(li.find(".til").text()).attr('value', li.find(".til").text());
               }
            }
         });
      },
      changeUidUEinput: function() { //修正初始渲染的UE内的iput元素uid
         var bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            var iTs = $(this),
               val = iTs.val();
            wrap.find(".fill-li").each(function(i) {
               if (val == parseInt($(this).find(".til").text())) {
                  iTs.attr({
                     'uid': $(this).attr('uid'),
                     'answer': srap.find('li').eq(i).find('.Answ-iput').val()
                  });
                  return false;
               }
            });
         });
      },
      analysisStringLength: function(strings) { //分析字符长度
         var len = 0;
         $("body").append('<div class="js-analysisStringLength-div" style="position:absolute; opacity:0; width:auto; height:32px; display:inline-block;">' + strings + '</div>');
         len = $(".js-analysisStringLength-div").width() + 16; //16为border-width + padding
         $(".js-analysisStringLength-div").remove();
         if (len < obj.inPutWid.var.beW) {
            len = obj.inPutWid.var.beW;
         }
         return len;
      },
      renderCreatDom: function(dtx) { //渲染创建结构--制题模式
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            dt = {
               'num': dtx['fillItems'],
               'uid': basicFE.str.uuid(),
               'answer': dtx['answer']
            };
         wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx(dt));
         srap.append(obj.appendFB.creatAnswer(dt));
      },
      renderCreatDomTemp: function(dtx) { //渲染创建结构--模板模式
         var wrap = obj.elm.wrap,
            stmw = obj.elm.stmw;
         for (var i = 0; i < dtx['fillItems'].length; i++) { //
            wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx({
               'num': dtx['fillItems'][i],
               'uid': basicFE.str.uuid()
            }));
         }
         if (dtx['answer'] !== 'empty') {
            for (var i = 0; i < dtx['answer'].length; i++) { //创建拖拽项
               obj.appendFB.addDragItemOptions({
                  chart: dtx['answer'][i]
               });
            }
         } else {
            for (var i = 0; i < obj.var.storeroomNum; i++) { //为空则默认创建指定数量
               obj.appendFB.addDragItemOptions();
            }
         }
      },
      creatDom: function() { //创建执行
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            dt = {
               'num': wrap.find(".fill-li").length + obj.var.starNum,
               'uid': basicFE.str.uuid(),
               'answer': ''
            };
         wrap.find(".js-fill-AddBtn").before(obj.appendFB.creatMatrx(dt));
         srap.append(obj.appendFB.creatAnswer(dt));
      },
      clearDom: function() { //清空dom
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         wrap.find(".fill-li").remove();
         srap.empty();
      },
      deleteTargetUE: function(uid) { //清空指定UE对象
         var bd = $(obj.var.uEBody);
         bd.find('.' + obj.var.uEiPutClass).each(function(i) {
            if (typeof($(this).attr('uid')) !== "undefined") {
               if ($(this).attr('uid') == uid) {
                  $(this).remove();
               }
            }
         });
      },
      deleteDom: function(uid) { //删除填空项 及 对应答案
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap;
         wrap.find(".fill-li").each(function(i) {
            if ($(this).attr("uid") == uid) {
               $(this).remove();
            }
         });
         srap.find("li").each(function(i) {
            if ($(this).attr("uid") == uid) {
               $(this).remove();
            }
         });
      },
      getPushAttributes: function() { //抓取数据将此返出
         var wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            numb = obj.elm.numb,
            stmw = obj.elm.stmw,
            o = {},
            arr = [],
            str = '';
         wrap.find(".fill-li").each(function(i) {
            str += $(this).find('.til').text();
            if (i < wrap.find(".fill-li").length - 1) {
               str += ',';
            }
         });
         arr.push({
            attrType: 'fillItems',
            sort: 0,
            optionContent: str
         });
         if (obj.var.model == 'template') { //制题模式
            str = '';
            srap.find("li").each(function(i) {
               str += $(this).find('.Answ-iput').val();
               if (i < srap.find("li").length - 1) {
                  str += ',';
               }
            });
            arr.push({
               attrType: 'answer',
               sort: 0,
               optionContent: str
            });
            stmw.find(".dragItem-li").each(function(i) {
               var iSort = $(this).find('.js-sorts').text().charCodeAt() - 64,
                  oJs = {
                     attrType: obj.var.attrKeyName,
                     sort: iSort
                  };
               if (obj.var.pageType == 'word') {
                  oJs['optionContent'] = $(this).find(".js-answer").val();
               } else if (obj.var.pageType == 'pic') {
                  oJs['fne-id'] = $(this).attr('fne-id');
                  oJs['fne-filename'] = $(this).attr('fne-filename');
                  oJs['optionContent'] = oJs['fne-filename'];
               }
               arr.push(oJs);
            });
            arr.push({
               attrType: 'itemContent',
               sort: 0,
               optionContent: obj.var.uEditor.getContent()
            });
         }
         if (obj.var.model == 'dianti') { //模板模式
            arr = {
               fillItems: str
            };
            str = '';
            stmw.find(".dragItem-li").each(function(i) {
               str += $(this).find('.js-sorts').text();
               if (i < stmw.find(".dragItem-li").length - 1) {
                  str += ',';
               }
            });
            arr['answer'] = str;
         }
         return arr;
      },
      regExperssion: function() { //验证
         var rlst = true,
            bd = $(obj.var.uEBody),
            wrap = obj.elm.wrap,
            srap = obj.elm.srap,
            numb = obj.elm.numb,
            stmw = obj.elm.stmw,
            fli = wrap.find('.fill-li'),
            asw = srap.find('li'),
            ueipt = bd.find('.' + obj.var.uEiPutClass),
            draLi = stmw.find(".dragItem-li");
         //public exp
         if (obj.var.model == 'template') { //制题模式
            if (fli.length > 0) {
               if (fli.length !== ueipt.length) { //填空项是否全部插入文章
                  obj.tips({
                     text: '请将填空项全部插入文章中'
                  });
                  return false;
               }
               //验证标准答案是否填写完整
               var eR = [null, 0];
               asw.each(function(i) { //可返回多个未填 或 单个情况下的某个
                  if ($(this).find(".Answ-iput").val() == '') {
                     eR[1]++;
                     if (eR[1] == 1) {
                        eR[0] = $(this).find(".Answ-ecoNum").text();
                     }
                     rlst = false;
                  }
               });
               if (eR[1] > 0) { //校验上each
                  var str = '';
                  if (eR[1] > 1) {
                     str = '多个标准答案值不能为空';
                  } else if (eR[1] == 1) {
                     str = '标准答案<b>(' + eR[0] + ')</b>不能为空';
                  }
                  obj.tips({
                     text: str
                  });
                  return false;
               }
            }
            var eER = [],
               str = '';
            if (obj.var.pageType == 'word') {
               draLi.each(function() {
                  if ($(this).find(".js-answer").val() == '') {
                     eER.push($(this).find(".js-sorts").text());
                  }
               });
               if (eER.length > 0) {
                  if (eER.length == 1) {
                     str = '拖拽项<b>(' + eER[0] + ')</b>未输入文字';
                  } else if (eER.length > 1) {
                     str = '多个拖拽项未输入文字';
                  }
                  obj.tips({
                     text: str
                  });
                  return false;
               }
            } else if (obj.var.pageType == 'pic') {
               draLi.each(function() {
                  if (typeof($(this).attr('fne-id')) == 'undefined' && typeof($(this).attr('fne-filename')) == 'undefined') {
                     eER.push($(this).find(".js-sorts").text());
                  }
               });
               if (eER.length > 0) {
                  if (eER.length == 1) {
                     str = '拖拽项<b>(' + eER[0] + ')</b>未上传图片';
                  } else if (eER.length > 1) {
                     str = '多个拖拽项未上传图片';
                  }
                  obj.tips({
                     text: str
                  });
                  return false;
               }
            }
         }
         return rlst;
      },
      tips: function(dt) {
         baseConfrimTipsImportOrErorr({
            type: "erorr",
            title: "验证提示",
            text: dt['text']
         }, null);
      },
      callback: function() {}
   }
   return obj;
}

function compositeScoreCatch() { //复合题验证抓取系列
   var obj = {
      var: {

      },
      elm: {
         wrap: $(".js-composite-list-wrap"),
         iput: $(".js-composite_scoreIput")
      },
      ini: function() {
         obj.bindEvent();
      },
      bindEvent: function() {
         var ipt = obj.elm.iput;
         ipt.off('mouseenter').on('mouseenter', function() {
            var lfe = $(this).offset().left + basicFE.elm.getObjSize($(this), 5) + $(this).width(),
               tph = $(this).offset().top,
               o = {
                  text: $(this).attr('score-infor')
               };
            $("body").append(obj.creatInforNer(o));
            var sw = $(".composite-scoreInfo-wrap");
            sw.css({
               'left': lfe - sw.width() - basicFE.elm.getObjSize(sw, 5),
               'top': tph - sw.height() - basicFE.elm.getObjSize(sw, 6) - 8,
            });
         });
         ipt.off('mouseleave').on('mouseleave', function() {
            $(".composite-scoreInfo-wrap").remove();
         });
      },
      creatInforNer: function(dt) {
         return '<div class="composite-scoreInfo-wrap">' +
            obj.layoutCss() +
            '<i class="glyphicon glyphicon-info-sign"></i>' +
            dt['text'] +
            '</div>';
      },
      layoutCss: function() {
         return '<style>' +
            '.composite-scoreInfo-wrap{ position:absolute; left:0; padding:8px 11px; color:#fff; font-size:12px; background:rgba(0,0,0,0.7); border-radius:8px;}' +
            '.composite-scoreInfo-wrap i{ margin-right:10px;}' +
            '</style>';
      },
      catchSet: function() { //设置计算后分数
         var score = 0;
         obj.elm.wrap.find("li").each(function() {
            var num = parseInt($(this).find(".tSourse em").text());
            if ($(this).find(".tSourse em").text().indexOf('.') > -1) {
               num = parseFloat($(this).find(".tSourse em").text());
            }
            score += num;
         });
         obj.elm.iput.text(score);
      }
   }
   obj.ini();
   return obj;
}

function compositeCtrlFramesHeight() { //复合题子题高度获取控制父级元素 （在子页运行）
   var obj = {
      elm: {
         windowParent: $(window.parent.document), //父级对象
         wrap: ".js-composite-all-wrap", //复合题框体
         ifm: "#iframeComposite", //复合子题iframe
      },
      ini: function() { //初始化执行
         obj.getElement();
         obj.bindEvent();
      },
      getElement: function() { //对象获取
         obj.elm.wrap = obj.elm.windowParent.find(obj.elm.wrap);
         obj.elm.ifm = obj.elm.windowParent.find(obj.elm.ifm);
      },
      bindEvent: function() { //事件绑定
         var ifm = obj.elm.ifm;
         ifm.on('load', obj.setLayout);
      },
      setLayout: function() { //样式执行
         var wrap = obj.elm.wrap,
            ifm = obj.elm.ifm,
            h = $('html').height() + 12;
         wrap.css('height', h + parseInt(wrap.css("padding-top")) + parseInt(wrap.css("padding-bottom")));
         ifm.off('load', obj.setLayout).css('height', h);
      }
   };
   return obj;
}

function compositeController() { //复合题题型、制题组件方法
   var obj = {
      result: {
         cName: 'ini',
         data: {},
         obj: null
      },
      model: 'template', //template(模板题型)、dianti(制题)
      importData: null, //导入数据
      taskTypeJson: null, //题型
      var: {
         starNum: 1, //默认起始题号
         ImptComponent: null, //creatAddsNewOptions new弹框对象
         randerOption: [1], //creatAddsNewOptions 组题
         bizCode: "00001195", //请求bizCode
         awVerticalPad: 0, //总容器的竖向外边距
         liDT: {}, //列数据存储
         treeVobj: $(window.top.frames['iframeBox'].document.body).find("#treeView") //树对象
      },
      elm: {
         allwrap: $(".js-composite-all-wrap"), //总容器
         ifrWrap: $(".js-composite-iframe-wrap"), //iframe 容器
         lisWrap: $(".js-composite-list-wrap"), //列表 容器
         iframe: null, //iframe
         creatBtn: $(".js-composite-creat-btn"), //新增题型
         saveBtn: $(".js-composite-save-btn"), //保存试题
         backBtn: $(".js-composite-back-btn"), //返回子题列表
         numb: $(".js-xt-startNumber") //题号对象
      },
      ini: function() {
         obj.elm.iframe = obj.elm.ifrWrap.find("iframe");
         obj.taskTypeIfNullSet();
         obj.var.awVerticalPad = basicFE.elm.getObjSize(obj.elm.allwrap, 6);
         obj.result.obj = obj;
         obj.bindEvent.base();
         obj.elm.lisWrap.find('ul').append(obj.eachAppendLi());
         obj.sortWiterIput();
         obj.render();
         obj.bindEvent.crt();
         obj.result['cName'] = 'ini';
         obj.callback(obj.result);
      },
      render: function() {
         obj.elm.allwrap.css('height', obj.elm.lisWrap.height() + obj.var.awVerticalPad);
      },
      creatAddsNewOptions: function() {
         window.top.requestFrontEnd('POST', reqSERVICE, "appSrvRequest=" + JSON.stringify(setRequestJson(obj.var.bizCode)),
            function(jsonData) {
               obj.var.ImptComponent = new creatAddsNewOptions({
                  data: jsonData.ret,
                  title: "创建题目"
               });
               obj.var.ImptComponent.randerOption = obj.var.randerOption;
               obj.var.ImptComponent.callback = obj.componentCallback;
               obj.var.ImptComponent.ini();
            }, null);
      },
      eachAppendLi: function() { //插入多个导入数据li
         var impDat = obj.importData,
            str = '';
         if (typeof(impDat) == "object" && Object.prototype.toString.call(impDat).toLowerCase() == "[object object]" && !impDat.length) {
            var liD = obj.importData['liData']; //li数据
            obj.var.starNum = obj.importData['startNum']; //起始题号
            if (liD !== null && liD.length != undefined && typeof(liD) == 'object') { //is array
               for (var i = 0; i < liD.length; i++) {
                  str += obj.creatDomLi(liD[i], i);
               }
            }
            return str;
         }
      },
      creatDomLi: function(dt, i) {
         var nodeId = '', //节点id
            taskNum = '', //题型数字(单、多、填空...题)
            taskName = '', //题型名称
            name = '', //题号
            jump = ''; //跳转url
         if (obj.model == 'template') {
            nodeId = obj.findDaTiName(dt.templateStructlId);
            taskNum = dt.taskType;
            taskName = obj.taskType(taskNum);
            name = parseInt(dt.topicName) + i;
            jump = dt.jumpHref;
         } else if (obj.model == 'dianti') {
            nodeId = dt.testId;
            taskNum = dt.itemTypeId;
            taskName = dt.itemTypeName;
            name = parseInt(dt.testName) + i;
            jump = dt.itemTypeUrl;
         }
         if (obj.model == 'template' && typeof(dt['attributes']) == 'string') {
            dt['attributes'] = JSON.parse(dt['attributes']);
         } else if (obj.model == 'dianti') {

         }
         var dts = dt;
         if (dts.count != undefined) {
            dts.count = 1;
         }
         return '<li taskType="' + taskNum + '" jumpHref="' + jump + '" uid="' + basicFE.str.uuid() + '">' +
            '<i class="arrow glyphicon glyphicon-file"></i>' +
            '<span class="tNum">' + name + '</span>' +
            '<span class="tType">' + taskName + '</span>' +
            '<span class="tSourse">满分:<em>' + dt.score + '</em>分</span>' +
            //'<span class="tNodes">所属大题:<em>'+nodeId+'</em></span>'+
            '<div class="ctool-bx">' +
            '<a class="js-compsiteLi-up btn btn-xs btn-success" title="向上移动" href="javascript:;">' +
            '<i class="glyphicon glyphicon-arrow-up"></i>' +
            '</a>' +
            '<a class="js-compsiteLi-down btn btn-xs btn-success" title="向下移动" href="javascript:;">' +
            '<i class="glyphicon glyphicon-arrow-down"></i>' +
            '</a>' +
            '<a class="js-compsiteLi-del btn btn-xs btn-danger" title="删除" href="javascript:;">' +
            '<i class="glyphicon glyphicon-trash"></i>' +
            '</a>' +
            '</div>' +
            '<div class="data-ku">' + JSON.stringify(dts) + '</div>' + //存放新增全部字符化数据
            '</li>';
      },
      appendLi: function(dt) {
         var dom = '',
            forNum = dt.count;
         if (dt['count'] == undefined) {
            dt['count'] = 1;
            forNum = 1;
         }
         for (var i = 0; i < forNum; i++) {
            dom += obj.creatDomLi(dt, i);
         }
         obj.elm.lisWrap.find('ul').append(dom);
      },
      taskType: function(num) { //转换题型数字为名字
         for (i in obj.taskTypeJson) {
            if (i == num) {
               return obj.taskTypeJson[i];
            }
         }
      },
      taskTypeIfNullSet: function() { //题型组件内置属性
         if (obj.taskTypeJson == null) {
            obj.taskTypeJson = {
               '1': '单选题',
               '2': '多选题',
               '3': '判断题',
               '4': '填空题',
               '5': '简答题',
               '6': '作文题',
               '7': '文字拖拽题',
               '8': '图片拖拽题',
               '9': '图片单选题',
               '10': '复合题',
               '11': '听力单选题',
               '12': '听力多选题',
               '13': '听力判断题',
               '14': '听力填空题',
               '15': '听力文字拖拽题',
               '16': '听力图片拖拽题',
               '17': '听力图片单选题',
               '18': '听力复合题',
               '19': '口语题'
            };
         }
      },
      findDaTiName: function(id) { //转换大题id为文字
         var tex = '未有大题id';
         obj.var.treeVobj.find(".kendo-viewtree-two").each(function() {
            if ($(this).attr("item-id") == id) {
               tex = $(this).find("em").eq(0).text();
            }
         });
         return tex;
      },
      bindEvent: {
         base: function() {
            var numb = obj.elm.numb;
            obj.elm.creatBtn.on('click', function() { //创建弹窗
               obj.result['cName'] = 'creatAddsNewOptions';
               obj.callback(obj.result);
            });
            obj.elm.backBtn.on('click', function() { //返回子题列表
               obj.changeBox('list');
            });
            numb.on({
               'input': function() { //输入限制
                  var val = $(this).val();
                  if (isNaN(val) || val.indexOf(" ") > -1 || val.indexOf(".") > -1 || val.length > 3) {
                     $(this).val(val.substring(0, val.length - 1));
                  }
               },
               'focus': function() {
                  var val = $(this).val();
                  if (val.indexOf("-") > -1) {
                     $(this).val(val.substring(0, val.indexOf("-")));
                  }
               },
               'blur': function() { //改变序列
                  var val = parseInt($(this).val());
                  if (!isNaN(val)) {
                     obj.var.starNum = val;
                  }
                  obj.sortWiterIput();
               }
            });
            publicTestIframeSubmit(obj.elm.saveBtn, "#iframeComposite", "iframeComposite", function(windowObj, body) {
               var fn = new publicDataMatchFill(); //创建抓、设对象
               fn.var.body = body;
               var get = fn.get();
               windowObj.PublicIniframesSubmit(get, window, function(paramJson) { //子页面内容 paramJson为该页面提交时所有get数据
                  if (obj.model == 'template') { //模板模式
                     //obj.var.starNum=paramJson['topicName'];
                  }
                  if (obj.model == 'dianti') { //制题模式
                     //obj.var.starNum=paramJson['testName'];
                  }
                  if (paramJson['compositeUid'] != undefined) {
                     obj.result['cName'] = 'saveSubmit'; //编辑
                     obj.result['data'] = paramJson;
                  } else {
                     obj.result['cName'] = 'saveSubmitCreat'; //新建
                     obj.result['data'] = paramJson;
                  }
                  obj.callback(obj.result);
               });
            });
         },
         crt: function() {
            var li = obj.elm.lisWrap.find('li'),
               bUp = li.find(".js-compsiteLi-up"),
               bDown = li.find(".js-compsiteLi-down"),
               bDel = li.find(".js-compsiteLi-del");
            li.off('click').on('click', function() {
               li.removeClass('act');
               $(this).addClass('act');
               obj.result['cName'] = 'choieseLi';
               obj.result['data'] = {
                  jumpHref: $(this).attr('jumphref'),
                  taskType: $(this).attr('taskType'),
                  uid: $(this).attr('uid')
               }
               obj.callback(obj.result);
            });
            bUp.off('click').on('click', function() {
               var eq = obj.elm.lisWrap.find("li").index($(this).parents("li"));
               obj.replaceLiPosition(eq, 'up');
               obj.sortWiterIput();
               obj.result['cName'] = 'up';
               obj.result['data'] = JSON.parse($(this).parent().siblings('.data-ku').text());
               obj.callback(obj.result);
               return false;
            });
            bDown.off('click').on('click', function() {
               var eq = obj.elm.lisWrap.find("li").index($(this).parents("li"));
               obj.replaceLiPosition(eq, 'down');
               obj.sortWiterIput();
               obj.result['cName'] = 'down';
               obj.result['data'] = JSON.parse($(this).parent().siblings('.data-ku').text());
               obj.callback(obj.result);
               return false;
            });
            bDel.off('click').on('click', function() {
               var iTs = $(this);
               //if(obj.elm.lisWrap.find("li").length)
               baseConfrimTipsImportOrErorr({
                  type: "info",
                  btnType: "half",
                  title: "删除题型",
                  text: "是否将<b>（题型 " + iTs.parent().siblings('.tNum').text() + "）</b>删除"
               }, function() {
                  iTs.closest("li").remove();
                  obj.changeBox('list');
                  obj.sortWiterIput();
                  obj.result['cName'] = 'delete';
                  obj.result['data'] = JSON.parse(iTs.parent().siblings('.data-ku').text());
                  obj.callback(obj.result);
               });
               return false;
            });
         }
      },
      changeBox: function(type) { //切换盒子并抛出其高度  iframe、list
         var set = ['none', 'block'],
            tag = obj.elm.lisWrap;
         if (type == 'iframe') {
            set = ['block', 'none'];
            tag = obj.elm.ifrWrap;
         }
         obj.elm.ifrWrap.css('display', set[0]).find("iframe").attr('src', '');
         obj.elm.lisWrap.css('display', set[1]);
         obj.elm.saveBtn.css('display', set[0]);
         obj.elm.backBtn.css('display', set[0]);
         obj.elm.creatBtn.css('display', set[1]);
         obj.elm.allwrap.css({
            'height': tag.height() + obj.var.awVerticalPad
         });
         obj.result['cName'] = 'changeTabBox-' + type;
         obj.result['data']['height'] = tag.height();
         obj.callback(obj.result);
      },
      replaceLiData: function(uid, data) { //替换数据，用于编辑
         obj.elm.lisWrap.find('li').each(function() {
            if ($(this).attr('uid') == uid) {
               var nodeId = '', //节点id
                  taskNum = '', //题型数字(单、多、填空...题)
                  taskName = '', //题型名称
                  name = '', //题号
                  jump = ''; //跳转url
               if (obj.model == 'template') {
                  nodeId = data.topicId;
                  taskNum = data.taskType;
                  taskName = obj.taskType(taskNum);
                  name = data.topicName;
                  jump = data.jumpHref;
               } else if (obj.model == 'dianti') {
                  nodeId = data.testId;
                  taskNum = data.itemType;
                  taskName = obj.taskType(taskNum);
                  name = data.testName;
                  jump = data.jumpHref;
               }
               $(this).attr({
                  'taskType': taskNum,
                  'jumpHref': jump
               });
               $(this).find(".tNum").text(name);
               $(this).find(".tType").text(obj.taskType(taskNum));
               $(this).find(".tSourse").find("em").text(data.score);
               $(this).find(".tNodes").find("em").text(nodeId);
               $(this).find(".data-ku").text(JSON.stringify(data));
            }
         });
      },
      replaceLiPosition: function(targetEQ, direction) { //变换排序li位置  eq, up/down
         var wrap = obj.elm.lisWrap,
            rEq = parseInt(targetEQ);
         if (direction == 'up') {
            rEq--;
            if (rEq < 0) {
               rEq = wrap.find('li').length - 1;
            }
         } else if (direction == 'down') {
            rEq++;
            if (rEq > wrap.find('li').length - 1) {
               rEq = 0;
            }
         }
         var taget = wrap.find('li').eq(targetEQ), //操作对象
            tD = JSON.parse(taget.find(".data-ku").text()), //操作对象数据
            repet = wrap.find('li').eq(rEq), //被替换对象
            rD = JSON.parse(repet.find(".data-ku").text()); //操作对象数据
         obj.replaceLiData(taget.attr('uid'), rD);
         obj.replaceLiData(repet.attr('uid'), tD);
      },
      sortWiterIput: function() { //题号修改
         var wrap = obj.elm.lisWrap,
            numb = obj.elm.numb,
            li = wrap.find('li'),
            starNum = parseInt(obj.var.starNum),
            sNum = starNum;
         if (li.length > 0) {
            sNum = (li.length - 1 + starNum);
         }
         li.each(function(i) {
            var dataJson = JSON.parse($(this).find(".data-ku").text()),
               tH = starNum + i;
            $(this).find(".tNum").text(tH);
            if (obj.model == 'template') { //模板模式
               dataJson['topicName'] = tH + '';
            } else if (obj.model == 'dianti') { //制题模式
               dataJson['testName'] = tH + '';
            }
            $(this).find(".data-ku").text(JSON.stringify(dataJson));
         });
         numb.val(starNum + '-' + sNum);
      },
      jumpHref: function(url) {
         obj.elm.iframe.attr('src', url);
      },
      componentCallback: function(rst) {}, //内置组件 creatAddsNewOptions() 的回调
      callback: function(rst) {} //回调
   }
   return obj;
}

function Public_initSelectLayout(idta) { //全题型布局 initLayout
   var io = {
      itemId: $.url.param('topicId'), // topicId or itemId
      iJson: setRequestJson("00001842", {
         paramObj: {
            "itemTypeId": $.url.param("itemTypeId")
         }
      }),
      select: $(".js-select-collective"), //select容器               
      selectVal: null //当前选中值
   };
   for (i in idta) {
      for (n in io) {
         if (i == n) {
            io[n] = idta[i];
         }
      }
   }
   window.top.requestFrontEnd('POST', reqSERVICE, "appSrvRequest=" + JSON.stringify(io.iJson),
      function(rst) {
         var result = rst.ret,
            dom = '';
         if (result) {
            for (var i = 0; i < result.length; i++) {
               dom += "<option value='" + result[i].id + "'>" + result[i].name + "</option>"
            }
            io.select.html(dom);
            if (undefined == io.itemId || io.itemId == null) {
               if (result.length > 0) {
                  io.select.val(result[0].id);
               }
            } else if (null != io.selectVal) {
               io.select.val(io.selectVal);
            }
         }
      }, null);
}

function zongScoreSetTips() { //全拖拽总分显示 len 数量、dan 小题分
   var obj = {
      result: {
         cName: 'ini',
         data: {}
      },
      var: {
         len: 0, //填空项数量
         dan: 0 //单个积分
      },
      elm: {
         wrap: $(".js-xt-pub-fillblank-wrap"), //wrap
         pargram: $(".js-ZongScore-pargram"), //提示p文本
         iput: $(".js-zongScore-iput") //显示分数iput元素
      },
      ini: function() {
         obj.setVar();
         obj.whiteTex();
         obj.bindEvent();
      },
      setVar: function() {
         obj.var.len = obj.elm.wrap.find(".fill-li").length;
         obj.var.dan = obj.getDan();
      },
      getDan: function() {
         var num = obj.pointsNumber(obj.elm.iput.val());
         if (obj.elm.iput.val() == '' || isNaN(num)) {
            num = 0;
         }
         return num;
      },
      bindEvent: function() {
         obj.elm.iput.off('input').on('input', function() {
            obj.var.dan = obj.pointsNumber($(this).val());
            obj.whiteTex();
         });
         obj.elm.iput.off('focus').on('focus', function() {
            if ($(this).val() == '0') {
               $(this).val('');
            }
         });
         obj.elm.iput.off('blur').on('blur', function() {
            var iput = obj.elm.iput,
               val = $(this).val();
            if (val == '') {
               $(this).val('0');
            }
            obj.var.dan = val;
            obj.whiteTex();
            obj.result.cName = 'blurExpNow';
            obj.result.data['val'] = obj.var.len * obj.var.dan;
            obj.callback(obj.result);
         });
      },
      Exp: function() { //验证

      },
      pointsNumber: function(string) { //小数抛射
         var str = string + '',
            rc = rc = parseInt(str);
         if (str.indexOf('.') > -1) {
            rc = parseFloat(str);
         }
         return rc;
      },
      whiteTex: function() { //执行写入
         obj.elm.pargram.text(obj.var.len * obj.var.dan);
      },
      callback: function(x) {}
   };
   return obj;
}

function creatOptionsElemTouch() { //
   var obj = {
      result: { //返参
         cName: 'ini',
         data: null
      },
      model: 'default', //执行模式 默认default or 图片组件pic
      elm: {
         windx: window,
         $body: null, //jquery body
         addBTN: $(".js-addItem-btn"), //添加按钮
         upBTN: null, //向上钮
         downBTN: null, //向下钮
         delBTN: null, //删除钮
         optionWrap: null, //options 容器
         answWrap: null //标准答案容器
      },
      import: { //导入数据
         defaultD: null, //覆盖数据模型
         //存储按钮class名称
         savUp: 'js-itemCtrl-up',
         savDown: 'js-itemCtrl-down',
         savDel: 'js-itemCtrl-del',
         savOW: 'js-options',
         savAnsw: 'js-answerSet'
      },
      var: {
         defaultD: { //内置数据模型
            optionNumber: 4, //选项数量
            optionModel: 0, //选项模式 (0:ABCD、1:1234、2:第一二三项、3:无选项)
            isCheckBox: 0, //0:单选, 1:多选
            optionAnser: [],
            optionContent: []
         }
      },
      ini: function() { //初始化
         obj.dataCopy();
         obj.getElement.base();
         obj.creatOptions();
         obj.getElement.crt();
         obj.bindEvent.base();
         obj.bindEvent.crt();
      },
      getElement: { //对象获取
         base: function() {
            var imp = obj.import;
            obj.elm.$body = $(obj.elm.windx.document.body);
            obj.elm.optionWrap = obj.elm.$body.find('.' + imp.savOW);
            if (obj.model == 'pic') {
               obj.elm.optionWrap[0].temp = 0;
            }
            obj.elm.optionWrap[0].index = 0;
            obj.elm.optionWrap[0].modelInde = null;
            obj.elm.optionWrap[0].isCheckBox = 'radio';
            obj.elm.answWrap = obj.elm.$body.find('.' + imp.savAnsw);
         },
         crt: function() {
            var imp = obj.import;
            obj.elm.$body = $(obj.elm.windx.document.body);
            obj.elm.upBTN = obj.elm.$body.find('.' + imp.savUp);
            obj.elm.downBTN = obj.elm.$body.find('.' + imp.savDown);
            obj.elm.delBTN = obj.elm.$body.find('.' + imp.savDel);
         }
      },
      dataCopy: function() { //数据浅拷贝
         var dA = obj.import.defaultD,
            dB = obj.var.defaultD;
         if (dA != null) {
            for (i in dA) {
               for (n in dB) {
                  if (i == n) {
                     dB[n] = dA[i];
                  }
               }
            }
         }
      },
      creatApend: function(i, val) { //添加选项按钮事件
         obj.optionIndexType(i);
         var rdoms = '';
         if (obj.model == 'default') { //普通模式
            rdoms = obj.newOptionView(val);
         } else if (obj.model == 'pic') { //图片模式
            var picClas = 'js-imageIput-' + obj.elm.optionWrap[0].temp;
            rdoms = obj.newOptionViewPic(picClas);
         }
         obj.elm.optionWrap.append(rdoms);
         obj.elm.optionWrap[0].index++;
         if (obj.model == 'pic') { //图片模式
            obj.createFileInput(picClas, val);
         }
      },
      creatOptions: function() { //解析数据
         var defa = obj.var.defaultD;
         for (var i = 0; i < defa.optionNumber; i++) { //选项数量
            var inputContent = '';
            for (var n = 0; n < defa.optionContent.length; n++) { //按照自然排序找出对应选项的内容
               var attr = defa.optionContent[n];
               if (parseInt(attr.sort) == i + 1) {
                  if (obj.model == 'pic') {
                     inputContent = attr;
                  } else {
                     inputContent = attr.optionContent;
                  }
                  if (inputContent == undefined || inputContent == null) {
                     inputContent = '';
                  };
                  break;
               }
            }
            obj.creatApend(i, inputContent);
            //标准答案设置
            if (defa.isCheckBox == 0) { //单选
               obj.elm.optionWrap[0].isCheckBox = "radio";
            } else { //多选
               obj.elm.optionWrap[0].isCheckBox = "checkbox";
            }
            if (obj.elm.optionWrap[0].modelInde == '') {
               obj.elm.optionWrap[0].modelInde = i + 1
            }; //作用不明
            var checked = '';
            for (var n = 0; n < defa.optionAnser.length; n++) { //对比,是否为答案
               if (defa.optionAnser[n] == obj.elm.optionWrap[0].modelInde) {
                  checked = 'checked="checked"';
                  break;
               };
            }
            obj.elm.answWrap.append(obj.newAnswerView(checked));
            if (obj.model == 'pic') {
               obj.elm.optionWrap[0].temp++;
            };
         }
      },
      newOptionView: function(val) { //创建普通options
         return '<li>' +
            '<div class="row floatLwidth marB-8">' +
            '<span class="col-sm-1 col-md-1 col-xs-1 js-optionModel" style="padding:0px; margin:0px; text-align:center; line-height:36px;">' + obj.elm.optionWrap[0].modelInde + '</span>' +
            '<div class="col-sm-8 col-md-8 col-xs-8" style="padding:0px; margin:0px;">' +
            '<input class="form-control" type="text" value="' + val + '"/>' +
            '</div>' +
            '<div class="col-sm-3 col-md-3 col-xs-3">' +
            '<a class="btn btn-xs btn-success ' + obj.import.savDown + '" href="javascript:;">' +
            '<i class="glyphicon glyphicon-arrow-down"></i>' +
            '</a>&nbsp;' +
            '<a class="btn btn-xs btn-success ' + obj.import.savUp + '" href="javascript:;">' +
            '<i class="glyphicon glyphicon-arrow-up"></i>' +
            '</a>&nbsp; ' +
            '<a class="btn btn-xs btn-danger ' + obj.import.savDel + '" href="javascript:;">' +
            '<i class="glyphicon glyphicon-trash"></i>' +
            '</a>&nbsp;' +
            '</div>' +
            '</div>' +
            '</li>';
      },
      newOptionViewPic: function(fileClass) { //创建图片options
         return '<li class="js-item-option">' +
            '<div class="row floatLwidth marB-8">' +
            '<span class="col-sm-1 col-md-1 col-xs-1 js-optionModel" style="padding:0px; margin:0px; text-align:center; line-height:36px;">' + obj.elm.optionWrap[0].modelInde + '</span>' +
            '<div class="col-sm-8 col-md-8 col-xs-8" style="padding:0px; margin:0px;">' +
            '<input type="file" class="file-loading js-file-modelIput ' + fileClass + '" name="audiofile2" accept="image/*" />' +
            '</div>' +
            '<div class="col-sm-3 col-md-3 col-xs-3">' +
            '<a class="btn btn-xs btn-danger js-itemCtrl-del" href="javascript: void(0);"><i class="glyphicon glyphicon-trash"></i></a>' +
            '</div>' +
            '</div>' +
            '</li>';
      },
      newAnswerView: function(checked) {
         return '<label class="radio-inline">' +
            '<input id="inlineRadio4" type="' + obj.elm.optionWrap[0].isCheckBox + '" name="inlineRadioOptions" ' + checked + '/>' +
            '<span class="line-24 js-answers">' + obj.elm.optionWrap[0].modelInde + '</span>' +
            '</label>';
      },
      createFileInput: function(className, data) { //pic模式 组件创造
         var elem = $('.' + className);
         if (data != undefined && data != null && data["fne-id"] != undefined && data["fne-id"] != null && data["fne-id"] != '' && data["fne-id"] != '') {
            var OJS = {
               windows: $(window.document.body),
               elm: "." + className,
               uploadUrl: uploadSERVICE,
               allowedFileTypes: ['image'],
               allowedFileExtensions: ['png', 'jpeg', 'gif'],
               initialPreview: ["<img src='" + downloadSERVICE + "?id=" + data["fne-id"] + "' class='file-preview-image'>"],
               initialPreviewConfig: [{
                  caption: data["fne-filename"]
               }],
               previewFileIcon: "<i class='glyphicon glyphicon-image'></i>",
               type: "reinitialize"
            };
            elem.parents("li").attr({
               "fne-id": data["fne-id"],
               "fne-filename": data["fne-filename"]
            });
         } else {
            var OJS = {
               windows: $(window.document.body),
               elm: "." + className,
               uploadUrl: uploadSERVICE,
               allowedFileTypes: ['image'],
               allowedFileExtensions: ['png', 'jpeg', 'gif'],
               previewFileIcon: "<i class='glyphicon glyphicon-image'></i>",
               type: "init"
            };
         }
         newMyFileInput(OJS, function(result) {
            if (result.cName == "asyncUploadRet" || result.cName == "syncUploadRet") {
               var _obj = result.data.data.response;
               result.data.this.parents(".js-item-option").attr({
                  "fne-id": _obj.ret.resMap.id,
                  "fne-filename": _obj.ret.resMap.original
               });
            } else if (result.cName == "fileselect") {
               obj.callback({
                  cName: 'fileiputLoadSuccse'
               });
            }
         });
         if (data != undefined && data != null && data["fne-id"] != undefined && data["fne-id"] != null && data["fne-id"] != '' && data["fne-id"] != '') {
            elem.find(".file-caption-name").attr("title", data["fne-filename"]).text(data["fne-filename"]);
         }
      },
      optionIndexType: function(i) { //返回对应类型序列, ABCD、1234、第一项第二项第三项...
         var mod = obj.var.defaultD.optionModel,
            rst;
         if (mod == 0) {
            rst = String.fromCharCode(65 + i);
         } else if (mod == 1) {
            rst = i + 1;
         } else if (mod == 2) {
            rst = obj.convertToChinene(i + 1, 0);
         } else {
            rst = obj.convertToChinene(i + 1, 1);
         }
         obj.elm.optionWrap[0].modelInde = rst;
         return rst;
      },
      bindEvent: { //事件绑定
         base: function() {
            obj.elm.addBTN.off("click").on("click", function() { //添加选项按钮事件     
               if (obj.elm.optionWrap[0].index > 25) {
                  fePositionTexTips("不得超过最大选项上限");
                  return false;
               }
               obj.creatApend(obj.elm.optionWrap[0].index, '');
               //标准答案设置
               if (obj.elm.optionWrap[0].modelInde == '') {
                  obj.elm.optionWrap[0].modelInde = i + 1;
               };
               obj.elm.answWrap.append(obj.newAnswerView(''));
               obj.elm.optionWrap[0].temp++;
               obj.bindEvent.crt();
               obj.result.cName = 'addItems';
               obj.callback(obj.result);
            });
         },
         crt: function() {
            obj.getElement.crt();
            if (obj.model == 'default') {
               obj.elm.upBTN.off("click").on("click", function() {
                  obj.changeVal($(this), 'up');
                  obj.result.cName = 'moveUp';
                  obj.callback(obj.result);
               });
               obj.elm.downBTN.off("click").on("click", function() {
                  obj.changeVal($(this), 'down');
                  obj.result.cName = 'moveDown';
                  obj.callback(obj.result);
               });
            }
            obj.elm.delBTN.off("click").on("click", function() {
               var opwrap = obj.elm.optionWrap,
                  son = opwrap.children(),
                  i = opwrap.find($(this).parents("li")).index();
               son.eq(i).remove();
               obj.elm.answWrap.children().eq(i).remove();
               obj.elm.optionWrap[0].index--;
               obj.sort();
               obj.result.cName = 'del';
               obj.callback(obj.result);
            });
         }
      },
      changeVal: function(iThis, type) { //值移动
         var opwrap = obj.elm.optionWrap,
            i = opwrap.find(iThis.parents("li")).index(),
            son = opwrap.children(),
            igt = 0;
         if (type == 'up') {
            igt = i - 1 < 0 ? son.length - 1 : i - 1;
         } else if (type == 'down') {
            igt = i + 1 > son.length - 1 ? 0 : i + 1;
         }
         var mv = son.eq(i).find('input').val(),
            uv = son.eq(igt).find('input').val();
         son.eq(i).find('input').val(uv);
         son.eq(igt).find('input').val(mv);
      },
      sort: function() { //重新排列 ABCD、1234...
         var opwrap = obj.elm.optionWrap,
            opSon = opwrap.find(".js-optionModel");
         answSon = obj.elm.answWrap.find(".js-answers");
         for (var i = 0; i <= opwrap[0].index; i++) {
            obj.optionIndexType(i);
            opSon.eq(i).html(obj.elm.optionWrap[0].modelInde);
            answSon.eq(i).text(obj.elm.optionWrap[0].modelInde);
         }
      },
      convertToChinene: function(num, type) {
         var chinArr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
            str = num.toString(),
            C_Num = [];
         for (var i = 0; i < str.length; i++) {
            C_Num.push(chinArr[str.charAt(i)]);
         }
         if (type == 0) {
            return '第' + C_Num.join('') + '项';
         } else {
            return '选项' + C_Num.join('');
         }
      },
      callback: function(result) {}
   };
   return obj;
}

// 听力题数据查询结果数据处理
function listenDataHandle(data, fn) {
   $.each(data, function(index, itemAttr) {
      switch (itemAttr.attrType) {
         case "beginSound":
            initFIleInput($(".js-file-modelIput-start"), "js-file-modelIput-start", itemAttr);
            break;
         case "audio":
            initFIleInput($(".js-questionInputFile"), "js-questionInputFile", itemAttr);
            break;
         case "endSound":
            initFIleInput($(".js-file-modelIput-end"), "js-file-modelIput-end", itemAttr);
            break;
         case "pauseTime":
            $(".js-pauserTime").val(parseInt(itemAttr.optionContent));
            break;
         case "playTime":
            $("#playtime input:radio").eq(itemAttr.optionContent - 1).attr("checked", true);
            var stopTime = $(".js-StopTime1").find("input");
            if (parseInt(itemAttr.optionContent) == 1) {
               $(".js-StopTime").hide();
               stopTime.val(0);
            } else {
               $(".js-StopTime").show();
               stopTime.addClass("js-evtFromRegExp-iput");
            }
            break;
         case "intervalTime":
            if (itemAttr.optionContent == '' || itemAttr.optionContent == null) {
               $(".js-StopTime1").find("input").val(0);
            } else {
               $(".js-StopTime1").find("input").val(parseInt(itemAttr.optionContent));
            }
            break;
         case "answerTime":
            $("#answertime").val(parseInt(itemAttr.optionContent));
            break;
         default:
            if (typeof(fn) == "function") {
               fn(itemAttr.attrType, itemAttr);
            }
            break;
      }
   });
}


function textAreaInfoScrollReadbook() { //pc弹窗阅读器组件
   var obj = {
      result: { //返参
         cName: "ini",
         data: null
      },
      import: { //导入数据 存放外部请求的string内容
         requestSelf: true, //请求使用内部or外部 true(使用内部)、false(使用外部)
         content: null //book内容字符结构 内部或外部结果存储
      },
      ajax: { //内部模式有效 - 请求相关
         type: 'html', //dataType
         url: null, //请求文件路径
      },
      var: {
         windowX: window, //window obj
         $bd: null, //jQuery body object
         uT: null, //window scroll top
         uW: null, //window width
         uH: null, //window height
         drawTime: null, //canvas draw周期计时器
         biZ: 0.0145 / 5, //5s将完成整圆 运行频率17
         rNub: 0, //画圆累加值
      },
      elm: {
         mask: null, //蒙版
         box: null, //框体
         wrap: null, //左容器
         insWrap: null, //左滚动
         scoll: null, //右轨道
         insScoll: null, //右滑块
         appendBtn: null, //指定btn创建位置,jq 对象
         loadBtn: 'js-texAreaScrollreadbook-btn', //触发load载入 btn
         canvas: 'texAreaScrollreadbook-canvas', //run++ border canvas
         canvxt: null //context2D 环境
      },
      selfSetting: { //自定义项
         style: { //样式定义
            openBtnSize: 40, //open book按钮size 【正方形】
            marginX: 20, //box x轴外边距 px
            marginY: 20, //box y轴外边距 px
            addtionLeft: 0, //额外 左侧外边距
            addtionTop: 0, //额外 顶部外边距
            addtionRight: 0, //额外 右侧外边距
            addtionBottom: 0, //额外 底部外边距
            zIndex: 99, //层级
            padX: 25, //box x轴内边距
            padY: 25, //box y轴内边距
            scrollWidth: 6, //滚动轨道及滑块 width
            scrollcaHeight: 70, //滚动轨道 小于 左侧容器 xx高度
            btnBgIMG: '../images/component/u646b.png' //按钮背景图片
         },
         canvas: { //画布属性
            x: null, //x、y轴半径
            y: null,
            wid: null, //Size(包括按钮尺寸)
            hgt: null
         }
      },
      ini: function() { //init
         obj.getVar();
         obj.getVarOnce();
         obj.appendBtn();
         obj.getElement.btn();
         obj.bindEvent.base();
         return this;
      },
      getVar: function() { //变量赋予
         obj.var.uT = obj.var.windowX.document.body.scrollTop || obj.var.windowX.document.documentElement.scrollTop;
         obj.var.uW = obj.var.windowX.document.documentElement.clientWidth;
         obj.var.uH = obj.var.windowX.document.documentElement.clientHeight;
      },
      getVarOnce: function() { //仅运行一次的变量赋予
         var s = obj.selfSetting;
         s.canvas.wid = s.canvas.hgt = s.style.openBtnSize;
         s.canvas.x = s.canvas.y = s.style.openBtnSize / 2;
      },
      getElement: {
         book: function() { //对象赋值
            obj.var.$bd = $(obj.var.windowX.document.body);
            obj.elm.mask = obj.var.$bd.find(".texAreaInfsclReadbook-mask");
            obj.elm.box = obj.elm.mask.find(".texAinfRB-box");
            obj.elm.wrap = obj.elm.box.find(".texAinfRB-pos-wrap");
            obj.elm.insWrap = obj.elm.box.find(".texAinfRB-ins-wrap");
            obj.elm.scoll = obj.elm.box.find(".texAinfRB-pos-scroll");
            obj.elm.insScoll = obj.elm.box.find(".texAinfRB-ins-scroll");
         },
         btn: function() {
            obj.elm.loadBtn = obj.elm.appendBtn.find('.' + obj.elm.loadBtn);
            obj.elm.canvas = obj.elm.appendBtn.find('#' + obj.elm.canvas);
         }
      },
      creatMengBan: function() { //创建蒙版
         return '<div class="texAreaInfsclReadbook-mask">' + obj.creatBook() + '</div>';
      },
      creatBook: function() { //创建阅读弹框
         var cont = obj.import.content;
         if (cont == null) {
            cont = obj.insideDefault.content();
         }
         return '<div class="texAinfRB-box">' +
            '<div class="close"><i></i><i></i></div>' +
            '<div class="texAinfRB-pos-wrap">' +
            '<div class="texAinfRB-ins-wrap">' + cont + '</div>' +
            '</div>' +
            '<div class="texAinfRB-pos-scroll">' +
            '<div class="texAinfRB-ins-scroll"></div>' +
            '</div>' +
            '</div>' +
            obj.styleLabelBook();
      },
      creatBtn: function() { //创建按钮
         var apd = obj.elm.appendBtn,
            s = obj.selfSetting.style,
            size = obj.selfSetting.canvas.wid;
         if (apd.length > 0) {
            if (apd.width() > 0) {
               obj.selfSetting.canvas.wid = obj.selfSetting.canvas.hgt = size = apd.width();
            }
         }
         apd.css({
            'width': size,
            'height': size,
            'box-sizing': 'content-box'
         });
         return '<a class="' + obj.elm.loadBtn + '" readbookStaut="empty" href="javascript:;"></a>' +
            '<canvas id="' + obj.elm.canvas + '" width=' + size + ' height=' + size + ' style="border-radius:50%;"></canvas>' +
            '<style>' +
            '.' + obj.elm.loadBtn + '{ position:absolute; left:0; top:0; width:' + size + 'px; height:' + size + 'px; display:inline-block; z-index:2; background:url(' + s.btnBgIMG + ') center no-repeat; background-size:cover;}' +
            //'#'+obj.elm.canvas+'{ position:absolute; left:0; top:0; z-index:1;}'+
            '</style>';
      },
      appendBtn: function() { //创建载入按钮
         var apd = obj.elm.appendBtn;
         if (apd.length > 0) {
            apd.append(obj.creatBtn());
            obj.regditCanvas();
         } else if (apd == null) {
            throw 'please, setting obj.elm.appendBtn is jquery object!';
         }
      },
      appendBook: function() { //创建载入book
         $(obj.var.windowX.document.body).append(obj.creatMengBan());
         obj.getElement.book();
         obj.bindEvent.crt();
      },
      styleLabelBook: function() { //阅读弹窗样式
         var mask = '.texAreaInfsclReadbook-mask',
            s = obj.setStyleNumber();
         return '<style>' +
            mask + '{ position:absolute; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:' + s.mask.zIndex + ';}' +
            mask + ' .texAinfRB-box{ position:absolute; left:' + s.box.left + 'px; top:' + s.box.top + 'px; padding-top:' + s.box.padTop + 'px; padding-bottom:' + s.box.padBot + 'px; padding-left:' + s.box.padLeft + 'px; padding-right:' + s.box.padRight + 'px; width:' + s.box.width + 'px; height:' + s.box.height + 'px; border-radius:6px; background:rgba(0,0,0,0.7); box-sizing:border-box;}' +
            mask + ' .texAinfRB-box .close{ position:absolute; right:' + s.track.right + 'px; top:' + (s.box.padTop - 18) + 'px; width:18px; height:18px; }' +
            mask + ' .texAinfRB-box .close i{position:absolute; top:5px; left:0; width:18px; height:2px; background:rgba(255,255,255,0.3)}' +
            mask + ' .texAinfRB-box .close i:nth-child(1){ transform:rotate(45deg);}' +
            mask + ' .texAinfRB-box .close i:nth-child(2){ transform:rotate(135deg);}' +
            mask + ' .texAinfRB-pos-wrap{ float:left; position:relative; width:100%; height:' + s.wrap.height + 'px; overflow:hidden;}' +
            mask + ' .texAinfRB-ins-wrap{ position:absolute; left:0; top:0;}' +
            mask + ' .texAinfRB-ins-wrap p,' + mask + ' .texAinfRB-ins-wrap img{ margin:0; padding:0; }' +
            mask + ' .texAinfRB-ins-wrap p{ color:#aaa;}' +
            mask + ' .texAinfRB-ins-wrap img{ max-width:100%;}' +
            mask + ' .texAinfRB-pos-scroll{ position:absolute; right:' + s.track.right + 'px; top:' + s.track.top + 'px; width:' + s.track.width + 'px; height:' + s.track.height + 'px; }' +
            mask + ' .texAinfRB-ins-scroll{ position:absolute; left:0; width:' + s.track.width + 'px; height:60px; border-radius:8px; background:#2ab0fd; cursor:pointer;}' +
            '</style>';
      },
      setStyleNumber: function() { //返回设置项
         var s = obj.selfSetting.style,
            bxW = obj.var.uW - parseInt(s.marginX) * 2 - parseInt(s.addtionLeft) - parseInt(s.addtionRight),
            bxH = obj.var.uH - parseInt(s.marginY) * 2 - parseInt(s.addtionTop) - parseInt(s.addtionBottom),
            sbH = bxH - parseInt(s.padY) * 2;
         return {
            mask: {
               zIndex: s.zIndex
            },
            box: {
               left: parseInt(s.marginX) + parseInt(s.addtionLeft),
               top: parseInt(s.marginY) + parseInt(s.addtionTop),
               padTop: parseInt(s.padX),
               padBot: parseInt(s.padX),
               padLeft: parseInt(s.padY),
               padRight: parseInt(s.padY) + parseInt(s.scrollWidth),
               width: bxW,
               height: bxH
            },
            wrap: {
               height: sbH
            },
            track: {
               right: parseInt(s.padX) * .5,
               top: parseInt(s.scrollcaHeight) * .5 + parseInt(s.padY),
               width: parseInt(s.scrollWidth),
               height: sbH - parseInt(s.scrollcaHeight)
            }
         }
      },
      reloadSetStyle: function() { //对象化 样式赋值
         var s = obj.setStyleNumber();
         obj.elm.box.css({
            'left': s.box.left + 'px',
            'top': s.box.top + 'px',
            'padding-top': s.box.padTop + 'px',
            'padding-bottom': s.box.padBot + 'px',
            'padding-left': s.box.padLeft + 'px',
            'padding-right': s.box.padRight + 'px',
            'width': s.box.width + 'px',
            'height': s.box.height + 'px'
         });
         obj.elm.wrap.css({
            'height': s.wrap.height + 'px'
         });
         obj.elm.scoll.css({
            'right': s.track.right + 'px',
            'top': s.track.top + 'px',
            'width': s.track.width + 'px',
            'height': s.track.height + 'px'
         });
      },
      bindEvent: { //事件绑定
         base: function() { //基础对象
            obj.elm.loadBtn.off("click").on("click", function() { //触发readbook内容载入
               if ($(this).attr('readbookStaut') !== 'loadings') { //防止高频点击
                  $(this).attr('readbookStaut', 'loadings').css('opacity', 0);
                  //此处执行圆圈load动画，运行方式为伪加载随机数方式
                  //成功后应改变按钮样式，灰变亮
                  //理想状态请求过的数据能够存储于缓存中，并设置1小时过期时间
                  if (obj.strorge.get() == null) { //从未加载
                     obj.runDrawTime();
                     if (obj.import.requestSelf) { //内部请求
                        obj.request();
                     } else { //外部请求
                        obj.result.cName = "loadStart";
                        obj.result.data = null;
                        obj.callback(obj.result);
                     }
                  } else { //缓存里有
                     obj.import.content = obj.strorge.get();
                     obj.appendBook();
                  }
               }
            });
            var time = null;
            $(window).resize(function() {
               obj.getVar();
               obj.reloadSetStyle();
               clearTimeout(time);
               time = setTimeout(function() {
                  obj.elm.box.mouseScrollAGMT({ //滚动监听 重组
                     ctrlBx: "texAinfRB-pos-wrap",
                     ctrl: "texAinfRB-ins-wrap",
                     btnBx: "texAinfRB-pos-scroll",
                     btn: "texAinfRB-ins-scroll"
                  });
               }, 300);
            });
         },
         crt: function() { //创造对象
            obj.elm.box.mouseScroll({ //滚动注册
               ctrlBx: "texAinfRB-pos-wrap",
               ctrl: "texAinfRB-ins-wrap",
               btnBx: "texAinfRB-pos-scroll",
               btn: "texAinfRB-ins-scroll",
               EnvSciModel: "pc", //模式选择
            });
         }
      },
      runDrawTime: function() { //循环绘制
         clearInterval(obj.var.drawTime);
         obj.var.drawTime = setInterval(function() {
            obj.var.rNub += (obj.var.biZ * (1 - obj.var.rNub));
            obj.animateArcDraw({
               add: obj.var.rNub
            });
            if (obj.var.rNub > 0.73) {
               clearInterval(obj.var.drawTime);
            }
            if (obj.var.rNub > 1) { //整圆
               clearInterval(obj.var.drawTime);
            }
         }, 17);
      },
      drawSuccse: function() { //绘制完成
         obj.var.rNub = 1;
      },
      regditCanvas: function() { //注册canvas画布环境对象
         obj.elm.canvxt = document.getElementById(obj.elm.canvas).getContext('2d');
      },
      animateArcDraw: function(data) { //canvas计算圆周率PI动画
         var cxt = obj.elm.canvxt,
            s = obj.selfSetting.canvas;
         cxt.clearRect(0, 0, s.wid, s.hgt);
         cxt.beginPath();
         cxt.lineWidth = 2;
         cxt.lineCap = "round";
         cxt.strokeStyle = "#07b5fd";
         cxt.arc(s.x, s.y, 15, -(Math.PI / 2), (data.add) * (2 * Math.PI) - Math.PI / 2, false);
         cxt.stroke();
         cxt.closePath();
      },
      request: function() { //内部请求
         if (obj.ajax.url == null) {
            throw 'please setting ajax.url not is Null';
         }
         $.ajax({
            async: false,
            dataType: obj.ajax.type,
            url: obj.ajax.url,
            success: function(rs) {
               obj.drawSuccse();
               obj.import.content = rs;
               obj.appendBook();
               obj.strorge.set(rs);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {}
         });
      },
      strorge: { //存储
         searchPath: function() { //反馈当前 page.html 名称
            return window.location.pathname.lastIndexOf('/') + 1;
         },
         set: function(val) {
            sessionStorage.setItem(obj.strorge.searchPath(), val);
         },
         get: function() {
            return sessionStorage.getItem(obj.strorge.searchPath());
         }
      },
      insideDefault: { //内置默认值 用于展示显示
         content: function() { // - 内容
            return '<div><p style="height:1200px;">巴拉巴拉小魔仙</p></div>';
         }
      },
      callback: function(result) {}
   };
   return obj;
}

function initInsideBlockLayoutSize() { //初始化内部框体结构样式
   var soBox = $(".setoption-wrap"), //=左侧多设置项容器
      wrap = $(".other-wrap");
   settings();
   $(window).resize(function() {
      settings();
   });

   function settings() { //设置样式尺寸
      var uH = document.documentElement.clientHeight;
      // uH = '100%';
      soBox.css({
         'height': uH
      });
      wrap.css({
         'height': uH
      });
   }
}

function initoutSideBlockhouseLayoutSize(elmJson) { //初始化大框体结构样式
   var head = $(".header"), //=头部容器
      contBox = $(".container"),
      foot = $(".footer"),
      uW = document.documentElement.clientWidth;
   if (typeof(elmJson) == 'object') {
      for (var i in elmJson) {
         if (i == 'head') {
            head = elmJson[i];
         } else if (i == 'contBox') {
            contBox = elmJson[i];
         } else if (i == 'foot') {
            foot = elmJson[i];
         }
      }
   }
   settings();
   $(window).resize(function() {
      settings();
   });

   function settings() { //设置样式尺寸
      var uH = document.documentElement.clientHeight,
         dTop = head.height(),
         fBot = foot.height();
      contBox.css({
         'padding-top': dTop,
         'padding-bottom': fBot,
         'height': uH
      });
   }
}

function selectMultiContrller(settings) { //多项多选封装
   var obj = {
      options: {
         importDatas: null, //导入生成的数据
         haveSelect: [], //已被选中的mark array  支持仅填入id
         elm: {
            selectWrap: $(".js-selectMulti-select"), //select元素  当页面存在多个异同建议使用id
            markClass: "js-selectMulti-markwrap",
            markWrap: null, //选中后的mark标签
         },
         defaultText: '请选择 （可多选）', //默认选项文本
         defaultId: '-1', //默认选项id
         indexKeyName: { //后台key字段 可自定义
            id: 'id',
            name: 'name'
         },
         callback: function() {} //回调外抛函数
      },
      init: function() { //初始化
         obj.extendSettings().baseRunnings().forOptions().forMarks().baseBindEvent();
         return this;
      },
      extendSettings: function() { //数据重载
         obj.options = $.extend(true, obj.options, settings, true);
         return this;
      },
      baseRunnings: function() { //基础运行准备
         var mtx = obj.options;
         //	<<== 一级报警
         // if (mtx.elm.selectWrap.length == 0) {
         // throw 'can not find select element ! program stop !';
         if (mtx.elm.selectWrap.length > 0) {
            //  <<== 根据selectWrap定位mark容器对象
            if (mtx.elm.markWrap == null && mtx.elm.selectWrap.length > 0) {
               mtx.elm.markWrap = mtx.elm.selectWrap.siblings("." + mtx.elm.markClass);
            };
         }
         return this;
      },
      forOptions: function() { //循环数据造option
         var opt = obj.options,
            impdata = obj.options.importDatas;
         if (impdata !== null) {
            var doms = '<option value="' + opt.defaultId + '">' + opt.defaultText + '</option>';
            for (var i = 0; i < impdata.length; i++) {
               doms += obj.creatOptions(impdata[i]);
            }
            obj.options.elm.selectWrap.html(doms);
         };
         return this;
      },
      forMarks: function() { //循环数据造mark
         var havdata = obj.options.haveSelect;
         if (havdata.length > 0) {
            var doms = '<ul>';
            for (var i = 0; i < havdata.length; i++) {
               var getObj = obj.findData(havdata[i]);
               doms += obj.creatMark(getObj);
               obj.changeBgColor(havdata[i]);
            };
            doms += '</ul>';
            obj.options.elm.markWrap.html(doms);
            obj.creatBindEvent();
         };
         return this;
      },
      creatOptions: function(json) { //生成option项
         var key = obj.options.indexKeyName;
         return '<option value="' + json[key.id] + '">' + json[key.name] + '</option>';
      },
      creatMark: function(json) { //生成mark
         var key = obj.options.indexKeyName;
         return '<li vid="' + json[key.id] + '">' +
            '<span>' + json[key.name] + '</span>' +
            '<div><i></i><i></i></div>' +
            '</li>';
      },
      findData: function(igtId) { //根据传入id找到数据
         var impdata = obj.options.importDatas;
         for (var i = 0; i < impdata.length; i++) {
            // if (impdata[i].id == igtId) {
            if (impdata[i][obj.options.indexKeyName.id] == igtId) {
               return impdata[i];
            }
         }
      },
      changeBgColor: function(igtId) { //改变已经选中的option颜色
         obj.options.elm.selectWrap.find("option").each(function(i) {
            if ($(this).attr('value') == igtId) {
               $(this).css({
                  'color': '#ccc',
                  'background-color': '#333'
               });
            }
         });
      },
      cancelBgColor: function(igtId) { //取消option颜色属性
         obj.options.elm.selectWrap.find("option").each(function(i) {
            if ($(this).attr('value') == igtId) {
               $(this).removeAttr('style');
            }
         });
      },
      haveId: function(igtId) { //根据id判断 是否已被选中
         var havArr = obj.options.haveSelect;
         for (var i = 0; i < havArr.length; i++) {
            if (igtId == havArr[i]) {
               return false;
            }
         };
         return true;
      },
      removeHaveId: function(igtId) { //删除 已选中id
         var havArr = obj.options.haveSelect;
         for (var i = 0; i < havArr.length; i++) {
            if (igtId == havArr[i]) {
               obj.options.haveSelect.splice(i, 1);
            }
         };
      },
      baseBindEvent: function() { //基础事件注册
         var mxt = obj.options,
            elm = mxt.elm;
         elm.selectWrap.off('change').on('change', function() {
            var val = $(this).val();
            if (val !== mxt.defaultId) {
               if (obj.haveId(val) == true) {
                  var doms = obj.creatMark(obj.findData(val));
                  if (elm.markWrap.find('ul').length > 0) {
                     elm.markWrap.find('ul').append(doms);
                  } else {
                     elm.markWrap.append('<ul>' + doms + '</ul>');
                  }
                  obj.changeBgColor(val);
                  obj.options.haveSelect.push(val);
                  obj.creatBindEvent();
                  mxt.callback({
                     obj: elm.selectWrap,
                     id: val,
                     haveSelect: obj.options.haveSelect
                  });
               }
            }
            $(this).val(mxt.defaultId);
         });
         return this;
      },
      creatBindEvent: function() { //多伦对象事件注册
         var mxt = obj.options,
            elm = mxt.elm;
         elm.markWrap.find('li div').off('click').on('click', function() {
            var li = $(this).closest('li'),
               vId = li.attr('vid');
            obj.cancelBgColor(vId);
            obj.removeHaveId(vId);
            li.remove();
            mxt.callback({
               obj: elm.selectWrap,
               id: vId,
               haveSelect: obj.options.haveSelect
            });
         });
         return this;
      }
   };
   return obj;
}

function compsiterController(settings) { //复合题综合控制
   var obj = {
      options: { //可自定义
         iwindow: window, //定义对象域 window
         importDatas: null, //导入数据
         defaultEmptyTips: '暂时没有任何子题', //空表格tips
         widowTitle: '新增子题', //新增子题窗口标题
         elm: {
            addbtn: $(".js-addNewTX"), //新增小题弹窗触发按钮
            grid: $(".js-compsiterTable"), //表格
         },
         keyDatasName: { //导入数据key名称 可定义
            id: 'id', //id
            srouce: 'srouce', //分数
            name: 'name', //题型名称
            content: 'content' //题干内容
         },
         callback: function(result) {} //方法回调
      },
      init: function() { //初始化
         //
         obj.extendOptions().forEachDatas().baseBindEvent();
         return this;
      },
      extendOptions: function() { //数据重载
         $.extend(true, obj.options, settings, true);
         return this;
      },
      forEachDatas: function() { //数据循环
         var opt = obj.options,
            impt = opt.importDatas,
            doms = '<ul>' + obj.creatTrHead();
         if (impt !== null) {
            if (typeof(impt) == 'object' && impt.length > 0) {
               for (var i = 0; i < impt.length; i++) {
                  doms += obj.creatTr(impt[i]);
               }
            }
         } else {
            doms += obj.creatEmptyTips();
         }
         doms += '</ul>';
         opt.elm.grid.html(doms);
         obj.creatBindEvent();
         return this;
      },
      creatTrHead: function() { //创建表头
         return '<li>' +
            '<span class="tb-tigan"><b>题干</b></span>' +
            '<span class="tb-name"><b>题型</b></span>' +
            '<span class="tb-srouce"><b>分值</b></span>' +
            '<span class="tb-tool"><b>操作</b></span>' +
            '</li>';
      },
      creatTr: function(json) { //创建表行
         var opt = obj.options,
            keyKu = opt.keyDatasName,
            txId = '', //id
            txName = '', //试题名称
            srouce = '', //分数
            content = ''; //题干内容
         if (typeof(json) !== 'undefined') {
            if (json[keyKu.id] != undefined) {
               txId = json[keyKu.id];
            }
            if (json[keyKu.name] != undefined) {
               txName = json[keyKu.name];
            }
            if (json[keyKu.srouce] != undefined) {
               srouce = json[keyKu.srouce];
            }
            if (json[keyKu.content] != undefined) {
               content = json[keyKu.content];
            }
         }
         return '<li dianti-id="' + txId + '">' +
            '<span class="tb-tigan">' + content + '</span>' +
            '<span class="tb-name">' + txName + '</span>' +
            '<span class="tb-srouce">满分:<em>' + srouce + '</em>分</span>' +
            '<a class="btn btn-danger btn-xs glyphicon glyphicon-trash js-delbtn" title="删除小题" href="javascript:;"></a>' +
            '<a class="btn btn-warning btn-xs glyphicon glyphicon-edit js-editbtn" title="编辑小题" href="javascript:;" style="margin-right:4px;"></a>' +
            '</li>';
      },
      creatEmptyTips: function() { //空表格文字提示
         return '<li>' + obj.options.defaultEmptyTips + '</li>';
      },
      baseBindEvent: function() { //基础对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.addbtn.off('click').on('click', function() { //创建子题弹窗按钮被点击
            opt.callback({
               cName: 'openAddWindow'
            });
         });
         return this;
      },
      creatBindEvent: function() { //创建对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.grid.find(".js-editbtn").off('click').on('click', function() { //编辑按钮
            var fli = $(this).closest('li');
            opt.callback({
               cName: 'editTr',
               li: fli,
               id: fli.attr('dianti-id'),
               name: fli.find(".tb-name").text(),
               srouce: fli.find(".tb-srouce").find('em').text()
            });
         });
         elm.grid.find(".js-delbtn").off('click').on('click', function() { //删除按钮
            var fli = $(this).closest('li');
            opt.callback({
               cName: 'removeTr',
               li: fli,
               id: fli.attr('dianti-id'),
               name: fli.find(".tb-name").text(),
               srouce: fli.find(".tb-srouce").find('em').text()
            });
         });
         //未来添加放大
      },
      creatAllbtn: function(arr) { //创建所有小题入口按钮
         var doms = '';
         for (var i = 0; i < arr.length; i++) {
            doms += obj.creatTXBtn(arr[i]);
         };
         return doms;
      },
      creatTXBtn: function(json) { //创建题型按钮
         //获取知识点id
         var testpointid = window.location.search.split('testpointId=')[1];
         gParseUrlParam(window.location.href);
         testpointid = gUrlParam.testpointId;
         return '<a class="btn btn-success btn-sm js-creatTXbtn" testpointid="' + testpointid + '" pageName="' + json.tid + '" href="javascript:;"><i class="glyphicon glyphicon-plus"></i>&nbsp;' + json.name + '</a>';
      },
      alertWindow: function(arrJson) { //执行调用弹框
         $(obj.options.iwindow.document.body).append(obj.creatWindow(arrJson));
         obj.windowBindEvent();
      },
      creatWindow: function(data) { //创建弹出窗口
         return '<div class="compsiterController-posWrap">' +
            '<div class="compsiterController-ins">' +
            '<h4>' + obj.options.widowTitle + '</h4>' +
            '<div class="btnbox">' +
            obj.creatAllbtn(data) +
            '</div>' +
            '<a class="btn btn-default closed" href="javascript:;">关闭</a>' +
            '</div>' +
            obj.windowStyle() +
            '</div>';
      },
      windowStyle: function() { //弹出窗口样式
         var uW = document.documentElement.clientWidth,
            uH = document.documentElement.clientHeight,
            boxWid = 500,
            boxGht = 270;
         return '<style>' +
            '.compsiterController-posWrap{ position:absolute; left:0; top:0; width:100%; height:' + uH + 'px; background:rgba(0,0,0,0.3); z-index:9999;}' +
            '.compsiterController-ins{ position:absolute; left:' + ((uW - boxWid) * .5) + 'px; top:' + ((uH - boxGht) * .38) + 'px; padding:8px; width:' + boxWid + 'px; height:' + boxGht + 'px; background:#fff; border-radius:3px; box-sizing:border-box; box-shadow:1px 1px 2px rgba(0,0,0,0.3);}' +
            '.compsiterController-ins h4{ float:left; margin:0; width:100%; height:45px; line-height:45px; font-size:14px; font-weight:100; border-bottom:1px solid #ccc;}' +
            '.compsiterController-ins div.btnbox{ float:left; padding:10px 8px; width:100%; box-sizing:border-box;}' +
            '.compsiterController-ins div.btnbox .btn{ float:left; margin: 2px 5px; color:#fff;}' +
            '.compsiterController-ins .closed{ position:absolute; right:16px; bottom:14px; }' +
            '</style>';
      },
      windowBindEvent: function() { //弹出窗口 事件注册
         var bd = $(obj.options.iwindow.document.body),
            box = bd.find(".compsiterController-posWrap"),
            btn = box.find(".js-creatTXbtn"),
            close = box.find(".closed");
         btn.off("click").on("click", function() { //创建某类型试题按钮被点击
            obj.options.callback({
               cName: 'creatNewTX',
               id: $(this).attr('pagename'),
               testpointId: $(this).attr('testpointid')
            });
         });
         close.off("click").on("click", function() { //关闭窗口
            box.remove();
         });
      }
   };
   return obj;
}

function creatBootstrapGrid(json) {
   var obj = {
         result: {
            cName: 'ini',
            data: null
         },
         options: null,
         table: (function() {
            var $tmp = json.selector ? json.selector : $("#table");
            $tmp.addClass('table-bordered');
            return $tmp;
         })(), //创建表格容器 标签为 <table>
         power: $('.js-touchSwitchPlay-track'), //滑块对象
         text: $('.js-touchSwitch-stateTex'), //滑块文字状态
         showTex: '显示全部列项',
         hideTex: '隐藏部分列项',
         matchGridData: {}, //存储field对应title - json
         detailsHide: [], //指定隐藏展开详情的列,填入field
         hideColumn: [], //隐藏指定列,[,field]
         init: function() { //初始化
            obj.installOptions()
               .concatOptions()
               .evaluating()
               .fillMatchGridData()
               .creatGrid()
               .creatPower()
               .fnHideColumn();
         },
         installOptions: function() { //安装options上部分value
            options['detailFormatter'] = obj.detailFormatter;
            return this;
         },
         concatOptions: function() { //分析合并json设置项
            for (n in json.base) {
               for (m in obj) {
                  if (n == m) {
                     obj[m] = json['base'][n];
                  }
               }
            }
            for (i in json.options) {
               //if(options[i]!==undefined){
               // console.log(i);
               // console.log(json.options[i]);
               options[i] = json.options[i];
               //}
            };
            return this;
         },
         evaluating: function() { //检查内容是否完整
            if (options['data'] == null) {
               //throw 'Please import data FN ({data:[item]})';
            }
            if (obj.table.length == 0) {
               throw 'not find jquery object => $table';
            }
            obj.options = options;
            return this;
         },
         creatGrid: function() { //构建表格
            obj.table.bootstrapTable('destroy').bootstrapTable(obj.options);
            return this;
         },
         creatPower: function() { //激活滑块开关
            obj.text.text(obj.showTex);
            obj.power.touchSwitchPlay({ //bambooSnake组件
               public: {
                  tSize: 50, //轨道尺寸最大宽度
                  lSize: 22, //轨道尺寸最大高度
                  btnWidth: 30, //内芯宽度
                  space: 2, //内芯与轨道的单边距离
                  borColr: "#b7b7b7", //该border边框属性为track所有，并请与track.close中一致
                  borWidth: 1,
                  borType: "solid"
               },
               track: {
                  sty: {
                     'float': 'left',
                     'margin-top': '4px'
                  }
               },
               callback: function(objs, state) {
                  obj.changgeSwitchState(state);
               }
            });
            return this;
         },
         changgeSwitchState: function(state) { //改变滑块文本
            var sstr = obj.hideTex;
            if (state == 0) {
               sstr = obj.showTex;
               obj.fnHideColumn();
            } else {
               obj.fnShowColumn();
            }
            obj.text.text(sstr);
         },
         fillMatchGridData: function() { //field 匹配 title
            var colums = obj.options.columns;
            for (var i = 0; i < colums.length; i++) {
               var tag = colums[i]['title'];
               if (tag != undefined) {
                  // item是基于命题系统特殊结构修改，一般field就行
                  obj.matchGridData[colums[i]['itemDes']] = tag;
               }
            };
            return this;
         },
         detailLayout: function() { //展开详情样式
            return '<style>' +
               '.bamboo-table-detais-p{ float:left; padding-left:20px; text-align:left; width:50%; line-height:25px; box-sizing:border-box;}' +
               '</style>';
         },
         detailFormatter: function(index, row) { //展开详情结构
            var html = [];
            //row.item 是基于命题系统特殊结构修改，一般row就行
            $.each(row.item, function(key, value) {
               if (key !== 'state' && key !== 'id' && obj.matchDetailsHide(key) && obj.matchGridData[key] != undefined) {
                  if (obj.matchGridData[key].indexOf('审核状态') >= 0 && gUrlParam.acttype === 'verify') {

                  } else {
                     // if (obj.matchGridData[key].indexOf('能力层次') >= 0) {
                     // 	value = value === '1' ? '熟悉' : value === '2' ? '掌握' : '了解';
                     // }
                     // if (obj.matchGridData[key].indexOf('预估难度') >= 0) {
                     // 	value = '0.' + value;
                     // }							
                     html.push('<p class="bamboo-table-detais-p"><b>' + obj.matchGridData[key] + ':</b> ' + value + '</p>');
                  }
               }
            });
            html.push(obj.detailLayout());
            return html.join('');
         },
         matchDetailsHide: function(fieldKey) { //匹配展开详情隐藏
            var booleans = true;
            for (var i = 0; i < obj.detailsHide.length; i++) {
               if (obj.detailsHide[i] == fieldKey) {
                  return false;
               }
            };
            return booleans;
         },
         fnShowColumn: function() { //显示指定列
            for (var i = 0; i < obj.hideColumn.length; i++) {
               obj.table.bootstrapTable('showColumn', obj.hideColumn[i]);
            };
            return this;
         },
         fnHideColumn: function() { //隐藏指定列
            for (var i = 0; i < obj.hideColumn.length; i++) {
               obj.table.bootstrapTable('hideColumn', obj.hideColumn[i]);
            };
            return this;
         },
         callback: function() {}
      },
      options = {
         //url: 'data1.json',
         columns: [{
            field: 'default',
            title: '默认名称'
         }],
         idField: 'id',
         uniqueId: 'id',
         //data: null,			//导入数据,如果使用ajax则外部不需写入
         pageSize: 5, //分页数量
         pagination: true, //底部分页条
         //sidePagination:'server',//使用服务器分页  server or client - 默认客户端	    
         // - toolbar view show
         search: true, //是否启用搜索框
         showRefresh: true, //是否显示刷新按钮
         showColumns: true, //是否显示列类
         //
         clickToSelect: true, //点击行时自动选中check或radio
         singleSelect: false, //单选或多选
         maintainSelected: true, //设置为 true 在点击分页按钮或搜索按钮时，将记住checkbox的选择项
         striped: true, //隔行换色
         searchText: '', //设置初始化要搜索显示的值
         toolbar: null, //自定义toolbar - jquery对象
         fixedColumns: false, //[外增插件] - 开启固定某列
         fixedNumber: 1, //[外增插件] - 固定列从第x列开始
         detailView: true, //是否打开 允许数据展开显示
         detailFormatter: null, //展开内容布局
         /*
         ajax:function(params){
         	//This is ajax request
         	requestFrontEnd('POST','/apps/appSrvRequest.do',JSON.stringify(iJson),function(result){
         		params.success({
         			total:result.totalCount,
         			rows:result.ret
         		});
         	});
         },*/
         queryParmas: function(x) {
            // console.log(x)
         },
         onRefresh: function() {
            //刷新
            //obj.options.ajax();		//刷新则对外部调用的ajax做执行命令
            //obj.table.bootstrapTable('refresh', {url: '/apps/appSrvRequest.do'});
         }, //触发刷新按钮
         onLoadSuccess: function(data) {}, //远程数据加载成功
         onLoadError: function(status) {} //远程数据加载错误
            //editable: true,		//[外增插件] - 开启单元格编辑
            //height:400,			//定义表格高度
      }
   obj.init();
   return obj;
}

function TXsingleController(settings) { //单选题控制
   var obj = {
      options: { //可自定义设置项
         importDatas: null, //导入数据
         defaultCreatNumber: 4, //默认创建option数量 (须importDatas为null)
         radioName: 'single',
         elm: {
            wrap: $(".js-singleULwrap"), //ul容器
            btn: $(".js-addNewSingleOptions") //新增按钮
         },
         datasKeyName: { //真实数据key名称 自定
            id: 'id', //id
            name: 'name', //文本
            check: 'check' //是否选中 true | false
         },
         callback: function() {} //回调事件
      },
      init: function() { //初始化
         obj.extendOptions().forEachData().baseBindEvent();
         obj.options.callback({
            cName: 'init'
         });
         return this;
      },
      extendOptions: function() { //数据重载
         $.extend(true, obj.options, settings, true);
         return this;
      },
      forEachData: function() { //循环数据
         var opt = obj.options,
            impt = opt.importDatas,
            doms = '';
         if (impt !== null) { //渲染
            if (typeof(impt) == 'object' && impt.length > 0) {
               for (var i = 0; i < impt.length; i++) {
                  doms += obj.creatOptions(impt[i]);
               }
            }
         } else {
            for (var i = 0; i < opt.defaultCreatNumber; i++) {
               doms += obj.creatOptions();
            }
         }
         opt.elm.wrap.html(doms);
         obj.creatBindEvent();
         return this;
      },
      creatOptions: function(json) { //创建option
         var setId = '',
            setValue = '',
            checked = '';
         if (typeof(json) !== 'undefined') {
            var tdai = obj.options.datasKeyName;
            if (typeof(json[tdai.id]) !== 'undefined') {
               setId = json[tdai.id];
            }
            if (typeof(json[tdai.name]) !== 'undefined') {
               setValue = json[tdai.name];
            }
            if (json[tdai.check] == true) {
               checked = 'checked="checked"';
            }
         }
         return '<li options-id="' + setId + '">' +
            '<label title="作为答案"><input name="' + obj.options.radioName + '" type="radio" ' + checked + '/></label>' +
            '<input type="text" value="' + setValue + '"/>' +
            '<a class="btn btn-danger btn-xs glyphicon glyphicon-trash js-delbtn" href="javascript:;"></a>' +
            '</li>';
      },
      baseBindEvent: function() { //基本对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.btn.off('click').on('click', function() {
            var tdai = obj.options.datasKeyName
            elm.wrap.append(obj.creatOptions());
            obj.creatBindEvent();
            obj.options.callback({
               cName: 'addOptions'
            });
         });
         return this;
      },
      creatBindEvent: function() { //创建对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.wrap.find('.js-delbtn').off('click').on('click', function() {
            $(this).closest('li').remove();
            obj.options.callback({
               cName: 'removeOptions'
            });
         });
         elm.wrap.find("input[type='radio']").off('click').on('click', function() {
            obj.options.callback({
               cName: 'checkRadio',
               value: obj.getCheck()
            });
         });
         return this;
      },
      getCheck: function() { //获取选中radio
         var opt = obj.options,
            elm = opt.elm,
            value = elm.wrap.find("input[type='radio']:checked").closest('li').find("input[type='text']").val();
         if (typeof(value) == 'undefined') {
            value = 'sysTips!!!NoFindChecked';
         }
         return value;
      },
      getAllDatas: function() { //获取所有数据
         var opt = obj.options,
            elm = opt.elm,
            dkey = opt.datasKeyName,
            arr = [];
         elm.wrap.find('li').each(function(i) {
            var json = {};
            json[dkey.id] = '';
            json[dkey.name] = $(this).find('input[type="text"]').val();
            json[dkey.check] = $(this).find("input[type='radio']").prop('checked'); // = true | false
            if (typeof($(this).attr('options-id')) !== 'undefined') {
               json[dkey.id] = $(this).attr('options-id');
            }
            arr.push(json);
         });
         return arr;
      }
   };
   return obj;
}

function detailedInformationDisplay(settings) { //详情显示控制
   //（用于表格被行选中,作用与表格底部进行 题干、答案及相关信息的显示）
   var obj = {
      options: { //可自定义项
         iframeSrc: '', //页面地址
         importText: '', //(废弃)导入文本
         elm: {
            apd: $(".js-detailsCompeontWrap"), //填充定位对象  （究竟是插入在哪个盒子）
            textAreaClasName: "detailInfoWrap", //填充字符对象 class名称
         },
         callback: function() {} //回调函数
      },
      init: function() { //初始化
         obj.extendOptions().regObject().appendStrings();
         return this;
      },
      extendOptions: function() { //数据重载
         $.extend(true, obj.options, settings, true);
         return this;
      },
      regObject: function() { //注册相应变量、对象
         var opt = obj.options;
         if (typeof(opt.elm.apd) == 'object') { //定位对象存在
            if (opt.elm.apd.length == 0) {
               // throw '!!! func detailedInformationDisplay() object not find.';
            }
         };
         return this;
      },
      appendStrings: function(src) { //插入src=null|src 可不填
         var opt = obj.options;
         if ($('.' + opt.elm.textAreaClasName).length == 0) { //判断组件结构是否已经存在
            opt.elm.apd.append(obj.creatDoms());
            opt.elm.textAreaClasName = $('.' + opt.elm.textAreaClasName);
         } else {
            var oSrc = src != undefined ? src : obj.options.iframeSrc;
            opt.elm.textAreaClasName = $('.' + opt.elm.textAreaClasName);
            opt.elm.textAreaClasName.find('iframe').attr('src', oSrc);
         };
         return this;
      },
      /*
      creatDoms:function(){						//创建结构
      	var tex=obj.options.importText;
      	if(obj.options.importText.indexOf('<p>')==-1){
      		tex='<p>'+obj.options.importText+'</p>';
      	}
      	return '<div class="'+obj.options.elm.textAreaClasName+'">'+
      		tex+
      	'</div>'+obj.creatStyle();
      },*/
      creatDoms: function() { //创建结构
         return '<div class="' + obj.options.elm.textAreaClasName + '">' +
            '<iframe src="' + obj.options.iframeSrc + '"></iframe>' +
            '</div>' + obj.creatStyle();
      },
      creatStyle: function() { //创建样式
         var box = '.' + obj.options.elm.textAreaClasName;
         return '<style>' +
            box + '{ padding:14px; text-align:left; width:100%; min-height:140px; border:1px solid #ccc; border-radius:3px; box-sizing:border-box;}' +
            box + ' p{ width:100%; line-height:23px; color:#333;}' +
            box + ' iframe{ width:100%; height:100%; border:0;}' +
            '</style>';
      }
   };
   return obj;
}

function TXmultipleController(settings) { //多选题控制
   var obj = {
      options: { //可自定义设置项
         importDatas: null, //导入数据
         defaultCreatNumber: 4, //默认创建option数量 (须importDatas为null)
         maxChoice: 100, //最大允许勾选数量(逻辑待加入)
         elm: {
            wrap: $(".js-multipleULwrap"), //ul容器
            btn: $(".js-addNewMultipleOptions") //新增按钮
         },
         datasKeyName: { //真实数据key名称 自定
            id: 'id', //id
            name: 'name', //文本
            check: 'check' //是否选中 true | false
         },
         callback: function() {} //回调事件
      },
      init: function() { //初始化
         obj.extendOptions().forEachData().baseBindEvent();
         obj.options.callback({
            cName: 'init'
         });
         return this;
      },
      extendOptions: function() { //数据重载
         $.extend(true, obj.options, settings, true);
         return this;
      },
      forEachData: function() { //循环数据
         var opt = obj.options,
            impt = opt.importDatas,
            doms = '';
         if (impt !== null) { //渲染
            if (typeof(impt) == 'object' && impt.length > 0) {
               for (var i = 0; i < impt.length; i++) {
                  doms += obj.creatOptions(impt[i]);
               }
            }
         } else {
            for (var i = 0; i < opt.defaultCreatNumber; i++) {
               doms += obj.creatOptions();
            }
         }
         opt.elm.wrap.html(doms);
         obj.creatBindEvent();
         return this;
      },
      creatOptions: function(json) { //创建option
         var setId = '',
            setValue = '',
            checked = '';
         if (typeof(json) !== 'undefined') {
            var tdai = obj.options.datasKeyName;
            if (typeof(json[tdai.id]) !== 'undefined') {
               setId = json[tdai.id];
            }
            if (typeof(json[tdai.name]) !== 'undefined') {
               setValue = json[tdai.name];
            }
            if (json[tdai.check] == true) {
               checked = 'checked="checked"';
            }
         }
         return '<li options-id="' + setId + '">' +
            '<label title="作为答案"><input type="checkbox" ' + checked + '/></label>' +
            '<input type="text" value="' + setValue + '"/>' +
            '<a class="btn btn-danger btn-xs glyphicon glyphicon-trash js-delbtn" href="javascript:;"></a>' +
            '</li>';
      },
      baseBindEvent: function() { //基本对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.btn.off('click').on('click', function() {
            var tdai = obj.options.datasKeyName
            elm.wrap.append(obj.creatOptions());
            obj.creatBindEvent();
            obj.options.callback({
               cName: 'addOptions'
            });
         });
         return this;
      },
      creatBindEvent: function() { //创建对象事件注册
         var opt = obj.options,
            elm = opt.elm;
         elm.wrap.find('.js-delbtn').off('click').on('click', function() {
            $(this).closest('li').remove();
            obj.options.callback({
               cName: 'removeOptions'
            });
         });
         elm.wrap.find("input[type='checkbox']").off('click').on('click', function() {
            obj.options.callback({
               cName: 'checkChoice',
               value: obj.getAllDatas()
            });
         });
         return this;
      },
      getAllDatas: function() { //获取所有数据
         var opt = obj.options,
            elm = opt.elm,
            dkey = opt.datasKeyName,
            arr = [];
         elm.wrap.find('li').each(function(i) {
            var json = {};
            json[dkey.id] = '';
            json[dkey.name] = $(this).find('input[type="text"]').val();
            json[dkey.check] = $(this).find("input[type='checkbox']").prop('checked'); // = true | false
            if (typeof($(this).attr('options-id')) !== 'undefined') {
               json[dkey.id] = $(this).attr('options-id');
            }
            arr.push(json);
         });
         return arr;
      }
   };
   return obj;
}

/** 2019-12-13 by ZhangHao 维护 */
function TXselectFunctions(settings) { // select拼组页面
  var obj = {
    options: { // 可自定义
      elm: {
        select: $(".js-select-TX"), // select元素
        apendbox: $(".other-wrap"), // ajax请求到的html文本插入element
      },
      parentItemType: '',
      defaultChoice: '', // 默认选中某option项
      typeName: 'TX-type', // option元素存储类型的属性名称
      beforeSrc: '', // matchAjaxUrl 若前缀路径都是统一就设置此项
      /**
       * [// 匹配根据 TX-type 对应的 Ajax Url地址
            {code:'TXID-single', pageName:'singleChoice.html',name:'单项选择题'},
            {code:'TXID-multi', pageName:'multipleChoice.html',name:'多项选择题'},
            {code:'TXID-judge', pageName:'judge.html',name:'判断题'},
            {code:'TXID-shortAnswer', pageName:'shortQuestions.html',name:'简答题'},
            {code:'TXID-count', pageName:'count.html',name:'计算题'},
            {code:'TXID-composite', pageName:'composite.html',name:'综合题'}] */
      matchAjaxUrl: [],
      callback: function() {} // 回调外抛事件
    },
    init: function() { // 初始化
      obj.extendOptions().creatDoms().defaultChoice().baseBindEvent();
    },
    extendOptions: function() { // 数据重载
      $.extend(true, obj.options, settings, true);
      return this;
    },
    defaultChoice: function() { // 默认选中option
      var opt = obj.options;
      if (opt && opt.defaultChoice !== '' && opt.matchAjaxUrl && opt.matchAjaxUrl.length > 0) {
        for (var i = 0; i < opt.matchAjaxUrl.length; i++) {
          if (opt.matchAjaxUrl[i].code == opt.defaultChoice) { // 选中对象存在
            // obj.options.elm.select.find("option[" + opt.typeName + "='" + opt.matchAjaxUrl[i].code + "']").attr("selected", true);
            obj.options.callback({
              cName: 'defaultChoice',
              obj: obj,
              url: opt.matchAjaxUrl[i].pageName
            });
            break;
          }
        }
      }
      return this;
    },
    creatDoms: function() {
      var typeHtmlStr = "<option value='-1'>请选择</option>";
      if (obj && obj.options && obj.options.matchAjaxUrl) {
        for (var i = 0; i < obj.options.matchAjaxUrl.length; i++) {
          // 增加学科题型ID obj.options.matchAjaxUrl[i].subItemTypeId
          // 学科题型对应的基础题型ID obj.options.matchAjaxUrl[i].id
          // 基础题型对应的页面 obj.options.matchAjaxUrl[i].code
          // typeHtmlStr += "<option TX-type=\"" + obj.options.matchAjaxUrl[i].code + "\" value=\"" +
          //   obj.options.matchAjaxUrl[i].id + "\" sub-item-type=\"" + obj.options.matchAjaxUrl[i].subItemTypeId + "\">"+
          //   obj.options.matchAjaxUrl[i].name + "</option>";
          var item = obj.options.matchAjaxUrl[i];
          typeHtmlStr += '<option TX-type="' + item.code +
            '" value="' + (item.subItemTypeId || item.id) + '" item-type="' +
            item.id + '" item-score="' +
            item.score + '">' + item.name + "</option>";
        }
      }
      obj.options.elm.select.html(typeHtmlStr);
      return this;
    },
    baseBindEvent: function() { // 基础对象事件注册
      obj.options.elm.select.on('change', function() {
        var type = $(this).find('option:selected').attr('TX-type'),
          url = obj.findUrl(type);
        obj.options.callback({
          cName: 'selectChoice',
          obj: obj,
          type: type,
          url: url
        });
        obj.ajax(url);
      });
      return this;
    },
    findUrl: function(type) { // 找到页面名称
      var opt = obj.options;
      if (opt && opt.matchAjaxUrl && opt.matchAjaxUrl.length > 0) {
        for (var i = 0; i < opt.matchAjaxUrl.length; i++) {
          if (opt.matchAjaxUrl[i]['code'] == type) {
            return opt.matchAjaxUrl[i]['pageName']
          }
        }
      }
    },
    ajax: function(url) {
      $.ajax({
        async: false,
        dataType: 'html',
        url: obj.options.beforeSrc + url,
        success: function(result) {
          obj.options.elm.apendbox.html(result);
          obj.options.callback({
            cName: 'requestSuccess',
            obj: obj,
            rdata: result
          });
        }
      });
    }
  };
  return obj;
}

function creatTestMianBan(json, settings) { //创建test面板
   var keyName = {
      id: 'id',
      name: 'name',
      number: 'number',
      source: 'source'
   };
   if (settings != undefined) {
      for (g in keyName) {
         for (n in settings) {
            if (g == n) {
               keyName[g] = settings[n];
            }
         }
      }
   }
   return '<div class="testTeamBox" test-id="' + json[keyName.id] + '">' +
      '<div class="ti-box">' +
      '<span>' + json[keyName.name] + '</span>' +
      '<span>（' + json[keyName.number] + '题，' + json[keyName.source] + '分）</span>' +
      '</div>' +
      '<div class="btn-box">' +
      '<a class="btn btn-default js-choice">已选试题</a>' +
      '<button class="btn btn-default js-look">预览试卷</button>' +
      '<button class="btn btn-default js-xmlook">预览双向细目表</button>' +
      '<button class="btn btn-default js-statistics">统计</button>' +
      '</div>' +
      '</div>';
}

function creatComboTestBtn(settings) { //组合事件 按钮
   var obj = {
      options: {
         importDatas: null, //导入数据
         elm: {
            wrap: $(".js-comboTestBtnWrap") //
         },
         keyName: { //自定义key名称
            id: 'id',
            name: 'name'
         },
         callback: function() {}
      },
      init: function() {
         obj.extendOptions().initCreatNumber();
         return this;
      },
      extendOptions: function() {
         $.extend(true, obj.options, settings, true);
         return this;
      },
      initCreatNumber: function() { //初始创建按钮组数量
         var doms = '';
         for (var i = 0; i < obj.options.importDatas.length; i++) {
            doms += obj.creatBtn(obj.options.importDatas[i]);
         };
         obj.options.elm.wrap.html(doms);
         obj.bindEvent();
         return this;
      },
      creatBtn: function(json) { //创建按钮
         var keyn = obj.options.keyName;
         return '<div class="creatComboTestbtn-li" testId="' + json[keyn.id] + '">' +
            //'<span class="tex">'+json.name+'</span>'+
            '<button class="btn btn-success btn-sm act js-join js-btn">' +
            '<i class="glyphicon glyphicon-plus"></i>&nbsp;&nbsp;加入' +
            '&nbsp;&nbsp;' + json[keyn.name] +
            '</button>' +
            '<button class="btn btn-danger btn-sm js-remove js-btn">' +
            '<i class="glyphicon glyphicon-trash"></i>&nbsp;&nbsp;移除' +
            '&nbsp;&nbsp;' + json[keyn.name] +
            '</button>' +
            '</div>';
      },
      bindEvent: function() {
         var opt = obj.options,
            elm = opt.elm;
         elm.wrap.find(".js-btn").off('click').on('click', function() {
            var result = {
               cName: '',
               id: $(this).closest(".creatComboTestbtn-li").attr("testId"),
               obj: obj
            };
            if ($(this).is(".js-join")) {
               result.cName = 'join'; //pageName
            } else {
               result.cName = 'remove';
            }
            opt.callback(result);
         });
      },
      ctrlBtn: function(jsonArr) { //控制指定按钮 显示  [{id、state}..]
         var opt = obj.options,
            elm = opt.elm;
         elm.wrap.find(".js-join").addClass('act');
         elm.wrap.find(".js-remove").removeClass('act');
         elm.wrap.find(".creatComboTestbtn-li").each(function() {
            var iThis = $(this);
            for (var k = 0; k < jsonArr.length; k++) {
               if (iThis.attr("testid") == jsonArr[k][obj.options.keyName.id]) {
                  if (jsonArr[k].state == 'remove') {
                     iThis.find(".js-join").removeClass('act');
                     iThis.find(".js-remove").addClass('act');
                  }
               }
            }
         });
      }
   };
   return obj;
}

function itemformatPainterHalfToAll(settings) { //格式刷 针对题干
   //三大类型代号:数字(NUMB)、英文(EN)、汉字(CN)
   var obj = {
      options: {
         textSource: '', //源码文本 （纯文本|源码文本,根据操作人方式决定）
         ruleRegister: { //净化规则注册 - 标识符替换
            //key:半角 {replace:替换字符(或方法), cn:中文名, reg:正则要求代号(通过代号唤起条件),}
            ',': {
               cn: '逗号',
               replace: '，'
            },
            ';': {
               cn: '分号',
               replace: '；'
            },
            '(': {
               cn: '左括号',
               replace: '（'
            },
            ')': {
               cn: '右括号',
               replace: '）'
            },
            '?': {
               cn: '问号',
               replace: '？'
            },
            '.': {
               cn: '句号',
               replace: '。'
            },
            ':': {
               cn: '冒号',
               replace: '：'
            }
         },
         cleanFormat: { //格式处理 类型
            'fontFamily': '\'Times New Roman\'', //英文数字罗马字体
            'thousands': true, //千分位空格
         },
         bold: [ //加粗词组
            '要求'
         ],
         negate: ['不要', '否定'], //否定加粗词组、将会对填入的词进行加粗
         // callback: function() {}, //回调函数
      },
      symbol: '{{&&&}}', //img、table标签替换符
      symbolData: [], //标签替换存储
      textReplace: null, //替换流程完毕后的字符
      textFormat: null, //格式化流程完毕的字符
      init: function() { //初始化
         obj.extendOptions().performance();
         return this;
      },
      extendOptions: function() { //设值重载
         $.extend(true, obj.options, settings, true);
         return this;
      },
      extendJson: function(setX) { //实例化对象设参
         $.extend(true, obj.options, setX, true);
         return this;
      },
      perfomanceReplace: function() { //替换流程
         var opt = obj.options,
            strs = obj.textFormat;

         // if (strs === null) {
         // 	strs = ' ';
         // }


         /****************************************************************************************************************************************
          * 格式刷禁止刷新公式
          */
         if (strs === '' || strs === null) {
            return this;
         }
         var $tmpElem = $('<p>');
         $tmpElem.html(strs);
         var $mathquills = $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy');
         $mathquills.wrap('<div mathquill="pnlMathquill">');
         $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy').remove();
         strs = $tmpElem[0].innerHTML;
         /***************************************************************************************************************************************/

         //	encodeURIComponent(k);	decodeURIComponent();
         // /<img[^>]+>/g
         obj.symbolData = [];



         strs = strs.replace(/(<table[^>]*>[\s\S]*<\/table>)|(<img[^>]+>)/g, function(str) {
            //替换img、table为替换符
            obj.symbolData.push(str);
            return obj.symbol;
         });
         //新增功能,去掉空行

         //===========[ 替换符组 ↓↓ ]=================================
         strs = strs.replace(/\(/g, '（'); //左括号
         strs = strs.replace(/\)/g, '）'); //右括号
         strs = strs.replace(/([^\d]\s*(&nbsp;)*\.)|(\.\s*(&nbsp;)*\s*[^\d])/g,
            function(str) { // 替换 -> 。
               var spacZ = str.replace(/\s*/g, '');
               return spacZ.replace(/\./g, '。');
            });
         strs = strs.replace(/(&nbsp;|&lt;|&gt;|;)/g, function(str, a, b) { //替换 -> ;
            if (str.length == 1) {
               return '；';
            };
            return str;
         });
         strs = strs.replace(/,/g, '，');
         strs = strs.replace(/:/g, '：');
         strs = strs.replace(/\?/g, '？'); //替换 -> ?

         //===========[ 新增相关标签 ↓↓ ]===========================
         // 解决关于英文格式刷的问题 Hao.Zhang 2018-9-4
         //  var $tmpEl = $('<tmp>' + strs + '</tmp>');
         //  for (var i = 0; i < $tmpEl[0].childNodes.length; i++) {
         //     if ($tmpEl[0].childNodes[i].nodeName === '#text') {
         //        $tmpEl[0].childNodes[i].nodeValue = $tmpEl[0].childNodes[i].nodeValue.replace(/[\d(\s\d)|a-z|A-Z]+/g, function(str, index, stringsObj) {
         //           // 设置数字和英文字体
         //           return '<span style="font-family:' + opt.cleanFormat.fontFamily + ';font-size:12pt;">' + str + '</span>';
         //        });
         //     }
         //  }
         //  strs = $tmpEl.html().replace(/&lt;+/g, '<').replace(/&gt;+/g, '>');        
         strs = strs.replace(/\d+(\s\d+)?/g, function(str, index, stringsObj) {
            //  strs = strs.replace(/[\d(\s\d)|a-z|A-Z]+/g, function(str, index, stringsObj) {
            //设置数字字体
            return '<span style="font-family:' + opt.cleanFormat.fontFamily + ';font-size:12pt;">' + str + '</span>';
         });
         //  trs = strs.replace(/[a-z|A-Z]/g, function(str, index, stringsObj) {
         //     //设置英文字体
         //     return '<span style="font-family:' + opt.cleanFormat.fontFamily + ';font-size:12pt;">' + str + '</span>';
         //  });
         var symCount = -1;
         strs = strs.replace(eval('/' + obj.symbol + '/g'), function(str) {
            //替换img、table为替换符
            symCount++;
            return obj.symbolData[symCount];
         });

         /****************************************************************************************************************************************
          * 格式刷禁止刷新公式
          ***************************************************************************************************************************************/
         var $tmpElem = $('<p></p>');
         $tmpElem.html(strs);
         $tmpElem.find('div[mathquill="pnlMathquill"]').each(function(idx, item) {
            $(item).html($mathquills[idx].outerHTML);
         });
         $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy').unwrap('<div>');
         strs = $tmpElem[0].innerHTML;
         /***************************************************************************************************************************************
          * JIRA: DBP-1082 财政部：格式刷：－ ﹢ × ÷ ＝刷成宋体，无需新罗马
          * by ZhangH 2018-1-26
          ***************************************************************************************************************************************/
         strs = strs.replace(/﹢/g, '<span style="font-family:\'宋体\';font-size:12pt;">﹢</span>');
         strs = strs.replace(/\+/g, '<span style="font-family:\'宋体\';font-size:12pt;">﹢</span>');
         strs = strs.replace(/－/g, '<span style="font-family:\'宋体\';font-size:12pt;">－</span>');
         strs = strs.replace(/×/g, '<span style="font-family:\'宋体\';font-size:12pt;">×</span>');
         strs = strs.replace(/÷/g, '<span style="font-family:\'宋体\';font-size:12pt;">÷</span>');
         strs = strs.replace(/＝/g, '<span style="font-family:\'宋体\';font-size:12pt;">＝</span>');
         strs = strs.replace(/——/g, '<span style="font-family:\'Times New Roman\';font-size:12pt;">——</span>');

         /***************************************************************************************************************************************
          * DBP-1131: 格式刷：当判断题后没有括号时，系统自动加上的括号不应该是8个空格，而是4个
          * modify by ZhangH 2018-3-20
          ***************************************************************************************************************************************/
         if (opt.itemTypeId === '3' && settings.key === 'contentUE') {
            // strs = strs.replace(/（&nbsp;&nbsp;&nbsp;&nbsp;）/g, '（<span style="font-family:\'宋体\';font-size:12pt;">&nbsp;&nbsp;&nbsp;&nbsp;</span>）');
         }
         /***************************************************************************************************************************************/

         strs = strs.replace(/<br>&nbsp;&nbsp;/g, '<br><span style="font-family:\'宋体\';font-size:12pt;">&nbsp;&nbsp;</span>');
         if (strs.indexOf('<br>') === 0) {
            strs = strs.substr('<br>'.length);
         }
         obj.textReplace = '<p style="font-family:\'宋体\',\'Times New Roman\'; font-size:12pt; line-height:1.5; letter-spacing:0.02em;">' + strs + '</p>';
         opt.callback({
            cName: 'replaceOver',
            str: obj.textReplace
         });
         return this;
      },
      performanceFormat: function() { //整理格式
         var opt = obj.options,
            strs = opt.textSource;
         /****************************************************************************************************************************************
          * 格式刷禁止刷新公式
          */
         if (strs === '' || strs.length === 0) {
            opt.callback({
               cName: 'formatOver',
               str: ''
            });
            return this;
         }
         var $tmpElem = null;
         var isOuterHTML = true;
         try {
            $tmpElem = $('<div></div>');
            $tmpElem.html(strs);
            // $tmpElem = $(strs);
         } catch (err) {
            $tmpElem = $('<div></div>');
            $tmpElem.html(strs);
            isOuterHTML = false;
         }
         if ($tmpElem.length === 0) {
            // $tmpElem = $('<div>' + strs + '</div>');
            $tmpElem = $('<div></div>');
            $tmpElem.html(strs);
            isOuterHTML = false;
         }
         var $mathquills = $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy');
         $mathquills.wrap('<div mathquill="pnlMathquill">');
         $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy').remove();
         strs = $tmpElem[0].innerHTML;
         /***************************************************************************************************************************************/

         // console.log(,'opt.itemTypeId')
         // console.log("textSource", strs)
         //  ^\<p(([\s\S])*?)\>\s*(&nbsp;*)([^\w])\s*\<\/p\>$
         strs = strs.replace(/<(p|br)\s+((style).+?)>/g, '<p>');
         strs = strs.replace(/<\s*p[^>]*>(&nbsp;|<br>|\s|<\s*span[^>]*>(&nbsp;|<br>|\s)*<\s*\/span\s*>)*<\s*\/p\s*>/gi, function(str) { //清除空行
            return '';
         });

         // console.log('获取原始代码:',strs)
         //去掉多余空行
         // strs = strs.replace(/(<br\/>){1,}/g, '<br/>');
         // strs = strs.replace(/(<br\/>){1,}<\/p>|(<br\/>|&nbsp;){1,}<\/p>/g, '</p>');
         // strs = strs.replace(/(<br\/>){1,}<\/p>|(<br\/>|&nbsp;){1,}<\/p>/g, '</p>');
         // strs = strs.replace(/(<\/p>){1,}/g, '</p>');
         // strs = strs.replace(/<p>(<br\/>){1,}<\/p>/g, '');
         // strs = strs.replace(/(<\/p>){1,}/g, '</p>');
         // strs = strs.replace(/(<br\/>){1,}<\/p>/g, '</p>');

         strs = strs.replace(/\s*&nbsp;*\s*/g, function(str) { //清空空格符
            return '';
         });
         strs = strs.replace(/<\/p>\s*(&nbsp;)*<p[^>]*>/gi, function(str) {
            //替换<\p>&nbsp;<p xx>为 '<br/>'
            return '<br/>';
         });
         strs = strs.replace(/<\s*br\s*\/>/gi, function(str) {
            //替换<\p>&nbsp;<p xx>为 '<br/>'
            // return str + '&nbsp;&nbsp;';
            return str;
         });
         strs = strs.replace(/(<\s*p[^>]*>)|(<\s*\/p\s*>)/gi, '')
            // /(<\s*span[^>]*>)\s*((\S+\s*\S+)|(\S+)|(&nbsp;)*)\s*<\s*\/span\s*>/gi
            //<span xx>万达啥都..</span> 替换为 万达啥都..
         strs = strs.replace(/(<\s*span[^>]*>)|(<\s*\/span\s*>)/gi, function(str, $1, $2) {
            //清空所有<span>的开始和结束标签
            return '';
         });
         strs = strs.replace(/(\(\s*\))|(（\s*）)/g, function(tex) {
            //空值括号内充空格
            return '（&nbsp;&nbsp;&nbsp;&nbsp;）'; //the strings length 8*space
         });

         /**
          * 格式刷处理<img>标签中图像后面ID带有数字的问题
          * modify by ZhangH 2018-3-7
          */
         var tmpEl = $('<div>' + strs + '</div>');
         var imgSrcArr = [];
         var imgSrcIdx = 0;
         var getImgSrc = function(els) {
            for (var i = 0; i < els.children().length; i++) {
               if ($(els.children(':eq(' + i + ')')).children().length > 0) {
                  getImgSrc($(els.children(':eq(' + i + ')')));
               } else {
                  if (els.children(':eq(' + i + ')')[0].tagName === 'IMG') {
                     imgSrcArr.push(els.children(':eq(' + i + ')').attr('src'));
                     els.children(':eq(' + i + ')').attr('src', '');
                  }
               }
            }
         }
         var setImgSrc = function(els) {
            for (var i = 0; i < els.children().length; i++) {
               if ($(els.children(':eq(' + i + ')')).children().length > 0) {
                  getImgSrc($(els.children(':eq(' + i + ')')));
               } else {
                  if (els.children(':eq(' + i + ')')[0].tagName === 'IMG') {
                     els.children(':eq(' + i + ')').attr('src', imgSrcArr[imgSrcIdx]);
                     imgSrcIdx++;
                  }
               }
            }
         }
         getImgSrc(tmpEl);
         strs = tmpEl.html();

         if (opt.cleanFormat.thousands == true) {
            //\d{4,}\B[^年]   -  \b\d{3,}.[元万亿]
            //(((\d*(\.)?)\d{3,}))(?=((\s|(&nbsp;))*(亿|元|万)))
            // strs = strs.replace(/(((\d+(\s|,|\d)*(\.)?)\d*))(?=((\s|(&nbsp;))*(亿|元|万)))/g,
            //     function(str, index, stringsObj) { //数字千分位化  处理模型 222.222
            //         var gsNumb = str.replace(/\s*/g, '');
            //         var matchNumber = parseInt(gsNumb);
            //         if (str.indexOf('.') > -1) {
            //             matchNumber = parseFloat(gsNumb);
            //         }
            //         return obj.formatCash(matchNumber);
            //     });
            /****************************************************************************************************************************************
             * DBP-980: 格式刷,现在只有后面有“元”字的数字才刷千分位空格，应该是只有年份的才不刷，其他都要刷
             * by ZhangH 2018-1-25
             ****************************************************************************************************************************************/
            // strs = strs.replace(/(\d)(?=(?:\d{3})+$)/g, '$& ');
            // strs = strs.replace(/\d{1,3}(?=(\d{3})([^年])(\S))/g, '$& ');
            // strs = strs.replace(/\.\d+\s+/, '$&_');
            // strs = strs.replace(/\s+\_/g, '');                

            var numberDivision = function(strVal, division, rep) {
               var isNaNCnt = 0;
               var strNew = '';
               for (var i = strVal.length - 1; i > -1; i--) {
                  strNew = strVal[i] + strNew;
                  if (!isNaN(parseFloat(strVal[i]))) {
                     isNaNCnt++;
                     if (isNaNCnt % 3 === 0) {
                        strNew = ' ' + strNew;
                     }
                  } else {
                     if (isNaNCnt === 3) {
                        var tmpStr = strNew.substr(0, 2).replace(/\s/, '');
                        strNew = tmpStr + strNew.substr(2, strNew.length - 1);
                     }
                     isNaNCnt = 0;
                  }
               }
               var spArr = strNew.split('.');
               for (var i = 1; i < spArr.length; i++) {
                  var tmSp = spArr[i].replace(/[^\d|^\s]/g, '|');
                  var tmSpI = tmSp.indexOf('|');
                  if (tmSpI < 0) {
                     spArr[i] = tmSp.replace(/\s/g, '');
                     continue;
                  } else {
                     tmSp = spArr[i].substr(0, tmSpI).replace(/\s/g, '');
                  }
                  spArr[i] = tmSp + spArr[i].substr(tmSpI, spArr[i].length);
               }
               strNew = spArr.join('.');
               return strNew;
            }
            strs = numberDivision(strs);
            strs = strs.replace(/\.\d+\s+/, '$&_').replace(/(\s+)(?=\d{3}(年))/g, '$&_').replace(/\s+\_/g, '');
         }
         tmpEl = $('<div>' + strs + '</div>');
         setImgSrc(tmpEl);
         strs = tmpEl.html();
         // 如果是判断题，自动识别最后的。后是否有括号，如有，则不管，如无，则自动加上括号（括号全角，中间是8个半角空格）
         if (opt.itemTypeId === '3' && settings.key !== 'answerAnalyze') {
            if (!strs.match(/（[^）]*）$/gm)) {
               strs = strs.replace(/$/g, '（&nbsp;&nbsp;&nbsp;&nbsp;）</p>');
            }
         }
         /****************************************************************************************************************************************
          * 格式刷禁止刷新公式
          */
         var $tmpElem = $('<div></div>');
         $tmpElem.html(strs);
         $tmpElem.find('div[mathquill="pnlMathquill"]').each(function(idx, item) {
            $(item).html($mathquills[idx].outerHTML);
         });
         $tmpElem.find('span.mathquill-rendered-math, table.borrow-lend-format-brush, table.tbl-accountancy').unwrap('<div>');
         strs = $tmpElem[0].innerHTML;
         /***************************************************************************************************************************************/

         /***************************************************************************************************************************************
          * JIRA: DBP-1040 财政部：格式刷：不定项选择题大题题干，如果是多段落，第二个段落需要缩进
          * by ZhangH 2018-1-25
          */
         if ([5, 6, 7, 9, 10].indexOf(parseInt(opt.itemTypeId)) >= 0 && settings.key === 'contentUE') {
            strs = strs.replace(/(<br>    )+/g, '<br>');
            strs = strs.replace(/<strong>要求(:|：)<\/strong>/g, '要求$1');
            strs = strs.replace(/(已知|要求)(:|：)/g, '<br>$1$2');
            strs = strs.replace(/要求(:|：)/g, '<strong>要求$1</strong>');
         }
         /***************************************************************************************************************************************/

         /***************************************************************************************************************************************
          * JIRA: DBP-1071 财政部：格式刷：去掉否定词加粗
          * by ZhangH 2018-1-26
          */
         // strs = strs.replace(/不要/g, '<b>不要</b>');
         /***************************************************************************************************************************************/

         strs = strs.replace('<p></p>', '');
         strs = strs.replace(/(<p>){1,}|(<\/p>){1,}/g, '');
         strs = strs.replace(/><br\/>(&ensp;|&emsp;|&nbsp;)+<\/td>/g, '></td>');
         strs = strs.replace(/>(<br>|<br\/>)+<\/td>/g, '></td>');

         if ([5, 6, 7, 9, 10].indexOf(parseInt(opt.itemTypeId)) >= 0 && settings.key === 'contentUE') {
            strs = strs.replace(/(<br>){1,}|(<br\/>){1,}/g, '<br>&nbsp;&nbsp;');
         }
         // modify by 田颍瑶（TYY）添加
         // strs = strs.replace(/(.*)<br>/, '$1');
         obj.textFormat = strs;
         opt.callback({
            cName: 'formatOver',
            str: obj.textFormat
         });
         return this;
      },
      performance: function() { //执行
         // var opt = obj.options;
         obj.performanceFormat().perfomanceReplace();
      },
      formatCash: function(str) { //格式化 1000=>1 000 , 1000000.86=>1 000 000.86
         var arr = [],
            counter = 0,
            unit = '', //单位
            pointLast = ''; //xx.xxx小数及后缀数字
         str = str.toString();
         if (str.indexOf('.') > -1) {
            pointLast = '.' + str.split('.')[1];
            str = str.split('.')[0];
         }
         str = (str || 0).toString().split("");
         for (var i = str.length - 1; i >= 0; i--) {
            counter++;
            arr.unshift(str[i]);
            if (!(counter % 3) && i !== 0) {
               //if(arr.length==3){}
               arr.unshift(" ");
            }
         };
         return arr.join("") + pointLast;
      }
   };
   return obj;
}
//答案解析

function isSlideAnalyze(obj, tarEle) {
   if ($(obj).find('.slide-icon').hasClass('toright')) {
      $(obj).find('.slide-icon').removeClass('toright');
      $(tarEle).slideDown('slow');
      $(obj).find('.slide-icon').parents('.qst-stem').css('border-bottom', 'none')
      if (tarEle === '#optionBox') $('.floatLwidth').css('display', 'none')
   } else {
      $(obj).find('.slide-icon').addClass('toright');
      $(tarEle).slideUp('slow');
      if ((gUrlParam && gUrlParam.itemTypeId && gUrlParam.itemTypeId !== '7')) $(obj).find('.slide-icon').parents('.qst-stem').css('border-bottom', '1px solid #ccc')
      if (tarEle === '#optionBox') $('.floatLwidth').css('display', 'block')
   }
}

function creatMenuListButton(settings) { //menu 菜单创建
   var obj = {
      options: {
         importData: null, //导入数据
         box: null, //插入box
         matrixHasHref: true, //针对包含children的是否允许点击,允许默认第一个href
         attrName: {
            title: 'title',
            src: 'src',
            children: 'children'
         },
         callback: function() {}
      },
      init: function() {
         obj.extendOptions().eachData().bindEvent();
      },
      extendOptions: function() {
         obj.options = $.extend(true, obj.options, settings, true);
         return this;
      },
      eachData: function() {
         var opt = obj.options,
            doms = '';
         for (var i = 0; i < opt.importData.length; i++) {
            doms += obj.creatOnce(opt.importData[i]);
         }
         opt.box.html('<ul class="farUl">' + doms + '</ul>');
         return this;
      },
      creatOnce: function(data) {
         var opt = obj.options,
            atrn = opt.attrName,
            child = data[atrn.children],
            arrow = '', //有子项给与class方便样式
            dom = '',
            farHref = data[atrn.src];
         if (child.length > 0) {
            arrow = ' arrow';
            dom += '<ul>';
            for (var i = 0; i < child.length; i++) {
               dom += '<li><a class="sonBtn js-sonBtn" data-href="' + child[i][atrn.src] + '" href="javascript:;">' + child[i][atrn.title] + '</a></li>';
            }
            dom += '</ul>';
            if (opt.matrixHasHref == false) { //包含子项,母钮是否允许点击
               farHref = 'javascript:;';
            }
         }
         //▼▲
         dom = '<a class="maxtBtn' + arrow + ' js-maxtBtn" data-href="' + farHref + '" href="javascript:;">' +
            data[atrn.title] +
            '<i>▼</i>' +
            '</a>' + dom;
         return '<li>' + dom + '</li>';
      },
      bindEvent: function() {
         var opt = obj.options,
            box = opt.box,
            oneLI = box.find(".farUl li");
         oneLI.off('mouseenter').on('mouseenter', function() {
            $(this).find(".js-maxtBtn").addClass('hover').find('i').text('▲');
            if ($(this).find("ul").length > 0) { //包含子题项的
               $(this).find("ul").addClass('view');
            }
         });
         oneLI.off('mouseleave').on('mouseleave', function() {
            $(this).find(".js-maxtBtn").removeClass('hover').find('i').text('▼');
            if ($(this).find("ul").length > 0) { //包含子题项的
               $(this).find("ul").removeClass('view');
            }
         });
         oneLI.find(".js-sonBtn").off('click').on('click', function() {
            $(this).closest("ul").removeClass('view')
               .siblings(".js-maxtBtn").removeClass('hover').find('i').text('▼');
            opt.callback({
               cName: 'click',
               href: $(this).attr('data-href'),
               obj: $(this)
            });
         });
         oneLI.find(".js-maxtBtn").off('click').on('click', function() {
            $(this).siblings("ul").removeClass('view');
            $(this).removeClass('hover').find('i').text('▼');
            opt.callback({
               cName: 'click',
               href: $(this).attr('data-href'),
               obj: $(this)
            });
         });
      }
   };
   return obj;
}

function commonMouseenterDownList(elmJson) { //用户 下拉
   var box = elmJson.box;
   box.on({
      mouseenter: function() {
         $(this).find(".js-downlist").addClass('view');
         if (typeof(elmJson.fn) == 'function') {
            elmJson.fn({
               cName: 'mouseenter',
               obj: $(this)
            });
         }
      },
      mouseleave: function() {
         $(this).find(".js-downlist").removeClass('view');
         if (typeof(elmJson.fn) == 'function') {
            elmJson.fn({
               cName: 'mouseleave',
               obj: $(this)
            });
         }
      }
   })
   box.find("a").on('click', function() {
      $(this).closest('.js-downlist').removeClass('view');
      if (typeof(elmJson.fn) == 'function') {
         elmJson.fn({
            cName: 'click',
            obj: $(this)
         });
      }
   });
}

var sgPageParam = {
   igt: window.top.pageParam, //设置处理对象
   set: function(json) { //页面交互参存储、控制
      if (typeof(json) !== 'undefined' && json !== null) {
         if (typeof(json) == 'object' && Object.prototype.toString.call(json).toLowerCase() == "[object object]" && !json.length) {
            this.igt = $.extend(true, this.igt, json, false);
            sessionStorage.setItem("bambooPageParam", JSON.stringify(this.igt));
         }
      }
   },
   get: function(arr) { //获取页面交互参
      if (typeof(arr) == 'object') {
         var robj = {};
         for (var i = 0; i < arr.length; i++) {
            for (var g in this.igt) {
               if (arr[i] == g) {
                  robj[g] = this.igt[g];
               }
            }
         };
         return robj;
      }
   }
}