
define(["base","app/commonApp"],function(base,common){
	var grid = null;
	/**datatables表格配置项**/
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/localresdatasource/findResPageByNameOrTypeInfo",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
				return common.getParams(d,$("#search-form"));
			}
		},
		columns:[
			{ "data": "id","sWidth":"8%"},
			{ "data": "name","sWidth":"23%"},
			{ "data": "ip","sWidth":"23%"},
			{ "data": "port","sWidth":"23%"},
			{ "data": "type","sWidth":"23%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+JSON.stringify(row)+"'/>"; 
              }, 
               "targets":0 
           },
           {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0)' class='iconBg' cid='"+JSON.stringify(row)+"'>"+row.name+"</a>"; 
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
           		return row.port?row.port:"--" 
              }, 
               "targets":3
           },
           {"render":function(data,type,row,meta){
           		switch(row.type){
          			case '1':
          				return "数据库";
          				break;
          			case '2':
          				return "文件";
          				break;
          			case '3':
          				return "API";
          				break;
          		}
              }, 
               "targets":4 
           }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	//选中行
        	common.selectedTr($("#example"));
        	/*查看详情*/
        	$(".iconBg").click(function(){
        		var self=$(this)
				var modal = base.modal({
					width:700,
					height:270,
					label:"详情",
					url:"../html/resourceManage/dataResourceManage_details.html",
					buttons:[
						{
							label:"关闭",
							cls:"btn btn-warning",
							clickEvent:function(){
								modal.hide();;
							}
						}
					],
					callback:function(){
						var values = JSON.parse(self.attr('cid'));
						for(var a in values){
							if(values[a]){								
								$("#form ."+a).text(values[a])
							}else{
								$("#form ."+a).text("--")
							}
						}
						switch(values.type){
							case '1':
								$("#form .fileFtp-box").hide();
								$("#form .fileSmb-box").hide();
								$("#form .database-box").show();
								$("#form .type").text("数据库");
								break;
							case '2':
								if(values.ftpType =="1"){
									$("#form .fileFtp-box").show();
									$("#form .fileSmb-box").hide();
								}
								if(values.ftpType=="2"){
									$("#form .fileFtp-box").hide();
									$("#form .fileSmb-box").show();
								}
								$("#form .database-box").hide();
								$("#form .type").text("文件");
								break;
						}
//						$("#form .name").text(values.name);
//						$("#form .password").text(values.password);
//						$("#form .username").text(values.username);
//						$("#form .port").text(values.port);
//						$("#form .ip").text(values.ip);
//						$("#form .dbType").text(values.dbType);
//						$("#form .dbInstanceName").text(values.dbInstanceName);
						switch(values.ftpType){
							case '1':
								$("#form .ftpType").text("FTP");
								break;
							case '2':
								$("#form .ftpType").text("SMB");
								break;
						};
						switch(values.unicode){
							case '1':
								$("#form .unicode").text("GBK");
								break;
							case '2':
								$("#form .unicode").text("UTF-8");
								break;
							case '3':
								$("#form .unicode").text("GB2312");
								break;
						};
						$("#form .ftpAddress").text(values.ftpAddress);
					}
				});
        	})
        }
	};
	/**画表格**/
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
	
	
	/**设置表格各个按钮操作**/
	var setGridButton = function(){
		$(".ui-grid-buttonbar .add").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}
			gridAdd();
		});
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				var params = {"id" : $(".ui-grid .cb:checked").val()};
				base.ajax({
					url:$.path+"/api/localresdatasource/checkResDataSourceUse",
					type:"post",
					params:params,
					success:function(d){
						if(d.success && d.data.length<1){
							gridDelete();
						}else{
							base.requestTip({position:"center"}).error("该项已被使用不允许删除");	
						}
					}
				})
			}
		});
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				var params = {"id" : $(".ui-grid .cb:checked").val()};
				base.ajax({
					url:$.path+"/api/localresdatasource/checkResDataSourceUse",
					type:"post",
					params:params,
					success:function(d){
						if(d.success && d.data.length<1){
							gridModify(params);
						}else{
							var a=0,b='';
							while (a<d.data.length){
								if(a < d.data.length-1){							
									b += d.data[a]+",";
								}else{
									b += d.data[a];
								}
								a++
							}
							base.requestTip({position:"center"}).error("请先暂停以下交换任务:"+b);	
						}
					}
				})
			}
		});
	};
	
	/**修改**/
	var gridModify = function(paramsId){
		$.ajax({
			url:$.path+"/api/localresdatasource/checkDelete",
			type:"post",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:JSON.stringify(paramsId),
			success:function(d){
				if(!d.data){
					$("#isUse").attr("name","true")
				}else{
					$("#isUse").attr("name","false")
				}
				runModify()
			}
		})
		function runModify(){
			$("#button_type").val("1");
			
			var modal = base.modal({
				width:700,
				height:270,
				label:"修改",
				url:"../html/resourceManage/dataResourceManage_add.html",
				buttons:[
					{
						label:"测试连接",
						cls:"btn btn-info testButton",
						clickEvent:function(){
							base.form.validate({
								form:$("#form"),
								checkAll:true,
								passCallback:function(){
									$(".testButton").text("连接中...").css({'background':'#ddd','borderColor':'#ddd','cursor':'no-drop'});
									var params = base.form.getParams($("#form"));
									base.ajax({
										url:$.path+"/api/localresdatasource/dataSourceTest",
										type:"post",
										params:params,
										success:function(d){
											if(d.data && d.success){
												base.requestTip({position:"center"}).success("测试通过");
											}else{
												base.requestTip({position:"center"}).error(d.message);
											}
											$(".testButton").text("测试连接").css({'background':'#017db1','borderColor':'#02648d','cursor':'auto'});
										}
									})
								}
							})
						}
					},
					{
						label:"保存",
						cls:"btn btn-info",
						clickEvent:function(){
							if($("#checkName").attr("name")=="false") {
								base.requestTip({position:"center"}).error("数据源名称重复")
								return ;
							}
							base.form.validate({
								form:$("#form"),
								checkAll:true,
								passCallback:function(){
									var params = base.form.getParams($("#form"));
									params.id = $(".ui-grid .cb:checked").val();
									if(params){
										common.submit({
											url:$.path+"/api/localresdatasource/updateResDataSource",
											params:params,
											type:"post",
											async:false,
											callback:function(d){
												if(d.message=="success"){
													d.message = "修改成功";
												}else{
													d.message = "修改失败";										
												}
											}
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
				],
				callback:function(){
					$("#click_but_type").val("1");
					var reName = JSON.parse(base.getCR("cb").attr('cid')).name;
					checkName(reName);
				}
			});
		}
	};
	/**批量删除**/
	var gridDelete = function(){
		var params = base.getChecks("cb").val;
		if(params.length>1){
			base.requestTip({position:"center"}).error("只能选择一条数据")
			return false;
		}
		$.ajax({
			url:$.path+"/api/localresdatasource/checkDelete",
			type:"post",
			data:JSON.stringify({id:params[0]}),
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			success:function(d){
				if(!d.data){
					base.requestTip({position:"center"}).error("该项已被使用")
					return false;
				}else{
                    deleFn(params);
				}
			}
		})
		function deleFn(params){
            /**删除前先弹窗确认是否删除**/
            base.confirm({
                confirmCallback:function(){
                    common.submit({
                        url:$.path+"/api/localresdatasource/deleteResDataSourceById",
                        params:{id:params[0]},
                        callback:function(d){
                            if(d.message=="success"){
                                d.message = "删除成功";
                            }else{
                                d.message = "删除失败";
                            }
                            common.search(grid);
                        }
                    });
                }
            });
		}
	};
	
	var checkName = function (reName) {
		$("#form").on("blur","#name",function () {
			if($(this).val() ==reName) return;
			var params ={};
			params.name = $(this).val();
			base.ajax({
				url:$.path+"/api/localresdatasource/checkResDataSourceName",
				type:"get",
				params:params,
				success:function(d){
					if(!d.data){
						$("#checkName").attr("name","false")
						return base.requestTip({position:"center"}).error("数据源名称重复")
					}else{
						$("#checkName").attr("name","true")
					}
				}
			})
		})
	}
	/**新建**/
	var gridAdd = function(){
		$("#button_type").val("");
		var modal = base.modal({
			width:700,
			height:270,
			label:"新建",
			url:"../html/resourceManage/dataResourceManage_add.html",
			callback:function(){
				checkName();
			},
			buttons:[
				{
					label:"测试连接",
					cls:"btn btn-info testButton",
					clickEvent:function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								$(".testButton").text("连接中...").css({'background':'#ddd','borderColor':'#ddd','cursor':'no-drop'});
								var params = base.form.getParams($("#form"));
								base.ajax({
									url:$.path+"/api/localresdatasource/dataSourceTest",
									type:"post",
									params:params,
									success:function(d){
										if(d.data && d.success){
											base.requestTip({position:"center"}).success("测试通过");
										}else{
											base.requestTip({position:"center"}).error(d.message);
										}
										$(".testButton").text("测试连接").css({'background':'#017db1','borderColor':'#02648d','cursor':'auto'});
									}
								})
							}
						})
					}
				},
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						if($("#checkName").attr("name")=="false") {
							base.requestTip({position:"center"}).error("数据源名称重复")
							return ;
						}
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								if(params){
									common.submit({
										url:$.path+"/api/localresdatasource/saveResDataSource",
										params:params,
										async:false,
										type:'post',
										callback:function(d){
											if(d.message=="success"){
												d.message = "新增成功";
											}else{
												d.message = "新增失败";										
											}
											common.search(grid);
											modal.hide();	
										}
									})
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
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return {
		main:function(){
			setContent();
			
			setGrid();
			setGridButton();
			setSearch();
			setReset();
		}
	};
});