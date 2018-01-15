define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey = null;
	var treeClickEvent = function(event,treeId,treeNode){
		treeKey = treeNode;
		$(treeData).each(function(i,o){
			if(treeNode.id==o.id){
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
			url:$.path+"/api/syselocalquipment/findCompanyAndEquipmentToTree",
			type:"get",
			success:function(data){
				treeData = data.data;
				treeData.push({name:"全部",id:"0",pid:"-1"});
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
					data:common.mergeTreeData(treeData,"-1"),
					selectNodeId:"0"
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
					target:$("#rightPage")
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
		pagingType: "full_numbers",
		ajax:{
				url:$.path+"/api/syselocalquipment/findSysEquipmentByPage",
				type:"get",
				contentType:"application/json",
				xhrFields: {withCredentials: true},
				data:function(d){
					var ids = treeKey.id == 0 ?'':treeKey.id;
					return common.getParams(d,$("#search-form"))+"&companyId="+ids;
				}
		},
		columns:[
			{ "data": "company","sWidth":"16%"},
			{ "data": "name","sWidth":"16%"},
			{ "data": "identifyication","sWidth":"16%"},
			{ "data": "publicIp","sWidth":"16%"},
			{ "data": "centerFlag","sWidth":"16%"},
			{ "data": "status","sWidth":"10%"},
			{ "data": "type","sWidth":"10%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<a href='#' class='equipmentDetail' cid='"+row.id+"'>"+row.identifyication+"</a>"; 
              }, 
               "targets":2 
           },
           {"render":function(data,type,row,meta){
                 if(row.centerFlag==1){
                 	return "管理节点";
                 }else{
                 	return "接入节点";
                 }
              }, 
               "targets":4 
           },
           {"render":function(data,type,row,meta){
                 switch(row.status){
                 	case '0':
                 		return "正常";
                 		break;
                 	case '-1':
                 		return "退网";
                 		break;
                 	case '1':
                 		return "掉线";
                 		break;
                 }
              }, 
               "targets":5 
           },
           {"render":function(data,type,row,meta){
           		if(data == 1){
           			var url = $.path+"/api/syselocalquipment/downCerFile?publicip="+row.publicIp;
           			return "<a href="+url+" class='iconBg'><i class='fa fa-download'></i></a>"
           		}else{
           			return "<div>--</div>";
           		}
                 
              }, 
               "targets":6 
           }
        ],
        drawCallback:function(setting){
        	$(".equipmentDetail").click(function(){
        		equipmentDetail(this);
        	})
        	common.selectedTr($("#example"));
        }
	};
	/**画表格**/
	var setGrid = function(para){
			grid = base.datatables({
				container:$("#example"),
				option:gridOption,
				filter:common.gridFilter
			});	
	};	
	/**设置表格各个按钮操作**/
	var setGridButton = function(){
	};
	/*设备列表详情*/
	var equipmentDetail=function(para){
		var modal = base.modal({
			width:800,
			height:400,
			label:"详情",
			url:"../html/cdmaEvdoManage/equipmentManageDetail.html",
			buttons:[
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){
						/**3.关闭模态窗**/
						modal.hide();
					}
				}
			],
			callback:function(){
				var params = $(para).attr("cid");
				$.ajax({
					type:"get",
					url:$.path+"/api/syselocalquipment/findSysEquipmentByIdInfo?id="+params,
					xhrFields: {withCredentials: true},
					success:function(d){
						var form = $("#form");
						for(var a in d.data){
							if(d.data[a]){
								if(a == "centerFlag"){
									var text = d.data[a]==1?"管理节点":"接入节点";
									form.find(".centerFlag").text(text)
								}else{							
									form.find("."+a).text(d.data[a])
								}
							}else{
								form.find("."+a).text("--")
							}
						}

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
			grid = null;
			setContent();
			setTreebar();
			setGridButton();
		}
	};
});