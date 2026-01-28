
var pxOfCm = (function () {
  var div = document.createElement("div");
  div.id = "cm";
  div.style.width = "1cm";
  div.style.display = "block";
  document.querySelector("body").appendChild(div);
  var cm1 = document.getElementById("cm").getBoundingClientRect().width;
  $('#cm').remove()
  return cm1;
})()
  // 页面配置
  , pageMap = {
    paper: {
      name: 'ISO_A4',
      pxSizeOfW: pxOfCm * 21,
      pxSizeOfH: pxOfCm * 29.7
    },
    padding: '4cm 3.5cm 4cm 3.5cm',
  }
  , retdata = []
  , paperInfo = {}
  ,project =  getQueryString('project')//项目类型
  , viewType =  getQueryString('viewType')//显示类型
  ,paperId = getQueryString('paperId')//试卷id
  ,activityId = getQueryString('activityId')//活动id
  , dataType =  getQueryString('dataType')
  , answerEditVersion = ''
  , codeTmp = {
    '<input>': '&lt;input&gt;'
  }
  // 1cm转换px
  // padding转px数组
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

function codeCodeTmp(html) {
  for (var code in codeTmp) {
    html = html.replaceAll(code, codeTmp[code]);
  }
  return html;
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

  //内容处理,目前有表格，图片
  var $blockDom = $('.calc-con .block-item.item-con')
  forFun($blockDom, function (item) {

    var $tempDom = $(item);
    let prevCon = $tempDom.find('.stem-prev-con').first(),
      paperItemNum = prevCon.length > 0 ? $(prevCon.children()[0]).text() : ''

    // 命题工具过来的试题图片class加了 PageGraph 显示标题
    let $assignTitleImgDoms = $tempDom.find('img.PageGraph')
    $assignTitleImgDoms.each(function (index, item) {
      let $pFigureDom = $(item).parents('figure')
      if (!$pFigureDom || $pFigureDom.length == 0) {
        $(item).replaceWith('<figure class="image ">' + item.outerHTML + '<figcaption>题xxx图</figcaption></figure>')
      }
    })
    // 答案中图片加上答几图
    let $figcaption = $tempDom.find('figcaption')
    for (let i = 0; i < $figcaption.length; i++) {
      //如果只有一个图片，只显示一个：题x图，多个显示：题x-x图
      if ($($figcaption[i]).text() == '题xxx图') {
        let captionText = $figcaption.length == 1 ? ('答' + paperItemNum + '图') : ('答' + paperItemNum + '-' + (i + 1) + '图')
        $($figcaption[i]).html(captionText)
      }
    }

    // 表格顶部加文字处理
    var $table = $tempDom.find('table').not('table table')
    for (var i = 0; i < $table.length; i++) {
      //如果只有一个表格，只显示一个：答x表，多个显示：答x-x表
      let captionText = $table.length === 1 ? ('答' + paperItemNum + '表') : ('答' + paperItemNum + '-' + (i + 1) + '表')

      var $caption = $($table[i]).find('caption');
      if ($caption.length > 0) {
        if ($caption.text() == '题xxx表') {
          $caption.html(captionText);
        } else if (!$caption.text().trim()) {
          $caption.remove()
        }
      } else {
        $($table[i]).prepend('<caption>' + captionText + '</caption>')
      }
    }
  });
  // 文字设置着重符号
  setAccentText($('.calc-con').find('.AccentText'))
}

