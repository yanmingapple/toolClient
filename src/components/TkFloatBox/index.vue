<template>
  <teleport to="body">
    <div
      v-show="floatBoxObj.visible"
      ref="draggableDiv"
      :class="'float-con tk_publick_box_shadow_in tk_public_col_flex ' + className"
      :style="`left: calc(${
        floatBoxObj?.direction == 'right'
          ? '100% - ' + floatBoxObj.width
          : floatBoxObj?.direction == 'center'
          ? '50% - ' + boxHalfWidth()
          : '0'
      })`"
    >
      <div
        class="header tk_public_row_flex tk_public_border_bottom tk_public_bgc_light_blue pd10"
        @mousedown="startDrag"
      >
        <div class="tk_public_itemflex1">
          {{ floatBoxObj.title || '' }}
        </div>
        <div>
          <slot name="headerRight"></slot>
          <svg-icon
            class-name="tk_public_size2 tk_public_pointer_con tk_public_font_red"
            icon-class="ic_close"
            @click.stop.prevent="floatBoxObj.cancel"
          />
        </div>
      </div>
      <div class="main pd10 tk_public_itemflex1 tk_public_overflow_auto">
        <slot></slot>
      </div>
      <div class="footer tk_public_row_flex tk_public_border_bottom">
        <div class="tk_public_itemflex1"><slot name="footerLeft"></slot></div>
        <div>
          <slot name="footerRight"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup>
  import { ref, onMounted, nextTick } from 'vue';
  const props = defineProps({
      // 弹出框数据
      floatBoxObj: {
        type: Object,
        default: {
          visible: false,
          title: '',
          width: '600px',
        },
      },
      className: { type: String, default: '' },
      cachePosition: { type: Boolean, default: false },
    }),
    draggableDiv = ref(null);
  // 开始拖拽
  function startDrag(event) {
    // 初始化偏移值和拖拽状态
    let isDragging = false,
      offsetX = event.clientX - draggableDiv.value.getBoundingClientRect().left,
      offsetY = event.clientY - draggableDiv.value.getBoundingClientRect().top;
    // 处理移动事件的函数
    const moveHandler = e => {
      if (!isDragging) return;
      // 计算新的位置
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (x >= 0 && x + draggableDiv.value.clientWidth <= viewportWidth) {
        draggableDiv.value.style.left = `${x}px`;
      }
      if (y >= 0 && y + draggableDiv.value.clientHeight <= viewportHeight) {
        draggableDiv.value.style.top = `${y}px`;
      }
    };
    // 处理鼠标松开事件的函数
    const upHandler = () => {
      isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    isDragging = true;
    // 监听移动和松开事件
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }
  function boxHalfWidth() {
    let widthNum = 0,
      suffix = '%';
    if (props.floatBoxObj.width.indexOf('px') >= 0) {
      widthNum = props.floatBoxObj.width.replace('px', '');
      suffix = 'px';
    } else {
      widthNum = props.floatBoxObj.width.replace('%', '');
    }
    return widthNum / 2 + suffix;
  }
  props.floatBoxObj.open = function () {
    if (!props.cachePosition) {
      draggableDiv.value.style.top = 0;
      if (props.floatBoxObj?.direction == 'right') {
        draggableDiv.value.style.left = `calc(100% - ${props.floatBoxObj.width})`;
      } else {
        draggableDiv.value.style.left = 0;
      }
    }
  };
  onMounted(() => {});
</script>
<style scoped lang="less">
  .float-con {
    position: absolute;
    z-index: 999999;
    background: #fff;
    width: v-bind('floatBoxObj.width');
    max-height: 100%;
    top: 0;
    .header {
      cursor: move;
      user-select: none;
      // background: #ddd; // linear-gradient(to bottom, #ddd, transparent);
    }
    .main {
    }
    .footer {
    }
  }
</style>
