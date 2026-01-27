(function(){

    var functionObj = {

        //将指定的对象中key，value，赋予到当前的对象中，当前对象必须要有对应的key 
        tkSetValue:function(newObj){
            for (const key in this) {
                if(newObj && newObj[key]) {
                    this[key] = newObj[key];
                }
            }
        }
    }


    var extend = function(org,target){
        for(var item in target){
            if(!org.prototype[item]){
                org.prototype[item] = target[item];
            }
        }
        return this;
    }

    extend(Object,functionObj);

}
)()

