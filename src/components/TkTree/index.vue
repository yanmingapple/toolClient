<template>
  <div class="CusTree" ref="CusTree">
    <div :class="['CusTree-left', { 'CusTree-left-70':props.selectedVisible  }]">
      <div class="CusTree-title">
        <div v-if="props.showLeftTitle">
          {{ props.leftTitle || "目录" }}
        </div>

        <slot name="headerRight"></slot>
      </div>

      <div style="margin:0 1%;">
        <el-input
        v-if="props.hasSearch"
        v-model="searchVal"
        placeholder="请输入查询关键字"
        :style="{ width: '100%', marginTop: '8px' }"
        @input="onQueryChanged"
      ></el-input>
      </div>
      <div
        class="CusTree-content"
        ref="content"
        :style="{
          width: props.selectedVisible ? leftWidth : '',
          height: treeHeight,
        }"
      >
        <el-tree-v2
          v-bind="$attrs"
          ref="tree"
          highlight-current
          :show-checkbox="props.showCheckbox"
          :filter-node-method="filterNode"
          :expand-on-click-node="onlyAvailableMinNode||showCheckbox||false"
          :height="treeOffsetHeight"
          :filter-method="filterMethod"
          @check="treeCheck"
          @node-click="handleClick"
        >
          <!-- :expand-on-click-node="false" -->
          <template #default="{ node, data }">
            <span
              :class="[
                'custom-tree-node',
                { disabled: disabledFunction && disabledFunction(data) },
              ]"
            >
              <span class="custom-tree-node-title">
                <slot name="prefixIcon" :node="node" :data="data">
                  <svg-icon
                    :class-name="['svgicon']"
                    :icon-class=" data.icon ? data.icon :
                      !data.children || !data.children.length
                        ? 'ic_flag'
                        : node.expanded
                        ? 'ic_open_folder'
                        : 'ic_close_folder'
                    "
                  />
                </slot>

                <span class="label-con">
                    <!-- <el-tooltip
                      :content="'<span style=\'font-size=\'20px;\'\'>' + node.label +'</span>'"
                      raw-content
                      trigger="click"
                    > -->
                      <span :title="node.label" class="span-ellipsis">{{ node.label }}</span>
                    <!-- </el-tooltip> -->


                </span>
                <span v-if="!props.showCheckbox">
                  <svg-icon
                    v-if="selectedList.find((item) => item.id === data.id)"
                    class-name="ic_Hook"
                    icon-class="ic_hook"
                  />
                </span>

                <slot name="suffix" :node="node" :data="data"></slot>
              </span>

              <span class="mr20">
                <slot name="buttons" :node="node" :data="data"></slot>
              </span>
            </span>
          </template>
        </el-tree-v2>
      </div>
    </div>

    <div class="CusTree-right" v-if="selectedVisible">
      <div class="CusTree-title">
        <div>{{ props.rightTitle || "已选列表" }}</div>
        <div class="CusTree-title-right">
          <slot name="selectedRight"></slot>
        </div>
      </div>
      <div
        class="CusTree-content"
        :style="{
          width: props.selectedVisible ? halfWidth : '',
          height: rightBoxHeight + 'px',
        }"
      >
        <div
          class="selectedItem"
          :style="{
            paddingRight: props.showCheckbox ? '0' : '20px',
            color: selectItem.main === '1' ? '#ef2626' : '',
          }"
          v-for="(selectItem, selectIndex) in selectedList"
          :key="selectIndex + 'selected' + selectItem.id"
        >
          <svg-icon v-if="!setMain" class-name="ic_flag" :icon-class="selectItem.icon??'ic_flag'" />

          <el-checkbox
            v-else
            v-model="selectItem.main"
            true-label="1"
            false-label="0"
          ></el-checkbox>
          {{ selectItem.parentFullName|| selectItem.name }}
          <svg-icon
            class-name="ic_close"
            icon-class="ic_close"
            title="取消选择"
            @click="handleDelete(selectItem)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  // 不让子组件的根节点渲染属性
  inheritAttrs: false,
};
</script>
<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
const props = defineProps({
  selectedList: {
    type: Array,
    default: () => [], //复显 nodeList
  },
  defaultCheckKeys: {
    type: Array,
    default: () => [], //复显 nodeList
  },
  mainNodeId: {
    type: Array,
    default: () => [], // 主节点
  },
  selectType: {
    type: String,
    default: "single", //single 单选  multiple 多选
  },

  hasSearch: {
    type: Boolean,
    default: false, //是否支持搜索
  },

  selectedVisible: {
    type: Boolean,
    default: true, // 已选目录是否显示
  },

  setMain: Boolean, //设置主要
  onlyAvailableMinNode: {
    type: Boolean,
    default: false, // 只可选最小层级
  },
  showLeftTitle: {
    type: Boolean,
    default: true,
  },
  leftTitle: String,
  rightTitle: String,

  showCheckbox: {
    type: Boolean,
    default: false, //true 多选、 选择父节点时子节点全选   false 单选、多选、选择父节点不选中子节点
  },
  hideCheckIcon: { //  隐藏选择图标
    type: Boolean,
    default: false,
  },
  halfCheckedKeys:{
    type: Boolean,
    default: false, //true 部分选择的父节点加入选中列表  false不加入
  },
  isExpandSele: {
    // 是否展开选中
    type: Boolean,
    default: true,
  },
  treeHeight: {
    // 是否展开选中
    type: [Number, String],
    default: 250,
  },
  handTreeClick: {
    type: Function,
    default: () => {},
  },
  disabledFunction: {
    type: Function,
  },
});
const searchVal = ref("");
const halfWidth = ref("");
const leftWidth = ref("");
const tree = ref(null);

