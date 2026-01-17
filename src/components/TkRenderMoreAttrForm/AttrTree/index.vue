<template>
  <div>
    <tk-dialog :dlgObj="editorFormDlg">
      <div class="attrTreeDlg">
        <tk-tree
          ref="knowledgePointTreeRef"
          class="Catalog"
          v-model:data="knowledgePointTree"
          :props="{
            children: 'children',
            label: 'name',
            value: 'id',
          }"
          :hasSearch="true"
          v-model:selectedList="selectedList"
          :leftTitle="attrData.attrName + '目录'"
          :rightTitle="'已选' + attrData.attrName"
          :halfCheckedKeys="true"
          :selectType="attrData.selectType ?? 'multiple'"
          v-model:setMain="isSetMain"
          :onlyAvailableMinNode="onlySelectLowestLevel"
          treeHeight="40vh"
        ></tk-tree>
      </div>
    </tk-dialog>
  </div>
</template>
<script>
  export default {
    // 不让子组件的根节点渲染属性
    inheritAttrs: false,
  };
</script>
<script setup>
  import TkTree from '@/components/TkTree';

  import { ref, reactive, onMounted, nextTick } from 'vue';
  const props = defineProps({
    itemData: {
      type: Object,
      default: () => {},
    },
    attrData: {
      type: Object,
      default: {
        visible: false,
      },
    },
    showFullName: {
      //显示全名
      type: Boolean,
      default: true,
    },
    onlySelectLowestLevel: {
      type: Boolean,
      default: false,
    },
  });

  const editorFormDlg = reactive(useDlg());
  editorFormDlg.width = '60rem';
  editorFormDlg.fullscreenLoading = false;
  editorFormDlg.appendToBody = true;
  const knowledgePointTree = ref([]);
  const selectedList = ref([]);
  const knowledgePointTreeRef = ref();
  const isSetMain = ref(false);

  const handleClose = () => {
    editorFormDlg.closeDlg();
  };

  //试题编辑的时候使用第一次触发,与doComInit的那里出现执行两次的情况
  onMounted(() => {
    initData();
  });

  function initData() {
    knowledgePointTree.value = props.attrData.subItemTypeAttrTrees
      ? tkTools.toNodeTree(props.attrData.subItemTypeAttrTrees,"pid")
      : [];
    nextTick(() => {
      const defaultCheckKeys = props.attrData?.attrValue ?? [];
      if (defaultCheckKeys.length > 0) {
        props.attrData.attrValueContent = [];
        props.attrData.itemExpandAttrs = [];
        defaultCheckKeys.forEach(el => {
          const treeData = props.attrData.subItemTypeAttrTrees.find(k => k.id == el);
          if (treeData) {
            if (!treeData.parentFullName) treeData.parentFullName = treeData.name;

            if (props.showFullName) {
              props.attrData.attrValueContent.push(treeData.parentFullName);
            } else {
              props.attrData.attrValueContent.push(treeData.name);
            }

            props.attrData.itemExpandAttrs.push(treeData);
          }
        });
      }
    });
  }

  editorFormDlg.handlerConfirm = () => {
    props.attrData.itemExpandAttrs = selectedList;

    props.attrData.attrValue = selectedList.value.map(el => el.id);
    if (props.showFullName) {
      props.attrData.attrValueContent = selectedList.value.map(el => el.parentFullName);
    } else {
      props.attrData.attrValueContent = selectedList.value.map(el => el.name);
    }

    handleClose();
  };

  //试题搜索，更多条件手动触发
  const doComInit = () => {
    editorFormDlg.openDlg(`${props.attrData.attrName}`);

    initData();

    nextTick(() => {
      const defaultCheckKeys = props.attrData?.attrValue ?? [];
      knowledgePointTreeRef.value?.setCheckedKeys(defaultCheckKeys);
      knowledgePointTreeRef.value?.setExpandedKeysFunc(defaultCheckKeys);
    });
  };

  const resetForm = () => {};

  defineExpose({ resetForm, doComInit });
</script>

<style lang="less" scoped>
  .attrTreeDlg {
    margin: 10px 0;
    background-color: #fff;
  }
  .Catalog {
    height: 40vh;
    overflow: auto;
  }
</style>
