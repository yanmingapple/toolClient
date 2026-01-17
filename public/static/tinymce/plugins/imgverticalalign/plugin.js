tinymce.PluginManager.add('imgverticalalign', function(editor, url) {
  var global = tinymce.util.Tools.resolve('tinymce.util.Tools');
  var getFormats = function (editor) {
    return editor.getParam('imgverticalalign_formats', [
      'top',
      'middle',
      'baseline',
      'bottom',
      'textTop',
    ]);
  };
  var getImgVerticalFormatsDesc = function (editor, fmt) {
    var ret = '';
    if (fmt === 'top') {
      ret = '顶部对齐'
    }else if (fmt === 'middle') {
      ret = '垂直居中'
    }else if (fmt === 'baseline') {
      ret = '文字对齐'
    }else if (fmt === 'bottom') {
      ret = '底部对齐'
    }else if (fmt === 'textTop') {
      ret = '文字顶部对齐'
    } else{
      ret = fmt;
    }
    return ret;
  }
  var formats = getFormats(editor);
  // function doImgverticalalign() {
  //   var node = editor.selection.getNode();
  //   if (node && node.nodeName == 'IMG') {
  //     if ($(node).hasClass('img-vertical-baseline')) {
  //       $(node).removeClass('img-vertical-baseline')
  //     } else {
  //       $(node).addClass('img-vertical-baseline')
  //     }
  //   }
  // }
  // //注册一个命令
  // editor.addCommand('imgverticalalign', function () {
  //   doImgverticalalign();
  // });

  // // 注册一个工具栏按钮名称
  // editor.ui.registry.addButton('imgverticalalign', {
  // icon: 'imgverticalalign',
  // tooltip: '基线对齐',
  //   onAction: function () {
  //     doImgverticalalign();
  //   }
  // });


  // // 注册一个菜单项名称 menu/menubar
  // editor.ui.registry.addMenuItem('imgverticalalign', {
  //   icon: 'imgverticalalign',
  //   tooltip: '基线对齐',
  //   text:'基线对齐',
  //   onAction: function () {
  //     doImgverticalalign();
  //   }
  // });

  editor.ui.registry.addSplitButton('imgverticalalign', {
    icon: 'imgverticalalign',
    tooltip: '基线对齐',
    select: function (value) {
      // return value === defaultFormat.get();
    },
    fetch: function (done) {
      done(global.map(formats, function (format) {
        return {
          type: 'choiceitem',
          text: getImgVerticalFormatsDesc(editor, format),
          value: format
        };
      }));
    },
    onAction: function (_api) {
    },
    onItemAction: function (_api, value) {
      debugger
      var node = editor.selection.getNode();
      if (node && node.nodeName == 'IMG') {
        let clsName = 'img-vertical-'+value
        if (!$(node).hasClass(clsName)) {
          let clsList = $(node)[0].classList
          clsList.forEach(_c => {
            if (_c.indexOf('img-vertical-') >= 0) {
              $(node).removeClass(_c)
            }
          });
          $(node).addClass(clsName)
        }
      }
    }
  });

  return {
    getMetadata: function () {
      return  {
        //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
        name: "imgverticalalign",//插件名称
        url: "", //作者网址
      };
    }
  };
});

