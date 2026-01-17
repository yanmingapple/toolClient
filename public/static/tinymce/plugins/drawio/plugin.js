tinymce.PluginManager.add('drawio', function (editor, url) {

  window.drawio = window.drawio || {};

  //全屏
  var requestFullScreen = function (element) {
    if (window.ActiveXObject) {
        var WsShell = new ActiveXObject('WScript.Shell')
        WsShell.SendKeys('{F11}');
    }
    //HTML W3C 提议
    else if (element.requestFullScreen) {
        element.requestFullScreen();
    }
    //IE11
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
    // Webkit (works in Safari5.1 and Chrome 15)
    else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
    // Firefox (works in nightly)
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
}


  var openDialog = function () {

    // var isPlaceholderImage = function (imgElm) {
    //   return imgElm.nodeName === 'IMG' && (imgElm.hasAttribute('data-mce-object') || imgElm.hasAttribute('data-mce-placeholder'));
    // };

    // var getSelectedImage = function (editor) {
    //   window.DrawioImageData = ''
    //   var imgElm = editor.selection.getNode();
    //   if (imgElm && (imgElm.nodeName !== 'IMG' || isPlaceholderImage(imgElm))) {
    //     return null;
    //   }
    //   if (imgElm.dataset && imgElm.dataset.drawioImage) {
    //     window.DrawioImageData = imgElm.dataset.drawioImage.tkDecodeBase64();
    //     //画图编辑器初始化完成后回显
    //     //editorUi.js 8905行  window.parent.DrawioImageData
    //   }

    //   return imgElm;
    // };

    // getSelectedImage(editor);
    return editor.windowManager.openUrl({
      title: '画图编辑器',
      size: 'large',
      url: url + '/index.html?dev=1&ui=kennedy&local=1&lang=zh',//根据自己的实际路径来
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }, {
          type: 'custom',
          text: 'Save',
          name: 'save',
          primary: true
        },
        {
          type: 'custom',
          name: 'fullscreen',
          text: '全屏',
          icon: 'fullscreen',
          primary: false
        }

      ],
      width: window.screen.width - 200, 
      height: window.screen.height - 200,
      onAction: function (api, details) {
      
        switch (details.name) {
          case 'save':
          let iframe1 = document.getElementsByTagName('iframe')
          iframe1[iframe1.length - 1].contentWindow.editorUi.js2exe_SaveToAnswerArea(function(svgImgB64,svgCodeByXml){
            editor.insertContent('<img align="absbottom" src="' + svgImgB64 + '" data-drawio-image="' + svgCodeByXml.tkEncodeBase64() + '" </img>')
            api.close();
          });

            break;
            case 'fullscreen':  
              let iframe = document.getElementsByTagName('iframe')
              requestFullScreen(iframe[iframe.length - 1].requestFullscreen())
          default:
            break;
        }
      },
      onClose: function () {
        window.DrawioImageData = '';
      }
    });
  };


  // 注册一个工具栏按钮名称
  editor.ui.registry.addButton('drawio', {
    icon: 'drawio',
    tooltip: 'drawio',
    onAction: function () {
      openDialog();
    }
  });

  // 注册一个菜单项名称 menu/menubar
  editor.ui.registry.addMenuItem('drawio', {
    icon: 'drawio',
    tooltip: 'drawio',
    text: 'drawio',
    onAction: function () {
      openDialog();
    }
  });


  var Dialog = function (editor) {
    return { open: openDialog };
  };

  var isNullable = function (a) {
    return a === null || a === undefined;
  };
  var isNonNullable = function (a) {
    return !isNullable(a);
  };

  var isDrawIoImage = function (imgElm) {
    if(imgElm.nodeName==='FIGURE'){
      return imgElm.childNodes[0].hasAttribute('data-drawio-image')
    }else if(imgElm.nodeName === 'IMG'){
      return imgElm.hasAttribute('data-drawio-image');
    }
    return  false;
  };

  var getSelectedImage = function (editor) {

    var imgElm = editor.selection.getNode();
    var figureElm = editor.dom.getParent(imgElm, 'figure.image');
    if (figureElm) {
      if (!isDrawIoImage(figureElm.childNodes[0])) {
        return null;
      }
      if(figureElm.childNodes[0].dataset && figureElm.childNodes[0].dataset.drawioImage){
        window.DrawioImageData = figureElm.childNodes[0].dataset.drawioImage.tkDecodeBase64();
      }
      return editor.dom.select('img', figureElm)[0];
    }
    if (imgElm && (imgElm.nodeName !== 'IMG' && !isDrawIoImage(imgElm))) {
      return null;
    }

    if (imgElm.dataset && imgElm.dataset.drawioImage) {
        window.DrawioImageData = imgElm.dataset.drawioImage.tkDecodeBase64();
        //画图编辑器初始化完成后回显
        //editorUi.js 8905行  window.parent.DrawioImageData
      }

    return imgElm;
  };

  editor.ui.registry.addToggleButton('drawio', {
    icon: 'drawio',
    tooltip: 'drawio',
    onAction: Dialog(editor).open,
    onSetup: function (buttonApi) {
      buttonApi.setActive(isNonNullable(getSelectedImage(editor)));//
      return editor.selection.selectorChangedWithUnbind('img[data-drawio-image],figure.drawioImage', buttonApi.setActive).unbind;
    }
  });


  return {
    getMetadata: function () {
      return {
        //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
        name: "drawio",//插件名称
        url: "", //作者网址
      };
    }
  };
});

