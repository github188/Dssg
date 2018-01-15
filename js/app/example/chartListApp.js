define(["base","app/commonApp","echarts"],function(base,common,echarts){
	var chart1Color=["#04a0fa","#fa7e04"];
	var chart3Color = ["#fa4f04","#5edb02","#02d2b2","#6b03e1"];
	var grid = null;
	var gridOption = {
		processing:true,
		serverSide:true,
		searching:false,
		ordering:false,
		lengthChange:false,
		bPaginate:false,
		info:false,
		ajax:{
				url:"../json/grid1.json",
				type:"get",
				contentType:"application/json",
				data:function(d){
					var params = {
						"type1":$("#p3 .active").attr("type"),
						"type2":$("#grid_status .active").attr("key")
					};
					if(params){
						$.extend(d,params); 
					}
					return JSON.stringify(d); 
				}
		},
		columns:[
			{ "data": "position","sWidth":"25%"},
			{ "data": "city","sWidth":"25%"},
			{ "data": "start_date","sWidth":"25%"},
			{ "data": "salary","sWidth":"25%"}
		]
		
        
	};
	/**画表格**/
	var setGrid = function(){
		var self = {};

		grid = base.datatables({
			container:$("#example"),
			option:gridOption
		});
		base.scroll({
			container:$(".ui-panel-gridbar")
		});
		self.setSwitch = function(){
			$("#p3 li").on("click",function(){
				grid.reload();
			});
			
			$("#grid_status li").on("click",function(){
				grid.reload();
			});
		};
		self.setSwitch();
	};
	
	var chartOption1 ={
		color:chart1Color,
	    legend:{
	    	right:10,
	    	data:[
	    		{name:"流入","textStyle":{color:chart1Color[0]}},
	    		{name:"流出","textStyle":{color:chart1Color[1]}}
	    	]
	    	
	    },
	    grid:{
	    	bottom:30,
	    	right:10,
	    	top:20
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
	            show: false
	        }
	        //offset:-20
	    },
	    series: [{
	        name: '流入',
	        type: 'line',
	        showSymbol: false,
	        hoverAnimation: false,
	        smooth:true,
	        areaStyle: {normal: {opacity:0.3}},
	        //lineStyle:{normal:{color:"#04a0fa"}},
	        data: []
	    },
	    {
	        name: '流出',
	        type: 'line',
	        smooth:true,
	        showSymbol: false,
	        hoverAnimation: false,
	        areaStyle: {normal: {opacity:0.3}},
	        data: []
	    }]
	};

	
	var chartOption2 = {
	    tooltip: {
	        trigger: 'item',
	        formatter: "{a} <br/>{b}: {c} ({d}%)"
	    },
	    legend: {
	        orient: 'vertical',
	        x: 'right',
	        data:[]
	    },
	    series: [
	        {
	            name:'订阅设备',
	            type:'pie',
	            radius: ['50%', '70%'],
	            avoidLabelOverlap: false,
	            label: {
	                normal: {
	                    show: false,
	                    position: 'inner'
	                },
	                emphasis: {
	                    show: false,
	                    textStyle: {
	                        fontSize: '10',
	                        fontWeight: 'bold'
	                    }
	                }
	            },
	            labelLine: {
	                normal: {
	                    show: false
	                }
	            },
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
	            type: 'shadow'
	        }
	    },
	    
	    color:chart3Color,
	    legend: {
	    	show:false,
	        data: []
	    },
	    grid: {
	    	top:40,
	        left: '3%',
	        right: '4%',
	        bottom: 0,
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
	            name: '占用率',
	            type: 'bar',
	            data: []
	        }
	    ]
	};
	
	var drawChart1 = function(){
		var self = {};
		self.chart = null;
		self.draw = function(isInit){
			base.ajax({
				url:"../json/chart1.json",
				type:"get",
				success:function(data){
					var inputData = common.arrayStrToNumber(data.data[0].inputValueAxiss);
					var outputData = common.arrayStrToNumber(data.data[0].outputValueAxiss);
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
			chartInterval = window.setInterval(function(){
				chartOption1.series[0].data.shift();
				chartOption1.series[1].data.shift();
				chartOption1.series[0].data.push(base.getRandom(10000,18888));
				chartOption1.series[1].data.push(base.getRandom(10000,18888));
				self.chart.refresh(chartOption1);
				//self.draw();
			},1000);
		};
		self.draw(true);
		
	};
	
	var drawChart2 = function(){
		var self = {};
		self.chart = null;
		self.url = "../json/chart2.json";
		self.params ={};
		self.draw = function(isInit){
			base.ajax({
				url:self.url,
				type:"get",
				params:self.params,
				success:function(data){
					var catagory = [];
					$(data).each(function(i,o){
						catagory.push(o.name);
					});
					chartOption2.legend.data = catagory;
					chartOption2.series[0].data = data;
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
						self.url = "../json/chart2.json";
					break;
					
					case "week":
						self.url = "../json/chart2_week.json"
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
				url:"../json/chart3.json",
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
					chartOption3.series[0].data = seriesData;
					if(isInit){
						self.chart = base.echarts({
							container:$("#chart3"),
							chartOption:chartOption3,
							echarts:echarts,
							drawCallback:function(){
								//self.setInterval();
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
			chartInterval2 = window.setInterval(function(){
				self.draw();
			},1000);
		};
		self.draw(true);
		
	};
	
	var setContent = function(){
		base.scroll({
			container:$(".ui-content")
		});
	};
	return {
		main:function(){
			//setContent();
			drawChart1();
			drawChart2();
			
			drawChart3();
			common.setPanelButtonbar();
			common.setGridLinkGroup();
			setGrid();
		}
	};
});