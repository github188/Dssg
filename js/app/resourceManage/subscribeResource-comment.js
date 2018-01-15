define(["base","app/commonApp"],function(base,common){
	//获取url上面的id
	var rid = window.location.search.split("&")[0].split("=")[1];
	var subscribeId=window.location.search.split("&")[1].split("=")[1]
	var resType=window.location.search.split("&")[2].split("=")[1];
	var pic = null;
	//表格
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/portal/assessment/findUserAssessmentByPage",
			type:"get",
			contentType:"application/json",
			xhrFields: {withCredentials: true},
			data:function(d){
				common.gridPageFliter(d);
				params={"resourceid":rid}
				var paramsA ;
				if(params){
					paramsA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "data","sWidth":"100%"}
		],
		columnDefs:[
			{
				"render":function(data,type,row,meta){
					//布局分为上下两行，top：头像，名字，星星，时间，bottom：评论内容
					var star=common.getStar(Number(row.assessmentScore))
					var html="<ul>"
							+"<li style='height:40px;line-height:40px'>"	
							+"<div style='width:30px;height:30px;float:left;margin:5px 0;'>"
							+"<img src='"+pic+"' style='width:100%;height:100%;border-radius:15px;float:left;'></div>"
							+"<div style='float:left;margin:0 10px'>"+row.assessmentPersonName+"</div>"
							+"<div style='float:left'>"+star+"</div>"
							+"<div class='text-right' style='margin-right:10px'>"+row.submitTime+"</div>"
							+"</li>"
							+"<li>"	
							+"<div style='float:left;text-align:left'>"+row.assessmentContent+"</div>"	
							+"</li>"
							 "</ul>"
					return html;		 
				},
				"targets":0 
			}
		],
		drawCallback:function(setting){
			base.scroll({
					container:$(".ui-page-article")
			});
		}
	}
	function getResMsg(){
		$.ajax({
			type:"post",
			url:$.path+"/api/subscribeReview/ResourceDetailsShow",
			dataType:"json",
			contentType:"application/json;charset=UTF-8",
			data:JSON.stringify({"resourceId":rid,"resType":resType,"subscribeId":subscribeId}),
			xhrFields:{withCredentials:true},
			success:function(result){
				if(result && result.data){
					if(!result.data.enableAssessment){		
						$(".commit").addClass("disabled").attr("disabled","disabled");
					}
					$.each(result.data,function(k,v){
						if(v){
							$("."+k).html(v);
							if(k=="resLevel"){
								switch(v){
									case "1":$(".resLevel").html("部分共享");break;
									case "2":$(".resLevel").html("完全共享");break;
								}
							}
							if(k=="resType"){
								switch(v){
									case "1":$(".resType").html("DATA");break;
									case "2":$(".resType").html("DOC");break;
									case "3":$(".resType").html("API");break;
								}
							}
						}else{
							$("."+k).html("--");
						}
					})
					var star=common.getStar(Number(result.data.assessmentNum))
					$(".starInfo").append(star);
					if(result.data.resPictureUrl){
						pic = "../../"+result.data.resPictureUrl;
						$(".ui-page-headingImage").attr("src","../../"+result.data.resPictureUrl)
					}else{
						pic = "../../"+result.data.subjectPictureUrl;
						$(".ui-page-headingImage").attr("src","../../"+result.data.subjectPictureUrl)
					}
					setGrid();
				}
			}
		})
	}
	//用户评价
	function comment(){
		var position;
		var star = common.getStar(5);
		$(".star").html(star);//efb336 hover时候是light-star-hover，click时候是 light-star-click
		$(".light").off().on("click",function(index,item){
			if(!$(this).hasClass("light-star-click")){
				$(this).addClass("light-star-click");
				$(this).prevAll().addClass("light-star-click");
			}else{
				$(this).nextAll().removeClass("light-star-click");
			}
		}).hover(
			function(){
				$(this).addClass("light-star-hover");
				$(this).prevAll().addClass("light-star-hover");
			},
			function(){
				$(this).removeClass("light-star-hover");
				$(this).prevAll().removeClass("light-star-hover");
			}
		)
	}
	//监控数据评价
	function listenerTextarea(){
		$("#dataComment").on("input propertychange",function(){
			
			var len=$(this).val().length;
			if(len >200){
				var char = $(this).val();
		        char = char.substr(0,200);
		        $(this).val(char);
		        return  base.requestTip({position:"center"}).error("输入不能超过200!")
			}else{
				$(".surplus span").html(200-len)
			}
		})
	}
	//提交评价
	function commit(){
		$(".commit").off().on("click",function(){
			var param={};
			param.resourceid=rid;
			param.assessmentScore=$(".light-star-click").length;
			param.assessmentContent=$("#dataComment").val();
			param.subscribeId=subscribeId;
			//params={"resourceid":rid,"subscribeId":subscribeId,"resType":resType}
			if(!param.assessmentContent){
				base.requestTip({position:"center"}).error("评论不可为空！")
				return;
			}
			$.ajax({
				url:$.path+"/api/portal/assessment/saveUserAssessment",
				type:"post",
				dataType:"json",
				contentType:"application/json;charSet=utf-8",
				data:JSON.stringify(param),
				xhrFields:{withCredentials:true},
				success:function(result){
					if(result){
						if(!result.success){
							base.requestTip({position:"center"}).error(result.message);
						}else{
							base.requestTip({position:"center"}).success("评论成功");
							setGrid();
						}
						
					}
					//base.requestTip().success(e.message)
				},
				error:function(e){
					base.requestTip({position:"center"}).error("评论失败")
				}
			})
		})
	}
	var setGrid = function(){
		grid = base.datatables({
			container:$("#commentTotal"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	function toMessage(){
		$(".messageMenu").off().on("click","li",function(){
			var n = $(this).index();
			$(".messageMenu li:eq("+n+")",window.opener.document).click();	
			window.close();
//			window.opener.location.reload();
		})
	};
	return{
		main:function(){
//			$(".portal a").attr("href",$.path+"/dssg-portal/index.html#/index");
			getResMsg();
			comment();
			listenerTextarea();
			commit();
//			setGrid();
			toMessage();
		}
	}
})
