(function(){

  //数组处理
  var ArrayFunction = {
    groupBy(key) {
      return this.reduce((result, currentValue) => {
        // 如果结果对象中还没有当前key对应的组，则创建一个新组
        if (!result[currentValue[key]]) {
          result[currentValue[key]] = [];
        }
        // 将当前元素添加到其对应的组中
        result[currentValue[key]].push(currentValue);
        return result;
      }, {});
    },
    //组合一个新的下拉框数组
    buildSelectList(label, value, ...otherPro) {
      if (this.length > 0) {
        return this.map((el) => {
          let data = { label: el[label], value: el[value] };
          otherPro.forEach(item=>{
            data[item] = el[item];
          })
          return data;
        });
      }
      return [];
    },
  }


  var extend = function(org,target){
      for(var item in target){
          org.prototype[item] = target[item];
      }
  }

  extend(Array,ArrayFunction);
}
)()