if (Date.prototype && !Date.prototype.Format)
  Date.prototype.Format = function (fmt) {
    let obj = {
      "M+": this.getMonth() + 1, // 月
      "d+": this.getDate(), // 日
      "h+": this.getHours(), // 时
      "m+": this.getMinutes(), // 分
      "s+": this.getSeconds(), // 秒
      "q+": Math.floor((this.getMonth() + 3) / 3), // 季
      S: this.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        `${this.getFullYear()}`.substr(4 - RegExp.$1.length)
      );
    for (var key in obj) {
      if (new RegExp(`(${key})`).test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? obj[key]
            : `00${obj[key]}`.substr(`${obj[key]}`.length)
        );
    }
    return fmt;
  };

/**
 * @author 张浩(Hao.Zhang)
 * @description 根据iframe中的内容，自适应大小。
 * @example autoSetFrameSizeByHeight()
 * @method autoSetFrameSizeByHeight
 */
export const autoSetFrameSizeByHeight = (window) => {
  if (window.frameElement)
    window.onload = function () {
      window.frameElement.style.height = `${this.document.documentElement.offsetHeight}px`;
    };
};

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
export const merge = (source, target) => {
  if (typeof target === "undefined") target = {};
  for (let key in source) {
    if (!target[key]) {
      target[key] = source[key];
    }
    if (typeof target[key] === "object" && target[key] instanceof Object) {
      merge(source[key], target[key]);
    }
  }
  return target;
};

/**
 * @author 张浩(Hao.Zhang)
 * @description DOM元素观察者模式
 * @method mutationObserver
 * @param obj { Object } 元素对象
 * @param func { function } 当元素发生变化时，执行func方法
 * @returns { Object }
 */
export const mutationObserver = (obj, func) => {
  if (Object.prototype.toString.call(func) !== "[object Function]") {
    return null;
  }
  let result = new (window.mutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver)((mutationList) => {
    func(mutationList);
  });
  result.observe(obj, {
    // attributes: true, // 观察属性
    attributeFilter: ["style"], // 指定观察属性元素集合
    // attributeOldValue: true, // 保存属性旧值
    // characterData: true, // 观察数据
    // characterDataOldValue: true, // 保存数据旧值
    // childList: true, // 观察子元素
    subtree: true, // 观察所有后代
  });
  return result;
};

/**
 * @author 张浩(Hao.Zhang)
 * @description 用于数据请求生成随机号，具体用处暂不清楚
 * @method reqSsnCre
 */
export const reqSsnCre = (length) => {
  let result = "";
  let randomNum = (min, max) => Math.floor(min + (Math.random() * max - min));
  for (let i = 0; i < (length || 0); i++)
    // if (i % 2) result += String.fromCharCode(randomNum(65, 90))
    // else
    result += randomNum(0, 9);
  return result;
};

/**
 * @author 张浩(Hao.Zhang)
 * @description 依据当前系统时间，生成日期+时间序号
 * @example serialNumber() 返回结果为：20180801174632251
 * @method serialNumber
 * @param formatStr { String } 格式参数，如：yyyyMMddhhmmss，默认使用 yyyyMMddhhmmss
 * @returns { String } 根据参数formatStr，返回日期+时间
 */
export const serialNumber = (formatStr) => {
  let nDate = new Date();
  try {
    return nDate.format(formatStr || "yyyyMMddhhmmss");
  } catch (error) {
    return nDate.getTime();
  }
};

/**
 * @author 张浩(Hao.Zhang)
 * @description 依据当前系统时间，生成日期+时间序号
 * @example wrdLimit() 返回结果为：20180801174632251
 * @method wrdLimit
 * @param obj { Object } 元素对象集合
 * @param wrdLength { Number } 要显示的字符串长度
 * @returns { void }
 */
export const wrdLimit = (obj, wrdLength) => {
  let cntLength = 0;
  for (let i = 0; i < obj.childNodes.length; i++) {
    console.log(obj.childNodes[i]);
    // var htmlStr = obj.childNodes[i].innerHTML;
    // var strLength = obj.innerText.length;
    // if (strLength > wrdLength) {
    //   obj.innerHTML = nowhtml.substr(0,wrdLength)+'...';
    // }
  }
};

/**
 * @author dj
 * @description 切割路径后面的参数
 * @example
 * @method gParseUrlParam
 * @param paramStr '?name=anan&age=18'字符串
 * @returns { void }
 */
export const gParseUrlParam = function (paramStr, isFrw) {
  var str2 = paramStr.slice(1, paramStr.length);
  var arr1 = str2.split("&");
  var paramObj = {};
  arr1.forEach((item) => {
    var arrTemp = item.split("=");
    paramObj[arrTemp[0]] = arrTemp[1];
  });
  return paramObj;
};

// 试题详情统计字数
/**
 * @description 试题详情统计字数
 * @name wordCount
 * @param arr {Array[String]}
 **/
export const wordCount = function (arr) {
  /** 正则
   * \uff10-\uff19 => 全角数字
   * \uff21-\uff3a => 全角大写英文字符
   * \uff41-\uff5a => 全角小写英文字符
   * \u30-\u39 => 半角数字
   * \u41-\u5a => 半角大写英文字符
   * \u61-\u7a => 半角小写英文字符
   *
   */
  var __cn_count = function (str) {
    // 正则验证中文
    var reg = /[\u4e00-\u9fa5]/g;
    try {
      return str.match(reg).length;
    } catch (error) {
      return 0;
    }
  };
  var __en_count = function (str) {
    // 正则验证英文(以单词为单位)
    var reg = /[a-zA-Z]+/g;
    try {
      return str.match(reg).length;
    } catch (error) {
      return 0;
    }
  };
  var __char_count = function (str) {
    // 正则验证标点及符号（包括全角或半角）
    var reg = /[^a-zA-Z0-9\u4e00-\u9fa5\s]+/g;
    try {
      return str.match(reg).join("").length;
    } catch (error) {
      return 0;
    }
  };
  var __number_count = function (str) {
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
};

/**
 *
 * @param {#000} color
 * @returns 转为RGBA(0,0,0,0.2)
 */
export const convertColorRgb = (color, opacity = 1) => {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  var sColor = color.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = "#";
      for (var i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return `rgba(${sColorChange.join(",")},${opacity})`;
  } else {
    return sColor;
  }
};

// 防抖
export const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, delay);
  };
};
