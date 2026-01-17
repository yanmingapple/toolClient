import { reactive, ref, toRefs } from "vue";

export default function () {
  let tblBtn = reactive({
    title: "",
    selectedList: [],
    path: "",
    column: [],
    searchKey: "",
  });

  return {
    ...toRefs(tblBtn),
  };
}
