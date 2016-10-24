var LoseScreen = function () {
	//
};
LoseScreen.prototype.create = function() {
	this.game.camera.reset();

	var loseText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2, 'font', 'Lisa! You died!\n\n\nWant to give it another go?\n\n\nPress space to retry.\n\nPress Backspace to return to title.', 8);
	loseText.align = 'center';
	loseText.anchor.set(0.5, 0.5);
	this.loseText = loseText;

	this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('Gameplay');
	}, this);

	this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('TitleScreen');
	}, this);

	this.game.input.gamepad.onDownCallback = function (buttonCode) {
    if (buttonCode === Phaser.Gamepad.XBOX360_START) {
      this.game.input.gamepad.onDownCallback = null;
      SoundBank['select'].play();
      this.game.state.start('Gameplay');
    } else if (buttonCode === Phaser.Gamepad.XBOX360_BACK) {
      this.game.input.gamepad.onDownCallback = null;
      SoundBank['select'].play();
      this.game.state.start('TitleScreen');
    }
  };
};
LoseScreen.prototype.update = function () {
  if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.game.input.gamepad.pad1.connected)
  {
      this.loseText.text = 'Lisa! You died!\n\n\nWant to give it another go?\n\n\nPress space or start to retry.\n\nPress Backspace or back\nto return to title.';
  }
  else
  {
      this.loseText.text = 'Lisa! You died!\n\n\nWant to give it another go?\n\n\nPress space to retry.\n\nPress Backspace to return to title.';
  }
};

var TitleScreen = function () {
	//
};
TitleScreen.prototype.create = function() {
	this.game.camera.reset();

	var logo = this.game.add.sprite(this.game.width / 2, this.game.height / 4 + 16, 'logo');
	logo.anchor.set(0.5, 0.5);

	var instructions = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2 + 32, 'font', 'arrow keys to move\n\npress space to start', 8);
	instructions.align = 'center';
	instructions.anchor.x = 0.5;
	this.instructions = instructions;

	var gamepadText = this.game.add.bitmapText(this.game.width - 8, this.game.height - 8, 'font', 'Gamepad is not detected', 8);
  gamepadText.anchor.setTo(1);
  gamepadText.align = 'right';
  this.gamepadText = gamepadText;

	var authorNote = this.game.add.bitmapText(0, this.game.height - 24, 'font', '(c)2016\ndaniel savage\nskybox labs inc', 8);

	this.game.input.gamepad.onDownCallback = function (buttonCode) {
      if (buttonCode === Phaser.Gamepad.XBOX360_START) {
        this.game.input.gamepad.onDownCallback = null;

        SoundBank['select'].play();
				ResetPlayerProgress();

        this.game.state.start('Gameplay');
      }
    };

	var spaceKey = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
	spaceKey.onUp.add(function () {
		SoundBank['select'].play();

		ResetPlayerProgress();

		this.game.state.start('Gameplay');
	}, this);
};
TitleScreen.prototype.update = function () {
  if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.game.input.gamepad.pad1.connected)
  {
      this.gamepadText.text = 'Gamepad is detected!\nPress start!';
      this.instructions.text = 'arrow keys to move\n\npress space or start button';
  }
  else
  {
      this.gamepadText.text = 'Gamepad is not detected';
      this.instructions.text = 'arrow keys to move\n\npress space to start';
  }
};