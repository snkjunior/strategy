game.components.lang = {
	get: function(code) {
		origCode = code;
		code = code.toUpperCase();
		if (typeof(game.cMap.lang[code]) != 'undefined') {
			return game.cMap.lang[code];
		} else if (typeof(game.cMission.lang[code]) != 'undefined') {
			return game.cMission.lang[code];
		} else if (typeof(game.data.lang[code]) != 'undefined') {
			return game.data.lang[code];
		}
		return origCode;
	}
}