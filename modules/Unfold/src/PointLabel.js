define(function(){
	var PointLabel = {
		TOCODAS: [],
		SOLOS: [],
		getToCodaLabels: function(){
			return this.TOCODAS;
		},
		getSoloLabels: function(){
			return this.SOLOS;
		},
		create: function(){
			return Object.create(this);
		},
		//TODO: REVISE
		fromString: function(name){
			name = name.replace(" ","_");
			return this[name];
		}
	};
	return PointLabel;
});