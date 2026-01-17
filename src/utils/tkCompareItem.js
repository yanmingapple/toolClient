export default {
  versionInfo(newValue,oldValue) {
    if (!newValue && !oldValue) return 

    var pageDataInfo = {
      itemContent: [oldValue, newValue]
    }

    // 将html内容二级以下平级处理
    var dealHtml = function(htmlStr,replaceHtmlObj, replaceHtmlObjIndexTmp) {
      let $domBox = $('<div></div>')
      $domBox.html(htmlStr)
      let cNodes = $domBox[0].childNodes
        , comHtmlStr = ''
      for (let index = 0; index < cNodes.length; index++) {
        const _e = cNodes[index]
        if (['IMG','FIGURE', 'TABLE', 'INPUT'].includes(_e.nodeName)) {
          if(replaceHtmlObj){
            replaceHtmlObj.push(_e.outerHTML)
          }

          comHtmlStr += replaceHtmlObjIndexTmp
        }
        // dom节点
        else if (_e.nodeType == 1) {
          comHtmlStr += dealHtml(_e.innerHTML,replaceHtmlObj, replaceHtmlObjIndexTmp)
        }
        // text 文本
        else if (_e.nodeType == 3) {
          
          comHtmlStr += _e.data.replaceAll("\n","</br>")
        }
      }
      return comHtmlStr
    }

  var compareVersion = {
    /* @description 针对文本之间的对比
      * itemArr 对比的数组 (字符串比较)
      * ineve   内容的节点(js dom对象)
      */
    launch: function (itemArr, ineve) {
      var dmp = new diff_match_patch();
      var d = dmp.diff_main(itemArr[0], itemArr[1]);
      dmp.diff_cleanupEfficiency(d);
      var ds = dmp.diff_prettyHtml(d);
      var span = document.createElement('span');
      span.innerHTML = ds.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      ineve.appendChild(span);
    },
    /* @description 两个表格之间的对比
      * tabA 表格1
      * tabB 表格2
      */
    launchTable: function (tabA, tabB) {
      // 获得最大行数
      var trnum = tabA.rows;
      var trnum2 = tabB.rows;
      var maxlength = Math.max(trnum.length, trnum2.length);
      // 或得最大列数
      var itemtdlength1 = tabA.rows.item(0).cells.length;
      var itemtdlength2 = tabB.rows.item(0).cells.length;
      var maxrows = Math.max(itemtdlength1, itemtdlength2);
      // 生成表格
      var tableStr =
        '<table class="table-bordered" style="border: 1px solid rgb(204, 204, 204); border-spacing: 0px;"><tbody>';
      for (var i = 0; i < maxlength; i++) {
        var strq = '';
        for (var j = 0; j < maxrows; j++) {
          strq += '<td id="td_' + i + j +
            '" style="border-width: 2px 1px 1px; border-style: solid; border-color: rgb(0, 0, 0) rgb(0, 0, 0) rgb(0, 0, 0) rgb(204, 204, 204); border-image: initial; word-break: break-all;" width="218" valign="top"></td>'
        }
        tableStr += '<tr id="tr_' + i + '" style="border:1px solid #ccc;">' + strq + '</tr>';
      }
      tableStr += '</tbody></table>';
      $tabA = document.createElement('div');
      $tabA.innerHTML = tableStr;
      // 逐个对比
      for (var index = 0; index < maxlength; index++) {
        if (maxlength === trnum.length) {
          var tdnum = tabA.rows[index].cells;
          if (index < trnum2.length) {
            var tdnum2 = tabB.rows[index].cells;
            if (index === trnum2.length) {
              break;
            }
          }
        } else {
          var tdnum2 = tabB.rows[index].cells;
          if (index < trnum.length) {
            var tdnum = tabA.rows[index].cells;
            if (index === trnum.length) {
              break;
            }
          }
        }
        for (var item = 0; item < maxrows; item++) {
          var str1 = '';
          var str2 = '';
          if (index < trnum.length && item < tdnum.length) {
            str1 = tdnum[item].innerText;
          }
          if (index < trnum2.length && item < tdnum2.length) {
            str2 = tdnum2[item].innerText;
          }
          // 去除\n 换行符 改成 <br> 换行符形式;
          str1 = str1.replace(/\n/ig, '<br>');
          str2 = str2.replace(/\n/ig, '<br>');
          var launchStr = [];
          launchStr[0] = str1 || '';
          launchStr[1] = str2 || '';
          var span = document.createElement('span');
          var targetDom = $tabA.querySelectorAll('#td_' + index + item)[0];
          // if(launchStr[0] === '<br>' && launchStr[1] !== '<br>'){
          //     // span.innerText = launchStr[1];
          //     // span.style.color = "#ddfade"
          //     // targetDom.appendChild(span);
          // }else if(launchStr[0] !== '<br>' && launchStr[1] === '<br>'){
          //     // span.innerText = launchStr[0];
          //     // span.style.color = "#ffe7e7"
          //     // targetDom.appendChild(span);
          // }else{
          compareVersion.launch(launchStr, targetDom);
          // }
        }
        // 增加 或 删除列
        if (maxrows === itemtdlength2) {
          for (var k = itemtdlength1; k < itemtdlength2; k++) {
            var targetDom = $tabA.querySelectorAll('#td_' + index + k)[0];
            targetDom.style.backgroundColor = "#ddfade"
          }
        } else {
          for (var k = itemtdlength2; k < itemtdlength1; k++) {
            var targetDom = $tabA.querySelectorAll('#td_' + index + k)[0];
            targetDom.style.backgroundColor = "#ffe7e7"
          }
        }
        // 增加 或 删除行
        if (maxlength === trnum2.length) {
          for (var z = trnum.length; z < trnum2.length; z++) {
            var targetDom = $tabA.querySelectorAll('#tr_' + z)[0];
            targetDom.style.backgroundColor = "#ddfade"
          }
        } else {
          for (var z = trnum2.length; z < trnum.length; z++) {
            var targetDom = $tabA.querySelectorAll('#tr_' + z)[0];
            targetDom.style.backgroundColor = "#ffe7e7"
          }
        }
      }
      return $tabA;
    },
    /*
      * @description: dom节点中的文本节点 更改为span 包裹的元素节点；
      * dom:  内容的节点( js 对象)
      */
    sybmolStr: function (dom) {
      var sybmolTextDom = function (dom) {
        if (dom.tagName !== 'TABLE' && dom.tagName !== 'BR') {
          if (dom.length === 1 && dom[0].nodeType === 3) {
            var strNode = dom;
          } else {
            var strNode = dom.childNodes
          }
          for (var j = 0; j < strNode.length; j++) {
            var strNodeEq = strNode[j];
            if (strNodeEq.nodeType === 3) {
              var span = document.createElement('span');
              span.className = "version-text";
              span.innerText = strNodeEq.data;
              dom.replaceChild(span, strNodeEq)
            } else {
              if (strNodeEq.childNodes.length > 0) {
                sybmolTextDom(strNodeEq);
              }
            }
          }
        }
      }
      sybmolTextDom(dom);
    },
    compareDoubleDom: function (oldElem, newElem, ineve) {
      var i = 0,
        j = 0,
        k = 0;
      /*
        * @description: 查找后续节点中是否有该节点；
        * 返回 找个的节点的序号
        */
      var chkTagAgain = function () {
        for (k = i + 1; k < newElem.children.length; k++) {
          var __chkTagIsSame = chkTagIsSame(oldElem.children[j], newElem.children[k]);
          if (__chkTagIsSame === 1) {
            break;
          }
        }
        return k;
      }


      /*
      * @description: 判断两个的是否相同
      * 返回差异的类型 
      * 
          * 返回0，说明dom节点名称(即tagName)不相同
          * 返回1，说明dom节点名称(即tagName)相同，同时节点内的内容也相同
          * 返回2，说明dom节点名称0(即tagName)相同，但节点内的内容不相同
          * 
          */
          var chkTagIsSame = function (oldElem, newElem) {
            // dom节点名称(即tagName)是否相同
            var result = newElem.tagName === oldElem.tagName;
            // table 不需要遍历子节点
            if (result && newElem.children.length === 0 && oldElem.children.length === 0) {
              // dom节点名称(即tagName)相同，同时没有子节点，比对innerText结果是否相同
              result = newElem.innerText === oldElem.innerText;
              if (result) {
                // 返回1，说明dom节点名称(即tagName)相同，同时节点内的内容也相同
                if (newElem.tagName === 'IMG') {
                  if (newElem.getAttribute('src') === oldElem.getAttribute('src')) {
                    return 1
                  } else {
                    return 2
                  }
                } else {
                  return 1;
                }
              } else {
                // 返回2，说明dom节点名称0(即tagName)相同，但节点内的内容不相同
                return 2;
              }
            } else {
              if (!result) {
                // 返回0，说明dom节点名称(即tagName)不相同
                return 0;
              } else {
                // 标签名相同

                // 内容相同
                if (newElem.innerHTML === oldElem.innerHTML) {
                  return 1
                } else {
                  // if (newElem.children.length === 0 && oldElem.children.length > 0) {
                  //     // 新版本的dom节点不存在子节点，而旧版本中存在子节点
                  //     // 新版本对旧版本而言，进行了删除操作
                  // } else if (newElem.children.length > 0 && oldElem.children.length === 0) {
                  //     // 新版本的dom节点存在子节点，而旧版本中不存在子节点
                  //     // 新版本对旧版本而言，进行了新增操作
                  // } else {
                  // 标签名相同 内容不相同  继续比较子节点  如果是表格 不需要对比自己子节点
                  if (newElem.tagName !== 'TABLE') {
                    compareVersion.compareDoubleDom(oldElem, newElem, ineve);
                  } else {
                    return 2
                  }
                }
              }
              return 1;
            }
          }


          // 节点后插入节点
          var insertAfter = function (newElement, targetElement) {
            var parent = targetElement.parentNode;
            if (parent.lastChild == targetElement) {
              parent.appendChild(newElement);
            } else {
              parent.insertBefore(newElement, targetElement.nextSibling);
            }
          }


          //轮训节点
          for (; i < newElem.children.length; i++) {
            // 旧版本 没有更多节点 跳出循环
            if (j === oldElem.children.length) {
              break;
            }

            for (; j < oldElem.children.length; j++) {
              // 新版本 没有更多节点 跳出循环
              if (i === newElem.children.length) {
                break;
              }

              // 旧节点 没有子节点 跳出循环
              var __chkTagIsSame = chkTagIsSame(oldElem.children[j], newElem.children[i]);
              var l = i;

              // dom节点名称(即tagName)相同，同时节点内的内容也相同
          //     * 返回0，说明dom节点名称(即tagName)不相同
          //  * 返回1，说明dom节点名称(即tagName)相同，同时节点内的内容也相同
          //  * 返回2，说明dom节点名称0(即tagName)相同，但节点内的内容不相同
              if (__chkTagIsSame === 1) {
                j++;
                break;
              } else if (__chkTagIsSame === 2) {
                // 返回2，说明dom节点名称(即tagName)相同，但节点内的内容不相同
                // 继续遍历newElem，一直找到节点名称和内容也相同的dom节点
                var __chkTagAgain = chkTagAgain();
                if (__chkTagAgain < newElem.children.length) {
                  // 找到了相同的节点，同时内容也相同  表示中间插入了节点
                  for (; l < __chkTagAgain; l++) {
                    if (newElem.children[l].tagName === 'IMG') {
                      newElem.children[l].className = 'img-added';
                    } else {
                      newElem.children[l].className = 'text-added';
                    }
                    // 插入新节点  应当是插在节点前面
                    // 克隆节点
                    var addedDom = newElem.children[l].cloneNode(true);
                    oldElem.insertBefore(addedDom, oldElem.children[j]);
                    j++;
                  }
                  i = __chkTagAgain - 1;
                  break;
                } else {
                  // 没有找到相同的节点  即当表示节点进行了修改  分为 图片和文本模式
                  if (oldElem.children[j].tagName === 'SPAN') {
                    var str = [];
                    str[0] = oldElem.children[j].innerText;
                    str[1] = newElem.children[i].innerText;
                    // 文字对比
                    compareVersion.launch(str, oldElem.children[j]);
                    j++;
                    break;
                  }
                  // 如果是表格 表示 是表格进行了修改
                  if (oldElem.children[j].tagName === 'TABLE') {
                    // 表格对比 返回一个新的表格
                    var newTableDom = compareVersion.launchTable(oldElem.children[j], newElem.children[i]);
                    // insertAfter(newDom, oldElem.children[j]);
                    // 进行节点替换
                    oldElem.replaceChild(newTableDom, oldElem.children[j])
                    i++;
                  }
                  // 没有找到相同的节点  表示删除了旧的  是否是新增了新的呢？
                  if (oldElem.children[j].tagName === 'IMG') {
                    if (oldElem.children.length <= newElem.children.length) {
                      // 删除了节点 新增了节点
                      oldElem.children[j].className = 'img-delete';
                      newElem.children[i].className = 'img-added';
                      // 新节点插入到旧节点后面
                      // insertAfter(newElem.children[i], oldElem.children[j])
                      if (oldElem.children[j].tagName !== 'BR') {
                        var addedDom = newElem.children[l].cloneNode(true);
                        oldElem.insertBefore(addedDom, oldElem.children[j]);
                        j++;
                      }
                    } else {
                      // 只是单单的删除
                      oldElem.children[j].className = 'img-delete';
                    }
                  }
                  continue;
                }
              } else if (__chkTagIsSame === 0) {
                var __chkTagAgain = chkTagAgain();
                if (__chkTagAgain < newElem.children.length) {
                  for (var l = i; l < __chkTagAgain; l++) {
                    if (newElem.children[l].tagName === 'IMG') {
                      newElem.children[l].className = 'img-added';
                    } else {
                      newElem.children[l].className = 'text-added';
                    }
                    // 插入新节点
                    if (oldElem.children[j].tagName !== 'BR') {
                      var addedDom = newElem.children[l].cloneNode(true);
                      oldElem.insertBefore(addedDom, oldElem.children[j]);
                      j++;
                    }
                  }
                  i = __chkTagAgain - 1;
                  break;
                } else {
                  // 删除和新增
                  if (oldElem.children.length <= newElem.children.length) {
                    if (oldElem.children[j].tagName === 'IMG') {
                      oldElem.children[j].className = 'img-delete';
                    } else {
                      oldElem.children[j].className = 'text-delete';
                    }
                    if (newElem.children[i].tagName === 'IMG') {
                      newElem.children[i].className = 'img-added';
                    } else {
                      newElem.children[i].className = 'text-added';
                    }
                    var addedDom = newElem.children[i].cloneNode(true);
                    insertAfter(addedDom, oldElem.children[j])
                    // dom 后面新增了一个 应该 += 2
                    j += 2;
                    break;
                  } else {
                    // 即表示该节点被删除
                    if (oldElem.children[j].tagName === 'IMG') {
                      oldElem.children[j].className = 'img-delete';
                    } else {
                      oldElem.children[j].className = 'text-delete';
                    }
                  }
                }
              }
            }
          }



          if (i < newElem.children.length) {
            for (var l = i; l < newElem.children.length; l++) {
              if (newElem.children[l].tagName === 'IMG') {
                newElem.children[l].className = 'img-added';
              } else {
                newElem.children[l].className = 'text-added';
              }
              var addedDom = newElem.children[l].cloneNode(true);
              oldElem.appendChild(addedDom);
              j++;
            }
          }
          if (j < oldElem.children.length) {
            for (var l = j; l < oldElem.children.length; l++) {
              if (oldElem.children[l].tagName === 'IMG') {
                oldElem.children[l].className = 'img-delete';
              } else {
                oldElem.children[l].className = 'text-delete';
              }
            }
          }
          //  最后插入整个节点 插入节点
          if (oldElem.className === 'verPrevDom') {
            ineve.appendChild(oldElem);
          }
      }
    };


    var replaceHtmlObj = [];
    var oldReplaceHtmlObj = []
    var newValue1 = dealHtml(newValue,replaceHtmlObj, '{replaceHtmlObjHtml}')
    var oldValue1 = dealHtml(oldValue, oldReplaceHtmlObj, '{replaceHtmlObjHtml}')
    
    var outputdiv = document.createElement('div');
    compareVersion.launch([oldValue1,newValue1], outputdiv);
    var retHtml = outputdiv.outerHTML.replaceAll("{replaceHtmlObjHtmlBR}","</br>")

    var retHtmlDom = $(retHtml);
    var innerImg = 0
    retHtmlDom.find('del').each((index, item) => {
      let mats = item.innerHTML.match(/\{replaceHtmlObjHtml\}/g)
      let delHtml = item.innerHTML
      if (mats && mats.length > 0) {
        for (let i = 0; i < mats.length; i++) {
          delHtml = delHtml.replace("{replaceHtmlObjHtml}",oldReplaceHtmlObj[innerImg++])
        }
        $(item).html(delHtml)
      }
    })

    retHtml = retHtmlDom.html()
    for(var index =0;index <replaceHtmlObj.length;index++ ){
      retHtml = retHtml.replace("{replaceHtmlObjHtml}",replaceHtmlObj[index])
    }
    retHtmlDom = $(retHtml);


    retHtmlDom.find('img').each((index,item)=>{

      if(item.parentNode && item.parentNode.nodeName == "FIGURE"){
        if(item.parentNode.parentNode && item.parentNode.parentNode.nodeName == "INS"){
          item.parentNode.parentNode.style.display = 'block'
          item.classList.add("img-added");
        }else if(item.parentNode.parentNode && item.parentNode.parentNode.nodeName == "DEL"){
          item.parentNode.parentNode.style.display = 'block'
          item.classList.add("img-delete");
        }
      }else{
        if(item.parentNode && item.parentNode.nodeName == "INS"){
          item.parentNode.style.display = 'block'
          item.classList.add("img-added");
        }else if(item.parentNode && item.parentNode.nodeName == "DEL"){
          item.parentNode.style.display = 'block'
          item.classList.add("img-delete");
        }
      }

    });
    return retHtmlDom.html();
  }
}