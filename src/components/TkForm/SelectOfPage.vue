<template>
  <div>
    <div v-if="!itemConfig.showHtml">
      <el-select
        size="small"
        class="select-of-page"
        popper-class="subSelect"
        v-model="selectData"
        :placeholder="itemConfig.placeholder"
        :disabled="itemConfig.disabled"
        collapse-tags
        filterable
        clearable
        :multiple="itemConfig.isMultiple"
        remote
        :remote-method="remoteMethod"
      >
        <el-option
          v-if="curFirstItem"
          v-show="false"
          :key="'render_' + curFirstItem.value"
          :label="curFirstItem.label"
          :value="curFirstItem.value"
        >
        </el-option>
        <el-option v-for="item in itemConfig.options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        <el-pagination :key="'page_' + clearPageFlag" small layout="prev, pager, next" :total="pageObj.total" @current-change="handleSeleCurrentChange">
        </el-pagination>
      </el-select>
    </div>
    <div v-else>
      {{ selectData || '-' }}
    </div>
  </div>
</template>

<script setup>
  import { ref, watch , computed } from 'vue'
  const props = defineProps({
    value: { type: [Array, String], required: true },
    itemConfig: {
      type: Object,
      default: () => {
        return {}
      },
    },
    pageObj: {
      type: Object,
      default: () => {
        return { pageSize: 10, page: 1, total: 0 }
      },
    },
    clearPageFlag: { type: Number, default: 0 }
  })
  const emit = defineEmits()
  let selectData = ref(props.value)
  const curFirstItem = computed(() => {
    return this.value && this.value.length > 0 && this.itemConfig.selectedList
      ? this.itemConfig.selectedList.find((_c) => _c.value  === this.value[0])
      : undefined
  })

  watch(() => props.value,
    (newV, oldV) => {
      selectData = props.value
    }, { deep: true }
  )

  watch(selectData, (newV, oldV) => {
    emit('input', newV)
  })

  // 科目下拉分页处理
  const handleSeleCurrentChange = (page) => {
    emit('getSubjectInfo', { page })
  }
  // 远程搜索
  const remoteMethod = (query) => {
    emit('getSubjectInfo', { query, isQuery: true })
  }
</script>
<style>
.subSelect .el-select-dropdown__wrap {
  max-height: 385px;
}
</style>
