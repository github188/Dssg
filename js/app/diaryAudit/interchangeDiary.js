define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var activeNum = null;
	/**datatables表格配置项**/
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/exchangeLog/findExchangeLogPublish",
				type:"get",
				xhrFields: {withCredentials: true},
				contentType:"application/json",
				data:function(d){
					var timeList = base.form.getParams($("#search-form"));
					if(!$.isEmptyObject(timeList)){
						var tim="",start="",end="";
						if(timeList.timeLi){
							tim = timeList.timeLi.split("~");
							start=$.trim(tim[0]);
							end=$.trim(tim[1]);
						}
						
						return common.getParams(d,$("#search-form"))+"&startTime="+start+"&endTime="+end;
					}
					return common.getParams(d,$("#search-form"));
				}
		},
		columns:[
			{ "data": "id","sWidth":"3%"},
			{ "data": "taskName","sWidth":"16%"},
			{ "data": "resTypeName","sWidth":"12%"},
			{ "data": "issueCount","sWidth":"13%"},
//			{ "data": "loadCount","sWidth":"10%"},
			{ "data": "id","sWidth":"14%"},
			{ "data": "startTime","sWidth":"15%"},
			{ "data": "endTime","sWidth":"15%"},
			{ "data": "stateName","sWidth":"12%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
           },
           {"render":function(data,type,row,meta){
           		var val = row.taskName?common.interceptString(row.taskName):"--"
           		return "<a href='javascript:void(0)' cid='"+row.id+"' class='diary_detail'>"+val+"</a>";
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
             	if(row.issueCount){
             		if(parseFloat(row.issueCount)>0){             			
             			var val = "<span style='color:red'>"+row.issueCount+"</span>";
             		}else{
             			var val = row.issueCount;
             		}
             	}else{
             		val = "--";
             	}
           		return val;
              }, 
               "targets":3 
           },
          {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0)' cid='"+row.id+"' rId='"+row.resourceId+"' class='contentDetail'>详情</a>"; 
              }, 
               "targets":4 
           }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$("#example .diary_detail").click(function(){
        		diaryDetail(this,1);
        	})
        	$("#example .contentDetail").click(function(){
        		diaryContentDetail(this);
        	})
        	common.selectedTr($("#example"));
        }
	};
	var gridOption1 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
			url:$.path+"/api/exchangeLog/findExchangeLogSubscribe",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
