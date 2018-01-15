define(["base","app/commonApp"],function(base,common){
	var grid0=null, grid1=null, grid2=null, grid3=null, grid4=null;
	var resName = "";
	var resId=$(".dataResourceId").val();//资源id
	var subscribeId=$(".dataSubscribeId").val();
	$(".approvalOpinion").removeAttr("readonly"); //审批意见在审核的时候是可以编辑的
	//保存审批数据脱敏的数据项信息
	var onlyText = "";
	//获取订阅申请信息
	var applyMsg = function(){
		$.ajax({
			url:$.path+"/api/subscribeResource/getSubscribeById?id="+window.obj.subscibeId,
			type:"get",
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
								$("#applyMsg ."+k).html(v);
								if(k=='requestTime'){
									$(".requestTime").html(v)
								}
							}
						}else{
							$("#applyMsg ."+k).html("--");
						}
						
					})
					$("#content5 .requestTime").html(result.data.requestTime)
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
				paramTable(result);
				var strategy= getStrategy();
				onlyText = paramNames(result,true);
				setGrid($("#sensitive_word_filter"),getTableParam(paramNames(result),strategy).p0,1);////敏感词过滤
				setGrid($("#sensitive_word_filter_1"),getTableParam(paramNames(result),strategy).p1,2);////敏感词过滤
				setGrid($("#data_filter"),getTableParam(paramNames(result),strategy).p2,3);////数据过滤
				setGrid($("#data_desensitization"),getTableParam(paramNames(result),strategy).p3,4);////数据脱敏
				setGrid($("#data_transform"),getTableParam(paramNames(result),strategy).p4,5);////数据转换
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
				$(".localAPI .maxResponse").attr("role","{required:true,number:true}");
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
				if(item.mandatory=="0"){
					mandatory = "否";
				}else{
					mandatory = "是";
				}
				requestTds += "<tr><td>"+item.name+"</td><td>"+(item.type==undefined?"系统参数":item.type)+"</td>"+
						"<td>"+mandatory+"</td><td>"+item.desc+"</td></tr>"
			})
			$.each(apiJson.responseStruct,function(index,item){
				var notNull= "";
				if(item.notNull=="0"){
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
	//参数名称 - 入参处理策略 出参处理策略
	function paramNames(result,define){
		var obj={}
		obj.options = "",obj.type="";
		obj.options1 = "",obj.type1="";
		if(result && result.data && result.data.apiJson){
			var apiJson = JSON.parse(result.data.apiJson);
			if(apiJson.requestParams && apiJson.requestParams.length>0){
				$.each(apiJson.requestParams,function(index,item){//"+item.type+"
					if(item.columnName !="-1"){
						if(index==0){
							obj.type=(item.type==undefined?"系统参数":item.type)
						}
						obj.options += "<option tableColumn='"+item.tableColumn+"' value='"+item.name+"' data-table='"+item.table+"' data-type='"+item.type+"'>"+item.name+"</option>";
					}
				})
			}
		}
		if(result && result.data && result.data.apiJson){
			var apiJson = JSON.parse(result.data.apiJson);
			if(apiJson.responseStruct && apiJson.responseStruct.length>0){
				$.each(apiJson.responseStruct,function(index,item){//"+item.type+"
					if(item.columnName !=""){		
						if(index==0){
							obj.type1=(item.type==undefined?"系统参数":item.type)
						}
						if(define){
							if(item.type =="12"){
								obj.options1 += "<option tableColumn='"+item.tableColumn+"' value='"+item.name+"' data-table='"+item.table+"' data-type='"+item.type+"'>"+item.name+"</option>";
							}
						}else{
							if(item.type =="3" || item.type =="4" || item.type =="12"){
								obj.options1 += "<option tableColumn='"+item.tableColumn+"' value='"+item.name+"' data-table='"+item.table+"' data-type='"+item.type+"'>"+item.name+"</option>";
							}	
						}
//						if(item.type =="3" || item.type =="4" || item.type =="12"){
//							obj.options1 += "<option tableColumn='"+item.tableColumn+"' value='"+item.name+"' data-table='"+item.table+"' data-type='"+item.type+"'>"+item.name+"</option>";
//						}
					}
				})
			}
		}
		return obj;
	}
	//获取策略
	function getStrategy(){
		var obj={};
		obj.options="",obj.content="";
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
			},
			error:function(){
				
			}
		})
		return obj;
	}
	//获取比较符
	function compareSymbol(){
        var options = "";
        $.ajax({
            url:"../json/checkJson/compareSymbol.json",
            type:"get",
            async:false,
            xhrFields: {withCredentials: true},
            success:function(result){
                if(result && result.length>0){
                    $.each(result,function(index,item){
                        options += "<option value='"+item.id+"'>"+item.name+"</option>"
                    })
                }
            }
		})
		return options;
	}

	function getTableParam(DataItem,strategy){
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
           // data:[],
//          columns:[
//              {"data":"columnName","sWidth":"100px"},
//              {"data":"columnType","sWidth":"100px"},
//              {"data":"strategyName","sWidth":"100px"},
//              {"data":"strategyContent","sWidth":"100px"},
//              {"data":"operate","sWidth":"150px"}
//          ],
//          columnDefs:[
//              {
//                  "render":function(data,type,row,meta){
//                      //获取参数名称
//                      return "<select class='form-control changeParam'>"+DataItem.options+"</select>"
//                  },
//                  "targets":0
//              },
//              {
//                  "render":function(data,type,row,meta){
//                      //获取参数类型
//                      return DataItem.type;
//                  },
//                  "targets":1
//              },
//              {
//                  "render":function(data,type,row,meta){
//                      //获取策略
//                      return "<select class='form-control strategy'>"+strategy.options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>"
//                  },
//                  "targets":2
//              },
//              {
//                  "render":function(data,type,row,meta){
//                      return strategy.content;
//                  },
//                  "targets":3
//              },
//              {
//                  "render":function(data,type,row,meta){
//                      return "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
//                  },
//                  "targets":4
//              }
//          ],
            drawCallback:function(setting){
                //改变参数
//              $(".changeParam").off().on("click",function(){
//                  var type = $(this).find("option:selected").attr("data-type");
//                  $(this).parent("td").next().html(type=='undefined'?"系统参数":type);
//              })
                //改变策略
                $(".strategy").each(function(index,item){
                	var _index=index;
                	$(item).off().on({
	                    change:function(){
	                        if($(this).val()!=-1){
	                            var content = $(this).find("option:selected").attr("content");
	                            $(this).parent("td").next().html(content);
	                        }
	                    },
	                    click:function(){
	                        if($(this).val()==-1){
	                            //新建一个策略
	                            createStrategy(_index); 
	                        }
	
	                    }
                })
                })
                //新增
                addRow(DataItem,strategy);
                //删除
                deleteRow();
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
            drawCallback:function(setting){
                addRow(DataItem,strategy);//新增
                deleteRow();//删除
                changeParamItem();//改变参数
                //改变策略
                $(".strategy").each(function(index,item){
                	var _index=index;
                		$(item).off().on({
	                    change:function(){
	                        if($(this).val()!=-1){
	                            var content = $(this).find("option:selected").attr("content");
	                            $(this).parent("td").next().html(content);
	                        }
	                    },
	                    click:function(){
	                        if($(this).val()==-1){
	                            //新建一个策略
	                            createStrategy(_index); 
	                        }
	                    }
                })
                })
               
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
            drawCallback:function(setting){
                addRow(DataItem,strategy);//新增
                deleteRow();//删除
                changeParamItem();//改变参数
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
                $("#step3").find(".part2 .changeParam:last").change()
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
            drawCallback:function(setting){
                addRow(DataItem,strategy);//新增
                deleteRow();//删除
                changeParamItem();//改变参数
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
            drawCallback:function(setting){
                addRow(DataItem,strategy);//新增
                deleteRow();//删除
                changeParamItem();//改变参数
            }
        }
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
	//---------------content4-------------------------
	//画表格
	var setGrid = function(container,gridOption,num){
		var parent;
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
	var createStrategy=function(createIndex){
		var modal = base.modal({
			label:"新建策略",
			width:700,
			height:270,
			url:"../html/systemManage/keywordsFilter/create.html",
			drag:true,
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
											//getStrategy()
											//将所有的策略都循环一下，然后记录下他选的值人，然后增加策略之后再将原先选择的塞进去
											$(".strategy").each(function(index,item){
												var val=$(item).val();
												$(item).html("<select>"+getStrategy().options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>");
												$(item).val(val)
												if(createIndex==index){
													$(item).find("option:eq(0)").attr("selected","selected")
													$(item).parents("td").next().html($(item).find("option").attr("content"))
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
	function addRow(DataItem,strategy){
		$(".add").off().on("click",function(){
			var key = $(this).attr("data-key");
			var DOMLen = $(this).parents(".mb-25").find("table tr").length;
			if(DOMLen>10){
				return base.requestTip().error("最多10个")
			}
			var strategy = getStrategy();// 由于新建策略时候策略的肯定会新增，所以对当前一行操作新增，又点击添加一行的时候，被添加的这一行也要将新增的策略增加进去，所以要重新调一次接口
			var data0=[
				"<select class='form-control changeParam'>"+DataItem.options+"</select>",
//				common.typeSelect(DataItem.type1),
				"系统参数",
				"<select class='form-control strategy'>"+strategy.options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
                strategy.content,
                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
			]
			var data1 = [
				resName,
                "<select class='form-control changeParam'>"+DataItem.options1+"</select>",
                common.typeSelect(DataItem.type1),
                "<select class='form-control strategy'>"+strategy.options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
                strategy.content,
                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
			]
			var data2 = [
                resName,
                "<select class='form-control changeParam'>"+DataItem.options1+"</select>",
                common.typeSelect(DataItem.type1),
				"<select class='form-control compare'>"+compareSymbol()+"</select>",
				"<input name='"+Math.random()+"' type='text' class='form-control' value='' role={required:true}>",
                "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>"
			]
			var data3 = [
				resName,
                "<select class='form-control changeParam'>"+onlyText.options1+"</select>",
                common.typeSelect(onlyText.type1),
                "<span style='display:inline-block;margin-right:7px'><select class='form-control'><option value='1'>保留</option><option value='2'>隐藏</option></select></span>"+
                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control start' role={required:true,number:true}></span><span style='margin:0 5px'>到</span>"+
                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control end' role={required:true,number:true}></span><span style='margin:0 5px'>位</span>",
			    "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>"
			]
			var data4 = [
				resName,
                "<select class='form-control changeParam'>"+DataItem.options1+"</select>",
                common.typeSelect(DataItem.type1),
				"<input name='"+Math.random()+"' class='form-control' type='text'value='' role={required:true}>",
                "<input name='"+Math.random()+"' class='form-control' type='text'value='' role={required:true}>",
                "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>"
			]
			switch(key){
				case "0":
				grid0.addRow(data0);break;
				case "1":
				grid1.addRow(data1);break;
				case "2":
				grid2.addRow(data2);break;
				case "3":
				grid3.addRow(data3);break;
				case "4":
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
			//paramTable()//获取请求参数表格和返回参数的表格
			//setGrid($("#dataMsg"),gridOption,0);//获取数据项信息
			getAppData();
		}
	}
})
