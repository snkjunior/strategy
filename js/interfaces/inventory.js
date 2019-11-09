game.interfaces.inventory = {
    template: "",
    items: ko.observableArray([]),
    
    init: function(callback, params) {
        var self = game.interfaces.inventory;
        self.items(game.inventory);
        callback();
    },
    
    onReady: function() {
     
    },
    
    onEnd: function() {
        
    },
    
    getItem: function(id) {
        if (game.data.items[id]) {
            return game.data.items[id];
        }
        if (game.cMission.items[id]) {
            return game.cMission.items[id];
        }
        return null;
    }
};