define(["base","app/commonApp"],function(base,common){
	var grid = null;
	/**datatables表格配置项**/
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:"../json/grid2.json",
				type:"get",
				contentType:"application/json",
				data:function(d){
					return common.getParams(d,$("#search-form"));
				}
		},
		columns:[
			{ "data": "id","sWidth":"14%"},
			{ "data": "name","sWidth":"14%"},
			{ "data": "code","sWidth":"14%"},
			{ "data": "ename","sWidth":"14%"},
			{ "data": "auditorUserName","sWidth":"14%"},
			{ "data": "telphone","sWidth":"14%"},
			{ "data": "auditorCompany","sWidth":"16%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
            } 
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        }
	};
	/**画表格**/
	var setGrid = function(){
		
		grid = base.datatables({
			container:$("#example"),
			option:gridOption,
			filter:common.gridFilter
		});
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	/**查询**/
	var setSearch = function(){
		/**设置时间控件**/
		base.form.date({
			element:$(".date"),
			isTime:true,
			theme:"weilan"
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
			width:800,
			height:400,
			label:"修改",
			url:"../html/example/grid_modify.html",
			callback:function(){
				base.ajax({
					url:"../json/grid_modify.json",
					type:"get",
					success:function(data){
						if(data.code=="0"){
			        		var formData = data.data;
							base.form.init(formData,$("#form"));
		        		}
					}
				})
			},
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
		var params = {"ids":base.getChecks("cb")};
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
	};
	var setTreeSelect = function(){
		var treeSelectObj = base.form.treeSelect({
			container:$("#hy"),
			url:"../json/tree.json"
		});
	};
	return {
		main:function(){
			/**当调用main方法后(1个APP只能有1个main方法)，开始执行下列操作**/
			setGrid();
			setGridButton();
			setSearch();
			setReset();
			setTreeSelect();
		}
	};
});