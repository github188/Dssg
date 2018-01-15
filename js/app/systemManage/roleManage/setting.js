define(["base","app/commonApp"],function(base,common){
	//获取配置的菜单
	function getSetting(){
		var setArr=[];
		base.ajax({
			url:"../json/menu2.json",
			type:"get",
			async:false,
			success:function(data){
				menuMapData = base.arrayToMap(data,"root",true);
				menuArrayData = base.mapToArray(menuMapData,"root");
				base.template({
					container:$(".ui-set"),
					templateId:"set-tpl",
					data:menuArrayData,
					callback:function(data){
						if(data.code==0){
							data.message="获取菜单成功"
						}else{
							data.message="获取菜单失败"
						}
					}
				})
			}
		})
	}
	return{
		main:function(){
			getSetting()
		}
	}
	
})
