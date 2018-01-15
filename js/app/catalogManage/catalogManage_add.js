define(["base"],function(base){
	return {
		main:function(){
			if($("#button_type").val()==1){
				var params = $(".ui-grid .cb:checked").attr("cid");
				params=JSON.parse(params)
				$("#catalog_name").val(params.name);
				$("#catalog_code").val(params.catalogCode);
				$("#catalog_audit_name").val(params.catalogAuditName);
				$("#phone_number").val(params.phoneNumber);
			}
		}
	};
});