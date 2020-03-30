const Qty = require('js-quantities')
const rls = require('readline-sync')
const _ = require('lodash/fp')

/* Returns a settings object that is used to configure the mission parameters
for the next mission. Also contains defaults for those. */

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
  burnRate: new Qty(16824, 'l/s'),
  // Specific impulse is a measure of the efficiency of a rocket and allows us
  // to calculate thrust from the burn rate (as mass flow rate) of our fuel.
  // https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_in_seconds
  impulse: new Qty(250, 's'),
}

const parseInput = (input, origValue) => {
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
  if (!rls.keyInYN('Configure mission parameters?')) return settings
  console.log(`
Please enter new mission parameters.
Leave input blank to reuse the value
in parens. You can specify new units
with your input, or omit them to use
the units shown. New units should be
compatible.
`)
  const updatePrompt = (message, key) => {
    let origValue = new Qty(settings[key])
    do {
      let input = rls.question(`${message} (${origValue}) `, {
        defaultInput: origValue,
      })
      settings[key] = parseInput(input, origValue)
    } while (settings[key] === null)
  }

  updatePrompt('  Target dist. :', 'distance')
  updatePrompt('       Payload :', 'payload')
  updatePrompt(' Fuel capacity :', 'fuel')
  updatePrompt('  Fuel density :', 'fuelDensity')
  updatePrompt('Fuel burn rate :', 'burnRate')
  updatePrompt('       Impulse :', 'impulse')

  console.log('\nSettings updated!')
  return settings
}

module.exports = settings => {
  return settings ? promptForSettings(settings) : defaultSettings
}
