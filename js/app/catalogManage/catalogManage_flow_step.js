define(["base","app/commonApp","cookies"],function(base,common){
	var setContent = function(){
		var param = $(".ui-grid .cb:checked").val();
		base.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+param,
			type:"get",
			success:function(d){			
				var data = d.data;
				$(".res-check-common .companyName").text(data.companyName);
				$(".res-check-common .equipmentName").text(data.equipmentName);
				$(".res-check-common .linkman").text(data.linkman);
				$(".res-check-common .phone").text(data.phone);
				$(".res-check-common .doMainName").text(data.doMainName);
				$(".res-check-common .catalogName").text(data.catalogName);
				$(".res-check-common .resType").text((function(){
					switch(data.resType){
						case '1':
							return "数据库";
							break;
						case '2':
							return "文件";
							break;
						case '3':
							return "API";
					}
				})());
				$(".res-check-common .updateTime").text(data.updateTime);
				$(".res-check-common .auditorCompany").text(data.auditorCompany?data.auditorCompany:'');
				$(".res-check-common .reviewUserName").text(data.recordDTO.reviewUserName);
				$(".res-check-common .result").text(
					(function(){
						if(data.recordDTO.result==0){
							return "通过";
						}else if(data.recordDTO.result==-1){
							return "未通过";
						}else{
							return " ";
						}
					})
					()
				);
				$(".res-check-common .reviewDesc").text(data.recordDTO.reviewDesc?data.recordDTO.reviewDesc:'');
				$(".res-check-common .reviewTime").text(data.recordDTO.reviewTime?data.recordDTO.reviewTime:'');
			}
		});
	}
	return {
		main:function(){
			setContent();
		}
	};	
})