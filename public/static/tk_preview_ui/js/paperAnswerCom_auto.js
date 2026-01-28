var paperId = getQueryString('paperId'),
  retdata = [],
  examYear = '&nbsp;&nbsp;&nbsp;&nbsp;',
  examMonth = '&nbsp;&nbsp;',
  paperTitleField = 'otherExam',
  isSystem = getQueryString('isSystem') || '',
  ip = getQueryString('ip') || '',
  port = '' | getQueryString('port'),
  paperId = getQueryString('paperId') || '',
  stage = getQueryString('stage') || '',
  activityId = getQueryString('activityId') || '',
  subjectData = {},
  codeTmp = { '<input>': '&lt;input&gt;' },
  pxOfCm = (function () {
    var e = document.createElement('div'),
      e =
        ((e.id = 'cm'),
        (e.style.width = '1cm'),
        (e.style.display = 'block'),
        document.querySelector('body').appendChild(e),
        document.getElementById('cm').getBoundingClientRect().width);
    return $('#cm').remove(), e;
  })(),
  pageMap = {
    paper: { name: 'ISO_A4', pxSizeOfW: 21 * pxOfCm, pxSizeOfH: 29.6 * pxOfCm },
    padding: '4cm 3.5cm 4cm 3.5cm',
  },
  itemTypeMap = {
    1: 'single',
    10: 'caseAnalysis',
    11: 'fillblank',
    12: 'fillItems',
    13: 'fillSingle',
    14: 'double',
    15: 'judgeAndCorrect',
    16: 'choseFillBlank',
    2: 'multiple',
    3: 'judgment',
    4: 'indeterminate',
    5: 'shortanswer',
    6: 'calculationAnalysis',
    7: 'comprehensive',
    8: 'questionsAndAnswers',
    9: 'indeterminateComprehensive',
    999: 'structContent',
    1e3: 'partContent',
  },
  paddingArrOfPx = (function () {
    var e = pageMap.padding.split(' '),
      t = [];
    return (
      forFun(e, function (e) {
        t.push(e.replace('cm', '') * pxOfCm || '');
      }),
      t
    );
  })(),
  contentW = pageMap.paper.pxSizeOfW - paddingArrOfPx[1] - paddingArrOfPx[3],
  contentH = pageMap.paper.pxSizeOfH - paddingArrOfPx[2] - paddingArrOfPx[0],
  isSL = !1;
