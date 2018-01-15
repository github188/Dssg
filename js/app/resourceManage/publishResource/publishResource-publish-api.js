define(["base","app/commonApp","select2"],function(base,common,select2){
	var grid0=null, grid1=null;
	
	//获取元数据信息好和发布预览处信息
	function metaData(){
		var modalId = $(".modal").attr("id");
		base.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+modalId,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(result){
				if(result && result.data){
					$(".apiSaveOption").attr("name",result.data.apiType);
					var apiJson = JSON.parse(result.data.apiJson);
					var intrCon="",outtrCon="";
					if(apiJson.requestParams){
						apiJson.requestParams.map(function(item,index){
							var mandatory = item.mandatory == "1"?"是":"否";
							intrCon += 	'<tr><td class="name">'+item.name+'</td><td>系统参数</td><td>'+
										'<select class="inParameterJson form-control"></select></td><td>'+
										'<select class="conditionExp form-control">'+
										'<option value="like">包含</option>'+
										'<option value="=">等于</option>'+
										'</select></td>'+
										'<td class="mandatorys" name="'+item.mandatory+'">'+mandatory+'</td>'+
										'</tr>';	
						});
					}
					if(apiJson.responseStruct){
						apiJson.responseStruct.map(function(item,index){
							var mandatory = item.notNull == "1"?"是":"否";
							var type=common.typeSelect(item.type);
							outtrCon += '<tr><td class="name">'+item.name+'</td><td class="type" type="'+item.type+'">'+type+'</td>'+
									'<td><select class="outParameterJson form-control"></select></td>'+
									'<td class="mandatorys" name="'+item.notNull+'">'+mandatory+'</td>'+
								'</tr>';
						});
					}
					var settimeout = setTimeout(function(){
						$(".inputParams").find("tbody").html(intrCon);
						$(".outputParams").find("tbody").html(outtrCon);
						$.each(result.data,function(k,v){
							if(k=='resType'){
								$(".fbyl ."+k).html('API');
							}else if(k =="recordDTO"){
								$(".subAuditTime").html(v.subAuditTime);
							}else{
								$(".fbyl ."+k).html(v)	
							}
						})
					},1000)
				}
			}
		})
	}
	//获取数据源
	var gridOptionP0 = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		paging:false,
