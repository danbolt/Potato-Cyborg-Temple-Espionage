var Directions = {
  EAST : 0,
  SOUTH : 1,
  WEST : 2,
  NORTH : 3,

  COUNT : 4,
};


var PlayerProgress = {
	LipBalmFound: [false, false, false],
	LipBalmCount: 0,

	MadeItPastTutorial: false
}

var ResetPlayerProgress = function () {
	PlayerProgress.LipBalmFound = [false, false, false];
	PlayerProgress.MadeItPastTutorial = false;
	PlayerProgress.LipBalmCount = 0;
	PlayerProgress.ShownFirstCutscene = false;
}

var Messages = {
	TestMessage: "hello world, this is not\nsnorlax!!!!!",
	Message1: "Lisa Blackout, I need new lip\nbalm! My face is parched!\nEnter the Potato Android temple\nand bring them all to the van!\n\nAre you spy a enough?     ",
	GetBalmMessages: ["Nice one! You got the first!\nTwo more left!!!",
										"That's two lip balms!\nOnly one more to go!",
										"You got all three!\nTime to get out of there!\n\nGet back to the van!!!" ],
};

var soundEffectsToLoad = ['alarm',
                          'bip',
                          'codec',
                          'exclaim',
                          'hurt',
                          'select',
                          'shoot1',
                          'shoot2',
                          'shoot3'];

var SoundBank = {};