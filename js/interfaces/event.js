game.interfaces.event = {
    template: "",
    
    isShow: ko.observable(false),
    currentState: ko.observable(null),
    eventData: ko.observable(null),
    
    init: function(callback, params) {
        callback();
    },
    
    onReady: function() {
    },
    
    onEnd: function() {
        
    },
    
    show: function(eventData, initState = null) {
        this.eventData(eventData);
        if (initState == null || !eventData.states[initState]) {
            initState = eventData.initState;
        }
        this.currentState(eventData.states[initState]);
        this.isShow(true);
    },
    
    hide: function() {
        this.isShow(false);
        if (game.currentInterface == game.interfaces.map) {
            game.interfaces.map.updateMap();
        }        
    },
	
	getName: function(action) {
		var name = game.components.lang.get(action.name);
		var type = game.interfaces.event.getActionType(action);
		if (type == 'skillcheck') {
			var skillSuccess = game.interfaces.event.getSkillChanceOfSuccess(action.skill, action.skillDifficult) * 100;
			name = name + "["+game.components.lang.get("SKILL_"+action.skill)+": "+Math.round(skillSuccess)+"%]";
		}
		return name;
	},
    
    clickAction: function(action) {
		var type = game.interfaces.event.getActionType(action);		
		if (type == 'standart') {
			game.components.actions.processActions(action.result);
		} else if (type == 'skillcheck') {
			if (typeof(action.default) != 'undefined') {
				game.components.actions.processActions(action.default);
			}
			if (game.interfaces.event.checkSkillcheck(action.skill, action.skillDifficult)) {
				game.components.actions.processActions(action.success);
			} else {
				game.components.actions.processActions(action.fail);
			}
		}
    },
	
    setState: function(stateId) {
        if (this.eventData().states[stateId]) {
            this.currentState(this.eventData().states[stateId]);
        }
    },
	
	getSkillChanceOfSuccess: function(skill, difficult) {
		var heroSkill = 0;
		if (typeof(game.hero.skills[skill]) != 'undefined') {
			heroSkill = game.hero.skills[skill];
		}
		return heroSkill / difficult;
	},
	
	checkSkillcheck: function(skill, difficult) {
		var chanceOfSuccess = this.getSkillChanceOfSuccess(skill, difficult);
		console.log(chanceOfSuccess);
		if (chanceOfSuccess < 1 && Math.random() > chanceOfSuccess) {
			return false;
		}
		return true;
	},
	
	getActionType: function(action) {
		var type = 'standart';
		if (typeof(action.type) !== 'undefined') {
			type = action.type;
		}
		return type;
	}
	
};