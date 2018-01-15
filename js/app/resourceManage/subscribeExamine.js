define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var rid = "";
	var resourceId = "";
	var getButton = function(status,id,sign,resourceId,resName,reslevel){
		var s = "";
		//根据状态判断显示的按钮 1待审核-审批 2已审核-评论、撤销 3已拒绝-删除 4已撤销-删除 5已失效-删除
//		buttons += "<button class='btn btn-warning comment'>评论</button>"+
//								"<div class='undo color-59b0fc'>撤销</div><div class='cancel color-59b0fc'>删除</div>"+
//								"<div class='ui-datetime'>"+row.datetime+"</div>"
		switch(status){
			case "1"://待审核
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button rid='"+id+"' type='subscribe' data-sign='"+sign+"' resourceId='"+resourceId+"'  class='btn btn-warning check'>审批</button>"+
					"</div>"	
			break;
			
			case "2"://已审核
				var modify="";
				if(sign!=2 && reslevel !="2"){    //文件没有修改
					modify="<button rid='"+id+"' type='subscribe' data-sign='"+sign+"' resourceId='"+resourceId+"' resName='"+resName+"' class='btn btn-warning modifySubscribeRes check'>修改</button>"
				}
				s = "<div rid='"+id+"' data-sign='"+sign+"'>"+modify+
					"<button class='undo btn btn-link blockCenter disabled'>审批</button></div>";
			break;
			
			case "3"://已拒绝
				s =	"<div rid='"+id+"' data-sign='"+sign+"'>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
			break;
			case "4"://已撤销
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
			break;
			case "5"://已失效
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
					
			break;
		}
		return s;
	};
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/subscribeReview/findSubResourceList",
				type:"get",
				xhrFields: {withCredentials: true},
				data:function(d){
				/**base库专门获取表单参数的方法**/
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				if(params.state == "0"){
					delete params["state"];
				}
				if(params){
					var paramaA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramaA; 
			}
		},
		columns:[
			{ "data": "data","sWidth":"100%"}
		],
		
		columnDefs:[ 
           {
				"render":function(data,type,row,meta){
					var buttons = getButton(row.state,row.id,row.resType,row.resourceId,row.resName,row.resLevel); //getButton(row.status,row.id);
					var sign ="";
					var viewUrl="";
					//sign type  
					switch(row.resType){
						case "1": 
						sign = "<span class='sign color-1e88e5'>DATA</span>";
						viewUrl='resourceManage/resourceExamine-view/data-view.html?id='+row.resourceId;
						break;
						case "2": sign = "<span class='sign color-fe245c'>DOC</span>";
						viewUrl='resourceManage/resourceExamine-view/doc-view.html?id='+row.resourceId
						break;
						case "3": sign = "<span class='sign color-f2c65d'>API</span>";
						viewUrl='resourceManage/resourceExamine-view/api-view.html?id='+row.resourceId
						break;
					}
					if(row.abstracts){
						if(row.abstracts && row.abstracts.length>50){
							var liContent = row.abstracts.substr(0,50)+"...";
						}else{
							var liContent = row.abstracts;
						}
					}else{
						var liContent = "";
					}
					//图片
					if(row.pictureUrl){
						var pictureUrl = row.pictureUrl;
					}else if(row.subjectPictureUrl){
						var pictureUrl = row.subjectPictureUrl;
					}else{
						var pictureUrl = "images/default.png";
					}
					if(row.resType=="3" && row.subscribeId){
						var targetUrl = $.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.resourceId+"&subscribeId="+row.subscribeId;
					}else{
						var targetUrl = $.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.resourceId;
					}
					var content = "<div class='ui-blockGrid-item'>"+
						"<ul>"+
							"<li type='photo' style='float:left;width:12%'>"+
								"<img src='../"+pictureUrl+"'/>"+
							"</li>"+
							"<li type='info' style='float:left;width:59%'>"+ 
								"<ul class='ui-blockGrid-content'>"+ //<li type='title'><a target='_blank' href='$.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.id'></a></li>
									"<li type='title'><a class='portalurl' target='_blank' href='"+targetUrl+"'>"+row.resName+sign+"</a></li>"+  
									"<li class='content'>"+liContent+"</li>"+
									"<li style='clear:both;padding-left:22px'>"+
										"<div class='classify'>"+row.subjectCarategoryName+"</div>"+
										"<div class='classify'>"+row.industryCategoryName+"</div>"+
									"</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
									"<li style='padding-top:15px'>"+row.applyName+"</li>"+
									"<li>"+(row.appName==null?"":row.appName)+"</li>"+
									"<li class='viewApplication' ctype='"+row.resType+"' cid='"+row.id+"' style='cursor:pointer;color:#59b0fc' type='viewApplication'>查看申请</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
									"<li type='content'>"+changeState(row.state)+"</li>"+
								"</ul>"+
							"</li>"+
							"<li type='buttons' style='float:left;width:11%'>"+
								buttons+
								"<div class='ui-datetime'><span>"+(row.applyTime!=null?(row.applyTime).split(" ")[0]:"")+"</span></br><span>"+(row.applyTime!=null?(row.applyTime).split(" ")[1]:"")+"</span></div></li>"+	
							"</li>"+
						"</ul>"+
					"</div>";
					return content; 			
              	}, 
				"targets":0 
            } 
        ],
        drawCallback:function(setting){
        	viewApplication();//点击查看申请
        	doPublish();//点击审批
        	$(".see-application").click(function(){
        		catalog();
        	})
        	//editSubscribeRes()
        	//选中行
        	common.selectedTr($("#example"));
        }
	};
	//修改状态
	function changeState(state){ //状态(1:待审核,2:已审核,3：已:拒绝,4：已撤销 5：失效)
		switch(state){
			case '1':return "待审核";break;
			case '2':return "已审核";break;
			case '3':return "已拒绝";break;
			case '4':return "已撤销";break;
			case '5':return "已失效";break;
		}
	}
	var viewApplication = function(){
		$(".viewApplication").off().on("click",function(){
			var that = $(this);
			var params;
			if(that.attr("ctype")=="3"){
				params = {'id':$(this).attr("cid"),resType:3};
			}else{
				params = {'id':$(this).attr("cid"),resType:that.attr("ctype")};
			}
			var modal = base.modal({
				width:900,
				height:450,
				label:"订阅流程信息",
				url:"../html/resourceManage/checkApplication.html",
				callback:function(){
					base.ajax({
						url:$.path+"/api/subscribeReview/subscriptionApprovalProcessView",
						type:"post",
						params:params,
						success: function(data) {
							if(data.code =="0"){
								var data = data.data[0];
								setSteps1(data.state,data.resType);
								for(var k in data){
									if(data.resType == "3"){
										var dom = $(".apiformExample");
									}else{
										var dom = $(".formExample");
									}
									if(data[k]){
										if(k=="resType"){
											var value = data[k]=="1"?"数据库":data[k]=="2"?"文件":"API"
											dom.find("."+k).html(value);
										}else if(k == "model"){
											var value = data[k]=="1"?"完全":data[k]=="2"?"映射":"";
											dom.find("."+k).html(value);
										}else if(k == "approvalResult"){
											var approvalResult = data[k]=="0"?"同意":"拒绝";
											dom.find("."+k).html(approvalResult);
										}else{
											dom.find("."+k).html(data[k]);
										}
									}else if(k =="resultNumber"){
										dom.find("."+k).html('--')
									}else if(k =="requestNumber"){
										dom.find("."+k).html('--')
									}else{
										dom.find("."+k).html('--');
									}
								}
							}
						},
						error:function(data){
						}
					})
				},
				buttons:[
				{
					label:"返回",
					cls:"btn btn-info",
					clickEvent:function(){
						modal.hide();
					}
				}]
			})
		})
	}
	//点击审批或者修改之后弹出步骤
	function doPublish(){
		$(".check").off().on("click",function(){
			var url="";
			var sign = $(this).attr("data-sign");
			window.obj={};
			window.obj.resourceId=$(this).attr("resourceId");
			window.obj.subscibeId=$(this).attr("rid");
			window.obj.resName=$(this).attr("resName");
			$(".dataResourceId").val($(this).attr("resourceId"));
			$(".dataSubscribeId").val($(this).attr("rid"));
			$(".res-name").val($(this).attr("resName"));
			var label="";//弹框的label
			if($(this).hasClass("modifySubscribeRes")){
				if(!isSubscribePause($(this).attr("rid"))){ //表示未暂停，需要先暂停才能调用
					base.requestTip({position:"center"}).error("请先暂停订阅的资源！")
					return;
				}
				localStorage.setItem('localStorageMsg', 2);
				label="资源订阅修改"
			}else{
				localStorage.setItem('localStorageMsg', 1);
				label="资源订阅审批"
			}
			switch(sign){
				case "1":url="../html/resourceManage/subscribeResource_check_db.html";break;
				case "2":url="../html/resourceManage/subscribeResource_check_doc.html";break;
				case "3":url="../html/resourceManage/subscribeResource_check_api.html";break;
			}
			modal = base.modal({
				label:label,
				width:1100,
				height:500,
				url:url,
				drag:true,
				callback:function(){
					setSteps(sign);
				},
				buttons:[
						{
							label:"上一步",
							id:"step_back",
							cls:"btn btn-info back",
							style:"display:none",
							clickEvent:function(obj){
								steps.back();
							}
						},
					{
					label:"下一步",
					id:"step_forward",
					cls:"btn btn-info forward",
					style:"display:none",
					clickEvent:function(){
						steps.forward(function(){
							var enames=[];//数据项选中项
							var step = steps.getStep();
							newDataItemArray=[];
							$('.modal-body').mCustomScrollbar("scrollTo",'top',{scrollInertia:0});
							switch(step){
								case 0:
									return true;
								break;
								case 1:
									switch(sign){
										case "1":
										//=================已渲染的
										if(localStorage.getItem('localStorageMsg')==1){
											$(".db #dataMsg [name='cb']").not(":checked").each(function(index,item){
											enames.push($(item).attr("ename"))
										});
										if($(".db .changeParam")){
											$(".db .changeParam").html(localStorage.getItem("dataItemOption"))
											$.each(enames,function(index,item){
												$(".db .changeParam option").each(function(index,item1){
													var attr = $(item1).attr("ename");
													if(attr==item){
														$(item1).remove()
													}
												})
											})
										}
										}
										
										
										break;
										case "2":
										case "3":
									}
									return true;
								break;
								
								case 2:
									var isPass = base.form.validate({form:$("#step2"),checkAll:true});
									if(sign =="1"){										
										compareSAndE($("#step2"));
									}
									if($(".ui-form-error").hasClass("sign")){
										isPass=false;
									}
									if(!isPass){ //则是有必填项或者其他出现
										adjustTd($("#step2"))
									}
									return isPass;
								break;
								case 3:
									var isPass = base.form.validate({form:$("#step3"),checkAll:true});
									//判断start比end小
									//var reg=/^\d+$/  判断非负整数的正则表达式(在base的验证里面加)
									compareSAndE($("#step3"));
									if($(".ui-form-error").hasClass("sign")){
										isPass=false;
									}
									if(!isPass){ //则是有必填项或者其他出现
										adjustTd($("#step3"))
									}
									return isPass;
								break;
								case 4:
									var isPass = base.form.validate({form:$("#contentForm5"),checkAll:true});
									return isPass;
								break;
								case 5:
									var isPass = base.form.validate({form:$("#contentForm5"),checkAll:true});
									return isPass;
								break;
							}
						});
					}
				},
				{
					label:"保存",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						// 1新建保存，2修改保存 localStorage.getItem(localStorageMsg)
						var url="";
						//修改
						if(localStorage.getItem('localStorageMsg')==2){
							switch(sign){
								case"1":url=$.path+"/api/subscribeReview/resourceSubscribeDataUpdate";break;
								case"3":url=$.path+"/api/subscribeReview/resourceSubscribeApiUpdate";break;
							}
						}else{
							url=$.path+"/api/subscribeReview/resourceSubscribeReview";
						}
						$.ajax({
							url:url,
							type:"post",
							dataType:"json",
							contentType:"application/json",
							async:false,
							xhrFields: {withCredentials: true},
							data:JSON.stringify(saveParam(sign)),
							success:function(result){
								if(result.success &&result.data){
									/**刷新父层列表**/
									base.requestTip({position:"center"}).success("审批成功！")
								}else{
									base.requestTip({position:"center"}).error("审批失败")
								}
								common.search(grid);
								modal.hide();
							}
						})
					}
				}
				]
			})
		})
	}
	//数据脱敏 开始值小于结束值
	function compareSAndE(step){
		$("#data_desensitization .start").each(function(index,item){
			var start=Number($(item).val());
			var end=Number($(item).parents("td").find(".end").val());
			if(!start || !end){
			}else{				
				if(!(start<end)){
					$(item).css("border-color","#ff0000");
					$(item).parents("td").find(".end").css("border-color","#ff0000");
					$(item).before("<div class='ui-form-error sign' style='color:red;text-align:left;position: absolute; bottom: -20px;width:200px'>开始数值要小于结束数值</div>")
					adjustTd(step);
				}else{
					$(item).css("border-color","#ddd");
					$(item).parents("td").find(".end").css("border-color","#ddd");
					if($("ui-form-error").hasClass("sign")){
						$("ui-form-error").remove();
					}
				}
			}
		})
	}
	//根据是否有必填项调整td的高度
	function adjustTd(step){
		step.find("td").each(function(tIndex,tItem){
			$(this).css("height","auto")
		})
		$(".ui-form-error").each(function(index,item){
			$(item).parents("td").css("height","60px");
			if($(item).parent().is("span")){
				$(item).parent().find(".ui-form-error").css({"position":"absolute","bottom":"-20px"})
			}
		})
	}
	//获取数据库的表名
	function getDataTable(columnName){
		var table="";
		if(dbPublishDataJson.length>0){
			$.each(dbPublishDataJson,function(index,item){
			if(item.columnName==columnName){
				table=item.table;
			}
		})
		}
		return table;
		
	}
	//点击保存的参数
	function saveParam(sign){
		var params = {};
		var sensitiveFilteing=[],dataFilteing=[],dataDesen=[],dataConversion=[];
		var resType="";
		switch(sign){
			case "1":
			//敏感词过滤
			resType="1";
			params.dbProcessStrategyJson={};//db
			if($(".db #sensitive_word_filter tbody tr td").length>1){
				$(".db #sensitive_word_filter tbody tr").each(function(index,item1){ 
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						case 3:obj.columnName = getDataTable($(this).html())+"."+$(this).html();break;
						case 2:obj.columnType = $(this).find("div").attr("typeId");break;
						case 4:obj.strategyName =$(this).find(".strategy").val();break;//$(this).find(".strategy").val()
						case 5:obj.value = $(this).html();break;  //strategyContent  改成value
					}
				})
				sensitiveFilteing.push(obj);
				});
				params.dbProcessStrategyJson.sensitiveFilteing=sensitiveFilteing;
			}else{
				params.dbProcessStrategyJson.sensitiveFilteing=[];
			}
			
			//数据过滤
			if($(".db #data_filter tbody tr td").length>1){
				$(".db #data_filter tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						//case 0:obj.resourceName = $(this).html();break; //资源名称
						case 3:obj.columnName = getDataTable($(this).html())+"."+$(this).html();break;
						case 2:obj.columnType = $(this).find("div").attr("typeId");break;
						case 4:obj.operators = $(this).find("select").val();break;//比较符
						case 5:obj.value = $(this).find("input").val();break;//比较值
					}
				})
				dataFilteing.push(obj);
				})
				params.dbProcessStrategyJson.dataFilteing=dataFilteing;
				
			}else{
				
				params.dbProcessStrategyJson.dataFilteing=[];
			}
			if(sensitiveFilteing.length>0){
				var temb=[]; //空数组，承载敏感词的数组
				//深拷贝，不改变 sensitiveFilteing的内容
				 $.extend(true,temb,sensitiveFilteing);
				$.each(temb,function(index,item){
					delete item.strategyName;
					item.operators="exclude";
					dataFilteing.push(item);
					params.dbProcessStrategyJson.dataFilteing=dataFilteing;
				})
			}
			//数据脱敏 data_transform
			if($(".db #data_desensitization tbody tr td").length>1){
				$(".db #data_desensitization tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						case 3:obj.columnName = getDataTable($(this).html())+"."+$(this).html();break;
						case 2:obj.columnType = $(this).find("div").attr("typeId");break;
						case 4:obj.type = $(this).find("select").val();
							   obj.start = Number($(this).find(".start").val());
							   obj.end = Number($(this).find(".end").val());
							   break;
					}
				})
				dataDesen.push(obj);
				})
				params.dbProcessStrategyJson.dataDesen=dataDesen;
			}else{
				params.dbProcessStrategyJson.dataDesen=[];
			}
			
			//数据转换
			if($(".db #data_transform tbody tr td").length>1){
				$(".db #data_transform tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						case 3:obj.columnName = getDataTable($(this).html())+"."+$(this).html();break;
						case 2:obj.columnType = $(this).find("div").attr("typeId");break;
						case 4:obj.content = $(this).find("input").val();break;//内容
						case 5:obj.value = $(this).find("input").val();break;//替换为
					}
				})
				dataConversion.push(obj);
				});
				params.dbProcessStrategyJson.dataConversion=dataConversion;
			}else{
				params.dbProcessStrategyJson.dataConversion=[];
			}
			break;
			case "2": //如果是doc只需要保存审批结果和审批意见
			resType="2";
			break;
			case "3":
			//入参处理策略
			resType="3";
			var inParameterStrategy=[];//入参处理策略
			params.outParameterStrategy={};//出参处理策略
			if($(".api #sensitive_word_filter tbody tr td").length>1){
				$(".api #sensitive_word_filter tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						case 0:obj.columnName = $(this).find(".changeParam option:selected").attr("data-table")+"."+$(this).find(".changeParam option:selected").attr("tablecolumn");break;
						case 1:obj.columnType = $(this).html();break;
						case 2:obj.strategyName = $(this).find(".strategy").val();break;
						case 3:obj.strategyContent = $(this).html();break;
					}
				})
				inParameterStrategy.push(obj);
				})
			}else{
				inParameterStrategy=[]
			}
			
			//出参处理策略--敏感词过滤
			if($(".api #sensitive_word_filter_1 tbody tr td").length>1){
				$(".api #sensitive_word_filter_1 tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find("td").each(function(index2,item2){
					switch(index2){
						//case 0:obj.resourceName = $(this).html();break; //资源名称
						case 1:obj.columnName = $(this).find(".changeParam option:selected").attr("data-table")+"."+$(this).find(".changeParam option:selected").attr("tablecolumn");break; //参数名
						case 2:obj.columnType = $(this).prev().find(".changeParam option:selected").attr("data-type");break;//参数类型
						case 3:obj.strategyName = $(this).find(".strategy").val()=="-1"?"":$(this).find(".strategy").val();break;//策略名
						case 4:obj.strategyContent = $(this).html();break;//策略内容    //strategyContent  改成value
					}
				})
				sensitiveFilteing.push(obj);
				})
				params.outParameterStrategy.sensitiveFilteing=sensitiveFilteing;
			}else{
				params.outParameterStrategy.sensitiveFilteing=[];
			}
			
			//数据过滤
			if($(".api #data_filter tbody tr td").length>1){
				$(".api #data_filter tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find( "td").each(function(index2,item2){
					switch(index2){
						//case 0:obj.resourceName = $(this).html();break; //资源名称
						case 1:obj.columnName = $(this).find(".changeParam option:selected").attr("data-table")+"."+$(this).find(".changeParam option:selected").attr("tablecolumn");break; //参数名
						case 2:obj.columnType = $(this).prev().find(".changeParam option:selected").attr("data-type");break;//参数类型
						case 3:obj.operators = $(this).find("select").val();break;//比较符
						case 4:obj.value = $(this).find("input").val();break;//比较值
					}
				})
				dataFilteing.push(obj);
				})
				params.outParameterStrategy.dataFilteing=dataFilteing;
			}else{
				params.outParameterStrategy.dataFilteing=[];
			}
			
			//数据脱敏 data_transform
			if($(".api #data_desensitization tbody tr td").length>1){
				$(".api #data_desensitization tbody tr").each(function(index1,item1){
					var obj = {};
					$(item1).find( "td").each(function(index2,item2){
						switch(index2){
							//case 0:obj.resourceName = $(this).html();break; //资源名称
							case 1:obj.columnName = $(this).find(".changeParam option:selected").attr("data-table")+"."+$(this).find(".changeParam option:selected").attr("tablecolumn");break; //参数名
							case 2:obj.columnType = $(this).prev().find(".changeParam option:selected").attr("data-type");break;//参数类型
							case 3:obj.type = $(this).find("select").val();
								   obj.start = $(this).find(".start").val();
								   obj.end = $(this).find(".end").val();
								   break;
						}
					})
					dataDesen.push(obj);
				})	
				params.outParameterStrategy.dataDesen=dataDesen;
			}else{
				params.outParameterStrategy.dataDesen=[];
			}
			
			//数据转换
			if($(".api #data_transform tbody tr td").length>1){
				$(".api #data_transform tbody tr").each(function(index1,item1){
				var obj = {};
				$(item1).find( "td").each(function(index2,item2){
					switch(index2){
						//case 0:obj.resourceName = $(this).html();break; //资源名称
						case 1:obj.columnName = $(this).find(".changeParam option:selected").attr("data-table")+"."+$(this).find(".changeParam option:selected").attr("tablecolumn");break; //参数名
						case 2:obj.columnType = $(this).prev().find(".changeParam option:selected").attr("data-type");break;//参数类型
						case 3:obj.content = $(this).find("input").val();break;//内容
						case 4:obj.value = $(this).find("input").val();break;//替换为
					}
				})
				dataConversion.push(obj);
				})
				params.outParameterStrategy.dataConversion=dataConversion;
			}else{
				params.outParameterStrategy.dataConversion=[];
			}
			params.inParameterStrategy=inParameterStrategy;
			params.requestNumber  = $(".maxRequest").val();//最大请求次数
			params.resultNumber = $(".maxResponse:visible").val();//最大返回条数
			params.requestTime = $(".requestTime").html();//请求时段
			break;
		}
		//公共参数------------------
		if(resType!="3"){
			var approvalDataJson=JSON.parse(localStorage.getItem("approvalDataJson"))
			var enames=[];
			var enames_approvalDataJson=[];
			if(resType =="1"){
				$.each(approvalDataJson,function(index,item){
					enames_approvalDataJson.push(item.ename);
				})
			}else if(resType =="2"){
				$.each(approvalDataJson,function(index,item){
					enames_approvalDataJson.push(item.id);
				})
			}
			switch(resType){
				case "1":
				$(".db #dataMsg [name='cb']").not(":checked").each(function(index,item){
					enames.push($(this).attr("ename"))
				});
				$.each(enames,function(index,item){
					if(item!=undefined){
						if($.inArray(item,enames_approvalDataJson)!=-1){
						var _index = $.inArray(item,enames_approvalDataJson);	
						enames_approvalDataJson.splice(_index,1)
						approvalDataJson.splice(_index,1)
					}
					}
				})
				break;
				case "2":
				$(".doc #dataMsg [name='cb']").each(function(){
					if(!$(this).is(":checked")){
						enames.push($(this).attr("ename"))
					}
				});
				$.each(enames,function(index,item){
					if(item!=undefined){
						if($.inArray(item,enames_approvalDataJson)!=-1){
							var _index = $.inArray(item,enames_approvalDataJson);	
							enames_approvalDataJson.splice(_index,1)
							approvalDataJson.splice(_index,1)
						}
//						if($.inArray(item.id,enames)!=-1){
//						approvalDataJson.splice($.inArray(item.id,enames),1)
//						}
					}
				})
				break;
			}
			params.approvalDataJson=approvalDataJson;
		}
		params.approvalResult =$(".approvalResult").val();//审批结果
		params.approvalOpinion = $(".approvalOpinion").val()//审批意见
		params.resType = resType;//资源类型
		params.resourceId = $(".dataResourceId").val();//资源id 
		params.subscribeId = $(".dataSubscribeId").val();//订阅id
		//公共参数------------------
		return params
	}
	//数据库判断订阅是否暂停   /api/subscribeReview/beforeSubscribeUpdateCheckStatue  ----订阅审批许要先暂停订阅任务，此接口判断是否已经暂停   true表示已经暂停，false表示未暂停
	function isSubscribePause(subscibeId){
		var isDataPause=true;
		$.ajax({
			url:$.path+"/api/subscribeReview/beforeSubscribeUpdateCheckStatue?subscribeId="+subscibeId,
			async:false,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(d){ //data为true的时候可以修改
				if(!d.data){
					isDataPause=false;
				}
			}
		})
		return isDataPause;
	}
	//点击查看
	var setSteps1 = function(state,resType){
		if(state =="1"){
			state = "1"
		}else{
			state="2"
		}
		$(".cont").removeClass("hidden").addClass("hidden");
		$("#content"+state).removeClass("hidden");
		if(resType == "3"){
			$(".apiformExample").show();
		}else{
			$(".formExample").show();
		}

		var steps = base.steps({
			container:$("#ui-steps"),
			data:[
				{"label":"申请订阅","contentToggle":"#content0"},
				{"label":"订阅审批","contentToggle":"#content1"},
				{"label":"完成订阅","contentToggle":"#content2"}
			],
			buttons:[],
			currentStep:parseInt(state),/**初始化在第几步,默认是0**/
		});
	};
	var setGrid = function(){
		grid = base.datatables({
			container:$("#example"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	
	/**查询**/
	var setSearch = function(){
		$("#search").on("click",function(){
			common.search(grid);
		});
		
	};
	/**重置**/
	var setReset = function(){
		$("#reset").on("click",function(){
			common.reset($("#search-form"),grid);
		});
	};
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");
			$("#status").val(key);
			common.search(grid);
		});
		$(".portalurl").on('click',function(){
			if($(this).attr("restype") == "3"){
				if( $(this).parents("ul").find(".requestState").html()=="已审核"){
					$.cookie("requestState","0",{path:'/'})
				}
			}
		})
	};
	var searchCataLogInfo = function(){
		$.ajax({
			type:"get",
			url:$.path+"/api/catalog/findDomainResCataLogInfo?name=catalogId&type=1",
			success:function(data){
				base.template({
					container:$(".catalogId"),
					templateId:"catalogId-tpl",
					data:data.data
				})
			}
		})
	}
	/*查看申请*/
	var catalog = function(){
		modal = base.modal({
			width:900,
			height:450,
			label:"查看",
			url:"../html/resourceManage/subscribeExamine_step.html",
			callback:function(){
				setSteps();
			},
			buttons:[
				{
					label:"关闭",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						modal.hide();
					}
				}
			]
		});
	}
	//设置步骤插件
	var setSteps = function(sign){
		var data=[];
		switch(sign){
			case "1":
			data =[
				{"label":"查看请求方信息","contentToggle":"#content1"},
				{"label":"查看元数据信息","contentToggle":"#content2"},
				{"label":"数据处理策略","contentToggle":"#content3"},
				{"label":"填写审批意见","contentToggle":"#content4"}
			];
			break;
			case "2":
			data =[
				{"label":"查看请求方信息","contentToggle":"#content1"},
				{"label":"查看元数据信息","contentToggle":"#content2"},
				{"label":"填写审批意见","contentToggle":"#content3"}
			];
			break;
			case "3":
			data =[
				{"label":"查看请求方信息","contentToggle":"#content1"},
				{"label":"查看元数据信息","contentToggle":"#content2"},
				{"label":"入参处理策略","contentToggle":"#content3"},
				{"label":"出参处理策略","contentToggle":"#content4"},
				{"label":"服务控制策略","contentToggle":"#content5"},
				{"label":"填写审批意见","contentToggle":"#content6"}
			];
			break;
			//case "其他":return;break;
		}
		steps = base.steps({
			container:$("#ui-steps"),
			data:data,
			buttonGroupToggle:modal.modalFooter,
			height:420
		})
		
	}
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};	
	return {
		main:function(){
			searchCataLogInfo();
			setContent();
			setGrid();
			setLinkGroup();
			setSearch();
			setReset();
		}
	};
});