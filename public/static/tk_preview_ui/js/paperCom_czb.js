
var pxOfCm = (function () { //1cm转换px
    var div = document.createElement("div");
    div.id = "cm";
    div.style.width = "1cm";
    div.style.display = "block";
    document.querySelector("body").appendChild(div);
    var cm1 = document.getElementById("cm").getBoundingClientRect().width;
    $('#cm').remove()
    return cm1;
  })()
  // bookjs 页面配置
  , pageMap = {
    paper: {
      name: 'ISO_A4',
      pxSizeOfW: pxOfCm * 21,
      pxSizeOfH: pxOfCm * 29.7
    },
    padding: '4cm 3.5cm 4cm 3.5cm',
  }
  // 页面padding转px数组
  , paddingArrOfPx = (function () {
    var paddingArr = pageMap.padding.split(' ')
    var tempArr = []
    forFun(paddingArr, function (item) {
      tempArr.push(item.replace('cm', '') * pxOfCm || '')
    })
    return tempArr
  })()
  // 页面内容宽度
  , contentW = pageMap.paper.pxSizeOfW - paddingArrOfPx[1] - paddingArrOfPx[3]
  // 页面内容高度
  , contentH = pageMap.paper.pxSizeOfH - paddingArrOfPx[2] - paddingArrOfPx[0]
  , codeTmp = {
    '<input>': '&lt;input&gt;'
  }
  , project =  getQueryString('project')
  , retdata = [] // 试卷数据
  , paperName = ''
  // 1 单项选择题 single
  // 10 案例分析题 caseAnalysis
  // 11 填空题 fillblank
  // 12 完形填空题 fillItems
  // 13 填空选择题 fillSingle
  // 14 双项选择题 double
  // 15 判断改错题 judgeAndCorrect
  // 2 多项选择题 multiple
  // 3 判断题 judgment
  // 4 不定项选择题 indeterminate
  // 5 简答题 shortanswer
  // 6 计算分析题 calculationAnalysis
  // 7 综合题 comprehensive
  // 8 问答题 questionsAndAnswers
  // 9 不定项选择题 indeterminateComprehensive
  , itemTypeMap = {
    '1': 'single',
    '10': 'caseAnalysis',
    '11': 'fillblank',
    '12': 'fillItems',
    '13': 'fillSingle',
    '14': 'double',
    '15': 'judgeAndCorrect',
    '2': 'multiple',
    '3': 'judgment',
    '4': 'indeterminate',
    '5': 'shortanswer',
    '6': 'calculationAnalysis',
    '7': 'comprehensive',
    '8': 'questionsAndAnswers',
    '9': 'indeterminateComprehensive',
    '999': 'structContent',//结构
    '1000': 'partContent',//单元
  }
  , $tempOptionCon
  , paperContentType = 'data'
  , getImgMap

// 内容转换
function codeCodeTmp(html) {
  for (var code in codeTmp) {
    html = html.replaceAll(code, codeTmp[code]);
  }
  return html;
}
// 处理空白题干内容
function dealBlank(html){
  if(!!$(html).text().trim()) {
    return html
  } else {
    let tagNames = ['input', 'img', 'table']
      , blankFlag = true
    tagNames.forEach(_t => {
      if(html.includes(_t)) {
        blankFlag = false
      }
    })
    if (blankFlag) return ''
    else return html
  }
}

//文本区域宽高（px）获取
function textToPx(text, fontSize) {
  var div = document.createElement("div");
  div.id = "charCon";
  div.innerHTML = text;
  div.style.display = "inline";
  div.style.fontSize = fontSize ? fontSize : "10.5pt";
  document.querySelector("body").appendChild(div);
  var $dom = $('#charCon');

  var ret = {
    width: $dom.width(),
    height: $dom.outerHeight(true),
  }
  $dom.remove();
  return ret
}

// 处理选项
function getOptions(list) {
  var optList = []
  forFun(list, function (item) {
    if (item.type == 'option') {
      optList.push(item)
    }
  })
  var compare = function (x, y) {//比较函数
    if (x.sort < y.sort) return -1
    else if (x.sort > y.sort) return 1
    else return 0
  }
  optList = optList.sort(compare)
  return optList
}

