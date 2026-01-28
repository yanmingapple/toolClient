import FileSaver from "file-saver";
import * as XLSX from "xlsx";
import _, { max } from "lodash";
import { getAcitivityRolesList, getCurrRole } from "@/store/tkStore";

const tkTools = {
  /**
   * @author 张浩(Hao.Zhang)
   * @description 扩展对象(Object, Array)
   * @example
   *    1. merge({ f1: '', f2: '' }, {f2: ''}) 返回 { f1: '', f2: '' }
   *    2. merge({ f1: '' }, { f2: '', f3: '' }) 返回 { f1: '', f2: '', f3: '' }
   * @method merge
   * @param source { Object } 原对象（即参照对象）
   * @param target { Object } 目标对象（即返回的对象）
   * @returns [target { Object }] 返回目标对象参数
   */
  merge: (source, target) => {
    if (typeof target === "undefined") target = {};
    for (let key in source) {
      if (typeof target[key] === "object" && target[key] instanceof Object) {
        //数组赋值有问题，改变原对象会修改重新赋值的对象，故要复制一个新的数组
        if (target[key] instanceof Array) {
          if (source[key] instanceof Array) target[key] = [...source[key]];
          else target[key] = [];
        } else {
          tkTools.merge(source[key], target[key]);
        }
      } else {
        target[key] = source[key];
      }
    }
    return target;
  },
  /**
   * @author yanm
   * @description 扩展对象(Object, Array)
   * @example
   *    1. mergeExsitKeyValue({ f1: '1', f2: '2' }, {f2: ''}) 返回 {f2: '2' }
   *    2. mergeExsitKeyValue({ f1: '12' }, {{ f1: '' , f2: '', f3: '' }) 返回 { f1: '12', f2: '', f3: '' }
   * @method mergeExsitKeyValue
   * @param source { Object } 原对象（即参照对象）
   * @param target { Object } 目标对象（即返回的对象）
   * @returns [target { Object }] 返回目标对象参数
   */
  mergeExsitKeyValue: (...argument) => {
    if (!argument) {
      return;
    }

    for (let index = 0; index < argument.length; index += 2) {
      const source = argument[index] || {};
      let target = argument[index + 1] || {};
      for (let key in target) {
        if (typeof target[key] === "object" && target[key] instanceof Object) {
          //数组赋值有问题，改变原对象会修改重新赋值的对象，故要复制一个新的数组
          if (target[key] instanceof Array) {
            if (source[key] instanceof Array) target[key] = [...source[key]];
            else target[key] = [];
          } else {
            tkTools.mergeExsitKeyValue(source[key], target[key]);
          }
        } else {
          target[key] = source[key];
        }
      }
    }
  },

  /**
   * @author dj
   * @description 深克隆
   * @example deepClone(obj)
   * @method merge
   * @returns [target { Object }] 返回传入的对象深克隆对象
   */
  deepClone: (source) => {
    if (!source) return {};

    return JSON.parse(JSON.stringify(source));
  },

  /**
   * @author 张浩(Hao.Zhang)
   * @description 用于数据请求生成随机号，具体用处暂不清楚
   * @method reqSsnCre
   */
  reqSsnCre: (length) => {
    let result = "";
    let randomNum = (min, max) => Math.floor(min + (Math.random() * max - min));
    for (let i = 0; i < (length || 0); i++)
      // if (i % 2) result += String.fromCharCode(randomNum(65, 90))
      // else
      result += randomNum(0, 9);
    return result;
  },

  /**
   * @author 系统
   * @description 生成随机手机号
   * @example generateMobile() 返回结果为：13812345678
   * @method generateMobile
   * @returns [string] 返回生成的手机号
   */
  generateMobile: () => {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                     '150', '151', '152', '153', '155', '156', '157', '158', '159',
                     '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  },


  /**
   * @author 张浩(Hao.Zhang)
   * @description 依据当前系统时间，生成日期+时间序号
   * @example serialNumber() 返回结果为：20180801174632251
   * @method serialNumber
   * @param formatStr { String } 格式参数，如：yyyyMMddhhmmss，默认使用 yyyyMMddhhmmss
   * @returns { String } 根据参数formatStr，返回日期+时间
   */
  serialNumber: (formatStr) => {
    let nDate = new Date();
    try {
      return nDate.format(formatStr || "yyyyMMddhhmmss");
    } catch (error) {
      return nDate.getTime();
    }
  },

  /**
   * @author 张浩(Hao.Zhang)
   * @description 依据当前系统时间，生成日期+时间序号
   * @example wrdLimit() 返回结果为：20180801174632251
   * @method wrdLimit
   * @param obj { Object } 元素对象集合
   * @param wrdLength { Number } 要显示的字符串长度
   * @returns { void }
   */
  wrdLimit: (obj, wrdLength) => {
    let cntLength = 0;
    for (let i = 0; i < obj.childNodes.length; i++) {
      console.log(obj.childNodes[i]);
      // var htmlStr = obj.childNodes[i].innerHTML;
      // var strLength = obj.innerText.length;
      // if (strLength > wrdLength) {
      //   obj.innerHTML = nowhtml.substr(0,wrdLength)+'...';
      // }
    }
  },

  /**
   * @author dj
   * @description 切割路径后面的参数
   * @example
   * @method gParseUrlParam
   * @param paramStr '?name=anan&age=18'字符串
   * @returns { void }
   */
  gParseUrlParam: (paramStr, isFrw) => {
    var str2 = paramStr.slice(1, paramStr.length);
    var arr1 = str2.split("&");
    var paramObj = {};
    arr1.forEach((item) => {
      var arrTemp = item.split("=");
      paramObj[arrTemp[0]] = arrTemp[1];
    });
    return paramObj;
  },

  // 试题详情统计字数
  /**
   * @description 试题详情统计字数
   * @name wordCount
   * @param arr {Array[String]}
   **/
  wordCount: (arr) => {
    /** 正则
     * \uff10-\uff19 => 全角数字
     * \uff21-\uff3a => 全角大写英文字符
     * \uff41-\uff5a => 全角小写英文字符
     * \u30-\u39 => 半角数字
     * \u41-\u5a => 半角大写英文字符
     * \u61-\u7a => 半角小写英文字符
     *
     */
    var __cn_count = (str) => {
      // 正则验证中文
      var reg = /[\u4e00-\u9fa5]/g;
      try {
        return str.match(reg).length;
      } catch (error) {
        return 0;
      }
    };

    var __en_count = (str) => {
      // 正则验证英文(以单词为单位)
      var reg = /[a-zA-Z]+/g;
      try {
        return str.match(reg).length;
      } catch (error) {
        return 0;
      }
    };

    var __char_count = (str) => {
      // 正则验证标点及符号（包括全角或半角）
      var reg = /[^a-zA-Z0-9\u4e00-\u9fa5\s]+/g;
      try {
        return str.match(reg).join("").length;
      } catch (error) {
        return 0;
      }
    };

    var __number_count = (str) => {
      var reg = /\d+([\s.]\d+)?/g;
      str = str.replace(/(\d+)\s(\d+)/g, "$1$2");
      try {
        return str.match(reg, "_").length;
      } catch (error) {
        return 0;
      }
    };
    var result = {
      charCount: 0,
      cnCount: 0,
      numberCount: 0,
    };
    for (var i = 0; i < arr.length; i++) {
      result.charCount += __char_count(arr[i]) + __en_count(arr[i]);
      result.cnCount += __cn_count(arr[i]);
      result.numberCount += __number_count(arr[i]);
    }
    return result;
  },

  /**
   *
   *判断两个对象是否相等
   * @export Boolean
   * @param {*} objA
   * @param {*} objB
   * @return {*}
   */
  isObjEqual: (objA, objB) => {
    //相等
    if (objA === objB) return objA !== 0 || 1 / objA === 1 / objB;
    //空判断
    if (objA == null || objB == null) return objA === objB;
    //类型判断
    if (Object.prototype.toString.call(objA) !== Object.prototype.toString.call(objB)) return false;

    switch (Object.prototype.toString.call(objA)) {
      case "[object RegExp]":
      case "[object String]":
        //字符串转换比较
        return "" + objA === "" + objB;
      case "[object Number]":
        //数字转换比较,判断是否为NaN
        if (+objA !== +objA) {
          return +objB !== +objB;
        }

        return +objA === 0 ? 1 / +objA === 1 / objB : +objA === +objB;
      case "[object Date]":
      case "[object Boolean]":
        return +objA === +objB;
      case "[object Array]":
        //判断数组
        for (let i = 0; i < objA.length; i++) {
          if (!isObjEqual(objA[i], objB[i])) return false;
        }
        return true;
      case "[object Object]": {
        //判断对象
        let keys = Object.keys(objA);
        for (let i = 0; i < keys.length; i++) {
          if (!isObjEqual(objA[keys[i]], objB[keys[i]])) return false;
        }

        keys = Object.keys(objB);
        for (let i = 0; i < keys.length; i++) {
          if (!isObjEqual(objA[keys[i]], objB[keys[i]])) return false;
        }

        return true;
      }
      default:
        return false;
    }
  },

  /**
   * 判断两个数组是否相等
   * @param {*} arr1
   * @param {*} arr2
   * @returns
   */
  isArrEuqalse: (arr1, arr2) => {
    if (!arr1 || !arr2) {
      return false;
    }

    if (arr1.length != arr2.length) {
      return false;
    }

    for (var i = 0; i < arr2.length; i++) {
      if (arr1.indexOf(arr2[i]) == -1) {
        return false;
      }
    }

    for (var c = 0; c < arr1.length; c++) {
      if (arr2.indexOf(arr1[c]) == -1) {
        return false;
      }
    }
    return true;
  },

  /**
   * 数组去重
   * @param {*} data
   * @param {*} key
   * @returns
   */
  unique: (data = [], key) => {
    if (!data) return;
    const res = new Map();
    return data.filter((a) => !res.has(a[key]) && res.set(a[key], 1));
  },

  getMinLevel: (list) => {
    const levelList = list.map((_c) => parseInt(_c.level));
    let MinLevel = Math.min(...levelList);
    return MinLevel;
  },
  /**
   * list数据处理成tree数据
   * @param {*} list
   * @returns
   */
  toNodeTree: (list, key) => {
    if(!key){
      tkMessage.err("key不能为空");
      return [];
    }
    //将list按照key进行分组
    let groupList = tkTools.groupBy(list, key);

    //第一层级-1,按照这个进行组合
    let firstLevelList = groupList["-1"] || [];
    
    // 递归函数：处理节点及其所有子节点
    const processNode = (node, parentFullName, parents) => {
      // 初始化当前节点的属性
      const currentFullName = parentFullName ? `${parentFullName} / ${node.name}` : node.name;    
      // 设置当前节点的属性
      node.parentFullName = currentFullName;
      node.parents = parents;
      
      // 获取当前节点的子节点列表
      const childrenList = groupList[node.id] || [];
      
      // 递归处理每个子节点
      if (childrenList && childrenList.length > 0) {
        //如果有sort字段，childrenList按照sort字段排序
        if (childrenList.some(child => child.sort)) {
          childrenList.sort((a, b) => a.sort - b.sort);
        }
        //如果有next,previous字段，childrenList按照next,previous字段排序（链表排序）
        if (childrenList.some(child => child.next || child.previous)) {
          // 创建id到节点的映射
          const nodeMap = new Map();
          childrenList.forEach(node => {
            nodeMap.set(node.id, node);
          });
          
          // 找到第一个节点（previous为null或undefined的节点）
          let firstNode = childrenList.find(node => !node.previous || node.previous === null);
          
          // 如果找到了第一个节点，按照链表顺序排序
          if (firstNode) {
            const sortedList = [];
            let currentNode = firstNode;
            
            // 按照next字段依次链接节点
            while (currentNode) {
              sortedList.push(currentNode);
              const nextId = currentNode.next;
              if (nextId && nodeMap.has(nextId)) {
                currentNode = nodeMap.get(nextId);
              } else {
                currentNode = null;
              }
            }
            
            // 如果排序后的列表长度等于原列表长度，说明链表完整，使用排序后的列表
            if (sortedList.length === childrenList.length) {
              childrenList.length = 0;
              childrenList.push(...sortedList);
            }
          }
        }
  
        node.children = childrenList.map(child => {
          return processNode(child, currentFullName, [...node.parents, child.id]);
        });
      } else {
        node.children = [];
      }
      
      return node;
    };
    
    // 从第一层级开始递归处理
    const result = firstLevelList.map(item => {
      return processNode(item, '', [item.id]);
    });

    return result;
  },

  /**
   * 比较同一个pid（同level）下sort值大小并排序；
   * @param {*} list
   * @returns
   */
  sortNodes(nodeList, pSortnum_line) {
    var sortedNodes = [];
    function sortNumber(a, b) {
      return a.sort - b.sort;
    }
    nodeList.sort(sortNumber);

    nodeList.forEach((element, index) => {
      element["sortnum_line"] = (pSortnum_line ? pSortnum_line + "." : "") + (index + 1);
      element.curSort = index + 1;
      element.childrenLength = nodeList.length;
      if (element.children && element.children.length > 0) {
        element.children = tkTools.sortNodes(element.children, element.sortnum_line);
      }
      sortedNodes.push(element);
    });
    return sortedNodes;
  },
  
  /**
   * @description 试题详情统计字数
   * @name wordCnt
   * @param arr {Array[String]}
   **/
  wordCnt(arr) {
    /** 正则
     * \uff10-\uff19 => 全角数字
     * \uff21-\uff3a => 全角大写英文字符
     * \uff41-\uff5a => 全角小写英文字符
     * \u30-\u39 => 半角数字
     * \u41-\u5a => 半角大写英文字符
     * \u61-\u7a => 半角小写英文字符
     * \u0021-\u007e => 英文及英文字符(半角)
     */
    /**
     * @description 正则验证英文及英文字符
     * @name __chrCnt
     * @param str {String}
     **/
    var __chrCnt = function (str) {
      var __reg = /[\u0021-\u007e]/g;
      try {
        return str.match(__reg).length;
      } catch (error) {
        return 0;
      }
    };
    /**
     * @description 正则验证中文
     * @name __cnCnt
     * @param str {String}
     **/
    var __cnCnt = function (str) {
      var __reg = /[\u4e00-\u9fa5]/g;
      try {
        return str.match(__reg).length;
      } catch (error) {
        return 0;
      }
    };
    var __cnPun = function (str) {
      var __reg = /[^a-zA-Z0-9\u4e00-\u9fa5\u0021-\u007e\s]+/g;
      try {
        return str.match(__reg).join("").length;
      } catch (error) {
        return 0;
      }
    };
    /**
     * @description 正则验证英文(以单词为单位)
     * @name __enCnt
     * @param str {String}
     **/
    var __enCnt = function (str) {
      var __reg = /[a-zA-Z]+/g;
      try {
        return str.match(__reg).length;
      } catch (error) {
        return 0;
      }
    };
    /**
     * @description 正则验证标点及符号(Punctuation and symbols)
     * @name __pasCnt
     * @param str {String}
     **/
    var __pasCnt = function (str) {
      var __reg = /[^a-zA-Z0-9\u4e00-\u9fa5\s]+/g;
      try {
        return str.match(__reg).join("").length;
      } catch (error) {
        return 0;
      }
    };
    /**
     * @description 正则验证数字(如：2018年11月为两个数)
     * @name __numCnt
     * @param str {String}
     **/
    var __numCnt = function (str) {
      var __reg = /\d+([\s.]\d+)?/g;
      str = str.replace(/(\d+)\s(\d+)/g, "$1$2");
      try {
        return str.match(__reg, "_").length;
      } catch (error) {
        return 0;
      }
    };
    var __result = {
      chrCnt: 0,
      cnCnt: 0,
      cnPun: 0,
      enCnt: 0,
      numCnt: 0,
      pasCnt: 0,
    };
    for (var i = 0; i < arr.length; i++) {
      __result.chrCnt += __chrCnt(arr[i]);
      __result.cnCnt += __cnCnt(arr[i]);
      __result.cnPun += __cnPun(arr[i]);
      __result.enCnt += __enCnt(arr[i]);
      __result.numCnt += __numCnt(arr[i]);
      __result.pasCnt += __pasCnt(arr[i]);
    }
    return __result;
  },
  //组卷并长度大于0判断
  arrJudge(arr) {
    if (arr && arr instanceof Array && arr.length > 0) return true;
    else return false;
  },

  // 小数超过2位，保留2位小数
  formatterNumber2(num) {
    let val = Math.round(num * 100) / 100;
    if (val === 0) return val;

    return val || "";
  },
  // 小数超过4位，保留4位小数
  formatterNumber4(num) {
    let val = Math.round(num * 10000) / 10000;
    return val || "";
  },

  // 获取树结构选择的最上层id  根据树数据的line， 获取选中的节点，如数据无line字段则不处理
  getTreeSelectedTopIdsByLine(selectedList) {
    let data = JSON.parse(JSON.stringify(selectedList));
    if (data && data.length > 0) {
      let selectedOfTop = [],
        selectedIdsOfTotal = data.map((item) => item.id);
      data.forEach((item) => {
        if (item && item.line) {
          let lineIdArr = item.line.split("_"); // 节点的line转数组，获取所有的父节点
          lineIdArr.splice(-1, 1);
          let parentCheckedFlag = false; //父节点是否选中标识
          lineIdArr.forEach((lItem) => {
            if (selectedIdsOfTotal.includes(lItem)) parentCheckedFlag = true;
          });
          parentCheckedFlag ? "" : selectedOfTop.push(item);
        }
      });
      if (selectedOfTop.length > 0) return selectedOfTop;
      else return data;
    } else return [];
  },

  /**
   * 把树结构数据打平为一维数组
   * @param {*} treeList 全树结构
   * @param {*} treeListMap  空map数组结构 new Map()，接收map数组
   * @param {*} diyObj 自定义item 额外属性
   * @returns treeListMap
   */
  flatTree(treeList, treeListMap, diyObj = {}) {
    treeList.forEach((item) => {
      // 先克隆一份数据作为第一层级的填充
      let itemData = JSON.parse(JSON.stringify(item));
      if (item.children && item.children.length > 0) {
        // 如果当前children为数组并且长度大于0，才可进入flatTree()方法
        tkTools.flatTree(item.children, treeListMap, diyObj);
        delete itemData.children;
        itemData = { ...diyObj, ...itemData };
        treeListMap.set(itemData.id || itemData.testPointId, itemData);
      } else {
        itemData = { ...diyObj, ...itemData };
        treeListMap.set(itemData.id || itemData.testPointId, itemData);
      }
    });
    return treeListMap;
  },

  //   树结构查找指定节点并返回
  findNode(tree, func) {
    for (const node of tree) {
      if (func(node)) return node;
      if (node.children) {
        const res = tkTools.findNode(node.children, func);
        if (res) return res;
      }
    }
    return null;
  },

  //--------------过滤树节点--------------
  filterTree(tree, func) {
    const list = [];
    tree.forEach((node) => {
      node = Object.assign({}, node);
      if (func(node)) {
        list.push(node);
      }
      if (node.children) {
        list.push(tkTools.filterTree(node.children, func));
      }
    });
    const filterList = list.flat();
    return filterList;
  },

  // el-table 导出未xlsx表格
  exportElTbl(_targetId, xlsxName, hiddenColIndex) {
    let wb = XLSX.utils.table_to_book(document.getElementById(_targetId), {
      raw: true,
    });

    const colList = $('#' + _targetId).find("col");
    if(colList && colList.length){
      for(let _colIndex = 0;_colIndex < colList.length;_colIndex++){
        const _col = colList[_colIndex];
        if(wb.Sheets.Sheet1["!cols"][_colIndex]){
          wb.Sheets.Sheet1["!cols"][_colIndex]["wch"] = _col.width/ 8.5;
        }else{
          wb.Sheets.Sheet1["!cols"][_colIndex] = {"wch": _col.width/ 8.5};
        }
      }
    }

    wb.Sheets.Sheet1["!cols"].forEach((ele) => {
      ele.hidden = false;
    });

    if (!isNaN(hiddenColIndex)) {
      wb.Sheets.Sheet1["!cols"][hiddenColIndex] = { hidden: true };
    }

    wb.Sheets.Sheet1["!rows"].forEach((ele) => {
      ele.hidden = false;
    });

    Object.keys(wb.Sheets.Sheet1).forEach((key) => {
      if (wb.Sheets.Sheet1[key].v === "操作" || wb.Sheets.Sheet1[key].v === "删除") {
        delete wb.Sheets.Sheet1[key];
      }
    });

    let wbout = XLSX.write(wb, {
      bookType: "xlsx",
      bookSST: true,
      type: "array",
    });
    try {
      FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), xlsxName + ".xlsx");
    } catch (err) {
      console.log(err, wbout);
    }
  },

  // 审核阶段处理
  dealReviewStageStatu(dataItem) {
    dataItem = JSON.parse(JSON.stringify(dataItem));
    let reviewStageStatu = "";
    const stageAuditStatus =
      !dataItem.activityTask_stageAuditStatus && dataItem.activityTask_stageAuditStatus != 0
        ? ""
        : parseInt(dataItem.activityTask_stageAuditStatus);
    let auditIndexStatu = 0;
    // 审核状态==0（待审核）？'待审核'
    if (stageAuditStatus === 0) {
      reviewStageStatu = 0;
      return reviewStageStatu;
    } else if (!dataItem.activityTask_auditIndexNum && dataItem.activityTask_auditIndexNum != 0) {
      return "";
    } else if (stageAuditStatus === 1) {
      //审核状态==1（审核中）？ 审核次数-1
      auditIndexStatu = parseInt(dataItem.activityTask_auditIndexNum) - 1;
    } else {
      //审核状态==2（终审）  || 审核状态==3（审核完成） 根据审核次数判断审核阶段
      auditIndexStatu = parseInt(dataItem.activityTask_auditIndexNum);
    }

    // 审题模式==0（合议模式） 则返回 0（待审核）或者 4（已审核）
    if (parseInt(dataItem.activityTask_auditModel) === 0) {
      reviewStageStatu = auditIndexStatu === 0 || stageAuditStatus === 2 ? "0" : "4";
      return reviewStageStatu;
    } else {
      //审核模式==1 轮转模式 则返回审核轮次 0次则代表待审核，4代表已审核完成
      reviewStageStatu = auditIndexStatu === 0 ? "0" : auditIndexStatu;
      return reviewStageStatu;
    }
  },

  //手动添加打印
  handlerPrintTable(targetId) {
    console.log("🚀 ~ handlerPrintTable ~ targetId:", targetId);

    const cssStr = "<LINK rel='stylesheet' type='text/css' href='static/css/print.css'>";

    // 1、获取需要打印的部分
    const printHTML = document.getElementById(targetId).outerHTML;
    console.log("🚀 ~ handlerPrintTable ~ printHTML:", printHTML);

    // 2、创建 iframe 标签
    var iframe = document.createElement("IFRAME");
    var doc = null;
    // iframe.setAttribute('style', 'position:absolute;width: 671px; height: 600px;');
    iframe.setAttribute("style", "position:absolute;left: -500px; top: -500px;width:0;height:0;");

    // 3、浏览器插入 iframe
    document.body.appendChild(iframe);
    doc = iframe.contentWindow.document;
    // 引入打印的专有CSS样式
    doc.write(cssStr);
    doc.write(printHTML);
    doc.close();
    iframe.contentWindow.focus();
    // 注意：等待加载完调用打印，否则样式外联css显示有问题
    iframe.contentWindow.addEventListener("load", function () {
      // 4、开始打印
      iframe.contentWindow.print();
      // 5、删除iframe
      document.body.removeChild(iframe);
    });
  },
  // 覆盖ctrl+p 打印
  defaultPrint(targetElId, cssStr) {
    document.onkeydown = (e) => {
      var e = document.all ? window.event : e;
      if (e.keyCode === 80) {
        // 1、获取需要打印的部分
        const printHTML = document.getElementById(targetElId).outerHTML;
        // 2、创建 iframe 标签
        var iframe = document.createElement("IFRAME");
        var doc = null;
        // iframe.setAttribute('style', 'position:absolute;width: 671px; height: 600px;');
        iframe.setAttribute("style", "position:absolute;left: -500px; top: -500px;width:0;height:0;");

        // 3、浏览器插入 iframe
        document.body.appendChild(iframe);
        doc = iframe.contentWindow.document;
        // 引入打印的专有CSS样式
        doc.write(cssStr);
        doc.write(printHTML);
        doc.close();
        iframe.contentWindow.focus();
        // 注意：等待加载完调用打印，否则样式外联css显示有问题
        iframe.contentWindow.addEventListener("load", function () {
          // 4、开始打印
          iframe.contentWindow.print();
          // 5、删除iframe
          document.body.removeChild(iframe);
        });
      }
    };
  },
  // 前端下载
  export_raw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(ev);
  },
  // 内容转化为文件下载
  fileDownload(file, fileName = "下载文件", options) {
    // 创建隐藏的可下载链接
    let eleLink = document.createElement("a");
    eleLink.download = fileName;
    eleLink.style.display = "none";
    // 字符内容转变成blob地址
    let blob = options ? new Blob([file], options) : new Blob([file]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  },
  // 下载文件，替换window.open方法
  downloadFun(url) {
    let eleA = document.createElement("a");
    eleA.target = '_blank'; // 在新标签页打开，避免当前页面跳转
    eleA.rel = "noopener noreferrer";
    eleA.id = "downloadLink";
    console.log(process.env.NODE_ENV, "===================");
    const baseUrl = window.webConfig?.baseUrl;
    eleA.href = baseUrl + url;
    
    // 设置 download 属性，尝试强制下载
    eleA.download = '';
    
    eleA.style.display = "none";
    document.body.appendChild(eleA);
    eleA.click();
    
    // 延迟移除，确保点击事件完成
    setTimeout(() => {
      eleA.remove();
    }, 100);
  },
  //比较两个日期相差天数
  dateDiffDay: function (d1, d2) {
    let value = 24 * 60 * 60 * 1000; // 计算差多少天
    let checkDate = (d1 + "").tkDate();
    const checkTime = checkDate.getTime();
    const checkDate2 = (d2 + "").tkDate();
    const checkTime2 = checkDate2.getTime();
    const ret = (checkTime2 - checkTime) / value;
    if (ret <= 0) {
      return "-1";
    } else if (ret < 1) {
      return "0.5";
    } else {
      return parseInt(ret);
    }
  },
  // 生成字母列表
  orderGenerateAlphabetList: () => {
    const letterArr = [];
    // 字母A的code值是65，但因为已经到字母D了，所以直接从69E开始循环
    for (let i = 65; i < 91; i++) {
      letterArr[i] = String.fromCharCode(i);
    }
    return letterArr.filter((_c) => _c);
  },
  // 生成id
  createId: (prevStr) => {
    return `${prevStr}_${parseInt(Math.random() * 100000000)}_${parseInt(Math.random() * 100000000)}_${parseInt(
      Math.random() * 100000000
    )}`;
  },
  getCnNum(num) {
    var arr1 = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var arr2 = ["", "十", "百", "千", "万", "十", "百", "千", "亿", "十", "百", "千", "万", "十", "百", "千", "亿"];
    if (!num || isNaN(num)) {
      return "零";
    }
    var english = num.toString().split("");
    var result = "";
    for (var i = 0; i < english.length; i++) {
      var des_i = english.length - 1 - i; //倒序排列设值
      result = arr2[i] + result;
      var arr1_index = english[des_i];
      result = arr1[arr1_index] + result;
    }
    //将【零千、零百】换成【零】 【十零】换成【十】
    result = result.replace(/零(千|百|十)/g, "零").replace(/十零/g, "十");
    //合并中间多个零为一个零
    result = result.replace(/零+/g, "零");
    //将【零亿】换成【亿】【零万】换成【万】
    result = result.replace(/零亿/g, "亿").replace(/零万/g, "万");
    //将【亿万】换成【亿】
    result = result.replace(/亿万/g, "亿");
    //移除末尾的零
    result = result.replace(/零+$/, "");
    //将【零一十】换成【零十】
    //result = result.replace(/零一十/g, '零十');
    //貌似正规读法是零一十
    //将【一十】换成【十】
    result = result.replace(/^一十/g, "十");
    return result;
  },
  fixPrecision(num, precision = 2) {
    if (typeof num !== 'number' || isNaN(num)) {
      return num;
    }

    // 使用字符串方式避免浮点数精度问题
    const multiplier = Math.pow(10, precision);
    const result = Math.round(num * multiplier) / multiplier;

    // 处理特殊情况：0.1 + 0.2 = 0.30000000000000004
    if (Math.abs(result - Math.round(result * multiplier) / multiplier) < 1e-10) {
      return Math.round(result * multiplier) / multiplier;
    }

    return result;
  },

  safeMath(a, operator, b, precision = 2) {
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
      throw new Error('参数必须是有效的数字');
    }

    let result;
    switch (operator) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        if (b === 0) {
          throw new Error('除数不能为0');
        }
        result = a / b;
        break;
      default:
        throw new Error('不支持的运算符');
    }

    return this.fixPrecision(result, precision);
  },
  getOptionsList(params) {
    return (
      params?.list?.map((_l) => {
        let tempObj = {};
        tempObj[params?.targetLabel ?? "label"] = _l[params?.originLabel ?? "name"];
        tempObj[params?.targetVal ?? "value"] = _l[params?.originVal ?? "id"];
        params?.moreProps?.forEach((_p) => {
          if (_l[_p] || _l[_p] === 0) tempObj[_p] = _l[_p];
        });

        if(params.disabledFun){
          tempObj.disabled = params.disabledFun(_l);
        }

        return tempObj;
      }) ?? []
    );
  },
  formatBytes(bytes, decimals = 2) {
    //格式文件大小
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  /*
   * utf8转为utf16
   * @param str
   * @returns {string}
   */
  utf8To16(str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
      c = str.charCodeAt(i++);
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += str.charAt(i - 1);
          break;
        case 12:
        case 13:
          // 110x xxxx 10xx xxxx
          char2 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx 10xx xxxx 10xx xxxx
          char2 = str.charCodeAt(i++);
          char3 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
          break;
      }
    }
    return out;
  },

  /**
   * utf16转为utf8
   * @param str
   * @returns {string}
   */
  utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x0001 && c <= 0x007f) {
        out += str.charAt(i);
      } else if (c > 0x07ff) {
        out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
      } else {
        out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
      }
    }
    return out;
  },
  /**
   *
   * @param {*} key 搜索的key
   * @param {*} content 搜索内容
   * @param {*} queryType 查询组合类型（1：与， 2：或， 3:非
   * @param {*} operator 关键字类型（1:等于， 2：集合， 3：范围查询， 4：模糊匹配）
   * @param {*} dynamicFlag 是否动态属性 "0"不是 “1”是
   * @returns
   */
  dealSearchParam(key, content, queryType, operator, dynamicFlag) {
    const ret = {
      key: key,
      content: content,
      queryType: queryType ?? "1",
      operator: operator ?? "1",
    };

    if (dynamicFlag != undefined) {
      ret.dynamicFlag = dynamicFlag;
    }

    return ret;
  },
  // 认知层次值转换
  getCognitionLevelContent(val) {
    if (!val) {
      return val;
    }
    let dict = { A: "识记", B: "领会", C: "简单应用", D: "综合应用" };
    let r = val.split(",");
    r = r.map((item) => dict[item]);
    return r.join(",");
  },

  // 难度值转换
  getDiffContent(val) {
    if (val || val === 0) {
      if (val > 0 && val < 1) {
        val = val * 10;
      }
      let result = val >= 0 && val <= 3 ? "难" : val > 3 && val <= 6 ? "中" : "易";
      return `${result}`;
    } else {
      return "";
    }
  },
  groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      // 如果结果对象中还没有当前key对应的组，则创建一个新组
      if (!result[currentValue[key]]) {
        result[currentValue[key]] = [];
      }
      // 将当前元素添加到其对应的组中
      result[currentValue[key]].push(currentValue);
      return result;
    }, {});
  },

  hasPermissionNew: (binding) => {
    if(!binding){
      return true;
    }
    // 获取系统
    const role = getCurrRole().value;
    if (role.type == "0") {
      return true;
    }

    const actData = tkTransferParamsData("/activity/activityDetail");
    const permisstions = TkPagePermission.get(binding)
    if(permisstions){
      binding = permisstions.roles
    }

    const permissionRoles = binding;
    if (permissionRoles && permissionRoles instanceof Array) {
      if (permissionRoles.length > 0) {
        // 获取系统
        const activityRoles = actData.activityRoleList;
        const hasRole = permissionRoles.includes("ROLE_" + role.type);
        let hasActivityRole = false;
        if (activityRoles) {
          if (activityRoles.find((_role) => _role.roleValue == "0")) {
            hasActivityRole = true;
            return hasActivityRole;
          }

          hasActivityRole = activityRoles.some((_role) => {
            return permissionRoles.includes("ACTIVITYROLE_" + _role.roleValue);
          });
        }
        return hasActivityRole || hasRole;

      }
    } else {
      return true;
    }
  },

  /**
   *防反跳,时间间隔内重复调用
   *
   * @param {*} func
   * @param {*} delay
   * @param {*} maxWait true false
   * @returns
   */
  debounce(func, delay = 300, maxWait) {
    const param = {};
    if (maxWait) {
      param.maxWait = delay;
    }
    return _.debounce(func, delay, param);
  },

  log(data) {
    console.log(data);
  },
  begin() {
    tkTools.beginTime = new Date().getTime();
  },
  end(mess) {
    const currTime = new Date().getTime();
    tkTools.log(`===========${mess}耗时====${currTime - tkTools.beginTime}==============`);
  },
  //生成身份证id
    genIDCard(randomCount, minAge = 20, maxAge = 60) {
      if(!randomCount || randomCount <1){
        randomCount = 1;
      }
    const coefficientArray = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const lastNumberArray = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - minAge; // 最小年龄20岁
    const minYear = currentYear - maxAge; // 最大年龄60岁

    function gen(){
      // 随机生成地区码
      const areaCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      // 随机生成出生日期
      let birthYear = Math.floor(Math.random() * (maxYear - minYear)) + minYear;
      let birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      let birthDay = String(Math.floor(Math.random() * 31) + 1).padStart(2, '0');
      const birthDate = `${birthYear}${birthMonth}${birthDay}`;

      // 随机生成顺序码，并考虑性别规则
      let orderCode = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      if (orderCode[2] % 2 === 0) { // 偶数代表女性
          orderCode = orderCode.slice(0, 2) + (parseInt(orderCode[2]) + 1).toString();
      }

      // 初始ID号码（不含校验码）
      let idWithoutCheckCode = `${areaCode}${birthDate}${orderCode}`;
      let total = 0;

      // 计算校验和
      for (let i = 0; i < 17; i++) {
          total += parseInt(idWithoutCheckCode[i]) * parseInt(coefficientArray[i]);
      }

      // 计算校验码
      const checkCode = lastNumberArray[total % 11];

      // 完整身份证号
      const fullID = `${idWithoutCheckCode}${checkCode}`;

      // 验证身份证号是否有效
      if (tkTools.validateID(fullID)) {
          return fullID;
      } else {
          return gen(); // 如果无效，则重新生成
      }
    }

    const ret =[];
    for(var i = 0;i < randomCount;i++){
      ret.push(gen());
    }

    return ret;
},
 validateID(id) {
    const coefficientArray = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const lastNumberArray = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let total = 0;

    // 重新计算校验和
    for (let i = 0; i < 17; i++) {
        total += parseInt(id[i]) * parseInt(coefficientArray[i]);
    }

    // 获取校验码并验证
    const checkCode = lastNumberArray[total % 11];
    return checkCode === id[17].toUpperCase();
  },
  //  随机生成一个汉字
  getRandomHanzi() {
    const code = Math.floor(Math.random() * (0x9fa5 - 0x4e00 + 1)) + 0x4e00;
    return String.fromCharCode(code);
  },
  //  随机生成一个姓名
  getOneName() {
    let firstName = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章', '云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常', '乐', '于', '时', '傅', '皮', '卞', '齐', '康', '伍', '余', '元', '卜', '顾', '孟', '平', '黄', '和', '穆', '萧', '尹', '姚', '邵', '湛', '汪', '祁', '毛', '禹', '狄', '米', '贝', '明', '臧', '计', '伏', '成', '戴', '谈', '宋', '茅', '庞', '熊', '纪', '舒', '屈', '项', '祝', '董', '梁', '杜', '阮', '蓝', '闵', '席', '季', '麻', '强', '贾', '路', '娄', '危', '江', '童', '颜', '郭', '梅', '盛', '林', '刁', '钟', '徐', '邱', '骆', '高', '夏', '蔡', '田', '樊', '胡', '凌', '霍', '虞', '万', '支', '柯', '昝', '管', '卢', '莫', '经', '房', '裘', '缪', '干', '解', '应', '宗', '丁', '宣', '贲', '邓', '郁', '单', '杭', '洪', '包', '诸', '左', '石', '崔', '吉', '钮', '龚', '程', '嵇', '邢', '滑', '裴', '陆', '荣', '翁', '荀', '羊', '於', '惠', '甄', '麴', '家', '封', '芮', '羿', '储', '靳', '汲', '邴', '糜', '松', '井', '段', '富', '巫', '乌', '焦', '巴', '弓', '牧', '隗', '山', '谷', '车', '侯', '宓', '蓬', '全', '郗', '班', '仰', '秋', '仲', '伊', '宫', '宁', '仇', '栾', '暴', '甘', '钭', '厉', '戎', '祖', '武', '符', '刘', '景', '詹', '束', '龙', '叶', '幸', '司', '韶', '郜', '黎', '蓟', '薄', '印', '宿', '白', '怀', '蒲', '邰', '从', '鄂', '索', '咸', '籍', '赖', '卓', '蔺', '屠', '蒙', '池', '乔', '阴', '欎', '胥', '能', '苍', '双', '闻', '莘', '党', '翟', '谭', '贡', '劳', '逄', '姬', '申', '扶', '堵', '冉', '宰', '郦', '雍', '舄', '璩', '桑', '桂', '濮', '牛', '寿', '通', '边', '扈', '燕', '冀', '郏', '浦', '尚', '农', '温', '别', '庄', '晏', '柴', '瞿', '阎', '充', '慕', '连', '茹', '习', '宦', '艾', '鱼', '容', '向', '古', '易', '慎', '戈', '廖', '庾', '终', '暨', '居', '衡', '步', '都', '耿', '满', '弘', '匡', '国', '文', '寇', '广', '禄', '阙', '东', '殴', '殳', '沃', '利', '蔚', '越', '夔', '隆', '师', '巩', '厍', '聂', '晁', '勾', '敖', '融', '冷', '訾', '辛', '阚', '那', '简', '饶', '空', '曾', '毋', '沙', '乜', '养', '鞠', '须', '丰', '巢', '关', '蒯', '相', '查', '後', '荆', '红', '游', '竺', '权', '逯', '盖', '益', '桓', '公', '万俟', '司马', '上官', '欧阳', '夏侯', '诸葛', '闻人', '东方', '赫连', '皇甫', '尉迟', '公羊', '澹台', '公冶', '宗政', '濮阳', '淳于', '单于', '太叔', '申屠', '公孙', '仲孙', '轩辕', '令狐', '钟离', '宇文', '长孙', '慕容', '鲜于', '闾丘', '司徒', '司空', '亓官', '司寇', '仉', '督', '子车', '颛孙', '端木', '巫马', '公西', '漆雕', '乐正', '壤驷', '公良', '拓跋', '夹谷', '宰父', '谷梁', '晋', '楚', '闫', '法', '汝', '鄢', '涂', '钦', '段干', '百里', '东郭', '南门', '呼延', '归', '海', '羊舌', '微生', '岳', '帅', '缑', '亢', '况', '后', '有', '琴', '梁丘', '左丘', '东门', '西门', '商', '牟', '佘', '佴', '伯', '赏', '南宫', '墨', '哈', '谯', '笪', '年', '爱', '阳', '佟', '第五', '言', '福', '百', '家', '姓', '终', '寸', '卓', '蔺', '屠', '蒙', '池', '乔', '阳', '郁', '胥', '能', '苍', '双', '闻', '莘', '党', '翟', '谭', '贡', '劳', '逄', '姬', '申', '扶', '堵', '冉', '宰', '郦', '雍', '却', '璩', '桑', '桂', '濮', '牛', '寿', '通', '边', '扈', '燕', '冀', '僪', '浦', '尚', '农', '温', '别', '庄', '晏', '柴', '瞿', '阎', '充', '慕', '连', '茹', '习', '宦', '艾', '鱼', '容', '向', '古', '易', '慎', '戈', '庾', '终', '暨', '居', '衡', '步都', '耿', '满', '弘', '匡', '国', '文', '寇', '广', '禄', '阙', '东欧', '殳', '沃', '利', '蔚', '越', '夔', '隆', '师', '巩', '厍', '聂晁', '勾', '敖', '融', '冷', '訾', '辛', '阚', '那', '简', '饶', '空曾', '毋', '沙', '乜', '养', '鞠', '须', '丰', '巢', '关', '蒯', '相查', '后', '荆', '红', '游', '竺', '权', '逮', '盍', '益', '桓', '公', '唱', '万俟', '司马', '上官', '欧阳', '夏侯', '诸葛', '闻人', '东方', '赫连', '皇甫', '尉迟', '公羊', '澹台', '公冶', '宗政', '濮阳', '淳于', '单于', '太叔', '申屠', '公孙', '仲孙', '轩辕', '令狐', '钟离', '宇文', '长孙', '慕容', '司徒', '司空', '召', '有', '舜', '丛', '岳', '寸', '贰', '皇', '侨', '彤', '竭', '端', '赫', '实', '甫', '集', '象', '翠', '狂', '辟', '典', '良', '函', '芒', '苦', '其', '京', '中', '夕', '之', '蹇', '称', '诺', '来', '多', '繁', '戊', '朴', '回', '毓', '税', '荤', '靖', '绪', '愈', '硕', '牢', '买', '但', '巧', '枚', '撒', '泰', '秘', '亥', '绍', '以', '壬', '森', '斋', '释', '奕', '姒', '朋', '求', '羽', '用', '占', '真', '穰', '翦', '闾', '漆', '贵', '代', '贯', '旁', '崇', '栋', '告', '休', '褒', '谏', '锐', '皋', '闳', '在', '歧', '禾', '示', '是', '委', '钊', '频', '嬴', '呼', '大', '威', '昂', '律', '冒', '保', '系', '抄', '定', '化', '莱', '校', '么', '抗', '祢', '綦', '悟', '宏', '功', '庚', '务', '敏', '捷', '拱', '兆', '丑', '丙', '畅', '苟', '随', '类', '卯', '俟', '友', '答', '乙', '允', '甲', '留', '尾', '佼', '玄', '乘', '裔', '延', '植', '环', '矫', '赛', '昔', '侍', '度', '旷', '遇', '偶', '前', '由', '咎', '塞', '敛', '受', '泷', '袭', '衅', '叔', '圣', '御', '夫', '仆', '镇', '藩', '邸', '府', '掌', '首', '员', '焉', '戏', '可', '智', '尔', '凭', '悉', '进', '笃', '厚', '仁', '业', '肇', '资', '合', '仍', '九', '衷', '哀', '刑', '俎', '仵', '圭', '夷', '徭', '蛮', '汗', '孛', '乾', '帖', '罕', '洛', '淦', '洋', '邶', '郸', '郯', '邗', '邛', '剑', '虢', '隋', '蒿', '茆', '菅', '苌', '树', '桐', '锁', '钟', '机', '盘', '铎', '斛', '玉', '线', '针', '箕', '庹', '绳', '磨', '蒉', '瓮', '弭', '刀', '疏', '牵', '浑', '恽', '势', '世', '仝', '同', '蚁', '止', '戢', '睢', '冼', '种', '凃肖', '己', '泣', '潜', '卷', '脱', '谬', '蹉', '赧', '浮', '顿', '说', '次', '错', '念', '夙', '斯', '完', '丹', '表', '聊', '源', '姓', '吾', '寻', '展', '出', '不', '户', '闭', '才', '无', '书', '学', '愚', '本', '性', '雪', '霜', '烟', '寒', '少', '字', '桥', '板', '斐', '独', '千', '诗', '嘉', '扬', '善', '揭', '祈', '析', '赤', '紫', '青', '柔', '刚', '奇', '拜', '佛', '陀', '弥', '阿', '素', '长', '僧', '隐', '仙', '隽', '宇', '祭', '酒', '淡', '塔', '琦', '闪', '始', '星', '南', '天', '接', '波', '碧', '速', '禚', '腾', '潮', '镜', '似', '澄', '潭', '謇', '纵', '渠', '奈', '风', '春', '濯', '沐', '茂', '英', '兰', '檀', '藤', '枝', '检', '生', '折', '登', '驹', '骑', '貊', '虎', '肥', '鹿', '雀', '野', '禽', '飞', '节', '宜', '鲜', '粟', '栗', '豆', '帛', '官', '布', '衣', '藏', '宝', '钞', '银', '门', '盈', '庆', '喜', '及', '普', '建', '营', '巨', '望', '希', '道', '载', '声', '漫', '犁', '力', '贸', '勤', '革', '改', '兴', '亓', '睦', '修', '信', '闽', '北', '守', '坚', '勇', '汉', '练', '尉', '士', '旅', '五', '令', '将', '旗', '军', '行', '奉', '敬', '恭', '仪', '母', '堂', '丘', '义', '礼', '慈', '孝', '理', '伦', '卿', '问', '永', '辉', '位', '让', '尧', '依', '犹', '介', '承', '市', '所', '苑', '杞', '剧', '第', '零', '谌', '招', '续', '达', '忻', '六', '鄞', '战', '迟', '候', '宛', '励', '粘', '萨', '邝', '覃', '辜', '初', '楼', '城', '区', '局', '台', '原', '考', '妫', '纳', '泉', '老', '清', '德', '卑', '过', '麦', '曲', '竹', '百', '福', '言', '第五', '佟', '爱', '年', '笪', '谯', '哈', '墨', '南宫', '赏', '伯', '佴', '佘', '牟', '商', '西门', '东门', '左丘', '梁丘', '琴', '后', '况', '亢', '缑', '帅', '微生', '羊舌', '海', '归', '呼延', '南门', '东郭', '百里', '钦', '鄢', '汝', '法', '闫', '楚', '晋', '谷梁', '宰父', '夹谷', '拓跋', '壤驷', '乐正', '漆雕', '公西', '巫马', '端木', '颛孙', '子车', '督', '仉', '司寇', '亓官', '鲜于', '锺离', '盖', '逯', '库', '郏', '逢', '阴', '薄', '厉', '稽', '闾丘', '公良', '段干', '开', '光', '操', '瑞', '眭', '泥', '运', '摩', '伟', '铁', '迮', '荔菲', '辗迟']
    let fnLength = firstName.length;
    let fnIndex = Math.floor(Math.random() * fnLength);
    return firstName[fnIndex] + this.getRandomHanzi() + this.getRandomHanzi();
  },
  // 滚动到指定元素
  scrollToElement(el, params = {}) {
    let target = el;
    if (typeof el === "string") {
      try {
        target = document.querySelector(el);
      } catch (e) {
        target = null;
      }
    }
    if (!target) return;
    setTimeout(() => {
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView(params);
      }
    })
  },

  // 提取 itemContent 最外层元素的 style 样式
  getOuterStyle(itemList) {
    try {
      const itemContent =
        itemList?.[0]?.itemContent;
      if (!itemContent) return "font-family:'times new roman', 'times',  '宋体', 'Songti SC', 'SimSun';";

      // 创建一个临时 div 来解析 HTML 字符串
      const parser = new DOMParser();
      const doc = parser.parseFromString(itemContent, "text/html");
      const rootElement = doc.body.firstElementChild;

      return rootElement ? rootElement.getAttribute("style") || "" : "";
    } catch (error) {
      console.log("🚀 ~ getOuterStyle ~ error:", error);
    }
  },

    // 安全的 JSON 解析函数
     safeJsonParse(value, defaultValue = null) {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      // 如果已经是对象，直接返回
      if (typeof value === 'object' && !Array.isArray(value)) {
        return value;
      }
      // 如果是字符串，尝试解析
      if (typeof value === 'string') {
        try {
          // 检查是否是有效的 JSON 格式（以 { 或 [ 开头）
          const trimmed = value.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return JSON.parse(value);
          }
          // 如果不是 JSON 格式，返回原始值
          return value;
        } catch (e) {
          console.warn('JSON parse error:', e, 'value:', value);
          return defaultValue !== null ? defaultValue : value;
        }
      }
      return value;
    },

    // 初始化配置
    initConfig() {
      /**
     * 初始化 baseUrl 和 socketUrl
     * 如果已配置则使用配置，如果未配置则先同步设置浏览器 URL，然后异步尝试获取本地 IP 并更新
     */
      if (!window.webConfig) {
        return;
      }
      //baseUrl为空时，会自动获取本地IP并更新baseUrl  'http://10.5.4.88:8050'
      //socketUrl为空时，会自动获取本地IP并更新socketUrl "ws://10.5.4.88:8050/ws"
      
      const currentBaseUrl = (window.webConfig.baseUrl || '').trim();

      // 如果 baseUrl 和 socketUrl 都已配置，直接返回
      if (currentBaseUrl) {
        console.log('使用配置的 baseUrl:', currentBaseUrl);
        //按照baseurl 和Port 构建baseUrl 和 socketUrl
        window.webConfig.baseUrl = 'http://' + currentBaseUrl + ':' + window.webConfig.port;
        window.webConfig.socketUrl = 'ws://' + currentBaseUrl + ':' + window.webConfig.port + '/ws';
        return;
      }

      // 如果配置为空，先同步设置浏览器 URL（确保立即有可用配置）
      if (!currentBaseUrl) {
        const protocol = window.location.protocol === 'https:' ? 'https://' : 'http://';
        const hostname = window.location.hostname;
        const port = window.webConfig.port || window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
        
        // 构建完整的 URL
        const browserBaseUrl = protocol + hostname + (port && port !== '80' && port !== '443' ? ':' + port : '');
        const browserSocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + hostname + (port && port !== '80' && port !== '443' ? ':' + port : '') + '/ws';

        // 先同步设置浏览器 URL，确保立即有可用配置
        window.webConfig.baseUrl = browserBaseUrl;
        console.log('已从浏览器 URL 设置 baseUrl:', window.webConfig.baseUrl);
        window.webConfig.socketUrl = browserSocketUrl;
        console.log('已从浏览器 URL 设置 socketUrl:', window.webConfig.socketUrl);
      }
    }
};

export default tkTools;
