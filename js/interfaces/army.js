game.interfaces.army = {
    template: "",
	
	army: ko.observableArray([]),
	reserve: ko.observable({}),
	
	selectedUnitInArmy: ko.observable(null), // slot number
	selectedUnitInReserve: ko.observable(null), // unit type id
	
	activeSlots: ko.observable([]),
	
    init: function(callback, params) {
		var self = game.interfaces.army;
		
		
		army = [];
		for (var i = 0; i < 7; i++) {
			if (typeof(game.hero.army[i]) != 'undefined') {
				army[i] = game.hero.army[i];
			} else {
				army[i] = null;
			}
		}
	
		self.army(army);
		
		reserve = {};
		for (var unitType in game.hero.reserve) {
			reserve[unitType] = {unitType: unitType, count: game.hero.reserve[unitType], wounded: 0};
		}
		
		for (var unitType in game.hero.wounded) {
			if (typeof(reserve[unitType]) == 'undefined') {
				reserve[unitType] = {unitType: unitType, count: 0, wounded: 0};
			}
			reserve[unitType].wounded = game.hero.wounded[unitType];
		}
		
		console.log(reserve);
		
		self.reserve(reserve);
		
        callback();
    },
    
    onReady: function() {
		
    },
    
    onEnd: function() {
		var self = game.interfaces.army;
		game.hero.army = self.army();
		
		game.hero.reserve = {};
		for (var unitType in self.reserve()) {
			game.hero.reserve[unitType] = self.reserve()[unitType].count;
		}
    },
	
	getReserveAsArray: function() {
		var self = game.interfaces.army;
		
		result = [];
		for (var unitId in self.reserve()) {
			result.push(self.reserve()[unitId]);
		}
		return result;
	},
	
	clickOnUnitInArmySlot(slotNum) {
		var self = game.interfaces.army;
		// Если раньше не был выбран юнит в армии или в резерве и в выбранном слоте армии есть юнит
		if (self.selectedUnitInArmy() === null && !self.selectedUnitInReserve() && self.army()[slotNum] !== null) {
			self.selectedUnitInArmy(slotNum);
			self.selectedUnitInReserve(null);
			self.updateActiveSlots();
			return;
		}
		
		// Если раньше был выбран юнит в армии
		if (self.selectedUnitInArmy() !== null) {
			// Если выбраный юнит на текущем слоте, то убираем отметку, что юнит выбран
			if (self.selectedUnitInArmy() == slotNum) {
				self.selectedUnitInArmy(null);
				self.updateActiveSlots();
				return;
			} 
			
			army = self.army();
			seletedUnit = army[self.selectedUnitInArmy()];
			
			// Если выбраный слот с юнитом
			if (army[slotNum] != null) {
				clickedArmy = army[slotNum];
				
				// Если тип юнита не совпадает, то меняем их местами
				
				if (clickedArmy.unitType != seletedUnit.unitType) {
					army[self.selectedUnitInArmy()] = clickedArmy;
					army[slotNum] = seletedUnit;
				} else { // Если тип юнита совпадает, то объяединяем их
					army[slotNum].count += seletedUnit.count;
					delete(army[self.selectedUnitInArmy()]);
				}
			}
			
			// Если выбранный слот без юнита, то ставим туда выбранный юнит
			if (army[slotNum] === null) {
				army[slotNum] = seletedUnit;
				army[self.selectedUnitInArmy()] = null;
			}
			
			self.army(army);
			self.selectedUnitInArmy(null);
			self.updateActiveSlots();
			return;
		} 
		
		// Если был выбран юнит в резерве
		if (self.selectedUnitInReserve() !== null) {
			army = self.army();
			reserve = self.reserve();
			seletedreserveUnit = reserve[self.selectedUnitInReserve()];
			
			// Если выбраный слот с юнитом, который выбран в резерве или в данном слоте нет юнита
			if (army[slotNum] === null || (army[slotNum] !== null && army[slotNum].unitType == seletedreserveUnit.unitType)) {
				self.addUnitFromReserveToSlot(seletedreserveUnit, slotNum);
				self.selectedUnitInReserve(null);
				self.updateActiveSlots();
				return;
			}
		}
	},
	
	clickOnUnitInReserve: function(unit)
	{
		var self = game.interfaces.army;
		if (self.selectedUnitInArmy()) {
			console.log(1);
			self.selectedUnitInArmy(null);
			self.updateActiveSlots();
			return;
		}
		
		if (self.selectedUnitInReserve()) {
			if (self.selectedUnitInReserve() == unit.unitType) {
				self.selectedUnitInReserve(null);
			} else {
				if (unit.count > 0) {
					self.selectedUnitInReserve(unit.unitType);
				}
			}
		} else {
			if (unit.count > 0) {
				self.selectedUnitInReserve(unit.unitType);
			}
		}
		
		self.updateActiveSlots();
		return;
	},
	
	updateActiveSlots: function()
	{
		var self = game.interfaces.army;
		activeSlots = [];
		if (self.selectedUnitInArmy() !== null) {
			for (var i = 0; i < self.army().length; i++) {
				activeSlots.push(i);
			}
		} else if (self.selectedUnitInReserve()) {
			for (var i = 0; i < self.army().length; i++) {
				console.log(self.army()[i]);
				if (!self.army()[i] || self.army()[i].unitType == self.selectedUnitInReserve()) {
					activeSlots.push(i);
				}
			}
		}
		
		self.activeSlots(activeSlots);
		return;
	},
	
	isSlotActive: function(slotNum)
	{
		var self = game.interfaces.army;
		return self.activeSlots().indexOf(slotNum) != -1; 
	},
	
	removeUnitFromArmy: function(slotNum)
	{
		var self = game.interfaces.army;
		if (self.army()[slotNum] !== null) {
			reserve = self.reserve();
			army = self.army();
			unitInArmy = self.army()[slotNum];
			
			if (typeof(reserve[unitInArmy.unitType])== 'undefined') {
				unitInReserv = {unitType: unitInArmy.unitType, count: 0, wounded: 0};
			} else {
				unitInReserv = reserve[unitInArmy.unitType];
			}
			
			unitInReserv.count += unitInArmy.count;
			
			reserve[unitInArmy.unitType] = unitInReserv;
			self.reserve(reserve)
			
			army[slotNum] = null;
			self.army(army);
		}
	},
	
	addUnitFromReserveToSlot: function(reserveUnit, slotNum)
	{
		var self = game.interfaces.army;
		countToAdd = self.getMaxUnitCountCanAddToArmyFromReserve(reserveUnit);
		if (countToAdd > 0) {
			army = self.army();
			reserve = self.reserve();
			if (army[slotNum] !== null) {
				slotUnit = army[slotNum];
				if (slotUnit.unitType == reserveUnit.unitType) {
					army[slotNum].count += countToAdd;
				}
			} else {
				army[slotNum] = {
					unitType: reserveUnit.unitType,
					count: countToAdd
				};
			}
			
			reserve[reserveUnit.unitType].count -= countToAdd;
			if (reserve[reserveUnit.unitType].count == 0 && reserve[reserveUnit.unitType].wounded == 0) {
				delete(reserve[reserveUnit.unitType]);
			}
			
			self.army(army);
			self.reserve(reserve);
		}
	},
	
	getMaxUnitCountCanAddToArmyFromReserve: function(reserveUnit)
	{
		return reserveUnit.count;
	}
};