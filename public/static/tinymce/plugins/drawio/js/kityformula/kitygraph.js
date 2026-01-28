var kityIDer = "";

function showFormula() {
  $("#graphWindow").window("open");
  initializeKityGraph();
  setTimeout(function () {
    window.kfe.execCommand("render", "" || "\\placeholder");
    window.kfe.execCommand("focus");
  }, 500)
}

function setlatex(imgLatex) {
  try {
    window.kfe.execCommand("render", imgLatex || "\\placeholder");
    window.kfe.execCommand("focus");
  } catch (e) {}

}

function insertGraph() {
  kfe.execCommand('get.image.data', function (data) {
    var editorid = showeditorid();
    var editor = getCurrentEditor(editorid);
    var latex = window.kfe.execCommand('get.source');
    if (kityIDer && document.getElementById(kityIDer)) {
      if (latex.indexOf("placeholder") < 0) {
        $("#" + kityIDer).attr("src", data.img);
        $("#" + kityIDer).attr("data-latex", latex);
      }
    } else {
      if (latex.indexOf("placeholder") < 0) {
        kityIDer = new Date().getTime();
        var ansHtml = editor.getHtml();
        ansHtml += '<img id="' + kityIDer + '" class="kfformula" onclick="javascript:editGraph(this);" style="vertical-align: middle;" src="' + data.img + '" data-latex="' + latex + '" />'
        editor.setHtml(ansHtml);
      }
    }
    $("#graphWindow").window("close");
  });

}

function editGraph(imgLatex) {
  // $("#graphWindow").window("open");
  // initializeKityGraph();
  // kityIDer = img.id;
  // var imgLatex = $(img).attr("data-latex");
  window.kfe.execCommand("render", imgLatex || "\\placeholder");
  // window.kfe.execCommand( "focus" );
}

function initializeKityGraph() {
  $("#tips").html('<div id="loading"><img src="../../../WebPaper/common/images/loading.gif" alt="loading" /><p>loading...</p></div>');
  kityIDer = "";
  var factory = kf.EditorFactory.create($("#kfEditorContainer")[0], {
    render: {
      fontsize: 24
    },
    resource: {
      path: "../../../WebPaper/common/js/javascript/kityformula/resource/"
    }
  });

  factory.ready(function (KFEditor) {
    $("#tips").remove();
    this.execCommand("render", null || "\\placeholder");
    this.execCommand("focus");
    window.kfe = this;

    $("#graphWindow .kf-editor-canvas-container svg").click(function () {
      $("#kfEditorContainer .kf-editor-input-box").blur();
      $("#kfEditorContainer .kf-editor-input-box").focus();
    });

    $(".kf-editor-toolbar").click(function () {
      $("#kfEditorContainer .kf-editor-input-box").focus();
    })

    $("#kfEditorContainer .kf-editor-input-box").blur(function () {
      $(this).focus();
    });
    $(".kf-editor-ui-box").blur(function () {
      $(this).parent().show();
    });
  });
}