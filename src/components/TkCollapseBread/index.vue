<!-- 高级搜索的 折叠面板 -->
<template>
  <div class="collapse-wrap">
    <div :class="[customHeaderClass, 'senior-search-top']">
      <div class="btn">
        <span class="btn-content" @click="handleClick">
          <!-- <svg-icon class-name="ic_expand" icon-class="ic_expand" /> -->
          <span class="title-text">{{ props.titleLabel }}</span>
          <i v-if="collapse" class="el-icon-arrow-down" />
          <i v-else class="el-icon-arrow-up" />
        </span>

        <slot name="afterTitle"></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
      </div>
    </div>
    <transition name="normal-expand">
      <div v-show="collapse" class="collapse-wrap-con">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const props = defineProps({
    isCollapse: {
      type: Boolean,
      default: true,
    },
    isNotAllowClick: {
      type: Boolean,
    },
    titleLabel: String,
    customHeaderClass: String,
  });

  const collapse = ref(props.isCollapse);
  const emits = defineEmits(['update:isCollapse']);
  const handleClick = () => {
    if (props.isNotAllowClick) return;
    collapse.value = !collapse.value;
    emits('update:isCollapse', collapse.value);
  };
</script>

<style lang="less" scoped>
  .collapse-wrap {
    height: auto;
    color: #000000;
    font-size: 14px;
    width: 100%;
    background: #fff;

    .senior-search-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #d8d8d8;
      white-space: nowrap;
      flex-wrap: nowrap;
      &.unBorderBottom {
        border-bottom: none;
      }
      .btn {
        font-weight: bold;
        padding: 0 10px;
        color: #288ff7;
        text-align: center;
        cursor: pointer;
        min-width: 3rem;
        flex-shrink: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;

        .btn-content {
          display: flex;
          align-items: center;
          white-space: nowrap;
          gap: 5px;
          position: relative;
        }
        .btn-content::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 20px;
          background: #0380ff;
          margin-right: 8px;
          border-radius: 2px;
        }

        .title-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      }

      .right {
        margin-right: 10px;
        flex-shrink: 0;
        white-space: nowrap;
      }
    }

    &.unAutoSize {
      height: auto;
      color: #000000;
      font-size: 3.70417mm;
      width: 100%;
      background: #fff;

      .senior-search-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2.64583mm 0;
        border-bottom: 0.264583mm solid #d8d8d8;
        white-space: nowrap;
        flex-wrap: nowrap;
        &.unBorderBottom {
          border-bottom: none;
        }
        .btn {
          font-weight: bold;
          padding: 0 2.64583mm;
          color: #288ff7;
          text-align: center;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .btn-content {
            display: flex;
            align-items: center;
            white-space: nowrap;
            gap: 1.32292mm;
            position: relative;
          }

          .btn-content::before {
            content: '';
            display: inline-block;
            width: 1.32292mm;
            height: 5mm;
            background: #0380ff;
            margin-right: 1.6mm;
            border-radius: 0.1mm;
          }

          .title-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
        }

        .right {
          margin-right: 2.64583mm;
          flex-shrink: 0;
          white-space: nowrap;
        }
      }
      /* normal-expand对应的CSS代码：  */
      .normal-expand-enter-active,
      .normal-expand-leave-active {
        height: 10.5833mm !important;
      }

      .normal-expand-enter,
      .normal-expand-leave-to {
        height: 0mm !important;
      }

      .ic_expand {
        width: 3.175mm;
        height: 3.175mm;
        color: #0380ff;
      }
    }
  }

  /* normal-expand对应的CSS代码：  */
  .normal-expand-enter-active,
  .normal-expand-leave-active {
    height: 40px !important;
  }

  .normal-expand-enter,
  .normal-expand-leave-to {
    height: 0px !important;
  }

  .ic_expand {
    width: 12px;
    height: 12px;
    color: #0380ff;
  }
</style>
