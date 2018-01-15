define(["base","app/commonApp","cookies"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey=null;
	var treeClickEvent = function(event,treeId,treeNode){
		common.initButtonbar($(".ui-grid-buttonbar"))
		treeKey=treeNode;
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
	};

	var setTreebar = function(){
		base.ajax({
			url:$.path+"/api/sysCenterBussinessDictionary/findSysCenterBussinessDictTree",
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
								onClick:treeClickEvent
							}
					},
					data:common.mergeTreeData(data.data,'-1'),
					selectNodeId:"DICTIONARY-FIXE-LEVEL-ONE-000000"
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
				url:$.path+"/api/sysCenterBussinessDictionary/findSysCenterBussinessDictionaryDetailList",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"))+"&id="+treeKey.id;
				}
		},
		columns:[
			{ "data": "id","sWidth":"12%","type":"checkbox"},
			{ "data": "name","sWidth":"20%"},
			{ "data": "code","sWidth":"20%"},
			{ "data": "description","sWidth":"48%"}
		],
		columnDefs:[ 
           	{"render":function(data,type,row,meta){
                return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' data-level='"+row.level+"' pid='"+row.pid+"'/>"; 
              }, 
               "targets":0 
            },
            {"render":function(data,type,row,meta){
                return common.interceptString(row.name) 
              }, 
               "targets":1 
            },
            {"render":function(data,type,row,meta){
                return row.code
              }, 
               "targets":2 
            },
            {"render":function(data,type,row,meta){
				return row.description? common.interceptString(row.description) :"--"; 
              }, 
               "targets":3 
            } 
        ],
        fnCreatedRow: function(nRow, aData, iDataIndex) {
        	$(nRow).attr("data-tt-id",aData.id);
        	$(nRow).attr("data-tt-parent-id",aData.pid);
        	$(nRow).attr("rootRow",iDataIndex);
        },
        drawCallback:function(setting){
        	common.treeTable(setting);
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	//选中行
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
		$(".ui-grid-buttonbar .adds").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}
			gridAdd();
		});
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				var ids = base.getChecks("cb").val;
				if(ids.length>1){
					base.requestTip({position:"center"}).error("请选择一条数据！")
					return;
				}
				base.ajax({
					url:$.path+"/api/resCenterDataElement/checkUsed?id="+ids[0],
					type:"get",
					success:function(d){
						switch(d.data){
							case 2:
								base.requestTip({position:"center"}).error("固定字典，不能删除！");
								break;
							case 1:
								base.requestTip({position:"center"}).error("字典已使用，不能删除！");
								break;
							default:
								gridDelete();
						}
					}
				})
			}
		});
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				var params = $(".ui-grid .cb:checked").val();
				if(params=='DICTIONARY-FIXE-LEVEL-ONE-000001' || params == "DICTIONARY-FIXE-LEVEL-ONE-000002" || params == "DICTIONARY-FIXE-LEVEL-ONE-000003")
				{
					base.requestTip({position:"center"}).error("固定字典不能编辑");
					return;
				}
				gridModify();
			}
		});
		$(".import").click(function(){
			$("#file").replaceWith('<input type="file" name="file" id="file" style="display: none;"/>');
			$("#file").trigger("click");
		})
		/*导出*/
		$(".export").click(function(){
			var arr = base.getChecks("cb").val;
			window.location.href=$.path+"/api/sysCenterBussinessDictionary/downloadDicts?ids="+arr;
		})
	};
	
	/**修改**/
	var gridModify = function(){
		$("#button_type").val("1");
		var uri = "dataDictionaryManage_add";
		var ids = base.getChecks("cb").val;
		if(treeKey.id == "DICTIONARY-FIXE-LEVEL-ONE-000001" || treeKey.id == "DICTIONARY-FIXE-LEVEL-ONE-000002"){
			var dataLevel = $(".ui-grid .cb:checked").attr("data-level");
			if(dataLevel == 2){
				uri = "dataDictionaryManage1_add";
			}
		}
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改",
			url:"../html/catalogManage/"+uri+".html",
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						/**1.先校验表单**/
						var pass = true;
						pass= base.form.validate({
							form:$("#form"),
							checkAll:true
						});
						var data = [];
						data.push($("#dictionarySum").val());
						data.push($("#code").val());
						$.each(data,function(i,o){
							if(o.length<1){return;}
							var param = {};
							if(i==0){
								param.name=data[i];
							}else{
								param.code=data[i];
							}
							param.id = ids[0];
							base.ajax({
								url:$.path+"/api/sysCenterBussinessDictionary/checkCodeOrName",
								type:"post",
								params:param,
								async:false,
								success:function(d){
									if(!d.data){
										if(i==0){
											base.requestTip({position:"center"}).error("字典项重名！");
										}else{
											base.requestTip({position:"center"}).error("编码重名！")
										}
										pass=false;
									}
								}
							})
						})
						if(!pass){return;}
						if($("#fileName").html()==""){
							return base.requestTip({position:"center"}).error("请选择图片");
						}
						/**2.保存**/
						var level = $(".ui-grid .cb:checked").attr("data-level");
						var pid = $(".ui-grid .cb:checked").attr("pid");
						var params = base.form.getParams($("#form"));
						params.pid=pid;
						params.level=level;
						params.id=ids[0];
						if(params){
							common.submit({
								url:$.path+"/api/sysCenterBussinessDictionary/updateDetailedDictionary",
								params:params,
								async:false,
								type:'post',
								callback:function(d){
									if(d.message=="success"){
										d.message = "修改成功";
									}else{
										d.message = "修改失败";										
									}
									/**4.刷新表格**/
									common.search(grid);
									
									/**3.关闭模态窗**/
									modal.hide();
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
	/**批量删除**/
	var gridDelete = function(){
		var params = base.getChecks("cb").val;
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysCenterBussinessDictionary/deleteDetailedDictionary",
					params:params,
					type:"post",
					callback:function(d){
						if(d.message=="success"){
							d.message = "删除成功";
						}else{
							d.message = "删除失败";										
						}
						common.search(grid);
						setTreebar();
					}
				});
			}
		});
	};
	/**新建**/
	var gridAdd = function(){
		$("#button_type").val("");
		var ids = base.getChecks("cb").val;
		if(ids.length>1){
			base.requestTip({position:"center"}).error("请选择一条数据！")
			return;
		}
		var uri = "dataDictionaryManage_add";
		if(treeKey.id == "DICTIONARY-FIXE-LEVEL-ONE-000001" || treeKey.id == "DICTIONARY-FIXE-LEVEL-ONE-000002"){
			if(ids.length == 0){
				uri = "dataDictionaryManage1_add";
			}
		}
		var lev = $(".ui-grid .cb:checked").attr("data-level");
		if(lev==4){
			base.requestTip({position:"center"}).error("目前字典项只支持3级！");
			return;
		}
		var modal = base.modal({
			width:700,
			height:270,
			label:"新建",
			url:"../html/catalogManage/"+uri+".html",
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						/**1.先校验表单**/
						var pass = null;
						pass= base.form.validate({
							form:$(".ui-form"),
							checkAll:true
						});
						var data = [];
						data.push($("#dictionarySum").val());
						data.push($("#code").val());
						$.each(data,function(i,o){
							if(o.length<1){return;}
							var param = {};
							if(i==0){
								param.name=data[i];
							}else{
								param.code=data[i];
							}
							base.ajax({
								url:$.path+"/api/sysCenterBussinessDictionary/checkCodeOrName",
								type:"post",
								params:param,
								async:false,
								success:function(d){
									if(!d.data){
										if(i==0){
											base.requestTip({position:"center"}).error("字典项重名！");
										}else{
											base.requestTip({position:"center"}).error("编码重名！")
										}
										pass=false;
									}
								}
							})
						})
						if(!pass){return;}
						if($("#fileName").html()==""){
							return base.requestTip({position:"center"}).error("请选择图片");
						}
						/**2.保存**/
						var params = base.form.getParams($("#form"));
						if(treeKey.level == 0){
							params.pid=treeKey.id;
							params.level=parseInt(treeKey.level)+1;
						}else{
							if(ids[0]){
								params.pid= ids[0];
								params.level=parseInt(lev)+1;
							}else{
								params.pid=treeKey.id;
								params.level=parseInt(treeKey.level)+1;
							}
						}
						/*重名检查*/
						base.ajax({
							url:$.path+"/api/sysCenterBussinessDictionary/checkCodeOrName",
							params:{name:params.name},
							type:"post",
							success:function(d){
								if(d.data){
									/*新增*/
									common.submit({
										url:$.path+"/api/sysCenterBussinessDictionary/saveDetailedDictionary",
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
											common.search(grid);
										}
									})
								}else{
									base.requestTip({position:"center"}).error("字典名重复！");
								}
							}
						})
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
		/*文件上传*/
		$(".dataDictionaryFile").on("change","#file",function(){
			var arr = base.getChecks("cb").val;
			base.form.fileUpload({ 
               url:$.path+"/api/sysCenterBussinessDictionary/uploadDictsIn", 
               id:"file", 
               params:{ids:arr},
               success:function(data){ 
               		if(data.success){
               			base.requestTip({ 
	                       position:"center" 
	                   }).success("导入成功！"); 
	                   setTreebar();
               		}
	            },
	            error:function(data){
	            	base.requestTip({ 
                       position:"center" 
                   }).success("导入成功！"); 
                   setTreebar();
	            }
           });
		})
	};
	return {
		main:function(){
			/*每次加载清数据*/
			grid=null;
			
			setContent();
			setTreebar();
			//setGrid();
			setGridButton();
			setSearch();
			setReset();
		}
	};
});