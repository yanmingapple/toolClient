<template>
  <tk-drawer :dlgObj="dlgData">
    <div class="print-config-panel">
      <div class="row">
        <label>纸张尺寸</label>
        <select v-model="paperSize">
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>
      </div>
      <div class="row">
        <label>布局</label>
        <select v-model="layout">
          <option value="portrait">纵向</option>
          <option value="landscape">横向</option>
        </select>
      </div>
      <div class="row">
        <label>边距</label>
        <div class="margin-group">
          <span>上</span><input v-model="margin.top" type="number" placeholder="上" /> <span>右</span
          ><input v-model="margin.right" type="number" placeholder="右" />
        </div>
        <div class="margin-group">
          <span>下</span><input v-model="margin.bottom" type="number" placeholder="下" /> <span>左</span
          ><input v-model="margin.left" type="number" placeholder="左" />
        </div>
      </div>
    </div>
    <iframe
      id="printIframe"
      :src="iframeSrc"
      :key="iframeSrc"
      width="100%"
      height="98%"
      frameborder="0"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </tk-drawer>
</template>
<script setup>
import { reactive, ref, nextTick, computed, watch } from "vue";

const dlgData = reactive(useDlg());
dlgData.width = "100%";
dlgData.title = "预览打印";
dlgData.closeButtonCustomText = "返回";

// 纸张、布局、边距
const paperSize = ref("A4");
const layout = ref("portrait");
// 默认边距 2.54cm 1.18cm 2.54cm 1.18cm
const margin = reactive({
  top: "2.54",
  right: "1.18",
  bottom: "2.54",
  left: "1.18",
});

const iframeSrc = computed(() => {
  const marginStr = [margin.top, margin.right, margin.bottom, margin.left].join(",");
  return `static/tk_preview_ui/tablePrint.html?paperSize=${paperSize.value}&layout=${layout.value}&margin=${marginStr}`;
});

const currHtml = ref("");

watch([paperSize, layout, margin], (newVal) => {
  nextTick(() => {
    var wn = document.getElementById("printIframe").contentWindow;
    wn.onload = function () {
      wn.postMessage(currHtml.value, "*");
    };
  });
});

function postOriginTableData(html) {
  const tableList = $(html).find("table");

  if (tableList.length == 0) {
    tkMessage.err("没有检测到打印的表格");
    return;
  }

  let processedHtml = "";
  for (var tIndex = 0; tIndex < tableList.length; tIndex++) {
    const table = $(`<table data-op-type="table" border="1"></table>`);

    // 获取原始表格的所有行
    const allRows = $(tableList[tIndex]).find("tr");

    if (allRows.length > 0) {
      let opreateColumn = -1;
      table[0].width = "100%";
      table[0].style.width = "100%";

      // 创建thead和tbody
      const thead = $("<thead></thead>");
      const tbody = $("<tbody class='nop-fill-box'></tbody>");

      // 遍历所有行并分类处理
      allRows.each(function (rowIndex, row) {
        // 清除行的类名
        $(row).removeClass();

        // 检查是否为表头行（根据需要自定义判断逻辑）
        const isHeaderRow = rowIndex === 0; // 简单处理：第一行为表头

        if (isHeaderRow) {
          // 处理表头行
          let colspanIndex = -1;
          for (var cellIndex = 0; cellIndex < row.children.length; cellIndex++) {
            const cell = row.children[cellIndex];
            colspanIndex += cell.colSpan;
            cell.className = "";

            // 移除"操作"列或空列
            if (cell.innerText == "操作" || cell.innerText == "") {
              opreateColumn = colspanIndex;
              row.removeChild(cell);
              cellIndex--; // 调整索引因为移除了元素
            }
          }
          thead.append(row);
        } else {
          // 处理数据行
          for (var cellIndex = 0; cellIndex < row.children.length; cellIndex++) {
            const cell = row.children[cellIndex];
            // 清除单元格类名
            cell.className = "";

            // 处理跨行/跨列单元格
            if (cell.rowSpan > 1 || cell.colSpan > 1) {
              cell.dataset["splitRepeat"] = true;
            }

            // 移除操作列
            if (opreateColumn === cellIndex) {
              row.removeChild(cell);
              cellIndex--; // 调整索引因为移除了元素
            }
          }
          tbody.append(row);
        }
      });

      // 添加thead和tbody到table
      if (thead.children().length > 0) {
        table.append(thead);
      }
      if (tbody.children().length > 0) {
        table.append(tbody);
      }

      processedHtml += table[0].outerHTML;
    }
  }

  // 清理HTML字符串
  processedHtml = processedHtml.replaceAll('colspan="1"', "");
  processedHtml = processedHtml.replaceAll('rowspan="1"', "");
  processedHtml = processedHtml.replaceAll("<!--v-if--><!--v-if-->", "");
  processedHtml = processedHtml.replaceAll("<!-- 正常渲染 -->", "");
  processedHtml = processedHtml.replaceAll("<!---->", "");
  processedHtml = processedHtml.replaceAll("<!--v-if-->", "");

  nextTick(() => {
    var wn = document.getElementById("printIframe").contentWindow;
    wn.onload = function () {
      currHtml.value = processedHtml;
      wn.postMessage(processedHtml, "*");
    };
  });
}

