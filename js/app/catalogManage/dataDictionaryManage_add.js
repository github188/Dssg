define(["base"],function(base){
	/**设置上传组件**/
	var setUpload = function(){
		$("#imageBtn").on("click",function(){
			if($("#fileName").html()){	
				base.requestTip({position:"center"}).error("只能上传一个文件！");
				return;
			}
			$("#image").click();
		});
		$(".ui-form-inputGroup").on("change","#image",function(){
			var fileN = $(this).val();
			fileN = fileN.split("\\");
			fileN = fileN.slice(-1);
			$("#fileName").html(fileN +"<i class='fa fa-trash-o' style='margin-left:10px;cursor: pointer;'></i>");
			var url1=new FormData($('#form')[0])
			$.ajax({
			    url:$.path+'/api/fileUpload/uploadFile',
			    type: 'POST',
			    cache: false,
			    data: url1,
			    processData: false,
			    contentType: false,
			    xhrFields: {withCredentials: true},
			    success:function(d){
			    	$("#imageUrl").val(JSON.parse(d).filesId[0]);
			    	$("#image").replaceWith('<input type="file" id="image" name="image" style="display:none" class="form-control" accept="image/gif, image/jpeg,image/png" multiple=""/>');
			    }
			})
		})
		$("#fileName").on("click","i",function(){
			$(this).parent().empty();
			$("#image").replaceWith('<input type="file" id="image" name="image" style="display:none" class="form-control" role="{required:true}"  accept="image/gif, image/jpeg,image/png" multiple=""/>');
		})
	};
	return {
		main:function(){
			if($("#button_type").val()==1){
				var params = $(".ui-grid .cb:checked").val();
				$.ajax({
					url:$.path+"/api/sysCenterBussinessDictionary/getDictionary",
					type:"get",
					data:{id:params},
					xhrFields: {withCredentials: true},
					success:function(d){
						$("#dictionarySum").val(d.data.name);
						$("#code").val(d.data.code).attr("disabled","disabled");
						$("#remark").val(d.data.description);
						$("#image").replaceWith('<input type="file" id="image" name="image" style="display:none" class="form-control" accept="image/gif, image/jpeg,image/png" multiple=""/>');
						$("#imageUrl").val(d.data.imageUrl);
						if(d.data.imageName!=null){
							$("#fileName").html(d.data.imageName+"<i class='fa fa fa-trash-o' style='margin-left:10px;cursor: pointer;'></i>");	
						}
					}
				})				
			}
			setUpload();
		}
	};
});