var WinScreen = function () {
	//
};
WinScreen.prototype.create = function() {
	this.game.camera.reset();

	var loseText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2 + 16, 'font', 'Well done Lisa!\nYou got all the lip balm and escaped!\n\nYou are a spy enough!\n\n\n\n\n\nPress Space to go back to title.', 8);
	loseText.align = 'center';
	loseText.anchor.set(0.5, 0);


	var colonelPic = this.game.add.sprite(this.game.width / 2, 16, 'portraits', 0);
	colonelPic.anchor.x = 0.5;

	this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('TitleScreen');
	}, this);
};
