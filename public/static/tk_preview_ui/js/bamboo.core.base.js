//Basics function
bambooSnake_basic=function(){
	var basJson=this;
	/*{type-form}:-	browser(bws), element(elm), string(str), number(num), array(arr), regExp(reg), other(oth) -*/
	/*browers-START*/
	basJson.touchEvtMod={		//自定义touch表
		pc:{star:"mousedown",move:"mousemove",live:"mouseup",type:"pc"},
		mobile:{star:"touchstart",move:"touchmove",live:"touchend",type:"mobile"}
	}
	this.bws={
		//OriginalName(WebEdition)
		versionInfor:function(){	//鉴别游览器高低版本4,5 - Version info:(Windows) 
			var x=navigator,lv='';
			return parseInt(x.appVersion)<5?lv=true:lv=false;
		},
		supportCss3:function(style){ 	//查询样式是否被游览器支持 true Or false 
			var prefix=['webkit', 'Moz', 'ms', 'o'],i,humpString=[],htmlStyle=document.documentElement.style,  
			_toHumb=function(string){
				return string.replace(/-(\w)/g, function ($0, $1){
					return $1.toUpperCase();  
				});  
			};
			for(i in prefix) 
			humpString.push(_toHumb(prefix[i] + '-' + style));  
			humpString.push(_toHumb(style));
			for(i in humpString)
			if(humpString[i] in htmlStyle) return true;
			return false;  
		},
		getBrand:function(){		//判断游览器品牌
			var ib=window.navigator.userAgent,str=""; 
			if(ib.indexOf("MSIE")>=0){str="ie";}
			else if(ib.indexOf("Firefox")>=0){str="firefox";}
			else if(ib.indexOf("Chrome")>=0){str="chrome";}
			else if(ib.indexOf("Opera")>=0){str="opera";}
			else if(ib.indexOf("Safari")>=0){str="safari";}
			return str;
		},
		//OriginalName(trueFalseIE_Night)
		IEnightSupport:function(){	//IE9不支持曲线动画,特殊化处理
			var browser=navigator.appName, b_version=navigator.appVersion, version=b_version.split(";");
			if(version.length>=2){
				var trim_Version=version[1].replace(/[ ]/g,"");
				if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0"){
					return 'ie9';
				}
			};return false;
		},
		//OriginalName(windowPreprty)
		getWindowSize:function(returnNum){	//游览器尺寸预设
			var wpstr="";
			switch(returnNum){
				case "scrolltop":wpstr=document.body.scrollTop || document.documentElement.scrollTop;
				break;
				case "windWidth":wpstr=document.documentElement.clientWidth;
				break;
				case "windHeight":wpstr=document.documentElement.clientHeight;
				break;
				case "AllwindHeight":wpstr=document.body.clientHeight;
				break;
				case "ofstWid":wpstr=document.body.offsetWidth;
				break;
				case "ofstHgt":wpstr=document.body.offsetHeight;
				break;
				case "screnWid":wpstr=window.screen.width;
				break;
				case "screnHgt":wpstr=window.screen.height;
				break;
				case "innerHgt":wpstr=window.innerHeight;
				break;
			}
			return wpstr;
		},
		EquipmentLoad:function(url){	//腾讯版 web预判设备指定性跳转
			if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test
			(navigator.userAgent))){
				if(window.location.href.indexOf("?mobile")<0){
					try{
						if(/Android|Windows Phone|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
							window.location.href=url;
						}else if(/iPad/i.test(navigator.userAgent)){
						}
					}catch(e){}
				}
			}
		},
		//OriginalName(Judge_ios7)
		getIosEdition:function(){
			if((navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i))){	// 判断是否 iPhone 或者 iPod
				return Boolean(navigator.userAgent.match(/OS [7-9]_\d[_\d]* like Mac OS X/i));	// 判断系统版本号是否大于 4
			}else{return 'Not Apple products';}
		},
		//OriginalName(isMobile)
		MobileSystem:{		//系统类型判定
			Android:function(){
				return navigator.userAgent; 
			},
			BlackBerry:function(){
				return /BlackBerry/i.test(navigator.userAgent);  
			},
			iOS:function(){
				return /iPhone|iPad|iPod/i.test(navigator.userAgent);  
			},
			Windows:function(){
				return /IEMobile/i.test(navigator.userAgent);  
			},
			any:function(){
				return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());  
			}  
		},
		orientationchange:function(){	//判断横竖屏状态 (iPaid-横屏90/-90 _ 竖0/180 , Andriod-横屏0/180 _ 竖屏90/-90)
			//外部绑定 window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", funcName, false);
			if("onorientationchange" in window){		//is MobileSystem, and window hava onorientationchange
				var sys,rst;
				if(typeof(basJson.bws.getIosEdition())=='boolean'){		//is IOS
					sys='ios';
				}else{	//typeof=string is Android or other,Not IOS
					sys='android';
				}
				if(window.orientation==180||window.orientation==0){
					if(sys=='ios'){	rst='竖屏';	}else if(sys=='android'){	rst='横屏';}
				}
				if(window.orientation==90||window.orientation==-90){
					if(sys=='ios'){	rst='横屏';	}else if(sys=='android'){	rst='竖屏';}
				}
				return rst;
			}else{	return 'system nonsupport onorientationchange';}
		},
		fullScreen:{				//全屏
			launch:function(elm){	//document.documentElement 或 指定对象
				if(elm.requestFullscreen){
					elm.requestFullscreen();
				}else if(elm.mozRequestFullScreen){
					elm.mozRequestFullScreen();
				}else if(elm.webkitRequestFullscreen){
					elm.webkitRequestFullscreen();
				}else if(elm.msRequestFullscreen){
					elm.msRequestFullscreen();
				}
			},
			exit:function(){
				if(document.exitFullscreen) {
					document.exitFullscreen();
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		}
	}
	/*browers-END*/
	
	/*elm-START*/
	this.elm={
		//OriginalName(DocmSrcollTop)
		docScrollTop:function(){			//文档置顶
			userAgent=window.navigator.userAgent.toLowerCase();    //获取游览器相关的信息
			var name=navigator.appName;
			if(userAgent.indexOf("firefox")>=1 || name=="Microsoft Internet Explorer"){
				$("html").stop(true).animate({scrollTop:0},300);
			}else{
				$("body").stop(true).animate({scrollTop:0},300);
			}
		},
		//OriginalName(returnAttr)
		safeAttr:function(obj,attrName){	//直接返回目标的属性值
			if(typeof(obj.attr(attrName))!='undefined'){
				var Rszlut=obj.attr(attrName);
				return Rszlut;
			}else{
				return 'notfound';
			}
		},
		//OriginalName(bindIputFocus)
		backIputTips:function(obj,str){	//文本框文字输入的 默认提示文字控制
			obj.on({
				"focus":function(){if($(this).text()==str){$(this).text("");}},
				"blur":function(){if($(this).text()==""){	$(this).text(str);}}
			});
		},
		//OriginalName(StyleFor)
		StyleModelFor:function(obj,Element,json,ifNum,endNum){	//模组规则样式控制
			if(obj.length>0){
				obj.each(function(x,elm){
					var CultureLi = obj.eq(x).find(Element).length;
					for(var i=0;i<CultureLi;i++){
						if(i%ifNum==endNum){
							var cgElm=obj.eq(x).find(Element).eq(i);
							for(var attr in json){
								if(attr == 'opacity'){                          
								   cgElm.css("filter",'alpha(opacity:'+json[attr]+')'); 
								   cgElm.css("opacity",json[attr]/100);                              
								}else{
								   cgElm.css(attr,json[attr]);
								}
							}
						}
					}
				});
			}
		},
		//OriginalName(ObtainSize)
		getObjSize:function(objC,type){	//万能元素尺寸获取
			var osize=0,
				obj=objC;
			if(type==1){
				osize=obj.width()+parseInt(obj.css("padding-left"))+parseInt(obj.css("padding-right"))+parseInt(obj.css("margin-left"))+parseInt(obj.css("margin-right"))+parseInt(obj.css("border-left-width"))+parseInt(obj.css("border-right-width"));
			}else if(type==2){
				osize=obj.height()+parseInt(obj.css("padding-top"))+parseInt(obj.css("padding-bottom"))+parseInt(obj.css("margin-top"))+parseInt(obj.css("margin-bottom"))+parseInt(obj.css("border-top-width"))+parseInt(obj.css("border-bottom-width"));
			}else if(type==3){
				osize=parseInt(obj.css("padding-left"))+parseInt(obj.css("padding-right"))+parseInt(obj.css("margin-left"))+parseInt(obj.css("margin-right"))+parseInt(obj.css("border-left-width"))+parseInt(obj.css("border-right-width"));
			}else if(type==4){
				osize=parseInt(obj.css("padding-top"))+parseInt(obj.css("padding-bottom"))+parseInt(obj.css("margin-top"))+parseInt(obj.css("margin-bottom"))+parseInt(obj.css("border-top-width"))+parseInt(obj.css("border-bottom-width"));
			}else if(type==5){
				osize=parseInt(obj.css("padding-left"))+parseInt(obj.css("padding-right"))+parseInt(obj.css("border-left-width"))+parseInt(obj.css("border-right-width"));
			}else if(type==6){
				osize=parseInt(obj.css("padding-top"))+parseInt(obj.css("padding-bottom"))+parseInt(obj.css("border-top-width"))+parseInt(obj.css("border-bottom-width"));
			}
			return osize;
		},
		//OriginalName(voteLiSortNumColr)
		universalDataConfig:function(obj,son,array,fn){		//万用对象数据配置器
			var prot=array,		//['48D785','1BBC9B','3598DB','7f8d8e','f5675d','f39c11','eddc49','72cb6f','5fbdb7','6984e4'],
				mir=[],
				set="";
			pus();
			$(obj).find(son).each(function(i,elm){
				if(mir.length==0){
					pus();
				}
				var eq=Math.floor(Math.random()*mir.length+0);
				set=mir[eq];
				mir.splice(eq,1);
				if(typeof(fn)=='function'){
					fn($(this),i,set);
				}
			});
			function pus(){
				for(var i=0;i<prot.length;i++){
					mir.push(prot[i]);
				}
			}
		},
		//OriginalName(forWriteStyle)
		forWriteStyle:function(obj,json,fn){	//json样式赋予
			for(var attr in json){
				if(attr=='opacity'){                          
				   obj.css("filter",'alpha(opacity:'+json[attr]+')'); 
				   obj.css("opacity",json[attr]/100);                              
				}else{
				   obj.css(attr,json[attr]);
				}
				/*
				else if(attr=='color' || attr=='background' || attr=='transition' || attr=='transform' || attr=='border'){
				   obj.css(attr,json[attr]);
				}else{
				   obj.css(attr,json[attr]+'px');
				}*/
				if(typeof(fn)=='function'){
					fn(attr,json);
				}
			}
		}
	}
	/*elm-END*/
	
	/*string-START*/
	this.str={
		//OriginalName(arraySplitVar)
		arraySplitVar:function(igt,spltArr){	//字符中链接符转换
			var str='',rlt=null;
			if(igt!==''){
				if(igt.indexOf(spltArr[0])!==-1){
					rlt=igt.split(spltArr[0]);
					for(var i=0;i<rlt.length;i++){str+=rlt[i]+spltArr[1];}
				}else{str=igt;}
			}return str;
		},
		getArgsFromHref:function(sHref,sArgName){	//base use location.Href source
			var args=sHref.split("?"),
			retval="";
			if(args[0]==sHref){
				return retval;
			} 
			var str=args[1];
			args=str.split("&");
			for(var i=0;i<args.length;i++){
				str=args[i];
				var arg=str.split("=");
				if(arg.length <= 1) continue;
				if(arg[0]==sArgName) retval=arg[1];
			}
			return retval;
		},
		urlParma:function(){						//url地址写入或修改
			var obj={
				beforUrl:'',						//执行后的url前半html地址
				url:'please, importURLstring',		//请导入url字符串
				urlCut:'?',							//分割url地址与参数的符号
				split:'&',							//url中各属性值的分割 有的是&或&&
				equal:'=',							//url中某key=val的等号
				get:function(){
					var url=obj.url,
						nUrl=url.substring(url.indexOf(obj.urlCut)+1),
						ara=nUrl.split(obj.split),arb=[];
					obj.beforUrl=url.split(obj.urlCut)[0];
					for(var i=0;i<ara.length;i++){
						arb.push(ara[i].split(obj.equal));
					}return obj.zJson(arb);
				},
				zJson:function(arr){		//数组转换json
					var o={};
					for(var i=0;i<arr.length;i++){o[arr[i][0]]=arr[i][1];}
					return o;
				},
				zString:function(json){		//json转换url格式
					var str='';
					for(i in json){str+=i+obj.equal+json[i]+obj.split;}
					return str.substring(0,str.length-1);
				},
				returnURL:function(key,val){//返回完整url  新增or修改or读值
					var get=obj.get(),equ=0;
					for(i in get){
						if(i==key){
							if(val!==undefined){
								equ++;
								get[i]=val;
							}else if(val==undefined){
								return get[i];
							}
						}
					}
					if(equ==0){//设置的值不存在，识别为写入，而非修改
						get[key]=val;
					}
					return obj.beforUrl+obj.urlCut+obj.zString(get);
				},
				ini:function(){
					obj.beforUrl=obj.url.split(obj.urlCut)[0];
				}
			}
			return obj;
		},
		uuid:function(){		//永久不重复生成
			var s = [], hexDigits = "0123456789abcdef";
		    for(var i = 0; i < 36; i++) {
		        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		    }
		    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		    s[8] = s[13] = s[18] = s[23] = "-";		 
		    var uuid = s.join("");
		    return uuid;
		},
		getNowFormatDate:function(){	//流水号-年月日时分秒 例:20170818162709
		    var date=new Date(),
		        month=toZero(date.getMonth()+1),
		        strDate=toZero(date.getDate()),
		        hours=toZero(date.getHours()),
		        minutes=toZero(date.getMinutes()),
		        seconds=toZero(date.getSeconds());
		    function toZero(numb){
		        if(numb>=0 && numb<=9){numb="0"+numb;}
		        return numb;
		    }
		    return date.getFullYear()+month+strDate+hours+minutes+seconds;
		},
		reqSsnCreat:function(len){		//数字+字母混组 例:1u8h9x
			//ascii码转换参照 str="A"; str.charCodeAt();  String.fromCharCode(65);
		    var rst='';
		    for(var i=0;i<len;i++){
		        var randm='';
		        if(i%2){randm=String.fromCharCode(getRandomNum(65,90));}else{randm=getRandomNum(0,9);}
		        rst+=randm;
		    }
		    function getRandomNum(Min,Max){
			    var Range=Max-Min, Rand=Math.random(); 
			    return(Min+Math.round(Rand*Range)); 
			}
		    return rst;
		},
		allCaps:function(text,fn,fnb){         //监测大写
            for(var i=0;i<text.length;i++){
                var c=text.charAt(i);
                if(c<"A"||c>"Z"){	//小写
                    if(typeof(fnb)=='function'){fnb();}
                }else{				//是大写
                	if(typeof(fn)=='function'){fn();}
                }
            }
        },
        isJson:function(data,fn){	//是否json对象
        	if(typeof(data)=="object" && Object.prototype.toString.call(data).toLowerCase()=="[object object]" && !data.length){
        		if(typeof(fn)=="function"){fn();}
        		return true;
        	}
        },
        jsonCropy:function(a,b){		//合并json对象
        	for(i in a){
		    	for(n in b){
		    		if(i==n){
		    			if((typeof(a[i]) == "object" && Object.prototype.toString.call(a[i]).toLowerCase() == "[object object]" && !a[i].length)&&(typeof(b[n]) == "object" && Object.prototype.toString.call(b[n]).toLowerCase() == "[object object]" && !b[n].length)){
		    				this.jsonCropy(a[i],b[n]);
		    			}else{b[n]=a[i];}
		    		}
		    	}
		    };return b;
        }
	}
	/*string-END*/	
	
	/*number-START*/
	this.num={
		parseFloatSet:function(num,fixed){		//如果值是小数，进行约制
			if(!isNaN(num)){
				if((num+'').indexOf('.')>-1){num=parseFloat(num).toFixed(fixed);}
			}
			return num;
		},
		GetRandomNum:function(Min,Max){ 	//指定范围随机数
			var Range = Max - Min,Rand = Math.random(); 
			return(Min + Math.round(Rand * Range)); 
		}
	}
	/*number-END*/
	
	/*array-START*/
	this.arr={
		//OriginalName(arryCop)
		simpleCopy:function(startArr,itgArr){	//浅拷贝
			for(var i=0;i<startArr.length;i++){
				itgArr.push(startArr[i]);
			}
		}
	}
	/*array-END*/
	
	/*regExp-START*/
	this.reg={
		regExpDelstr:function(iStr){	//regExp 开或尾是空格 str.replace(regExpDelstr('xx'),'')
			var	reg=new RegExp('(\\s|^)' + iStr + '(\\s|$)');return reg;
		}
	}
	/*regExp-END*/
	
	/*Other-START*/
	this.oth={
		jQAjax:function(asyStr,datatypes,urls,succefn){	//jQurey Ajax
			$.ajax({
				async:asyStr,
				dataType:datatypes,
				url:urls,
				success:function(rzt){
					if(succefn!==null){succefn(rzt);}
				},error:function(XMLHttpRequest,textStatus,errorThrown){
					return XMLHttpRequest+'-'+textStatus+'-'+errorThrown;
				}
			});
		},
		isImgLoad:function(img,data,callback){	//判断图片是否加载完毕
			clearInterval(data.time);
			data.time=setInterval(function(){
				if(!!window.ActiveXObject){		//IE
					if(img.readyState=='complete'){
						clearInterval(data.time);
						callback(data);
					}
				}else{	// 非IE
					if(img.complete){
						clearInterval(data.time);
						callback(data);
					}
				}
			}, 100);
		},
		loadFuc:function(urls,compFn,nofn,fn){	//判断图片载入情况	
			var url=urls,
				img=new Image();
			img.src=urls;
			if(img.complete){
				if(typeof(compFn)=='function'){compFn();}
			}else{
				if(typeof(nofn)=='function'){nofn();}
				img.onload = function() {
					if(typeof(fn)=='function'){fn();}
				}
			}
		},
		//OriginalName(basicCpEventJson)
		touchEvtMod:this.touchEvtMod,
		//OriginalName(reloadAbleJSFn)
		creatJavaScript:function(id,src){	//action creat<script>
			var oldjs=null,t=null,oldjs=document.getElementById(id);
			if(oldjs) oldjs.parentNode.removeChild(oldjs);
			var scriptObj=document.createElement("script");
			scriptObj.src=src;
			scriptObj.type="text/javascript";
			scriptObj.id=id;
			document.getElementsByTagName("head")[0].appendChild(scriptObj);
		},
		consoleLogLine:function(e, str){			//通用打印并反馈页面及行号 e错误对象、str打印内容
			//使用时 try{throw new Error();}catch(e){ 然后me写在这}
			//打印结果以[@](firefox) 或 [at+1空格](chrome)开头 + http://xxxx + lineNumber
			var rest=e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/,'');
			console.log(rest+'\n'+str);
		},
		FEstaticINI:function(boolean){		//前端静态页面注册
			if(boolean==true){
				var userfiles={'infor':[
					{'name':'刘云祺','id':'script-h1','src':'../js/static/lyq-StaticScript.js'},
					{'name':'刘云祺测试组件创作控件','id':'script-h1','src':'../js/static/lyqDeTest-StaticScript.js'},
					{'name':'肖青青','id':'script-h2','src':'../js/static/xqq-StaticScript.js'},
					{'name':'聂子沛','id':'script-h3','src':'../js/static/nzp-StaticScript.js'},
					{'name':'静态方法层','id':'script-h4','src':'../js/static/StaticFunc.js'}
				]},
				linkScript='';
				for(i in userfiles.infor){
					basJson.oth.creatJavaScript("#script-h"+(parseInt(i)+1), userfiles.infor[i].src);
				}
			}
		}
	}
	//项目使用
	this.pro={
		GuiyiH:function(){
			var eh=$("header"), ef=$("footer"), h=window.innerHeight;
			if(eh.length>0 && ef.length>0){
				h=ef.offset().top-eh.offset().top+ef.height();
			};return h;
		}
	}
	/*Other-END*/
	return this;
}
var basicFE=new bambooSnake_basic();	//Front-End Developer basics function GO!
/* HTML5多点触控（暂时搁在这）
//原生 touchPointer (监听效率极佳)
var obj=$("header h3"),x='',xb='';
function handleMove(e){
	var a=e.changedTouches,
		rst='';
	for(var i=0;i<a.length;i++){
		rst+=i+":"+a[i].pageX+";"
	}
	rst+="length:"+a.length;
	obj.text(rst);
}
document.addEventListener("touchmove", handleMove, false);
//jQ touchPointer (监听效率较差，有待改进或者jq本身性能)
$(document).on("touchmove",function(e){
	var a=e.originalEvent.targetTouches,
		rst='';
	for(var i=0;i<a.length;i++){
		rst+=i+":"+a[i].pageX+";"
	}
	rst+="Lenth:"+a.length;
	obj.text(rst);
});
*/