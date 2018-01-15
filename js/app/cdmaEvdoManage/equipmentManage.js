define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var tree = null;
	var treeData = null;
	var treeKey = null;
	var treeClickEvent = function(event,treeId,treeNode){
		common.initButtonbar($(".ui-grid-buttonbar"))
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
			url:$.path+"/api/syscenterequipment/findEquipmentTree",
			type:"get",
			success:function(data){
				treeData = data.data;
				treeData.unshift({name:"全部",id:"0",pid:"-1"});
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
				url:$.path+"/api/syscenterequipment/findSysCenterEquipmentByPage",
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
           			var url = $.path+"/api/syscenterequipment/downCerFile?publicip="+row.publicip;
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
		$(".ui-grid-buttonbar .delete").on("click",function(){
			if($(this).hasClass("disabled")){
				return;
			}else{
				gridDelete();
			}
		});
		$(".export").click(function(){
			$("#file").trigger("click");
		})
		/*导入*/
		$("#file").change(function(){
			var target = this;
			var requestTip = base.requestTip({position:"center"});
			 var fileName = document.getElementById("file").value;
	            idx = fileName.lastIndexOf(".");   
	            ext = fileName.substr(idx+1).toUpperCase();   
	            ext = ext.toLowerCase( ); 
	            if (ext != 'rar' ){
	                requestTip.error("您只能上传rar压缩文件！"); 
	                return;  
	            }   
		        var fileSize = 0;  
		        if ( !target.files){       
		            var filePath = target.value;
		            var fileSystem = new ActiveXObject("Scripting.FileSystemObject");  
		            var file = fileSystem.GetFile (filePath);       
		            fileSize = file.Size;      
		        } else {      
		            fileSize = target.files[0].size;       
		        }     
		    
		    
		        var size = fileSize / (1024);   
		        
		        if(size>(1024*20)){    
		            requestTip.error("文件大小不能超过20KB");  
		            return;
		        }
		    
			var url1=new FormData($('#uploadForm')[0])
			$.ajax({
			    url: $.path+'/api/syscenterequipment/getEquimentCerInfo',
			    type: 'POST',
			    cache: false,
			    data: url1,
			    processData: false,
			    contentType: false,
			    xhrFields: {withCredentials: true},
			    success:function(d){
					if(d.success){
						if(d.data.status == "success"){
							if(d.data.res){			
								uploadCallBack(JSON.stringify(d.data.res));
							}
						}else{
							requestTip.error(common.getUploadInfo(d.data.status))
						}
					}else{
						requestTip.error("导入失败");
					}
			    }
			})
		})
	};
	/*证书上传成功后展示modal*/
	function uploadCallBack(d){
		var datas = JSON.parse(d)
		var modal = base.modal({
			width:800,
			height:400,
			label:"详情",
			url:"../html/cdmaEvdoManage/uploadBack.html",
			buttons:[
				{
					label:"确定",
					cls:"btn btn-info",
					clickEvent:function(){
						base.confirm({
						label:"提交",
						text:"是否确认认证该证书吗？",
						confirmCallback:function(){
							datas.companyId = $("#hy").attr("tid");
							datas.companyName = $("#hy").val();
							base.ajax({
								url:$.path+"/api/syscenterequipment/authNodeEquipement",
								params:datas,
								success:function(d){
									if(d.success){
										base.requestTip({position:"center"}).success("认证成功");
									}else{
										base.requestTip({position:"center"}).error("认证失败");
									}
									modal.hide();
								}
							})
						}
					});
					}
				},
				{
					label:"关闭",
					cls:"btn btn-info",
					clickEvent:function(){
						modal.hide();
					}
				}
			],
			callback:function(){
				base.form.init(datas,$("#certificateInfo"));
				base.ajax({
					url:$.path+"/api/rescentercompany/findCenterCompanyTree",
					type:"get",
					success:function(data){
						var treeSelectObj = base.form.treeSelect({
							container:$("#hy"),
							data:data.data,
							multi:true,
							clickCallback:function(event,treeId,treeNode){
								if(treeNode.disabled){
									return false;
								}
								$("#hy").val(treeNode.name);
								$("#hy").attr("tid",treeNode.id);
								treeSelectObj.hide();
							}
						});
					}
				})
			}
		});
	}
	/**批量删除**/
	var gridDelete = function(){
		var params = {"ids":base.getCR("cb",true)};
		/**删除前先弹窗确认是否删除**/
		base.confirm({
			confirmCallback:function(){
				common.submit({
					url:"../json/submitSuccess.json",
					params:params,
					callback:function(d){
						if(d.message=="success"){
							d.message = "删除成功";
						}else{
							d.message = "删除失败";										
						}
						common.search(grid);
					}
				});
			}
		});
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
					url:$.path+"/api/syscenterequipment/findSysCenterEquipmentByIdInfo?id="+params,
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