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
    

    var _process = function(editor){
      var content = editor.getContent();

      editor.setContent(content);
    }


    var register = function (editor) {  
        // 注册一个工具栏按钮名称
      editor.ui.registry.addButton('itemparse', {
        icon: 'itemparse',
        tooltip: 'itemparse',
        onAction: function () {
          _process(editor)
        }
      });
    };


    function Plugin () {
      global$1.add('itemparse', function (editor) {
        register(editor);
      });
    }

    Plugin();

}());
