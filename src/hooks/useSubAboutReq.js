import { ref, reactive, toRefs, watch } from 'vue'
export default function() {
  // 获取科目下拉列表
  const getSubjects = (succ) => {
    tkReq()
      .path("getSubjects")
      .param()
      .noLoading()
      .succ((res) => {
        const { ret = {} } = res;
        const { subjects = [] } = ret;
        if (!subjects || !subjects.length) return;
        let subjectList = subjects.map((_c) => {
          return { label: _c.name, value: _c.id, basisFlag: _c.basisFlag }
        })
        succ(subjectList)
      })
      .send();
  }

  // 获取科目考察依据是知识模型还是知识点
  function getKnowTypeReq(param, succ) {
    tkReq()
      .path('hasKnowModelOfSubject')
      .param(param)
      .noLoading()
      .succ((res)=>{
        succ(res.ret)
      }).send()
  }

  // 获取科目题型
  function getItemTypes(param, succ) {
    tkReq()
      .path("getItemTypes")
      .param(param)
      .noLoading()
      .succ((res) => {
        if (res && res.ret && res.ret instanceof Array) {
          succ(res.ret.buildSelectList("name","subItemTypeId","id","isComposite"))
        }
      })
      .send()
  }
  // 获取科目属性
  function getMorePropsList(param, succ) {
    tkReq().path('getMorePropsList')
      .param(param)
      .noLoading()
      .succ(res => {
        if (res && res.ret && res.ret instanceof Array) {
          // let itemSearchProps = res.ret.map((_c) => { // dataType 1-单选 2-多选
          //   return { label: _c.attrName, placeholder: '请选择', prop: _c.attrCode, type: 'select', isMultiple:  _c.dataType == 2, options: _c.subitemtypeAttrDataList && (_c.subitemtypeAttrDataList instanceof Array) && _c.subitemtypeAttrDataList.map(_s => {
          //     return { label: _s.attrValue, value: _s.id}
          //   }) || [], drawer: true }
          // })
          succ(res.ret)
        }
      })
      .send()
  }

  return {
    getSubjects, // 科目
    getKnowTypeReq, // 考察依据
    getItemTypes, // 获取科目题型
    getMorePropsList, // 获取科目属性
  }
}