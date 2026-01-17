import { getTkUrlQueryData, setAppQueryData } from "@/store/tkStore";

export function tkTransferParamsData(location, data) {
  let cacheData = getTkUrlQueryData(location);
  if (data) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        cacheData[key] = data[key];
      }
    }
    setAppQueryData({ location, data: cacheData });
  }
  return cacheData;
}

// 更新字段值
export function tkUpdateSessionUrlQueryData(seesionKey, field, value, ObjectKey) {
  const seesionData = getTkUrlQueryData(seesionKey);
  if (ObjectKey) {
    // 更新对象的字段
    seesionData[field][ObjectKey] = value;
  } else {
    // 更新对象的字段
    seesionData[field] = value;
  }
  setAppQueryData({ seesionKey, data: seesionData });
}
