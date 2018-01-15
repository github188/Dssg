define(["base","app/commonApp"],function(base,common){
	var grid = null,optionData=null;
	/**datatables表格配置项**/
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/resCenterDataElement/findCenterDataElementPage",	
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					return common.getParams(d,$("#search-form"));
				}
		},	
		columns:[
			{ "data": "id","sWidth":"3%"},
			{ "data": "name","sWidth":"13%"},
			{ "data": "englishName","sWidth":"13%"},
			{ "data": "code","sWidth":"14%"},
			{ "data": "classifyName","sWidth":"14%"},
			{ "data": "dataType","sWidth":"11%"},
			{ "data": "dataLength","sWidth":"11%"},
			{ "data": "isDictionary","sWidth":"11%"},
			{ "data": "dictionaryName","sWidth":"10%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+JSON.stringify(row)+"'/>"; 
              }, 
               "targets":0 
            },
            {"render":function(data,type,row,meta){
                 return "<a href='#' cid='"+JSON.stringify(row)+"' class='data_detail'>"+row.name+"</a>"; 
              }, 
               "targets":1 
          	},
            {"render":function(data,type,row,meta){
            	 var n = row.dataType; 
            	 if(n==3){
            	 	return "数字"
            	 }
            	 else if(n == 4){
            	 	return "整型";
            	 }
            	 else if(n == 12){
            	 	return "文本";
            	 }
            	 else if(n == 91){
            	 	return "日期";
            	 }
            	 else if(n == 93){
            	 	return "时间";
            	 }else if(n == 2004){
            	 	return "大字段";
            	 }
              }, 
               "targets":5 
            },
            {"render":function(data,type,row,meta){
            	 var n = row.dataLength; 
            	 if(n == null || n == ""){
            	 	return "--"
            	 }else{
            	 	return n;
            	 }
              }, 
               "targets":6 
            },
            {"render":function(data,type,row,meta){
            	 var n = row.isDictionary; 
            	 if(n =="0"){
            	 	return "是"
            	 }else{
            	 	return "否"
            	 }
//          	 return n?"否":"是";
            	 
              }, 
               "targets":7 
            },
            {"render":function(data,type,row,meta){
            	 var n = row.dictionaryName; 
            	 if(n == null || n == ""){
            	 	return "--"
            	 }else{
            	 	return n;
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
        	//数据元名称详情
			$(".data_detail").on("click",function(){
				dataDetail(this);
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
			$("#file").replaceWith('<input type="file" name="file" id="file" style="display: none;"/>');
			$("#file").trigger("click");
		})
		$(".export").click(function(){
			var arr = base.getChecks("cb").val;
			window.location.href=$.path+"/api/resCenterDataElement/downloadDataElement?ids="+arr;
		})
	};
	var isused = function(){
		var isUsed =false;
		var params = base.getChecks("cb").val;
		/**删除前先弹窗确认是否删除**/
		base.ajax({
			url:$.path+"/api/resCenterDataElement/checkDataUse",
			type:"post",
			params:params,
			async :false,
			success:function(d){
				if(!d.data){
				}else{
					isUsed = true;
//					base.requestTip({position:"center"}).error("已被使用的数据元,不能删除");
				}
			}
		})
		return isUsed;
		
	}
	/**修改**/
	var gridModify = function(){
//		$("#button_type").val("1");
		var modal = base.modal({
			width:900,
			height:450,
			label:"修改",
			url:"../html/catalogManage/dataManage_add.html",
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
								//修改之前的数据
								var checkOldData = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
								var istrue = true;
								
								if(params.name != checkOldData.name){
									base.ajax({
										url:$.path+"/api/resCenterDataElement/checkDataElementName?name="+params.name,
										type:"get",
										async:false,
										success:function(d){
											if(!d.data){
												base.requestTip({position:"center"}).error("数据元名称重复！");
												istrue = false;
											}
										}
									})
								}
								if(params.code != checkOldData.code){
									base.ajax({
										url:$.path+"/api/resCenterDataElement/checkDataElementCode?code="+params.code,
										type:"get",
										async:false,
										success:function(d){
											if(!d.data){
												base.requestTip({position:"center"}).error("数据元编码重复！");
												istrue = false;
											}
										}
									})
								}
								if(!istrue){
									return;
								}
								//判断是否已被使用
								var isUsed = isused();
								//判断版本号是否发生改变
								if(!isUsed){
									if(params.versionNumber ==checkOldData.versionNumber){
											base.confirm({
												confirmCallback:function(){
													var setTime = setTimeout(function(){												
														$("#form input[name='versionNumber']").focus();
													},200)
												},
												cancelCallback:function(){
													runModifySave(params,modal);
												},
												text:"数据源内容已经改变，是否需要新增一个版本",
												label:"提示"
											});
										
									}else if(parseFloat(params.versionNumber) > parseFloat(checkOldData.versionNumber)){					
										if(istrue){
											runModifySave(params,modal);
										}
									}else{
										base.requestTip({position:"center"}).error("新版本号应大于老版本号！");
									}
								}else{
									if(istrue){
										runModifySave(params,modal);
									}
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
				
			}
		});
	};
	
	
	//修改保存
	var runModifySave= function(params,modal){
		common.submit({
			url:$.path+"/api/resCenterDataElement/updateCenterDataElement",
			params:params,
			type:'post',
			callback:function(d){
				if(d.message=="success"){
					d.message = "修改成功";
				}else{
					d.message = "修改失败";										
				}
				modal.hide();
				common.search(grid);
				common.initButtonbar($(".ui-grid-buttonbar"));
			}
		})
	}
	/**批量删除**/
	var gridDelete = function(){
		var params = base.getChecks("cb").val;
		/**删除前先弹窗确认是否删除**/
		base.ajax({
			url:$.path+"/api/resCenterDataElement/checkDataUse",
			type:"post",
			params:params,
			success:function(d){
				if(!d.data){
					base.confirm({
						confirmCallback:function(){
							common.submit({
								url:$.path+"/api/resCenterDataElement/deleteCenterDataElement",
								params:params,
								type:"post",
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
				}else{
					base.requestTip({position:"center"}).error("已被使用的数据元,不能删除");
				}
			}
		})
	};
	/**新建**/
	var gridAdd = function(){
		$("#button_type").val();
		var modal = base.modal({
			width:900,
			height:450,
			label:"新建",
			url:"../html/catalogManage/dataManage_add.html",
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
								base.ajax({
									url:$.path+"/api/resCenterDataElement/checkDataElementName?name="+params.name,
									type:"get",
									async:false,
									success:function(d){
										if(!d.data){
											base.requestTip({position:"center"}).error("数据元名称重复！");
											params = false;
										}
									}
								})
								base.ajax({
									url:$.path+"/api/resCenterDataElement/checkDataElementCode?code="+params.code,
									type:"get",
									async:false,
									success:function(d){
										if(!d.data){
											base.requestTip({position:"center"}).error("数据元编码重复！");
											params = false;
										}
									}
								})
								if(params){
									common.submit({
										url:$.path+"/api/resCenterDataElement/saveCenterDataElement",
										params:params,
										type:"post",
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
	/*详情*/
	var dataDetail = function(para){
		var modal = base.modal({
			width:900,
			height:450,
			label:"详情",
			url:"../html/catalogManage/dataManage_detail.html",
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
				var params = JSON.parse($(para).attr("cid"));
				base.ajax({
					url:$.path+"/api/resCenterDataElement/findCenterDataElementById?id="+params.id,
					type:"get",
					success:function(d){
						if(d.code =="0" && d.success){
							dataCentent=d.data;
							optionData = d.data;
							dataSelect(optionData);
							var sortObj = dataCentent.centerDataElementDTOList.sort(compare("versionNumber"));
							$.each(sortObj,function(i,o){
								$(".versionNumber").append('<option value="'+i+'">'+o.versionNumber+'</option>')
							})
							//实现每次查看的都是最新的版本记录
							$(".versionNumber option:last").prop("selected","selected");
						}else{
							base.requestTip({ position:"center"}).error(d.message); 
						}
					}
				})
			}
		});
		$(".modal").on("change",".versionNumber",function(){
			var n = parseInt($(this).val());
			optionData = dataCentent.centerDataElementDTOList[n];
			if(optionData){				
				dataSelect(optionData);
			}
		})
	}
	
	//数组对象排序
	function compare(property){
         return function(obj1,obj2){
             var value1 = obj1[property];
             var value2 = obj2[property];
             return value1 - value2;     // 升序
         }
    }
	
	function dataSelect(optionData){
		switch(optionData.isDictionary){
			case '1':
				$("#form .dictionaryName").hide();
				$("#form .showBlack").show();
				optionData.isDictionary ="否"
				break;
			case '0':
				$("#form .dictionaryName").show();
				$("#form .showBlack").hide();
				optionData.isDictionary ="是"
				break;
		}
	
		switch(optionData.dataType){
			case '3':
				optionData.dataType="数字";
				$("#form .dataLength").show();
				$("#form .showBlack").hide();
				break;
			case '4':
				optionData.dataType="整型";
				$("#form .dataLength").show();
				$("#form .showBlack").hide();
				break;
			case '12':
				optionData.dataType="文本";
				$("#form .dataLength").show();
//				$("#form .showBlack").hide();
				break;
			case '91':
				optionData.dataType="日期";
				$("#form .dataLength").hide();
				$("#form .showBlack").show();
				break;
			case '93':
				optionData.dataType="时间";
				$("#form .dataLength").hide();
				$("#form .showBlack").show();
				break;
			case '2004':
				optionData.dataType="大字段";
				$("#form .dataLength").hide();
				$("#form .showBlack").show();
		}
		var temObj = optionData;
		for(data in temObj){
			if(!temObj[data]){
				temObj[data]="--"
			}
		}
		base.form.init(temObj,$("#form"))
	}
	var setContent = function(){
		/*滚动条*/
		base.scroll({
			container:$(".ui-gridbar")
		});
		/*搜索框下拉*/
		$.ajax({
			url:$.path+"/api/sysBussinessDictionary/findDictionaryByType",
			data:JSON.stringify({type: 3,name:"classify"}),
			type:"post",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			success:function(d){
				$(d.data.classify).each(function(i,o){
					$("select[name='classify']").append("<option value='"+o.key+"'>"+o.label+"</option>")
					if(o.children.length>0){
						$.each(o.children, function(n,d) {
							$("select[name='classify']").append("<option value='"+d.key+"'>"+d.label+"</option>")
						});
					}
				})
			}
		})
		/*文件上传*/
		$(".dataManageFile").on("change","#file",function(){
			var arr = base.getChecks("cb").val;
			base.form.fileUpload({ 
               url:$.path+"/api/resCenterDataElement/uploadDataElement", 
               id:"file", 
               params:{ids:arr},
               success:function(data){
               		if(data.success){
               			base.requestTip({ 
	                       position:"center" 
	                   }).success("上传成功！"); 
	                   setGrid()
               		}
	            },
	            error:function(data){
           			base.requestTip({ 
                       position:"center" 
                   }).success("上传成功！"); 
                   setGrid();
	            }
           });
		})
	};
	return {
		main:function(){
			/**当调用main方法后(1个APP只能有1个main方法)，开始执行下列操作**/
			setGrid();
			setGridButton();
			setSearch();
			setReset();
			setContent();
		}
	};
});