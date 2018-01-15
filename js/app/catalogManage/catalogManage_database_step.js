define(["base","app/commonApp","cookies"],function(base,common){
//	var setContent = function(){
//		var id = $(".check_id").val();
//		if(id){
//			base.ajax({
//				url:$.path+"/api/resCatalog/findResourceByID?id="+id,
//				type:"get",
//				success:function(d){
//					var params = d.data;
//					delete params.resType;
//					base.form.init(params,$("#form1"));
//					base.form.init(params,$("#form2"));
//					$("#themeName").val(params.themeTypeName);
//					$("#themeName").attr("tid",params.themeType);
//					$("#industryTypeName").val(params.industryTypeName);
//					$("#industryTypeName").attr("tid",params.industryType);
//					var dbJson = JSON.parse(d.data.dbJson)
//				}
//			})
//		}
//	}
	return {
		main:function(){
//			setContent();
		}
	}
})
