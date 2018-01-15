define(["base","app/commonApp"],function(base,common){
	var resId=$(".dataResourceId").val();//资源id
	var subscribeId=$(".dataSubscribeId").val();
	var resName = $(".res-name").val();	
	//保存审批数据脱敏的数据项信息
	var onlyText = "";
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
			{"data": "code","sWidth":"5%"},
			{"data": "name","sWidth":"15%"},
			{"data": "ename","sWidth":"20%"},
			{"data": "code","sWidth":"15%"},
			{"data": "type","sWidth":"15%"},
			{"data": "length","sWidth":"15%"},
			{"data": "dataCode","sWidth":"15%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' data-index='"+meta.row+"' checked name='cb' value='"+row.id+"' ename='"+row.ename+"' class='cb' cid='"+row.id+"'/>"; 
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
			xhrFields: {withCredentials: true},
//			async:false,
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
						if(v){
							if(k=='resType'){
								$("#applyMsg .resType").html(resType)
							}else{
								$("#applyMsg ."+k).html(v);
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
						}else{
							$("#applyMsg ."+k).html("--");
						}
					})
					if(result.data.dbPublishDataJson){
						dbPublishDataJson=JSON.parse(result.data.dbPublishDataJson).sourceColumns;
					}
					metaData(result);
				//渲染表格	
				var strategy= getStrategy();
				onlyText = getDataItemName(result,true);
				setGrid($("#sensitive_word_filter"),tableParam(getDataItemName(result),strategy).gridOptionP1,1);////敏感词过滤
				setGrid($("#data_filter"),tableParam(getDataItemName(result),strategy).gridOptionP2,2);////数据过滤
				setGrid($("#data_desensitization"),tableParam(getDataItemName(result),strategy).gridOptionP3,3);////数据脱敏
				setGrid($("#data_transform"),tableParam(getDataItemName(result),strategy).gridOptionP4,4);////数据转换
			
				}}
		})
	}
	//
	//获取findResourceByID接口返回的数据
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
					$(".ui-page-title .resName").html(result.data.resName);
					//填写元数据的信息
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
	
	//获取元数据信息
	function metaData(result){
		if(result && result.data){
			//resName = result.data.resName;
			var db = JSON.parse(result.data.subDataJson);
			localStorage.setItem("approvalDataJson",result.data.subDataJson);
			setGrid($("#dataMsg"),gridOption,0,db,true);//获取数据项信息
			
		}
			
	}
	//获取数据项名称
	function getDataItemName(result,define){
		var obj={};
		obj.options="",obj.type=""; obj.id="",obj.columnType="";
		if(result.data && result.data.subDataJson){
			var db = JSON.parse(result.data.subDataJson);
			$.each(db,function(index,item){
				//没有映射的字段都不显示
				if(item.columnName !=""){
					if(index==0){ 
							obj.type = item.type;
							obj.id = item.columnName;
							obj.columnType=item.columnType;
					}
					//过滤日期等类型的字段
					if(define){
						if(item.type =="12"){	
							obj.options += "<option ename='"+item.ename+"' columnType='"+item.columnType+"'  value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"'>"+item.name+"</option>"
						}
					}else{
						if(item.type =="3" || item.type =="4" || item.type =="12"){	
							obj.options += "<option ename='"+item.ename+"' columnType='"+item.columnType+"'  value='"+item.name+"' type='"+item.type+"' codeName='"+item.columnName+"'>"+item.name+"</option>"
						}
					}
					localStorage.setItem("dataItemOption",obj.options)
				}
			})
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
	function tableParam(DataItem,strategy){
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
								createStrategy(_index);
							}
						}
					})
				})
				addRow(DataItem,strategy);//新增
				deleteRow(DataItem,strategy);//删除
				changeParamItem();
				
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
	            addRow(DataItem,strategy);//新增
				deleteRow(DataItem,strategy);//删除
				changeParamItem();
				//表达式的判断
				$("#step2").find(".part2 .changeParam:last").change()
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
	        drawCallback:function(setting){
				//新增
				addRow(DataItem,strategy);
				//删除
				deleteRow(DataItem,strategy);
				changeParamItem()
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
	        drawCallback:function(setting){
	        	//新增
				addRow(DataItem,strategy);
				//删除
				deleteRow(DataItem,strategy);
				changeParamItem()
	        }
		}
		return gridOption;
	}
	
	//画表格
	var setGrid = function(container,gridOption,num,db,bool){
		var parent;
		if(bool){
			gridOption.data = db;
			gridOption.aaData=db;
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
											//将所有的策略都循环一下，然后记录下他选的值人，然后增加策略之后再将原先选择的塞进去
											$(".strategy").each(function(index,item){
												var val=$(item).val();
												$(item).html("<select>"+getStrategy().options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>");
												$(item).val(val)
												if(createIndex==index){
													$(item).find("option:eq(0)").attr("selected","selected");
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
				return base.requestTip({"position":"center"}).error("最多10个")
			}
			var strategy=getStrategy();
			var data1 = [
				//resName,
				$(".ui-page-title .resName").html(),
                "<select class='form-control changeParam'>"+DataItem.options+"</select>", //数据项名称    数据项类型    字段名称
                "<div typeId='"+DataItem.columnType+"'>"+transformType(DataItem.type)+"</div>",DataItem.id,
                "<select class='form-control strategy'>"+strategy.options+"<option value='-1' class='createStrategy'>新建一个策略</option></select>",
                strategy.content,
                "<button class='btn btn-link delete del1'><i class='fa fa-trash-o'></i></button>"
			]
			var data2 = [
                $(".ui-page-title .resName").html(),
                "<select class='form-control changeParam'>"+DataItem.options+"</select>",
                "<div typeId='"+DataItem.columnType+"'>"+transformType(DataItem.type)+"</div>",DataItem.id,
				"<select class='form-control compare'>"+compareSymbol()+"</select>",
				"<input type='text' name='"+Math.random()+"' class='form-control' value='' role={required:true}>",
                "<button class='btn btn-link delete del2'><i class='fa fa-trash-o'></i></button>"
			]
			var data3 = [
				$(".ui-page-title .resName").html(),
                "<select class='form-control changeParam'>"+onlyText.options+"</select>",
                "<div typeId='"+onlyText.columnType+"'>"+transformType(onlyText.type)+"</div>",onlyText.id,
                "<span style='display:inline-block;margin-right:7px'><select class='form-control'><option value='1'>保留</option><option value='2'>隐藏</option></select></span>"+
                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control start' role={required:true,number:true}></span><span style='margin:0 5px'>到</span>"+
                "<span style='display:inline-block;width:65px;position:relative;top:-1px'><input type='text' name='"+Math.random()+"' class='form-control end' role={required:true,number:true}></span><span style='margin:0 5px'>位</span>",
			    "<button class='btn btn-link delete del3'><i class='fa fa-trash-o'></i></button>"
			]
			var data4 = [
				$(".ui-page-title .resName").html(),
                "<select class='form-control changeParam'>"+DataItem.options+"</select>",
               	"<div typeId='"+DataItem.columnType+"'>"+transformType(DataItem.type)+"</div>",DataItem.id,
				"<input name='"+Math.random()+"' class='form-control' type='text'value='' role={required:true}>",
                "<input name='"+Math.random()+"' class='form-control' type='text'value='' role={required:true}>",
                "<button class='btn btn-link delete del4'><i class='fa fa-trash-o'></i></button>"
			]
			switch(key){
				case "1":
				grid1.addRow(data1);break;
				case "2":
				grid2.addRow(data2);
//				$(".changeParam").change();
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
			$.each(enames,function(index,item){
				$(".db .changeParam option").each(function(index,item1){
					var attr=$(item1).attr("ename");
					if(attr==item){
						$(item1).remove();
					}
				})
			})
									
		})
	}
	//点击删除一行
	function deleteRow(DataItem){
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
