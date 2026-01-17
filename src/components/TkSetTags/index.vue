<template>
  <tk-dialog :dlgObj="dlgData">
    <div class="tag-box-content" v-if="tagList.length">
      <tk-tag
        :tagData="tagList"
        :isView="true"
        v-model:selTags="selTags"
        v-model:selTagNames="selTagNames"
      ></tk-tag>
    </div>

    <div v-else class="empty">
      <svg-icon class-name="ic_no_data" icon-class="ic_no_data" />
      <div class="empty_title">暂无标签，请先去配置标签！</div>
    </div>
  </tk-dialog>
</template>

<script setup>
import TkTag from "./TkTag.vue";
import { ref, reactive } from "vue";

const props = defineProps({
    dlgData: { type: Object },
    succ: { type: Function },
  }),
  actData = reactive(tkTransferParamsData("/activity/activityDetail"));
let tagList = ref([]),
  selTags = ref([]),
  selTagNames = [];
function getTags() {
  tkReq()
    .path("getTagsList")
    .param({
      expand: "Item",
      sourceType: "0"+actData.type,
      optionType: "all",
      bizId: actData.id || actData.actid,
      subjectId: actData.subjectId,
    })
    .succ((res) => {
      tagList.value = res?.ret ?? [];
    })
    .send();
}
// 提交
props.dlgData.handlerConfirm = () => {
  if (!tagList.value.length) {
    props.dlgData.closeDlg();
    return;
  }
  // if (!selTags.value || selTags.value.length <= 0) {
  //   tkMessage.err("请选择标签");
  //   return;
  // }
  let delLabelIds = tagList.value?.filter(_t => !selTags.value.includes(_t.id))?.map(_t => _t.id)?.join(',')??''
  tkReq()
    .path("changeTagOfQst")
    .param({
      // ids: selTags.value.join(","),
      addLabelIds: selTags.value.join(","),
      delLabelIds,
      // name: selTagNames.join(","),
      expand: "Item",
      sourceType: "0"+actData.type,
      // optionType: "moveIn",
      dataIds: props.dlgData.tblSelIds,
      bizId: actData.id || actData.actid,
      subjectId: actData.subjectId,
    })
    .succ(() => {
      tkMessage.succ("设置成功");
      props.dlgData.closeDlg();
      if (props.succ && props.succ instanceof Function) {
        props.succ();
      }
    })
    .send();
};
// 打开弹框 触发的回调
props.dlgData.open = () => {
  if (props.dlgData?.tags ?? "") {
    selTags.value = props.dlgData.tags.map((_c) => _c.id);
    selTagNames.value = props.dlgData.tags.map((_c) => _c.name);
  }
  getTags();
};
</script>

<style lang="less" scoped>
.tag-box-content {
  min-height: 150px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  .ic_no_data {
    width: 80px;
    height: 80px;
  }
}
</style>
