tinymce.PluginManager.add('formatbrush', function(editor, url) {
  var repeatStr = function (str, num) {
      return new Array(num + 1).join(str);
  };
  
  var getFamilyCn = function (editor) {
    return editor.getParam('format_brush_familyCn', "'宋体','Songti SC','SimSun'");
  };
  var getFamilyEn = function (editor) {
    return editor.getParam('format_brush_familyEn', "'Times New Roman'");
  };
  var getFontSize = function (editor) {
    return editor.getParam('format_brush_fontSize', '12pt');
  };

  var fontStyle = {
      familyCN: getFamilyCn(editor),
      familyEN: getFamilyEn(editor),
      size: getFontSize(editor),
      retCN: function () {
        return "font-family:"+ this.familyCN + ';font-size:' + this.size + ";";
      },
      retEN: function () {
        return "font-family:"+this.familyEN + ';font-size:' + this.size+ ";";
      },
      retEC: function () {
        return "font-family:"+this.familyEN + "," + this.familyCN  +";font-size:" +  this.size+ ";";
      },
  };

  //遍历子节点
  var forEachEl = function (els, func, isChildren) {
      if (typeof isChildren !== 'boolean') {
        isChildren = true;
      }
      for (var i = 0; i < els.length; i++) {
        var __el = els[i];
        if (typeof func === 'function') {
          func(__el, i);
        }
        if (isChildren && __el.childNodes.length > 0) {
          forEachEl(__el.childNodes, func);
        }
      }
  };

/**
 * @description 数字千分位格式
 * @name numberThousand
 * @param content {string}
 * @param symbol {string}
 **/
  var numberThousand = function (content, symbol) {
      var __arr = content
      // .replace(/(\d+)(\s*[^年月日%％\d+])/g, '\n$1\n$2')
      .replace(/(\d+)/g, '\n$1\n')
      .split('\n');
      
      for (var i = 0; i < __arr.length; i++)
      if (__arr[i].replace(/\s/g, '').replace(/\d+/g, '') === '' && __arr[i] !== '') {
          if (i < __arr.length - 1 && (function () {
          var __flag = ['年', '月', '日', '%', '％'];
          for (var j = 0; j < __flag.length - 1; j++) {
              if (__arr[i + 1].indexOf(__flag[j]) === 0) {
              return false;
              }
          }
          return true;
          })()) {
          if (i > 0 && ['.'].indexOf(__arr[i - 1]) > -1) {
              continue;
          }
          var __val = __arr[i]
              .split('')
              .reverse()
              .join('')
              .replace(/(\d{3})(?=\d)/g, '$1' + (symbol || ' '));
          __arr[i] = __val
              .split('')
              .reverse()
              .join('');
          }
      }
      return __arr.join('')
  };


  /**
   * @description 试题详情统计字数
   * @name wordCnt
   * @param arr {Array[String]}
   **/
  var wordCnt = function (arr) {
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
          return str.match(__reg).join('').length;
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
          return str.match(__reg).join('').length;
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
      str = str.replace(/(\d+)\s(\d+)/g, '$1$2');
      try {
          return str.match(__reg, '_').length;
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
      pasCnt: 0
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
  };

  //id生成器
  var generatorId = (function () {
      var __history = [];
      var __S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return function () {
        var __randomId = __S4() + __S4() + '-' + __S4() + '-' + __S4() + '-' + __S4() + '-' + __S4() + __S4() + __S4();
        if (__history.indexOf(__randomId) > 0) {
          return;
        } else {
          __history.push(__randomId);
        }
        return __randomId;
      }
  })();


  var keySpace = function (num) {
      return new String('&ensp;').repeat(num);
  };

  //设置字体格式
  var setWordNumFont = function (str) {
      // .replace(/(\(|（)[&nbsp;]+(）|\))/g, '$1$2')
      // .replace(/(&ensp;)|(&nbsp;)|(\s)/g, '')
      return str
        .replace(/\(/g, '（')
        .replace(/\)/g, '）')
        .replace(/﹢/g, '＋')
        .replace(/\u002b/g, '＋')
        .replace(/\u002d/g, '－')
        .replace(/\u002a/g, '×')
        .replace(/\u003d/g, '＝')
        .replace(/([a-zA-Z]+|—+)/g, '{{$1}}')
        .replace(/(\d+)/g, 's_num$1e_num')
        .replace(/e_num([\s\.])s_num/g, '$1').replace(/\.s_num(\d+)/g, 's_num.$1')
        .replace(/s_num/g, '<span style="' + fontStyle.retEN() + '; display: inline-block;">')
        .replace(/e_num/g, '</span>')
        .replace(/{{/g, '<span style="' + fontStyle.retEN() + '">')
        .replace(/}}/g, '</span>')
        .replace(/([＋－×÷＝]+)/g, '<span style="' + fontStyle.retCN() + '">$1</span>');
  };



  
var __fcForAccounting = function (el, isDebitLend, isReport, isParagraphIndentation) {
  var __fcDom = document.createElement('fc-dom');
  var __htmlStr = el.innerHTML.replace(/\n/g, '<br>');
  try {
    if (['p'].indexOf(el.childNodes[0].nodeName.toLowerCase()) < 0) {
      __fcDom.appendChild(document.createElement('p'));
      __fcDom.children[0].innerHTML = __htmlStr;
    } else
      throw new Error('The first node is Paragraph element.');
  } catch (error) {
    __fcDom.innerHTML = __htmlStr;
  } finally {
    // 替换已有表格，目的是为了后续对表格进行单独处理
    // 替换包含公式的标签，公式属于单独个体，不对其进行任何处理操作
    var __catchTagNameList = ['table', 'span', 'input'];
    var __catchEl = (function (tagNames) { // dj 查找到table和工资元素，并替换成catch-el-的tag名，将原有dom放在catchEl中
      var __result = [];
      var __isFormulaNode = function (val) {
        var __sample = ['mathquill-rendered-math', 'blank'];
        var __result = false;
        for (var k = 0; k < __sample.length; k++) {
          __result = val.indexOf(__sample[k]) === 0;
          if (__result)
            break;
        }
        return __result;
      }
      for (var i = 0; i < tagNames.length; i++) {
        var __tagItem = tagNames[i];
        // 查找指定标签
        var __elList = __fcDom.getElementsByTagName(__tagItem);
        for (var j = 0; j < __elList.length; j++) {
          var __el = __elList[j];
          if (i === 1 && (!__el.getAttribute('class') || !__isFormulaNode(__el.getAttribute('class'))))
            continue;
          __result.push(__el);
          var __pEl = __el.parentNode; // __el节点的父节点
          var __nEl = document.createElement('catch-el-' + __tagItem); // 创建的自定义新节点
          __pEl.insertBefore(__nEl, __el);
          __pEl.removeChild(__el);
          j--;
        }
      }
      return __result;
    })(__catchTagNameList);
    var __debitLendProp = {
      begin: false,
      beginFlag: '[^jd]',
      debit: '借',
      end: false,
      endFlag: '[jd^]',
      flag: '',
      lend: '贷',
      repl: /\[\^jd\]|\[jd\^\]/g
    };
    var __getParagraph = function (isSeparateTblAndPara) {
      return {
        el: (function () {
          if (isSeparateTblAndPara)
            __catchDom.innerHTML = __catchDom.innerHTML.replace(/(<table)/g, '</p>$1'); // ???
          return __catchDom.getElementsByTagName('p');
        })(),
        cnt: 0
      }
    };
    var __currentEl = __catchDom = document.createElement('catch-dom');
    var __generateParagraph = function () {
      var __isContinuation = false;
      forEachEl(__fcDom.childNodes, function (elem, index) {
        if (elem.nodeName === '#text') {
          elem.nodeValue = elem.nodeValue
            .replace(/(借)(：|:)/g, '$1：')
            .replace(/(贷)(：|:)/g, '$1：');
          if (elem.nodeValue.indexOf(__debitLendProp.beginFlag) === 0 || elem.nodeValue.indexOf(__debitLendProp.debit + '：') === 0) {
            __isContinuation = true; // 借贷会计分录开始标记（__debitLendProp.beginFlag条件成立，说明借贷格式存在多行
          }
          if (elem.nodeValue.indexOf(__debitLendProp.endFlag) === elem.nodeValue.length - __debitLendProp.endFlag.length && __isContinuation) {
            __isContinuation = false; // 借贷会计分录结束标记
          }

          __currentEl.innerHTML += elem.nodeValue.replace(__debitLendProp.repl, '');
          // console.log(__currentEl.innerHTML, __currentEl.outerHTML)
          if (!elem.nextSibling && !__isContinuation) {
            if (__currentEl.parentNode) {
              __currentEl = __currentEl.parentNode;
            }
          }
        } else if (!__isContinuation) {
          if (['br'].indexOf(elem.nodeName.toLowerCase()) > -1) {
            // 换行标签
            __currentEl.appendChild(document.createElement(elem.nodeName));
          }
          var __isCatchEl_Tbl = elem.nodeName.toLowerCase().indexOf('catch-el-table') > -1;
          if (['p'].indexOf(elem.nodeName.toLowerCase()) > -1 || __isCatchEl_Tbl) {
            // 段落或表格标签
            __catchDom.appendChild(document.createElement(elem.nodeName));
            if (__isCatchEl_Tbl) {
              __catchDom.appendChild(document.createElement('p')); // 段落标签中不能包含table标签
            }
            __currentEl = __catchDom.children[__catchDom.children.length - 1];
            // text-align:justify word-break:break-all;
            __currentEl.setAttribute(
              'style',
              'letter-spacing:0px;line-height:1.5;margin:0;padding:0;word-wrap:break-word;' +
              fontStyle.retCN()
            )
          } else {
            if (['img'].indexOf(elem.nodeName.toLowerCase()) > -1) {
              var imgElem = document.createElement(elem.nodeName);
              for (var i = 0; i < elem.attributes.length; i++) {
                imgElem.setAttribute(elem.attributes[i].nodeName, elem.attributes[i].nodeValue);
              }

              __currentEl.innerHTML += elem.outerHTML;

            } else {
              
              __currentEl.innerHTML += document.createElement(elem.nodeName).outerHTML;

            }
            if (elem.childNodes.length > 0) {
              __currentEl = __currentEl.children[__currentEl.children.length - 1];
            }
          }
        }
      });
      __catchDom.innerHTML = __catchDom.innerHTML
        .replace(/<\/span><strong>/g, '</span>')
        .replace(/(<\/strong>)+/g, '</strong>')
        .replace(/(<span>)|(<\/span>)/g, '')
        .replace(/<strong>(要求)<\/strong>/g, '<br>$1')
        .replace(/(\d+)\s+(\d+)([年月日%％])/g, '$1$2$3');
    };
    var __debitLend = function (elem) {
      __debitLendProp.reg = (function () {
        return eval('/(' + __debitLendProp.debit + '|' + __debitLendProp.lend + ')(:|：)/g');
      })();
      elem.innerHTML = elem.innerHTML.replace(/<catch-el-span><\/catch-el-span>/g, '{{catch-el-span}}');
      var __arr = (elem.innerText.indexOf('借：') > -1 || elem.innerText.indexOf('贷：') > -1) ? elem.innerText
        .replace(/\s+/g, '')
        .replace(__debitLendProp.reg, (isDebitLend ? '\n' : '') + '$1：')
        .split('\n') : [elem.innerHTML];
      var __groupId = 0;
      var __tmpPnl = document.createElement('tmp-pnl');
      while (true && __arr.length > 0) {
        if (typeof __arr[0] === 'object') {
          break;
        }
        if (!__debitLendProp.begin) {
          __debitLendProp.begin = __arr[0].indexOf(__debitLendProp.beginFlag) === 0;
          if (__debitLendProp.begin) {
            __arr[0] = __arr[0].replace(/\[\^jd\]/g, '');
            __groupId++;
          }
        }
        if (__debitLendProp.begin && !__debitLendProp.end)
          __debitLendProp.end = __arr[0].substr(__arr[0].length - __debitLendProp.endFlag.length) === __debitLendProp.endFlag;
        if (__debitLendProp.end) __arr[0] = __arr[0].replace(/\[jd\^\]/g, '');
        if (__arr[0] === '') {
          __arr.splice(0, 1);
          continue;
        }
        var __item = {
          flag: (function () {
            if (!isDebitLend) {
              return '';
            }
            if (__debitLendProp.begin || (!__debitLendProp.begin && !__debitLendProp.end)) {
              if (__arr[0].indexOf(__debitLendProp.debit + '：') === 0) {
                __debitLendProp.flag = 'debit';
              }
              if (__arr[0].indexOf(__debitLendProp.lend + '：') === 0) {
                __debitLendProp.flag = 'lend';
              }
            }
            if (__debitLendProp.flag === '' || (!__debitLendProp.begin && !__debitLendProp.end && __debitLendProp.flag === 'debit')) {
              __groupId++;
            }
            return __debitLendProp.flag;
          })(),
          /** 此处的错误，导致借贷格式出现无法封闭TABLE标签（即i === 0 || __arr[i - 1].groupId !== __arr[i].groupId条件失效）*/
          /** 将__groupId: __groupId, 修改为 groupId: __groupId,*/
          groupId: __groupId,
          text: __arr[0]
        }
        __arr.push(__item);
        __arr.splice(0, 1);
        if (__debitLendProp.end || (!__debitLendProp.begin && !__debitLendProp.end)) {
          __debitLendProp.begin = false;
          __debitLendProp.end = false;
          __debitLendProp.flag = '';
        }
      }
      var __result = '';
      for (var i = 0; i < __arr.length; i++) {
        if (__arr[i].flag !== '') {
          var __cols = __arr[i].text
            .replace(/([+-]?\d+(\.\d+)?)/g, '\t$1\n')
            .split('\n');
          for (var j = 0; j < __cols.length; j++) {
            if (__cols[j].replace(/\s+/g, '') === '') {
              __cols.splice(j, 1);
              j--;
              continue;
            }
            var __items = __cols[j].split(repeatStr('\t', 1));
            var __index = __items.length - 1;
            if (/\.(\d+)?/g.test(__items[__index])) {
              if (/\.$/g.test(__items[__index])) {
                __items[__index] = __items[__index].substr(0, __items[__index].length - 1) + repeatStr('\t', 1);
              } else {
                __items[__index] = __items[__index].replace(/\.(\d+)?/g, repeatStr('\t', 1) + '.$1');
                if (__arr[i].flag === 'debit') {
                  __items[__index] += repeatStr('\t', 2);
                }
                if (__arr[i].flag === 'lend') {
                  __items[__index] = repeatStr('\t', 2) + __items[__index];
                }
              }
            } else {
              if (__arr[i].flag === 'debit') {
                __items[__index] += repeatStr('\t', 3);
              } else {
                __items[__index] = repeatStr('\t', 2) + __items[__index] + repeatStr('\t', 1);
              }
            }
            __tmpPnl.innerHTML = '<tmp-td data-mce-resize="false">' + __items.join(repeatStr('\t', 1)).replace(/\t/g, '</tmp-td><tmp-td>') + '</tmp-td>';
            __cols[j] = __tmpPnl.innerHTML;
          }
          __arr[i].text = '<tmp-tr flag="' + __arr[i].flag + '">' + __cols.join('</tmp-tr><tmp-tr flag="' + __arr[i].flag + '">') + '</tmp-tr>';
          if (i === 0 || __arr[i - 1].groupId !== __arr[i].groupId) {
            __result += '<table data-type="debit-lend" cellpadding="0" cellspacing="0" data-mce-resize="false" class="debit-lend">' + __arr[i].text.replace(/tmp-/g, '');
          } else if (i === __arr.length - 1 || __arr[i + 1].groupId !== __arr[i].groupId) {
            __result += __arr[i].text.replace(/tmp-/g, '') + '</table>';
          } else {
            __result += __arr[i].text.replace(/tmp-/g, '');
          }
        } else {
          __result += (i > 0 ? '<br>' : '') + __arr[i].text;
        }
      }
      elem.innerHTML = __result.replace(/{{catch-el-span}}/g, '<catch-el-span></catch-el-span>');
    };
    var __grouping = function () {
      __catchDom.innerHTML = __catchDom.innerHTML
        .replace(/(&nbsp;)+(<catch-el-span)/g, '$2')
        .replace(/(<\/catch-el-span>)(&nbsp;)+/g, '$1');
      // 换行=>br标签或换段=>p标签都属于另起段落
      var __paragraph = __getParagraph();
      var __enspStr = (function () {
        if (!isParagraphIndentation) {
          return '';
        } else {
          return keySpace(4);
        }
      })();
      forEachEl(__paragraph.el, function (elem, index) {
        if (elem.innerHTML.replace(/(<br>)+\s+/g, '') === '') {
          return;
        }
        elem.innerHTML = elem.innerHTML
          .replace(/(（)&nbsp;\s|\s+(）)/g, '$1$2')
          .replace(/(&nbsp;)/g, '&ensp;&ensp;'); // &nbsp;空格要替换为&nesp;（半角空格，1个汉字占两个半角空格）
        if (isDebitLend) {
          __debitLend(elem);
        }
        // 是否格式化借贷会计分录
        else {
          elem.innerHTML = elem.innerHTML.replace(/(\s+<br>)|(<br>\s+)/g, '');
        }
        elem.innerHTML = elem.innerHTML
          .replace(/(要求)(:|：)/g, '<br>$1$2<br>')
          .replace(/(已知)(:|：)/g, '<br>$1$2')
          .replace(/(要求)(:|：)/g, '<strong>$1</strong>$2<br>')
          .replace(/(<br>)+/g, '<br>')
          .replace(/<br>(\s+)/g, '<br>')
          .replace(/\s+<br>/g, '<br>');
        if (index === 0 && elem.innerHTML.indexOf('<br>') === 0) {
          elem.innerHTML = elem.innerHTML.substr(4);
        }
        var __childNodesCnt = elem.childNodes.length;
        if (__childNodesCnt > 0 && elem.childNodes[__childNodesCnt - 1].nodeName.toLowerCase() === 'br') {
          elem.removeChild(elem.childNodes[__childNodesCnt - 1]);
        }
        elem.innerHTML = (__paragraph.cnt > 0 ?
          (elem.innerHTML.indexOf(__enspStr.replace(/(&ensp;)/g, ' ')) < 0 ?
            __enspStr : '') : '') +
          elem.innerHTML
            .replace(/(（)&nbsp;\s|\s+(）)/g, '$1$2')
            .replace(/(&nbsp;)/g, '&ensp;&ensp;')
            .replace(/<br>/g, '<br>' + __enspStr)
            .replace(__debitLend.reg, (isDebitLend ? '\n' : '') + '$1：')
            .replace(/(\(|（)(）|\))/g, '$1' + keySpace(8) + '$2');
        elem.innerHTML = elem.innerHTML.replace(/\s+<br>/g, '<br>');
        if (elem.innerHTML.indexOf('<br>') === 0) {
          elem.innerHTML = elem.innerHTML.substr(4);
        }
        __paragraph.cnt++;
      }, false);
    };
    var __restoreTags = function (tagNames) {
      for (var i = 0; i < tagNames.length; i++) {
        var __tagName = tagNames[i]
        var __result = __catchDom.getElementsByTagName('catch-el-' + __tagName);
        forEachEl(__result, function (elem, index) {
          var __cEl = document.createElement(__tagName);
          var __pEl = elem.parentNode;
          __pEl.insertBefore(__cEl, elem);
          __cEl.innerHTML = __catchEl[0].innerHTML;
          var __attrs = __catchEl[0].attributes;
          for (var j = 0; j < __attrs.length; j++) {
            __cEl.setAttribute(__attrs[j].nodeName, __attrs[j].nodeValue)
          }
          __catchEl.splice(0, 1);
        }, false);
        while (__result.length > 0) {
          __result[0].parentNode.removeChild(__result[0]);
        }
      }
    };
    var __edtFormat = function () {
      var __isThousand = true;
      forEachEl(__catchDom.children, function (elem, index) {
        if (elem.nodeName === '#text' && elem.parentNode.nodeName.toLowerCase() !== 'var' && elem.parentNode.nodeName.toLowerCase() !== 'span') {
          elem.nodeValue = setWordNumFont(numberThousand(elem.nodeValue));
        }
      });
      __catchDom.innerHTML = __catchDom.innerHTML
        .replace(/(&lt;)/g, '<')
        .replace(/(&gt;)/g, '>')
      var __result = __catchDom.getElementsByTagName('table');
      for (var i = 0; i < __result.length; i++) {
        var item = __result[i];
        // let tblStyle = $(item).attr('style')
        // item.setAttribute('style', tblStyle);
        // item.setAttribute('style', fontStyle.retCN());
        var __flag = ''; // 'debit' 借贷会计分录的借标记; 'lend' 借贷会计分录的贷标记
        try {
          // debugger
          if (item.dataset.mceResize =='false' || item.dataset.type === 'debit-lend') {
            item.dataset.type = 'debit-lend'
            item.setAttribute('cellpadding', 0);
            item.setAttribute('cellspacing', 0);
            item.removeAttribute('class');
            item.removeAttribute('style');
            forEachEl(item.getElementsByTagName('tr'), function (elem, index) {
              if (elem.innerText.indexOf(__debitLendProp.debit + '：') > -1) {
                __flag = 'debit';
              }
              if (elem.innerText.indexOf(__debitLendProp.lend + '：') > -1) {
                __flag = 'lend';
              }
              elem.setAttribute('flag', __flag);
            }, false);
            __flag = '';
          }
        } finally {
          if (item.dataset.type === 'debit-lend' && !isDebitLend) {
            continue;
          }
          var __findChar = '——';
          var __rows = 0;
          var __trs = __result[i].getElementsByTagName('tr');
          for (var j = 0; j < __trs.length; j++) {
            var __tr = __trs[j];
            if (item.dataset.type === 'debit-lend' && isDebitLend) {
              var __tmpFlag = __tr.getAttribute('flag');
              if (__flag !== __tmpFlag) {
                __flag = __tr.getAttribute('flag');
                __rows = 0;
              }
              var __innerText = __tr.children[0].innerText.replace(/(&ensp;)|(&nbsp;)|\s/g, '');
              var __tmpPosition = __innerText.lastIndexOf(__findChar);
              __tr.setAttribute('position', (function () {
                if (__tmpPosition > -1) {
                  var __innerTextCnt = wordCnt(__innerText.substr(0, __tmpPosition));
                  __tmpPosition = __innerTextCnt.chrCnt + __innerTextCnt.cnCnt * 2 + __innerTextCnt.cnPun * 2;
                  if (__rows === 0) {
                    __tmpPosition -= 4;
                  }
                  return __tmpPosition;
                } else {
                  return __tmpPosition;
                }
              })());
              var __defPosition = (function () {
                var __result = 0;
                if (__rows > 0) {
                  if (__innerText.indexOf(__findChar) === 0) {
                    var __tp = parseFloat(__trs[j - 1].getAttribute('position'));
                    if (__tp < 0) __tp = 0;
                    __trs[j].setAttribute('position', __tp);
                    __result = __tp + 4;
                  } else {
                    __result = 4;
                  }
                }
                if (__flag === 'lend') {
                  __result += 4;
                }
                return __result;
              })();
              var __enspStr = keySpace(__defPosition);
              __tr.children[0].innerHTML = __enspStr + setWordNumFont(numberThousand(__innerText));
              forEachEl(__tr.childNodes, function (elem, index) {
                var __styleStr = 'border:none;line-height:1.5;padding:0;';
                if (index > 0 && elem.innerHTML !== '') {
                  __styleStr += fontStyle.retEN();
                } else {
                  __styleStr += fontStyle.retCN() + (index === 0 ? 'padding-right:6px;' : '');
                }
                if ([1, 3].indexOf(index) > -1) {
                  __styleStr += 'text-align:right;';
                }
                if (elem.innerText.indexOf('.') === 0) {
                  elem.innerText = elem.innerText.replace(/\s+/g, '');
                }
                elem.setAttribute('style', __styleStr);
                if ([1, 3].indexOf(index) > -1) {
                  elem.innerHTML = setWordNumFont(numberThousand(elem.innerText));
                } else {
                  elem.innerHTML = setWordNumFont(elem.innerText)
                }
              }, false);
              __rows++;
            } else if (isReport) {
              forEachEl(__tr.childNodes, function (elem, index) {
                var __styleStr = 'border-bottom:' + elem.style.borderBottom +
                  ';border-left:' + elem.style.borderLeft +
                  ';border-right:' + elem.style.borderRight +
                  ';border-top:' + elem.style.borderTop + ';';
                __styleStr = 'border-bottom:' + (elem.style.borderBottom !== 'none' ?  (elem.style.borderBottomWidth === '' ? '1px' : elem.style.borderBottomWidth) + ' ' +
                  (elem.style.borderBottomStyle === '' ? 'solid' : elem.style.borderBottomStyle) + ' ' +
                  (elem.style.borderBottomColor === '' ? 'rgb(0,0,0)' : elem.style.borderBottomColor) : elem.style.borderBottom) + ';';
                __styleStr +='border-left:' + (elem.style.borderLeft !== 'none' ?  (elem.style.borderLeftWidth === '' ? '1px' : elem.style.borderLeftWidth) + ' ' +
                  (elem.style.borderLeftStyle === '' ? 'solid' : elem.style.borderLeftStyle) + ' ' +
                  (elem.style.borderLeftColor === '' ? 'rgb(0,0,0)' : elem.style.borderLeftColor) : elem.style.borderLeft) + ';';
                __styleStr +='border-right:' + (elem.style.borderRight !== 'none' ?  (elem.style.borderRightWidth === '' ? '1px' : elem.style.borderRightWidth) + ' ' +
                  (elem.style.borderRightStyle === '' ? 'solid' : elem.style.borderRightStyle) + ' ' +
                  (elem.style.borderRightColor === '' ? 'rgb(0,0,0)' : elem.style.borderRightColor) : elem.style.borderRight) + ';';
                __styleStr +='border-top:' + (elem.style.borderTop !== 'none' ?  (elem.style.borderTopWidth === '' ? '1px' : elem.style.borderTopWidth) + ' ' +
                  (elem.style.borderTopStyle === '' ? 'solid' : elem.style.borderTopStyle) + ' ' +
                  (elem.style.borderTopColor === '' ? 'rgb(0,0,0)' : elem.style.borderTopColor) : elem.style.borderTop) + ';';
                __styleStr += elem.style.width ? `width: ${elem.style.width}` : ''
                __styleStr += elem.style.height ? `height: ${elem.style.height}` : ''
                elem.setAttribute('style', __styleStr);
                if (elem.children.length > 0 && ['p'].indexOf(elem.children[0].nodeName.toLowerCase()) > -1) {
                  elem.children[0].innerHTML = setWordNumFont(numberThousand(elem.children[0].innerText));
                } else {
                  elem.innerHTML = setWordNumFont(numberThousand(elem.innerText));
                }
              }, false)
            }
          }
        }
      }
      // 设置表格样式
      __tblInnerFormat(__result)
    };
    function __tblInnerFormat(tbl) {
      $(tbl).each((index, tbl_item) => {
        // 格式刷表格内容
        let $tblItem = $(tbl_item)
        if (!$tblItem.attr('data-type')) {
          // 表格边框，去掉border属性，增加border-width
          let tBorder = $tblItem.attr('border')
          $tblItem.removeAttr('border')
          if(tBorder && tBorder != 0) {
            let tblStyle = $tblItem.attr('data-mce-style')
            if (!tblStyle) {
              tblStyle = $tblItem.attr('style')
            }
            if(tBorder.endsWith("px")){
                tBorder = tBorder.replaceAll("px","")
            }
            $tblItem.attr('style', tblStyle + ';border-width: ' + tBorder+'px;')
            $tblItem.attr('data-mce-style', tblStyle + ';border-width: ' + tBorder+'px;')
          }

          let tdInnerDoms = $tblItem.find('tr *, caption, caption *')
          tdInnerDoms.each((index, item) => {
            let initStyle = fontStyle.retEC()
              , tdStyle = $(item).attr('data-mce-style') || $(item).attr('style')
            if (item.nodeName == 'TD') {
              initStyle += tdStyle
            } else {
              let styleArr = tdStyle?.split(";")??[]
              styleArr.forEach(_s =>  {
                if (_s.indexOf('text-align:') !== -1) {
                  initStyle += _s
                }
              })
            }
            $(item).attr('style', initStyle)
            $(item).attr('data-mce-style', initStyle)
          })
        }
      })
    }
    // 重组DOM
    __generateParagraph();
    __grouping();
    __restoreTags(__catchTagNameList);
    // 修改字体样式，及借贷格式的缩进
    __edtFormat();
    // 去除空白段落
    var __removeBlankParagraphs = __getParagraph(true);
    for (var i = 0; i < __removeBlankParagraphs.el.length; i++) {
      var __item = __removeBlankParagraphs.el[i];
      var __pEl = __item.parentNode;
      if (__item.innerHTML.replace(/((<br>)|(&nbsp;)|(&ensp;)|\s)+/g, '') === '') {
        __pEl.removeChild(__item);
        i--;
      }
    }
    return __catchDom.innerHTML
      .replace(/(<\/p>)(<br>)+/g, '$1')
      .replace(/(<br>)+/g, '<br>');
  };
};


  var  doFormatbrush = function(){
    var __tmpEl = document.createElement('tmp-el');
    __tmpEl.innerHTML = editor.getContent();
    
    var paragraphParseFlag =  [5, 6, 7, 9, 10].indexOf(parseInt(editor.settings.itemTypeId)) >= 0
    var result =  __fcForAccounting(__tmpEl, true , true, paragraphParseFlag);
    
    editor.setContent(result)
    // editor.focus(false);
  }

  //注册一个命令
  editor.addCommand('formatbrush', function () {
    doFormatbrush();
  });

  // 注册一个工具栏按钮名称
  editor.ui.registry.addButton('formatbrush', {
  icon: 'formatbrush',
  tooltip: 'formatbrush',
    onAction: function () {
      doFormatbrush();
    }
  });


  // 注册一个菜单项名称 menu/menubar
  editor.ui.registry.addMenuItem('formatbrush', {
    icon: 'formatbrush',
    tooltip: 'formatbrush',
    text:'formatbrush',
      onAction: function () {
        doFormatbrush();
      }
  });

  return {
    getMetadata: function () {
      return  {
        //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
        name: "formatbrush",//插件名称
        url: "", //作者网址
      };
    }
  };
});

