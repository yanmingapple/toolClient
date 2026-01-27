<template>
  <div :id="tinymceId + 'toolBar'" class="outline-box">
    <div
      :id="tinymceId"
      class="doc-cnt"
      :style="{ height: isNaN(height) ? height : height + 'px' }"
    ></div>
  </div>
</template>

<script setup>
  import useEditor from './useEditor.js';
  import { watch } from 'vue';
  const props = defineProps({
    divId: {
      type: String,
      default: function () {
        return (
          'vue-tinymce-' +
          +new Date().getTime() +
          ((Math.random() * 1000).toFixed(0) + '')
        );
      },
    },
    placeholder: {
      type: String,
      default: '',
    },
    fixedToolbarContainer: {
      type: [String],
      default: '#toolBar',
    },
    toolbarMode: {
      type: [String],
      default: 'floating',
    },
    toolbarPersist: {
      type: [Boolean],
      default: false,
    },
    // toolbar: {
    //   type: String,
    //   required: false,
    //   default() {
    //     return '';
    //   },
    // },
    height: {
      type: [Number, String],
    },
    width: {
      type: [Number, String],
      required: false,
      default: 'auto',
    },
    itemTypeId: {
      type: [Number, String],
      default: '1',
    },
    content: {
      type: [Number, String],
      default: '',
    },
    type: {
      type: [String],
      default: '',
    },
    fillBlankChange: {
      type: [Function],
    },
    fillBlankBefore: {
      type: [Function],
    },
    initTinyData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    index: { type: Number },
    changeEdiotorCount: { type: Number }, //手动更新富文本的设置
    pasteFormat: { type: Boolean, default: true }, // 粘贴是否去除样式并格式 true: 格式化 false: 保留粘贴样式
    pasteAsText: { type: Boolean, default: true }, // 粘贴为纯文本 true: 纯文本 false: 富文本
  });

  const emits = defineEmits(['focus', 'update:content']);

  const {
    initTiny,
    destroyTiny,
    getContent,
    getText,
    insertContent,
    setContent,
    saveContent,
    showTiny,
    hideTiny,
    copyContent,
    pasteContent,
    tinymceId,
    delFillblank,
    resetContent,
  } = useEditor(props, emits);

  watch(
    () => props.changeEdiotorCount,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        setContent(props.content);
      }
    }
  );

  function getItemName() {
    return props.index;
  }

  defineExpose({
    initTiny,
    destroyTiny,
    getContent,
    getText,
    insertContent,
    setContent,
    delFillblank,
    getItemName,
    resetContent,
  });
</script>

<style lang="less" scoped>
  @import '../../../public/static/tinymce/skins/ui/oxide/content.min.css';
  @import '../../../public/static/tinymce/skins/content/default/content.min.css';
  @import '../../../public/static/tinymce/plugins/becodesample/highlight.css';

  .outline-box {
    padding: 5px;
    border: 1px solid #dcdcdc;
    margin: 6px 10px;
    box-sizing: border-box;
    background: #fff;
  }

  .doc-cnt {
    background: #fff;
    min-height: 50px;
    /* prettier-ignore */
    max-height: calc(100 - 80PX);
    overflow: auto;
    font-size: 20px;
    box-sizing: border-box;
    padding: 3px;
    color:#000;
  }

  .doc-cnt:focus {
    outline: 0;
  }

  .doc-cnt p {
    text-indent: 0;
  }
</style>
