tinymce.PluginManager.add('mathtype', function(editor, url) {

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

    var openDialog = async function () {		
      if(!window.api){
        tkMessage.error("该插件需要安装客户端");
        return ;
      }
      var imgElm = editor.selection.getNode();
      let  localPath;
      
      if(isMathTypeImage(imgElm)){
        localPath = await window.api.downloadDoc({url:window.webConfig.baseUrl + imgElm.src.replace(window.location.origin,"") + "&extraType=docm",filename:'mathtype.docm'});
      }else{
        localPath = await window.api.downloadDoc({url:window.webConfig.baseUrl + "/template/mathtypeTemp.docm",filename:'mathtype.docm'});
      }

    

      //关闭word监控
      window.api.docClose(async ()=>{
        const {word,bin,image} = await window.api.getMathType(localPath.filePath)
        // {bin:{fileName:mathTypeName,data:mathTypeData},image:{fileName:wmfName,data:imageData}}

        const mathTypeblob = new Blob([bin.data], { type: 'application/octet-stream' });
        const mathTypeImageblob = new Blob([image.data], { type: 'application/octet-stream' });
        const wordblob = new Blob([word.data], { type: 'application/octet-stream' });
        
        const mathTypefile = new File([mathTypeblob], bin.fileName, { type: bin.fileName.split(".")[1]});
        const mathTypeImagefile = new File([mathTypeImageblob], image.fileName, { type: image.fileName.split(".")[1] });
        const wordFile = new File([wordblob], word.fileName, { type: word.fileName.split(".")[1] });
        
        tkReq()
        .path("mathTypeFileUpload")
        .file([mathTypeImagefile,mathTypefile,wordFile])
        .fileName("files")
        .succ((res) => {
          tkMessage.succ("mathtype客户端公式保存成功");
          const url =`/fileDown/down.do?id=${res.ret.id}`

          getImageSize(url).then(function (dimensions) {          
            editor.insertContent(`<img align="absbottom" data-dpi="96" style="width:${dimensions.width}px;heigth:${dimensions.height}px;" class="mathtypeclient" src="${url}"</img>`)
            });
        })
        .err(() => {
          tkMessage.err("上传失败");
        })
        .send();
      })
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
    editor.ui.registry.addButton('mathtype', {
	  icon: 'mathtype',
	  tooltip: 'mathtype',
      onAction: function () {
        openDialog();
      }
    });
  
    // 注册一个菜单项名称 menu/menubar
    editor.ui.registry.addMenuItem('mathtype', {
      icon: 'mathtype',
      tooltip: 'mathtype',
      text:'mathtype',
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
  
    var isMathTypeImage = function (imgElm) {
      if(imgElm.nodeName==='FIGURE'){
        return imgElm.childNodes[0].className && imgElm.childNodes[0].className == "mathtypeclient"
      }else if(imgElm.nodeName === 'IMG'){
        return imgElm.className && imgElm.className == "mathtypeclient";
      }
      return  false;
    };

    var getSelectedImage = function (editor) {
      var imgElm = editor.selection.getNode();
      var figureElm = editor.dom.getParent(imgElm, 'figure.image');
      if (figureElm) {
        if (!isMathTypeImage(figureElm.childNodes[0])) {
          return null;
        }
        return editor.dom.select('img', figureElm)[0];
      }
      if (imgElm && (imgElm.nodeName !== 'IMG' && !isMathTypeImage(imgElm))) {
        return null;
      }

      return imgElm;
    };

    editor.ui.registry.addToggleButton('mathtype', {
      icon: 'mathtype',
      tooltip: 'mathtype',
      onAction:  ()=>{Dialog(editor).open()},
      onSetup: function (buttonApi) {
        buttonApi.setActive(isNonNullable(getSelectedImage(editor)));
        return editor.selection.selectorChangedWithUnbind('*[class*="mathtypeclient"]', buttonApi.setActive).unbind;
      }
    });

  
    return {
      getMetadata: function () {
        return  {
          //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
          name: "mathtype",//插件名称
          url: "", //作者网址
        };
      }
    };
  });
  
  