// 处理答案内容
// attributeList.attrGroup  填空题答案处理
function dealContent(item) {
  // 1	单项选择题
  // 11	填空题
  // 12	完形填空题
  // 17	构形填空题
  // 2	多项选择题
  // 20	操作题
  // 3	判断题
  // 5	简答题
  // 8	复合题

  let content = item.answer
  if (item.systemItemTypeCode == 3) {
    if (['wrong', 'WRONG'].includes(content)) {
      content = '错' // B  ×
    } else {
      content = '对' // A  √
    }

    // 判断改错题 答案处理
    if(item.answerAnalysis)
      content = content + `<div class="judge-correct-ans-con">${item.answerAnalysis}</div>`

  }else if (item.systemItemTypeCode == 11) { // 填空题
    let ansList
    if (item.attributeList && item.attributeList instanceof Array && item.attributeList.length > 0) {
      ansList = item.attributeList.filter(_a => _a.type == 'answer')
    }
    if (ansList && ansList.length > 0) {
      content = ansList.map(_a => _a.content || '').join('')
    }
  }else if (item.systemItemTypeCode == 12) { // 完形填空题
    let fillPaperItemNum = +item.paperItemNum.split("-")[0]
    let ansList = content.trim().split(" ")
    if (ansList && ansList.length > 0) {
      content = "";
      ansList.forEach(_a=>{
        const anss = _a.split(":")
        anss[0] = fillPaperItemNum++;
        content += `<span>${anss.join(".")}</span>`
      })
    }
  }  else if (item.systemItemTypeCode == 17) { // 构形填空题
    content = "";
    let fillPaperItemNum = +item.paperItemNum.split("-")[0]
    let ansList = item.attributeList.filter(_a => _a.type == 'answer')
      if (ansList && ansList.length > 0) {
        ansList.forEach((_a,index)=>{
          content += `<div class="block-item sel-block-item"><div class="item-con">
          <div class="stem-prev-con">${fillPaperItemNum++}</div>
          <div class="stem-con-content">${_a.content}</div>
        </div></div>`
        })
      }

    }
  return content
}


// 处理选择题  (如: 1-5 ABCDD) 答案内容
function getSelAnsStr(data) {
  let colCounter = 4
    , counter = 5
    , widthObj = {
      1: 100,
      2: 50,
      3: 33,
      4: 25,
      5: 20,
    }
    , groupArr = []
    , str = ''
  for (let i = 0; i < data.length; i += counter) {
    groupArr.push(data.slice(i, i + counter));
  }
  groupArr.forEach((_g, index) => {
    let L = _g.length
      , colStartFlag = index%colCounter === 0
      , colEndFlag = (index+1)%colCounter === 0 || index == groupArr.length - 1
    if (colStartFlag) str += '<div class="block-item sel-block-item inner-dom-'+colCounter+'">'
    str += '<div class="item-con width-'+(widthObj[colCounter])+'"><div class="stem-prev-con">'+_g[0].paperItemNum+(L > 1 ? '-'+_g[L-1].paperItemNum : '')+'</div><div class="stem-con-content">'
    _g.forEach(_i => {
        str += dealContent(_i) || ''
    });
    str += '</div></div>'
    if (colEndFlag) str += '</div>'
  });
  return str
}