//				return common.getParams(d,$("#search-form"));
				var timeList = base.form.getParams($("#search-form"));
				if(!$.isEmptyObject(timeList)){
					var tim="",start="",end="";
					if(timeList.timeLi){
						tim = timeList.timeLi.split("~");
						start=$.trim(tim[0]);
						end=$.trim(tim[1]);
					}
					
					return common.getParams(d,$("#search-form"))+"&startTime="+start+"&endTime="+end;
				}
				return common.getParams(d,$("#search-form"));
			}
		},
		columns:[
			{ "data": "id","sWidth":"3%"},
			{ "data": "taskName","sWidth":"16%"},
			{ "data": "resTypeName","sWidth":"12%"},
			{ "data": "issueCount","sWidth":"13%"},
			{ "data": "id","sWidth":"14%"},
			{ "data": "startTime","sWidth":"15%"},
			{ "data": "endTime","sWidth":"15%"},
			{ "data": "stateName","sWidth":"12%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
          },
          {"render":function(data,type,row,meta){
           		var val = row.taskName?common.interceptString(row.taskName):"--"
           		return "<a href='javascript:void(0)' cid='"+row.id+"' class='diary_detail'>"+val+"</a>";
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
           		if(row.issueCount){
             		if(parseFloat(row.issueCount)>0){             			
             			var val = "<span style='color:red'>"+row.issueCount+"</span>";
             		}else{
             			var val = row.issueCount;
             		}
             	}else{
             		val = "--";
             	}
           		return val;
              }, 
               "targets":3 
           },
          {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0)' cid='"+row.id+"' rId='"+row.resourceId+"' class='contentDetail'>详情</a>"; 
              }, 
               "targets":4 
           }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball1"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$("#example1 .diary_detail").click(function(){
        		diaryDetail(this,2);
        	})
        	$("#example1 .contentDetail").click(function(){
        		diaryContentDetail(this);
        	})
        	common.selectedTr($("#example1"));
        }
	};
	/**画表格**/
	var setGrid = function(para){
		if(!para){
			grid = base.datatables({
				container:$("#example"),
				option:gridOption,
				filter:common.gridFilter
			});
		}else{
			grid = base.datatables({
				container:$("#example1"),
				option:gridOption1,
				filter:common.gridFilter
			});
		}		
		/*导出*/
		$(".export").click(function(){
			base.confirm({
				label:"导出",
				text:"默认导出5000条",
				confirmCallback:function(){
					var type = activeNum?2:1;
					var arr = base.getChecks("cb").val;
					window.location.href=$.path+"/api/exchangeLog/exportExcel?type="+type+"&ids="+arr;
				}
			});
			
			
		})
	};
	/**查询**/
	var setSearch = function(){
		/**设置时间控件**/
		base.form.date({
			element:$(".date"),
			isTime:true,
			range:'~'
		});
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
	
	
	/**设置表格各个按钮操作**/
	var setGridButton = function(){
		$(".ui-grid-buttonbar .add").on("click",function(){
			gridAdd();
		});
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				gridDelete();
			}
		});
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				gridModify();
			}
		});
	};
	
	/**修改**/
	var gridModify = function(){
		var params = {"cid":$(".ui-grid .cb:checked").attr("cid")};
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改",
			url:"../html/example/grid_modify.html",
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						/**方式一**/
						
							/*
							var pass = base.form.validate({
								form:$("#form"),
								checkAll:true
							});
							if(!pass){return;}
							var params = base.form.getParams($("#form"));
							if(params){
								common.submit({
									url:"../json/submitSuccess.json",
									params:params
								})
							}
							modal.hide();
							common.search(grid);
							*/
						
						/**方式二**/
						
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								if(params){
									common.submit({
										url:"../json/submitSuccess.json",
										params:params
									})
									modal.hide();
									common.search(grid);
								}
							}
						});
						
						
					}
				},
				{
					label:"重置",
					cls:"btn btn-warning",
					clickEvent:function(){
						common.reset($("#form"));
					}
				}
			]
		});
	};
	/**批量删除**/
	var gridDelete = function(){
		var params = {"ids":base.getCR("cb",true)};
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:"../json/submitSuccess.json",
					params:params,
					callback:function(){
						common.search(grid);
					}
				});
			}
		});
	};
	/**新建**/
	var gridAdd = function(){
		var modal = base.modal({
			width:700,
			height:270,
			label:"新建",
			url:"../html/example/grid_add.html",
			drag:true,
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								
								if(params){
									common.submit({
										url:"../json/submitSuccess.json",
										params:params
									})
									modal.hide();
									common.search(grid);
								}
							}
						});
					}
				},
				{
					label:"重置",
					cls:"btn btn-warning",
					clickEvent:function(){
						common.reset($("#form"));
					}
				}
			]
		});
	}
	/*日志任务详情*/
	var diaryDetail = function(para,index){
		var modal = base.modal({
			width:700,
			height:270,
			label:"任务详情",
			url:"../html/diaryAudit/interchange_detail.html",
			callback:function(){
				$.ajax({
					type:"get",
					url:$.path+"/api/exchangeLog/findExchangeLogById?id="+$(para).attr("cid"),
					xhrFields: {withCredentials: true},
					success:function(d){
						for(var a in d.data){
							if(d.data[a]){//存在
								if(a == "extractValue" || a == "loadValue"){//特殊的两个要做转换
									if(d.data[a]!="0"){
										$("#form ."+a).text((parseFloat(d.data[a])/1024).toFixed(2));
									}else{
										$("#form ."+a).text(d.data[a]);
									}
								}else{
									$("#form ."+a).text(d.data[a]);
								}
							}else{
								$("#form ."+a).text("--")
							}
						}
						$("#start_date_detail").text(d.data.startTime);
						$("#end_date_detail").text(d.data.endTime);
						if(index=="2"){
							$(".showTd").hide();
							$(".pubE").show();
						}else{
							$(".showTd").show();
							$(".pubE").hide();
						}
					}
				})
			}
		});
	};
	/*内容详情*/
	var diaryContentDetail = function(para){
		var taskId = $(para).attr("cid");
		var resId = $(para).attr("cid");
		$(".errorInfo").attr("taskId",taskId).attr("resId",resId)
		var modal = base.modal({
			width:700,
			height:270,
			label:"异常信息",
			url:"../html/diaryAudit/contentDetail.html"
		});
	};
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");
			if(key != activeNum){
				grid = null;
			}
			activeNum =key
			if(activeNum){
				$("#publishResource").hide();
				$("#subscribeResource").show();
				if(!grid){
					setGrid(1);
				}else{
					common.search(grid);
				}
			}else{
				$("#subscribeResource").hide();
				$("#publishResource").show();
				if(!grid){
					setGrid();
				}else{
					common.search(grid);
				}
			}
		});
	};
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return {
		main:function(){
			/**当调用main方法后(1个APP只能有1个main方法)，开始执行下列操作**/
			activeNum = null;
			setContent();
			setGrid();
			setGridButton();
			setSearch();
			setReset();
			setLinkGroup();
		}
	};
});