module.exports = {
  // time interval for the update loop, in ms.
  // stays a scalar because we use this directly in setInterval.
  updateInterval: 100,

   // seed for the RNG, randomized by default
   seed: Math.floor(Math.random() * 100000),

   configureFirstTime: true,
}
