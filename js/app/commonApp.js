define(["base","datatables","tree","cookies"],function(base){
	var pageSize = 10;
	var self = {
		search:function(grid){
			grid.reload();
		},
		reset:function(form,grid){
			base.form.reset(form,function(){
				if(grid){
					grid.reload();
				}
			});
		},
		checkByGridButton:function(cbs){
			
			if(cbs&&cbs.length>0){
				var cd = $(cbs).filter(":checked");
				if(cd.length==1){
					$(".ui-grid-buttonbar .modify").removeClass("disabled");
					$(".ui-grid-buttonbar .delete").removeClass("disabled");
					$(".ui-grid-buttonbar .add").addClass("disabled");
					$(".ui-grid-buttonbar .adds").removeClass("disabled");
				}else if(cd.length>1){
					$(".ui-grid-buttonbar .modify").removeClass("disabled");
					$(".ui-grid-buttonbar .modify").addClass("disabled");
					$(".ui-grid-buttonbar .delete").removeClass("disabled");
					$(".ui-grid-buttonbar .add").addClass("disabled");
					$(".ui-grid-buttonbar .adds").addClass("disabled");
				}else{
					$(".ui-grid-buttonbar .add").removeClass("disabled");
					$(".ui-grid-buttonbar .modify").removeClass("disabled");
					$(".ui-grid-buttonbar .modify").addClass("disabled");
					$(".ui-grid-buttonbar .delete").removeClass("disabled");
					$(".ui-grid-buttonbar .delete").addClass("disabled");
					$(".ui-grid-buttonbar .adds").removeClass("disabled");
				}
			}
		},
		submit:function(option){
			var url = option.url?option.url:"";
			var params = option.params?option.params:null;
			var callback = option.callback?option.callback:null;
			var type = option.type?option.type:"get";
			var position = option.position?option.position:"top";
			var requestTip = base.requestTip({
				position:"center"
			});
			var async = option.async==false?false:true;
			if(url){
				base.ajax({
					url:url,
					params:params,
					type:type,
					async:async,
					timeout:10000,
					success:function(data){
						if(callback){
							callback(data);
						}
						switch(data.code){
							case '0':
								requestTip.success(data.message);
							break;
							
							default:
								requestTip.error(data.message);
							break;
						}
						self.initButtonbar($(".ui-grid-buttonbar"));
					},
					beforeSend:function(){
						requestTip.wait();
					},
					error:function(){
						requestTip.error();
					}
				})
			}
			
		},
		
		setLocation:function(menuMapData,id){
			$(".ui-location ul").html("");
			var self = {};
			var data = base.findParentToArray(menuMapData,id);
			if(data&&data.length>0){
				$(data).each(function(i,o){
					var node = document.createElement("li");
					$(node).html(o.label);
					$(".ui-location ul").append(node);
					if(i!=data.length-1){
						$(node).append("<i class='fa fa-angle-right'></i>");
					}
				});
			}
		},
		getStar:function(starNumber){
			var s = "";
			for(var i = 1;i<=5;i++){
				if(i<=starNumber){
					s += "<i class='light fa fa-star'></i>";
				}else{
					s += "<i class='fa fa-star'></i>";
				}
			}
			return s;
		},
		loadPage:function(id){
			require(["app/mainApp"],function(app){
				app.loadPage(id);
			});
		},
		drawChart:function(option){
			var self = {};
			self.chartContainer = option.chartContainer?option.chartContainer:null;
			self.chartOption = option.chartOption?option.chartOption:null;
			self.data = option.data?option.data:null;
			self.callback = option.callback?option.callback:null;
			
			self.draw = function(){
				self.setOption();
				base.highCharts({
					container:self.chartContainer,
					chartOption:self.chartOption,
					callback:self.callback
				});
			};
			self.setOption = function(){
				self.chartOption.series = self.data;
			};
			
			self.draw();
		},
		
		arrayStrToNumber:function(data){
			var d = [];
			$(data).each(function(i,o){
				d.push(Number(o));
			});
			return d;
		},
		setPanelButtonbar:function(){
			$(".ui-panel-buttonbar li").on("click",function(){
				$(this).parent().children("li").removeClass("active");
				$(this).addClass("active");
			});
		},
		setGridLinkGroup:function(){
			$(".ui-grid-linkGroup li").on("click",function(){
				$(this).parent().children("li").removeClass("active");
				$(this).addClass("active");
			});
		},
		mergeTreeData:function(data,rootId){
			var self = {};
			var data = data;

			$(data).each(function(i,o){
				if(o.id==rootId){
					o.icon = "../images/0.png";
					o.open = true;
					return true;
				}else{
					var hasChild = false;
					$(data).each(function(i1,o1){
						if(o1.pid == o.id){
							o.icon = "../images/2.png";
							o.open = true;
							hasChild = true;
							return false;
						}
					})
					if(hasChild==false){
						o.icon = "../images/4.png";
					}
				}
			});


			return data;
		},
		gridFilter:function(data){
            var d = $.parseJSON(data);
            switch(d.code){
            	case "0":
            		if(d.data == null){
            			d.recordsTotal = 0;
	            		d.recordsFiltered = 0;
	            		d.data = [];
            		}else{
            			d.recordsTotal = d.data.totalElements;
	            		d.recordsFiltered = d.data.totalElements;
	            		/*d.recordsTotal = 100;
	            		d.recordsFiltered =100;*/
	            		d.data = d.data.content;
            		}
            	break;
            	
            	default:
            		d.recordsTotal = 0;
            		d.recordsFiltered = 0;
            		d.data = [];
            		
            		var reqTip = base.requestTip();
            		reqTip.error(d.message);
            	break;
            }
            return JSON.stringify(d); 
       	},
       	gridFilters:function(data){
            var d = $.parseJSON(data);
            switch(d.code){
            	case "0":
            		if(d.data == null){
            			d.recordsTotal = 0;
	            		d.recordsFiltered = 0;
	            		d.data = [];
            		}else{
            			d.recordsTotal = d.data.length;
	            		d.recordsFiltered = d.data.length;
	            		/*d.recordsTotal = 100;
	            		d.recordsFiltered =100;*/
	            		d.data = d.data;
            		}
            		
            	break;
            	
            	default:
            		d.recordsTotal = 0;
            		d.recordsFiltered = 0;
            		d.data = [];
            		
            		var reqTip = base.requestTip();
            		reqTip.error(d.message);
            	break;
            }
            return JSON.stringify(d); 
       	},
       	gridPageFliter:function(d,size){
       		d.page = d.start/d.length;
       		d.size = size?size:pageSize;
       	},
       
       	getUserSession:function(req){
       		req.setRequestHeader("Test", "test");
       	},
       	getParams:function(d,form){
       		self.gridPageFliter(d);
			var params = base.form.getParams($(form),true);

			if(params==""){
				params+="size="+d.size+"&page="+d.page;
			}else{
				params+="&size="+d.size+"&page="+d.page;
			}
			return params;
        },
        getPostParams:function(d,form){
        	self.gridPageFliter(d);
        	var params = base.form.getParams($(form));
        	if(params){
        		$.extend(d,params);
        	}
        	return JSON.stringify(d);
        },
        initButtonbar:function(buttonbar){
        	$(buttonbar).find(".add").show().removeClass("disabled");
        	$(buttonbar).find(".modify").removeClass("disabled").addClass("disabled");
        	$(buttonbar).find(".delete").removeClass("disabled").addClass("disabled");
        	$(buttonbar).find(".adds").show().removeClass("disabled");
        },
        treeTable:function(setting){
        	var self = {};
        	self.tmpRow = null;
			self.dg = function(data){
				if(data&&data.length>0){
					$(data).each(function(i,o){
						var row = document.createElement("tr");
						$(row).attr("data-tt-id",o.id);
						$(row).attr("data-tt-parent-id",o.pid);
						$(row).addClass("ui-treeTableChild");
						var s = "";
						$(setting.aoColumns).each(function(i1,o1){
							var type = o1.type?o1.type:null;
							switch(type){
								case "checkbox":
									s+="<td><input type='checkbox' class='cb' name='cb' data-level='"+o.level+"' value='"+o[o1.data]+"' pid='"+o.pid+"'/></td>";
								break;
								
								default:
									s+="<td>"+(function(){return o[o1.data] ? o[o1.data] : "--"})()+"</td>";
								break;
							}
						});
						$(row).html(s);
		    			$(self.tmpRow).after(row);
		    			self.tmpRow = row;
						self.dg(o.children);
					});
				}
			};
			var data = setting.json.data;
        	
        	$(data).each(function(i,o){
        		if(o.children&&o.children.length>0){
        			self.tmpRow = $(setting.nTable).find("tbody tr[rootrow='"+i+"']");
        			self.dg(o.children);
        		}
        	});
        	base.treeTable({
        		container:setting.nTable,
				setting:{
					expandable:true
				}
        	});
        },
        typeSelect:function(para){
        	switch(para){
        		case '12':
        			return "文本";
        			break;
        		case '91':
        			return "日期";
        			break;
        		case '3':
        			return "数字";
        			break;
        		case '93':
        			return "时间";
        			break;
        		case '4':
        			return "整型";
        			break;
        		case '2004':
        			return "大字段";
        			break;
        	}
        },
        typeSelectText:function(para){
        	switch(para){
        		case '文本':
        			return "12";
        			break;
        		case '日期':
        			return "91";
        			break;
        		case '数字':
        			return "3";
        			break;
        		case '时间':
        			return "93";
        			break;
        		case '整型':
        			return "4";
        			break;
        		case '大字段':
        			return "2004";
        			break;
        	}
        },
        getCookis:function(){
        	var cookie = $.cookie("dssgUserInfo");
        	
        	if(cookie){
        		cookie = JSON.parse(cookie);
        	}
        	return cookie;
        }, 
        router:function(){
        	
        },
        selectedTr:function(example){
			example.find("tbody").on( 'click', 'tr', function () {
				$("tbody tr").removeClass("selected");
		        $(this).toggleClass('selected');
		    });
		},
		disableInput:function(e){
			$.each(e,function(i,o){
				$("input[name="+o+"]").attr("disabled","disabled");
				$("select[name="+o+"]").attr("disabled","disabled");
				$("."+o).attr("disabled","disabled");
			})
		},
		interceptString:function(e,o){
			var m=o?o:30;
			if(e.length>m){
				return "<div title='"+e+"'>"+(e.substr(0,m)+'...')+"</div>"
			}else{
				return "<div title='"+e+"'>"+e+"</div>";
			}
		},
		getUploadInfo:function(e){
			switch(e){
        		case 'notnode':
        			return "请上传正确格式的接入节点证书";
        			break;
        		case 'notmanage':
        			return "请上传正确格式的管理节点证书";
        			break;
        		case 'uploadfail':
        			return "证书文件上传失败";
        			break;
        		case 'suffixfail':
        			return "文件格式不正确";
        			break;
        		case 'authfail':
        			return "证书文件解析过程中出现异常";
        			break;
        		case 'error':
        			return "证书解析失败,请上传正确证书";
        			break;
        		case 'compressionerror':
        			return "证书压缩包解压失败请核对证书文件，或联系管理员";
        			break;
        		case 'ioerror':
        			return "证书压缩包文件读取失败";
        			break;
        		case 'filereadfail':
        			return "业务文件读取失败...请联系管理员";
        			break;
        		case 'notcername':
        			return "压缩包中证书名称不合法，请联系管理员";
        			break;
        		default:
        		 	return "导入失败"
        	}
		}
	};
	return self;
});