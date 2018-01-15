define(["base","app/commonApp","echarts"],function(base,common,echarts){
	var chart1Color=["#04a0fa","#fa7e04"];
	var chart3Color = ["#fa4f04","#5edb02","#02d2b2","#6b03e1"];
	var grid = null;
	var gridOption1 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
	    pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/subscribeanalysis/findSubscribeResAnalysePage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
//				/**base库专门获取表单参数的方法**/
				var params = base.form.getParams($("#search-form"));
				if(!params.equipment) params.equipment = "0";
				if(!params.resourceId) params.resourceId = "0";
				if(params.startTime){
					params.endTime = params.startTime.slice(13)
					params.startTime = params.startTime.slice(0,10);
				} 
				var paramsA; 
				if(params){
					paramsA = $.extend({resType:"1",page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "startTime","sWidth":"25%"},
			{ "data": "loadFlowTotal","sWidth":"25%"},
			{ "data": "loadRecordTotal","sWidth":"25%"},
			{ "data": "taskTotal","sWidth":"25%"},
		],
        drawCallback:function(setting){
        	common.selectedTr($("#example1"));
        }
	};
	var gridOption2 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
	    pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/subscribeanalysis/findSubscribeResAnalysePage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				if(!params.equipment) params.equipment = "0";
				if(!params.resourceId) params.resourceId = "0";
				if(params.startTime){
					params.endTime = params.startTime.slice(13)
					params.startTime = params.startTime.slice(0,10);
				} 
				var paramsA; 
				if(params){
					paramsA = $.extend({resType:"2",page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "startTime","sWidth":"25%"},
			{ "data": "loadFlowTotal","sWidth":"25%"},
			{ "data": "loadRecordTotal","sWidth":"25%"},
			{ "data": "taskTotal","sWidth":"25%"},
		],
        drawCallback:function(setting){
        	common.selectedTr($("#example2"));
        }
	};
	var gridOption3 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
	    pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/subscribeanalysis/findSubscribeResAnalysePage",
			type:"get",
			xhrFields: {withCredentials: true},
			contentType:"application/json",
			data:function(d){
				common.gridPageFliter(d);
				var params = base.form.getParams($("#search-form"));
				if(!params.equipment) params.equipment = "0";
				if(!params.resourceId) params.resourceId = "0";
				if(params.startTime){
					params.endTime = params.startTime.slice(13)
					params.startTime = params.startTime.slice(0,10);
				} 
				var paramsA; 
				if(params){
					paramsA = $.extend({resType:"3",page:d.page,size:d.size},params); 
				}
				return paramsA; 
			}
		},
		columns:[
			{ "data": "startTime","sWidth":"33.3%"},
			{ "data": "subApiTotal","sWidth":"33.3%"},
			{ "data": "loadRecordTotal","sWidth":"33.3%"},
		],
        drawCallback:function(setting){
        	common.selectedTr($("#example3"));
        }
	};
	/**画表格**/
	var setGrid = function(para){
		if(!para || para == "1"){//数据库
			grid = base.datatables({
				container:$("#example1"),
				option:gridOption1,
				filter:common.gridFilter
			});
		}else if(para == "2"){//文件
			grid = base.datatables({
				container:$("#example2"),
				option:gridOption2,
				filter:common.gridFilter
			});
		}else if(para == "3"){//api
			grid = base.datatables({
				container:$("#example3"),
				option:gridOption3,
				filter:common.gridFilter
			});
		}
	};
	
	var chartOption1 ={
		color:chart1Color,
	    legend:{
	    	left:'center',
	    	data:[]
	    	
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
	            animation: false
	        }
	    },
	    grid: {
            "top":"20%",
            "left": "5%",
            "right": "5%",
            "bottom": '10%',
            "containLabel": true
        },
	    xAxis: {
	        type: 'category',
	        data:[],
	        boundaryGap: true
	    },
	    yAxis: {
	        type: 'value',
	        boundaryGap: [0, 0],
	        splitLine: {
	            show: true,
	            lineStyle:{
	            	color:'#c0c0c0'
	            }
	        }
	        //offset:-20
	    },
	    series: [{
	        name: '流入',
	        type: 'line',
	        hoverAnimation: false,
	        smooth:true,
	        areaStyle: {normal: {color:'#20a8d8',opacity:'0.2'}},
	        data: []
	    }]
	};

	
	var chartOption2 = {
		color:['#2fb6e6','#faba3c','#67c2ef','#ff8e8e','#00acee'],
	    tooltip: {
	        trigger: 'item',
	        formatter:function(params){
	        	if(params.data.names.length>25){
		           var temp = [];
		          for(var i =0;i<params.data.names.length;i++){
		            if(i>=25 && i%25 == 0){
		               temp.push(params.data.names[i]+"<br />");
		            }else{
		               temp.push(params.data.names[i]);
		            }
		          }
		          var names = temp.join("");
		         return params.seriesName+'<br />'+names+" ("+params.percent+'%)'
		        }else{
		          return params.seriesName+'<br />'+params.data.names+" ("+params.percent+'%)'
		        }
	        }
	    },
	    legend: {
	        orient: 'vertical',
	        top:'middle',
	        right:'18%',
	        itemWidth:15,
	        itemHeight:15,
	        data:[]
	    },
	    series: [
	        {
	            name:'订阅资源',
	            type:'pie',
	            radius: ['50%', '70%'],
	            avoidLabelOverlap: false,
	            hoverAnimation :false,//取消鼠标触摸扇区放大的效果
	            label: {
	                normal: {
	                    show:true,
	                    position: 'center',
	                    formatter:function(a,b,c,d){
	                    	return a.seriesName
	                    }
	                }
	        	},
	            labelLine: {
	                normal: {
	                    show: false
	                }
	            },
	            center:['30%','50%'],
	            data:[]
	        }
	    ] 
	};
	//折现图
	var drawChart1 = function(resType,selectName,lineChartType){//数据库，选择的名称，折线图的value
		var self = {};
		self.chart = null;//lineChartType:选中的下拉框的value
		var params = base.form.getParams($("#search-form"));
		if(!params.equipment) params.equipment = "0";
		if(!params.resourceId) params.resourceId = "0";
		if(params.startTime){
			params.endTime = params.startTime.slice(13)
			params.startTime = params.startTime.slice(0,10);
		}
		var paramsA = $.extend({lineChartType:lineChartType?lineChartType:"2",resType:resType?resType:"1"},params);
		
//		self.params = {endTime:"2017-09-04",equipment:"0",lineChartType:1,resType:resType?resType:"1",resourceId:"0",startTime:"2017-08-04"};
		self.draw = function(isInit){
			base.ajax({
				url:$.path+"/api/subscribeanalysis/findLineChartDeta",
				type:"post",
				params:paramsA,
				success:function(data){
					if(data&&data.data){
						var data = data.data;//一个数组便利对象，求最大值
						if(JSON.stringify(data) == "{}") {
							data = [{xvalue:"",yvalue:""}]
						}
						var xAxisData =[], seriesData=[];
		                data.forEach(function(item,index){
		                	xAxisData.push(item.xvalue);
		                	seriesData.push(item.yvalue)
		                })
		                lineChartType = lineChartType ? 1 : (resType ==3 ?1: 2);
		                if(lineChartType =="2" ||lineChartType=="7"){//流量转换
		                	var seriesMaxValue = Math.max.apply(Math,seriesData);
		                	var coco=0,coconame='';
		                	for(;seriesMaxValue>=1024;){
		                	    seriesMaxValue = seriesMaxValue/1024
		                	    coco++;
		                	}
		                	seriesData.forEach(function(item,index){
		                	    for(var i=0;i<coco;i++){
		                	      item /= 1024;
		                	    }
		                	    seriesData[index] = item.toFixed(2);
		                	})
		                	if(coco ==0 ) coconame = 'B';
		                	if(coco ==1 ) coconame = 'KB';
		                	if(coco ==2 ) coconame = 'MB';
		                	if(coco ==3 ) coconame = 'GB';
		                	if(coco ==4 ) coconame = 'TB';
		                }else{
		                	var seriesMaxValue = Math.max.apply(Math,seriesData);
		                	var coco=0,coconame='';
		                	for(;seriesMaxValue>=10000;){
		                	    seriesMaxValue = seriesMaxValue/10000
		                	    coco++;
		                	}
		                	if(coco >0){
		                		seriesData.forEach(function(item,index){
		                		    for(var i=0;i<coco;i++){
		                		      item /= 10000;
		                		    }
		                		    seriesData[index] = item.toFixed(2);
		                		})
		                	}
		                	if(coco ==0 ) coconame = '条';
		                	if(coco ==1 ) coconame = '万条';
		                	if(coco ==2 ) coconame = '亿条';
		                }
		                
		                if(xAxisData.length == 1){
				          chartOption1.series[0].symbolSize = 10;
				        }else{
				        	chartOption1.series[0].symbolSize = 0;
				        }
		                chartOption1.yAxis.name = "单位:"+coconame;
		                chartOption1.yAxis.min = 0;
		                chartOption1.yAxis.minInterval=1;
		                chartOption1.yAxis.axisLabel = {textStyle:{color:'#666'},formatter:function(value,index){return parseInt(value)}};
		                chartOption1.xAxis.data = xAxisData;
						chartOption1.series[0].data= seriesData;
						chartOption1.series[0].name= selectName?selectName:"加载流量";
					
						self.chart = base.echarts({
							container:$("#chart1"),
							echarts:echarts,
							chartOption:chartOption1
						});
					}
				}
			});
		};
		self.draw(true);
		
	};
	//饼图
	var drawChart2 = function(resType,startTime){ 
		var self = {};
		self.chart = null;
		var params = base.form.getParams($("#search-form"));
		if(params.startTime){
			params.endTime = params.startTime.slice(13)
			params.startTime = params.startTime.slice(0,10);
		}
		self.params ={startTime:params.endTime,resType:resType?resType:"1"};
		
		self.draw = function(isInit){
			base.ajax({ 
				url:$.path+"/api/subscribeanalysis/findSubLoadFlowTop",
				type:"post",
				params:self.params,
				success:function(data){
					var data = data.data;
					if(JSON.stringify(data)=="{}" ){
						data = {"暂无订阅设备":0}
					}
					var catagory = [],optionDatas=[];
					for(var k in data){
						if(k&&k.indexOf("暂无") > -1 ){
				          catagory.push(k);
				          optionDatas.push({itemStyle:{normal:{color:"#d8d8d8"}},"value": parseFloat(data[k]), name: k,names:k});
				          chartOption2.color = ["#d8d8d8"]
				        }else{
				          var name = k.slice(0,10);//截取过后的值
				          catagory.push(name);
				          optionDatas.push({"value": parseFloat(data[k]), name: name,names:k})
				        }
					}

					chartOption2.legend.data = catagory;
					chartOption2.series[0].data = optionDatas;

					self.chart = base.echarts({
						container:$("#chart2"),
						chartOption:chartOption2,
						echarts:echarts
					});
				}
			});
		};
		self.draw();
	};

	var setContent = function(){

//		时间控件
		base.form.date({
			element:$("#startTime"),
			range:true,
			dateOption:{
				max:-1,
			}
		});
		$("#startTime").val(base.getDateByDay(-61,false)+" ~ "+base.getDateByDay(-1,false))
	};
	
	//获取资源名称
	var getSourceName = function(resType,appId){ 
		var params={resType:resType?resType:"1"};//resType:1数据库2文件3 api;
		if(appId){
			params = $.extend(params,{appId:appId});
		}
		base.ajax({
			type:"post",
			url:$.path+"/api/subscribeanalysis/findSubResName",
			params:params,
			success:function(data){
				base.template({
					container:$(".sourceName"),
					templateId:"sourceName-tpl",
					data:data.data
				})
			}
		})
	}
	//获取应用名称
	var getSubDevice = function(resType,resourceId){
		var params={resType:resType?resType:"1",resourceId:resourceId?resourceId:"0"};//resType:1数据库2文件3 api;
		base.ajax({
			type:"post",
			url:$.path+"/api/subscribeanalysis/findAppName",
			params:params,
			success:function(data){
				base.template({
					container:$(".applyName"),
					templateId:"applyName-tpl",
					data:data.data
				})
			}
		}) 
	}
	
	var dataChange = function (item,type){
		var dto=[
			{key:"loadRecordTotal",label:"加载记录数",type:"0",value:"1"},//123加载记录数 加载文件数  调用次数
			{key:"loadFlowTotal",label:"加载流量",type:"0",value:"2"},//12加载流量 加载流量
			{key:"taskTotal",label:"任务执行次数",type:"0",value:"3"},//12任务执行次数 任务执行次数 
			{key:"subApiTotal",label:"订阅API数",type:"0",value:"4"},//3
			{key:"appNum",label:"订阅应用数",type:"0",value:""}//3
		]
		
		if(item=="loadRecordTotal" ){
			if(type =="1") return {name:"加载记录数",value:"1"};
			if(type =="2") return {name:"加载文件数",value:"1"};
			if(type =="3") return {name:"调用次数",value:"1"};
		}
		
		for(var i =0;i<dto.length;i++){
			if(dto[i].key ==item){
				return {name:dto[i].label,value:dto[i].value};
			}
		}
	}
