define(["base","app/commonApp"],function(base,common){
	//获取用户
	var getUser = function(){
		$.ajax({
			type:"get",
			url:"../json/sysManage/userManage/view.json",
			success:function(data){
				$.each(data,function(key,val){
					if(val){
						$("."+key).html(val)
					}else{
						$("."+key).html("--")
					}
				})
			}
		})
	}
	return {
		main:function(){
			getUser();
		}
	}
})
