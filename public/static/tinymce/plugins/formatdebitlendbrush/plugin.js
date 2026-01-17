tinymce.PluginManager.add('formatdebitlendbrush', function(editor, url) {
    
  var Dialog = function (editor) {
    return { open: openDialog };
  };

    var openDialog = function () {
      
    window.Formatdebitlendbrush = {};

		var isPlaceholderImage = function (imgElm) {
		  return imgElm.nodeName === 'IMG' && (imgElm.hasAttribute('data-formatdebitlend-object') || imgElm.hasAttribute('data-formatdebitlend-placeholder'));
		};
		
		var getSelectedImage = function (editor) {
		  var imgElm = editor.selection.getNode();
		  if (imgElm && (imgElm.nodeName !== 'IMG' || isPlaceholderImage(imgElm)) ) {
		    return null;
		  }
		  if(imgElm.dataset && imgElm.dataset.formatdebitlendImage){
			  Formatdebitlendbrush.data  = imgElm.dataset.formatdebitlendImage;
        Formatdebitlendbrush.width =  imgElm.dataset.width;
        Formatdebitlendbrush.height =  imgElm.dataset.height;
		  }
		  
		  return imgElm;
		};
		
    var getSelectedTable = function (editor) {
		  
      var tableElm = editor.selection.getNode();
      if (tableElm && (tableElm.nodeName !== 'TABLE' && tableElm.className !=='mceNonEditable')) {
        return;
      }
 
		  if(tableElm.dataset && tableElm.dataset.formatdebitlendImage){
			  Formatdebitlendbrush.data  = tableElm.dataset.formatdebitlendImage;
        Formatdebitlendbrush.width =  tableElm.dataset.width;
        Formatdebitlendbrush.height =  tableElm.dataset.height;
		  }
		  
		  return tableElm;
		};

		getSelectedTable(editor);
		
      return editor.windowManager.openUrl({
        title: '借贷编辑器',
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
        width: window.screen.width - 200, 
        height: window.screen.height - 200,
        onAction: function (api, details) {
          
          switch (details.name) {
            case 'save':
                if(Formatdebitlendbrush.imageData && Formatdebitlendbrush.data && Formatdebitlendbrush.data.length  > 0){
                  editor.insertContent('<img align="absbottom"  width="'+Formatdebitlendbrush.width+'px"  height="'+Formatdebitlendbrush.height+'px"  src="'+ Formatdebitlendbrush.imageData + '" data-formatdebitlend-image="'+ Formatdebitlendbrush.data +'" data-width="'+Formatdebitlendbrush.width+'" data-height="'+Formatdebitlendbrush.height+'"> </img>')
                }else if(Formatdebitlendbrush.tableData && Formatdebitlendbrush.data && Formatdebitlendbrush.data.length  > 0){
                  debugger
                  editor.insertContent($(`<div>${Formatdebitlendbrush.tableData.tkDecodeBase64()}</div>`).html())
               
                }
                api.close();
              break;
             default:
                break;
          }
        },
		 onClose:function(){
      Formatdebitlendbrush.data ='',Formatdebitlendbrush.imageData = '';
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
      return imgElm.nodeName === 'IMG' && imgElm.hasAttribute('data-formatdebitlend-image');
    };

    var getSelectedImage = function (editor) {
      
      var imgElm = editor.selection.getNode();
      var figureElm = editor.dom.getParent(imgElm, 'figure.image');
      if (figureElm) {
        return editor.dom.select('img', figureElm)[0];
      }
      if (imgElm && (imgElm.nodeName !== 'IMG' && !isDebitlendImage(imgElm))) {
        return null;
      }
      return imgElm;
    };

    var getSelectedTable = function (editor) {
      var tableElm = editor.selection.getNode();
      if (tableElm && (tableElm.nodeName !== 'TABLE' && tableElm.className !=='mceNonEditable')) {
        return null;
      }
      return tableElm;
    };
  
    // 注册一个工具栏按钮名称
    editor.ui.registry.addButton('formatdebitlendbrush', {
	  icon: 'formatdebitlendbrush',
	  tooltip: 'formatdebitlendbrush',
      onAction: function () {
        openDialog();
      }
    });
  
    // 注册一个菜单项名称 menu/menubar
    editor.ui.registry.addMenuItem('formatdebitlendbrush', {
      icon: 'formatdebitlendbrush',
      tooltip: 'formatdebitlendbrush',
      text:'formatdebitlendbrush',
        onAction: function () {
          openDialog();
        }
    });

    editor.ui.registry.addToggleButton('formatdebitlendbrush', {
      icon: 'formatdebitlendbrush',
      tooltip: 'formatdebitlendbrush',
      onAction:  Dialog(editor).open,
      onSetup: function (buttonApi) {
        // buttonApi.setActive(isNonNullable(getSelectedImage(editor)));
        // return editor.selection.selectorChangedWithUnbind('img[data-formatdebitlend-image],figure.formatdebitlendImage', buttonApi.setActive).unbind;

        buttonApi.setActive(isNonNullable(getSelectedTable(editor)));
        return editor.selection.selectorChangedWithUnbind('table[className=data-formatdebitlend-image]', buttonApi.setActive).unbind;
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
        editor.parser.addAttributeFilter('data-formatdebitlend-image', function (nodes) {
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
          name: "formatdebitlendbrush",//插件名称
          url: "", //作者网址
        };
      }
    };
  });
  

  
  