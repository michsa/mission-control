const random = require('random')
const { disableRngEvents } = require('./config')

// rolls two random numbers: the first to determine whether the event happens
// according to the given odds, and the second to determine when it happens
// (eg, at what point during the launch counter we should abort). if the result
// is falsy it means no event; otherwise it's a float between 0 and 1.
const rollRandomEvent = odds =>
  !disableRngEvents && random.float() < odds && random.float()

module.exports = { rollRandomEvent }
