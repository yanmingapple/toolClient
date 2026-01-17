(function(){

    //日期处理
    var dateFunction = {
        format : function (fmt) {
            var o = {         
                "M+" : this.getMonth()+1, //月份         
                "d+" : this.getDate(), //日         
                "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
                "H+" : this.getHours(), //小时         
                "m+" : this.getMinutes(), //分         
                "s+" : this.getSeconds(), //秒         
                "q+" : Math.floor((this.getMonth()+3)/3), //季度         
                "S" : this.getMilliseconds() //毫秒         
                };         
                var week = {         
                "0" : "/u65e5",         
                "1" : "/u4e00",         
                "2" : "/u4e8c",         
                "3" : "/u4e09",         
                "4" : "/u56db",         
                "5" : "/u4e94",         
                "6" : "/u516d"        
                };         
                if(/(y+)/.test(fmt)){         
                    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
                }         
                if(/(E+)/.test(fmt)){         
                    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
                }         
                for(var k in o){         
                    if(new RegExp("("+ k +")").test(fmt)){         
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
                    }         
                }         
                return fmt;
            },
        addYear: function(addYear){
            this.setYear(this.getYear() + addYear);
            return this;
        },
        addMonth: function(addMonth){
            this.setMonth(this.getMonth() + addMonth);
            return this;
        },
        addDay:function(addDay){
            this.setDate(this.getDate() + addDay);
            return this;
        }
    }


    var extend = function(org,target){
        for(var item in target){
            org.prototype[item] = target[item];
        }

        //额外做一个方法便于取当前时间
        org.nowF = (f="yyyy-MM-dd HH:mm:ss")=>{
            return new Date().format(f)
        }

        org.nowTime = ()=>{
            return new Date().getTime()
        }
    }

    extend(Date,dateFunction);
}
)()