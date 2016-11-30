game.interfaces.dialog = {
    template: "",
    
    object: null,
    
    descriptionText: ko.observable(''),
    visibleActions: ko.observableArray([]),
    
    init: function(callback, object) {
        var self = game.interfaces.dialog;
        
        self.object = object;
        self.descriptionText(object.description);
        
        callback();
    },
    
    onReady: function() {
        this.updateActions();
    },
    
    onEnd: function() {
        
    },
    
    updateActions: function() {
        var self = game.interfaces.dialog;

        var visibleActions = [];
        for (var i = 0; i < self.object.actions.length; i++) {
            if (game.components.conditions.isVisible(self.object.actions[i].visibleConditions)) {
                var isActive = game.components.conditions.isVisible(self.object.actions[i].activeConditions);
                visibleActions.push({
                    action: self.object.actions[i],
                    isActive: isActive
                });
            }
        }
        self.visibleActions(visibleActions);
    },
    
    clickAction: function(action) {
        var self = game.interfaces.dialog;
        var actionsDescription = game.components.actions.processActions(action.action.result);
        self.descriptionText(actionsDescription);
        self.updateActions();
    },
    
    clickBack: function() {
        game.showInterface('location', null);
    }
};