// 循环试卷结构，渲染选项数据，用于计算选项宽度
function setOptionsData(pData) {
  forFun(pData, function (_p, index) {
    // 选择题型
    if (['1', '2', '4', '14', '13'].includes(_p.itemTypeId) && _p.attributeList && _p.attributeList.length > 0) {
      let optionData = getOptions(_p.attributeList)
      if (optionData && optionData.length > 0) {
        forFun(optionData, function (oItem) {
          $tempOptionCon.append('<div id="'+(_p.id + '_' + oItem.name)+'" class="option-con" style="display: inline-block;">' +
            '<div style="display: flex;">' + 
              '<div style="font-size: 10.5pt;">' + oItem.name + '.&nbsp</div>' +
              '<div style="flex: 1;font-size: 10.5pt;">' + oItem.content + '</div>' +
            '</div></div>')
        })
      }
    }
    let innerData = []
    if (_p.childrenPaperPriewVOs && _p.childrenPaperPriewVOs.length > 0) {
      innerData = _p.childrenPaperPriewVOs
    } else if (_p.itemList && _p.itemList.length > 0) {
      innerData = _p.itemList
    } else if (_p.childItemList && _p.childItemList.length > 0) {
      innerData = _p.childItemList
    }
    if (innerData && innerData.length > 0) {
      setOptionsData(innerData)
    }
  })
}

// 处理选项占位宽度
function getOptionsType(list, itemId) {
  //选择中最大宽度
  var maxWidth = 0
  forFun(list, function (oItem) {
    var oItemW = $('#'+itemId+'_'+oItem.name).outerWidth(true)
    maxWidth = maxWidth > oItemW ? maxWidth : oItemW
  })

  //选项中间的空格宽度设置为一个中文汉字
  maxWidth += 14
  //选项前面有两个汉字位置
  var optionContentW = contentW - 28;
  // 多项选择题 5 个选项，短则3行显示，长则5行显示
  if (list && list.length == 5) {
    if (optionContentW / maxWidth >= 2) return 'spl-2'
    else return 'spl-1'
  }
  if (optionContentW / maxWidth >= 4) {
    return 'spl-4'
  }
  else if (optionContentW / maxWidth >= 2 && optionContentW / maxWidth < 4) return 'spl-2'
  else return 'spl-1'
}

// 处理特殊内容
function dealSpecialContnt() {
  // 代码块中内容处理
  var $codeDom = $('.calc-con').find('code')
  for (var i = 0; i < $codeDom.length; i++) {
    var conStr = $codeDom[i].innerHTML.replace(/</g, '&lt').replace(/>/g, '&gt')
    var $preDom = $('<code style="background: transparent; white-space: break-spaces;"></code>')
    $preDom.html(conStr)
    $($codeDom[i]).replaceWith($preDom)
  }

  //试题内容处理,目前有表格，图片
  // var $blockDom = $('.calc-con .block-item .stem-con')
  // forFun($blockDom, function (item) {
  //   var $tempDom = $(item);
  //   let stemPrevCon = $tempDom.find('.stem-prev-con').first(),
  //     paperItemNum = stemPrevCon.length > 0 ? stemPrevCon.children()[0].innerHTML : ''

  //   // 命题工具过来的试题图片class加了 PageGraph 显示标题
  //   let $assignTitleImgDoms = $tempDom.find('img.PageGraph')
  //   $assignTitleImgDoms.each(function (index, item) {
  //     let $pFigureDom = $(item).parents('figure')
  //     if (!$pFigureDom || $pFigureDom.length == 0) {
  //       $(item).replaceWith('<figure class="image ">' + item.outerHTML + '<figcaption>题xxx图</figcaption></figure>')
  //     }
  //   })
  //   // 题目中图片加上题几图
  //   let $figcaption = $tempDom.find('figcaption')
  //   for (let i = 0; i < $figcaption.length; i++) {
  //     //如果只有一个图片，只显示一个：题x图，多个显示：题x-x图
  //     if ($($figcaption[i]).text() == '题xxx图') {
  //       let captionText = $figcaption.length == 1 ? ('题' + paperItemNum + '图') : ('题' + paperItemNum + '-' + (i + 1) + '图')
  //       $($figcaption[i]).html(captionText)
  //     }
  //   }

  //   // 表格顶部加文字处理
  //   var $table = $tempDom.find('table').not('table table')
  //   for (var i = 0; i < $table.length; i++) {
  //     //如果只有一个表格，只显示一个：题x表，多个显示：题x-x表
  //     let captionText = $table.length === 1 ? ('题' + paperItemNum + '表') : ('题' + paperItemNum + '-' + (i + 1) + '表')
  //     var $caption = $($table[i]).find('caption');
  //     if ($caption.length > 0) {
  //       if ($caption.text() == '题xxx表') {
  //         $caption.html(captionText);
  //       } else if (!$caption.text().trim()) {
  //         $caption.remove()
  //       }
  //     } else {
  //       $($table[i]).prepend('<caption>' + captionText + '</caption>')
  //     }
  //   }
  // });

  // 填空题空格右侧句号，句号换行，位于句首
  var $inputDom = $('.calc-con').find('input.blank')// blank-of-right
  forFun($inputDom, function (item, index) {
    var inputLeftPosition = $(item) && $(item).position() && $(item).position().left || 0
      , inputOuterWidth = $(item) && $(item).outerWidth(true) || 0
      , inputWidth = item.clientWidth
      , residueWidth = contentW - inputLeftPosition - inputOuterWidth
    let calcPadding = $('.calc-con').css('padding')
    if(calcPadding && calcPadding.split(' ') && calcPadding.split(' ')[1]) {
      residueWidth = residueWidth + calcPadding.split(' ')[1].replace('px', '')*1
    }
    if (residueWidth < 15 && residueWidth > 0) {
      // $(item).css('width', inputWidth - (15 - residueWidth))
      $(item).before('</br>')
    }
  })
  // 文字设置着重符号
  setAccentText($('.calc-con').find('.AccentText'))
}

