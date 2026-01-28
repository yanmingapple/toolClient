
// 获取参数
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

// 循环数组方法
function forFun(data, callback) {
  for (var index = 0; index < data.length; index++) {
    if (callback && callback instanceof Function) callback(data[index], index)
  }
}

// 去除内容部分样式，需要保留的样式列在savecss中
function removeStyle($Els) {
  var saveCss = ['font-style', 'font-size', 'text-decoration', "text-decoration-line", 'font-weight', 'text-align', 'text-indent', 'text-align-last', 'vertical-align'] // , 'text-align', 'text-indent'
  // 综合题不去掉 text-align
  // if ($Els.parents('.block-item').hasClass('comprehensive')) saveCss.push('text-align')
  $Els.each((eIndex, el) => {
    if (el.nodeName !== 'IMG') {
      var cssStr = ''
      forFun(saveCss, function (item) {
        if ($(el).css(item)) {
          cssStr += (item + ':' + $(el).css(item) + ';')
        }
      })
      // 设置 ['MS Mincho', '楷体', 'SimHei'（申论的）] 不去除
      let fontFamilyCon = $(el).css('font-family').toLowerCase()
      if (fontFamilyCon.indexOf('ms') > -1 || 
        fontFamilyCon.indexOf('ｍｓ') > -1 || 
        (fontFamilyCon.indexOf('楷体')) > -1|| 
        (fontFamilyCon.indexOf('kaiti')) > -1|| 
        (fontFamilyCon.indexOf('kaiti, kaiti1')) > -1|| 
        (fontFamilyCon.indexOf('宋体')) > -1 || 
        (fontFamilyCon.indexOf('simsun')) > -1 || 
        (fontFamilyCon.indexOf('simsun simsun1')) > -1 || 
        (fontFamilyCon.indexOf('simhei')) > -1 || 
        (fontFamilyCon.indexOf('"times new roman", times')) > -1 || 
        (fontFamilyCon.indexOf('"Times New Roman", kaiti')) > -1 ||
        (fontFamilyCon.indexOf('"Times New Roman", simsun')) > -1) {
        cssStr += ('font-family:' + fontFamilyCon)
      }
      $(el).removeAttr('style')
      if (cssStr) $(el).attr('style', cssStr)
    }
  })
}

// 文字设置着重符号
function setAccentText($doms) {
  $doms.each((index, item) => {
    let tempAccentTextStr = ''
    let textArr = item.textContent.split('')
    textArr.forEach(_t => {
      tempAccentTextStr += `<span class="mce-emphatic">${_t}</span>`
    })
    $(item).after(tempAccentTextStr).remove()
  })
}

function getEditHtmlStr() {
  let editHtmlStr = ''
  if(tinyMCE && tinyMCE.editors && tinyMCE.editors[0] && tinyMCE.editors[0].getContent && tinyMCE.editors[0].getContent instanceof Function) {
    editHtmlStr = tinyMCE.editors[0].getContent() || ''
  }
  return editHtmlStr
}


/*  
* utf8转为utf16
* @param str
* @returns {string}
*/
function utf8To16(str) {
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
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx 10xx xxxx 10xx xxxx
        char2 = str.charCodeAt(i++);
        char3 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}



/**
 * --------------------------------------------------------------------------------------------------------------------
 * utf16转为utf8
 * @param str
 * @returns {string}
 */
function utf16to8(str) {
  var out, i, len, c;
  out = "";
  len = str.length;
  for (i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if ((c >= 0x0001) && (c <= 0x007F)) {
      out += str.charAt(i);
    } else if (c > 0x07FF) {
      out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    } else {
      out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
    }
  }
  return out;
}


// 窗口滚动条事件
function navSideBarScroll() {
  var scorllRelate = function (ifameA, ifameB) {
    if (ifameA && ifameA.contentWindow) { // 右侧滚动
      // $(ifameA.contentWindow).scroll(function () {
      //   var scrollTop = $(this).scrollTop();
      //   $(ifameB).scrollTop(scrollTop);
      // })
    } else { // 1126.72 151.181  8  151.181
      $(ifameA).scroll(function () {
        var scrollTop = $(this).scrollTop();
        $(ifameB.contentWindow).scrollTop(scrollTop);
      })
    }
  }
  var iframePrev = $('.origin-con')[0];
  var iframeNext = document.getElementById("paperViewRender");
  scorllRelate(iframePrev, iframeNext);
  scorllRelate(iframeNext, iframePrev);
}

