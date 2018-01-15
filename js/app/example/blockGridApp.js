define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var getButton = function(status,id){
		var s = "";
		switch(status){
			case 1://未审核
				s = "<button rid='"+id+"' type='subscribe' class='btn btn-default disabled'>评论</button>"+
					"<button rid='"+id+"' type='cancel' class='btn btn-warning'>撤销</button>"+
					"<button rid='"+id+"' type='delete' class='btn btn-warning'>删除</button>";
			break;
			
			case 2://待审核
				s = "<button rid='"+id+"' type='subscribe' class='btn btn-default disabled'>评论</button>"+
					"<button rid='"+id+"' type='cancel' class='btn btn-default disabled'>撤销</button>"+
					"<button rid='"+id+"' type='delete' class='btn btn-default disabled'>删除</button>";
			break;
			
			case 3://已审核
				s = "<button rid='"+id+"' type='subscribe' class='btn btn-warning'>评论</button>"+
					"<button rid='"+id+"' type='cancel' class='btn btn-default disabled'>撤销</button>"+
					"<button rid='"+id+"' type='delete' class='btn btn-default disabled'>删除</button>";
			break;
			
			case 4://已撤销
				s = "<button rid='"+id+"' type='subscribe' class='btn btn-default disabled'>评论</button>"+
					"<button rid='"+id+"' type='cancel' class='btn btn-default disabled'>撤销</button>"+
					"<button rid='"+id+"' type='delete' class='btn btn-warning'>删除</button>";
			break;
		}
		return s;
	};
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		ajax:{
				url:"../json/blockGrid.json",
				type:"get",
				contentType:"application/json",
				data:function(d){
					/**base库专门获取表单参数的方法**/
					var params = base.form.getParams($("#search-form"));
					/**传统jquery的序列化**/
					//var params = $("#form").serialize();
					if(params){
						$.extend(d,params); 
					}
					return JSON.stringify(d); 
				}
		},
		columns:[
			{ "data": "data","sWidth":"100%"}
		],
		
		columnDefs:[ 
           {
				"render":function(data,type,row,meta){
					var row = row.data;
					var starCont = common.getStar(row.star);
					var buttons = getButton(row.status,row.id);
					
					var content = "<div class='ui-blockGrid-item'>"+
						"<ul>"+
							"<li type='photo' class='col-md-2'>"+
								"<img src='"+row.photo+"'/>"+
								"<span class='ui-starbar'>"+starCont+"</span>"+
							"</li>"+
							"<li type='info' class='col-md-8'>"+
								"<ul class='ui-blockGrid-content'>"+
									"<li type='title'>"+row.title+"<span class='ui-datetime'>（"+row.datetime+"）</span>"+"</li>"+
									"<li>"+row.content+"</li>"+
									"<li>"+
										"<div class='ui-tag blue'><i class='fa fa-handshake-o'></i><span>"+row.interestCount+"</span></div>"+
										"<div class='ui-tag red'><i class='fa fa-cloud-download'></i><span>"+row.subscribeCount+"</span></div>"+
									"</li>"+
								"</ul>"+
							"</li>"+
							"<li type='buttons' class='col-md-2'>"+
								buttons+
							"</li>"+
						"</ul>"+
					"</div>";
					return content; 
              	}, 
				"targets":0 
            } 
        ],
        drawCallback:function(setting){
        }
	};
	
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
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");
			$("#status").val(key);
			common.search(grid);
		});
	};
	
	return {
		main:function(){
			setGrid();
			setLinkGroup();
			setSearch();
			setReset();
		}
	};
});