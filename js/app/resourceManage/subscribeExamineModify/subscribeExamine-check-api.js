define(["base","app/commonApp"],function(base,common){
	var grid0=null, grid1=null, grid2=null, grid3=null, grid4=null;
	var resName = $(".res-name").val();
	var resId=$(".dataResourceId").val();//资源id
	//保存审批数据过滤的内容
	var dataFilteing = [];
	//$(".approvalOpinion").attr("readonly","readonly");//审批意见在审核的时候是不可以编辑的
	//获取审核内容
	function subscribeUpdate(appData,strategy,compareSymbolData){
		$.ajax({
			url:$.path+"/api/subscribeReview/subscribeModifyGetStrategy", //1
			xhrFields: {withCredentials: true},
			type:"post",
			contentType:"application/json;chartSet=utf-8",
			data:JSON.stringify({"subscribeId":window.obj.subscibeId}),//JSON.stringify({"resourceId":resId,"subscribeId":subscribeId}),
			success:function(result){
				if(result&&result.data){
					var resName=window.obj.resName; 
					if(result.data.inParameterStrategy){
						var inParameterStrategy=JSON.parse(result.data.inParameterStrategy);
						setGrid($("#sensitive_word_filter"),getTableParam(appData,strategy,compareSymbolData).p0,1,inParameterStrategy);////敏感词过滤
					}
					if(result.data.outParameterStrategy){
						var out=JSON.parse(result.data.outParameterStrategy);
						dataFilteing = out.dataFilteing;
						setGrid($("#sensitive_word_filter_1"),getTableParam(appData,strategy,compareSymbolData).p1,2,addResName(out.sensitiveFilteing));////敏感词过滤
						setGrid($("#data_filter"),getTableParam(appData,strategy,compareSymbolData).p2,3,addResName(out.dataFilteing));////数据过滤
						setGrid($("#data_desensitization"),getTableParam(appData,strategy,compareSymbolData).p3,4,addResName(out.dataDesen));////数据脱敏
						setGrid($("#data_transform"),getTableParam(appData,strategy,compareSymbolData).p4,5,addResName(out.dataConversion));////数据转换
					}
					//服务控制策略
					$(".maxRequest").val(result.data.requestNumber);
					$(".maxResponse").val(result.data.resultNumber);
					//审批意见
					$(".approvalResult").val(result.data.approvalResult);
					$(".approvalOpinion").val(result.data.approvalOpinion);
					$(".approvalOpinion").attr("disabled","disabled");//审批意见在审核的时候是不可以编辑的
					$(".approvalResult").attr("disabled","disabled")
				}
			}
		})
	}
	
	//获取findResourceByID接口返回的数据
	function getAppData(){
		$.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+window.obj.resourceId,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(result){
				metaData(result);
				paramTable(result)
				var strategyData = strategyApi();
				var compareSymbolData=compareSymbolApi();
				subscribeUpdate(result,strategyData,compareSymbolData);
			}
		})
	}
	
	//将资源名称放进出参处理策略中
	function addResName(arr){
		var resName=$(".ui-page-title .resName").html();
		if(arr && arr.length>0){
			$.each(arr,function(index,item){
				item.resName=resName;
			})
			return arr;
		}else{
			return arr;
		}
	}
	//获取订阅申请信息
	var applyMsg = function(){
		$.ajax({
			url:$.path+"/api/subscribeResource/getSubscribeById?id="+window.obj.subscibeId,  //2
			type:"get",
			//async:false,
			xhrFields: {withCredentials: true},
			success:function(result){
				//区分资源类型
				if(result.success=true && result.data){
					$(".resourceId").val(result.data.resourceId);
					$(".subscribeId").val(result.data.id)
					var resType = "";
					switch(result.data.resType){
						case "1": resType="数据库";break;
						case "2": resType="文件";break;
						case "3": resType="API";break;
					}
					$.each(result.data,function(k,v){
						if(v){							
							if(k=='resType'){
								$("#applyMsg .resType").html(resType)
							}else{
								$("#applyMsg ."+k).html(v)	
								if(k=='requestTime'){
									$(".requestTime").html(v)
								}
							}
						}else{
							$("#applyMsg ."+k).html("--")	
						}
						
					})
					$("#content5 .requestTime").html(result.data.requestTime)
				}
				
			}
		})
	}
	//获取元数据信息
	function metaData(result){
		if(result && result.data){
			if(result.data.filePath){//图片
				$(".ui-page-headingImage").attr("src",$.path1+result.data.filePath)
			}else if(result.data.pictureUrl){
				$(".ui-page-headingImage").attr("src",$.path1+result.data.pictureUrl)
			}else{
				$(".ui-page-headingImage").attr("src","../images/default.png")
			}
//			if(null!=result.data.filePath){//图片
//				$(".ui-page-headingImage").attr("src",$.path1+result.data.filePath)
//			}else{
//				$(".ui-page-headingImage").attr("src",$.path1+result.data.pictureUrl)
//			}
			$(".ui-page-title .resName").html(result.data.resName);
			$.each(result.data,function(k,v){
				if(v){
					//资源类型
					var resType = "",resLevel="";
					$("#resMsg ."+k).html(v);
					if(k=="resType"){
						switch(v){
							case "1":resType = "数据库";break;
							case "2":resType = "文件";break;
							case "3":resType = "API";break;
						}
						$("#resMsg .resType").html(resType);
					}
					//资源等级
					if(k=="resLevel"){
						switch(v){
							case "1":resLevel="部分共享";break;
							case "2":resLevel="全部共享";break;
						}
						$("#resMsg .resLevel").html(resLevel);
					}
				}else{
					$("#resMsg ."+k).html("--");
				}
			})
			resName = result.data.resName;
			//判断是否是第三方api
			if(result.data.apiType!="local"){
				$(".localAPI").hide();
				$(".localAPI .maxResponse").removeAttr("role");
			}else{
				$(".localAPI").show();
				$(".localAPI .maxResponse").attr("role","{required:true,number:[0,1000]}");
			}
		}
	}
	//请求参数和返回参数公用的渲染表格方法
	function paramTable(result){
		if(result.data && result.data.apiJson){
			var apiJson = JSON.parse(result.data.apiJson);
			var requestTds = "",responseTds = "";
			$.each(apiJson.requestParams,function(index,item){
				var mandatory= "";
				if(item.mandatory=="1"){
					mandatory = "否";
				}else{
					mandatory = "是";
				}
				requestTds += "<tr><td>"+item.name+"</td><td>"+(item.type==undefined?"系统参数":item.type)+"</td>"+
						"<td>"+mandatory+"</td><td>"+item.desc+"</td></tr>"
			})
			$.each(apiJson.responseStruct,function(index,item){
				var notNull= "";
				if(item.notNull=="1"){
					notNull = "否";
				}else{
					notNull = "是";
				}
				responseTds += "<tr><td>"+item.name+"</td><td>"+common.typeSelect(item.type)+"</td>"+
						"<td>"+notNull+"</td><td>"+item.desc+"</td></tr>"
			})
			$("#requestParams tbody").html(requestTds);
			$("#responseParams tbody").html(responseTds);
		}
	}
	//参数名称 - 入参处理策略
	function paramNames(flag,columnName,result,define){
		if(columnName){
			columnName = columnName.split(".").length>1?columnName.split(".")[1]:columnName;
		}
		var obj={}
		obj.options = "",obj.type="";
		if(result && result.data && result.data.apiJson){
			var apiJson = JSON.parse(result.data.apiJson);
			var param;
			if(flag){ //flag true的时候是入参 反之是出参
				param=apiJson.requestParams
			}else{
				param=apiJson.responseStruct
			}
			if(param && param.length>0){
				$.each(param,function(index,item){//"+item.type+"
					if(columnName==item.tableColumn){
						obj.options += "<option selected value='"+item.name+"' data-table='"+item.table+"' data-type='"+item.type+"' tableColumn='"+item.tableColumn+"'>"+item.name+"</option>";
						obj.type=(item.type==undefined?"系统参数":common.typeSelect(item.type))
					}else{
						if(columnName==undefined && index==0){
							obj.type=(item.type==undefined?"系统参数":common.typeSelect(item.type))
						}
						if(item.type){	
							if(define){
								if(item.type =="12"){
									obj.options += "<option value='"+item.name+"'data-table='"+item.table+"' data-type='"+item.type+"' tableColumn='"+item.tableColumn+"'>"+item.name+"</option>";
								}	
							}else{
								if(item.type =="3" || item.type =="4" || item.type =="12"){
									obj.options += "<option value='"+item.name+"'data-table='"+item.table+"' data-type='"+item.type+"' tableColumn='"+item.tableColumn+"'>"+item.name+"</option>";
								}
							}
							
						}else{
							obj.options += "<option value='"+item.name+"'data-table='"+item.table+"' data-type='"+item.type+"' tableColumn='"+item.tableColumn+"'>"+item.name+"</option>";
						}

					}
				})
			}
		}
		return obj;
	}
	//获取策略
	function strategyApi(){
		var strategyApi={};
		$.ajax({
			url:$.path+"/api/resFilterStrategy/findResFilterStrategy", 
			type:"get",                                                
			async:false,
			xhrFields: {withCredentials: true},
			success:function(result){
				strategyApi=result;
			},
			error:function(){
			}
		})
		return strategyApi;
		
	}
	function getStrategy(strategyName,result){
		var obj={};
		obj.options="",obj.content="";
		if(strategyName&&result){
			if(result.data && result.data.length>0){
				$.each(result.data,function(index,item){
					if(strategyName==item.name){
						obj.options += "<option selected value='"+item.name+"' content='"+item.content+"'>"+item.name+"</option>"
					}else{
						if(strategyName==undefined && index==0){
							obj.content = item.content
						}
					obj.options += "<option value='"+item.name+"' content='"+item.content+"'>"+item.name+"</option>"
					}
				})
			}
		}else{
			$.ajax({
				url:$.path+"/api/resFilterStrategy/findResFilterStrategy", 
				type:"get",                                       
				async:false,
				xhrFields: {withCredentials: true},
				success:function(result){
					if(result.data && result.data.length>0){
						$.each(result.data,function(index,item){
							if(index==0){
									obj.content = item.content
							}
							obj.options += "<option value='"+item.name+"' content='"+item.content+"'>"+item.name+"</option>"
						})
					}
				}
			})
		}
			
		return obj;
	}
	function compareSymbolApi(){
		var compareSymbolData={};
		$.ajax({
            url:"../json/checkJson/compareSymbol.json",
            type:"get",
            async:false,
            xhrFields: {withCredentials: true},
            success:function(result){
            	compareSymbolData=result;
            }
		})
		return compareSymbolData;
	}
	//获取比较符
	function compareSymbol(operators,result){
        var options = "";
        if(result && result.length>0){
            $.each(result,function(index,item){
            	if(operators==item.id){
            		options += "<option selected value='"+item.id+"'>"+item.name+"</option>"
            	}else{
            		options += "<option value='"+item.id+"'>"+item.name+"</option>"
            	}
            })
        }
            
		return options;
	}
   //表格参数
    function getTableParam(appData,strategy,compareSymbolData){
        var gridOption={};
        //获取敏感词过滤-content3
        gridOption.p0 = {
            processing:true,
            serverSide:false,
            searching:false,
            ordering:false,
            lengthChange:false,
            paging:false,
            info:false,
            data:[],
            columns:[
                {"data":"columnName","sWidth":"20%"},
                {"data":"columnType","sWidth":"20%"},
                {"data":"strategyName","sWidth":"20%"},
                {"data":"strategyContent","sWidth":"20%"},
                {"data":"operate","sWidth":"20%"}
            ],
            columnDefs:[
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return "<select class='form-control changeParam'>"+paramNames(true,row.columnName,appData).options+"</select>"
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数类型
//                      if(row.columnType){
                            return "系统参数"
//                      }else{
//                          return paramNames(true,row.columnName,appData).type;
//                      }
                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        //获取策略
                        return "<select class='form-control strategy'>"+getStrategy(row.strategyName,strategy).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>"
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        if(row.strategyContent){
                            return row.strategyContent
                        }else{
                            return getStrategy(row.strategyName,strategy).content;
                        }
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        return "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
                    },
                    "targets":4
                }
            ],
            drawCallback:function(setting){
                //改变参数
//              $(".changeParam").off().on("click",function(){
//                  var type = $(this).find("option:selected").attr("data-type");
//                  $(this).parent("td").next().html(type=='undefined'?"系统参数":type)
//              })
                //改变策略
                $("#sensitive_word_filter .strategy").each(function(index,item){
                	var _index=index;
                	$(item).off().on({
	                    change:function(){
	                        if($(this).val()!=-1){
	                            var content = $(this).find("option:selected").attr("content");
	                            $(this).parent("td").next().html(content)
	                        }
	                    },
	                    click:function(){
	                        if($(this).val()==-1){
	                            //新建一个策略
	                            createStrategy(_index,"#sensitive_word_filter");
	                        }
	                    }
	                })
                })
                //新增
                addRow(appData,strategy,compareSymbolData);
                //删除
                deleteRow();
                //每次新增一行之后需要改变策略，因为策略有可能增加了（给表格中的最后一行，因为每次新增的都在最后一行）
//              $("#sensitive_word_filter tr:last .strategy").html(getStrategy(undefined,strategyApi()).options+"<option value='-1' class='createStrategy'>新建一个策略</option>")
//              .parents("td").next().html($("#sensitive_word_filter tr:last .strategy option:selected").attr("content"))
                
            }
        }
        //---------------content4-------------------------
        //获取敏感词过滤
        gridOption.p1 = {
            processing:true,
            serverSide:false,
            searching:false,
            ordering:false,
            lengthChange:false,
            paging:false,
            info:false,
            data:[],
            columns:[
                {"data":"resName","sWidth":"15%"},
                {"data":"columnName","sWidth":"19%"},
                {"data":"columnType","sWidth":"19%"},
                {"data":"strategyName","sWidth":"19%"},
                {"data":"strategyContent","sWidth":"18%"},
                {"data":"operate","sWidth":"10%"}
            ],
            columnDefs:[
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return window.obj.resName;
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return "<select class='form-control changeParam'>"+paramNames(false,row.columnName,appData).options+"</select>"
                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数类型
                        return paramNames(false,row.columnName,appData).type;
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        //获取策略
                        return "<select class='form-control strategy'>"+getStrategy(row.strategyName,strategy).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>"
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        if(row.strategyContent){
                            return row.strategyContent
                        }else{
                            return getStrategy(row.strategyName,strategy).content;
                        }
                    },
                    "targets":4
                },
                {
                    "render":function(data,type,row,meta){
                        return "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
                    },
                    "targets":5
                }
            ],
            drawCallback:function(setting){
                addRow(appData,strategy,compareSymbolData);//新增
                deleteRow();//删除
                changeParamItem()//修改参数
                //改变策略
                $("#sensitive_word_filter_1 .strategy").each(function(index,item){
                	var _index=index;
                	$(item).off().on({
	                    change:function(){
	                        if($(this).val()!=-1){
	                            var content = $(this).find("option:selected").attr("content");
	                            $(this).parent("td").next().html(content)
	                        }
	                    },
	                    click:function(){
	                        if($(this).val()==-1){
	                            //新建一个策略
	                            createStrategy(_index,"#sensitive_word_filter_1");
	                        }
	                    }
	                })
                })
               //每次新增一行之后需要改变策略，因为策略有可能增加了（给表格中的最后一行，因为每次新增的都在最后一行）
//              $("#sensitive_word_filter_1 tr:last .strategy").html(getStrategy(undefined,strategyApi()).options+"<option value='-1' class='createStrategy'>新建一个策略</option>")
//              .parents("td").next().html($("#sensitive_word_filter_1 tr:last .strategy option:selected").attr("content"))
            }
        }
        //获取数据过滤
        gridOption.p2 = {
            processing:true,
            serverSide:false,
            searching:false,
            ordering:false,
            lengthChange:false,
            paging:false,
            info:false,
            data:[],
            columns:[
                {"data":"resName","sWidth":"15%"},
                {"data":"columnName","sWidth":"19%"},
                {"data":"columnType","sWidth":"19%"},
                {"data":"operators","sWidth":"19%"},
                {"data":"value","sWidth":"18%"},
                {"data":"operate","sWidth":"10%"}
            ],
            columnDefs:[
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return window.obj.resName;
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return "<select class='form-control changeParam '>"+paramNames(false,row.columnName,appData).options+"</select>"
                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数类型
                        return paramNames(false,row.columnName,appData).type;
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        return "<select class='form-control compare'>"+compareSymbol(row.operators,compareSymbolData)+"</select>";
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        var value="";
                        if(row.value){
                            value=row.value;
                        }else{
                            value="";
                        }
                        return "<input type='text' name='"+Math.random()+"' class='form-control' role={required:true} value='"+value+"'>";
                    },
                    "targets":4
                },
                {
                    "render":function(data,type,row,meta){
                        return "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>";
                    },
                    "targets":5
                }
            ],
            drawCallback:function(setting){
                addRow(appData,strategy,compareSymbolData);//新增
                deleteRow();//删除
                changeParamItem()//修改参数
                $("#data_filter .dataItem").off().on("click",function () {
                    //修改数据项的时候更改比较符和比较值
                });
                $(".compare").off().on("change",function(){
                    //修改比较符的时候更改比较值
                    if($(this).val()!=-1){
                        var compareValue = $(this).find("option:selected").attr("compareValue");
                        $(this).parent("td").next().html(compareValue)
                    }
                })
                if(dataFilteing){
					$("#step3").find(".part2 .changeParam").change();
					$.each(dataFilteing,function(index,item){
						$($(".compare")[index]).val(item.operators)
					})
					dataFilteing = null;
				}else{
					$("#step3").find(".part2 .changeParam:last").change();
				}
//             $("#step3").find(".part2 .changeParam:last").change()
            }
        }
        //获取数据脱敏
        gridOption.p3 = {
            processing:true,
            serverSide:false,
            searching:false,
            ordering:false,
            lengthChange:false,
            paging:false,
            info:false,
            data:[],
            columns:[
                {"data":"resName","sWidth":"16%"},
                {"data":"columnName","sWidth":"16%"},
                {"data":"columnType","sWidth":"16%"},
                {"data":"type","sWidth":"25%"},
                {"data":"operate","sWidth":"11%"}
            ],
            columnDefs:[
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return window.obj.resName;
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return "<select class='form-control changeParam'>"+paramNames(false,row.columnName,appData,true).options+"</select>"
                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数类型
                        return paramNames(false,row.columnName,appData,true).type;
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        var options="";
                        var startIndex=meta.row+"startIndex";
                        var endIndex=meta.row+"endIndex";
                        if(row.type=="1"){
                            options="<option value='1' selected>保留</option><option value='2'>隐藏</option>"
                        }else{
                            options="<option value='1' selected>保留</option><option value='2' selected>隐藏</option>"
                        }
                        if(row.start){
                            start=row.start
                        }else{
                            start="";
                        }
                        if(row.end){
                            end=row.end
                        }else{
                            end="";
                        }
                        return  "<span style='display:inline-block;margin-right:7px'><select class='form-control'>"+options+"</select></span>"+
                            "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control start' value='"+start+"'role={required:true,number:true}></span><span style='margin:0 5px'>到</span>"+
                            "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control end' value='"+end+"' role={required:true,number:true}></span><span style='margin:0 5px'>位</span>";
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        return "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>";
                    },
                    "targets":4
                }
            ],
            drawCallback:function(setting){
                addRow(appData,strategy,compareSymbolData);//新增
                deleteRow();//删除
                changeParamItem()//修改参数
            }

        }
        //获取数据转换
        gridOption.p4 = {
            processing:true,
            serverSide:false,
            searching:false,
            ordering:false,
            lengthChange:false,
            paging:false,
            info:false,
            data:[],
            columns:[
                {"data":"resName","sWidth":"15%"},
                {"data":"columnName","sWidth":"19%"},
                {"data":"columnType","sWidth":"19%"},
                {"data":"content","sWidth":"19%"},
                {"data":"value","sWidth":"18%"},
                {"data":"operate","sWidth":"10%"}
            ],
            columnDefs:[
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return window.obj.resName;
						/*if(row.resName){
						 return row.resName;
						 }else{
						 return row[0];
						 }*/
                    },
                    "targets":0
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数名称
                        return "<select class='form-control changeParam'>"+paramNames(false,row.columnName,appData).options+"</select>"
                    },
                    "targets":1
                },
                {
                    "render":function(data,type,row,meta){
                        //获取参数类型
                        return paramNames(false,row.columnName,appData).type;
                    },
                    "targets":2
                },
                {
                    "render":function(data,type,row,meta){
                        var content="";
                        var contentIndex=meta.row+"contentIndex"
                        if(row.content){
                            content=row.content
                        }else{
                            content="";
                        }
                        return "<input name='"+Math.random()+"' class='form-control' type='text'value='"+content+"' role={required:true}>";
                    },
                    "targets":3
                },
                {
                    "render":function(data,type,row,meta){
                        var value="";
                        var vIndex=meta.row+"vIndex"
                        if(row.value){
                            value=row.value
                        }else{
                            value="";
                        }
                        return "<input class='form-control' name='"+Math.random()+"' type='text'value='"+value+"' role={required:true}>";
                    },
                    "targets":4
                },
                {
                    "render":function(data,type,row,meta){
                        return "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>";
                    },
                    "targets":5
                }
            ],
            drawCallback:function(setting){
                addRow(appData,strategy,compareSymbolData);//新增
                deleteRow();//删除
                changeParamItem()//修改参数
            }
        }
        //---------------content4-------------------------
        return  gridOption;

	}
	//修改参数名称
	function changeParamItem(){
		$(".changeParam").off().on("change",function(){
			var columnType=$(this).find("option:selected").attr("data-type");
			$(this).parent().next().html(common.typeSelect(columnType));
			var dom = $(this).parents("td").nextAll().find(".compare");
			if($(this).parents("table").attr("id")=="data_transform"){
				if(columnType=="3" || columnType=="4"){
					$(this).parents("tr").find("input:last").attr("role","{required:true,number:true}")
				}else{
					$(this).parents("tr").find("input:last").attr("role","{required:true}")
				}
			}
			if(dom.length>0){
				var options;
				dom.empty();
				if(columnType =="12"){
					options = '<option value="include">包含</option><option value="exclude">不包含</option><option value="fixedLength">定长</option><option value="regexp">正则表达式</option>';
				}else{
					options = '<option value="=">等于</option><option value="<>">不等于</option><option value=">">大于</option><option value="<">小于</option><option value=">=">大于等于</option><option value="<=">小于等于</option><option value="fixedLength">定长</option>'
				}
				dom.append(options)
			}
		})
	}
	//画表格
	var setGrid = function(container,gridOption,num,data){
		var parent;
		if(data.length>0){
			gridOption.data=data;
		}else{
			gridOption.data=[];
		}
		parent = base.datatables({
			container:container,
			option:gridOption,
		});
		switch(num){
			//case 0:grid = parent;break;
			case 1:grid0 = parent;break;
			case 2:grid1 = parent;break;
			case 3:grid2 = parent;break;
			case 4:grid3 = parent;break;
			case 5:grid4 = parent;break;
		}
		
	}
	//新建策略
	var createStrategy=function(createIndex,ele){
		var modal = base.modal({
			label:"新建策略",
			width:700,
			height:270,
			url:"../html/systemManage/keywordsFilter/create.html",
			drag:false,
			modalOption:{"backdrop":"static","keyboard":false},
			callback:function(){
				$(".close").off().on("click",function(){
					$(ele).find(".strategy").eq(createIndex).find("option").removeAttr("selected");
					$(ele).find(".strategy").eq(createIndex).find("option:eq(0)").attr("selected","true")
				})
			},
			buttons:[
				{
					label:"保存",
					cls:"btn btn-info",
					clickEvent:function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								var params = base.form.getParams($("#form"));
								if(params){
									common.submit({
										url:$.path+"/api/resFilterStrategy/add", //5
										params:params,
										type:"post",
										callback:function(d){
											//getStrategy()
											if(d.message='success'){
													d.message="保存成功";
												}else{
													d.message="保存失败";
											}
											//将所有的策略都循环一下，然后记录下他选的值人，然后增加策略之后再将原先选择的塞进去
											$(".strategy").each(function(index,item){
												var val=$(item).val();
												$(item).html("<select>"+getStrategy().options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>");
												if(val=="-1"){
													if(createIndex==index){
														$(ele).find(".strategy").eq(createIndex).find("option:eq(0)").attr("selected","selected")
														$(ele).find(".strategy").eq(createIndex).parents("td").next().html($(item).find("option").attr("content"))
													}
												}else{
													$(item).val(val)
												}
											})
											
											//$(".strategy").html("<select>"+getStrategy(undefined,strategyApi()).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>")
										
										}
									})
									modal.hide();
								}
							}
						})
					}
				},
				{
					label:"重置",
					cls:"btn btn-warning",
					clickEvent:function(){
						common.reset($("#form"));
					}
				
				}
			]
		})
	}
	//点击新增一行
	function addRow(appData,strategy,compareSymbolData){
		$(".add").off().on("click",function(){
			var key = $(this).attr("data-key");
			var DOMLen = $(this).parents(".mb-25").find("table tr").length;
			if(DOMLen>10){
				return base.requestTip().error("最多10个")
			}
			switch(key){
				case "0":
				var data0 = [
					window.obj.resName,
					"<select class='form-control changeParam'>"+paramNames(true,undefined,appData).options+"</select>",
					"系统参数",
					"<select class='form-control strategy'>"+getStrategy(undefined,strategy).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
	                getStrategy(undefined,strategy).content,
	                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
				]; 
				grid0.addRow(data0);break;
				case "1":
				var data1 = [
					window.obj.resName,
	                "<select class='form-control changeParam'>"+paramNames(false,undefined,appData).options+"</select>",
	                common.typeSelect(paramNames(true,undefined,appData).type),
	                "<select class='form-control strategy'>"+getStrategy(undefined,strategy).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
	                getStrategy(undefined,strategy).content,
	                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
				];
				grid1.addRow(data1);break;
				case "2":
				var data2 = [
	                window.obj.resName,
	                "<select class='form-control changeParam'>"+paramNames(false,undefined,appData).options+"</select>",
	                //common.typeSelect(paramNames(false,undefined,appData).type),
	                paramNames(false,undefined,appData).type,
					"<select class='form-control compare'>"+compareSymbol(undefined,compareSymbolData)+"</select>",
					"<input type='text' class='form-control' value=''>",
	                "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>"
				];
				grid2.addRow(data2);break;
				case "3":
				var data3 = [
					window.obj.resName,
	                "<select class='form-control changeParam'>"+paramNames(false,undefined,appData,true).options+"</select>",
	                paramNames(false,undefined,appData,true).type,//common.typeSelect(paramNames(false,undefined,appData).type),
	                "<span style='display:inline-block;margin-right:7px'><select class='form-control'><option value='1'>保留</option><option value='2'>隐藏</option></select></span>"+
	                "<span style='display:inline-block;width:50px;position:relative;top:-1px'><input type='text' class='form-control start'></span><span style='margin:0 5px'>到</span>"+
	                "<span style='display:inline-block;width:50px;position:relative;top:-1px'><input type='text' class='form-control end'></span><span style='margin:0 5px'>位</span>",
				    "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>"
				];
				grid3.addRow(data3);break;
				case "4":
				var data4 = [
					window.obj.resName,
	                "<select class='form-control changeParam'>"+paramNames(false,undefined,appData).options+"</select>",
	                //common.typeSelect(paramNames(false,undefined,appData).type),
	                paramNames(false,undefined,appData).type,
					"<input class='form-control' type='text'value=''>",
	                "<input class='form-control' type='text'value=''>",
	                "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>"
				];
				grid4.addRow(data4);break;
			}
		})
	}
	//点击删除一行
	function deleteRow(){
		$(".delete").off().on("click",function(){
			if($(this).hasClass("del1")){
				if($(this).parents("table").hasClass("sensitive_word_filter")){
					grid0.deleteRow(this)
				}else{
					grid1.deleteRow(this)
				}
			}else if($(this).hasClass("del2")){
				grid2.deleteRow(this)
			}else if($(this).hasClass("del3")){
				grid3.deleteRow(this)
			}else{
				grid4.deleteRow(this)
			}
		})
	}

	return {
		main:function(){
			applyMsg();
			//metaData();	
			getAppData();
			//paramTable()//获取请求参数表格和返回参数的表格
		}
	}
})