/**
* 处理试卷答案数据
* showPaperItemNumData 综合体语料为空，子题题号（1）（2），不显示语料部分，直接父题题号
*/
let lastDataIsPart = false
function doPaperHtmlStr(data, type, showPaperItemNumData) {
  //定义试卷处理后的html
  var paperHtmlStr = '';
  forFun(data, function (_p, index) {
    // 题型结构
    if ([0,1,2].includes(_p.type)) { // 结构
      let nameHtmlStr = `${_p.name||''}${_p.description||''}`
      if (_p.type == 0) {
        paperHtmlStr += `<div class="top-con">${_p.description}</div>`
        lastDataIsPart = true;
      } else if (_p.type == 1) {// 单元
        // 单元的第一个节点和卷首部分公用一个block-item
        if (index !== 0 && !lastDataIsPart) {
          paperHtmlStr += '<div class="block-item mceNonEditable partContent">'+nameHtmlStr
        } else {
          paperHtmlStr += `<div data-op-type="block" class="partContent">${nameHtmlStr}</div>`
        }
        // 若该节点下没有 结构 则追加一个</div>
        if (!_p.childrenStructures || _p.childrenStructures.length == 0) {
          paperHtmlStr += '</div>'
        }
        lastDataIsPart = true;
      } else if (_p.type === 2) { // 大题
        if (lastDataIsPart || (!lastDataIsPart && type == 'paper' && index == 0)) {
          paperHtmlStr += `<div data-op-type="block" class="structContent">${nameHtmlStr}</div></div>`
          lastDataIsPart = false
        } else {
          paperHtmlStr += `<div data-op-type="block" class="block-item structContent mceNonEditable">${nameHtmlStr}</div>`
        }
      }
    } else if (['item', 'childItem'].includes(type)) {
      // 综合体语料部分不显示答案,非综合体直接显示答案
      let prevHtmlStr = ''
        , contentHtmlStr = ''
      let paperItemNum = _p.paperItemNum;

      if (type == 'item') {
        if(["8","11","12","17"].includes(_p.systemItemTypeCode)){
          paperItemNum = "";
        }

        prevHtmlStr = paperItemNum ? `<div class="stem-prev-con f-prev-con"><span>${paperItemNum}.</span></div>` : ''
        let contentStr = dealContent(_p)
        contentHtmlStr = contentStr ? `<div class="stem-con-content f-content-con">${contentStr}</div>` : ''

        if (prevHtmlStr || contentHtmlStr) {
          paperHtmlStr += `<div class="block-item item-con f-item-con">${prevHtmlStr + contentHtmlStr}</div>`
        }
      }
      if (type == 'childItem') {
        if (showPaperItemNumData && index == 0) {
          prevHtmlStr = showPaperItemNumData
        } else {
          let dotStr = paperItemNum.indexOf('(') > -1 ? '' : '.'
            , tempCls = showPaperItemNumData && index !== 0 ? 'next-child-ans-prev' : ''
          prevHtmlStr = `<div class="stem-prev-con s-prev-con ${tempCls}"><span>${paperItemNum}${dotStr}</span></div>`
        }
        contentHtmlStr = `<div class="stem-con-content s-content-con">${dealContent(_p)}</div>`
        paperHtmlStr += `<div class="block-item item-con s-item-con">${prevHtmlStr + contentHtmlStr}</div>`
      }
    }

    var innerData = []
      , innerType = ''
      , showPaperItemNum
    if (_p.childrenStructures && _p.childrenStructures.length > 0) {
      innerData = _p.childrenStructures
      innerType = 'structrue'
      paperHtmlStr += doPaperHtmlStr(innerData, innerType, showPaperItemNum)
    }
    //轮训的结构下面是试题
    else if (_p.itemList && _p.itemList.length > 0) {
      innerData = _p.itemList
      innerType = 'item'
      //获取一个结构下面的试题列表，看是否 连续的相同题型并且是选择题,如果是就合并成一组
      let  tempSigleList = [];
      _p.itemList.forEach(_i=>{
        if(_i.systemItemTypeCode == '1'){
          tempSigleList.push(_i);
        }else{
          if(tempSigleList.length > 0){
            paperHtmlStr += getSelAnsStr(tempSigleList)
            tempSigleList = [];
          }
          paperHtmlStr += doPaperHtmlStr([_i], innerType, showPaperItemNum)
        }
      })

       //再次判断纯的单选题
       if(tempSigleList.length > 0){
        paperHtmlStr += getSelAnsStr(tempSigleList)
        tempSigleList = [];
        return paperHtmlStr;
      }

      // if (_p.itemList[0] && isSelItem(_p.itemList[0].attributeList)) {
      //   paperHtmlStr += getSelAnsStr(innerData)
      //   return paperHtmlStr
      // }
    } else if (_p.childItemList && _p.childItemList.length > 0) {
      innerData = [..._p.childItemList]
      innerType = 'childItem'
      //获取一个结构下面的试题列表，看是否 连续的相同题型并且是选择题,如果是就合并成一组
      let  tempSigleList = [];
      _p.childItemList.forEach((_i,_iIdnex)=>{
        if(_i.systemItemTypeCode == '1'){
          tempSigleList.push(_i);
        }else{
          if(tempSigleList.length > 0){
            paperHtmlStr += getSelAnsStr(tempSigleList)
            tempSigleList = [];
          }
          paperHtmlStr += doPaperHtmlStr([_i], innerType, showPaperItemNum)
          innerData.splice(_iIdnex,1)
        }
      })
      // 选择题选项显示处理
      //再次判断纯的单选题
      if(tempSigleList.length > 0){
        paperHtmlStr += getSelAnsStr(tempSigleList)
        tempSigleList = [];
        return paperHtmlStr;
      }
      // if (_p.childItemList[0] && isSelItem(_p.childItemList[0].attributeList)) {
      //   paperHtmlStr += getSelAnsStr(innerData)
      //   return paperHtmlStr
      // }

      // 如果综合体语料有题号
      // if (_p.paperItemNum) {
      //   showPaperItemNum = `<div class="stem-prev-con parent-papernum-of-childitem">
      //   <span>${_p.paperItemNum}.</span>
      // </div>
      // <div class="stem-prev-con s-prev-con">${innerData[0].paperItemNum}</div>`
      // }
    }
  })

  return paperHtmlStr;
}
// function getPaperTop(type = 'com') {
//   let paperTopObj = {
//     com:  `<div class="center-align font-size-2x font-weight">河南省普通高中学生学业水平合格性考试</div>
//     <div class="center-align font-size-2x font-family-simhei">${paperInfo.subject||''}</div>
//     <div class="center-align font-size-2x font-family-simhei">参考答案及评分标准</div>`
//   }
//   return type && paperTopObj[type]
// }

