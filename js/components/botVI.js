game.components.botVI = {
    getUnitMoveHexToNearestEnemy: function(unit, units, hexMap) {
        var nearestEnemeyHex = this.getPassToNearestEnemy(unit, units, hexMap);
        var moveZoneHexes = game.components.hexGeom.moveZoneHexesToMapHexes(game.components.hexGeom.getUnitMoveZone(unit, units, hexMap), hexMap);
        
        while(nearestEnemeyHex.prevHex != null) {
            if (moveZoneHexes.indexOf(hexMap[nearestEnemeyHex.prevHex.y][nearestEnemeyHex.prevHex.x]) === -1) {
                nearestEnemeyHex = nearestEnemeyHex.prevHex;
            }
            else {
                return nearestEnemeyHex.prevHex;
            }
        }
        
        return null;
    }, 
    
    getPassToNearestEnemy: function(unit, units, hexMap) {
        var checkedHexes = {};
        var hexesToCheck = {};
        hexesToCheck[unit.x() + 'x' + unit.y()] = {
            x: unit.x(),
            y: unit.y(),
            distance: 0,
            prevHex: null,
            isNearEnemy: false
        };
        
        var addToRecheckList = function(list, hex, distance, prevHex) {
             if (list[hex[i].x + 'x' + hex[i].y] == null) {
                list[hex[i].x + 'x' + hex[i].y] = {
                    x: hex[i].x,
                    y: hex[i].y,
                    distance: distance,
                    prevHex: prevHex,
                    isNearEnemy: false
                };
            }
            else {
                if (list[hex[i].x + 'x' + hex[i].y].distance > distance) {
                    list[hex[i].x + 'x' + hex[i].y].distance = distance;
                    list[hex[i].x + 'x' + hex[i].y].prevHex = prevHex;
                }
            }
            return list;
        };
        
        var isEnemyFound = false;
        var enemiesHexes = [];
        while (!isEnemyFound) {
            var recheckHexesList = {};
            for (var hexId in hexesToCheck) {
                var currentHex = hexesToCheck[hexId];
                var neighborHexes = game.components.hexGeom.getNeighborHexes(currentHex.x, currentHex.y, hexMap);
                
                for (var i = 0; i < neighborHexes.length; i++) {
                    var unitId = game.interfaces.battle.getUnitIdInHex(neighborHexes[i].x, neighborHexes[i].y);
                    if (unitId !== null && units[unitId].ownerId !== unit.ownerId) {
                        if (currentHex.x != unit.x() || currentHex.y != unit.y()) {
                            currentHex.isNearEnemy = true;
                            isEnemyFound = true;
                            if (enemiesHexes.indexOf(currentHex) === -1) {
                                enemiesHexes.push(currentHex);
                            }
                        }
                    }
                }
                
                for (var i = 0; i < neighborHexes.length; i++) {
                    var distanceToNeighborHex = currentHex.distance + game.data.battle.terrains[neighborHexes[i].terrain].moves * (neighborHexes[i].object != null ? game.data.battle.objects[neighborHexes[i].object].moveMod : 1);
                    if (game.interfaces.battle.getUnitIdInHex(neighborHexes[i].x, neighborHexes[i].y) === null) {
                        if (checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y] != null) {
                            if (checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y].distance > distanceToNeighborHex && !checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y].isNearEnemy) {
                                addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                                delete checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y];
                            }
                        }
                        else {
                            if (hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y] != null) {
                                if (hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y].distance > distanceToNeighborHex && !hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y].isNearEnemy) {
                                    addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                                    delete hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y];
                                }
                            }
                            else {
                                addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                            }
                        }
                    }
                }
                checkedHexes[currentHex.x + 'x' + currentHex.y] = currentHex;
                delete hexesToCheck[currentHex.x + 'x' + currentHex.y];
            }
            hexesToCheck = recheckHexesList;
        }
        
        var minHex = enemiesHexes[0];
        for (var i = 0; i < enemiesHexes.length; i++) {
            if (enemiesHexes[i].distance < minHex.distance) {
                minHex = enemiesHexes[i];
            }
            if (enemiesHexes[i].distance === minHex.distance && Math.floor(Math.random() * 2) === 1) {
                 minHex = enemiesHexes[i];
            }
        }
        
        return minHex;
    },
    
    getUnitActionAttackTargets: function(unit, action, units, hexMap) {
        var targets = [];
        var attackZone = game.components.hexGeom.getUnitFullAttackZone(unit, action, units, hexMap);
        var enemies = game.components.hexGeom.getEnemyUnitsInHexZone(attackZone, units, unit.ownerId);
        
        var moveZone = game.components.hexGeom.getUnitMoveZone(unit, units, hexMap);
        for (var i = 0; i < moveZone.length; i++) {
            moveZone[i] = hexMap[moveZone[i].y][moveZone[i].x];
        }
        
        for (var i = 0; i < enemies.length; i++) {
            var targetAttackHexes = [];
            var hexesInRadius = game.components.hexGeom.getHexesInRadius(enemies[i].x(), enemies[i].y(), action.maxDistance, hexMap);
            for (var j = 0; j < hexesInRadius.length; j++) {
                if (moveZone.indexOf(hexesInRadius[j]) !== -1) {
                    targetAttackHexes.push(hexesInRadius[j]);
                }
            }
            targets.push({
                unit: enemies[i],
                hexesToAttack: targetAttackHexes
            });
        }
        
        return targets;
    },
    
    getUnitAttackTargets: function(unit, units, hexMap) {
        var targets = [];
        for (var i = 0; i < game.data.units[unit.unitTypeId].weapons.length; i++) {
            var action = game.data.units[unit.unitTypeId].weapons[i];
            var actionTargers = this.getUnitActionAttackTargets(unit, action, units, hexMap);
            targets.push({
                action: action,
                targets: actionTargers
            });
        }
        return targets;
    },
    
    getTargetToAttack: function(unit, units, hexMap) {
        var actionsTargets = this.getUnitAttackTargets(unit, units, hexMap);
        var targetsPriority = [];
        for (var i = 0; i < actionsTargets.length; i++) {
            var action = actionsTargets[i].action;
            var targets = actionsTargets[i].targets;
            for (var j = 0; j < targets.length; j++) {
                var target = targets[j];
                var averageDmgToTarget = game.interfaces.battle.getActionDamageToTargetFinal(unit, target.unit, true, false);
                var targetActionHexes = game.components.hexGeom.getHexesBetweenRadiuses(target.unit.x(), target.unit.y(), target.unit.cAction().minDistance, target.unit.cAction().maxDistance, hexMap);
                for (var k = 0; k < target.hexesToAttack.length; k++) {
                    var averageDmgToUnit = 0;
                    var hex = target.hexesToAttack[k];
                    if (targetActionHexes.indexOf(hex) !== -1) {
                        averageDmgToUnit = game.interfaces.battle.getActionDamageToTargetFinal(unit, target.unit, true, true);
                    }
                    targetsPriority.push({
                        target: target.unit,
                        action: action,
                        hexToMove: hex,
                        avgDmgToUnit: averageDmgToUnit,
                        avgDmgToTarget: averageDmgToTarget
                    });
                }
            }
        }
		
		if (targetsPriority.length == 0) {
			return null;
		}
		
		var target = targetsPriority[0];
        for (var i = 1; i < targetsPriority.length; i++) {
            if (target.avgDmgToTarget - target.avgDmgToUnit < targetsPriority[i].avgDmgToTarget - targetsPriority[i].avgDmgToUnit) {
                target = targetsPriority[i];
            }
            
            if (target.avgDmgToTarget - target.avgDmgToUnit === targetsPriority[i].avgDmgToTarget - targetsPriority[i].avgDmgToUnit) {
                var tDefenceBonus = 0;
                if (target.hexToMove.object != null) {
                    tDefenceBonus = game.data.battle.objects[target.hexToMove.object].defenceBonus;
                }
                
                var checkedTDefenceBonus = 0;
                if (targetsPriority[i].hexToMove.object != null) {
                    checkedTDefenceBonus = game.data.battle.objects[targetsPriority[i].hexToMove.object].defenceBonus;
                }
                
                if (checkedTDefenceBonus > tDefenceBonus) {
                    target = targetsPriority[i];
                }
                
                if (checkedTDefenceBonus === tDefenceBonus) {
                    if (Math.floor(Math.random() * 2) == 1) {
                        target = targetsPriority[i];
                    }
                }
            }
        }
        
		var moveZone = game.components.hexGeom.getUnitMoveZone(unit, units, hexMap);
        for (var i = 0; i < moveZone.length; i++) {
            if (moveZone[i].x === target.hexToMove.x && moveZone[i].y === target.hexToMove.y) {
                target.hexToMove = moveZone[i];
            }
        }
        
        return target;
    },
    
    getTargetToAttack_v1: function(unit, units, hexMap) {
        var actionsTargets = this.getUnitAttackTargets(unit, units, hexMap);
        var targetsPriority = [];
        for (var i = 0; i < actionsTargets.length; i++) {
            var action = actionsTargets[i].action;
            var targets = actionsTargets[i].targets;
            for (var j = 0; j < targets.length; j++) {
                var target = targets[j];
                var targetLocationDefenceBonus = 0;
                if (hexMap[target.unit.y()][target.unit.x()].object !== null) {
                    targetLocationDefenceBonus = game.data.battle.objects[hexMap[target.unit.y()][target.unit.x()].object].defenceBonus;
                }
                var averageDmgToTarget = (action.minDamage + action.maxDamage) / 2 * unit.cCount() * (action.accuracy - targetLocationDefenceBonus) / 100;
                var targetActionHexes = game.components.hexGeom.getHexesBetweenRadiuses(target.unit.x(), target.unit.y(), target.unit.cAction().minDistance, target.unit.cAction().maxDistance, hexMap);
                for (var k = 0; k < target.hexesToAttack.length; k++) {
                    var averageDmgToUnit = 0;
                    var hex = target.hexesToAttack[k];
                    if (targetActionHexes.indexOf(hex) !== -1) {
                        var unitLocationDefenceBonus = 0;
                        if (hexMap[hex.y][hex.x].object !== null) {
                            unitLocationDefenceBonus = game.data.battle.objects[hexMap[hex.y][hex.x].object].defenceBonus;
                        }
                        averageDmgToUnit = (target.unit.cAction().minDamage + target.unit.cAction().maxDamage) / 2 * target.unit.cCount() * (target.unit.cAction().accuracy - unitLocationDefenceBonus) / 100;
                    }
                    targetsPriority.push({
                        target: target.unit,
                        action: action,
                        hexToMove: hex,
                        avgDmgToUnit: averageDmgToUnit,
                        avgDmgToTarget: averageDmgToTarget
                    });
                }
            }
        }
        
        var target = targetsPriority[0] != null ? targetsPriority[0] : null;
        for (var i = 1; i < targetsPriority.length; i++) {
            if (target.avgDmgToTarget - target.avgDmgToUnit < targetsPriority[i].avgDmgToTarget - targetsPriority[i].avgDmgToUnit) {
                target = targetsPriority[i];
            }
            
            if (target.avgDmgToTarget - target.avgDmgToUnit === targetsPriority[i].avgDmgToTarget - targetsPriority[i].avgDmgToUnit) {
                var tDefenceBonus = 0;
                if (target.hexToMove.object != null) {
                    tDefenceBonus = game.data.battle.objects[target.hexToMove.object].defenceBonus;
                }
                
                var checkedTDefenceBonus = 0;
                if (targetsPriority[i].hexToMove.object != null) {
                    checkedTDefenceBonus = game.data.battle.objects[targetsPriority[i].hexToMove.object].defenceBonus;
                }
                
                if (checkedTDefenceBonus > tDefenceBonus) {
                    target = targetsPriority[i];
                }
                
                if (checkedTDefenceBonus === tDefenceBonus) {
                    if (Math.floor(Math.random() * 2) == 1) {
                        target = targetsPriority[i];
                    }
                }
            }
        }
        
        var moveZone = game.components.hexGeom.getUnitMoveZone(unit, units, hexMap);
        for (var i = 0; i < moveZone.length; i++) {
            if (moveZone[i].x === target.hexToMove.x && moveZone[i].y === target.hexToMove.y) {
                target.hexToMove = moveZone[i];
            }
        }
        
        return target;
    }
};


