import tkTools from "@/utils/tkTools";
const createTestQuertions = {
  state: {
    subjectId: "", // 科目id
    subItemTypeId: "", //题型id
    childrenQuestionsTabList: [], //复合题 tab列表数据表单
    KnowledgeModelTree: [], //知识模型树数据
    subjectList: [], //科目列表
    LitterCurrIndex: "", //复合小题当前下标
    isHiddenAttr: false, //手动显隐ATTR
    changTabForm: null, //更改小题list某个key
    tabLoading:false
  },
  getters: {
    // --------------------------- 大题 ------------------------
    itemKowledgePointVerList(state, getters) {
      if (!getters.curSubjecData) return;
      const { examSyllabus = [] } = getters.curSubjecData;
      // basisFlag属性判断科目是否有知识模型按钮
      return examSyllabus;
    },
    // 科目是否显示知识模型按钮
    ShowKnowledgeModelBtn(state, getters) {
      if (!getters.curSubjecData) return;
      const { basisFlag } = getters.curSubjecData;
      // basisFlag属性判断科目是否有知识模型按钮
      return basisFlag === "1";
    },
    // 当前科目额外属性
    subjectItemTypeAttrList(state, getters) {
      if (!getters.curSubjecData) return [];
      const { subjectItemTypeAttrs = [] } = getters.curSubjecData;
      if (subjectItemTypeAttrs.length === 0) return [];
      const expandAttrs = subjectItemTypeAttrs.map((_c) => {
        if (_c.defaultData) {
          if (
            _c.dataType == 1 &&
            _c.subitemtypeAttrDataList &&
            _c.subitemtypeAttrDataList.length
          ) {
            _c.attrValue = _c.subitemtypeAttrDataList.find(
              (ele) => ele.attrValue === _c.defaultData
            ).id;
          } else if (
            _c.dataType == 2 &&
            _c.subitemtypeAttrDataList &&
            _c.subitemtypeAttrDataList.length
          ) {
            const attrNameList = _c.defaultData
              ? _c.defaultData.split(",")
              : [];
            if (attrNameList.length) {
              _c.attrValue = _c.subitemtypeAttrDataList
                .filter((ele) => attrNameList.includes(ele.attrValue))
                .map((_c) => _c.id);
            }
          } else {
            _c.attrValue = _c.defaultData;
          }
        } else {
          _c.attrValue = _c.dataType == 2 ? [] : "";
        }

        return _c;
      });
      return expandAttrs;
    },
    // 能力层次下拉
    itemAbilityLevelList(state, getters) {
      if (!getters.curSubjecData) return [];
      const { abilityLevels = [] } = getters.curSubjecData;
      return abilityLevels;
    },
    // 题型
    subjectItemTypeList(state, getters) {
      if (!getters.curSubjecData) return [];
      const { subjectItemTypes = [] } = getters.curSubjecData;
      return subjectItemTypes;
    },
    // 当前科目数据
    curSubjecData(state, getters) {
      if (!state.subjectId) return;
      return state.subjectList.find((_c) => _c.id === state.subjectId);
    },

    // 根据当前选中题型来判断 知识点树结构选择类型为多选还是单选
    selectType(state, getters) {
      // 1:单选 2.多选 3.判断

      if (getters.LitterQuetionTypeId) {
        return ["1", "2", "3"].includes(getters.LitterQuetionTypeId)
          ? "single"
          : "multiple";
      }
      return ["1", "2", "3"].includes(getters.BigQuetionTypeId)
        ? "single"
        : "multiple";
    },

    // 是否设置有主知识点
    isSetMain(state, getters) {
      //8问答题 4 不定项选择题
      if (getters.LitterQuetionTypeId) {
        return ["8", "4"].includes(getters.LitterQuetionTypeId);
      }

      return ["8", "4"].includes(getters.BigQuetionTypeId);
    },

    // 复合题
    isCompoundQuesition(state, getters) {
      if (!getters.currSubItemTypeItem) return;
      return getters.currSubItemTypeItem.isComposite == 1;
    },

    /*
    基础题
      1.单项选择题 2.多项选择题 3.判断题  8.问答题 4.不定项选择题
    复合题
      9.不定项选择 5.简答题 6.计算分析题 7.综合题  10.案例分析题 11.填空题 12.完形填空题 13.填空选择题
     */
    //大题id
    BigQuetionTypeId(state, getters) {
      if (!getters.currSubItemTypeItem) return "";
      return getters.currSubItemTypeItem.itemTypeId + "" || "";
    },

    // 是否显示多余属性 显示属性2种情况 1.小题显示属性   2.非综合题，已选择题型
    isShowMoreAttrs(state, getters) {
      if (state.isHiddenAttr) {
        return false;
      }
      if (getters.isCompoundQuesition) {
        return !!getters.LitterQuetionTypeName;
      } else {
        return !!state.subItemTypeId;
      }
    },

    // --------------------------- 综合题 小题 ------------------------
    // 根据题code改变Component页面
    currSubItemTypeItem(state, getters) {
      if (!state.subItemTypeId) return;
      if (!getters.curSubjecData || !getters.curSubjecData.subjectItemTypes)
        return;
      const subItemTypeItem = getters.curSubjecData.subjectItemTypes.find(
        (_c) => _c.subItemTypeId === state.subItemTypeId
      );
      if (!subItemTypeItem) return;
      return subItemTypeItem;
    },

    // 小题下拉列表
    SubTopicItemTypeList(state, getters) {
      if (!getters.currSubItemTypeItem) return [];
      return getters.currSubItemTypeItem.childItemTypes || [];
    },

    //小题name
    LitterQuetionTypeName(state) {
      if (state.LitterCurrIndex !== "") {
        if (!state.childrenQuestionsTabList[state.LitterCurrIndex]) return "";
        return state.childrenQuestionsTabList[state.LitterCurrIndex].title;
      }
      return "";
    },

    //小题code
    LitterQuetionTypeId(state) {
      if (state.LitterCurrIndex !== "") {
        return (
          state.childrenQuestionsTabList[state.LitterCurrIndex].subTopicForm
            .itemTypeId + ""
        );
      }
      return "";
    },
    //操作题，操作综合题可上传文件
    isShowUploadFile(state, getters) {
      if (getters.isCompoundQuesition) {
        // 复合题 - 点击大题 隐藏多余属性
        if (state.isHiddenAttr) {
          return ["17", "18"].includes(getters.BigQuetionTypeId);
        } else {
          // 复合题 - 点击小题 显示多余属性
          if (getters.LitterQuetionTypeId) {
            return ["17", "18"].includes(getters.LitterQuetionTypeId);
          }
        }
      } else {
        return ["17", "18"].includes(getters.BigQuetionTypeId);
      }
    },
  },
  mutations: {
    SET_TAB_FORM(state, data) {
      state.changTabForm = data;
    },
    SET_TAB_LOADING(state, boolean) {
      state.tabLoading = boolean;
    },
    // 设置科目id
    SET_SUBJECT_ID(state, id) {
      state.subjectId = id;
    },
    // 设置科目id
    SET_SUBITEMTYPE_ID(state, id) {
      state.subItemTypeId = id;
    },
    // 清空
    RESET_ALL(state) {
      state.LitterCurrIndex = "";
      state.isHiddenAttr = false;
    },
    // 属性手动显示和隐藏
    SET_isHiddenAttr(state, boolean) {
      if (boolean) {
        state.LitterCurrIndex = "";
      }
      state.isHiddenAttr = boolean;
    },
    // 设置小题tab
    SET_childrenQuestionsTabList(state, list) {
      state.childrenQuestionsTabList = JSON.parse(JSON.stringify(list));
    },
    // 知识模型树
    SET_KNOWLEDGEMODELTREE(state, list) {
      state.KnowledgeModelTree = tkTools.toNodeTree(list,"pid");
    },
    // 设置科目列表
    SET_SUBJECTLIST(state, list) {
      state.subjectList = list;
      state.subjectId = list.length ? list[0].id : "";
    },

    // 设置当前小题index
    SET_LitterCurrIndex(state, index) {
      state.LitterCurrIndex = index;
    },
  },
  actions: {
    GetSubjectAboutData({ commit }) {
      return new Promise((resolve, reject) => {
        tkReq().path('getSubjectAboutData')
        .param({ otherData: "subjectItemType,subjectItemTypeAttr,abilityLevel,examSyllabus" })
        .succ(res => {
          console.log(res)
          const { ret = [] } = res;
          const { subjects = [] } = ret;
          if (subjects.length === 0) return;
          commit("SET_SUBJECTLIST", subjects);
          resolve();
        })
        .err(res => {
          reject();
        })
        .send()
      })
    },

    // 获取知识模型树
    GetKnowledgeModelTreeBySubject({ commit },params={}) {
      let param = {
        ...params
      }
      if (!param.kmId) {
        param['subjectId'] = this.state.createTestQuertions.subjectId
      }
      return new Promise((resolve, reject) => {
        tkReq().path('getKonwledgeModel')
          .noLoading()
          .param(param)
          .succ((res) => {
            const { ret = [] } = res;
            commit("SET_KNOWLEDGEMODELTREE", ret);
            resolve();
          })
          .send();
      });
    },
  },
  namespaced: true,
};
export default createTestQuertions;