// 处理试卷答案数据，并设置到calc-con 中
function dealPaperAnswerDataOfcalcCon(callback) {
  //后续需要判断科目头部如何取值
  var paperHtmlStr = '<div class="mceNonEditable block-item">'
  //试卷内容数据
  paperHtmlStr += doPaperHtmlStr(retdata, 'paper')
  $('.calc-con').html(paperHtmlStr)
    // changePaperFontFamily([
    //   {originF: ['宋体', 'Songti SC', 'simsun', 'SimSun'], targetF: '"Times New Roman", simsun'}, // 宋体, "Songti SC", SimSun
    //   {originF: ['楷体', 'kaiti'], targetF: '"Times New Roman", kaiti'},
    // ])
  //图片src没有的删除掉,编程题目会出现标签问题的现象
  $('.paper-con img').filter('src')
  // 处理特殊内容
  dealSpecialContnt()
  // removeStyle($('.calc-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .content-con-prev-con, .ignoreCls"))
  $('#tempBox').remove()
  if (callback && callback instanceof Function) {
    callback()
  }
}

//新页面插入方法
function newPageFun(itemDom) {
  var kongbaiDom = $('<div data-op-type="new-page"></div>')
  kongbaiDom.insertBefore(itemDom);
}

//找到超出的节点
//现在一级节点为切割方案
function findOutHtmlTag(itemDom, leijiHeight) {
  var childItemList = itemDom.children();
  for (var i = 0; i < childItemList.length; i++) {
    var childDom = $(childItemList[i])
    //当前节点高度大于页面，继续往里找子节点
    if ((leijiHeight + childDom.outerHeight(true)) > contentH) {
      // console.log('当前节点为分割节点 节点高度：'+childDom.outerHeight(true) + '  累计高度： ' +  leijiHeight + "   " + childDom.text());
      return childDom;
    } else {
      leijiHeight += childDom.outerHeight(true)
      // console.log("查找切割节点, 节点高度 " + childDom.outerHeight(true) + '   累计高度: ' +  leijiHeight + "   " + childDom.text());
    }
  }
}

