define(["base","app/commonApp","select2"],function(base,common,select2){
	//提交
	var ntpSubmit = function(){ 
		$(".search").on("click",function(){
			var params = $(".select2").val();
			base.ajax({
				url:$.path+"/api/syssyntimerecord/synNtpServerTime?address="+params,
				type:"get",
				success:function(data){
					if(data.data.status=="success"){
						base.requestTip({position:"center"}).success("同步成功")
					}else{
						base.requestTip({position:"center"}).error("同步失败")
					}
					ntpSynTime()
					select2Input()
				}
			});
		});
	};

	//查询最后同步成功的时间
	var ntpSynTime = function(){ 
		base.ajax({
			url:$.path+"/api/syssyntimerecord/getSynNtpServlerTime ",
			type:"get",
			success:function(data){
				$(".sbtberr").hide();
				$(".sbtbsuc").hide();
				if(!data.data || JSON.stringify(data.data) =="{}"){
					$(".sbtbsuc").show().html("本设备未与任何设备进行同步");
					$(".tbsj").find('span').html("本设备未与任何设备进行同步");
				}else if(data.data){
					if(data.data.status =="0"){
						$(".sbtberr").show().find('span').html(data.data.serverUrl);
					}else{
						$(".sbtbsuc").show().find('span').html(data.data.serverUrl);
					}
					$(".tbsj").find('span').html(data.data.synTime);
				}
			}
		})

	};
	//渲染下拉框内容的地方
	var select2Input = function(){
		base.ajax({
			url:$.path+"/api/syssyntimerecord/getSynNtpGroupListInfo",
			type:"GET",
			success:function(data){
				if(data.code !="0") return ;
				if(data.data.length>0){
					var option ="";
					for(var i=0;i<data.data.length;i++){
						option += "<option>"+data.data[i].serverUrl+"</option>"
					}
					$("#ntp").empty().append(option)
				}
			}
		})
		
	}
	var setMarginTop = function(){
		var parentH = $(".setMarginTop").parent().height();
		var marginTop =(parseFloat(parentH) - 200)/2;
		$(".setMarginTop").css({
			"margin-top":marginTop+"px"
		})
	}
	return{
		main:function(){
			if($(".select2")){
				$(".select2").select2({
					 tags: true
				});
			}
			ntpSubmit();
			ntpSynTime();
			setMarginTop();
			select2Input();
		}
	}
})