define(["base"],function(base){
	
	return {
		main:function(){
			base.ajax({
				url:"../json/autoForm.json",
				type:"get",
				success:function(data){
					$("#submit").on("click",function(){
						base.form.validate({
							form:$("#form"),
							checkAll:true,
							passCallback:function(){
								alert("校验通过！");
							}
						})
					});
					var selectData = base.changeData({
						key:"fid",
						value:2,
						data:data,
						newData:{"ajax":{
							url:"../json/select.json",
							params:{"user":"admin"}
						}}
					});
					
					var autoForm = base.form.autoForm({
						container:$("#form"),
						data:selectData,
						layoutOption:{"cls":"ui-grid-wire"},
						columnOption:{
							"label":{"style":"width:150px","cls":"title"}
						},
						buttons:[
							{
								label:"保存",
								cls:"btn btn-info",
								style:"margin-right:5px",
								clickEvent:function(){
									base.form.validate({
										form:$("#form"),
										checkAll:true,
										passCallback:function(){
											alert("校验通过！");
										}
									});
								}
							},
							{
								type:"reset"
							}
							
						]
					});
					
					
					
				}
			});
			
		}
	};
});