//		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/localresdatasource/findResPageByNameOrTypeInfo",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				return {type:1}
			}
		},
		columns:[
			{"data":"id","sWidth":"10%"},
			{"data":"name","sWidth":"25%"},
			{"data":"ip","sWidth":"25%"},
			{"data":"port","sWidth":"20%"},
			{"data":"dbType","sWidth":"20%"}
		],
		columnDefs:[
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cbs' value='"+row.id+"' class='cbs' cAll = '"+JSON.stringify(row)+"' cid='"+row.id+"'/></div>"; 
              },
               "targets":0 
	        }
		],
		drawCallback:function(setting){
			$("#publishResource tbody").on("click","tr",function(){
        		$(this).find("input").prop("checked",true);
        		$(this).siblings().find("input").prop("checked",false)
	    	})
		}
	}
	//选择数据表
	var gridOptionP1 = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/commonController/selectTablesAllByDSIdPage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				return {datasourceId:$("#publishResource").find(".cbs:checked").val(),name:$(".selectDataTableName").val(),page:d.page,size:d.size}
			}
		},
		columns:[
			{"data":"id","sWidth":"20%"},
			{"data":"name","sWidth":"80%"},
		],
		columnDefs:[
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.datasourceId+"' class='cb' cAll = '"+JSON.stringify(row)+"' cid='"+row.datasourceId+"'/></div>"; 
              },
               "targets":0 
	        }
		],
		drawCallback:function(setting){
			
		}
	}

	//画表格		
	var setGrid = function(container,gridOption,num){
		var parent;
		parent = base.datatables({
			container:container,
			option:gridOption,
			filter:common.gridFilter
		});
		switch(num){
			//case 0:grid = parent;break;
			case 1:grid0 = parent;break;
			case 2:grid1 = parent;break;
		}
		
	}

	//选择数据表
	var selectResource = function(){
		$(".showDataTable").on("click",function(){
			$(".graphicsEditor").show();
			$(".sqlScriptMode").hide();
			$(".sqlContent").html("");
			$(".showDatasourceTable").find("li").removeClass("active");
			$(".showDatasourceTable").find("li:first").addClass("active");
			$(".showTable tbody").empty().append('<tr class="odd"><td valign="top" colspan="7" class="dataTables_empty">数据为空</td></tr>');
		})
		$(".selectResource").off().on("click",function(){
			modal1 = base.modal({
				label:"选择数据表",
				width:420,
				height:440,
				url:"../html/resourceManage/publishResource/selectContent.html",
				drag:false,
				callback:function(){
					setGrid($("#selectDataTable"),gridOptionP1,2);
					$(".TableModal .search").on("click",function(){
						grid1.reload();
					})
				},
				buttons:[{
					label:"确定",
					cls:"btn btn-info",
					clickEvent:function(){
						if($("#selectDataTable").find("input[type='checkbox']:checked").length >1){ 
							return base.requestTip({"position":"center"}).error("最多支持1张表");
						}
						if($("#selectDataTable").find("input[type='checkbox']:checked").length == 0){ 
							return base.requestTip({"position":"center"}).error("至少选择一张表");
						}
						$(".selectTableRealtion").show();
						var tableName='';
						$("#selectDataTable").find("input[type='checkbox']:checked").each(function(index,item){
							tableName += $(item).parent().parent().next().text();
						})
						$(".sqltables").attr("name",tableName);
						var params = {datasourceId:$("#publishResource").find(".cbs:checked").val(),tableName:tableName};
						btnClick(params);
						modal1.hide();
					}
				}]
			})
			
		})
		//选择表点击确定按钮事件
		var btnClick = function(params){
			base.ajax({
				url:$.path+"/api/commonController/selectColByDSIdAndTabNames",
				type:"get",
				params:params,
				success: function(data) {
					var divContent="";
					data.data.map(function(item,value){
						var tr="",options="";
						var doOk =  "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>";
						for(var k=0;k<item.tableData.length;k++){
							if(item.tableData[k].columnName && item.tableData[k].columnName!="PK" && item.tableData[k].tableName){
								tr += "<tr><td>"+item.tableData[k].columnName+"</td><td>"+item.tableData[k].type+"</td><td>"+item.tableData[k].tableName+"</td><td>"+doOk+"</td></tr>"
								options += "<option title='"+item.tableData[k].columnName+"' name='"+item.tableData[k].valueType+"'>"+(item.tableData[k].columnName)+"</option>";
							}
						}
						$(".outParameterJson").map(function(index,items){
							var outOptions="";
							var curType = $(items).parents("tr").find(".type").attr("type");
							for(var k=0;k<item.tableData.length;k++){
								if(item.tableData[k].columnName && item.tableData[k].columnName!="PK" && item.tableData[k].tableName){
									if( curType==item.tableData[k].valueType){										
										outOptions += "<option title='"+item.tableData[k].columnName+"' name='"+item.tableData[k].valueType+"'>"+(item.tableData[k].columnName)+"</option>";
									}
								}
							}
							$(items).append(outOptions).select2()
						})
						$(".showTable tbody").empty().append(tr);
						$(".inParameterJson").empty().append(options).select2();
//						$(".outParameterJson").empty().append(options).select2();
					})
				},
				error:function(data){
				}
			})
		}
		$(".selectSQL").off().on("click",function(){
//			$(".showDatasourceTable").show();
			$(".graphicsEditor").hide();
			$(".sqlContent").text("")
			$(".showDatasourceTable").find("li").removeClass("active");
			$(".showDatasourceTable").find("li:last").addClass("active");
			$(".sqlScriptMode").show();
			$(".showTable tbody").empty().append('<tr class="odd"><td valign="top" colspan="7" class="dataTables_empty">数据为空</td></tr>');
		})
		//测试sql
//		$(".testSql").on("click",function(){
//			var sqlvalue = $(".sqlContent").val().replace(/\n+|\s+|\t|\;$/g," ");
//			if(sqlvalue){
//				var dataSourceId =base.getCR('cbs').val();
//				var  Type= JSON.parse(base.getCR('cbs').attr("call")).dbType;
//				base.ajax({
//					url:$.path+"/api/resource/checkQueryScript?dataSourceId="+dataSourceId+"&sql="+sqlvalue+"&dbType="+Type,
//					type:"get",
//					success:function(result){
//						if(result &&  result.data){
//							base.requestTip().success("SQL可用");
//						}else{
//							base.requestTip().error("SQL不可用");
//						}
//					},
//					error:function(result){
//						base.requestTip().error(result.message);
//					}
//				})
//			}else{
//				return base.requestTip().error("请输入 SQL 语句")
//			}
//		})
		//检查SQL
		$(".checkSQL").on("click",function(){
			var sqlvalue = $(".sqlContent").val().replace(/\n+|\s+|\t|\;$/g," ");
//			$(".sqlContent").val(sqlvalue)
			if(sqlvalue){
				var dataSourceId =base.getCR('cbs').val();
				var  Type= JSON.parse(base.getCR('cbs').attr("call")).dbType;
				base.ajax({
					url:$.path+"/api/resource/checkQueryScript?dataSourceId="+dataSourceId+"&sql="+sqlvalue+"&dbType="+Type,
					type:"get",
					success:function(results){
						if(results &&  results.data){
							base.ajax({
								url:$.path+"/api/resource/checkSql?dataSourceId="+dataSourceId+"&sql="+sqlvalue,
								type:"get",
								success:function(result){
									if(result && result.data){
										var doOk =  "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>";
										var tr="",options="";
										var temSqltables = [];
										for(var i=0;i< result.data.length;i++){
											if(temSqltables.indexOf(result.data[i].tableName)=="-1"){									
												temSqltables.push(result.data[i].tableName);
											}
											if(i==0 && !result.data[i].tableName){
												base.requestTip({"position":"center"}).error("sql语句较复杂，数据来源表未识别，不影响数据获取及使用!")
											}
											var tableName = result.data[i].tableName?result.data[i].tableName:"未识别";
											tr += "<tr><td>"+result.data[i].columnName+"</td><td>"+result.data[i].type+"</td><td>"+tableName+"</td><td>"+doOk+"</td></tr>"
											options += "<option title='"+result.data[i].columnName+"' name='"+result.data[i].valueType+"'>"+result.data[i].columnName+"</option>";
										}
										$(".showTable tbody").empty().append(tr);
										$(".sqltables").attr("name","dssg_temp_table");
										$(".inParameterJson").empty().append(options).select2();
										$(".outParameterJson").empty().append(options).select2();
									}else{
										base.requestTip({"position":"center"}).error(result.message);
									}
								},
								error:function(result){
									base.requestTip({"position":"center"}).error(result.message);
								}
							})
						}else{
							base.requestTip({"position":"center"}).error("SQL不可用");
						}
					},
					error:function(result){
						base.requestTip({"position":"center"}).error(results.message);
					}
				})
				
			}else{
				base.requestTip({"position":"center"}).error("请输入 SQL 语句")
			}
		})
	}
	
	//页面事件方法
	var dblclickFunction = function(){
		//移除行
		$(".showTable").on("click",".delete",function(){
			$(this).parents("tr").remove();
			var tdVal = $(this).parents("tr").find("td:first").text()
			var op = $(".inParameterJson option");
			var ops = $(".outParameterJson option");
			op.each(function (index,item) {
				if(tdVal == $(item).attr("title")){
					$(item).remove();
				}
			})
			ops.each(function (index,item) {
				if(tdVal == $(item).attr("title")){
					$(item).remove();
				}
			})
		})
		
		$(".switchInterface").on("change",function(){
			if($(this).val() == "rest"){
				$(".messageForma").html("JSON");
				$(".interfaceMethod").html("POST");
				$(".interfaceType").html("rest");
				$(".interfaceAddress").html("http://ip:port/restService/getData/资源ID")
			}else{
				$(".messageForma").html("XML");
				$(".interfaceType").html("webserivice")
				$(".interfaceMethod").html("POST");
				$(".interfaceAddress").html("http://ip:port/services/res?wsdl")
			}
		})

	}

	return {
		main:function(){
			metaData();//获取数据源信息
			setGrid($("#publishResource"),gridOptionP0,1);//选择数据源
			selectResource();	//选择数据表
			dblclickFunction();
		}
	}
})
