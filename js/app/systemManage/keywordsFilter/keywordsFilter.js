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
			url:$.path+"/api/resFilterStrategy/findResFilterStrategyByPage",
			type:"get",
			contentType:"application/json",
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
			{ "data": "name","sWidth":"20%"},
			{ "data": "content","sWidth":"30%"},
			{ "data": "description","sWidth":"45%"}
		],
		columnDefs:[ 
           	{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/></div>"; 
              }, 
               "targets":0 
         	},
         	{"render":function(data,type,row,meta){
         		return row.name?common.interceptString(row.name):"--"
              }, 
               "targets":1 
        	 },
         	{"render":function(data,type,row,meta){
         		return row.content?common.interceptString(row.content):"--"
              }, 
               "targets":2 
         	},
         	{"render":function(data,type,row,meta){
         		return row.description?common.interceptString(row.description):"--"
              }, 
               "targets":3 
         	}
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	common.selectedTr($("#keywords"));
        }
	
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#keywords"),
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
				gridModify();
			}
		})
	}
	/**查询**/
	var setSearch = function(){
		/**设置时间控件**/
		$("#search").on("click",function(){
			common.search(grid);
		});
		
	};
	/**重置**/
	var setReset = function(){
		$("#reset").off().on("click",function(){
			common.reset($(this).parents(".ui-searchbar").find("form"),grid);
		});
	};
	//新建
	var gridAdd = function(){
		var modal = base.modal({
			label:"新建策略",
			width:700,
			height:270,
			url:"../html/systemManage/keywordsFilter/create.html",
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
										url:$.path+"/api/resFilterStrategy/add",
										params:params,
										type:"post",
										callback:function(data){
											if(data.code==0){
												data.message="新建策略成功"
											}else{
												data.message="新建策略失败"
											}
											common.search(grid);
										}
									})
									modal.hide();
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
	//修改
	var gridModify = function(){
		var modal = base.modal({
			label:"修改",
			width:700,
			height:270,
			url:"../html/systemManage/keywordsFilter/modify.html",
			drag:true,
			callback:function(){
				base.ajax({
					url:$.path+"/api/resFilterStrategy/get?id="+base.getCR("cb").attr("cid"),
					type:"get",
					success: function(data) {
						if(data.code =="0"){
							var formData = data.data;
							base.form.init(formData,$("#form"));
							$("#form").find("input[name='code']").attr("disabled",true)
						}
					},
					error:function(data){
					}
				})
			},
			buttons:[
				{
					"label":"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var paramsId = {"id":base.getCR("cb").attr("cid")};
								var params = base.form.getParams($("#form"));
								var paramsA = $.extend(params,paramsId);
								if(paramsA){
									common.submit({
										url:$.path+"/api/resFilterStrategy/update",
										params:paramsA,
										type:"post",
										callback:function(data){
											if(data.code==0){
												data.message="保存成功"
											}else{
												data.message="保存失败"
											}
											common.search(grid);
										}
									})
									modal.hide();
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
		var params = base.getChecks ("cb").val;
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/resFilterStrategy/delete",
					type:"post",
					params:params,
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
		})
	}
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return {
		main:function(){
			setGrid();//画表格
			setGridButton();
			setSearch();
			setReset();
			setContent();
		}
	}
})
