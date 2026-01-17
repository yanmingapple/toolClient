<template>
  <div class="counter-con">
    <div class="counter-item" v-for="(item, index) in counterList" :key="index">
    <span>{{item.label}}: </span>
    <span>{{item.total}}</span>
    <span>( 汉字: {{item.cn}}，数字: {{item.num}}，其他: {{item.other}} )</span>
  </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, reactive } from 'vue';

  const props = defineProps({
    itemData: { type: Object },
  });
  // 获取 中文 数字 其他 等
  function getCountData(content) {
    let $ItemContentDom = $('<div>'+content+'</div>')
    let couter = byteTxt($ItemContentDom)
    if (!couter) return {}
    let cn = couter.cnTxtNum,
      num = couter.numTxtNum,
      other = couter.otherNum
    return {
      cn,
      num,
      other,
      total: cn + num + other
    }
  }
  // 字数统计列表
  const counterList = computed(() => {
    if (!props.itemData) return []
    let itemContent = props.itemData.content
    let itemOptions = ''
    if (props.itemData.options && props.itemData.options instanceof Array) {
      props.itemData.options.forEach(_o => {
        if (_o.type === 'option') itemOptions += _o.content
      })
    }
    if (props.itemData.childItemList && props.itemData.childItemList instanceof Array) {
      props.itemData.childItemList.forEach(_c => {
        itemContent += _c.itemContent
        if (_c.attributeList && _c.attributeList instanceof Array) {
          _c.attributeList.forEach(_o => {
            if (_o.type === 'option') itemOptions += _o.content
          })
        }
      })
    }
    return [
      {label: '题干', value: 0, ...getCountData(itemContent) },
      {label: '选项', value: 1, ...getCountData(itemOptions)},
      {label: '总计', value: 2, ...getCountData(itemContent + itemOptions)},
    ]
  })

  // 计算题干字节数
  function byteTxt($TargetDom) {
    let cnTxtNum = 0;
    let numTxtNum = 0;
    let otherNum = 0;
    let __count = tkTools.wordCount($TargetDom.text());
    let __total = function () {
      cnTxtNum += __count.cnCount;
      numTxtNum += __count.numberCount;
      otherNum += __count.charCount;
    }
    __total();
    return {
      cnTxtNum,
      numTxtNum,
      otherNum
    }
  }
</script>

<style lang="less" scoped>
.counter-item {
  display: flex;
  &>span:first-of-type {
    padding-right: 6px;
  }
  &>span:nth-of-type(2) {
    min-width: 32px;
  }
  &>span:last-of-type {
    flex: 1;
  }
}
</style>
