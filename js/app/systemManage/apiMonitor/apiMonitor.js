define(["base","app/commonApp"],function(base,common){
	var grid = null,parent1=null,parent2=null;
	//发布资源
	var gridPublishRes = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/apiResourceMonitor/myPublishResourceByPage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams("#publishRes-form");
				var paramsA;
				if(params){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA
			}
		},
		columns:[
			{ "data": "id","sWidth":"2%"},
			{ "data": "taskName","sWidth":"18%"},
			{ "data": "appName","sWidth":"14%"},
			{ "data": "apiSource","sWidth":"8%"},
			{ "data": "state","sWidth":"10%"},
			{ "data": "requestTime","sWidth":"14%"},
			{ "data": "requestNumber","sWidth":"17%"},
			{ "data": "currentNumber","sWidth":"17%"}
		],
		columnDefs:[ 
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='pcb' value='"+row.id+"' class='cb1' cAll = '"+JSON.stringify(row)+"'/></div>"; 
              },
               "targets":0 
	        },
	        {"render":function(data,type,row,meta){
                return row.appName?common.interceptString(row.appName):"--"
              },
               "targets":2 
	        },
			{"render":function(data,type,row,meta){
				var menu = row.apiSource;
            	if(menu){
            		if(menu=="local"){
                 		return "<div name='"+menu+"'>本地</div>"
	                }else{
	                 	return "<div name='"+menu+"'>第三方</div>"
	                }
            	}else{ 
            		return "--"
            	}
              }, 
               "targets":3 
	        },
	        {"render":function(data,type,row,meta){
	        	var menu = row.state;
            	if(menu){
            		if(menu=="0" && row.stateSubs =="0"){
                 		return "<div class='state' name='"+menu+"'>启用</div>";
	                }else if(menu=="-1" && row.stateSubs=="0"){
	                 	return "<div class='state' name='"+menu+"'>发布方暂停</div>"
	                }else if(menu=="-1" && row.stateSubs=="-1"){
	                 	return "<div class='state' name='"+menu+"'>发布方暂停</div>"
	                }else if(menu=="0" && row.stateSubs=="-1"){
	                	return "<div class='state' name='"+menu+"'>订阅方暂停</div>"
	                }
            	}else{ 
            		return ''
            	}
              }, 
               "targets":4 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.requestTime?common.interceptString(row.requestTime):"--"
              }, 
               "targets":5 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.requestNumber?common.interceptString(row.requestNumber):"--"
              }, 
               "targets":6 
	        },
	        {"render":function(data,type,row,meta){
	        	if(row.currentNumber){
	        		return "<div>"+row.currentNumber+"</div>";   
	        	}else{
	        		return "0"
	        	}
              }, 
               "targets":7 
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
			url:$.path+"/api/apiResourceMonitor/mySubscribeResourceByPage",
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
			{ "data": "id","sWidth":"2%"},
			{ "data": "taskName","sWidth":"16%"},
			{ "data": "appName","sWidth":"12%"},
			{ "data": "apiSource","sWidth":"8%"},
			{ "data": "pubEquipmentName","sWidth":"10%"},
			{ "data": "state","sWidth":"9%"},
			{ "data": "requestTime","sWidth":"15%"},
			{ "data": "requestNumber","sWidth":"14%"},
			{ "data": "currentNumber","sWidth":"14%"}
		],
		columnDefs:[ 
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.id+"' class='cb2' cAll = '"+JSON.stringify(row)+"'/></div>"; 
              }, 
               "targets":0 
	        },
	        {"render":function(data,type,row,meta){
                return row.appName?common.interceptString(row.appName):"--"
              },
               "targets":2 
	        },
	        {"render":function(data,type,row,meta){
	        	var menu = row.apiSource;
            	if(menu){
            		if(menu=="local"){
                 		return "<div name='"+menu+"'>本地</div>"
	                }else{
	                 	return "<div name='"+menu+"'>第三方</div>"
	                }
            	}else{ 
            		return ''
            	}
              }, 
               "targets":3 
	        },
	        {"render":function(data,type,row,meta){
	        	var menu = row.stateSubs;
            	if(menu){
            		if(menu=="0" && row.state=="0"){
	                 	return "<div class='state' name='"+menu+"'>启用</div>"
	                 }else if(row.state=="-1" && menu=="-1"){
	                 	return "<div class='state' name='"+menu+"'>发布方暂停</div>"
	                 }else if(menu=="-1"){
	                 	return "<div class='state' name='"+menu+"'>订阅方暂停</div>"
	                 }else if(row.state=="-1" && menu=="0"){
	                 	return "<div class='state' name='"+menu+"'>发布方暂停</div>"
	                 }
            	}else{ 
            		return '--'
            	}
              }, 
               "targets":5 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.requestTime?common.interceptString(row.requestTime):"--"
              }, 
               "targets":6 
	        },
	        {"render":function(data,type,row,meta){
	        	return row.requestNumber?common.interceptString(row.requestNumber):"--"
              }, 
               "targets":7 
	        },
	        {"render":function(data,type,row,meta){
	        	if(row.currentNumber){
	        		return "<div>"+row.currentNumber+"</div>";   
	        	}else{
	        		return "0"
	        	}
              }, 
               "targets":8 
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
			case "1":
				grid = base.datatables({
					container:$("#publishRes"),
					option:gridPublishRes,
					filter:common.gridFilter
				});
				parent1 = grid;
			break;
			case "2":
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
		/**设置时间控件**/
		$(".search").on("click",function(){
			var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
			if(actionType =="0"){				
				parent1.reload()
			}else{
				parent2.reload()
			}
//			common.search(grid);
		});
		
	};
	/**重置**/
	var setReset = function(){
		$(".reset").off().on("click",function(){
			var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
			if(actionType =="0"){	
				$("form input").val('');
				parent1.reload();
			}else{
				$("form input").val('');
				parent2.reload()
			}
//			common.reset($(this).parents(".ui-searchbar").find("form"),grid);
		});
	};
		/**启用**/
	var gridStart = function(){
			
		base.confirm({
			label:"启用",
			text:"<div style='text-align:center;font-size:13px;'>确定启用?</div>",
			confirmCallback:function(){
				//批量
				var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
				var delList = [];
				var selectDom = actionType =="0" ? $("#publishRes .cb1:checked") : $("#subscibeRes .cb2:checked")
				selectDom.map(function(index,item){
					var call = $(item).attr("cAll");
						call = JSON.parse(call);
					var params = {
						id:call.id,
						actionType:actionType=="0"?1:2,//1发布2订阅
					}
					if(actionType=="0"){
						params.state = 0;
					}else{
						params.stateSubs = 0;
					}
					delList.push(params);
				})
				common.submit({
					url:$.path+"/api/apiResourceMonitor/startStopService",
					params:delList,
					type:"post",
					callback:function(data){
						if(data.code==0){
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
		
		base.confirm({
			label:"暂停",
			text:"<div style='text-align:center;font-size:13px;'>确定暂停?</div>",
			confirmCallback:function(){
				//批量
				var actionType = $(".ui-grid-linkGroup").find("li.active").attr("key");
				var delList = [];
				var selectDom = actionType =="0" ? $("#publishRes .cb1:checked") : $("#subscibeRes .cb2:checked")
				selectDom.map(function(index,item){
					var call = $(item).attr("cAll");
						call = JSON.parse(call);
					var params = {
						id:call.id,
						actionType:actionType=="0"?1:2,//1发布2订阅
					}
					if(actionType=="0"){
						params.state = -1;
					}else{
						params.stateSubs = -1;
					}
					delList.push(params);
				})
				
				common.submit({
					url:$.path+"/api/apiResourceMonitor/startStopService",
					type:"post",
					params:delList,
					callback:function(data){
						if(data.code==0){
							data.message="暂停成功"
						}else{
							data.message="暂停失败"
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
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			//key为0subscibeResWrapper，key为1publishRes
			var key = $(this).attr("key"); 
			switch(key){
				case "0":
					//表单
					$("#subscibeRes").find("input").attr("checked",false);
					$(".delete").addClass("disabled");
					$("#publishRes-form").show();
					$("#subscibeRes-form").hide();
					//表格
					parent1.grid.ajax.reload();
					$(".publishRes").show();
					$(".subscibeResWrapper").hide();
				break;
				case "1":
					//表单
					$("#publishRes").find("input").attr("checked",false);
					$(".delete").addClass("disabled");
					$("#publishRes-form").hide();
					$("#subscibeRes-form").show();
					//表格
					parent2.grid.ajax.reload();
					$(".publishRes").hide();
					$(".subscibeResWrapper").show();
				break;
			}
			//common.search(grid);
		});
	};
	//设置表格各个按钮操作
	var setGridButton = function(){
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if(!$(this).hasClass("disabled")){
				var key = $(this).attr("keyAtrr");
				switch(key){
					case "0": gridStop();break;
					case "1": gridStart();break;
				}
			}
		});
		
		$("table").on("change","input",function(){
			var temArr = [],dom="",key =$(".ui-grid-linkGroup li.active").attr("key"); 
			if(key=="0"){
				dom = "publishRes";
			}else{
				dom = "subscibeRes";
			}
			if($("#"+dom+" tbody input:checked").length>0){
				$("#"+dom+" tbody input:checked").map(function(index,item){
					var state = $(this).parents("tr").find(".state").attr("name");
					if(index =="0"){					
						temArr.push(state);
					}else{
						if(temArr.indexOf(state)<0){
							temArr.push(state);
						}
					}
				})
				if(temArr.length>1){
					$(".start").addClass("disabled");
					$(".stop").addClass("disabled");
					return base.requestTip().error("不同的状态不能同时勾选");
				}
				if(temArr[0] == "0"){
					$(".start").addClass("disabled");
				}else{
					$(".stop").addClass("disabled");
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
//			setGrid($("#publishRes"),gridPublishRes)
			setGrid("1");
			setGrid("2");
			setGridButton();
			setLinkGroup();
			setSearch();
			setReset();
			setContent();
		}
	}
})
