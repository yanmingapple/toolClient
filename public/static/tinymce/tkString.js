(function(){

    var functionObj = {

        //转日期对象
        tkDate:function(){
            let value = this.toString();
            if(value){
             if(isNaN(Number(value,10)))
                 return  new Date(Date.parse(value.replace(/-/g, "/")));
             
             return new Date(Number.parseFloat(value));
            }
            
            return null;
        },
        //转日期格式化，可指定格式
        //月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
        tkDateStringFormart:function(formart){
            return this.tkDate().format(formart||"yyyy-MM-dd HH:mm:ss");
        },
        //截取字符串，多出的以...显示
        tkCutstr:function(len) {
            let value = this.toString();
            var temp;
            var icount = 0;
            var patrn = /[^\x00-\xff]/;
            var strre = "";
            for (var i = 0; i < value.length; i++) {
                if (icount < len - 1) {
                    temp = value.substr(i, 1);
                    if (patrn.exec(temp) == null) {
                        icount = icount + 1
                    } else {
                        icount = icount + 2
                    }
                    strre += temp
                } else {
                    break
                }
            }
            return strre + "..."
        },
        //转码
        tkEnCode:function(str){
            if(str){
                return unescape(encodeURIComponent(str));
            }
            return unescape(encodeURIComponent(this.toString()));
        },
        //解码
        tkDecode:function(str){
            if(str){
                return decodeURIComponent(escape(str));
            }
            return decodeURIComponent(escape(this.toString()));
        },
        //转base64
        tkEncodeBase64:function(){
            return window.btoa(this.tkEnCode());
        },
        //base64解码
        tkDecodeBase64:function(){
            return this.tkDecode(window.atob(this.toString()));
        }
    }


    var extend = function(org,target){
        for(var item in target){
            org.prototype[item] = target[item];
        }
    }

    extend(String,functionObj);

}
)()
