define(["base","app/commonApp"],function(base,common){
	function setContent(){
		/**设置时间控件**/
		var loginInfo = common.getCookis();
		$("#submitCompany").val(loginInfo.loginUserProfileDTO.currentEquipment.name);
		$("#submitUser").val(loginInfo.loginUserProfileDTO.currentEquipment.contacts);
		base.form.date({
			element:$(".date"),
			isTime:true,
			dateOption:{
				value: base.getNowTime()			
			}
		});
//		if($("#button_type").val()==1){
//			var params = $(".ui-grid .cb:checked").attr("cid");
//			params = JSON.parse(params);
//			$("#data_name").val(params.dataName);
//			$("#data_english_name").val(params.dataEnglishName);
//			$("#data_code").val(params.dataCode);
//			$("#data_classify").val(params.dataType);
//			$("#data_length").val(params.dataLength);
//		}
		/*搜索框下拉*/
		$.ajax({
			url:$.path+"/api/sysBussinessDictionary/findDictionaryByType",
			data:JSON.stringify({type: 3,name:"classify"}),
			type:"post",
			async:false,
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			success:function(d){
				$(d.data.classify).each(function(i,o){
					$("#data_classify").append("<option value='"+o.key+"'>"+o.label+"</option>");
					if(o.children.length>0){
						$.each(o.children, function(n,d) {
							$("#data_classify").append("<option value='"+o.key+"'>"+o.label+"</option>");
						});
					}
				})
			}
		})
		$.ajax({
			url:$.path+"/api/sysCenterBussinessDictionary/findCenterDictionaryByType",
			data:JSON.stringify({type: 6,name:"dictionaryId"}),
			type:"post",
			contentType:"application/json",
			async:false,
			xhrFields: {withCredentials: true},
			success:function(d){
				$(d.data.dictionaryId).each(function(i,o){
					$("#dictionaryId").append("<option value='"+o.key+"'>"+o.label+"</option>")
				})
			}	
		})
		
		/*显示隐藏表单元素*/
		$("#isDictionary").change(function(){changeForm();})
		$("#data_type").change(function(){changeForm1();})
	}
	var changeForm = function(){
		var elemen = $(".user_dictionary[name='dictionaryId']");
		var role = elemen.attr("role")?elemen.attr("role"):elemen.attr("roles");
		if($("#isDictionary").val()=='1'){
			$(".user_dictionary").hide();
			$("#dictionaryId").attr("name","");
			elemen.removeAttr('role').attr('roles',role);
		}else{
			$(".user_dictionary").show();
			$("#dictionaryId").attr("name","dictionaryId");
			elemen.removeAttr('roles').attr('role',role)
		}
	}
	var changeForm1 = function(){
		var elemen = $(".data_length[name='dataLength']");
		var role = elemen.attr("role")?elemen.attr("role"):elemen.attr("roles");
		if($("#data_type").val()==3 || $("#data_type").val()==12 || $("#data_type").val()==4){
			$(".data_length").show();
			elemen.removeAttr('roles').attr('role',role)
		}else{
			$(".data_length").hide();
			elemen.removeAttr('role').attr('roles',role);			
		}
	}
	function setFormValue(){
		var checkboxTrue = base.getChecks("cb").val;		
		
		if(checkboxTrue.length==1){
			var params = JSON.parse($(".ui-grid .cb:checked").attr("cid"));
			var id = $(".ui-grid .cb:checked").val();
			base.form.init(params,$("#form"));
			base.ajax({
				url:$.path+"/api/resCenterDataElement/checkDataUse",
				type:"post",
				params:[id],
				success:function(d){
					if(d.data){
//						$("#form select[name='classify']").attr("disabled","disabled");
						$("#form select[name='isDictionary']").attr('disabled','disabled');
						$("#form select[name='dictionaryId']").attr('disabled','disabled');
						$("#form input[name='code']").attr('disabled','disabled');
						$("#form input[name='versionNumber']").attr('disabled','disabled');
						$("#form select[name='dataType']").attr('disabled','disabled');
					}else{
						$("#form input[name='code']").attr('disabled','disabled');
					}
				}
			})
		}
		changeForm();
		changeForm1();
	}
	return {
		main:function(){
			setContent();
			setFormValue();
		}
	};
});