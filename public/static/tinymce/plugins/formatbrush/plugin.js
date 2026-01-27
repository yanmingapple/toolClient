tinymce.PluginManager.add('formatbrush', function(editor, url) {
  //替换字符串
  var repeatStr = function (str, num) {
      return new Array(num + 1).join(str);
  };
  //获取格式刷非数字的正文字体
  var getFamilyCn = function (editor) {
    return editor.getParam('format_brush_familyCn', "'宋体','Songti SC','SimSun'");
  };
  //获取数字字体
  var getFamilyEn = function (editor) {
    return editor.getParam('format_brush_familyEn', "'Times New Roman'");
  };
  //获取字体大小配置
  var getFontSize = function (editor) {
    return editor.getParam('format_brush_fontSize', '12pt');
  };
  //获取需要置换的字符配置
  var getTransterCharacter = function (editor) {
    return editor.getParam('format_brush_transfer_character', 
    [
      {key:'(',value:'（'},
      {key:')',value:'）'},
      {key:'﹢',value:'＋'},
      {key:'/\\\u002b/g',value:'＋'},//ascii转码的+
      {key:'/\\\u002d/g',value:'－'},//ascii转码的-
      {key:'/\\\u002a',value:'×'},//ascii转码的*
      {key:'/\\\u003d/g',value:'＝'},//ascii转码的=
    ]);
  };

  //获取数字千分位格式化配置
  var getSupportNumberThousand = function (editor) {
    return editor.getParam('format_brush_supportNumberThousand', true);
  };

  //段落缩进空格
  var getParagraphIndentSpaces = function (editor) {
    return editor.getParam('format_brush_paragraph_indent_spaces', "&ensp;");
  };
  //段落缩进空格数量
  var getParagraphIndentSpacesNumber = function (editor) {
    return editor.getParam('format_brush_paragraph_indent_spaces_number', 4);
  };
  
    //段落对齐方式
    var getParagraphAlign = function (editor) {
      return editor.getParam('format_brush_align', 'left');
    };
  
  
  var fontStyle = {
      familyCN: getFamilyCn(editor),
      familyEN: getFamilyEn(editor),
      size: getFontSize(editor),
      align:getParagraphAlign(editor),
      //非数字的正文字体
      retCN: function () {
        return "font-family:"+ this.familyCN + ';font-size:' + this.size + ";text-align:" + this.align;
      },
      //取数字字体
      retEN: function () {
        return "font-family:"+this.familyEN + ';font-size:' + this.size+ ";text-align:" + this.align;
      },
      //数字和正文字体
      retEC: function () {
        return "font-family:"+this.familyEN + "," + this.familyCN  +";font-size:" +  this.size+ ";text-align:" + this.align;
      },
  };

  //格式刷配置项
  var brushConfig = {
    transterCharacter:getTransterCharacter(editor),
    supportNumberThousand:getSupportNumberThousand(editor),
    paragraphIndentSpaces:getParagraphIndentSpaces(editor),
    paragraphIndentSpacesNumber:getParagraphIndentSpacesNumber(editor),
  }

  //公用方法遍历子节点
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
 * @param content {string}替换的内容
 **/
  var numberThousand = function (content) {
     //没有内容
     if(!content){
      return '';
     }

    //如果配置不需要格式化千分位，就跳过
    if(!brushConfig.supportNumberThousand){
      return content;
    }
   
    //带有年月日，百分百的，不处理为千分位
    var _specialChar = ['年', '月', '日', '%', '％','.'];
    //是否包括特殊符号
    function isInCludesSpecialChar(tx){
      return _specialChar.some(e=>{
        return  tx.indexOf(e) === 0
      })
    }

     //是否小数
     function isInCludesDecimalPoint (tx){
      return tx == '.'
    }

    //替换的符号
    let symbol = ' ';

      var __arr = content
      .replace(/(\d+)/g, '\n$1\n')//将数字替换成特殊格式  a123 3b 变为"a\n123\n \n3\nb"
      .split('\n');
      //分割后变成如下格式
      // 0: "a"
      // 1: "123"
      // 2: " "
      // 3: "3"
      // 4: "b"
      
      for (var i = 0; i < __arr.length; i++){
        var  currText = __arr[i];
        var lastText = i > 0 ? __arr[i - 1].replace(/\s+$/g,''):'';
        var nextText = i < __arr.length - 1 ? __arr[i + 1].replace(/\s+$/g,''):'';
        //当前纯数字,上一个或下一个 不包括 需要规避特殊处理的符号
        if (/^\d+$/.test(currText) && !isInCludesSpecialChar(nextText) && !isInCludesDecimalPoint(lastText) && currText.length > 3) {

          //先分割为数字数组，倒序后，按照每隔三位加一个空格 然后正序排列为正确的格式后的千分位
          __arr[i] = __arr[i]
                .split('')
                .reverse()
                .join('')
                .replace(/(\d{3})(?=\d)/g, '$1' + symbol)//千分位替换空格
                .split('')
                .reverse()
                .join('');
        }
      }
      return __arr.join('')
  };

  var keySpace = function (num) {
      return new String(brushConfig.paragraphIndentSpaces).repeat(num);
  };
 
  //设置字体置换的符号与设置字体格式
  var replaceCharacterAndSetFont = function (str) {
      brushConfig.transterCharacter.forEach(e =>{
        //正则的按照正则解析 
        if(e.key.endsWith("/g")){
          str = str.replaceAll( eval(e.key), e.value)
        }else{
          str = str.replaceAll( e.key, e.value)
        }
      })
      //非汉字
      //字母与减号
      str = str.replace(/([a-zA-Z]+|—+)/g, '{{$1}}')
      //非小数
      str = str.replace(/(\d+)/g, 's_num$1e_num')
       //小数
       str = str.replace(/e_num([\s\.])s_num/g, '$1').replace(/\.s_num(\d+)/g, 's_num.$1')
      //设置数字体样式
      str = str.replace(/s_num/g, '<span style="' + fontStyle.retEN() + '; display: inline-block;">').replace(/e_num/g, '</span>')
      //设置非数字体样式
      str = str.replace(/{{/g, '<span style="' + fontStyle.retEN() + '">').replace(/}}/g, '</span>')

      //设置特殊字符的字体样式
      str = str.replace(/([%‰‱]+)/g, '<span style="' + fontStyle.retEN() + '">$1</span>');
      return str;
  };



  
  var __fcForAccounting = function (el) {
    var __fcDom = document.createElement('fc-dom');
    var __htmlStr = el.innerHTML//.replace(/\n/g, '<br>');
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
      var __catchTagNameList = ['table', 'span', 'input','sup'];
      var __catchEl = (function (tagNames) { // dj 查找到table和工资元素，并替换成catch-el-的tag名，将原有dom放在catchEl中
        var __result = [];
        //是否是特殊节点，公式，input框
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
        //是否是特殊节点，下划线
        var __isSpecialNode = function (val) {
          var __sample = ['text-decoration'];
          var __result = false;
          if(val){
            for (var k = 0; k < __sample.length; k++) {
              __result = val.indexOf(__sample[k]) === 0;
              if (__result)
                break;
            }
          }
          return __result;
        }

        for (var i = 0; i < tagNames.length; i++) {
          var __tagItem = tagNames[i];
          // 查找指定标签
          var __elList = __fcDom.getElementsByTagName(__tagItem);
          for (var j = 0; j < __elList.length; j++) {
            var __el = __elList[j];
            //span标签处理特殊，其他的过滤掉
            if (__tagItem == 'span' && (!__isSpecialNode(__el.getAttribute('style')) && (!__el.getAttribute('class') || !__isFormulaNode(__el.getAttribute('class')))) )
              continue;

              //缓存一个替换的标签
              __result.push(__el);

             // __el节点的父节点,找到后，插入一个自定义的标签,替换原来的标签
            var __pEl = __el.parentNode;
            var __nEl = document.createElement('catch-el-' + __tagItem); // 创建的自定义新节点
            __pEl.insertBefore(__nEl, __el);
            __pEl.removeChild(__el);
            j--;
          }
        }
        return __result;
      })(__catchTagNameList);


      var __currentEl = __catchDom = document.createElement('catch-dom');
      //主要作用是将一个段落的内容重新组合为一个新段落，去掉不需要的标签，留取文字 ,正常，第一次格式化后，每次格式化后得到的结果必须一致
      var __generateParagraph = function () {
        //__fcDom 原文档，轮训自节点进行处理
        forEachEl(__fcDom.childNodes, function (elem, index) {
          //文本的话，取文本内容
          if (elem.nodeName === '#text') {
            elem.nodeValue = elem.nodeValue
            __currentEl.innerHTML += elem.nodeValue;
            if (!elem.nextSibling) {
              if (__currentEl.parentNode) {
                __currentEl = __currentEl.parentNode;
              }
            }
          } else{
            if (['br'].indexOf(elem.nodeName.toLowerCase()) > -1) {
              // 换行标签
              __currentEl.appendChild(document.createElement(elem.nodeName));
            }
            //判断是否为缓存的表格组件
            const __isCatchEl_Tbl = elem.nodeName.toLowerCase().indexOf('catch-el-table') > -1
            if (['p'].indexOf(elem.nodeName.toLowerCase()) > -1 || __isCatchEl_Tbl) {
              // 段落或表格标签
              __catchDom.appendChild(document.createElement(elem.nodeName));

              //如果是表格，新增一个段落标签在表格后面
              if (__isCatchEl_Tbl) {
                __catchDom.appendChild(document.createElement('p')); // 段落标签中不能包含table标签
              }
              //将当前操作标签设置为 标签这只为新的段落标签
              __currentEl = __catchDom.children[__catchDom.children.length - 1];

              //设置为正文内容标签样式
              __currentEl.setAttribute(
                'style',
                'letter-spacing:0px;line-height:1.5;margin:0;padding:0;word-wrap:break-word;' +
                fontStyle.retCN()
              )
            } else {
              //图片特殊处理,需要将属性全部绑定
              if (['img'].indexOf(elem.nodeName.toLowerCase()) > -1) {
                var imgElem = document.createElement(elem.nodeName);
                for (var i = 0; i < elem.attributes.length; i++) {
                  imgElem.setAttribute(elem.attributes[i].nodeName, elem.attributes[i].nodeValue);
                }
                __currentEl.innerHTML += elem.outerHTML;
              } else {
                //其他标签，不做处理
                __currentEl.innerHTML += document.createElement(elem.nodeName).outerHTML;
  
              }
              //如果有子节点，轮训自动到子节点，故，这里需要设置为当前第一个作为当前节点,得到带标签的代码块:<p>1212<span>sds</span></p>
               if (elem.childNodes.length > 0) {
                __currentEl = __currentEl.children[__currentEl.children.length - 1];
              }
            }
          }
        });


        //替换需要清除的标签,上面组合后带代码块，故需要处理，span要替换掉，还有其他标签，根据业务要求替换，比如财政部的要求是加粗
        __catchDom.innerHTML = __catchDom.innerHTML
        .replace(/(<span>)|(<\/span>)/g, '')
        .replace(/(\d+)\s+([年月日%％])/g, '$1$2');
        // "20 24年12月 12 日 12 %  D %".replace(/(\d+)\s+([年月日%％])/g, '$1$2')  得到 "20 24年12月 12日 12%  D %"
        // console.log( __catchDom.innerHTML)
      };
 
      //获取段落方法
      var __getParagraph = function (isSeparateTblAndPara) {
        return {
          el: (function () {
            if (isSeparateTblAndPara){
              return __catchDom.getElementsByTagName('p').pushAll(__catchDom.getElementsByTagName("catch-el-table"));
            }
              // __catchDom.innerHTML = __catchDom.innerHTML.replace(/(<table)/g, '</p>$1'); // ???
            return __catchDom.getElementsByTagName('p');
          })(),
          cnt: 0
        }
      };

      
      //重新组合
      var __grouping = function () {
        //暂时不知道做什么，后面测试验证
        __catchDom.innerHTML = __catchDom.innerHTML
          .replace(/(&nbsp;)+(<catch-el-span)/g, '$2')
          .replace(/(<\/catch-el-span>)(&nbsp;)+/g, '$1');


       //段落需要空多少位置
        var __enspStr = (function () {
          if (brushConfig.paragraphIndentSpacesNumber == 0) {
            return '';
          } else {
            return keySpace(brushConfig.paragraphIndentSpacesNumber);
          }
        })();

        //得到所有的p标签
        var __paragraph = __getParagraph();
        forEachEl(__paragraph.el, function (elem, index) {
          //去掉br与空白后，内容是否为空，为空就不继续处理
          if (elem.innerHTML.replace(/(<br>)+\s+/g, '') === '') {
            return;
          }
          //第一步 将（  ）替换成（） 就是将空白符号去掉,第二步，将&nbsp;全称是‌No-Break Space‌替换成两个半角符号&ensp;
          //&ensp;是两个一个空格  &ensp;是一个&nbsp; ，一个字母等于&ensp; 一个汉字两个&ensp;
          elem.innerHTML = elem.innerHTML
          .replace(/(（)&nbsp;\s|\s+(）)/g, '$1$2')
          .replace(/(&nbsp;)/g, keySpace(2)); // &nbsp;空格要替换为&nesp;（半角空格，1个汉字占两个半角空格）

          //换行后面有空格的  的全部替换''
          elem.innerHTML = elem.innerHTML.replace(/(\s+<br>)|(<br>\s+)/g, '');
          elem.innerHTML = elem.innerHTML
            .replace(/(<br>)+/g, '<br>')//多个br留下一个
            .replace(/<br>(\s+)/g, '<br>')//去掉br后方空白
            .replace(/\s+<br>/g, '<br>');//去掉br前方空白

            //第一个段落，有换行的话，去掉
          if (index === 0 && elem.innerHTML.indexOf('<br>') === 0) {
            elem.innerHTML = elem.innerHTML.substr(4);
          }

          //当前段落有子节点，最后一个br换行的去掉
          var __childNodesCnt = elem.childNodes.length;
          if (__childNodesCnt > 0 && elem.childNodes[__childNodesCnt - 1].nodeName.toLowerCase() === 'br') {
            elem.removeChild(elem.childNodes[__childNodesCnt - 1]);
          }

          //没有缩进，加上缩进位置
          elem.innerHTML = 
          (elem.innerHTML.startsWith(__enspStr.replace(/(&ensp;)/g, ' ')) ? "": __enspStr )//处理段落前方的缩进
          + 
          elem.innerHTML
              .replace(/(（)&nbsp;\s|\s+(）)/g, '$1$2')//去掉括号中间的位置
              .replace(/(&nbsp;)/g, keySpace(2))//将一个空格换成两个半角，即一个汉字
              .replace(/(\(|（)(）|\))/g, '$1' + keySpace(8) + '$2');//括号中间保留4个汉字位置
        }, false);
      };

      //将特殊的内容进行置换,包括属性
      var __restoreTags = function () {
        __catchTagNameList.forEach(__tagName=>{
          var __result = __catchDom.getElementsByTagName('catch-el-' + __tagName);
          forEachEl(__result, function (elem) {
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
        })
      };

      var __edtFormat = function () {
        var _forEachEl = function (els, func) {
          let loopChild = true;
          for (var i = 0; i < els.length; i++) {
            var __el = els[i];
            if (typeof func === 'function') {
              loopChild = func(__el, i);
            }
    
            if (loopChild && __el.childNodes.length > 0) {
              _forEachEl(__el.childNodes, func);
            }
          }
        };

      _forEachEl(__catchDom.children, function (elem) {

       
          if (elem.nodeName === 'TABLE' && elem.dataset.type =="debit-lend") {
            return false;
          }
          else if (elem.nodeName === 'TD') {
            elem.innerHTML = replaceCharacterAndSetFont(numberThousand(elem.innerText));
            return false;
          }
          else if (elem.nodeName === '#text') {
            elem.nodeValue = replaceCharacterAndSetFont(numberThousand(elem.nodeValue));
          }

          return true;
        });

        __catchDom.innerHTML = __catchDom.innerHTML
          .replace(/(&lt;)/g, '<')
          .replace(/(&gt;)/g, '>')

          // 去除空白段落
          var __removeBlankParagraphs = __getParagraph();
          for (var i = 0; i < __removeBlankParagraphs.el.length; i++) {
            var __item = __removeBlankParagraphs.el[i];
            if (__item.innerHTML.replace(/((<br>)|(&nbsp;)|(&ensp;)|\s)+/g, '') === '') {
              __item.parentNode.removeChild(__item);
              i--;
            }
          }

          __catchDom.innerHTML = __catchDom.innerHTML
            .replace(/(<\/p>)(<br>)+/g, '$1')
            .replace(/(<br>)+/g, '<br>')
            .replace(/(<\/tr>)(<br>)+/g, '')
            .replace(/(<\/td>)(<br>)+/g, '');
      };
 
      // 重组DOM
      __generateParagraph();
      //重新组合
      __grouping();
      //第一步做的内容置换需要换回来
      __restoreTags();
      // 修改字体样式
      __edtFormat();
    

      return __catchDom.innerHTML
    };
  };
  

  var  doFormatbrush = function(){
    
    var __tmpEl = document.createElement('tmp-el');
    __tmpEl.innerHTML = editor.getContent();
    
    var paragraphParseFlag =  [5, 6, 7, 9, 10].indexOf(parseInt(editor.settings.itemTypeId)) >= 0
    var result =  __fcForAccounting(__tmpEl, paragraphParseFlag);
    editor.setContent(result)
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

