<template>
  <div class="areabox">
    <el-select
      v-model="address.province"
      placeholder="请选择省"
      :style="{ marginRight: `${gap}px`, width: `${width}px` }"
      @change="handleProvinceSelect"
    >
      <el-option v-for="item in regionData" :label="item.name" :value="item.id" />
    </el-select>
    <el-select
      v-model="address.city"
      placeholder="请选择市"
      :disabled="!address.province || cityList.length == 0"
      :style="{ marginRight: `${gap}px`, width: `${width}px` }"
      @change="handleCitySelect"
    >
      <el-option v-for="item in cityList" :label="item.name" :value="item.id" />
    </el-select>
    <el-select
      v-model="address.area"
      placeholder="请选择区"
      :style="{ width: `${width}px` }"
      :disabled="!address.province || !address.city || areaList.length == 0"
      @change="handleAreaSelect"
    >
      <el-option v-for="item in areaList" :label="item.name" :value="item.id" />
    </el-select>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
//一级城市列表
const regionData = ref([]);
//二级城市列表
const cityList = ref([]);
//三级地区列表
const areaList = ref([]);

const props = defineProps({
  gap: {
    type: [String, Number],
    default: "8",
  }, //选择框中间间隙
  width: {
    type: [String, Number],
    default: "116",
  }, //选择框宽度
  areaRange: {
    type: Object,
    default: () => {},
  },
});

const getAreaDataReq = (pId) => {
  return new Promise((resolve, reject) => {
    tkReq()
      .path("getAreaList")
      .param({
        pId,
      })
      .succ((res) => {
        resolve(res);
      })
      .send();
  });
};

//抛出地址
const emits = defineEmits(["update:areaRange"]);

/* getAddress (data: {
        code: string[] //区域码
        name: string[] //汉字
        isComplete: boolean  //是否选择完整，方便校验
    })*/
const address = reactive({
  province: "",
  city: "",
  area: "",
});

const CodeToText = (pid, level) => {
  if (level === 1) {
    return regionData.value.find((_c) => _c.id === pid)?.name ?? "";
  } else if (level === 2) {
    return cityList.value.find((_c) => _c.id === pid)?.name ?? "";
  } else if (level === 3) {
    return areaList.value.find((_c) => _c.id === pid)?.name ?? "";
  }
  return "";
};

//切换省份函数
const handleProvinceSelect = async () => {
  const res = await getAreaDataReq(address.province);
  cityList.value = res?.ret ?? [];

  address.city = "";
  address.area = "";
  emits("update:areaRange", {
    code: [address.province], //区域码
    name: [CodeToText(address.province, 1)], //汉字
    isComplete: false,
  });
};

//切换城市函数
const handleCitySelect = async () => {
  const res = await getAreaDataReq(address.city);
  areaList.value = res?.ret ?? [];

  address.area = "";
  emits("update:areaRange", {
    code: [address.province, address.city], //区域码
    name: [CodeToText(address.province, 1), CodeToText(address.city, 2)], //汉字
    isComplete: areaList.value.length == 0 ? true : false,
  });
};

//切换地区函数
const handleAreaSelect = () => {
  emits("update:areaRange", {
    code: [address.province, address.city, address.area], //区域码
    name: [CodeToText(address.province, 1), CodeToText(address.city, 2), CodeToText(address.area, 3)], //汉字
    isComplete: true,
  });
};

// 回显
const setProvince = async (provinceCode, cityCode, areaCode) => {
  if (!provinceCode) return;
  address.province = provinceCode;
  const cityListres = await getAreaDataReq(provinceCode);
  cityList.value = cityListres?.ret ?? [];
  address.city = cityCode;

  if (!cityCode) return;
  const areaListres = await getAreaDataReq(cityCode);
  areaList.value = areaListres?.ret ?? [];
  address.area = areaCode;
};

watch(
  () => props.areaRange.code,
  (newV, oldV) => {
    console.log(newV.length);
    if (newV?.length) {
      setProvince(newV?.[0] ?? "", newV?.[1] ?? "", newV?.[2] ?? "");
    } else {
      address.province = "";
      address.city = "";
      address.area = "";
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  const res = await getAreaDataReq("-1");
  regionData.value = res?.ret ?? [];

  if (props.areaRange?.code?.length) {
    setProvince(props.areaRange.code?.[0] ?? "", props.areaRange.code?.[1] ?? "", props.areaRange.code?.[2] ?? "");
  }
});
</script>

<style lang="less" scoped>
.areabox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
