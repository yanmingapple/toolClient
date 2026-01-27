<template>
  <tk-dialog :dlgObj="editorDlg">
    <tk-form ref="formRef" :searchFormObj="editorForm"> </tk-form>
  </tk-dialog>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";

const formRef = ref(),
  project = ref({}),
  subjects = ref([]),
  editRowId = ref(),
  originalDateRange = ref(null); // 保存编辑状态下的原始起止时间范围

let callBack = null;

//编辑表格弹出框
const editorDlg = reactive(useDlg());
editorDlg.width = "50rem";
editorDlg.handlerConfirm = () => {
  formRef.value.submitForm((valid) => {
    if (valid) {
      let param = {
        name: editorForm.formData.name,
        startTime: editorForm.formData.dateRange[0] + " 00:00:00",
        abortTime: editorForm.formData.dateRange[1] + " 23:59:59",
        projectId: project.value.id,
        subject: editorForm.formData.subject,
        description: editorForm.formData.description,
        type: editorForm.formData.type,
      };

      if (editorForm.formData.id) {
        param.id = editorForm.formData.id;
      }

      tkReq()
        .path("ApiEditActivity")
        .param(param)
        .succ((res) => {
          tkMessage.succ(`活动${editorForm.formData.id ? "修改" : "新建"}成功!`);
          editorDlg.closeDlg();
          callBack();
        })
        .send();
    } else {
      return false;
    }
  });
};

const initEditorData = {
  id: "",
  projectName: "",
  name: "",
  type: "",
  activityOpter: "",
  projectId: "",
  dateRange: "",
  subject: [],
  description: "",
};
const editorForm = reactive(useForm());
editorForm.showWordLimit = false;
editorForm.labelWidth = "8rem";
editorForm.initFormData = initEditorData;
editorForm.setFormData(initEditorData);

const A_DAY_SECOND = 86400000;

const originFormConfigList = [
    {
    label: tkGlobalData().value.subName,
    prop: "subject",
    filterable: true,
    type: "select",
    placeholder: "请选择" + tkGlobalData().value.subName,
    isMultiple: false,
    options: subjects.value,
  },
    {
    label: "命题模式",
    filterable: true,
    prop: "type",
    type: "select",
    placeholder: "请选择命题模式",
    options: tkEnumData.ACTTYPE_LIST,
  },
  {
    label: "活动名称",
    prop: "name",
    type: "input",
    placeholder: "请输入活动名称",
  },

  {
    label: "起止时间",
    prop: "dateRange",
    type: "datePicker",
    dateType: "daterange",
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    shortcuts: [
      {
        text: "一周",
        value: () => {
          const end = new Date();
          const start = new Date();
          end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
          return [start, end];
        },
      },
      {
        text: "二周",
        value: () => {
          const end = new Date();
          const start = new Date();
          end.setTime(start.getTime() + 3600 * 1000 * 24 * 14);
          return [start, end];
        },
      },
      {
        text: "三周",
        value: () => {
          const end = new Date();
          const start = new Date();
          end.setTime(start.getTime() + 3600 * 1000 * 24 * 24);
          return [start, end];
        },
      },
      {
        text: "半个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          end.setTime(start.getTime() + 3600 * 1000 * 24 * 15);
          return [start, end];
        },
      },
      {
        text: "一个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
          return [start, end];
        },
      },
    ],
    disabledDate: (time) => {
      // 如果是编辑状态且有原始起止时间范围，只能选择在该范围内的日期（包括边界）

      if (editRowId.value && originalDateRange.value) {

        const [originalStart, originalEnd] = originalDateRange.value;
        // 将日期字符串转换为当天的 00:00:00 本地时间进行比较
        const formatDateToStartOfDay = (dateStr) => {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        };
        // 确保 time 是 Date 对象，并设置为当天的 00:00:00
        const timeDate = time instanceof Date ? time : new Date(time);
        const timeValue = new Date(timeDate).setHours(0, 0, 0, 0);
        const startTime = formatDateToStartOfDay(originalStart);
        const endTime = formatDateToStartOfDay(originalEnd);
        // 禁用范围外的日期，允许选择范围内的日期（包括边界）
        return timeValue < startTime || timeValue > endTime;
      }

      // 非编辑状态的原有逻辑
      if (editorForm.formData.abortTimeString)
        return (
          time.getTime() > new Date(editorForm.formData.abortTimeString).getTime() ||
          time.getTime() + A_DAY_SECOND <= Date.now()
        );
      else return time.getTime() + A_DAY_SECOND <= Date.now();
    },
  },
  {
    label: "备注信息",
    prop: "description",
    type: "textarea",
    placeholder: "请输入备注信息",
  },
];

