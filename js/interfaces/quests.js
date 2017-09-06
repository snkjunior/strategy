game.interfaces.quests = {
    template: "",
	
	quests: ko.observableArray([]),
	selected: ko.observable(null),
    
    init: function(callback, params) {		
		var quests = game.quests;
		
		this.quests([]);
		this.selected(null);
		
		for (var questId in quests) {
			if (!quests[questId].isFinished) {
				var quest = {
					id: questId,
					notes: [],
					name: game.cMission.quests[questId].name,
					description: game.cMission.quests[questId].description
				};
				
				for (var i = 0; i < quests[questId].notes.length; i++) {
					quest.notes.push(game.cMission.quests[questId].notes[quests[questId].notes[i]]);
				}
				
				if (this.selected() == null) {
					this.selected(quest);
				}
				
				this.quests().push(quest);
			}
		}
		
        callback();
    },
    
    onReady: function() {
		game.setMenuVisible(true);
    },
    
    onEnd: function() {
        
    },
	
	clickOnQuest: function(quest) {
		var self = game.interfaces.quests;
		self.selected(quest);
	}
};