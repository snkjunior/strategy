game.components.conditions = {
    isVisible: function(visibleConditions) {
        for (var i = 0; i < visibleConditions.length; i++) {
            var reverse = false;
            if (visibleConditions[i].type[0] === "!") {
                reverse = true;
            }
            
            var conditionResult = this[visibleConditions[i].type.replace("!", "")](visibleConditions[i]);
            
            if (!reverse && !conditionResult) {
                return false;
            }
            if (reverse && conditionResult) {
                return false;
            }
        }
        return true;
    },
    
    isEventNoteValue: function(condition) {
        return game.events[condition.eventId] && game.events[condition.eventId][condition.note] && game.events[condition.eventId][condition.note] == condition.value;
    },
    
    hasNotQuestNotes: function(condition) {
        if (!game.quests[condition.questId]) {
            return true;
        }
        
        for (var i = 0; i < condition.notes.length; i++) {
            if (game.quests[condition.questId].notes.indexOf(condition.notes[i]) !== -1) {
                return false;
            }
        }
        
        return true;
    },
    
    hasQuestNotes: function(condition) {
        if (!game.quests[condition.questId]) {
            return false;
        }
        
        for (var i = 0; i < condition.notes.length; i++) {
            if (game.quests[condition.questId].notes.indexOf(condition.notes[i]) !== -1) {
                return true;
            }
        }
        
        return false;
    },
    
    isQuestActive: function(condition) {
        return game.quests[condition.questId] != null;
    },
    
    isQuestFinished: function(condition) {
        if (!game.quests[condition.questId]) {
            return false;
        }
        
        return game.quests[condition.questId].isFinished;
    },
    
    hasResource: function(condition) {
        return game.resources[condition.resource] >= condition.count;
    },
    
    heroClass: function(condition) {
        return game.hero.class === condition.class;
    },
    
    hasItem: function(condition) {
        for (var i = 0; i < game.items.length; i++) {
            if (game.items[i].id == condition.itemId) {
                return game.items[i].count >= condition.count;
            }
        }
        return false;
    }    
};



