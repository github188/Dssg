define(["base","app/commonApp"],function(base,common){
	var grid=null;
	var resId=$(".dataResourceId").val();//资源id
	var subscribeId=$(".dataSubscribeId").val();
	function subscribeUpdate(){
		$.ajax({
			url:$.path+"/api/subscribeReview/resourceSubscribeDataUpdate",
			xhrFields: {withCredentials: true},
			type:"post",
			success:function(result){
			}
		})
	}
	//获取文件预览信息
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
			{ "data": "id","sWidth":"10%"},
			{ "data": "name","sWidth":"50%"},
			{ "data": "type","sWidth":"20%"},
			{ "data": "size","sWidth":"20%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' checked name='cb' value='"+row.id+"' class='cb' ename='"+row.id+"' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
            }
        ],
        drawCallback:function(setting){
        	
        }
        
	}
	//获取订阅申请信息
	var applyMsg = function(){
		$.ajax({//api/subscribeResource/getSubscribeById
			url:$.path+"/api/subscribeResource/getSubscribeById?id="+subscribeId,
			type:"get",
			async:false,
			xhrFields: {withCredentials: true},
			success:function(result){
				//区分资源类型
				if(result.success=true && result.data){
					var resType = "";
					switch(result.data.resType){
						case "1": resType="数据库";break;
						case "2": resType="文件";break;
						case "3": resType="API";break;
						default: resType="其他";break;
					}
					$.each(result.data,function(k,v){
						if(v){							
							if(k=='resType'){
								$("#applyMsg .resType").html(resType)
							}else{
								$("#applyMsg ."+k).html(v)	
							}
						}else{
							$("#applyMsg ."+k).html("--")	
						}
						
					})
				}
				var files = JSON.parse(result.data.subDataJson);
				localStorage.setItem("approvalDataJson",result.data.subDataJson);
				setGrid($("#dataMsg"),gridOption,files)
			}
		})
	}
	//获取元数据信息
	function metaData(){
		$.ajax({
			url:$.path+"/api/resCatalog/findResourceByID?id="+resId,
			type:"get",
			async:false,
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
//					if(null!=result.data.pictureUrl){//图片
//						$(".ui-page-headingImage").attr("src",result.data.pictureUrl)
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
									case "4":resType = "其他";break;
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
				}
			}
		})
	}
	//画表格		
	var setGrid = function(container,gridOption,files){
		gridOption.data = files;
		grid = base.datatables({
			container:container,
			option:gridOption,
		});
		
	}
	return {
		main:function(){
			applyMsg();
			metaData();
			//setGrid($("#dataMsg"),gridOption);////获取数据项信息
		}
	}
})