//将节点分割
function splitDomFun(parentDom) {
  var leftParentDom = parentDom.clone();
  var left = leftParentDom.find('.splitdom');
  //左边的节点，删除右边
  left.nextAll().remove()
  var pre = left.parent();
  while (pre.length > 0) {
    pre.nextAll().remove()
    pre = pre.parent()
  }
  left.remove();

  var rightParentDom = parentDom.clone();
  var right = rightParentDom.find('.splitdom');
  //右边的节点，删除左边
  right.prevAll().remove()
  pre = right.parent();
  while (pre.length > 0) {
    if (pre.attr('class').indexOf('stem-con-content') >= 0) {
      pre.prev().html('&nbsp;')
      break;
    } else {
      pre.prevAll().remove()
      pre = pre.parent()
    }
  }
  return {
    before: leftParentDom,
    after: rightParentDom
  }
}

// 页面块元素高度
function getBlockHeight() {
  $('.calc-con').css('width', contentW + 'px')
  var $blockDom = $('.calc-con .block-item')
  var tempHeight = 0;//计算每道题的累加高度
  var currPage = 1;

  var blockDomLength = $blockDom.length;
  for (var index = 0; index < blockDomLength; index++) {
    var itemDom = $($blockDom[index]);
    //试题高度
    var temp = itemDom.outerHeight(true)
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
        var kongbaiDom = $('<div data-op-type="new-page"></div>')
        kongbaiDom.insertBefore(itemDom);
        //新的一页，高度重新计算
        tempHeight = temp;
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
      if (!$($blockDom[index - 2]).hasClass('partContent') && (tempHeight + temp + nextItemDomHeight) > contentH) {
        //新页面
        newPageFun(itemDom);
        //新的一页，高度重新计算
        tempHeight = temp;
      }
    }

    //当前页码不足够下一个试题
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
        // // console.log('特殊题型的'+ (tempHeight - temp)  + ' + ' + temp  + '  =  '  + tempHeight +'    ' + itemDom.text())
        continue;
      }

      //当前试题节点中只有一个段落，自动划分到新页面，后续需要处理一下超过一页的情况，不然会出现空白页面
      if (itemDom.find('.stem-con-content').children().length == 1) {
        if (temp > contentH) {
          // // console.log('====警告=========内容只有一个元素的,该试题需要老师进行切割,不然会产出空白页面' + itemDom.text())
        }

        //高度加上当前dom，继续下一个dom
        tempHeight = temp;
        // // console.log('内容只有一个元素的'+ (tempHeight - temp)  + ' + ' + temp  + '  =  '  + tempHeight +'    ' + itemDom.text())
        continue;
      }

      //当前页面不足当前道题，节点段落中有多个子节点
      if (itemDom.find('.stem-con-content').children().length > 1) {
        var firstDomHeight = itemDom.find('.stem-con-content').children().first().outerHeight(true)
        //多个节点时候，第一个节点高度直接大于剩余高度，直接进入试题切割程序
        if (firstDomHeight > (contentH - tempHeight)) {
          if (temp <= contentH) {
            //高度加上当前dom，继续下一个dom
            tempHeight = temp;
            // // console.log('内容多个元素的'+ (tempHeight - temp)  + ' + ' + temp  + '  =  '  + tempHeight +'    ' + itemDom.text())
            continue;
          }
          //当试需要合并的试题大于一页，新页面继续分割，高度规0
          tempHeight = 0;
        }
      }


      //需要切割的试题，当前剩余高度大于总高度的20%
      var lastHeightPoint = (contentH - tempHeight) / contentH;
      var findContentDom = itemDom.find('.stem-con-content');
      if (lastHeightPoint > 0.03 && findContentDom.length == 1) {
        // console.log("当前页码,高度不足下一道题，剩余高度超过20%，将下一题进行切割，切割高度: "+ (contentH - tempHeight));

        //新页面进行切割
        var leijiHeight = tempHeight;
        do {
          // console.log("当前 页码,高度不足下一题，"+ tempHeight +'+' + temp +'= '+ (tempHeight + temp) + '  超过' + (tempHeight + temp - contentH));
          leijiHeight = leijiHeight;

          var newItemDom = findOutHtmlTag(itemDom.find('.stem-con-content'), leijiHeight);
          if(!newItemDom) return
          // 需要切割的标签添加一个样式
          newItemDom.addClass("splitdom")
          var splitDom = splitDomFun(itemDom, newItemDom);

          //进行插入
          var afterDom = splitDom.after.find('.splitdom');
          splitDom.after.find('.splitdom').removeClass("splitdom")
          splitDom.after.insertAfter(itemDom);
          splitDom.before.insertAfter(itemDom);
          //原节点移除
          itemDom.remove();
          //将处理的itemDom设置为最后一个dom，如果需要分页，继续分页
          itemDom = splitDom.after
          leijiHeight = 0;//统计临时的dom高度归0
          tempHeight = splitDom.after.outerHeight(true)
          if (tempHeight > contentH) {
            //将切割剩余的节点前插入新页面
            newPageFun(splitDom.after);
          }
          //处理如果下一个节点的第一个元素高度大于一页，就会出现死循环
          var afterDomConContentChild = itemDom.find('.stem-con-content').children();
          if (afterDomConContentChild.length > 1 && $(afterDomConContentChild[0]).outerHeight(true) > contentH) {
            tempHeight = 0
          }

          // console.log("新一页码,切割后的试题高度："  + tempHeight);
        } while (tempHeight > contentH);
        // }
      } else {
        //新的也页
        tempHeight = temp
        // console.log( (tempHeight - temp)  + ' + ' + temp  + '  =  '  + tempHeight +'    ' + itemDom.text())
      }
    } else {
      tempHeight += temp
      // console.log( (tempHeight - temp)  + ' + ' + temp  + '  =  '  + tempHeight +'    ' + itemDom.text())
    }
  }
}
function dealImg() {
  //如果有图片，需要图片加载完成，不然高度计算有问题
  var imgArr = $('img');
  if (imgArr.length == 0) {
    getBlockHeight()

    // $('.paper-con').append(  paperHtmlStr)
    $('.paper-con').append($('.calc-con').html())
    $('.calc-con').remove();
    $('.model-con').remove()
    //去除内容部分样式，需要保留的样式列在savecss中s
    // removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .ignoreCls"))
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
        // removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .ignoreCls"))
        d1.resolve();
      }
    })
    imgArr.error(function () {
      getBlockHeight()
      // $('.paper-con').append(  paperHtmlStr)
      $('.paper-con').append($('.calc-con').html())
      $('.calc-con').remove();
      $('.model-con').remove()

      //去除内容部分样式，需要保留的样式列在savecss中s
      // removeStyle($('.paper-con').find('*').not("table, thead, tbody, tr, th, td, tfooter, .ignoreCls"))
      d1.resolve();
    });
  }
}

