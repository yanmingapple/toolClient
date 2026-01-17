(function () {
  "use strict";
  class tkEnumData {
    add(key, dataArray) {
      this[key] = dataArray;
      this[key + "_MAP"] = this.formatArrToObj(dataArray);
    }

    /**
     * 数组转为键值对
     * @param {*} list 数组
     * @returns obj
     */
    formatArrToObj(list) {
      return list.reduce((pre, cur) => {
        pre[cur.value] = cur.label;
        return pre;
      }, {});
    }
  }

  var TkEnumData = new tkEnumData();
  module.exports = TkEnumData;

  TkEnumData.add("ACTTYPE_LIST", [
    { label: "命题", value: "0" },
    { label: "审题", value: "1" },
    { label: "组卷", value: "2" },
    { label: "制卷", value: "4" },
    { label: "难度比对", value: "5" },
    { label: "校题", value: "6" },
    { label: "高考", value: "7" },
  ]);

  TkEnumData.add("ALL_ACTTYPE_LIST_TYPE", [
    { label: "命题活动", value: "0", sortLabel: "命", color: "#c11900", backgroundColor: "rgba(193, 25, 0,0.1)" },
    { label: "审题活动", value: "1", sortLabel: "审", color: "#0e6ec0", backgroundColor: "rgba(30, 110, 192,0.1)" },
    { label: "组卷活动", value: "2", sortLabel: "组", color: "#7886ca", backgroundColor: "rgba(120, 134, 202,0.1)" },
    { label: "审卷活动", value: "3", sortLabel: "审", color: "#dd578b", backgroundColor: "rgba(221, 87, 139,0.1)" },
    { label: "制卷活动", value: "4", sortLabel: "制", color: "#eaa055", backgroundColor: "rgba(234, 160, 85,0.1)" },
    { label: "难度比对", value: "5", sortLabel: "难", color: "#278688", backgroundColor: "rgba(39, 134, 136,0.1)" },
    { label: "校题活动", value: "6", sortLabel: "校", color: "#10d000", backgroundColor: "rgba(188, 215, 0,0.1)" },
    { label: "高考命题", value: "7", sortLabel: "高", color: "#10d000", backgroundColor: "rgba(188, 215, 0,0.1)" },
  ]);

  TkEnumData.add("ALL_MENU_LIST_TYPE", [
    { label: "所有活动", value: "0", sortLabel: "所有", color: "#c11900", backgroundColor: "rgba(193, 25, 0,0.1)" },
    { label: "命题活动", value: "1", sortLabel: "命", color: "#c11900", backgroundColor: "rgba(193, 25, 0,0.1)" },
    { label: "审题活动", value: "2", sortLabel: "审", color: "#0e6ec0", backgroundColor: "rgba(30, 110, 192,0.1)" },
    { label: "组卷活动", value: "3", sortLabel: "组", color: "#7886ca", backgroundColor: "rgba(120, 134, 202,0.1)" },
    { label: "制卷活动", value: "4", sortLabel: "制", color: "#eaa055", backgroundColor: "rgba(234, 160, 85,0.1)" },
    { label: "难度比对", value: "5", sortLabel: "难", color: "#278688", backgroundColor: "rgba(39, 134, 136,0.1)" },
    { label: "校题活动", value: "6", sortLabel: "校", color: "#10d000", backgroundColor: "rgba(188, 215, 0,0.1)" },
    { label: "高考命题", value: "7", sortLabel: "高", color: "#10d000", backgroundColor: "rgba(188, 215, 0,0.1)" },
  ]);

  TkEnumData.add("EDULEVEL_TYPE", [
    { label: "博士", value: "1" },
    { label: "硕士", value: "2" },
    { label: "本科", value: "3" },
    { label: "大专", value: "4" },
    { label: "其他", value: "5" },
  ]);

  TkEnumData.add("GENDER_LIST", [
    { label: "男", value: "1" },
    { label: "女", value: "0" },
  ]);

  // 活动状态
  TkEnumData.add("ACT_STATUS", [
    { label: "未开始", value: "0", type: "primary" },
    { label: "进行中", value: "1", type: "success" },
    { label: "已结束", value: "2", type: "info" },
  ]);

  // 命题任务状态
  TkEnumData.add("ASSIGNTASK_STATUS", [
    { label: "未开始", value: "0" },
    { label: "进行中", value: "1" },
    { label: "已完成", value: "2" },
  ]);

  // 命题任务所有状态
  TkEnumData.add("ALL_ASSIGNTASK_STATUS", [
    { label: "未开始", value: "0" },
    { label: "进行中", value: "1" },
    { label: "已完成", value: "2" },
    { label: "已关闭", value: "3" },
  ]);

  // 试题预估难度
  TkEnumData.add("ITEM_DIFF_LIST", [
    { label: "0.1", value: "1" },
    { label: "0.2", value: "2" },
    { label: "0.3", value: "3" },
    { label: "0.4", value: "4" },
    { label: "0.5", value: "5" },
    { label: "0.6", value: "6" },
    { label: "0.7", value: "7" },
    { label: "0.8", value: "8" },
    { label: "0.9", value: "9" },
  ]);

  // 判断题答案
  TkEnumData.add("JUDGE_ANSWER", [
    { label: "√", value: "right" },
    { label: "×", value: "wrong" },
  ]);

  // 知识模型和知识点判断
  TkEnumData.add("KNOW_NAME_LIST", [
    { label: "知识模型", value: 0 },
    { label: "知识点", value: 1 },
  ]);

  // 日志操作状态
  TkEnumData.add("LOG_AUDIT_STATE", [
    { label: "成功", value: "0", tagColor: "success" },
    { label: "失败", value: "1", tagColor: "danger" },
  ]);

  // 用户登录验证状态状态
  TkEnumData.add("USER_CHECK_LOGIN", [
    { label: "不需验证", value: "0", tagColor: "success" },
    { label: "需验证", value: "1", tagColor: "danger" },
  ]);

  // 用户登录验证状态状态
  TkEnumData.add("PERMISSION_CONFIG_STATUS", [
    { label: "有效", value: "1", tagColor: "success" },
    { label: "无效", value: "0", tagColor: "danger" },
  ]);

  // 用户登录验证状态状态
  TkEnumData.add("DATA_MANAGE_DOTYPE", [
    { label: "全部记录", value: "-1" },
    { label: "查询备份记录", value: "0" },
    { label: "查询恢复记录", value: "1" },
  ]);

  // 数据备份操作类型
  TkEnumData.add("DATA_MANAGE_STATUS", [
    { label: "备份", value: "0" },
    { label: "恢复", value: "1" },
  ]);

  // 数据备份状态
  TkEnumData.add("DATA_MANAGE_BANK_STATUS", [
    { label: "中", value: "0" },
    { label: "完成", value: "1" },
    { label: "失败", value: "2" },
  ]);

  // 数据备份类型
  TkEnumData.add("DATA_MANAGE_BANK_TYPE", [
    { label: "文件数据", value: "1" },
    { label: "基础数据", value: "2" },
    { label: "合并数据", value: "3" },
  ]);

  // 试题搜索 -> 是否加入活动
  TkEnumData.add("JOIN_ACTIVETY_STATUS", [
    { label: "未加入", value: "0" },
    { label: "已加入", value: "1" },
  ]);

  // 试题搜索 -> 是否参数题目
  TkEnumData.add("IS_PARAM_QUETIONS_STATUS", [
    { label: "否", value: "0" },
    { label: "是", value: "1" },
  ]);

  // 知识点默认状态
  TkEnumData.add("LANGUAGE_POINT_STATUS", [
    { label: "默认", value: "1", tagColor: "success" },
    { label: "非默认", value: "0", tagColor: "danger" },
  ]);

  // 知识点默认状态
  TkEnumData.add("SORT_TYPE_LIST", [
    { label: "按题型", value: "7" },
    { label: "按更新时间由近到远", value: "3" },
    { label: "按更新时间由远到近", value: "4" },
    { label: "按创建时间由近到远", value: "5" },
    { label: "按创建时间由远到近", value: "6" },
    { label: "按知识模型", value: "9" },
    { label: "按知识点", value: "0" },
    { label: "按试题编号", value: "1" },
    { label: "按命题人", value: "8" },
  ]);

  // 知识点默认状态
  TkEnumData.add("SORT_TYPE_QUESTION_LIST", [
    { label: "按试题编号排序", value: "1" },
    { label: "按任务编号排序", value: "2" },
    { label: "按更新时间由近到远", value: "3" },
    { label: "按更新时间由远到近", value: "4" },
    { label: "按创建时间由近到远", value: "5" },
    { label: "按创建时间由远到近", value: "6" },
    { label: "按知识模型", value: "9" },
    { label: "按知识点", value: "0" },
    { label: "按创建人", value: "8" },
  ]);

  // 科目默认状态
  TkEnumData.add("SUBJECT_STATUS", [
    { label: "启用", value: 1, tagColor: "success" },
    { label: "停用", value: 0, tagColor: "danger" },
  ]);

  //科目-> 是否支持选做题
  TkEnumData.add("SUBJECT_OPTION_FLAG", [
    { label: "支持", value: "1" },
    { label: "不支持", value: "0" },
  ]);

  // 科目 -> 是否启用试卷排版
  TkEnumData.add("SUBJECT_PAPER_TS_FLAG", [
    { label: "是", value: "1" },
    { label: "否", value: "0" },
  ]);
  // 科目 -> 考察依据
  TkEnumData.add("SUBJECT_BASIS_FLAG", [
    { label: "知识点", value: "0" },
    { label: "知识模型", value: "1" },
  ]);

  // 科目 -> 是否复合题
  TkEnumData.add("SUBJECT_IS_COMPOSITE", [
    { label: "是", value: 1 },
    { label: "否", value: 0 },
  ]);

  // 科目题型状态
  TkEnumData.add("SUBJECT_ITEM_TYPE_STATUS", [
    { label: "启用", value: 0, tagColor: "success" },
    { label: "停用", value: 1, tagColor: "danger" },
  ]);

  // 科目题型状态
  TkEnumData.add("SUBJECT_DEL_FLAG_MAP", [
    { label: "正常", value: "0", tagColor: "danger" },
    { label: "已删除", value: "1", tagColor: "success" },
  ]);

  // 科目试题属性数据类型
  TkEnumData.add("SUBJECT_ITEM_PROPS_DATA_TYPE", [
    { label: "文本", value: 0, tagColor: "info" },
    { label: "单选", value: 1, tagColor: "" },
    { label: "多选", value: 2, tagColor: "warning" },
    { label: "文件", value: 3, tagColor: "danger" },
  ]);

  // 科目题型搜索类型
  TkEnumData.add("SUBJECT_ITEM_PROPS_SEARCH_FLAG", [
    { label: "支持搜索", value: "0", tagColor: "success" },
    { label: "不支持搜索", value: "1", tagColor: "danger" },
  ]);

  // 科目题型是否必填
  TkEnumData.add("SUBJECT_ITEM_PROPS_MUST_FLAG", [
    { label: "非必填", value: "0", tagColor: "danger" },
    { label: "必填", value: "1", tagColor: "success" },
  ]);

  // 科目试卷结构 试题排序规则
  TkEnumData.add("SUBJECT_PAPER_MIX_ITEM_SORT_TYPE", [
    { label: "知识模型排序", value: "0", tagColor: "success" },
    { label: "手动排序", value: "1", tagColor: "" },
    { label: "知识点排序", value: "2", tagColor: "warning" },
  ]);

  // 科目试卷结构 默认结构
  TkEnumData.add("SUBJECT_PAPER_MIX_DEFAULT_FLAG", [
    { label: "否", value: "0", tagColor: "info" },
    { label: "是", value: "1", tagColor: "" },
  ]);

  // 科目试卷结构 题号排序规则
  TkEnumData.add("SUBJECT_PAPER_ITEM_NO_TYPE", [
    { label: "题号连续", value: "0", tagColor: "info" },
    { label: "题号重新开始", value: "1", tagColor: "" },
  ]);

  // 科目试卷结构 小题题号排序规则
  TkEnumData.add("SUBJECT_PAPER_SUB_ITEM_NO_TYPE", [
    { label: "小题题号连续", value: "0", tagColor: "info" },
    { label: "小题题号重新开始", value: "1", tagColor: "" },
  ]);
  // 科目试卷结构 小题题号排序规则 河南更新版本
  TkEnumData.add("SUBJECT_PAPER_SUB_ITEM_TYPE", [
    { label: "显示在小题", value: "1", tagColor: "info" },
    { label: "显示在大题", value: "0", tagColor: "" },
  ]);

  // 搜索试卷排序
  TkEnumData.add("SEARCH_PAPER_SORT_TYPE_LIST", [
    { label: "按更新时间由近到远", value: "3" },
    { label: "按更新时间由远到近", value: "4" },
    { label: "按创建时间由近到远", value: "5" },
    { label: "按创建时间由远到近", value: "6" },
    { label: "按试卷编号", value: "1" },
    { label: "按试卷名称排序", value: "2" },
  ]);

  // 文件夹排序
  TkEnumData.add("SEARCH_PAPER_FOLDER_SORT_TYPE_LIST", [
    { label: "按名称顺序", value: "1" },
    { label: "按创建时间由近到远", value: "2" },
    { label: "按创建时间由远到近", value: "3" },
  ]);

  TkEnumData.add("SUBJECT_PAPER_FOLDER_STATUS", [
    { label: "禁用", value: "0", tagColor: "info" },
    { label: "启用", value: "1", tagColor: "success" },
  ]);

  // 角色状态
  TkEnumData.add("USER_MANAGER_STATUS", [
    { label: "禁用", value: "0", tagColor: "info" },
    { label: "启用", value: "1", tagColor: "success" },
  ]);

  // 查重任务的状态
  TkEnumData.add("QUESTION_REPET_STATUS", [
    { label: "未运行", value: "NOT_RUNNING", tagColor: "info" },
    { label: "运行中", value: "RUNNING", tagColor: "" },
    { label: "运行成功", value: "RUNNING_SUC", tagColor: "success" },
    { label: "运行失败", value: "RUNNING_ERROR", tagColor: "danger" },
  ]);

  // 查重任务的试题处理状态
  TkEnumData.add("QUESTION_REPET_DETAIL_STATUS", [
    { label: "待处理", value: "0", tagColor: "info" },
    { label: "已处理", value: "1", tagColor: "success" },
    { label: "已处理", value: "2", tagColor: "success" },
  ]);

  //基础题型
  TkEnumData.add("ITEM_TYPE", [
    { code: "single", value: "1", isComposite: 0, isObjective: 0, label: "单项选择题" },
    { code: "multiple", value: "2", isComposite: 0, isObjective: 0, label: "多项选择题" },
    { code: "judgment", value: "3", isComposite: 0, isObjective: 0, label: "判断题" },
    { code: "indeterminate", value: "4", isComposite: 0, isObjective: 0, label: "不定项选择题" },
    { code: "shortanswer", value: "5", isComposite: 1, isObjective: 1, label: "简答题" },
    { code: "opreateFile", value: "17", isComposite: 0, isObjective: 1, label: "操作题" },
    { code: "opreateFileComposite", value: "18", isComposite: 1, isObjective: 1, label: "操作题" },
    { code: "calculationAnalysis", value: "6", isComposite: 1, isObjective: 1, label: "计算分析题" },
    { code: "comprehensive", value: "7", isComposite: 1, isObjective: 1, label: "综合题" },
    { code: "questionsAndAnswers", value: "8", isComposite: 0, isObjective: 1, label: "问答题" },
    { code: "indeterminateComprehensive", value: "9", isComposite: 1, isObjective: 0, label: "不定项选择题" },
    { code: "caseAnalysis", value: "10", isComposite: 1, isObjective: 0, label: "案例分析题" },
    { code: "fillblank", value: "11", isComposite: 0, isObjective: 0, label: "填空题" },
    { code: "fillItems", value: "12", isComposite: 0, isObjective: 0, label: "完形填空题" },
    { code: "fillSingle", value: "13", isComposite: 0, isObjective: 0, label: "填空选择题" },
  ]);

  // 难度比对 评次
  TkEnumData.add("EVALUATE_NUM_LIST", [
    { label: "一评", value: 0 },
    { label: "双评", value: 1 },
    { label: "三评", value: 2 },
    { label: "多人共评直接求平均", value: 3 },
  ]);
  // 难度比对 试题形式
  TkEnumData.add("ITEMCONTENT_TYPE", [
    { label: "文本", value: 0 },
    { label: "计算", value: 1 },
  ]);
  // 难度比对 试题状态
  TkEnumData.add("ITEM_STATE", [
    { label: "待比对", value: 0 },
    { label: "比对中", value: 1 },
    { label: "已比对", value: 2 },
    { label: "待仲裁", value: 999 },
  ]);

  //  试题关联关系
  TkEnumData.add("QUESTIONS_RELATIONS", [
    { label: "重题", value: "3_0" },
    { label: "被重题", value: "3_1" },
    { label: "包含", value: "1_0" },
    { label: "被包含", value: "1_1" },
    { label: "提示", value: "2_0" },
    { label: "被提示", value: "2_1" },
    { label: "复制", value: "4_0" },
    { label: "被复制", value: "4_1" },
    { label: "互斥", value: "5_0" },
  ]);

  // 待比对试题 试题排序方式
  TkEnumData.add("SORT_TYPE_LIST_COMPARE", [
    { label: "按题型排序", value: "1" },
    { label: "按更新时间由近到远", value: "2" },
    { label: "按更新时间由远到近", value: "3" },
    { label: "按创建时间由近到远", value: "4" },
    { label: "按创建时间由远到近", value: "5" },
    { label: "按知识模型排序", value: "6" },
    { label: "按题号排序", value: "7" },
    { label: "按命题人排序", value: "8" },
  ]);

  // 待比对试题 试题排序方式
  TkEnumData.add("SORT_TYPE_LIST_PAPER", [
    { label: "按更新时间由近到远", value: "3" },
    { label: "按更新时间由远到近", value: "4" },
    { label: "按创建时间由近到远", value: "5" },
    { label: "按创建时间由远到近", value: "6" },
    { label: "按试卷编号", value: "1" },
  ]);

  // 审题（校题）状态
  TkEnumData.add("REVIEW_STATU_LIST", [
    { label: "全部", value: "0" },
    { label: "进行中", value: "1" },
    { label: "已完成", value: "2" },
  ]);

  // 审题模式
  TkEnumData.add("REVIEW_MODE_LIST", [
    { label: "合议模式", value: "0" },
    { label: "轮转模式", value: "1" },
  ]);

  // 反馈状态
  TkEnumData.add("FEEDBACK_STATU_LIST", [
    { label: "未反馈", value: "0", tagColor: "info" },
    { label: "已反馈", value: "1", tagColor: "success" },
    { label: "重新提交", value: "2", tagColor: "danger" },
    { label: "不反馈", value: "3", tagColor: "warning" },
  ]);

  // 审核状态
  TkEnumData.add("AUDIT_STATU_LIST", [
    { label: "待审核", value: "0", tagColor: "#909399" },
    { label: "审核中", value: "1", tagColor: "#E6A23C" },
    { label: "终审", value: "2", tagColor: "#409EFF" },
    { label: "审核完成", value: "3", tagColor: "#67C23A" },
  ]);

  // 审核(校题)阶段
  TkEnumData.add("REVIEW_STAGE_LIST", [
    { label: "待审核", value: "0" },
    { label: "一轮审核", value: "1" },
    { label: "二轮审核", value: "2" },
    { label: "三轮审核", value: "3" },
    { label: "已审核", value: "4" },
  ]);
  // 组卷活动-试卷-关联检查(试题关联管理)
  TkEnumData.add("ITEMLINK_RELATE", [
    { label: "包含", value: "1" },
    { label: "提示", value: "2" },
    { label: "重题", value: "3" },
    { label: "复制", value: "4" },
    { label: "互斥", value: "5" },
  ]);

  // 审核任务状态
  TkEnumData.add("VERIFYTASK_STATUS", [
    { label: "未开始", value: "0" },
    { label: "进行中", value: "1" },
    { label: "已完成", value: "2" },
    { label: "已关闭", value: "3" },
  ]);

  // 审题-命题质量评价等级
  TkEnumData.add("RATE_GRADE", [
    { label: "待评", value: "0" },
    { label: "差-", value: "1" },
    { label: "差", value: "2" },
    { label: "中-", value: "3" },
    { label: "中", value: "4" },
    { label: "良-", value: "5" },
    { label: "良", value: "6" },
    { label: "优-", value: "7" },
    { label: "优", value: "8" },
  ]);

  // 重题管理-关联试题-关联关系
  TkEnumData.add("RELATE_LIST", [
    { label: "重题", value: "3_0" },
    { label: "被重题", value: "3_1" },
    { label: "包含", value: "1_0" },
    { label: "被包含", value: "1_1" },
    { label: "提示", value: "2_0" },
    { label: "被提示", value: "2_1" },
    { label: "复制", value: "4_0" },
    { label: "被复制", value: "4_1" },
    { label: "互斥", value: "5_0" },
  ]);

  // 审核结果
  TkEnumData.add("AUDIT_STATUS_LIST", [
    { label: "待审核", value: "0", tagColor: "info" },
    { label: "通过（甲等）", value: "3", tagColor: "success" },
    { label: "待修改（乙等）", value: "2", tagColor: "warning" },
    { label: "待修改（丙等）", value: "5", tagColor: "primary" },
    { label: "退回（丁等）", value: "1", tagColor: "danger" },
  ]);
  // 校题结果
  TkEnumData.add("CHECK_RESULT_LIST", [
    { label: "未校", value: "0", tagColor: "danger" },
    { label: "可用", value: "1", tagColor: "success" },
    { label: "待修改", value: "2", tagColor: "warning" },
    { label: "废弃", value: "3", tagColor: "info" },
  ]);

  // 专家库 - 会计命题经验起止年限  Experience
  TkEnumData.add("EXPERIENCE_YEAR", [
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
  ]);

  // 专家库 - 评价
  TkEnumData.add("EVALUATE_LIST", [
    { label: "优秀", value: "0" },
    { label: "良好", value: "1" },
    { label: "一般", value: "2" },
    { label: "较差", value: "3" },
  ]);

  // 系统中不同科目配置的编辑器字体参数
  TkEnumData.add("EDITOR_FONT_FAMILY", [
    { label: "宋体", value: "'宋体', 'Songti SC', 'SimSun'" },
    { label: "Times New Roman", value: "'times new roman', 'times'" },
    { label: "黑体", value: "'黑体'" },
    { label: "楷体", value: "'楷体', 'kaiti'" },
    { label: "MS Mincho", value: "'MS Mincho'" },
    { label: "Book Antiqua", value: "'Book Antiqua'" },//化学专用
    { label: "palatino linotype", value: "'palatino linotype'" },//化学专用


    // { label: 'times new roman/宋体/楷体/黑体/MS Mincho', value: "'times new roman', 'times',  '宋体', 'Songti SC', 'SimSun', '楷体', 'kaiti', 'SimHei', '黑体', 'MS Mincho'"},
    // { label: 'times new roman', value: "'times new roman', 'times'"},
    // { label: '宋体', value: "'宋体', 'Songti SC', 'SimSun'"},
    // { label: 'times new roman/宋体', value: "'times new roman', 'times',  '宋体', 'Songti SC', 'SimSun'"},
    // { label: '宋体/MS Mincho', value: "'宋体', 'Songti SC', 'SimSun', 'MS Mincho'"},
    // { label: '黑体/MS Mincho', value: "'黑体', 'MS Mincho'"},
  ]);

  // 系统中不同科目配置的编辑器字号参数
  //初号=42pt 小初=36pt 一号=26pt 小一=24pt 二号=22pt 小二=18pt 三号=16pt 小三=15pt 四号=14pt 小四=12pt 五号=10.5pt 小五=9pt 六号=7.5pt 小六=6.5pt 七号=5.5pt 八号=5pt
  TkEnumData.add("EDITOR_FONT_SIZE", [
    { label: "初号", value: "初号=42pt" },
    { label: "小初", value: "小初=36pt" },
    { label: "一号", value: "一号=26pt" },
    { label: "小一", value: "小一=24pt" },
    { label: "二号", value: "二号=22pt " },
    { label: "小二", value: "小二=18pt" },
    { label: "三号", value: "三号=16pt" },
    { label: "小三", value: "小三=15pt" },
    { label: "四号", value: "四号=14pt" },
    { label: "小四", value: "小四=12pt" },
    { label: "五号", value: "五号=10.5pt" },
    { label: "小五", value: "小五=9pt" },
    { label: "六号", value: "六号=7.5pt" },
    { label: "小六", value: "小六=6.5pt" },
    { label: "七号", value: "七号=5.5pt" },
    { label: "八号", value: "八号=5pt" },
  ]);

  TkEnumData.add("EDITOR_SUPPORT_NUMBER_THOUSAND", [
    { label: "否", value: 0 },
    { label: "是", value: 1 },
  ]);

  // 系统中不同科目配置段落缩进空白符号
  TkEnumData.add("EDITOR_PARAGRAPH_INDENT_SPACES_NUMBER", [
    { label: "0", value: 0 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
    { label: "7", value: 7 },
    { label: "8", value: 8 },
    { label: "9", value: 9 },
    { label: "10", value: 10 },
  ]);

  // 系统中不同科目配置段落对齐方式
  TkEnumData.add("EDITOR_ALIGN", [
    { label: "左对齐", value: "left" },
    { label: "居中", value: "center" },
    { label: "右对齐", value: "right" },
    { label: "两端对齐", value: "justify" },
  ]);

  // 系统中不同科目配置段落对齐方式
  TkEnumData.add("EDITOR_FILL_BLANK_FORMATS", [
    { label: "填空(空4位)", value: "填空(空4位)" },
    { label: "1", value: "1" },
    { label: "▲", value: "▲" },
    { label: "题号", value: "题号" },
    { label: "题号▲", value: "题号▲" },
    { label: "填空(题号)", value: "填空(题号)" },
  ]);

  // 学校下拉选项
  TkEnumData.add("SCHOOL_LIST", [
    { label: "考试院大学", value: 22 },
    { label: "三江学院", value: 30 },
    { label: "南京工业大学", value: 34 },
    { label: "南京医科大学", value: 35 },
    { label: "南京中医药大学", value: 36 },
    { label: "南京审计大学", value: 37 },
    { label: "南京师范大学", value: 42 },
    { label: "南京财经大学", value: 43 },
    { label: "东南大学", value: 44 },
    { label: "苏州大学", value: 45 },
    { label: "扬州大学", value: 46 },
    { label: "江苏大学", value: 47 },
    { label: "中国矿业大学", value: 48 },
    { label: "南京理工大学", value: 49 },
    { label: "江南大学", value: 50 },
    { label: "中央司法警官学院", value: 51 },
    { label: "中国人民公安大学", value: 52 },
    { label: "北京交通大学", value: 53 },
    { label: "江苏师范大学", value: 54 },
    { label: "泰州学院", value: 55 },
    { label: "南通理工学院", value: 56 },
    { label: "徐州工程学院", value: 57 },
    { label: "金肯职业技术学院", value: 58 },
    { label: "江海职业技术学院", value: 59 },
    { label: "江苏理工学院", value: 60 },
    { label: "常州大学", value: 61 },
    { label: "常州工学院", value: 62 },
    { label: "苏州科技大学", value: 63 },
    { label: "江苏师范大学科文学院", value: 64 },
    { label: "常熟理工学院", value: 65 },
    { label: "中国人民警察大学", value: 66 },
    { label: "南京传媒学院", value: 67 },
    { label: "南京理工大学泰州科技学院", value: 69 },
    { label: "苏州托普信息职业技术学院", value: 70 },
    { label: "南通大学", value: 72 },
    { label: "江苏海洋大学", value: 76 },
    { label: "淮阴师范学院", value: 79 },
    { label: "金陵科技学院", value: 80 },
    { label: "中国药科大学", value: 85 },
    { label: "南京信息工程大学", value: 86 },
    { label: "南京工程学院", value: 88 },
    { label: "南京航空航天大学", value: 89 },
    { label: "淮阴工学院", value: 90 },
    { label: "盐城师范学院", value: 91 },
    { label: "盐城工学院", value: 92 },
    { label: "江苏科技大学", value: 95 },
    { label: "宿迁学院", value: 97 },
    { label: "无锡太湖学院", value: 98 },
    { label: "南京艺术学院", value: 99 },
  ]);

  // 专家状态
  TkEnumData.add("SPECIALIST_STATUS", [
    { label: "启用", value: "1",type: "enable" },
    { label: "停用", value: "0",type: "disable" },
  ]);


})();
