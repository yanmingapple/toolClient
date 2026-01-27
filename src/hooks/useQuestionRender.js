/**
 * 试题详情渲染
 * 2023-6-9 dj
 */
import { reactive, toRefs, watch } from "vue";
export default function () {
  let questionRenderConfig = reactive({
    data: {},
    // 设置题干内容渲染
    setStemConHtml: (no, content, isChild) => {
      let prevStr = ''
      if (isChild) {
        prevStr = no ? '(' + no + ')' : ''
      }
      return (prevStr ? `<div class="prev-con">${prevStr}</div>` : '') +
        `<div class="content-con">${content || (questionRenderConfig?.data?.itemContent??'')}</div>`
    },
    // 获取选择题选项
    getOptions: () => {
      if (questionRenderConfig?.data?.itemTypeId == 3) return []
      else return questionRenderConfig?.data?.attributeList?.filter(_a => _a.type === 'option')
    },
    // 设置题选项内容渲染
    setOptionHtml: option => {
      return `<div class="prev-con">${option.name}.</div><div class="content-con">${option.content}</div>`
    },
    // 设置答案部分渲染
    setAnswerHtml() {
      let ansStr = questionRenderConfig?.data?.itemTypeId == 3 ? questionRenderConfig?.data?.answer == 'right' ? '√' : '×' : ''
      return ansStr || questionRenderConfig?.data?.answer
    }
  });
  return {
    ...toRefs(questionRenderConfig),
  };
}
