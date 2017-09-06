game.interfaces.location = {
    template: "",
    
    location: null,
    
    init: function(callback, params) {
        var self = game.interfaces.location;
        self.location = game.cMap.locations[game.hero.locationId];
        callback();
    },
    
    onReady: function() {
		game.setMenuVisible(false);
    },
    
    onEnd: function() {
        
    },
    
    clickObject: function(object) {
        if (object.type === 'dialog') {
            game.showInterface('dialog', {object: object});
            return;
        }
        if (object.type === 'action') {
            game.components.actions.processActions(object.result);
            return;
        }
    },
    
    clickBack: function() {
        game.showInterface('map');
    }
};