// 处理试卷数据成html内容，放到calc-con 中
function dealPaperDataOfcalcCon(callback) {
  $tempOptionCon = $('<div id="tempOptionCon" style="display: inline-block; visibility: hidden;"></div>')
  $('body').append($tempOptionCon)
  //科目头部取值
  var paperHtmlStr = '<div class="block-item mceNonEditable"><div class="paperName">' + paperName + '</div>'
  function setPaperData() {
    //试卷内容数据
    paperHtmlStr += doPaperHtmlStr(retdata, 'paper')
    //设置内容
    // if ($tempOptionBox) $tempOptionBox.remove()
    $('.calc-con').html(paperHtmlStr)
    
      changePaperFontFamily([
        {originF: ['宋体', 'Songti SC', 'simsun', 'SimSun'], targetF: '"Times New Roman", simsun'},
        {originF: ['楷体', 'kaiti'], targetF: '"Times New Roman", kaiti'},
      ])
    //图片src没有的删除掉,编程题目会出现标签问题的现象
    $('.paper-con img').filter('src')
    // 处理特殊内容
    dealSpecialContnt()
    removeStyle($('.calc-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .blank, .stem-prev-con, .ignoreCls"))
    $tempOptionCon.remove()
    if (callback && callback instanceof Function) {
      callback()
    }
    if(getImgMap && getImgMap instanceof Function) {
      setTimeout(function() {
        getImgMap()
      }, 10)
    }
  }
  // 先渲染试卷选择题选项数据，防止选项中含图片没有渲染完成，导致选项宽度计算失误
  setOptionsData(retdata)
  let $Imgs = $tempOptionCon.find('img')
    , imgLen = $Imgs.length
    , imgLoadCount = 0
  if ($Imgs && imgLen > 0) {
    $Imgs.load(function() {
      imgLoadCount++
      if (imgLoadCount == imgLen) {
        setPaperData()
      }
    })
    $Imgs.error(function() {
      setPaperData()
    })
  } else {
    setPaperData()
  }

}
// 找到第一个有内容的节点
function getStartNode(el) {
  let firstNode
  if (el && el.childNodes && el.childNodes.length > 0) {
    firstNode = el.childNodes[0]
  }
  if (firstNode && firstNode.childNodes) {
    if (firstNode.childNodes.length > 0) {
      return getStartNode(firstNode)
    } else if (firstNode.childNodes.length == 0) {
      return firstNode
    }
  }
}
// 判断开始dom节点是否特定节点
function judgeStartNode(el, nodeName) {
  let firstNode
  if (el && el.childNodes && el.childNodes.length > 0) {
    firstNode = el.childNodes[0]
  }
  if (firstNode) {
    if (firstNode.nodeName == nodeName) {
      return true
    } else {
      return judgeStartNode(firstNode, nodeName)
    }
  }
}

/**
* 处理试卷数据
* showPaperItemNumData 综合体语料为空，子题题号（1）（2），不显示语料部分，直接父题题号.(1)
*/
var menuInfoDataopType = 'block'
  , structDataopType = 'block'
  , titleDataopType = 'block'
var lastDataIsPart = false;
function doPaperHtmlStr(data, type, showPaperItemNumData, showComLeftMrg) {
  //定义试卷处理后的html
  var paperHtmlStr = ''
  forFun(data, function (_p, index) {
    // 题型结构
    if (_p.menuInfoType == 1) {
      // 单元
      if (_p.type == 1) {
        // 单元的第一个节点和卷首部分公用一个block-item
        if (index !== 0) {
          paperHtmlStr += '<div class="block-item mceNonEditable partContent">'
            // + '<p class="pt-12"><br></p>'
            // + '<div data-op-type="' + menuInfoDataopType + '" class="part-con partContent">' + _p.name + '</div>'
            // + '<p class="pt-12"><br></p>'
        }
        // else {
          let partName = _p.name.replace(' ', '&nbsp;&nbsp;')
          paperHtmlStr += '<p class="pt-12"><br></p>'
          + '<div data-op-type="' + menuInfoDataopType + '" class="part-con partContent">' + partName + '</div>'
          + '<p class="pt-12"><br></p>'
          // '<p class="pt-12 block-item"><br></p>'
          //   + '<div data-op-type="' + menuInfoDataopType + '" class="part-con block-item partContent">' + _p.name + '</div>'
          //   + '<p class="pt-12 block-item"><br></p>'
        // }
        // 若该节点下没有 结构 则追加一个</div>
        if (!_p.childrenPaperPriewVOs || _p.childrenPaperPriewVOs.length == 0) {
          paperHtmlStr += '</div>'
        }
        lastDataIsPart = true;
      }
      // 结构
      else if (_p.type === 2) {
        let descHtmlStr = ''
        if (_p.description) descHtmlStr = '：<span class="' + itemTypeMap['999'] + '">' + _p.description + '</span>'
        // lastDataIsPart: true 该节点上一级是单元部分，则和单元公用一个block-item
        if (lastDataIsPart) {
          paperHtmlStr += '<div class="structure-con structContent"><span>' + _p.name + '</span>' + descHtmlStr + '</div></div>'
          lastDataIsPart = false;
        } else {
          paperHtmlStr += '<div data-op-type="' + structDataopType + '" class="structure-con block-item structContent mceNonEditable"><span>' + _p.name + '</span>' + descHtmlStr + '</div>'
        }
        if (type == 'paper') {
          paperHtmlStr += '</div>'
          lastDataIsPart = false;
        }
      }
    } else if (['item', 'childItem'].includes(type)) { // showComLeftMrg
      // 如果综合体语料没有内容则不显示 内容中是否有图片，文本等
      let $tempDom = $('<div>' + _p.itemContent + '</div>')
      let $imgDoms = $tempDom.find('img')
      if (!$tempDom.text() && $imgDoms && $imgDoms.length == 0) {
        paperHtmlStr += ''
      } else {

        // 题干
        //题干序号，如果是纯数字，加一个.&nbsp; ，如果是有(),不处理
        var titlePreXH = _p.paperItemNum ? '<span class="' + (index == 0 && showPaperItemNumData ? 'papernumofchilditem' : '') + '">' + ((index == 0 && showPaperItemNumData) || _p.paperItemNum) + '</span>' + (_p.paperItemNum.indexOf(')') >= 0 ? '' : '<span class="cn-dot-con">.</span>') : '';
        var titlePreWidth = textToPx(titlePreXH).width
        // 子题题号连续（不带括号） 则和题型用语对齐
        var childItemSeriesCls = ''
        if (type == 'childItem' && _p.paperItemNum && _p.paperItemNum.indexOf(')') < 0) {
          childItemSeriesCls = ' series-child-item-con'
        }
        // 选序号择填空题题干不显示序号
        if (_p.itemTypeId == 16) {
          titlePreXH = ''
          titlePreWidth = ''
        }
        // 没有p标签包裹的手动加个p标签，用于排版分页符分割不错乱
        _p.itemContent = $(`<div>${_p.itemContent}</div>`).find('p').length > 0 ? _p.itemContent : `<p>${_p.itemContent}</p>`
        let stemContent = codeCodeTmp(_p.itemContent)
          stemContent = dealBlank(stemContent)
        let itemConStr = '<div data-op-type="' + titleDataopType + '" paperItemNum="' + _p.paperItemNum + '" class="item-con block-item ' + (type == 'childItem' && showComLeftMrg ? 'child-item-con ' : '') + (itemTypeMap[_p.itemTypeId]) + childItemSeriesCls + '">' +
          '<div class="stem-con">' +
          // 没有题号则直接和题型用语对齐
          (titlePreXH ? '<div class="stem-prev-con" style="width:2em;" >' + titlePreXH + '</div>' : '') +
          '<div class="stem-con-content">' + stemContent + '</div>' +

          '</div>'

        // 内容第一个标签是table，单独设置cls，使题号和上方对齐
        let $itemDom = $(itemConStr)
        let stemDom = $itemDom.find('.stem-con-content')[0]
          , startDom = getStartNode(stemDom)
          // 开始内容是图片并且图片非公式
          , imgIsFormula = startDom && startDom.nodeName == 'IMG' && !$(startDom).hasClass('Wirisformula') && !$(startDom).attr('data-formula-image')
          // 开始节点是否是表格
          , startDomIsTable = judgeStartNode(stemDom, 'TABLE')
        if (startDomIsTable || imgIsFormula) {
          itemConStr = itemConStr.replace('class="stem-con"', 'class="stem-con tbl-first-con"')
        }

        paperHtmlStr += itemConStr

        // 选项 需要放在试题中防止一道题目分两页显示
        if (['1', '2', '4', '14', '13'].includes(_p.itemTypeId) && _p.attributeList && _p.attributeList.length > 0) {
          optionData = getOptions(_p.attributeList)
          if (optionData && optionData.length > 0) {
            paperHtmlStr += '<div class="options-con ' + getOptionsType(optionData, _p.id) + '">'
            innerType = 'option'
            paperHtmlStr += doPaperHtmlStr(optionData, 'option')
            paperHtmlStr += '</div>'
          }
        }

        paperHtmlStr += '</div>'
      }
    } else if (type == 'option') {
      // 选项
      var optionHtmlStr = '<div data-op-type="text-box" class="option-con"><div>' + _p.name + '<span class="cn-dot-con">.</span>&nbsp</div><div>' + _p.content + '</div></div>'
      paperHtmlStr += optionHtmlStr
    }

    var innerData = []
      , innerType = ''
      , showPaperItemNum
      , hasParentItemNum = true
    if (_p.childrenPaperPriewVOs && _p.childrenPaperPriewVOs.length > 0) {
      innerData = _p.childrenPaperPriewVOs
      innerType = 'structrue'
    } else if (_p.itemList && _p.itemList.length > 0) {
      innerData = _p.itemList
      innerType = 'item'
    } else if (_p.childItemList && _p.childItemList.length > 0) {
      innerData = _p.childItemList

      // 如果综合题语料没有内容则不显示 内容中是否有图片，文本等
      let $tempDom = $('<div>' + _p.itemContent + '</div>')
      let $imgDoms = $tempDom.find('img')
      if (!$tempDom.text() && $imgDoms && $imgDoms.length == 0 && innerData && innerData instanceof Array && innerData.length > 0) {
        if (_p.paperItemNum) {
          showPaperItemNum = '<div class="parent-papernum-of-childitem"><span>' + _p.paperItemNum + '</span><span class="cn-dot-con">.</span></div>' + innerData[0].paperItemNum
        } else {
          showPaperItemNum = '<div class="parent-papernum-of-childitem"></div>' + innerData[0].paperItemNum
          hasParentItemNum = false
        }
      }
      innerType = 'childItem'
    }
    paperHtmlStr += doPaperHtmlStr(innerData, innerType, showPaperItemNum, hasParentItemNum)
  })
  return paperHtmlStr;
}

//新页面插入方法
function newPageFun(itemDom, type) {
  var kongbaiDom = $('<div data-op-type="new-page" type="block_'+type+'"></div>')
  kongbaiDom.insertBefore(itemDom);
}

// 页面块元素高度
function getBlockHeight() {
  $('.calc-con').css('width', contentW + 'px')
  var $blockDom = $('.calc-con .block-item')

  // console.log(" 编辑区域高度" + contentH);

  var tempHeight = 0;//计算每道题的累加高度

  var blockDomLength = $blockDom.length;
  for (var index = 0; index < blockDomLength; index++) {
    var itemDom = $($blockDom[index]);
    /* 插入符的位置，高度置零 */
    let $breakDom = itemDom.prev('.splitdom')
    if ($breakDom.length > 0) {
      tempHeight = 0
    }
    //试题高度
    // var temp = itemDom.outerHeight(true)
    var temp = $blockDom[index].getBoundingClientRect().height
    //如果是单元 ，当前页面不足下一道题，即 单元在当前页面最后一个，需要重新换一个页面
    if (itemDom.hasClass('partContent')) {
      var nextItemDomHeight = 0;
      if (index + 1 < blockDomLength) {
        nextItemDomHeight += $($blockDom[index + 1]).outerHeight(true);//空行
      }
      if (index + 2 < blockDomLength) {
        nextItemDomHeight += $($blockDom[index + 2]).outerHeight(true);//结构
      }
      if (index + 3 < blockDomLength) {
        var structNextDom = $($blockDom[index + 3]);//结构下发第一道试题
        //当前页面不足当前道题，当前试题节点中只有一个段落，不用分割，直接到下一页
        if (structNextDom.find('.stem-con-content').children().length == 1) {
          nextItemDomHeight += structNextDom.outerHeight(true);//试题整个高度 
        }
        //当前页面不足当前道题，节点段落中有多个
        if (structNextDom.find('.stem-con-content').children().length > 1) {
          //多个节点时候，第一个节点高度直接大于剩余高度，就没有必要放到一个页面，直接将整个试题高度累加
          var firstDomHeight = structNextDom.find('.stem-con-content').children().first().outerHeight(true)
          if (firstDomHeight < (contentH - tempHeight)) {
            nextItemDomHeight += firstDomHeight;//试题第一个段落高度 
          } else {
            nextItemDomHeight += structNextDom.outerHeight(true);//试题整个高度 
          }
        }
      }

      if ((tempHeight + temp + nextItemDomHeight) > contentH) {
        // var kongbaiDom = $('<div data-op-type="new-page"></div>')
        // kongbaiDom.insertBefore(itemDom);
        newPageFun(itemDom, '1')
        //新的一页，高度重新计算
        tempHeight = temp;
        continue
      }
    }

    //如果是结构，需要判断上方,是否是单元
    if (itemDom.hasClass('structContent')) {
      var nextItemDomHeight = 0;
      if (index + 1 < blockDomLength) {
        var structNextDom = $($blockDom[index + 1]);
        //当前页面不足当前道题，当前试题节点中只有一个段落，不用分割，直接到下一页
        if (structNextDom.find('.stem-con-content').children().length == 1) {
          nextItemDomHeight += structNextDom.outerHeight(true);//试题整个高度 
        }
        //当前页面不足当前道题，节点段落中有多个
        if (structNextDom.find('.stem-con-content').children().length > 1) {
          //多个节点时候，第一个节点高度直接大于剩余高度，就没有必要放到一个页面，直接将整个试题高度累加
          var firstDomHeight = structNextDom.find('.stem-con-content').children().first().outerHeight(true)
          if (firstDomHeight < (contentH - tempHeight)) {
            nextItemDomHeight += firstDomHeight;//试题第一个段落高度 
          } else {
            nextItemDomHeight += structNextDom.outerHeight(true);//试题整个高度 
          }
        }
      }

      //上方的节点是不是单元  并且  下发无法放置一道试题 ，上当单元已经将下方的结构+试题计算过
      // if (!$($blockDom[index - 2]).hasClass('partContent') && (tempHeight + temp + nextItemDomHeight) > contentH) {
      if (contentH - tempHeight < 100) {
      // if (contentH - tempHeight - itemDom.outerHeight(true)  <= nextItemDomHeight) {
        //新页面
        newPageFun(itemDom, '2');
        //新的一页，高度重新计算
        tempHeight = temp;
        continue
      }
    }
    //当前页码不足够下一个试题
    // console.log(temp, tempHeight, contentH)
    if ((tempHeight + temp) > contentH) {
      //特殊题型直接跳过
      if (itemDom.hasClass('single')//单选题
        || itemDom.hasClass('judgeAndCorrect')//判断改错题
        || itemDom.hasClass('judgment')//判断题
        || itemDom.hasClass('fillblank')//填空题
        || itemDom.hasClass('structContent')//试题结构
        || itemDom.hasClass('multiple')//多项选择题
      ) {
        tempHeight = temp;
        // console.log('特殊题型的' + (tempHeight - temp) + ' + ' + temp + '  =  ' + tempHeight + '    ' + itemDom.text())
        continue;
      }
      
      if (contentH - tempHeight < 100) {
        newPageFun(itemDom, '3');
        tempHeight = 0;
      }

      //当前试题节点中只有一个段落，自动划分到新页面，后续需要处理一下超过一页的情况，不然会出现空白页面
      // if (itemDom.find('.stem-con-content').children().length == 1) {


        // console.log(temp, tempHeight, contentH)
        // 超出部分切割段落
        if (temp > contentH - tempHeight) {
          let Split = new splitHtml({
            originDom: itemDom,
            width: contentW,
            height: contentH - tempHeight,
            pageHeight: contentH
          })
          let splitHtmlList = Split.getsplitHtmls()
          // console.log(splitHtmlList)
          if (splitHtmlList && splitHtmlList instanceof Array && splitHtmlList.length > 0) {
            splitHtmlList.forEach(item => {
              itemDom.before(item)
            })
            itemDom.remove()
            temp = $(splitHtmlList[splitHtmlList.length - 1]).outerHeight()
          }
          Split.delContainer()
          // console.log('====警告=========内容只有一个元素的,该试题需要老师进行切割,不然会产出空白页面' + itemDom.text())
        }

        //高度加上当前dom，继续下一个dom
        tempHeight = temp;
        // console.log('内容只有一个元素的' + (tempHeight - temp) + ' + ' + temp + '  =  ' + tempHeight + '    ' + itemDom.text())
        continue;
      // }
    } else {
      tempHeight += temp
      // console.log((tempHeight - temp) + ' + ' + temp + '  =  ' + tempHeight + '    ' + itemDom.text())
    }
  }
}

function dealImg() {
  //如果有图片，需要图片加载完成，不然高度计算有问题
  var imgArr = $('img');
  if (imgArr.length == 0) {
    getBlockHeight()
    $('.paper-con').append($('.calc-con').html())
    $('.calc-con').remove();
    $('.model-con').remove()
    //去除内容部分样式，需要保留的样式列在savecss中s
    removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .blank, .stem-prev-con, .ignoreCls"))
    d1.resolve();
  } else {
    let imgLen = imgArr.length
      , imgCount = 0
    imgArr.load(function () {
      imgCount++
      if (imgCount == imgLen) {
        getBlockHeight()
        $('.paper-con').append($('.calc-con').html())
        $('.calc-con').remove();
        $('.model-con').remove()
        //去除内容部分样式，需要保留的样式列在savecss中s
        removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .blank, .stem-prev-con, .ignoreCls"))
        d1.resolve();
      }
    })
    imgArr.error(function () {
      getBlockHeight()
      $('.paper-con').append($('.calc-con').html())
      $('.calc-con').remove();
      $('.model-con').remove()
      //去除内容部分样式，需要保留的样式列在savecss中s
      removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .blank, .stem-prev-con, .ignoreCls"))
      d1.resolve();
    });
  }
}

// 页脚内容设置
function setFooter() {
  bookConfig['simplePageNum']['pendant'] = '<div style="height: 4cm;" class="page-num-simple"><span style=\"color: #000;\">' + (paperName || '') + '试题卷第${PAGE}页（共${TOTAL_PAGE}页）</span></div>'
}

// 获取试卷数据
function getPaperData(paperDataCallback, paperHtmlCallback, ret) {
  if (ret) {
    retdata = ret.paper || []
    paperName = ret.paperName || ''
    let paperHtmlStr = ''
      , paperEditVersion = ret.paperEditVersion && Number(ret.paperEditVersion) || ''
    if (ret.paperHtml) {
      paperHtmlStr = ret.paperHtml
      if([2, 3].includes(paperEditVersion)) {
        paperHtmlStr = utf8To16($.base64.decode(paperHtmlStr, "utf-8"))
      }
    }
    if (ret.paperHtml && paperHtmlCallback && paperHtmlCallback instanceof Function) {
      paperHtmlCallback(paperHtmlStr, paperEditVersion)
      paperContentType = 'htmlStr'
    } else { // 未排版的数据
      if (paperDataCallback && paperDataCallback instanceof Function) {
        paperDataCallback(paperHtmlStr)
        paperContentType = 'data'
      }
    }
  }
}