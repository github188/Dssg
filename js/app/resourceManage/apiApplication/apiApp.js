define(["base","app/commonApp"],function(base,common){
	//表格
	var grid = null;
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/app/findSysApp",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams("#search-form");
				var paramsA;
				if(params){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA
			}
		},
		columns:[
			{ "data": "id","sWidth":"5%"},
			{ "data": "appName","sWidth":"20%"},
			{ "data": "description","sWidth":"30%"},
			{ "data": "ipAddress","sWidth":"20%"},
			{ "data": "token","sWidth":"25%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' isuse='"+row.isUse+"' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/></div>"; 
              }, 
               "targets":0 
         },
         {"render":function(data,type,row,meta){
         		return common.interceptString(row.appName)
              }, 
               "targets":1
         },
         {"render":function(data,type,row,meta){
         	if(!row.description){
         		return "--";
         	}
         	 return common.interceptString(row.description)
          }, 
           "targets":2 
     	}],
		drawCallback:function(setting){
			/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	//选中行
        	common.selectedTr($("#apiApp"));
		}
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#apiApp"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	//设置表格各个按钮操作
	var setGridButton = function(){
		$(".ui-grid-buttonbar .add").on("click",function(){
			if(!$(this).hasClass("disabled")){				
				gridAdd();
			}
		})
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if(!$(this).hasClass("disabled")){
				gridDelete();
			}
		})
		$(".ui-grid-buttonbar .modify").on("click",function(){
			if(!$(this).hasClass("disabled")){
				var key = $(this).attr("keyAtrr");
				switch(key){
					case "0": gridModify();break;
					case "1": gridView();break;
				}
			}
		})
	}
	
	//查询
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
	//新建
	var gridAdd = function(){
		var modal = base.modal({
			label:"新建",
			width:700,
			height:270,
			url:"../html/resourceManage/apiApp_add.html",
			drag:true,
			buttons:[
				{
					label:"提交",
					cls:"btn btn-info",
					clickEvent:function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								checkName(params,function  () {
									common.submit({
										url:$.path+"/api/app/addApp",
										params:params,
										type:"post",
										callback:function(data){
											if(data.code==0 && data.message =="success"){
												data.message="保存成功"
											}else{
												data.message="保存失败"
											}
											common.search(grid);
										}
									})
									modal.hide();
								});
							}
						})
					}
				},
				{
 					label:"取消",
					cls:"btn btn-warning",
					clickEvent:function(){
						modal.hide();
					}
				
				} 
			]
		})
	}
	
	//校验
	var checkName = function (params,callback) {
		base.ajax({
			url:$.path+"/api/app/checkAppNameSole",
			params:params,
			type:"post",
			success:function(result){
				if(result.data){
					callback()
				}else{
					base.requestTip({position:"center"}).error("名称重复")
				}
			}
		})
	}
	//修改
	var gridModify = function(){
		var paramsId = {"id":$(".ui-grid .cb:checked").attr("cid")};
		var modal = base.modal({
			label:"修改",
			width:700,
			height:270,
			url:"../html/resourceManage/apiApp_modify.html",
			drag:true,
			callback:function(){
				var id = $(".ui-grid .cb:checked").attr("cid");
				base.ajax({
					url:$.path+"/api/app/findAppByAppId?id="+id,		
					type:"get",
					success: function(data) {
						if(data.code =="0"&& data.data){
							var formData = data.data;
							if(formData){
								base.form.init(formData,$("#form"));
							}
						}
					}
				})
			},
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
								var selectName = $(".ui-grid .cb:checked").parents("td").next().find("div").attr("title");
								function modifySave () {
									var paramsA = $.extend(paramsId,params);
									common.submit({
										url:$.path+"/api/app/editApp",
										params:paramsA,
										type:"post",
										callback:function(data){
											if(data.code==0 && data.message =="success"){
												data.message="保存成功"
											}else{
												data.message="保存失败"
											}
											common.search(grid);
										}
									})
									modal.hide();
								}
								if(selectName ==params.appName){
									modifySave(paramsId,params);
								}else{
									checkName(params,modifySave)
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
		})
	}
	//删除
	var gridDelete = function(){
		var params = base.getChecks('cb').val;
		if(params.length>0){
			for(var k=0;k<params.length;k++){
				if($("input[cid='"+params[k]+"']").attr('isuse')=="1"){
					return base.requestTip({position:"center"}).error("存在已使用的API应用，不可以删除")
					break;
				}
			}
		}
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/app/deleteApp",
					params:params,
					type:"post",
					callback:function(data){
						if(data.code==0){
							data.message="删除成功"
						}else{
							data.message="删除失败"
						}
						common.search(grid);
					}
				});
			}
		});
	}
	var gridView = function(){ 
		var modal =base.modal({
			label:"查看",
			width:1100,
			height:500,
			url:"../html/resourceManage/apiApp_view.html",
			drag:true,
			customScroll:true,
			buttons:[
				{
					label:"取消",
					cls:"btn btn-info",
					clickEvent:function(){
						modal.hide();
					}
				}
			]
		})
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
	}
})
