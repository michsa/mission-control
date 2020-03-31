const Qty = require('js-quantities')
const rls = require('readline-sync')
const _ = require('lodash/fp')
const { missionPlan } = require('./messages')
const { configureFirstTime } = require('./config')

// Exports a function that optionally takes a settings object (see defaultSettings)
// with the settings from the last-run mission, and returns a new settings object.
// All the prompts and so on for configuring mission settings are handled in here.

const defaultSettings = {
  distance: new Qty(160, 'km'),
  // NOTE: The readme says this 50,000 kg payload includes the fuel, but that's
  // likely an error - one liter of rocket fuel (or water) weighs roughly 1 kg,
  // so our total payload including fuel would exceed 1 million kilograms!
  // That actually sounds more realistic for a rocket, so I'm going to assume
  // that the fuel is *NOT* included and that this value is the empty payload.
  payload: new Qty(50000, 'kg'),
  fuel: new Qty(151410, 'l'),
  fuelDensity: new Qty(0.9, 'g/ml'), // https://en.wikipedia.org/wiki/RP-1
  targetBurnRate: new Qty(16824, 'l/s'),
  // Specific impulse is a measure of the efficiency of a rocket and allows us
  // to calculate thrust from the burn rate (as mass flow rate) of our fuel.
  // https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_in_seconds
  impulse: new Qty(250, 's')
}

const parseQty = (input, origValue) => {
  if (!Qty.parse(input)) {
    console.log('Input invalid!')
    return null
  }
  let value = new Qty(input)
  if (!value.isCompatible(origValue)) {
    if (value.units()) {
      console.log('Units incompatible!')
      return null
    } else value = new Qty(value.scalar, origValue.units())
  }
  return value
}

const promptForSettings = settings => {
  console.log(`
Please enter new mission parameters.
Leave input blank to reuse the value
in parens. You can specify new units
with your input, or omit them to use
the units shown. New units should be
compatible with current units.
`)
  const updatePrompt = (message, key, format = parseQty) => {
    let origValue = new Qty(settings[key])
    do {
      let input = rls.question(`${message} (${origValue}) `, {
        defaultInput: origValue
      })
      settings[key] = format(input, origValue)
    } while (!settings[key])
  }

  updatePrompt('  Target dist. :', 'distance')
  updatePrompt('       Payload :', 'payload')
  updatePrompt(' Fuel capacity :', 'fuel')
  updatePrompt('  Fuel density :', 'fuelDensity')
  updatePrompt('Fuel burn rate :', 'targetBurnRate')
  updatePrompt('       Impulse :', 'impulse')
  updatePrompt('   Random seed :', 'seed', x => parseInt(x))

  return settings
}

module.exports = settings => {
  let newSettings = settings || defaultSettings
  newSettings.seed = Math.floor(Math.random() * 100000)
  missionPlan(newSettings)
  // the first time this runs, `settings` is undefined.
  // on subsequent runs, it's populated with the last mission's settings.
  let canConfigure = settings || configureFirstTime
  if (canConfigure && rls.keyInYN('Configure mission parameters?')) {
    do {
      newSettings = promptForSettings(newSettings)
      missionPlan(newSettings)
    } while (!rls.keyInYN('Use these parameters? '))
  }
  return newSettings
}
