game.components.triggers = {
    getActiveTriggersByType: function(triggersIds, triggers, type) {
        var activeTriggers = [];
        for (var i = 0; i < triggersIds.length; i++) {
            var triggerId = triggersIds[i];
            if (triggers[triggerId].isActive && triggers[triggerId].type === type) {
                activeTriggers.push(triggers[triggerId]);
            }
        }
        return activeTriggers;
    },
    
    processActiveTriggersByType: function(triggersIds, triggers, type) {
        var triggersToProcess = this.getActiveTriggersByType(triggersIds, triggers, type);
        for (var i = 0; i < triggersToProcess.length; i++) {
            game.components.actions.processActions(triggersToProcess[i].actions);
            if (!triggersToProcess[i].isRepeat) {
                triggersToProcess[i].isActive = false;
            }
        }
        
        return triggersToProcess.length !== 0;
    }
};


