var GoalObject = function (game, x, y, index) {
  Phaser.Sprite.call(this, game, x + 8, y + 8, 'sprite_sheet_16x16', 0);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);
};
GoalObject.prototype = Object.create(Phaser.Sprite.prototype);
GoalObject.prototype.constructor = GoalObject;

var Gameplay = function () {
  this.player = null;
  this.guards = null;
  this.bulletPool = null;
  this.goalObjectPool = null;
  this.particles = null;
  this.ui = null;

  this.isScrolling = false;

  this.evading = false;

  this.map = null;
  this.foreground = null;
  this.background = null;
};
Gameplay.prototype.init = function() {
  //
};
Gameplay.prototype.preload = function() {
  //
};
Gameplay.prototype.create = function() {
  // closure context
  var that = this;

  // stealth game logic
  this.evading = false;
  this.isEvading = function () { return that.evading; };
  this.sightedPlayer = function (guard) {
    that.playerSighted(guard);
  };

  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('sheet', 'test16x16_tile');
  this.background = this.map.createLayer('Background');
  this.foreground = this.map.createLayer('Foreground');
  this.map.setCollisionByExclusion([0], true, this.foreground);

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.ui = this.game.add.group();
  this.ui.sneakBacking = this.ui.addChild(this.game.add.sprite(28, 28, 'sprite_sheet_128x16', 12));
  this.ui.sneakLabel = this.ui.addChild(this.game.add.bitmapText(32, 32, 'font', 'test', 8));
  this.ui.fixedToCamera = true;
  this.playerSnuckAway();
  this.game.time.events.loop(500, function () {
    if (this.isEvading()) {
      this.ui.sneakBacking.renderable = !this.ui.sneakBacking.renderable;
    } else {
      this.ui.sneakBacking.renderable = true;
    }
  }, this);

  // cutscene data
  this.ui.cutscene = this.ui.addChild(this.game.add.group());
  var cutsceneBacking = this.game.add.sprite(0, 0, 'test16x16', 1);
  cutsceneBacking.width = this.game.width;
  cutsceneBacking.height = this.game.height;
  this.ui.cutscene.addChild(cutsceneBacking);
  var colonelPortrait = this.game.add.sprite(this.game.width / 6 * 1.25, 128, 'portraits', 0);
  colonelPortrait.anchor.set(0.5, 1);
  var lisaPortrait = this.game.add.sprite(this.game.width / 6 * 4.75, 128, 'portraits', 1);
  lisaPortrait.anchor.set(0.5, 1);
  this.ui.cutscene.addChild(colonelPortrait);
  this.ui.cutscene.addChild(lisaPortrait);
  var radioLabel = this.game.add.bitmapText(this.game.width / 2, 64, 'font', 'radio\n\n109.39hz', 8);
  radioLabel.align = 'center';
  radioLabel.anchor.x = 0.5;
  this.ui.cutscene.add(radioLabel);
  var messageText = this.game.add.bitmapText(48, 164, 'font', 'the quick brown fox gets lazy\nand snorlax reigns supreme', 8);
  this.ui.cutscene.add(messageText);
  this.ui.cutscene.visible = false;

  this.showCutscene = function (dialogue) {
    if (this.ui.cutscene.visible === true) { return; }

    this.ui.cutscene.visible = true;
    this.player.disableMovement = true;

    messageText.text = '';

    var counter = 0;
    var messageLoop = this.game.time.events.loop(100, function () {
      counter++;

      messageText.text = dialogue.substring(0, counter);

      if (counter === dialogue.length) {
        this.game.time.events.remove(messageLoop);

        this.game.time.events.add(750, function () {
          this.ui.cutscene.visible = false;
          this.player.disableMovement = false;
        }, this);
      }
    }, this);
  };

  this.game.time.events.add(1000, function () { this.showCutscene(Messages.TestMessage);  }, this);

  this.player = new Player(this.game, 30 * 16, 144 * 16);
  this.game.add.existing(this.player);
  this.player.events.onKilled.add(function () {
    for (var i = 0; i < 10; i++) {
      var newParticle = this.particles.getFirstDead();
      if (newParticle !== null) {
        newParticle.revive();
        newParticle.body.velocity.set(Math.cos(Math.PI * 2 * (i / 10)) * 150, Math.sin(Math.PI * 2 * (i / 10)) * 150);
        newParticle.x = this.player.x;
        newParticle.y = this.player.y;
        newParticle.lifespan = 3000;
        newParticle.animations.play('player_gib');
      }
    }
  }, this);

  this.goalObjectPool = this.game.add.group();
  for (var i = 0; i < 3; i++) {
    var newGoal = new GoalObject(this.game, -1000, -1000);
    this.goalObjectPool.addChild(newGoal);
    this.goalObjectPool.addToHash(newGoal);
    newGoal.kill();
  }

  this.bulletPool = this.game.add.group();
  for (var i = 0; i < 20; i++) {
    var newBullet = new EnemyBullet(this.game, -1000, -1000, 0, this.foreground);
    this.bulletPool.addChild(newBullet);
    this.bulletPool.addToHash(newBullet);
    newBullet.kill();
  }

  this.guards = this.game.add.group();
  for (var i = 0; i < 10; i++) {
    var newGuard = new EnemyGuard(this.game, -999, -999, this.player, this.foreground, this.isEvading, this.sightedPlayer, this.bulletPool);
    this.game.add.existing(newGuard);
    this.guards.addChild(newGuard);
    newGuard.kill();
  }
  this.spawnGuardsForRoom();

  this.particles = this.game.add.group();
  for (var i = 0; i < 50; i++) {
    var particle = this.game.add.sprite(-2000, -2000, 'sprite_sheet_16x16', 0);
    this.game.physics.enable(particle, Phaser.Physics.ARCADE);
    particle.anchor.set(0.5, 0.5);

    // create particle animations
    particle.animations.add('shot_flicker', [84, 85], 16, true);
    particle.animations.add('sight', [90, 91], 16, true);
    particle.animations.add('player_gib', [92, 93], 16, true);

    this.particles.addChild(particle);

    particle.kill();
  }
  this.guards.forEach(function (g) { g.particles = this.particles; }, this);

  // setup camera scrolling
  this.isScrolling = false;
  this.camera.roundPx = true;
  this.camera.bounds = null;
  this.camera.x = 20 * 16;
  this.camera.y = 135 * 16;

  // HACK
  player = this.player;

  if (PlayerProgress.MadeItPastTutorial === true) {
    this.camera.x = 80 * 16;
    this.camera.y = 90 * 16;

    this.player.x = 88 * 16;
    this.player.y = 99 * 16;
  }

  this.game.world.bringToTop(this.ui);
};
Gameplay.prototype.playerSighted = function (guard) {
  this.evading = true;
  this.ui.sneakLabel.text = 'watch out!';
  this.ui.sneakBacking.frame = 13;

  var newParticle = this.particles.getFirstDead();
  if (newParticle !== null) {
    newParticle.revive();
    newParticle.body.velocity.set(0, 0);
    newParticle.x = guard.x + 16;
    newParticle.y = guard.y - 32;
    newParticle.lifespan = 1000;
    newParticle.animations.play('sight');
  }

  this.guards.forEachAlive(function (g) {
    g.body.velocity.set(0, 0);
    g.startShooting();
  }, this);
};
Gameplay.prototype.playerSnuckAway = function () {
  this.evading = false;
  this.ui.sneakLabel.text = 'sneaking!';
  this.ui.sneakBacking.frame = 12;
};
Gameplay.prototype.spawnGuardsForRoom = function () {
  // if there is a guard in the bounds of the camera, spawn it in the room
  this.map.objects.Guards.forEach(function (guardData) {
    if (!(guardData.x > (this.camera.x + this.camera.width) ||
          guardData.x < (this.camera.x) ||
          guardData.y > (this.camera.y + this.camera.height) ||
          guardData.y < (this.camera.y))) {
      var newGuard = this.guards.getFirstDead();
      if (newGuard !== null) {
        newGuard.revive();

        newGuard.x = guardData.x + 8;
        newGuard.y = guardData.y + 8;
        newGuard.directionFacing = guardData.properties.direction;
        if (guardData.properties.patrol) {
          var patrolData = JSON.parse(guardData.properties.patrol);
          newGuard.patrolRoute = [];
          patrolData.forEach(function (patrolNode) {
            var matchingNode = this.map.objects.PatrolNodes.find(function (node) { return (node.name === patrolNode); }, this);
            newGuard.patrolRoute.push(matchingNode);
          }, this);
        }
      }
    }
  }, this);
};
Gameplay.prototype.spawnObjectsForRoom = function () {
  // if there is a object in the bounds of the camera, spawn it in the room
  this.map.objects.GameplayObjects.forEach(function (objectData) {
    if (!(objectData.x > (this.camera.x + this.camera.width) ||
          objectData.x < (this.camera.x) ||
          objectData.y > (this.camera.y + this.camera.height) ||
          objectData.y < (this.camera.y))) {
      
      if (objectData.name === "Goal") {
        var newGoal = this.goalObjectPool.getFirstDead();
        newGoal.revive();
        newGoal.position.set(objectData.x, objectData.y);
        newGoal.frame = 86 + objectData.properties.index;
        newGoal.index = objectData.properties.index;
        if (PlayerProgress.LipBalmFound[newGoal.index] ) {
          newGoal.kill();
        }
      }
    }
  }, this);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.player, this.foreground);

  this.game.physics.arcade.overlap(this.player, this.bulletPool, function (player, bullet) {
    player.kill();
    bullet.kill();

    this.game.time.events.add(2000, function () {
      this.game.state.start('LoseScreen');
    }, this);
  }, undefined, this);
  this.game.physics.arcade.overlap(this.player, this.goalObjectPool, function (player, goal) {
    goal.kill();
    PlayerProgress.LipBalmFound[goal.index] = true;

    //this.game.state.start('WinScreen');
  }, undefined, this);
  this.game.physics.arcade.collide(this.foreground, this.bulletPool, function (bullet, foreground) {
    bullet.kill();
  }, undefined, this);

  if (this.isScrolling === false) {
    if (this.player.x > (this.camera.x + this.camera.width) ||
        this.player.x < (this.camera.x) ||
        this.player.y > (this.camera.y + this.camera.height) ||
        this.player.y < (this.camera.y)) {
      
        this.isScrolling = true;
        this.player.disableMovement = true;

        this.playerSnuckAway();
        this.guards.forEachAlive(function (guard) {
          guard.x = -1000;
          guard.y = -1000;
          guard.stopShooting();
          guard.kill();
          this.guards.sendToBack(guard);
        }, this);
        this.goalObjectPool.forEachAlive(function (goal) {
          goal.kill();
        }, this);

        var cameraShuffle = this.game.add.tween(this.camera);
        var targetX = (~~(this.player.x / this.camera.width)) * this.camera.width;
        var targetY = (~~(this.player.y / this.camera.height)) * this.camera.height;
        cameraShuffle.to( { x:  targetX, y: targetY }, 500 );
        cameraShuffle.onComplete.add(function () {
          this.isScrolling = false;
          this.player.disableMovement = false;

          this.spawnGuardsForRoom();
          this.spawnObjectsForRoom();

          if (this.player.y < 107 * 16) {
            PlayerProgress.MadeItPastTutorial = true;
          }

        }, this);
        cameraShuffle.start();
    }
  }
};
/*
Gameplay.prototype.render = function () {
  this.guards.forEachAlive(function (guard) {
    var guardAngleA = ((guard.directionFacing / Directions.COUNT * Math.PI * 2 + (guard.sightWidth / 2)) + Math.PI * 2) % (Math.PI * 2);
    var guardAngleB = ((guard.directionFacing / Directions.COUNT * Math.PI * 2 - (guard.sightWidth / 2)) + Math.PI * 2) % (Math.PI * 2);
    var playerAngle = Math.atan2( this.player.y - guard.position.y, this.player.x - guard.position.x );

    this.game.debug.geom(new Phaser.Circle(guard.x, guard.y, guard.sightRange * 2), 'white', false);
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(guardAngleA) * guard.sightRange), guard.y + (Math.sin(guardAngleA) * guard.sightRange)), 'red');
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(guardAngleB) * guard.sightRange), guard.y + (Math.sin(guardAngleB) * guard.sightRange)), 'red');
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(playerAngle) * guard.sightRange), guard.y + (Math.sin(playerAngle) * guard.sightRange)), 'blue');
  }, this);
  
  this.game.debug.body(this.player);
};
*/
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.guards = [];
  this.bulletPool = null;
  this.goalObjectPool = null;
  this.particles = null;
  this.ui = null;

  this.map = null;
  this.foreground = null;
  this.background = null;
};