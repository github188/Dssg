define(["base","app/commonApp"],function(base,common){
	
	var initForm = function(){
		base.ajax({
			url:"../json/grid_modify.json",
			type:"get",
			success:function(data){
				if(data.code=="0"){
					
				}else{
					base.requestTip().error(data.message);
				}
			}
		});
	};
	
	return {
		main:function(){
			
		}
	};
});