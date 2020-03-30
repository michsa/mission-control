const Qty = require('js-quantities')
const rls = require('readline-sync')

/* Returns a settings object that is used to configure the mission parameters
for the next mission. Also contains defaults for those. */

const defaultSettings = {
  distance: new Qty(160, 'km'),
  // NOTE: The readme says this 50,000 kg payload includes the fuel, but that's
  // likely an error - one liter of rocket fuel (or water) weighs roughly 1 kg,
  // so our total payload including fuel would exceed 1 million kilograms!
  // That actually sounds more realistic for a rocket, so I'm going to assume
  // that the fuel is *NOT* included and that this value is the actual payload.
  payload: new Qty(50000, 'kg'),
  _fuel: new Qty(151410, 'l'),
  get fuel() {
    return this._fuel
  },
  set fuel(x) {
    if (x.scalar < 0) x.scalar = 0
    this._fuel = x
  },
  fuelDensity: new Qty(0.9, 'g/ml'), // https://en.wikipedia.org/wiki/RP-1
  burnRate: new Qty(16824, 'l/s'),
  // Specific impulse is a measure of the efficiency of a rocket and allows us
  // to calculate thrust from the burn rate (as mass flow rate) of our fuel.
  // https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_in_seconds
  impulse: new Qty(250, 's'),
}

const promptForSettings = previousSettings => {
  if (rls.keyInYN('Configure mission parameters?'))
    console.log('Not available yet, come back later')
  return previousSettings
}

module.exports = settings => {
  return settings ? promptForSettings(settings) : defaultSettings
}
