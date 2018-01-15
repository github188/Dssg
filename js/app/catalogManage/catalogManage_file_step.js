define(["base","app/commonApp","cookies"],function(base,common){
	var setContent = function(){
		var id = $(".check_id").val();
		if(id){
			base.ajax({
				url:$.path+"/api/resCatalog/findResourceByID?id="+id,
				type:"get",
				success:function(d){
					var params = d.data;
					delete params.resType;
					base.form.init(params,$("#form1"));
					base.form.init(params,$("#form2"));
					$("#themeName").val(params.themeTypeName);
					$("#themeName").attr("tid",params.themeType);
					$("#industryTypeName").val(params.industryTypeName);
					$("#industryTypeName").attr("tid",params.industryType);
					
					if(params.filePath){//图片
						$(".ui-page-headingImage").attr("src",$.path1+params.filePath)
					}else if(params.pictureUrl){
						$(".ui-page-headingImage").attr("src",$.path1+params.pictureUrl)
					}else{
						$(".ui-page-headingImage").attr("src","../images/default.png")
					}
//					var filePath = params.filePath?params.filePath:params.pictureUrl;
//					$(".ui-page-headingImage").attr("src",$.path1+filePath);
					if(params.realFileName){
						$("#fileName").html(params.realFileName+"<i class='fa fa fa-trash-o fileNameRemove'></i>");
					}
					if(params.state==5 || params.state == 3){
						var d = ['linkman','resType','catalogUnit','phone','apiType','resName','resEname','resCode','resLevel','ui-treeSelect']
						common.disableInput(d);
					}
				}
			})
		}
	}
	return {
		main:function(){
			setContent();
		}
	}
})
