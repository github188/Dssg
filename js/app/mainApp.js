define(["base","app/commonApp","fileinput","fileinputZh"],function(base,common){
	var menuArrayData = null;
	var menuMapData = null;
	var isSetCompay = null;
	var isPass = false;
	var certificateData = null;
	/**加载左侧菜单**/ 
	
	var setMenu = function(menuId){
		var showHelper =  function(v1, v2, options) {
			if(v1==false) {
				return "none";
			}else{
				return "block";
			}
		};
		var cookieInfo = common.getCookis();
		if(!cookieInfo){
//			window.location.href="../login.html";
//			window.location.href = "http://" +window.location.host+"/dssg-portal/login.html";
			window.location.href = $.path+"/dssg-portal/login.html"
		}
		var userId = cookieInfo.loginUserProfileDTO.id;
		base.ajax({
			url:$.path+"/api/sysmenus/findMenus?userId="+userId,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(data,status,request){
				var d = data.data;
				menuMapData = base.arrayToMap(d,"-1",false);
				scopeMenuData = menuMapData;
				menuArrayData = base.mapToArray(menuMapData,"-1");
				var cookieLabel ="首页",cookieNum=0,cookieId="ba751acb621e11e79e16662db0eb88e8";
				
				if($.cookie("messageurl") && $.cookie("messageurl") =="all"){
					menuId = "xx1cbe16621e11e79e16662db0eb88e8"
					$.cookie("messageurl",null,{path:"/"})
				}else if($.cookie("messageurl") && $.cookie("messageurl") !="all" &&$.cookie("messageurl") !="null"){
					menuId = $.cookie("messageurl");
					$.cookie("messageurl",null,{path:"/"})
				}

				if(menuId){
					$.each(menuArrayData,function(index,item){
						if(item && item.items){	
							$.each(item.items,function(i,o){
								if(menuId == o.id){
									item.active=true;
									item.items[i].active=true;
								}
							})
						}
					})
					cookieId = menuId;
				}else{
					if(cookieId =="ba751acb621e11e79e16662db0eb88e8"){
						
					}else{						
						$.each(menuArrayData,function(index,item){
							if(item.label==cookieLabel){
								item.active=true;
								item.items[cookieNum].active=true;
							}
						})
					}
				}
				base.template({
					container:$(".ui-menu"),
					templateId:"menu-tpl",
					data:menuArrayData,
					helper:[{"name":"show","event":showHelper}],
					callback:function(){
						base.scroll({
							container:$(".ui-menubar")
						});
						$('#menubar .panel-collapse').on('hide.bs.collapse', function (o) {
							$(o.target).parent().find(".panel-title a i:eq(1)").attr("class","fa fa-angle-down");
						});
						$('#menubar .panel-collapse').on('show.bs.collapse', function (o) {
							$(o.target).parent().find(".panel-title a i:eq(1)").attr("class","fa fa-angle-up");
						});
						$("#menubar .panel-body li").on("click",function(){
							$("#menubar .panel-body li").removeClass("active");
							//去掉选择首页的背景色
							$("#menubar .panel:first").css({
								background: "transparent",
								color: "#fff"
							})
							$(this).addClass("active");
							loadPage($(this).attr("mid"));
						});
						$("#menubar .panel:first").bind('click',"a",function(){
							//加上选择首页的背景色
							$(this).css({
								background: "#013c58",
								color: "#04ccff"
							})
							$("#menubar .panel .panel-collapse").removeClass("in");
							$("#menubar .panel .panel-collapse li").removeClass("active");
							loadPage("ba751acb621e11e79e16662db0eb88e8");
						});
						loadPage(cookieId);
						toMessage();
					}
				});
			},
			beforeSend:function(req){
				common.getUserSession(req);
			}
		});
		base.ajax({
			url:$.path+"/api/home/systemMessages?page=0&size=5",
			type:"get",
			success:function(d){
				if(d.data==null){
					$(".messageNumber span").text("消息(0)")
					return;
				}
				var mes="";
				$.each(d.data.content,function(index,item){
					switch(item.type){
						case '2':item.mes="系统消息";break;
						case '3':item.mes="告警信息";break;
						case '4':item.mes="待办消息";break;
					} 
				})
				if(parseFloat(d.data.totalElements)>99){					
					$(".messageNumber span").text("消息(99+)")
				}else{					
					$(".messageNumber span").text("消息("+d.data.totalElements+")")
				}
				base.template({ 
					container:$(".messageMenu"),
					templateId:"message-tpl",
					data:d.data,
					helper:[{"name":"show","event":showHelper}],
					callback:function(){
						
					}
				});
			}
		})
	};
	/**加载菜单对应的页面**/
	var loadPage = function(mid){
		base.ajax({
			url:$.path+"/api/syscenterequipment/checkSetUpInfo",
			type:'get',
			async:false,
			success:function(d){
				if(d.code == 403){
//					window.location.href="../login.html";
//					window.location.href = "http://" +window.location.host+"/dssg-portal/login.html";
					window.location.href = $.path+"/dssg-portal/login.html"
				}
				isSetCompay = d.data.compay;
			}
		})
		if(chartInterval){
			window.clearInterval(chartInterval);
		}
		if(chartInterval2){
			window.clearInterval(chartInterval2);
		}
		var data = menuMapData[mid]?menuMapData[mid]:null;
		var cookieInfo = common.getCookis();
		if(cookieInfo.loginUserProfileDTO.loginState == 1){
			firstLoginChangePass();
		}else{
			if(cookieInfo.loginUserProfileDTO.settingWindowEnable){
				if(!cookieInfo.loginUserProfileDTO.equimentDssgEnable){
					if(cookieInfo.loginUserProfileDTO.centerDssgEnable){
						cententInitialSetting();					
					}else{
						nodeInitialSetting();
					}
				}
			}
		}
		if(data){	
			base.loadPage({
				container:$(".ui-article"),
				url:data.url?data.url:"",
				callback:function(){
					common.setLocation(scopeMenuData,data.id);
					$("input").attr("autocomplete","off");
				}
			});
		}
	};
	/**设置导航菜单**/
	var setNavbar = function(){ 
		var self = {};
		self.search = function(){
			base.ajax({
				url:"",
				success:function(){
					
				}
			})
		};
		self.setSearch = function(){
			$("#searchInput").on("keydown",function(event){
				if(event.keyCode==13){
					if($(this).val()!=""){
						self.search();
					}
				}
			});
			$("#searchIcon").on("click",function(){
				self.search();
			});
		};
		self.setSearch();
	};
//	//点击消息
	function toMessage(){
		$(".messageMenu li").off().on("click",function(){
//			$("#menubar .panel-collapse").removeClass("in");
//			$("#menubar .panel-body li").removeClass("active");
//			if($(this).attr("type")=='4'){
//				$(".panel-default #collapse1").addClass("in");
//				var height = $(".panel-default #collapse1 .panel-body").height()
//				$(".panel-default #collapse1").css({"height":height})
//				$("a[href='#collapse1'] i:eq(3)").attr("class","fa fa-angle-up");
//				$("#menubar .panel-body li[mid='c04dfca7621e11e79e16662db0eb88e8']").addClass("active");
//				loadPage('c04dfca7621e11e79e16662db0eb88e8')
//			}else{
//				$(".panel-default #collapse5").addClass("in");
//				var height = $(".panel-default #collapse5 .panel-body").height()
//				$(".panel-default #collapse5").css({"height":height})
//				$("a[href='#collapse5'] i:eq(4)").attr("class","fa fa-angle-up");
//				$("#menubar .panel-body li[mid='xx1cbe16621e11e79e16662db0eb88e8']").addClass("active");
//				loadPage("xx1cbe16621e11e79e16662db0eb88e8")
//			}
			var id = $(this).attr("mid")
			if(!id){
				id = "xx1cbe16621e11e79e16662db0eb88e8";
			}
			setMenu(id);
		})
	};
	//点击授权
	function authorization(){
		$(".authorization").off().on("click",function(){
			$(".authorization-msg").hide();
			var html = "<form enctype='multipart/form-data'>"+
				        "<input id='file-0d' class='file' type='file' multiple='multiple' name='file'>"+
						"</form>";
			var isappraisePage = $("#appraisePage").val();
			var uri = "../html/authorization.html";
			if(isappraisePage){
				uri = "../../html/authorization.html";
			}
			var modal = base.modal({
				width:950,
				height:510,
				label:"关于授权",
				url:uri,
				drag:true,
				callback:function(){
					if(isappraisePage){
						$(".link").attr("href","../../css/fileinput.css");
						$("#authorImg").attr("src","../../images/un_authorization.jpg");
					}
					$(".upload-file").html(html);
					download();//下载
					upload(modal);//上传
					isExpire();
				}
			})		
						
		})
	} 
	//判断授权是否失效
	function isExpire(){
		var isappraisePage = $("#appraisePage").val();
		var uri = "../images/authorization.jpg";
		if(isappraisePage){
			uri = "../../images/authorization.jpg";
		}
		$.ajax({
     		type:"get",
     		url:$.path+"/api/sysAuth/isExpire",
			xhrFields: {withCredentials: true},
     		success:function(result){
     			if(!result.data){
     				//上传成功之后，显示 
	     			getAuthMsg();//获取授权信息
	             	$(".img-box img").attr("src",uri);
	             	$(".authorization-msg").show();
     			}
     			
     		}
     	})
	}
	//下载
	function download(){
		$(".load").off().on("click",function(){
			window.location.href=$.path+"/api/sysAuth/downloadPower";
		})
	}
	//获取授权信息
	function getAuthMsg(){
		$.ajax({
			type:"get",
			url:$.path+"/api/sysAuth/getSysAuthInfo",
			xhrFields: {withCredentials: true},
			success:function(result){
				$.each(result.data,function(k,v){
					$("."+k).html(v)
				})
			}
		})
	}
	//上传
	function upload(modal){
		var isappraisePage = $("#appraisePage").val();
		var uri = "../images/authorization.jpg";
		if(isappraisePage){
			uri = "../../images/authorization.jpg";
		}
		$("#file-0d").fileinput({
			language:'zh',
			showUpload: true,
			browseIcon:'',
			removeIcon:'',
			uploadIcon:'', 
			showPreview :true,
			dropZoneEnabled: false,
			showPreview :false,
			cancelIcon:'',
			uploadUrl:$.path+"/api/sysAuth/uploadPowerFile", //上传的地址
			//showCaption: false,
			//allowedFileExtensions: ['jpg', 'png', 'gif']
		}).on("fileuploaded", function (event, data, previewId, index){
     			//上传成功之后，显示 
     			if(data.response.data){
     				getAuthMsg();//获取授权信息
	             	$(".img-box img").attr("src",uri);
	             	$(".authorization-msg").show();
	             	modal.hide();
	             	base.requestTip({position:"center"}).success("授权成功！")
     			}else{
     				base.requestTip({position:"center"}).error("文件错误，授权失败！")
     			}
     			
		});
	}
	/*管理初始化设置*/
	var cententInitialSetting = function(){
		modal = base.modal({
			width:900,
			height:450,
			label:"设备首次设置",
			modalOption:{"backdrop":"static","keyboard":false},
			url:"../html/centerInitialSetting.html",
			buttons:[
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						steps.back();
						var step = steps.getStep();
						if(step==0){
							$(".modal-footer .cancel").show();
						}
					}
				},
				{
					label:"下一步",
					id:"step_forward",
					cls:"btn btn-info forward",
					style:"display:none",
					clickEvent:function(){
						steps.forward(function(){
							$('.modal-body').mCustomScrollbar("scrollTo",'top',{scrollInertia:0});
							var step = steps.getStep();
							switch(step){
								case 0:
									if(!isSetCompay){
										base.requestTip({position:"center"}).error("请先设置单位");
									}else{
										$(".modal-footer .cancel").hide();
									}
									return isSetCompay;
								break;
								
								case 1:
									var isagree = $("#agree_clause").prop("checked")
									if(!isagree){
										base.requestTip({position:"center"}).error("请同意此协议！");
									}
									return isagree;
								break;
								
								case 2:
									if(!base.form.validate({form:$("#form"),checkAll:true})){
										return false;
									}
									var isPass = null;
									var d = base.form.getParams($("#form"));
									d.companyId = $("#hy").attr("tid");
									base.ajax({
										url:$.path+"/api/syscenterequipment/createCerInfo",
										params:d,
										type:'post',
										async:false,
										success:function(d){
											isPass = d.success;
										}
									})
									if(isPass){
										$(".back").remove();
										changeManageCookie();
									}
									return isPass;
								break;
							}
						});
					}
				},
				{
					label:"下载证书",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						window.location.href = $.path+"/api/syscenterequipment/downCerFile";
					}
				},
				{
					label:"完成",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
					}
				},
				{
					label:"取消",
					cls:"btn btn-default cancel",
					clickEvent:function(){
						base.confirm({
						label:"提示", 
						text:"取消将退出系统，是否确认？",
						confirmCallback:function(){
//							window.location.href="../login.html"
//							window.location.href = "http://" +window.location.host+"/dssg-portal/login.html";
							window.location.href = $.path+"/dssg-portal/login.html";
						}
					});
					}
				}
			],
			callback:function(){
				setCenterSteps();
				$(".modal-header .fa-remove").remove();
			}
		});
	}
	/*管理初始化设置步骤*/
	var setCenterSteps = function(){
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"初始设置引导","contentToggle":"#content1","callback":function(){isHaveCompay()}},
				{"label":"注册协议","contentToggle":"#content2","callback":function(){}},
				{"label":"设置设备信息","contentToggle":"#content3","callback":function(){setCompayName()}},
				{"label":"下载设备证书","contentToggle":"#content4","callback":function(){}},
			],
			buttonGroupToggle:modal.modalFooter,
		});
	}
	/*根据是否有单位判断是否已设置*/
	function isHaveCompay(){
		if(isSetCompay){
			$(".res-check-common .isCompany").html("已设置");
		}else{
			$(".res-check-common .isCompany").html("<a href='#' id='setCompay'>未设置</a>");
		}
		
	}
	var SetCompay = function(){
		$(document).on("click","#setCompay",function(){
			modal.hide();
			base.loadPage({
				container:$(".ui-article"),
				url:"../html/cdmaEvdoManage/unitManage.html",
			});
		})		
	}
	var setCompayName = function(){
		base.ajax({
			url:$.path+"/api/rescentercompany/findCenterCompanyTree",
			type:'get',
			success:function(d){
				var treeSelectObj = base.form.treeSelect({
					container:$("#hy"),
					data:d.data,
					multi:true,
					clickCallback:function(event,treeId,treeNode){
						if(treeNode.disabled){
							return false;
						}
						$("#hy").val(treeNode.name);
						$("#hy").attr("tid",treeNode.id);
						treeSelectObj.hide();
					}
				});
			}
		})
	}
	function changeManageCookie(){
		var cookieInfo = common.getCookis();
		cookieInfo.loginUserProfileDTO.equimentDssgEnable = true;
		$.cookie("dssgUserInfo",JSON.stringify(cookieInfo));
		base.ajax({
			url:$.path+"/api/syscenterequipment/getLocalEquimentInfo",
			type:"get",
			success:function(d){
				var params = d.data;
				if(params.centerFlag==1){
					params.centerFlag = "管理节点";
				}else{params.centerFlag = "接入节点";}
				if(!params.company){
					params.company = "--";
				}
				base.form.init(params,$("#form1"));
			}
		})
	}
	/*接入初始化设置*/
	function nodeInitialSetting(){
		modal = base.modal({
			width:900,
			height:450,
			label:"设备首次设置",
			modalOption:{"backdrop":"static","keyboard":false},
			url:"../html/nodeInitialSetting.html",
			buttons:[
				{
					label:"上一步",
					id:"step_back",
					cls:"btn btn-info back",
					style:"display:none",
					clickEvent:function(obj){
						steps.back();
						var step = steps.getStep();
						if(step==0){
							$(".modal-footer .cancel").show();
						}
					}
				},
				{
					label:"下一步",
					id:"step_forward",
					cls:"btn btn-info forward",
					style:"display:none",
					clickEvent:function(){
						steps.forward(function(){
							$('.modal-body').mCustomScrollbar("scrollTo",'top',{scrollInertia:0});
							var step = steps.getStep();
							switch(step){
								case 0:
									var isagree = $("#agree_clause").prop("checked")
									if(!isagree){
										base.requestTip({position:"center"}).error("请同意此协议！");
									}else{
										$(".modal-footer .cancel").hide();
									}
									return isagree;
								break;
								case 1:
									if(!isPass){
										base.requestTip({position:"center"}).error("请先上传证书!")
									}
									base.ajax({
										url:$.path+"/api/syselocalquipment/authCenterEquipement",
										type:"post",
										params:certificateData,
										success:function(d){
											
										}
									})
									return isPass;
								break;
								
								case 2:
									if(!base.form.validate({form:$("#form3"),checkAll:true})){
										return false;
									}
									var isPas = null;
									var d = base.form.getParams($("#form3"));
									base.ajax({
										url:$.path+"/api/syselocalquipment/createLocalCerInfo",
										params:d,
										type:'post',
										async:false,
										success:function(d){
											isPas = d.success;
										}
									})
									if(isPas){
										$(".back").remove();
										changeManageCookie();
									}
									return isPas;
								break;
								
							}
						});
					}
				},
				{
					label:"下载证书",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						var publicIp = $(".publicIp").text();
						window.location.href = $.path+"/api/syselocalquipment/downCerFile?publicIp="+publicIp;
					}
				},
				{
					label:"完成",
					id:"step_confirm",
					cls:"btn btn-info confirm",
					style:"display:none",
					clickEvent:function(){
						modal.hide();
					}
				}, 
				{
					label:"取消",
					cls:"btn btn-default cancel",
					clickEvent:function(){
						base.confirm({
						label:"提示",
						text:"取消将退出系统，是否确认？",
						confirmCallback:function(){
							//	window.location.href="../login.html"
//							window.location.href = "http://" +window.location.host+"/dssg-portal/login.html";
							window.location.href = $.path+"/dssg-portal/login.html";
						}
					});
					}
				}
			],
			callback:function(){
				setNodeSteps();
				$(".modal-header .fa-remove").remove();
			}
		});
	}
	/*接入初始化设置步骤*/
	function setNodeSteps(){
		steps = base.steps({
			container:$(".ui-steps"),
			data:[
				{"label":"注册协议","contentToggle":"#content1"},
				{"label":"认证管理节点证书","contentToggle":"#content2","callback":function(){certificateFile()}},
				{"label":"设置设备信息","contentToggle":"#content3","callback":function(){}},
				{"label":"下载设备证书","contentToggle":"#content4","callback":function(){}},
			],
			buttonGroupToggle:modal.modalFooter,
		});
	}
	/*认证管理节点证书上传*/
	function certificateFile(){
		$(".leading-in").click(function(){
			if($("#ertificate_name div").text()){
				base.requestTip({position:"center"}).error("不要重复上传！")
				return false;
			}
			$("#certificateFile #myFile").trigger("click");
		})
		$("#certificateFile").on("change","#myFile",function(){ 	
			var fileName = $("#certificateFile #myFile").val();
			fileName = fileName.split("\\");
			var idx = fileName[2].lastIndexOf(".");   
            var ext = fileName[2].substr(idx+1).toUpperCase();   
            ext = ext.toLowerCase( ); 
            if (ext != 'rar' ){
                base.requestTip({position:"center"}).error("您只能上传rar压缩文件！"); 
                return;  
            }   
			$("#ertificate_name").html("<div>"+fileName.splice(-1)+"<i class='fa fa-trash' style='cursor:pointer'></i></div>")
			var url1=new FormData($('#certificateFile')[0])
			$.ajax({
			    url: $.path+'/api/syselocalquipment/getCenterEquimentCerInfo',
			    type: 'POST',
			    cache: false,
			    data: url1,
			    processData: false,
			    contentType: false,
			    xhrFields: {withCredentials: true},
			    success:function(d){
			    	if(d.data.status == "success"){
						certificateData = d.data.res;
			    		isPass = true;
			    		$("#form").show();	
			    		base.form.init(d.data.res,$("#form"));
					}else{
						base.requestTip({position:"center"}).error(common.getUploadInfo(d.data.status))
					}
			    }
			})
		})
		$("#ertificate_name").on("click",".fa-trash",function(){
			var self = this;
			base.ajax({
				url:$.path+"/api/syselocalquipment/deleteAuthFile?filename="+$("#ertificate_name div").text(),
				type:"get", 
				success:function(d){
					if(d.success){
						$(self).parent().remove();
						isPass = false;
						$("#certificateFile #myFile").replaceWith('<input type="file" name="file" id="myFile" style="display: none;"/>');
						$("#form").hide();					
					}
				}
			})
		})
	}
	var setLogout = function(){
		var loginInfo = common.getCookis();
		var isappraisePage = $("#appraisePage").val();
		var uri = "../login.html";
		if(isappraisePage){
			uri = "../../login.html";
		}
		if(loginInfo.loginUserProfileDTO.currentEquipment.name);
		$("#loginMan").text(loginInfo.loginUserProfileDTO.loginName+" ("+loginInfo.loginUserProfileDTO.currentEquipment.name+")");
		
		$("#logOut").on("click",function(){
			base.ajax({
				url:$.path+"/api/login/logout",
				type:"post",
				success:function(d){
					if(d.success){
//						window.location.href="http://" +window.location.host+"/dssg-portal/login.html";
						window.location.href = $.path+"/dssg-portal/login.html";
//						window.location.href=uri;
					}
				}
			})
		})
	}
	/*首次登陆修改密码*/
	function firstLoginChangePass(){
		var modal = base.modal({
			width:700,
			height:270,
			label:"修改密码",
			modalOption:{"backdrop":"static","keyboard":false},
			url:"../html/modifyPass.html",
			buttons:[
				{
					label:"确定",
					cls:"btn btn-info",
					clickEvent:function(){
						var pass = base.form.validate({form:$("#form"),checkAll:true})
						if(!pass){return;}
						var newPassword = base.form.getParams($("#form"));
						if(newPassword.newPassword != newPassword.newPasswords){
							base.requestTip({position:"center"}).error("两次密码不统一！");
							return;
						}
						base.ajax({
							url:$.path+"/api/sysuser/updatePassword?newPassword="+newPassword.newPassword,
							type:"get",
							success:function(d){
//								window.location.href="../login.html";
//								window.location.href="http://" +window.location.host+"/dssg-portal/login.html";
								window.location.href = $.path+"/dssg-portal/login.html";
							}
						})
					}
				}
			],
			callback:function(){
				$(".modal-header .close").remove();
			}
		});
	}
	return {
		main:function(){
			$(".portal a").attr("href",$.path+"/dssg-portal/index.html");
			setMenu();
			authorization();
			SetCompay();
			setLogout();
		},
		loadPage:function(id){
			loadPage(id);
		}
		
	};
});