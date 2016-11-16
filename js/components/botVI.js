game.components.botVI = {
    getUnitAttackTargets: function(unit, units, hexMap) {
        var targets = [];
        var attackZone = game.components.hexGeom.getUnitFullAttackZone(unit, game.data.units[unit.unitTypeId].weapons[0], units, hexMap);
        var enemies = game.components.hexGeom.getEnemyUnitsInHexZone(attackZone, units, unit.ownerId);
        
        var moveZone = game.components.hexGeom.getUnitMoveZone(unit, units, hexMap);
        for (var i = 0; i < moveZone.length; i++) {
            moveZone[i] = hexMap[moveZone[i].y][moveZone[i].x];
        }
        
        for (var i = 0; i < enemies.length; i++) {
            var targetAttackHexes = [];
            var hexesInRadius = game.components.hexGeom.getHexesInRadius(enemies[i].x(), enemies[i].y(), game.data.units[unit.unitTypeId].weapons[0].maxDistance, hexMap);
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
    }
};


