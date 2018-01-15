define(["base"],function(base){
	return {
		main:function(){
			base.ajax({
				url:"../json/filterBox.json",
				type:"get",
				success:function(data){
					base.form.filterBox({
						container:$("#filterBox"),
						data:data,
						height:400,
						shadow:true
					});
				}
			});
			
		}
	};
});