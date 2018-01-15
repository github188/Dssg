define(["base","app/commonApp"],function(base,common){
	//表格参数
	var grid = null;
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/portal/resource/findResResourceByPage",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					common.gridPageFliter(d);
//					/**base库专门获取表单参数的方法**/
					var params = base.form.getParams($("#search-form"));
					var themeType = $("#themeName").attr("tid");
					var objectA;
					if($.cookie("dssgUserInfo")){
						var tokenAll = $.cookie("dssgUserInfo");
						var equipment = JSON.parse(tokenAll).loginUserProfileDTO.currentEquipment.token;
					}
					if(params){
						objectA = $.extend({equipment:equipment?equipment:"0",page:d.page,size:d.size},params);
					}
					if(themeType&&themeType!=0){
						objectA.themeType = themeType;
					}else{
						objectA.themeType = "";
					}
					return objectA
					
				}
		},
		columns:[
			{ "data": "id","sWidth":"5%"},
			{ "data": "resName","sWidth":"15%"},
			{ "data": "resCode","sWidth":"15%"},
			{ "data": "themeName","sWidth":"14%"},
			{ "data": "industryTypeName","sWidth":"14%"},
			{ "data": "resTypeName","sWidth":"14%"},
			{ "data": "publishDept","sWidth":"11%"},
			{ "data": "hot","sWidth":"10%"}
		],
		columnDefs:[ 
	        {"render":function(data,type,row,meta){
	        	
	               return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/></div>"; 
	              }, 
	               "targets":0 
	        },
            {"render":function(data,type,row,meta){
            	return row.resName?common.interceptString(row.resName):"--"
            }, 
               "targets":1
            },
            {"render":function(data,type,row,meta){
            	return row.resCode?common.interceptString(row.resCode):"--"
            }, 
               "targets":2
            },
            {"render":function(data,type,row,meta){
            	return row.themeName?common.interceptString(row.themeName):"--"
            }, 
               "targets":3
            },
            {"render":function(data,type,row,meta){
            	return row.industryTypeName?common.interceptString(row.industryTypeName):"--"
            }, 
               "targets":4
            },
            {"render":function(data,type,row,meta){
            	return row.publishDept?common.interceptString(row.publishDept):"--"
            }, 
               "targets":6
            },
            {"render":function(data,type,row,meta){
            	switch(row.hot){
            		case "0":return "否";break;
            		case "1":return "是";break;
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
        	common.selectedTr($("#hot"));
        }
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#hot"),
			option:gridOption,
			filter:common.gridFilter
		});
	};

	//获取主题分类
	function getThemes(){
		var params = {name: "themeType", type: 1}
		base.ajax({
			url:$.path+"/api/sysBussinessDictionary/findDictionaryByType",
			params:params,
			type:"post",
			success:function(data){
				if (JSON.stringify(data.data) == "{}") {
//					var options = "<option value='-1'>请选择</option>";
//					$("#themePanels").html(options)
				} else{
					var list = [{id:"0",name:"全部",pid:"0",open:true}];
					var items= data.data.themeType;
					items.map(function(item,index){
						if(item.children&&item.children.length>0){
							item.children.map(function(item1,index1){
								if(item1.children&&item1.children.length>0){
									item1.children.map(function(item2,index2){
										if(item2.children&&item2.children.length>0){
											item2.children.map(function(item3,index3){
												if(item3.children&&item3.children.length>0){
												}
												list.push({id:item3.key,name:item3.label,pid:item2.key})
											})
										}
										list.push({id:item2.key,name:item2.label,pid:item1.key})
									})
								}
								list.push({id:item1.key,name:item1.label,pid:item.key})
							})
						}
						list.push({id:item.key,name:item.label,pid:"0"})
					})
					var treeSelectObj = base.form.treeSelect({
							container:$("#themeName"),
							data:list,
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
			}
		})
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
			$("#themeName").attr("tid","0");
			common.reset($("#search-form"),grid);
			$("#themeName").val("全部")
		});
	};
	/**修改推荐设置**/
	var hotModify = function(){
		var paramsId = {"resourceId":base.getChecks("cb").val};
		var modal = base.modal({
			width:700,
			height:270,
			label:"推荐设置",
			url:"../html/portalManage/modify.html",
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
									var paramsA = $.extend(params,paramsId);
									common.submit({
										url:$.path+"/api/portal/resource/updateResource",
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
	//设置表格各个按钮的操作
	var setGridButton = function(){
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				hotModify();
			}
		});
	}
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	return{
		main:function(){
			setGrid();//画表格
			getThemes();//获取主题分类
			setSearch();//查询
			setReset();//重置
			setGridButton();
			setContent();
		}
	}
})
