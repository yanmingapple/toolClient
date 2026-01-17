export default [
  { code: "000000", name: "login", url: "/user/login.do" }, // 登录
  // { code: '000000', name: 'logout', url: '/user/logout.do' }, // 退出
  { code: "000000", name: "logout", url: "/user/logout2.do" }, // 退出
  { code: "000000", name: "getIndexStatus", url: "/es/getIndexStatus.do" }, // 获取更新索引状态
  { code: "000000", name: "initIk", url: "/es/initIk.do" }, // 初始化索引
  { code: "000000", name: "itemsIn", url: "/index/itemsIn.do" }, // 更新索引
  {
    code: "000000",
    name: "getSystemInfo",
    url: "/system/version.do",
  }, // 获取系统信息
  {
    code: "000000",
    name: "uploadFile",
    url: "/fileupload/upload.do",
  }, // 上传文件
  {
    code: "000000",
    name: "uploadItemFile",
    url: "/fileupload/excelitemin.do",
  }, // 上传文件
  { code: "000000", name: "getPaperDetailUnLogin", type: 'get', url: '/queryPaperStructure/queryPaper.do' }, //获取试卷详情
  
  { code: "00001224", name: "getCheckCode" }, // 登录获取短信验证码
  { code: "00001225", name: "postCheckCode" }, // 提交短信验证码
  { code: "00010060", name: "getSubjects" }, // 获取当前用户有权限的有效的科目列表
  { code: "00000122", name: "getItemTypes" }, // 获取当前科目的题型列表
  { code: "02110001", name: "getMenuList" }, // 获取菜单列表(当前用户的)
  { code: "02110002", name: "getDatabaseBankList" }, // 获取数据备份列表

  { code: "00001511", name: "getAllMenuList" }, // 获取菜单列表(所有的)
  { code: "00001512", name: "saveUserRoleMenu" }, // 修改用户菜单权限

  { code: "22110041", name: "getWorkbenchRightInfo" }, // 获取工作台右侧数据
  { code: "00001407", name: "getUserInfo" }, // 获取用户信息
  { code: "01010300", name: "getWorkbenchInfo" }, // 用户登录后，获取工作台的相关数据，包括活动的信息、项目统计、活动统计和题库统计,
  { code: "01110125", name: "getPaperOfPosition" }, //审验、审校活动 中 获取试卷当前位置，试卷总数等

  { code: "00001643", name: "delRole" }, //删除角色
  { code: "00001644", name: "editRole" }, //编辑角色
  { code: "00001645", name: "getRoleList" }, //获取角色列表
  { code: "00001646", name: "addRoleUser" }, //添加角色列表
  { code: "00001647", name: "removeRoleUser" }, //移除角色中的用户

  { code: "09010007", name: "checkLoginVaild" }, //用户登录验证
  { code: "00001222", name: "getUserList" }, //获取用户列表
  { code: "09010006", name: "deleUser" }, //删除用户
  { code: "09010002", name: "showUserDetail" }, //获取用户信息
  { code: "09010003", name: "createUser" }, //新建用户
  { code: "09010004", name: "modifyUser" }, //修改用户
  { code: "00030033", name: "restoreUser" }, // 还原用户

  { code: "00000011", name: "creSubject" }, //新增subject
  { code: "00000014", name: "delSubject" }, //删除subject
  { code: "00000013", name: "edtSubject" }, //更新subject
  { code: "00000012", name: "getSubjectList" }, //获取subject信息列表
  { code: "00000016", name: "setSubjectSort" }, //subject列表排序设置
  { code: "11110008", name: "modifyItemType" }, //新增或修改subject题型
  { code: "11110007", name: "delItemType" }, //删除subject题型
  { code: "11110006", name: "getItemTypeList" }, //查询subject题型
  { code: "00001195", name: "getBaseItemTypeList" }, //查询基础题型
  { code: "00000045", name: "getPaperMixList" }, //试卷结构列表
  { code: "00000046", name: "addPaperMix" }, //新增试卷结构
  { code: "00000047", name: "delPaperMix" }, //删除试卷结构
  { code: "00000048", name: "getPaperMixDetailList" }, //试卷结构模板列表
  { code: "00000049", name: "addPaperMixDetail" }, //新增或修改试卷结构模板配置
  { code: "00000051", name: "movePaperMixNode" }, //上下移动节点
  { code: "00000050", name: "delPaperMixDetail" }, //删除试卷结构
  { code: "00800003", name: "setPaperTmp" }, //设置试卷抽题模板
  { code: "00800001", name: "getPaperTmp" }, //获取试卷抽题模板
  { code: "22110000", name: "addOrEditMoreProps" }, //新增/修改试题扩展属性
  { code: "22110001", name: "deleMoreProps" }, //删除试题扩展属性
  { code: "22110002", name: "getMorePropsList" }, //查询试题扩展属性
  { code: "22110022", name: "getAbilityLevelList" }, //查询科目试题能力层次
  { code: "22110020", name: "addOrEditAbilityLevel" }, //新增或者修改能力层次
  { code: "22110021", name: "delAbilityLevel" }, //删除能力层次
  { code: "00001407", name: "getUserInfo" }, //获取登录用户信息
  { code: "01010319", name: "getActInfo" }, //获取活动信息
  { code: "00000058", name: "addPaperComposeType" }, //新增试卷排版
  { code: "00000059", name: "delePaperComposeType" }, //删除试卷排版
  { code: "00000057", name: "getPaperComposeType" }, //查询试卷排版
  { code: "00000060", name: "getPaperMixinfo" }, //查询试卷结构节点信息
  { code: "00000061", name: "moveUpOrDown" }, //试卷排版节点上下移
  { code: "00000063", name: "upOrDownGrade" }, //试卷排版节点升降级
  { code: "00000064", name: "copyWithChildren" }, //试卷排版节点升降级
  { code: "22110036", name: "forbiddenWords" }, //禁用词
  { code: "22110037", name: "addOrEditForbiddenWords" }, //新增/修改禁用词
  { code: "22110038", name: "deleteForbiddenWords" }, //删除禁用词
  { code: "22110039", name: "queryForbiddenWordList" }, //查询所有科目禁用词列表
  { code: "00000017", name: "getAllUseableSubjectList" }, //
  { code: "00001225", name: "postCkCode" }, //提交登录验证码
  { code: "11110010", name: "getOldComposeModel" }, //获取旧版本的组卷蓝图
  { code: "00800004", name: "setNewComposePlan" }, //设置新版本的组卷蓝图
  { code: "00800006", name: "getNewComposePlanList" }, //获取新版本的组卷模板列表
  { code: "00800007", name: "deleComposeModel" }, //删除组卷蓝图模板
  { code: "00000154", name: "getNewPaperStructure" }, //获取新版本的组卷蓝图模板（详情）
  { code: "00800005", name: "getNewComposeModelDetail" }, //获取新版本的组卷蓝图模板（详情）
  { code: "00010011", name: "editQuestionBySubject" }, // 编辑科目试题
  { code: "00010110", name: "getFailList" }, // 试题批量导入确认导入
  { code: "00010109", name: "uploadConfirm" }, //试题批量导入确认导入
  { code: "01110306", name: "getAssignPlanList" }, //获取命题蓝图模板列表
  { code: "01110307", name: "addAssignModel" }, //新增命题蓝图模板
  { code: "01110311", name: "copyAssignModel" }, //复制命题蓝图模板
  { code: "01110310", name: "deleAssignModel" }, //删除命题蓝图模板
  { code: "01110309", name: "editAssignModelInfo" }, //编辑命题蓝图模板详情
  { code: "01010323", name: "getAssignModelInfo" }, // 获取命题蓝图模板详情
  { code: "00010073", name: "getKonwledgeModel" }, //在命题蓝图模板中获取知识模型列表
  { code: "00010077", name: "getTestPointList" }, //在命题蓝图模板中获取考点
  { code: "11111111", name: "getLogAuditList" }, //获取日志审计列表
  { code: "00001509", name: "saveOrUpdateMenu" }, //新增或更新菜单
  { code: "00001513", name: "moveMenu" }, //移动菜单
  { code: "00001510", name: "delMenu" }, //删除菜单
  { code: "00001421", name: "getcapacityConfigList" }, //获取功能管理列表
  { code: "00001425", name: "relateFuncAndPermiss" }, //功能绑定权限
  { code: "00001426", name: "saveOrUpdateCapacity" }, //新增或更新功能管理菜单
  { code: "00001423", name: "removeCapacityNode" }, //删除功能节点
  { code: "00001514", name: "moveCapacitiyNode" }, //上下移动功能节点
  { code: "00001508", name: "getPremissList" }, //获取权限列表
  { code: "00001506", name: "addNewPermission" }, //新增和修改权限
  { code: "00001507", name: "deletePermission" }, //删除权限
  { code: "00010201", name: "delePerson" }, // 专家库中删除专家
  { code: "00010200", name: "getTeacherList" }, //获取专家库列表
  { code: "00010300", name: "getPositionList" }, //获取职务信息
  { code: "00011103", name: "userList" }, //关联用户列表
  { code: "00011101", name: "relateUser" }, //关联用户
  { code: "00011102", name: "removeRelateUser" }, //移除关联用户
  { code: "00011110", name: "getAreaList" }, //获取省市列表
  { code: "00020002", name: "getSpecialPicUrls" }, //获取专家的照片信息
  { code: "00010202", name: "submitPersonInfo" }, //提交专家信息
  { code: "00010203", name: "getUnitList" }, //获取所属单位列表
  { code: "01010301", name: "ApiGetProjectList" }, //项目列表-获取项目数据
  { code: "00030001", name: "resetUserPsw" }, // 重置密码
  { code: "09010008", name: "updatePassword" }, // 菜单栏修改密码
  // {code:'21110001',name: 'ApiGetProjectTypeList'},//项目列表---获取项目类型列表
  { code: "01010326", name: "ApiGetOperUser" }, //项目列表---获取项目 责任人列表
  { code: "01010324", name: "ApiEditProject" }, //项目列表---新增或修改项目
  { code: "01010325", name: "ApiDelProject" }, //项目列表---删除项目
  { code: "22110026", name: "addWebMessage" }, //新增站内消息
  { code: "22110028", name: "getWebMessageList" }, //获取站内消息列表
  { code: "22110027", name: "deleWebMessage" }, //删除站内消息
  { code: "22110029", name: "getWebMessageInfo" }, //获取一条通知详情
  { code: "22110030", name: "getPublishMsg" }, //通知中心获取通知列表
  { code: "22110031", name: "getPublishMsgCount" }, //分页查询当前登录用户未阅读过的通知的数量（心跳监测暂时也可以用这个接口）
  { code: "22110025", name: "readMsg" }, //通知已读记录
  { code: "22110032", name: "redoMsg" }, //撤销通知
  { code: "11010002", name: "createKnowlegePoint" }, //创建知识版本和修改知识版本
  { code: "00010059", name: "getKnowledgePointVer" }, // 根据所属科目，获取知识点版本
  { code: "11010004", name: "deleteKnowlegePoint" }, // 删除知识版本
  { code: "11010001", name: "setDefaultVersion" }, // 设置默认版本
  { code: "00010006", name: "getKnowledgePoint" }, //根据所属科目，获取知识点列表
  { code: "00010119", name: "getKnowledgePointTree" }, //根据所属科目，获取知识点层级结构树
  { code: "11010003", name: "delkonwledgeTreeNode" }, //删除知识点树节点
  { code: "11010000", name: "modifyKnowledgeTree" }, // 添加/修改知识模型树节点数据
  { code: "11010006", name: "copyKnowledgeTreeNode" }, // 复制知识模型树子节点
  { code: "11010005", name: "sortKnowledgePointTree" }, // 知识点模型树排序（上下移）
  { code: "11010007", name: "changeNodeLevel" }, //知识点升降级
  { code: "00010069", name: "addOrModifyModelTree" }, // 修改知识模型树节点数据
  { code: "00010085", name: "resetModelTree" }, //重置知识模型数据，慎点
  { code: "00010086", name: "opreateUbjectUser" }, //操作科目用户权限

  { code: "00010075", name: "delModelTreeNode" }, //删除知识模型树节点
  { code: "00010080", name: "sortModelTree" }, //知识点模型树排序
  { code: "00010079", name: "copyModelTreeNode" }, //复制知识模型树节点
  { code: "00010078", name: "delModelPoints" }, //删除知识模型下的考点
  { code: "01010330", name: "getActivitys" }, //活动列表-查询活动列表
  { code: "01010302", name: "ApiGetActivityList" }, //活动列表详情数据
  { code: "01010322", name: "ApiDelActivity" }, //活动列表-删除接口
  { code: "01010320", name: "ApiEditActivity" }, //活动列表-新增或修改活动
  { code: "09010001", name: "getActivityUsers" }, //获取活动负责人列表
  { code: "00003307", name: "repeatItemList" }, //获取重复试题展示数据
  { code: "00003309", name: "removeRepeatItemList" }, //删除 重复试题页面的数据
  { code: "00020001", name: "getActData" }, //
  { code: "00100118", name: "getSubjectItemList" }, //试题-试题文件夹-获取可用科目列表
  { code: "00010071", name: "ApiAddOrModifyPointTree" }, //添加或修改知识点下的考点数据
  { code: "00011001", name: "getDataReportList" }, // 考后分析数据获取
  { code: "00011002", name: "addDataReport" }, // 新增考后分析考试
  { code: "00011015", name: "deleteDataReport" }, // 删除考后分析考试
  { code: "00003308", name: "clearRepeatItem" }, //重题管理-清空数据分析
  { code: "00003309", name: "deleteReapeatItem" }, //重题管理-删除数据
  { code: "00003305", name: "swithItemCompare" }, // 重题管理 - 试题详情比对 - 重题详情试题基础信息
  { code: "00010056", name: "getLinkQuestionList" }, // 重题管理 - 试题详情比对 - 关联试题
  { code: "00003306", name: "delQuestion" }, // 重题管理 - 试题详情比对 - 删除试题
  { code: "00010035", name: "moveChildQuestionPosition" }, // 重题管理 - 试题详情比对 - 移动小题位置

  { code: "00010043", name: "ApiGetFolderList" }, //试题统计-获取试题文件夹列表信息
  { code: "11010023", name: "startOrStopFloder" }, // 试题文件夹---启用或者禁用文件夹
  { code: "00010041", name: "saveOrUpdateItemsFolder" }, //新建试题文件夹或修改文件夹(试题)
  { code: "00010042", name: "deleteItemFolder" }, //删除试题文件夹
  { code: "11010020", name: "setFolderUser" }, //授权用户
  { code: "00010062", name: "getPaperFolderList" }, //获取试卷文件夹列表
  { code: "00010061", name: "saveOrUpdatePaperFolder" }, // 新建试卷文件夹或修改文件夹(试卷)
  { code: "00010064", name: "deletePaperFolder" }, //删除试卷文件夹
  { code: "00800102", name: "tableInfos" }, //获取所有试题统计表格数据信息
  { code: "00011003", name: "getPaperPackageList" }, //考后分析试卷包列表
  { code: "00011006", name: "paperPackageList" }, //考后分析-试卷包-选择试卷包 列表
  { code: "00011005", name: "removePaperPackage" }, //考后分析-试卷包-移除
  { code: "11110012", name: "queryEvaluationList" }, //获取搜索列表的审核状态列表
  { code: "00008113", name: "qryPaperGradeAnalysis" }, //试卷分析结果
  { code: "00011007", name: "getSubjectBatchs" }, //试题分析获取科目批次
  { code: "00008114", name: "getQuestionReport" }, //获取试题分析报表
  { code: "01010306", name: "delAssignPlanRow" }, //命题-命题计划-删除数据
  { code: "01110305", name: "hasKnowModelOfSubject" }, //命题-命题计划-当前课程是否有知识模型
  { code: "01010304", name: "addAssignPlanRow" }, //命题-命题计划-新增计划
  { code: "01010305", name: "editAssignPlanRow" }, //命题-命题计划-修改计划
  { code: "01010202", name: "delAssignPlanRowOfXs" }, //命题-命题计划-删除计划（详述）
  { code: "00010070", name: "queryPaperLibrary" }, //卷库管理：整库试卷条件搜索
  { code: "01010201", name: "editAssignPlanRowOfXs" }, //命题-命题计划-修改计划（详述）

  { code: "00300005", name: "getAssignTaskList" }, //命题-命题任务-任务列表
  { code: "01010308", name: "getUserListOfCreateAssignTask" }, //命题-命题任务-创建任务选择用户列表
  { code: "01010299", name: "getSubjectInfo" }, //命题-命题任务-创建任务查询subject信息
  { code: "01010309", name: "createAssignTask" }, //命题-命题任务-创建任务提交
  { code: "01010303", name: "getAssignPlanListOfTask" }, //命题-命题任务-获取蓝图列表
  { code: "01010311", name: "delAssignTask" }, //命题-命题任务-获取蓝图列表
  { code: "01110110", name: "getResponsibleUserList" }, //命题-命题任务-获取责任人列表
  { code: "00300008", name: "closeAssignTask" }, //命题-命题任务-关闭任务
  { code: "00011033", name: "getItemsInfoOfAssignTask" }, //命题-命题任务-获取已命试题信息
  { code: "00300009", name: "openAssignTask" }, //命题-命题任务-重启任务
  { code: "00010002", name: "delItemOfAssignTask" }, //命题-命题任务-删除试题
  { code: "00010112", name: "getCreaterOfActQuestion" }, //命题-试题-命题人列表
  { code: "00010032", name: "getQuestionList" }, //命题-试题-试题列表
  { code: "00010031", name: "getQuestionListOfParams" }, //命题-试题-试题列表（条件搜索）
  { code: "00010004", name: "getQuestionInfo" }, //命题-试题-试题详情
  { code: "00000121", name: "getNearQuestionInfo" }, //命题-试题-试题详情 - 上一题，下一题
  { code: "00010033", name: "getItemEditRecord" }, //命题-试题-试题详情 - 修改记录
  { code: "00010025", name: "itemIsLocked" }, //命题-试题-试题详情 - 检查试题是否处于锁定状态
  { code: "01010298", name: "getAssignActiveTally" }, //命题-试题-统计 - 表格数据
  { code: "01110109", name: "userMoveOut" }, //命题-活动设置 - 用户移出
  //   01120111 接口调整
  //          原业务传参不变，新业务只补充传参数isLoginFlag即可；
  // 参数：
  //     actvityId 【必传】
  //     isLoginFlag  【非必传】 传值Y即表示，查询当前活动中当前登录账户的活动角色，管理员角色返回为责任人角色
  { code: "01120111", name: "getActivityRoleList" }, //获取活动用户角色，后台缓存数据
  { code: "01010329", name: "editRoles" }, //命题-活动设置 - 用户-编辑角色
  { code: "01110111", name: "userListOfAddtoAct" }, //命题-活动设置 - 用户 - 添加用户获取用户列表
  { code: "01110108", name: "addUserToAct" }, //命题-活动设置 - 用户 - 添加用户到活动中
  { code: "00010052", name: "getActListOfLink" }, //命题-活动设置 - 用户 - 关联的活动选择列表
  { code: "00030002", name: "closeTaskMul" }, // 命题活动-命题任务-批量关闭任务
  { code: "00030003", name: "openTaskMul" }, // 命题活动-命题任务-批量重启任务
  { code: "99999900", name: "getQuestionListOfAssembly" }, //组卷活动-试题列表
  { code: "00000102", name: "getPaperOfAct" }, //组卷活动-获取试卷列表
  { code: "00000155", name: "getPaperOfActNoPage" }, //组卷活动-获取试卷列表没有分页
  { code: "01110112", name: "moveoutItems" }, //组卷活动-试题移除活动
  { code: "00000120", name: "getQuestionInfoOfAssembly" }, //组卷活动-试题详情
  { code: "01110103", name: "addQuestionToAct" }, //组卷活动-选择试题加入活动
  { code: "00010050", name: "getProposers" }, //查询操作人列表
  { code: "00010051", name: "getPaperList" }, //试卷分页表
  { code: "00010053", name: "getTaskList" }, //获取任务列表
  { code: "00010054", name: "unlockQutions" }, //解锁试题 
  { code: "00010041", name: "addQuetionsFolder" }, //新建试题文件夹
  { code: "00010045", name: "bindQuetionsToFolder" }, //绑定试题到文件夹
  { code: "00010063", name: "bindPapersToFolder" }, //绑定试卷到文件夹
  { code: "00010044", name: "getCompoundQuetionsById" }, //查询试题详情 综合题

  /** 查询试题详情（新接口）
   * code:11110013
   * params{
   * type：请求类型： type值为edit时表示页面用于编辑试题时的查询
   * itemId：试题编号
   * otherData ：字符串
   * 查询其他相关信息标识，传值时以英文逗号","隔开;
     传值参数标识有：
      subject 表示查询科目集合
      subjectItemType 表示查询科目对应的科目题型集合
      subjectItemTypeAttr  表示查询科目的扩展属性集合
      abilityLevel  表示查询科目的能力层次集合
      examSyllabus  表示查询科目对应的知识点版本集合（不含知识点）
      tnetPaperStructTmpl  表示查询科目的试卷结构模板集合
      tnetPaperTypesettingTmp  表示查询科目的试卷排版模板集合
      auditDescs亩核记录existFolderItems 试题相关联的文件夹名称
      existItemPapers 试题相关联的试卷名称
      associatedctivities 试题进入相关活动
      itemTask 试题进入相关任务
      forbiddenWord 科目中的禁用词
      associationItem 关联试颗
   * }
   */
  { code: "11110013", name: "getQuestionDetail" }, //查询题型详情，编辑试题使用

  /**根据登录用户查询权限内可见的科目列表（新接口）
   * code:00010114
   * subjectId :科目Id ,传值时查指定科目，不传时，则查询全部科目信息;
   * otherData:'subjectItemType,subjectItemTypeAttr,abilityLevel,examSyllabus'
   * 查询其他相关信息标识，传值时以英文逗号","隔开;
     传值参数标识有：
      subjectItemType 表示查询科目对应的科目题型集合
      subjectItemTypeAttr  表示查询科目的扩展属性集合
      abilityLevel  表示查询科目的能力层次集合
      examSyllabus  表示查询科目对应的知识点版本集合（不含知识点）
      tnetPaperStructTmpl  表示查询科目的试卷结构模板集合
      tnetPaperTypesettingTmp  表示查询科目的试卷排版模板集合
      auditDescs亩核记录existFolderItems 试题相关联的文件夹名称
      existItemPapers 试题相关联的试卷名称
      associatedctivities 试题进入相关活动
      itemTask 试题进入相关任务
      forbiddenWord 科目中的禁用词
      associationItem 关联试颗
   */
  { code: "00010114", name: "getSubjectAboutData" },

  { code: "00010008", name: "addOrEditQuetion" }, //新增/编辑试题
  { code: "00010057", name: "copyQuestion" }, //复制试题
  { code: "00010067", name: "getFolderByQuetionId" }, //查询试题已加入文件夹
  { code: "00010049", name: "delFolderByQuetionId" }, //试题从文件夹移出
  { code: "00010089", name: "getActivityByQuetionId" }, //查询试题已加入活动
  { code: "11110011", name: "getAuditRecord" }, //审核记录查询
  { code: "00010055", name: "bindQuetions" }, //关联试题
  { code: "00010082", name: "getQuestionUsedList" }, //获取试题使用日志
  { code: "00010058", name: "delQuestionRelationships" }, //删除试题关联关系
  { code: "00000101", name: "addPaper" }, //组卷活动-新增试卷
  { code: "00000103", name: "editPaper" }, //组卷活动-修改试卷
  { code: "00000108", name: "delPaper" }, //组卷活动-删除试卷
  { code: "00010020", name: "getPaperDetail" }, //组卷活动-获取试卷详情
  { code: "00000106", name: "finishMakePaper" }, //组卷活动-完成组卷
  { code: "00000069", name: "getPaperStructure" }, //组卷活动-组卷抽题-试卷结构
  { code: "00030008", name: "checkItemIsEnoughExtruct" }, //组卷活动-抽题题量检查
  { code: "00800002", name: "extractPaper" }, //组卷活动-智能组卷接口
  { code: "00030027", name: "paperExtractModule" }, // 组卷活动-组卷抽题-导入历史试卷
  { code: "00000118", name: "reAssemblyPaper" }, // 组卷活动-待组试卷-重新组卷
  { code: "00800101", name: "itemTallyOfPapers" }, // 组卷活动-试题分布统计

  { code: "00030009", name: "addQuestionOfCompare" }, // 难度比对-待对比试题批量添加接口 1
  { code: "00030010", name: "delQuestionOfCompare" }, // 难度比对-待对比试题批量移除接口 1
  { code: "00030011", name: "getQuestionOfCompare" }, // 难度比对-待比对试题列表 1
  { code: "00030012", name: "addCompareTask" }, // 难度比对-添加任务接口 1
  { code: "00030013", name: "delCompareTask" }, // 难度比对-任务批量删除接口 1
  { code: "00030014", name: "editCompareTask" }, // 难度比对-任务编辑接口 1
  { code: "00030015", name: "getCompareTask" }, // 难度比对-任务分页列表查询接口 1
  { code: "00030016", name: "addQuestionOfCompareTask" }, // 难度比对-任务试题批量添加接口 1
  { code: "00030017", name: "delQuestionOfCompareTask" }, // 难度比对-任务试题批量移除接口 1
  { code: "00030018", name: "getQuestionOfCompareTask" }, // 难度比对-任务试题分页列表接口 1
  { code: "00030019", name: "getMyTask" }, // 难度比对-我的任务 1
  { code: "00030020", name: "getArbitration" }, // 难度比对-待我仲裁分页列表接口 1
  { code: "00030021", name: "getProgressMonitor" }, // 难度比对-难度比利进度监控教据 1
  { code: "00030022", name: "addQuestionOfActural" }, // 难度比对-实测真题批量添加接口 1（暂无实测试题）
  { code: "00030023", name: "delQuestionOfActural" }, // 难度比对-实测真题批量移除 1（暂无实测试题）
  { code: "00030024", name: "getQuestionOfActural" }, // 难度比对-实测真题分页列表接口
  { code: "00030029", name: "getNotExitsQuestionOfActural" }, // 难度比对-未加入实测真题列表接口
  { code: "00030030", name: "getArbitrationItemDetail" }, // 难度比对-仲裁 页面左边获取试题
  { code: "00030031", name: "editArbitrationItemDiff" }, // 难度比对-仲裁人员提交难度

  { code: "00030025", name: "getCompareItemDetail" }, // 难度比对-查询需要进行比对试题集接口 1
  { code: "00010113", name: "getActuralQuestionList" }, // 难度比对-查询被比对的历史真题 1
  { code: "00030026", name: "editQuestionDiff" }, // 难度比对-修改试题难度接口  修改试题难度 00030026  参数 taskItemId  任务试题id ，difficulty 难度值， actualItemId对比的真题id
  { code: "00030028", name: "getMyTaskQuestion" }, // 难度比对-我的任务 1

  { code: "00008120", name: "getPaperMakePaperBags" }, //制卷活动-试卷包列表
  { code: "00008121", name: "delPaperMakePaperBags" }, //制卷活动-删除试卷包
  { code: "00000104", name: "delPaperMakePapers" }, //制卷活动-移除活动
  { code: "00000108", name: "delBatchPaperMakePapers" }, //制卷活动-批量移除活动

  { code: "00008110", name: "createMakePapers" }, //制卷活动-生成试卷包
  { code: "00008111", name: "batchAddNotInMakePapersPaper" }, //制卷活动-批量将试卷加入到制卷活动中
  { code: "00008112", name: "getNotInMakePapersPaper" }, //制卷活动-查询没有在制卷活动中的试卷
  { code: "00008112", name: "getNotInMakePapersPaper" }, //制卷活动-查询没有在制卷活动中的试卷
  { code: "00800100", name: "getPaperItemStatistics" }, //搜索试卷-试题分布统计
  { code: "00010030", name: "queryTnetBidetailsStructure" }, //预览双向细目明细
  { code: "00010066", name: "batchDelPapersFromFolder" }, //批量从试卷文件夹中删除试卷
  { code: "00003301", name: "addQuestionStatisticsTask" }, //添加试题分析任务
  { code: "00003304", name: "getQuestionStatisticsTaskDetail" }, //查看试题比对任务详情
  { code: "00010084", name: "getParamaterQuestion" }, //获取参数题列表
  { code: "00010090", name: "getParamaterQuestionId" }, //获取参数题id
  { code: "00010104", name: "getParamaterQuestionById" }, //获取参数题详情
  { code: "00011004", name: "addDataReportPageBag" }, //添加考后分析试卷包

  { code: "00010027", name: "queryPaperInfoById" }, //组卷活动选择试题页面-根据试卷id查询试卷信息
  { code: "00030007", name: "removeQuestionFromPaper" }, //组卷活动选择试题页面-选择试卷后将试题移除试卷
  { code: "00030006", name: "addQuestionToPaper" }, //组卷活动选择试题页面-选择试题加入到试卷中
  { code: "00000070", name: "getPreviewQuestion" }, // 组卷活动-试题-预览试题获取试题
  { code: "00000065", name: "getPreviewPaper" }, // 组卷活动-试卷-预览试卷
  { code: "00010040", name: "setChooseQuestion" }, // 组卷活动-试卷-设置选做题
  { code: "00010036", name: "moveQuestionOfPaper" }, // 组卷活动-试卷-试题上下移

  { code: "00030100", name: "addTagOfAssembly" }, // 组卷活动-标签管理-新增
  { code: "00030101", name: "editTagOfAssembly" }, // 组卷活动-标签管理-修改
  { code: "00030102", name: "delTagOfAssembly" }, // 组卷活动-标签管理-删除标签
  { code: "00030103", name: "changeTagOfQst" }, // 组卷活动-标签管理-试题批量移入或移出标签接口
  { code: "00030104", name: "getTagsList" }, // 组卷活动-标签管理-查询用户标签接口
  { code: "00030105", name: "getTagDetail" }, // 组卷活动-标签管理-查询用户标签明细接口
  { code: "00030106", name: "getTagsOfQst" }, // 组卷活动-标签管理-查询(试题)资源的所有标签接口
  { code: "01110102", name: "getQuestionListOfVerify" }, //审题活动-试题列表
  { code: "00030032", name: "getKnowledgeDisableStatus" }, //查询知识模型或者知识点禁用状态
  { code: "01110121", name: "getQuestionHistoryVersion" }, //查询试题历史版本信息
  { code: "01110120", name: "getQuestionHistoryVersionPager" }, //查询试题历史版本信息 分页表
  { code: "01110122", name: "recoveryVersion" }, // 恢复试题版本
  { code: "00800103", name: "getMultiPaperCompare" }, // 组卷活动-试卷-多卷对比
  { code: "00010087", name: "getUnKnowList" }, // 组卷活动-试卷-查缺补漏
  { code: "00010088", name: "getUnKnowListOfKnowPoint" }, // 组卷活动-试卷-查缺补漏（知识点）
  { code: "00000052", name: "getPaperOptRecord" }, // 组卷活动-试卷-操作记录
  { code: "00010047", name: "getPaperAuthority" }, // 组卷活动-设置-试卷权限
  { code: "11010008", name: "getPaperAuthorityOfEdit" }, // 组卷活动-设置-试卷权限-获取编辑数据
  { code: "00010048", name: "submitPaperAuthority" }, // 组卷活动-设置-试卷权限-提交编辑
  { code: "00010018", name: "moveinOtherPaper" }, // 组卷活动-试卷-试卷详情-试题移出（移入到其他试卷）
  { code: "00010021", name: "moveoutOfPaper" }, // 组卷活动-试卷-试卷详情-试题移出
  { code: "01110123", name: "getCheckLinkData" }, // 组卷活动-试卷-试卷详情-关联检查
  { code: "00010023", name: "changeItemConfirm" }, // 组卷活动-试卷-换题-确认换题
  { code: "00300010", name: "getVerifyTaskList" }, // 审题活动-审题任务-任务列表
  { code: "01010310", name: "editVerifyTask" }, // 审题活动-审题任务-修改任务
  { code: "00300006", name: "finishVerifyTask" }, // 审题活动-审题任务-完成任务
  { code: "01010314", name: "moveoutItemOfVerifyTask" }, // 审题活动-审题任务-任务试题列表-移出试题
  { code: "01010313", name: "addItemOfVerifyTask" }, // 审题活动-审题任务-任务试题列表-加入试题
  { code: "01120102", name: "getTallyOfVerify" }, // 审题活动-状态统计-审核，反馈统计
  { code: "01110124", name: "getStateTallyOfVerify" }, // 审题活动-状态统计-状态统计
  { code: "01110201", name: "getQualityOfCreater" }, // 审题活动-命题质量评价-表格
  { code: "01110203", name: "getQuestionOfRate" }, // 审题活动-命题质量评价-被评价的试题
  { code: "01110204", name: "setQualityOfCreater" }, // 审题活动-命题质量评价-评价命题人
  { code: "01110202", name: "getRateList" }, // 审题活动-命题质量评价-获取被命题人被评列表
  { code: "01110205", name: "setRateContentOfManager" }, // 审题活动-命题质量管理-评价
  { code: "01110206", name: "confirmEvaluat" }, // 审题活动-命题质量管理-确认评价
  { code: "00030108", name: "getVerifyTaskRandom" }, // 审题活动-审题任务随机获取任务接口
  { code: "00030109", name: "getVerifyTaskRecord" }, // 审题活动-审题查看个人审题记录接口

  { code: "01111107", name: "getFeedbackPager" }, // 反馈试题分页表
  { code: "01110117", name: "feedbackQuestion" }, // 反馈试题
  { code: "01110100", name: "returnQuestion" }, // 收回试题
  { code: "01110118", name: "addQuestionRemark" }, // 添加试题备注
  { code: "01110106", name: "delQuestionRemark" }, // 删除试题备注
  { code: "01110118", name: "editQuestionRemark" }, // 修改试题备注
  { code: "01110104", name: "auditQuestion" }, // 审核试题

  { code: "00010115", name: "checkQuestionByIntelligentEntry" }, // 智能录入 校验试题接口
  { code: "00010038", name: "setOptionalQuestionsReq" }, // 组卷 设置同分值选做题目
  { code: "00010039", name: "deleteOptionalQuestionsReq" }, // 组卷 删除同分值选做题目
  { code: "00001424", name: "setRoleFunctionConfigReq" }, // 设置角色功能配置
  /**
   * 00800105
     参数：
     activityId       活动Id文件夹【非必传】
     subjectId      【必传】
     itemFolderId   试题文件夹Id【非必传】，与activityId传参为二选一
     qryFlag  查询标识： 0知识模型   1知识点
     knowIds   知识模型Id集合【非必传】
   */
  { code: "00800105", name: "modelOrPointTreeQuestionNumber" }, // 查询知识点或者知识模型树包含试题余量
  { code: "00800106", name: "delGroupModel" }, // 删除组卷模板
  { code: "00800107", name: "copyGroupModel" }, // 复制组卷模板
  { code: "00800120", name: "copyGroupModelBlueprin" }, // 复制组卷蓝图模板
  { code: "00800109", name: "editUsedStatus" }, // 修改组卷模板使用状态 0 启用 1 禁用
  { code: "00030005", name: "disabledModel" }, // 禁用知识模型
  { code: "00010116", name: "modelTreeReq" }, // 知识模型树 操作
  { code: "01010331", name: "getPropositionBlueprint" }, // 知识模型树 操作
  { code: "01110126", name: "RemoveAuditReq" }, // 审题活动移交终审按钮
  { code: "01120103", name: "getChildRemark" }, // 获取备注列表
  { code: "01120112", name: "getActUserList" }, // 获取活动用户列表
  { code: "00001226", name: "getUserListOfTotal" }, // 设置试卷/试题权限 - 获取活动用户列表
  { code: "99999901", name: "getNodeQuestionListOfAssembly" }, //组卷活动-试题列表
  { code: "01110127", name: "addAllItemsToAct" }, //活动-试题列表-选择试题加入活动-全部加入
  { code: "01110128", name: "getAllItemsToActProgress" }, //活动-试题列表-选择试题加入活动-全部加入-查询进度
  { code: "00020003", name: "getCheckResultList" }, //校题活动-获取校题结果
  { code: "00030040", name: "confirmCheck" }, //校题活动-校题
  { code: "00030041", name: "checkRecordList" }, //校题活动-校题-试题详情中的校题记录
  { code: "00030042", name: "getItemListOfCheck" }, //校题活动-试题
  { code: "00030043", name: "getTallyOfCheck" }, //校题活动-统计
  { code: "00030044", name: "getRecordOfCheck" }, //校题活动-任务-校题记录
  { code: "00010117", name: "getPaperListOfSelItems" }, //组卷-试卷列表
  { code: "00020015", name: "getConfigDataOfExpert" }, //专家库-下拉配置数据列表
  { code: "00020010", name: "getExpertInfo" }, //专家库-专家详情
  { code: "00020012", name: "getRoleChangeRecord" }, //专家库-角色变更记录表格
  { code: "00020013", name: "getEvaluateInfo" }, //专家库-获取评价信息
  { code: "00020014", name: "getExpertList" }, //专家库-搜索专家
  { code: "00020005", name: "getExpertEvaluateTaskList" }, //专家库-入围评价任务获取
  { code: "00020004", name: "submitExpertRateTask" }, //专家库-提交评价任务
  { code: "00020007", name: "changeStatusExpertRateTask" }, //专家库-关闭/开启任务
  { code: "00020008", name: "getRateDetail" }, //专家库-评价详情
  { code: "00020011", name: "submitRateDetail" }, //专家库-提交评价详情
  { code: "00020006", name: "getRateDimensionality" }, //专家库-评价维度
  { code: "00020018", name: "delRate" }, //专家库-删除评价
  { code: "00020017", name: "getActList" }, //专家库-批量加入活动
  { code: "00008115", name: "getPaperListOfMakePaperFolder" }, //制卷活动-试卷列表
  { code: "11010009", name: "copyKnowledgeVersion" }, // 知识点版本-复制
  { code: "01110129", name: "moveOutAll" }, // 组卷活动-试题列表-按搜索结果全部移出活动
  { code: "00001427", name: "getAssignTaskPositionInfo" }, // 命题-任务-位置锚点
  { code: "00001428", name: "delAssignTaskPositionInfo" }, // 命题-任务-删除位置锚点
  { code: "00010118", name: "addSearchItemsToFolders" }, // 试题-将搜索试题全部加入到文件夹终
  { code: "00010120", name: "updateItemVersion" }, // 组卷-试卷-更新试题版本
  { code: "00030113", name: "editPaperStructureDom" }, // 组卷-试卷-修改试卷结构
  { code: "00011116", name: "getPaperListOfStore" }, // 真题卷库列表
  { code: "00011117", name: "delPaperListOfStore" }, // 真题卷库批量删除
  { code: "00011115", name: "placeOnFilePaper" }, // 试卷归档
  { code: "00011118", name: "getPaperInfo" }, // 试卷详情
  { code: "00030114", name: "tagItemsAddToFolder" }, // 标签关联的试题加入试题文件夹中
  { code: "00030112", name: "getTagLogList" }, // 用户分页查询标签日志
  { code: "00300011", name: "createCheckTask" }, // 创建校题任务
  { code: "00300014", name: "getSelCheckTaskList" }, // 获取校题列表
  { code: "00300013", name: "addSearchQuestionToCheckTask" }, // 校题任务-按条件搜索结果全部加入
  { code: "99999902", name: "getQuestionListOfCom" }, // 试题列表
  { code: "00300012", name: "moveOutQuestionFromCheckTask" }, // 校题任务-试题批量移出任务
  { code: "00300023", name: "getExposureCountsList" }, // 校题任务-曝光度
  { code: "00300021", name: "submitEvaluationDimension" }, // 专家库-提交评价维度
  { code: "00300022", name: "QuestionToVersion" }, // 试题-版本回滚
  { code: "00300024", name: "downloadPaperPdf" }, // 试卷pdf下载
];
