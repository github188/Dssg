define(["base","app/commonApp"],function(base,common){
	//表格
	var grid = null;
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		paging:false,
		info:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/exchangeErrorLog/findExchangeErrorLog",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				var taskId = $(".errorInfo").attr("taskId");
				var resourceId =$(".errorInfo").attr("resId");
				var params = {taskId:taskId,resourceId:resourceId};
				return params
			}
		},
		columns:[
			{ "data": "EXCEPTIONINFO","sWidth":"25%"},
			{ "data": "EXCEPTION","sWidth":"25%"},
			{ "data": "EXCEPTIONDATA","sWidth":"25%"},
			{ "data": "CREATETIME","sWidth":"25%"},
		]
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#viewTable"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	return {
		main:function(){
			setGrid();
		}
	}
})
