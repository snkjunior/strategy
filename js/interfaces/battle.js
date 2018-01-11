game.interfaces.battle = {
    template: "",
    
    // Map static info
    players: {
        1: {
            isPlayer: true,
            isAlive: true,
            side: 1,
            turn: 1,
            nextPlayerTurn: 2
        },
        2: {
            isPlayer: false,
            isAlive: true,
            side: 2,
            turn: 2,
            nextPlayerTurn: 1
        }
    },
    width: 16,
    height: 8,
	offset: 200,
    map: [],
	hexesToPlaceUnits: [],
    
    // Settings    
    isShowBorder: ko.observable(true),
    isShowCoordinates: ko.observable(false),
    
    //Dynamic data
	battleStage: ko.observable(null),
    hint: ko.observable(null),
	
    units: {},
    
    currentPlayerTurn: ko.observable(1),        
    isPlayerTurn: ko.observable(true),
    
    selectedUnit: ko.observable(null),
    selectedAction: ko.observable(null),
    
    actionAttackInfo: ko.observable(null),
    
    mouseOverHex: ko.observable(null),
    
    moveZone: ko.observableArray([]),
    movePass: ko.observableArray([]),
    unitsToAction: ko.observableArray([]),
    
    mouseOverMoveZone: ko.observableArray([]),
    
    result: null,
    
    isAnimate: false,
    
    init: function(callback, params) {
        var self = game.interfaces.battle;
        
		self.battleStage('placeUnits');
        self.hint('Place your units on yellow hexes and click button "Start battle"');
		
        self.map = self.generateMap(self.width, self.height);
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < self.height; y++) {
                if (self.map[y][x].object == null || game.data.battle.objects[self.map[y][x].object].isPassable == true) {
                    self.hexesToPlaceUnits.push({x: x, y:y});
                }
			}
		}
        
		var units = [];
		for (var i = 0; i < game.hero.army.length; i++) {
			for (var j = 0; j < game.hero.army[i].units.length; j++) {
				units.push(game.hero.army[i].units[j]);
			}
		}
		
        
        self.generateSquadsFromUnits(units, 1);
        self.generateSquadsFromUnits(params.enemies, 2);
        
        self.result = params.result;
		
        callback();
    },
    
    generateMap: function(width, height) {
        var map = [];
        for (var y = 0; y < height; y++) {
            if (map[y] == null) {
                map[y] = [];
            }
            
            for (var x = 0; x < width; x++) {
                map[y][x] = {
                    x: x,
                    y: y,
                    cCoord: game.components.hexGeom.getHexCasterianCoord({x: x, y: y}),
                    terrain: 'grass',
                    object: (Math.round(Math.random() * 100) % 5 === 1 ? (Math.round(Math.random() * 100) % 5 === 2 ? "mountain" : "forest") : null),
                };
            }
        }
        return map;
    },
    
    generateSquadsFromUnits: function(units, ownerId) {
        var self = game.interfaces.battle;
        
        var squadNum = 1;
        for (var i = 0; i < units.length; i++) {
			unitTypeId = units[i].unitType;
            var unitType = game.data.units[unitTypeId];
			
			var x = 14;
			var y = squadNum;
			if (ownerId == 1) {
				var emptyHexToPlace = self.getRandomEmptyHexToPlaceUnit();
				x = emptyHexToPlace.x;
				y = emptyHexToPlace.y;
			}
			
			var squad = {
				id: Object.keys(self.units).length,
				ownerId: ownerId,
				unitTypeId: unitTypeId,
				x: ko.observable(x),
				y: ko.observable(y),
				cHp: ko.observable(unitType.unitHp),
				cCount: ko.observable(unitType.unitsInSquad),
				cAction: ko.observable(unitType.weapons[0]),
				canMove: ko.observable(true),
				canAction: ko.observable(true),
				lightWounded: ko.observable(0),
                hasCounterAttack: ko.observable(true)
			};
			self.units[squad.id] = squad;
			squadNum++;            
        }
    },
    
    onReady: function() {
		var self = game.interfaces.battle;
        if (game.screen.height >= parseInt($('#map').css('height'))) {
            $('#map').css('top', (game.screen.height - parseInt($('#map').css('height'))) / 2);
        }
        if (game.screen.width >= parseInt($('#map').css('width'))) {
            $('#map').css('left', (game.screen.width - parseInt($('#map').css('width'))) / 2);
        }
        
        if (game.screen.width <= parseInt($('#map').css('width')) + self.offset * 2 || game.screen.height <= parseInt($('#map').css('height')) + self.offset * 2) {
            $('#map').draggable({
                drag: function(event, ui) {
                    if (game.screen.height <= parseInt($('#map').css('height')) + self.offset * 2) {
                        if (ui.offset.top > self.offset) {
                            ui.position.top = self.offset;
                        }
                        if (ui.offset.top < -parseInt($('#map').css('height')) + game.screen.height - self.offset) {
                            ui.position.top = -parseInt($('#map').css('height')) + game.screen.height - self.offset;
                        }
                    }
                    else {
                        ui.position.top = (game.screen.height - parseInt($('#map').css('height'))) / 2;
                    }

                    if (game.screen.width <= parseInt($('#map').css('width')) + self.offset * 2) {
                        if (ui.offset.left > self.offset) {
                            ui.position.left = self.offset;
                        }
                        if (ui.offset.left < -parseInt($('#map').css('width')) + game.screen.width - self.offset) {
                            ui.position.left = -parseInt($('#map').css('width')) + game.screen.width - self.offset;
                        }
                    } 
                    else {
                        ui.position.left = (game.screen.width - parseInt($('#map').css('width'))) / 2
                    }
                }
            });
        } else {
            $('#map').css('left', (game.screen.width - parseInt($('#map').css('width'))) / 2 + 'px');
            $('#map').css('top', (game.screen.height - parseInt($('#map').css('height'))) / 2 + 'px');
        }
        
        $("#interface").bind('mousemove', function(e) {
            game.interfaces.battle.onMouseMove(e);
        });
        
        $('#map').click(game.interfaces.battle.clickOnHex);
        
        $('#battleInterface').contextmenu(function() {
            game.interfaces.battle.onMouseRightClick();
            return false;
        });
		
		game.setMenuVisible(false);
    },
    
    onEnd: function() {
        
    },
    
    onMouseRightClick: function(e) {
        var self = game.interfaces.battle;
        if (self.mouseOverHex() != null) {
            var unitId = self.getUnitIdInHex(self.mouseOverHex().x, self.mouseOverHex().y);
            if (unitId != null) {
                console.log("Show unit info: " + unitId);
                //self.showUnitInfo(self.units[unitId]);
            }
        }
    },
    
    onMouseMove: function(e) {        
        var self = game.interfaces.battle;
        
        if (self.isAnimate)
            return;
            
        var borderWidth = parseInt($('#interface').css('border-width'));    
        var mx = e.clientX - borderWidth;
        var my = e.clientY - borderWidth;
        var minHex = null;

        var targetElement = $(e.target);
        if (!targetElement.hasClass('hex')) {
            for (var i = 0; i <= 2; i++) {
                targetElement = targetElement.parent();
                if (targetElement.hasClass('hex')) {
                    break;
                }
            }
        }
        
        // if (targetElement.prop('tagName') == "IMG") {
            // targetElement = targetElement.parent();
        // }
        if (targetElement.hasClass('hex')) {
            var currentHex = self.map[targetElement.attr("y")][targetElement.attr("x")];
            var hexesToCheck = game.components.hexGeom.getNeighborHexes(currentHex.x, currentHex.y, self.map);
            hexesToCheck.push(currentHex);

            var minDistance = 9999;
            for (var i = 0; i < hexesToCheck.length; i++) {
                var hexCoord = game.components.hexGeom.getHexCentralCoordinates(hexesToCheck[i]);
                var distance = Math.sqrt(Math.pow(hexCoord.x - mx, 2) + Math.pow(hexCoord.y - my, 2));
                if (distance <= minDistance) {
                    minDistance = distance;
                    minHex = hexesToCheck[i];
                }

                if (minDistance > 32) {
                    minHex = null;
                }
            }
        }

        if (self.selectedUnit() != null && self.selectedUnit().canMove()) {
            if (minHex != self.mouseOverHex()) {
				self.movePass(game.components.hexGeom.getMovePass(self.moveZone(), minHex));
            }
        }

        if (minHex != self.mouseOverHex()) {
            self.actionAttackInfo(null);
            
			self.mouseOverHex(minHex);
            if (minHex != null) {
                var unitId = self.getUnitIdInHex(minHex.x, minHex.y);
				if (unitId != null) {
					if (self.battleStage() == 'battle') {
						if (self.selectedUnit() != self.units[unitId]) {
							self.mouseOverMoveZone(game.components.hexGeom.getUnitMoveZone(self.units[unitId], self.units, self.map));
						}
						
						if (self.units[unitId].ownerId != 1) {
							if (self.selectedUnit() != null && self.selectedUnit().canAction() && self.unitsToAction().indexOf(unitId) !== -1) {
								var damageToTarget = self.getActionDamageToTarget(self.selectedUnit(), self.units[unitId], true);
								var damageToUnit = 0;
								if (game.components.hexGeom.isCanAttackUnit(self.units[unitId], self.units[unitId].cAction(), self.selectedUnit(), self.map)) {
									damageToUnit = self.getActionDamageToTarget(self.units[unitId], self.selectedUnit(), true, true);
								}
								self.actionAttackInfo({
									unitDamage: damageToTarget,
									targetDamage: damageToUnit
								});
							}
						}
					}
                } else {
                    self.mouseOverMoveZone([]);
                }
            }
        }
    },
    
	clickStartBattle: function() {
		var self = game.interfaces.battle;
		self.selectedUnit(null);
		self.battleStage('battle');
        self.hint('Your turn');
	},
	
    clickOnHex: function() {        
        var self = game.interfaces.battle;
        
        if (self.isAnimate)
            return;
        
        if (self.mouseOverHex() == null || !self.isPlayerTurn) {
            return;
        }
        
        var currentHex = self.mouseOverHex();
        var unitId = self.getUnitIdInHex(currentHex.x, currentHex.y);
        if (unitId != null) {
            var unit = self.units[unitId];
            if (unit != self.selectedUnit()) {
				if (self.battleStage() == 'placeUnits' && unit.ownerId == 1) {
					if (self.selectedUnit() == null) {
						self.selectedUnit(unit);
					} else {
						unit.x(self.selectedUnit().x());
						unit.y(self.selectedUnit().y());
						self.selectedUnit().x(currentHex.x);
						self.selectedUnit().y(currentHex.y);
						self.unselectUnit();
					}
				}
				if (self.battleStage() == 'battle') {
					if (unit.ownerId == 1) {
						self.selectedUnit(unit);
						self.mouseOverMoveZone([]);
						self.selectedAction(unit.cAction());
						if (unit.canMove()) {
							self.moveZone(game.components.hexGeom.getUnitMoveZone(unit, self.units, self.map));
						}
						if (unit.canAction()) {
							self.unitsToAction(self.getUnitsInActionRadius(unit, self.selectedAction()));
						}
					} else {
						if (self.selectedUnit() != null && self.selectedUnit().canAction()) {
							if (self.unitsToAction().indexOf(unitId) != -1) {
								self.processActionToUnit(self.selectedUnit(), unit);
								self.unitsToAction([]);
							}
						}
					}
				}
            } else {
                self.unselectUnit();
            }
        } else {
			if (self.battleStage() == 'placeUnits' && self.selectedUnit() != null && self.isHexInHexesToPlaceUnits(currentHex)) {
				self.selectedUnit().x(currentHex.x);
				self.selectedUnit().y(currentHex.y);
				self.unselectUnit();
			}
			if (self.battleStage() == 'battle') {
				if (self.moveZone().length && game.components.hexGeom.getHexInMoveZone(self.moveZone(), currentHex.x, currentHex.y)) {
					var unit = self.selectedUnit();   
					var hexToMove = game.components.hexGeom.getHexInMoveZone(self.moveZone(), currentHex.x, currentHex.y);
					self.moveZone([]);
					self.movePass([]);
					self.unitsToAction([]);
					self.selectedUnit(null);
					self.moveUnit(unit, hexToMove, function(unit) {
						self.selectedUnit(unit);
						self.selectedUnit().canMove(false);
						if (self.selectedUnit().canAction()) {
							self.unitsToAction(self.getUnitsInActionRadius(self.selectedUnit(), self.selectedAction()));
						}
					});                                                
				}
			}
        }
    },
	
	isHexInHexesToPlaceUnits: function(hex) {
		var self = game.interfaces.battle;
		for (var i = 0; i < self.hexesToPlaceUnits.length; i++) {
			if (self.hexesToPlaceUnits[i].x == hex.x && self.hexesToPlaceUnits[i].y == hex.y) {
				return true;
			}
		}
		return false;
	},
	
	getRandomEmptyHexToPlaceUnit: function() {
		var self = game.interfaces.battle;
		var emptyHexes = [];
		for (var i = 0; i < self.hexesToPlaceUnits.length; i++) {
			var isEmpty = true;
			for (var unitId in self.units) {
				if (self.units[unitId].x() == self.hexesToPlaceUnits[i].x && self.units[unitId].y() == self.hexesToPlaceUnits[i].y) {
					isEmpty = false;
					break;
				}
			}
			
			if (isEmpty) {
				emptyHexes.push(self.hexesToPlaceUnits[i]);
			}			
		}
		return emptyHexes[Math.round(Math.random() * (emptyHexes.length - 1))];
	},	
    
    unselectUnit: function() {
        var self = game.interfaces.battle;
        self.selectedUnit(null);
        self.moveZone([]);
        self.movePass([]);
        self.unitsToAction([]);
    },
    
    clickOnAction: function(action) {
        var self = game.interfaces.battle;
        if (self.selectedUnit().canAction()) {
            self.selectedAction(action);
            self.unitsToAction(self.getUnitsInActionRadius(self.selectedUnit(), self.selectedAction()));
            self.selectedUnit().cAction(action);
        }
    },
    
    clickEndTurnButton: function() {
        var self = game.interfaces.battle;
        self.unselectUnit();
        self.currentPlayerTurn(self.players[game.playerId].nextPlayerTurn);
        self.processEnemyTurn();
    },
    
    getUnitIdInHex: function(x, y) {		
        var self = game.interfaces.battle;
        for (var unitId in self.units) {
			if (self.units[unitId].x() == x && self.units[unitId].y() == y && self.units[unitId].cCount() > 0) {
                return parseInt(unitId);
            }
        }
        return null;
    },
    
    // Use in template
    isHexHasMovePass: function(x, y, vector) {
        var self = game.interfaces.battle;
        for (var i = 0; i < self.movePass().length; i++) {
            var pass = self.movePass()[i];
            if (pass.hex.x == x && pass.hex.y == y) {
                if (vector == null) {
                    return true;
                } 
                else {
                    var movePassVector = (pass.vector.x > 0 ? "+1" : pass.vector.x.toString()) + (pass.vector.y > 0 ? "+1" : pass.vector.y.toString()); 
                    if (movePassVector == vector)  {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    
    // Use in template
    isUnitToAction: function(x, y) {
        var self = game.interfaces.battle;
        if (self.unitsToAction().length) {
            for (var i = 0; i < self.unitsToAction().length; i++) {
                if (self.unitsToAction()[i].x() == x && self.unitsToAction()[i].y() == y) {
                    return true;
                }
            }
        }
        return false;
    },
    
    getUnitsInActionRadius: function(unit, action) {
        var self = game.interfaces.battle;

        var hexesInRadius = game.components.hexGeom.getHexesBetweenRadiuses(unit.x(), unit.y(), action.minDistance, action.maxDistance, self.map);
        
        var unitsToAction = [];
        for (var i = 0; i < hexesInRadius.length; i++) {
            for (var unitId in self.units) {
                var cUnit = self.units[unitId];
                if (cUnit.ownerId !== unit.ownerId) {
                    if (cUnit.x() == hexesInRadius[i].x && cUnit.y() == hexesInRadius[i].y) {
                        unitsToAction.push(parseInt(unitId));
                    }
                }
            }
        }

        return unitsToAction;
    },
    
    animateUnitMove: function(unit, movePass, callback) {
        var self = game.interfaces.battle;
        
        var cHecCC = game.components.hexGeom.getHexCentralCoordinates(self.map[unit.y()][unit.x()]);
        var newHexCC = game.components.hexGeom.getHexCentralCoordinates(movePass[0]);
        var dLeft =  newHexCC.x - cHecCC.x;
        var dTop =  newHexCC.y - cHecCC.y;

        $('img[unitId='+unit.id+']').animate({
            left: "+=" + dLeft,
            top: "+=" + dTop
        }, 500, function() {
            unit.x(movePass[0].x);
            unit.y(movePass[0].y);
            
            movePass.splice(0, 1);
            if (movePass.length != 0) {
                self.animateUnitMove(unit, movePass, callback);
            } else {
                self.isAnimate = false;
                callback(unit);
            }
        });
    },
    
    moveUnit: function(unit, moveZoneEndHex, callback) {
        if (moveZoneEndHex.x === unit.x() && moveZoneEndHex.y === unit.y()) {
            callback();
            return;
        }
        
        var self = game.interfaces.battle;
        
        var movePass = [];
        while (moveZoneEndHex !== null) {
            movePass.unshift(moveZoneEndHex);
            moveZoneEndHex = moveZoneEndHex.prevHex;
        }
        movePass.splice(0, 1);
        
        self.isAnimate = true;
        self.animateUnitMove(unit, movePass, callback);
    },
            
    processActionToUnit: function(actionUnit, targetUnit) {
        var self = game.interfaces.battle;
        
        var damageToTarget = self.getActionDamageToTarget(actionUnit, targetUnit);
        var damageToUnit = false;
        if (game.components.hexGeom.isCanAttackUnit(targetUnit, targetUnit.cAction(), actionUnit, self.map)) {
            damageToUnit = self.getActionDamageToTarget(targetUnit, actionUnit, false, true);
        }
        
        var targetWounded = self.processDamageToUnit(damageToTarget, targetUnit);
        self.template_showSquadDamage(targetUnit, damageToTarget, targetWounded.light + targetWounded.heavy);
        if (damageToUnit !== false) {
            var unitWounded = self.processDamageToUnit(damageToUnit, actionUnit);
            self.template_showSquadDamage(actionUnit, damageToUnit, unitWounded.light + unitWounded.heavy);
            targetUnit.hasCounterAttack(false);
        }
        
        actionUnit.canAction(false);
        
        self.isBattleEnd();
    },
    
    getActionDamage: function(action) {
        var damage = 0;
        for (var type in action.damages) {
            damage += action.damages[type];
        }
        return damage;
    },
    
    getActionDamageToTarget: function(unit, target, checkSkills = true, isTarget = false) {
        var self = game.interfaces.battle;
        
        var damage = 0;
        for (var type in unit.cAction().damages) {
            damage += unit.cAction().damages[type] * (1 - game.data.units[target.unitTypeId].protection[type] / 100);
        }
        
        var bonuses = 0;
        bonuses -= self.getLocationDefenceBonus(target.x(), target.y());
        if (checkSkills) {
            bonuses += self.getUnitSkillBonuses(unit, target, 'offence', 'damage');
            bonuses += self.getUnitSkillBonuses(target, unit, 'defence', 'damage');
        }
        damage *= 1 + bonuses / 100;
        damage *= unit.cCount() / game.data.units[unit.unitTypeId].unitsInSquad;
        
        if (isTarget && !unit.hasCounterAttack()) {
            damage /= 2;            
        }
        
        damage = parseFloat(damage.toFixed(2));
        
        return damage;
    },
    
    processDamageToUnit: function(damage, targetUnit) {
        var self = game.interfaces.battle;
        
        var killed = 0;
        
        killed = Math.floor(damage / game.data.units[targetUnit.unitTypeId].unitHp);
        targetUnit.cCount(targetUnit.cCount() - Math.floor(damage / game.data.units[targetUnit.unitTypeId].unitHp));
        targetUnit.cHp(Math.round(targetUnit.cHp() * 100 - (damage * 100) % (game.data.units[targetUnit.unitTypeId].unitHp * 100)) / 100);
        if (targetUnit.cHp() <= 0) {
            killed++;
            targetUnit.cCount(targetUnit.cCount() - 1);
            targetUnit.cHp(Math.round(game.data.units[targetUnit.unitTypeId].unitHp * 100 + targetUnit.cHp() * 100) / 100);
        }
        
        if (targetUnit.ownerId === 1 && targetUnit == self.selectedUnit() && targetUnit.cCount() <= 0) {
            self.unselectUnit();
        }
        
        var lightWounded = 0;
        for (var i = 0; i < killed; i++) {
            if (Math.random() * 100 >= 50) {
                targetUnit.lightWounded(targetUnit.lightWounded() + 1);
                lightWounded++;
            }
        }
        
        return {
            light: lightWounded,
            heavy: killed - lightWounded 
        };
    },
    
    processUnitInLists: function(units) {
        var self = game.interfaces.battle;
        
        if (units.length === 0) {
            self.currentPlayerTurn(self.players[self.currentPlayerTurn()].nextPlayerTurn);            
            if (self.currentPlayerTurn() !== 1) {
                self.processEnemyTurn();                
            } else {
                self.updatePlayerUnitsActions(1);
                self.hint('Your turn');
            }
            return;
        }
        
        var unit = units[0];
        var target = game.components.botVI.getTargetToAttack(unit, self.units, self.map);
        if (target === null) {
            var hexToMove = game.components.botVI.getUnitMoveHexToNearestEnemy(unit, self.units, self.map);
            if (hexToMove !== null) {
                self.moveUnit(unit, hexToMove, function() {
                    units.splice(0, 1);
                    self.processUnitInLists(units);
                });
            }
        }
        else {
            self.moveUnit(unit, target.hexToMove, function() {
                self.processActionToUnit(unit, target.target);
                units.splice(0, 1);
                self.processUnitInLists(units);
            });
        }
    },

    processEnemyTurn: function() {
        var self = game.interfaces.battle;
        self.hint('Enemy turn');
        self.updatePlayerUnitsActions(self.currentPlayerTurn());
        var unitsToAction = [];
        for (var unitId in self.units) {
            var unit = self.units[unitId];
            if (unit.cCount() > 0 && unit.ownerId === self.currentPlayerTurn()) {
                unitsToAction.push(unit);
            }
        }
        self.processUnitInLists(unitsToAction);
    },
    
    updatePlayerUnitsActions: function(playerId) {
        var self = game.interfaces.battle;
        for (var unitId in self.units) {
            if (self.units[unitId].ownerId == playerId) {
                self.units[unitId].canMove(true);
                self.units[unitId].canAction(true);
                self.units[unitId].hasCounterAttack(true);
            }
        }
    },
    
    template_showSquadDamage: function(unit, damage, killed) {
        var self = game.interfaces.battle;
        var template = $('#damagePattern').clone();
        template.attr('id', '');
        template.find('.textRed')[0].innerHTML = -damage;
        if (killed !== 0) {
            template.find('.textYellow')[0].innerHTML = -killed;
        }
        
        var coord = game.components.hexGeom.getHexCentralCoordinates(self.map[unit.y()][unit.x()]);
        template.css('top', coord.y - 32);
        template.css('left', coord.x - 32);
        $('#battleInterface').append(template);
        template.show();
        template.animate({
                top: coord.y - 50
            }, 
            2000,
            function() {
                template.remove();
            }
        );
    },
    
    getLocationDefenceBonus: function(x, y) {
        var self = game.interfaces.battle;
        var bonus = 0;
        if (self.map[y][x].object != null) {
            bonus = game.data.battle.objects[self.map[y][x].object].defenceBonus;
        }
        return bonus;
    },
    
    getUnitLocationDefenceBonus: function(x, y, unit) {
        var self = game.interfaces.battle;        
        var bonus = self.getLocationDefenceBonus(x, y) - self.getUnitSkillBonuses(unit, null, 'defence', 'damage', self.map[y][x]);        
        return bonus;
    },
    
    getChanceToAttack: function(unit, target) {
        var self = game.interfaces.battle;
        var chance = 0;
        if (game.components.hexGeom.isCanAttackUnit(unit, unit.cAction(), target, self.map)) {
            chance =  unit.cAction().accuracy - self.getLocationDefenceBonus(target.x(), target.y());
            chance += self.getUnitSkillBonuses(unit, target, 'offence', 'accuracy');
            chance += self.getUnitSkillBonuses(target, unit, 'defence', 'accuracy');
        }
        return chance;
    },
    
    getChancesToAttack: function(unit, targetUnit) {
        var self = game.interfaces.battle;
        
        return {
            unitAccuracy: self.getChanceToAttack(unit, targetUnit),
            targetAccuracy: self.getChanceToAttack(targetUnit, unit)
        };
    },
    
    getUnitSkillBonuses: function(unit, target, type, param = null, hex = null) {
        var bonuses = {};
        for (var i = 0; i < game.data.units[unit.unitTypeId].skills.length; i++) {
            var skill = game.data.skills[game.data.units[unit.unitTypeId].skills[i]];
            if (skill.type == type) {
                if (skill.condition(unit, target, hex)) {
                    for (var bonusName in skill.bonuses) {
                        if (bonuses[bonusName] != null) {
                            bonuses[bonusName] += skill.bonuses[bonusName];
                        } 
                        else {
                            bonuses[bonusName] = skill.bonuses[bonusName];
                        }
                    }
                }
            }
        }
        
        if (param != null) {
            if (bonuses[param] != null) {
                return bonuses[param];
            }
            return 0;
        }
        
        return bonuses;
    },
    
    isBattleEnd: function() {
        var self = game.interfaces.battle;
        
        var players = {
            1: false,
            2: false
        };
        
        for (var unitId in self.units) {
            if (self.units[unitId].cCount() > 0) {
                players[self.units[unitId].ownerId] = true;
            }
        }
        
        if (!players[1]) {
            game.showInterface('dialog', {msg: "Вы проиграли сражение."});
        }
        
        if (!players[2]) {
            var resultDescription = game.components.actions.processActions(self.result);
            game.showInterface('dialog', {msg: resultDescription});
        }
    }
};