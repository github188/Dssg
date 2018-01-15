define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey = null;
	var currLevel=false;
	var treeClickEvent = function(event,treeId,treeNode){
		common.initButtonbar($(".ui-grid-buttonbar"))
		if(treeNode.level >=5){
			$(".btn.btn-link").addClass("disabled");
			$("input").addClass("disabled").attr("disabled","disabled");
			//大于5 的时候要调到4的列表sNodes[0].getParentNode()
			treeNode = treeNode.getParentNode();
			currLevel = true;
		}else{
			currLevel = false;
		}
		treeKey = treeNode;
		$(treeData).each(function(i,o){
			if(treeNode.id==o.id){
				$("#currentTreeId").val(o.id);
				if(!grid){
					setGrid();
				}else{
					common.search(grid);
				}
				if(currLevel){					
					var setTime = setTimeout(function(){					
						$("input").addClass("disabled").attr("disabled","disabled");
					},100)
				}
			}
		});
	};
	var setTreebar = function(){
		base.ajax({
			url:$.path+"/api/rescentercompany/findCenterCompanyTree",
			type:"get",
			success:function(data){
				treeData = data.data;
				treeData.unshift({name:"全部单位",id:"0",pid:"-1",code:"0"})
				tree = base.tree({
					container:$("#treebar"),
					setting:{
							data: {
								simpleData: {
									enable: true
								}
							},
							callback:{
								onClick:treeClickEvent
							}
					},
					data:common.mergeTreeData(treeData,"-1"),
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
				url:$.path+"/api/rescentercompany/findCenterCompanyByPageInfo",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
//					var ids = treeKey.id==0?'':treeKey.id;
					return common.getParams(d,$("#search-form"))+"&pid="+treeKey.id;
				}
		},
		columns:[
			{ "data": "id","sWidth":"7%"},
			{ "data": "name","sWidth":"31%"},
			{ "data": "code","sWidth":"31%"},
			{ "data": "description","sWidth":"31%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+JSON.stringify(row)+"'/>"; 
              }, 
               "targets":0 
            } ,
            {"render":function(data,type,row,meta){
            	return common.interceptString(row.name);
              }, 
               "targets":1 
            } ,
            {"render":function(data,type,row,meta){
            	return common.interceptString(row.code);
              }, 
               "targets":2 
            } ,
            {"render":function(data,type,row,meta){
            	if(data){            		
            		return common.interceptString(row.description);
            	}else{
            		return "--"
            	}
            },
               "targets":3 
            } 
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	common.selectedTr($("#example"));
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
		$(".import").click(function(){
			if($(this).hasClass("disabled")){
				return;
			}
			$("#file").replaceWith('<input type="file" name="file" id="file" style="display: none;"/>');
			$("#file").trigger("click");
//			var modal = base.modal({
//				width:450,
//				height:100,
//				label:"导入数据",
//				url:"../html/fileImport.html",
//				buttons:[
//					{
//						label:"下载模板",
//						cls:"btn btn-info",
//						clickEvent:function(){
//						}
//					},
//					{
//						label:"确定",
//						cls:"btn btn-info",
//						clickEvent:function(){
//						}
//					},
//					{
//						label:"关闭",
//						cls:"btn btn-warning",
//						clickEvent:function(){
//							modal.hide();
//						}
//					}
//				],
//				callback:function(){
//				}
//			});
		})
		/*导入*/
		$(".unitFile").on("change","#file",function(){
			var arr = base.getChecks("cb").val;
			base.form.fileUpload({ 
               url:$.path+"/api/rescentercompany/uploadCompanyData", 
               id:"file", 
               success:function(data){ 
               		if(data.data){
               			base.requestTip({ position:"center"}).success("附件上传成功！"); 
               		}else{
               			 base.requestTip({ position:"center"  }).error("附件上传失败！"); 
               		}
	            } 
           });
			
		})
		/*导出*/
		$(".export").click(function(){
			if($(this).hasClass("disabled")){
				return;
			}
			var params = base.getChecks("cb").val; 
			window.location.href = $.path+"/api/rescentercompany/exportCompanyData?ids="+params;
//			window.location.href = $.path+"/api/rescentercompany/exportCompanyData";
		})
	};
	
	/**修改**/
	var gridModify = function(){
		$("#button_type").val(1);
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改",
			url:"../html/cdmaEvdoManage/unitManage_add.html",
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
						var ids = base.getChecks("cb").val;
						var params = base.form.getParams($("#form"));
						params.id = ids[0];
						params.idex = "0";
						params.level = "0";
						params.pid = treeKey.id;
						if(params){
							common.submit({
								url:$.path+"/api/rescentercompany/updateResCenterCompany",
								params:params,
								async:false,
								type:"post",
								callback:function(d){
									if(d.message=="success"){
										d.message = "修改成功";
									}else{
										d.message = "修改失败";										
									}
									modal.hide();
									setTreebar();
								}
							})
						}
						/**3.关闭模态窗**/
						
						
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
				var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
				base.form.init(params,$("#form"));
			}
		});
	};
	/**批量删除**/
	var gridDelete = function(){
		var params = base.getChecks("cb").val;
		if(params.length>1){
			base.requestTip({position:"center"}).error("请选择一条数据！");
			return false;
		}
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				base.ajax({
					url:$.path+"/api/rescentercompany/deleteResCenterCompanyById?id="+params[0],
					type:'get',
					success:function(result){
						if(result.data.status == "invalid"){
							base.requestTip({position:"center"}).error("该单位已被引用无法删除！");d.message="";
						}else if(result.data.status == "failnode"){
							base.requestTip({position:"center"}).error("该单位包含子节点无法删除！");
						}else{
							base.requestTip({position:"center"}).success("删除成功！");
							setTreebar();
						}
					}
				})
//				common.submit({
//					url:$.path+"/api/rescentercompany/deleteResCenterCompanyById?id="+params[0],
//					callback:function(d){
//						if(d.data.staus == "invalid"){
//							d.message="该单位已被引用无法删除";
//						}else if(d.data.staus == "failnode"){
//							d.message="该单位包含子节点无法删除";
//						}else{
//							d.message="删除成功";
//						}
//						
//					}
//				});
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
			url:"../html/cdmaEvdoManage/unitManage_add.html",
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
						params.pid = treeKey.id;
						params.pcode = treeKey.code ? treeKey.code:"0";
						if(params){
							common.submit({
								url:$.path+"/api/rescentercompany/saveResCenterCompany",
								params:params,
								async:false,
								type:"post",
								callback:function(d){
									if(d.message=="success"){
										d.message = "新增成功";
									}else{
										d.message = "新增失败";										
									}
									modal.hide();
									setTreebar();
								}
							})
						}
						/**3.关闭模态窗**/
						
						
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
			]
		});
	};
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