const CusTree = ref(null);
// 设置选中节点 通过[...keys]

const setCheckedKeys = (ids) => {
  nextTick(() => {
    // 将复现事件添加到宏任务等待微任务与树渲染完成后再回显
    setTimeout(() => {
      if (props.showCheckbox) {
        tree.value.setCheckedKeys(ids);
      } else {
        // 获取node节点
        setTimeout(() => {
          const selectedItemList = getAllItem(ids);
          if(props.mainNodeId?.length) {
            selectedItemList.forEach(_s => {
              if(props.mainNodeId?.includes(_s.id)) {
                _s.main = '1'
              }
            });
          }
          emits("update:selectedList", selectedItemList);
        }, 500);
      }
    });
  }, 500);
};

const setExpandedKeysFunc = (idList) => {
  nextTick(() => {
    tree.value.setExpandedKeys(idList);
  });
};

onMounted(() => {
  nextTick(() => {
    halfWidth.value = CusTree.value.clientWidth / 3.5 + "px";
  });
  nextTick(() => {
    leftWidth.value = CusTree.value.clientWidth / 1.45 + "px";
  });
});

watch(
  () => props.selectedList,
  (val) => {
    // selectedList设置为空时，复选框也需清空
    if (val.length === 0) {
      nextTick(() => {
        tree.value.setCheckedKeys([]);
        // tree.value.setExpandedKeys([]);
      });
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.defaultCheckKeys,
  (val) => {
    nextTick(() => {
      if (val?.length === 0) return;
      setTimeout(() => {
        setCheckedKeys(val);
        tree.value.setExpandedKeys(val);
      }, 300);
    });
  },
  {
    immediate: true,
    deep: true,
  }
);

const content = ref(null);
const treeOffsetHeight = computed(() => {
  if (props.treeHeight) {
    let heightValue = 0;
    // 处理 vh 单位
    if (typeof props.treeHeight === 'string' && props.treeHeight.includes('vh')) {
      const vhValue = parseFloat(props.treeHeight);
      heightValue = (window.innerHeight * vhValue) / 100;
    } else {
      // 处理数字或 px 单位
      heightValue = typeof props.treeHeight === 'number'
        ? props.treeHeight
        : parseFloat(props.treeHeight) || 0;
    }
    return heightValue - 15;
  }
  // 如果没有设置 treeHeight，使用 content 的高度
  if (content.value?.offsetHeight) {
    return content.value.offsetHeight - 60;
  }
  // 默认值
  return 200;
});

const rightBoxHeight = ref();

watch(
  () => treeOffsetHeight.value,
  (val) => {
    nextTick(() => {
      if (props.hasSearch) {
        rightBoxHeight.value = val + 36;
      } else {
        rightBoxHeight.value = val;
      }
    });
  },
  {
    immediate: true,
    deep: tree,
  }
);

const onQueryChanged = (query) => {
  tree.value.filter(query);
};

const filterMethod = (query, node) => {
  return node.name.includes(query);
};

const emits = defineEmits(["update:selectedList", "handTreeClick"]);

const treeCheck = (node, list) => {
  if (!props.showCheckbox) return;
  //node 该节点所对应的对象、list 树目前的选中状态对象
  //选中事件在选中后执行，当lis中有两个选中时，使用setCheckedKeys方法，选中一个节点
  if(props.halfCheckedKeys){
    const retArr = [];
    list.checkedNodes.forEach(n =>{
      retArr.push(n)
    })

    list.halfCheckedNodes.forEach(n =>{
      retArr.push(n)
    })

    emits("update:selectedList", retArr);
  }else{
    emits("update:selectedList", list.checkedNodes);
  }

};

// 设置选中节点 通过[...nodes]
const setCheckedNodes = (nodeList) => {
  nextTick(() => {
    // 将复现事件添加到宏任务等待微任务与树渲染完成后再回显
    setTimeout(() => {
      if (props.showCheckbox) {
        if (tree.value && tree.value.setCheckedKeys) {
          tree.value.setCheckedKeys(nodeList.map((_c) => _c.id));
        } else if (tree.value && tree.value.setCheckedNodes) {
          tree.value.setCheckedNodes(nodeList);
        }
      } else {
        emits("update:selectedList", nodeList);
      }
    }, 0);
  });
};

//暴露接口或数据到外层
defineExpose({ setCheckedKeys, setCheckedNodes, tree, setExpandedKeysFunc });

const // 递归 获取ids包含children的item
  getAllItem = (keys) => {
    if (keys.length === 0) return [];
    const nodeList = keys.map((keyItem) => {
      const nodeData = tree.value.getNode(keyItem)?.data ?? "";
      if (!nodeData) return;
      if (props.isExpandSele) {
        //   setExpandedKeys 方法需要把路径ids数组存入才可展开  而不是选中ids数组
        tree.value.setExpandedKeys(nodeData?.line?.split("_")??[nodeData.id]);
      }
      return nodeData;
    });
    return nodeList.filter((node) => !!node);
  };

const // 实现点击多选或单选
  handleClick = (nodeData) => {
    if (props.disabledFunction && props.disabledFunction(nodeData)) {
      return;
    }

    emits("handTreeClick", nodeData);
    // 多选禁用
    if (props.showCheckbox || props.hideCheckIcon) return;
    let list = [...props.selectedList];
    if (
      props.onlyAvailableMinNode &&
      nodeData.children &&
      nodeData.children.length > 0
    )
      return; // 表示有子节点
    const hasItem = props.selectedList.find((_c) => _c.id == nodeData.id);
    if (props.selectType === "single") {
      // 单选
      if (hasItem) {
        list = props.selectedList.filter((_c) => _c.id != nodeData.id);
      } else {
        list = [nodeData];
      }
    } else {
      // 多选
      if (hasItem) {
        list = props.selectedList.filter((_c) => _c.id != nodeData.id);
      } else {
        list = [...props.selectedList, nodeData];
      }
    }
    emits("update:selectedList", [...list]);
  };

const // 删除已选
  handleDelete = (selectedItem) => {
    let list = [];
    if (props.selectedList.find((_c) => _c.id == selectedItem.id)) {
      list = props.selectedList.filter((_c) => _c.id != selectedItem.id);
    }
    emits("update:selectedList", [...list]);
    setCheckedNodes(list);
  };
const filterNode = (value, data) => {
  if (!value) return true;
  return data.name.indexOf(value) !== -1;
};
const // 获取单选数据
  getSingleNodeData = () => {
    return tree.value.getCurrentNode();
  };
</script>

<style lang="less" scoped>
.ic_Hook {
  color: #409eff;
  margin-left: 24px;
}

.ic_flag {
  width: 16px;
  height: 16px;
}

.CusTree {
  display: flex;
  margin-bottom: 10px;

  & > div {
    width: 100%;
    // flex: 1;
    box-sizing: border-box;
    border: 1px solid #dcdcdc;
    font-size: 14px;
  }
  .CusTree-left-70{
    width: 70%;
  }

  .CusTree-right {
    margin-left: 15px;
    width: 30%;

    .CusTree-content {
      //   max-height: calc(100vh - 300px);
    }
  }

  .CusTree-title {
    position: relative;
    padding: 2px 14px;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #dcdcdc;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &::before {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 7px;
      width: 2px;
      height: 12px;
      background-color: #6fa2ed;
    }
  }

  .CusTree-content {
    padding: 8px;
    overflow: auto;
    box-sizing: border-box;
    // max-height: calc(100vh - 300px);
    min-height: 150px;
    :deep(.el-tree__empty-block) {
      min-height: 150px;
    }

    :deep(.custom-tree-node) {
      overflow: hidden; //超出隐藏
      white-space: nowrap; //不折行
      text-overflow: ellipsis; //溢出显示省略号
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .custom-tree-node-title {
        flex: 1;
        display: flex;
        align-items: center;
        width: 70%;
      }
    }
  }
}

// 隐藏滚动条
.CusTree-content::-webkit-scrollbar {
  width: 0 !important;
}

// IE 10+
.CusTree-content {
  -ms-overflow-style: none;
}

// Firefox
.CusTree-content {
  overflow: -moz-scrollbars-none;
}

.selectedItem {
  // overflow: hidden;
  // text-overflow: ellipsis;
  // display: -webkit-box;
  // -webkit-box-orient: vertical;
  // -webkit-line-clamp: 2;
  border-bottom: 1px dashed #999;
  white-space: pre-wrap;
  position: relative;
  padding-right: 8px;
  box-sizing: border-box;

  .ic_close {
    position: absolute;
    right: 0;
    top: 7px;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    color: rgba(250, 119, 119);
    cursor: pointer;
  }
}

.svgicon {
  margin-right: 6px;
}

.ic_close_folder {
  color: #409eff;
}

.disabled {
  color: #dcdcdc;
  cursor: not-allowed;
}
.label-con {
  flex: 1;
  width: calc(100% - 30px);
}
.span-ellipsis {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
