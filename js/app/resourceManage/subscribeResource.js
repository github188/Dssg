define(["base","app/commonApp"],function(base,common){
	var grid = null;
	var getButton = function(status,id,sign,resourceId){
		var s = "";
		//根据状态判断显示的按钮 1待审核-审批 2已审核-评论、撤销 3已拒绝-删除 4已撤销-删除 5已失效-删除
//		buttons += "<button class='btn btn-warning comment'>评论</button>"+
//								"<div class='revoke color-59b0fc'>撤销</div><div class='cancel color-59b0fc'>删除</div>"+
//								"<div class='ui-datetime'>"+row.datetime+"</div>"
		switch(status){
			case "1"://待审核
				s = "<div rid='"+id+"' resourceId='"+resourceId+"' data-sign='"+sign+"'><button class='btn btn-link blockCenter disabled'>撤销</button><button class='btn btn-link blockCenter disabled'>评价</button>"+
					"<button class='btn btn-link blockCenter disabled' >删除</button></div>"	
			break;
			
			case "2"://已审核
				s = "<div rid='"+id+"' resourceId='"+resourceId+"' data-sign='"+sign+"'><button class='revoke btn blockCenter btn-warning'>撤销</button><button class='btn btn-link blockCenter doComment color-59b0fc'>评价</button>"+
					"<button class='btn btn-link blockCenter disabled'>删除</button></div>";
			break;
			
			case "3"://已拒绝
				s =	"<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning delect'>删除</button><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
			break;
			
			case "4"://已撤销
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning delect'>删除</button><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
			break;
			case "5"://已失效
				s = "<div rid='"+id+"' data-sign='"+sign+"'><button class='btn btn-warning delect'>删除</button><button class='btn btn-link blockCenter disabled'>撤销</button>"+
				    "<button class='btn btn-link blockCenter disabled'>评论</button></div>";
					
			break;
		}
		return s;
	};
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/subscribeResource/findMySubscribeResourcePage",
			type:"get",
			xhrFields: {withCredentials: true},
			data:function(d){
				/**base库专门获取表单参数的方法**/
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				if(params.state == "0"){
					delete params["state"];
				}
				if(params){
					var paramaA = $.extend({page:d.page,size:d.size},params); 
				}
				return paramaA; 
			}
		},
		columns:[
			{ "data": "data","sWidth":"100%"}
		],
		columnDefs:[ 
           {
				"render":function(data,type,row,meta){
//					var starCont = common.getStar(row.star);
					var buttons = getButton(row.state,row.id,row.resType,row.resourceId);
					var sign ="";
					//sign type
					switch(row.resType){
						case "1": sign = "<span class='sign color-1e88e5'>DATA</span>";break;
						case "2": sign = "<span class='sign color-fe245c'>DOC</span>";break;
						case "3": sign = "<span class='sign color-f2c65d'>API</span>";break;
						case "其他": sign = "<span class='sign color-68baff'>"+row.resTypeName+"</span>";break;
					}
					if(row.abstracts){
						if(row.abstracts && row.abstracts.length>50){
							var liContent = row.abstracts.substr(0,50)+"...";
						}else{
							var liContent = row.abstracts;
						}
					}else{
						var liContent="";
					}
					//图片
					if(row.pictureUrl){
						var pictureUrl = row.pictureUrl;
					}else if(row.subjectPictureUrl){
						var pictureUrl = row.subjectPictureUrl;
					}else{
						var pictureUrl = "images/default.png";
					}
					//api时显示申请应用的名称
					var apiApplication = row.resType != 3?"": row.appName?"<li>"+row.appName+"</li>":"--";
					if(row.resType=="3" && row.subscribeId){
						var targetUrl = $.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.resourceId+"&subscribeId="+row.subscribeId;
					}else{
						var targetUrl = $.path+"/dssg-portal/index.html#/detail?type="+row.resType+"&id="+row.resourceId;
					}
					var content = "<div class='ui-blockGrid-item'>"+
						"<ul>"+
							"<li type='photo' style='float:left;width:12%'>"+
								//"<div class='sign-box'><div style='background-color: #58dddb;border-color: #39cadb;'>data</div></div>"+
								"<img src='../"+pictureUrl+"'/>"+
								//"<img src='../images/user_default.png'/>"+
							"</li>"+
							"<li type='info' style='float:left;width:59%'>"+
								"<ul class='ui-blockGrid-content'>"+ //"<span class='ui-datetime'>（"+row.datetime+"）</span>"+
									"<li type='title'><a class='portalurl' restype='"+row.resType+"' target='_blank' href='"+targetUrl+"'>"+row.resName+sign+"</a></li>"+
									"<li class='content'>"+liContent+"</li>"+
									"<li style='clear:both;padding-left:22px'>"+
										"<div class='classify'>"+row.subjectCarategoryName+"</div>"+
										"<div class='classify'>"+row.industryCategoryName+"</div>"+
									"</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
//									"<li type='title' class='color-777'>提供单位</li>"+
									"<li type='content'>"+row.publishDept+"</li>"+
									apiApplication+
									"<li class='viewApplication' ctype='"+row.resType+"' cid='"+row.id+"' style='cursor:pointer;color:#59b0fc' type='viewApplication'>查看申请</li>"+
								"</ul>"+
							"</li>"+
							"<li style='float:left;width:9%'>"+
								"<ul class='ui-blockGrid-content column-normal'>"+
//									"<li type='title' class='color-777'>申请状态</li>"+
									"<li class='requestState' type='content'>"+row.stateName+"</li>"+
								"</ul>"+
							"</li>"+
							"<li type='buttons' style='float:left;width:11%'>"+
								buttons+
							"<div class='ui-datetime'><span>"+(row.applyTime!=null?(row.applyTime).split(" ")[0]:"")+"</span></br><span>"+(row.applyTime!=null?(row.applyTime).split(" ")[1]:"")+"</span></div></li>"+
						"</ul>"+
					"</div>";
					return content; 
              	}, 
				"targets":0 
            } 
        ],
        drawCallback:function(setting){
        	//点击删除
        	doDele()
        	//点击撤销
        	revoke()
        	//点击评论
        	doComment();
        	//点击查看申请
        	viewApplication();
        	common.selectedTr($("#example"));
        	
        }
	};
	
	
	//点击删除
	function doDele(){
		$(".delect").off().on("click",function(){
			var params = {id:$(this).parent().attr("rid")};
			base.confirm({
				label:"删除",
				text:"<div style='text-align:center;font-size:13px;'>确定删除?</div>",
				confirmCallback:function(){
					common.submit({
						url:$.path+"/api/subscribeResource/deleteSubscribe",
						params:params,
						type:"get",
						callback:function(data){
							if(data.message=="success"){
								data.message="删除成功"
							}else{
								data.message="删除失败"
							}
							common.search(grid);
						}
					});
				}
			})
		})
	}
	//点击撤销
	function revoke(){
		$(".revoke").off().on("click",function(){
			var resType = $(this).parent().attr("data-sign");
			var params = {subscribeId:$(this).parent().attr("rid"),resType:resType};
			base.confirm({
				label:"撤销",
				text:"<div style='text-align:center;font-size:13px;'>确定撤销?</div>",
				confirmCallback:function(){
					common.submit({
						url:$.path+"/api/subscribeResource/revokeSubscribe",
						params:params,
						type:"get",
						callback:function(data){
							if(data.message=="success"){
								data.message="撤销成功"
							}else{
								data.message="撤销失败"
							}
							common.search(grid);
						}
					});
				}
			})
		})
	}
	//评论
	var doComment = function(){
		$(".doComment").off().on("click",function(){
			window.open("../html/resourceManage/resource-comment.html?rid="+$(this).parent().attr("resourceId")+"&subscribeId="+$(this).parent().attr("rid")+"&resType="+$(this).parent().attr("data-sign"))
		})
	}
	//点击查看
	var setSteps1 = function(state,resType){
		if(state =="1"){
			state = "1"
		}else{
			state="2"
		}
		$(".cont").removeClass("hidden").addClass("hidden");
		$("#content"+state).removeClass("hidden");
		if(resType == "3"){
			$(".apiformExample").show();
		}else{
			$(".formExample").show();
		}

		var steps = base.steps({
			container:$("#ui-steps"),
			data:[
				{"label":"申请订阅","contentToggle":"#content0"},
				{"label":"订阅审批","contentToggle":"#content1"},
				{"label":"完成订阅","contentToggle":"#content2"}
			],
			buttons:[],
			currentStep:parseInt(state),/**初始化在第几步,默认是0**/
		});
	};
	
	var viewApplication = function(){
		$(".viewApplication").off().on("click",function(){
			var that = $(this);
			var params;
			if(that.attr("ctype")=="3"){
				params = {'id':$(this).attr("cid"),resType:3};
			}else{
				params = {'id':$(this).attr("cid"),resType:that.attr("ctype")};
			}
			var modal = base.modal({
				width:900,
				height:450,
				label:"订阅流程信息",
				url:"../html/resourceManage/checkApplication.html",
				callback:function(){
					base.ajax({
						url:$.path+"/api/subscribeReview/subscriptionApprovalProcessView",
						type:"post",
						params:params,
						success: function(data) {
							if(data.code =="0"){
								var data = data.data[0];
								setSteps1(data.state,data.resType);
								for(var k in data){
									if(data.resType == "3"){
										var dom = $(".apiformExample");
									}else{
										var dom = $(".formExample");
									}
									if(data[k]){
										if(k=="resType"){
											var value = data[k]=="1"?"数据库":data[k]=="2"?"文件":"API"
											dom.find("."+k).html(value);
										}else if(k == "model"){
											var value = data[k]=="1"?"完全":data[k]=="2"?"映射":"";
											dom.find("."+k).html(value);
										}else if(k == "approvalResult"){
											var approvalResult = data[k]=="0"?"同意":"拒绝";
											dom.find("."+k).html(approvalResult);
										}else{
											dom.find("."+k).html(data[k]);
										} 
									}else if(k =="resultNumber"){
										dom.find("."+k).html('--')
									}else if(k =="requestNumber"){
										dom.find("."+k).html('--')
									}else{
										dom.find("."+k).html('--');
									}
								}
							}
						},
						error:function(data){
						}
					})
				},
				buttons:[
				{
					label:"返回",
					cls:"btn btn-info",
					clickEvent:function(){
						modal.hide();
					}
				}]
			})
		})
		$(".portalurl").on('click',function(){
			if($(this).attr("restype") == "3"){
				if( $(this).parents("ul").find(".requestState").html()=="已审核"){
					$.cookie("requestState","0",{path:'/'})
				}
			}
		})
		
	}
	var setGrid = function(){
		grid = base.datatables({
			container:$("#example"),
			option:gridOption,
			filter:common.gridFilter
		});
	};
	
	/**查询**/
	var setSearch = function(){
		$("#search").on("click",function(){
			common.search(grid);
		});
		
	};
	/**重置**/
	var setReset = function(){
		$("#reset").on("click",function(){
			common.reset($("#search-form"),grid);
		});
	};
	var setLinkGroup = function(){
		$(".ui-grid-linkGroup li").on("click",function(){
			$(".ui-grid-linkGroup .active").removeClass("active");
			$(this).addClass("active");
			var key = $(this).attr("key");
			$("#status").val(key);
			common.search(grid);
		});
	};
	
	var setContent = function(){
		base.scroll({
			container:$(".ui-gridbar")
		});
	};
	
	var searchCataLogInfo = function(){

		$.ajax({
			type:"get",
			url:$.path+"/api/catalog/findDomainResCataLogInfo?name=catalogId&type=1",
			xhrFields: {withCredentials: true},
			success:function(data){
				base.template({
					container:$(".catalogId"),
					templateId:"catalogId-tpl",
					data:data.data
				})
			}
		})
	}
