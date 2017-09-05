game.interfaces.army = {
	template: "",
	
	army: ko.observableArray([]).extend({ notify: 'always' }),
	unitsInReserve: ko.observableArray([]),
	
	selectedUnit: ko.observable(null),

    
    init: function(callback, params) {
		var self = game.interfaces.army;
		self.army(game.hero.army);
		self.unitsInReserve(game.hero.unitsInReserve);
		
        callback();
    },
    
    onReady: function() {
     
    },
    
    onEnd: function() {
		var self = game.interfaces.army;
        game.hero.army = self.army();
		game.hero.unitsInReserve = self.unitsInReserve();
    },
	
	clickOnUnit: function(unit) {		
		var self = game.interfaces.army;
		if (self.selectedUnit() == null) {
			self.selectedUnit(unit);
		} else {
			if (self.selectedUnit() == unit) {
				self.selectedUnit(null);
			} else {
				self.selectedUnit(unit);
			}			
		}
	},
	
	getOfficerArmyId: function(officerArmy) {
		var self = game.interfaces.army;
		for (var i = 0; i < self.army().length; i++) {			
			if (officerArmy == self.army()[i]) {
				return i;
			}
		}
		return null;
	},
	
	getOfficerArmyUnitSlotId: function(officerArmy, unitInSlot) {
		for (var i = 0; i < officerArmy.units.length; i++) {
			if (unitInSlot == officerArmy.units[i]) {
				return i;
			}
		}
		return null;
	},
	
	getUnitInReserveId: function(unit) {
		var self = game.interfaces.army;
		for (var i = 0; i < self.unitsInReserve().length; i++) {
			if (unit == self.unitsInReserve()[i]) {
				return i;
			}
		}
		return null;
	},
	
	getUnitsByType: function(type) {
		var self = game.interfaces.army;
		return self.unitsInReserve();
	},
	
	getDiffUnitsWithSlots: function(officerArmy) {
		var emptySlots = [];
		var officerSlots = game.officers[officerArmy.officer].unitsSlots;
		var officerUnitsCount = officerArmy.units.length;
		for (var i = 0; i < officerSlots - officerUnitsCount; i++) {
			emptySlots.push(i);
		}
		return emptySlots;
	},
	
	updateData: function() {
		var self = game.interfaces.army;
		
		var data = self.army().slice(0);
		self.army([]);
		self.army(data);
		
		self.unitsInReserve(self.unitsInReserve());
	},
	
	clickOnSlot: function(officerArmy, unitInSlot) {
		var self = game.interfaces.army;
		if (self.selectedUnit() == null) {
			return;
		}
		
		var armyId = self.getOfficerArmyId(officerArmy);
		if (armyId == null) {
			return;		
		}
		
		if (unitInSlot !== null) {
			var unitInSlotId = self.getOfficerArmyUnitSlotId(officerArmy, unitInSlot);
			if (unitInSlotId == null) {
				return;
			}			
			
			self.unitsInReserve().push(unitInSlot);
			self.army()[armyId].units[unitInSlotId] = self.selectedUnit();			
		} else {
			self.army()[armyId].units.push(self.selectedUnit());
		}
		
		self.unitsInReserve().splice(self.getUnitInReserveId(self.selectedUnit()), 1);
		self.selectedUnit(null);
		
		self.updateData();		
	},
	
	clickRemoveUnit: function(officerArmy, unitInSlot) {
		var self = game.interfaces.army;
		var armyId = self.getOfficerArmyId(officerArmy);
		if (armyId == null) {
			return;		
		}
		
		var unitInSlotId = self.getOfficerArmyUnitSlotId(officerArmy, unitInSlot);
		if (unitInSlotId == null) {
			return;
		}
		
		self.army()[armyId].units.splice(unitInSlotId, 1);			
		self.unitsInReserve().push(unitInSlot);
		
		self.updateData();
	}
};
