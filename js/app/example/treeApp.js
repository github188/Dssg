define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var modal = null;
	var steps = null;
	var treeClickEvent = function(event,treeId,treeNode){
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
			url:"../json/tree.json",
			type:"get",
			success:function(data){
				treeData = data;
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
					data:data
					//selectNodeId:"1"
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
					target:$("#cr")
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
		ajax:{
				url:"../json/grid1.json",
				type:"get",
				contentType:"application/json",
				data:function(d){
					/**base库专门获取表单参数的方法**/
					//var params = base.form.getParams($("#search-form"));
					/**传统jquery的序列化**/
					//var params = $("#form").serialize();
					/*if(params){
						$.extend(d,params); 
					}*/
					$.extend(d,{"id":$("#currentTreeId").val()}); 
					return JSON.stringify(d); 
				}
		},
		columns:[
			{ "data": "id","sWidth":"8%"},
			{ "data": "name","sWidth":"12%"},
			{ "data": "position","sWidth":"15%"},
			{ "data": "city","sWidth":"25%"},
			{ "data": "start_date","sWidth":"25%"},
			{ "data": "salary","sWidth":"15%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
          },
          {"render":function(data,type,row,meta){
                 return "<a target='_blank' href='example/detail.html?id="+row.id+"'>"+row.name+"</a>"; 
              }, 
               "targets":1
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
			option:gridOption
		});
		base.scroll({
			container:$(".ui-gridbar")
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
		modal = base.modal({
			width:800,
			height:400,
			label:"修改",
			url:"../html/example/grid_modify.html",
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
						if(params){
							common.submit({
								url:"../json/submitSuccess.json",
								params:params
							})
						}
						/**3.关闭模态窗**/
						modal.hide();
						
						/**4.刷新表格**/
						common.search(grid);
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
		modal = base.modal({
			width:900,
			height:450,
			label:"新建",
			url:"../html/example/tree_step.html",
			callback:function(){
				setSteps();
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
							/**校验最后一步的表单**/
						var isPass = base.form.validate({form:$("#form4"),checkAll:true});
						/**提交表单**/
						
						/**刷新父层列表**/
						common.search(grid);
						modal.hide();
					}
				}
			]
		});
	};
	/**设置步骤插件**/
	var setSteps = function(){
		steps = base.steps({
			container:$("#ui-steps"),
			data:[
				{"label":"编写项目申请","contentToggle":"#content1"},
				{"label":"填写元数据","contentToggle":"#content2","callback":function(){setUpload();}},
				{"label":"编辑数据项","contentToggle":"#content3","callback":function(){setStepGrid();}},
				{"label":"编目预览","contentToggle":"#content4"}
			],
			buttonGroupToggle:modal.modalFooter,
			/*buttons:[
				{"type":"back","toggle":"#step_back"},
				{"type":"forward","toggle":"#step_forward","callback":function(obj,stepsObj){
					//校验当前页的表单
					
					var step = stepsObj.getStep();
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
				}},
				{"label":"保存","type":"confirm","toggle":"#step_confirm","callback":function(obj,stepsObj){
					//校验最后一步的表单
					var step = stepsObj.getStep();
					var isPass = base.form.validate({form:$("#form4"),checkAll:true});
					//提交表单
					
					//返回列表页面
					common.loadPage("0-2");
				}}
			],*/
			//currentStep:2,/**初始化在第几步,默认是0**/
			currentStep:2
		});
	};
	/**设置第三部的表格**/
	var setStepGrid = function(){
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
			//that.setDeleteRow(); 
			that.grid.addRow(that.getRowData());
		};
		that.setAddRow = function(){
			$('#addRow').on('click', function(){
				that.grid.addRow(that.getRowData());
			});
		};
		that.setDeleteRow = function(){
			that.gridContainer.find("tbody .delete").on("click",function(){
				that.grid.deleteRow(this);
			});
		};
		that.getRowData = function(){
	        var data = [
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<input type='text' name='name"+that.count+"' class='form-control'/>",
	            "<div style='text-align:center'><button class='btn btn-link delete' key='"+that.count+"'><i class='fa fa-trash-o'></i></button><button class='btn btn-link primary'><i class='fa fa-key'></i></button></div>"
	        ];
	        that.count++;
	        return data;
		};
		that.init();
	};
	/**设置上传组件**/
	var setUpload = function(){
		$("#imageBtn").on("click",function(){
			$("#image").click();
		});
		$("#image").on("change",function(){
			$("#fileName").html($(this).val());
		});
	};
	
	return {
		main:function(){
			setTreebar();
			setGrid();
			setGridButton();
			//setSearch();
			setReset();
		}
	};
});