//	//获取详细数据格式
	var getPublishAnalysis = function(type){
		
		var type=type?type:"1";//1数据库2文件3api
		
		var params = base.form.getParams($("#search-form"));
		if(!params.equipment) params.equipment = "0";
		if(!params.resourceId) params.resourceId = "0";
		if(params.startTime){
			params.endTime = params.startTime.slice(13)
			params.startTime = params.startTime.slice(0,10);
		}
		var paramsA = $.extend({resType:type},params);
		
		base.ajax({
			type:"post",
			url:$.path+"/api/subscribeanalysis/findSubLoadFlow",
			params:paramsA,
			contentType:"application/json",
			success:function(data){
				var data = data.data,dom='',optionAll='';
				$("#lineList").empty();
				for(var i in data){
					if(data[i]) {//存在则转换
						var dataName = dataChange(i,type);
						if(dataName.name !="订阅设备数" && dataName.name !="订阅应用数"){
							optionAll+= "<option value='"+dataName.value+"'>"+dataName.name+"</option>"
						}
						var width =(100/3)+"%";//宽度所占比
						var  padding0 = type ==1?'style="padding:0"':'';//padding设为0 为了让内容完全显示
						dom += '<div style="width:'+width+'">'+
								'<div class="col-md-2"'+padding0+'><i class="fa fa-upload"></i></div>'+
								'<div class="col-md-10" style="padding:0">'+
									'<div>'+dataName.name+'</div>'+
									'<div class="num" style="font-size:22px;line-height:22px;">'+data[i]+'</div>'+
								'</div>'+
							'</div>';	
					}
				}
				$("#lineList").append(optionAll)
				$(".counter").html(dom);
			}
		})
	}
	
	/**查询**/
	var setSearch = function(){
		$("#search").on("click",function(){
			var resType=$(".ui-grid-buttonbar .ui-grid-linkGroup li.active").attr("key");//获取当前选择的类型：数据库文件api
			common.search(grid);
			drawChart1(resType);//绘制折线图
			drawChart2(resType);//绘制饼图
			getPublishAnalysis(resType);
		});
	};
	//下载
	var getLoad = function(){ 
//		var params={resourceId:"0",equipment:"0",startTime:2017-08-04,endTime:2017-09-04,resType:1,model:2};//resType:1数据库2文件3 api;
		var params = base.form.getParams($("#search-form"));
		if(!params.resourceId) params.resourceId = "0";
		if(!params.equipment) params.equipment = "0";
		if(params.startTime){
			params.endTime = params.startTime.slice(13)
			params.startTime = params.startTime.slice(0,10);
		}
		var resType = $(".ui-grid-linkGroup li.active").attr("key");
		var paramsA = $.extend(params,{resType:resType,model:1});
		var paramsStr="";
		//对象转换字符串.
		for(var key in paramsA){
			paramsStr +=key+"="+paramsA[key]+"&"
		}
		var linkStr = paramsStr.substring(0,paramsStr.length-1);//字符串截取
			
		window.location.href = $.path+"/api/commonController/downloadAnalysis?"+linkStr;
	}
	function scroll(){
		base.scroll({
			container:$(".scrollWrapper")
		});
	}

	//设置表格各个按钮操作
	var setGridButton = function(){
		//下载
		$(".ui-grid-buttonbar .import").on("click",function(){
			getLoad();
		})
		//资源名称改变调用的事件
		$("#search-form .sourceName").on("change",function(){
			var resType=$(".ui-grid-buttonbar .ui-grid-linkGroup li.active").attr("key");
			var resourceId = $(this).val();
			if(resType == "3"){
				if($("#search-form .sourceName").val() =="0"){
					getSourceName(resType);
				}
				getSubDevice(resType,resourceId);
			}
		})
		//应用名称改变调用的事件
		$("#search-form .applyName").on("change",function(){
			var appid = $(this).val();
			var resType=$(".ui-grid-buttonbar .ui-grid-linkGroup li.active").attr("key");
			if($("#search-form .sourceName").val() =="0"){
				if($("#search-form .applyName").val()=="0"){
					getSubDevice(resType);
				}
				getSourceName(resType,appid)
			}
		})
		//数据库文件api切换
		$(".ui-grid-buttonbar .ui-grid-linkGroup li").on("click",function(){
			var key = $(this).attr("key");
			if(key == "1"){
				$("#fileContent").hide();
				$("#apiContent").hide();
				$("#dataContent").show();
				$(".onlyAPIshow").hide()
			}else if(key == "2"){
				$("#dataContent").hide();
				$("#apiContent").hide();
				$("#fileContent").show();
				$(".onlyAPIshow").hide()
			}else if(key == "3") {
				$("#dataContent").hide();
				$("#fileContent").hide();
				$("#apiContent").show();
				$(".onlyAPIshow").show()
			}
			
			getSourceName(key);//获取资源名称
			getSubDevice(key);//获取订阅设备
			getPublishAnalysis(key);//获取折线图数据
			drawChart1(key);//绘制折线图
			drawChart2(key);//绘制饼图
			setGrid(key);
		});
		//点击折线图的下拉
		$("#lineList").on("change",function(){
			var resType=$(".ui-grid-buttonbar .ui-grid-linkGroup li.active").attr("key");
			var lineChartId = $(this).val();
			var selectName = $(this).find("option:selected").text();
			drawChart1(resType,selectName,lineChartId);//绘制折线图
		})
		
	}
	var statisticalDate = function(){
		$(".statisticalDate .showDate").html(": "+base.getDateByDay(-1,false))
	}
	return {
		main:function(){
			scroll();
			setContent();
			getSourceName();//获取资源名称
			
			getPublishAnalysis();//获取折线图数据
			drawChart1();//绘制折线图
			drawChart2();//绘制饼图
			common.setPanelButtonbar();
			common.setGridLinkGroup();
			setGridButton();//页面按钮点击事件
			setGrid();//设置表格数据
			setSearch();//查询
			statisticalDate();
		}
	}
});