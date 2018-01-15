define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var getButton = function(status,id,sign){
		var s = "";
		switch(status){
			case "3"://待发布
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning resourcePublish blockCenter'>发布</button><button class='btn btn-link blockCenter delect color-59b0fc' >删除</button>"+
					"<button class='btn btn-link blockCenter disabled'>撤销</button></div>"	
			break;
			case "5"://已发布
				if(sign !="3"){
					s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning  doModify blockCenter'>修改</button><button class='btn btn-link blockCenter revoke color-59b0fc'>撤销</button>"+
				    "<button class='btn btn-link disabled blockCenter'>删除</button><button class='btn btn-link disabled blockCenter'>发布</button></div>";
				}else{
					s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning blockCenter revoke'>撤销</button>"+
				    "<button class='btn btn-link disabled blockCenter'>删除</button><button class='btn btn-link disabled blockCenter'>发布</button></div>";
				}
			break;
			case "6"://已撤销
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning delect blockCenter'>删除</button><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>发布</button></div>";
			break;
		}
		return s;
	};
	//页面信息查询
	var gridOption0 = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/resource/findResResourceByPage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				var paramsA ;
				if(params){ 
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[ 
			{ "data": "data","sWidth":"100%"}
		],
		columnDefs:[ 
           {
				"render":function(data,type,row,meta){
					var buttons = getButton(row.state,row.id,row.resType),
						sign ="", liContent = "", titleUrl;
					//sign type
					switch(row.resType){
						case "1": sign = "<span class='sign color-1e88e5'>DATA</span>";break;
						case "2": sign = "<span class='sign color-fe245c'>DOC</span>";break;
						case "3": sign = "<span class='sign color-f2c65d'>API</span>";break;
						case "其他": sign = "<span class='sign color-68baff'>"+row.resTypeName+"</span>";break;
					}
					if(row.abstracts){
						if(row.abstracts && row.abstracts.length>50){
							liContent = row.abstracts.substr(0,50)+"...";
						}else{
							liContent = row.abstracts;
						}
					}else{
						liContent = "";
					}
					var jumpPage ="" 
						if(row.state == "3"){
							jumpPage = "<li type='title'><a class='jumpDetail' cid='"+row.id+"' ctype='"+row.resType+"'>"+row.resName+sign+"</a></li>"
						}else{
							jumpPage = "<li type='title'><a target='_blank' href='"+$.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.id+"'>"+row.resName+sign+"</a></li>"
						}
					//图片
					if(row.pictureUrl){
						var pictureUrl = row.pictureUrl;
					}else if(row.subjectPictureUrl){
						var pictureUrl = row.subjectPictureUrl;
					}else{
						var pictureUrl = "images/default.png";
					}
//					var pictureUrl=row.pictureUrl ? row.pictureUrl : row.subjectPictureUrl;

					var content = "<div class='ui-blockGrid-item'>"+
						"<ul>"+
							"<li type='photo' style='float:left;width:12%'>"+
								"<img src='../"+pictureUrl+"'/>"+
							"</li>"+
							"<li type='info' style='float:left;width:59%'>"+
								"<ul class='ui-blockGrid-content'>"+ 
									jumpPage+
									"<li class='content'>"+liContent+"</li>"+
									"<li style='clear:both;padding-left:22px'>"+
										"<div class='classify'>"+row.subjectCarategoryName+"</div>"+
										"<div class='classify'>"+row.industryCategoryName+"</div>"+
									"</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
									"<li type='content'>"+row.companyName+"</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
//									"<li type='title' class='color-777'>申请状态</li>"+
									"<li type='content'>"+row.stateName+"</li>"+
								"</ul>"+
							"</li>"+
							"<li type='buttons' style='float:left;width:11%'>"+
								buttons+
							"<div class='ui-datetime'>"+row.createTime.slice(0,10)+"<br/>"+row.createTime.slice(10)+"</div></li>"+
						"</ul>"+
					"</div>";
					return content; 
              	}, 
				"targets":0 
            } 
        ],
        drawCallback:function(setting){
        	doCheck();//发布与修改
        	doDele()	//删除
        	doRevoke();	//撤销
        	common.selectedTr($("#example"));
        }
	};
	var gridOption1 = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		paging: false,
		lengthChange:false,
		ajax:{
			url:$.path+"/api/localresdatasource/selectFileByDSId",
			type:"post",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				var Id = base.getChecks('cbs').val;
				var params = base.form.getParams($("#search-docform"));
				if(params){
					params = $.extend({"id":Id[0]}, params);
				}else{
					return {"id":Id[0]}
				}
				return JSON.stringify(params);
			}
		},
		columns:[
			{"data":"id","sWidth":"10%"},
			{"data":"name","sWidth":"25%"},
			{"data":"type","sWidth":"25%"},
			{"data":"cSize","sWidth":"20%"},
			{"data":"updateDate","sWidth":"20%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cbFile' cont='"+JSON.stringify(row)+"' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
            }
        ],
        drawCallback:function(){
        	common.selectedTr($("#publishResource2"));
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        }
	}
	
	//点击发布或修改之后弹出步骤
	function doCheck(){
		//发布
		$(".resourcePublish").off().on("click",function(){
			var sign = $(this).parent().attr("data-sign"),
				curId = $(this).parent().attr("rid");//当前选中的记录的id;
			if(sign == "3"){
				base.ajax({
					url:$.path+"/api/resCatalog/findResourceByID?id="+curId,
					type:"get",
					success:function(result){
						if(result.data.apiType == "local"){
							renderDom(sign,curId)
						}else{
							renderDom("4",curId)
						}
					}
				});
			}else{
				renderDom(sign,curId)
			}
		})
		//修改
		$(".doModify").off().on("click",function(){
			var sign = $(this).parent().attr("data-sign"),
				curId = $(this).parent().attr("rid");//当前选中的记录的id;
			base.ajax({
				url:$.path+"/api/resource/beforeUpdateCheckStatue?resourceId="+curId,
				type:"post",
				success:function(result){
					if(result.data){
						renderDom(sign,curId,true)
					}else{
						base.requestTip({position:"center"}).error("请先停掉该服务任务");
					}
				}
			});
		})
	}
	//修改初始化数据
	var runModify = function(initDatas,sign){
		$("#publishResource tbody").find('input[type="checkbox"]').map(function(index,item){
			if(initDatas.dataSourceId == $(item).val()){//
				$(item).attr("checked",true);
			}
			$(item).attr("disabled","disabled");
		})
		if(sign == 1){
			initDatas.dbPublishDataJson = initDatas.dbPublishDataJson.replace("\\","");
			initDatas.dbPublishDataJson=JSON.parse(initDatas.dbPublishDataJson);
			$(".showDataTable").off().css({"cursor":"not-allowed"});
//			$(".selectSQL").off().removeAttr("key").removeClass("selectSQL").css({"cursor":"not-allowed","hover":"none"});
			$(".selectResource").attr("disabled","disabled").off();
		}else if(sign == 2){
			initDatas.fileJson = initDatas.fileJson.replace("\\","");
			initDatas.fileJson=JSON.parse(initDatas.fileJson);
		}
		
		initDatas.dispatchStrategyJson = initDatas.dispatchStrategyJson.replace("\\","");
		initDatas.dispatchStrategyJson=JSON.parse(initDatas.dispatchStrategyJson);
		
		if(initDatas.dbPublishDataJson){
			$(".syncMethod").attr("disabled","disabled").val(initDatas.dbPublishDataJson.incrementModel);
			if(initDatas.dbPublishDataJson.dataConversion.length>0){
				//关闭数据项转换的功能
				$(".switchExec").prop('checked',"checked");
				var lis = "";
		 		initDatas.dbPublishDataJson.dataConversion.map(function(item,index){
					lis += "<li colname='"+item.columnName+"' coltype='"+item.columnType+"'><span>"+item.content+"</span>&nbsp;&lt;-&gt;&nbsp;<span>"+item.value+"</span></li>"
				})
		 		$("#datasourceList option:nth-child(2)").attr("selected","selected").change();
				$(".datasource3 ul").append(lis);
			}
			$("#datasourceList").attr("disabled","disabled");
			$(".dataChange li").removeAttr('onclick');
			$(".dataChange button").attr('disabled',"disabled");
			$(".switchExec").prop('disabled',"disabled");
		}
		var dispatchType = initDatas.dispatchStrategyJson.dispatchType;
		if(dispatchType == "1"){
			$(".beginTime").val(initDatas.dispatchStrategyJson.beginTime);
			$(".cycle").val(initDatas.dispatchStrategyJson.cycle);
			$(".dateTypeMin").val(initDatas.dispatchStrategyJson.dateTypeMin);
		}else if(dispatchType =="2"){
			$(".dateTypeMax").val(initDatas.dispatchStrategyJson.dateTypeMax).change();
			if(initDatas.dispatchStrategyJson.dateTypeMax !="3"){
				$(".day").val(initDatas.dispatchStrategyJson.day);
			}
			$(".hour").val(initDatas.dispatchStrategyJson.hour);
			$(".second").val(initDatas.dispatchStrategyJson.second);
		}else{
			$(".dispatchType").val("3").change()
		}
	}
	//正常渲染流程dom 
	var renderDom = function(sign,curId,isModify){
		var isReload = false,//是否重载
			url="",
			initDatas;
		switch(sign){
			case "1":url="../html/resourceManage/publishResource/publishResource_publish_db.html";break;
			case "2":url="../html/resourceManage/publishResource/publishResource_publish_doc.html";break;
			case "3":url ="../html/resourceManage/publishResource/publishResource_publish_api.html";break;
			case "4":url ="../html/resourceManage/publishResource/publishResource_publish_api3.html";break;
			case "其他":return;break;
		}
		var labelName = isModify ? "资源修改" : "资源发布";
		modal = base.modal({
			label:labelName,
			width:1000,height:500,id:curId,url:url,drag:false,
			callback:function(){
				setSteps(sign);
				if(sign == "4"){//隐藏测试连接按钮
					$("#testConnection").hide();
				}
				if(isModify){
					base.ajax({
						url:$.path+"/api/resource/getDetailForUpdate?id="+curId,
						type:"get",
						contentType:"application/json",
						success:function(data){
							if(data.code=="0"){
								var timeout = setTimeout(function(){
									initDatas = data.data;
									runModify(data.data,sign);
								},400)
							}
						}
					})
				}
			},
			buttons:[{ 
						label:"测试连接",
						id:"testConnection",
						cls:"btn btn-info testConnection",
						clickEvent:function(obj){
							testConnection(sign);
						}
					},
					{
						label:"上一步",
						id:"step_back",
						cls:"btn btn-info back",
						style:"display:none",
						clickEvent:function(obj){
							steps.back();
							var step = steps.getStep();
							switch(step){
								case 0: 
									if(sign !="4"){
										$(".testConnection").show()//显示测试连接按钮	
									}
									if(sign == "2"){ isReload = true; }
								break;
							}
						}
					},
					{
						label:"下一步",
						id:"step_forward",
						cls:"btn btn-info forward",
						style:"display:none",
						clickEvent:function(){
							steps.forward(function(){
								$('.modal-body').mCustomScrollbar("scrollTo",'top',{scrollInertia:0});
								var step = steps.getStep();
								switch(step){
									case 0:
										var isFull1 = step1CheckFn(sign,isReload,initDatas,isModify);
										
										if(isFull1 && isFull1 ==true){ 
											$(".testConnection").hide()
											return true;
										}else{ 	
											return false;
										}
										break;
									case 1:
										//点击下一步判断条件是否满足
										var isFull2 = step2CheckFn(sign,isModify,initDatas);
										if(isFull2 && isFull2 ==true){ 
											return true;
										}else{ 
											return isFull2;
										}
									break;
									case 2:
									
										if(sign == "1"){
											if(isModify){
												$(".syncMethod").change();
												$(".snapUsed").val(initDatas.snapUsed);
												if(initDatas.dbPublishDataJson.incrementModel =="2"){
													$("#timestampField").val(initDatas.dbPublishDataJson.timestampField);
												}
												$(".dispatchType").val(initDatas.dispatchStrategyJson.dispatchType).change();
											}
											if($(".switchExec:checked").length>0){//大于0为启用转换
												if($(".datasource3").find("ul li").length < 1){
													return base.requestTip({position:"center"}).error("至少选择一条")
												}
											}
											//多表时不支持时间戳模式
											if($(".showDatasourceTable").find("li.active").attr("key") == "1"){
												$(".syncMethod").attr("disabled","disabled");
											}
										}else if(sign=="2"){
											//间隔周期的校验
											var isFull3 = pubTimeCheck();
											if(!isFull3|| isFull3 !=true){return false;}
											
											var dispatchType =  $(".dispatchType").val() ;
											var DomType = dispatchType=="1"?"周期模式":dispatchType =="2"?"定期模式":"触发器模式";
											if(dispatchType =="1"){ 
												$(".dispatchDom").find("thead th").show();
												var timeType = $(".dateTypeMin").val() =="1"?"时":($(".dateTypeMin").val() =="2"?"分":"秒");
												$(".dispatchDom tbody").html("<tr><td>"+DomType+"</td><td>"+$(".beginTime").val()+"</td><td>"+$(".cycle").val()+"&nbsp;"+timeType+"</td>/tr>");
											}else if(dispatchType == "2"){
	 											$(".dispatchDom").find("thead th:nth-child(2)").nextAll().hide();
												var dateTypeMaxvalue= $(".regularMode .dateTypeMax").val();
												var dateTypeMax = dateTypeMaxvalue=="1"?"每月":dateTypeMaxvalue =="2"?"每周":"每日";
												var day = $(".regularMode .day").val()+"天";
												var hour = $(".regularMode .hour").val()+"时";
												var second = $(".regularMode .second").val()+"分";
												if(dateTypeMaxvalue !="3"){
													var regularModeAll = dateTypeMax+"&nbsp;&nbsp;"+day+"&nbsp;&nbsp;"+hour+"&nbsp;&nbsp;"+second;
												}else{
													var regularModeAll = dateTypeMax+"&nbsp;&nbsp;"+hour+"&nbsp;&nbsp;"+second;
												}
												$(".dispatchDom tbody").html("<tr><td>"+DomType+"</td><td>"+regularModeAll+"</td>/tr>");
											}else{
												$(".dispatchDom").find("thead th:nth-child(1)").nextAll().hide();
												$(".dispatchDom tbody").html("<tr><td>"+DomType+"</td>/tr>");
											}
											
										}else if(sign == "3"){
											var inParameterJson = $(".inputParams .inParameterJson");
											var searchfiled= [];
											for(var mm =0;mm<$(".inputParams .inParameterJson").length;mm++){
												var temValue =$(inParameterJson[mm]).val();
												if(searchfiled.indexOf(temValue)>-1){
													return base.requestTip({position:"center"}).error("第"+(searchfiled.indexOf(temValue)+1)+"行和第"+(mm+1)+"行重复")
//													return base.requestTip({position:"center"}).error("不能选择重复")
												}
												searchfiled.push(temValue)
											}
										}
										return true;
									break;
									case 3:
										if(sign == "1"){
											if(!isModify){
												//获取服务器的时间
												base.ajax({
													url:$.path+'/api/resource/getNowDate',
													type:"get",
													success:function(d){
														$(".beginTime").val(d.data);
													}
												})
												var temsyncMethod = $(".syncMethod").val();
												if(temsyncMethod == "1" ){
													$(".periodicMode").show();
													$(".regularMode").hide();
												}
												if(temsyncMethod == "2" ){
													if(!$("#timestampField").val() || $("#timestampField").val() == ""){
														return base.requestTip({position:"center"}).error("列名不能为空")
													}
													$(".periodicMode").hide();
													$(".regularMode").show();
												}
												$(".showNotes").find("p").hide();
												$(".showNotes").find("p:nth-child("+temsyncMethod+")").show();
												$(".dispatchType").val(temsyncMethod); 
											}else{
												
											}
										}else if(sign= "3"){
											var outParameterJson = $(".outputParams .outParameterJson");
											var temTableNameList = [];
											var tbody = $(".outputParams tbody");
											for(var mm =0;mm<$(".outputParams .outParameterJson").length;mm++){
												var temValue = tbody.find("tr:nth-child("+(mm+1)+")").find(".outParameterJson").val();
												if(temValue){
													
													var temValueTypeStr = tbody.find("tr:nth-child("+(mm+1)+")").find(".outParameterJson option:selected").attr("name");
													var temtype = tbody.find("tr:nth-child("+(mm+1)+")").find(".type").attr('type');
												
													if(temValue){
														if(temTableNameList.indexOf(temValue)>-1){
															return base.requestTip({position:"center"}).error("第"+(temTableNameList.indexOf(temValue)+1)+"行和第"+(mm+1)+"行重复")
														}
//														if(temtype != temValueTypeStr&& temValueTypeStr){
//															return base.requestTip({position:"center"}).error("第"+(mm+1)+"行类型不匹配")
//														}
														temTableNameList.push(temValue)
													}
												}else{
													return base.requestTip({position:"center"}).error("第"+(mm+1)+"行不能为空")
												}
											}
										}
										return true;
									break;
									case 4:
										if(sign =="1"){
											var isFull4 = pubTimeCheck();
											if(!isFull4 || isFull4 !=true){return false;}
											publishPreview();
										}
										return true;
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
							switch(sign){
								case "1": dataSave(isModify,initDatas);
									break;
								case "2": docSave(isModify);
									break;
								case "3": 
									apiSave();
									break;
								case "4": api3Save();
									break;
							}
//							modal.hide();
						}
					}
				]
			})
		}
	
	//第一步执行时的方法及校验
	var step1CheckFn = function(sign,isReload,initDatas,isModify){
		//发布
		if(!isModify){
			if(sign =="4"){//第三方api
				
				if($(".checkServies").val()==""){
					return base.requestTip({position:"center"}).error("请填写接口URL")
				}
				if($(".switchInterface").val() == "webservice"){			
					if($(".interfaceAddress").attr("isBool")=="false"){
						return base.requestTip({position:"center"}).error("请填写正确的接口URL")
					}
				}
				if(!$(".apiDocId").attr("ID") || $(".apiDocId").attr("ID")==""){
					return base.requestTip({position:"center"}).error("请选择接口文档")
				}
				return true;
			}
			var params = base.getChecks('cbs').val;
			if(params.length =="0"){
				return base.requestTip({position:"center"}).error("请选择一个数据源")
			}else{
				if(sign=="2"){
					if(!isReload){
						setGrid($("#publishResource2"),gridOption1,2);
						isReload  = !isReload;
					}else{
						grid1.reload();
					}
				}
				$(".testConnection").hide()
			}
			return true;
		}else{//修改
			if(sign =="1"){//数据库 
				//选择表模式
				if(initDatas.dbPublishDataJson.type==1){
					$(".diary").find("li:last").addClass("hidden");
					initDatas.tables = initDatas.dbPublishDataJson.tables[0];
					$(".sqltables").attr("name",initDatas.tables);
					var params = {datasourceId:initDatas.dataSourceId,tableName:initDatas.tables}
					base.ajax({
						url:$.path+"/api/commonController/selectColByDSIdAndTabNames",
						type:"get", params:params,
						success: function(data) {
							$(".inputParams tbody tr").map(function(){
								var type = $(this).find("td:nth-child(3)").attr("type");
								var ename = $(this).find("td:first").attr("name");
								var options="<option value='-1'>请选择</option>",firstOption="",option="",tType="",tName="";
								data.data.map(function(item,value){
									var tableData = item.tableData;
									for(var k=0;k<tableData.length;k++){
										if(tableData[k].columnName && tableData[k].columnName!="PK" && tableData[k].tableName){
											if(tableData[k].valueType ==type){
												/**名称一样，则优先处理,默认选中第一个**/
												if(tableData[k].columnName ==ename){
													tType = tableData[k].type;
													tName = tableData[k].tableName;
													firstOption += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
												}else{
													tType = tableData[k].type;
													tName = tableData[k].tableName;
													option += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
												}
											}
										}
									}
								})
								options =options+firstOption+option;
								$(this).find(".outParameterJson").empty().append(options);
							})
							//回调函数
							callbackFn(initDatas.dbPublishDataJson.sourceColumns);
						}
					})
				}else{//sql模式
					$(".diary").find("li:last").click();
					$(".diary").find("li:first").addClass("hidden");
					$(".checkSQL").attr('disabled',"disabled");
					$(".testSql").attr('disabled',"disabled");
					$(".sqlContent").val(initDatas.dbPublishDataJson.sql).attr('disabled',"disabled");
					var dataSourceId = base.getChecks('cbs').val[0];
					base.ajax({
						url:$.path+"/api/resource/checkSql?dataSourceId="+dataSourceId+"&sql="+initDatas.dbPublishDataJson.sql,
						type:"get",
						success:function(result){
							if(result && result.data){
								$(".outParameterJson").parents("td").next().html("");
								$(".outParameterJson").parents("td").next().next().html("");
								var tableData = result.data,temSqltables = [];
								$(".inputParams tbody tr").map(function(){
									var type = $(this).find("td:nth-child(3)").attr("type");
									var ename = $(this).find("td:first").attr("name");
									var options="<option value='-1'>请选择</option>",firstOption="",option="",tType="",tName="";
									for(var k=0;k<tableData.length;k++){
										if(tableData[k].columnName && tableData[k].columnName!="PK"){
											if(tableData[k].valueType ==type){
												if(temSqltables.indexOf(tableData[k].tableName)=="-1"){									
													temSqltables.push(tableData[k].tableName);
												}
												/**名称一样，则优先处理,默认选中第一个**/
												tType = tableData[k].type;
												tName = tableData[k].tableName ? tableData[k].tableName :"--";
												if(tableData[k].columnName ==ename){
													firstOption += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
												}else{
													option += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
												}
											}
										}
									}
									options =options+firstOption+option;
									$(this).find(".outParameterJson").empty().append(options);
									$(this).find(".outParameterJson option:eq(1)").prop('selected',true);
									var _type = common.interceptString(tType,10);
									var _name = common.interceptString(tName,10);
									$(this).find(".outParameterJson").parents("td").next().empty().append(_type)
									$(this).find(".outParameterJson").parents("td").next().next().empty().append(_name);
								})
								$(".sqltables").attr("name",JSON.stringify(temSqltables));
								//回调函数
								callbackFn(initDatas.dbPublishDataJson.sourceColumns)
							}
						}
					})
				}
				
			}else{//文件
				if(!isReload){
					setGrid($("#publishResource2"),gridOption1,2);
					isReload  = !isReload;
				}else{
					grid1.reload();
				}
				//这里是文件的修改
				var settime = setTimeout(function(){
					initDatas.fileJson.map(function(items,index){
						$("#publishResource2 tbody").find('input[type="checkbox"]').map(function(index,item){
							var attr = JSON.parse($(item).attr("cont")).name;
							if(items.name == attr){
								$(item).attr("checked",true).attr("disabled","disabled")
							}
						})
					})
					
				},400)
			}
			return true;
		}
	}
	//选择数据源后的回调事件
	var callbackFn = function(sourceColumns){
		$(".outParameterJson").map(function(q,item){
			if(sourceColumns[q]){
				var vals = sourceColumns[q].columnName;
				if(vals){
					$(this).val(vals);
					$(this).attr("disabled","disabled");
					$(this).parents("tr").find("td:last button:first").attr("disabled","disabled");
					var _type = common.interceptString(sourceColumns[q].type,10);
					var _table = common.interceptString(sourceColumns[q].table,10);
					$(this).parent().next().empty().append(_type);
					$(this).parent().next().next().empty().append(_table);
				}
			}
		})
		$(".outParameterJson").select2();
		$(".outParameterJson").on("change",function(){
			if($(this).val()&&$(this).val() !="-1"){
				var tt = JSON.parse($(this).find("option:selected").attr("name"));
				$(this).parent().next().html(common.interceptString(tt.type,8));
				$(this).parent().next().next().html(common.interceptString(tt.tableName,8));
			}else{
				$(this).parent().next().html("");
				$(this).parent().next().next().html("");
			}
		})
	}
	
	//第二步执行时的方法及校验
	var step2CheckFn = function(sign,isModify,initDatas){
		if(sign == "1"){
			if(!$(".sqltables").attr("name")) return base.requestTip({position:"center"}).error("请选择数据表或者创建SQL")
			var tbody = $(".inputParams tbody");
			var temTableNameList = [];
			for(var mm =0;mm<$(".inputParams tbody tr").length;mm++){
				var temValue = tbody.find("tr:nth-child("+(mm+1)+")").find(".outParameterJson").val();
				var temValueTypeStr = tbody.find("tr:nth-child("+(mm+1)+")").find(".outParameterJson option:selected").attr("name");
					temValueTypeStr = temValueTypeStr ?JSON.parse(temValueTypeStr).valueType:"";
				var temTableNameValue = tbody.find("tr:nth-child("+(mm+1)+")").find("td:nth-child(6) div").attr("title");
				if(tbody.find("tr:nth-child("+(mm+1)+")").find("td:first").html().indexOf("PK")>-1){
					if(!temValue || temValue=="-1"){
						return base.requestTip({position:"center"}).error("请配置主键")
					}else{
						temTableNameList.push(temValue+"."+temTableNameValue);
					}
				}else{
					if(temValue && temValue!="-1"){
						if(temTableNameList.indexOf(temValue+"."+temTableNameValue)>-1){
							return base.requestTip({position:"center"}).error("第"+(temTableNameList.indexOf(temValue+"."+temTableNameValue)+1)+"行和第"+(mm+1)+"行重复")
						}
						temTableNameList.push(temValue+"."+temTableNameValue)
					}
				}
			}
			if(temTableNameList.length<1){
				return base.requestTip({position:"center"}).error("至少选择一个")
			}
			if(!isModify){
				//清除下一步数据项转换的缓存
				$(".execCode").attr("disabled",true);
				$(".datasourceContent").css({"background-color":"#eee"}).find("ul").empty();
				$('.datasource1 ul').remove();
				$(".switchExec").attr("checked",false);
				$("#datasourceList").val("-1");
				$(".dictName").val("");
			}else{
				if(initDatas.dbPublishDataJson.dataConversion != ""){
					//此处是数据项转换
				}
			}
		}else if(sign=="2"){
			var len = $("#publishResource2 tbody").find("input:checked").length;
			if(len >0){
				var publishResource2 = $("#publishResource2 tbody").find("input:checked"),tr="";
					publishResource2.map(function(index,item){
						var cont = JSON.parse($(item).attr('cont'));
						tr += '<tr>'+
								'<td class="">'+cont.name+'</td>'+
								'<td class="">'+cont.type+'</td>'+
								'<td class="">'+cont.cSize+'</td>'+
								'<td class="">'+cont.updateDate+'</td>'+
							'</tr>';
					})
				$("#fileJson tbody").html(tr);
			}else{
				base.requestTip({position:"center"}).error("至少选择一条")
				return false
			}
		}else if(sign=="3"){
			if(!$(".sqltables").attr("name")) return base.requestTip().error("请选择数据表或者创建SQL");				
			if($(".showTable tbody").find("tr").length <1){
				base.requestTip({position:"center"}).error("请选择字段名称");
				return false;
			}
		}
		return true;
	}
	
	//发布时间隔周期的校验
	var pubTimeCheck= function(){
		if($(".dispatchType").val() == '1'){
			if($(".beginTime").val() == ""){
				return base.requestTip({position:"center"}).error("填写开始时间")
			}
			if($(".cycle").val() == ""){
				return base.requestTip({position:"center"}).error("填写间隔周期")
			}
			if($(".dateTypeMin").val() =="1"){
				if($(".cycle").val()>24 || $(".cycle").val()<0){//小时
					return base.requestTip({position:"center"}).error("间隔周期不合法")
				}
			}else{
				if($(".cycle").val()>60 || $(".cycle").val()<0){//分钟或秒
					return base.requestTip({position:"center"}).error("间隔周期不合法")
				}
			}
		}
		
		if($(".dispatchType").val() =="2"){
			if($(".dateTypeMax").val() != "3"){								
				if($(".day").val() == ""){
					return base.requestTip({position:"center"}).error("填写间隔周期")
				}
			}
			if($(".hour").val() == ""){
				return base.requestTip({position:"center"}).error("填写间隔周期")
			}
			if($(".second").val() == ""){
				return base.requestTip({position:"center"}).error("填写间隔周期")
			}
			if($(".hour").val()>24 || $(".hour").val()<0){//小时
				return base.requestTip({position:"center"}).error("间隔周期不合法")
			}
			if($(".second").val()>60 || $(".second").val()<0){//分钟
				return base.requestTip({position:"center"}).error("间隔周期不合法")
			}
		}
		return true;
	}
	//发布预览
	var publishPreview = function(){
		//主键的表
		var pkArr = [];
		$(".inputParams").find(".name").map(function(index,item){
			var Dom = $(item);
			if(Dom.html().indexOf("PK")>-1){				
				var name = Dom.parents("tr").find("td:nth-child(7)>div").attr("title")+"."+Dom.parents("tr").find(".outParameterJson ").val();
					pkArr.push({name:name});
			}
		})
		
		//关联数据表下面的表中的值
		var inputDom = $(".inputParams").find("tbody tr");
		var sourceColumns=[];
		inputDom.map(function(index,item){
			var Dom = $(item),
			    inParameterJson={};
			    if(Dom.find(".outParameterJson").val() =="-1"){
			    	inParameterJson.columnName="";
			    }else{
			    	inParameterJson.columnName = Dom.find(".outParameterJson").val();
			    }
				inParameterJson.dataItemCode = Dom.find(".name").attr("code");//"code"
				inParameterJson.dataItemName = Dom.find(".name").attr("name");//"name"
				inParameterJson.index = index;
				if(Dom.find(".outParameterJson").val() == "-1"){
					inParameterJson.showName = "";
				}else{					
					inParameterJson.showName = Dom.find(".outParameterJson").val()+"."+Dom.find(".dataSources div").attr("title");//"res_cuscompany.mysqlchinese_170727140833_TMP"
				}
				if(!Dom.find(".dataSources div").attr("title")){
					inParameterJson.table = "";
				}else{
					inParameterJson.table = Dom.find(".dataSources div").attr("title");
				}
//				inParameterJson.table =  ;//"mysqlchinese_170727140833_TMP"	
				if(!Dom.find("td:nth-child(6)>div").attr("title")){
					inParameterJson.type = "";
				}else{
					inParameterJson.type = Dom.find("td:nth-child(6)>div").attr("title");
				}
//				inParameterJson.type = Dom.find("td:nth-child(6)>div").attr("title");//""
			sourceColumns.push(inParameterJson);
		})
		
		var tables = [];
		if($(".showDatasourceTable").find("li.active").attr("key") == "0"){//选择表模式
			tables.push($(".sqltables").attr("name"))
		}else{//sql模式
			tables = JSON.parse($(".sqltables").attr("name"))
		}
		
		var publishPreviewParams = {};
			publishPreviewParams.dataSourceId=base.getChecks('cbs').val[0];
			publishPreviewParams.resourceId=$(".modal").attr("id");;
			publishPreviewParams.dbPublishDataJson = {
				pkColumns:pkArr,				
				tables:tables,
				sourceColumns:sourceColumns,
				table_releation:[]
			}
		var tableType = $(".showDatasourceTable").find("li.active").attr("key") == "0" ? 1:2;//选择的模式
			publishPreviewParams.dbPublishDataJson.type = tableType;// 1为图形模式 2 为sql 模式
			publishPreviewParams.dbPublishDataJson.sql = tableType=="1"?"":$(".sqlContent").val().replace(/\n+|\t|\s+|\;$/g," ");
		base.ajax({
			url:$.path+"/api/resource/publishPreviewMoreTable",
			params:publishPreviewParams,
			type:"post",
			success:function(result){
				if(result&&result.data){
					var sourceColumns = result.data.sourceColumns;
					var content = result.data.content;
					var thName ="",columnName = [];
					sourceColumns.map(function(item,index){
						thName += "<th>"+item.dataItemName+"</th>";
						columnName.push(item.columnName);
					})
					
					var trs="";
					for(var i=0;i<content.length;i++){
					 	trs+= "<tr>";
					 	for(var k=0;k<columnName.length;k++){
					 		if(content[i][columnName[k]]){					 			
					 			trs += "<td>"+content[i][columnName[k]]+"</td>";
					 		}else{
					 			trs += "<td>--</td>";
					 		}
					 	}
					 	trs+="</tr>";
					}
					$(".sjyl").find("thead tr").html(thName);
					$(".sjyl").find("tbody").html(trs)
				}else{
					base.requestTip({position:"center"}).error(result.message)
				}
			}
		})
	}
	var dataSave = function(isModify,initDatas){
		$("#step_confirm").attr("disabled","disabled");
		var tables = [];
		if($(".showDatasourceTable").find("li.active").attr("key") == "0"){			
			tables.push($(".sqltables").attr("name"))
		}else{
			tables = JSON.parse($(".sqltables").attr("name"))
		}
		//关联数据表下面的表中的值
		var inputDom = $(".inputParams").find("tbody tr");
		var sourceColumns=[];
		inputDom.map(function(index,item){
			var inParameterJson={};
			var Dom = $(item);
				if(Dom.find(".outParameterJson").val() =="-1"){
					inParameterJson.columnName = ""//"res_cuscompany"
				}else{
					inParameterJson.columnName = Dom.find(".outParameterJson").val()//"res_cuscompany"
				}
				inParameterJson.dataItemCode = Dom.find(".name").attr("code");//"code"
				inParameterJson.dataItemName = Dom.find(".name").attr("name");//"name"
				inParameterJson.index = index;
				if(Dom.find(".outParameterJson").val() == "-1"){
					inParameterJson.showName = "";
				}else{	
					inParameterJson.showName =  Dom.find(".outParameterJson").val()+"."+Dom.find(".dataSources div").attr("title");//"res_cuscompany.mysqlchinese_170727140833_TMP"
				}
				if(!Dom.find(".dataSources div").attr("title")){
					inParameterJson.table = "";
				}else{
					inParameterJson.table = Dom.find(".dataSources div").attr("title");
				}
//				inParameterJson.table = Dom.find(".dataSources div").attr("title");//"mysqlchinese_170727140833_TMP"
				if(!Dom.find("td:nth-child(6)>div").attr("title")){
					inParameterJson.type = "";
				}else{
					inParameterJson.type = Dom.find("td:nth-child(6)>div").attr("title");
				}
//				inParameterJson.type = Dom.find("td:nth-child(6) div").attr("title");//""
			sourceColumns.push(inParameterJson);
		})
		//主键的表
		var pkColumns = [];
		$(".inputParams").find(".name").map(function(index,item){
			if($(item).html().indexOf("PK")>-1){
				var parents = $(item).parents("tr");
				var name = parents.find("td:nth-child(7)>div").attr("title")+"."+parents.find(".outParameterJson").val();
				pkColumns.push({name:name});
			}
		})
		//最后要保存的参数
		var dataSaveOption={};
		//是否使用快照
		var snapUsed = $(".snapUsed").val();
			dataSaveOption.snapUsed = snapUsed;
			//保存的资源的类型
			dataSaveOption.resType = 1;
			//保存资源的id
			dataSaveOption.resourceId = $(".modal").attr("id");
		//发布资源的数据项json字符串	
		var dbjsonList=[];
		var dbjsonobj = JSON.parse($(".dbJson").attr("name"));
			dataSaveOption.dataSourceId = base.getChecks('cbs').val[0];
		$(".showDatasourceTable").find("tbody tr").map(function(){
			var columnType = $(this).find("td:nth-child(6)>div").attr("title");
			var columnName = $(this).find("td:nth-child(5) select").val();
			columnType = columnType?(columnType=="-1"?"":columnType):"";
			columnName = columnName?(columnName=="-1"?"":columnName):"";
			dbjsonList.push({columnType:columnType,columnName:columnName});
		})
		dbjsonobj.map(function(item,index){
			dbjsonobj[index].columnType = dbjsonList[index].columnType;
			dbjsonobj[index].columnName = dbjsonList[index].columnName;
		})
		dataSaveOption.dbJson = dbjsonobj;
		
		dataSaveOption.dbPublishDataJson = {
			incrementModel:1,				//1触发器模式，2时间戳模式，
			timestampField:'',				//$("#timestampField").val(),//"",//时间戳
			pkColumns:pkColumns,				//[{name: "t_test_TMP.name"}],
			tables:tables,
			sourceColumns:sourceColumns,
			table_releation:[]//table_releation
		}
		if(isModify){
			dataSaveOption.dbPublishDataJson.trigger = initDatas.dbPublishDataJson.trigger;
			dataSaveOption.dbPublishDataJson.tmpTable = initDatas.dbPublishDataJson.tmpTable;
		}
			
		var tableType = $(".showDatasourceTable").find("li.active").attr("key") == "0" ? 1:2;//选择的模式
			dataSaveOption.dbPublishDataJson.type = tableType;// 1为图形模式 2 为sql 模式
			dataSaveOption.dbPublishDataJson.sql = tableType=="1"?"":$(".sqlContent").val().replace(/\n+|\t|\s+|\;$/g," ");
			
		if($(".syncMethod").val() == "2"){
			dataSaveOption.dbPublishDataJson.incrementModel = 2;
			dataSaveOption.dbPublishDataJson.timestampField = $("#timestampField").val();
		}
		
		dataSaveOption.dbPublishDataJson.dataConversion=[];
		$(".datasource3 li").map(function(index,item){
			dataSaveOption.dbPublishDataJson.dataConversion.push({
				"columnName": $(item).attr("colName"),
              	"columnType": $(item).attr("colType"), 
              	"content": $(item).find("span:first").html(), 
              	"value": $(item).find("span:last").html() 
			})
		})
			
		var dateTypeMax="",dateTypeMin="";
		if($(".dispatchType").val()=="2"){					//周期模式
			dateTypeMax = $(".dateTypeMax").val()=="" ?"":parseInt($(".dateTypeMax").val())
		}
		if($(".dispatchType").val()=="1"){
			dateTypeMin = $(".dateTypeMin").val()=="" ?"":parseInt($(".dateTypeMin").val())
		}
		
		dataSaveOption.dispatchStrategyJson = {
			beginTime:$(".beginTime").val(), 				//"2017-09-21 11:14:31",
			cycle: $(".cycle").val()=="" ?"":parseInt($(".cycle").val()),//12,
			dateTypeMax:dateTypeMax,						//定期模式要传的东西
			dateTypeMin:dateTypeMin,						//1,周期模式要传的东西,
			day: $(".day").val()=="" ?"":parseInt($(".day").val()),//"",
			dispatchType:$(".dispatchType").val()=="" ?"":parseInt($(".dispatchType").val()),//1,
			hour: $(".hour").val()=="" ?"":parseInt($(".hour").val()),
			second: $(".second").val()=="" ?"":parseInt($(".second").val())
		}
		if($(".dateTypeMax").val() =="3"){ dataSaveOption.dispatchStrategyJson.day=""};
		
		var APIurl = "",successWord = "";
		if(isModify){ //修改
			APIurl = "resourceUpdate";
			successWord = "服务修改已完成 ,需要重启任务";
		}else{//发布
			APIurl = "resiurcePublication";
			successWord = "保存成功"
		}
		base.ajax({
			url:$.path+"/api/resource/"+APIurl,
			params:dataSaveOption,
			type:"post",
			success:function(data){
				$("#step_confirm").removeAttr("disabled");
				modal.hide();
				common.search(grid);
				base.requestTip({position:"center"}).success(successWord);
			}
		})
			
	}
	//发布保存APi
	var apiSave= function(){
		$("#step_confirm").attr("disabled","disabled");
		var	tableType = $(".showDatasourceTable").find("li.active").attr("key") == "1" ? 2:1;//选择的模式
		var tables = [];
		if(tableType == "1"){			
			tables.push($(".sqltables").attr("name"));
		}else{
//			tables = JSON.parse($(".sqltables").attr("name"))
			tables = ["dssg_temp_table"];
		}
		var inputDom = $(".inputParams").find("tbody tr"),
			inputParamsAll=[];
		inputDom.map(function(index,item){
//			var len = $(item).find(".inParameterJson").val().indexOf(".");
			var inParameterJson={};
				inParameterJson.hiddenName = $(item).find(".name").html();
//				if(tableType =="1"){
//					inParameterJson.table = $(item).find(".inParameterJson").val().slice(0,len);
//					inParameterJson.name = $(item).find(".inParameterJson").val().slice(len+1);
//				}else{
					inParameterJson.table = tables[0];
					inParameterJson.name = $(item).find(".inParameterJson").val();
//				}
				inParameterJson.mandatory = $(item).find(".mandatorys").attr('name');
				inParameterJson.conditionExp = $(item).find(".conditionExp").val();
				inParameterJson.type = '';
			inputParamsAll.push(inParameterJson);
		})
			
		var outDom = $(".outputParams").find("tbody tr"),
			outParamsAll=[];
			outDom.map(function(index,item){
//				var len = $(item).find(".outParameterJson").val().indexOf(".");
				var outParameterJson={};
					outParameterJson.type = $(item).find(".type").html();
					outParameterJson.showName = $(item).find(".name").html();
					outParameterJson.enable = true;
//					if(tableType =="1"){
//						outParameterJson.name = $(item).find(".outParameterJson").val().slice(len+1);
//						outParameterJson.table = $(item).find(".outParameterJson").val().slice(0,len);
//					}else{
						outParameterJson.table = tables[0];
						outParameterJson.name = $(item).find(".outParameterJson").val();
//					}
					outParameterJson.notNull = $(item).find(".mandatorys").attr('name');
				outParamsAll.push(outParameterJson);
			})
		
		var apiSaveOption={};
			apiSaveOption.type = tableType;// 1为图形模式 2 为sql 模式
			apiSaveOption.sql = tableType=="1"?"":$(".sqlContent").val().replace(/\n+|\t|\s+|\;$/g," ");
			
			apiSaveOption.resType = "3";
			apiSaveOption.apiSource = $(".apiSaveOption").attr("name");
			apiSaveOption.dataSourceId = base.getChecks('cbs').val[0];
			apiSaveOption.resourceId = $(".modal").attr("id");
			apiSaveOption.dataTableView = "";
			apiSaveOption.tableReleation = [];
			apiSaveOption.functionName = $(".interfaceMethod").html();
			apiSaveOption.serviceType = $(".switchInterface").val();
			apiSaveOption.tables = tables;
			apiSaveOption.outParameterJson = outParamsAll;
			apiSaveOption.inParameterJson = inputParamsAll;
		base.ajax({
			url:$.path+"/api/resource/resiurcePublication",
			params:apiSaveOption,
			type:"post",
			success:function(data){
				$("#step_confirm").removeAttr("disabled");
				modal.hide();
				base.requestTip({position:"center"}).success("保存成功")
				common.search(grid);
			}
		})
	}
	
	//第三方api保存
	var api3Save = function(){
		$("#step_confirm").attr("disabled","disabled");
		var apiSaveOption={};
			apiSaveOption.resType = "3";
			apiSaveOption.apiSource = $(".apiSaveOption").attr("name");
			apiSaveOption.resourceId = $(".modal").attr("id");
			apiSaveOption.functionName = $(".showDetail .interfaceMethod").html();
			apiSaveOption.serviceType = $(".switchInterface").val();
			apiSaveOption.apiUrl = $(".checkServies").val();

			apiSaveOption.apiDocId = $(".apiDocId").attr("ID");
		base.ajax({
			url:$.path+"/api/resource/resiurcePublication",
			params:apiSaveOption,
			type:"post",
			success:function(data){
				$("#step_confirm").removeAttr("disabled");
				modal.hide();
				base.requestTip({position:"center"}).success("保存成功")
				common.search(grid);
			}
		})
	}
	//文件保存
	var docSave = function(isModify){
		$("#step_confirm").attr("disabled","disabled");
		var fileJson=[],
			publishResource2 = $("#publishResource2 tbody").find("input:checked");
			publishResource2.map(function(index,item){
				var cont = JSON.parse($(item).attr('cont'));
				fileJson.push(cont)
			})
		var docSaveOption = {
			dataSourceId:base.getChecks('cbs').val[0],
			dispatchStrategyJson:{
				beginTime:$(".beginTime").val(),//"2017-09-21 11:14:31",
				cycle:$(".cycle").val() =="" ?"":parseInt($(".cycle").val()),//12,间隔周期
				dateTypeMax:$(".dateTypeMax").val()=="" ?"":parseInt($(".dateTypeMax").val()),//定期模式要传的东西
				dateTypeMin:$(".dateTypeMin").val()=="" ?"":parseInt($(".dateTypeMin").val()),//1,周期模式要传的东西
				day:$(".day").val()=="" ?"":parseInt($(".dateTypeMax").val()),//"",
				dispatchType:$(".dispatchType").val()=="" ?"":parseInt($(".dispatchType").val()),//1,
				hour:$(".hour").val()=="" ?"":parseInt($(".hour").val()),//"",
				second:$(".second").val()=="" ?"":parseInt($(".second").val())//""
			},
			fileJson:fileJson,
			resType:"2",
			resourceId:$(".modal").attr("id")
		}
		if($(".dateTypeMax").val() =="3"){
			docSaveOption.dispatchStrategyJson.day="";
		}
		var APIurl = "";
		if(isModify){ //修改
			APIurl = "resourceUpdate";
		}else{//发布
			APIurl = "resiurcePublication"
		}
		base.ajax({
			url:$.path+"/api/resource/"+APIurl,
			params:docSaveOption,
			type:"post",
			success:function(data){
				$("#step_confirm").removeAttr('disabled');
				modal.hide();
				base.requestTip({position:"center"}).success("保存成功")
				common.search(grid);
			}
		})
	}
	//测试连接
	var testConnection = function(sign){
		var params = {id:$("#publishResource").find(".cbs:checked").val()};
		if(params.id){
			base.ajax({
				url:$.path+"/api/localresdatasource/dataSourceByIdTest",
				type:"get",
				params:params,
				success: function(data) {
					if(data.code =="0"){
						base.requestTip({position:"center"}).success("连接成功")
					}else{
						base.requestTip({position:"center"}).error("连接失败")
					}
				},
				error:function(data){
				}
			})
		}else{
			base.requestTip({position:"center"}).error('请选择一个数据源')
		}
	}
	//设置步骤插件
	var setSteps = function(sign){
		var data=[];
		switch(sign){
			case "1":
			data =[
				{"label":"选择数据源","contentToggle":"#content1"},
				{"label":"关联数据表","contentToggle":"#content2"},
				{"label":"数据项转换","contentToggle":"#content3"},
				{"label":"配置同步类型","contentToggle":"#content4"},
				{"label":"配置更新","contentToggle":"#content5"},
				{"label":"发布预览","contentToggle":"#content6"}
			];
			break;
			case "2":
			data =[
				{"label":"选择数据源","contentToggle":"#content1"},
				{"label":"选择文件","contentToggle":"#content2"},
				{"label":"配置更新策略","contentToggle":"#content3"},
				{"label":"发布预览","contentToggle":"#content4"}
			];
			break;
			case "3":
			data =[
				{"label":"选择数据源","contentToggle":"#content1"},
				{"label":"关联数据表","contentToggle":"#content2"},
				{"label":"输入参数","contentToggle":"#content3"},
				{"label":"输出参数","contentToggle":"#content4"},
				{"label":"接口方式","contentToggle":"#content5"},
				{"label":"发布预览","contentToggle":"#content6"}
			];
			break;
			case "4":
			data =[
				{"label":"填写来源URL","contentToggle":"#content1"},
				{"label":"发布预览","contentToggle":"#content2"}
			];
			break;
		}
		steps = base.steps({
			container:$("#ui-steps"),
			data:data,
			buttonGroupToggle:modal.modalFooter,
			height:450
		})
	}
	
	var setGrid = function(container,gridOption,count){
		if(count =="1"){
			grid = base.datatables({
				container:container,
				option:gridOption,
				filter:common.gridFilter
			});
		}else{
			grid1 = base.datatables({
				container:container,
				option:gridOption,
				filter:common.gridFilters
			});
		}
		
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
	
	//发布目录
	var publishingList= function(){
		base.ajax({
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
	
	//点击删除
	function doDele(){
		$(".delect").off().on("click",function(){ 
			var params = {id:$(this).parent().attr("rid")};
			base.confirm({
				label:"删除",
				text:"<div style='text-align:center;font-size:13px;'>确定删除?</div>",
				confirmCallback:function(){
					common.submit({
						url:$.path+"/api/resCatalog/deleteResourceById",
						params:params,
						type:"get",
						callback:function(data){
							if(data.code==0){
								data.message="删除成功"
							}else{
								data.message="删除失败"
							}
							common.search(grid);
						}
					});
				}
			})
		})
	}
	
	//点击撤销
	function doRevoke(){
		$(".revoke").off().on("click",function(){
			var resType = $(this).parent().attr("data-sign");
			var params = {resourceId:$(this).parent().attr("rid"),resType:resType};
			base.confirm({
				label:"撤销",
				text:"<div style='text-align:center;font-size:13px;'>确定撤销?</div>",
				confirmCallback:function(){
					common.submit({
						url:$.path+"/api/resource/revokePublication",
						params:params,
						type:"get",
						callback:function(data){
							if(data.code==0){
									data.message="撤销成功"
								}else{
									data.message="撤销失败"
								}
							common.search(grid);
						}
					});
				}
			})
		})
	}
	var setLinkGroup = function(){
		$("#example").on("click",".jumpDetail",function(){
			var curId = $(this).attr("cid");
			var modal1 = base.modal({
				label:"资源发布",
				width:900,height:450,
				id:curId,
				url:"../html/catalogManage/catalog_detail.html",
				drag:false,
				buttons:[{ 
					label:"关闭",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					clickEvent:function(){
						modal1.hide();
					}
				}]
			})
		})
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");
			$("#status").val(key);
			common.search(grid);
		});
	};
	
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
		$("input").attr("autocomplete","off");
	};
	return {
		main:function(){
			setContent();
			setGrid($("#example"),gridOption0,1);
			setLinkGroup();
			setSearch();
			setReset();
			publishingList()
		}
	};
});