//		//设置步骤插件
//	var setSteps = function(sign){
//		var data=[];
//		switch(sign){
//			case "DATE":
//			data =[
//				{"label":"查看请求方信息","contentToggle":"#content1"},
//				{"label":"查看元数据信息","contentToggle":"#content2"},
//				{"label":"数据处理策略","contentToggle":"#content3"},
//				{"label":"填写审批意见","contentToggle":"#content4"}
//			];
//			break;
//			case "DOC":
//			data =[
//				{"label":"查看请求方信息","contentToggle":"#content1"},
//				{"label":"查看元数据信息","contentToggle":"#content2"},
//				{"label":"填写审批意见","contentToggle":"#content3"}
//			];
//			break;
//			case "API":
//			data =[
//				{"label":"查看请求方信息","contentToggle":"#content1"},
//				{"label":"查看元数据信息","contentToggle":"#content2"},
//				{"label":"入参处理策略","contentToggle":"#content3"},
//				{"label":"出参处理策略","contentToggle":"#content4"},
//				{"label":"服务控制策略","contentToggle":"#content5"},
//				{"label":"填写审批意见","contentToggle":"#content6"}
//			];
//			break;
//			//case "其他":return;break;
//		}
//		steps = base.steps({
//			container:$("#ui-steps"),
//			data:data,
//			buttonGroupToggle:modal.modalFooter
//		})
//		
//	}
	return {
		main:function(){
			searchCataLogInfo();
			setContent();
			setGrid();
			setLinkGroup();
			setSearch();
			setReset();
		}
	};
});