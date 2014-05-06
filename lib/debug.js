require('colors');

GLOBAL.__debug = function(debugDatas){
	var time = new Date();
	var logTimeColor = ('['+(time.getUTCHours() < 10 ? '0' : '')+time.getUTCHours()+'h'+(time.getUTCMinutes() < 10 ? '0' : '')+time.getUTCMinutes()+':'+(time.getUTCSeconds() < 10 ? '0' : '')+time.getUTCSeconds()+']').cyan.inverse;
	var debugColor = '[DEBUG] - '.red.inverse;

	if(typeof debugDatas === 'string'){
		var all = debugDatas.split('\n');
		for(var i = 0, j = all.length; i < j; i++){
			console.log(logTimeColor+debugColor+all[i].inverse);
		}
	}
	else{
		console.log(logTimeColor+debugColor);
		console.log(debugDatas);
	}
};