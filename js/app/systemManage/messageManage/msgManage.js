define(["base","app/commonApp","app/mainApp"],function(base,common,mainApp){
	//表格参数
	var grid=null;
	var gridOption ={
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/sysmessage/findSysMessage",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				var paramsA;
				if(params){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "id","sWidth":"10%"},
			{ "data": "content","sWidth":"50%"},
      		{ "data": "createTime","sWidth":"40%"}
		],
		columnDefs:[
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/></div>"; 
              }, 
               "targets":0 
	      },{"render":function(data,type,row,meta){
	      		var menu = row.type;
	      		if(row.state == "1"){//未读
	      			if(menu=="4"){
	      				return "<div title='"+row.content+"' class='notread notdo' csrc='"+row.menuClassification+"'><b>【待办事项】&nbsp;"+row.content+"</b></div>"
		      		}else if(menu=="2"){
		      			return "<div title='"+row.content+"' class='notread'><b>【系统消息】&nbsp;"+row.content+"</b></div>"
		      		}else{
		      			return "<div title='"+row.content+"' class='notread'><b>【告警消息】&nbsp;"+row.content+"</b></div>"
		      		}
	      		}else{
	      			if(menu=="4"){//已读
		      			return "<div title='"+row.content+"'>【待办事项】&nbsp;"+row.content+"</div>"
		      		}else if(menu=="2"){
		      			return "<div title='"+row.content+"'>【系统消息】&nbsp;"+row.content+"</div>"
		      		}else{
		      			return "<div title='"+row.content+"'>【告警消息】&nbsp;"+row.content+"</div>"
		      		}
	      		}
              }, 
               "targets":1 
	       }
		],
		drawCallback:function(setting){
			/**全选操作**/
        	base.selectAll($("#cball"),$(".cb"),function(){
        		common.checkByGridButton($(".cb"));
        	});
        	common.selectedTr($("#msg"));
		}
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#msg"),
			option:gridOption,
			filter:common.gridFilter
		})
	}
	//设置表格各个按钮操作
	var setGridButton = function(){
		$(".ui-grid-buttonbar button").on("click",function(){
			if(!$(this).hasClass("disabled")){
				if($(this).hasClass("read")){ //含有read的话则表明点击的标记已读
					gridRead();
				}else{ //点击的是删除
					gridDelete();	 
				}
			}
		})
	}
	//查询
	var setSearch = function(){
		/**设置时间控件**/
		$("#search").on("click",function(){
			common.search(grid);
		});
		
	};
	//重置
	var setReset = function(){
		$("#reset").off().on("click",function(){
			common.reset($(this).parents(".ui-searchbar").find("form"),grid);
		});
	};
	//删除
	var gridDelete = function(){
		var params = base.getChecks('cb').val;
		base.confirm({
			label:"删除",
			text:"<div style='text-align:center;font-size:13px;'>确定删除?</div>",
			confirmCallback:function(){
				common.submit({
					url:$.path+"/api/sysmessage/deleteSysMessage",
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
			
		})
	}
	//标记未读为已读
	var gridRead = function(){
		var params = base.getChecks('cb').val;
		common.submit({
			url:$.path+"/api/sysmessage/updateSysMessageIsRead",
			params:params,
			type:"post",
			callback:function(data){
				if(data.code==0){
					data.message="标记未读为已读成功"
				}else{
					data.message="标记未读为已读失败"
				}
				common.search(grid);
			}
		});
	}
	//单击内容将未读变为已读或者如果是未读 且是待办事项的要跳转
	var changeStatus = function(){
		$("#msg").find("tbody").on("click","td",function(){
			var idList =[];
			var that = $(this);
			if(that.find(".notread").length>0){
				var id = that.parents("tr").find("td:first .cb").attr("cid");
				idList.push(id);
			}
			if(idList.length>0){
				base.ajax({
					url:$.path+"/api/sysmessage/updateSysMessageIsRead",
					params:idList,
					type:"post",
					success:function(data){
						if(data.code==0){
							data.message="标记已读成功"
						}else{
							data.message="标记已读失败"
						}
						if(that.find(".notdo").length<1){
							common.search(grid);
						}
					}
				})
			}
			if(that.find(".notdo").length>0){
				var menuid = that.find(".notdo").attr("csrc");
				mainApp.loadPage(menuid)//id即可
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
			setGrid();
			setGridButton();
			setSearch();
			setReset();
			setContent();
			changeStatus();
		}
	}
})
