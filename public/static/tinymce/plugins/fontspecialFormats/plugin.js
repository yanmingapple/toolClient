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

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var each$1 = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i);
      }
    };
    
    //Bold,Italic,Underline,underlinedouble,underlinewavy,underlinedashed,Strikethrough,emphatic,Superscript,Subscript
    var getFormats = function (editor) {
      return editor.getParam('fontspecial_formats', [
        'Bold',
        'Italic',
        'Underline',
        'underlinedouble',
        'underlinewavy',
        'underlinedotted',
        'underlinedashed',
        'Strikethrough',
        'emphatic',
      ]);
    };

    
    var getDefaultFillBlankValue = function (editor) {
      var formats = getFormats(editor);
      return formats.length > 0 ? formats[0] : 'num';
    };

    var getFontspecialFormatsDesc = function (editor, fmt) {
      var ret = '';
      if (fmt === 'Bold') {
        ret = '粗体'
      }else if (fmt === 'Italic') {
        ret = '斜体'
      }else if (fmt === 'Underline') {
        ret = '实线下划线'
      }else if (fmt === 'underlinedouble') {
        ret = '双实线下划线'
      }else if (fmt === 'underlinewavy') {
        ret = '波浪线下划线'
      }else if (fmt === 'underlinedotted') {
        ret = '虚点下划线'
      }else if (fmt === 'underlinedashed') {
        ret = '虚线下划线'
      } else if (fmt === 'Strikethrough') {
        ret = '删除线'
      }else if (fmt === 'emphatic') {
        ret = '着重符号'
      }
      else{
        ret = fmt;
      }
      return ret;
    };

    
    //插入填空
    var insertfontspecial = function (editor, fmt) {
      editor.execCommand(fmt);
      //Underline,underlinedouble,underlinewavy,underlinedashed
      // if (fmt === 'Bold') {
      //   editor.execCommand("Bold");
      // }else if (fmt === 'Italic') {
      //   editor.execCommand("Italic");
      // }else if (fmt === 'solid') {
      //     editor.execCommand("Underline");
      //   }else if (fmt === 'double') {
      //     editor.execCommand("underlinedouble");
      //   }else if (fmt === 'underlinewavy') {
      //     editor.execCommand("underlinewavy");
      //   }else if (fmt === 'underlinedashed') {
      //     editor.execCommand("underlinedashed");
      //   } else if (fmt === 'Strikethrough') {
      //     editor.execCommand("Strikethrough");
      //   }else if (fmt === 'emphatic') {
      //     editor.execCommand("emphatic");
      //   } else{
      //     editor.execCommand("Underline");
      //   }
          
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
        set: set
      };
    };


    var global = tinymce.util.Tools.resolve('tinymce.util.Tools');
    var defaultFormat = null;

    var register$1 = function (editor) {
      editor.addCommand('mceInsertfontspecialFormats', function (_ui, value) {
        insertfontspecial(editor, value !== null && value !== void 0 ? value : '');
      });
    };

    var register = function (editor) {  
      
        // 注册一个工具栏按钮名称
      editor.ui.registry.addButton('fontspecialFormats', {
        icon: 'fontspecialFormats',
        tooltip: 'fontspecialFormats',
        onAction: function () {
          editor.execCommand('mceInsertfontspecialFormats', false)
        }
      });

    
      var formats = getFormats(editor);
      defaultFormat = Cell(getDefaultFillBlankValue(editor))

      editor.ui.registry.addSplitButton('fontspecialFormats', {
        icon: 'fontspecialFormats',
        tooltip: 'fontspecialFormats',
        select: function (value) {
          return value === defaultFormat.get();
        },
        fetch: function (done) {
          done(global.map(formats, function (format) {
            return {
              type: 'choiceitem',
              text: getFontspecialFormatsDesc(editor, format),
              value: format
            };
          }));
        },
        onAction: function (_api) {
          insertfontspecial(editor,defaultFormat.get());
        },
        onItemAction: function (_api, value) {
          defaultFormat.set(value);
          insertfontspecial(editor,defaultFormat.get());
        }
      });
    };

 
  
  



    function Plugin () {
      global$1.add('fontspecialFormats', function (editor) {
        register$1(editor);
        register(editor);
      });
    }

    Plugin();

}());
