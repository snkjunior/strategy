game.interfaces.battle = {
    template: "",
    
    // Map static info
    players: {},
    width: null,
    height: null,
    map: [],
    
    // Settings    
    isShowBorder: ko.observable(true),
    isShowCoordinates: ko.observable(true),
    
    //Dynamic data
    units: {},
    
    currentPlayerTurn: ko.observable(1),        
    isPlayerTurn: ko.observable(true),
    
    selectedUnit: ko.observable(null),
    selectedAction: ko.observable(null),
    
    mouseOverHex: ko.observable(null),
    
    moveZone: ko.observableArray([]),
    movePass: ko.observableArray([]),
    unitsToAction: ko.observableArray([]),
    
    enemyMoveZone: ko.observableArray([]),
    
    init: function(callback, params) {
        var self = game.interfaces.battle;
        params.width = 13;
        params.height = 7;

        var map = [];
        for (var y = 0; y < params.height; y++) {
            if (map[y] == null) {
                map[y] = [];
            }
            
            for (var x = 0; x < params.width; x++) {
                map[y][x] = {
                    x: x,
                    y: y,
                    cCoord: game.components.hexGeom.getHexCasterianCoord({x: x, y: y}),
                    terrain: 'grass',
                    object: (Math.round(Math.random() * 100) % 5 === 1 ? "forest" : null),
                };
            }
        }
        
        map[1][3].object = 'forest';
        map[3][2].object = 'forest';
        //map[2][2].object = 'forest';
        
        units = {
            1: {
                id: 1,
                ownerId: 1,
                unitTypeId: 'human_hunter',
                x: ko.observable(1),
                y: ko.observable(5),
                cHp: ko.observable(game.data.units['human_hunter'].unit.hp),
                cCount: ko.observable(game.data.units['human_hunter'].unitsInSquad),
                lastAction: ko.observable(game.data.units['human_hunter'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            2: {
                id: 2,
                ownerId: 2,
                unitTypeId: 'animal_wolf',
                x: ko.observable(3),
                y: ko.observable(1),
                cHp: ko.observable(game.data.units['animal_wolf'].unit.hp),
                cCount: ko.observable(game.data.units['animal_wolf'].unitsInSquad),
                lastAction: ko.observable(game.data.units['animal_wolf'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            3: {
                id: 3,
                ownerId: 2,
                unitTypeId: 'animal_wolf',
                x: ko.observable(4),
                y: ko.observable(3),
                cHp: ko.observable(game.data.units['animal_wolf'].unit.hp),
                cCount: ko.observable(game.data.units['animal_wolf'].unitsInSquad),
                lastAction: ko.observable(game.data.units['animal_wolf'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            4: {
                id: 4,
                ownerId: 1,
                unitTypeId: 'human_hunter',
                x: ko.observable(0),
                y: ko.observable(1),
                cHp: ko.observable(game.data.units['human_hunter'].unit.hp),
                cCount: ko.observable(game.data.units['human_hunter'].unitsInSquad),
                lastAction: ko.observable(game.data.units['human_hunter'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            5: {
                id: 5,
                ownerId: 1,
                unitTypeId: 'human_hunter',
                x: ko.observable(0),
                y: ko.observable(2),
                cHp: ko.observable(game.data.units['human_hunter'].unit.hp),
                cCount: ko.observable(game.data.units['human_hunter'].unitsInSquad),
                lastAction: ko.observable(game.data.units['human_hunter'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            6: {
                id: 6,
                ownerId: 2,
                unitTypeId: 'animal_wolf',
                x: ko.observable(7),
                y: ko.observable(2),
                cHp: ko.observable(game.data.units['animal_wolf'].unit.hp),
                cCount: ko.observable(game.data.units['animal_wolf'].unitsInSquad),
                lastAction: ko.observable(game.data.units['animal_wolf'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
            7: {
                id: 7,
                ownerId: 2,
                unitTypeId: 'animal_wolf',
                x: ko.observable(3),
                y: ko.observable(0),
                cHp: ko.observable(game.data.units['animal_wolf'].unit.hp),
                cCount: ko.observable(game.data.units['animal_wolf'].unitsInSquad),
                lastAction: ko.observable(game.data.units['animal_wolf'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            }, 
            8: {
                id: 8,
                ownerId: 1,
                unitTypeId: 'human_militiaman',
                x: ko.observable(1),
                y: ko.observable(2),
                cHp: ko.observable(game.data.units['human_militiaman'].unit.hp),
                cCount: ko.observable(game.data.units['human_militiaman'].unitsInSquad),
                lastAction: ko.observable(game.data.units['human_militiaman'].weapons[0]),
                canMove: ko.observable(true),
                canAction: ko.observable(true)
            },
        };
        
        self.units = units;
        
        self.width = params.width;
        self.height = params.height;
        self.map = map;
        
        self.players = {
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
        };
        
        callback();
    },
    
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
    },
    
    onMouseMove: function(e) {
        var self = game.interfaces.battle;
            
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
            self.mouseOverHex(minHex);
            if (minHex != null) {
                var unitId = self.getUnitIdInHex(minHex.x, minHex.y);
                if (unitId) {
                    if (self.units[unitId].ownerId != 1) {
                        self.enemyMoveZone(game.components.hexGeom.getUnitMoveZone(self.units[unitId], self.units, self.map));
                    }
                } else {
                    self.enemyMoveZone([]);
                }
            }
        }
    },
    
    clickOnHex: function() {
        var self = game.interfaces.battle;
        
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
                    self.selectedAction(unit.lastAction());
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
            if (self.moveZone().length && game.components.hexGeom.isHexInMoveZone(self.moveZone(), currentHex.x, currentHex.y)) {
                self.selectedUnit().x(currentHex.x);
                self.selectedUnit().y(currentHex.y);
                self.selectedUnit().canMove(false);
                if (self.selectedUnit().canAction()) {
                    self.unitsToAction(self.getUnitsInActionRadius(self.selectedUnit(), self.selectedAction()));
                }
                self.moveZone([]);
                self.movePass([]);
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
            
    processActionToUnit: function(actionUnit, action, targetUnit) {
        var self = game.interfaces.battle;
        
        var damageToTarget = self.processDamageToUnit(actionUnit, action, targetUnit);
        self.template_showSquadDamage(targetUnit, damageToTarget.damage, damageToTarget.killed);
        
        var targetUnitActionUnits = self.getUnitsInActionRadius(targetUnit, targetUnit.lastAction());
        for (var i = 0; i < targetUnitActionUnits.length; i++) {
            if (targetUnitActionUnits[i] == actionUnit.id) {
                var damageToActionUnit = self.processDamageToUnit(targetUnit, targetUnit.lastAction(), actionUnit);
                self.template_showSquadDamage(actionUnit, damageToActionUnit.damage, damageToActionUnit.killed);
            }
        }
        
        actionUnit.canAction(false);
        actionUnit.lastAction(action);
    },
    
    processDamageToUnit: function(actionUnit, action, targetUnit) {
        var self = game.interfaces.battle;
        
        var damage = 0;
        var killed = 0;
        var locationDefenceBonus = 0;
        if (self.map[targetUnit.y()][targetUnit.x()].object != null) {
            locationDefenceBonus = game.data.battle.objects[self.map[targetUnit.y()][targetUnit.x()].object].defenceBonus;
        }
        
        var accuracy = action.accuracy - locationDefenceBonus;
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
        if (targetUnit.cHp() < 0) {
            killed++;
            targetUnit.cCount(targetUnit.cCount() - 1);
            targetUnit.cHp(game.data.units[targetUnit.unitTypeId].unit.hp - (-targetUnit.cHp()));
        }
        
        if (targetUnit.ownerId === 1 && targetUnit == self.selectedUnit() && targetUnit.cCount() <= 0) {
            self.unselectUnit();
        }
        
        return {
            damage: damage,
            killed: killed
        };
    },

    processEnemyTurn: function() {
        var self = game.interfaces.battle;
        while (self.currentPlayerTurn() !== game.playerId) {
            self.updatePlayerUnitsActions(self.currentPlayerTurn());
//            for (var unitId in self.units) {
//                var unit = self.units[unitId]();
//                if (unit.ownerId === self.currentPlayerTurn()) {
//                    var locationsToMove = [];
//                    var unitMoveZone = game.components.hexGeom.getUnitMoveZone(unit, self);
//                    
//                    // Radius 1
//                    for (var i = 0; i < unitMoveZone.length; i++) {
//                        var hex = unitMoveZone[i];
//                        if (hex.distance === game.data.units[unit.unitTypeId].speed) {
//                            var neighborHexes = game.components.hexGeom.getNeighborHexes(hex.x, hex.y, self.map);
//                            for (var j = 0; j < neighborHexes.length; j++) {
//                                var unitIdInLocation = self.getUnitIdInHex(neighborHexes[j].x, neighborHexes[j].y);
//                                if (unitIdInLocation) {
//                                    if (self.units[unitIdInLocation]().ownerId !== self.currentPlayerTurn()) {
//                                        if (locationsToMove.indexOf(self.map[hex.y][hex.x]) === -1) {
//                                            locationsToMove.push(self.map[hex.y][hex.x]);
//                                        }
//                                        break;
//                                    }
//                                }
//                            }
//                        }
//                    }
//                    
//                    // If no enemies in move radius - set move vector to nearest enemies
//                    if (locationsToMove.length === 0) {
//                        
//                    }
//                    
//                    var locationToMove = locationsToMove[Math.floor(Math.random() * locationsToMove.length)];
//                    if (locationToMove) {
//                        unit.x = locationToMove.x;
//                        unit.y = locationToMove.y;
//                        self.units[unitId](unit);
//                    }
//                }
//            }
            self.currentPlayerTurn(self.players[self.currentPlayerTurn()].nextPlayerTurn);
        }
        self.updatePlayerUnitsActions(self.currentPlayerTurn());
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
    }
};