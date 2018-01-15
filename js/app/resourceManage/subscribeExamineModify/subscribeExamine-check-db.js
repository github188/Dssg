define(["base","app/commonApp"],function(base,common){
	var resId=$(".dataResourceId").val();//资源id
	var subscribeId=$(".dataSubscribeId").val();
	var resName = $(".res-name").val();
	//保存审批数据过滤的内容
	var dataFilteing = [];
	//获取审核内容
	function subscribeUpdate(appData,strategy,compareSymbolData){
		$.ajax({
			url:$.path+"/api/subscribeReview/subscribeModifyGetStrategy",
			xhrFields: {withCredentials: true},
			type:"post",
			contentType:"application/json;chartSet=utf-8",
			data:JSON.stringify({"subscribeId":window.obj.subscibeId}),//JSON.stringify({"resourceId":resId,"subscribeId":subscribeId}),
			success:function(result){
				if(result&&result.data){
					if(result.data.dbProcessStrategyJson){
						var dbJson=JSON.parse(result.data.dbProcessStrategyJson);
						//数据过滤里面可能包含敏感词过滤
						if(dbJson.sensitiveFilteing && dbJson.sensitiveFilteing.length>0){
							var len = dbJson.sensitiveFilteing.length;
							for(var i=0;i<len;i++){
								dbJson.dataFilteing.pop();
								dataFilteing = dbJson.dataFilteing;
							}
						}
						
						setGrid($("#sensitive_word_filter"),tableParam(appData,strategy,compareSymbolData).gridOptionP1,1,addResName(dbJson.sensitiveFilteing,1));////敏感词过滤
						setGrid($("#data_filter"),tableParam(appData,strategy,compareSymbolData).gridOptionP2,2,addResName(dbJson.dataFilteing,2));////数据过滤
						setGrid($("#data_desensitization"),tableParam(appData,strategy,compareSymbolData).gridOptionP3,3,addResName(dbJson.dataDesen,3));////数据脱敏
						setGrid($("#data_transform"),tableParam(appData,strategy,compareSymbolData).gridOptionP4,4,addResName(dbJson.dataConversion,4));////数据转换
						//审批意见
						$(".approvalResult").val(result.data.approvalResult);
						$(".approvalOpinion").val(result.data.approvalOpinion);
						$(".approvalResult").attr("disabled","disabled")
						$(".approvalOpinion").attr("disabled","disabled");//审批意见在审核的时候是不可以编辑的
					}
				}
			}
		})
	}
	//获取findResourceByID接口返回的数据 (先获取此接口中的数据，然后获取获取db的消息)
	function getAppData(){
		$.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+window.obj.resourceId,
			type:"get",
			xhrFields: {withCredentials: true},
			success:function(result){
				if(result && result.data){
					if(result.data.filePath){//图片
						$(".ui-page-headingImage").attr("src",$.path1+result.data.filePath)
					}else if(result.data.pictureUrl){
						$(".ui-page-headingImage").attr("src",$.path1+result.data.pictureUrl)
					}else{
						$(".ui-page-headingImage").attr("src","../images/default.png")
					}
//					if(null!=result.data.filePath){//图片
//						$(".ui-page-headingImage").attr("src",$.path1+result.data.filePath)
//					}else{
//						$(".ui-page-headingImage").attr("src",$.path1+result.data.pictureUrl)
//					}
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
					
				}
			}
		})
	}
	//将资源名称放进出参处理策略中
	function addResName(arr,num){
		var resName=$(".ui-page-title .resName").html();
		if(arr && arr.length>0){
			//如果是敏感词过滤需要添加一个字段名称
			$.each(arr,function(index,item){
				item.id="";
				item.resName=window.obj.resName;
			})
			return arr;
		}else{
			return arr;
		}
	}
	//获取数据项信息
	var gridOption = {
		processing:true,
		serverSide:false,
		searching:false,
		ordering:false,
		lengthChange:false,
		paging:false,
		info:false,
		data:[],
		columns:[
			{ "data": "code","sWidth":"5%"},
			{ "data": "name","sWidth":"15%"},
			{ "data": "ename","sWidth":"20%"},
			{ "data": "code","sWidth":"15%"},
			{ "data": "type","sWidth":"15%"},
			{ "data": "length","sWidth":"15%"},
			{ "data": "dataCode","sWidth":"15%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
           		if(row._selected){
           			 return "<input type='checkbox' data-index='"+meta.row+"' checked name='cb' value='"+row.id+"' ename='"+row.ename+"' class='cb' cid='"+row.id+"'/>"; 
           		}else{
           			 return "<input type='checkbox' data-index='"+meta.row+"' name='cb' value='"+row.id+"' ename='"+row.ename+"' class='cb' cid='"+row.id+"'/>"; 
           		}
              }, 
               "targets":0 
            },
           {"render":function(data,type,row,meta){
           		return "<div typeId='"+row.type+"'>"+transformType(row.type)+"</div>"
              }, 
               "targets":4 
            },
            {"render":function(data,type,row,meta){
           		return row.length?row.length:"--"
              }, 
               "targets":5 
           },
            {"render":function(data,type,row,meta){
           		if(row.dataCode){
           			return row.dataCode
           		}else{
           			return "--"
           		}
              }, 
               "targets":6 
           }
        ],
        drawCallback:function(setting){
        	$("#dataMsg input[type='checkbox']").attr("disabled","disabled")
        }
	}
	function transformType(type){
		switch(type){
   			case"3":return "数字" ;break;
   			case "4":return "整型";break;
   			case "12":return "文本";break;
   			case "91":return "日期" ;break;
   			case "93":return "时间戳";break;
   			case "2004":return "大字段";break;
   			case "15":return "未知类型";break;
   		}
	}
	//获取订阅申请信息
	var applyMsg = function(){
		$.ajax({
			url:$.path+"/api/subscribeResource/getSubscribeById?id="+window.obj.subscibeId,
			type:"get",
			//async:false,
			xhrFields: {withCredentials: true},
			success:function(result){//区分资源类型
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
						if(k=='resType'){
							$("#applyMsg .resType").html(resType)
						}else{
							$("#applyMsg ."+k).html(v)	
							if(k=='requestTime'){
								$(".requestTime").html(v)
							}
						}
						if(k=="model"){
							if(v=="1"){
								$(".model").html("完全同步模式");
							}else{
								$(".model").html("映射模式");
							}
						}
						
					})
					metaData(result);
					if(result.data.dbPublishDataJson){
						dbPublishDataJson=JSON.parse(result.data.dbPublishDataJson).sourceColumns;
					}
					var strategyData = strategyApi();
					var compareSymbolData=compareSymbolApi();
					subscribeUpdate(result,strategyData,compareSymbolData);
				}}
		})
	}
	//获取元数据信息
	function metaData(result){
		if(result && result.data){
			resName = result.data.resName;
			var db = JSON.parse(result.data.subDataJson); //全部的数据项信息在subDataJson里面，被勾选的在approvalDataJson
			localStorage.setItem("approvalDataJson",result.data.subDataJson)
			var checkIds=[];
			if(result && result.data.approvalDataJson){
				var approvalDataJson = JSON.parse(result.data.approvalDataJson)
				$.each(approvalDataJson,function(index,item){
					checkIds.push(item.ename)
				})
			}
			$.each(db,function(index,item){
				if($.inArray(item.ename,checkIds)!=-1){
					item._selected=true
				}else{
					item._selected=false
				}
			})
			setGrid($("#dataMsg"),gridOption,0,db);//获取数据项信息
			
		}
			
	}
   //获取数据项名称 
   function getDataItemName(columnName,result,define){ 
      if(columnName){ 
         var columnName = columnName.split(".").length>1?columnName.split(".")[1]:columnName; 
      } 
      var obj={}; 
      obj.options="",obj.type=""; obj.id="",obj.columnType=""; 
      if(result.data){ //approvalDataJson 
         if(result.data.approvalDataJson){ 
            var db = JSON.parse(result.data.approvalDataJson); 
            var dbpub = JSON.parse(result.data.dbPublishDataJson).sourceColumns;
            $.each(db,function(index,item){ 
            	for(var m=0;m<dbpub.length;m++){
            		if(dbpub[m].dataItemName == item.name){
            			if(dbpub[index].columnName !="" && item.columnName ==""){
            				if(define){//数据脱敏
            					if(item.type =="12"){	
			            			if(columnName==dbpub[index].columnName){
					                 	obj.type = item.type; 
						                obj.id = dbpub[index].columnName; 
						                obj.columnType=item.columnType; 
					                 	obj.options += "<option selected columnType='"+dbpub[index].type+"' value='"+item.name+"' type='"+item.type+"' codeName='"+dbpub[index].columnName+"' >"+item.name+"</option>"
					                 }else{
					                 	obj.options += "<option columnType='"+dbpub[index].type+"' value='"+item.name+"' type='"+item.type+"' codeName='"+dbpub[index].columnName+"' >"+item.name+"</option>"
					                 }
								}
            				}else{
			            		if(item.type =="3" || item.type =="4" || item.type =="12"){	
			            			if(columnName==dbpub[index].columnName){
					                 	obj.type = item.type; 
						                obj.id = dbpub[index].columnName; 
						                obj.columnType=item.columnType; 
					                 	obj.options += "<option selected columnType='"+dbpub[index].type+"' value='"+item.name+"' type='"+item.type+"' codeName='"+dbpub[index].columnName+"' >"+item.name+"</option>"
					                 }else{
					                 	obj.options += "<option columnType='"+dbpub[index].type+"' value='"+item.name+"' type='"+item.type+"' codeName='"+dbpub[index].columnName+"' >"+item.name+"</option>"
					                 }
								}
            				}
		            	}else if(item.columnName !=""){
			               if(columnName==item.columnName){ 
		               			if(define){
		               				if(item.type =="12"){                      
			                     		obj.options += "<option selected columnType='"+item.columnType+"' value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"' >"+item.name+"</option>" 
			                  		} 
		               			}else{
				                  	if(item.type =="3" || item.type =="4" || item.type =="12"){                      
				                     	obj.options += "<option selected columnType='"+item.columnType+"' value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"' >"+item.name+"</option>" 
				                  	} 
		               			}
			                  	obj.type = item.type; 
			                  	obj.id = item.columnName; 
			                  	obj.columnType=item.columnType; 
			               }else{ 
			                  	if(index==0){ 
			                     	obj.type = item.type; 
			                     	obj.id = item.columnName; 
			                     	obj.columnType=item.columnType; 
			                  	} 
			                  	if(define){
			                  		if(item.type =="12"){    
				                    	obj.options += "<option ename='"+item.ename+"' columnType='"+item.columnType+"' value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"'>"+item.name+"</option>" 
				                	} 
			                  	}else{
				                  	if(item.type =="3" || item.type =="4" || item.type =="12"){    
				                     	obj.options += "<option ename='"+item.ename+"' columnType='"+item.columnType+"' value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"'>"+item.name+"</option>" 
				                  	} 
			                  	}
			               } 
		            	}
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
	//获取比较符
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
	function compareSymbol(operators,result){
        var options = "";
        $.each(result,function(index,item){
        	if(operators==item.id){
        		options += "<option selected value='"+item.id+"'>"+item.name+"</option>"
        	}else{
        		options += "<option value='"+item.id+"'>"+item.name+"</option>"
        	}
        })
                
		return options;
	}
	//修改数据项
	function changeParamItem(){
		$(".changeParam").off().on("change",function(){
			var type = $(this).find("option:selected").attr("type");
			var name = $(this).find("option:selected").attr("codeName");
			var columnType=$(this).find("option:selected").attr("columnType")
			$(this).parent("td").next().html("<div typeId='"+columnType+"'>"+transformType(type)+"</div>").next().html(name);
			var dom = $(this).parents("td").nextAll().find(".compare");
			if($(this).parents("table").attr("id")=="data_transform"){
				if(type=="3" || type=="4"){
					$(this).parents("tr").find("input:last").attr("role","{required:true,number:true}")
				}else{
					$(this).parents("tr").find("input:last").attr("role","{required:true}")
				}
			}
			if(dom.length>0){
				var options="";
				dom.empty();
				if(type =="12"){
					options = '<option value="include">包含</option><option value="exclude">不包含</option><option value="fixedLength">定长</option><option value="regexp">正则表达式</option>';
				}else{
					options = '<option value="=">等于</option><option value="<>">不等于</option><option value=">">大于</option><option value="<">小于</option><option value=">=">大于等于</option><option value="<=">小于等于</option><option value="fixedLength">定长</option>'
				}
				dom.append(options)
			}
		})
	}
	//表格的gridOption
	var tableCount =0;
	function tableParam(appData,strategy,compareSymbolData){
		var gridOption={};
		//获取敏感词过滤
		gridOption.gridOptionP1 = {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			paging:false,
			info:false,
			data:[],
			columns:[
				{"data":"resName","sWidth":"14%"},
				{"data":"columnName","sWidth":"14%"},
				{"data":"columnType","sWidth":"14%"},
				{"data":"id","sWidth":"14%"},
				{"data":"strategyName","sWidth":"14%"},
				{"data":"value","sWidth":"20%"},
				{"data":"operate","sWidth":"10%"}
			],
			columnDefs:[
				{
					"render":function(data,type,row,meta){
						//获取参数名称
						return window.obj.resName
					},
					 "targets":0 
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项名称
						return "<select class='form-control changeParam'>"+getDataItemName(row.columnName,appData).options+"</select>";
					},
					 "targets":1 
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项类型
						return "<div typeId='"+getDataItemName(row.columnName,appData).columnType+"'>"+transformType(getDataItemName(row.columnName,appData).type)+"</div>"
					},
					 "targets":2 
				},
				{ 
					"render":function(data,type,row,meta){
						return getDataItemName(row.columnName,appData).id
					},
					"targets":3
				},
				{
					"render":function(data,type,row,meta){
						//获取策略
						return "<select class='form-control strategy'>"+getStrategy(row.strategyName,strategy).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>";
					},
					 "targets":4
				},
				{
					"render":function(data,type,row,meta){
						if(row.value){
							return row.value
						}else{
							return getStrategy(row.strategyName,strategy).content;
						}
					},
					"targets":5
				},
				{
					"render":function(data,type,row,meta){
						return "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
					},
					"targets":6
				}
			],
			drawCallback:function(setting){
				//改变策略
				$(".strategy").each(function(index,item){
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
								createStrategy($(this).index());
							}
						}
					})
				})
				addRow(appData,strategy,compareSymbolData);//新增
				deleteRow(appData,strategy,compareSymbolData);//删除
				changeParamItem();
				//每次新增一行之后需要改变策略，因为策略有可能增加了（给表格中的最后一行，因为每次新增的都在最后一行）
//              $("#sensitive_word_filter tr:last .strategy").html(getStrategy(undefined,strategyApi()).options+"<option value='-1' class='createStrategy'>新建一个策略</option>")
//              .parents("td").next().html($("#sensitive_word_filter_1 tr:last .strategy option:selected").attr("content"))
				
			}
		}
		//获取数据过滤
		gridOption.gridOptionP2 = {
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
				{"data":"columnName","sWidth":"15%"},
				{"data":"columnType","sWidth":"15%"},
				{"data":"id","sWidth":"15%"},
				{"data":"operators","sWidth":"15%"},
				{"data":"value","sWidth":"15%"},
				{"data":"operate","sWidth":"10%"}
			],
			columnDefs:[
				{
					"render":function(data,type,row,meta){
						//获取参数名称
						return window.obj.resName
					},
					 "targets":0 
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项名称
						return "<select class='form-control changeParam'>"+getDataItemName(row.columnName,appData).options+"</select>"
					},
					 "targets":1
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项类型
						return "<div typeId='"+getDataItemName(row.columnName,appData).columnType+"'>"+transformType(getDataItemName(row.columnName,appData).type)+"</div>";
					},
					 "targets":2
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项类型
						return getDataItemName(row.columnName,appData).id
					},
					 "targets":3
				},
				{
					"render":function(data,type,row,meta){
						return "<select class='form-control compare'>"+compareSymbol(row.operators,compareSymbolData)+"</select>";
					},
					 "targets":4
				},
				{
					"render":function(data,type,row,meta){
						var compareVIndex=meta.row+"compareVIndex"
						if(row.value){
							return "<input type='text' name='"+compareVIndex+"' class='form-control compareValue'placeholder='必填' value='"+row.value+"' role={required:true}>";
						}else{
							return "<input type='text'  name='"+compareVIndex+"' class='form-control compareValue' placeholder='必填'  value='' role={required:true}>";
						}
					},
					"targets":5
				},
				{
					"render":function(data,type,row,meta){
						return "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>";
					},
					"targets":6
				} 
			],
	        drawCallback:function(setting){
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
	            addRow(appData,strategy,compareSymbolData);//新增
				deleteRow(appData,strategy,compareSymbolData);//删除
				changeParamItem();
				
				if(dataFilteing){
					$("#step2").find(".part2 .changeParam").change();
					$.each(dataFilteing,function(index,item){
						$($(".compare")[index]).val(item.operators)
					})
					dataFilteing = null;
				}else{
					$("#step2").find(".part2 .changeParam:last").change();
				}
				
	        }
		}
		//获取数据脱敏
		gridOption.gridOptionP3 = {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			paging:false,
			info:false,
			data:[],
			columns:[
				{"data":"resName","sWidth":"13%"},
				{"data":"columnName","sWidth":"13%"},
				{"data":"columnType","sWidth":"13%"},
				{"data":"id","sWidth":"12%"},
				{"data":"type","sWidth":"22%"},
				{"data":"operate","sWidth":"10%"}
			],
			columnDefs:[
				{
					"render":function(data,type,row,meta){
						//获取参数名称
						return window.obj.resName
					},
					 "targets":0 
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项名称
						return "<select class='form-control changeParam'>"+getDataItemName(row.columnName,appData,true).options+"</select>"
					},
					 "targets":1
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项类型
						return "<div typeId='"+getDataItemName(row.columnName,appData,true).columnType+"'>"+transformType(getDataItemName(row.columnName,appData,true).type)+"</div>";
					},
					 "targets":2
				},
				{
					"render":function(data,type,row,meta){
						return	getDataItemName(row.columnName,appData,true).id;
					},
					"targets":3
				},
				{
					"render":function(data,type,row,meta){
						var options="",start="",end="";
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
				                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+startIndex+"' class='form-control start' value='"+start+"' role={required:true,number:true} placeholder='必填数字' ></span><span style='margin:0 5px'>到</span>"+
				                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+endIndex+"' class='form-control end' value='"+end+"' role={required:true,number:true} placeholder='必填数字' ></span><span style='margin:0 5px'>位</span>";
					},
					 "targets":4
				},
				{
					"render":function(data,type,row,meta){
						return "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>";
					},
					"targets":5
				} 
			],
	        drawCallback:function(setting){
				addRow(appData,strategy,compareSymbolData);//新增
				deleteRow(appData,strategy,compareSymbolData);//删除
				changeParamItem();
			}
			
		}
		//获取数据转换
		gridOption.gridOptionP4 = {
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
				{"data":"columnName","sWidth":"15%"},
				{"data":"columnType","sWidth":"15%"},
				{"data":"id","sWidth":"15%"},
				{"data":"content","sWidth":"15%"},
				{"data":"value","sWidth":"15%"},
				{"data":"operate","sWidth":"10%"}
			],
			columnDefs:[
				{
					"render":function(data,type,row,meta){
						//获取参数名称
						return window.obj.resName
					},
					 "targets":0 
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项名称
						return "<select class='form-control changeParam'>"+getDataItemName(row.columnName,appData).options+"</select>"
					},
					 "targets":1
				},
				{
					"render":function(data,type,row,meta){
						//获取数据项类型
						return "<div typeId='"+getDataItemName(row.columnName,appData).columnType+"'>"+transformType(getDataItemName(row.columnName,appData).type)+"</div>"
					},
					 "targets":2
				},
				{
					"render":function(data,type,row,meta){
						return getDataItemName(row.columnName,appData).id
					},
					 "targets":3
				},
				{
					"render":function(data,type,row,meta){
						var content="";
						var contentIndex=meta.row+"contentIndex";
						if(row.content){
							content=row.content
						}else{
							content=""; 
						}
						return "<input class='form-control'name='"+contentIndex+"' type='text'value='"+content+"'>";
					},
					 "targets":4
				},
				{
					"render":function(data,type,row,meta){
						var value="";
						var valueIndex=meta.row+"valueIndex"
						if(row.value){
							value=row.value
						}else{
							value="";
						}
						return "<input class='form-control' name='"+valueIndex+"' placeholder='必填' type='text'value='"+value+"' role={required:true}>";
					},
					"targets":5
				},
				{
					"render":function(data,type,row,meta){
						return "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>";
					},
					"targets":6
				} 
			],
	        drawCallback:function(setting){
	        	addRow(appData,strategy,compareSymbolData);//新增
				deleteRow(appData,strategy,compareSymbolData);//删除
				changeParamItem();
	        }
		}
		return gridOption;
	}
	
	//画表格		
	var setGrid = function(container,gridOption,num,data){
		var parent;
		if(data.length>0){
			gridOption.data=data;
			gridOption.aaData=data;
		}else{
			gridOption.data=[];
			gridOption.aaData=[];
		}
		parent = base.datatables({
			container:container,
			option:gridOption,
		});
		switch(num){
			case 0:grid = parent;break;
			case 1:grid1 = parent;break;
			case 2:grid2 = parent;break;
			case 3:grid3 = parent;break;
			case 4:grid4 = parent;break;
		}
		
	}
	//新建策略
	var createStrategy=function(createIndex){
		var modal = base.modal({
			label:"新建策略",
			width:700,
			height:270,
			url:"../html/systemManage/keywordsFilter/create.html",
			drag:false,
			modalOption:{"backdrop":"static","keyboard":false},
			callback:function(){
				$(".close").off().on("click",function(){
					$(".strategy").eq(createIndex).find("option").removeAttr("selected");
					$(".strategy").eq(createIndex).find("option:eq(0)").attr("selected","selected")
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
										url:$.path+"/api/resFilterStrategy/add",
										params:params,
										type:"post",
										callback:function(d){
											if(d.message='success'){
												d.message="保存成功";
											}else{
												d.message="保存失败";
											}
											//将所有的策略都循环一下，然后记录下他选的值人，然后增加策略之后再将原先选择的塞进去
											$(".strategy").each(function(index,item){
												var val=$(item).val();
//												$(item).html("<select>"+getStrategy(undefined,strategyApi()).options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>");
												$(item).html("<select>"+getStrategy().options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>")
												if(val =="-1"){
													if(createIndex==index){
														$(item).find("option:eq(0)").attr("selected","selected")
														$(item).parents("td").next().html($(item).find("option").attr("content"))
													}
												}else{
													$(item).val(val)
												}
											})
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
			var data1 = [
				window.obj.resName,
                "<select class='form-control changeParam'>"+getDataItemName(undefined,appData).options+"</select>",
                "<div typeId='"+getDataItemName(undefined,appData).columnType+"'>"+transformType(getDataItemName(undefined,appData).type)+"</div>",getDataItemName(undefined,appData).id,
                "<select class='form-control strategy'>"+strategy.options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
                strategy.content,
                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
			]
			var data2 = [
                window.obj.resName,
                "<select class='form-control changeParam'>"+getDataItemName(undefined,appData).options+"</select>",
                "<div typeId='"+getDataItemName(undefined,appData).columnType+"'>"+transformType(getDataItemName(undefined,appData).type)+"</div>",getDataItemName(undefined,appData).id,
				"<select class='form-control compare'>"+compareSymbol(undefined,compareSymbolData)+"</select>",
				"<input type='text' class='form-control compareValue' value='' role={required:true}>",
                "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>"
			]
			var data3 = [
				window.obj.resName,
                "<select class='form-control changeParam'>"+getDataItemName(undefined,appData,true).options+"</select>",
                "<div typeId='"+getDataItemName(undefined,appData,true).columnType+"'>"+transformType(getDataItemName(undefined,appData,true).type)+"</div>",getDataItemName(undefined,appData,true).id,
                "<span style='display:inline-block;margin-right:7px'><select class='form-control'><option value='1'>保留</option><option value='2'>隐藏</option></select></span>"+
                "<span style='display:inline-block;width:50px;position:relative;top:-1px'><input type='text' class='form-control start'role={required:true,number:true}></span><span style='margin:0 5px'>到</span>"+
                "<span style='display:inline-block;width:50px;position:relative;top:-1px'><input type='text' class='form-control end'role={required:true,number:true}></span><span style='margin:0 5px'>位</span>",
			    "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>"
			]
			var data4 = [
				window.obj.resName,
                "<select class='form-control changeParam'>"+getDataItemName(undefined,appData).options+"</select>",
               	"<div typeId='"+getDataItemName(undefined,appData).columnType+"'>"+transformType(getDataItemName(undefined,appData).type)+"</div>",getDataItemName(undefined,appData).id,
				"<input class='form-control' type='text'value=''role={required:true}>",
                "<input class='form-control' type='text'value=''role={required:true}>",
                "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>"
			]
			switch(key){
				case "1":
				grid1.addRow(data1);break;
				case "2":
				grid2.addRow(data2);
				break;
				case "3":
				grid3.addRow(data3);break;
				case "4":
				grid4.addRow(data4);break;
			}
			//在行添加成功之后，select中可能会有多的数据，所以要去掉
			var enames=[];//数据项选中项    -----未渲染的
			$(".db #dataMsg [name='cb']").not(":checked").each(function(index,item){
				enames.push($(item).attr("ename"))
			});
			//如果ename数组的长度是大于0的，则数据项渲染的值需要被去掉
//			$.each(enames,function(index,item){
//				$(".db .changeParam option").each(function(index,item1){
//					var attr=$(item1).attr("ename");
//					if(attr==item){
//						$(item1).remove();
//					}
//				})
//			})
		})
	}
	//点击删除一行
	function deleteRow(appData,strategy){
		$(".delete").off().on("click",function(){
			if($(this).hasClass("del1")){
				grid1.deleteRow(this)
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
			getAppData();
			
		}
	}
})
