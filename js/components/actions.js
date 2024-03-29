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
        game.startBattle(action.enemies, action.battlefield, action.result, action.units);
    },
    
    msg: function(action) {
        return true;
    },
    
    startQuest: function(action) {
        if (game.quests[action.questId] == null) {
            game.quests[action.questId] = {
                isFinished: false,
                notes: ["1"],
                vars: {}
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
        if (game.quests[action.questId] && game.quests[action.questId].notes.indexOf(action.note) === -1) {
            game.quests[action.questId].notes.push(action.note);
            return true;
        }
        return false;
    },
    
    setQuestVar: function(action) {
        if (game.quests[action.questId] && action.varId && action.value) {
            game.quests[action.questId].vars[action.varId] = action.value;
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
        if (!game.hero.knownLocations[action.mapId]) {
            game.hero.knownLocations[action.mapId] = [];
        }
        if (game.hero.knownLocations[action.mapId].indexOf(action.locationId) === -1) {
            game.hero.knownLocations[action.mapId].push(action.locationId);
        }
        return true;
    },
    
    showEvent: function(action) {
        var initState = null;
        if (action.initState) {
            initState = action.initState;
        }
        game.showEvent(action.eventId, initState);
    },
    
    setEventState: function(action) {
        game.interfaces.event.setState(action.stateId);
    },
    
    setEventNote: function(action) {
        if (!game.events[action.eventId]) {
            game.events[action.eventId] = {};
        }
        game.events[action.eventId][action.note] = action.value;
        return true;
    },
    
    closeEvent: function(action) {
        game.hideEvent();
    },
    
    setHeroState: function(action) {
        if (action.stateId) {
            for (var i = 0; i < game.states.length; i++) {
                if (game.states[i] == action.stateId) {
                    return false;
                }
            }
            game.states.push(action.stateId);
            return true;
        }
        return false;
    },
    
    addItem: function(action) {
        if (game.cMission.items[action.itemId]) {
            for (var i = 0; i < game.items.length; i++) {
                if (game.items[i].id == action.itemId) {
                    game.items[i].count += action.count;
                    return;
                }
            }
            game.items.push({
                id: action.itemId,
                count: action.count
            });            
        }
    },
    
    removeItem: function(action) {
        if (game.cMission.items[action.itemId]) {
           for (var i = 0; i < game.items.length; i++) {
                if (game.items[i].id == action.itemId) {
                    if (action.count == 'all') {
                        delete game.items[i];                        
                    } else {
                        game.items[i].count -= action.count;
                        if (game.items[i].count <= 0) {
                            delete game.items[i];                        
                        }
                    }
                }
           }               
        }
    }
};