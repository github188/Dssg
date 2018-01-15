define(["base","app/commonApp"],function(base,common){
	var steps = null;
	//var grid = null;
	/**加载step控件**/
	var setSteps = function(){
		steps = base.steps({
			container:$("#ui-steps"),
			data:[
				{"label":"编写项目申请","contentToggle":"#content1"},
				{"label":"填写元数据","contentToggle":"#content2"},
				{"label":"编辑数据项","contentToggle":"#content3","callback":function(){setGrid();}},
				{"label":"编目预览","contentToggle":"#content4"}
			],
			buttons:[
				{"type":"back"},
				{"type":"forward","callback":function(){
					/**校验当前页的表单**/
					
					var step = steps.getStep();
					switch(step){
						case 0:
							var isPass = base.form.validate({form:$("#form1"),checkAll:true});
							return isPass;
						break;
						
						case 1:
							var isPass = base.form.validate({form:$("#form2"),checkAll:true});
							return isPass;
						break;
						
						case 2:
							return true;
						break;
						
					}
				}},
				{"label":"保存","type":"confirm","callback":function(obj,stepsObj){
					/**校验最后一步的表单**/
					var step = stepsObj.getStep();
					var isPass = base.form.validate({form:$("#form4"),checkAll:true});
					/**提交表单**/
					
					/**返回列表页面**/
					common.loadPage("0-2");
				}}
			],
			//currentStep:2,/**初始化在第几步,默认是0**/
		});
		
		$("#imageBtn").on("click",function(){
			$("#image").click();
		});
		$("#image").on("change",function(){
			$("#fileName").html($(this).val());
		});
	};
	var gridOption = {
		processing:true,
		serverSide:false,
		searching:false,
		ordering:false,
		lengthChange:false,
		bPaginate:false,
		bInfo:false,
		drawCallback:function(){
			$("#example").find("tbody .delete").unbind("click").on("click",function(){
				
				grid.deleteRow(this);
			});
		}
	};
	var setGrid = function(){
		var self = {};
		var count = 0;
		
		
		self.init = function(){
			grid = base.datatables({
				container:$("#example"),
				option:gridOption
			});
			
			self.setAddRow();
			self.setDeleteRow(); 
			grid.addRow(self.getRowData());
		};
		self.setAddRow = function(){
			$('#addRow').on('click', function(){
				grid.addRow(self.getRowData());
			});
		};
		self.setDeleteRow = function(){
			$("#example").find("tbody .delete").on("click",function(){
				grid.deleteRow(this);
			});
		};
		self.getRowData = function(){
	        var data = [
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<input type='text' name='name"+count+"' class='form-control'/>",
	            "<div style='text-align:center'><button class='btn btn-link delete' key='"+count+"'><i class='fa fa-trash-o'></i></button><button class='btn btn-link primary'><i class='fa fa-key'></i></button></div>"
	        ];
	        count++;
	        return data;
		};
		self.init();
	};
	
	return {
		main:function(){
			setSteps();
		}
	};
});