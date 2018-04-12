game.interfaces.inventory = {
    template: "",
    items: ko.observableArray([]),
    
    init: function(callback, params) {
        var self = game.interfaces.inventory;
        self.items(game.items);
        callback();
    },
    
    onReady: function() {
     
    },
    
    onEnd: function() {
        
    }
};