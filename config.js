module.exports = {
  // print extra messages (eg. abort/explode rolls)
  debug: true,

  // time interval for the update loop, in ms.
  // stays a scalar because we use this directly in setInterval.
  updateInterval: 100,

  // launch countdown in milliseconds.
  countdownLength: 1000,

  // whether to prompt for configuration on the first mission.
  // if false it will be forced to run with defaults.
  configureFirstMission: true,

  // skips the pre-mission prompt sequence.
  // should have no effect on the simulation or outcome.
  disableStartSequence: true,

  // prevent random explosions and aborts when true.
  disableRngEvents: false,

  // hides the fuel section of the mission summary when fuel remaining is 0
  // (because at that point none of the values change).
  // mostly meant for testing the cursor reset callback stuff.
  hideFuelStats: true
}
