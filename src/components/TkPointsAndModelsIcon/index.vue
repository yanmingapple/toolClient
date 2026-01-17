<template>
  <div
    :class="[
      'icon-box',
      rowData.property ? type + rowData.property : type + rowData.level,
      size,
    ]"
  >
    {{
      rowData.property
        ? getChinaByProperty(rowData.property)
        : getChina(rowData.level)
    }}
  </div>
</template>

<script setup>
const modelMap = {
  1: "域",
  2: "题",
  3: "点",
};
const pointMap = {
  1: "章",
  2: "节",
  3: "目",
  4: "点",
};
const props = defineProps({
  rowData: {
    require: true,
    type: Object,
  },
  type: {
    require: true,
    type: String,
    default: "model",
  },
  size: {
    type: String,
    default: "small",
  },
});

const getChinaByProperty = (property) => {
  if (props.type === "model") {
    return modelMap[parseInt(property)];
  }
};

const getChina = (level) => {
  if (props.type === "point") {
    if (level > 4) {
      return "点";
    } else {
      return pointMap[level];
    }
  } else if (props.type === "model") {
    if (level > 3) {
      return'' //"点";
    } else {
      return '' //modelMap[level];
    }
  }
};
</script>

<style lang="less" scoped>
.icon-box {
  display: inline-block;
  width: 26px;
  height: 24px;
  margin-right: 4px;
  line-height: 24px;
  font-size: 14px;
  background-color: #46c0ff;
  //   background-color: #f09e24;
  border-radius: 4px;
  overflow: hidden;
  text-align: center;
  color: #fff;
  &.small {
    width: 18px;
    height: 18px;
    line-height: 18px;
    vertical-align: middle;
  }
}

.point1 {
  background-color: #0c60a8;
}
.point2 {
  background-color: #71b545;
}
.point3 {
  background-color: #46c0ff;
}
.point4 {
  background-color: #46c0ff;
}
.model1 {
  background-color: #0c60a8;
}
.model2 {
  background-color: #71b545;
}
.model3 {
  background-color: #46c0ff;
}
.model4 {
  background-color: #46c0ff;
}
</style>