// 打印
function setPrintIframe() {
  var iframe = document.createElement("iframe");
  iframe.id = "printPage";
  iframe.setAttribute('style', 'visibility: hidden; height: 0;')
  document.body.appendChild(iframe);
  var head = document.getElementById("printPage").contentWindow.document.head
  var Astyle = document.createElement("style");//创建style标签对象
  Astyle.type = "text/css";
  Astyle.innerHTML=`
    body>svg {
      display: block;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        -webkit-print-color-adjust: exact;
        -moz-print-color-adjust: exact;
        -ms-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      table {
        border-collapse: collapse;
      }
    }`
  head.appendChild(Astyle)
}
setPrintIframe()
function printCon(printContent) {
  var wn = document.getElementById('printPage').contentWindow
  if (wn) {
    wn.document.body.innerHTML = printContent
    wn.print()
    wn.document.body.innerHTML = ''
  }
}

// 切割html节点
function splitHtml(param) {
  this.options = {
    originDom: null,//原dom节点
    width: 500,
    height: 400,
    pageHeight: 0,
    // blockItem: null,
    stemPrevCon: null,
    splitBlockItem: null,
    x: 0,
    startTop: 0,
    splitFlag: false,
    splitHtmlStrList: [],
    leftItemDom: null,
    rightItemDom: null,
    dealRightCss: true
  }
  this.options = Object.assign(this.options, param)

  // 元素追加到body中
  this.setOriginDom = function () {
    let tempHtmlStr = this.options && this.options.originDom && this.options.originDom[0] && this.options.originDom[0].outerHTML || ''
    $(`<div class="split-container">${tempHtmlStr}</div>`)
      .css({
        display: 'block',
        width: this.options.width + 'px',
      })
      .appendTo($('body'))
  }
  // 设置需要切割的元素
  this.setSplit = function () {
    // this.options.blockItem = $('.split-container').find('.block-item')
    this.options.stemPrevCon = $('.split-container .block-item:last').find('.stem-prev-con')
    this.options.splitBlockItem = $('.split-container .block-item:last').find('.stem-con-content')
    if (this.options.splitBlockItem && this.options.splitBlockItem[0] && this.options.splitBlockItem[0].getBoundingClientRect) {
      this.options.startTop = this.options.splitBlockItem[0].getBoundingClientRect().top
    }
  }

  // 查找需要切割节点的位置
  this.findSplitDom = function (childNodes) {
    for (let index = 0; index < childNodes.length; index++) {
      const element = childNodes[index];
      // 页面剩余高度小于一行，则开始换行
      if (element.nodeName!='SUB' && element.nodeType == 1) {
        if (Math.abs(element.getBoundingClientRect().top - this.options.startTop - this.options.height) < 25) {
          this.options.dealRightCss = false
          $(element).before('<span class="splitdom"></span>')
          let $itemDom = $(element).parents('.block-item')
          this.splitDomFun($itemDom)
          this.options.x = 0
          return
        }
      }
      if (element.childNodes && element.childNodes.length > 0 && element.nodeName !== 'TABLE' && element.nodeName !== 'INPUT') {
        this.options.dealRightCss = true
        this.findSplitDom(element.childNodes);
      } else {
        var selection = document.getSelection();
        if (element.nodeName == 'IMG' || element.nodeName == 'TABLE' || element.nodeName == 'INPUT') {
          selection.removeAllRanges();
          var range = document.createRange();
          range.selectNode(element)
          selection.addRange(range);
          var retct = range.getBoundingClientRect()
          if (this.options.x == 0 && element.nodeName !== 'TABLE' && element.nodeName !== 'IMG' && element.nodeName !== 'INPUT') {
            this.options.x = retct.x + retct.width;
          } else {
            if (Math.abs(this.options.x - retct.x) > 1 && retct.bottom - this.options.startTop > this.options.height) {
              // console.log(element, retct.bottom - this.options.startTop, this.options.height)
              $(element).before('<span class="splitdom"></span>')
              let $itemDom = $(element).parents('.block-item')
              // 图片或者表格高度超过一页的高度，直接设置高度为一页高度，否则页面报错不显示
              if($(element).height() >= this.options.pageHeight) {
                if(element.nodeName =='TABLE'){
                  //table带了一个表头caption
                  $(element).height(this.options.pageHeight - 30)
                }else{
                  $(element).height(this.options.pageHeight)
                }
              }
              this.splitDomFun($itemDom)

              this.options.x = 0
              return
            } else {
              this.options.x = retct.x + retct.width;
            }
          }
        }

        else if (element.nodeType == 3 && element.nodeValue) {
          for (var i = 0; i < element.nodeValue.length; i++) {
            selection.removeAllRanges();
            var range = document.createRange();
            range.setStart(element, i)
            range.setEnd(element, i + 1)
            selection.addRange(range);
            var retct = range.getBoundingClientRect()
            if (this.options.x == 0) {
              this.options.x = retct.x + retct.width;
            } else {
              let prevDomIsInput = false //element.previousSibling && element.previousSibling.nodeName === 'INPUT'
              if (!prevDomIsInput && Math.abs(this.options.x - retct.x) > 1 && retct.bottom - this.options.startTop + 25 > this.options.height) {
                // debugger
                // console.log(element, retct.bottom - this.options.startTop, this.options.height)
                // console.log(i, "-----------", element.nodeValue.substr(i, 1), retct);
                element.nodeValue = element.nodeValue.slice(0, i) + '$splitdom' + element.nodeValue.slice(i)
                let tempElement = element.parentNode
                element.parentNode.innerHTML = element.parentNode.innerHTML.replaceAll('$splitdom', '<span class="splitdom"></span>')
                let $itemDom = $(tempElement).parents('.block-item')
                this.splitDomFun($itemDom)

                this.options.x = 0
                return
              } else {
                this.options.x = retct.x + retct.width;
              }
            }
          }
        }
      }
    }
  }

  // 根据剩余高度和每页高度，将内容切割成数个，并追加到一个数组中
  this.splitDomFun = function ($itemDom) {
    this.options.splitFlag = false
    //复制当前元素节点，保留父元素样式
    this.options.leftItemDom = $itemDom[0].cloneNode(false)
    this.options.rightItemDom = $itemDom[0].cloneNode(false)

    let tChildNodes = $itemDom[0].childNodes
    this.composeDom(tChildNodes, this.options.leftItemDom, this.options.rightItemDom)

    // 切割后的内容，第二部分再次切割会导致题号部分消失
    let $prevDom = $(this.options.leftItemDom).find('.stem-prev-con')
    , prevDom = $prevDom && $prevDom[0] && $prevDom[0].cloneNode(0)

    $(this.options.rightItemDom).find('.stem-con-content').before(prevDom && prevDom.outerHTML || '') 

    // 如果不是从段落切割，则去掉切割后第一个p标签的首行缩进
    if (this.options.dealRightCss === true) {
      $(this.options.rightItemDom).find('.stem-con-content>p:first-of-type').css({textIndent: 0})
    }

    $itemDom.before(this.options.leftItemDom).after(this.options.rightItemDom)
    $itemDom.remove()

    // 切割后的内容，题号部分去除内容。
    if(this.options.splitHtmlStrList && this.options.splitHtmlStrList.length >= 1) {
      $(this.options.leftItemDom).find('.stem-prev-con').html('')
    }
    // console.log(this.options.leftItemDom, this.options.rightItemDom)
    this.options.splitHtmlStrList.push(this.options.leftItemDom)
    // 剩余部分超出一页的导入，则继续切割
 
    if ($(this.options.rightItemDom).outerHeight && $(this.options.rightItemDom).outerHeight() > this.options.pageHeight) {
      this.options.height = this.options.pageHeight
      this.setSplit()
      if (this.options.splitBlockItem && this.options.splitBlockItem[0] && this.options.splitBlockItem[0].childNodes) {
        this.options.dealRightCss = true
        this.findSplitDom(this.options.splitBlockItem[0].childNodes)
      }
    } else {
      $(this.options.rightItemDom).find('.stem-prev-con').html('')
      this.options.splitHtmlStrList.push(this.options.rightItemDom)
    }
  }

  // 节点通过splitdom切割并组成2部分
  this.composeDom = function (tChildNodes, leftItemDom, rightItemDom) {
    tChildNodes.forEach(item => {
      //当前元素是否为切割元素标签
      if ($(item).hasClass('splitdom')) {
        this.options.splitFlag = true
      }

      //如果当前预算内不是切换元素标签，查找当前元素里面是否有切割元素
      if (!this.options.splitFlag && $(item).find('.splitdom').length == 0) {
        //当前不是切割元素并且当前元素中没有切割的元素，加入到
        let tempLeftItemDom = item.cloneNode(true)
        $(leftItemDom).append(tempLeftItemDom)
        return
      }

      //如果是表格，特殊处理
      if(item.nodeName == 'TABLE'){
        $(leftItemDom).html($(leftItemDom).html() + item.outerHTML)
        return;
      }

      let itemChildNodes = item.childNodes
      if (itemChildNodes && itemChildNodes.length == 1 && itemChildNodes[0].nodeType == 3) { // nodeType: 3
        if (this.options.splitFlag) {
          $(rightItemDom).html($(rightItemDom).html() + item.outerHTML)
        } else {
          $(leftItemDom).html($(leftItemDom).html() + item.outerHTML)
        }
      } else if (itemChildNodes && itemChildNodes.length > 0) {
        let tempLeftItemDom = item.cloneNode(false)
        if (!this.options.splitFlag) {
          $(leftItemDom).append(tempLeftItemDom)
        }
        let tempRightItemDom = item.cloneNode(false)
        $(rightItemDom).append(tempRightItemDom)
        this.composeDom(itemChildNodes, tempLeftItemDom, tempRightItemDom)
      } else {
        if (this.options.splitFlag) {
          if (['IMG', 'INPUT'].includes(item.nodeName)) {
            $(rightItemDom).html($(rightItemDom).html() + item.outerHTML)
          } else {
            $(rightItemDom).html($(rightItemDom).html() + item.textContent)
          }
        } else {
          if (['IMG', 'INPUT'].includes(item.nodeName)) {
            $(leftItemDom).html($(leftItemDom).html() + item.outerHTML)
          } else {
            $(leftItemDom).html($(leftItemDom).html() + item.textContent)
          }
        }
      }
    })
  }
  // 获取分割后的两个html片段
  this.getsplitHtmls = function() {
    return this.options.splitHtmlStrList
  }
  // 清空容器
  this.delContainer = function() {
    $('.split-container').remove()
  }


  this.init = function () {
    this.setOriginDom()
    this.setSplit()
    // debugger
    if (this.options.splitBlockItem && this.options.splitBlockItem[0] && this.options.splitBlockItem[0].childNodes) {
      this.findSplitDom(this.options.splitBlockItem[0].childNodes)
    }
  }

  this.init()
}


