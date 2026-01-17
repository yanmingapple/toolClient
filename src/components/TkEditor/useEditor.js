import { ref, onMounted, onUnmounted } from "vue";
import { editorSetting } from "./BasicSettings";
import * as UTIF from 'utif';

// 编辑器
export default function (props, emits) {
  const reset = ref("");
  const tinymceId = ref(props.divId);
  window.baseApi = process.env.ENV == "production" ? process.env.VUE_APP_BASE_API : "";
  var rootPath = window.webConfig.baseUrl;
  let initTinyData;
  // 加载编辑器
  const initTiny = () => {
    if (!props?.initTinyData) {
      initTinyData = {};
    } else {
      initTinyData = tkTools.deepClone(props?.initTinyData);
    }

    if (!initTinyData.editorFontFamily) {
      initTinyData.editorFontFamily = "'times new roman', 'times',  '宋体'";
    }

    if (!initTinyData.editorFontSize) {
      initTinyData.editorFontSize = "12pt";
    } else {
      if (initTinyData.editorFontSize.includes("=")) {
        initTinyData.editorFontSize = initTinyData.editorFontSize.split("=")[1];
      } else {
        initTinyData.editorFontSize = initTinyData.editorFontSize;
      }
    }
    //段落对齐方式
    if (!initTinyData.align) {
      initTinyData.align = "left";
    }

    //获取配置
    if (!window.editorSettingConfig) window.editorSettingConfig = "default";
    const editorSettingData = tkTools.deepClone(editorSetting[window.editorSettingConfig]);

    //配置项通过基础配置+后台配置项,目前财政部没有实现配置化
    //非财政部的，就按照默认集成配置+后台增值配置
    if (window.editorSettingConfig != "czb") {
      //包括，字体下拉选项，plugins,toolbar,pluginsOfFillBlank,toolbarOfFillBlank,字号下拉

      // editorSettingData.fontFamily
      //如果配置中有plugins配置
      if (initTinyData.plugins) {
        initTinyData.plugins = editorSettingData.plugins + " " + initTinyData.plugins;
      } else {
        initTinyData.plugins = editorSettingData.plugins;
      }
      //如果配置中有toolbar配置
      if (initTinyData.newToolbar) {
        initTinyData.toolbar = initTinyData.newToolbar;
      } else {
        if (initTinyData.toolbar) {
          initTinyData.toolbar = editorSettingData.toolbar + " " + initTinyData.toolbar;
        } else {
          initTinyData.toolbar = editorSettingData.toolbar;
        }
      }
    } else {
      initTinyData.plugins = editorSettingData.plugins;
      initTinyData.toolbar = editorSettingData.toolbar;
    }

    if (props.type == "fillBlank") {
      initTinyData.plugins += " fillblank";
      initTinyData.toolbar += " fillblank";
    }

    //下拉字体
    if (!initTinyData.font_formats) initTinyData.font_formats = editorSettingData.fontFamily;
    //下拉字号选择
    if (!initTinyData.fontsize_formats) initTinyData.fontsize_formats = editorSettingData.fontSizeFormats;

    // initTinyData.fontsize_formats = "初号=42pt 小初=36pt 一号=26pt 小一=24pt 二号=22pt 小二=18pt 三号=16pt 小三=15pt 四号=14pt 小四=12pt 五号=10.5pt 小五=9pt 六号=7.5pt 小六=6.5pt 七号=5.5pt 八号=5pt"

    //是否为tif格式
    function isTIFF(file) {
      return ["image/tiff", "image/tif"].includes(file.type) || /\.tiff?$/i.test(file.name);
    }
    const initData = {
      selector: `#${tinymceId.value}`,
      language: "zh_CN",
      cache_suffix: "?v=5.0.0",
      //默认tinymce在开启内联模式（inline）会生成一个‘隐藏的input’用于执行保存动作时存放编辑器的内容。此选项默认开启，如果不需要生成这个input，可以设为false禁用此功能。
      hidden_input: false,
      menubar: false,
      inline: true,
      //    valid_elements:[span['class'='hljs-tag']],
      invalid_styles: {
        "span,div,p": "color font-size", //全局无效样式,自动去掉颜色
        a: "background", // 链接禁用背景样式
      },
      extended_valid_elements: "*[.*]",
      quickbars_selection_toolbar: "bold italic underline strikethrough fontspecialFormats", //选中后插入
      quickbars_insert_toolbar: false,
      quickbars_image_toolbar: "alignleft aligncenter alignright imagetoolup imagetooldown",
      //contextmenu: "formula formatbrush  formatdebitlendbrush quickimage quicktable",
      contextmenu_avoid_overlap: ".mce-spelling-word",
      contextmenu_never_use_native: true,
      width: props.width,
      height: props.height,
      //配置项
      ...initTinyData,
      // plugins: initTinyData.plugins,
      // toolbar: initTinyData.toolbar,
      template_cdate_classes: "cdate creationdate",
      noneditable_regexp: /\[\[[^\]]+\]\]/g,
      template_selected_content_classes: "selcontent",
      template_cdate_format: "%m/%d/%Y - %H:%M:%S",
      //不可编辑模块的样式
      noneditable_noneditable_class: "mceNonEditable",
      fixed_toolbar_container: props.fixedToolbarContainer ? props.fixedToolbarContainer : "#toolBar",
      //save插件回调
      save_onsavecallback: function (editor) {
        editor.notificationManager.open({
          text: "保存成功。",
          type: "info",
          closeButton: false,
          timeout: 500,
        });
      },
      image_caption: true, // 图片下方标题开关
      placeholder: props.placeholder ?? "",
      //auto_focus: true,
      //为tinymceUI的模态窗口添加拖动模式。默认是关闭的。
      draggable_modal: false,
      //设为false时，可隐藏底栏的元素路径
      elementpath: false,
      // floating / sliding / scrolling / wrap
      toolbar_mode: props.toolbarMode ? props.toolbarMode : "floating",
      //粘性工具栏）
      toolbar_sticky: false,
      //内联模式始终显示工具栏
      toolbar_persist: props.toolbarPersist,
      //forced_root_block: false,

      //是否允许style中属性是否有url格式的
      allow_svg_data_urls: true,
      // media_live_embeds: false,
      //表格默认样式
      table_default_styles: {
        "border-collapse": "collapse",
        width: "100%",
        "border-color": "#000000",
        "border-style": "solid",
      },
      table_default_attributes: { border: "1" }, //表格默认边框
      content_style: `p {text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family:${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align}}`,
      //为行高下拉菜单指定对应的行高的值。
      lineheight_formats: "1 1.2 1.5 1.6 1.8 2 2.4 3 3.5 4 4.5 5",
      autosave_ask_before_unload: false,
      //默认粘贴文本
      paste_as_text: props.pasteAsText,
      paste_data_images: true,
      image_uploadtab:false,
      images_file_types: "jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp,tif,tiff",
      //图片上传自定义实现
      images_dataimg_filter: function (img) {
        //添加图片渲染到编辑器中
        return img.hasAttribute("internal-blob");
      },
      images_upload_handler: function (blobInfo, succFun, failFun) {
        if (blobInfo.blob().name) {
          let imageUrl;
          let param = {};

          const postSendImage = function () {
            tkReq()
              .path("uploadFileCom")
              .param(param)
              .file(blobInfo.blob())
              .fileName("files")
              .succ((res) => {
                tkMessage.succ("上传成功");
                //如果本次上传的为非源文件
                if (!imageUrl) {
                  imageUrl = `/fileDown/down.do?id=${res.ret[0].id}`;
                }

                succFun(imageUrl);
              })
              .err(() => {
                tkMessage.err("上传失败");
              })
              .send();
          };

          if (isTIFF(blobInfo.blob())) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const tifData = new Uint8Array(e.target.result);
              const ifds = UTIF.decode(tifData); // 解码TIF数据
              UTIF.decodeImage(tifData, ifds[0]); // 解码第一页
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const imgData = ctx.createImageData(ifds[0].width, ifds[0].height);
              imgData.data.set(UTIF.toRGBA8(ifds[0])); // 转换为RGBA格式
              canvas.width = ifds[0].width;
              canvas.height = ifds[0].height;
              ctx.putImageData(imgData, 0, 0);
              canvas.toBlob((blob) => {
                const file = new File([blob], blobInfo.name() + ".png", { type: "image/png" });

                tkReq()
                  .path("uploadFileCom")
                  .param({})
                  .file(file)
                  .fileName("files")
                  .succ((res) => {
                    tkMessage.succ("上传解析tiff成功");
                    imageUrl = `/fileDown/down.do?id=${res.ret[0].id}`;
                    param = { attachmentId: res.ret[0].id };
                    postSendImage();
                  })
                  .err(() => {
                    tkMessage.err("上传失败");
                  })
                  .send();
              });
            };
            reader.readAsArrayBuffer(blobInfo.blob());
          } else {
            postSendImage();
          }
        } else {
          var file = blobInfo.blob();
          var reader = new FileReader();
          reader.onload = function (e) {
            succFun(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      },
      file_picker_types: "image,media,imageorgfile,file",
      //自定义文件选择器的回调内容
      file_picker_callback: function (callback, value, meta) {
        //文件分类
        var filetype = ".pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4";

        //为不同插件指定文件类型及后端地址
        switch (meta.filetype) {
          case "image":
            filetype = ".jpeg,.jpg,.jpe,.jfi,.jif,.jfif,.png,.gif,.bmp,.webp,.tif,.tiff";
            break;
          case "media":
            filetype = ".mp3, .mp4";
            break;
          case "imageOrgFile":
            filetype = ".*";
            break;
          case "file":
            filetype = ".*";
            break;
          default:
        }

        //模拟出一个input用于添加本地文件
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", filetype);
        input.onchange = function () {
          var file = this.files[0];
          let imageUrl;
          let param = {};
          const postSendImage = function () {
            tkReq()
              .path("uploadFileCom")
              .param(param)
              .file(file)
              .fileName("files")
              .succ((res) => {
                tkMessage.succ("上传成功");
                //如果本次上传的为非源文件
                if (!imageUrl) {
                  imageUrl = `/fileDown/down.do?id=${res.ret[0].id}`;
                }

                if(meta.filetype ==  "media"){
                  var video = document.createElement("video");
                  const url = URL.createObjectURL(file); // 创建一个指向文件的URL
                  video.src = url;
                  // 监听视频元数据加载完成事件
                  video.onloadedmetadata = function() {
                    // 清理创建的URL对象
                    URL.revokeObjectURL(url);
                    callback(imageUrl,{type:file.type,width:video.videoWidth,height:video.videoHeight});
                    };
                  }else{
                    callback(imageUrl,{type:file.type});
                  }
              })
              .err(() => {
                tkMessage.err("上传失败");
              })
              .send();
          };

          if (isTIFF(file)) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const tifData = new Uint8Array(e.target.result);
              const ifds = UTIF.decode(tifData); // 解码TIF数据
              UTIF.decodeImage(tifData, ifds[0]); // 解码第一页
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const imgData = ctx.createImageData(ifds[0].width, ifds[0].height);
              imgData.data.set(UTIF.toRGBA8(ifds[0])); // 转换为RGBA格式
              canvas.width = ifds[0].width;
              canvas.height = ifds[0].height;
              ctx.putImageData(imgData, 0, 0);
              canvas.toBlob((blob) => {
                const newfile = new File([blob], file.name + ".png", { type: "image/png" });

                tkReq()
                  .path("uploadFileCom")
                  .param({})
                  .file(newfile)
                  .fileName("files")
                  .succ((res) => {
                    tkMessage.succ("上传解析tiff成功");
                    imageUrl = `/fileDown/down.do?id=${res.ret[0].id}`;
                    param = { attachmentId: res.ret[0].id };
                    postSendImage();
                  })
                  .err(() => {
                    tkMessage.err("上传失败");
                  })
                  .send();
              });
            };
            reader.readAsArrayBuffer(file);
          } else {
            postSendImage();
          }
        };
        input.click();
      },
      //与init_instance_callback类似，不过这个是在开始前执行一个自定义函数。
      init_instance_callback: (editor) => {
        // //////////////////初始值内容///////////////////////////
        reset.value = props.content;
        editor.reset = () => {
          var p = document.createElement("p");
          p.setAttribute(
            "style",
            `text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family:${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align}`
          );
          editor.setContent(p.outerHTML);
        };

        //重置内容
        editor.resetContent = () => {
          editor.setContent(props.content || "");
        };

        // 设置文本内容
        editor.setTextContent = (text) => {
          var p = document.createElement("p");
          p.setAttribute(
            "style",
            `text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family: ${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align}`
          );
          p.innerHTML = text;
          editor.setContent(p.outerHTML);
        };

        if (props.content) {
          if (props.content.startsWith("<p")) {
            editor.setContent(props.content || "");
          } else {
            editor.setTextContent(props.content);
          }
        } else {
          editor.reset();
        }

        editor.on("NodeChange Change KeyUp SetContent", () => {
          emits("update:content", editor.getContent());
        });
        // 需要将题型类型传入，不同题型格式化的内容方式不一样
        editor.settings.itemTypeId = props.itemTypeId || 1;
      },
      setup: function (editor) {
        // editor.on("focus", function (ed, evt) {
        //   // 触发 focus 事件，并传递当前编辑器的 DOM 元素
        //   const event = new CustomEvent("editorFocus", { detail: editor.getElement() });
        //   window.dispatchEvent(event);
        //   emits("focus");
        // });

        //当内容清空时候
        editor.on("keyup", function (e) {
          if (
            (["Backspace", "Delete"].includes(e.code) && editor.getContent() == "") ||
            (e.ctrlKey && e.code == "KeyX" && editor.getContent() == "")
          ) {
            var p = document.createElement("p");
            p.setAttribute(
              "style",
              `text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family: ${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align}`
            );
            editor.setContent(p.outerHTML);
          }
        });
      },
      paste_merge_formats: true,
      smart_paste: true,
      //paste_word_valid_elements: "table[width],tr,td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody,h1,h2,h3,h4,h5,img,p",
      paste_preprocess: function (plugin, args) {
        if (!props.pasteFormat) {
          return;
        }
        var paragraphStyle = `text-align: left;letter-spacing:0px;line-height:1.5;margin:0;padding:0;word-wrap:break-word;font-family:${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align}`;
        var tableStyle = `letter-spacing:0px;line-height:1.5;margin:0;padding:0;word-wrap:break-word;font-family:${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};text-align:${initTinyData.align};border-collapse: collapse;border: 1px solid #000000;`;
        var tdStyle = "border: 1px solid #000000;";
        var spanStyle = `font-family:${initTinyData.editorFontFamily}; font-size: ${initTinyData.editorFontSize};line-height:1.5;text-align:${initTinyData.align};`;

        // //移除样式及class样式
        var removeElStyleAndClass = function () {
          var els = arguments;
          for (var i = 0; i < els.length; i++) {
            var _el = els[i];
            if (_el.removeAttribute) {
              _el.removeAttribute("style");
              _el.removeAttribute("class");
            }
          }
        };

        // //设置样式
        var setElStyle = function (style) {
          var els = arguments;
          for (var i = 1; i < els.length; i++) {
            var _el = els[i];
            _el.setAttribute("style", style);
          }
        };
        var tkDom = document.createElement("tk_dom");
        tkDom.innerHTML = args.content;
        for (var i = 0; i < tkDom.children.length; i++) {
          let el = tkDom.children[i];
          if (el.nodeName === "TABLE" && el.dataset.type == "debit-lend") {
          } else {
            removeElStyleAndClass(...tkDom.getElementsByTagName("div"));
            removeElStyleAndClass(...tkDom.getElementsByTagName("p"));
            removeElStyleAndClass(...tkDom.getElementsByTagName("table"));
            removeElStyleAndClass(...tkDom.getElementsByTagName("tr"));
            removeElStyleAndClass(...tkDom.getElementsByTagName("td"));
            removeElStyleAndClass(...tkDom.getElementsByTagName("span"));

            setElStyle(paragraphStyle, ...tkDom.getElementsByTagName("div"));
            setElStyle(paragraphStyle, ...tkDom.getElementsByTagName("p"));
            setElStyle(tableStyle, ...tkDom.getElementsByTagName("table"));
            setElStyle(tdStyle, ...tkDom.getElementsByTagName("td"));
            setElStyle(spanStyle, ...tkDom.getElementsByTagName("span"));
          }
        }
        args.content = tkDom.innerHTML;
      },

      //内容粘贴到编辑器后执行 （修改插件功能）
      paste_afterprocess: function (editor) {
        // editor.execCommand("formatbrush");
      },
      // 插入填空符
      fillBlank_process: function (editor, inputArr) {
        // console.log(editor, inputArr)
        if (props.fillBlankChange && props.fillBlankChange instanceof Function) {
          props.fillBlankChange(editor, inputArr);
        }
      },
      fillBlank_process_before: function (editor, inputArr) {
        // console.log(editor, inputArr)
        if (props.fillBlankBefore && props.fillBlankBefore instanceof Function) {
          return props.fillBlankBefore();
        }

        return true;
      },
    };

    if (
      initTinyData.toolbar.indexOf("tiny_mce_wiris_formulaEditor") > -1 ||
      initTinyData.toolbar.indexOf("tiny_mce_wiris_formulaEditorChemistry") > -1
    ) {
      initData.external_plugins = {
        tiny_mce_wiris: "plugins/tiny_mce_wiris/plugin.min.js",
      };

      initData.allow_mathml_annotation_encodings = ["wiris", "application/json"];
    }

    tinymce.init(initData);
  };

  // 销毁编辑器
  const destroyTiny = () => {
    if (tinyMCE?.editors[tinymceId.value]) {
      tinyMCE.editors[tinymceId.value].hasDestory = true;
      tinyMCE.editors[tinymceId.value].destroy();
    }
  };

  // 获得内容
  const getContent = () => {
    var cnt = tinyMCE.editors[tinymceId.value].getContent();
  };
  // 获得纯文本
  const getText = () => {
    var cnt = tinyMCE.editors[tinymceId.value].getContent({ format: "text" });
  };
  // 插入内容
  const insertContent = (html) => {
    tinyMCE.editors[tinymceId.value].insertContent(html);
  };
  // 设置内容
  const setContent = (html) => {
    if (!html) {
      var p = document.createElement("p");
      p.setAttribute(
        "style",
        `text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family: ${
          initTinyData?.editorFontFamily ?? ""
        }; font-size: ${initTinyData?.editorFontSize ?? "14px"};text-align:${initTinyData?.align ?? "left"};`
      );
      tinyMCE?.editors[tinymceId.value]?.setContent(p.outerHTML);
    } else {
      tinyMCE?.editors[tinymceId.value]?.setContent(html);
    }
  };

  // 设置文本内容
  const setTextContent = (html) => {
    var p = document.createElement("p");
    p.setAttribute(
      "style",
      `text-align: left;letter-spacing: 0px; line-height:  1.5; margin: 0; padding: 0; word-wrap: break-word; font-family: ${
        initTinyData?.editorFontFamily ?? ""
      }; font-size: ${initTinyData?.editorFontSize ?? "14px"};text-align:${initTinyData?.align ?? "left"};`
    );
    p.innerText = html;
    tinyMCE?.editors[tinymceId.value]?.setContent(p.outerHTML);
  };

  const saveContent = () => {
    tinyMCE.editors[tinymceId.value].save();
  };
  // 显示编辑器
  const showTiny = () => {
    tinyMCE.editors[tinymceId.value].show();
  };
  // 隐藏编辑器
  const hideTiny = () => {
    tinyMCE.editors[tinymceId.value].hide();
  };
  // 复制选中文字
  const copyContent = () => {
    tinyMCE.editors[tinymceId.value].execCommand("copy");
  };
  // 粘贴
  const pasteContent = () => {
    tinyMCE.editors[tinymceId.value].execCommand("paste");
  };
  // 删除填空空格
  const delFillblank = (index) => {
    tinyMCE.editors[tinymceId.value].execCommand("mceDelFillblank", index);
  };
  // 重置
  const resetContent = () => {
    tinyMCE.editors[tinymceId.value].resetContent();
  };

  onMounted(() => {
    initTiny();
  });

  onUnmounted(() => {
    destroyTiny();
  });

  return {
    initTiny,
    destroyTiny,
    getContent,
    getText,
    insertContent,
    setContent,
    setTextContent,
    saveContent,
    showTiny,
    hideTiny,
    copyContent,
    pasteContent,
    tinymceId,
    delFillblank,
    resetContent,
  };
}
