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
			url:$.path+"/api/app/findApplyResourceByAppId",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				var params = {id:base.getCR("cb").attr('cid')};
				return params
			}
		},
		columns:[
			{ "data": "resouceName","sWidth":"15%"},
			{ "data": "dataOrigin","sWidth":"15%"},
			{ "data": "applyTime","sWidth":"15%"},
			{ "data": "requestTime","sWidth":"15%"},
			{ "data": "requestNumber","sWidth":"15%"},
			{ "data": "resultNumber","sWidth":"15%"},
			{ "data": "state","sWidth":"10%"}
		],
		columnDefs:[
			{
			 	"render":function(data,type,row,meta){
			 		var state = row.dataOrigin
			 		if(state == "local"){
			 			return "本地数据库"
			 		}else{			 			
			 			return "第三方"; 
			 		}
	              }, 
	               "targets":1 
         	},
         	{
			 	"render":function(data,type,row,meta){
			 		var state = row.requestNumber;
			 		if(state){
			 			return state
			 		}else{			 			
			 			return "--"; 
			 		}
	              }, 
	               "targets":4 
         	},
         	{
			 	"render":function(data,type,row,meta){
			 		var state = row.resultNumber;
			 		if(state){
			 			return state
			 		}else{			 			
			 			return "--"; 
			 		}
	              }, 
	               "targets":5 
         	},
			{
			 	"render":function(data,type,row,meta){
			 		var state = parseInt(row.state);
					var stateList = ["","待审核","已审核","已拒绝","已撤销","已失效"];
	                 return stateList[state]; 
	              }, 
	               "targets":6 
         	}
		],
		drawCallback:function(setting){
		}
	}
	//画表格
	var setGrid = function(){
		grid = base.datatables({
			container:$("#viewTable"),
			option:gridOption //,
		});
	};
	return {
		main:function(){
			setGrid();
		}
	}
})
