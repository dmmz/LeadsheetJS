define(['modules/Edition/src/ElementManager'], function(ElementManager){
	var Tag = function(tag){
		return {
			startBeat: tag.startBeat,
			endBeat: tag.endBeat,
			name: tag.name,
			type: tag.type,
			elemMng: new ElementManager()
		};
	};
	return Tag;
});