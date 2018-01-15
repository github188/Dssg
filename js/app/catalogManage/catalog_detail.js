define(["base","app/commonApp"],function(base,common){
	var setContent = function(){
		if($("#catalog_detail").val()){
			var params = $("#catalog_detail").val();
		}else{
			var params = $(".modal").attr("id");
		}
		base.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+params,
			type:"get",
			success:function(d){
				var data = d.data;
				var pictureUrl = null;
				if(data.filePath){
					pictureUrl=$.path+"/dssg/"+data.filePath;	
				}else if(data.pictureUrl){
					pictureUrl=$.path+"/dssg/"+data.pictureUrl;
				}else{
					pictureUrl ="../images/default.png"
				}
				$(".ui-page-headingImage").attr("src",pictureUrl);
				switch(data.resType){
					case '1':
						$(".api-type").hide();
						var dbJson = JSON.parse(data.dbJson);
						var trs = "";
						if(dbJson!=null){
							$.each(dbJson,function(i,o){
								trs+= "<tr><td>"+common.interceptString(o.name)+"</td>"+
										"<td>"+(o.ename).substring(4)+"</td>"+
										"<td>"+o.code+"</td>"+
										"<td>"+common.typeSelect(o.type)+"</td>"+
										"<td>"+(function(){return o.length?o.length:'--'})()+"</td>"+
										"<td>"+(function(){return o.dataCode?o.dataCode:'--'})()+"</td></tr>";
							})
							$(".db-type .db-tbody").append(trs)
						}
						
						break;
					case '2':
						$(".db-type").hide();
						$(".api-type").hide();
						break;
					case '3':
						$(".db-type").hide();
						var apiJson = JSON.parse(data.apiJson);
						var requestParams = apiJson.requestParams;
						var responseStruct = apiJson.responseStruct;
						$.each(requestParams,function(i,o){
							var trs= "<tr><td>"+common.interceptString(o.name)+"</td>"+
									"<td>系统参数</td>"+
									"<td>"+(function(){return o.mandatory==1?'是':'否'})()+"</td>"+
									"<td>"+common.interceptString(o.desc)+"</td></tr>";
							$(".api-type .in-tbody").append(trs)
						})
						$.each(responseStruct,function(i,o){
							var trs= "<tr><td>"+common.interceptString(o.name)+"</td>"+
									"<td>"+common.typeSelect(o.type)+"</td>"+
									"<td>"+(function(){return o.notNull==1?'是':'否'})()+"</td>"+
									"<td>"+common.interceptString(o.desc)+"</td></tr>";
							$(".api-type .out-tbody").append(trs)
						})
						break;
				}
				/*赋值*/
				$(".res-check-common .companyName").text(data.companyName);
				$(".res-check-common .equipmentName").text(data.equipmentName);
				$(".res-check-common .linkman").text(data.linkman);
				$(".res-check-common .phone").text(data.phone?data.phone:'');
				$(".res-check-common .doMainName").text(data.doMainName);
				$(".res-check-common .catalogName").text(data.catalogName);
				$(".res-check-common .resType").text(dataType(data.resType));
				$(".res-check-common .updateTime").text(data.updateTime);
				$(".res-check-common .resName").text(data.resName);
				$(".res-check-common .abstracts").text(data.abstracts?data.abstracts:"");
				$(".res-check-common .resCode").text(data.resCode);
				$(".res-check-common .resEname").text(data.resEname);
				$(".res-check-common .resLevel").text(data.resLevel==1?"部分共享":"完全共享");
				$(".res-check-common .themeTypeName").text(data.themeTypeName);
				$(".res-check-common .industryTypeName").text(data.industryTypeName);
				$(".res-check-common .catalogName").text(data.catalogName);
				$(".res-check-common .updateCycle").text(data.updateCycle?data.updateCycle:"--");
			}
		});
	}
	var dataType = function(d){
		switch(d){
			case '1':
				return "数据库";
				break;
			case '2':
				return "文件";
				break;
			case '3':
				return "API";
				break;
		}
	}
	return {
		main:function(){
			setContent();
		}
	};
})