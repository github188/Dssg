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
			url:$.path+"/api/sysuser/findSysUser",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				var objectA;
				if(params){
					return objectA = $.extend(params,{page:d.page,size:d.size})
				}
			}
		},
		columns:[
			{ "data": "id","sWidth":"5%"},
			{ "data": "loginName","sWidth":"15%"},
			{ "data": "userName","sWidth":"15%"},
			{ "data": "roleName","sWidth":"12%"},
			{ "data": "telphone","sWidth":"11%"},
			{ "data": "cellPhoneNumber","sWidth":"11%"},
			{ "data": "email","sWidth":"11%"},
      		{ "data": "state","sWidth":"10%"}
		],
		columnDefs:[ 
           	{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/></div>"; 
              }, 
               "targets":0 
         	},
         	{"render":function(data,type,row,meta){
     			return "<div cid='"+row.id+"' class='loginName' style='cursor:pointer'>"+row.loginName+"</div>"
         		},
         		"targets":1
         	},
         	{"render":function(data,type,row,meta){
     			return row.telphone?common.interceptString(row.telphone):"--"
         		},
         		"targets":4
         	},
         	{"render":function(data,type,row,meta){
     			return row.cellPhoneNumber?common.interceptString(row.cellPhoneNumber):"--"
         		},
         		"targets":5
         	},
         	{"render":function(data,type,row,meta){
     			return row.email?common.interceptString(row.email):"--"
         		},
         		"targets":6
         	},
         	{"render":function(data,type,row,meta){
            	switch(row.state){
            		case "0":return "<div state='"+row.state+"'>正常</div>";break;
            		case "-1":return "<div state='"+row.state+"'>停用</div>";break;
            		default : return "<div state='"+row.state+"'>停用</div>";break;
            	}
            	}, 
             "targets":7
            }
        ],
        drawCallback:function(setting){
        	/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
			click_loginName()
			common.selectedTr($("#user"));
        }
	}
	//点击用户名
	function click_loginName(){
		$(".loginName").off().on("click",function(){
			gridView($(this).attr("cid"))
		})
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#user"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	//获取用户角色
	var getUserRole = function(container){
		base.ajax({
			type:"get",
			url:$.path+"/api/sysroles/findRoleList",
			success:function(data){
				base.template({
					container:container,
					templateId:"userRole-tpl",
					data:data.data
				})
			}
		})
	}
	
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
					//case "1": gridView();break;
					case "2": gridStop();break;
					case "3": gridStart();break;
					case "4": gridReset();break;
				}
			}
			
		});
	}
	//新建
	var gridAdd = function(){
		var modal = base.modal({
			label:"新建",
			width:700,
			height:270,
			url:"../html/systemManage/userOperation/create.html",
			drag:true,
			callback:function(){
				getUserRole($(".userRole"));
			},
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						var rex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
						var val = $("#form input[name='loginName']").val();
						if(val&& !rex.test(val)){
							return base.requestTip({position:"center"}).error("只支持以字母开头的，数字、字母、下划线")
						}
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								
								if($(".checkName").attr("cstate") =="true"){
									var params = base.form.getParams($("#form"));
									if(params){
										common.submit({
											url:$.path+"/api/sysuser/saveSysUser",
											params:params,
											type:"post",
											callback:function(data){
												if(data.code==0 && data.message=="success"){
													data.message="保存成功"
												}else{
													data.message="保存失败"
												}
												common.search(grid);
											}
										})
										modal.hide();
									}
								}else if($()){
									base.requestTip({position:"center"}).error("用户名重复");	
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
		})
	}
	
	//删除
	var gridDelete = function(){
		var params = base.getChecks('cb').val,
			isAdmin = false,
			len = $("#user").find(".loginName").length;
		for(var i=0;i<len;i++){			
			var body = $("#user").find(".loginName:nth-child("+(i+1)+")");
			$("#user .loginName").map(function(index,item){
				if($(this).html() == "admin"){
					if(params.indexOf($(this).attr('cid'))>-1){
						isAdmin = true;
					}
				}
			})
		}
		if(isAdmin){
			return base.requestTip().error("超级管理员不允许删除")
		}
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysuser/deleteSysUser",
					params:params,
					type:"post",
					callback:function(data){
						if(data.code==0 && data.message=="success"){
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
	//修改
	var gridModify = function(){  
		var params = {"roleid":$(".ui-grid .cb:checked").attr("cid")};
		var modal = base.modal({
			label:"修改",
			width:700,
			height:270,
			url:"../html/systemManage/userOperation/modify.html",
			drag:true,
			callback:function(){
				base.ajax({
					url:$.path+"/api/sysuser/findSysUserById?id="+$(".ui-grid .cb:checked").attr("cid"),
					type:"get",
					success: function(data) {
						if(data.code =="0"){
							var formData = data.data;
							base.form.init(formData,$("#form"));
							$("#form").find("input[name='loginName']").attr("disabled",true);
							$("#form").find("input[name='userName']").attr("disabled",true);
							$("#form").find("select[name='roleId']").append("<option value='"+formData.roleId+"'>"+formData.roleName+"</option>").attr("disabled",true);
						}
					},
					error:function(data){
					}
				})
			},
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						var rex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
						var val = $("#form input[name='loginName']").val();
						if(!rex.test(val)){
							return base.requestTip({position:"center"}).error("只支持以字母开头的，数字、字母、下划线")
						}
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								if(params){
									common.submit({
										url:$.path+"/api/sysuser/updateSysUser",
										type:"post",
										params:params,
										callback:function(data){
											if(data.code==0 && data.message=="success"){
												data.message="修改成功"
											}else{
												data.message="修改失败"
											}
											common.search(grid);
										}
									})
									modal.hide();
								
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
		})}
	//查看
	var gridView = function(id){
		var modal = base.modal({
			label:"查看",
			width:700,
			height:270,
			url:"../html/systemManage/userOperation/view.html",
			drag:true, 
			callback:function(){
				base.ajax({
					url:$.path+"/api/sysuser/findSysUserById?id="+id,//$(".ui-grid .cb:checked").attr("cid"),
					type:"get",
					success: function(data) {
						if(data.code =="0"){
							var formData = data.data;
							$.each(formData,function(key,val){
								if(key == "state"){
									if(val =="0"){
										$("#form .state").html("正常")
									}else if(val== "-1"){
										$("#form .state").html("停用")
									}else{
										$("#form .state").html("停用")
									}
								}else{
									if(val) {
										$("#form").find("."+key).html(val)
									}else{
										$("#form").find("."+key).html("--")
									}
								}
							})
						}
					},
					error:function(data){
					}
				})
			},
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
	//停用
	var gridStop = function(){
		base.confirm({
			label:"停用",
			text:"<div style='text-align:center;font-size:13px;'>确定停用?</div>",
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysuser/startOrStopSysUser?id="+$(".ui-grid .cb:checked").attr("cid")+"&state=-1",
					type:"get",
					callback:function(data){
						if(data.code==0 && data.message=="success"){
							data.message="停用成功"
						}else{
							data.message="停用失败"
						}
						common.search(grid);
					}
				});
			}
		});
	}
	//启用
	var gridStart = function(){
		base.confirm({
			label:"启用",
			text:"<div style='text-align:center;font-size:13px;'>确定启用?</div>",
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysuser/startOrStopSysUser?id="+$(".ui-grid .cb:checked").attr("cid")+"&state=0",
					type:"get",
					callback:function(data){
						if(data.code==0 && data.message=="success"){
							data.message="启用成功"
						}else{
							data.message="启用失败"
						}
						common.search(grid);
					}
				});
			}
		});
	}
	//重置密码
	var gridReset = function(){
		var params = {"id":base.getCR("cb",true)};
		base.confirm({
			label:"重置密码",
			text:"<div style='text-align:center;font-size:13px;'>确定重置密码?</div>",
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysuser/resetUserPassword",
					type:"get",
					params:params,
					callback:function(data){
						if(data.code==0 && data.message=="success"){
							data.message="重置成功"
						}else{
							data.message="重置失败"
						}
						common.search(grid);
					}
				});
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
			setGrid();//画表格
			setGridButton();
			getUserRole($(".resTypeName"));//获取用户角色
			setSearch();//查询
			setReset();//重置
//			checkName();//检查是否重名
			setContent();
		}
	}
})