// 页脚内容设置
function setFooter() {
  bookConfig['simplePageNum']['pendant'] = '<div style="padding-bottom: 34mm;left: 0px;width: 100%;height: 4cm; " class="page-num-simple"><span style=\"color: #000;\">' + paperInfo.subject + '参考答案第${PAGE}页（共${TOTAL_PAGE}页）</span></div>'
}

// 接口获取试卷答案数据
function getPaperData(answerDataCallback, answerHtmlCallback, ret) {
  if (ret) {
    retdata = ret.menuList || ret.paper || [];
    paperInfo['subject'] = ret.subject || ''
    let answerHtml = ''
    answerEditVersion = ret.answerEditVersion && Number(ret.answerEditVersion) || ''
    if (ret.answerHtml) {
      answerHtml = ret.answerHtml
      if([2, 3].includes(answerEditVersion)) {
        answerHtml = utf8To16($.base64.decode(answerHtml, "utf-8"))
      }
    }

    if (answerHtml && answerHtmlCallback && answerHtmlCallback instanceof Function && dataType != 'origin') {
      answerHtmlCallback(answerHtml)
    } else { // 未排版的数据
      if (answerDataCallback && answerDataCallback instanceof Function) {
        answerDataCallback(answerHtml)
      }
    }
  }
}
