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
    
    startBattle: function(action) {
        game.startBattle(action.enemies, action.result);
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
    
    addExp: function(action) {
        game.hero.exp += action.exp;
        return true;
    },
    
    changeMap: function(action) {
        game.hero.locationId = action.locationId;
        game.cMap = game.cMission.maps[action.mapId];
        game.showInterface('map', game.cMap);
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
    },
    
    addKnownLocation: function(action) {
        console.log(action);
        if (!game.hero.knownLocations[action.mapId]) {
            game.hero.knownLocations[action.mapId] = [];
        }
        if (game.hero.knownLocations[action.mapId].indexOf(action.locationId) === -1) {
            game.hero.knownLocations[action.mapId].push(action.locationId);
        }
        return true;
    }
};