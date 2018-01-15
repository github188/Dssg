define(["base","app/commonApp"],function(base,common){
	
	//获取元数据信息好和发布预览处信息
	function metaData(){
		var modalId = $(".modal").attr("id");
		$.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+modalId,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(result){
				if(result && result.data){
					$(".apiSaveOption").attr("name",result.data.apiType);
					$.each(result.data,function(k,v){
							if(k=='resType'){
								$("."+k).html('第三方API')
							}else if(k =="recordDTO"){
								$(".subAuditTime").html(v.subAuditTime);
							}else{
								$("."+k).html(v)	
							}
						})
				}
			}
		})
	}
//文件上传接口
	var clickFunction = function(){
		$(".serviceType .interfaceDoc").on("click","#imageBtn",function(){
			var settime = setTimeout(function(){				
				$(".file").click();
			},400)
		})
		$(".file").on("change",function(){
			var url1=new FormData($('#uploadForm')[0]);
			var isName = base.form.getFileName($("#uploadForm .file"));
			var filename = base.form.getFileExtname($("#uploadForm .file"));
			if(filename ==""){base.requestTip({position:"center"}).error("请选择接口文档"); return}
			var issize = base.form.validateFileSize($("#uploadForm .file"),1024);
			if(!issize){base.requestTip({position:"center"}).error("文件大于1M"); return}
			var bool = base.form.validateFileExtname($("#uploadForm .file"),"doc,docx,pdf,xls,txt,xlsx");
			if(!bool){base.requestTip({position:"center"}).error("文件扩展名不对"); return}
			$.ajax({
			    url: $.path+'/api/fileUpload/uploadFile',
			    type: 'POST',
			    cache: false,
			    data: url1,
			    anysc:false,
			    xhrFields: {withCredentials: true},
			    processData: false,
			    contentType: false,
			    success:function(d){
			    	$(".apiDocId").attr("ID",JSON.parse(d).filesId[0]).html(isName);
			    	$(".apiDocId").append('<i class="fa fa fa-trash-o fileNameRemove"></i>');
			    	$(".showDetail .interfaceDoc").html(isName);
			    },
			    error:function(d){
			    }
			})
		})
		$(".apiDocId").on("click",".fileNameRemove",function(){
			$(this).parent("span").empty();
			$(".apiDocId").attr("ID","")
		})
		$(".switchInterface").on("change",function(){
			if($(this).val() == "rest"){
				$(".switchFunc").hide().find("select").empty();
				$(".showTd").show();
				$(".interfaceType").html("rest");
			}else{
				$(".switchFunc").show();
				$(".interfaceType").html("webservice");
				$(".showTd").hide();
			}
			if($(".checkServies").val() && $(".checkServies").val() !=""){
				$(".checkServies").blur()
				$(".interfaceAddress").attr("isBool",'')
			}
		})
		$(".checkServies").on("blur",function(){
			$(".showDetail .interfaceAddress").html($(this).val());
			if($(".switchInterface").val() == "rest"){return ;}	
			if($(this).val()){
				var wsdlURI = {"wsdlURI":$(this).val()};
				$.ajax({
					url:$.path+"/api/resource/wsdl4jParse",
					type:"get",
					data:wsdlURI,
					xhrFields: {withCredentials: true},
					success:function(result){
						if(result &&result .code=="0" && result.data){
							$(".interfaceAddress").attr("isBool",true)
							//取填写url 返回的list列表信息
							var options ="",func="";
							for(var i=0;i<result.data.length;i++){
								options+="<option>"+result.data[i]+"</option>";
								func +=result.data[i]+","
							}
							var fun = func.slice(0,-1);
							$(".interfaceMethod").find("select").empty().append(options);
							$(".showDetail .interfaceAddress").html(wsdlURI.wsdlURI);
							$(".showDetail .interfaceMethod").html(fun)
						}else if(!result.data){
							base.requestTip({position:"center"}).error("接口URL填写不正确");
							$(".interfaceAddress").attr("isBool",false)
						}
					},
					error:function(result){
						base.requestTip({"position":"center"}).error(result.message);
					}
				})
			}
		})
	}

	return {
		main:function(){
			metaData();//获取数据源信息
			clickFunction();
		}
	}
})
