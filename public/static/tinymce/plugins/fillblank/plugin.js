/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 *
 * Version: 5.10.0 (2021-10-11)
 */


(function () {
  'use strict';

  const fillBlankIcons = {
    'null-4-fillblank':
      '<svg width="52px" height="1px" viewBox="0 0 52 1" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="1124-下拉" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square"><g id="03" transform="translate(-1203.000000, -88.000000)" stroke="#333333"><g id="编组-16备份-3" transform="translate(1014.000000, 60.000000)"><line x1="190" y1="28.5" x2="240" y2="28.5" id="直线-6"></line></g></g></g></svg>',

    'index-fillblank':
      '<svg width="52px" height="20px" viewBox="0 0 52 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="1124-下拉" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="03" transform="translate(-1203.000000, -124.000000)"><g id="编组-4" transform="translate(1014.000000, 60.000000)"><g id="编组-2" transform="translate(190.000000, 64.000000)"><line x1="1.06685494e-16" y1="19.5" x2="50" y2="19.5" id="直线-6备份" stroke="#333333" stroke-linecap="square"></line><text id="1" font-family="PingFangSC-Regular, PingFang SC" font-size="14" font-weight="normal" fill="#333333"><tspan x="22" y="15">1</tspan></text></g></g></g></g></svg>',

    'icon-fillblank':
      '<svg width="52px" height="17px" viewBox="0 0 52 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="1124-下拉" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="03" transform="translate(-1203.000000, -171.000000)" stroke="#333333"><g id="编组-4" transform="translate(1014.000000, 60.000000)"><g id="编组-2备份" transform="translate(190.000000, 112.000000)"><line x1="1.06685494e-16" y1="15.5" x2="50" y2="15.5" id="直线-6备份" stroke-linecap="square"></line><polygon id="三角形" stroke-width="0.833333333" points="25 0 30 10 20 10"></polygon></g></g></g></g></svg>',

    'itemnumber-fillblank':
      '<svg width="15px" height="12px" t="1764122131414" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4384" width="15" height="12"><path d="M667.001387 1015.569034V3.784873H550.702766L354.448497 184.043583 431.497372 268.356623l120.656013-110.479537v857.691948h114.848002z" p-id="4385" fill="#2c2c2c"></path></svg>',

    'blank-itemnumber':
      '<svg width="74px" height="21px" viewBox="0 0 70 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="1124-下拉" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="03" transform="translate(-885.000000, -308.000000)"><g id="编组-4备份" transform="translate(706.000000, 60.000000)"><g id="编组-16备份-3" transform="translate(150.000000, 0.000000)"><g id="编组-2备份-3" transform="translate(30.000000, 248.000000)"><line x1="1.06685494e-16" y1="20.5" x2="50" y2="20.5" id="直线-6备份" stroke="#333333" stroke-linecap="square"></line><g id="编组-3" transform="translate(50.000000, 0.000000)" fill="#000000" font-family="PingFangSC-Regular, PingFang SC" font-size="14" font-weight="normal"><text id="(1.)"><tspan x="0" y="15">(1.)</tspan></text></g></g></g></g></g></g></svg>',

    'itemnumber-icon-fillblank':
      '<svg width="52px" height="21px" viewBox="0 0 52 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="1124-下拉" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="03" transform="translate(-895.000000, -262.000000)"><g id="编组-4备份" transform="translate(706.000000, 60.000000)"><g id="编组-16备份-3" transform="translate(150.000000, 0.000000)"><g id="编组-2备份-2" transform="translate(40.000000, 202.000000)"><line x1="1.06685494e-16" y1="20.5" x2="50" y2="20.5" id="直线-6备份" stroke="#333333" stroke-linecap="square"></line><g id="编组-3" transform="translate(16.000000, 0.000000)"><polygon id="三角形" stroke="#333333" stroke-width="0.833333333" points="13 5 18 15 8 15"></polygon><text id="1" font-family="PingFangSC-Regular, PingFang SC" font-size="14" font-weight="normal" fill="#000000"><tspan x="0" y="15">1</tspan></text></g></g></g></g></g></g></svg>',
  };

  var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var originFillBlankContent = '';

  var each$1 = function (xs, f) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      f(x, i);
    }
  };

  var selOptionMap = {
    '填空(空4位)': 'null-4-fillblank',
    '1': 'index-fillblank',
    '▲': 'icon-fillblank',
    '题号': 'itemnumber-fillblank',
    '题号▲': 'itemnumber-icon-fillblank',
    '填空(题号)': 'blank-itemnumber',
    // '_题号_': 'line-itemnumber-line',
  };

  var getFormats = function (editor) {
    return editor.getParam('fillBlank_formats', ['▲']);
  };

  //回调
  var fillBlank_process = function (editor) {
    return editor.getParam('fillBlank_process', () => {});
  };
  //调用前回调
  var fillBlank_process_before = function (editor) {
    return editor.getParam('fillBlank_process_before', () => {});
  };
  // 填空题显示序号的开始值
  var getFillBlankIndex = function (editor) {
    return editor.getParam('fillBlank_Index', 1);
  };

  var getDefaultFillBlankValue = function (editor) {
    let defaultClsName = editor.getParam('default_fillblank_clsname'),
      defaultKey = '';
    if (defaultClsName) {
      for (const key in selOptionMap) {
        if (defaultClsName.indexOf(selOptionMap[key]) >= 0) {
          defaultKey = key;
        }
      }
    }
    var formats = getFormats(editor);
    return defaultKey || (formats.length > 0 ? formats[0] : 'num');
  };

  var getFillBlankDesc = function (editor, fmt) {
    var ret = '';
    if (fmt === '1') {
      ret = '数字';
    } else {
      ret = fmt;
    }
    return ret;
  };

  var fillBlankCach = [];

  //更新节点
  var initIncrementingId = 0;
  var updateElement = function (editor, type) {
    var fillBlankIndex = getFillBlankIndex(editor);
    var value = defaultFormat.get();

    var bankArr = $(editor.getElement()).find('.mceNonEditable.blank');

    fillBlankCach = [];
    for (let index = 0; index < bankArr.length; index++) {
      const element = $(bankArr[index]);

      for (var key in selOptionMap) {
        if (element.hasClass(selOptionMap[key])) {
          value = key;
          defaultFormat.set(value);
        }
      }
      //获取class
      var inputBlankClass = selOptionMap[value];

      if (!element.attr('id')) element.attr('id', getId());
      else {
        let tmp = element.attr('id').replace('fillbank_id_', '');
        tmp = Number.parseInt(tmp);
        initIncrementingId = tmp > initIncrementingId ? tmp : initIncrementingId;
      }

      fillBlankCach[index] = { id: element.attr('id'), name: index + fillBlankIndex };

      var isNewFill = false;
      if (element.hasClass('newfill')) {
        fillBlankCach[index]['content'] = originFillBlankContent;
        isNewFill = true;
      }
      // if (type !== 'changeBlankType' && element.hasClass(selOptionMap[value])) {
      //   continue
      // }

      let blankInput1 = element.find('input.blank_1');
      blankInput1.removeAttr('style');

      element.removeClass().addClass('blank mceNonEditable');
      if (inputBlankClass) {
        element.addClass(inputBlankClass);
      }

      if (blankInput1.next().hasClass('blank-suffix-con')) {
        blankInput1.next().remove();
      }
      // 不同的填空选项内容对应不同的填空内容
      if (value == '1') {
        blankInput1.attr('value', index + fillBlankIndex);
      } else if (value == '▲') {
        blankInput1.attr('value', '▲');
      } else if (value == '题号') {
        blankInput1.attr('value', index + fillBlankIndex);
        blankInput1.attr(
          'style',
          'width: 30px; border: none; font-size: 10.5pt; margin: 0; height: 10.5pt; padding: 0;'
        );
      } else if (value == '题号▲') {
        blankInput1.attr('value', index + fillBlankIndex + '▲');
      } else if (value == '填空(题号)') {
        blankInput1.attr('value', '');
        blankInput1.after(
          `<span class="blank-suffix-con">(${index + fillBlankIndex}.</span>`
        );
        if (isNewFill) {
          // blankInput1.after(`<span class="blank-after-suffix-con"> )</span>`)
          element.after(' )');
        }
      } else if (value == '填空(空4位)') {
        blankInput1.attr('value', '    ');
      } else if (value == '_题号_') {
        blankInput1.removeClass('blank_1').addClass('blank_2');
        blankInput1.attr('value', `___${index + fillBlankIndex}___`);
      } else {
        element.attr('value', value);
      }
    }
    //回调
    fillBlank_process(editor)(editor, fillBlankCach);
  };

  var getId = function (element) {
    initIncrementingId++;

    if (!element) {
      return 'fillbank_id_' + initIncrementingId;
    }

    if (!element.id) {
      element.id = 'id_' + initIncrementingId;
    }
    return element.id;
  };

  //插入填空
  var insertFillBlank = function (editor, format) {
    originFillBlankContent = editor.selection.getContent();
    if (format == '填空(题号)') {
      editor.insertContent(
        '<span class="fillBlankBlock"><span class="mceNonEditable blank newfill" id="' +
          getId() +
          '"><input class="blank_1" disabled value="' +
          '' +
          '"></span><span>'
      );
    } else {
      editor.insertContent(
        '<span class="mceNonEditable blank newfill" id="' +
          getId() +
          '"><input class="blank_1" disabled value=""></span>'
      );
    }
  };

  //删除节点
  var delFillBlankElement = function (editor, index) {
    var bankArr = $(editor.getElement()).find('.mceNonEditable.blank');
    $(bankArr[index]).remove();
  };

  var Cell = function (initial) {
    var value = initial;
    var get = function () {
      return value;
    };
    var set = function (v) {
      value = v;
    };
    return {
      get: get,
      set: set,
    };
  };

  var global = tinymce.util.Tools.resolve('tinymce.util.Tools');
  var defaultFormat = null;

  var register$1 = function (editor) {
    editor.addCommand('mceInsertFillBlank', function (_ui, value) {
      let result = fillBlank_process_before(editor)();
      if (result) {
        insertFillBlank(editor, value !== null && value !== void 0 ? value : '');
      }
    });

    //注册一个删除命令
    editor.addCommand('mceDelFillblank', function (index) {
      delFillBlankElement(editor, index);
      updateElement(editor);
    });
  };

  var register = function (editor) {
    editor.ui.registry.addIcon(
      'null-4-fillblank',
      fillBlankIcons['null-4-fillblank']
    );

    editor.ui.registry.addIcon(
      'index-fillblank',
      fillBlankIcons['index-fillblank']
    );

    editor.ui.registry.addIcon(
      'icon-fillblank',
      fillBlankIcons['icon-fillblank']
    );
    editor.ui.registry.addIcon(
      'itemnumber-fillblank',
      fillBlankIcons['itemnumber-fillblank']
    );
    editor.ui.registry.addIcon(
      'itemnumber-icon-fillblank',
      fillBlankIcons['itemnumber-icon-fillblank']
    );
    editor.ui.registry.addIcon(
      'blank-itemnumber',
      fillBlankIcons['blank-itemnumber']
    );

    // 注册一个工具栏按钮名称
    editor.ui.registry.addButton('fillblank', {
      icon: 'fillblank',
      tooltip: 'fillblank',
      onAction: function () {
        editor.execCommand('mceInsertFillBlank', false);
      },
    });

    var formats = getFormats(editor);
    defaultFormat = Cell(getDefaultFillBlankValue(editor));

    editor.ui.registry.addSplitButton('fillblank', {
      icon: 'fillblank',
      tooltip: 'fillblank',
      select: function (value) {
        return value === defaultFormat.get();
      },
      fetch: function (done) {
        done(
          global.map(formats, function (format) {
            return {
              type: 'choiceitem',
              // 不显示文字，只显示图标
              text: '',
              value: format, // 保持原来的值不变
              icon: selOptionMap[format] || 'fillblank', // 用自定义图标来显示
            };
          })
        );
        // done(global.map(formats, function (format) {
        //   return {
        //     type: 'choiceitem',
        //     text: getFillBlankDesc(editor, format),
        //     value: format
        //   };
        // }));
      },
      onAction: function (_api) {
        let result = fillBlank_process_before(editor)();
        if (result) {
          insertFillBlank(editor, defaultFormat.get());
        }
      },
      onItemAction: function (_api, value) {
        defaultFormat.set(value);
        updateElement(editor, 'changeBlankType');
      },
    });
  };

  var setup = function (editor) {
    editor.on('PreInit', function () {
      editor.parser.addNodeFilter('input', function (nodes) {
        each$1(nodes, function (node, index) {
          node.attr('data-mce-resize', 'false');
          node.attr('data-mce-placeholder', '1');
        });
      });
    });

    var nodeChangeHandler = function () {
      updateElement(editor);
    };

    editor.on('NodeChange', nodeChangeHandler);

    editor.on('BeforeSetContent', function (e) {
      var bankArr = $(editor.getElement()).find('.mceNonEditable.blank');
      var newBankArr = [];
      try {
        newBankArr = $(e.content).find('.mceNonEditable.blank');
      } catch (e) {
        newBankArr = $(`<div>${e.content}</div>`).find('.mceNonEditable.blank');
      }

      if (bankArr.length != newBankArr.length) {
        editor.once('SetContent', nodeChangeHandler);
      }
    });

    editor.once('SetContent', nodeChangeHandler);

    return function () {
      return editor.off('NodeChange', nodeChangeHandler);
    };
  };

  function Plugin() {
    global$1.add('fillblank', function (editor) {
      register$1(editor);
      register(editor);

      setup(editor);
    });
  }

  Plugin();
})();
