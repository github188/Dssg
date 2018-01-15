define(["base","app/commonApp"],function(base,common){
	
	return {
		main:function(){
			base.scroll({
				container:$(".ui-content")
			});
			base.ajax({
				url:"../json/schedule.json",
				type:"get",
				success:function(data){
					base.calendar({
						container:$("#schedule"),
						data:data,
						clickEvent:function(data){
							alert(data.title)
						}
					});
				}
			})
			
		}
	};
});