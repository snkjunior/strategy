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
    width: 13,
    height: 7,
    map: [],
    
    // Settings    
    isShowBorder: ko.observable(false),
    isShowCoordinates: ko.observable(false),
    
    //Dynamic data
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
    
    enemyMoveZone: ko.observableArray([]),
    
    result: null,
    
    isAnimate: false,
    
    init: function(callback, params) {
        var self = game.interfaces.battle;
        
        self.map = self.generateMap(self.width, self.height);
        self.generateSquadsFromUnits(params.units, 1);
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
                    object: (Math.round(Math.random() * 100) % 5 === 1 ? "forest" : null),
                };
            }
        }
        return map;
    },
    
    generateSquadsFromUnits: function(units, ownerId) {
        var self = game.interfaces.battle;
        
        var squadNum = 1;
        for (var unitTypeId in units) {
            var unitType = game.data.units[unitTypeId];
            for (var i = 0; i < units[unitTypeId]; i++) {
                var squad = {
                    id: Object.keys(self.units).length,
                    ownerId: ownerId,
                    unitTypeId: unitTypeId,
                    x: ko.observable(ownerId === 1 ? 1 : 4),
                    y: ko.observable(squadNum),
                    cHp: ko.observable(unitType.unit.hp),
                    cCount: ko.observable(unitType.unitsInSquad),
                    cAction: ko.observable(unitType.weapons[0]),
                    canMove: ko.observable(true),
                    canAction: ko.observable(true),
                    lightWounded: ko.observable(0)
                };
                self.units[squad.id] = squad;
                squadNum++;
            }
        }
    },
    
