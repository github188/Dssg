define(["base","app/commonApp","fileinput","fileinputZh"],function(base,common,fileinput){
	//$.path+"/api/sysAuth/downloadPower"
	//下载
	function load(){
		$("#load").off().on("click",function(){
		window.location.href=$.path+"/api/sysAuth/downloadPower";
	})
	}
	return {
		main:function(){
			load();//下载
			//_authorization();
		}
	}
})
