tinymce.PluginManager.add('imagetool', function(editor, url) {

  window.Formula = window.Formula  || {};
    
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

    var imageHasOrgFile = function (imgElm) {
      if(imgElm.nodeName==='FIGURE'){
        return imgElm.childNodes[0]?.dataset?.upLoadUrl ? true:false;
      }else if(imgElm.nodeName === 'IMG'){
        return imgElm?.dataset?.upLoadUrl? true:false;
      }
      return  false;
    };

    let isBeImageOrgFileSelection = function () {
      if (editor.selection) {
          let node = editor.selection.getNode();
          return node.nodeName === 'IMG' && imageHasOrgFile(node);
      }
      return false;
  };

    var move = function (editor) {
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
      let marginBottm = px + "px";
      if(imgElm.style.marginBottom){
        let marginBottmInt = imgElm.style.marginBottom.replace("px","")
        marginBottmInt = parseInt(marginBottmInt);
        marginBottmInt += px;
        marginBottm = marginBottmInt + "px";
      }
      imgElm.style.marginBottom = marginBottm
      
      
      if(imgElm.dataset.mceStyle){
        const newDatasetList = [];
        const datasetlist = imgElm.dataset.mceStyle.split(";")
        datasetlist.forEach((el,elIndex)=>{
          if(el){
            if(el.includes("margin-bottom")){
              newDatasetList.push(`margin-bottom: ${marginBottm};`)
            }else{
              newDatasetList.push(el);
            }

          }
        })
        imgElm.dataset.mceStyle = newDatasetList.join(";")

      }else{
        imgElm.dataset.mceStyle = `margin-bottom: ${marginBottm};`
      }
      return imgElm;
    };
    

    var downOrgFile  = function (editor,px) {
      var imgElm = editor.selection.getNode();
      var figureElm = editor.dom.getParent(imgElm, 'figure.image');
      if (figureElm) {
        if (!imageHasOrgFile(figureElm.childNodes[0])) {
          return null;
        }
        return editor.dom.select('img', figureElm)[0];
      }
      if (imgElm && (imgElm.nodeName !== 'IMG' && !imageHasOrgFile(imgElm))) {
        return null;
      }

      if(imgElm?.dataset?.upLoadUrl){
        const downloadLink = document.createElement('a');
        downloadLink.href = window.webConfig.baseUrl + imgElm?.dataset?.upLoadUrl;
        downloadLink.click();
        tkMessage.succ("下载图片源文件成功");
      }else{
        tkMessage.warn("图片没有源文件");
      }

    
      

      return imgElm;
    };
    
    
    editor.ui.registry.addToggleButton('imagetoolup', {
      icon: 'imagetoolup',
      tooltip: 'imagetoolup',
      onAction:  ()=>{
        move(editor,-1);
      }
    });

    editor.ui.registry.addToggleButton('imagetooldown', {
      icon: 'imagetooldown',
      tooltip: 'imagetooldown',
      onAction:  ()=>{
        move(editor,1);
      }
    });

    editor.ui.registry.addToggleButton('imagetooldownOrgFile', {
      icon: 'imagetooldownOrgFile',
      tooltip: 'imagetooldownOrgFile',
      onAction:  ()=>{
        downOrgFile(editor);
      },
      onSetup: function (api) {
        api.setActive(isBeImageOrgFileSelection())
        return editor.selection.selectorChangedWithUnbind('img[data-up-load-url],figure.image[data-up-load-url]', api.setActive).unbind;
    }
    });


    return {
      getMetadata: function () {
        return  {
          //插件名和链接会显示在“帮助”→“插件”→“已安装的插件”中
          name: "imagetool",//插件名称
          url: "", //作者网址
        };
      }
    };
  });
  
  