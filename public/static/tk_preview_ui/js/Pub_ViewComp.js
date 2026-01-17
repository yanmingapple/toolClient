//view component	/*this is jQuery files*/
(function($){
//满屏横条按钮弹窗
$.extend({
	creatApd_fullBtn:function(options){
		$.creatApd_fullBtn.fun={
			model:{
				btnName:"请注册按钮名称",
				id:"",																	
				class:"",								//单或多个class,多个使用“,”分割
				href:"javascript:;",					//按钮上的href值
				attrName:{},							//自建属性 attrName{atNam:vala,btNam:valb...}
				bindFunc:"",							//按钮中绑定的方法
				spacing:1								//每个按钮下方的间距
			},
			EnvSciModel:'mobile',
			btnJson:[],
			apendView:"creatApd_fullViewA",				//填写一个CSS动画名
			styBoxJon:{
				"position":"absolute","left":0,"top":0,"width":"100%","background":"rgba(51,51,51,0.3)","z-index":12
			},
			styBtnJson:{
				"width":"100%","height":"44px","line-height":"44px","font-size":"13px","border-bottom-style":"solid","border-color":"#e4e4e4","background":"#fff","display":"block"
			},
			splitdomH:'js-creatApd_fullSplitH',			//切割高度（极罕见需求，不需满屏填充）
			callBack:function(thiss){},					//回调
			nobubbleEvent:"touchmove"
		}
		var opts=$.extend(true, {}, $.creatApd_fullBtn.fun, options),
			BtnDOMstr='',				//按钮结构
			btnNstr='',					//按钮名称
			idName='',					//id名
			className='',				//一个或多个Class
			hrefUrl='',					//every btn href
			attrName='',				//自建属性字符形式存储
			btnFunc='',					//按钮回调
			borSpac='',					//每个按钮下方间距值
			styleAry='',				//btn基础样式字符形式
			styleBox='';				//大盒样式
		for(v in opts.styBoxJon){		//for opts.styBoxJon
			if(v=="top"){
				opts.styBoxJon[v]=basicFE.bws.getWindowSize("scrolltop");
			}
			styleBox+=v+':'+opts.styBoxJon[v]+'; ';
		}
		for(v in opts.styBtnJson){
			styleAry+=v+':'+opts.styBtnJson[v]+'; ';
		}
		for(var i=0;i<opts.btnJson.length;i++){	
			btnNstr='';
			if(opts.btnJson[i].btnName!=null && opts.btnJson[i].btnName!=''){
				btnNstr=opts.btnJson[i].btnName;
			}else{
				btnNstr=opts.model.btnName;
			}
			idName='';
			if(opts.btnJson[i].id!=null && opts.btnJson[i].id!=''){
				idName=opts.btnJson[i].id;
			}else{
				idName=opts.model.id;
			}
			className='';
			if(opts.btnJson[i].class!=null && opts.btnJson[i].class!=''){
				if(opts.btnJson[i].class.indexOf(',')!==-1){	//存在多个class
					var clasAry=opts.btnJson[i].class.split(',');
					for(var pz=0;pz<clasAry.length;pz++){
						className+=clasAry[pz]+' ';
					}
				}else{
					className=opts.btnJson[i].class;
				}
			}else{
				className=opts.model.class;
			}
			if(opts.btnJson[i].href!=null && opts.btnJson[i].href!=''){
				hrefUrl=opts.btnJson[i].href;
			}else{
				hrefUrl=opts.model.href;
			}
			attrName='';
			if(typeof(opts.btnJson[i].attrName)!='undefined'){	//将自定义属性变为字符
				for(k in opts.btnJson[i].attrName){
					attrName+=k+'="'+opts.btnJson[i].attrName[k]+'" ';
				}
			}else{
				for(k in opts.model.attrName){
					attrName+=k+'="'+opts.model.attrName[k]+'" ';
				}
			}
			btnFunc='';
			if(opts.btnJson[i].bindFunc!=null && opts.btnJson[i].bindFunc!==''){	//按钮callback事件名写入
				btnFunc+='onclick="'+opts.btnJson[i].bindFunc+'"';
			}else{
				if(opts.model.bindFunc==""){
					btnFunc='';
				}else{
					btnFunc+='onclick="'+opts.model.bindFunc+'"';
				}
			}
			//每个按钮底间距
			borSpac='';
			if(opts.btnJson[i].spacing!=null && opts.btnJson[i].spacing!==''){
				borSpac=opts.btnJson[i].spacing;
			}else{
				borSpac=opts.model.spacing;
			}
			BtnDOMstr+='<a id="'+idName+'" class="'+className+'" href="'+hrefUrl+'" '+attrName+' '+btnFunc+' style="'+styleAry+' border-bottom-width:'+borSpac+'px;">'+btnNstr+'</a>';
		}
		var appd_str='',
			appd_wh='';		//诡异一屏高度获取
		if(opts.EnvSciModel=='mobile'){
			appd_wh=GuiyiH();
		}else if(opts.EnvSciModel=='pc'){
			appd_wh=basicFE.bws.getWindowSize("windHeight");
		}
		//元素插入通用默认 动作及事件
		$('body').append('<div class="apd-full-wrap	js-apdful-farw" style="'+styleBox+'">'+
							  '<div class="apd-full-objwrap js-apdful-objw '+opts.apendView+' animate-fillboth">'+
							  		BtnDOMstr+
							  '</div>'+
						 '</div>'
		);
		var obj=$(".js-apdful-farw"),
			objSon=obj.find(".js-apdful-objw");
		obj.on(opts.nobubbleEvent,function(e){
			e.preventDefault();
			return false;
		});
		if($("."+opts.splitdomH).length==0){			//弹框区域像素面积 全屏时（覆盖底部footer时）
			obj.addClass("CssAll").css({"height":appd_wh+"px"});
		}else{											//弹框区域像素面积 不包含底部高度时（footer）
			appd_wh-=basicFE.elm.getObjSize($("."+opts.splitdomH),2);
			obj.addClass("CssAll").css({"height":appd_wh+"px"});
		}
		//样式调整集合>>
		if(objSon.length>0){		//横向满长条形按钮规整
			objSon.css({"margin-top":appd_wh-objSon.height()+"px"});
		}
		$(".js-apdful-farw,.js-apdful-objw a").on("click",function(){
			obj.remove();
			if(typeof(opts.callBack)=='function' && !$(this).is(".js-apdful-farw")){
				opts.callBack($(this));
			}
			return false;
		});
	}
});
//批示弹出confirm
$.extend({
	creat_confirm:function(options){
		$.creat_confirm.fun={
			window:window,
			model:{},
			title:"confirm组件框",
			btnType:"half",				//类型是  full or  half(一个确定按钮 和 确定和取消 alert AND confirm)
			class:"",					//单或多个class,请使用“,”分割
			apendView:"creat_confirmA",
			iputType:"text",
			EnvSciModel:'mobile',		//运行环境模式 mobile or pc
			widthCut:10,				//input将小于框体边缘的裁剪值
			removeCtrl:true,			//删除控制,是否允许蒙版层点击后进行删除
			contJson:[
				{inputText:[false,"这是一段用于填写框的提示","js-typeId-crtConfirm-1","js-typeClas-crtConfirm-1"]},		// 开关true/false 、 inforText、 id、 calss(多个使用class分离)
				{Paragraph:[false,"这是一段文字描述信息","js-typeId-crtConfirm-2","js-typeClas-crtConfirm-2"]},
				{freeDom:[false,"我这里可以插入一个变量","js-typeId-crtConfirm-3","js-typeClas-crtConfirm-3"]}
			],
			clickBtnArt:[
				["type-no","okBtn-IdB","取消"],["type-yes","okBtn-IdA","确定"]
			],
			posBoxSty:{					//[样式]--底层漂浮层 js-apdful-farw
				"position":"absolute","top":"dafult_ScrollTop","left":0,"width":"100%","background":"rgba(51,51,51,0.3)","z-index":12
			},
			contSty:{					//[样式]--弹框容器 js-alert-objw 
				"margin":"0 20px","border-radius":"4px","background":"#fff","overflow":"hidden"
			},
			contTop:{					//[样式]--弹框容器上部分 js-al-top
				"margin":"0 0 10px","width":"100%", padding: '0 24px',
			},
			contBot:{					//[样式]--弹框容器下部分 js-al-objbtn
				"width":"100%","border-top":"1px solid #e4e4e4"
			},
			typeContSty:{		//原件默认样式
				titleHead:{
					"padding":"10px 0","color":"#333","font-size":"18px","font-weight":"bold","display":"block"
				},
				inputText:{
					"margin":"0 auto","padding":"0 10px","width":"80%","height":"30px","line-height":"30px","color":"#333","font-size":"13px","border":"1px solid #e4e4e4","border-radius":"2px","border-collapse":"collapse","display":"block"
				},
				Paragraph:{
					"width":"100%","line-height":"24px","color":"#333","font-size":"13px","display":"block"
				},
				freeDom:{
					"width":"100%","line-height":"24px","color":"#333","font-size":"13px","display":"block"
				},
				aButton:{			//按钮通用样式
					public:{
						"text-align":"center","height":"44px","line-height":"44px","color":"#38cf78","font-size":"16px","display":"inline-block"
					},
					btnYes:{		//yes 按钮样式,没有特殊化则一半无需填写
						"border-left":"1px solid #e4e4e4"
					},
					btnNo:{ /*nothing*/}
				}
			},
			callback:function(iThis){}
		}
		function each_ClassArry(Itarget){	//Class集合累加
			var rezlut='';
			for(var i=0;i<Itarget.length;i++){
				rezlut+=(Itarget[i]+' ');
			}
			return rezlut;
		}
		var opts=$.extend(true, {}, $.creat_confirm.fun, options),
			windows=opts.window,
			body=$(windows.document.body),
			capd_retunStr='null-DOM',	//最终DOM结构
			capd_clasAry=opts.class.split(','),
			capd_cotType_Iput='',		//弹框中涉及的内容类型,input
			capd_cotType_Text='',		//弹框中涉及的内容类型,文本
			capd_cotType_Free='',		//自由内容文本，将字符结构保存变量里，然后将变量放置进来
			capd_btnDOM='',				//按钮结构
			capd_btnArray=[];			//按钮相关键值信息
		//各原件样式导入
		var titlOcg='',iputOcg='',paraOcg='',freeOcg='',
			btnPubOcg='',btnYesOcg='',btnNoOcg='';
		for(i in opts.typeContSty){
			if(i=="titleHead"){
				for(e in opts.typeContSty[i]){
					titlOcg+=e+':'+opts.typeContSty[i][e]+'; ';
				}
			}
			if(i=="inputText"){
				for(e in opts.typeContSty[i]){
					iputOcg+=e+':'+opts.typeContSty[i][e]+'; ';
				}
			}
			if(i=="Paragraph"){
				for(e in opts.typeContSty[i]){
					paraOcg+=e+':'+opts.typeContSty[i][e]+'; ';
				}
			}
			if(i=="freeDom"){
				for(e in opts.typeContSty[i]){
					freeOcg+=e+':'+opts.typeContSty[i][e]+'; ';
				}
			}
			if(i=="aButton"){
				for(e in opts.typeContSty[i]){
					if(e=="public"){					//按钮公共样式
						for(n in opts.typeContSty[i][e]){
							btnPubOcg+=n+':'+opts.typeContSty[i][e][n]+'; ';
						}
					}
					if(e=="btnYes"){
						for(n in opts.typeContSty[i][e]){
							btnYesOcg+=n+':'+opts.typeContSty[i][e][n]+'; ';
						}
					}
					if(e=="btnNo"){
						for(n in opts.typeContSty[i][e]){
							btnNoOcg+=n+':'+opts.typeContSty[i][e][n]+'; ';
						}
					}
				}
			}
		}
		for(var i in opts.contJson){	//容器中的涉及内容类型 及 具体的值
			for(var p in opts.contJson[i]){
				if(p=='inputText'){
					if(opts.contJson[i][p][0]==true){	//判断单个或多个class
						var AsClas='';
						AsClas=basicFE.str.arraySplitVar(opts.contJson[i][p][3], [',',' ']);
						if(typeof(opts.contJson[i][p][2])!=='undefined' && opts.contJson[i][p][2]!=='' && opts.contJson[i][p][2]!==null){
							capd_cotType_Iput='<input id="'+opts.contJson[i][p][2]+'" class="'+AsClas+'" type="'+opts.iputType+'" placeholder="'+opts.contJson[i][p][1]+'" style="'+iputOcg+'" />';
						}else{
							capd_cotType_Iput='<input class="'+AsClas+'" type="'+opts.iputType+'" placeholder="'+opts.contJson[i][p][1]+'" style="'+iputOcg+'" />';
						}
					}
				}
				if(p=='Paragraph'){
					if(opts.contJson[i][p][0]==true){
						var lsClas='';	//判断单个或多个class
						if(typeof(opts.contJson[i][p][2])=='undefined'){
							opts.contJson[i][p][2]='js-typeId-crtConfirm-2';
						}
						if(typeof(opts.contJson[i][p][3])=='undefined'){
							opts.contJson[i][p][3]='js-typeClas-crtConfirm-2';
						}
						lsClas=basicFE.str.arraySplitVar(opts.contJson[i][p][3], [',',' ']);
						capd_cotType_Text='<p id="'+opts.contJson[i][p][2]+'" class="'+lsClas+'" style="'+paraOcg+'">'+opts.contJson[i][p][1]+'</p>';
					}
				}
				if(p=='freeDom'){
					if(opts.contJson[i][p][0]==true){
						var DsClas='';	//判断单个或多个class
						if(typeof(opts.contJson[i][p][2])=='undefined'){
							opts.contJson[i][p][2]='js-typeId-crtConfirm-3';
						}
						if(typeof(opts.contJson[i][p][3])=='undefined'){
							opts.contJson[i][p][3]='js-typeClas-crtConfirm-3';
						}
						DsClas=basicFE.str.arraySplitVar(opts.contJson[i][p][3], [',',' ']);
						capd_cotType_Free='<div id="'+opts.contJson[i][p][2]+'" class="'+DsClas+'" style="'+freeOcg+'">'+opts.contJson[i][p][1]+'</div>';
					}
				}
			}
		}
		if(opts.clickBtnArt.length>0){	//点击按钮相关  id 赋予 及 文本赋予
			for(var i=0;i<opts.clickBtnArt.length;i++){
				if(opts.clickBtnArt[i].length>0){
					for(var x=0;x<opts.clickBtnArt[i].length;x++){
						if(opts.clickBtnArt[i][x]!=='' && opts.clickBtnArt[i][x]!==null && capd_btnArray.length<opts.clickBtnArt.length){
							if(opts.clickBtnArt[i][x]=="type-no"){		//判断生成的按钮类型
								capd_btnArray.push('<a id="'+opts.clickBtnArt[i][1]+'" class="no" href="javascript:;" style="'+btnPubOcg+btnNoOcg+'">'+opts.clickBtnArt[i][2]+'</a>');
							}
							if(opts.clickBtnArt[i][x]=="type-yes"){
								capd_btnArray.push('<a id="'+opts.clickBtnArt[i][1]+'" class="yes" href="javascript:;" style="'+btnPubOcg+btnYesOcg+'">'+opts.clickBtnArt[i][2]+'</a>');
							}
						}
					}
				}
			}
			for(var i=0;i<capd_btnArray.length;i++){	//数组
				capd_btnDOM+=capd_btnArray[i];
			}
		}
		//样式导入
		var posCont='',insCont='',insContTop='',insContBot='';
		for(i in opts.posBoxSty){
			if(i=="top"){
				opts.posBoxSty[i]=(windows.document.body.scrollTop||windows.document.documentElement.scrollTop)+'px';
			}
			posCont+=i+':'+opts.posBoxSty[i]+'; ';
		}
		for(i in opts.contSty){
			insCont+=i+':'+opts.contSty[i]+'; ';
		}
		for(i in opts.contTop){
			insContTop+=i+':'+opts.contTop[i]+'; ';
		}
		for(i in opts.contBot){
			insContBot+=i+':'+opts.contBot[i]+'; ';
		}
		capd_retunStr='<div class="js-apdful-farw" style="'+posCont+'">'+
							'<div class="js-alert-objw '+capd_clasAry+' '+opts.apendView+' animate-fillboth" style="'+insCont+'">'+
								  '<div class="js-al-top" style="'+insContTop+'">'+
										'<span style="'+titlOcg+'">'+opts.title+'</span>'+
										capd_cotType_Text+
										capd_cotType_Iput+
										capd_cotType_Free+
								  '</div>'+
								  '<div class="js-al-objbtn" style="'+insContBot+'">'+
										capd_btnDOM+
								  '</div>'+
							'</div>'+
					   '</div>';
		var appd_str='',
			apdWid='',
			appd_wh='';
		if(opts.EnvSciModel=='mobile'){
			appd_wh=GuiyiH();
			apdWid=basicFE.bws.getWindowSize('windWidth')-40;
		}else if(opts.EnvSciModel=='pc'){
			appd_wh=windows.document.documentElement.clientHeight;
			apdWid=parseInt(windows.document.documentElement.clientWidth*0.4);
		}
		//元素插入通用默认 动作及事件
		body.append(capd_retunStr);
		//样式调整集合>>
		var wObj=body.find(".js-apdful-farw"),
			wBx=wObj.find(".js-alert-objw"),
			wBtop=wBx.find(".js-al-top"),
			wBtn=wBx.find(".js-al-objbtn");
		wObj.addClass("CssAll").css({"height":"100vh"});		
		wBx.css({"margin-left":(windows.document.documentElement.clientWidth-apdWid)*.5+"px","margin-top":(appd_wh-wBx.height())*.5+"px","width":apdWid+"px"});		
		if(opts.btnType=="half"){				//弹出框样式规整  [是/否]双按钮2/1
			wBtn.find("a").css("width",(apdWid-1)/2+"px");
		}else if(opts.btnType=="full"){			//弹出框样式规整 [提示型窗口] 1/1
			wBtn.find(".yes").css({"width":apdWid+"px","border-left-width":0+"px"});
			wBtn.find(".no").css("display","none");
		}
		if(opts.contJson[0].inputText[0]==true){						//如果{input:text}存在时进行样式设置
			var Topinpt=wBx.find(".js-al-top").find("input");			//iput
			Topinpt.css("width",apdWid-basicFE.elm.getObjSize(Topinpt,5)-opts.widthCut+"px");
			Topinpt.focus(function(){
				//部分机型不居中
			});
		}
		wObj.on('touchmove',function(e){
			return false;
		});
		wBx.on("click",function(){
			return false;
		});
		wObj.on("click",function(){
			if(opts.removeCtrl){wObj.remove();}
		});
		wBtn.find("a").on("click",function(){
			if(typeof(opts.callback)=='function'){
				var objArgmt=[],rObj=wBtop.children();	//一个或多个相关元素
				for(var i=0;i<rObj.length;i++){
					if(rObj.eq(i).get(0).tagName!=="SPAN"){
						objArgmt.push(rObj.eq(i));
					}
				}
				opts.callback($(this),objArgmt);
				wObj.remove();
			}
		});
	}
});

//checkbone
$.fn.extend({
	checkbone:function(options){
		$.fn.checkbone.fuc={
			ckA:"js-check-farAL",		//全选类型
			ckO:"js-check-farOnec",		//单选类型
			ckI:"js-check",				//checkbox目标
			ckF:"js-check-outBtn",		//check选区范围
			ckT:"js-alGet-checkText",	//相应文本获取目标
			//所有的自建属性
			attr:{						
				ckOpen:"check_Open",	//开启状态0/1
				ckGTex:"check_GetText",	//文本
				choice:"total-choice",	//全选关联
				member:"MemberState"	//全选目标上的计数显示   例3/5
			},
			callback:function(arr,arrb){},
			Onlycalback:function(){},
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.checkbone.fuc, options);
		//obj string
		var ckA=opts.ckA,
			ckO=opts.ckO,
			ckI=opts.ckI,
			ckF=opts.ckF,
			ckT=opts.ckT,
		//attr typeName
			ckOpen=opts.attr.ckOpen,
			ckGTex=opts.attr.ckGTex,
			choice=opts.attr.choice,
			member=opts.attr.member,
		//array
			arF=opts.al_checkFars=[],
			arO=opts.al_openIdArray=[],
			acs=opts.al_check_str='';
		$("."+ckI).each(function(i,elm){
			var	ec_This=$(this),
				ec_Elm=ec_This.find("a");
			if(ec_Elm.css("display")=="none"){
				ec_This.attr(ckOpen,0);
			}else if(ec_Elm.css("display")=="block"){		//attr({})严重bug，字符化
				ec_This.attr(ckOpen,1).attr(ckGTex,ec_This.parent().find("."+ckT).text());
				//页面中所有被选择的id都会被传入到数组中
				if(typeof(ec_This.attr('id'))!='undefined'){
					arO.push(basicFE.elm.safeAttr(ec_This,'id'));
				}
			}
			//通过找到被标注的全选主级，来获取其自定义属性上的Class名字，将其投入到check控制池中
			if($(this).is("."+ckA)){
				if(typeof($(this).attr(choice))!='undefined'){
					arF.push($(this).attr(choice));		
				}else{
					alert('检测到有全选目标未添加自定义class属性');
				}
			}
		});
		//ini 全选o/i
		for(var au=0;au<arF.length;au++){
			var imObj=$("."+arF[au]),
				imObjLen=imObj.find("."+ckI).length,
				imCoi=0;
			imObj.find("."+ckI).each(function(i,elm){
				if($(this).attr(ckOpen)==1){
					imCoi++;
				}
				if(i==imObjLen-1){
					$("."+ckA).each(function(idx,elmt){
						if($(this).attr(choice)==arF[au]){
							$(this).attr(member,imCoi+'/'+imObjLen);		//实际长度/总长度
						}
					});
				}
			});		
		}	
		//事件绑定
		$("."+ckI+",."+ckF).off(opts.event);
		$("."+ckI).on(				//小区域点击 单独checkbox
			opts.event,function(){
				elmdisplay($(this));
				return false;
			}
		);
		$("."+ckF).on(		//大区域点击 包裹checkbox式
			opts.event,function(){
				if($(this).find("."+ckI).length>0){
					elmdisplay($(this).find("."+ckI));
				}else{
					alert('Error, this element internally did not find the checkbox combination control.');
				}
			}
		);
		function elmdisplay(obj){
			var check_Elm=obj.find('a'),
				check_css=check_Elm.css('display'),
				iTsFar='';						//当前事件的父级
			if(obj.parents("."+ckO).length>0){	//单选制 - 顶父级存在该Class则开始单选制度，容器内规则为无法多选
				acs=obj.parents("."+ckF).find("."+ckT).text();
				//至少保证选择一个
				if($("#js-check-setItargt").length>0){		//保持被选项目标独一性   该ID只会在页面中存在于一个元素上
					$("#js-check-setItargt").removeAttr("id");
				}
				if(check_css=="none"){
					obj.parents("."+ckF).attr("id","js-check-setItargt");
					obj.parents("."+ckO).find("."+ckI).attr(ckOpen,0).attr(ckGTex,"str-null").find("a").css("display","none");
					check_Elm.css("display","block").parent("."+ckI).attr(ckOpen,1).attr(ckGTex,obj.parent().find("."+ckT).text());
				}
				if(typeof(opts.Onlycalback)=="function"){
					opts.Onlycalback(obj,ckI,ckO);
				}
			}else{
				if(check_css=="none"){
					check_Elm.css("display","block").parent("."+ckI).attr(ckOpen,1).attr(ckGTex,obj.parent().find("."+ckT).text());
				}else{
					check_Elm.css("display","none").parent("."+ckI).attr(ckOpen,0).attr(ckGTex,"str-null");
					acs='';  							//重置 - 公用变量
				}
				//公用数据，计算所有被选择过的checkbox   给予2种控制方式任意选择
				function pushspId(Iobject,runType){
					var nowId=basicFE.elm.safeAttr(Iobject,'id');
					if(typeof(nowId)!='undefined' && nowId!=null && nowId!=''){
						if(arO.length>0){
							for(var xn=0;xn<arO.length;xn++){		//遍历数组id池
								if(runType==1){
									if(nowId==arO[xn]){				//含有 --- 删除
										arO.splice(xn,1);
										break;
									}else if(xn==arO.length-1){		//未找到-- 添加
										arO.push(nowId);
										break;
									}
								}else if(runType==2){
									//这里就不对数组进行比较，优先比较目标元素的显示情况
									if(Iobject.find("a").css("display")=="block"){
										if(nowId==arO[xn]){
											break;
										}else if(xn==arO.length-1){		//未找到-- 添加
											arO.push(nowId);
											break;
										}
									}else if(Iobject.find("a").css("display")=="none"){
										if(nowId==arO[xn]){
											arO.splice(xn,1);
											break;
										}
									}
								}
							}
						}else{
							arO.push(nowId);
						}
					}
				}
				//非全选按钮被点击
				if(typeof(obj.attr('id'))!='undefined'){
					pushspId(obj,1);
					for(var da=0;da<arF.length;da++){					//全选情况,子级取消父级勾选  al_checkFars[全局变量]
						if(obj.parents('.'+arF[da]).length>0){			//多层级嵌套时问题就会出现在这里，这种方式注定无法多层级嵌套
							iTsFar=arF[da];
							$("."+ckA).each(function(i,elm){
								var oIbj=$(this).find("a");
								if($(this).attr(choice)==iTsFar){		//父级池搜索匹配目标
									//当前子级o/i状态 信息总结
									var iTfObj=$('.'+iTsFar).find("."+ckI),
										childLen=iTfObj.length,
										opNum=0;
									for(var ln=0;ln<childLen;ln++){
										if(iTfObj.eq(ln).find("a").css('display')=='block'){
											opNum++;
										}
									}
									$(this).attr(member,opNum+'/'+childLen);
									if(obj.attr(ckOpen)==0){
										oIbj.css("display","none").parent("."+ckI).attr(ckOpen,0).attr(ckGTex,"str-null");
									}else{
										if(opNum==iTfObj.length){	//当全选的所有子项都被选中时,将控制的far也勾选
											oIbj.css("display","block").parent("."+ckI).attr(ckOpen,1).attr(ckGTex,"");
										}
									}
									return false;					//退出循环
								}
							});
							break;
						}
					}
				}
				//全选功能(父)	total-Choice['id']
				function totalChoice(){
					var objItargID=basicFE.elm.safeAttr(obj,choice),
						disPlayView=check_Elm.css("display");
					$("."+objItargID).find("."+ckI).each(function(i,elm){
						var	ec_This=$(this),
							ec_Elm=ec_This.find("a");
							ec_Elm.css("display",disPlayView),
							MemState=obj.attr(member).split('/');
						if(disPlayView=="none"){
							ec_This.attr(ckOpen,0);
							obj.attr(member,0+'/'+MemState[1]);
						}else if(disPlayView=="block"){
							ec_This.attr(ckOpen,1).attr(ckGTex,ec_This.parent().find("."+ckT).text());
							obj.attr(member,MemState[1]+'/'+MemState[1]);
							//页面中所有被选择的id都会被传入到数组中
							if(typeof(ec_This.attr('class'))!='undefined'){
								//al_openIdArray.push(basicFE.elm.safeAttr(ec_This,'id'));
							}
						}
						pushspId(ec_This,2);
					});
				}
				if(typeof(obj.attr(choice))!='undefined'){
					totalChoice();
				}
				if(typeof(opts.callback)=='function'){	//每次运行回调
					opts.callback(arF,arO);
				}
				return false;
			}
			}/*end*/
			if(typeof(opts.callback)=='function'){	//每次运行回调
				opts.callback(arF,arO);
			}
	}
});


//屏幕状态提示  微小型
/*
farClass [str] 一个或多个CLASS 特殊情况用于辅助构造样式细节
imgSrc 	[str] 图片路径，如果没有设置路径，图标标签将被隐藏
str 	[str] 文字提示内容
json    [json]规范样式名操作，不支持任意及自建名
clearTime [num]	提示框出现的时间持续XX秒 （参考 1000=1秒）
*/
var delA_time=null,
	delB_time=null;
$.extend({
	posInforAlert:function(options){
		$.posInforAlert.func={
			farClass:null,
			imgSrc:null,
			str:'输入不能为空',
			json:{
				  'padding':[10,10,10,10],
				  'width':'auto',
				  'color':'rgba(255,255,255,1)',
				  'font-size':13,
				  'font-margTop':0,
				  'IconImg-Width':40,
				  'background-color':'rgba(0,0,0,0.8)',
				  'border-radius':8
			},
			clearTime:'2500',
			callback:function(iThis){}
		}
		var opts=$.extend(true, {}, $.posInforAlert.func, options),
			DOM='<div class="js-posInf-Wrap '+opts.farClass+'" style="position:fixed; left:0; top:0; z-index:99;">'+
				  '<img src="'+opts.imgSrc+'">'+
				  '<span class="js-posInfText" style="display:block;">'+opts.str+'</span>'+
			'</div>';
		var iLeft=0,
			iTop=0,
			sTpad=[],
			sTwidth=0,
			fClor='',
			fSize='',
			fMargT='',
			imgWid='',
			sTbgClor='',
			sTborRadius=0;
		//清空同类项
		if($(".js-posInf-Wrap").length>0){
			$(".js-posInf-Wrap").css({"transform":"scale(0,0)"});
		}
		//样式抓取
		for(var i in opts.json){
			if(i=='padding'){
				for(var j=0;j<opts.json[i].length;j++){
					sTpad.push(opts.json[i][j]);
				}
			}
			if(i=='width'){
				sTwidth=opts.json[i];
			}
			if(i=='background-color'){
				sTbgClor=opts.json[i];
			}
			if(i=='color'){
				fClor=opts.json[i];
			}
			if(i=='font-size'){
				fSize=opts.json[i];
			}
			if(i=='font-margTop'){
				fMargT=opts.json[i];
			}
			if(i=='IconImg-Width'){
				imgWid=opts.json[i];
			}
			if(i=='border-radius'){
				sTborRadius=opts.json[i];
			}
		}
		$("body").append(DOM);
		//第一次赋值样式
		$(".js-posInf-Wrap").css({"padding-top":sTpad[0],"padding-right":sTpad[1],"padding-bottom":sTpad[2],"padding-left":sTpad[3],"width":sTwidth,"background-color":sTbgClor,'font-size':fSize,"border-radius":sTborRadius,"opacity":0});
		$(".js-posInf-Wrap").find(".js-posInfText").css({'margin-top':fMargT,'color':fClor,'opacity':0}).end().find("img").css({'width':imgWid});
		
		if(sTwidth.indexOf('%')!==-1){				//填入值为[百分比]情况
			iLeft=(basicFE.bws.getWindowSize("windWidth")-(parseInt(sTwidth)*0.01)*basicFE.bws.getWindowSize("windWidth")-(sTpad[1]+sTpad[3]))/2;
		}else if(sTwidth=='auto'){					//根据内容自由缩放，比较适合包含图标的情况
			iLeft=(basicFE.bws.getWindowSize("windWidth")-$(".js-posInf-Wrap").width()-(sTpad[1]+sTpad[3]))/2;
		}else{										//填入值为[直接值]情况
			iLeft=(basicFE.bws.getWindowSize("windWidth")-parseInt(sTwidth)-(sTpad[1]+sTpad[3]))/2;
		}
		iTop=(GuiyiH()-$(".js-posInf-Wrap").height())/2;
		//第二次赋值样式
		$(".js-posInf-Wrap").css({'left':iLeft,'top':iTop});
		//表现方式
		clearTimeout(delA_time);
		clearTimeout(delB_time);
		setTimeout(function(){
			$(".js-posInf-Wrap").addClass('CssAll-ffast').css({"opacity":1});
			setTimeout(function(){
				$(".js-posInf-Wrap").find(".js-posInfText").addClass('CssAll-ffast').css({"opacity":1});					
				//到点时间取消
				delA_time=setTimeout(function(){
					$(".js-posInf-Wrap").css("opacity",0);
					delB_time=setTimeout(function(){
						$(".js-posInf-Wrap").remove();
						if(opts.callback!=null){
							opts.callback();
						}
					}, 1000);
				}, opts.clearTime);
			}, 350);
		},500);
		if(opts.imgSrc==null){
			$(".js-posInf-Wrap").find('img').css("display","none");
		}
	}	
});

$.extend({
	positionTexTips:function(options){
		$.positionTexTips.func={
			window:window,
			str:'漂浮图文提示',
			EnvSciModel:'mobile',
			clearAlien:false,			//是否排除异己
			SpecialCode:'',				//特殊编码,用于后台识别调用(因为后台拿去可能封装成为public_function，如此一来通过填充参数亦可判断)
			box:{
				class:'',				//填多个'空格'隔开
				sty:{
					"position":"absolute","left":0,"top":0,
					"padding-left":10+"px","padding-right":10+"px","padding-top":10+"px","padding-bottom":10+"px",
					"width":"auto","background-color":"rgba(0,0,0,0.8)","border-radius":7+"px","transition":"opacity cubic-bezier(0.45,1,0.65,1) 0.8s,transform cubic-bezier(0.45,1,0.45,1) 0.6s","opacity":0,"z-index":99
				}
			},
			tex:{
				sty:{
					"color":"rgba(255,255,255,0.95)","font-size":13+"px","display":"block"
				}
			},
			img:{
				open:false,
				src:"",
				sty:{
					"margin-bottom":8+"px",
					"width":20+"px",
					"height":20+"px"
				}
			},
			callback:function(specialCode){},
			duration:2500,
			removeTime:500
		}
		var opts=$.extend(true, {}, $.positionTexTips.func, options),
			body=$(opts.window.document.body),
			webWid=opts.window.innerWidth,
			webHgt=opts.EnvSciModel=="mobile"?GuiyiH():opts.window.innerHeight,
			boxClas='',
			boxSty='',
			texSty='',
			imgSty='',
			elmImg='';
		if(opts.box.class.indexOf(' ')>-1){
			var array=opts.box.class.split(' ');
			for(var i=0;i<array.length;i++){
				boxClas+=array[i]+' ';
			}
		}
		for(i in opts.box.sty){
			boxSty+=i+':'+opts.box.sty[i]+'; ';
		}
		for(i in opts.tex.sty){
			texSty+=i+':'+opts.tex.sty[i]+'; ';
		}
		if(opts.img.open==true){
			for(i in opts.img.sty){
				imgSty+=i+':'+opts.img.sty[i]+'; ';
			}
			elmImg='<img src="'+opts.img.src+'" style="'+imgSty+'"/>';
		}
		if(opts.clearAlien==true){
			body.find(".js-positionTexTip-Wrap").css({"opacity":0,"transform":"scale(0,0)"});
		}
		var	dom='<div class="js-positionTexTip-Wrap '+boxClas+'" style="'+boxSty+'">'+
					  elmImg+
					  '<span class="js-positionTexTip-Ins" style="'+texSty+'">'+opts.str+'</span>'+
				'</div>';
		body.append(dom);
		var obj=body.find(".js-positionTexTip-Wrap").last(),
			scrTop=opts.window.document.body.scrollTop || opts.window.document.documentElement.scrollTop,
			cAdd=opts.cAdd=0;
		obj.css({"top":(webHgt-basicFE.elm.getObjSize(obj,2))*0.5+scrTop,"left":(webWid-basicFE.elm.getObjSize(obj,1))*0.5,"opacity":1});
		if(basicFE.bws.IEnightSupport()=='ie9'){
			opts.window.TexTips_requestTime=setInterval(function(){
				cAdd++;
				if(cAdd>=17){
					clearInterval(opts.window.TexTips_requestTime);
					obj.css({"opacity":0,"transform":"scale(0,0)"});
					setTimeout(function(){
						obj.remove();
						body.find(".js-positionTexTip-Wrap").remove();
						if(typeof(opts.callback)=="function"){
							opts.callback(opts.SpecialCode);
						}
					}, opts.removeTime);
				}
			},59);
		}else{
			function clearMycomponet(){
				opts.window.TexTips_requestTime=requestAnimationFrame(clearMycomponet);
				cAdd++;
				if(cAdd>=opts.duration/16.7){
					cancelAnimationFrame(opts.window.TexTips_requestTime);
					obj.css({"opacity":0,"transform":"scale(0,0)"});
					setTimeout(function(){
						obj.remove();
						body.find(".js-positionTexTip-Wrap").remove();
						if(typeof(opts.callback)=="function"){
							opts.callback(opts.SpecialCode);
						}
					}, opts.removeTime);
				}
			}
			cancelAnimationFrame(opts.window.TexTips_requestTime);
			clearMycomponet();
		}
	}
});

/*:1.能被4整除而不能被100整除.（如2004年就是闰年,1800年不是.）2.能被400整除.（如2000年是闰年）*/
/*如果是时间,请使用服务器传参*/
function dayDataComponent(openType,Hour,Minute){
	var myDate=new Date(),
		webH=GuiyiH();
		myDate.getFullYear(); 
		myDate.getMonth();       //获取当前月份(0-11,0代表1月)
		myDate.getDate();        //获取当前日(1-31)
	var DOM='<div class="lyq-dataWrap js-lyq-dataWrap">'+
				  '<div class="lyq-dwHead js-lyq-dwHead">'+
				  		'<div class="lyq-dwhTitle js-lyq-dwhTitle">'+
							  '<span></span>'+
						'</div>'+
						'<div class="lyq-dwhDate js-lyq-dwhDate">'+
							  '<span></span><em></em>'+
						'</div>'+
				  '</div>'+
				  '<div class="lyq-dwCont js-lyq-dwCont">'+
				  
				  '</div>'+
				  '<div class="lyq-btnBox js-lyq-btnBox"></div>'
			'</div>';
		$("body").append(DOM);
		//确认此次运行需要被调用的类型 [1=年月,2=日,3=时分]
		if(openType==1){
			$(".js-lyq-dwhTitle").find('span').text('选择年月');
		}
}

//当失去焦点的时候 对字符进行修饰  加上 ￥ 和 kg
function strTransforme(){
	$(".js-cgText-unit input:text").off().on({
		"blur":function(){
			var x=$(this).val();
			if(typeof(parseInt(x))=='number' && !isNaN(x) && x!==''){		//如果填入值不包含英文，是数字
				if(x.indexOf('.')!==-1){									//填写的是小数的情况
					if(x.toString().split(".")[1].length==1){
						x=x+0;
						$(this).val('￥'+x+'/kg');
					}else if(x.toString().split(".")[1].length>2){ 		//如果小数点后多于2位数
						var nowN='';
						for(var m=0;m<x.toString().split(".")[0].length;m++){
							nowN+=x.toString().split(".")[0][m];
							if(m==x.toString().split(".")[0].length-1){
								nowN+='.';
								for(var p=0;p<2;p++){
									nowN+=x.toString().split(".")[1][p];
								}
								$(this).val('￥'+nowN+'/kg');
							}
						}
					}else if(x.toString().split(".")[1].length==2){ //正确格式
						$(this).val('￥'+x+'/kg');
					}
				}else{
					$(this).val('￥'+x+'.00/kg');
				}
			}else{
				if(x==''){
					$(this).val('');
					$.posInforAlert({str:'输入不能为空'});
				}else{
					$.posInforAlert({str:'输入仅许数字'});
				}
				$(this).val('');
			}
		},
		"focus":function(){
			var str=$(this).val();
			if(str.indexOf('￥')!==-1 && str.indexOf('/kg')!==-1){
				str.replace('￥', "W3School");
				var nStr=str.replace('￥', '')
				console.log(nStr.replace('/kg', ''));
				$(this).val(nStr.replace('/kg', ''));
			}
		}
	});
}

//自动联动漂浮表（移动端版）
$.extend({
	autoRelaForm:function(options){
		$.autoRelaForm.fun={
			model:{						//默认值
				webAH:GuiyiH(),			//可通过外部给予参
			},
			Ajax:{
				dataAddr:'XHR',			//决定数据的来源，XHR,VAR两种模式(引入路径和变量)，常用于测试
				url:"../Ajax/autoRelaFormJson.txt"
			},
			webViewContrl:{				//视觉控制 涉及
				webAH:'default'			//web_height
			},
			biliLi:{
				howLiAtr:[10,10,12],		//联动表单按照序32列分裂,根据填写的数组长度判断生成多少列,根据设备分辨率宽进行按照比例匹配宽度
				styRe:{						//列项的样式 [高、宽]根据匹配
					styPub:{
						"position":"relative","float":"left","overflow":"hidden"
					},
					every:[				//区别样式
						"background:#c2c2c2;",
						"background:#e5e4e4;",
						"background:#eee;"
					],
					spac:{				//多个母列的间距及颜色,会判断不生成在最后一个
						val:1,
						type:'solid',
						col:"#c3c3c3"
					}
				},
				styPs:{					//列项内漂浮层
					"position":"absolute","top":0+"px","left":0+"px","width":"100%"
				},
				btnSty:{				//按钮样式
					public:{
						"padding-left":25+"px","text-align":"left","line-height":44+"px","font-size":13+"px","display":"block"
					},
					every:[				//独立按钮样式,['每母列','每母列']
						"background:#ccc;","background:#ececec;","background:#f3f3f3;"
					],
					act:{				//废弃
						"color":"#00ab79"
					},
					ActClass:"js-autoRelaForm-act"
				}
			},
			boxSty:{
				bgBox:{
					"position":"absolute","left":0,"top":0,"width":"100%","height":"YOU SET!","background":"rgba(51,51,51,0.3)","z-index":20
				},
				contBox:{
					marT:50+'px',				//contBox距离顶部内容
					sty:{"margin-top":50+"px","width":"100%","height":"YOU calculation","background":"#fff"}
				},
				headTil:{
					open:true,					//显示
					text:'自由列级联动表单浮窗',
					sty:{
						"padding-left":14+"px","padding-right":14+"px","width":"100%","height":44+"px","line-height":44+"px","font-size":16+"px","box-sizing":"border-box","background":"#f3f3f3","border-bottom":"1px solid #c3c3c3"
					}
				},
				reMatriX:{"width":"100%","overflow":"hidden"}
			},
			callback:function(iThis,dataReslut,data,webH){}	//$(this),dataReslut,data,webAh
		}
		var opts=$.extend(true, {}, $.autoRelaForm.fun, options),
			//大框架结构sty
			webAh='',bgBx='',ctBx='',tilBx='',Mtrx='',			//页面高度
			aClas=opts.biliLi.btnSty.ActClass,
			JGjson=null;		//请求到的json对象

		for(i in opts.boxSty.bgBox){
			if(i=="height"){
				if(opts.webViewContrl.webAH=='default'){
					opts.boxSty.bgBox[i]=opts.model.webAH;
					webAh=opts.model.webAH;
				}else{
					webAh=opts.boxSty.bgBox[i];
				}
			}
			bgBx+=i+':'+opts.boxSty.bgBox[i]+'; ';
		}
		for(i in opts.boxSty.contBox.sty){
			if(i=="height"){
				opts.boxSty.contBox.sty[i]=webAh-parseInt(opts.boxSty.contBox.marT);
			}
			ctBx+=i+':'+opts.boxSty.contBox.sty[i]+'; ';
		}
		for(i in opts.boxSty.headTil.sty){
			tilBx+=i+':'+opts.boxSty.headTil.sty[i]+'; ';
		}
		for(i in opts.boxSty.reMatriX){
			Mtrx+=i+':'+opts.boxSty.reMatriX[i]+'; ';
		}
		var DOM='<div class="js-autoRelaForm" style="'+bgBx+'">'+
					  '<div class="js-aRelaForm-cont" style="'+ctBx+'">'+
					  		'<h3 class="js-aRelaHead" style="'+tilBx+'">'+opts.boxSty.headTil.text+'</h3>'+
							'<div class="js-aReMatrixLi" style="'+Mtrx+'">'+
							'</div>'+
					  '</div>'+
				'</div>';
		$("body").append(DOM);
		//生成纵列
		var data=[];
		function forJson(json,lev,parent){		//将主序json 转化为 分类json
			if(typeof(data[lev-1])=="undefined"){
				data[lev-1]={};
			}
			data[lev-1][parent]=json;
			lev=lev+1;
			for(var i=0;i<json.length;i++){					//循环各省
				if(typeof(json[i].children)!="undefined"){	//循环各市
					forJson(json[i].children,lev,json[i].id);
				}
			}
		}
		//数据get模式 XHR or VAR
		if(opts.Ajax.dataAddr=='VAR'){
			JGjson=[{id:"cs",name:"长沙",children:[{id:"frq",name:"芙蓉区",children:[{id:"qygc",name:"企业广场"},{id:"lgjy",name:"麓谷锦园"},{id:"jzyg",name:"加州阳光"},{id:"wydd",name:"五一大道"},{id:"xhj",name:"下河街"},{id:"zst",name:"中山亭"}]},{id:"yhq",name:"雨花区",children:[{id:"xxcb",name:"潇湘晨报"},{id:"tdxy",name:"铁道学院"},{id:"jwz",name:"井湾子"},{id:"yhtwrm",name:"雨花亭沃尔玛"},{id:"qcnz",name:"汽车南站"},{id:"wjll",name:"万家丽路"},{id:"sml",name:"树木岭"}]},{id:"ylq",name:"岳麓区",children:[{id:"yyqzfb",name:"岳麓区政府北"},{id:"xyyxy",name:"湘雅医学院"},{id:"bgz",name:"白鸽嘴"},{id:"jxlk",name:"金星路口"},{id:"qcxz",name:"汽车西站"},{id:"wyh",name:"望月湖"},{id:"jzzdq",name:"橘子洲大桥"}]},{id:"kfq",name:"开福区",children:[{id:"kfs",name:"开福寺"},{id:"wkcgc",name:"万科城广场"},{id:"qcbz",name:"汽车北站"},{id:"sfp",name:"四方坪"},{id:"lyhdq",name:"浏阳河大桥"},{id:"gfkd",name:"国防科大"},{id:"dyc",name:"德雅村"}]}]},{id:"sh",name:"上海",children:[{id:"hpq",name:"黄浦区",children:[{id:"sngg",name:"思南公馆"},{id:"rmgc",name:"人民广场"},{id:"bhq",name:"8号桥"},{id:"byg",name:"白云观"},{id:"xtyqzs",name:"小桃园清真寺"},{id:"gmrgj",name:"郭沫若故居"}]},{id:"ljz",name:"陆家嘴",children:[{id:"xxcb",name:"东方明珠"},{id:"tdxy",name:"金茂大厦"},{id:"jwz",name:"上海浦东机场"}]}]}];
			
			forJson(JGjson,1,'-1');
		}else if(opts.Ajax.dataAddr=='XHR'){
			$.ajax({
				async:false,
				dataType:'json',
				url:opts.Ajax.url,
				success:function(result){
					JGjson=result;
					forJson(JGjson,1,'-1');
				},
				error:function(XMLResponse){
					console.log(XMLResponse.responseText);
				}
			});
		}
		var strOp='',										//生成的列项
			publicst='',									//公用样式暂存
			strSty=[],										//列项公用样式，每列项的width
			sonPos='';										//子列
		for(i in opts.biliLi.styRe.styPub){					//母列 循环public sty
			publicst+=i+':'+opts.biliLi.styRe.styPub[i]+'; ';
		}
		for(i in opts.biliLi.styPs){						//子列 循环 sty
			sonPos+=i+':'+opts.biliLi.styPs[i]+'; ';
		}
		var EJV=0;
		if($.isArray(opts.biliLi.howLiAtr)){				//width分32列
			var account=0;
			for(var i=0;i<opts.biliLi.howLiAtr.length;i++){
				account+=parseInt(opts.biliLi.howLiAtr[i]);
			}
			if(account<=32){
				for(var i=0;i<opts.biliLi.howLiAtr.length;i++){
					//var nnber=parseInt($(".js-aReMatrixLi").width()*(opts.biliLi.howLiAtr[i]*0.1))-parseInt(opts.biliLi.styRe.spac.val);//减去母列间距
					var SingWid=parseInt($(".js-aReMatrixLi").width()/32),
						nnber=SingWid*parseInt(opts.biliLi.howLiAtr[i])-parseInt(opts.biliLi.styRe.spac.val);	//减去母列间距
					if(i==opts.biliLi.howLiAtr.length-1){
						nnber=$(".js-aReMatrixLi").width()-EJV;
					}else{
						EJV+=nnber+parseInt(opts.biliLi.styRe.spac.val);
					}
					strSty.push(nnber);
				}
			}
		}else{throw '严重警告：biliLi里howLiAtr的值不是数组，程序无法运行！！！';}
		var hooH=0;
		if(opts.boxSty.headTil.open==true){
			hooH=basicFE.elm.getObjSize($(".js-aRelaHead"),2);
		}
		//识别列项
		for(var i=0;i<data.length;i++){		//data索引0是废数据,根据数据创建对应数量列，通过biliLi.howLiAtr分别按照比例分配长度
			var MtriHei=(webAh-parseInt(opts.boxSty.contBox.marT))-hooH,
				spacIng='border-right:'+opts.biliLi.styRe.spac.val+'px '+opts.biliLi.styRe.spac.type+' '+opts.biliLi.styRe.spac.col;
			if(i==data.length-1){
				spacIng=0;
			}
			strOp+='<div class="js-aReM-mo" style="width:'+strSty[i]+'px; height:'+MtriHei+'px; '+publicst+' '+spacIng+';'+opts.biliLi.styRe.every[i]+'"><div id="js-aReMNa-'+i+'" class="js-aReM-son" style="'+sonPos+'"></div></div>';
		}
		$(".js-aReMatrixLi").append(strOp);
		//按钮样式创造
		var btnPub='';				//公用
		for(i in opts.biliLi.btnSty.public){
			btnPub+=i+':'+opts.biliLi.btnSty.public[i]+'; ';
		}
		//按钮生成插入
		var MtriObj=$(".js-aReMatrixLi"),
			MtrOMo=MtriObj.find('.js-aReM-mo'),
			btnDom='',
			pBtn='';
		for(i in opts.biliLi.btnSty.public){
			pBtn+=i+':'+opts.biliLi.btnSty.public[i]+'; ';
		}
		for(n in data[0]){					//初步生成
			for(z in data[0][n]){
				btnDom+='<a id="'+data[0][n][z].id+'" href="javascript:;" style="'+btnPub+opts.biliLi.btnSty.every[0]+'">'+data[0][n][z].name+'</a>';
			}
		}
		MtrOMo.eq(0).find('.js-aReM-son').append(btnDom);
		function crtOther(idx){				//根据第一列，导入对应第二列并生成，再根据第二列第一个生成第三列
			btnDom='';
			var key=MtrOMo.eq(idx-1).find('.js-aReM-son').find('a').eq(0).prop('id');
			for(n in data[idx][key]){		//二步生成
				btnDom+='<a id="'+data[idx][key][n].id+'" href="javascript:;" style="'+btnPub+opts.biliLi.btnSty.every[idx]+'">'+data[idx][key][n].name+'</a>';
			}
			MtrOMo.eq(idx).find('.js-aReM-son').append(btnDom);
		}
		for(var i=0;i<data.length;i++){
			if(i!==0){
				crtOther(i);			//生成所有按钮并插入
			}
		}
		for(var i=0;i<data.length;i++){	//touch bind
			AddEvent_Touch($('#js-aReMNa-'+i));
		}
		$('.js-aReM-mo').each(function(i,elm){
            $(this).find('a').eq(0).attr('style',btnPub+opts.biliLi.btnSty.every[i]).addClass(aClas);
        });
		function AgentsOther(key,idx){			//重塑
			if(typeof(key)!=='undefined'){
				if(typeof(data[idx][key])=='undefined'){
					data[idx][key]=[];
				}
				btnDom='';
				for(n in data[idx][key]){		//二步生成
					var stySetnb='',aCat='';
					if(n==0){					//第一个赋予act样式
						aCat='class="'+aClas+'"';
						stySetnb=btnPub+opts.biliLi.btnSty.every[idx];
					}else{
						stySetnb=btnPub+opts.biliLi.btnSty.every[idx];
					}
					btnDom+='<a id="'+data[idx][key][n].id+'" '+aCat+' href="javascript:;" style="'+stySetnb+'">'+data[idx][key][n].name+'</a>';
				}
				MtrOMo.eq(idx).find('.js-aReM-son').css('top',0).empty().append(btnDom);
			}else if(typeof(key)=='undefined'){throw 'event ID does not exist';}
			for(var i=1;i<data.length;i++){		//touch bind angin
				var obPos=$('#js-aReMNa-'+i),
					oPart=obPos.parent();
				AddEvent_Touch(obPos);
				if(obPos.height()<=oPart.height()){
					obPos.off('touchstart touchmove touchend');
				}
			}
		}
		function bindEvent(){
			var aRem=$(".js-aReM-son"),
				aRemBtn=aRem.find("a");
			aRemBtn.off('click');
			aRemBtn.on('click',function(){
				var idx=$(this).parents('.js-aReMatrixLi').find($(this).parents('.js-aReM-mo')).index(),
					thisId=$(this).attr('id'),
					dataReslut=0;
				$(this).parents('.js-aReM-mo').find("."+aClas).removeClass(aClas);
				//act样式赋值
				$(this).parent('.js-aReM-son').find('a').attr('style',btnPub+opts.biliLi.btnSty.every[idx]);
				$(this).attr('style',btnPub+opts.biliLi.btnSty.every[idx]).addClass(aClas);
				//刷新其后表
				if(idx+1<data.length){
					dataReslut=data[idx+1][thisId];
					for(var i=idx;i<data.length;i++){				//重塑
						if(i>idx){
							thisId=MtrOMo.eq(i).find('.js-aReM-son').find('a').eq(0).attr('id');
						}
						if(i<data.length-1){
							AgentsOther(thisId,i+1);	//生成下一列
						}
					}
				}else{		//最后一列被点击
					dataReslut='nothing';
					$(".js-autoRelaForm").css({"transition":"all cubic-bezier(0.45,1,0.45,1) 0.5s","transform":"scaleX(-180)","opacity":0});
					setTimeout(function(){
						$(".js-autoRelaForm").remove();
					}, 500);
				}
				if(typeof(opts.callback)=='function'){
					var rtTex='',oAct=$("."+aClas);
					for(var i=0;i<oAct.length;i++){
						rtTex+=oAct.eq(i).text();
					}
					opts.callback($(this),dataReslut,data,webAh,rtTex,idx);		//call	$(this),ev对应的{}object,webH
				}
				bindEvent();
			});
		}
		bindEvent();
		$(".js-autoRelaForm,.js-aRelaForm-cont").click(function(){
			if($(this).is('.js-aRelaForm-cont')){
				return false;
			}else{
				$(".js-autoRelaForm").css({"transition":"all cubic-bezier(0.45,1,0.45,1) 0.5s","transform":"scaleX(-180)","opacity":0});
				setTimeout(function(){
					$(".js-autoRelaForm").remove();
				}, 500);
			}
		});
	}
});

//裸浮下拉列项
$.fn.extend({
	downFullList:function(options){
		$.fn.downFullList.func={
			modle:{
				liData:[['testDFL-1','下拉列表1'],['testDFL-2','下拉列表2'],['testDFL-3','下拉列表3'],['testDFL-4','下拉列表4'],['testDFL-5','下拉列表5']]
			},
			box:{
				className:'js-downFullListBx',
				aniClasN:'CssAll-ffast',
				sty:{
					"position":"absolute",
					"left":0,
					"width":"100%",
					"z-index":20
				}
			},
			btnsty:{
				public:{
					"padding-left":"30px",
					"text-align":"left",
					"line-height":"44px",
					"color":"#333",
					"font-size":"13px",
					"background":"#fff",
					"display":"block",
					"border-bottom":"1px solid #ccc"
				},
				Write:true,
				event:'click'
			},
			liData:'default',						//如未填将启用测试数据
			evCallback:function(thiss){},			//fn绑定被触发时
			callback:function(thiss,farThis){		//列项目标、和唤醒按钮
			
			},
			nobubbleEvent:false,			//冒泡
			event:'click'
		}
		var opts=$.extend(true, {}, $.fn.downFullList.func, options),
			evtObj=$(this),
			dataObj=null,
			boxSt='',
			listDOM='',			//列表结构
			btnSt='';
						
			evtObj.attr('openStat',0);
			function creatElment(fn){
				if(opts.liData=='default'){
					dataObj=opts.modle.liData;
				}else if($.isArray(opts.liData)){
					dataObj=opts.liData;
				}else{
					alert('警告！listData有错误，请填写二维array');
				}
				for(i in opts.box.sty){
					boxSt+=i+':'+opts.box.sty[i]+'; ';
				}
				for(i in opts.btnsty.public){
					btnSt+=i+':'+opts.btnsty.public[i]+'; ';
				}
				for(var i=0;i<dataObj.length;i++){
					listDOM+='<a id="'+dataObj[i][0]+'" href="javascript:;" style="'+btnSt+'">'+dataObj[i][1]+'</a>';
				}
				$('body').append('<div class="'+opts.box.className+'" style="top:'+t+'px;'+boxSt+'">'+listDOM+'</div>');
				$('.'+opts.box.className).css('opacity',0);
				$('.'+opts.box.className).addClass(opts.box.aniClasN);
				setTimeout(function(){
					$('.'+opts.box.className).css({'opacity':1,"top":t+h});
					if(fn!==null){
						fn();
					}
				}, 30);
			}
	
		evtObj.off(opts.event);
		evtObj.on(opts.event,function(){
				This=$(this),
				dataObj=null,
				boxSt='',
				listDOM='',			//列表结构
				btnSt='',
				t=$(this).offset().top,
				h=$(this).height();
				if(typeof(opts.evCallback)=='function'){
					opts.evCallback(This);
				}
			if($(this).attr('openStat')==0){
				evtObj.attr('openStat',0);
				$(this).attr('openStat',1);
				if($('.'+opts.box.className).length>0){
					animate(t,h,function(){
						creatElment(function(){
							sonEvent();
						});
					});
				}else{
					creatElment(null);
				}
				function sonEvent(){
					$('.'+opts.box.className).find('a').on(opts.btnsty.event,function(){
						if(opts.btnsty.Write==true){
							This.text($(this).text());
						}
						if(typeof(opts.callback)=='function'){
							opts.callback($(this),This);
						}
						animate(t,h,null);
						evtObj.attr('openStat',0);
					});
				}
				sonEvent();
			}else if($(this).attr('openStat')==1){
				$(this).attr('openStat',0);
				animate(t,h,null);
			}
			function animate(t,h,fn){
				$('.'+opts.box.className).css('top',t+h+10);
				setTimeout(function(){
					$('.'+opts.box.className).css({'top':t+h-50,'opacity':0});
					setTimeout(function(){
						$('.'+opts.box.className).remove();
						if(fn!==null){
							fn();
						}
					}, 500);
				}, 300);
			}
			if(opts.nobubbleEvent){
				return false;
			}
		});
	}
});

//canvas 画布loading特效
var TimeCNB=null;
$.extend({
	canvsLoad:function(options){
		$.canvsLoad.fun={
			boxRel:{
				id:"js-canvasIdName",
				sty:{
					"position":"absolute",
					"left":0+'px',
					"top":0+'px',
					"width":"100%",
					"height":"web_Height",
					"background":"rgba(51,51,51,0.36)",
					"z-index":999
				}
			},
			canvasRel:{
				id:"js-canvasloadElm",
				sty:{
					"margin-top":'(webH-50)*0.5'
				}
			}
		}
		var opts=$.extend(true, {}, $.canvsLoad.fun,options),
			//样式
			boxSt='',
			cavSt='';
		for(i in opts.boxRel.sty){
			if(i=="top"){
				opts.boxRel.sty[i]=basicFE.bws.getWindowSize('scrolltop')+'px';
			}else if(i=="height"){
				opts.boxRel.sty[i]=GuiyiH()+'px';
			}
			boxSt+=i+':'+opts.boxRel.sty[i]+'; ';
		}
		for(i in opts.canvasRel.sty){
			if(i=="margin-top"){
				opts.canvasRel.sty[i]=(GuiyiH()-50)*0.5;
			}
			cavSt+=i+':'+opts.canvasRel.sty[i]+'; ';
		}
		strDOM='<div id="'+opts.boxRel.id+'" style="'+boxSt+'">'+
					'<canvas id="'+opts.canvasRel.id+'" style="'+cavSt+'"></canvas>'+		//id 为独立
			  '</div>';
		$("body").append(strDOM);
		function canvasFunction(){
			  var c = document.getElementById(opts.canvasRel.id),
				  ctx = c.getContext('2d'),
				  cw = c.width = 50,
				  ch = c.height = 50,
				  rand = function(a,b){return ~~((Math.random()*(b-a+1))+a);},
				  dToR = function(degrees){
					  return degrees * (Math.PI / 180);
				  },
				  circle = {
					x: (cw / 2),
					y: (ch / 2),
					radius: 20,
					speed: 12,
					rotation: 0,
					angleStart: 270,
					angleEnd: 90,
					hue: 10,
					thickness: 5,
					blur: 100
				  },
				  particles = [],
				  particleMax = 100,
				  updateCircle = function(){
					if(circle.rotation < 360){
					  circle.rotation += circle.speed;
					} else {
					  circle.rotation = 0; 
					}
				  },
				  renderCircle = function(){
					ctx.save();
					ctx.translate(circle.x, circle.y);
					ctx.rotate(dToR(circle.rotation));
					ctx.beginPath();
					ctx.arc(0, 0, circle.radius, dToR(circle.angleStart), dToR(circle.angleEnd), true);
					ctx.lineWidth = circle.thickness;    
					ctx.strokeStyle = gradient1;
					ctx.stroke();
					ctx.restore();
				  },
				  clear = function(){
					ctx.globalCompositeOperation = 'destination-out';
					ctx.fillStyle = 'rgba(0, 0, 0, .1)';
					ctx.fillRect(0, 0, cw, ch);
					ctx.globalCompositeOperation = 'lighter';		
				  }
				  loop = function(){
					clear();
					updateCircle();
					renderCircle();
				 }
			  ctx.shadowBlur = circle.blur;
			  ctx.shadowColor = 'hsla('+circle.hue+', 80%, 60%, 1)';
			  ctx.lineCap = 'round'
				
			  var gradient1 = ctx.createLinearGradient(0, -circle.radius, 0, circle.radius);
			  gradient1.addColorStop(0, 'hsla('+circle.hue+', 10%, 20%, .25)');
			  gradient1.addColorStop(1, 'hsla('+circle.hue+', 10%, 50%, 0)');
				
			  var gradient2 = ctx.createLinearGradient(0, -circle.radius, 0, circle.radius);
			  gradient2.addColorStop(0, 'hsla('+circle.hue+', 0%, 0%, 0)');
			  gradient2.addColorStop(.1, 'hsla('+circle.hue+', 0%, 0%, 0)');
			  gradient2.addColorStop(1, 'hsla('+circle.hue+', 0%, 0%, 0)');
			  /*go*/
			  TimeCNB=setInterval(loop, 30);
		}
		if(typeof(TimeCNB)=="number"){
			clearInterval(TimeCNB);			
		}
		canvasFunction();
	},
	removeCanvsload:function(){
		if($("#js-canvasloadElm").length>0){
			var c=document.getElementById('js-canvasloadElm'),
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, 50, 50);
				setTimeout(function(){
					$("#js-canvasloadElm").parent('div').remove();
					if(typeof(TimeCNB)=="number"){
						clearInterval(TimeCNB);			
					}
				},30);
		}
	}
});

//载入load svg版
$.extend({
	svgLoad:function(options){
		$.svgLoad.fun={
			body:$("body"),
			doc:$(document),
			EnvSciModel:"mobile",
			boxRel:{
				id:"js-svgFarIdName",
				sty:{
					"position":"absolute","left":0+'px',"top":0+'px',"width":"100%","height":"web_Height","background":"rgba(51,51,51,0.36)","z-index":999
				}
			},
			svg:{
				id:"js-svgsugarId",
				src:"../images/component/svg/",
				fileName:"oval.svg",		//可调不同的来做出各种动作效果
				svgSize:50,
				sty:{
					"margin-top":'(webH-50)*0.5',"width":"svgSizeNum","height":"svgSizeNum"
				}
			}
		}
		var opts=$.extend(true, {}, $.svgLoad.fun,options),boxSt='',svgSt='',gWh='',
		body=opts.body,doc=opts.doc;
		if(opts.EnvSciModel=='mobile'){
			gWh=GuiyiH();
		}else if(opts.EnvSciModel=='pc'){
			gWh=body.innerHeight();
		}	
		for(i in opts.boxRel.sty){
			if(i=="top"){
				opts.boxRel.sty[i]=doc.scrollTop()+'px';
			}else if(i=="height"){
				opts.boxRel.sty[i]=gWh+'px';
			}
			boxSt+=i+':'+opts.boxRel.sty[i]+'; ';
		}
		for(i in opts.svg.sty){
			if(i=="margin-top"){
				opts.svg.sty[i]=(gWh-opts.svg.svgSize)/2+'px';
			}else if(i=="width"){
				opts.svg.sty[i]=opts.svg.svgSize+'px';
			}else if(i=="height"){
				opts.svg.sty[i]=opts.svg.svgSize+'px';
			}
			svgSt+=i+':'+opts.svg.sty[i]+'; ';
		}
		if(body.find('#'+opts.boxRel.id).length==0){
			strDOM='<div id="'+opts.boxRel.id+'" style="'+boxSt+'">'+
						'<img id="'+opts.svg.id+'" style="'+svgSt+'" src="'+opts.svg.src+opts.svg.fileName+'"/>'+		//id 为独立
				  '</div>';
			body.append(strDOM);
		}
	},
	removeSvgload:function(options){
		$.removeSvgload.fun={
			body:$("body"),
			id:"js-svgFarIdName",
			time:500
		}
		var opts=$.extend(true, {}, $.removeSvgload.fun, options),
			time=opts.timer=null,
			body=opts.body,
			obj=body.find("#"+opts.id);
		obj.addClass("CssAll-ffast").css({"opacity":0});
		setTimeout(function(){
			obj.remove();
		}, opts.time);
	}
});

//<<switchTab选切卡
$.fn.extend({
	switchTab_code:function(options){
		$.fn.switchTab_code.func={
			btnFar:".js-SwitchTab-btn",
			tabFar:".js-SwitchTab-divWrap",
			btnSon:"a",
			tabSon:".js-SwitchTab-son",
			actName:"act",						//btn动态标实
			OtName:"other",						//其他的class
			codeName:"code-Numb",				//自定义属性编号识别名
			again:false,						//当act按钮再次被触发是否再次触发add/remove Class
			clAptArr:[],						//存储器[编号/对应下标]
			callBack:function(iThis,idx,i){},	//回调(事件目标、父级idx、目标idx)
			befcallback:function(idx,i){},
			open:'forEach',						//初始显示索引(forEach为根据结构遍历循环,数字为具体指定,也可填数组)
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.switchTab_code.func, options),
			iThis=$(this),
			iBtnson=iThis.find(opts.btnSon),
			btnFar=$(opts.btnFar),
			tabFar=$(opts.tabFar),
			actName=opts.actName,
			OtName=opts.OtName,
			codeName=opts.codeName,
			callback=opts.callBack,
			befcallback=opts.befcallback;
		
		function addRemoveClass(far,idx,i,thsis){	//btn,div_idx,evt_i,evtThis
			var obj=tabFar.eq(idx).find(opts.tabSon);
			if(typeof(befcallback)=='function'){
			    if(thsis!==null){
				    befcallback(idx,i);
			    }
			}
			if(opts.again==true){
				var agin='';			//上一次所在的索引
				for(var fa=0;fa<obj.length;fa++){
					if(obj.eq(fa).is('.'+actName)){
						agin=fa;
					}
				}
				if(agin==i){
					//nothing
				}else{
					far.removeClass(actName).eq(i).addClass(actName);
					obj.removeClass(actName).addClass(OtName).eq(i).addClass(actName).removeClass(OtName);
				}
			}else if(opts.again==false){
				far.removeClass(actName).eq(i).addClass(actName);
				obj.removeClass(actName).addClass(OtName).eq(i).addClass(actName).removeClass(OtName);
			}
			if(typeof(callback)=='function'){
			   callback(thsis,idx,i);
			}
		}
		//ini装载 编号 对应 idx
		if(opts.clAptArr.length==0){
			 iThis.each(function(idx,eml){
				 var atI=[],
					 atGet=$(this).attr(codeName),
					 atIdx=$(this).parents("body").find(opts.btnFar).index(this);
				 atI.push(atGet);
				 atI.push(atIdx);
				 $(opts.tabFar).each(function(i,elm){
					 if($(this).attr(codeName)==atGet){
						atI.push($(this).parents("body").find(opts.tabFar).index(this));
						return false;
					 }
				 });
				 opts.clAptArr.push(atI);	//atI,二维数组，[[1,0]] [按钮编号,按钮盒子idx,能对应编号盒子idx]
			 });
		}
		if(opts.open=='forEach'){			//表现执行
			iThis.each(function(idx,eml){
				var far=$(this),
					farItg=far.find(opts.btnSon),
					iN=opts.clAptArr[idx][2],
					actHave=0,				//记录遍历过程是否发现有actName的存
					actIgt=null;			//act目标储存
				farItg.each(function(i,elmt){
					if(!$(this).is('.'+actName)){
						//noMatch nothing...
					}else{
						actIgt=[i,$(this)];
						actHave++;
					}
					if(i==farItg.length-1){
						if(actHave==1){
							addRemoveClass(farItg,iN,actIgt[0],actIgt[1]);
						}else if(actHave==2){
							throw 'switchTab_code:切换按钮集合不允许同时出现2个'+actName+'在一个元素容器中！';
						}else if(actHave==0){		//没有找到act标实在结构中
							addRemoveClass(farItg,iN,0,farItg.eq(0));
						}
					}            
				});
			});
		}else if($.isArray(opts.open)){			//同个多调用设置不同init_Act_idx
			for(var i=0;i<opts.clAptArr.length;i++){
				var ia=btnFar.eq(opts.clAptArr[i][1]).find(opts.btnSon);
				addRemoveClass(ia,opts.clAptArr[i][2],opts.open[i],ia.eq(opts.open[i]));
			}
		}else if(!isNaN(opts.open)){
			for(var i=0;i<opts.clAptArr.length;i++){
				var ib=btnFar.eq(opts.clAptArr[i][1]).find(opts.btnSon);
				addRemoveClass(ib,opts.clAptArr[i][2],opts.open,ib.eq(opts.open));
			}
		}
		iBtnson.off(opts.event);
		iBtnson.on(opts.event,function(){
		 	var this_objA=$(this).parent(opts.btnFar),
				this_oBtn=this_objA.find(opts.btnSon),
				AtGet=this_objA.attr(codeName),
				idxGet=0,
				culTleng=this_objA.find(opts.btnSon).length,
				culBleng;
			for(var x in opts.clAptArr){
				if(AtGet==opts.clAptArr[x][0]){
					idxGet=opts.clAptArr[x][2];
					break;
				}
			}
			culBleng=tabFar.eq(idxGet).find(opts.tabSon).length;
			if(culTleng==culBleng){  //数量不对等对编码人员给予警示
				 var idx=$(this).parents(opts.btnFar).find(opts.btnSon).index(this);
				 addRemoveClass(this_oBtn,idxGet,idx,$(this));
			}else{
				throw "Error !The HTML document structure problem, the button number and the <Div> button is not equal.";
			}
		});
	},
	//视觉切换
	switchTab_view:function(options){
		var iThis=$(this);
		$.fn.switchTab_view.fun={
			btnFar:".js-SwitchTab-view",
			btnSon:"a",
			actName:"act",						//btn动态标实
			callBack:function(iThis,i){},	//回调(事件目标、目标idx)
			open:'forEach',						//初始显示索引(forEach为根据结构遍历循环,数字为具体指定,也可填数组)
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.switchTab_view.fun, options);
		
		function addRemoveClass(far,idx,i){
			far.removeClass(opts.actName).eq(i).addClass(opts.actName);
		}

		//ini	表现执行
		if(opts.open=='forEach'){
			iThis.each(function(idx,eml){
				 var far=$(this),
					 farItg=far.find(opts.btnSon),
					 actHave=0;				//记录整个遍历过程是否发现有actName的存
				 farItg.each(function(i,elmt){
					 if(!$(this).is('.'+opts.actName)){
						//nothing...
					 }else{
						actHave++;
						$(this).addClass(opts.actName);
					 }
					 if(i==farItg.length-1){
						if(actHave==1){
							
						}else if(actHave==2){
							alert('错误：switchTab:不允许同时出现2个'+opts.actName+'在一个元素容器中！');
						}else{		//没有找到act标实在结构中
							farItg.eq(0).addClass(opts.actName);
						}
					 }            
				 });
			});
		}else if($.isArray(opts.open)){
			for(var i=0;i<opts.open.length;i++){
				var ia=$(opts.btnFar).eq(i).find(opts.btnSon);
				ia.removeClass(opts.actName).eq(opts.open[i]).addClass(opts.actName);
			}
		}else if(!isNaN(opts.open)){
			var ib=$(opts.btnFar).find(opts.btnSon);
			ib.removeClass(opts.actName).eq(opts.open).addClass(opts.actName);
		}
		//
		iThis.find(opts.btnSon).off(opts.event);
		iThis.find(opts.btnSon).on(opts.event,function(){
		 	var this_objA=$(this).parent(opts.btnFar),
				this_oBtn=this_objA.find(opts.btnSon);

			var idx = $(this).parents(opts.btnFar).find(opts.btnSon).index(this);
				this_oBtn.removeClass(opts.actName).eq(idx).addClass(opts.actName);
				if(opts.callBack!==null){
					 opts.callBack($(this),idx);
				}
		});
	}
});

//<<一屏版列项滚动(listOption)
$.fn.extend({
	listOption:function(options){
		var iThis=$(this);
		$.fn.listOption.func={
			elmSet:".js-dwTwo-set",
			elmGet:".js-dwTwo-get",
			elmGetson:".js-dwTwo-opt",
			elmSetI:".js-dwTwo-i",
			apendView:"anim-listOption",
			listSty:{
				"text-align":"left","padding-left":14+'px',"height":44+'px',"line-height":44+'px',"color":"#333","font-size":13+'px',"display":"block","border-bottom":"1px solid #e4e4e4"
			},
			zidx:12,
			writeIn:true,
			rt:true,
			callback:function(ithis){},		//点击目标
			event:"click",
			log:false
		}
		
		var opts=$.extend( true, {}, $.fn.listOption.func, options);
		iThis.off(opts.event);
		iThis.on(opts.event,function(){
			//ini clear
			if($(".full-seclectWrap").length>0){
				$(".full-seclectWrap").remove();
			}
			//本次点击记号 独一标实
			$(this).addClass("js-id-fullSeclt");
			var oiThis=$(this),
				viewH=GuiyiH(),			//一屏高度
				dwTwoArray=[],			//抓取每项的Text
				dwTwoAryId=[],			//抓取每项后台传输的ID
				dwCallBack='',			//回调方法作用域类型判断[统一/逐一]
				dwCallBackName=[],		//回调方法名一个或多个
				each_Option='',			//按钮集合拼接字符
				TopHeiNum=viewH-$("header").height()-$("footer").height()-40,	//计算出除去头部底部高度 较为水平居中的高度峰值
				H_Option='',			//单个列项 全高
				fulsel_InsTop=0,		//根据高度情况设置其 top的值
				fulsel_InsHgt=0;		//根据高度情况设置其 height的值
				
				//为所有按钮 或 指定按钮 增加一个 或 不同个 的回调自定义方法  dwIns-allFunc   dwIns-eventFunc
				if(typeof($(this).attr('dwIns-allFunc'))!='undefined' && typeof($(this).attr('dwIns-allFunc'))!=null && typeof($(this).attr('dwIns-allFunc'))!='' && typeof($(this).attr('dwIns-eventFunc'))=='undefined'){
					dwCallBack='dwIns-allFunc';
					var nAry=$(this).attr('dwIns-allFunc').split(',');
					basicFE.arr.simpleCopy(nAry,dwCallBackName);
				}else if(typeof($(this).attr('dwIns-eventFunc'))!='undefined' && typeof($(this).attr('dwIns-eventFunc'))!=null && typeof($(this).attr('dwIns-eventFunc'))!='' && typeof($(this).attr('dwIns-allFunc'))=='undefined'){
					dwCallBack='dwIns-eventFunc';
					var nAry=$(this).attr('dwIns-eventFunc').split(',');
					basicFE.arr.simpleCopy(nAry,dwCallBackName);
				}else if(typeof($(this).attr('dwIns-eventFunc'))!='undefined' && typeof($(this).attr('dwIns-allFunc'))!='undefined'){
					alert('Error, custom attribute name (dwIns-allFunc), and custom attribute name (dwIns-eventFunc) exist in one element, which is not supported.');//错误，自定义属性名 （dwIns-allFunc） 和 自定义属性名 （dwIns-eventFunc）同时存在于一个元素中不符合支持。
				}
				//遍历子项内容
				$(this).find(opts.elmGet+' '+opts.elmGetson).each(function(i,elm){
                    dwTwoArray.push($(this).text());
					dwTwoAryId.push($(this).attr('select-option-ID'));
                });
				//插入模基
				$("body").append('<div class="full-seclectWrap js-fulSeclect-wrap" style="position:absolute; left:0; background:rgba(51,51,51,0.3); z-index:'+opts.zidx+'; display:none;">'+
									  '<div class="full-seclectIns js-fulSeclect-Ins animate-fillboth" style="position:relative; overflow:hidden; border-radius:4px; background:#fff;">'+
											'<div class="full-seclectPos js-fulSeclect-Pos"	style="position:absolute; left:0; top:0; width:100%;"></div>'+
									  '</div>'+
								 '</div>');
				for(var i=0;i<dwTwoArray.length;i++){
					var evStr='onclick="';						//点击事件名
					if(dwCallBack=='dwIns-allFunc'){
						evStr+=dwCallBackName[0]+'"';
					}else if(dwCallBack=='dwIns-eventFunc'){
						dwCallBackName[i]!=null?evStr+=dwCallBackName[i]+'"':evStr='';
					}else{							//不存在任何自定义回调方法名属性时
						evStr='';
					}
					each_Option+='<a select-option-ID="'+dwTwoAryId[i]+'" '+evStr+' href="javascript:;">'+dwTwoArray[i]+'</a>';
				}
				var obj=$(".js-fulSeclect-wrap"),
					objIns=obj.find(".js-fulSeclect-Ins"),
					objPos=objIns.find(".js-fulSeclect-Pos");
				objPos.append(each_Option);
				obj.css({
						"top":basicFE.bws.getWindowSize("scrolltop")+"px",
						"width":basicFE.bws.getWindowSize("windWidth")+"px",
						"height":viewH+"px",
						"display":"block"
				});
				var crtElm=objPos.find("a");
				basicFE.elm.forWriteStyle(crtElm,opts.listSty,function(attr,json){
					if(attr=="height"){
						H_Option=parseInt(opts.listSty[attr])+1;		//1为底边线
					}
				});
				//水平居中判断
				if(dwTwoArray.length*H_Option<TopHeiNum){		//自由居中放置	
					fulsel_InsTop=(viewH-dwTwoArray.length*H_Option)/2;
					fulsel_InsHgt=dwTwoArray.length*H_Option;
				}else{									//启用滚动方式
					fulsel_InsTop=$("header").height()+20;
					fulsel_InsHgt=TopHeiNum;
				}
				objIns.css({
					"left":17+"px",
					"top":fulsel_InsTop+"px",
					"width":basicFE.bws.getWindowSize("windWidth")-34+"px",
					"height":fulsel_InsHgt+"px"
				}).addClass(opts.apendView);
				objPos.css({"height":dwTwoArray.length*H_Option+"px"});
				//事件触发
				AddEvent_Touch(objPos);
				
				$(".js-fulSeclect-wrap,.js-fulSeclect-Pos a").click(function(){
					obj.css("display","none");
					$(".js-id-fullSeclt").removeClass("js-id-fullSeclt");
					setTimeout(function(){
						obj.remove();
					}, 500);
					if($(this).is("a")){
						var This_Text=$(this).text(),
							This_Id=$(this).attr('select-option-ID');
						if(opts.writeIn==true){
							oiThis.find(opts.elmSet).find(opts.elmSetI).text(This_Text).attr("select-opResult-ID",This_Id);
						}
						opts.callback($(this));
					}
					if(opts.rt==true){
						return false;
					}
				});
		});
	}
});

//<<满屏版列项滚动+输入填写(inputLiOption)
$.fn.extend({
	inputLiOption:function(options){
		var iThis=$(this);
		$.fn.inputLiOption.func={
			elmSet:".js-inLio-set",
			elmGet:".js-inLio-get",
			elmGetson:".js-inLio-opt",
			elmSetI:".js-inLio-i",
			choiceType:{						//once、more		单选和多选
				type:"more",
				once:{
					//nothing
				},
				more:{
					upperLimit:"NumInfinity"	//允许上限  默认NumInfinity or '指定的整数'
				}
			},
			writeIn:{
				setDOM:{      					//dom text set
					state:true
				},
				setSelf:{     					//self title or yesBtn (num)
					title:false,
					yesBtn:false
				}
			},
			boxAttr:{						//大框架属性
				bgBox:{
					"position":"absolute","top":0+"px","left":0+"px","display":"none","background":"rgba(51,51,51,0.3)","z-index":12
				},
				contBox:{
					"position":"relative","background":"#fff","border-radius":"4px","overflow":"hidden"
				},
				headBox:{					//js-fulSeclect-header
					"float":"left","width":"100%",
				},
				contInsBox:{				//js-fulSeclect-Ins
					"float":"left","position":"relative","width":"100%","overflow":"hidden"
				},
				btnCont:{
					"float":"left","width":"100%","border-top":"1px solid #e4e4e4"
				}
			},
			headElm:{						//头部元素
				titleH:{
					open:true,				//是否显示
					title:"框选标题",
					sty:{
						"height":50+"px","line-height":50+"px","color":"#333","font-size":"20px","font-weight":500,
					}
				},
				inputText:{
					open:true,				//是否显示iput
					placeholder:"请输入",		//place默认文字
					val:"",					//iput上的预设val值[通常用不到，不填即可]
					sty:{
						"width":"90%","height":32+"px","line-height":32+"px","color":"#333","font-size":"13px","font-weight":500,"border":0,"border-bottom":"1px solid #e4e4e4"
					}
				}
			},
			listSty:{
				"position":'relative',"text-align":'left',"padding-left":14+'px',"height":44+'px',"line-height":44+'px',"color":'#333',"font-size":13,"display":'block',"border-bottom":'1px solid #e4e4e4'
			},
			SelectVision:{
				type:"checkGou",		//模式有2种(checkGou、blockCorl) 出现定制图标 和 其他class样式赋值方式
				checkGou:{				//勾选按钮的样子
					"position":"absolute","right":14+"px","top":16+"px","width":20+"px","height":20+"px","background-image":"url(../images/component/u302.png)","background-size":"20px 20px"
				},
				blockCorl:{
				   class:"iputLiopClasN",   //（只允许填写单个）该class会赋予到目标上（支持单多选）
				   style:{
					   "color":"#333","background":"#e8e8e8"
				   }
				}
			},
			btnWrap:{
				type:"half",			//full & half 模式 单双按钮
				btnStr:{				//按钮id/text [排序决定按钮位置]
					typeNo:["okBtn-IdB","取消"],
					typeYes:["okBtn-IdA","确定"]
				},
				//按钮通用样式
				public:{
					"text-align":"center","height":"44px","line-height":"44px","color":"#38cf78","font-size":"16px","display":"inline-block"
				},
				btnYes:{				//yes 按钮样式,没有特殊化则一半无需填写
					"border-left":"1px solid #e4e4e4"
				},
				btnNo:{
					//nothing
				}
			},
			callback:function(iThis,iputStr,idArry){},				//(btnYes/btnNo、iput.val、id数组)
			keyUpCall:function(valStr,AbtnSty,optionBtnfn){},		//(str、AbtnSty,fn) iput keycode A button style
			optcall:function(optionAry,optionTex){},
			event:"click",
		}
		var opts=$.extend( true, {}, $.fn.inputLiOption.func, options),
			//触发器开关
			choiceType=opts.choiceType.type,						//单or多选 模式
			upperFinit=opts.choiceType.more.upperLimit,				//多选模式下的 最大选取上限
			upperNum=0;												//more模式 当前已经选择了的数目(不得大于用户设的最大的值)
			
		iThis.off(opts.event);
		iThis.on(opts.event,function(){
			//ini clear
			if($(".full-seclectWrap").length>0){
				$(".full-seclectWrap").remove();
			}
			//本次点击记号 独一标实
			$(this).addClass("js-id-fullSeclt");
			var oiThis=$(this),
				viewH=GuiyiH(),			//一屏高度
				dwTwoArray=[],			//抓取每项的Text
				dwTwoAryId=[],			//抓取每项后台传输的ID
				dwCallBack='',			//回调方法作用域类型判断[统一/逐一]
				dwCallBackName=[],		//回调方法名一个或多个
				each_Option='',			//按钮集合拼接字符
				TopHeiNum=viewH-$("header").height()-$("footer").height()-40,	//计算出除去头部底部高度 较为水平居中的高度峰值
				H_Option='',			//单个列项 全高
				fulsel_InsTop=0,		//根据高度情况设置其 top的值
				fulsel_InsHgt=0;		//根据高度情况设置其 height的值
				//为所有按钮 或 指定按钮 增加一个 或 不同个 的回调自定义方法  dwIns-allFunc   dwIns-eventFunc
				if(typeof($(this).attr('dwIns-allFunc'))!='undefined' && typeof($(this).attr('dwIns-allFunc'))!=null && typeof($(this).attr('dwIns-allFunc'))!='' && typeof($(this).attr('dwIns-eventFunc'))=='undefined'){
					dwCallBack='dwIns-allFunc';
					var nAry=$(this).attr('dwIns-allFunc').split(',');
					basicFE.arr.simpleCopy(nAry,dwCallBackName);
				}else if(typeof($(this).attr('dwIns-eventFunc'))!='undefined' && typeof($(this).attr('dwIns-eventFunc'))!=null && typeof($(this).attr('dwIns-eventFunc'))!='' && typeof($(this).attr('dwIns-allFunc'))=='undefined'){
					dwCallBack='dwIns-eventFunc';
					var nAry=$(this).attr('dwIns-eventFunc').split(',');
					basicFE.arr.simpleCopy(nAry,dwCallBackName);
				}else if(typeof($(this).attr('dwIns-eventFunc'))!='undefined' && typeof($(this).attr('dwIns-allFunc'))!='undefined'){
					alert('Error, custom attribute name (dwIns-allFunc), and custom attribute name (dwIns-eventFunc) exist in one element, which is not supported.');//错误，自定义属性名 （dwIns-allFunc） 和 自定义属性名 （dwIns-eventFunc）同时存在于一个元素中不符合支持。
				}
				//遍历子项内容
				$(this).find(opts.elmGet+' '+opts.elmGetson).each(function(i,elm){
                    dwTwoArray.push($(this).text());
					dwTwoAryId.push($(this).attr('select-option-ID'));
                });
				//样式吸取
				var bg_box='',
					cont_box='',
					hd_box='',
					Ins_box='',
					foot_box='',
					hd_til='',
					hd_ipt='',
					ft_btn='';
				//bg
				for(i in opts.boxAttr.bgBox){
					if(i=="top"){
						opts.boxAttr.bgBox[i]=basicFE.bws.getWindowSize("scrolltop");
					}
					bg_box+=i+':'+opts.boxAttr.bgBox[i]+'; ';
				}
				//cont
				for(i in opts.boxAttr.contBox){
					cont_box+=i+':'+opts.boxAttr.contBox[i]+'; ';
				}
				//hd
				for(i in opts.boxAttr.headBox){
					hd_box+=i+':'+opts.boxAttr.headBox[i]+'; ';
				}
				//ins
				for(i in opts.boxAttr.contInsBox){
					Ins_box+=i+':'+opts.boxAttr.contInsBox[i]+'; ';
				}
				//foot
				for(i in opts.boxAttr.btnCont){
					foot_box+=i+':'+opts.boxAttr.btnCont[i]+'; ';
				}
				//标题
				if(opts.headElm.titleH.open==true){
					for(i in opts.headElm.titleH.sty){
						hd_til+=i+':'+opts.headElm.titleH.sty[i]+'; ';
					}
					hd_til='<h3 style="'+hd_til+'">'+opts.headElm.titleH.title+'</h3>';
				}
				//iput
				if(opts.headElm.inputText.open==true){
					for(i in opts.headElm.inputText.sty){
						hd_ipt+=i+':'+opts.headElm.inputText.sty[i]+'; ';
					}
					hd_ipt='<input type="text" placeholder="'+opts.headElm.inputText.placeholder+'" value="'+opts.headElm.inputText.val+'" style="'+hd_ipt+'" />';
				}
				//btn
				for(i in opts.btnWrap.public){
					ft_btn+=i+':'+opts.btnWrap.public[i]+'; ';
				}
				if(opts.btnWrap.type=='full'){			//单按钮
					var btnCrrt='',
						btnSty='';
						for(i in opts.btnWrap.btnYes){
							btnSty+=i+':'+opts.btnWrap.btnYes[i]+'; ';
						}
						btnCrrt+='<a id="'+opts.btnWrap.btnStr.typeYes[0]+'" href="javascript:;" style="'+ft_btn + btnSty+'">'+opts.btnWrap.btnStr.typeYes[1]+'</a>';
				}else if(opts.btnWrap.type=='half'){	//双按钮
					var btnCrrt='',
						btnSty='';
					for(i in opts.btnWrap.btnStr){
						if(i=='typeYes'){
							for(n in opts.btnWrap.btnYes){
								btnSty+=n+':'+opts.btnWrap.btnYes[n]+'; ';
							}
						}else if(i=='typeNo'){
							for(n in opts.btnWrap.btnNo){
								btnSty+=n+':'+opts.btnWrap.btnYes[n]+'; ';
							}
						}
						btnCrrt+='<a id="'+opts.btnWrap.btnStr[i][0]+'" href="javascript:;" style="'+ft_btn + btnSty+'">'+opts.btnWrap.btnStr[i][1]+'</a>';
					}
				}
				ft_btn=btnCrrt;
				
				//插入模基
				$("body").append('<div class="js-fulSeclect-wrap" style="'+bg_box+'">'+
									  '<div class="js-fullseclect-cont" style="'+cont_box+'">'+
									  		'<div class="js-fulSeclect-header" style="'+hd_box+'">'+
												  hd_til+			//标题
												  hd_ipt+
											'</div>'+
											'<div class="js-fulSeclect-Ins" style="'+Ins_box+'">'+
												  '<div class="js-fulSeclect-Pos" style="position:absolute; left:0; top:0; width:100%;"></div>'+
											'</div>'+
											'<div class="js-fulSeclect-BtnWrap" style="'+foot_box+'">'+
												  ft_btn+
											'</div>'+
									  '</div>'+
								 '</div>');
				for(var i=0;i<dwTwoArray.length;i++){
					var evStr='onclick="';						//点击事件名
					if(dwCallBack=='dwIns-allFunc'){
						evStr+=dwCallBackName[0]+'"';
					}else if(dwCallBack=='dwIns-eventFunc'){
						dwCallBackName[i]!=null?evStr+=dwCallBackName[i]+'"':evStr='';
					}else{		//不存在任何自定义回调方法名属性时
						evStr='';
					}
					each_Option+='<a select-option-ID="'+dwTwoAryId[i]+'" '+evStr+' href="javascript:;">'+dwTwoArray[i]+'</a>';
				}
				$(".js-fulSeclect-Pos").append(each_Option);
				
				//设置样式
				$(".js-fulSeclect-wrap").css({
					"top":basicFE.bws.getWindowSize("scrolltop")+"px",
					"width":basicFE.bws.getWindowSize("windWidth")+"px",
					"height":viewH+"px",
					"display":"block"
				});
				
				var crtElm=$(".js-fulSeclect-Pos a");
				basicFE.elm.forWriteStyle(crtElm,opts.listSty,function(attr,json){
					if(attr=="height"){
						H_Option=parseInt(opts.listSty[attr])+1;			//1为底边线
					}
				});
				fulsel_InsTop = $("header").height() + 20;
				fulsel_InsHgt = TopHeiNum;
				$(".js-fullseclect-cont").css({
					"left":17+"px",
					"top":fulsel_InsTop+"px",
					"width":basicFE.bws.getWindowSize("windWidth")-34+"px",
					"height":fulsel_InsHgt+"px"
				});
				$(".js-fulSeclect-Pos").css({"height":dwTwoArray.length*H_Option+"px"});
				//按钮类型判断
				if(opts.btnWrap.type=='full'){
					$(".js-fulSeclect-BtnWrap a").css('width','100%');
				}else if(opts.btnWrap.type=='half'){
					var btnWid=parseInt($(".js-fulSeclect-BtnWrap").width()/2);
					$(".js-fulSeclect-BtnWrap").find('#'+opts.btnWrap.btnStr.typeNo[0]).css('width',btnWid+'px').end().find('#'+opts.btnWrap.btnStr.typeYes[0]).css('width',btnWid-1+'px');
				}
				//
				$(".js-fulSeclect-Ins").css({
					"height":(fulsel_InsHgt-$(".js-fulSeclect-header").height()-$(".js-fulSeclect-BtnWrap").height())+"px"
				});
				//事件触发
				AddEvent_Touch($(".js-fulSeclect-Pos"));
				
				//添加勾选的方法
				var checkGouStr='';
				for(i in opts.SelectVision.checkGou){
					checkGouStr+=i+':'+opts.SelectVision.checkGou[i]+'; ';
				}
				function apdGou(obj){
					obj.append('<span class="iptlOcheck" style="'+checkGouStr+'"></span>');
				}
				var sv_clasName=opts.SelectVision.blockCorl.class;
				function optionEvery(){
					if(choiceType=="more" && !isNaN(upperFinit)){
						upperFinit=parseInt(upperFinit);
						upperNum=0;		//more模式 当前已经选择了的数目(不得大于用户设的最大的值)
					}
					$(".js-fulSeclect-Pos a").off("click");
					$(".js-fulSeclect-Pos a").on("click",function(){
						//get And set
						if($(this).is($(".js-fulSeclect-Pos").find('a'))){
							This_Text=$(this).text(),
							This_Id=$(this).attr('select-option-ID');
							//selcet vision
							if(choiceType=="once"){					//单选
								optionAry=[];
								optionTex=[];
								//模式区分动作
								if(opts.SelectVision.type=="checkGou"){
									if($(this).find('.iptlOcheck').length>0){
										$(this).parents(".js-fulSeclect-Pos").find('.iptlOcheck').remove();
										This_Text='';
										This_Id='';
									}else{
										$(this).parents(".js-fulSeclect-Pos").find('.iptlOcheck').remove();
										apdGou($(this));
										optionAry.push(This_Id);
										optionTex.push(This_Text);
									}
								}else if(opts.SelectVision.type=="blockCorl"){
									if($(this).is('.'+sv_clasName)){
										$(".js-fulSeclect-Pos").find("a").removeClass(sv_clasName).prop('style',opLiSty);
										This_Text='';
										This_Id='';
									}else{
										$(".js-fulSeclect-Pos").find("a").removeClass(sv_clasName).prop('style',opLiSty);
										$(this).addClass(sv_clasName).prop('style',opLiSty+svBlockSty);
										optionAry.push(This_Id);
										optionTex.push(This_Text);
									}
								}
							}else if(choiceType=="more"){					//多选
								//筛选机制（将反出所有的参数）
									if(optionAry.length>0){
										for(var i=0;i<optionAry.length;i++){
											if(This_Id==optionAry[i]){		//隐藏，发现同类
												if(!isNaN(upperFinit)){
													upperNum--;
												}
												optionAry.splice(i,1);
												optionTex.splice(i,1);
												//模式区分动作
												if(opts.SelectVision.type=="checkGou"){
													$(this).find('.iptlOcheck').remove();
												}else if(opts.SelectVision.type=="blockCorl"){
													$(this).removeClass(sv_clasName).prop('style',opLiSty);
												}
												if(optionAry.length==0){
													This_Text='';
													This_Id='';
													$(".js-fulSeclect-header").find("input").val('');
												}
												break;
											}
											if(i==optionAry.length-1){		//显示，添加id
												if(!isNaN(upperFinit)){		//给设了数字
													if(upperNum<upperFinit){	
														upperNum++;
														optionAry.push(This_Id);
														optionTex.push(This_Text);
														//模式区分动作
														if(opts.SelectVision.type=="checkGou"){
															apdGou($(this));
														}else if(opts.SelectVision.type=="blockCorl"){
															$(this).addClass(sv_clasName).prop('style',opLiSty+svBlockSty);
														}
													}
												}else{
													optionAry.push(This_Id);
													optionTex.push(This_Text);
													//模式区分动作
													if(opts.SelectVision.type=="checkGou"){
														apdGou($(this));
													}else if(opts.SelectVision.type=="blockCorl"){
														$(this).addClass(sv_clasName).prop('style',opLiSty+svBlockSty);
													}
												}
												break;
											}
										}
									}else{
										if(!isNaN(upperFinit)){		//给设了数字
											upperNum++;
										}
										optionAry.push(This_Id);
										optionTex.push(This_Text);
										if(opts.SelectVision.type=="checkGou"){
											apdGou($(this));
										}else if(opts.SelectVision.type=="blockCorl"){
											$(this).addClass(sv_clasName).prop('style',opLiSty+svBlockSty);
										}
									}
									if(opts.writeIn.setSelf.title==true){			//set self title
										$(".js-fulSeclect-header").find("h3").text(opts.headElm.titleH.title+'('+optionTex.length+')');
									}
									if(opts.writeIn.setSelf.yesBtn==true){			//set self yesbtn
										$(".js-fulSeclect-BtnWrap").find('#'+opts.btnWrap.btnStr.typeYes[0]).text(opts.btnWrap.btnStr.typeYes[1]+'('+optionTex.length+')');
									}
							}
							//是否写入-htmldom
							if(opts.writeIn.setDOM.state==true){
								if(optionTex.length==1){
									This_Text=optionTex[0];
								}else if(optionTex.length>1){
									This_Text='';
									for(var i=0;i<optionTex.length;i++){
										if(i!==optionTex.length-1){
											This_Text+=optionTex[i]+',';
										}else if(i==optionTex.length-1){
											This_Text+=optionTex[i];
										}
									}
								}else{
									//报警
								}
								$(".js-fulSeclect-header").find('input').val(This_Text);
							}
						}
						//optcall
						if(typeof(opts.optcall)=='function'){
							opts.optcall(optionAry,optionTex);
						}
					});
				}
				optionEvery();
				var optionAry=[],		//反参id数组集合
					optionTex=[],		//列项文本
					opIputStr='',		//iput中的文字
					This_Text='',		//选择的文本（只要开启写入便会对文本框和目标执行写入）
					This_Id='',			//目标的id
					opLiSty='',			//列项样式字符串
					svBlockSty='';		//blockcorl模式 样式
				//a btn sty
				for(i in opts.listSty){
					opLiSty+=i+':'+opts.listSty[i]+'; ';
				}
				//blockCorl 模式自定义
				for(i in opts.SelectVision.blockCorl.style){
					svBlockSty+=i+':'+opts.SelectVision.blockCorl.style[i]+'; ';
				}	
				//iput聚焦
				$(".js-fulSeclect-header").find("input").focus(function(){
					optionAry=[];
					optionTex=[];
					This_Text='';
					This_Id='';
					$(this).val('');
					if(!isNaN(upperFinit)){		//给设了数字
						upperNum=0;
					}
					if(opts.writeIn.setSelf.title==true){			//set self title
						$(".js-fulSeclect-header").find("h3").text(opts.headElm.titleH.title);
					}
					if(opts.writeIn.setSelf.yesBtn==true){			//set self yesbtn
						$(".js-fulSeclect-BtnWrap").find('#'+opts.btnWrap.btnStr.typeYes[0]).text(opts.btnWrap.btnStr.typeYes[1]);
					}
					
					if(opts.SelectVision.type=='checkGou'){				//勾选模式
						$(".js-fulSeclect-Pos").find(".iptlOcheck").remove();
					}else if(opts.SelectVision.type=='blockCorl'){		//色块模式
						$(".js-fulSeclect-Pos").find("a").prop('style',opLiSty).removeClass(opts.SelectVision.blockCorl.class);
					}
				});
				//input keyUp
				$(".js-fulSeclect-header").find("input").on({
					"input":function(){
						if(typeof(opts.keyUpCall)=='function'){
							var valStr=$(this).val();
								This_Text=valStr;
								This_Id='id-null';
							opts.keyUpCall(valStr,opLiSty,optionEvery);		//iput.value optionSty bindFn
						}
					}
				});
				//列项,大容器框架,底部按钮,遮盖容器
				$(".js-fullseclect-cont,.js-fulSeclect-BtnWrap a,.js-fulSeclect-wrap").click(function(){
					//return
					if($(this).is(".js-fullseclect-cont")){
						return false;
					}
					//clearbox
					if($(this).is(".js-fulSeclect-wrap") || (($(this).is('#'+opts.btnWrap.btnStr.typeNo[0])||$(this).is('#'+opts.btnWrap.btnStr.typeYes[0])) && $(this).parents(".js-fulSeclect-BtnWrap").length>0)){
						//ok callback
						if($(this).is($(".js-fulSeclect-BtnWrap").find('#'+opts.btnWrap.btnStr.typeYes[0]))){
							//setId And text
							if(choiceType=="once"){			//单选模式
								if(This_Text==""){
									This_Text=$(".js-fulSeclect-header").find("input").val();
								}
								if(This_Id==""){
									This_Id="Nothing";
									optionAry="array=null";
								}
							}else if(choiceType=="more"){	//多选模式
								//多选模式请根据回调情况返参
							}
							if(opts.writeIn.setDOM.state==true){			//set-dom
								oiThis.find(opts.elmSet).find(opts.elmSetI).text(This_Text).attr("select-opResult-ID",This_Id);
							}
							//calback
							if(typeof(opts.callback)=='function'){
								var iputStr=$(".js-fulSeclect-header").find("input").val();
								opts.callback($(this),iputStr,optionAry);
							}
						}
						$(".js-fulSeclect-wrap").css("display","none");
						$(".js-id-fullSeclt").removeClass("js-id-fullSeclt");
						setTimeout(function(){
							$(".js-fulSeclect-wrap").remove();
						}, 500);
					}
				});
		});
	}
});


//区域背景色闪动+跳转
$.fn.extend({
	corlLocaView:function(options){
		var iThis=$(this);
		$.fn.corlLocaView.fun={
			filesUrl:"APIbook/",
			timeAryOia:[],						//无需修改请默认
			attrTimeName:"locaView-timer",		//自定义属性名
			cssAnClass:"CssAll-ffast",			//动画执行的class名，动画策略请写于此css中
			elmBgClor:"rgba(243,156,17,0.4)",	//rgba颜色值
			//开启/禁止，true/false颜色动画后跳转指定页面，'clv-httpAddrs'获取http地址
			location:{
				open:false,
				atrHttp:{
					//有两种模式 All/DOM, 
					//all为所有绑定的.fn通用,DOM为模式二：根据被点击目标身上的name里的自定义属性名获取对应的地址
					type:"All",
					name:"clv-httpAddrs",
					http:""				//允许填入外/内链地址，只在opts.location.atrHttp.type为'all'的时候才会触发
				}
			},
			//立刻回调,不会像或者需要等待动画，触发则立即执行
			beforCallBack:function(thiss,hrefUrl){},
			//动画执行完毕后的回调抛出(事件目标、href地址)
			callback:function(thiss,hrefUrl){},
			alarm:true,
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.corlLocaView.fun, options);
		//点击链接效果(目前还未使用，使用时将移交至Public_ViewFunc.js中)
		function IndexesBang(Elm,atName,arry,styArr){
			for(var vc=0;vc<Elm.length;vc++){
				var emptyArr=[];
				Elm.eq(vc).attr(atName,vc).attr('ini-bgClor',Elm.eq(vc).css("background-color"));
				emptyArr.push(vc,'');
				arry.push(emptyArr);
			}
		}
		function locationView(corlRGBA,obj,atName,arry,EndFunc){
			clearTimeout(arry[obj.attr(atName)]);
			arry[obj.attr(atName)][1]=obj.css("background-color");
			obj.css("background",corlRGBA);                       
			arry[obj.attr(atName)][0]=setTimeout(function (){               //创建索引的计时器
				obj.css("background-color",obj.attr('ini-bgClor'));
				if(EndFunc!=null){
					EndFunc(obj.attr("href"));
				}
			}, 400);		
		}
		iThis.addClass(opts.cssAnClass);
		IndexesBang(iThis, opts.attrTimeName, opts.timeAryOia);
		iThis.off(opts.event);
		iThis.on(opts.event,function(){
			//beforcall
			if(typeof(opts.beforCallBack)=='function'){
				var beforHref=$(this).prop('href');
				if(beforHref.indexOf(opts.filesUrl)!==-1){
					var sStart=beforHref.indexOf(opts.filesUrl)+opts.filesUrl.length,
						beforHref=beforHref.substring(sStart, beforHref.length);
				}else{
					if(opts.alarm==true){
						alert('你的根目录文件夹名不是APIbook,请修改');
					}
				}
				opts.beforCallBack($(this), beforHref);
			}
			//animatecall
			if(typeof($(this).attr('href'))!='undefined'){
				var bThis=$(this),
					bHref=$(this).prop('href');
				if(bHref!=='#' && bHref!=='' && bHref!=='javascript:;' && bHref!=='javascript:void(0);'){		//基础的href值排查
					locationView(opts.elmBgClor, $(this),opts.attrTimeName,opts.timeAryOia,function(hrefUrl){
						var openTF=null,
							locaStr="http://xxxx Or xxx/xx.html";
						
						if(opts.location.atrHttp.type=="All"){
							locaStr=opts.location.atrHttp.http;
						}else if(opts.location.atrHttp.type=="DOM"){
							if(typeof(bThis.attr(opts.location.atrHttp.name))!="undefined"){
								locaStr=bThis.attr(opts.location.atrHttp.name);
							}else{
								console.log('你选择了DOM模式，请在目标上附上自定义属性名--'+opts.location.atrHttp.name+'，并给予你所希望跳转的地址。');
							}
						}
						if(typeof(opts.callback)=='function'){
							var hreffStr=bThis.prop('href');
							if(hreffStr.indexOf(opts.filesUrl)!==-1){
								var srcStart=hreffStr.indexOf(opts.filesUrl)+opts.filesUrl.length,
									hreffStr=hreffStr.substring(srcStart, hreffStr.length);
							}else{
								if(opts.alarm==true){
									alert('你的根目录文件夹名不是APIbook,请修改');
								}
							}
							opts.callback(bThis, hreffStr);
						}
						if(opts.location.open==true){
							window.location.href=locaStr;
						}
					});
				}
			}
			return false;
		});
	}
});

//cont触屏事件
$.extend({
	contTouchEvent:function(options){
		$.contTouchEvent.fun={
			itarget:".container",
			downcall:{
				Refresh:true,
				fn:function(){}			//置顶时手指向下[刷新]
			},
			upcall:{
				fn:function(fn){}		//置底时手指向上[加载]	fn置底
			}
		}
		var opts=$.extend(true, {}, $.contTouchEvent.fun,options),
			obj_cont=$(opts.itarget),
			cot_margT=parseInt(obj_cont.css("margin-top")),
			cont_H=obj_cont.height(),
			hxd=basicFE.elm.getObjSize($('header'),2),
			fxt=$('footer').height(),
			gH=GuiyiH(),
			cot_timer=null,
			up_t=null,
			cot_starX,
			cot_starY,
			dlm,
			opc,
			mov=0,
			movN=0,
			evtSwitch=true;
		function scrolDown(){
			$("html,body").scrollTop(9999);
		}
		obj_cont.off('touchstart','touchmove','touchend');
		obj_cont.on("touchstart",function(e){
			cont_H=obj_cont.height(),
			hxd=basicFE.elm.getObjSize($('header'),2),
			fxt=$('footer').height(),
			gH=GuiyiH();
			if($(this).attr('class').indexOf('cont-NoTouch')==-1){
				if(parseInt(obj_cont.css("margin-top"))==cot_margT && evtSwitch==true){		//置顶时手指向下
					clearTimeout(cot_timer);
					opc=0;
					cot_starX=e.originalEvent.targetTouches[0].pageX;
					cot_starY=e.originalEvent.targetTouches[0].pageY;
				}else if((basicFE.bws.getWindowSize('scrolltop')+gH)==(cont_H+hxd+fxt)){	//置底时手指向上
					clearTimeout(cot_timer);
					opc=0;
					cot_starX=e.originalEvent.targetTouches[0].pageX;
					cot_starY=e.originalEvent.targetTouches[0].pageY;
				}
			}
		});
		obj_cont.on("touchmove",function(e){
			if(evtSwitch==true && basicFE.bws.getWindowSize('scrolltop')==0){
				var cot_x=e.originalEvent.targetTouches[0].pageX;
				var cot_y=e.originalEvent.targetTouches[0].pageY;
				if(cot_y>cot_starY && cot_y-cot_starY<160){
					e.preventDefault();
					if(cot_y-cot_starY>60){
						if($(".downLocaElm").length==0){
							$("body").append('<div class="downLocaElm" style="opacity:0; left:'+(al_webW-105)*0.5+'px;">下拉刷新页面</div>');
								dlm=$(".downLocaElm"),
								dlmH=dlm.height();
								dlm.css({"left":(al_webW-dlm.width())/2+"px"});
						}
						var y=parseInt(obj_cont.css("margin-top"));
						if($(".downLocaElm").length>0){
							opc=cot_y-cot_starY-60;
							$(".downLocaElm").css({"top":y-dlmH-20+"px","opacity":(0.045*opc).toFixed(2)});
						}
					}
					if(cot_y-cot_starY>120){
						$(".downLocaElm").text('释放刷新');
					}else{
						$(".downLocaElm").text('下拉刷新页面');
					}
					obj_cont.css("margin-top",cot_margT+(cot_y-cot_starY)+'px');
				}
			//置底时手指向上
			}else if((basicFE.bws.getWindowSize('scrolltop')+GuiyiH())==(cont_H+parseInt(obj_cont.css("margin-bottom"))+hxd+fxt)){
				var cot_x=e.originalEvent.targetTouches[0].pageX,
					cot_y=e.originalEvent.targetTouches[0].pageY;
				if(cot_y<cot_starY && cot_starY-cot_y<40){
					e.preventDefault();
					if(cot_y<movN){
						mov+=2;
					}
					obj_cont.css("margin-bottom",mov+'px');
					$("html,body").scrollTop(9999);
					movN=cot_y;
				}
			}
		});
		obj_cont.on("touchend",function(e){
			if(evtSwitch==true && !$(this).is('.cont-NoTouch')){
				evtSwitch=false;
				obj_cont.addClass("CssAll-ffast");
				if($(".downLocaElm").length>0){
					dlm.remove();
					if(parseInt(obj_cont.css("margin-top"))-cot_margT>120){		//跳转流程
						if(typeof(opts.downcall.fn)=='function'){
							opts.downcall.fn();
						}
						if(opts.downcall.Refresh==true){
							$("body").addClass("CssAll-ffast").css("opacity",0);
							setTimeout(function(){
								window.location.reload();
							}, 500);
						}
					}
					obj_cont.css("margin-top",cot_margT+"px");					//基础流程
					clearInterval(cot_timer);
					cot_timer=setInterval(function(){
						if(parseInt(obj_cont.css("margin-top"))==cot_margT){
							clearInterval(cot_timer);
							obj_cont.removeClass("CssAll-ffast");
							evtSwitch=true;
						}
					}, 100);
				}else{
					obj_cont.css("margin-top",cot_margT+"px");					//基础流程
					clearInterval(cot_timer);
					cot_timer=setInterval(function(){
						if(parseInt(obj_cont.css("margin-top"))==cot_margT){
							clearInterval(cot_timer);
							obj_cont.removeClass("CssAll-ffast");
							evtSwitch=true;
						}
					}, 100);
				}
			}
			if(parseInt(obj_cont.css("margin-bottom"))>$('footer').height()){
				obj_cont.css("margin-bottom",$('footer').height());
				mov=0;
				movN=0;
				clearInterval(up_t);
				up_t=setInterval(function(){
					if(parseInt(obj_cont.css("margin-bottom"))==$('footer').height()){
						clearInterval(up_t);
						if(typeof(opts.upcall.fn)=='function'){
							opts.upcall.fn(scrolDown);
						}
					}
				}, 30);
			}
		});
	}
});

//自由动画运动壳子
$.fn.extend({
	freeDomApd:function(options){
		$.fn.freeDomApd.func={
			iniPos:["bottom",0],					//初始出现的位置  触发目标的上方或者下方
			EnvSciModel:'mobile',
			box:{
				className:'js-FreeFlyBox',			//class名
				aniClasN:'freeDomApd-Animate',		//外壳所储存的CSS动画名称(请将动画名放置于组件CSS文件)
				leaveVis:'freeDomApd-AnimateLeave',	//删除已存在组件的动画
				aniDeley:'freeDomApdDeley',			//延迟的动画属性名字
				delTime:700,						//请根据实际动画持续时间在结束后做dom删除
				farSty:{
					"position":"absolute",
					"left":0,
					"top":"屏幕当前位置顶部",
					"width":"100%",
					"height":'根据模式全屏值',
					"background":"rgba(255,255,255,0)",
					"z-index":20
				},sty:{
					"position":"absolute",
					"right":6,
					"width":"auto",
				}
			},
			apdDom:"承载内容,调用时append.HTML",
			callback:function(iTs){},		//eventObj
			nobubbleEvent:"touchmove",
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.freeDomApd.func, options),
			evObj=$(this),
			clasN=opts.box.className,
			aiClsN=opts.box.aniClasN,
			leavCls=opts.box.leaveVis,
			aniDeley=opts.box.aniDeley,
			setTim=opts.setTime=null,
			iniPos=opts.iniPos,
			fsty='',
			sty='';
		evObj.each(function(i,elm){
			$(this).attr('openState',0);
		});
		evObj.off(opts.event);
		evObj.on(opts.event,function(){
			iniStyle();
			var ths=$(this),
				h=basicFE.elm.getObjSize(ths,2),
				w=basicFE.elm.getObjSize(ths,1),
				t=ths.offset().top,
				l=ths.offset().left,
				srtop=basicFE.bws.getWindowSize("scrolltop"),
				top="",
				delay='';				//动画延迟
			if(ths.attr('openState')==1){
				ths.attr('openState',0);
			}else if(ths.attr('openState')==0){
				ths.attr('openState',1);
			}
			if($(this).attr('openState')==1){
				$(".js-freedom-Itarget").removeClass("js-freedom-Itarget");
				var Dom='<div class="freedom-touchNth" style="'+fsty+'">'+
							  '<div class="js-freedom-Itarget '+clasN+' '+delay+'" style="'+sty+'">'+opts.apdDom+'</div>'+
						'</div>';
				$("body").append(Dom);
				var aH=basicFE.elm.getObjSize($(".js-freedom-Itarget"),2);
				if(iniPos[0]=="top"){				//确定放置方位
					top=t-srtop-aH+parseInt(iniPos[1]);
				}else if(iniPos[0]=="bottom"){
					top=t-srtop+h+parseInt(iniPos[1]);
				}
				$(".js-freedom-Itarget").css("top",top).addClass(aiClsN);
				if(typeof(opts.callback)=="function"){
					opts.callback($(this));
				}
			}
			var freedNth=$(".freedom-touchNth");
			freedNth.on(opts.nobubbleEvent,function(e){
				e.preventDefault();
				return false;
			});
			freedNth.on(opts.event,function(){
				$("."+clasN).removeClass(aiClsN).addClass(leavCls);
				clearTimeout(setTim);
				setTim=setTimeout(function(){
					ths.attr('openState',0);
					freedNth.remove();
				}, opts.box.delTime);
			});
		});
		function iniStyle(){
			for(i in opts.box.farSty){
				var xr=opts.box.farSty[i];
				if(i=="top"){
					xr=basicFE.bws.getWindowSize("scrolltop");
				}
				if(i=="height"){
					if(opts.EnvSciModel=='mobile'){
						xr=GuiyiH();
					}else if(opts.EnvSciModel=='pc'){
						xr=basicFE.bws.getWindowSize("windHeight");
					}
				}
				fsty+=i+':'+xr+'; ';
			}
			for(i in opts.box.sty){
				sty+=i+':'+opts.box.sty[i]+'; ';
			}
		}
	}
});

//自定义绑定元素侦测滑动方向信息
$.fn.extend({
	addTouchInfor:function(options){
		$.fn.addTouchInfor.func={
			ExecuType:false,		//是否限制,false为无限制,有限制例'x' or 'y'
			ernX:40,				//允许对其X,Y设置误差距离
			ernY:40,
			maopao:[false,'x',80],	//是否阻止滚动[是否开启,横向/纵向,滚动触发距离]
			callbackLeft:function(){},
			callbackRight:function(){},
			callbackTop:function(){},
			callbackBottom:function(){}
		}
		var opts=$.extend(true, {}, $.fn.addTouchInfor.func, options),
			evObj=$(this),
			ExT=opts.ExecuType,
			ePdft=opts.ePreventDefault=false,
			sX=opts.sX=0,
			sY=opts.sY=0,
			mX=opts.mX=0,
			mY=opts.mY=0,
			ernX=opts.ernX,
			ernY=opts.ernY,
			fnA=opts.callbackLeft,
			fnB=opts.callbackRight,
			fnC=opts.callbackTop,
			fnD=opts.callbackBottom;
		evObj.on('touchstart',function(e){
			sX=e.originalEvent.targetTouches[0].pageX;
			sY=e.originalEvent.targetTouches[0].pageY;
			ePdft=false;
		});
		evObj.on('touchmove',function(e){
			mX=e.originalEvent.targetTouches[0].pageX;
			mY=e.originalEvent.targetTouches[0].pageY;
			$(".userTbox").find(".cop").text('mX:'+mX+'; mY:'+mY);
			if(opts.maopao[0]==true){
				if(ePdft==false){
					if(opts.maopao[1]=='x' && Math.abs(mX-sX)>opts.maopao[2]){
						ePdft=opts.maopao[1];
					}
					if(opts.maopao[1]=='y' && Math.abs(mY-sY)>opts.maopao[2]){
						ePdft=opts.maopao[1];
					}
					//确保初始能够一直滚动
					if(opts.maopao[1]=='x' && Math.abs(mX-sX)<=opts.maopao[2]){
						e.preventDefault();
					}
					if(opts.maopao[1]=='y' && Math.abs(mY-sY)<=opts.maopao[2]){
						e.preventDefault();
					}
				}else{
					e.preventDefault();
				}
			}else{
				e.preventDefault();
			}
		});
		evObj.on('touchend',function(e){
			var actType=[],
				ebX='',
				ebY='';
			if(sX>mX && mX!==0){		//left
				if(ExT==false || ExT=='x'){
					if(sX>mX+ernX){
						actType.push('left');
						ebX=sX-mX;
					}
				}
			}else if(sX<mX && mX!==0){	//right
				if(ExT==false || ExT=='x'){
					if(sX<mX-ernX){
						actType.push('right');
						ebX=mX-sX;
					}
				}
			}
			if(sY>mY && mY!==0){		//up
				if(ExT==false || ExT=='y'){
					if(sY>mY+ernY){
						actType.push('up');
						ebY=sY-mY;
					}
				}
			}else if(sY<mY && mY!==0){	//down
				if(ExT==false || ExT=='y'){
					if(sY<mY-ernY){
						actType.push('down');
						ebY=mY-sY;
					}
				}
			}
			if(actType.length>1){
				if(ebX>=ebY){
					callfn(actType[0]);
				}else{
					callfn(actType[1]);
				}
			}else{
				callfn(actType[0]);
			}
			function callfn(name){
				var fnRT;
				if(name=='left'){
					fnRT=fnA();
				}else if(name=='right'){
					fnRT=fnB();
				}else if(name=='up'){
					fnRT=fnC();
				}else if(name=='down'){
					fnRT=fnD();
				}
				return fnRT;
			}
			sX=0,sY=0,mX=0,mY=0;
		});
	}
});

//触屏长按监控
$.fn.extend({
	touchTimeCtrol:function(options){
		$.fn.touchTimeCtrol.func={
			timeLength:8,
			evTime:100,						//循环事件频率
			PreDefault:false,				//是否阻止默认事件传递(暂不生效，不好说)
			callback:function(thiss){},		//满足长按需求时候激活
			everyCallback:function(thiss,addnum){},		//每次频率传递时触发回调，可配合循环evTime做关系使用
			nothCallback:function(thiss){}	//松开时回调
		}
		var opts=$.extend(true, {}, $.fn.touchTimeCtrol.func, options),
			evObj=$(this),
			timeLength=opts.timeLength,
			time=opts.time=null,
			addNum=opts.addNum=0,
			x=opts.x=0,
			y=opts.y=0,
			mx=opts.mx=0,
			my=opts.my=0;
			evObj.off('touchstart touchmove touchend');
			evObj.on('touchstart',function(e){
				e.preventDefault();
				var thiss=$(this);
					x=e.originalEvent.targetTouches[0].pageX;
					y=e.originalEvent.targetTouches[0].pageY;
					mx=x;
					my=y;
				clearInterval(time);
				time=setInterval(function(){
					addNum++;
					if(addNum>timeLength){
						clearInterval(time);
						addNum=0;
						if(x==mx && y==my){
							if(typeof(opts.callback)=="function"){
								opts.callback(thiss);
							}
						}
					}
					if(typeof(opts.everyCallback)=="function"){
						opts.everyCallback(thiss,addNum);
					}
				}, opts.evTime);
				if(opts.PreDefault==true){
					return false;
				}
			});
			evObj.on('touchmove',function(e){
				e.preventDefault();
				mx=e.originalEvent.targetTouches[0].pageX;
				my=e.originalEvent.targetTouches[0].pageY;
				if(x==mx && y==my){
					clearInterval(time);
				}
			});
			evObj.on('touchend',function(e){	//离开时间是根据需求，满足判断时候绑定
				e.preventDefault();
				clearInterval(time);
				addNum=0;
				if(mx==x && my==y){
					if(typeof(opts.nothCallback)=="function"){
						opts.nothCallback($(this));
					}
				}
			});
	}
});

//置顶自由文本设置框（元素版）
$.fn.extend({
	focusPosTex:function(options){
		$.fn.focusPosTex.func={
			model:{
				EnvSciModel:"mobile",
				mtrGetClass:"focusPtItg",	//设置目标文本获取目标元素的class
				dafultTex:"no/no",			//input dafult value,true可填目标字符赋予 和 自定义
				placeholder:"请输入文字",
				btnTex:"确定"
			},box:{
				"position":"absolute","left":0,"top":"scrolltop","width":"100%","height":"windowsH","background":"rgba(51,51,51,0.3)","z-index":20
			},iputSty:{
				"float":"left","padding":"0 10px","width":"100%","height":"44px","background":"#fff","border":"2px solid red"
			},btnSty:{
				"float":"left","width":60+"px","height":44+"px","line-height":44+"px","color":"#fff","font-size":"13px","border-radius":"0 4px 4px 0","background":"red"
			},callback:function(thiss,value){},
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.focusPosTex.func, options),
			evObj=$(this),
			EnvSciModel=opts.model.EnvSciModel,
			boxSty="",iputSty="",btnSty="",bwid="",
			callbackVal=opts.callbackVal=null,
			modelEvt=null;			//双模式事件
			if(EnvSciModel=='pc'){	//模式决定内置事件
				modelEvt="click";
			}else if(EnvSciModel=='mobile'){
				modelEvt="touchend";
			}
			evObj.off(opts.event);
			evObj.on(opts.event,function(){
				iniStyle();
				$("body").append('<div class="js-focusPosTexBx CssAll-ffast" style="'+boxSty+'"><input class="js-focusPosTexbIput" type="text" placeholder="'+opts.model.placeholder+'" style="'+iputSty+'" /><a class="obtn" href="javascript:;" style="'+btnSty+'">'+opts.model.btnTex+'</a></div>');
				var iThis=$(this),
					iTg=null,
					fabox=$(".js-focusPosTexBx"),
					fsIput=$(".js-focusPosTexbIput"),
					oBtn=fabox.find(".obtn");
				fsIput.focus();
				if(evObj.is("."+opts.model.mtrGetClass)){
					iTg=$(this);
				}else if($(this).find("."+opts.model.mtrGetClass).length>0){
					iTg=$(this).find("."+opts.model.mtrGetClass);
				}
				if(typeof(opts.model.dafultTex)=="string" && opts.model.dafultTex!=="no/no"){	//文本获取模式
					fsIput.val(opts.model.dafultTex);
				}else if(typeof(opts.model.dafultTex)=="boolean" && opts.model.dafultTex==true){
					fsIput.val(iTg.text());
				}
				fsIput.on(modelEvt,function(){
					return false;
				});
				fabox.on(modelEvt,function(){
					delBox($(this),null);
				});
				oBtn.on(modelEvt,function(){
					delBox($(this),iTg);
					return false;
				});
				$(document).off('keydown');
				$(document).on("keydown",{num:13,obj:oBtn,itg:iTg},keyCode);	//code13 enter
			});
			function iniStyle(){
				for(i in opts.box){
					var xst=opts.box[i];
					if(i=="top"){
						xst=basicFE.bws.getWindowSize("scrolltop");
					}
					if(i=="height"){
						if(EnvSciModel=="mobile"){
							xst=GuiyiH();
						}else if(EnvSciModel=="pc"){
							xst=basicFE.bws.getWindowSize("windHeight");
						}else{
							alert("focusPosTex组件错误警告：应用环境填写错误，请填写'mobile'或'pc'。")
						}
					}
					boxSty+=i+':'+xst+'; ';
				}
				for(i in opts.btnSty){
					if(i=="width"){
						bwid=opts.btnSty[i];
					}
					btnSty+=i+':'+opts.btnSty[i]+'; ';
				}
				for(i in opts.iputSty){
					var nb=opts.iputSty[i];
					if(i=="width"){
						nb=basicFE.bws.getWindowSize("windWidth")-parseInt(bwid);
					}
					iputSty+=i+':'+nb+'; ';
				}
			}
			function delBox(obj,igt){
				var obfar;
				if(obj.is(".obtn")){
					obfar=obj.parents(".js-focusPosTexBx");
				}else if(obj.is(".js-focusPosTexBx")){
					obfar=obj;
				}
				obfar.css({"opacity":0});
				callbackVal=obfar.find('input').val();
				if(igt!==null){
					igt.text(callbackVal);
				}
				setTimeout(function(){
					obfar.remove();
					if(typeof(opts.callback)=='function' && obj.is(".obtn")){
						opts.callback(obj,callbackVal);
					}
				}, 500);
			}
			function keyCode(event){
				var e= event || window.event;
				if(e.keyCode==event.data.num){
					delBox(event.data.obj,event.data.itg);
				}
			}
	}
});

//置顶自由文本设置框（全局版）
$.extend({
	focusPosTexW:function(options){
		$.focusPosTexW.func={
			model:{
				EnvSciModel:"mobile",
				mtrGetClass:"focusPtItg",	//设置目标文本获取目标元素的class
				dafultTex:"no/no",			//input dafult value,true可填目标字符赋予 和 自定义
				placeholder:"请输入文字"
			},
			box:{
				"position":"absolute","left":0,"top":"scrolltop","width":"100%","height":"windowsH","background":"rgba(51,51,51,0.3)","z-index":20
			},
			iputSty:{
				"float":"left","padding":"0 10px","width":"100%","height":"44px","background":"#fff","border":"2px solid red"
			},
			btnSty:{
				"float":"left","width":60+"px","height":44+"px","line-height":44+"px","color":"#fff","font-size":"13px","border-radius":"0 4px 4px 0","background":"red"
			},
			callback:function(thiss,value){}
		}
		var opts=$.extend(true, {}, $.focusPosTexW.func, options),
			EnvSciModel=opts.model.EnvSciModel,
			boxSty="",iputSty="",btnSty="",bwid="",
			callbackVal=opts.callbackVal=null,
			modelEvt=null;				//双模式事件
			if(EnvSciModel=='pc'){		//模式决定内置事件
				modelEvt="click";
			}else if(EnvSciModel=='mobile'){
				modelEvt="touchend";
			}
			for(i in opts.box){
				var xst=opts.box[i];
				if(i=="top"){
					xst=basicFE.bws.getWindowSize("scrolltop");
				}
				if(i=="height"){
					if(EnvSciModel=="mobile"){
						xst=GuiyiH();
					}else if(EnvSciModel=="pc"){
						xst=basicFE.bws.getWindowSize("windHeight");
					}else{
						alert("focusPosTex组件错误警告：应用环境填写错误，请填写'mobile'或'pc'。")
					}
				}
				boxSty+=i+':'+xst+'; ';
			}
			for(i in opts.btnSty){
				if(i=="width"){
					bwid=opts.btnSty[i];
				}
				btnSty+=i+':'+opts.btnSty[i]+'; ';
			}
			for(i in opts.iputSty){
				var nb=opts.iputSty[i];
				if(i=="width"){
					nb=basicFE.bws.getWindowSize("windWidth")-parseInt(bwid);
				}
				iputSty+=i+':'+nb+'; ';
			}
			$("body").append('<div class="js-focusPosTexBx CssAll-ffast" style="'+boxSty+'"><input class="js-focusPosTexbIput" type="text" placeholder="'+opts.model.placeholder+'" style="'+iputSty+'" /><a class="obtn" href="javascript:;" style="'+btnSty+'">确定</a></div>');
		var iTg=$("."+opts.model.mtrGetClass),
			fabox=$(".js-focusPosTexBx"),
			fsIput=$(".js-focusPosTexbIput"),
			oBtn=fabox.find(".obtn");
			fsIput.focus();
			if(typeof(opts.model.dafultTex)=="string" && opts.model.dafultTex!=="no/no"){	//文本获取模式
				fsIput.val(opts.model.dafultTex);
			}else if(typeof(opts.model.dafultTex)=="boolean" && opts.model.dafultTex==true){
				fsIput.val(iTg.text());
			}
			fsIput.on(modelEvt,function(){
				return false;
			});
			fabox.on(modelEvt,function(){
				delBox($(this),null);
			});
			oBtn.on(modelEvt,function(){
				delBox($(this),iTg);
				return false;
			});
			$(document).off('keydown');
			$(document).on("keydown",{num:13,obj:oBtn,itg:iTg},keyCode);	//code13 enter
			function delBox(obj,igt){
				var obfar;
				if(obj.is(".obtn")){
					obfar=obj.parents(".js-focusPosTexBx");
				}else if(obj.is(".js-focusPosTexBx")){
					obfar=obj;
				}
				obfar.css({"opacity":0});
				callbackVal=obfar.find('input').val();
				if(igt!==null){
					igt.text(callbackVal);
				}
				setTimeout(function(){
					obfar.remove();
					if(typeof(opts.callback)=='function' && obj.is(".obtn")){
						opts.callback(obj,callbackVal);
					}
				}, 500);
			}
			function keyCode(event){
				var e= event || window.event;
				if(e.keyCode==event.data.num){
					delBox(event.data.obj,event.data.itg);
				}
			}
	}
});

//自制滚动条[滑轮滚动]+[点击拖拽]适用于PC端
$.fn.extend({
	mouseScroll:function(options){			//绑定容器box
		$.fn.mouseScroll.fun={
			ctrlBx:"js-mousescroll-content",
			ctrl:"js-mousescroll-Inscontent",
			btnBx:"js-mousescroll-track",
			btn:"js-mousescroll-trackBtn",
			EnvSciModel:"pc",
			incallback:function(unbindFuc){}
		}
		var opts=$.extend(true, {}, $.fn.mouseScroll.fun, options),
			iThis=$(this),
			sclItg=null,		//滚动触发的目标
			o=opts.o={},
			n=opts.n=1,
			//obj var
			ctl=iThis.find("."+opts.ctrl),
			ctlB=iThis.find("."+opts.ctrlBx),
			btn=iThis.find("."+opts.btn),
			btnB=iThis.find("."+opts.btnBx),
			//number var
			btnH=opts.BTNheight=0,	 
			btnBxH=opts.BTNboxHeight=0,
			btnN=opts.BtnNum=0,
			ctrlBx=opts.ULboxheight=0,
			ctrlI=opts.ULheight=0,
			luoh=opts.LuoHou=btnN/100,
			direct=opts.direct=0,
			modelEvt=opts.modelEvt=null,
			bEvtJson={
				pc:{
					star:"mousedown",
					move:"mousemove",
					live:"mouseup",
					type:"pc"
				},
				mobile:{
					star:"touchstart",
					move:"touchmove",
					live:"touchend",
					type:"mobile"
				}
			}			
			if(opts.EnvSciModel=='pc'){
				modelEvt=bEvtJson.pc;
			}else if(opts.EnvSciModel=='mobile'){
				modelEvt=bEvtJson.mobile;
			}
			function restData(){
				if(ctl.height()>btnB.height()){
					//<--内容高度/可见区域的高度 = 滚动条的高度/滚动区域的高度
					btnB.css("display","block");
					btnH=ctlB.height()*(ctlB.height()/ctl.height());
				}else{
					btnB.css("display","none");
					btnH=ctlB.height();
				}
				btnBxH=btnB.height();
				btnN=btnBxH-btnH;
				ctrlBx=ctlB.height();
				ctrlI=ctl.height();
				luoh=btnN/100;
				btn.css("height",btnH);
			}
			restData();
			function abc(){
				var top=parseInt(btn.css('top')),
					BFB=(top/btnN).toFixed(2),
					setLih=-(ctrlI-ctrlBx)*BFB;
				sclItg.find("."+opts.ctrl).css("top",setLih + "px");
				sclItg.find("."+opts.btn).css("top",Math.ceil(direct*luoh)+"px");
			}
			var unbind=opts.unbind=function(){
				document.removeEventListener('DOMMouseScroll', scrollFunc, false);
			}
			var scrollFunc=opts.scrollfunction=function(e){
				restData();
				e = e || window.event;
				if(e.wheelDelta){  	//判断浏览器IE，谷歌滑轮事件             
					if(e.wheelDelta>0){ //当滑轮向上滚动时
						direct-=3;
						if(direct<=0){
							direct=0;
						}
					}
					if(e.wheelDelta<0){ //当滑轮向下滚动时
						direct+=3;
						if(direct>=100){
							direct=100;
						}
					}
				}else if(e.detail){		//Firefox滑轮事件
					if(e.detail>0){		//当滑轮向上滚动时
						direct+=4;
						if(direct>=100){
							direct=100;
						}
					}
					if(e.detail<0) { //当滑轮向下滚动时
						direct-=4;
						if(direct<=0){
							direct=0;
						}
					}
				}
				abc();
			}
			iThis.on('mouseenter',function(){
				restData();			//每鼠标进入重置尺寸
				sclItg=iThis;
				if(typeof(opts.incallback)=="function"){
					opts.incallback(unbind);
				}
				if(document.addEventListener){				//给页面绑定滑轮滚动事件
					document.addEventListener('DOMMouseScroll', scrollFunc, false);
				}
				window.onmousewheel = document.onmousewheel = scrollFunc;	//滚动滑轮触发scrollFunc方法
			});
			iThis.on('mouseleave',function(){
				document.removeEventListener('DOMMouseScroll', scrollFunc, false);
				window.onmousewheel = document.onmousewheel = null;
			});
			return btn.each(function(i){
				$(this).on(modelEvt.star,function(e){
					var pitX,pitY;
					if(opts.EnvSciModel=='pc'){
						pitX=e.pageX,
						pitY=e.pageY;
					}else if(opts.EnvSciModel=='mobile'){
						pitX=e.originalEvent.targetTouches[0].pageX,
						pitY=e.originalEvent.targetTouches[0].pageY;
					}
					o.iTop=$(this).position().top-pitY;      //$(this).position().top  代表被点击事件的top/left数值获取
					o.iLeft=$(this).position().left-pitX;    //pageX、pageY 属性是鼠标指针的位置，相对于文档的上边缘。
					n++;
					$this=$(this);                      //将此触发目标保存起来；
					$this.css({'z-index':n});             //这个是设置2个方块或多个，谁的层级关系最高；
					//解决 嵌套在类似miniui 鼠标拖拽时进入选区而造成拖拽失控的bug,固有此左右蒙版得以完美解决
					var wKua=basicFE.bws.getWindowSize("windWidth"),
						wGao=basicFE.bws.getWindowSize("windHeight");
					$("body").append('<div class="mosScrlMoveNoEvt"></div><div class="mosScrlMoveNoEvtR"></div>');
					$(".mosScrlMoveNoEvt").css({
						"position":"absolute",
						"left":0,
						"top":0,
						"width":$(this).offset().left,
						"height":wGao,
						"z-index":99
					});
					$(".mosScrlMoveNoEvtR").css({
						"position":"absolute",
						"left":$(this).offset().left+basicFE.elm.getObjSize($(this),1),
						"top":0,
						"width":wKua-($(this).offset().left+basicFE.elm.getObjSize($(this),1)),
						"height":wGao,
						"z-index":99
					});
					$(document).on(modelEvt.move,function(e){
						var potX,potY;
						if(opts.EnvSciModel=='pc'){
							potX=e.pageX,
							potY=e.pageY;
						}else if(opts.EnvSciModel=='mobile'){
							potX=e.originalEvent.targetTouches[0].pageX,
							potY=e.originalEvent.targetTouches[0].pageY;
						}
						var iLeft=potX+o.iLeft,
							iTop=potY+o.iTop;
						if(opts.out){    //可跑出框时
							if(iLeft<-$this.parent().offset().left-parseInt($this.parent().css("border-left-width"))){
								iLeft = -$this.parent().offset().left-parseInt($this.parent().css("border-left-width"));
							}else if(iLeft>wKua-$this.width()-parseInt($this.css("border-left-width"))-parseInt($this.css("border-right-width"))-$this.parent().offset().left-parseInt($this.parent().css("border-left-width"))){
								iLeft = wKua-$this.width()-parseInt($this.css("border-left-width"))-parseInt($this.css("border-right-width"))-$this.parent().offset().left-parseInt($this.parent().css("border-left-width"));
							}
							if(iTop<-$this.parent().offset().top-parseInt($this.parent().css("border-top-width"))+$(document).scrollTop()){
								iTop = -$this.parent().offset().top-parseInt($this.parent().css("border-top-width"))+$(document).scrollTop();
							}else if(iTop>$(window).height()+$(document).scrollTop()-$this.height()-parseInt($this.css("border-top-width"))-parseInt($this.css("border-bottom-width"))-$this.parent().offset().top-parseInt($this.parent().css("border-top-width"))){
								iTop = $(window).height()+$(document).scrollTop()-$this.height()-parseInt($this.css("border-top-width"))-parseInt($this.css("border-bottom-width"))-$this.parent().offset().top-parseInt($this.parent().css("border-top-width"));
							}
						}else{      //如果是限制不能跑出框架的情况
							if(iLeft<0){
								iLeft = 0;
							}else if(iLeft>$this.parent().width()-$this.width()-parseInt($this.css("border-left-width"))-parseInt($this.css("border-right-width"))){
								iLeft = $this.parent().width()-$this.width()-parseInt($this.css("border-left-width"))-parseInt($this.css("border-right-width"));
							}
							if(iTop<0){
								iTop = 0;
							}else if(iTop>$this.parent().height()-$this.height()-parseInt($this.css("border-top-width"))-parseInt($this.css("border-bottom-width"))){
								iTop = $this.parent().height()-$this.height()-parseInt($this.css("border-top-width"))-parseInt($this.css("border-bottom-width"));
							}
						}
						$this.css({
							'left':iLeft+"px",
							'top':iTop+"px"
						});
						offParameter($this);
					});
					$(document).on(modelEvt.live,function(){
						$(document).off(modelEvt.move);  
						$(document).off(modelEvt.live);		 //鼠标在元素上 松开按钮会发生此事件；
						$(".mosScrlMoveNoEvt").remove();
						$(".mosScrlMoveNoEvtR").remove();
					});
					return false;
				});
			});
			function offParameter(thiss){
				var bHgt=thiss.height(),
					bxHgt=btnB.height(),
					bNumb=bxHgt-bHgt,
					bcTop=parseInt(thiss.css("top")),
					bFB=(bcTop/bNumb).toFixed(2),
					setH=-(ctl.height()-ctlB.height())*bFB;
					ctl.css("top",setH+"px");
				//拖拽时 同时同步计算 滚动的数值
				direct=Math.floor(bcTop/luoh);
				return direct;
			}
	},
	mouseScrollAGMT:function(options){		//监视程序 希特勒的盖世太保
		$.fn.mouseScrollAGMT.fun={
			ctrlBx:"js-mousescroll-content",
			ctrl:"js-mousescroll-Inscontent",
			btnBx:"js-mousescroll-track",
			btn:"js-mousescroll-trackBtn"
		}
		var opts=$.extend(true, {}, $.fn.mouseScrollAGMT.fun, options),
			iThis=$(this),
			iTiCtrl=iThis.find("."+opts.ctrl),
			iTiCtrlBx=iThis.find("."+opts.ctrlBx),
			iTiBtn=iThis.find("."+opts.btnBx);
			if(iTiCtrl.height()>iTiBtn.height()){
				//<--内容高度/可见区域的高度 = 滚动条的高度/滚动区域的高度
				iTiBtn.css("display","block");
				btnH=(iTiCtrl.height()/iTiBtn.height())*iTiBtn.height();
				if(btnH>iTiBtn.height()){
					btnH=iTiCtrlBx.height()*iTiCtrlBx.height()/iTiCtrl.height();
				}
			}else{
				iTiBtn.css("display","none");
				iTiCtrl.animate({top:0}, 450);
				btnH=iTiCtrlBx.height();
			}
			iThis.find("."+opts.btn).css("height",btnH);
	}
});

/* 泡芙文字提示 区别于之前那种，该种能根据目标做偏移 和 自由坐标定位 */
$.fn.extend({
	bubbleTilTex:function(options){			//绑定容器box
		$.fn.bubbleTilTex.fun={
			Tex:"组件默认提示",
			body:$("body"),
			class:"js-bubbleTilTex-box",
			animateClas:"CssAll-ffast",
			posType:"all",			//坐标计算方式2模式，start (0,0)、all (0+width,0)
			left:6,
			top:0,
			sty:{
				"position":"absolute","padding-left":13+"px","padding-right":13+"px","height":24+"px","line-height":24+"px","color":"#fff","font-size":13+"px","background":"rgba(0,0,0,0.65)","border-radius":12+"px","display":"block","z-index":99
			},
			duration:1000
		}
		var opts=$.extend(true, {}, $.fn.bubbleTilTex.fun, options),
			body=opts.body,
			iThis=$(this),
			clas=opts.class,
			sty='',
			dom='';
		for(i in opts.sty){
			sty+=i+':'+opts.sty[i]+'; ';
		}
		dom='<div class="'+clas+'" style="'+sty+'">'+opts.Tex+'</div>';
		body.find('.'+clas).remove();
		body.append(dom);
		var igt=body.find('.'+clas),
			igtWid=basicFE.elm.getObjSize(iThis,1),
			igtLeft=iThis.offset().left,
			igtTop=iThis.offset().top,
			oLeft=0,
			oTop=0;
		if(opts.posType=="all"){
			oLeft=igtLeft+igtWid+parseInt(opts.left);
			oTop=igtTop+parseInt(opts.top);
		}else if(opts.posType=="start"){
			oLeft=igtLeft+parseInt(opts.left);
			oTop=igtTop+parseInt(opts.top);
		}
		igt.css({"left":oLeft,"top":oTop,"opacity":0});
		setTimeout(function(){
			igt.addClass(opts.animateClas).css("opacity",1);
		}, 30);
		setTimeout(function(){
			igt.css("opacity",0);
			setTimeout(function(){ //wait css3 fadeOut
				igt.remove();
			}, 500);
		}, opts.duration);
	}
});

/* 弱消息推送 */
$.extend({
	microInfPush:function(options){			//绑定容器box
		$.microInfPush.fun={
			Tex:"这是一条消息推送的默认文本",
			EnvSciModel:'pc',
			animateClas:"CssAll-microInfPush",
			locaHref:[false],				//是否能点击跳转页面 [true,"http://www.baidu.com"]  or [false]
			comtinTime:2500,				//持续显示时间，到期后消失
			position:{
				direction:"right",			//出现方向 left or right
				top:"80%"					//距离顶部多少 可填具体值 和 百分比
			},
			sty:{
				Bx:{
					"position":"absolute",
					"left":"functionNum",
					"top":"functionNum",
					"padding":14+"px",
					"width":280+'px',
					"background":"rgba(0,0,0,0.6)",
					"display":"inline-block",
					"box-sizing":"border-box",
					"border-radius":"8px 0 0 0",
					"border-top":"1px solid #ccc",
					"border-left":"1px solid #ccc",
					"border-right":"1px solid #ccc",
					"border-bottom":"3px solid #00bced",
					"z-index":999
				},
				InsBx:{
					"width":"100%",
					"display":"inline-block"
				},
				Tex:{
					"text-align":"left",
					"width":"100%",
					"display":"block",
					"font-size":"13px",
					"color":"#fff"
				},
				clos:{
					"position":"absolute",
					"right":4+'px',
					"top":4+'px',
					"width":16+'px',
					"height":16+'px',
					"display":"none",
					"background":"url(../images/component/microInfPush-clos.png) no-repeat",
					"background-size":"16px 16px"
				}
			}
		}
		var opts=$.extend(true, {}, $.microInfPush.fun, options),
			EnvSciModel=opts.EnvSciModel,
			webHgt=0,
			Tex=opts.Tex,
			TexDom="",			//文本呈像
			//样式存储
			bxSt="",
			InsbxSt="",
			texSt="",
			cloSt="",
			//
			direct="",			//放置的方向
			topNc="",			//距离顶高度
			leftNc="",			//距离X
			dom="";				//全部结构
		if(EnvSciModel=='pc'){
			webHgt=basicFE.bws.getWindowSize("windHeight");
		}else if(EnvSciModel=='mobile'){
			webHgt=GuiyiH();
		}
		for(i in opts.position){
			if(i=="direction"){
				if(opts.position[i]=="right"){
					direct="right";
				}else{
					direct="left";
				}
			}
			if(i=="top"){
				if(!isNaN(parseInt(opts.position[i]))){
					if(opts.position[i].indexOf("%")!==-1){	//百分比
						var simN=parseInt(opts.position[i])*0.01;
						topNc=webHgt*simN+basicFE.bws.getWindowSize("scrolltop");
					}else{
						topNc=parseInt(opts.position[i])+basicFE.bws.getWindowSize("scrolltop");
					}
				}else{
					alert("error:!!填写的组件top高度无法解析成数值类型");
				}
			}
		}
		//
		for(i in opts.sty.Bx){
			var bxstZ=opts.sty.Bx[i];
			if(i=="top"){
				bxstZ=parseInt(topNc)+'px';
			}
			if(i=="width"){
				leftNc=opts.sty.Bx[i];
			}
			if(i!=="left" && i!=="right"){
				bxSt+=i+':'+bxstZ+'; ';
			}
		}
		bxSt+=direct+':'+(parseInt(leftNc)*-1)+'px;';
		for(i in opts.sty.InsBx){
			var insbxstZ=opts.sty.InsBx[i];
			if(i=="top"){
				insbxstZ=topNc;
			}
			if(i!=="left" && i!=="right"){
				InsbxSt+=i+':'+insbxstZ+'; ';
			}
		}
		for(i in opts.sty.Tex){
			texSt+=i+':'+opts.sty.Tex[i]+'; ';
		}
		for(i in opts.sty.clos){
			cloSt+=i+':'+opts.sty.clos[i]+'; ';
		}
		dom='<div class="js-microInfPush-Bx '+opts.animateClas+'" style="'+bxSt+'">'+
				  '<div class="js-microInfPush-InsBx" style="'+InsbxSt+'">'+
						//will append dom
				  '</div>'+
				  '<a class="clos" href="javascript:;" style="'+cloSt+'"></a>'+
			'</div>';
		$("body").append(dom);
		var Bx=$(".js-microInfPush-Bx").last(),
			InsBx=Bx.find(".js-microInfPush-InsBx");
		if(opts.locaHref[0]==true){
			if(typeof(opts.locaHref[1])=="string" && opts.locaHref[1].length>0){
				TexDom='<a href="'+opts.locaHref[1]+'" style="'+texSt+'">'+Tex+'</a>';
			}
		}else{
			TexDom='<span style="'+texSt+'">'+Tex+'</span>';
		}
		InsBx.append(TexDom);
		Bx.off('mouseenter');
		Bx.on('mouseenter',function(){
			$(this).find(".clos").css("display","block");
			if(timStaut==1){	//已过期
				clearInterval(seIntim);
				viewNop=1;
				Bx.css("opacity",1);
			}else{
				clearTimeout(defulatTim);
			}
		});
		Bx.off('mouseleave');
		Bx.on('mouseleave',function(){
			$(this).find(".clos").css("display","none");
			if(timStaut==1){	//已过期
				seIntout();
			}else{
				defultTimeGo();
			}
		});
		Bx.find(".clos").off('click');
		Bx.find(".clos").on('click',function(){
			$(this).parents(".js-microInfPush-Bx").remove();
		});
		setTimeout(function(){
			Bx.css(direct,0);
		}, 100);
		//消失
		var viewNop=1,
			timStaut=0,		//是否满足过期时间
			seIntim=null,
			defulatTim=null;
		function defultTimeGo(){
			defulatTim=setTimeout(function(){
				timStaut=1;
				seIntout();
			}, opts.comtinTime);
		}
		defultTimeGo();
		function seIntout(){
			seIntim=setInterval(function(){
				viewNop-=0.02;
				if(viewNop<0){
					viewNop=0;
					clearInterval(seIntim);
					Bx.remove();
				}
				Bx.css("opacity",viewNop);
			}, 30);
		}
	}
});

//
$.fn.extend({
	LEDnumber:function(options){
    $.fn.LEDnumber.fuc={
		num:0,
		fontWidth:20,
		nav:{
			class:"s-nav",
			bgColor:"#000"
		},
		scale:[1,0.8],
		model:{
			fastView:false
		}
	}
    var opts=$.extend(true, {}, $.fn.LEDnumber.fuc, options),
		navClas=opts.nav.class,
		iObj=$(this),
		Nav=iObj.find("."+navClas),
		num=opts.num,
		tim=opts.tim,
		sizeWid=opts.fontWidth,
		bgColor=opts.nav.bgColor,
		scale=opts.scale,
		sNm=opts.sNm=num,//sNm=opts.sNm=num>0?num-1:num
		bili=4,
		h=sizeWid/4,
		sDiv=h/3*2,				//获得未转角度前div的正方width
		tDiv=sizeWid-sDiv,		//由于是菱形，左右各减去一半
		arry=[
			[1,2,3,5,6,7],[2,6],[1,2,4,5,7],[1,2,4,6,7],
			[2,3,4,6],[1,3,4,6,7],[1,3,4,5,6,7],[1,2,6],
			[1,2,3,4,5,6,7],[1,2,3,4,6]
		];
		if(Nav.length==0){
			var rlt='';
			for(var i=0;i<7;i++){
				rlt+='<div class="'+navClas+'" code="'+(i+1)+'"><i class="left"></i><i class="right"></i></div>';
				if(i==6){
					rlt='<div class="farBx">'+rlt+'</div>';
				}
			}
			iObj.append(rlt);
			Nav=iObj.find("."+navClas);
			iObj.css({"position":"relative"});
			iObj.find(".farBx").css({"position":"absolute","transform-origin":"center","transition":"all cubic-bezier(0.25,1,0.45,1) 0.6s"});
			Nav.css({"position":"absolute","width":tDiv,"height":h,"background":bgColor,"opacity":0,"transition":"all ease 0.45s"});
			Nav.find('.left,.right').css({"position":"absolute","top":(h-sDiv)/2,"width":sDiv,"height":sDiv,"transform-origin":"center","transform":"rotate(45deg)","background":bgColor,"display":"block","transition":"transform ease 0.6s"});
			Nav.find('.left').css({"left":-sDiv/2});
			Nav.find('.right').css({"left":tDiv+(-sDiv/2)});
			Nav.each(function(i,elm){
				var cod=$(this).attr('code');
				if(cod=="1"){
					$(this).css({"left":sDiv,"top":0});
				}else if(cod=="2"){
					$(this).css({"left":tDiv-sDiv,"top":h+(sDiv+sDiv/2),"transform":"rotate(90deg)"});
				}else if(cod=="3"){
					$(this).css({"left":-h-sDiv/2,"top":h+(sDiv+sDiv/2),"transform":"rotate(90deg)"});
				}else if(cod=="4"){
					$(this).css({"left":sDiv,"top":tDiv+sDiv});
				}else if(cod=="5"){
					$(this).css({"left":-h-sDiv/2,"top":tDiv+h*2+sDiv,"transform":"rotate(90deg)"});
				}else if(cod=="6"){
					$(this).css({"left":tDiv-sDiv,"top":tDiv+h*2+sDiv,"transform":"rotate(90deg)"});
				}else if(cod=="7"){
					$(this).css({"left":sDiv,"top":(tDiv+sDiv)*2});
				}
			});
		}
		iObj.find(".farBx").css({'width':sizeWid+sDiv,'height':(sizeWid+sDiv)*2,"transform":"scale("+scale[1]+")"});
		clearTimeout(tim);
		if(scale[0]!==scale[1]){
			tim=setTimeout(function(){
				iObj.find(".farBx").css({"transform":"scale("+scale[0]+")"});
			}, 1000);
		}
		iObj.css({'width':sizeWid+sDiv,'height':(sizeWid+sDiv)*2});
		function navEach(nmb){
			Nav.removeClass('disp');
			Nav.each(function(i,elm){
				for(var v=0;v<arry[(nmb)].length;v++){
					if($(this).attr("code")==arry[(nmb)][v]){
						$(this).addClass('disp');
					}
				}
				if($(this).is('.disp')){
					$(this).css("opacity",1);
				}else{
					$(this).css("opacity",0);
				}
			});
		}
		if(opts.model.fastView==false){
			navEach(sNm);
		}else if(opts.model.fastView==true){
			var I=opts.I=0,
				optsFst=opts.optsFst;
			optsFst=setInterval(function(){
				I++;
				if(I==5){
					clearInterval(optsFst);
					navEach(sNm);
				}else{
					var rdm=parseInt(Math.random()*10);
					navEach(rdm);
				}
			}, 200);
		}		
  }
});

$.fn.extend({
	colprogressBar:function(options){
		$.fn.colprogressBar.func={
			window:window,
			num:'15%',
			width:200,
			height:28,
			insBor:2,						//该值与track style 一致
			cssClas:"colprogressBarTran",
			track:{
				class:"js-colprogBar",		//多填逗号分割(第一个class为操纵对象)
				space:4,					//padding值
				sty:{
					"width":"opts.width","height":"opts.height","border":"2px solid #000","border-radius":8+"px","background":"rgba(0,0,0,0.2)","opacity":0
				}
			},
			bar:{
				class:"js-colprogBarIns",	//多填 逗号分割
				sty:{
					"left":"auto","top":"auto","width":"opts.width","height":"opts.height","border-radius":4+"px","background":"rgba(0,237,229,1)"
				}
			}
		}
		var opts=$.extend(true, {}, $.fn.colprogressBar.func, options),
			iThis=$(opts.window.document.body).find($(this)),
			aWid=opts.aWid=parseInt(opts.width),
			aHgt=opts.aHgt=parseInt(opts.height),
			space=opts.space=parseInt(opts.track.space),
			num=opts.num,
			insBor=parseInt(opts.insBor),
			traClas=opts.track.class,
			barClas=opts.bar.class,
			tracSty='',
			barSty='',
			track=traClas.indexOf(',')>-1?$("."+traClas.split(',')[0]):"."+traClas,
			bar=barClas.indexOf(',')>-1?$("."+barClas.split(',')[0]):"."+barClas;
		if(iThis.find(track).length==0){
			for(i in opts.track.sty){
				if(i=="width"){
					opts.track.sty[i]=aWid+"px";
				}
				if(i=="height"){
					opts.track.sty[i]=aHgt+"px";
				}
				tracSty+=i+':'+opts.track.sty[i]+'; ';
			}
			for(i in opts.bar.sty){
				if(i=="width"){
					opts.bar.sty[i]=0+"px";
				}
				if(i=="height"){
					opts.bar.sty[i]=aHgt-space*2-insBor*2+"px";
				}
				if(i=="left"||i=="top"){
					opts.bar.sty[i]=space;
				}
				barSty+=i+':'+opts.bar.sty[i]+'; ';
			}
			var str='<div class="'+basicFE.str.arraySplitVar(opts.track.class,[',',' '])+'" style="'+tracSty+'">'+
						  '<div class="'+basicFE.str.arraySplitVar(opts.bar.class,[',',' '])+'" style="'+barSty+'">'+
						  '</div>'+
					'</div>';
			iThis.append(str);
		}else{		//is hava
			for(i in opts.bar.sty){
				if(i=="width"){
					opts.bar.sty[i]=iThis.find("."+barClas).width()+"px";
				}
				if(i=="height"){
					opts.bar.sty[i]=aHgt-space*2-insBor*2+"px";
				}
				if(i=="left"||i=="top"){
					opts.bar.sty[i]=space;
				}
				barSty+=i+':'+opts.bar.sty[i]+'; ';
			}
			iThis.find(bar).attr('style',barSty);
		}
		track=traClas.indexOf(',')>-1?$("."+traClas.split(',')[0]):"."+traClas;
		bar=barClas.indexOf(',')>-1?$("."+barClas.split(',')[0]):"."+barClas;
		iThis.find(track).addClass(opts.cssClas).css({'position':'relative','opacity':1});
		iThis.find(bar).addClass(opts.cssClas);
		iThis.find(track).css({"padding":space,"width":aWid,"box-sizing":"border-box"});
		if(!isNaN(parseInt(num))){
			if((num+'').indexOf('.')>-1&&(num+'')[0]=='0'){
				num=parseFloat(opts.num).toFixed(2);
			}else if((num+'').indexOf('%')>-1){
				num=parseInt(num)/100;
			}else if(typeof(num)=='number'&&num<=100){
				num=num/100;
			}else{
				throw 'malagebi!!!Input value is too large';
			}
		}
		setTimeout(function(){
			iThis.find(bar).css({'position':'absolute','width':((aWid-space*2-insBor*2)/100*(num*100)).toFixed(2)});
		}, 100);
	}
});
//增减组件
$.fn.extend({
	increaseMinusTool:function(options){
		$.fn.increaseMinusTool.func={
			viewModel:2,			//展示类型1,2[简约,全展示]
			pubSty:{
				tSize:32,			//横向transverse
				lSize:32,			//纵向longitudinal
				vPad:12,			//viewBox 左右内边距
				borCorl:"#e4e4e4",	//边线颜色
				borWidth:1,			//边线宽度
				borType:"solid",	//边线模式
			},
			main:{
				class:"js-incrMinuT-far",
				sty:{"position":"relative","width":"pubSty.tSize","height":"pubSty.lSize","line-height":"lSize","box-sizing":"border-box","overflow":"hidden"}
			},
			attr:{
				maxIput:["maxi-num",99]	//操作属性名和最大范围
			},
			btn:{
				labelType:"a",		//标签类型
				add:{
					class:"js-incrMinuT-next",
					sty:{"position":"absolute","top":"0","left":"0","width":"pubSty.tSize","height":"pubSty.lSize","border":"pubSty.borCorl+wid+type","box-sizing":"border-box","display":"block","background":"url(../images/component/increaseMinusTool_add.png) center center no-repeat","background-size":"14px 14px"}
				},
				minus:{
					class:"js-incrMinuT-prev",
					sty:{"position":"absolute","top":"0","right":"0","width":"pubSty.tSize","height":"pubSty.lSize","border":"pubSty.borCorl+wid+type","box-sizing":"border-box","display":"block","background":"url(../images/component/increaseMinusTool_minus.png) center center no-repeat","background-size":"14px 14px"}
				}
			},
			viewBox:{
				class:"js-innderc-viewbox",
				sty:{"position":"absolute","left":"pubSty.tSize","top":0,"text-align":"center","padding":"pubSty.vPad","width":"auto","height":"pubSty.lSize","line-height":"pubSty.lSize","font-size":13+"px","border":0,"border":"pubSty.borCorl+wid+type","box-sizing":"border-box","display":"none"}
			},
			callback:function(Main,num,max){},		//每次点击回调	main,num,max
			returnS:true,		//阻止冒泡
			event:'click'
		}
		var opts=$.extend(true, {}, $.fn.increaseMinusTool.func, options),
			iThis=$(this),
			//data
			tSize=opts.pubSty.tSize,lSize=opts.pubSty.lSize,		//xSize,ySize
			borColr=opts.pubSty.borCorl,
			borWid=opts.pubSty.borWidth,
			borType=opts.pubSty.borType,
			borStyAll=borWid+'px '+borType+' '+borColr,
			styMain='',styNext='',styPrev='',styView='',
			//var
			model=opts.viewModel,
			clas_main=opts.main.class,
			clas_add=opts.btn.add.class,
			clas_min=opts.btn.minus.class,
			clas_view=opts.viewBox.class,
			atMax=opts.attr.maxIput,
			//obj
			main=$('.'+clas_main),
			btn=iThis.find('.'+clas_add+',.'+clas_min);
		
		for(i in opts.main.sty){		//main style
			var ts=opts.main.sty[i];
			if(i=="width"){	ts=tSize+'px';}
			if(i=="height" || i=="line-height"){ts=lSize+'px';}
			styMain+=i+':'+ts+'; ';
		}
		for(i in opts.btn.add.sty){		//add
			var bs=opts.btn.add.sty[i];
			if(i=="width"){	bs=tSize+'px';}
			if(i=="height" || i=="line-height"){bs=lSize+'px';}
			if(i=="border"){bs=borStyAll;}
			if(i=="border-top"||i=="border-bottom"||i=="border-left"||i=="border-right"){continue;}
			styNext+=i+':'+bs+'; ';
		}
		for(i in opts.btn.minus.sty){	//minus
			var gs=opts.btn.minus.sty[i];
			if(i=="width"){	gs=tSize+'px';}
			if(i=="height" || i=="line-height"){gs=lSize+'px';}
			if(i=="border"){gs=borStyAll;}
			if(i=="border-top"||i=="border-bottom"||i=="border-left"||i=="border-right"){continue;}
			styPrev+=i+':'+gs+'; ';
		}
		for(i in opts.viewBox.sty){		//viewbox
			var qs=opts.viewBox.sty[i];
			if(i=="left"){qs=tSize+'px';}
			if(i=="width"){qs='auto';}
			if(i=="height"){qs=lSize+'px';}
			if(i=="line-height"){qs=lSize-(parseInt(borWid)*2)+'px';}
			if(i=="border"){qs=borStyAll;}
			if(i=="border-top"||i=="border-bottom"||i=="border-left"||i=="border-right"){continue;}
			if(i=="padding"){qs='0 '+opts.pubSty.vPad+'px';}
			if(i=="padding-top"||i=="padding-bottom"||i=="padding-left"||i=="padding-right"){continue;}
			styView+=i+':'+qs+'; ';
		}
		main.each(function(i,elm){		//ini loading this
			var sNt=$(this).find("."+clas_add),
				sPr=$(this).find("."+clas_min),
				sVb=$(this).find("."+clas_view);
			$(this).attr("style",styMain);
			sNt.attr("style",styNext);
			sPr.attr("style",styPrev);
			sVb.attr("style",styView);
			if(typeof($(this).attr(atMax[0]))=='undefined'){
				$(this).attr(atMax[0],atMax[1]);
			}
			var viewBox=$(this).find("."+clas_view),
				tex=parseInt(viewBox.text());
			if(tex==0||viewBox.text()==''){
				viewBox.text(0);
				if(model==1){
					publicControl($(this),['add']);
				}
			}else if(tex>0){
				if(tex==$(this).attr(atMax[0])){		//初始值=max值初始出减
					if(model==1){
						publicControl($(this),['minu','view']);
					}
				}else if(tex>$(this).attr(atMax[0])){
					viewBox.text($(this).attr(atMax[0]));
					if(model==1){
						publicControl($(this),['minu','view']);
					}
				}else{	//全显示
					publicControl($(this),['minu','view','add']);
				}
			}else if(tex.length==null&&isNaN(tex)){
				throw 'mlgb!!!The content in viewbox must be an integer, not NaN';
			}
			if(model==2){
				publicControl($(this),['add','view','minu']);
			}
		});
		btn.off(opts.event);
		btn.on(opts.event,function(){
			var gMain=$(this).parents("."+clas_main),
				gView=gMain.find("."+clas_view),
				maxN=parseInt(gMain.attr(atMax[0])),
				num=parseInt(gView.text());
			if($(this).is('.'+clas_add)){
				num++;
				if(num>=maxN){
					num=maxN;
					gView.text(num);
					if(model==1){
						publicControl(gMain,['minu','view']);
					}
					opts.callback(gMain,num,maxN);
					if(opts.returnS==true){return false;}else{return;}
				}
			}else{
				num--;
				if(num<=0){
					num=0;
					gView.text(num);
					if(model==1){
						publicControl(gMain,['add']);
					}
					opts.callback(gMain,num,maxN);
					if(opts.returnS==true){return false;}else{return;}
				}
			}
			opts.callback(gMain,num,maxN);
			gView.text(num);
			publicControl(gMain,['minu','view','add']);
			if(opts.returnS==true){return false;}else{return;}
		});
		function publicControl(ithis,array){	//array分别代表 prev view next,请确保viewbox中设值一定在此方法调用before
			var oPrev=ithis.find("."+clas_min),
				oView=ithis.find("."+clas_view),
				oNext=ithis.find("."+clas_add),
				combo=[false,false,false];		//
			oPrev.css("display","none");
			oView.css("display","none");
			oNext.css("display","none");
			for(var i=0;i<array.length;i++){
				if(array[i]=='minu'){
					combo[0]=true;
					oPrev.css("display","block");
				}
				if(array[i]=='view'){
					combo[1]=true;
					oView.css("display","block");
				}
				if(array[i]=='add'){
					combo[2]=true;
					oNext.css("display","block");
				}
			}
			//combo changge style
			var siVw=oView.width()+parseInt(oView.css("padding-left"))+parseInt(oView.css("padding-right")),
				boxSet='';
			if(combo[0]==true && combo[1]==true && combo[2]==false){		//=-
				oPrev.css({"left":siVw+"px"});
				oView.css({"left":0,"border-left":borStyAll,"border-right":0});
				boxSet=siVw+parseInt(tSize);
			}else if(combo[0]==false && combo[1]==false && combo[2]==true){	//+
				oNext.css({"left":0});
				boxSet=parseInt(tSize);
			}else if(combo[0]==true && combo[1]==true && combo[2]==true){	//-=+
				oPrev.css({"left":0});
				oView.css({"left":tSize+"px","border-left":0,"border-right":0});
				oNext.css({"left":(tSize+siVw)+"px"});
				boxSet=siVw+parseInt(tSize)*2;
			}
			ithis.css({"width":boxSet});	//viewbox sizeSetting
		}
	},
	increaMinMonitor:function(options){		//$fn.increaseMinusTool()的监听程序
		$.fn.increaMinMonitor.func={
			class:{
				add:"js-incrMinuT-next",
				minus:"js-incrMinuT-prev",
				viewbox:"js-innderc-viewbox"
			},
			attr:{
				maxIput:"maxi-num"
			},
			pubSty:{
				borCorl:"#e4e4e4",	//边线颜色
				borWidth:1,			//边线宽度
				borType:"solid",	//边线模式
			}
		}
		var opts=$.extend(true, {}, $.fn.increaMinMonitor.func, options),
			iThis=$(this),		//main
			ClsAdd=opts.class.add,
			ClsMin=opts.class.minus,
			ClsViw=opts.class.viewbox,
			maxName=opts.attr.maxIput,
			//obj
			Next=iThis.find("."+ClsAdd),
			Prev=iThis.find("."+ClsMin),
			View=iThis.find("."+ClsViw),
			//num
			Max=parseInt(iThis.attr(maxName)),
			Val=parseInt(View.text()),
			combo=[false,false,false],
			borColr='',borWid='',borType='',borStyAll='';
		if(Val>Max){
			View.text(Max);
		}

		var tSize="",
			vPad=View.width()+parseInt(View.css("padding-left"))+parseInt(View.css("padding-right")),
			rslt=0,
			iObj=null;
		if(Prev.css("display")!=='none'){
			iObj=Prev;
		}else if(Next.css("display")!=='none'){
			iObj=Next;
		}
		tSize=iObj.width()+parseInt(iObj.css("border-left-width"))+parseInt(iObj.css("border-right-width"));
		borColr=iObj.css("border-left-color");
		borWid=iObj.css("border-left-width");
		borType=iObj.css("border-left-style");
		borStyAll=borWid+' '+borType+' '+borColr;
		if(Prev.css("display")!=='none'){combo[0]=true;rslt+=tSize;}
		if(View.css("display")!=='none'){combo[1]=true;rslt+=vPad;}
		if(Next.css("display")!=='none'){combo[2]=true;rslt+=tSize;}
		//comboStyle setting
		if(combo[0]==true && combo[1]==true && combo[2]==false){		//=-
			Prev.css({"left":vPad+"px"});
			View.css({"left":0,"border-left":borStyAll,"border-right":0});
		}else if(combo[0]==false && combo[1]==false && combo[2]==true){	//+
			Next.css({"left":0});
		}else if(combo[0]==true && combo[1]==true && combo[2]==true){	//-=+
			Prev.css({"left":0});
			View.css({"left":tSize+"px","border-left":0,"border-right":0});
			Next.css({"left":(tSize+vPad)+"px"});
		}
		iThis.css("width",rslt);
	}
});
//数字虚拟键盘
$.fn.extend({
	keyboardNumber:function(options){
		$.fn.keyboardNumber.func={
			mask:{
				sty:{
					"position":"absolute","left":0,"top":"scrollTop","width":"100%","height":"windowHgt","background":"none","z-index":99
				}
			},
			main:{/*nothing*/},
			solidUp:{
				sty:{
					"width":"100%","height":40+"px","border-top":"1px solid #e3e3e3","box-sizing":"border-box","background":"url(../images/component/keyboardNumber-solidup.png) center center no-repeat #f5f5f5"
				}
			},
			btn:{
				aSty:{		//0~9
					"float":"left","width":"func","height":"func","line-height":"func","border":"1px solid #e3e3e3","box-sizing":"border-box","color":"#333","font-size":18+"px","background":"#f5f5f5"
				},
				bSty:{
					"float":"left","width":"func","height":"func","line-height":"func","border":"1px solid #e3e3e3","box-sizing":"border-box","background":"#dfe0e0"
				},
				delBgImg:"../images/component/keyboardNumber-del.png"
			},
			float:true,				//是否允许输入小数点true/false
			callback:function(ithis,text){},	//写入目标,结果文本
			event:['click','click','click']		//多个事件，[创建触发/键盘点击/清除键盘]
		}
		var opts=$.extend(true, {}, $.fn.keyboardNumber.func, options),
			iThis=$(this),
			//webSize
			sTo=basicFE.bws.getWindowSize("scrolltop"),
			bW=basicFE.bws.getWindowSize("windWidth"),
			bH=basicFE.bws.getWindowSize("innerHgt"),
			gI=bW>bH?bH:bW,
			mI=bW>bH?bW:bH,
			bnm=parseInt(gI/3),
			hgt=Math.ceil(bnm/1.9852),
			lSize=[bnm,bW-bnm*2],
			//style
			StyMsk='',StyMain='',StySolid='',StyCont='',StyBa='',StyBb='';
		for(i in opts.mask.sty){
			var rlt=opts.mask.sty[i];
			if(i=='top'){
				rlt=basicFE.bws.getWindowSize("scrolltop")+'px';
			}
			if(i=='height'){
				rlt=basicFE.bws.getWindowSize("innerHgt")+'px';
			}
			StyMsk+=i+':'+rlt+'; ';
		}
		for(i in opts.solidUp.sty){
			var sU=opts.solidUp.sty[i];
			StySolid+=i+':'+sU+'; ';
		}
		for(i in opts.btn.aSty){
			var rst=opts.btn.aSty[i];
			if(i=='height'){
				rst=hgt+'px';
			}
			if(i=="line-height"){
				rst=hgt+'px';
			}
			StyBa+=i+':'+rst+'; ';
		}
		for(i in opts.btn.bSty){
			var rslt=opts.btn.bSty[i];
			if(i=='height'){
				rslt=hgt+'px';
			}
			if(i=="line-height"){
				rslt=hgt+'px';
			}
			StyBb+=i+':'+rslt+'; ';
		}
		iThis.off(opts.event[0]);
		iThis.on(opts.event[0],function(){
			creatKeyBoard();
			
		});
		function creatKeyBoard(){
			sTo=basicFE.bws.getWindowSize("scrolltop");
			bW=basicFE.bws.getWindowSize("windWidth");
			bH=basicFE.bws.getWindowSize("innerHgt");	
			if($(".js-keyboar-fullMasking").length==0){
				var	dom='<div class="js-keyboar-fullMasking">'+
							  '<div class="js-keyboar-main">'+
									'<div class="js-keyboar-solidUp"></div>'+
									'<div class="js-keyboar-cont">'+
										  '<a class="js-keyboar-type-a" href="javascript:;">1</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">2</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">3</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">4</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">5</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">6</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">7</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">8</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">9</a>'+
										  '<a class="js-keyboar-type-b js-keyboar-point" href="javascript:;">.</a>'+
										  '<a class="js-keyboar-type-a" href="javascript:;">0</a>'+
										  '<a class="js-keyboar-type-b js-keyboar-delete" href="javascript:;"></a>'+
									'</div>'+
							  '</div>'+
						'</div>';
				$("body").append(dom);
				var Omsk=$(".js-keyboar-fullMasking"),
					Omain=Omsk.find(".js-keyboar-main"),
					Oslid=Omain.find(".js-keyboar-solidUp"),
					Ocont=Omain.find(".js-keyboar-cont"),
					Obtn=Ocont.find("a"),
					ObtnA=Ocont.find(".js-keyboar-type-a"),
					ObtnB=Ocont.find(".js-keyboar-type-b");
				Omsk.attr("style",StyMsk);
				Oslid.attr("style",StySolid);
				ObtnA.attr("style",StyBa);
				ObtnB.attr("style",StyBb);
				Ocont.find(".js-keyboar-delete").css({
					"background-image":'url('+opts.btn.delBgImg+')',
					"background-position":"center center",
					"background-repeat":"no-repeat"
				});
				Omain.css({"float":"left","width":"100%"});
				for(var i=0;i<13;i++){
					if(i%3==1){						//中间纵向
						Obtn.eq(i).css("width",lSize[1]);
					}else{
						Obtn.eq(i).css("width",lSize[0]);
					}
				}
				setTimeout(function(){
					Omain.css({"margin-top":bH-Omain.height()});
				}, 30);
				//evt
				Obtn.on(opts.event[2],function(){
					return false;
				});
				Obtn.on(opts.event[1],function(){
					var hav=iThis.text(),
						n=$(this).text(),
						set='';
					if(!$(this).is(".js-keyboar-delete")){
						if(opts.float==true && $(this).is(".js-keyboar-point")){
							if(hav.indexOf('.')==-1){
								set=hav+n;
							}else{
								set=hav;
							}
							iThis.text(set);
						}else if($(this).is(".js-keyboar-type-a")){
							set=hav+n;
							if(hav.indexOf('0')==0&&hav.indexOf('.')==-1){	//仅整0
								set=n;
							}
							iThis.text(set);
						}
					}else{
						if(hav.length>1){
							set=hav.substring(0,hav.length-1);
						}else{
							set=0;
						}
						iThis.text(set);
					}
					opts.callback(iThis,iThis.text());
					return false;
				});
				Omsk.on(opts.event[2],function(){
					var hav=iThis.text();
					if(hav.indexOf('.')==hav.length-1){	//发现最后字符为.则自动删除.
						iThis.text(hav.substring(0,hav.length-1));
					}
					opts.callback(iThis,iThis.text());
					Omsk.css("display","none");
				});
			}else{
				$(".js-keyboar-fullMasking").css({"top":sTo+"px","display":"block"});
			}
		}
	}
});

//父级触发 集群 显示/隐藏  -- 初始隐藏
$.extend({
	evtVibli:function(options,other,that){
		$.evtVibli.fuc={
			role:'',					//权力角色
			farName:'.js-viewBili-far',	//默认关系元素名
			sonName:'.js-viewBili-li',
			iElm:'.js-viewBili-son',
			rt:true,					//事件冒泡
			callback:function(){},		
			event:"touchstart",
			log:false					//通用
		}
		function fnLog(str){
			if(opts.log){
				console.log('function_evtVibli:'+str);
			}
		}
		var opts=$.extend( true, {}, $.evtVibli.fuc, options);
		$(opts.farName+','+opts.sonName).off(opts.event);
		$(opts.farName+','+opts.sonName).on(opts.event,function(){
			var iThis=$(this);
			if(iThis.is(opts.sonName)){
				var cg_elm=$(this).find(opts.iElm);
				if(cg_elm.css("display")=="none"){			//显示
					$(opts.farName).find(opts.iElm).css("display","none");
					cg_elm.css("display","block");
				}else{	//隐藏
					cg_elm.css("display","none");
				}
			}
			if(iThis.is(opts.farName)){
				var cg_elm=$(this).find(opts.iElm);
				if(cg_elm.css("display")=="none"){			//显示
					$(opts.farName).find(opts.iElm).css("display","none");
					cg_elm.css("display","block");
				}else{	//隐藏
					cg_elm.css("display","none");
				}
			}
			if(typeof(opts.callback)=='function'){
				opts.callback(iThis);
			}
			if(opts.rt==true){
				return false;
			}
		});
		fnLog('已成功载入程序,事件关联3个class分别是:'+opts.farName+'、'+opts.sonName+'、'+opts.iElm);
	}
});
//触击滑块开关
$.fn.extend({
	touchSwitchPlay:function(options){
		$.fn.touchSwitchPlay.func={
			public:{
				tSize:70,		//轨道尺寸最大宽度
				lSize:22,		//轨道尺寸最大高度
				btnWidth:40,	//内芯宽度
				space:2,		//内芯与轨道的单边距离
				borColr:"#b7b7b7",	//该border边框属性为track所有，并请与track.close中一致
				borWidth:1,
				borType:"solid"
			},
			attr:{
				state:['touchSwitchPlay-state',0],		//组件开启or关闭状态
			},
			track:{
				class:"js-touchSwitchPlay-track",
				sty:{	//基础样式
					"position":"relative","width":"public.tSize","height":"public.lSize","border":"public.borClor/Wid/Type","box-sizing":"border-box","border-radius":"4px","cursor":"pointer"
				},
				open:{sty:{"background":"#0ba7f0","border":"1px solid #048dcd"}},
				close:{sty:{"background":"#ccc","border":"1px solid #b7b7b7"}}
			},
			btn:{
				class:"js-touchSwitchPlay-ins",
				sty:{
					"position":"absolute","top":0,"left":0,"width":"public.tSize","height":"public.lSize","box-sizing":"border-box","border-radius":"4px"
				},
				open:{sty:{"background":"#fff"}},
				close:{sty:{"background":"#fff"}}
			},
			animateClas:"CssAll-ffast",
			callback:function(iThis,stat){},
			event:"click"
		}
		var opts=$.extend(true, {}, $.fn.touchSwitchPlay.func, options),
			iThis=$(this),
			state=opts.attr.state,
			trackClas=opts.track.class, btnClas=opts.btn.class, animClas=opts.animateClas,
			//piublic
			tSize=parseInt(opts.public.tSize),
			lSize=parseInt(opts.public.lSize),
			btnWidth=parseInt(opts.public.btnWidth),
			space=parseInt(opts.public.space),
			borWidth=parseInt(opts.public.borWidth),
			//style
			TrackBor=borWidth+'px '+opts.public.borType+' '+opts.public.borColr,
			trackSty='{',btnSty='{',
			tOpenSty='{',tCloseSty='{',
			bOpenSty='{',bCloseSty='{',
			rslt='',
			track=$("."+trackClas),
			btn=track.children("."+btnClas);
		for(i in opts.track.sty){			//styleType hava three,(basic,openSty,closeSty)
			rslt=opts.track.sty[i];
			if(i=="width"){rslt=tSize}
			if(i=="height"){rslt=lSize}
			if(i=="border"){rslt=TrackBor}
			if(i=="border-top"||i=="border-top"||i=="border-top"||i=="border-top"){continue;}
			trackSty+='"'+i+'":"'+rslt+'",';
		}
		for(i in opts.btn.sty){
			rslt=opts.btn.sty[i];
			if(i=="top"||i=="left"){rslt=space+'px';}
			if(i=="width"){rslt=btnWidth+'px';}
			if(i=="height"){rslt=lSize-(space+borWidth)*2+'px';}
			if(i.indexOf('padding')>-1||(i.match(/border/i)=='border'&&i.indexOf('border-radius')==-1)||i.indexOf('margin')>-1){continue;}
			btnSty+='"'+i+'":"'+rslt+'",';
		}
		for(i in opts.track.open.sty){
			rslt=opts.track.open.sty[i];
			if(i.indexOf("background")==-1&&i.indexOf("border")==-1){continue;}
			tOpenSty+='"'+i+'":"'+rslt+'",';
		}
		for(i in opts.track.close.sty){
			rslt=opts.track.close.sty[i];
			if(i.indexOf("background")==-1&&i.indexOf("border")==-1){continue;}
			tCloseSty+='"'+i+'":"'+rslt+'",';
		}
		for(i in opts.btn.open.sty){
			rslt=opts.btn.open.sty[i];
			if(i.indexOf("background")==-1){continue;}
			bOpenSty+='"'+i+'":"'+rslt+'",';
		}
		for(i in opts.btn.close.sty){
			rslt=opts.btn.close.sty[i];
			if(i.indexOf("background")==-1){continue;}
			bCloseSty+='"'+i+'":"'+rslt+'",';
		}
		trackSty=eval('('+trackSty+'})');
		btnSty=eval('('+btnSty+'})');
		tOpenSty=eval('('+tOpenSty+'})');
		tCloseSty=eval('('+tCloseSty+'})');
		bOpenSty=eval('('+bOpenSty+'})');
		bCloseSty=eval('('+bCloseSty+'})');
		basicFE.elm.forWriteStyle(track,trackSty);
		basicFE.elm.forWriteStyle(btn,btnSty);
		track.each(function(i,elm){	//ini
            if(typeof($(this).attr(state[0]))=='undefined'){		//含有
				$(this).attr(state[0],state[1]);
			}
			setGo($(this));
			if(i==track.length-1){
				setTimeout(function(){
					track.addClass(animClas);
					btn.addClass(animClas);
				}, 30);
			}
        });
		track.off(opts.event);
		track.on(opts.event,function(){
			var n=parseInt($(this).attr(state[0]))==0?1:0;
			$(this).attr(state[0],n);
			setGo($(this));
			if(typeof(opts.callback)=="function"){
				opts.callback($(this),n);
			}
		});
		function setGo(Obj){
			var otrack=Obj,
				obtn=otrack.find("."+btnClas),
				tSty='',bSty='',lft=space;
			if(otrack.attr(state[0])==0){
				tSty=tCloseSty;
				bSty=bCloseSty;
			}else{
				tSty=tOpenSty;
				bSty=bOpenSty;
				lft=tSize-borWidth*2-btnWidth-space;
			}
			basicFE.elm.forWriteStyle(otrack,tSty);
			basicFE.elm.forWriteStyle(obtn,bSty);
			obtn.css("left",lft);
		}
	}
});
//扩展按钮集群  （仿印象笔记）
$.fn.extend({
	ExtensionButton:function(options){
		$.fn.ExtensionButton.fun={
			mask:{
				class:"js-ExtensionButton-mask",
				sty:{"position":"absolute","left":0,"top":0,"width":"100%","height":"viewHight","background":"rgba(255,255,255,0.6)","z-index":100}
			},
			btn:{
				class:"js-ExtensionButton-btn",
				animaClas:"CssAll-ffast",	//动画class
				singleSpeace:10,			//纵向每个按钮之间距
				tranSpeace:16,				//横向文本与按钮间距
				public:{
					bigSize:50,				//主按钮体积稍大
					bgColor:"#f24f00"		//expand若未设置,则followMain跟随主值
				},
				sty:{"float":"right","border-radius":"50%","box-shadow":"-1px 1px 2px #555"},
				texSty:{"position":"absolute","left":-150+"px","top":5+"px","padding":"2px 6px","height":23+"px","line-height":23+"px","background":"#ccc","border-radius":"4px","box-shadow":"1px 1px 2px #555"}
			},
			coordinate:{
				choiceType:"model-this",	//模式选择 model-this(事件目标坐标), model-input(自行输入left,top)
				left:0,
				top:0
			},
			expand:{		//扩展的按钮
				setting:[],		//自定义
				model:[			//内置模板
					{class:"extenbtn_0",tex:"cc+",size:40,
						bgColor:"followMain",bgSize:"25px 25px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-cc.png)"},
					{class:"extenbtn_1",tex:"红包",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-evlop.png)"},
					{class:"extenbtn_2",tex:"售后",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-love.png)"},
					{class:"extenbtn_3",tex:"提示",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-alert.png)"},
					{class:"extenbtn_4",tex:"物品",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-goods.png)"},
					{class:"extenbtn_5",tex:"受益",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-money.png)"},
					{class:"extenbtn_6",tex:"信息",size:40,
						bgColor:"followMain",bgSize:"22px 22px",bgIcon:"url(../images/component/ExtensionButton/Extenbtn-msg.png)"}
				]
			},
			evCallback:function(iThis){},
			callback:function(ithis,fnThis){},
			event:["click","click"]
		}
		var opts=$.extend(true, {}, $.fn.ExtensionButton.fun, options),
			iThis=$(this),
			ubW=document.documentElement.clientWidth,
			ubH=window.innerHeight,
			ubS=document.body.scrollTop || document.documentElement.scrollTop,
			Oevent=opts.event,
			oneWidth=iThis.width(),oneHeight=iThis.height(),
			cordLeft=opts.coordinate.left,cordTop=opts.coordinate.top,
			//class
			maskClas=opts.mask.class,btnClas=opts.btn.class,
			//style
			rslt='',maskSty='',btnSty='',texSty='',
			//public
			pubBgCol=opts.btn.public.bgColor,
			pubSize=parseInt(opts.btn.public.bigSize),
			//btn
			animClas=opts.btn.animaClas,
			sgSpace=parseInt(opts.btn.singleSpeace),
			trSpace=parseInt(opts.btn.tranSpeace),
			//dom
			btnDom='',
			//typeClass
			tpcl_expand=opts.expand;
		if(opts.coordinate.choiceType=="model-this"){		//按照fixed算法
			cordLeft=iThis.offset().left;
			cordTop=iThis.offset().top-ubS;
		}
		for(i in opts.mask.sty){
			rslt=opts.mask.sty[i];
			if(i=="height"){rslt=ubH+'px';}
			maskSty+=i+':'+rslt+'; ';
		}
		for(i in opts.btn.sty){
			rslt=opts.btn.sty[i];
			if(i.indexOf("background")>-1||i.indexOf("width")>-1||i.indexOf("height")>-1||i.indexOf("position")>-1){continue;}
			btnSty+=i+':'+rslt+'; ';
		}
		for(i in opts.btn.texSty){
			rslt=opts.btn.texSty[i];
			texSty+=i+':'+rslt+'; ';
		}
		var arrData=tpcl_expand.setting.length==0?tpcl_expand.model:tpcl_expand.setting;
		for(var i=0;i<arrData.length;i++){
			var _btClas='',_btTex='',_btSize='',_btBgColr='',_btBgIcon='',_btBgSize='',_btTop='',_btLeft='',_btNowSize='';
			for(n in arrData[i]){
				if(n=="class"){_btClas=arrData[i][n];}
				if(n=="tex"){_btTex=arrData[i][n];}
				if(n=="size"){
					if(i==0){_btSize=pubSize; }else{ _btSize=arrData[i][n];_btNowSize=_btSize;}
				}
				if(n=="bgColor"){
					if(arrData[i][n]=="followMain"){_btBgColr=pubBgCol;}
				}
				if(n=="bgIcon"){_btBgIcon=arrData[i][n];}
				if(n=="bgSize"){_btBgSize=arrData[i][n];}
			}
			if(i==0){
				_btTop=cordTop;
				_btLeft=cordLeft;
			}else{
				_btTop=cordTop-(_btSize+sgSpace)*i;
				_btLeft=cordLeft+(pubSize-_btNowSize)/2;
			}
			btnSty+='position:absolute; left:'+_btLeft+'px; top:'+_btTop+'px; width:'+_btSize+"px; height:"+_btSize+"px; background:"+_btBgIcon+" center center no-repeat"+_btBgColr+"; background-size:"+_btBgSize+"; display:block";
			btnDom+='<a class="'+_btClas+' '+btnClas+'" href="javascript:;" style="'+btnSty+'">'+'<span class="text" style="'+texSty+'">'+_btTex+'</span></a>';
		}
		iThis.off(Oevent[0]);
		iThis.on(Oevent[0],function(){
			var farThis=$(this);
			if(typeof(opts.evCallback)=='function'){
				opts.evCallback($(this));
			}
			if($("."+maskClas).length==0){
				ubW=document.documentElement.clientWidth,
				ubH=window.innerHeight,
				ubS=document.body.scrollTop || document.documentElement.scrollTop;
				var maskDom='<div class="'+maskClas+'" style="'+maskSty+'">'+
								  btnDom+
							'</div>';
				$("body").append(maskDom);
				var oMask=$("."+maskClas),
					oBtn=oMask.find("."+btnClas),
					oTex=oBtn.find(".text");
				oMask.css("top",ubS);
				oTex.each(function(i, elm){
                    var tisLft=basicFE.elm.getObjSize($(this),1)+trSpace;
					$(this).css('left',-tisLft);
                });
				oTex.css("opacity",0);
				setTimeout(function(){
					oBtn.css("transform","scale(0)");
					oBtn.addClass(animClas);
					var i=0,time=null;
					time=setInterval(function(){
						if(i<oBtn.length){
							var iBtn=oBtn.eq(i);
							iBtn.css("transform","scale(1.1)");
							setTimeout(function(){
								iBtn.css("transform","scale(1)");
								iBtn.find(".text").css("opacity",1);
							}, 380);
						}else{
							clearInterval(time);
						}
						i++;
					}, 30);
				}, 30);
				oMask.addClass(animClas);
				oMask.on(Oevent[1],function(){
					var obj=$(this);
					obj.css('opacity',0);
					setTimeout(function(){
						obj.remove();
					}, 300);
					opts.callback($(this),farThis);
				});
				oBtn.on(Oevent[1],function(e){
					$(this).css("transform","scale(1.2)");
					if(typeof(opts.callback)=='function'){
						opts.callback($(this),farThis);
					}
					oMask.css("opacity",0);
					setTimeout(function(){
						oMask.remove();
					}, 500);
					return false;
				});
				oMask.on('touchmove',function(e){
					e.preventDefault();
				});
			}
		});
	}
});
//使用指南图片盒子
$.extend({
	userGuideImageBox:function(options){
		$.userGuideImageBox.fun={
			eachClass:"js-userGuideImageBox-tips",
			RemovDistance:{		//删除距离，用以确定真正视区范围
				top:0,			//通常app会有<head>甚至<class-fixed>
				bottom:0		//通常<footer>
			},
			bodyty:{
				class:"js-userGuideImageBox-body",
				sty:{"position":"absolute","left":0,"top":0,"width":"100%","height":"window.height","background":"rgba(0,0,0,0.5)","z-index":99}
			},
			main:{
				class:"js-userGuideImageBox-main",
				sty:{"position":"absolute","left":0,"top":"scrolltop","width":"100%","height":"window.innerHeight","overflow":"hidden"}
			},
			btn:{
				closed:{
					sty:{"position":"absolute","left":0,"bottom":0,"width":50,"height":50,"background":"url(../images/component/userGuideImageBox/userGuideImage-close.png) center center no-repeat","background-size":"70%","display":"block","z-index":1}
				}
			},
			expand:{
				default:{
					left:0,
					top:0,
					width:80,
					height:50,
					bgImage:'url(../images/component/userGuideImageBox/userGuideImageBoxQUAN.png)',
					bgPosi:"left top",
					bgSize:"100%"
				},
				setting:[],
				model:[			//follow跟主体
					{left:"follow",top:"follow",width:"follow",height:"follow",bgImage:"follow",bgPosi:"follow",bgSize:"follow"}
				]
			},
			event:'click'
		}
		var opts=$.extend(true, {}, $.userGuideImageBox.fun, options),
			uSc=document.body.scrollTop || document.documentElement.scrollTop,
			ubW=document.documentElement.clientWidth,
			ubH=window.innerHeight,
			coordData=[],
			//name
			bodyClas=opts.bodyty.class,
			mainClas=opts.main.class,
			nEachClas=opts.eachClass,
			expand=opts.expand,
			removDist=opts.RemovDistance,
			//obj
			eachClas=$("."+nEachClas),
			//sty
			rltSty='',bodytySty='',mainSty='',closeSty='',
			//dom
			farDom='',sonDom='';
		if($("."+bodyClas).length>0){
			$("."+bodyClas).remove();
		}
		for(i in opts.main.sty){
			rltSty=opts.main.sty[i];
			if(i=="top"){rltSty=uSc+'px';}
			if(i=="height"){rltSty=ubH+'px';}
			mainSty+=i+':'+rltSty+'; ';
		}
		for(i in opts.bodyty.sty){
			rltSty=opts.bodyty.sty[i];
			if(i=="top"){rltSty=0;}
			if(i=="height"){rltSty=$(window).height()+'px';}
			bodytySty+=i+':'+rltSty+'; ';
		}
		for(i in opts.btn.closed.sty){
			closeSty+=i+':'+opts.btn.closed.sty[i]+'; ';
		}
		eachClas.each(function(i,elm){
			var atc=typeof($(this).attr("class"))!='undefined'?$(this).attr("class"):'noHavaClass',
				arr=[$(this).offset().left,$(this).offset().top,atc];	//x,y,class
			var _sty='position:absolute; left:0; top:0; width:'+ubW+'px; height:'+ubH+'px; display:none;',
				_rlt='', _sonSty='', _left='', _top='';
			if(i<expand.setting.length){	//检测外部设置{}与元素绑定是否一致
				for(n in expand.setting[i]){
					_rlt='';
					_left=expand.setting[i].left;
					_top=expand.setting[i].top;
					if(n=="width"){_rlt="width:"+expand.setting[i][n]+"px; "}
					if(n=="height"){_rlt="height:"+expand.setting[i][n]+"px; "}
					if(n=="bgImage"){_rlt="background:"+expand.setting[i][n]+" "+expand.setting[i].bgPosi+" no-repeat; "}
					if(n=="bgSize"){_rlt="background-size:"+expand.setting[i][n]+"; "}
					_sonSty+=_rlt;
				}
			}else{	//不存在进行自建
				var _deft=expand.default;
				_left=_deft.left;
				_top=_deft.top;
				_sonSty="width:"+_deft.width+"px; height:"+_deft.height+"px; background:"+_deft.bgImage+" "+_deft.bgPosi+" no-repeat; background-size:"+_deft.bgSize+"; ";
			}
			_sonSty+='position:absolute; left:'+(arr[0]+_left)+'px; top:'+arr[1]+'px; ';
			sonDom+='<div class="js-userGuideImageBox-li" style="'+_sty+'"><div style="'+_sonSty+'"></div></div>';
			arr.push(_top);
			coordData.push(arr);
        });
		farDom='<div class="'+bodyClas+'" style="'+bodytySty+'">'+
					'<div class="'+mainClas+'" style="'+mainSty+'">'+
						  '<a class="js-userGuideImageBox-close" href="javascript:;" style="'+closeSty+'"></a>'+
						  sonDom+
					'</div>'+
				'</div>';
		$("body").append(farDom);
		var oBody=$('.'+bodyClas),
			oMain=oBody.find('.'+mainClas),
			oMson=oMain.find(".js-userGuideImageBox-li"),
			proi=0,
			ieq=oMson.eq(proi),
			igt=ieq.find("div"),
			top=parseInt(eachClas.eq(proi).offset().top);
		oMson.eq(proi).css("display","block");
		pubfn(proi);
		oMain.on(opts.event,function(){
			proi++;
			pubfn(proi);
		});
		oMain.find(".js-userGuideImageBox-close").on(opts.event,function(){
			oBody.remove();
		});
		function pubfn(proi){
			if(proi<oMson.length){
				var ieq=oMson.eq(proi),
					igt=ieq.find("div"),
					top=parseInt(eachClas.eq(proi).offset().top),
					topCord=coordData[proi][3];
				uSc=document.body.scrollTop || document.documentElement.scrollTop;
				oMson.css("display","none").eq(proi).css("display","block");
				//需检测是否存在于可视区内，如果超出-情况有2
				if(top<uSc-removDist.top){			//以上
					$(window).scrollTop(top-removDist.top);
					setTimeout(function(){
						oMain.css('top',$(window).scrollTop());
						igt.css("top",top-$(window).scrollTop()+topCord);
					},30);
				}else if(top>uSc+ubH-removDist.bottom){	//视区以下
					$(window).scrollTop(top);
					setTimeout(function(){
						oMain.css('top',$(window).scrollTop());
						igt.css("top",top-$(window).scrollTop()+topCord);
					},30);
				}else{	//视区内
					igt.css("top",top-$(window).scrollTop()+topCord);
				}
			}else{oBody.remove();}
		}
	}
});
//滑动底部加载
$.extend({
	downScrollLoadDom:function(options){
		$.downScrollLoadDom.fun={
			releaseEvent:"mouseup",		//释放事件作为判断根据，每次释放会高频的跟踪一段时间
			downSpace:40,
			callback:function(){}
		}
		var opts=$.extend(true, {}, $.downScrollLoadDom.fun, options),
			evt=opts.releaseEvent,
			downSpace=opts.downSpace,
			IntTim=null;		//计时器
		$(window).off(evt,execution);
		$(window).on(evt,execution);
		function execution(e){
			clearInterval(IntTim);
			var add=0;
			IntTim=setInterval(function(){		//反复检测本次与上次值一致时关闭计时器，执行回调
				var scT=document.body.scrollTop || document.documentElement.scrollTop,
					uBh=window.innerHeight,
					aBh=$(window).height();
				add++;
				if(add>=4){
					clearInterval(IntTim);
					if(aBh-(scT+uBh)<=downSpace){	//
						if(typeof(opts.callback)=="function"){
							opts.callback(goDown);
						}
					}
				}
			}, 100);
		}
		function goDown(){
			$(window).scrollTop(99999);
		}
	}
});
//fromRegularExpression
$.extend({
	fromRegularExpression:function(options){
		$.fromRegularExpression.fuc={
			eachSign:"a1",
			body:$("body"),
			iPut:".js-regExpigt-item",				//全选类型
			cutSymbol:"|#|",						//自定义切割符
			attr:{						
				eachSign:"eachsign-data",			//对应识别
				regExp:"rexp-idata,auto,notNull",	//类型(set自定义,auto标准)，内容(eval(),内置标准callname)
				errorText:"rexp-error",				//报错文本
				emptyText:"rexp-empty"				//通常可不填，为空时报该错
			},
			tips:{
				notEmpty:"不能为空",
				noMatch:"不符合条件"
			},
			successCallback:function(){},
			eventSuccessCallback:function(iTs){},
			errorCallback:function(ErorArr){},		//[{iths,txt}]
			event:"click"
		}
		var opts=$.extend(true, {}, $.fromRegularExpression.fuc, options),
			body=opts.body,
			iPut=opts.iPut,
			//attr
			attrEs=opts.attr.eachSign,
			attrEx=opts.attr.regExp.split(","),
			attrEt=opts.attr.errorText,
			attrEe=opts.attr.emptyText,
			//other
			success=0,
			allLength=0,
			ElmtArr=[],
			ErorArr=[],
			eachsign=opts.eachSign,
			tipsNEmpty=opts.tips.notEmpty,
			tipsNMatch=opts.tips.noMatch;
		getElement();
		function getElement(){
			success=body.find(iPut).length;
			allLength=success;
			body.find(iPut).each(function(i){
				if(typeof($(this).attr(attrEs))!="undefined"&&typeof($(this).attr(attrEx[0]))!="undefined"){
					if($(this).attr(attrEs)==eachsign){
						allLength--;
						modelRunning($(this));
					}
				}
			});
		}
		function modelRunning(iTs){
			var atExr=iTs.attr(attrEx[0]).split(opts.cutSymbol);
			if(atExr[0]=="set"){			//自定义模式
				var regExprs=eval('/'+atExr[1]+'/');
				errorCall( regExprs.test(iTs.val()), iTs);
			}else if(atExr[0]=="auto"){	//标准模式
				errorCall(atExr[1],iTs);
			}
		}
		function errorCall(matchVal,iTs){
			if(matchVal==false){
				if(typeof(opts.errorCallback)=="function"){
					var errorText=tipsNMatch;
					errorText=iTs.attr(attrEt);
					if(iTs.val()==""){
						if(typeof(iTs.attr(attrEe))!="undefined"){
							errorText=iTs.attr(attrEe);
						}else{
							errorText=tipsNEmpty;
						}
					}
					ErorArr.push({
						elm:iTs,
						txt:errorText
					});
				}
			}else if(matchVal){
				ElmtArr.push(iTs);
				success--;
				if(success==0){
					if(typeof(opts.successCallback)=="function"){
						opts.successCallback(ElmtArr);
					}
				}else{
					if(typeof(opts.eventSuccessCallback)=="function"){
						opts.eventSuccessCallback(iTs);
					}
				}
			}
			if(allLength==0){
				opts.errorCallback(ErorArr);
			}
		}
	}
});
$.extend({
	eventFromRegularExpression:function(options){
		$.eventFromRegularExpression.fuc={
			windows:window,
			iPut:"js-evtFromRegExp-iput",
			eachSign:'u1',
			attr:{
				eachSign:"efrexp-eachsign-data",		//对应识别
				regExp:"efrexp-rexp-idata",				//类型(set自定义,auto标准)，内容(eval(),内置标准callname)
				tipsError:"efrexp-tips-error",
				maxIput:["efrexp-maxIput",'infinite']	//attr属性名称 默认允许最大输入长度--无限大
			},
			delay:450,
			callback:function(val,obj,runStaut){},
			errorCallback:function(msg,obj,runStaut){},
			onCallback:{								//是否开启事件后的回调
				oninput:true,
				blur:true
			},
			event:{
				oninput:true,
				blur:true
			}
		}
		var opts=$.extend(true, {}, $.eventFromRegularExpression.fuc, options),
			ibody=$(opts.windows.document.body),
			attEs=opts.attr.eachSign,
			attEx=opts.attr.regExp,
			attEr=opts.attr.tipsError,
			attMx=opts.attr.maxIput[0],
			ev_oniput=opts.event.oninput,
			ev_blur=opts.event.blur;
		opts.getElement=function(){
			ibody.find('.'+opts.iPut).each(function(i){
				var ets=$(this);
				opts.hasSelftData(ets,function(){
					opts.saveError(ets);
					opts.bindEvent(ets);
					ets.time=setTimeout(function(){
						opts.baseGofunc(ets,['ini',true]);
					},opts.delay);
				});
			});
		}
		opts.hasSelftData=function(obj,fn){
			if(typeof(obj.attr(attEs))!=='undefined' && typeof(obj.attr(attEx))!=='undefined'){
				if(obj.attr(attEs)==opts.eachSign){fn();}
			}
		}
		opts.saveError=function(obj){
			var iErTips="输入有误";
			if(typeof(obj.attr(attEr))!=='undefined'){
				iErTips=obj.attr(attEr);
			}
			obj.attr('efrexp-tips-INIerror',iErTips);
		}
		opts.result=function(obj){
			var val=obj.val(),
				regExprs=eval('/'+obj.attr(attEx)+'/'),
				maxLgt=0;
			if(typeof(obj.attr(attMx))!=="undefined"){
				if(obj.attr(attMx)!=="" && !isNaN(obj.attr(attMx))){
					maxLgt=parseInt(obj.attr(attMx));
				}
			}else{
				if(opts.attr.maxIput[1]!=='infinite' && !isNaN(opts.attr.maxIput[1])){
					maxLgt=parseInt(opts.attr.maxIput[1]);
				}else{maxLgt='infinite';}
			}
			if(maxLgt!=='infinite' && !isNaN(maxLgt)){
				if(val.length>maxLgt){
					val=val.substring(0,maxLgt);
					obj.val(val);
				}
			}
			if(regExprs.test(val)||obj.attr(attEx)==''){
				return true;
			}else{
				var msg='输入有误';
				if(typeof(obj.attr('efrexp-tips-INIerror'))!=='undefined'){
					if(obj.attr('efrexp-tips-INIerror')!==""){
						msg=obj.attr('efrexp-tips-INIerror');
					}
				}
				return msg;
			}
		}
		opts.baseGofunc=function(obj,runStaut){
			var fnrs=opts.result(obj);
			if(fnrs==true){
				opts.callback(obj.val(),obj,runStaut);
			}else{
				opts.errorCallback(fnrs,obj,runStaut);
			}
		}
		opts.bindEvent=function(obj){
			if(ev_oniput){
				obj.off('input');
				obj.on('input',function(e){
					opts.baseGofunc($(this),['event',opts.onCallback.oninput]);
				});
			}
			if(ev_blur){
				obj.off('blur');
				obj.on('blur',function(){
					opts.baseGofunc($(this),['event',opts.onCallback.blur]);
				});
			}
		}
		opts.getElement();
	}
});
$.extend({
	tipsAreaBigAlerts:function(options){
		$.tipsAreaBigAlerts.fuc={
			window:window,
			body:$("body"),
			text:"这是一段提示文字",
			model:"ctrl",				//ctrl、auto模式两种-手动消除 和 自动持续
			modelSet:{
				baseText:{				//文本设置
					"margin":0,"padding":"0 30px 0 40px","text-align":"center","color":"#333","font-size":"13px","box-sizing":"border-box","display":"inline-block"
				},
				ctrl:{
					class:"js-btn",
					btnText:"我知道了",
					btnSty:{
						"position":"absolute","right":"0","bottom":"-8px","text-align":"center","padding":"0 12px","height":"23px","line-height":"23px","color":"#fff","font-size":"13px","background":"#222","border-radius":"4px","display":"inline-block","box-shadow":"2px 2px 4px #333","text-decoration":"none"
					}
				},
				auto:{
					duration:2000
				}
			},
			box:{
				class:"js-asmbly-tipsAreaBigAlertsBox",
				background:{
					color:"#fff",
					imgSrc:"../images/component/HighPriorityFilled-75.png",
					position:"10px center",
					repeat:"no-repeat",
					size:"20px"
				},
				sty:{
					"position":"absolute","left":"windowCenter","top":"20px","padding":"18px 0","width":"440px","background":"settings","box-shadow":"2px 2px 4px #333","border-radius":"4px","transition":"opacity ease 0.5s,top ease 0.25s"
				}
			},
			menBan:{
				class:"js-asmbly-tipsAreaBigAlertsMain",		//多个,隔开
				sty:{
					"position":"absolute","left":0,"top":0,"width":"100%","height":"windowHeight","background":"rgba(0,0,0,0.3)","z-index":99,"transition":"opacity ease 0.3s"
				}
			}
		}
		var opts=$.extend(true, {}, $.tipsAreaBigAlerts.fuc, options),
			body=opts.body,
			mebClas=opts.menBan.class,			
			dom='',btnDom='',
			//setting var
			styMB=styForResult(opts.menBan.sty),
			styBox=styForResult(opts.box.sty),
			styTex=styForResult(opts.modelSet.baseText),
			styBtn=styForResult(opts.modelSet.ctrl.btnSty),
			clasMB=styForClass(opts.menBan.class),
			clasBox=styForClass(opts.box.class),
			clasBtn=styForClass(opts.modelSet.ctrl.class);
		if(opts.model=="ctrl"){		//手动
			btnDom='<a class="'+clasBtn+'" href="javascript:;" tipsArea-clickOnOff="1" style="'+styBtn+'">'+opts.modelSet.ctrl.btnText+'</a>';
		}else{	//自动模式

		}
		dom='<div class="'+clasMB+'" style="'+styMB+' opacity:0;">'+
				'<div class="'+clasBox+'" style="'+styBox+' opacity:0;">'+
					'<p style="'+styTex+'">'+opts.text+'</p>'+
					btnDom+
				'</div>'+
			'</div>';
		body.append(dom);
		var igtManb='',igtBox='',igtBtn='';
		if(opts.menBan.class.indexOf(',')!==-1){
			igtManb=body.find("."+opts.menBan.class.split(',')[0]);
		}else{igtManb=body.find("."+opts.menBan.class);}
		if(opts.box.class.indexOf(',')!==-1){
			igtBox=body.find("."+opts.box.class.split(',')[0]);
		}else{igtBox=body.find("."+opts.box.class);}
		if(opts.modelSet.ctrl.class.indexOf(',')!==-1){
			igtBtn=body.find("."+opts.modelSet.ctrl.class.split(',')[0]);
		}else{igtBtn=body.find("."+opts.modelSet.ctrl.class);}
		igtBox.css({"left":(opts.window.innerWidth-igtBox.width())/2});
		setTimeout(function(){
			igtManb.css({"opacity":1});
			setTimeout(function(){
				igtBox.css({"opacity":1,"top":parseInt(igtBox.css("top"))+10});
			}, 100);
		},50);

		igtBtn.off('click mouseenter mouseleave');
		igtBtn.on('click',function(){
			if(igtBtn.attr("tipsArea-clickOnOff")=="1"){
				igtBtn.attr("tipsArea-clickOnOff","2");
				var top=parseInt(igtBox.css("top"));
				igtBox.css({"top":top+6});
				setTimeout(function(){
					igtBox.css({"top":-10,"opacity":0});
					setTimeout(function(){
						igtManb.css({"opacity":0});
						setTimeout(function(){
							igtManb.remove();
						},310);
					},250);
				},255);
			}
		});
		function styForClass(clXass){
			var rst='';
			if(clXass.indexOf(',')!==-1){
				for(var i=0;i<clXass.split(",").length;i++){
					rst+=clXass.split(",")[i]+' ';
				}
			}else{rst=clXass;}return rst;
		}
		function styForResult(styleJson){
			var rst='';
			for(i in styleJson){
				var evVal='';
				if(i=='height'&&styleJson[i]=="windowHeight"){styleJson[i]=opts.window.innerHeight+'px';}
				evVal=i+':'+styleJson[i]+'; ';
				if(i=='background'&&styleJson[i]=="settings"){
					evVal='';
					evVal='background-color:'+opts.box.background.color+'; '+
							'background-image:url('+opts.box.background.imgSrc+'); '+
							'background-position:'+opts.box.background.position+'; '+
							'background-repeat:'+opts.box.background.repeat+'; '+
							'background-size:'+opts.box.background.size+'; ';
				}
				rst+=evVal;
			}
			return rst;
		}
	}
});
function AddEvent_Touch(Obj){	
	var obj=Obj,oPart=obj.parent(),
		oStX,oStY,eStop,eSleft,			//始触点
		oMoX,oMoY,eMoT,eMoL,			//移动触点
		oPar_h=oPart.height(),oPar_w=oPart.width(),	//滚动范围高度--->目标父级高度
		Tclock=null,Tint=null,Tim=0,	//短暂快速播动  记录器
		Tan=45,							//泥阻弹值
		goME=false,						//判断是否有经过move事件
		borws=navigator.userAgent;		//万恶三星E160L型号
	if(obj.height()>oPar_h || obj.width()>oPar_w){
		obj.off('touchstart touchmove touchend');
		obj.on("touchstart",function(e){
			if(borws.match(/AppleWebKit\/534.30/i)=="AppleWebKit\/534.30"){
				Tclock=setInterval(function(){
					Tim+=0.1;
				},17);
			}else{				
				function add(){
					Tclock=requestAnimationFrame(add);
					Tim+=0.1;
				}
				add();
			}
			oStX=e.originalEvent.targetTouches[0].pageX;
			oStY=e.originalEvent.targetTouches[0].pageY;
			eStop=parseInt(obj.css("top"));
			eSleft=parseInt(obj.css("left"));
			obj.removeClass("CssAll-ffast");			
		});
		var fstY=0,fstX=0;
		obj.on("touchmove",function(e){
			e.preventDefault();
			oMoX=e.originalEvent.targetTouches[0].pageX;
			oMoY=e.originalEvent.targetTouches[0].pageY;			
			goME=true;
			if(obj.height()>oPar_h){
				fstY=oMoY-oStY;
				eMoT=eStop+fstY;
				//滚动范围控制 [弹性泥阻]
				if(eMoT>0+Tan){										//置顶情况
					eMoT=0+Tan;
				}else if((eMoT+obj.height())<=oPar_h-Tan){			//置底情况
					eMoT=(obj.height()-oPar_h+Tan)*-1;
				}
				obj.css('top',eMoT+'px');
			}
			if(obj.width()>oPar_w){
				fstX=oMoX-oStX;
				eMoL=eSleft+fstX;			
				//滚动范围控制 [弹性泥阻]
				if(eMoL>0+Tan){										//置顶情况
					eMoL=0+Tan;
				}else if((eMoL+obj.width())<=oPar_w-Tan){			//置底情况
					eMoL=(obj.width()-oPar_w+Tan)*-1;
				}
				obj.css('left',eMoL+'px');
			}
			return false;	//阻止冒泡 - 专防多层嵌套触屏波动的情况
		});
		obj.on("touchend",function(e){
			obj.addClass("CssAll-ffast");
			if(borws.match(/AppleWebKit\/534.30/i)=="AppleWebKit\/534.30"){
				clearInterval(Tclock);
			}else{
				cancelAnimationFrame(Tclock);
			}			
			if(goME==true){
				if(Tim<2.5){		//约0.5秒内 时间越短、播动距离越大 ^ 滚动速度越快、距离越远
					//(目前使用requestAnimationFrame,所以是16.7/s+0.01=60fps,所以0.5=25)
					fstY=0,fstX=0;
					//计算出 速度 和 距离(声明)
					var speed=Tim*2,ExtraY=0,ExtraX=0,bidY=0,bidX=0;				
					if(obj.height()>oPar_h){		//每次记录 移动距离+现有高度
						fstY=oMoY-oStY;
						eMoT=eStop+fstY;
						var ib=Tim/6;
						ExtraY=(1-ib)*(fstY*(1+(1-ib)*10));			//过去整值是1，现在fps为60
						bidY=eStop+ExtraY;
						if(bidY>Tan){									//置顶情况
							bidY=Tan;
						}else if(bidY+obj.height()<=oPar_h-Tan){		//置底情况
							bidY=(obj.height()-oPar_h+Tan)*-1;
						}
						obj.css('top',bidY+'px');
					}
					if(obj.width()>oPar_w){		//每次记录 移动距离+现有宽度
						fstX=oMoX-oStX;			
						eMoL=eSleft+fstX;
						ExtraX=(1-Tim)*(fstX*(1+(1-Tim)*10));
						bidX=eSleft+ExtraX;
						if(bidX>Tan){									//置顶情况
							bidX=Tan;
						}else if(bidX+obj.width()<=oPar_w-Tan){		//置底情况
							bidX=(obj.width()-oPar_w+Tan)*-1;
						}
						obj.css('left',bidX+'px');
					}
					if(borws.match(/AppleWebKit\/534.30/i)=="AppleWebKit\/534.30"){
						clearInterval(Tint);
						Tint=setInterval(function(){
							if(parseInt(obj.css('top'))==bidY && parseInt(obj.css('left'))==bidX){
								clearInterval(Tint);
								MudResistance(bidX,bidY);
							}
						}, 17);
					}else{
						cancelAnimationFrame(Tint);
						function eG(){
							Tint=requestAnimationFrame(eG);
							if(parseInt(obj.css('top'))==bidY && parseInt(obj.css('left'))==bidX){
								cancelAnimationFrame(Tint);
								MudResistance(bidX,bidY);
							}
						}
						eG();
					}
				}else{
					MudResistance(eMoL,eMoT);
				}
				goME=false;
			}
			Tim=0;
		});
		function MudResistance(fX,fY){					//泥阻复位 Mud resistance
			obj.attr("ItouchX-Y",fX+','+fY);
			if(fY>0){									//置顶情况
				fY=0;
			}else if((fY+obj.height())<=oPar_h){		//置底情况
				fY=(obj.height()-oPar_h)*-1;
			}
			if(fX>0){									//置顶情况
				fX=0;
			}else if((fX+obj.width())<=oPar_w){			//置底情况
				fX=(obj.width()-oPar_w)*-1;
			}
			obj.css({'left':fX+'px','top':fY+'px'});				
		}
	}
}
$.extend({
    confirmBombBox:function(options){               // - [确认弹框组件] - 
        $.confirmBombBox.sttings={
            windox:window,                          //DOM window 指向
            title:'弹框标题',                       //窗体标题
            text:'电脑系统询问您确定要这样做吗？', //文本内容
            btnPattern:'half',                      //按钮模式 full(单钮) or half(双钮)
            btn:[                                   //决策按钮 [排序]
                {type:'no', text:'取消', id:'confirmBombx-btnNo'},
                {type:'yes', text:'确定', id:'confirmBombx-btnYes'}
            ],
            style:{
                menban:{        //蒙版
                    'position':'fixed', 'top':'0', 'left':'0', 'width':'100%', 'height':'100%', 'background':'rgba(0,0,0,0.5)', 'z-index':'99'
                },
                wrap:{          //容器
                    'margin':'0 auto', 'padding':'0 0 30px', 'width':'400px', 'font-family':'微软雅黑', 'font-size':'14px', 'background':'#fff', 'border-radius':'3px', 'box-shadow':'1px 1px 2px rgba(0,0,0,0.4)', 'overflow':'hidden'
                },
                head:{          //头部
                    'position':'relative', 'padding':'0 28px', 'width':'100%', 'height':'40px', 'line-height':'40px', 'color':'#fff', 'background':'#2ea9e5', 'box-sizing':'border-box', 'cursor':'default', '-webkit-user-select':'none'
                },
                close:{         //关闭按钮  如果按钮需要调整大小就请缩放me! me me me ! it's me!
                    'position':'absolute', 'right':'0', 'top':'0', 'width':'40px', 'height':'40px', 'transform':'scale(1)', 'transition':'all ease 0.5s', 'cursor':'pointer','opacity':1
                },
                closeI:{        //关闭按钮 组成件(斜杠)
                    'background':'#fff'
                },
                cont:{          //内容
                    'padding':'55px 28px', 'text-align':'center', 'width':'100%', 'box-sizing':'border-box', 'letter-spacing':'0.08em'
                },
                bfoot:{         //底部
                    'padding':'0 28px', 'text-align':'center', 'width':'100%', 'box-sizing':'border-box'
                },
                bfootBtn:{      //按钮
                    'padding':'0 14px', 'min-width':'80px', 'line-height':'38px', 'display':'inline-block','text-decoration':'none', 'border-radius':'3px', 'transition':'all ease 0.4s', '-webkit-user-select':'none'
                },
                fbtnYes:{       //确认按钮
                    'float':'right','color':'#fff', 'background':'#2ea9e5', 'border':'1px solid #2ea9e5'
                },
                fbtnNo:{        //取消按钮
                    'float':'left','color':'#999', 'background':'#ecebeb', 'border':'1px solid #ccc'
                },
                fbtnFull:{      //单钮-确认按钮
                    'float':'none', 'padding':'0 28px'
                },
                //animation 按钮动作效果
                btnYesHv:{
                    'background':'#3eb4ed', 'border':'1px solid #3eb4ed'
                },
                btnNoHv:{
                    'background':'#e2e2e2',
                },
                btnYesActive:{
                    'background':'#249cd6', 'border':'1px solid #249cd6'
                },
                btnNoActive:{
                    'background':'#dedede', 'border':'1px solid #dedede'
                }
            },
            userCalss:{                             //使用的class, 冲突时可修改
                mengban:'confirmBomb-mengban',      //蒙版
                wrap:'confirmBomb-wrap',            //容器
            },
            killSelf:false,                         //排除异己(创建时清空同类)
            relatvClose:true,                      //是否联动关闭
            callback:function(rest){}               //外抛回调方法
        }
        var opts=$.extend(true, {}, $.confirmBombBox.sttings, options),
            _window=opts.windox,
            _body=$(_window.document.body),
            _menb=null,
            _wrap=null,
            obj={                                   //闭合非暴露方法
                init:function(){                    //初始化
                    obj.appendDoms()
                    .settingVar()
                    .repairLayout()
                    .bindEvent();
                },
                settingVar:function(){              //设置对象变量
                    _menb=_body.find("."+opts.userCalss.mengban);
                    _wrap=_menb.find("."+opts.userCalss.wrap);
                    return this;
                },
                appendDoms:function(){              //插入结构
                    if(opts.killSelf){              //排除异己
                        var yJ=$(_window.document.body).find('.'+opts.userCalss.mengban);
                        if(yJ.length>0){yJ.remove();}
                    }
                    $(_window.document.body).append(obj.creatDoms());
                    return this;
                },
                creatDoms:function(){               //创建结构
                    return '<div class="'+opts.userCalss.mengban+'">'+
                        '<div class="'+opts.userCalss.wrap+'">'+
                            '<div class="title">'+
                                '<span>'+opts.title+'</span>'+
                                '<div class="close"><i></i><i></i></div>'+
                            '</div>'+
                            '<div class="cont">'+
                                obj.creatText(opts.text)+
                            '</div>'+
                            '<div class="bfoot">'+
                                obj.creatBtn()+
                            '</div>'+
                        '</div>'+
                    '</div>'+obj.layout();
                },
                creatBtn:function(){                //创建按钮 -> 根据模式及顺序
                    var dom='';
                    for(var i=0;i<2;i++){
                        if(opts.btnPattern=='full'){    //单钮
                            if(opts.btn[i].type=='yes'){
                                dom+='<a class="'+opts.btn[i].id+' Type-yes-Full" href="javascript:;" draggable="false">'+opts.btn[i].text+'</a>';
                            }
                        }else{
                            var addCals='Type-yes';
                            if(opts.btn[i].type=='no'){addCals='Type-no';}
                            dom+='<a class="'+opts.btn[i].id+' '+addCals+'" href="javascript:;" draggable="false">'+opts.btn[i].text+'</a>';
                        }
                    };return dom;
                },
                creatText:function(str){            //字符处理
                    if(typeof(str)=='string'){
                        if(str.indexOf('<div>')==-1){return '<p>'+str+'</p>';}
                    };return str;
                },
                layout:function(){                  //样式声明
                    var _s=opts.style,
                        menb='.'+opts.userCalss.mengban,
                        wrap=menb+' .'+opts.userCalss.wrap;
                    return '<style>'+
                        menb+'{'+obj.concatLayout(_s.menban)+'}'+
                        wrap+'{'+obj.concatLayout(_s.wrap)+'}'+
                        wrap+' .title{'+obj.concatLayout(_s.head)+'}'+
                        wrap+' .cont{'+obj.concatLayout(_s.cont)+'}'+
                        wrap+' .bfoot{'+obj.concatLayout(_s.bfoot)+'}'+
                        wrap+' .close{'+obj.concatLayout(_s.close)+'}'+
                        wrap+' .close:hover{ transform:rotate(90deg)}'+
                        wrap+' .close i{'+
                            'position:absolute; width:60%; height:1px; display:inline-block; '+
                            obj.concatLayout(_s.closeI)+
                        '}'+
                        wrap+' .close i:nth-child(1){ top:18px; left:8px; transform:rotate(45deg);}'+
                        wrap+' .close i:nth-child(2){ top:18px; left:8px; transform:rotate(135deg);}'+
                        wrap+' .bfoot a{'+obj.concatLayout(_s.bfootBtn)+'}'+
                        wrap+' .bfoot a.Type-yes{'+obj.concatLayout(_s.fbtnYes)+'}'+
                        wrap+' .bfoot a.Type-no{'+obj.concatLayout(_s.fbtnNo)+'}'+
                        wrap+' .bfoot a.Type-yes-Full{'+obj.concatLayout(_s.fbtnYes)+obj.concatLayout(_s.fbtnFull)+'}'+
                        wrap+' .bfoot a.Type-yes:hover,'+wrap+' .bfoot a.Type-yes-Full:hover{'+obj.concatLayout(_s.btnYesHv)+'}'+
                        wrap+' .bfoot a.Type-no:hover{'+obj.concatLayout(_s.btnNoHv)+'}'+
                        wrap+' .bfoot a.Type-yes:active,'+wrap+' .bfoot a.Type-yes-Full:active{'+obj.concatLayout(_s.btnYesActive)+'}'+
                        wrap+' .bfoot a.Type-no:active{'+obj.concatLayout(_s.btnNoActive)+'}'+
                    '</style>';
                },
                concatLayout:function(json){        //样式拼组
                    var style='';
                    for(i in json){
                        style+=i+':'+json[i]+'; ';
                    };return style;
                },
                bindEvent:function(){               //事件绑定
                    var clos=_wrap.find('.close'),
                        btn=_wrap.find(".bfoot").find("a");
                    clos.on('click',function(){
                        obj.remove();
                    });
                    btn.on('click',function(){
                        var result={
                            cName:'yes',
                            data:{btn:$(this),removeFn:obj.remove}
                        }
                        if($(this).is(".Type-no")){
                            result.cName='no';
                        }
                        opts.callback(result);
                        if(opts.relatvClose){
                            obj.remove();
                        }
                    });
                },
                repairLayout:function(){            //修复样式
                    var uH=document.documentElement.clientHeight;
                    _wrap.css('margin-top',(uH-_wrap.height())*.38);
                    return this;
                },
                remove:function(){                  //删除
                    _menb.remove();
                }
            };
        obj.init();
    }
});
})(jQuery);


