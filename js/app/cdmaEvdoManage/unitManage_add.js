define(["base","app/commonApp"],function(base,common){
	return {
		main:function(){
			if($("#button_type").val()==1){
				var params = $(".ui-grid .cb:checked").attr("cid");
					params = JSON.parse(params);
				$("#unit_name").val(params.nuitName);
				$("#unit_code").val(params.nuitCode);
				$("#remark").val(params.remark);
			}
		}
	};
});