function postPaperData(html, postFn) {
  if(postFn){
    html = postFn(html);
  } else {
    const tableList = $(html).find("table");

    if (tableList.length == 0) {
      tkMessage.err("没有检测到打印的表格");
      return;
    }
    html = "";
    for (var tIndex = 0; tIndex < tableList.length; tIndex++) {
      const table = $(`<table data-op-type="table"  border="1"></table>`);
      if (tableList.length == 2) {
        const opreateColumn = [];
        tableList[1].width = "100%";
        tableList[1].style.width = " 100%";
        const thead = $("<thead>");
        const thList = $(tableList[0]).find("tr");
        for (var thi = 0; thi < thList.length; thi++) {
          let colspanIndex = -1;
          $(thList[thi]).removeClass();
          for (var tdi = 0; tdi < thList[thi].children.length; tdi++) {
            colspanIndex += thList[thi].children[tdi].colSpan;
            thList[thi].children[tdi].className = "";
            if (thList[thi].children[tdi].innerText == "操作" || thList[thi].children[tdi].innerText == "") {
              opreateColumn.push(colspanIndex);
              thList[thi].removeChild(thList[thi].children[tdi]);
            }
          }
          thead.append(thList[thi]);
        }
        table.append(thead);
        const tbody = $(` <tbody class="nop-fill-box"></tbody>`);
        const trList = $(tableList[1]).find("tr");
        for (var tri = 0; tri < trList.length; tri++) {
          $(trList[tri]).removeClass();
          for (var tdi = 0; tdi < trList[tri].children.length; tdi++) {
            const a = $(trList[tri].children[tdi]);
            a.html(a.text())
            a.removeClass();
            if (trList[tri].children[tdi].rowSpan > 1 || trList[tri].children[tdi].colSpan > 1) {
              trList[tri].children[tdi].dataset["splitRepeat"] = true;
            }
            if (opreateColumn.includes(tdi)) {
              trList[tri].removeChild(trList[tri].children[tdi]);
            }
          }
          tbody.append($(trList[tri]));
        }
        table.append(tbody);
        html += table[0].outerHTML;
      }
      html = html.replaceAll('colspan="1"', "");
      html = html.replaceAll('rowspan="1"', "");
      html = html.replaceAll("<!--v-if--><!--v-if-->", "");
      html = html.replaceAll("<!-- 正常渲染 -->", "");
      html = html.replaceAll("<!---->", "");
      html = html.replaceAll("<!--v-if-->", "");
    }
  }

  nextTick(() => {
    var wn = document.getElementById("printIframe").contentWindow;
    wn.onload = function () {
      currHtml.value = html;
      wn.postMessage(html, "*");
    };
  });
}

// 初始化组件，渲染数据
function doComInit(html, isOrigin, postFn) {
  dlgData.openDlg();
  if (isOrigin) {
    postOriginTableData(html);
  } else {
    postPaperData(html, postFn);
  }
}
defineExpose({ doComInit });
</script>
<style scoped>
.print-config-panel {
  position: fixed;
  right: 3.57rem;
  top: 15.86rem;
  background: rgba(30, 30, 30, 0.95) !important;
  border-radius: 0.71rem;
  padding: 1.29rem 1.71rem 0.86rem 1.71rem;
  z-index: 100;
  min-width: 10rem;
  box-shadow: 0 0.14rem 0.86rem rgba(0, 0, 0, 0.2);
}
.row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.row:last-child {
  margin-bottom: 0;
}
label {
  color: #fff;
  font-size: 1.14rem;
  margin-bottom: 0.43rem;
  letter-spacing: 0.07rem;
  min-width: 4.57rem;
}
select {
  width: 10rem;
  height: 3.43rem;
  background: rgba(0, 0, 0, 0.4);
  border: 0.07rem solid #444;
  border-radius: 0.57rem;
  color: #fff;
  font-size: 1.29rem;
  padding-left: 1.14rem;
  appearance: none;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.14s;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23999" height="1.71rem" viewBox="0 0 24 24" width="1.71rem" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 1.14rem center;
  background-size: 1.71rem 1.71rem;
  margin-bottom: 0.57rem;
}
select:hover,
select:focus {
  border-color: #666;
}
select::-ms-expand {
  display: none;
}
option {
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
}
.margin-group {
  color: #fff;
  display: flex;
  align-items: center;
  margin-bottom: 0.29rem;
}
.margin-label {
  color: #fff;
  font-size: 1rem;
  margin-right: 0.29rem;
}
input[type="number"] {
  margin-left: 0.3rem;
  width: 3.86rem;
  height: 2.29rem;
  background: rgba(0, 0, 0, 0.4);
  border: 0.07rem solid #444;
  border-radius: 0.43rem;
  color: #fff;
  font-size: 1.07rem;
  padding-left: 0.43rem;
  margin-right: 0.57rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.14s;
}
input[type="number"]:focus {
  border-color: #666;
}
</style>
