define(["base","app/commonApp"],function(base,common){
	var grid=null;
	var modalId = $(".modal").attr("id");
	//获取数据项信息
	var gridOption0 = { 
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
				return {type:2};
			}
		},
		columns:[
			{"data":"id","sWidth":"10%"},
			{"data":"name","sWidth":"25%"},
			{"data":"ip","sWidth":"25%"},
			{"data":"port","sWidth":"20%"},
			{"data":"ftpType","sWidth":"20%"}
		],
		columnDefs:[ 
           {"render":function(data,type,row,meta){
                 return "<input type='checkbox' name='cbs' value='"+row.id+"' class='cbs' cid='"+row.id+"'/>"; 
              }, 
               "targets":0 
           },
	       {"render":function(data,type,row,meta){
                 return row.port ? row.port :"--"
              },
               "targets":3 
	      },
           {"render":function(data,type,row,meta){
           		if(row.ftpType =="1"){
           			return "FTP"
           		}else{
           			return "SMB"
           		}
              }, 
               "targets":4 
            }
        ],
        drawCallback:function(setting){
			$("#publishResource tbody").on("click","tr",function(){
        		$(this).find("input").prop("checked",true);
        		$(this).siblings().find("input").prop("checked",false)
	    	})
		}
	}

	
	//发布预览的接口即是获取编目元数据的接口
	var searchInfo = function(){
		var params = {id:$(".modal").attr("id")};
		base.ajax({
			url:$.path+"/api/resCatalog/findResourceByID",
			type:"get",
			params:params,
			success: function(data) {
				$.each(data.data,function(k,v){
					if(k=='resType'){
						$(".fbyl ."+k).html('文件')
					}else{
						$(".fbyl ."+k).html(v)	
					}
				})
			},
			error:function(data){
			}
		})
	}
	//画表格		 
	var setGrid = function(container,gridOption,count){
		if(count =="1"){
			grid = base.datatables({
				container:container,
				option:gridOption,
				filter:common.gridFilters
			});
		}else{
			grid = base.datatables({
			container:container,
			option:gridOption,
			filter:common.gridFilter
		});
		}
	}
	//调度模式切换
	var dispatchChange = function(){
		
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
		
		$(".dateTypeMax").on("change",function(){
			if($(this).val()=="3"){
				$('.day').parent().parent().hide();
			}else{
				$('.day').parent().parent().show();
			}
		})
		$(".searchdoc").on("click",function(){
			common.search(grid1);
		});
		$(".restdoc").on("click",function(){
			common.reset($("#search-docform"),grid1);
		});
		
	}

	return {
		main:function(){
			base.form.date({
				element:$(".beginTime"),
				isTime:true,
			});
			searchInfo();//获取数据项信息
			dispatchChange();//调度切换
			setGrid($("#publishResource"),gridOption0,0);//获取数据源信息
		}
	}
})
