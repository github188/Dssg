define(["base","app/commonApp"],function(base,common){
	return {
		main:function(){
			
			if($("#button_type").val()==1){
				var params = $(".ui-grid .cb:checked").attr("cid");
				params = JSON.parse(params);
				$("#resource_name").val(params.resourceRegionName);
				$("#field_manager").val(params.regionManage);
				$("#phone_number").val(params.phoneNumber);
			}else{
				var loginInfo = common.getCookis();
				$("#contacts").val(loginInfo.loginUserProfileDTO.currentEquipment.contacts);
				$("#telphone").val(loginInfo.loginUserProfileDTO.currentEquipment.telphone);
			}
		}
	};
});