module.exports = {
  // print extra messages (eg. abort/explode rolls)
  debug: false,
  
  // time interval for the update loop, in ms.
  // stays a scalar because we use this directly in setInterval.
  updateInterval: 100,
  
  // launch countdown in milliseconds.
  countdownLength: 1000,

  // whether to prompt for configuration on the first mission.
  // if false it will be forced to run with defaults.
  configureFirstMission: false,

  // skips the pre-mission prompt sequence.
  // should have no effect on the simulation or outcome.
  disableStartSequence: true,

  // prevent random explosions and aborts when true.
  disableRngEvents: true
}
