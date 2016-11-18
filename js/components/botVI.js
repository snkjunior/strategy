game.components.botVI = {
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
        return target;
    },
};


