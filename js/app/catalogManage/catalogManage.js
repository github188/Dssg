define(["base","app/commonApp","cookies"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey = null;
	var treeParent = null;
	var levelNum = null;
	var dataObject = {};
	var tableObject = [];
	var resourceType = null;
	var modal = null;
	var search =null;
	var treeClickEvent = function(event,treeId,treeNode){
		treeParent = treeNode.getParentNode();
		treeKey = treeNode;
		if(levelNum != treeNode.level){
			grid = null;
		}
		if(resourceType != treeNode.resourceType){
			grid = null;
		}
		resourceType = treeNode.resourceType
		levelNum = treeNode.level;
		common.initButtonbar($(".ui-grid-buttonbar"))
		if(treeNode.level==1){
			$("#child_menu").hide();
			$("#resource_menu").hide();
			$("#parent_menu").show();
			$(treeData).each(function(i,o){
				if(treeNode.id==o.id){
					if(!grid){
						setGrid(1);
					}else{
						common.search(grid);
					}
				}
			});
		}else if(treeNode.level==2){
			$("#parent_menu").hide();
			$("#resource_menu").hide();
			$("#child_menu").show();
			$(treeData).each(function(i,o){
			if(treeNode.id==o.id){
					if(!grid){
						setGrid(0);
					}else{
						common.search(grid);
					}
				}
			});
			
		}else{
			$("#child_menu").hide();
			$("#parent_menu").hide();
			$("#resource_menu").show();
			switch(treeKey.resourceType){
				case '1':
					$("#resource_table2").hide();
					$("#resource_table3").hide();
					$("#resource_table1").show();
					$("#resource_menu button").removeClass("disabled");
					$(treeData).each(function(i,o){
					if(treeNode.id==o.id){
							if(!grid){
								setGrid(2);
							}else{
								common.search(grid);
							}
						}
					});
					break;
				case '2':
					$("#resource_table3").hide();
					$("#resource_table1").hide();
					$("#resource_table2").show();
					$("#resource_menu button").addClass("disabled");
					$(treeData).each(function(i,o){
					if(treeNode.id==o.id){
							if(!grid){
								setGrid(3);
							}else{
								common.search(grid);
							}
						}
					});
					break;
				case '3':
					$("#resource_table1").hide();
					$("#resource_table2").hide();
					$("#resource_table3").show();
					$("#resource_menu button").addClass("disabled");
					$(treeData).each(function(i,o){
					if(treeNode.id==o.id){
							if(!grid){
								setGrid(4);
							}else{
								common.search(grid);
							}
						} 
					});
					break;
			}
		}
		common.search(grid);
	};
	
	//点击树的搜索框执行的事件
	function clickTreeSearch(){
		$(".input-group-addon").on("click",function(){
			var resName = $(".search-box input").val();
			//设置当前是搜索的状态值
			search = true;
			//取消所有之前选中的节点
			tree.treeObj.cancelSelectedNode();
			//将节点全部收起来
			tree.treeObj.expandAll(false);
			//被模糊匹配选中的节点
			var timeOut = setTimeout(function(){
				var nodes = tree.treeObj.getNodesByParamFuzzy("name", resName, null);
				for(var i=0;i<nodes.length;i++){
					var parent = nodes[i].getParentNode();  
		            if(!parent.open){
		               tree.treeObj.expandNode(parent,true,true);  
		            }
		            tree.treeObj.updateNode(nodes[i]);
		            tree.treeObj.selectNode(nodes[i],true);
				}
			},400)
		})
	}
	
	function treeNodeCreated(event,treeId,treeNode){
		if(treeNode.highlight){
			$("#treebar a[title='"+treeNode.name+"']").css({color:"#0091f6"});
		}
	}
//	禁止根节点选中
	function zTreeBeforeClick(treeId,treeNode){
        if(treeNode.id == 0){
            return false;
        }
   }
	var setTreebar = function(d){
		var resourceName = d;
		if(!d){
			resourceName = "";
		}
		base.ajax({
			url:$.path+"/api/catalog/findResourceCatalogTree?resourceName="+resourceName,
			type:"get",
			success:function(data){
				treeData = data.data;
				var seletNodeId = null;
				if(treeData.length>1){
					seletNodeId =  treeData[1].id;
				}
				if(d=="save"){
					seletNodeId = treeKey.id;
				}
				if(search){
					seletNodeId = "";
				}
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
								beforeClick: zTreeBeforeClick,
								onNodeCreated:treeNodeCreated
							}
					},
					data:common.mergeTreeData(data.data,"-1"),
					selectNodeId:seletNodeId
				});
				search =false;
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
			url:$.path+"/api/catalog/findCatalogList",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
				return common.getParams(d,$("#search-form"))+"&id="+treeKey.id;
			}	
		},
		columns:[
			{"data": "id","sWidth":"8%"},
			{ "data": "name","sWidth":"15%"},
			{ "data": "code","sWidth":"15%"},
			{ "data": "ename","sWidth":"16%"},
			{ "data": "auditorUserName","sWidth":"16%"},
			{ "data": "telphone","sWidth":"15%"},
			{ "data": "auditorCompany","sWidth":"15%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' cid='"+JSON.stringify(row)+"' class='cb'/>"; 
              }, 
               "targets":0 
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
	var gridOption1 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:$.path+"/api/resCatalog/getResCatalogListByCatalogId",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"))+"&id="+treeKey.id;
				}
		},
		columns:[
			{"data": "id","sWidth":"8%"},
			{ "data": "resName","sWidth":"19%"},
			{ "data": "resType","sWidth":"18%"},
			{ "data": "equipmentName","sWidth":"19%"},
			{ "data": "companyName","sWidth":"19%"},
			{ "data": "stateName","sWidth":"18%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' cid='"+JSON.stringify(row)+"' class='cb'/>"; 
              }, 
               "targets":0 
          },
          {"render":function(data,type,row,meta){
                 return "<a class='catalog_detail' cid='"+row.id+"'>"+row.resName+"</a>"; 
              }, 
               "targets":1 
         },
          {"render":function(data,type,row,meta){
          		switch(row.resType){
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
               "targets":2 
          }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball1"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	$(".catalog_detail").click(function(){
        		catalogDetail(this)
        	})
        }
	};
	var gridOption2 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:$.path+"/api/resource/findResourceContent",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"))+"&resourceId="+treeKey.id;
				}
		},
		columns:[
			{"data": "name","sWidth":"15%"},
			{ "data": "ename","sWidth":"17%"},
			{ "data": "code","sWidth":"17%"},
			{ "data": "type","sWidth":"17%"},
			{ "data": "length","sWidth":"17%"},
			{ "data": "dataCode","sWidth":"17%"}
		],
		columnDefs:[ 
		 {"render":function(data,type,row,meta){
          		return common.interceptString(row.name)
              }, 
               "targets":0 
         },
          {"render":function(data,type,row,meta){
          		return common.interceptString(row.ename)
              }, 
               "targets":1 
         },
		 {"render":function(data,type,row,meta){
          		return common.interceptString(row.code)
              }, 
               "targets":2 
         },
          {"render":function(data,type,row,meta){
          		return common.typeSelect(row.type)
              }, 
               "targets":3 
         },
         {"render":function(data,type,row,meta){
          		return row.length?row.length:"--";
              }, 
               "targets":4 
         },
         {"render":function(data,type,row,meta){
          		return row.dataCode?row.dataCode:"--";
              }, 
               "targets":5 
         }
        ],
        drawCallback:function(setting){}
	};
	var gridOption3 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:$.path+"/api/resource/findResourceContent",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"))+"&resourceId="+treeKey.id;
				}
		},
		columns:[
			{"data": "fileName","sWidth":"25%"},
			{ "data": "fileType","sWidth":"25%"},
			{ "data": "fileSize","sWidth":"25%"},
			{ "data": "updateDate","sWidth":"25%"}
		],
		columnDefs:[ 
			{"render":function(data,type,row,meta){
          		return common.interceptString(row.fileName);
              }, 
               "targets":0 
	         }
        ],
        drawCallback:function(setting){
        	
        }
	};
	var gridOption4 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:$.path+"/api/resource/findResourceContent",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"))+"&resourceId="+treeKey.id;
				}
		},
		columns:[
			{"data": "paramName","sWidth":"20%"},
			{ "data": "paramType","sWidth":"12%"},
			{ "data": "paramSource","sWidth":"20%"},
			{ "data": "mandatory","sWidth":"14%"},
			{ "data": "notNull","sWidth":"14%"},
			{ "data": "desc","sWidth":"20%"}
		],
		columnDefs:[ 
			{"render":function(data,type,row,meta){
                data =  row.paramName?row.paramName:"--";
                return common.interceptString(data);
              }, 
               "targets":0 
          },
			{"render":function(data,type,row,meta){
				var d = common.typeSelect(row.paramType);
                return d?d:'系统参数' ;
              }, 
               "targets":1 
          },
          {"render":function(data,type,row,meta){
                return row.paramSource == '1'?"输入参数":"输出参数";
              }, 
               "targets":2 
          },
          {"render":function(data,type,row,meta){
	          	if(row.mandatory){
	          		return row.mandatory=="1" ? "是" :"否";
	          	}else{
	          		return "--"
	          	}
              }, 
               "targets":3 
          },
          {"render":function(data,type,row,meta){
                if(row.notNull){
	          		return row.notNull=="1" ? "是" :"否";
	          	}else{
	          		return "--"
	          	}
              }, 
               "targets":4 
          },
          {"render":function(data,type,row,meta){
                data = row.desc?row.desc:"--" ;
                return common.interceptString(data);
              }, 
               "targets":5 
          }
        ],
        drawCallback:function(setting){
        }
	};
	/**画表格**/
	var setGrid = function(para){
		switch(para){
			case 1:
				grid = base.datatables({
					container:$("#example"),
					option:gridOption,
					filter:common.gridFilter
				});
				break;
			case 0:
				grid = base.datatables({
					container:$("#example1"),
					option:gridOption1,
					filter:common.gridFilter
				});
				break;
			case 2:
				grid = base.datatables({
					container:$("#example2"),
					option:gridOption2,
					filter:common.gridFilters
				});
				break;
			case 3:
				grid = base.datatables({
					container:$("#example3"),
					option:gridOption3,
					filter:common.gridFilters
				});
				break;
			case 4:
				grid = base.datatables({
					container:$("#example4"),
					option:gridOption4,
					filter:common.gridFilters
				});
				break;
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
			if($(this).attr("key") == 1){
				gridAdd();
			}
		});
		/*删除*/
		$(".ui-grid-buttonbar .delete").on("click",function(){
			var key = $(this).attr("key");
			var params = base.getChecks("cb").val;
			if($(this).hasClass("disabled")){
				return;
			}else{
				switch(key){
					case "1":
						gridDelete({
							url:$.path+"/api/catalog/deleteCatalogById",
							params:params,
							callback:function(d){
								if(d.message=="success"){
									if(d.data.length>0){
										base.requestTip({position:"center"}).success("有"+d.data.length+"个目录未删除，因为该目录下有已发布的资源存在")
									}else{
										d.message = "删除成功";
									}
									setTreebar();
								}else{
									d.message = d.message;										
								}
								$("#example input").prop('checked', false) 
							}
						},1);
					break;
					case "2":
						if(params.length>1){
							base.requestTip({position:"center"}).error("请选择一条数据！")
							return false;
						}
						gridDelete({
							url:$.path+"/api/resCatalog/deleteResourceById?id="+params[0],
							type:"get",
							callback:function(d){
								if(d.message=="success"){
									d.message = "删除成功";
									setTreebar();
								}else{
									d.message = "删除失败";										
								}
							}
						},2);
					break;
				}
			}
		});
		//key 1修改 2查看流程3提交4审核 5编目修改
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				var key = $(this).attr("key");
				switch(key){
					case "1":
						var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
						var auditEquipment = params.auditorEquipment;
						var equipmentIdentify = common.getCookis().loginUserProfileDTO.currentEquipment.equipmentIdentify;
						if(auditEquipment != equipmentIdentify){
							base.requestTip({position:"center"}).error("没有操作权限！")
							return false;
						}
						gridModify();
					break;
					case "2":
						flowsheet();
					break;
					case "3":
						dataSubmit();
					break;
					case "4":
						dataExamine();
					break;
					case "5":
						var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
						var auditEquipment = params.equipment;;
						var equipmentIdentify = common.getCookis().loginUserProfileDTO.currentEquipment.equipmentIdentify;
						if(auditEquipment != equipmentIdentify){
							base.requestTip({position:"center"}).error("没有操作权限！")
							return false;
						}
						catalogModify();
					break;
				}
			}
		});
		//编目
		$(".ui-grid-buttonbar #catalog").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{ 
				catalogData();
			}
		});
		$(".import").click(function(){
			if($(this).hasClass("disabled")){
				return;
			}
			$("#file").replaceWith('<input type="file" name="file" id="file" style="display: none;"/>');
			$("#file").trigger("click");
		})
		/*导出*/
		$(".export").click(function(){
			if($(this).hasClass("disabled")){
				return;
			}
			var arr = base.getChecks("cb").val;
			window.location.href=$.path+"/api/resCatalog/downloadResCatalog?selectId="+treeKey.id+"&action="+levelNum+"&ids="+arr;
		})
		/*导入*/
		/*文件上传*/
		$(".catalogFile").on("change","#file",function(){
			var arr = base.getChecks("cb").val;
			base.form.fileUpload({ 
               url:$.path+"/api/resCatalog/uploadResCatalog", 
               id:"file", 
               params:{selectId:treeKey.id,action:levelNum,ids:arr},
               success:function(data){ 
	              if(data.success){
	              	base.requestTip({ 
	                	position:"center" 
	                  }).success("上传成功！"); 
	                  setTreebar();
	              }
	            },
	            error:function(d){
	            	 base.requestTip({ 
	                	position:"center" 
	                  }).success("上传成功！"); 
	                  setTreebar();
	            }
           });
		})
		
	};
	/**新增目录的名称与编码校验**/
	var check = function(){
		$("#form").on("blur","#name",function () {
			var params = {};
			/**判断有没有修改**/
			if(base.getCR("cb").length!="0"){
				var val = JSON.parse(base.getCR("cb").attr("cid")).name;
			}
			if(val){				
				if($(this).val() ==val) return ;
			}
			/*没有修改**/
			if($(this).val()){
				if($(this).val() )
				params.name = $(this).val();
				params.resDomainId = treeKey.id;
				checkCatalogName(params,"名称")
			}
		})
		$("#form").on("blur","#code",function () {
			var params = {};
			/**判断有没有修改**/
			if(base.getCR("cb").length!="0"){
				var val = JSON.parse(base.getCR("cb").attr("cid")).code;
			}
			if(val){
				if($(this).val() ==val) return ;
			}
			if($(this).val() ==val) return 
			/*没有修改**/
			if($(this).val()){				
				params.code = $(this).val();
				params.resDomainId = treeKey.id;
				checkCatalogName(params,"编码")
			}
		})
	}
	/**目录和编码的重名校验**/
	function checkCatalogName(params,text){
		base.ajax({
			url:$.path+"/api/catalog/checkCatalogName",
			type:"post",
			params:params,
			success:function(d){
				if(d.code =="0"){
					if(!d.data){
						if(text =="名称"){							
							$(".checkNameCode").attr("name",text)
						}
						if(text =="编码"){							
							$(".checkNameCode").attr("code",text)
						}
						base.requestTip({position:"center"}).error("目录"+text+"重复")
					}else{
						if(text =="名称"){							
							$(".checkNameCode").attr("name","")
						}
						if(text =="编码"){							
							$(".checkNameCode").attr("code","")
						}
					}
				}
			}
		})
	}
	/**域修改**/
	var gridModify = function(){
		$("#button_type").val("1");
		var params = {"cid":$(".ui-grid .cb:checked").attr("cid")};
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改",
			url:"../html/catalogManage/catalogManage_add.html",
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
						if($(".checkNameCode").attr("name") && $(".checkNameCode").attr("name") !=""){
							return base.requestTip({position:"center"}).error("目录名称重复")
						}
						if($(".checkNameCode").attr("code") && $(".checkNameCode").attr("code") !=""){
							return base.requestTip({position:"center"}).error("目录编码重复")
						}
						/**2.保存**/ 
						var params = base.form.getParams($("#form"));
						params.resDomainId = treeKey.id;
						params.auditorEquipmentId = $("#hy").attr("tid");
						params.id = $(".ui-grid .cb:checked").val();
						if(params){
							common.submit({
								url:$.path+"/api/catalog/updateCatalogInfo",
								params:params,
								type:"post",
								async:false,
								callback:function(d){
									if(d.message=="success"){
										d.message = "修改成功";
									}else{
										d.message = "修改失败";										
									}
									setTreebar();
								}
							})
						}
						/**3.关闭模态窗**/
						modal.hide();
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
				check();
				var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
				base.form.init(params,$("#form"));
				$("#hy").val(params.ename).attr("tid",params.auditorEquipmentId)
				$.ajax({
					url:$.path+"/api/catalog/findDomainResByDomainIdEquipmentTree?domainId="+treeKey.id,
					type:"get",
					xhrFields: {withCredentials: true},
					success:function(d){
						var treeSelectObj = base.form.treeSelect({
							container:$("#hy"),
							data:d.data,
							multi:true,
							clickCallback:function(event,treeId,treeNode){
								if(treeNode.disabled){
									return false;
								}
								$("#hy").val(treeNode.name);
								$("#hy").attr("tid",treeNode.id);
								treeSelectObj.hide();
							}
						});
					}
				})
			}
		});
	};
	/*目录修改*/
	var catalogModify = function(){
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		if(params.state==2){
			base.requestTip({position:"center"}).error("待审核状态不允许修改！")
			return;
		}
		base.ajax({ 
            url:$.path+"/api/resource/beforeUpdateCheckStatue?resourceId="+params.id, 
            type:"post", 
            success:function(result){ 
               if(result.data){ 
				  base.ajax({
					url:$.path+"/api/resCatalog/findResourceByID?id="+params.id,
					type:"get",
					success:function(d){
						switch(d.data.resType){
							case '1':
							catalogData(params.id,true)
							break;
						case '2':
							catalogFile(params.id,true);
							break;
						case '3':
							catalogApi(params.id,true);
							break;
						}
					}
				})
               }else{ 
                  base.requestTip({position:"center"}).error("请先停掉该服务任务"); 
               } 
            } 
         }); 
		
	}
	/**批量删除**/
	var gridDelete = function(option,num){
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		if( levelNum=="1"){
			if(params.isAuditorCompany == false){
				base.requestTip({position:"center"}).error("没有操作权限！")
				return false;
			}
//			base.ajax({
//				url:"/api/resCatalog/getResCatalogListByCatalogId",
//				type:"get",
//				params:"",
//				success:function(d){
//					if(d.data.content.length>0){
//						return false
//					}
//				}
//			})
		}else{
			var auditEquipment = params.equipment;
			var equipmentIdentify = JSON.parse($.cookie("dssgUserInfo")).loginUserProfileDTO.currentEquipment.equipmentIdentify;
			if(auditEquipment != equipmentIdentify){
				base.requestTip({position:"center"}).error("没有操作权限！")
				return false;
			}
			if(params.state == 5){
				base.requestTip({position:"center"}).error("已发布不能删除！")
				return false;
			}
		}
		/**删除前先弹窗确认是否删除**/
		var url = option.url;
		var type = option.type?option.type:'post';
		var params = option.params?option.params:null;
		var callback = option.callback?option.callback:null;
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:url,
					params:params,
					type:type,
					callback:callback
				});
			}
		}); 
	};
	/*提交*/	
	var dataSubmit = function(){
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		var auditEquipment = params.equipment;
		var equipmentIdentify = JSON.parse($.cookie("dssgUserInfo")).loginUserProfileDTO.currentEquipment.equipmentIdentify;
		if(auditEquipment != equipmentIdentify){
			base.requestTip({position:"center"}).error("当前设备没有操作权限！")
			return false;
		}
		/**提交前先弹窗确认是否提交**/
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		if(params.state!=1){
			base.requestTip({position:"center"}).error("资源非提交状态！")
			return false
		};
		var checkResName = [];
		checkResName.push(params.resName);
		checkResName.push(params.resCode);
		checkResName.push(params.resEname);
		var isResname = true;
		/*提交前重名验证*/
		$.each(checkResName,function(i,o){
			base.ajax({
				url:$.path+"/api/resCatalog/checkResNameOrCode?nameOrCode="+o+"&type="+(i+1)+"&catalogId="+treeKey.id,
				type:"get",
				success:function(d){
					if(d.data > 1){
						switch(i){
							case 0:
								base.requestTip({position:"center"}).error("资源名称同名");
								break;
							case 1:
								base.requestTip({position:"center"}).error("资源编码同名");
								break;
							case 2:
								base.requestTip({position:"center"}).error("资源英文名同名");
						}
						isResname = false;
					}
				}
			})
		})
		if(isResname){
			base.confirm({
				label:"提交",
				text:"确认是否提交",
				confirmCallback:function(){
					common.submit({
						url:$.path+"/api/resCatalog/referResource",
						params:params,
						callback:function(d){
							if(d.message=="success"){
								d.message = "提交成功";
							}else{
								d.message = "提交失败";										
							}
							common.search(grid);
						}
					});
				}
			});
		} 
	};
	/*审核编目*/
	var dataExamine = function(){
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		var auditEquipment = params.auditEquipment;
		var equipmentIdentify = JSON.parse($.cookie("dssgUserInfo")).loginUserProfileDTO.currentEquipment.equipmentIdentify;
		if(auditEquipment != equipmentIdentify){
			base.requestTip({position:"center"}).error("提示当前设备没有操作权限！")
			return false;
		}
		if(params.state!=2){
			base.requestTip({position:"center"}).error("资源非待审核状态！")
			return false;
		}
		modal = base.modal({
			width:900,
			height:450,
			label:"审核",
			url:"../html/catalogManage/catalogManage_examine_step.html",
			callback:function(){
				setStepsExamine();
				$("#resType").change(function(){
					modal.hide();
					stepTypeChange();
				})
			},
			buttons:[
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						$('.modal-body').mCustomScrollbar("scrollTo",'top',{scrollInertia:0});
						steps.back();
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
									var isPass = base.form.validate({form:$("#form1"),checkAll:true});
									return isPass;
								break;
								
								case 1:
									var isPass = base.form.validate({form:$("#form2"),checkAll:true});
									return isPass;
								break;
								
								case 2:
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
						var data = {};
						data.result = $("#step_table .state").val();
						data.reviewDesc = $("#step_table .examine").val();
						data.resourceId = $(".ui-grid .cb:checked").val();
						base.ajax({
							url:$.path+"/api/resCatalog/auditResource",
							type:"post",
							params:data,
							async:false,
							success:function(data){
								if(data.success){
									base.requestTip({position:"center"}).success("审核成功");
								}
								common.search(grid);
								modal.hide();
							}
						});
					}
				},
				{
					label:"关闭",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
					}
				}
			]
		});
	}
	/**新建目录**/ 
	var gridAdd = function(){
		$("#button_type").val("");
		if(!treeKey.domainMember){
			base.requestTip({position:"center"}).error("没有操作权限")
			return false;
		}
		var modal = base.modal({
			width:700,
			height:270,
			label:"新建",
			url:"../html/catalogManage/catalogManage_add.html",
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
						if($(".checkNameCode").attr("name") && $(".checkNameCode").attr("name") !=""){
							return base.requestTip({position:"center"}).error("目录名称重复")
						}
						if($(".checkNameCode").attr("code") && $(".checkNameCode").attr("code") !=""){
							return base.requestTip({position:"center"}).error("目录编码重复")
						}
						/**2.保存**/
						var params = base.form.getParams($("#form"));
							params.resDomainId = treeKey.id;
							params.auditorEquipmentId = $("#hy").attr("tid");
						if(params){
							common.submit({
								url:$.path+"/api/catalog/saveCatalogInfo",
								params:params,
								type:"post",
								async:false,
								callback:function(d){
									if(d.message=="success"){
										d.message = "新增成功";
									}else{
										d.message = "新增失败";										
									}
									setTreebar();
									common.search(grid);
								}
							})
						}
						/**3.关闭模态窗**/
						modal.hide();
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
				check();
				var loginInfo = common.getCookis()
				$("#hy").val(loginInfo.loginUserProfileDTO.currentEquipment.name);
				$("#hy").attr("tid",loginInfo.loginUserProfileDTO.currentEquipment.id);
				$(".modal #auditorUserName").val(loginInfo.loginUserProfileDTO.currentEquipment.contacts);
				$(".modal #telphone").val(loginInfo.loginUserProfileDTO.currentEquipment.telphone);
				$.ajax({
					url:$.path+"/api/catalog/findDomainResByDomainIdEquipmentTree?domainId="+treeKey.id,
					type:"get",
					xhrFields: {withCredentials: true},
					success:function(d){
						var treeSelectObj = base.form.treeSelect({
							container:$("#hy"),
							data:d.data,
							multi:true,
							clickCallback:function(event,treeId,treeNode){
								if(treeNode.disabled){
									return false;
								}
								$("#hy").val(treeNode.name);
								$("#hy").attr("tid",treeNode.id);
								treeSelectObj.hide();
								base.ajax({
									url:$.path+"/api/syselocalquipment/findSysEquipmentByIdInfo?id="+treeNode.id,
									type:"get",
									success:function(d){
										$(".modal #auditorUserName").val(d.data.contacts);
										$(".modal #telphone").val(d.data.telphone);	
									}
								})
							}
						});
					}
				})
			}
		});
	};
	/*查看流程*/
	var flowsheet = function(){ 
		modal = base.modal({
			width:900,
			height:450,
			label:"编目",
			url:"../html/catalogManage/catalogManage_flow_step.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(obj){
						modal.hide();
					}
				}
			],
			callback:function(){
				setSteps1();
			},
		});
	}
	/*编目数据库类型*/
	var catalogData = function(ids,modify){
		modal = base.modal({
			width:1100,
			height:500,
			label:modify ? "编目修改" :"编目",
			url:"../html/catalogManage/catalogManage_database_step.html",
			callback:function(){
				setSteps(ids);
				$("#resType").change(function(){
					modal.hide();
					stepTypeChange();
				})
				if(ids){
					$(".check_id").val(ids);
				}
			},
			buttons:[ 
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						steps.back();
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
									var isPass = base.form.validate({form:$("#form1"),checkAll:true});
									return isPass;
								break;
								
								case 1:
									var isPass = base.form.validate({form:$("#form2"),checkAll:true});
									if(isPass){
										dataObject = $.extend(base.form.getParams($("#form1")),base.form.getParams($("#form2")))
//										dataObject.themeName=$("#themeName").val();
										dataObject.themeType=$("#themeName").attr("tid");
//										dataObject.industryTypeName=$("#industryTypeName").val();
										dataObject.industryType=$("#industryTypeName").attr("tid");
										dataObject.catalogId = treeKey.id;
									}
									return isPass;
								break;
								
								case 2:
									var dbJson = [];
									var dataIsPass = true;
									var ifHaveKey = false;
									$("#step_table tbody tr").each(function(i,o){
										var obj={};
										obj.name=$.trim($(o).find(".name").val());
										obj.ename=$.trim($(o).find(".ename").val());
										obj.code=$.trim($(o).find(".code").val());
										obj.type=$(o).find(".dataType").val()?$(o).find(".dataType").val():common.typeSelectText($(o).find(".dataType").text());
										obj.length=$(o).find(".dataLength").val()?$(o).find(".dataLength").val():$(o).find(".dataLength").text();
										
										if($(o).find(".optData").val()!=0 && $(o).find(".optData").val()!=1){
											obj.dataCode=$(o).find(".optData").val();
											obj.isData=true;
										}else{obj.isData=false;}
										if($(o).find(".primary").hasClass("active")){
											obj.pk=true;
											ifHaveKey = true;
										}else{obj.pk=false;}
										if(obj.name==undefined || obj.name.length==0 || obj.ename.length==0 || obj.code.length==0){
											dataIsPass = false;
											base.requestTip({position:"center"}).error("名称或编码不能为空！");
											return;
										}
										obj.ename = "res_"+obj.ename;
										var ex = /^\w+$/;
										if(!ex.test(obj.ename)){
											dataIsPass = false;
											base.requestTip({position:"center"}).error("英文名称不符合！");
											return;
										}
										var ex = /^[0-9]*$/;
										if(obj.length!="--"){
											if(!ex.test(obj.length) || obj.length.length==0){
												dataIsPass = false;
												base.requestTip({position:"center"}).error("数据项长度为数字，且不为空！");
												return;
											}
										}else{
											obj.length="";
										}
										dbJson.push(obj);
									})
									dataObject.dbJson=dbJson;
									
									setStepExhibition();
									setStepDbExhibition();
									for(var i=0;i<dbJson.length;i++){
										for(var k=i+1;k<dbJson.length;k++){
											if(dbJson[i].name==dbJson[k].name||dbJson[i].ename==dbJson[k].ename||dbJson[i].code==dbJson[k].code){
												base.requestTip({position:"center"}).error("名称或编码重复，请修改！");
												dataIsPass = false;
												return;
											}
										}
									}
									if(!ifHaveKey && dataIsPass){
										dataIsPass=false;
										base.confirm({
											text:"主键未设置，只提供全量交换，是否继续？",
											confirmCallback:function(){
												steps.forward();
											}
										});
									}
									return dataIsPass;
								break;
								
							}
						});
					}
				},
				/*{
					label:"保存",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							base.ajax({
								url:$.path+"/api/resCatalog/updateResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){		
									common.search(grid);
								}
							});
						}else{
							base.ajax({
								url:$.path+"/api/resCatalog/saveResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){		
									common.search(grid);
								}
							});
						}
					}
				},*/
				{
					label:"保存并提交",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							var isPass = checkResName(true);
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/updateReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){
										setTreebar("save")
										common.search(grid);
									}
								});
							}
						}else{
							var isPass = checkResName();
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/saveReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){	
										setTreebar("save")
										common.search(grid);
									}
								});
							}
						}
					}
				}
			]
		});
	}
	/*编目文件类型*/
	var catalogFile = function(ids){
		modal = base.modal({
			width:1100,
			height:500,
			label:"编目",
			url:"../html/catalogManage/catalogManage_file_step.html",
			callback:function(){
				setStepsFile();
				$("#resType").change(function(){
					modal.hide();
					stepTypeChange();
				})
				if(ids){
					$(".check_id").val(ids);
				}
			},
			buttons:[
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						steps.back();
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
									var isPass = base.form.validate({form:$("#form1"),checkAll:true});
									return isPass;
								break;
								
								case 1:
									var isPass = base.form.validate({form:$("#form2"),checkAll:true});
									if(isPass){
										dataObject = $.extend(base.form.getParams($("#form1")),base.form.getParams($("#form2")))
//										dataObject.themeName=$("#themeName").val();
										dataObject.themeType=$("#themeName").attr("tid");
//										dataObject.industryTypeName=$("#industryTypeName").val();
										dataObject.industryType=$("#industryTypeName").attr("tid");
										dataObject.catalogId = treeKey.id;
									}
									setStepExhibition();
									return isPass;
								break;
								
								case 2:
									return true;
								break;
								
							}
						});
					}
				},
				/*{
					label:"保存",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							base.ajax({
								url:$.path+"/api/resCatalog/updateResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){		
									common.search(grid);
								}
							});
						}else{
							base.ajax({
								url:$.path+"/api/resCatalog/saveResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){			
									common.search(grid);
									
								}
							});
						}
					}
				},*/
				{
					label:"保存并提交",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							var isPass = checkResName(true);
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/updateReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){
										setTreebar("save")
										common.search(grid);
									}
								});
							}
						}else{
							var isPass = checkResName();
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/saveReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){	
										setTreebar("save")
										common.search(grid);
									}
								});
							}
						}
					}
				}
			]
		});
	}
  	/*编目api*/
	var catalogApi = function(ids){ 
		modal = base.modal({
			width:1100,
			height:500,
			label:"编目",
			url:"../html/catalogManage/catalogManage_api_step.html",
			callback:function(){
				setStepsApi();
				$("#resType").change(function(){
					modal.hide();
					stepTypeChange();
				})
				if(ids){
					$(".check_id").val(ids);
				}
			},
			buttons:[
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						steps.back();
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
							var ex = /^[a-zA-Z]+$/;
							switch(step){
								case 0:
									var isPass = base.form.validate({form:$("#form1"),checkAll:true});
									return isPass;
								break;
								
								case 1:
									var isPass = base.form.validate({form:$("#form2"),checkAll:true});
									if(isPass){
										dataObject = $.extend(base.form.getParams($("#form1")),base.form.getParams($("#form2")))
//										dataObject.themeName=$("#themeName").val();
										dataObject.themeType=$("#themeName").attr("tid");
//										dataObject.industryTypeName=$("#industryTypeName").val();
										dataObject.industryType=$("#industryTypeName").attr("tid");
										dataObject.catalogId = treeKey.id;
									}
									return isPass;
								break;
								case 2:
									var inParameterJson = [];
									var inParameterPass = true;
									var temInNameArr=[];
									$("#step_tableIn tbody tr").each(function(i,o){
										var obj={};
										obj.name=$(o).find(".name").val();
										if($.inArray(obj.name,temInNameArr)<0){											
											temInNameArr.push(obj.name)
										}else{
											base.requestTip({position:"center"}).error("参数名称不能重复！")
											return inParameterPass = false;
										}
										obj.example=$(o).find(".example").val();
										obj.mandatory=$(o).find(".mandatory").val();
										obj.desc = $(o).find(".desc").val();
										if(!ex.test(obj.name)){
											base.requestTip({position:"center"}).error("参数名称为英文，且不为空！")
											inParameterPass = false;
										}
										if(obj.name || obj.example || obj.mandatory || obj.desc){
											inParameterJson.push(obj);
										}
									})
									
									dataObject.inParameterJson=inParameterJson;
									return inParameterPass;
								break;
								case 3:
									var outParameterJson = [];
									var outParameterPass = true;
									var temOutNameArr=[];
									$("#step_tableOut tbody tr").each(function(i,o){
										var obj={};
										obj.name=$(o).find(".name").val();
										if($.inArray(obj.name,temOutNameArr)<0){											
											temOutNameArr.push(obj.name)
										}else{
											base.requestTip({position:"center"}).error("参数名称不能重复！")
											return outParameterPass = false;
										}
										obj.example=$(o).find(".example").val();
										obj.notNull=$(o).find(".notNull").val();
										obj.desc = $(o).find(".desc").val();
										obj.type = $(o).find(".type").val();
										if(!ex.test(obj.name)){
											base.requestTip({position:"center"}).error("参数名称为英文，且不为空！")
											outParameterPass = false;
										}
										if(obj.name || obj.example || obj.notNull || obj.desc || obj.type){
											outParameterJson.push(obj);
										}
									})
									if(dataObject.apiType == "local"){
										if(outParameterJson.length == 0){
											base.requestTip({position:"center"}).error("本地数据库类型资源，输出参数不能为空！")
											outParameterPass = false;
										}
									}
									dataObject.outParameterJson=outParameterJson;
									setStepExhibition();
									setStepApiExhibition();
									return outParameterPass;
								break;
								case 4:
									return true;
								break;
							}
						});
					}
				},
				/*{
					label:"保存",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							base.ajax({
								url:$.path+"/api/resCatalog/updateResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){		
									common.search(grid);
								}
							});
						}else{
							base.ajax({
								url:$.path+"/api/resCatalog/saveResourceCatalog",
								type:"post",
								params:dataObject,
								success:function(data){			
									common.search(grid);
								}
							});
						}
					}
				},*/
				{
					label:"保存并提交",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
						var eqID = $(".check_id").val();
						if(eqID){
							dataObject.id = eqID;
							var isPass = checkResName(true);
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/updateReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){
										setTreebar("save")
										common.search(grid);
									}
								});
							}
						}else{
							var isPass = checkResName();
							if(isPass){
								base.ajax({
									url:$.path+"/api/resCatalog/saveReferResourceCatalog",
									type:"post",
									params:dataObject,
									success:function(data){
										setTreebar("save")
										common.search(grid);
									}
								});
							}
							
						}
					}
				}
			]
		});
	}
	var stepTypeChange = function(){
		var checkId = $(".check_id").val();
		switch ($("#resType").val()){
			case '1':
				catalogData(checkId)
				break;
			case '2':
				catalogFile(checkId);
				break;
			case '3':
				catalogApi(checkId);
				break;
		}
	}
	/**设置第三部的表格**/
	var setStepGrid = function(ids){ 
		var that = {};
		that.grid = null;
		that.count = 0;
		that.gridContainer = $("#step_table");
		that.gridOption =  {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			bPaginate:false,
			bInfo:false,
			drawCallback:function(){
				that.gridContainer.find("tbody").unbind("click").on("click",".delete",function(){
//					var delCount = $(this).parents("tbody").find("tr").index($(this).parents("tr"));
//					if(tableObject.length){
//						tableObject.splice(delCount,1);
//					}
					that.grid.deleteRow(this);
					that.setKeyActive();
				});
			}
		};
		that.init = function(){
			
			that.grid = base.datatables({
				container:that.gridContainer,
				option:that.gridOption
			});
			
			that.setAddRow();
			that.grid.addRow(that.getRowData());
		};
		that.setAddRow = function(){
			$('#addRow').on('click', function(){
				that.grid.addRow(that.getRowData());
				that.setKeyActive();
			});
		};
		that.setDeleteRow = function(){
			that.gridContainer.find("tbody").on("click",".delete",function(){
				that.grid.deleteRow(this);
				that.setKeyActive();
			});
		};
		that.getRowData = function(){
	        var data = [
	            "<input type='text' name='name"+that.count+"' class='form-control name'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control ename'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control code'/>",
	            "<select class='form-control dataType'><option value='12'>文本</option><option value='91'>日期</option><option value='3'>数字</option><option value='93'>时间</option><option value='4'>整型</option><option value='2004'>大字段</option></select>",
	            "<input type='text' name='name"+that.count+"' class='form-control dataLength'/>",
	            "<select class='form-control optData'><option value='0'>默认填写</option><option value='1'>选择数据元</option></select>",
	            "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button><button class='btn btn-link primary key' title='主键'><i class='fa fa-key'></i></button></div>"
	        ];
	        that.count++;
	        return data;
		};
		that.setKeyActive = function(){
			that.gridContainer.find("tbody").on("click",".primary",function(){
				$(this).toggleClass("active");
			});
		}
		that.setOptData = function(){
			$("#step_table").on("change",".optData",function(){
				var self=this
				var trCount = $(this).parents("tbody").find("tr").index($(this).parents("tr"));
				var name = $("#step_table tbody tr:eq("+trCount+") .name").val();
				var englishName = $("#step_table tbody tr:eq("+trCount+") .ename").val();
				var code = $("#step_table tbody tr:eq("+trCount+") .code").val();
				var dataType = $("#step_table tbody tr:eq("+trCount+") .dataType").text();
				var dataLength = $("#step_table tbody tr:eq("+trCount+") .dataLength").text();
				if($(this).val()==1){
					var modal = base.modal({
						width:1100,
						height:500,
						id:"checkDataModal",					
						label:"选择数据元",
						modalOption:{"backdrop":"static","keyboard":false},
						url:"../html/catalogManage/optData.html",
						buttons:[
							{
								label:"确定",
								cls:"btn btn-info back",
								clickEvent:function(obj){
									var params = base.getChecks("cbs").val;
									if(params.length == 0){
										base.requestTip({position:"center"}).error("请至少选择一条数据！");
										return false;
									}
									var dataInfo = [];
									$(".cbs:checked").each(function(){
										dataInfo.push(JSON.parse($(this).attr("cid")));
									})
//									if(name){
//										dataInfo[0].name=name;
//									}
//									if(englishName){
//										dataInfo[0].englishName=englishName;
//									}
//									if(code){
//										dataInfo[0].code1=code;
//									}
//									tableObject.splice(trCount,1);
//									tableObject.splice(trCount,0,dataInfo[0]);
									$.each(dataInfo, function(i,o) {
										var obj = ''+
										'<td>'+
										  '<input type="text" class="form-control name" value="'+o.name+'"></td>'+
										'<td>'+
										  '<input type="text" class="form-control ename" value="'+o.englishName+'"></td>'+
										'<td>'+
										  '<input type="text" class="form-control code" value="'+(function(){return o.code1?o.code1:o.code})()+'"></td>'+
										'<td class="dataType">'+common.typeSelect(o.dataType)+'</td>'+
										'<td class="dataLength">'+(function(){return o.dataLength?o.dataLength:"--"})()+'</td>'+
										'<td>'+ 
										  '<select class="form-control optData">'+
										    '<option value="'+o.code+'">'+o.code+'</option>'+
										    '<option value="0">默认填写</option>'+
										    '<option value="1">选择数据元</option></select>'+
										'</td>'+
										'<td>'+
										  '<div style="text-align:center">'+
										    '<button class="btn btn-link delete" title="删除">'+
										      '<i class="fa fa-trash-o"></i>'+
										    '</button>'+
										    '<button class="btn btn-link primary key" title="主键">'+
										      '<i class="fa fa-key"></i>'+
										    '</button>'+
										  '</div>'+
										'</td>'
										if(i==0){
											$("#step_table tbody tr:eq("+trCount+")").empty().append(obj);
											that.setKeyActive();
										}else{
											that.grid.addRow(that.getRowData());
//											tableObject.splice(trCount+i,0,dataInfo[i]);
											$("#step_table tbody tr:last").empty().append(obj);	
										}
									});
									that.setDeleteRow();
									that.setKeyActive();
									modal.hide();
								}
							},
							{
								label:"关闭",
								cls:"btn btn-info back",
								clickEvent:function(obj){
									$(self).find("option:first").prop("selected", 'selected')
									modal.hide();
								}
							}
						],
						callback:function(){
							$("#checkDataModal .fa-remove").remove();
						},
					});
				}else if($(this).val()==0){
						var obj = ''+
							'<td>'+
							  '<input type="text" class="form-control name" value="'+name+'"></td>'+
							'<td>'+
							  '<input type="text" class="form-control ename" value="'+englishName+'"></td>'+
							'<td>'+
							  '<input type="text" class="form-control code" value="'+code+'"></td>'+
							'<td><select class="form-control dataType"><option value="91">日期</option><option value="12">文本</option><option value="3">数字</option><option value="93">时间</option><option value="4">整型</option><option value="2004">大字段</option></select></td>'+
							'<td>'+
								(function(){
									if(dataLength=="--"){
										return "<div class='dataLength'>--</div>";
									}
									return '<input type="text" class="form-control dataLength" value="'+dataLength+'">'
								})()+
							  
							'</td><td>'+
							  '<select class="form-control optData">'+
							    '<option value="0">默认填写</option>'+
							    '<option value="1">选择数据元</option></select>'+
							'</td>'+
							'<td>'+
							  '<div style="text-align:center">'+
							    '<button class="btn btn-link delete" title="删除">'+
							      '<i class="fa fa-trash-o"></i>'+
							    '</button>'+
							    '<button class="btn btn-link primary key" title="主键">'+
							      '<i class="fa fa-key"></i>'+
							    '</button>'+
							  '</div>'+
							'</td>'
							$("#step_table tbody tr:eq("+trCount+")").empty().append(obj);
							$("#step_table tbody tr:eq("+trCount+")").find(".dataType").val(common.typeSelectText(dataType));
				}
			})
			$("#step_table").on("change",".dataType",function(){
				var self = this;
				var dTVal = $(this).val();
				if(dTVal==12 || dTVal==3 || dTVal==4){
					$(self).parents('tr').children("td:eq(4)").html('<input type="text" class="form-control dataLength">');
				}else{
					$(self).parents('tr').children("td:eq(4)").html("<div class='dataLength'>--</div>");
				}
			})
		};
		that.setModify = function(){
			if(ids){
				base.ajax({
					url:$.path+"/api/resCatalog/findResourceByID?id="+ids,
					type:"get",
					success:function(d){
						var params = d.data;
						var isDisable = false;
						delete params.resType;
						base.form.init(params,$("#form1"));
						base.form.init(params,$("#form2"));
						$("#themeName").val(params.themeTypeName);
						$("#themeName").attr("tid",params.themeType);
						$("#industryTypeName").val(params.industryTypeName);
						$("#industryTypeName").attr("tid",params.industryType);
						
						if(params.filePath){//图片
							$(".ui-page-headingImage").attr("src",$.path1+params.filePath)
						}else if(params.pictureUrl){
							$(".ui-page-headingImage").attr("src",$.path1+params.pictureUrl)
						}else{
							$(".ui-page-headingImage").attr("src","../images/default.png")
						}
						
//						var filePath = params.filePath?params.filePath:params.pictureUrl;
//						$(".ui-page-headingImage").attr("src",$.path1+filePath);
						if(params.realFileName){
							$("#fileName").html(params.realFileName+"<i class='fa fa fa-trash-o fileNameRemove'></i>");
						}
						if(params.state==5 || params.state == 3){
							var data = ['linkman','resType','catalogUnit','phone','apiType','resName','resEname','resCode','resLevel','ui-treeSelect']
							common.disableInput(data);
							isDisable = true;
						}
						var dbJson = JSON.parse(d.data.dbJson)
						$.each(dbJson, function(i,o) {
							var obj = null;
							if(o.isData){
								if(isDisable){
									obj = ''+
									'<td>'+
									  '<input type="text" class="form-control name" value="'+o.name+'" disabled="disabled"></td>'+
									'<td>'+
									  '<input disabled="disabled" type="text" class="form-control ename" value="'+(function(){return o.ename.substring(4)})()+'"></td>'+
									'<td>'+
									  '<input type="text" class="form-control code" value="'+o.code+'" disabled="disabled"></td>'+
									'<td class="dataType">'+common.typeSelect(o.type)+'</td>'+
									'<td class="dataLength">'+(function(){return o.length?o.length:"--"})()+'</td>'+
									'<td>'+ 
									  '<select class="form-control optData" disabled="disabled">'+
									    '<option value="'+o.code+'">'+o.code+'</option>'+
									    '<option value="0">默认填写</option>'+
									    '<option value="1">选择数据元</option></select>'+
									'</td>'+
									'<td>'+
									  '<div style="text-align:center">'+
									    '<button class="btn btn-link delete" title="删除" disabled="disabled">'+
									      '<i class="fa fa-trash-o"></i>'+
									    '</button>'+
									    '<button class="btn btn-link primary key " title="主键" disabled="disabled">'+
									      '<i class="fa fa-key"></i>'+
									    '</button>'+
									  '</div>'+
									'</td>'
								}else{
									obj = ''+
									'<td>'+
									  '<input type="text" class="form-control name" value="'+o.name+'"></td>'+
									'<td>'+
									  '<input type="text" class="form-control ename" value="'+(function(){return o.ename.substring(4)})()+'"></td>'+
									'<td>'+
									  '<input type="text" class="form-control code" value="'+o.code+'"></td>'+
									'<td class="dataType">'+common.typeSelect(o.type)+'</td>'+
									'<td class="dataLength">'+(function(){return o.length?o.length:"--"})()+'</td>'+
									'<td>'+ 
									  '<select class="form-control optData">'+
									    '<option value="'+o.code+'">'+o.code+'</option>'+
									    '<option value="0">默认填写</option>'+
									    '<option value="1">选择数据元</option></select>'+
									'</td>'+
									'<td>'+
									  '<div style="text-align:center">'+
									    '<button class="btn btn-link delete" title="删除">'+
									      '<i class="fa fa-trash-o"></i>'+
									    '</button>'+
									    '<button class="btn btn-link primary key " title="主键">'+
									      '<i class="fa fa-key"></i>'+
									    '</button>'+
									  '</div>'+
									'</td>'
								}
							}else{
								if(isDisable){
									obj = ''+
									'<td>'+
									  '<input type="text" class="form-control name" value="'+o.name+'" disabled="disabled"></td>'+
									'<td>'+
									  '<input disabled="disabled" type="text" class="form-control ename" value="'+(function(){return o.ename.substring(4)})()+'"></td>'+
									'<td>'+
									  '<input disabled="disabled" type="text" class="form-control code" value="'+o.code+'"></td>'+
									'<td><select class="form-control dataType" disabled="disabled"><option value="12">文本</option><option value="91">日期</option><option value="3">数字</option><option value="93">时间</option><option value="4">整型</option><option value="2004">大字段</option></select></td>'+
									'<td>'+
										(function(){
											if(!o.length){
												return "<div class='dataLength'>--</div>";
											}else{
												return '<input type="text" disabled="disabled" class="form-control dataLength" value="'+o.length+'">'
											}
										})()+
									  
									'</td><td>'+
									  '<select class="form-control optData" disabled="disabled">'+
									    '<option value="0">默认填写</option>'+
									    '<option value="1">选择数据元</option></select>'+
									'</td>'+
									'<td>'+
									  '<div style="text-align:center">'+
									    '<button class="btn btn-link delete" title="删除" disabled="disabled">'+
									      '<i class="fa fa-trash-o"></i>'+
									    '</button>'+
									    '<button class="btn btn-link primary key" title="主键" disabled="disabled">'+
									      '<i class="fa fa-key"></i>'+
									    '</button>'+
									  '</div>'+
									'</td>'
								}else{
									obj = ''+
									'<td>'+
									  '<input type="text" class="form-control name" value="'+o.name+'"></td>'+
									'<td>'+
									  '<input type="text" class="form-control ename" value="'+(function(){return o.ename.substring(4)})()+'"></td>'+
									'<td>'+
									  '<input type="text" class="form-control code" value="'+o.code+'"></td>'+
									'<td><select class="form-control dataType"><option value="12">文本</option><option value="91">日期</option><option value="3">数字</option><option value="93">时间</option><option value="4">整型</option><option value="2004">大字段</option></select></td>'+
									'<td>'+
										(function(){
											if(!o.length){
												return "<div class='dataLength'>--</div>";
											}else{
												return '<input type="text" class="form-control dataLength" value="'+o.length+'">'
											}
										})()+
									  
									'</td><td>'+
									  '<select class="form-control optData">'+
									    '<option value="0">默认填写</option>'+
									    '<option value="1">选择数据元</option></select>'+
									'</td>'+
									'<td>'+
									  '<div style="text-align:center">'+
									    '<button class="btn btn-link delete" title="删除">'+
									      '<i class="fa fa-trash-o"></i>'+
									    '</button>'+
									    '<button class="btn btn-link primary key" title="主键">'+
									      '<i class="fa fa-key"></i>'+
									    '</button>'+
									  '</div>'+
									'</td>'
								}
							}
							if(i==0){
								$("#step_table tbody tr:eq(0)").empty().append(obj);
								$("#step_table tbody tr:last").find(".dataType").val(o.type)
							}else{
								that.grid.addRow(that.getRowData());
								$("#step_table tbody tr:last").empty().append(obj);
								$("#step_table tbody tr:last").find(".dataType").val(o.type)
								that.setKeyActive()
							}
							if(o.pk){
								$("#step_table tbody tr:last .key").addClass("active");
							}
						});
					}
				})
			}
			
		}
		that.init();
		that.setOptData();
		that.setKeyActive();
		that.setModify();
	};
	/**设置上传和树input**/
	var setUpload = function(){ 
		var id = $(".check_id").val();
		//主题分类
		$.ajax({
			url:$.path+"/api/sysBussinessDictionary/findDictionaryTreeByType",
			type:"post",
			data:JSON.stringify({name:"themeType",type:1}),
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			success:function(d){
				if(!id){
					$("#themeName").val(d.data[0].name);
					$("#themeName").attr("tid",d.data[0].id);
				}
				var treeSelectObj = base.form.treeSelect({
					container:$("#themeName"),
					data:d.data,
					clickCallback:function(event,treeId,treeNode){
						if(treeNode.disabled){
							return false;
						}
						$("#themeName").val(treeNode.name);
						$("#themeName").attr("tid",treeNode.id);
						treeSelectObj.hide();
					}
				});
			}
		})
		//行业分类的
		$.ajax({
			url:$.path+"/api/sysBussinessDictionary/findDictionaryTreeByType",
			type:"post",
			data:JSON.stringify({name:"industryType",type:2}),
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			success:function(d){
				if(!id){
					$("#industryTypeName").val(d.data[0].name);
					$("#industryTypeName").attr("tid",d.data[0].id);
				}
				var treeSelectObj =base.form.treeSelect({
					container:$("#industryTypeName"),
					data:d.data,
					clickCallback:function(event,treeId,treeNode){
						if(treeNode.disabled){
							return false;
						}
						$("#industryTypeName").val(treeNode.name);
						$("#industryTypeName").attr("tid",treeNode.id);
						treeSelectObj.hide();
					}
				});
			}
		})
		$("#imageBtn").on("click",function(){
			$("#file1").replaceWith($("#file1").val('').clone(true));
			$("#file1").trigger("click");
		});
		$("#file1").on("change",function(){
			if($("#fileName").html()){
				base.requestTip({position:"center"}).error("只能上传一个文件！");
				return;
			}
			
			$("#fileName").html($(this).val()+"<i class='fa fa fa-trash-o fileNameRemove'></i>");
			var requestTip = base.requestTip({position:"center"});
			var url1=new FormData($('#uploadForm1')[0]);
			//校验上传的图片格式
			var bool = base.form.validateFileExtname($("#uploadForm1 #file1"),"jpg,png,jpeg");
			if(!bool){base.requestTip({position:"center"}).error("图片格式不对");$("#fileName").empty(); return}
			
			$.ajax({
			    url: $.path+'/api/fileUpload/uploadFile',
			    type: 'POST',
			    cache: false,
			    data: url1,
			    processData: false,
			    contentType: false,
			    xhrFields: {withCredentials: true},
			    success:function(d){
//			    	requestTip.success(d.message);
			    	var fileUrl = JSON.parse(d).filesObj[0].filePath;
			    	$("#attachmentId").val(JSON.parse(d).filesObj[0].fid)
			    	if(fileUrl){
			    		$(".ui-page-headingImage").attr("src",$.path+"/dssg/"+fileUrl);
			    	}
			    }
			})
		});
		$("#fileName").on("click",".fileNameRemove",function(){
			$(this).parent().empty();
			$("#attachmentId").val("");
		})
		var loginInfo = common.getCookis();
		$(".linkMan").val(loginInfo.loginUserProfileDTO.currentEquipment.contacts);
		$(".phone").val(loginInfo.loginUserProfileDTO.currentEquipment.telphone);
		
		/*资源名称 编码 英文名同名校验*/
		$(".identicalName").blur(function(){
			var self = this;
			if(!$(self).val().length){
				return;
			}
			var params = base.getChecks("cb").val;
			if(params && params.length>0){
				var state = JSON.parse(base.getCR("cb").attr("cid")).state;
				var code = JSON.parse(base.getCR("cb").attr("cid")).resCode;
				var name = JSON.parse(base.getCR("cb").attr("cid")).resName;
				var resEname = JSON.parse(base.getCR("cb").attr("cid")).resEname;
			}
			
			var i = params.length==1?1:0;
			base.ajax({
				url:$.path+"/api/resCatalog/checkResNameOrCode?nameOrCode="+$(self).val()+"&type="+$(self).attr("data-type")+"&catalogId="+treeKey.id,
				type:"get",
				success:function(d){
					if(d.data > i || (d.data=="1" && i=="1")){
						if($(self).attr("data-type")=="1"){
							if(name ==$(self).val()){
								return 
							}else{
								base.requestTip({position:"center"}).error("资源名称同名");
							}
						}
						if($(self).attr("data-type")=="2"){
							if(code ==$(self).val()){
								return 
							}else{
								base.requestTip({position:"center"}).error("资源编码同名");
							}
						}
						if($(self).attr("data-type")=="3"){
							if(resEname ==$(self).val()){
								return 
							}else{
								base.requestTip({position:"center"}).error("资源英文名同名");
							}
						}
						$(self).focus();
					}
				}
			})
		})
	};
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	/**设置数据库步骤插件**/
	var setSteps = function(ids){ 
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"编写项目申请","contentToggle":"#content1"},
				{"label":"填写元数据","contentToggle":"#content2","callback":function(){setUpload();}},
				{"label":"编辑数据项","contentToggle":"#content3","callback":function(){setStepGrid(ids);}},
				{"label":"编目预览","contentToggle":"#content4","callback":function(){}}
			],
			buttonGroupToggle:modal.modalFooter
		});
	};
	/*设置查看流程步骤*/
	var setSteps1 = function(){
		var step = 0;
		var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
		switch(params.state){
			case '1':
				step = 1;
				break;
			case '2':
				step = 2;
				break;
			default:
				step = 3;
		}
		steps = base.steps({
			container:$("#ui-steps"),
			data:[
				{"label":"资源编目","contentToggle":"#content1"},
				{"label":"提交审核","contentToggle":"#content2","callback":function(){}},
				{"label":"编目审核","contentToggle":"#content3","callback":function(){}},
				{"label":"编目完成","contentToggle":"#content4"}
			],
			buttonGroupToggle:modal.modalFooter,
			currentStep:step/**初始化在第几步,默认是0**/
		});
	};
	/*设置文件步骤*/
	var setStepsFile = function(){
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"编写项目申请","contentToggle":"#content1"},
				{"label":"填写元数据","contentToggle":"#content2","callback":function(){setUpload();}},
				{"label":"编目预览","contentToggle":"#content3","callback":function(){}},
			],
			buttonGroupToggle:modal.modalFooter,
		});
	}
	/*设置api步骤插件*/
	var setStepsApi = function(){
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"填写编目申请","contentToggle":"#content1"},
				{"label":"填写元数据","contentToggle":"#content2","callback":function(){setUpload();}},
				{"label":"输入参数配置","contentToggle":"#content3","callback":function(){setStepApiIn()}},
				{"label":"输出参数配置","contentToggle":"#content4","callback":function(){setStepApiOut()}},
				{"label":"编目预览","contentToggle":"#content5","callback":function(){}},
			],
			buttonGroupToggle:modal.modalFooter,
		});
	}
	/*设置api输出表格*/
	var setStepApiIn = function(para){
		var that = {};
		that.grid = null;
		that.count = 0;
		that.gridContainer = $("#step_tableIn");
		that.gridOption =  {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			bPaginate:false,
			bInfo:false,
			drawCallback:function(){
				that.gridContainer.find("tbody .delete").unbind("click").on("click",function(){
					that.grid.deleteRow(this);
				});
			}
		};
		
		that.init = function(){
			that.grid = base.datatables({
				container:that.gridContainer,
				option:that.gridOption
			});
			
			that.setAddRow();
		};
		that.setAddRow = function(){
			$('#addRowIn').on('click', function(){
				that.grid.addRow(that.getRowData());
			});
		};
		that.setDeleteRow = function(){
			that.gridContainer.find("tbody").on("click",".delete",function(){
				that.grid.deleteRow(this);
			});
		};
		that.getRowData = function(){
	       var data = [                                                                                                                      
	           "<input type='text' class='form-control name' placeholder='请输入...'/>",                                                                                  
	           "系统参数",                                                                                                                       
	           "<select class='form-control mandatory'><option value='1'>是</option><option value='0'>否</option></select>",                                                                      
	           "<input type='text' class='form-control example' placeholder='请输入...'>",                                                                                   
	           "<input type='text' class='form-control desc' placeholder='请输入...'/>",                                                                                  
	           "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>"  
	       ];                                                                                                                                
	        return data;
		};
		that.init();
	};
	/*设置api输入表格*/
	var setStepApiOut = function(para){
		var that = {};
		that.grid = null;
		that.count = 0;
		that.gridContainer = $("#step_tableOut");
		that.gridOption =  {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			bPaginate:false,
			bInfo:false,
			drawCallback:function(){
				that.gridContainer.find("tbody .delete").unbind("click").on("click",function(){
					that.grid.deleteRow(this);
				});
			}
		};
		
		that.init = function(){
			that.grid = base.datatables({
				container:that.gridContainer,
				option:that.gridOption
			});
			
			that.setAddRow();
		};
		that.setAddRow = function(){
			$('#addRowOut').on('click', function(){
				that.grid.addRow(that.getRowData());
			});
		};
		that.setDeleteRow = function(){
			that.gridContainer.find("tbody").on("click",".delete",function(){
				that.grid.deleteRow(this);
			});
		};
		that.getRowData = function(){
	        var data = [
	            "<input type='text' class='form-control name' placeholder='请输入...'/>",
	            "<select class='form-control type'><option value='12'>文本</option><option value='91'>日期</option><option value='3'>数字</option><option value='93'>时间</option><option value='4'>整型</option><option value='2004'>大字段</option></select>",
	            "<select class='form-control notNull'><option value='1'>是</option><option value='0'>否</option></select>",
	            "<input type='text' class='form-control example' placeholder='请输入...'>",
	            "<input type='text' class='form-control desc' placeholder='请输入...'/>",                                
	            "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>"
	        ];
	        return data;
		};
		that.init();
	};
	
	/*设置审核步骤*/
	var setStepsExamine = function(){
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"查看编目申请","contentToggle":"#content1"},
				{"label":"查看元数据信息","contentToggle":"#content2","callback":function(){}},
				{"label":"填写审批意见","contentToggle":"#content3","callback":function(){}},
			],
			buttonGroupToggle:modal.modalFooter,
		});
	}
	/*编目后数据展示*/
	var setStepExhibition = function(){
		$(".resType").text(resType(dataObject.resType))
		$(".resName").text(dataObject.resName);
		$(".abstracts").text(dataObject.abstracts);
		$(".resCode").text(dataObject.resCode);
		$(".resEname").text(dataObject.resEname);
		$(".resLevel").text(dataObject.resLevel==1?"部分共享":"完全共享");
		$(".themeTypeName").text(dataObject.themeName);
		$(".industryTypeName").text(dataObject.industryTypeName);
		$(".catalogName").text(treeKey.name);
		$(".updateCycle").text(dataObject.updateCycle?dataObject.updateCycle:"--");
		if(!$("#fileName").html()){
			base.ajax({
				url:$.path+"/api/sysBussinessDictionary/getPicturePath?id="+dataObject.themeType,
				type:"get",
				success:function(d){
					if(d.data){			
						$(".ui-page-headingImage").attr("src",$.path1+d.data);
					}else{
						$(".ui-page-headingImage").attr("src","../images/default.png");
					}
				}
			})
			
		}
	}
	var setStepDbExhibition = function(){
		$(".db-tbody").empty();
		$.each(dataObject.dbJson, function(i,o) {
			var trs = "<tr><td>"+o.name+"</td>"+
						"<td>"+(o.ename).substring(4)+"</td>"+
						"<td>"+o.code+"</td>"+
						"<td>"+common.typeSelect(o.type)+"</td>"+
						"<td>"+(function(){return o.length?o.length:'--'})()+"</td>"+
						"<td>"+(function(){return o.dataCode?o.dataCode:'--'})()+"</td></tr>"
			$(".db-tbody").append(trs)
		});		
	}
	var setStepApiExhibition = function(){
		$(".in-tbody").empty();
		$.each(dataObject.inParameterJson, function(i,o) {
			var trs = "<tr><td>"+o.name+"</td>"+
						"<td>系统参数</td>"+
						"<td>"+(function(){return o.mandatory=='1'?'是':'否'})()+"</td>"+
						"<td>"+o.desc+"</td></tr>"
			$(".in-tbody").append(trs)
		});
		$(".out-tbody").empty();
		$.each(dataObject.outParameterJson, function(i,o) {
			var trs = "<tr><td>"+o.name+"</td>"+
						"<td>"+common.typeSelect(o.type)+"</td>"+
						"<td>"+(function(){return o.notNull=='1'?'是':'否'})()+"</td>"+
						"<td>"+o.desc+"</td></tr>"
			$(".out-tbody").append(trs)
		});
	}
	var resType = function(d){
		switch(d){
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
	}
	/*目录详情*/
	var catalogDetail = function(d){
		var modal = base.modal({
			width:900,
			height:450,
			label:"详情",
			url:"../html/catalogManage/catalog_detail.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){
						modal.hide();
					}
				}
			],
			callback:function(){
				var ids = $(d).attr("cid");
				$("#catalog_detail").val(ids)
			}
		});
	}
	/*保存并提交前最后重名校验*/
	var checkResName = function(params){
		var data = [];
		var returnVal=null;
		data.push(dataObject.resName);
		data.push(dataObject.resCode);
		data.push(dataObject.resEname);
		/*提交前重名验证*/
		var dataNum = params?1:0;
		$.each(data,function(i,o){
			base.ajax({
				url:$.path+"/api/resCatalog/checkResNameOrCode?nameOrCode="+o+"&type="+(i+1)+"&catalogId="+treeKey.id,
				type:"get",
				async:false,
				success:function(d){
					if(d.data > dataNum){
						switch(i){
							case 0:
								base.requestTip({position:"center"}).error("资源名称同名");
								break;
							case 1:
								base.requestTip({position:"center"}).error("资源编码同名");
								break;
							case 2:
								base.requestTip({position:"center"}).error("资源英文名同名");
						}
					}else{
						returnVal = true;
					}
				}
			})
		})
		return returnVal;
	}
	return {
		main:function(){
			grid = null;
			setContent();
			setTreebar();
			setGridButton();
			setSearch();
			setReset();
			clickTreeSearch();
		}
	};
});