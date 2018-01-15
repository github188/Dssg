define(["base","app/commonApp","cookies"],function(base,common){
	var requestParams = null;
	var responseStruct = null;
	var setContent = function(){
		var id = $(".check_id").val();
		if(id){
			base.ajax({
				url:$.path+"/api/resCatalog/findResourceByID?id="+id,
				type:"get",
				success:function(d){
					var params = d.data;
					delete params.resType;
					if(params.apiType == null){
						delete params.apiType;
					}
					base.form.init(params,$("#form1"));
					base.form.init(params,$("#form2"));
					$("#themeName").val(params.themeTypeName);
					$("#themeName").attr("tid",params.themeType);
					$("#industryTypeName").val(params.industryTypeName);
					$("#industryTypeName").attr("tid",params.industryType);
					
					if(params.filePath){//图片
						$(".ui-page-headingImage").attr("src",$.path1+params.filePath)
					}else if(params.pictureUrl){
						$(".ui-page-headingImage").attr("src",$.path1+params.pictureUrl)
					}else{
						$(".ui-page-headingImage").attr("src","../images/default.png")
					}
//					var filePath = params.filePath?params.filePath:params.pictureUrl;
//					$(".ui-page-headingImage").attr("src",$.path1+filePath);
					if(params.realFileName){
						$("#fileName").html(params.realFileName+"<i class='fa fa fa-trash-o fileNameRemove'></i>");
					}
					requestParams = JSON.parse(d.data.apiJson).requestParams;
					responseStruct = JSON.parse(d.data.apiJson).responseStruct;
					var state = true 
					if(params.state==5 || params.state == 3){
						var d = ['linkman','resType','catalogUnit','phone','apiType','resName','resEname','resCode','resLevel','ui-treeSelect']
						common.disableInput(d);
						state = false;
					}
					setStepApiIn(state);	
					setStepApiOut(state);
				}
			})
		}
	}
	var setStepApiIn = function(state){
		if(!state){
			$("#addRowIn").remove();
			$("#addRowOut").remove();
		}
		var that = {};
		that.grid = null;
		that.count = 0;
		that.gridContainer = $("#step_tableIn");
		that.gridOption =  {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			bPaginate:false,
			bInfo:false,
			drawCallback:function(){
				that.gridContainer.find("tbody .delete").unbind("click").on("click",function(){
					that.grid.deleteRow(this);
				});
			}
		};
		that.init = function(){
			that.grid = base.datatables({
				container:that.gridContainer,
				option:that.gridOption
			});
			
			that.setAddRow();
		};
		that.setAddRow = function(){
			$.each(requestParams, function(i,o) {
				that.grid.addRow(that.getRowData(i));
				$("#step_tableIn tr:last .mandatory").val(o.mandatory);
//				$("#step_table tbody tr:last").find(".dataType").val(o.type)
			});
		};
		that.getRowData = function(i){
	       var data = [                                                                                                                      
	           "<input type='text' class='form-control name' placeholder='请输入...'/ value='"+requestParams[i].name+"'>",                                                                                  
	           "系统参数",                                                                                                                       
	           "<select class='form-control mandatory' value='"+requestParams[i].mandatory+"'><option value='1'>是</option><option value='0'>否</option></select>",                                                                      
	           "<input type='text' class='form-control example' placeholder='请输入...' value='"+requestParams[i].example+"'>",                                                                                   
	           "<input type='text' class='form-control desc' placeholder='请输入...' value='"+requestParams[i].desc+"'/>",
	           "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>"  
	       ];
	       var dataDisabled = [                                                                                                                      
	           "<input type='text' class='form-control name' placeholder='请输入...'/ value='"+requestParams[i].name+"' disabled='disabled'>",                                                                                  
	           "系统参数",                                                                                                                       
	           "<select class='form-control mandatory' value='"+requestParams[i].mandatory+"' disabled='disabled'><option value='1'>是</option><option value='0'>否</option></select>",                                                                      
	           "<input type='text' class='form-control example' placeholder='请输入...' value='"+requestParams[i].example+"' disabled='disabled'>",                                                                                   
	           "<input type='text' class='form-control desc' placeholder='请输入...' value='"+requestParams[i].desc+"' disabled='disabled'/>",
	           "<div style='text-align:center'><button class='btn btn-link delete' title='删除' disabled='disabled'><i class='fa fa-trash-o'></i></button></div>"  
	       ];
	       if(state){
	       		return data;
	       }else{
	       		return dataDisabled;
	       }
	        
		};
		that.init();
	};
	var setStepApiOut = function(state){
		var that = {};
		that.grid = null;
		that.count = 0;
		that.gridContainer = $("#step_tableOut");
		that.gridOption =  {
			processing:true,
			serverSide:false,
			searching:false,
			ordering:false,
			lengthChange:false,
			bPaginate:false,
			bInfo:false,
			drawCallback:function(){
				that.gridContainer.find("tbody .delete").unbind("click").on("click",function(){
					that.grid.deleteRow(this);
				});
			}
		};
		
		that.init = function(){
			that.grid = base.datatables({
				container:that.gridContainer,
				option:that.gridOption
			});
			
			that.setAddRow();
		};
		that.setAddRow = function(){
			$.each(responseStruct, function(i,o) {
				that.grid.addRow(that.getRowData(i));
				$("#step_tableOut tr:last .notNull").val(o.notNull);
				$("#step_tableOut tr:last .type").val(o.type);
			});
		};
		that.getRowData = function(i){
	        var data = [
	            "<input type='text' class='form-control name' placeholder='请输入...' value='"+responseStruct[i].name+"'/>",
	            "<select class='form-control type'><option value='12'>文本</option><option value='91'>日期</option><option value='3'>数字</option><option value='93'>时间</option><option value='4'>整型</option><option value='2004'>大字段</option></select>",
	            "<select class='form-control notNull'><option value='1'>是</option><option value='0'>否</option></select>",
	            "<input type='text' class='form-control example' placeholder='请输入...' value='"+responseStruct[i].example+"'>",
	            "<input type='text' class='form-control desc' placeholder='请输入...' value='"+responseStruct[i].desc+"'/>",                                
	            "<div style='text-align:center'><button class='btn btn-link delete' title='删除'><i class='fa fa-trash-o'></i></button></div>"
	        ];
	         var dataDisable = [
	            "<input type='text' class='form-control name' placeholder='请输入...' value='"+responseStruct[i].name+"' disabled='disabled'/>",
	            "<select class='form-control type' disabled='disabled'><option value='12'>文本</option><option value='91'>日期</option><option value='3'>数字</option><option value='93'>时间</option><option value='4'>整型</option><option value='2004'>大字段</option></select>",
	            "<select class='form-control notNull' disabled='disabled'><option value='1'>是</option><option value='0'>否</option></select>",
	            "<input type='text' class='form-control example' placeholder='请输入...' value='"+responseStruct[i].example+"' disabled='disabled'>",
	            "<input type='text' class='form-control desc' placeholder='请输入...' value='"+responseStruct[i].desc+"' disabled='disabled'/>",                                
	            "<div style='text-align:center'><button class='btn btn-link delete' title='删除' disabled='disabled'><i class='fa fa-trash-o'></i></button></div>"
	        ];
	        if(state){
	        	return data;
	        }else{
	        	return dataDisable;
	        }
		};
		that.init();
	};
	return {
		main:function(){
			setContent();
		}
	}
})