//    generateSquadsFromUnits: function(units, ownerId) {
//        var self = game.interfaces.battle;
//        
//        var squadNum = 1;
//        for (var unitTypeId in units) {
//            var unitType = game.data.units[unitTypeId];
//            var cCount = units[unitTypeId];
//            while (cCount > 0) {
//                var squadCount = unitType.unitsInSquad;
//                if (cCount < unitType.unitsInSquad) {
//                    squadCount = cCount;
//                }
//                
//                var squad = {
//                    id: Object.keys(self.units).length,
//                    ownerId: ownerId,
//                    unitTypeId: unitTypeId,
//                    x: ko.observable(ownerId === 1 ? 1 : 4),
//                    y: ko.observable(squadNum),
//                    cHp: ko.observable(unitType.unit.hp),
//                    cCount: ko.observable(squadCount),
//                    cAction: ko.observable(unitType.weapons[0]),
//                    canMove: ko.observable(true),
//                    canAction: ko.observable(true)
//                };
//                self.units[squad.id] = squad;
//                
//                cCount -= squadCount;
//                squadNum++;
//            }
//        }
//    },
    
    onReady: function() {
        if (game.screen.height >= parseInt($('#map').css('height'))) {
            $('#map').css('top', (game.screen.height - parseInt($('#map').css('height'))) / 2);
        }
        if (game.screen.width >= parseInt($('#map').css('width'))) {
            $('#map').css('left', (game.screen.width - parseInt($('#map').css('width'))) / 2);
        }
        
        if (game.screen.width <= parseInt($('#map').css('width')) || game.screen.height <= parseInt($('#map').css('height'))) {
            $('#map').draggable({
                drag: function(event, ui) {
                    if (game.screen.height <= parseInt($('#map').css('height'))) {
                        if (ui.offset.top > 0) {
                            ui.position.top = 0;
                        }
                        if (ui.offset.top < -parseInt($('#map').css('height')) + game.screen.height) {
                            ui.position.top = -parseInt($('#map').css('height')) + game.screen.height;
                        }
                    }
                    else {
                        ui.position.top = (game.screen.height - parseInt($('#map').css('height'))) / 2;
                    }

                    if (game.screen.width <= parseInt($('#map').css('width'))) {
                        if (ui.offset.left > 0) {
                            ui.position.left = 0;
                        }
                        if (ui.offset.left < -parseInt($('#map').css('width')) + game.screen.width) {
                            ui.position.left = -parseInt($('#map').css('width')) + game.screen.width;
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
        if (targetElement.prop('tagName') == "IMG") {
            targetElement = targetElement.parent();
        }
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
                if (unitId) {
                    if (self.units[unitId].ownerId != 1) {
                        self.enemyMoveZone(game.components.hexGeom.getUnitMoveZone(self.units[unitId], self.units, self.map));
                        if (self.selectedUnit() != null && self.selectedUnit().canAction() && self.unitsToAction().indexOf(unitId) !== -1) {
                            self.actionAttackInfo(self.getChancesToAttack(self.selectedUnit(), self.units[unitId]));
                        }
                    }
                } else {
                    self.enemyMoveZone([]);
                }
            }
        }
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
                if (unit.ownerId == 1) {
                    self.selectedUnit(unit);
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
                            self.processActionToUnit(self.selectedUnit(), self.selectedAction(), unit);
                            self.unitsToAction([]);
                        }
                    }
                }
            } else {
                self.unselectUnit();
            }
        } else {
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
            if (self.units[unitId].x() === x && self.units[unitId].y() === y && self.units[unitId].cCount() > 0) {
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
            
    processActionToUnit: function(actionUnit, action, targetUnit) {
        var self = game.interfaces.battle;
        
        var damageToTarget = self.processDamageToUnit(actionUnit, action, targetUnit);
        self.template_showSquadDamage(targetUnit, damageToTarget.damage, damageToTarget.killed);
        
        var targetUnitActionUnits = self.getUnitsInActionRadius(targetUnit, targetUnit.cAction());
        for (var i = 0; i < targetUnitActionUnits.length; i++) {
            if (targetUnitActionUnits[i] == actionUnit.id) {
                var damageToActionUnit = self.processDamageToUnit(targetUnit, targetUnit.cAction(), actionUnit);
                self.template_showSquadDamage(actionUnit, damageToActionUnit.damage, damageToActionUnit.killed);
            }
        }
        
        actionUnit.canAction(false);
        actionUnit.cAction(action);
        
        self.isBattleEnd();
    },
    
    processDamageToUnit: function(actionUnit, action, targetUnit) {
        var self = game.interfaces.battle;
        
        var damage = 0;
        var killed = 0;
        
        var accuracy = self.getChanceToAttack(actionUnit, targetUnit);
        for (var i = 0; i < actionUnit.cCount(); i++) {
            var cAccuracy = Math.random() * 100;
            if (cAccuracy <= accuracy) {
                var cDamage = Math.round(Math.random() * (action.maxDamage - action.minDamage)) + action.minDamage;
                damage += cDamage;
            }
        }
        
        killed = Math.floor(damage / game.data.units[targetUnit.unitTypeId].unit.hp);
        targetUnit.cCount(targetUnit.cCount() - Math.floor(damage / game.data.units[targetUnit.unitTypeId].unit.hp));
        targetUnit.cHp(targetUnit.cHp() - damage % game.data.units[targetUnit.unitTypeId].unit.hp);
        if (targetUnit.cHp() <= 0) {
            killed++;
            targetUnit.cCount(targetUnit.cCount() - 1);
            targetUnit.cHp(game.data.units[targetUnit.unitTypeId].unit.hp - (-targetUnit.cHp()));
        }
        
        if (targetUnit.ownerId === 1 && targetUnit == self.selectedUnit() && targetUnit.cCount() <= 0) {
            self.unselectUnit();
        }
        
        for (var i = 0; i < killed; i++) {
            if (Math.random() * 100 >= 50) {
                targetUnit.lightWounded(targetUnit.lightWounded() + 1);
            }
        }
        
        return {
            damage: damage,
            killed: killed
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
                self.processActionToUnit(unit, target.action, target.target);
                units.splice(0, 1);
                self.processUnitInLists(units);
            });
        }
    },

    processEnemyTurn: function() {
        var self = game.interfaces.battle;
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
    
    getUnitSkillBonuses: function(unit, target, type, param) {
        var bonuses = {};
        for (var i = 0; i < game.data.units[unit.unitTypeId].skills.length; i++) {
            var skill = game.data.skills[game.data.units[unit.unitTypeId].skills[i]];
            if (skill.type == type) {
                if (skill.condition(unit, target)) {
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