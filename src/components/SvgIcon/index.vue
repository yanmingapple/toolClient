<template>
  <svg :class="svgClass" aria-hidden="true" v-bind="$attrs">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup>
import {
  computed,
} from "vue";

const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  className: {
    type: [String,Array],
    default: "",
  }
});

const svgClass = computed(() => {
  if(Array.isArray(props.className)) {
    return "svg-icon " +props.className.join(' ')
  }
  if (props.className) {
    return "svg-icon " + props.className;
  } else {
    return "svg-icon";
  }
});

const iconName = computed(() => {
  return `#icon-${props.iconClass}`;
});
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>

