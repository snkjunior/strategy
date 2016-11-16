game.components.botVI = {
    processUnit: function(unit, units, hexMap) {
        var targets = this.getUnitAttackTargets(unit, units, hexMap);
        var target = this.getTargetToAttack(unit, targets);
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
                target: enemies[i],
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
    
    getTargetToAttack: function(unit, targets) {
        console.log(targets);
    }
};


