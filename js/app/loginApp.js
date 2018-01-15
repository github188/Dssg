define(["base","app/commonApp","cookies"],function(base,common){
	var setCentent = function(){
		$(".captcha_img").attr("src",$.path+"/api/login/getLoginImageCode")
		$("#login_button").click(function(){
			var param = {
				  "loginName": $("#name").val(),
				  "password": $("#password").val(),
				  "captcha": $("#captcha").val()
			}
			$.support.cors = true;
			$.ajax({
				url:$.path+"/api/login/commonLogin",
				data:JSON.stringify(param),
				type:"post",
				contentType:"application/json",
				xhrFields:{withCredentials:true},
				success:function(d){
					$(".eroor_massage").empty();
					if(d.success){
						$.cookie("dssgUserInfo",JSON.stringify(d.data), { path: '/'})
						window.location.href="html/main.html";
						return;
					}
					if(d.code==10002){
						$("#captcha_info").html(d.message)
					}else{
						$("#userPass_info").html(d.message)
					}
				}
			})
		})
	}
	return {
		main:function(){
			setCentent();
		}	
	};
});