editorForm.formConfig = computed(() => {
  // 4 ：制卷不显示科目属性
  if (editorForm.formData.type == 4) {
    // 重置
    editorForm.formData.subject = "";
    const list = originFormConfigList.filter((ele) => ele.prop !== "subject");
    // 设置活动类型的 disabled 状态
    return list.map((ele) => {
      if (ele.prop === "type") {
        return { ...ele, disabled: !!editRowId.value };
      }
      return ele;
    });
  }
  const list = originFormConfigList.map((ele) => {
    if (ele.prop === "subject") {
      ele.options = subjects.value;
      // 设置科目的 disabled 状态
      ele.disabled = !!editRowId.value;
    }
    if (ele.prop === "type") {
      // 设置活动类型的 disabled 状态
      ele.disabled = !!editRowId.value;
    }
    return ele;
  });
  return list;
});

editorForm.rules = {
  name: [{ required: true, trigger: "blur", message: "请输入活动名称" }],
  type: [{ required: true, trigger: "change", message: "请选择命题模式" }],
  dateRange: [{ required: true, trigger: "blur", message: "请选择起止日期" }],
  subject: [
    {
      required: true,
      trigger: "change",
      message: "请选择" + tkGlobalData().value.subName,
    },
  ],
  description: [{ min: 0, max: 200, message: "长度在 0 到 200 个字符", trigger: "blur" }],
};

// 提交
function doSubmit(done, editorConfig) {
  formRef.value.submitForm(async (valid) => {
    if (valid) {
      const param = Object.assign({}, editorForm.formData);
      if (param.subjectConfig && param.subjectConfig instanceof Array) {
        param.subjectConfig = JSON.stringify(param.subjectConfig);
      }

      param.editorConfig = editorConfig;
      console.log("🚀 ~ formRef.value.submitForm ~ param:", param);

      done(param);
      return true;
    } else {
      return false;
    }
  });
}
// --------------------- 生命周期 ----------------------

// 启动组件
function doComInit({ subjectList, projectData, callbackMethod, AssignmentFormData }) {


  editorForm.resetFormData();
  subjects.value = subjectList;
  project.value = projectData;
  callBack = callbackMethod;

  const projectStartTime =
    typeof projectData.startTime === "number"
      ? new Date(projectData.startTime)?.format("yyyy-MM-dd")
      : projectData.startTime?.tkDateStringFormart("yyyy-MM-dd");

  const projectAbortTime =
    typeof projectData.abortTime === "number"
      ? new Date(projectData.abortTime)?.format("yyyy-MM-dd")
      : projectData.abortTime?.tkDateStringFormart("yyyy-MM-dd");

  if (AssignmentFormData) {
    editRowId.value = AssignmentFormData.id;
    editorForm.setEditData(AssignmentFormData);

    // 获取活动的原始起止时间（如果存在），否则使用项目的起止时间
    let activityStartTime = projectStartTime;
    let activityAbortTime = projectAbortTime;

    if (AssignmentFormData.startTime) {
      activityStartTime =
        typeof AssignmentFormData.startTime === "number"
          ? new Date(AssignmentFormData.startTime)?.format("yyyy-MM-dd")
          : AssignmentFormData.startTime?.tkDateStringFormart("yyyy-MM-dd");
    }

    if (AssignmentFormData.abortTime) {
      activityAbortTime =
        typeof AssignmentFormData.abortTime === "number"
          ? new Date(AssignmentFormData.abortTime)?.format("yyyy-MM-dd")
          : AssignmentFormData.abortTime?.tkDateStringFormart("yyyy-MM-dd");
    }

    editorForm.formData.dateRange = [activityStartTime, activityAbortTime];
    // 保存原始起止时间范围，用于限制日期选择
    originalDateRange.value = [projectStartTime, projectAbortTime];

    editorDlg.openDlg(`编辑活动`);
  } else {
    editRowId.value = "";
    originalDateRange.value = null; // 新建状态时清空原始范围
    editorForm.formData.type = tkEnumData.ACTTYPE_LIST[0].value;
    editorForm.formData.name = tkEnumData.ACTTYPE_LIST[0].label + "活动";
    editorForm.formData.dateRange = [projectStartTime, projectAbortTime];
    editorForm.formData.subject = subjectList[0]?.value ?? "";
    editorDlg.openDlg(`新建活动`);
  }
}

defineExpose({ doComInit, doSubmit });
</script>

<style lang="less" scoped>
.project {
  padding: 0 6px;
}
</style>
