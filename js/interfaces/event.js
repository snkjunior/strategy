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
    
    clickAction: function(action) {
        game.components.actions.processActions(action.result);        
    },
    
    setState: function(stateId) {
        if (this.eventData().states[stateId]) {
            this.currentState(this.eventData().states[stateId]);
        }
    }
};