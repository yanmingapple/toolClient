import tkPageParams from "@/global/tkPageParams";
// import router from '@/router'

export default function (tbl, formData, ownResetHandler) {

  /**
   * @description 回填搜索表格参数
   * @name __enCnt
   * @param reqParam {searchData: {}, currentPage: 1, pageSize: 10}
   * formData 目标回填的表单数据
   * pageObj 目标回填的表格分页数据
   **/
  function setReqParam() {
    // if (!tbl || !tbl.catchName) return
    let reqParam = tkPageParams(router.currentRoute.value.path)[tbl.catchName]
    if (!tbl || !tbl.catchName || (tbl.unsetSearch && tbl.unsetSearch instanceof Function && tbl.unsetSearch(reqParam))) return
    // 回填搜索参数
    if (reqParam && reqParam.searchData && formData) {
      let searchData = {...reqParam.searchData,...reqParam.otherData}
      for (const key in formData) {
        if (formData[key] instanceof Array && (searchData[key] && searchData[key].length > 0)) {
          if (typeof searchData[key] == 'string') {
            formData[key] = searchData[key].split(',')
          } else if (searchData[key] instanceof Array) {
            formData[key] = searchData[key]
          }
        } else if (typeof formData[key] == 'string' && (searchData[key] || searchData[key] == 0)) {
          formData[key] = searchData[key]
        }
      }
      if(ownResetHandler && typeof ownResetHandler == 'function') ownResetHandler(searchData)
    }

    // 回填表格分页
    if (tbl.pageObj) {
      if (reqParam && reqParam.currentPage) tbl.pageObj.currentPage = reqParam.currentPage
      if (reqParam && reqParam.pageSize) tbl.pageObj.pageSize = reqParam.pageSize
    }
  }
  setReqParam()
  return {
    // setReqParam
  };
}
