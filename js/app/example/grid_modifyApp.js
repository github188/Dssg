define(["base","app/commonApp"],function(base,common){
	var initForm = function(){
		base.ajax({
			url:"../json/grid_modify.json",
			type:"get",
			success:function(data){
				if(data.code=="0"){
	        		var formData = data.data;
					base.form.init(formData,$("#form"));
        		}
			}
		})
	};
	return {
		main:function(){
			//initForm();
		}
	};
});