function setDate() {
  // let paperNameTxt = $('.paperName').text() || ''
  // if (paperNameTxt.indexOf(examYear) < 0) {
  //   let tempTitleName = paperTitleField == 'otherExam' ? '月江苏省高等教育自学考试' : '月高等教育自学考试全国统一命题考试'
  //   $('.paperName').html(examYear+'年'+examMonth+tempTitleName)
  // }
  let svgDom = document.getElementById("svgCon")
  if(examYear && examYear != '&nbsp;&nbsp;&nbsp;&nbsp;' && examMonth && examMonth != '&nbsp;&nbsp;&nbsp;&nbsp;' && svgDom && svgDom.children[0] && svgDom.children[0].children[1]) {
    let svgConRect = document.getElementById("svgCon").getBoundingClientRect()
      , yearRect = document.getElementById("svgCon").children[0].children[1].children[10].getBoundingClientRect()
      , monthRect = document.getElementById("svgCon").children[0].children[1].children[15].getBoundingClientRect()
      , yearDataX = yearRect.x - svgConRect.x - 2
      , yearDataY = yearRect.y + yearRect.height - 3
      , monthDateX = monthRect.x - svgConRect.x - 2
      , monthDateY = monthRect.y + monthRect.height - 3
      , dateStr = `<text x="${yearDataX}" y="${yearDataY}" text-anchor="end" style="
        font-size: 16pt;
        font-family: Times New Roman;
      ">${examYear}</text>
      <text x="${monthDateX}" y="${monthDateY}" text-anchor="end" style="
        font-size: 16pt;
        font-family: Times New Roman;
      ">${examMonth}</text>`
    let fSvgStr = $('#textgroup').html()
    $('#textgroup').html(fSvgStr + dateStr)

    let textPath = ''
    $('#textgroup text').each((index, _t) => {
      let rect = getRangeRect(_t, 0, 1)
      let mouthOffsetX = index == 1 && examMonth && examMonth.toString().length == 1 ? 5 : 0
      textPath += getPath(_t.innerHTML, rect.x - svgConRect.x - mouthOffsetX, rect.y)
    })
    $('#textgroup').html(fSvgStr + textPath)
  }
}

