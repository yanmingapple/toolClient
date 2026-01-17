<template>
  <li class="timeline-item">
    <div class="timeline-item-box">
      <span class="timeline-tag">{{ props.timestamp }}</span>
      <span class="timeline-text">
        <slot></slot>
      </span>
    </div>
  </li>
</template>

<script setup>
const props = defineProps({
  timestamp: String,
});
</script>

<style lang="less" scoped>
.timeline-item {
  .timeline-item-box {
    display: flex;
    .timeline-tag {
      margin-right: 20px;
      position: relative;
      padding: 4px 0;
      &::after {
        content: "";
        position: absolute;
        display: block;
        right: -10px;
        height: 100%;
        border-left: 1px solid #eee;
        top: 0;
        z-index: 1;
      }

      &::before {
        content: "";
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: rgba(64, 158, 255);
        border: 1px solid rgba(64, 158, 255);
        border-radius: 50%;
        right: -14px;
        top: calc(50% - 4px);
        z-index: 2;
      }
    }
    .timeline-text {
      padding: 4px 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }
  &:first-of-type {
    .timeline-item-box {
      .timeline-tag {
        &::after {
          height: 50%;
          top: 50%;
        }
      }
    }
  }
  &:last-of-type {
    .timeline-item-box {
      .timeline-tag {
        &::after {
          height: 50%;
        }
      }
    }
  }
}
</style>
