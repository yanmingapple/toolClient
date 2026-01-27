tinymce.PluginManager.add('drawSvg', function(editor, url) {
    
  var Dialog = function (editor) {
    return { open: openDialog };
  };

    var openDialog = function () {
		
		// var isPlaceholderImage = function (imgElm) {
    //   if(imgElm.nodeName==='FIGURE'){
    //     return imgElm.childNodes[0].hasAttribute('data-formatdebitlend-placeholder')
    //   }else if(imgElm.nodeName === 'IMG'){
    //     return imgElm.hasAttribute('data-formatdebitlend-placeholder');
    //   }
    //   return  false;
		// };
		
		// var getSelectedImage = function (editor) {
    //   var imgElm = editor.selection.getNode();
    //   var figureElm = editor.dom.getParent(imgElm, 'figure.image');
    //   if (figureElm) {
    //     if (!isFormulaImage(figureElm.childNodes[0])) {
    //       return null;
    //     }


    //     if(figureElm.childNodes[0].dataset && figureElm.childNodes[0].dataset.drawsvgImage){
    //       DrawSvgData.data  = figureElm.childNodes[0].dataset.drawsvgImage;
    //       DrawSvgData.width =  figureElm.childNodes[0].dataset.width;
    //       DrawSvgData.height =  figureElm.childNodes[0].dataset.height;
    //     }
        
    //     return editor.dom.select('img', figureElm)[0];
    //   }
    //   if (imgElm && (imgElm.nodeName !== 'IMG' && !isFormulaImage(imgElm))) {
    //     return null;
    //   }


    //   if(imgElm.dataset && imgElm.dataset.drawsvgImage){
		// 	  DrawSvgData.data  = imgElm.dataset.drawsvgImage;
    //     DrawSvgData.width =  imgElm.dataset.width;
    //     DrawSvgData.height =  imgElm.dataset.height;
		//   }
    //   return imgElm;
		// };
		
 
		
      return editor.windowManager.openUrl({
        title: '代码编辑器',
        url: url + '/index.html',//根据自己的实际路径来
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
        ],
        onAction: function (api, details) {
          switch (details.name) {
            case 'save':
                if(DrawSvgData.imageData && DrawSvgData.data && DrawSvgData.data.length  > 0){
                  editor.insertContent('<img align="absbottom"  width="'+DrawSvgData.width+'px"  height="'+DrawSvgData.height+'px"  src="'+ DrawSvgData.imageData + '" data-drawsvg-image="'+ DrawSvgData.data +'" data-width="'+DrawSvgData.width+'" data-height="'+DrawSvgData.height+'"> </img>')
                }
                api.close();
              break;
             default:
                break;
          }
        },
		 onClose:function(){
      DrawSvgData.data ='',DrawSvgData.imageData = '';
		 }
      });
    };
    
    var isNullable = function (a) {
      return a === null || a === undefined;
    };
    var isNonNullable = function (a) {
      return !isNullable(a);
    };
  
    var isDebitlendImage = function (imgElm) {
      return imgElm.nodeName === 'IMG' && imgElm.hasAttribute('data-drawsvg-image');
    };
  
    // 注册一个工具栏按钮名称
    editor.ui.registry.addButton('drawSvg', {
	  icon: 'drawSvg',
	  tooltip: 'drawSvg',
      onAction: function () {
        openDialog();
      }
    });
  
    // 注册一个菜单项名称 menu/menubar
    editor.ui.registry.addMenuItem('drawSvg', {
      icon: 'drawio',
      tooltip: 'drawio',
      text:'drawio',
        onAction: function () {
          openDialog();
        }
    });

    editor.ui.registry.addToggleButton('drawSvg', {
      icon: 'drawio',
      tooltip: 'drawio',
      onAction:  Dialog(editor).open,
      onSetup: function (buttonApi) {
        buttonApi.setActive(isNonNullable(getSelectedImage(editor)));
        return editor.selection.selectorChangedWithUnbind('img[data-drawsvg-image],figure.image', buttonApi.setActive).unbind;
      }
    });
  
  
    var each$1 = function (xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i);
      }
    };
  
    var setup = function (editor) {
      editor.on('PreInit', function () {
        editor.parser.addAttributeFilter('data-drawsvg-image', function (nodes) {
          each$1(nodes, function (node) {
            node.attr('data-mce-resize', 'false');
          });
        });
      });
    };
  
    setup(editor);

  
    return {
      getMetadata: function () {
        return  {
          //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
          name: "drawSvg",//svg画图工具
          url: "", //作者网址
        };
      }
    };
  });
  

  
  