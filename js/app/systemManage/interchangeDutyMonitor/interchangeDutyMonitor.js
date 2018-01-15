define(["base","app/commonApp"],function(base,common){
	var grid = null,parent1=null,parent2=null;
	//发布资源
//	$.path = "http://192.168.230.5:7000";
	var gridPublishRes = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/resourcemonitor/findPublishResourceByPage",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#publishRes-form"));
				var paramsA;
				if(JSON.stringify(params) !="{}"){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}else{
					paramsA = {page:d.page,size:d.size} 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "id","sWidth":"5%"},
			{ "data": "taskName","sWidth":"25%"},
			{ "data": "resTypeName","sWidth":"20%"},
			{ "data": "stateName","sWidth":"25%"},
			{ "data": "nextTime","sWidth":"25%"}
		],
		columnDefs:[ 
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='pcb' class='cb1' value='"+row.id+"' cAll = '"+JSON.stringify(row)+"'/></div>"; 
              }, 
               "targets":0 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.taskName?common.interceptString(row.taskName):"--"
              }, 
               "targets":1 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.resTypeName?common.interceptString(row.resTypeName):"--"
              }, 
               "targets":2 
	        },
	        {"render":function(data,type,row,meta){
				if(row.stateName){
	        		return "<div class='state' name='"+row.state+"'>"+row.stateName;+"</div>"   
	        	}else{
	        		return "--"
	        	}
	          },
               "targets":3 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.nextTime?common.interceptString(row.nextTime):"--"
              }, 
               "targets":4 
	        }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball1"),$(".cb1"),function(){
        		common.checkByGridButton($(".cb1"));
        	});
        	common.selectedTr($("#publishRes"));
        }
	};
	//订阅资源 
	var gridSubscibeRes = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
			url:$.path+"/api/resourcemonitor/findSubscribeResourceByPage",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#subscibeRes-form"));
				var paramsA ;
				if(params){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "id","sWidth":"5%"},
			{ "data": "taskName","sWidth":"20%"},
			{ "data": "resTypeName","sWidth":"15%"},
			{ "data": "pubEquipmentName","sWidth":"20%"},
			{ "data": "stateName","sWidth":"20%"},
			{ "data": "nextTime","sWidth":"20%"}
		],
		columnDefs:[
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='scb' value='"+row.id+"' class='cb2' cAll = '"+JSON.stringify(row)+"'/></div>"; 
              }, 
               "targets":0 
	       	},
	       	{"render":function(data,type,row,meta){
	        	if(row.taskName){
	        		return row.taskName; 
	        	}else{
	        		return "--"
	        	}
              }, 
               "targets":1 
      		},
	       {"render":function(data,type,row,meta){
	        	if(row.resTypeName){
	        		return row.resTypeName;  
	        	}else{
	        		return "--"
	        	}
              }, 
               "targets":2 
	       },
	       {"render":function(data,type,row,meta){
	        	if(row.pubEquipmentName){
	        		return row.pubEquipmentName;  
	        	}else{
	        		return "--"
	        	}
              }, 
               "targets":3 
	       },
	       {"render":function(data,type,row,meta){
	        	if(row.stateName){
	        		return "<div class='state' name='"+row.state+"' subState ='"+row.subscribeState+"'>"+row.stateName;+"</div>"   
	        	}else{
	        		return "--"
	        	}
              }, 
               "targets":4 
	       },
	       {"render":function(data,type,row,meta){
	        	if(row.nextTime){
	        		return row.nextTime;  
	        	}else{
	        		return "--"
	        	}
              }, 
               "targets":5 
	       }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball2"),$(".cb2"),function(){
        		common.checkByGridButton($(".cb2"));
        	});
        	common.selectedTr($("#subscibeRes"));
        }
	}
	/**画表格**/
	var setGrid = function(index){
		switch(index){
			case "0":
				grid = base.datatables({
					container:$("#publishRes"),
					option:gridPublishRes,
					filter:common.gridFilter
				});
				parent1 = grid;
			break;
			case "1":
				grid = base.datatables({
					container:$("#subscibeRes"),
					option:gridSubscibeRes,
					filter:common.gridFilter
				});
				parent2 = grid;
			break;
		}
	};
	/**查询**/
	var setSearch = function(){
		$(".search").on("click",function(){
			var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
			if(actionType =="0"){				
				parent1.reload()
			}else{
				parent2.reload()
			}
		});
	};
	/**重置**/
	var setReset = function(){
		$(".reset").on("click",function(){
			var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
			if(actionType =="0"){	
				$("form input").val('');
				parent1.reload();
			}else{
				$("form input").val('');
				parent2.reload()
			}
		});
	};
	/**启用**/
	var gridStart = function(){
		
		base.confirm({
			label:"启用",
			text:"<div style='text-align:center;font-size:13px;'>确定启用?</div>",
			confirmCallback:function(){
				var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
				var delList = [];
				
				var selectDom = actionType =="0" ? $("#publishRes .cb1:checked") : $("#subscibeRes .cb2:checked")
				
				selectDom.map(function(index,item){
					var call = $(item).attr("cAll");
						call = JSON.parse(call);
					var params = {
						id:call.id,
						pubEquipmentId:call.pubEquipmentId,
						actionType:actionType=="0"?1:2,//1发布2订阅
						subEquipmentId:call.subEquipmentId,
						type:0
					}
					delList.push(params);
				})
				
				common.submit({
					url:$.path+"/api/resourcemonitor/startStopTaskBatch",
					params:delList,
					type:"post",
					callback:function(data){
						if(data.code=="0" && data.data){
							data.message="启用成功"
						}else{
							data.message="启用失败"
						}
						if(actionType =="0"){							
							common.search(parent1);
						}else{
							common.search(parent2);
						}
					}
				});
			}
		});
	};
	/**暂停**/
	var gridStop = function(){
		
		var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
		var selectDom = actionType =="0" ? $("#publishRes .cb1:checked") : $("#subscibeRes .cb2:checked");
		base.confirm({
			label:"停用",
			text:"<div style='text-align:center;font-size:13px;'>确定停用?</div>",
			confirmCallback:function(){
				
				var delList = [];
				selectDom.map(function(index,item){
					var call = $(item).attr("cAll");
						call = JSON.parse(call);
					var params = {
						id:call.id,
						pubEquipmentId:call.pubEquipmentId,
						actionType:actionType=="0"?1:2,//1发布2订阅
						subEquipmentId:call.subEquipmentId,
						type:-1
					}
					delList.push(params);
				})
				common.submit({
					url:$.path+"/api/resourcemonitor/startStopTaskBatch",
					params:delList,
					type:"post",
					callback:function(data){
						if(data.code==0 && data.data){
							data.message="停用成功"
						}else{
							data.message="停用失败"
						}
						if(actionType =="0"){							
							common.search(parent1);
						}else{
							common.search(parent2);
						}
					}
				});
			}
		});
	};
	/**调度**/
	var gridDispath = function(){
		
		base.confirm({
			label:"调度",
			text:"<div style='text-align:center;font-size:13px;'>确定调度?</div>",
			confirmCallback:function(){
				var cAll = $(".ui-grid .cb2:checked").attr("cAll");
				var paramsAll = JSON.parse(cAll);
				var type  = $(".ui-grid .cb2:checked").parents("tr").find("td:nth-child(3)").html();
				var resourceType = type == "数据库"?1:2;
				var params = {
					id:paramsAll.id,
					pubEquipmentId:paramsAll.pubEquipmentId,
					resourceType:resourceType, //1数据库2文件
					subEquipmentId:paramsAll.subEquipmentId
				}
				common.submit({
					url:$.path+"/api/resourcemonitor/dispatchTask",
					params:params,
					type:"post",
					callback:function(data){
						if(data.code=="0"){
							data.message="调度成功"
						}/*else{
							data.message="调度失败"
						}*/
						common.search(parent2);
					}
				});
			}
		});
	};
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");  
			switch(key){
				case "0":
					//表单
					$("#subscibeRes").find("input").attr("checked",false);
					$(".modify").addClass("disabled");
					$("#publishRes-form").show();
					$("#subscibeRes-form").hide();
					//调度
					$(".dispatch").parent().hide();
					//表格
					$(".publishRes").show();
					$(".subscibeResWrapper").hide();
					parent1.grid.ajax.reload();
				break;
				case "1":
					$("#publishRes").find("input").attr("checked",false);
					$(".modify").addClass("disabled");
					//表单
					$("#publishRes-form").hide();
					$("#subscibeRes-form").show();
					//调度
					$(".dispatch").parent().show();
					//表格
					$(".publishRes").hide();
					$(".subscibeResWrapper").show();
					parent2.grid.ajax.reload();
				break;
			}
		});
	};
	
	
	//设置表格各个按钮操作
	var setGridButton = function(){
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if(!$(this).hasClass("disabled")){
				var key = $(this).attr("keyAtrr");
				switch(key){
					case "2": gridDispath();break;
				}
			}
		});
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if(!$(this).hasClass("disabled")){
				var key = $(this).attr("keyAtrr");
				switch(key){
					case "0": gridStart();break;
					case "1": gridStop();break;
				}
			}
		});
		
		//遍历表格，选取被勾选的input,查看当前数据的状态，判断该显示哪个按钮
		$("table").on("change","input",function(){
			var temArr = [],dom="",subArr =[],key =$(".ui-grid-linkGroup li.active").attr("key"); 
			dom = key=="0" ?"publishRes" :"subscibeRes";
			
			if($("#"+dom+" tbody input:checked").length>0){
				$("#"+dom+" tbody input:checked").map(function(index,item){
					var state = $(this).parents("tr").find(".state").attr("name");
					if(key=="1"){						
						var subState = $(this).parents("tr").find(".state").attr("subState");
						if(index =="0"){
							subArr.push(subState)
						}else{
							if(subArr.indexOf(subState)<0){
								subArr.push(subState);
							}
						}
					}
					if(index =="0"){
						temArr.push(state);
					}else{
						if(temArr.indexOf(state)<0){
							temArr.push(state);
						}
					}
				})
				if(temArr.length>1 || subArr.length>1){
					$(".start").addClass("disabled");
					$(".stop").addClass("disabled");
					return base.requestTip().error("不同的状态不能同时勾选");
				}
				if(temArr[0] == "2"){
					$(".start").addClass("disabled");
				}else if(temArr[0] == "4" && key=="1"){//发布方暂停
					if(subArr[0] =="0"){
						$(".start").addClass("disabled");
					}
					if(subArr[0] =="-1"){
						$(".stop").addClass("disabled");
					}
					$(".dispatch").addClass("disabled");
				}else if(temArr[0] == "5" && key=="0"){//订阅房暂停
					$(".dispatch").addClass("disabled");
				}else{
					$(".stop").addClass("disabled");
					$(".dispatch").addClass("disabled");
				}
			}
			
		})
	}
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return{
		main:function(){
			setGrid("0");
			setGrid("1")
			setLinkGroup();
			setSearch();//查询
			setReset();//重置
			setGridButton()//按钮点击
			setContent();
		}
	}
})
