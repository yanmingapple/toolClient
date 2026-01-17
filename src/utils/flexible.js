// 首先是一个立即执行函数，执行时传入的参数是window和document
(function (win, lib) {
  const doc = win.document;
  const docEl = doc.documentElement; // 返回文档的root元素
  let metaEl = doc.querySelector('meta[name="viewport"]');
  let dpr = 0;
  let scale = 0;
  let tid;
  const flexible = lib.flexible || (lib.flexible = {});

  if (metaEl) {
    console.warn("将根据已有的meta标签来设置缩放比例");
    const match = metaEl.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
    if (match) {
      scale = parseFloat(match[1]);
      dpr = parseInt(1 / scale);
    }
  }

  if (!dpr && !scale) {
    dpr = 1;
    scale = 1 / dpr;
  }

  docEl.setAttribute("data-dpr", dpr);
  if (!metaEl) {
    metaEl = doc.createElement("meta");
    metaEl.setAttribute("name", "viewport");
    metaEl.setAttribute(
      "content",
      "initial-scale=" + scale + ", maximum-scale=" + scale + ", minimum-scale=" + scale + ", user-scalable=no"
    );
    if (docEl.firstElementChild) {
      docEl.firstElementChild.appendChild(metaEl);
    } else {
      const wrap = doc.createElement("div");
      wrap.appendChild(metaEl);
      doc.write(wrap.innerHTML);
    }
  }

  function refreshRem() {
    let width = docEl.getBoundingClientRect().width;
    if (width / dpr >= 1400 && width / dpr <= 2000) {
      const rem = 16; // 固定为16px
      docEl.style.fontSize = rem + "px";
      flexible.rem = win.rem = rem;
    } else {
      //屏幕大于1920 小于5760 时
      if (width / dpr < 1024) {
        width = 1024 * dpr;
      } else if (width / dpr < 1440) {
        width = 1440 * dpr;
      } else if (width / dpr < 1680) {
        width = 1680 * dpr;
      } else if (width / dpr < 1920) {
        width = 1920 * dpr;
      } else if (width / dpr > 2560) {
        width = 2560 * dpr;
      }
      // const rem = width / 137.1;//14px
      const rem = width / 120; //14px
      docEl.style.fontSize = rem + "px";
      flexible.rem = win.rem = rem;
    }
  }

  win.addEventListener(
    "resize",
    function () {
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 300);
    },
    false
  );
  win.addEventListener(
    "pageshow",
    function (e) {
      if (e.persisted) {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
      }
    },
    false
  );

  if (doc.readyState === "complete") {
    doc.body.style.fontSize = 14 * dpr + "px";
  } else {
    doc.addEventListener(
      "DOMContentLoaded",
      function (e) {
        doc.body.style.fontSize = 14 * dpr + "px";
      },
      false
    );
  }

  refreshRem();

  flexible.dpr = win.dpr = dpr;
  flexible.refreshRem = refreshRem;
  flexible.rem2px = function (d) {
    let val = parseFloat(d) * this.rem;
    if (typeof d === "string" && d.match(/rem$/)) {
      val += "px";
    }
    return val;
  };
  flexible.px2rem = function (d) {
    let val = parseFloat(d) / this.rem;
    if (typeof d === "string" && d.match(/px$/)) {
      val += "rem";
    }
    return val;
  };
})(window, window.lib || (window.lib = {}));
