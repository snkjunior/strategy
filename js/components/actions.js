game.components.actions = {
    processActions: function(actions) {
        var description = [];
        for (var i = 0; i < actions.length; i++) {
            if (this[actions[i].type](actions[i])) {
                description.push(actions[i].description);
            }
        }
        return description.join("\n\n\r");
    },
    
    msg: function(action) {
        return true;
    },
    
    startQuest: function(action) {
        if (game.quests[action.questId] == null) {
            game.quests[action.questId] = {
                isFinished: false,
                notes: []
            };
            return true;
        }
        return false;
    },
    
    finishQuest: function(action) {
        if (game.quests[action.questId] != null) {
            game.quests[action.questId].isFinished = true;
            return true;
        }
        return false;
    },
    
    setHeroLocation: function(action) {
        game.hero.locationId = action.locationId;
        return true;
    },
    
    addQuestNote: function(action) {
        if (game.quests[action.questId].notes.indexOf(action.note) === -1) {
            game.quests[action.questId].notes.push(action.note);
            return true;
        }
        return false;
    },
    
    changeResource: function(action) {
        game.resources[action.resource] += action.count;
        return true;
    },
    
    addEquipment: function(action) {
        if (game.equipment.indexOf(action.equipmentId) === -1) {
            game.equipment.push(action.equipmentId);
            return true;
        }
        return false;
    }
};