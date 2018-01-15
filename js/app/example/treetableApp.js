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
				url:"../json/treetable.json",
				type:"get",
				contentType:"application/json",
//				data:function(d){
//					return common.getParams(d,$("#search-form"));
//				}
		},
		columns:[
			{ "data": "id","sWidth":"10%","type":"checkbox"},
			{ "data": "name","sWidth":"20%"},
			{ "data": "code","sWidth":"20%"},
			{ "data": "description","sWidth":"50%"}
			
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cb' value='"+row.id+"' class='cb' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
           }
        ],
        fnCreatedRow: function(nRow, aData, iDataIndex) {
        	$(nRow).attr("data-tt-id",aData.id);
        	$(nRow).attr("data-tt-parent-id",aData.pid);
        	$(nRow).attr("rootRow",iDataIndex);
        },
        drawCallback:function(setting){
        	

        	/**设置 treetable**/
        	common.treeTable(setting);
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
	return {
		main:function(){
			setGrid();
		}
	};
});