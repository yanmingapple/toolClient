//center controller document
var reqSERVICE = "/apps/appSrvRequest.do",
    uploadSERVICE = "/fileupload/upload.do",
    downloadSERVICE = "/fileDown/down.do",
    savePreviewSERVICE = "/preview/previewItem.do",
    previewSERVICE = "/preview/previewHtmlContent.do",
    paperPreviewSERVICE = "/preview/obt/nets/previewPaperHtmlContent.do",
    paperTmplPreviewSERVICE = "/preview/obt/nets/previewPaperTmplHtmlContent.do",
    //新增
    loginsSERVICE = "/user/login.do",
    previewFileService = "/fileDown/open.do",
    fneVar = { //front end 前端变量
        controller: { //逻辑控制器
            viewLog: true, //打印是否显示 管理 _$log()
            menuNoCreazy: true, //避免左侧主菜单被高频点击
            menuNorraw: 0, //左侧主菜单收缩状态
            requesCodeArr: [], //请求列队request function触发, bizCode将被推进此
            baseAlert: true, //弹框控制（避免同时多次弹窗）
            backHistory: true, //限制回退最大到wecome页
            kendoTreeArr: [], //用于记录kendoTreeView组件列项展开关闭
            baseIMG: { //通用图片路径
                imgA: "../images/component/",
            }
        }
    },
    iJson = { //请求格式
        "reqDate": '',
        "bizCode": "",
        "termType": "PCB",
        "pageSize": 10,
        "page": 0,
        "reqSsn": '', //流水号
        "sign": '',
        "userId": "9968",
        "version": "1.0",
        "paramObj": {},
        "version": "1.0"
    },
    pageParam = { //页面涉及的传参配置信息
        //项目建立时可在此处提前命名好key值, 并附上标注最佳
        //可使用 sgPageParam.set()、sgPageParam.get()进行存储及获取数据,取代之前的url传参方式
        //每次数据变化都会存储到sessionStorge.getItem('bambooPageParam')
        taskId: null,
        pid: null,
        id: null
    };

//window.top.fneVar.controller.backHistory=true;  //所有页面ini抛出