function codeCodeTmp(e) {
  for (var t in codeTmp) e = e.replaceAll(t, codeTmp[t]);
  return e;
}
function dealSpecialContnt() {
  for (var e = $('.calc-con').find('code'), t = 0; t < e.length; t++) {
    var n = e[t].innerHTML.replace(/</g, '&lt').replace(/>/g, '&gt'),
      a = $('<code style="background: transparent; white-space: break-spaces;"></code>');
    a.html(n), $(e[t]).replaceWith(a);
  }
  var i = $('.calc-con .block-item.item-con');
  forFun(i, function (e) {
    var t,
      e = $(e),
      n = e.find('.prev-con').first(),
      a = 0 < n.length ? $(n.children()[0]).text() : '',
      i =
        (e.find('img.PageGraph').each(function (e, t) {
          var n = $(t).parents('figure');
          (n && 0 != n.length) ||
            $(t).replaceWith('<figure class="image ">' + t.outerHTML + '<figcaption>题xxx图</figcaption></figure>');
        }),
        e.find('figcaption'));
    for (let e = 0; e < i.length; e++)
      '题xxx图' == $(i[e]).text() &&
        ((t = 1 == i.length ? '答' + a + '图' : '答' + a + '-' + (e + 1) + '图'), $(i[e]).html(t));
    for (var s = e.find('table').not('table table'), c = 0; c < s.length; c++) {
      var r = 1 === s.length ? '答' + a + '表' : '答' + a + '-' + (c + 1) + '表',
        p = $(s[c]).find('caption');
      0 < p.length
        ? '题xxx表' == p.text()
          ? p.html(r)
          : p.text().trim() || p.remove()
        : $(s[c]).prepend('<caption>' + r + '</caption>');
    }
  }),
    setAccentText($('.calc-con').find('.AccentText'));
}
function setDotOfPaper() {
  for (var e = $('.item-con'), t = 0; t < e.length; t++) {
    var n = doAllDot(e[t]);
    $(e[t]).replaceWith(n);
  }
}
function doAllDot(e) {
  if ('#text' === e.nodeName)
    return $(e)
      .text()
      .replaceAll('“', '<span class="cn-dot-con">$&</span>')
      .replaceAll('”', '<span class="cn-dot-con">$&</span>')
      .replaceAll('：', '<span class="cn-dot-con">$&</span>')
      .replaceAll('，', '<span class="cn-dot-con">$&</span>')
      .replaceAll('、', '<span class="cn-dot-con">$&</span>')
      .replaceAll('·', '<span class="cn-dot-con">$&</span>');
  for (var t = e.childNodes, n = $(e).clone(!0), a = 0; a < t.length; a++) {
    var i = this.doAllDot(t[a]);
    0 === a ? n.html(i) : n.append(i);
  }
  return n[0].outerHTML;
}
function setDate() {
  var e;
  ($('.paperName').text() || '').indexOf(examYear) < 0 &&
    ((e = 'otherExam' == paperTitleField ? '月江苏省高等教育自学考试' : '月高等教育自学考试全国统一命题考试'),
    $('.paperName').html(examYear + '年' + examMonth + e));
}
function dealContent(t) {
  let n = t.answer;
  if (3 == t.itemTypeId) n = ['wrong', 'WRONG'].includes(n) ? 'B' : 'A';
  else if (15 == t.itemTypeId)
    n = `<div class="judge-correct-ans-con">${(n =
      0 <= n.indexOf('||') ? n.replace('||', '。 ') : 'right' == n ? '√。' : '×。' + n)}</div>`;
  else if (11 == t.itemTypeId) {
    let e;
    (e =
      t.attributeList && t.attributeList instanceof Array && 0 < t.attributeList.length
        ? t.attributeList.filter(e => 'answer' == e.type)
        : e) &&
      0 < e.length &&
      (n = e.map(e => e.content || '').join(''));
  } else if (16 == t.itemTypeId)
    if (-1 < n.indexOf('_$_$')) {
      for (var e = n.split('_$_$'), a = [], i = 0, s = e.length; i < s; i++) a.push(+t.paperItemNum + i + '. ' + e[i]);
      n = a.join(' ');
    } else {
      let e;
      (e =
        t.attributeList && t.attributeList instanceof Array && 0 < t.attributeList.length
          ? t.attributeList.filter(e => 'answer' == e.type)
          : e) &&
        0 < e.length &&
        (n = e.map(e => e.content || '').join(''));
    }
  return n;
}
let structureIsItemBlock = !1;
function doPaperHtmlStr(e, r, p) {
  var o = '';
  return (
    forFun(e, function (s, e) {
      if (1 == s.menuInfoType)
        2 !== s.type ||
          isSL ||
          (s.description && (s.description = s.description.substr(0, s.description.indexOf('。') + 1)),
          structureIsItemBlock
            ? (o += `<div data-op-type="block" class="structure-con structContent mceNonEditable block-item"><span>${
                s.name
              }：</span><span class="${itemTypeMap[999]}">${s.description || ''}</span></div>`)
            : ((o += `<div data-op-type="block" class="structure-con structContent"><span>${
                s.name
              }：</span><span class="${itemTypeMap[999]}">${s.description || ''}</span></div></div>`),
              (structureIsItemBlock = !0)));
      else if (['item', 'childItem'].includes(r)) {
        let n = '',
          a = '',
          i = [8, 15].includes(+s.itemTypeId) ? 'block-item' : '';
        if ('item' == r && ![7].includes(+s.itemTypeId))
          if ([16].includes(+s.itemTypeId))
            (n = '<div class="prev-con f-prev-con stem-prev-con"></div>'),
              (a = `<div class="content-con f-content-con stem-con-content">${dealContent(s)}</div>`),
              isSL && (n = ''),
              (o += `<div class="item-con f-item-con item-con-of-type-${s.itemTypeId} ${i}">${n + a}</div>`);
          else {
            n = s.paperItemNum
              ? `<div class="prev-con f-prev-con stem-prev-con"><span>${s.paperItemNum}</span><span class="cn-dot-con">.</span></div>`
              : '';
            var c = dealContent(s);
            (a = c ? `<div class="content-con f-content-con stem-con-content">${c}</div>` : ''), isSL && (n = '');
            let t = '';
            if (11 == s.itemTypeId) {
              let e = $('#tempBox');
              (e && e.length) ||
                ((e = $('<div id="tempBox" style="display: inline-block;"></div>')), $('body').append(e));
              c = e
                .html(`<div class="item-con f-item-con item-con-of-type-${s.itemTypeId} ${i}">${n + a}</div>`)
                .outerWidth(!0);
              console.log(c), (t = contentW / 2 < c ? 'whole-row' : '');
            }
            (n || a) &&
              (o += `<div class="item-con f-item-con item-con-of-type-${s.itemTypeId} ${i} ${t}">${n + a}</div>`);
          }
        'childItem' == r &&
          ((n =
            p && 0 == e
              ? p
              : ((c = -1 < s.paperItemNum.indexOf('(') ? '' : '<span class="cn-dot-con">.</span>'),
                `<div class="prev-con s-prev-con stem-prev-con ${p && 0 !== e ? 'next-child-ans-prev' : ''}"><span>${
                  s.paperItemNum
                }</span>${c}</div>`)),
          (a = `<div class="content-con s-content-con stem-con-content">${dealContent(s)}</div>`),
          isSL && (n = ''),
          (o += `<div class="item-con s-item-con item-con-of-type-${s.itemTypeId} ${i}">${n + a}</div>`));
      }
      var t,
        n,
        e = [],
        c = '',
        a = !1;
      s.childrenPaperPriewVOs && 0 < s.childrenPaperPriewVOs.length
        ? ((e = s.childrenPaperPriewVOs), (c = 'structrue'))
        : s.itemList && 0 < s.itemList.length
        ? ((e = s.itemList),
          (c = 'item'),
          (n = (s.itemList && s.itemList[0] && s.itemList[0].itemTypeId) || '') &&
            (a = [1, 2, 3, 4, 11, 12, 13, 14, 16].includes(+n)))
        : s.childItemList &&
          0 < s.childItemList.length &&
          ((e = s.childItemList),
          (c = 'childItem'),
          (n = (s.childItemList && s.childItemList[0] && s.childItemList[0].itemTypeId) || '') &&
            (a = [1, 2, 3, 4, 11, 12, 13, 14, 16].includes(+n)),
          s.paperItemNum) &&
          (t =
            '<div class="prev-con parent-papernum-of-childitem stem-prev-con"><span>' +
            s.paperItemNum +
            '</span><span class="cn-dot-con">.</span></div><div class="prev-con s-prev-con stem-prev-con">' +
            e[0].paperItemNum +
            '</div>'),
        (o += a
          ? `<div class="block-item ${s.itemTypeId ? '' : 'mceNonEditable col-block-item'}">${doPaperHtmlStr(
              e,
              c,
              t,
            )}</div>`
          : doPaperHtmlStr(e, c, t));
    }),
    o
  );
}
function dealPaperAnswerDataOfcalcCon() {
  let e = !1;
  subjectData.subjectName && 8 < subjectData.subjectName.length && (e = !0),
    (isSL = '05006' == subjectData.subjectCode);
  var t = {
    otherExam:
      '<div class="mceNonEditable"><p class="paper-info block-item">绝密★启用前</p><div class="paperName block-item">' +
      examYear +
      '年' +
      examMonth +
      '月江苏省高等教育自学考试</div><div class="gradeCon block-item ' +
      (e ? 'smaller' : '') +
      '">' +
      subjectData.subjectName +
      '试题答案及评分参考</div><div class="subjectCon block-item">（课程代码 ' +
      subjectData.subjectCode +
      '）</div><div class="noticeTips block-item"><p class="pt-9"><br></p></div>',
    countryExam:
      '<div class="mceNonEditable"><p class="paper-info block-item">绝密★启用前</p><div class="paperName block-item">' +
      examYear +
      '年' +
      examMonth +
      '月高等教育自学考试全国统一命题考试</div><div class="gradeCon block-item ' +
      (e ? 'smaller' : '') +
      '">' +
      subjectData.subjectName +
      '试题答案及评分参考</div><div class="subjectCon block-item">（课程代码 ' +
      subjectData.subjectCode +
      '）</div><div class="noticeTips block-item"><p class="pt-9"><br></p></div>',
  }[paperTitleField];
  (t += doPaperHtmlStr(retdata)),
    $('.calc-con').html(t),
    $('.paper-con img').filter('src'),
    dealSpecialContnt(),
    removeStyle(
      $('.calc-con').find('*').not('table, thead, tbody, tr, th, td, tfooter, .content-con-prev-con, .ignoreCls'),
    ),
    $('#tempBox').remove();
}
function getPaperData(t, n) {
  let e =
      '/paperPdf/seePaperPdf.do?paperId=' + paperId + '&activityId=' + activityId + '&dataType=answer',
    a = 'requestPaper';
  'assignTool' == isSystem &&
    ip &&
    port &&
    (e = 'http://' + ip + ':' + port + '/apps/appSrvRequestAns.do?paperId=' + paperId),
    isSystem ||
      ((e = reqSERVICE),
      (a =
        'appSrvRequest=' +
        JSON.stringify(setRequestJson('0080060017', { paramObj: { paperId: paperId, activityId: activityId } })))),
    requestFrontEnd(
      'POST',
      e,
      a,
      function (e) {
        if (e && e.ret)
          if (
            ((retdata = e.ret.menuList || e.ret.paper || []),
            (examYear = e.ret.examYear || '&nbsp;&nbsp;&nbsp;&nbsp;'),
            (examMonth = e.ret.examMonth ? Number(e.ret.examMonth) : '&nbsp;&nbsp;'),
            (paperTitleField = 1 == e.ret.examType ? 'countryExam' : 'otherExam'),
            (subjectData.subjectName = e.ret.subjectName || (retdata && retdata[0] && retdata[0].subjectName) || ''),
            (subjectData.subjectCode = e.ret.subjectCode || (retdata && retdata[0] && retdata[0].subjectCode) || ''),
            (subjectData.paperCode = e.ret.paperCode || (retdata && retdata[0] && retdata[0].paperName) || ''),
            (document.title =
              'assignTool' == isSystem
                ? subjectData.paperCode + '答案'
                : subjectData.subjectName + subjectData.subjectCode + '答案预览'),
            e.ret.answerHtml)
          ) {
            if (((answerHtml = e.ret.answerHtml), 'assignTool' == isSystem))
              try {
                (answerHtml = utf8To16($.base64.decode(answerHtml, 'utf-8'))),
                  (paperHtmlStr = decodeURIComponent($.base64.decode(paperHtmlStr)));
              } catch (e) {}
            else
              e.ret.answerEditVersion &&
                2 == e.ret.answerEditVersion &&
                (answerHtml = utf8To16($.base64.decode(answerHtml, 'utf-8')));
            n && n instanceof Function && n(answerHtml);
          } else t && t instanceof Function && t();
      },
      function (e) {},
    );
}
