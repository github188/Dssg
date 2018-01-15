define(["base","app/commonApp"],function(base,common){
	//获取用户角色
	var getUserRole = function(){
		$.ajax({
			type:"get",
			url:"../json/sysManage/userManage/userRole.json",
			success:function(data){
				base.template({
					container:$(".userRole"),
					templateId:"userRole-tpl",
					data:data.data
				})
			}
		})
	}
	//获取用户
	var getUser = function(){
		$.ajax({
			type:"get",
			url:"../json/sysManage/userManage/view.json",
			success:function(data){
				$.each(data,function(key,val){
					$("[name='"+key+"']").val(val)
				})
			}
		})
	}
	return {
		main:function(){
			getUserRole();
			getUser();
		}
	}
})
