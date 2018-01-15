define(["base","app/commonApp","select2"],function(base,common,select2){
	var timestampList =null;
	//获取数据源的详细配置信息
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		paging: false,
		ajax:{
			url:$.path+"/api/localresdatasource/findResPageByNameOrTypeInfo",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				return {type:1}
			}
		},
		columns:[
			{"data":"id","sWidth":"10%"},
			{"data":"name","sWidth":"25%"},
			{"data":"ip","sWidth":"25%"},
			{"data":"port","sWidth":"20%"},
			{"data":"dbType","sWidth":"20%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cbs' value='"+row.id+"' class='cbs' cAll = '"+JSON.stringify(row)+"' cid='"+row.id+"'/></div>"; 
              },
               "targets":0 
	       }
        ],
        drawCallback:function(setting){
        	$("#publishResource tbody").on("click","tr",function(){
        		$(this).find("input").prop("checked",true);
        		$(this).siblings().find("input").prop("checked",false)
	    	})
		}
	}

	//配置选择数据表出现的选择表的配置项
	var gridOptionP1 = { 
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/commonController/selectTablesAllByDSIdPage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				return {datasourceId:$("#publishResource").find(".cbs:checked").val(),name:$(".selectDataTableName").val(),page:d.page,size:d.size}
			}
		},
		columns:[
			{"data":"id","sWidth":"20%"},
			{"data":"name","sWidth":"80%"},
		],
		columnDefs:[
			{"render":function(data,type,row,meta){
                 return "<div class='checkboxWrapper'><input type='checkbox' name='cb' value='"+row.datasourceId+"' class='cb' cAll = '"+JSON.stringify(row)+"' cid='"+row.datasourceId+"'/></div>"; 
              },
               "targets":0 
	        }
		],
		drawCallback:function(setting){
			base.selectAll($("#cball"),$(".cb"),function(){ 
			    common.checkByGridButton($(".cb")); 
			});
		}
	}
	
	//画表格-数据源的表格
	var setGrid = function(container,gridOption,num){
		var parent;
		parent = base.datatables({
			container:container,
			option:gridOption,
			filter:common.gridFilter
		});
		switch(num){
			case 0:grid = parent;break;
			case 1:grid1 = parent;break;
			case 2:grid2 = parent;break;
			case 3:grid3 = parent;break;
			case 4:grid4 = parent;break;
		}
		
	}
	
	//选择数据表点击按钮事件
	var selectResource = function(){
		$(".selectResource").off().on("click",function(){
			var modal1 = base.modal({
				label:"选择数据表",
				width:420,
				height:440,
				url:"../html/resourceManage/publishResource/selectContent.html",
				drag:false,
				callback:function(){
					setGrid($("#selectDataTable"),gridOptionP1,2);
					$(".TableModal .search").on("click",function(){
						grid2.reload();
					})
					$("#selectDataTable").on("click","tr",function(){
						$(this).find("input").prop("checked",true);
						$(this).siblings().find('input').prop("checked",false);
					})
				},
				buttons:[{
					label:"确定",
					cls:"btn btn-info",
					clickEvent:function(){
						var tableName=JSON.parse($("#selectDataTable").find("input:checked").attr("call")).name;
						$(".sqltables").attr("name",tableName);
						var params = {datasourceId:base.getCR('cbs').val(),tableName:tableName}
						base.ajax({
							url:$.path+"/api/commonController/selectColByDSIdAndTabNames",
							type:"get",
							params:params,
							success: function(data) {
								if(data.message =="success"){
									$(".syncMethod").val("1").change();
									$(".inputParams tbody tr").map(function(){
										var type = $(this).find("td:nth-child(3)").attr("type");
										var ename = $(this).find("td:first").attr("ename").slice(4);
										var options="<option value='-1'>请选择</option>",
											firstOption="",option="",tType="",tName="",isHasFirst = false;
										data.data.map(function(item,value){
											timestampList =[];
											var tableData = item.tableData,a=0;
											for(var k=0;k<tableData.length;k++){
												if(tableData[k].columnName && tableData[k].columnName!="PK" && tableData[k].tableName){
													if(tableData[k].valueType =="93" || tableData[k].valueType=="91"){
														timestampList.push(tableData[k].columnName);
													}
													if(tableData[k].valueType ==type){
														/**名称一样，则优先处理,默认选中第一个**/
														if(tableData[k].columnName.toUpperCase() ==ename.toUpperCase()){
															tType = tableData[k].type;
															tName = tableData[k].tableName;
															isHasFirst = true;
															firstOption += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
														}else{
															if(!isHasFirst){
																if(a=="0"){								
																	tType = tableData[k].type;
																	tName = tableData[k].tableName;
																}
																a++
															}
															option += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
														}
													}
												}
											}
										})
										options =options+firstOption+option;
										var _type = common.interceptString(tType,10);
										var _name = common.interceptString(tName,10);
										$(this).find(".outParameterJson").empty().append(options);
										$(this).find(".outParameterJson option:eq(1)").prop('selected',true);
										$(this).find(".outParameterJson").parents("td").next().empty().append(_type)
										$(this).find(".outParameterJson").parents("td").next().next().empty().append(_name);
									})
									//下拉框改变时调用的事件
									selectchange();
								}
							}
						})
						modal1.hide();
					}
				}]
			})
			
		})
		
		$(".selectSQL").off().on("click",function(){
			$(".showDatasourceTable").find("li").removeClass("active");
			$(".showDatasourceTable").find("li:last").addClass("active");
			$(".sqlScriptMode").show();
			$(".graphicsEditor").hide();
			$(".sqlContent").text("");
			$(".dataSources").html("");
			$(".showDatasourceTable .outParameterJson").parent().next().html("");
			$(".showDatasourceTable .outParameterJson").empty().append("<option value='-1'>请选择</option>");
		})
	}
	
	 //关联数据表下的表格的下拉框的下拉事件 
	function selectchange(){
		$(".outParameterJson").on("change",function(){
			if($(this).val()&&$(this).val() !="-1"){
				var tt = JSON.parse($(this).find("option:selected").attr("name"));
				$(this).parent().next().html(common.interceptString(tt.type,8));
				$(this).parent().next().next().html(common.interceptString(tt.tableName,8));
			}else{
				$(this).parent().next().html("");
				$(this).parent().next().next().html("");
			}
		})
	}
	
	//页面加载获取元数据
	function metaData(){
		var modalId = $(".modal").attr("id");
		base.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+modalId,
			type:"get",
			success:function(result){
				if(result && result.data){
					var dbJson = JSON.parse(result.data.dbJson);
					$(".dbJson").attr("name",result.data.dbJson);
					var intrCon="";
					if(dbJson){
						dbJson.map(function(item,index){
							var type=common.typeSelect(item.type);
							var name = item.pk?item.name+"(PK)":item.name;
							var isPK  = item.pk == true ?'<button class="btn btn-link primary add" title="主键"><i class="fa fa-key"></i></button>':'<button class="btn btn-link primary" title="主键"><i  style="background:url(../images/buttonbar_bg.png) -100px 0" class="fa fa-key"></i></button>';
							var doOk =  "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button>"+isPK+"</div>";
							intrCon += '<tr><td class="name" code="'+item.code+'" name="'+item.name+'" ename="'+item.ename+'">'+common.interceptString(name,10)+'</td><td class="ename" >'+common.interceptString(item.ename.slice(4),10)+'</td><td class="type" type="'+item.type+'">'+type+'</td><td class="length">'+(item.length?item.length:"--")+'</td>'+
									'<td><select class="outParameterJson form-control"><option value="-1">请选择</option></select></td>'+
									'<td ></td><td class="dataSources"></td><td>'+doOk+'</td>'+
								'</tr>';
						});
					} 
					var settimeout = setTimeout(function(){
						$(".inputParams").find("tbody").html(intrCon);
						$(".outParameterJson").select2();
						$.each(result.data,function(k,v){
							if(k=='resType'){
								$(".fbyl ."+k).html('数据库')
							}else{
								if(v){									
									$(".fbyl ."+k).html(v)	
								}else{
									$(".fbyl ."+k).html("--")
								}
							}
						})
					},1000)
				}
			}
		})
	}
	
	//获取数据项转换下拉内容详细信息
	var dataSourceExec = function(){
		var modalId =$(".modal").attr("id");
		base.ajax({
			url:$.path+"/api/resCatalog/getDBJsonDataDictsList?id="+modalId,
			type:"get",
			success:function(result){
				if(result && result.data&&result.data.length>0){
					var len = result.data.length;
					var data = result.data;
					var options="<option value='-1'>请选择</option>";
					for(var i=0;i<len;i++){
						options += "<option value='"+JSON.stringify(data[i])+"'>"+data[i].name+"</option>" 
					} 
					$("#datasourceList").empty().append(options);
				}else{
					$(".switchExec").attr("disabled",true);
				}
			}
		})
		
	}
	//数据项转换下拉点击左侧区域出现的内容代码区块
	var datasourceExecChange = function(text){
		var columns = [],columnsName="",columnsType="";
		$(".inputParams").find("tbody tr").map(function(index,item){
			if($(item).find(".name").attr("name") == text){
				var Dom= $(item);
				columns.push({
					columnName:Dom.find(".outParameterJson option:selected").val(),
					tableName:Dom.find(".dataSources div").attr("title")
				})
				columnsName = Dom.find(".outParameterJson").val();
//				columnsType = Dom.find(".dataSources").prev().html()
				columnsType = Dom.find(".dataSources").prev().find("div").attr("title");
			}
		})
		var params = {
			dataSourceId:base.getChecks('cbs').val[0],
			columns:columns
		}
		
		var type = $(".selectTab li.active").attr("key");
		var sql = $(".sqlContent").val().replace(/\n+|\s+|\t|\;$/g," ");
		var url = "";
		if(type =="0"){
			params.type = 1;
		}else{
			params.type = 2;
			params.sql =  sql;
		}
		base.ajax({
			url:$.path+"/api/resource/getColumnValue",
			type:"post",
			params:params,
			success: function(data) {
				var lis="";
				for(var i in data.data){
					for(var k=0;k<data.data[i].length;k++){
						lis += "<li columnsName='"+columnsName+"' columnsType='"+columnsType+"'>"+data.data[i][k]+"</li>";
					}
				}
				var temcount=0;
				$(".datasource1").find("ul").hide();
				$(".datasource1").find("ul").map(function(index,item){
					if($(item).data("index") ==columnsName){
						$(item).show();
						temcount ++;
						return ;
					}
				})
				
				if(temcount =="0"){
					var ul = $("<ul>").attr("data-index",columnsName);
					ul.append(lis);
					$(".datasource1").append(ul);
				}
			},
			error:function(data){
			}
		})
	}
	
	var dispatchChange = function(){
		//校验SQL
		$(".checkSQL").on("click",function(){
			var sqlvalue = $(".sqlContent").val().replace(/\n+|\s+|\t|\;$/g," ");
			if(sqlvalue){
				var dataSourceId =base.getCR('cbs').val();
				var Type= JSON.parse(base.getCR('cbs').attr("call")).dbType;
				base.ajax({
					url:$.path+"/api/resource/checkQueryScript?dataSourceId="+dataSourceId+"&sql="+sqlvalue+"&dbType="+Type,
					type:"get",
					success:function(results){
						if(results &&  results.data){
							runsql(dataSourceId,sqlvalue);
						}else{
							base.requestTip({"position":"center"}).error("SQL不可用");
						}
					}
				})
			}else{
				return base.requestTip({"position":"center"}).error("请输入 SQL 语句")
			}
		})
		//执行sql
		var runsql = function(dataSourceId,sqlvalue){
			base.ajax({
				url:$.path+"/api/resource/checkSql?dataSourceId="+dataSourceId+"&sql="+sqlvalue,
				type:"get",
				success:function(result){
					if(result && result.data){
						timestampList=[]
						$.each(result.data,function(e,v){
							if(v.valueType =="93" || v.valueType=="91"){
								timestampList.push(v.columnName)
							}
						})
						base.requestTip({"position":"center"}).success("sql应用成功");
						selectchange();
						$(".outParameterJson").parents("td").next().html("");
						$(".outParameterJson").parents("td").next().next().html("");
						var len = result.data.length;
						$(".inputParams tbody tr").map(function(){
							var type = $(this).find("td:nth-child(3)").attr("type");
							var ename = $(this).find("td:first").attr("ename").slice(4);
							var options="<option value='-1'>请选择</option>",firstOption="",option="",tType="",tName="";
							var tableData = result.data,temSqltables = [],a=0,isHasFirst=false;
							for(var k=0;k<tableData.length;k++){
								if(tableData[k].columnName && tableData[k].columnName!="PK"){
									if(tableData[k].valueType ==type){
										if(temSqltables.indexOf(tableData[k].tableName)=="-1"){									
											temSqltables.push(tableData[k].tableName);
										}
										/**名称一样，则优先处理,默认选中第一个**/
										if(tableData[k].columnName.toUpperCase() ==ename.toUpperCase()){
											tType = tableData[k].type;
											tName = tableData[k].tableName ? tableData[k].tableName :"--";
											isHasFirst = true;
											firstOption += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
										}else{
											if(!isHasFirst){
												if(a=="0"){
													tType = tableData[k].type;
													tName = tableData[k].tableName ? tableData[k].tableName :"--";
												}
												a++
											}
											option += "<option title='"+tableData[k].columnName+"' name='"+JSON.stringify(tableData[k])+"'>"+tableData[k].columnName+"</option>";
										}
									}
								}
							}
							options =options+firstOption+option;
							$(this).find(".outParameterJson").empty().append(options);
							$(this).find(".outParameterJson option:eq(1)").prop('selected',true);
							var _type = common.interceptString(tType,10);
							var _name = common.interceptString(tName,10);
							$(this).find(".outParameterJson").parents("td").next().empty().append(_type)
							$(this).find(".outParameterJson").parents("td").next().next().empty().append(_name);
							$(".sqltables").attr("name",JSON.stringify(temSqltables));
						})
					}else{
						base.requestTip({"position":"center"}).error(result.message);
					}
				},
				error:function(results){
					base.requestTip({"position":"center"}).error(results.message);
				}
			})
		}
		$(".dateTypeMax").on("change",function(){
			if($(this).val()=="3"){
				$('.day').parent().parent().hide();
			}else{
				$('.day').parent().parent().show();
			}
		})
		//设置同步类型
		$(".syncMethod").on("change",function(){
			if($(this).val()=="2"){
				$(".dispatchType").empty().append('<option value="1">周期模式</option><option value="2">定期模式</option>');
				$(".showNotes").find("p[key='1']").show();
				$(".timestampList").show();
				$(".timestampsyncTablename").html($(".sqltables").attr("name"));
				$("#timestampField").empty();
				//获取到时间戳的所有字段
				var options = "";
				if(timestampList&&timestampList.length>1){
					timestampList.map(function (index) {		
						options +="<option value='"+index+"'>"+index+"</option>";
					})
				}
				$("#timestampField").append(options);
//				var timestamp = $(".showDatasourceTable tbody tr");
//					timestamp.map(function (index,item){
//						var dom = $(item).find("td.type").attr("type");
//						if(dom =="93" || dom =="91"){//相同的类型的下拉选择框
//							var selectDom  = $(item).find("td:nth-child(5)").find("select option");
//							selectDom.map(function (index,items) {								
//								if(index != "0"){//去掉请选择
//									var optionVal = $(items).attr("title");
//									options +="<option value='"+optionVal+"'>"+optionVal+"</option>";
//									$("#timestampField").empty().append(options);
//								}
//							})
//						}
//					})
			}else{
				$(".showNotes").find("p[key='1']").show();
				$(".dispatchType").empty().append('<option value="1">周期模式</option><option value="2">定期模式</option><option value="3">触发器模式</option>')
				$(".timestampsyncTablename").html("");
				$("#timestampField").empty();
				$(".timestampList").hide();
			}
		})
		//数据项转换下的数据项下拉点击事件
		$("#datasourceList").on("change",function(){
			if($(this).val() != "-1"){
				if($(".execCode:checked").length>0){//启用了数据编码转换
					if($(".switchExec:checked").length>0){
						var values = JSON.parse($(this).val()),len = values.trees.length,lis = "";
						$(".dictName").val(values.dictName);
						$(".mapping").val(JSON.parse($(this).val()).name+" <-> "+values.dictName);
						
						for(var i=0;i<len;i++){
							lis +="<li name='"+JSON.stringify(values.trees[i])+"'>"+values.trees[i].code+"</li>";	
						}
						$(".datasource2").find("ul").empty().append(lis);
						var text = $(this).find("option:selected").text();
						datasourceExecChange(text);
					}else{
						base.requestTip({"position":"center"}).error("请先启用转换功能")
					}
				}else{
					if($(".switchExec:checked").length>0){
						var values = JSON.parse($(this).val()),len = values.trees.length,lis = "";
						$(".dictName").val(values.dictName);
						$(".mapping").val(JSON.parse($(this).val()).name+" <-> "+values.dictName);
						
						for(var i=0;i<len;i++){
							lis +="<li name='"+JSON.stringify(values.trees[i])+"'>"+values.trees[i].name+"</li>";	
						}
						$(".datasource2").find("ul").empty().append(lis);
						var text = $(this).find("option:selected").text();
						datasourceExecChange(text);
					}else{
						base.requestTip({"position":"center"}).error("请先启用转换功能")
					}
				}
			}else{
				$(".dictName").val("");
				$(".mapping").val("");
			}
		})
		
		//选中增加背景色
		$(".datasourceContent").on("click","li",function(){
			$(this).parent("ul").find("li").removeClass("active");
			$(this).addClass("active");
		})
		//向右添加
		$(".addDataEx").on("click",function(){
			if($(".switchExec:checked").length>0 && $(".datasource1 ul li").length>0){
				var firstDom  = $('.datasource1').find("ul:visible li.active");
				var firstText = firstDom.html();
				var colName = firstDom.attr("columnsName");
				var colType = firstDom.attr("columnsType");
				var secondText = $('.datasource2').find("li.active").html();
				$('.datasource2').find("li").removeClass("active")
				if(firstText&&secondText){
					$('.datasource1').find("ul:visible li.active").removeClass("active").hide();
					$('.datasource3 ul').append("<li colName='"+colName+"' colType='"+colType+"'><span>"+firstText+"</span> &lt;-&gt; <span>"+secondText+"</span></li>");
				}
			}
		})
		
		//数据项转换的启用按钮
		$(".switchExec").on("click",function(){
			if($(".switchExec:checked").length>0){
				$(".datasourceContent").css({
					"background-color":"#fff"
				});
				$(".execCode").attr("disabled",false);
			}else{
				$(".execCode").attr("disabled",true);
				$(".datasource1").find("ul").hide();
				$(".datasource1").find("ul li").show();
				$(".datasource2").find("ul").empty();
				$(".datasource3").find("ul").empty();
				$(".datasourceContent").css({"background-color":"#eee"})
			}
			$(".execCode").prop("checked",false);
			$("#datasourceList").val("-1");
			$(".dictName").val("");
			$(".mapping").val("")
		})
		//启用转换编码
		$(".execCode").on("click",function(){
			if($(".datasourceList").val()!="-1"){//判断是否选中数据项
				var values = JSON.parse($("#datasourceList").val()),len = values.trees.length,lis = "";
				if($(".execCode:checked").length>0){//判断是否选中启用转换
					for(var i=0;i<len;i++){
						lis +="<li name='"+JSON.stringify(values.trees[i])+"'>"+values.trees[i].code+"</li>";	
					}
				}else{//放开
					for(var i=0;i<len;i++){
						lis +="<li name='"+JSON.stringify(values.trees[i])+"'>"+values.trees[i].name+"</li>";	
					}
				}
				$(".datasource2 ul").empty().append(lis);
			}else{
				base.requestTip({"position":"center"}).error("请选择数据项")
			}
		})
		//向左移除
		$(".delDataEx").on("click",function(){
			if($(".switchExec:checked").length>0){
				var firstText = $('.datasource3').find('li.active span:first').html();
				$(".datasource1 ul li").map(function(index,item){
					if($(item).html() == firstText){
						$(item).show().removeClass("active");
					}
				})
				$('.datasource3').find(' li.active').remove();
			}
		})
		//模糊匹配
		$(".vagueMatch").on("click",function(){
			if($(".switchExec:checked").length>0 && $(".datasource1 ul li").length>0 ){
//				$('.datasource3').find('ul').empty();
				var len = $(".datasource2").find("li").length;
				var datasource2 = $(".datasource2");
				
				$('.datasource1').find("ul:visible").find("li").map(function(index,item){
					if($(item).is(":visible")){						
						var firstText = $(item).html();
						var colName = $(item).attr('columnsName');
						var colType = $(item).attr('columnsType');
						for(var i=0;i<len;i++){
							var isexist = datasource2.find("li:nth-child("+(i+1)+")").html();
							if(isexist.indexOf(firstText) > -1){
								$(item).hide();
								$('.datasource3').find('ul').append("<li colName='"+colName+"' coltype='"+colType+"' ><span>"+firstText+"</span> &lt;-&gt; <span>"+datasource2.find("li:nth-child("+(i+1)+")").html()+"</span></li>");
								 break;
							}
						}
					}
				});
			}
		})
		//配置更新策略 设置调度模式
		$(".dispatchType").on("change",function(){
			$(".showNotes").find("p").hide();
			if($(this).val() =="1"){
				$(".periodicMode").show();
				$(".regularMode").hide();
				$(".showNotes").find("p[key='1']").show();
			}
			if($(this).val() =="2"){
				$(".periodicMode").hide();
				$(".regularMode").show();
				$(".showNotes").find("p[key='2']").show();
			}
			if($(this).val() =="3"){
				$(".periodicMode").hide();
				$(".regularMode").hide();
				$(".showNotes").find("p[key='3']").show();
			}
		})
		//切换图形编辑或者sql脚本模式
		$(".diary").on("click","li",function(){
			$(".sqltables").attr("name","");//每次清除选中的表
			$(this).addClass("active").siblings().removeClass("active");
			if($(this).attr("key") =="0"){
				$(".graphicsEditor").show();
				$(".sqlScriptMode").hide();
			}else{
				$(".sqlScriptMode").show();
				$(".graphicsEditor").hide();
			}
		})
		$(".inputParams").on("click",".delete",function(){
			$(this).parents("tr").find(".outParameterJson").val("-1").select2();
			$(this).parents("td").prev().html("");
			$(this).parents("td").prev().prev().html("");
		})
		
	}
	
	return {
		main:function(){
			base.form.date({
				element:$(".beginTime"),
				isTime:true
			});
			
			metaData();
			selectResource();
			dispatchChange();
			setGrid($("#publishResource"),gridOption,1);//选择数据源;
			dataSourceExec()//数据项转换相关
		}
	}
})
