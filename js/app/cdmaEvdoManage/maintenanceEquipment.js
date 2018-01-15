define(["base","app/commonApp"],function(base,common){
	var treeClickEvent = function(event,treeId,treeNode){
		var self = true;
		if(treeNode.iseq){
			$("#listAdd li").each(function(i,o){
				if($(o).attr("cid") == treeNode.id){
					var requestTip = base.requestTip({position:"center"});
		                requestTip.error("请不要重复添加设备");
		                self = false;
				}
			})
			if(self){
				$("#listAdd").append('<li cid="'+treeNode.id+'">'+treeNode.name+'<i class="fa fa-trash-o"></i></li>')			
			}
		}
		
	};
	var setModalTreebar = function(){
		base.ajax({
			url:$.path+"/api/domain/findDomainResByEquipmentTree",
			type:"get",
			success:function(data){
				treeData = data.data;
				tree = base.tree({
					container:$("#modalTreebar"),
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
					data:common.mergeTreeData(data.data,"-1"),
				});
				$.each(treeData, function(i,o) {
					if(o.current){
						$("#listAdd").prepend('<li cid="'+o.id+'">'+o.name+'  (本设备必选)</li>')
					}
				});
			},
			beforeSend:function(){
				base.loading($("#modalTreebar"));
			}
		});
		base.scroll({
			container:$("#treeModalAside")
		});
	};
	var setModalContent = function(){
		$("#listAdd").on("click","i",function(){
			var self = this
			base.confirm({
				text:"确认删除设备吗？",
				confirmCallback:function(){
					$(self).parent().remove();
				}
			});
		})
	}
	return {
		main:function(){
			setModalTreebar();
			setModalContent();
		}
	};
});