function getPath(text, x, y) {
  let pathObject = new PathObject('text', 0);
  let fontFamily = 'times new roman'
  if (textToSvgData[fontFamily]) {
    const attributes = {};
    if (pathObject.fontWeight > 400) {
      attributes.stroke = "#000000"
      attributes["stroke-width"] = 0.22
      attributes['stroke-linecap'] = 'butt'
      attributes['stroke-linejoin'] = 'miter'
    }
    if (pathObject.fontStyle == 'italic') {
      attributes['style'] = 'transform-box: content-box; transform: skew(-18deg); transform-origin: bottom;'
    }
    const options = { x: x, y: y, fontSize: '22', anchor: 'left top', attributes: attributes };
    const path = textToSvgData[fontFamily].getPath(text, options);
    if (path) {
      return path;
    }
  }
  // console.log("还没找到：", this.getValue(), this.getFontFamily().toLocaleLowerCase())
  return '';
}

// 试卷内容字体转换
function changePaperFontFamily(dealFontData) {
  let allItemDoms = $('.block-item *')
  allItemDoms.each((index, item) => {
    let itemFontFamilly = $(item).css('fontFamily') // '"Times New Roman", simsun'
    // console.log(itemFontFamilly)
    if (!(itemFontFamilly == '"Times New Roman", simsun' || itemFontFamilly == '"Times New Roman", kaiti')) {
      // console.log(index, item, $(item).css('fontFamily'))
      // let itemFontFamillyArr = itemFontFamilly.split(',')
      if(itemFontFamilly == 'simsun, simsun1') {
        $(item).addClass('font_st')
      } else if(itemFontFamilly == 'kaiti, kaiti1') {
        $(item).addClass('font_kt')
      } else {
        let itemCon = $(item).html()
        dealFontData.forEach(_f => {
          if(itemFontFamilly == '楷体' && itemCon) {
            $(item).html(itemCon.replaceAll('&nbsp; ', '&nbsp; &nbsp; '))
          }
          if(_f.originF.some(_o => itemFontFamilly.indexOf(_o) >= 0)) {
            $(item).css('fontFamily', _f.targetF)
            return
          }
        })
      }
    }
  })
  $('.font_st').css('fontFamily', 'simsun')
  $('.font_kt').css('fontFamily', 'kaiti')
}
// 加载html文件
function loadHtml(idName, urlName) {
  if (urlName) {
    var iframe = document.createElement('iframe');
    iframe.id = idName || 'paperViewRender';
    iframe.src = './'+urlName+'.html?project='+project||'';
    $('.pdf-con').append(iframe);
  }
}
// 加载js文件
function loadJS(urlName) {
  if (urlName) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = './js/'+urlName+'.js';
    $('#previewComScript').after(script);
  }
}
// 加载css文件
function loadCss(urlName) {
  if (urlName) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/'+urlName+'.css';
    document.head.appendChild(link);
  }
}
// 根据不同项目加载配置文件
function loadConfigFile(type='paper') {
  var project =  getQueryString('project')
  if (project) {
    if (type == 'paper') {
      loadCss('paperView_'+project)
      loadJS('paperCom_'+project)
    } else {
      loadCss('answer_'+project)
      loadJS('paperAnswerCom_'+project)
    }
  } 
}
