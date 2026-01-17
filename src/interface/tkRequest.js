
const TkRequest = {
      //获取所有科目的数据
      getSubjectAboutData: (params={},callBackFun = ()=>{})=>{
        if(!params.otherData){
          params.otherData = "subjectItemType,subjectItemTypeAttr";
        }
        tkReq().path("getSubjectAboutData")
        .param(params)
        .succ((res) => {
          const { ret = [] } = res;
          const { subjects = [] } = ret;
          subjects.forEach(el=>{
            if(el.subjectItemTypes && el.subjectItemTypes.length >0){
              el.subjectItemTypes.forEach(suEl=>{
                suEl.ruleConfig = suEl?.ruleConfig ? JSON.parse(suEl.ruleConfig) : {}
                suEl.ruleConfigDesc= suEl?.ruleConfigDesc ? JSON.parse(suEl.ruleConfigDesc) : {}
                if(suEl.childItemTypes && suEl.childItemTypes.length >0){
                  suEl.childItemTypes.forEach(subEl=>{
                    subEl.ruleConfig = subEl?.ruleConfig ? JSON.parse(subEl.ruleConfig) : {}
                    subEl.ruleConfigDesc= subEl?.ruleConfigDesc ? JSON.parse(subEl.ruleConfigDesc) : {}
                  })
                }
              })
            }
          })

          callBackFun(subjects);
        }).send();
      }

}


export default TkRequest;