var WinScreen = function () {
	//
};
WinScreen.prototype.create = function() {
	this.game.camera.reset();

	var loseText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2 + 16, 'font', 'Well done Lisa!\nYou got all the lip balm and escaped!\n\nYou are a spy enough!\n\n\n\n\n\nPress Space to go back to title.', 8);
	loseText.align = 'center';
	loseText.anchor.set(0.5, 0);
	this.loseText = loseText;

	var colonelPic = this.game.add.sprite(this.game.width / 2, 16, 'portraits', 0);
	colonelPic.anchor.x = 0.5;

	this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('TitleScreen');
	}, this);

	this.game.input.gamepad.onDownCallback = function (buttonCode) {
    if (buttonCode === Phaser.Gamepad.XBOX360_START) {
      this.game.input.gamepad.onDownCallback = null;
      SoundBank['select'].play();
      this.game.state.start('TitleScreen');
    }
  };
};
WinScreen.prototype.update = function () {
  if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.game.input.gamepad.pad1.connected)
  {
      this.loseText.text = 'Well done Lisa!\nYou got all the lip balm and escaped!\n\nYou are a spy enough!\n\n\n\n\n\nPress Space or start\nto go back to title.';
  }
  else
  {
      this.loseText.text = 'Well done Lisa!\nYou got all the lip balm and escaped!\n\nYou are a spy enough!\n\n\n\n\n\nPress Space to go back to title.';
  }
};
