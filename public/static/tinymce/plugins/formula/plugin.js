tinymce.PluginManager.add('formula', function(editor, url) {

  window.Formula = window.Formula  || {};
  var global$imageUploader = tinymce.util.Tools.resolve('tinymce.util.ImageUploader');
  var global$4 = tinymce.util.Tools.resolve('tinymce.util.Promise');
        
  var parseIntAndGetMax = function (val1, val2) {
    return Math.max(parseInt(val1, 10), parseInt(val2, 10));
  };
  
  var getImageSize = function (url) {
    return new global$4(function (callback) {
      var img = document.createElement('img');
      var done = function (dimensions) {
        img.onload = img.onerror = null;
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
        callback(dimensions);
      };
      img.onload = function () {
        var width = parseIntAndGetMax(img.width, img.clientWidth);
        var height = parseIntAndGetMax(img.height, img.clientHeight);
        var dimensions = {
          width: width,
          height: height
        };
        done(global$4.resolve(dimensions));
      };
      img.onerror = function () {
        done(global$4.reject('Failed to get image dimensions for: ' + url));
      };
      var style = img.style;
      style.visibility = 'hidden';
      style.position = 'fixed';
      style.bottom = style.left = '0px';
      style.width = style.height = 'auto';
      document.body.appendChild(img);
      img.src = url;
    });
  };

    var openDialog = function () {
		// var isPlaceholderImage = function (imgElm) {
		//   return (imgElm.nodeName==='FIGURE' || imgElm.nodeName === 'IMG') && (imgElm.hasAttribute('data-mce-object') || imgElm.hasAttribute('data-mce-placeholder'));
		// };
		
		// var getSelectedImage = function (editor) {
		//   var imgElm = editor.selection.getNode();
		//   if (imgElm && ((imgElm.nodeName !== 'IMG' && imgElm.nodeName  !== 'FIGURE') || isPlaceholderImage(imgElm)) ) {
		//     return null;
		//   }


    //   if(imgElm.nodeName==='FIGURE'){
    //     if(imgElm.childNodes[0].dataset && imgElm.childNodes[0].dataset.formulaImage){
    //       Formula.formulaData = imgElm.childNodes[0].dataset.formulaImage;
    //     }

    //     return 
    //   }else{
    //     if(imgElm.dataset && imgElm.dataset.formulaImage){
    //       Formula.formulaData = imgElm.dataset.formulaImage;
    //     }

    //     return imgElm;
    //   }
		// };
		
		// getSelectedImage(editor);
		
      return editor.windowManager.openUrl({
        title: '公式编辑器',
        url: url + '/formula.html',//根据自己的实际路径来
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
              //@ts-ignore
			  Formula.r.action((function() {
			  	 Formula.r.syncEditorSVG();
           const fileContent = new File([Formula.formulaImgHtml], '公式.svg', { type: "image/svg+xml" })

           var blobInfo = createBlobCache(editor,fileContent, "", Formula.formulaImgData);
           return global$imageUploader(editor).upload([blobInfo], false).then(function (results) {
             if (results.length === 0) {
               return global$4.reject('Failed to upload image');
             } else if (results[0].status === false) {
               return global$4.reject(results[0].error.message);
             } else {
              getImageSize(results[0].url).then(function (dimensions) {          
                debugger
                editor.insertContent(`<img align="absbottom" data-dpi="96" style="width:${dimensions.width}px;heigth:${dimensions.height}px;" class="Wirisformula" src="${ results[0].url }" data-formula-image="${Formula.formulaData }" </img>`)
                api.close();  
                });

                
               return results[0];
             }
           });

				 //命令行也可以
				//  editor.insertContent('<img align="absbottom" class="Wirisformula" src="'+ Formula.formulaImgData + '" data-formula-image="'+ Formula.formulaData +'" </img>')
				//  api.close();
			  }
			  ), "已同步至编辑器", "同步失败")
			 
              break;
             default:
                break;
          }
        },
		 onClose:function(){
			 Formula.r.setFormulaData('','');
			 Formula.formulaImgData ='',Formula.formulaData = '';
		 }
      });
    };

      var createBlobCache = function (editor,file, blobUri, dataUrl) {
      return editor.editorUpload.blobCache.create({
        blob: file,
        blobUri: blobUri,
        name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null,
        filename: file.name,
        base64: dataUrl.split(',')[1]
      });
    }


    // 注册一个工具栏按钮名称
    editor.ui.registry.addButton('formula', {
	  icon: 'formula',
	  tooltip: 'formula',
      onAction: function () {
        openDialog();
      }
    });
  
    // 注册一个菜单项名称 menu/menubar
    editor.ui.registry.addMenuItem('formula', {
      icon: 'formula',
      tooltip: 'formula',
      text:'formula',
        onAction: function () {
          debugger
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
  
    var isFormulaImage = function (imgElm) {
      if(imgElm.nodeName==='FIGURE'){
        return imgElm.childNodes[0].hasAttribute('data-formula-image')
      }else if(imgElm.nodeName === 'IMG'){
        return imgElm.hasAttribute('data-formula-image');
      }
      return  false;
    };

    var getSelectedImage = function (editor) {
      var imgElm = editor.selection.getNode();
      var figureElm = editor.dom.getParent(imgElm, 'figure.image');
      if (figureElm) {
        if (!isFormulaImage(figureElm.childNodes[0])) {
          return null;
        }
        if(figureElm.childNodes[0].dataset && figureElm.childNodes[0].dataset.formulaImage){
          Formula.formulaData = figureElm.childNodes[0].dataset.formulaImage;
        }
        return editor.dom.select('img', figureElm)[0];
      }
      if (imgElm && (imgElm.nodeName !== 'IMG' && !isFormulaImage(imgElm))) {
        return null;
      }

      if(imgElm.dataset && imgElm.dataset.formulaImage){
        Formula.formulaData = imgElm.dataset.formulaImage;
      }

      return imgElm;
    };

    editor.ui.registry.addToggleButton('formula', {
      icon: 'formula',
      tooltip: 'formula',
      onAction:  ()=>{ Dialog(editor).open()},
      onSetup: function (buttonApi) {
        buttonApi.setActive(isNonNullable(getSelectedImage(editor)));
        return editor.selection.selectorChangedWithUnbind('img[data-formula-image],figure.formulaImage', buttonApi.setActive).unbind;
      }
    });

  
    return {
      getMetadata: function () {
        return  {
          //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
          name: "formula",//插件名称
          url: "", //作者网址
        };
      }
    };
  });
  
  