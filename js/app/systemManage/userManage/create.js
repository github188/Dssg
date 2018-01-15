define(["base","app/commonApp"],function(base,common){
	//获取用户角色
	var getUserRole = function(){
		$.ajax({
			type:"get",
			url:$.path+"/api/sysroles/findRoleList",
			success:function(data){
				base.template({
					container:$(".userRole"),
					templateId:"userRole-tpl",
					data:data.data
				})
			}
		})
	}
	//检查是否重名
	var checkName = function(){
		$("#form").find("input[name='loginName']").on("blur",function(){
			if($(this).val()){
				var params = {loginName:$(this).val()}
				base.ajax({
					type:"get",
					url:$.path+"/api/sysuser/checkLoginName",
					params:params,
					success:function(data){
						if(data.code=="0"){
							if(data.data){
								$(".checkName").attr("cstate",true);
							}else{
								$(".checkName").attr("cstate",false);
								base.requestTip({position:'center'}).error("用户名重复");	
							}
						}
					}
				})
			}
		})
	}
	return {
		main:function(){
			checkName();//检查是否重名
			getUserRole();
		}
	}
})
