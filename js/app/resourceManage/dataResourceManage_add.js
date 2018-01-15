define(["base","app/commonApp"],function(base,common){
	var setModule = function(){
		$("#type").change(function(){
			changeModule($(this).val())
		})
		if($("#click_but_type").val()==""){
			changeModule($("#type").val(),false)
		}
	}
	var changeModule=function(para,modify,isUse){
		$("#form .tbody").empty();
		$("#form .tfoot").empty();
		if(para==1){
			$("#form .tbody").append('<tr>'+
							'<td class="title" style="width:20%"><span class="required"></span>数据库类型</td>'+
							'<td>'+
								'<select class="form-control" name="dbType" role="{required:true}">'+
							    	'<option value="Oracle">Oracle</option>'+
							    	'<option value="MySQL">MySQL</option>'+
							    	'<option value="MSSQL">SQLServer</option>'+
							    '</select>'+
							'</td>'+
							'<td class="title" style="width:20%"><span class="required"></span>数据库实例名称</td>'+
							'<td>'+
								'<input type="text" name="dbInstanceName" class="form-control" placeholder="请输入数据库实例名称" role="{required:true}"/>'+
							'</td>'+
						'</tr>');
						
				$(".ftpHide").show();
				$(".ftpShow").hide();
		}else{
			
			$("#form .tbody").append('<tr>'+
				'<td class="title" style="width:20%"><span class="required"></span>传输协议</td>'+
				'<td>'+
					'<select class="form-control" name="ftpType" role="{required:true}">'+
			    	'<option value="1">FTP</option>'+
			    	'<option value="2">SMB</option>'+
			    '</select>'+
				'</td>'+
				'<td class="title ftpHide" style="width:20%"><span class="required"></span>文件服务器编码</td>'+
				'<td class="ftpHide">'+
					'<select class="form-control" name="unicode" role="{required:true}">'+
			    	'<option value="1">GBK</option>'+
			    	'<option value="2">UTF-8</option>'+
			    	'<option value="3">GB2312</option>'+
			    '</select>'+
				'</td>'+
				'<td class="title ftpShow" style="width:20%;display:none" ><span class="required"></span>服务器IP地址</td><td class="ftpShow"  style="display:none"><input type="text" name="ip" class="form-control ip_address" placeholder="请输入服务器IP地址" role="{required:true,ip:true}"/></td>'+
			'</tr>')
			$("#form .tfoot").append('<tr>'+
				'<td class="title" style="width:20%"><span class="required"></span>文件路径</td>'+
				'<td>'+
					'<input type="text" name="ftpAddress" class="form-control" placeholder="请输入文件路径" role="{required:true}" value="/"/>'+
				'</td>'+
			'</tr>');
			
			$("select[name='ftpType']").on("change",function(){
				if($(this).val() =="1"){
					$(".ftpHide").show();
					$(".ftpShow").hide();
					return
				}
				$(".ftpHide").hide();
				$(".ftpShow").show();
			})
		}
		if(isUse && isUse=="true"){
			if(modify == true&& para=="1"){
				$("#form select[name='type']").attr("disabled","disabled")
				$("#form select[name='dbType']").attr("disabled","disabled")
			}else if(modify ==true && para=="2"){
				$("#form select[name='type']").attr("disabled","disabled")
				$("#form select[name='ftpType']").attr("disabled","disabled")
			}
		}
	}
	var loading = function(){
		if($("#click_but_type").val()=="1"){
			var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
			var isUse = $("#isUse").attr("name");//true 为已被使用，要禁止更改，反之亦然
			changeModule(params.type,true,isUse)
			base.form.init(params,$("#form"));
			$("select[name='ftpType']").change();
		}			
	}
	return {
		main:function(){
			setModule();
			loading();
		}
	};
});