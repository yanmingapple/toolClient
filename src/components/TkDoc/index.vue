<template>
  <el-form :model="printFrom" label-width="auto" :inline="true"  class="demo-form-inline">
    <el-form-item label="页脚">
        <el-input v-model="printFrom.title" />
      </el-form-item>
      <el-form-item label="起始页码">
        <el-input v-model="printFrom.startNum" />
      </el-form-item>
      <el-form-item label="页数">
        <el-input v-model="printFrom.endNum" />
      </el-form-item>
      <el-form-item label="排序">
        <el-radio-group v-model="printFrom.sort" >
          <el-radio label="desc">反序</el-radio>
          <el-radio label="asc">正序</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="onSubmit">生成页面</el-button>
    </el-form-item>
  </el-form>
  <div style="border: 1px solid;background-color: aliceblue;text-align: center;">文档展示区</div>
     <iframe
     id="printIframe"
      src=""
      width="100%"
      height="90%"
      frameborder="0"
      allowfullscreen
      loading="lazy"
    ></iframe>
</template>   
<script setup>
import { reactive ,nextTick} from 'vue'

// do not use same name with ref
const printFrom = reactive({
  title:'【xx命题单位】',
  startNum: 1,
  endNum: 5,
  sort:'desc'
})


const onSubmit = () => {
  document.getElementById("printIframe").src="./static/tk_preview_ui/nullPagePrint.html?startNum="+(printFrom.startNum)+"&endNum="+(printFrom.endNum)+"&sort="+(printFrom.sort)+"&title="+(printFrom.title);
}

nextTick(()=>{
  onSubmit();
})

</script>  

<style lang="less" scoped>
.demo-form-inline {
  padding-top: 20px;
}
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

 
.demo-form-inline  .el-form-item {
  display: inline-flex;
  align-items: center;
  vertical-align: middle !important;
  margin-right:12px;
}

/* 保证标签与控件在垂直方向居中 */
.demo-form-inline .el-form-item__label {
  display: inline-flex;
  align-items: center;
}
</style>