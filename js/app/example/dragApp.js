define(["base"],function(base){
	return {
		main:function(){
			var dragObj = base.dragPickBox({
				items:$(".user"),
				boxes:$(".dragBox"),
				clickEvent:function(obj){
					$(".ui-content .user").css("border","1px solid #ddd");
					$(obj).css("border","1px solid #0000ff");
				}
			});
			
			dragObj.init($(".dragBox"));
		}
	};
});