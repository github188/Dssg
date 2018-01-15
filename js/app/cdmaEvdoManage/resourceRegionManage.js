define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey = null;
	var treeIds = null;
	var treeClickEvent = function(event,treeId,treeNode){
		common.initButtonbar($(".ui-grid-buttonbar"))
		treeKey = treeNode;
		if(treeIds != treeNode.level){
			grid = null;
		}
		treeIds = treeNode.level;
		if(treeIds==0){
			$("#parent_menu").show();
			$("#child_menu").hide();
			$(treeData).each(function(i,o){
				if(treeNode.id==o.id){
					$("#currentTreeId").val(o.id);
					if(!grid){
						setGrid(1);
					}else{
						common.search(grid);
					}
				}
			});
		}else{
			$("#parent_menu").hide();
			$("#child_menu").show();
			$(treeData).each(function(i,o){
			if(treeNode.id==o.id){
					$("#currentTreeId").val(o.id);
					if(!grid){
						setGrid();
					}else{
						common.search(grid);
					}
				}
			});
		}
	};
	var zTreeBeforeClick = function(treeId,treeNode){
		if(treeNode.level>1){
			return false;
		}
	}
	var setTreebar = function(){
		base.ajax({
			url:$.path+"/api/domain/findDomainResTree",
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(data){
				treeData = data.data;
				tree = base.tree({
					container:$("#treebar"),
					setting:{
						data: {
							simpleData: {
								enable: true
							}
						},
						callback:{
							onClick:treeClickEvent,
							beforeClick: zTreeBeforeClick
						}
					},
					data:common.mergeTreeData(data.data,"-1"),
					selectNodeId:"0"
				});
				
			},
			beforeSend:function(){
				base.loading($("#treebar"));
			}
		});
		base.scroll({
			container:$("#treeAside"),
			callback:function(){
				base.pull({
					container:$("#treeAside"),
					target:$("#rightPage")
				});
			}
		});
	};
	/**datatables表格配置项**/
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/domain/findDomainResourceByPidListTableInfo",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"));
				}
		},
		columns:[
			{ "data": "id","sWidth":"8%"},
			{ "data": "name","sWidth":"18%"},
			{ "data": "equipmentName","sWidth":"20%"},
			{ "data": "contacts","sWidth":"18%"},
			{ "data": "telphone","sWidth":"18%"},
			{ "data": "company","sWidth":"18%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+JSON.stringify(row)+"'/>"; 
              }, 
               "targets":0 
           },
           {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0);' class='resourceDetail' cid='"+row.id+"'>"+common.interceptString(row.name)+"</a>" 
              }, 
               "targets":1 
          },
          {"render":function(data,type,row,meta){
                 return row.telphone ? row.telphone :"--"
              }, 
               "targets":4 
           }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$(".resourceDetail").click(function(){
        		resourceDetail(this);
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
				url:$.path+"/api/domain/findDomainEquipmentByListTableInfo",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){	
					return common.getParams(d,$("#search-form"))+"&id="+treeKey.id;
				}
		},
		columns:[
			{ "data": "id","sWidth":"8%"},
			{ "data": "equipmentName","sWidth":"18%"},
			{ "data": "equipentIp","sWidth":"20%"},
			{ "data": "equipmentRole","sWidth":"18%"},
			{ "data": "company","sWidth":"18%"},
			{ "data": "equipmentStatus","sWidth":"18%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
           },
           {"render":function(data,type,row,meta){
                 return "<a href='javascript:void(0);' class='equipmentDetail' cid='"+row.equipmentId+"'>"+common.interceptString(row.equipmentName)+"</a>" 
              }, 
               "targets":1 
           },
           {"render":function(data,type,row,meta){
                  switch(row.equipmentRole){
                  	 case '0':
                  	 	return "接入节点";
                  	 	break;
                  	 case '1':
                  	 	return "管理节点";
                  	 	break;
                  }
              }, 
               "targets":3 
           },
           {"render":function(data,type,row,meta){
                  switch(row.equipmentStatus){
                  	 case '1':
                  	 	return "已加入";
                  	 	break;
                  	 default:
                  	 	return "--";
                  }
              }, 
               "targets":5 
           }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball1"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$(".equipmentDetail").click(function(){
        		equipmentDetail(this);
        	})
        	common.selectedTr($("#example1"));
        }
	};
	/**画表格**/
	var setGrid = function(para){
		if(para){
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
			var ids = base.getChecks("cb").val;
			if($(this).hasClass("disabled")){
				return;
			}else{
				$.ajax({
					type:"get",
					url:$.path+"/api/domain/findThisDomainIsCurrentInfo?domainId="+ids[0],
					xhrFields: {withCredentials: true},
					success:function(d){
						if(!d.data){
							base.requestTip({position:"center"}).error("没权限操作！")
						}else{
							gridDelete();
						}
					}
				});
			}
		});
		$(".ui-grid-buttonbar .modify").on("click",function(){
			var ids = base.getChecks("cb").val;
			if($(this).hasClass("disabled")){
				return;
			}else{
				$.ajax({
					type:"get",
					url:$.path+"/api/domain/findThisDomainIsCurrentInfo?domainId="+ids[0],
					xhrFields: {withCredentials: true},
					success:function(d){
						if(!d.data){
							base.requestTip({position:"center"}).error("没有操作权限！")
						}else{
							gridModify();
						}
					}
				});
			}
		});
		$(".ui-grid-buttonbar .quit").on("click",function(){
			quitEquipment();
		})
		$(".ui-grid-buttonbar #maintenance").on("click",function(){
			$.ajax({
				type:"get",
				xhrFields: {withCredentials: true},
				url:$.path+"/api/domain/findThisDomainIsCurrentInfo?domainId="+treeKey.id,
				success:function(d){
					if(!d.data){
						base.requestTip({position:"center"}).error("没有操作权限！")
					}else{
						maintenanceEquipment();
					}
				}
			});
		})
		
	};
	
	/**修改**/
	var gridModify = function(){
		$("#button_type").val(1);
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改",
			url:"../html/cdmaEvdoManage/resourceRegionManage_add.html",
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						/**1.先校验表单**/
						var pass = base.form.validate({
							form:$("#form"),
							checkAll:true
						});
						if(!pass){return;}
						/**2.保存**/
						var ids = $(".ui-grid .cb:checked").val();;
						var params = base.form.getParams($("#form"));
						params.id = ids;
						if(params){
							common.submit({
								url:$.path+"/api/domain/updateDomainResource",
								params:params,
								async:false,
								type:"post",
								callback:function(d){
									if(d.message=="success"){
										d.message = "修改成功";
									}else{
										d.message = "修改失败";										
									}
									setTreebar();
									common.search(grid);
								}
							})
						}
						/**3.关闭模态窗**/
						modal.hide();
						
						/**4.刷新表格**/
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
				var params =JSON.parse($(".ui-grid .cb:checked").attr("cid"));
				base.form.init(params,$("#form"))
			}
		});
	};
	/**删除**/
	var gridDelete = function(){
		var params = base.getChecks("cb").val;
		if(params.length>1){
			base.requestTip({position:"center"}).error("请选择一条数据")
			return false;
		}
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/domain/deleteDomainResource",
					params:{domainId:params[0]},
					callback:function(d){
						if(d.message=="success"){
							d.message = "删除成功";
						}else{
							d.message = "删除失败";										
						}
						setTreebar();
						common.search(grid);
					}
				});
			}
		});
	};
	/**新建**/
	var gridAdd = function(){
		$("#button_type").val("");
		var modal = base.modal({
			width:700,
			height:270,
			label:"新建",
			url:"../html/cdmaEvdoManage/resourceRegionManage_add.html",
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						/**1.先校验表单**/
						var pass = base.form.validate({
							form:$("#form"),
							checkAll:true
						});
						if(!pass){return;}
						/**2.保存**/
						var params = base.form.getParams($("#form"));
						/*检验是否重名*/
						if(params){
							base.ajax({
								url:$.path+"/api/domain/findDomainNameIsrepeat",
								params:{name:params.name},
								type:"get",
								success:function (d) {
									if(d.success && d.data){
										common.submit({
											url:$.path+"/api/domain/saveDomainResource",
											params:params,
											async:false,
											type:"post",
											callback:function(d){
												if(d.message=="success"){
													d.message = "新增成功";
												}else{
													d.message = "新增失败";										
												}
												setTreebar();
											}
										})
										/**3.关闭模态窗**/
										modal.hide();
									}else if(d.success && !d.data){
										return base.requestTip({position:"center"}).error("资源域名称重名")									
									}
								}
							})
							
						}
						
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
	/*资源域名称详情*/
	var resourceDetail = function(para){
		var modal = base.modal({
			width:700,
			height:270,
			label:"详情",
			url:"../html/cdmaEvdoManage/resourceRegionNameDetail.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){	
						/**3.关闭模态窗**/
						modal.hide();
					}
				}
			],
			callback:function(){
				$.ajax({
					type:"get",
					url:$.path+"/api/domain/findDomainInnerDetailByIdInfo?id="+$(para).attr("cid"),
					async:true,
					xhrFields: {withCredentials: true},
					success:function(d){
						var form = $("form");
						for(var a in d.data){
							if(d.data[a]){
								form.find("."+a).text(d.data[a])
							}else{
								form.find("."+a).text("--")
							}
						}
					}
				});
			}
		});
	}
	/*设备名称详情*/
	var equipmentDetail = function(para){
		var modal = base.modal({
			width:700,
			height:270,
			label:"详情",
			url:"../html/cdmaEvdoManage/equipmentNameDetail.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){	
						/**3.关闭模态窗**/
						modal.hide();
					}
				}
			],
			callback:function(){
				var params = $(para).attr("cid");
				$.ajax({
					url:$.path+"/api/domain/findDomainEquipmentInnerDetailByIdInfo",
					type:"post",
					xhrFields: {withCredentials: true},
					data:JSON.stringify({equipmentId:params,id:treeKey.id}),
					contentType:"application/json",
					success:function(d){
						var form = $("#form")
						for(var a in d.data){
							if(d.data[a]){
								form.find("."+a).text(d.data[a])
							}else{
								form.find("."+a).text("--")
							}
						}
					}
				})
			}
		});
	}
	/*退出设备*/
	var quitEquipment = function(){
		var status = true;
		var params = base.getChecks("cb").val;
		if(params.length != 1){
			base.requestTip({position:"center"}).error("请选择一条数据")
			return false;
		}
		$.ajax({
			url:$.path+"/api/domain/findEquipmentIsDomainInnerInfo?domainId="+params[0],
			type:"get",
			xhrFields: {withCredentials: true},
			async:false,
			success:function(d){
				if(!d.data){
					status = false;
					base.requestTip({position:"center"}).error("设备不在该资源域无需退出");
				}
			}
		})
		if(!status) return;
		if(status){
			$.ajax({
				url:$.path+"/api/domain/findThisDomainIsCurrentInfo?domainId="+params[0],
				type:"get",
				async:false,
				xhrFields: {withCredentials: true},
				success:function(d){
					if(!d.data){
						//false 为加入域的节点，退出，二次确认后，退出当前域
						base.confirm({
							label:"提示信息",
							text:"是否退出该域？",
							confirmCallback:function(){
								runQuit(params,"退出")
							}
						})
					}else{
						//true 为该域的创建者，创建者退出，视为解散域
						base.confirm({
							label:"提示信息",
							text:"是否解散该域？",
							confirmCallback:function(){
								runQuit(params,"解散")
							}
						})
					}
				}
			})
		}
	}
	//执行退出接口
	var runQuit =function (params,textInfo) {
		common.submit({
			url:$.path+"/api/domain/quitResourceDomainInfo",
			params:{domainId:params[0]},
			callback:function(d){
				if(d.message=="success"){
					d.message = textInfo+"成功";
				}else{
					d.message = textInfo+"失败";										
				}
				setTreebar();
			}
		});
	}
	/*维护设备*/
	var maintenanceEquipment = function(para){
		var modal = base.modal({
			width:900,
			height:450,
			label:"维护设备",
			url:"../html/cdmaEvdoManage/maintenanceEquipment.html",
			buttons:[
				{
					label:"确定",
					cls:"btn btn-info",
					clickEvent:function(){
						var ids = [],isHasNewEquipment = [];
						$("#listAdd li").each(function(i,o){
							ids.push($(o).attr("cid"));
							isHasNewEquipment.push($(o).attr("cid"));
						})
						if(ids.length==0){
							base.requestTip({position:"center"}).error("请选择需要邀请的设备！");
							return;
						}
						ids = ids.join(",")
						var params = {newListId:ids,domainId:treeKey.id}
						if(isHasNewEquipment.length !="1"){							
							base.confirm({
								confirmCallback:function(){
									common.submit({
										url:$.path+"/api/domain/newEquipmentDomainInfo",
										params:params,
										callback:function(d){
											if(d.message=="success"){
												d.message = "邀请成功";
											}else{
												d.message = "邀请失败";										
											}
											modal.hide();
											setTreebar();
										}
									});
								},
								text:"是否确定邀请"
							});
						}else{
							common.submit({
								url:$.path+"/api/domain/newEquipmentDomainInfo",
								params:params,
								callback:function(d){
									if(d.message=="success"){
										d.message = "维护成功";
									}else{
										d.message = "维护失败";										
									}
									modal.hide();
									setTreebar();
								}
							});
						}
					}
				},
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){	
						/**3.关闭模态窗**/
						modal.hide();
					}
				}
			],
			callback:function(){
				base.ajax({
					url:$.path+"/api/domain/findDomainEquipmentByListTableInfo?id="+treeKey.id,
					type:"get",
					success:function(d){
						$.each(d.data.content, function(i,o) {
							if(o.equipmentRole=="1"){
							}else{
								$("#listAdd").append('<li cid="'+o.equipmentId+'">'+o.equipmentName+'<i class="fa fa-trash-o"></i></li>')
							}
						});
					}
				})
			}
		});
	}
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return {
		main:function(){
			grid = null;
			setContent();
			setTreebar();
			//setGrid();
			setGridButton();
			//setSearch();
			setReset();
		}
	};
});