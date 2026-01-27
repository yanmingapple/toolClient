<template>
  <!-- 上传弹框 -->
  <div class="imageLook">
  <tk-dialog :dlgObj="dlgObjData">
    <div style="height: 100%;" >
      <!-- 图片集合 -->
      <viewer
        :options="viewerOptions"
        v-for="(image, index) in imageList"
        :key="index"
      >
        <img :src="image" :alt="'Image ' + (index + 1)" />
      </viewer>
    </div>
  </tk-dialog>
</div>
</template>
<script setup>
import { ref, reactive, nextTick } from "vue";

const instance = ref();
const imageList = ref([])
const viewerOptions = ref({
  zIndex: 99999,
  inline: true,
  button: false,
  navbar: false,
  title: false,
  toolbar: true,
  tooltip: true,
  movable: true,
  zoomable: true,
  rotatable: true,
  scalable: true,
  transition: true,
  fullscreen: false,
  keyboard: true,
  // 图片居中配置
  initialViewIndex: 0,
  loop: false,
  backdrop: true,
  loading: true,
  // 设置容器和画布的对齐方式
  container: '.imageLook .el-dialog__body',
  // 自定义样式
  className: 'viewer-centered',
})


const dlgObjData = reactive(useDlg());
dlgObjData.width = "80%";
dlgObjData.cancelBtn = "关闭"
dlgObjData.hasConfirm = false;
dlgObjData.hasCancel = false;

dlgObjData.fullscreen = true;
// 提交描述
dlgObjData.handlerConfirm = function () {};

// 设置组件参数
function doComInit(src) {

  dlgObjData.openDlg("图片查看");
  imageList.value = []
  imageList.value.push(src)
}

defineExpose({ doComInit });
</script>

<style lang="less" scoped>
.imageLook{
  :deep(.el-dialog .el-dialog__body),
  :deep(.viewer-container){
    height: 90vh !important;
    max-height: 90vh !important;
  }

  :deep(.el-dialog .el-dialog__body) {
    padding: 0;
    overflow: hidden;
  }
  
  :deep(.viewer-canvas){
    background-color: #fff;
    width: 100%;
    height: 100%;
  }
} 

</style>
