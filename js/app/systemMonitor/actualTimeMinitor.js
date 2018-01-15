define(["base","app/commonApp","echarts"],function(base,common,echarts){
	var chart1Color=["#20a8d8","#ef4900"];
	var parent1="",parent2="",parent3="";
	var chart3Color = ["#00acee","#00acee","#ff8e8e","#faba3c"];
	var grid = null;
	var gridOption1 = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		bPaginate:false,
		info:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/sysMonitoring/getHotPublishResourceRanking",
			type:"get",
			contentType:"application/json",
			data:function(d){
				var params = {
					"timeFlag":$("#p3 .active").attr("type")=="today"?"0":"1",
					"type":$("#grid_status .active").attr("key")
				};
				return	params
			}
		},
		columns:[
			{ "data": "resourceName","sWidth":"25%"},
			{ "data": "heatNum","sWidth":"25%"},
			{ "data": "subscriptionEquipmentNum","sWidth":"25%"},
			{ "data": "recordNum","sWidth":"25%"}
		],
		columnDefs:[ 
         	{
         		"render":function(data,type,row,meta){
         			return row.resourceName?common.interceptString(row.resourceName,8):"--"
         		},
         		"targets":0
         	},
         	{
         		"render":function(data,type,row,meta){
         			return row.heatNum?common.interceptString(row.heatNum,8):"--"
         		},
         		"targets":1
         	}
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
		bPaginate:false,
		info:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/sysMonitoring/getHotPublishResourceRanking",
			type:"get",
			contentType:"application/json",
			data:function(d){
				var params = {
					"timeFlag":$("#p3 .active").attr("type")=="today"?"0":"1",
					"type":$("#grid_status .active").attr("key")
				};
				return	params
			}
		},
		columns:[
			{ "data": "resourceName","sWidth":"25%"},
			{ "data": "heatNum","sWidth":"25%"},
			{ "data": "subscriptionEquipmentNum","sWidth":"25%"},
			{ "data": "calculateValue","sWidth":"25%"}
		],
		columnDefs:[ 
         	{
         		"render":function(data,type,row,meta){
         			return row.resourceName?common.interceptString(row.resourceName,8):"--"
         		},
         		"targets":0
         	},
         	{
         		"render":function(data,type,row,meta){
         			return row.heatNum?common.interceptString(row.heatNum,8):"--"
         		},
         		"targets":1
         	}
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
		bPaginate:false,
		info:false,
		pagingType: "full_numbers",
		ajax:{
			url:$.path+"/api/sysMonitoring/getHotPublishResourceRanking",
			type:"get",
			contentType:"application/json",
			data:function(d){
				var params = {
					"timeFlag":$("#p3 .active").attr("type")=="today"?"0":"1",
					"type":$("#grid_status .active").attr("key")
				};
				return	params
			}
		},
		columns:[
			{ "data": "resourceName","sWidth":"25%"},
			{ "data": "heatNum","sWidth":"15%"},
			{ "data": "subscriptionEquipmentNum","sWidth":"20%"},
			{ "data": "subscriptionAppNum","sWidth":"20%"},
			{ "data": "recordNum","sWidth":"20%"}
		],
		columnDefs:[
			{
         		"render":function(data,type,row,meta){
         			return row.resourceName?common.interceptString(row.resourceName,8):"--"
         		},
         		"targets":0
         	},
         	{
         		"render":function(data,type,row,meta){
         			return row.heatNum?common.interceptString(row.heatNum,8):"--"
         		},
         		"targets":1
         	}
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
			});
			parent1 = grid
		}else if(para == "2"){//文件
			grid = base.datatables({
				container:$("#example2"),
				option:gridOption2,
			});
			parent2 = grid
		}else if(para == "3"){//api
			grid = base.datatables({
				container:$("#example3"),
				option:gridOption3,
			});
			parent3 = grid
		}
	};

    self.setSwitch = function(){
    	//点击本周或今日
		$("#p3 li").on("click",function(){
			var key = $("#grid_status li.active").attr("key");
			if(key=="1"){
				parent1.reload()
			}
			if(key=="2"){
				parent2.reload()
			}
			if(key=="3"){
				parent3.reload()
			}
		});
		//切换数据库\文件\API
		$("#grid_status li").on("click",function(){
			var key = $(this).attr("key");
			//1 数据库 2是文件 3是api
			if(key == "1"){
				$("#fileContent").hide();
				$("#apiContent").hide();
				$("#dataContent").show();
				parent1.reload()
			}else if(key == "2"){
				$("#dataContent").hide();
				$("#apiContent").hide();
				$("#fileContent").show();
				parent2.reload()
			}else if(key == "3") {
				$("#dataContent").hide();
				$("#fileContent").hide();
				$("#apiContent").show();
				parent3.reload()
			}
//			setGrid(key);
		});
	};
		
	var chartOption1 ={
		color:chart1Color,
	    legend:{
	    	left:'center',
	    	data:[
	    		{"icon":"circle",name:"流入","textStyle":{color:'#333'}},
	    		{"icon":"circle",name:"流出","textStyle":{color:'#333'}}
	    	],
	    	 "borderWidth":0,
            "itemHeight":8,
            "itemGap":30
	    	
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
	            animation: false
	        }
	    },
	    xAxis: {
	        type: 'category',
	        data:[],
	        boundaryGap: false
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
	    },
	    series: [{
	        name: '流入',
	        type: 'line',
	        showSymbol: false,
	        hoverAnimation: false,
	        smooth:true,
	        areaStyle: {normal: {color:'#20a8d8',opacity:'0.2'}},
	        data: []
	    },
	    {
	        name: '流出',
	        type: 'line',
	        smooth:true,
	        showSymbol: false,
	        hoverAnimation: false,
	        areaStyle: {normal: {color:'#d7eff8'}},
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
		    formatter: function (name) {
		        return echarts.format.truncateText(name, 200, '14px Microsoft Yahei', '…');
		    },
		    tooltip: {
		        show: true
		    },
	        data:[]
	    },
	    series: [
	        {
	            name:'订阅设备',
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
	
	var chartOption3 = {
	    title: {
	    	text:"",
	        show:true,
	        top:-50
	    },
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
	            type: 'line',
	            lineStyle:{
	            	color:'rgba(0,0,0,0)'
	            }
	        },
	        formatter:function(a,b,c,d){
	            	return '<div style="padding:0 20px 0 8px"><span>'+ a[1].name + '</span><br/>'
	            	+'<span>'+ a[1].marker+a[1].value+'%</span></div>'
	       }
	    },
	    color:chart3Color,
	    legend: {
	    	show:false,
	        data: []
	    },
	    grid: {
	        left: '3%',
//	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'value',
	        boundaryGap: false
	    },
	    yAxis: [
	    	{
	        	type: 'category',
	        	data: []
	       }
	    ],
	    series: [
	    	{
	    		type:'bar',
	    		legendHoverLink:false,
	    		itemStyle: {
		            normal: {
		                color: '#ededed'
		            }
		        },
		        barMaxWidth:10,
	    		silent:true,
	    		barGap:'-100%',
	    		data:['100','100','100','100']
	    	},
	        {
	            name: '占用率',
	            legendHoverLink:true,
	            type: 'bar',
	            data: [],
	            barMaxWidth:10,
	            label:{
	            	normal:{
	            		position:'right',
	            		fontFamily:'FZLTHJW',
	            		fontSize:'14',
	            		formatter:function(a,b,c){
	            			return a.value+"%"
	            		}
	            	}
	            }
	        }
	    ]
	};
	
	var drawChart1 = function(){
		var self = {};
		self.chart = null;
		self.draw = function(isInit){
			base.ajax({
				url:$.path+"/api/sysMonitoring/getRealTimeTraffic",
				type:"post",
				success:function(data){
					var inputData = data.data[0].inputValueAxiss;
					var outputData = data.data[0].outputValueAxiss;
					
					var inputMaxValue = Math.max.apply(Math,inputData);
	                var outputMaxValue = Math.max.apply(Math,outputData);
	              
	                var coco=0,coconame='';
	                if(inputMaxValue > outputMaxValue){
	                  for(;inputMaxValue>=1024;){
	                    inputMaxValue = inputMaxValue/1024
	                    coco++;
	                  }
	                }else{
	                  for(;outputMaxValue>=1024;){
	                    outputMaxValue = outputMaxValue/1024
	                    coco++;
	                  }
	                }
	                inputData.forEach(function(item,index){
	                    for(var i=0;i<coco;i++){
	                      item /= 1024;
	                    }
	                    inputData[index] = item;
	                })
	                outputData.forEach(function(item,index){
	                    for(var i=0;i<coco;i++){
	                      item /= 1024;
	                    }
	                    outputData[index] = item;
	                })
	                
	                if(coco ==1 ) coconame = 'KB';
	                if(coco ==2 ) coconame = 'MB';
	                if(coco ==3 ) coconame = 'GB';
	                if(coco ==4 ) coconame = 'TB';
	                
	                
	                chartOption1.yAxis.name = "单位"+coconame;
	                chartOption1.yAxis.min = 0;
	                chartOption1.yAxis.minInterval=1;
	                chartOption1.yAxis.axisLabel = {textStyle:{color:'#666'},formatter:function(value,index){return parseInt(value)}};

	                chartOption1.xAxis.data = data.data[0].timeAxiss;
					chartOption1.series[0].data= inputData;
					chartOption1.series[1].data= outputData;
					if(isInit){
						self.chart = base.echarts({
							container:$("#chart1"),
							chartOption:chartOption1,
							echarts:echarts,
							drawCallback:function(){
								self.setInterval();
							}
						});
					}else{
						self.chart = base.echarts({
							container:$("#chart1"),
							echarts:echarts,
							chartOption:chartOption1
						});
					}
					
				}
			});
		};
		self.setInterval = function(){
			chartInterval =window.setInterval(function(){
				self.draw(false);
			},5000);
		};
		self.draw(true);
		
	};
	
	var drawChart2 = function(){
		var self = {};
		self.chart = null;
		self.params ={timeFlag:0};//0为今日1为本周
		self.draw = function(isInit){
			base.ajax({
				url:$.path+"/api/sysMonitoring/getSubscriptionDeviceRanking",
				type:"get",
				params:self.params,
				success:function(data){
					if(!data.success){base.requestTip({postion:"center"}).error("接口异常"); return; }
					var data = data.data;
					var catagory = [],optionDatas=[];
					for(var k in data){
						if(k&&k.indexOf("暂无") > -1 ){
				          	catagory.push(k);
				         	optionDatas.push({itemStyle:{normal:{color:"#d8d8d8"}},"value": parseFloat(data[k]), name: k,names:k});
				         	chartOption2.color = ["#d8d8d8"]
				        }else{
				          	catagory.push(k);
				          	optionDatas.push({"value": parseFloat(data[k]), name: k,names:k});
				          	chartOption2.color = ['#2fb6e6','#faba3c','#67c2ef','#ff8e8e','#00acee']
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
		self.setSwitch = function(){
			$("#p2 li").on("click",function(){
				var type = $(this).attr("type");
				switch(type){
					case "today":
						self.params.timeFlag=0
					break;
					case "week":
						self.params.timeFlag=1
					break;
				}
				self.draw();
			});
		};
		self.draw();
		self.setSwitch();
	};

	var drawChart3 = function(){
		var self = {};
		self.chart = null;
		self.draw = function(isInit){
			base.ajax({
				url:$.path+"/api/sysMonitoring/getSystemusage",
				type:"get",
				success:function(data){
					var seriesData = [];
					var names = data.data[0].name;
					var values = common.arrayStrToNumber(data.data[1].value);
					$(values).each(function(i,o){
						var v = (o*100).toFixed(2);
						seriesData.push({
							value:v,
							label:{"normal":{"position":"right","show":true,"color":chart3Color[i]}},
							itemStyle:{"normal":{"color":chart3Color[i]}}
							
						})
					});
					chartOption3.yAxis[0].data= names;
					chartOption3.series[1].data = seriesData;
					if(isInit){
						self.chart = base.echarts({
							container:$("#chart3"),
							chartOption:chartOption3,
							echarts:echarts,
							drawCallback:function(){
								self.setInterval();
							}
						});
					}else{
						self.chart = base.echarts({
							container:$("#chart3"),
							echarts:echarts,
							chartOption:chartOption3
						});
					}
					
				}
			});
		};
		self.setInterval = function(){
			chartInterval2 =window.setInterval(function(){
				self.draw(false);
			},7000);
		};
		self.draw(true);
		
	};
	
	var setContent = function(){
		base.scroll({
			container:$(".ui-content.ui-content-change")
		});
	};
	
	return {
		main:function(){
			
			drawChart1();
			drawChart2();
			setGrid("1");
			setGrid("2");
			setGrid("3");
			drawChart3();
			common.setPanelButtonbar();
			common.setGridLinkGroup();
			
			self.setSwitch();
//			setContent();
		}
	};
});