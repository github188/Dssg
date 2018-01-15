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
			url:$.path+"/api/interfaceLog/findApiInterfaceLogPublish",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
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
			{ "data": "serviceName","sWidth":"12%"},
			{ "data": "appName","sWidth":"12%"},
			{ "data": "callIp","sWidth":"12%"},
			{ "data": "apiSource","sWidth":"12%"},
			{ "data": "id","sWidth":"12%"},
			{ "data": "startTime","sWidth":"12%"},
			{ "data": "endTime","sWidth":"12%"},
			{ "data": "state","sWidth":"12%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
            },
            {"render":function(data,type,row,meta){
           		return common.interceptString(row.serviceName)
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
           		return row.appName?common.interceptString(row.appName):"--"
              }, 
               "targets":2 
           },
           {"render":function(data,type,row,meta){
           		return row.callIp?common.interceptString(row.callIp):"--"
              }, 
               "targets":3 
           },
            {"render":function(data,type,row,meta){
            	if(row.apiSource == "3d"){
            		return "第三方API";
            	}else{
            		return "本地数据源";
            	}
              }, 
               "targets":4 
            },
            {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0)' cid='"+row.id+"' class='diary_detail'>详情</a>"; 
              }, 
               "targets":5 
            },
            {"render":function(data,type,row,meta){
				switch(row.state){
					case '0':
						return "成功";
						break;
					case '1':
						return "失败";
						break;
				}
            	},
               "targets":8 
            }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$(".diary_detail").click(function(){
        		diaryDetail(this);
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
				url:$.path+"/api/interfaceLog/findApiInterfaceLogSubscribe",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
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
			{ "data": "serviceName","sWidth":"12%"},
			{ "data": "appName","sWidth":"12%"},
			{ "data": "callIp","sWidth":"11%"},
			{ "data": "apiSource","sWidth":"6%"},
			{ "data": "publishEquipment","sWidth":"11%"},
			{ "data": "ids","sWidth":"11%"},
			{ "data": "startTime","sWidth":"12%"},
			{ "data": "endTime","sWidth":"12%"},
			{ "data": "state","sWidth":"10%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
           },
           {"render":function(data,type,row,meta){
           		return common.interceptString(row.serviceName)
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
           		if(data){           			
           			return common.interceptString(row.appName)
           		}else{
           			return "--"
           		}
              }, 
               "targets":2 
           },
           {"render":function(data,type,row,meta){
           		if(row.callIp){           			
           			return common.interceptString(row.callIp)
           		}else{
           			return "--"
           		}
              }, 
               "targets":3 
           },
           {"render":function(data,type,row,meta){
            	if(row.apiSource == "3d"){
            		return "第三方API";
            	}else{
            		return "本地数据源";
            	}
              }, 
               "targets":4 
            },
            {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0)' cid='"+row.id+"' class='diary_detail1'>详情</a>"; 
              }, 
               "targets":6 
            },
            {"render":function(data,type,row,meta){
				switch(row.state){
					case '0':
						return "成功";
						break;
					case '1':
						return "失败";
						break;
				}
            	},
               "targets":9 
            }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball1"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$(".diary_detail1").click(function(){
        		diaryDetail(this);
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
		/*导出*/
		$(".export").click(function(){
			base.confirm({
				label:"导出",
				text:"默认导出5000条",
				confirmCallback:function(){
					var type = activeNum?2:1;
					var arr = base.getChecks("cb").val;
					window.location.href=$.path+"/api/interfaceLog/exportExcelApiInterfaceLog?type="+type+"&ids="+arr;
				}
			});
		})
	};
	
	/**修改**/
	var gridModify = function(){
		var params = {"cid":$(".ui-grid .cb:checked").attr("cid")};
		var modal = base.modal({
			width:800,
			height:400,
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
			width:800,
			height:400,
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
	/*日志详情*/
	var diaryDetail = function(para){
		var modal = base.modal({
			width:900,
			height:450,
			label:"详情",
			url:"../html/diaryAudit/serveDiary_detail.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-warning",
					clickEvent:function(){
						modal.hide();
					}
				}
			],
			callback:function(){
				$.ajax({
					type:"get",
					url:$.path+"/api/interfaceLog/findApiInterfaceLogById?id="+$(para).attr("cid"),
					xhrFields: {withCredentials: true},
					success:function(d){
						var requestData = d.data.requestData.replace(/>\s/g,">\n")
						var pre = "<pre><xmp>";
							pre +=requestData;
							pre +="</xmp></pre>";
						$("#requestData").html(pre);
						var responseData = d.data.responseData.replace(/>/g,">\n")
						var pres = "<pre><xmp>";
							pres +=responseData;
							pres +="</xmp></pre>";
						$("#responseData").html(pres);
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
			setContent();
			setGrid();
			setGridButton();
			setSearch();
			setReset();
			setLinkGroup()
		}
	};
});