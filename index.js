const Qty = require('js-quantities')
const { calcForce, calcAcceleration } = require('./formulas')

let seed = 1
let random = () => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// --- constants ---

// time interval for the update loop, in ms.
// stays a scalar because we use this directly in setInterval.
const updateInterval = 100

// --- parameters ---

let distance = new Qty(160, 'km')
// NOTE: The readme says this 50,000 kg payload includes the fuel, but that's
// likely an error -- one liter of rocket fuel (or water) weighs roughly 1 kg,
// so our total payload including fuel would exceed 1 million kilograms!
// That actually sounds more realistic for a rocket, so I'm going to assume
// that the fuel is *NOT* included and that this value is the actual payload
// (which will make calculations easier anyway).
let payload = new Qty(50000, 'kg')
let fuel = new Qty(1514100, 'l')
let fuelDensity = new Qty(0.9, 'g/ml') // https://en.wikipedia.org/wiki/RP-1
let burnRate = new Qty(168240, 'l/s')
let targetSpeed = new Qty(1500, 'km/h')
// Specific impulse is a measure of the efficiency of a rocket and allows us to
// calculate thrust from the burn rate (or "mass flow rate") of our fuel.
// https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_in_seconds
let impulse = new Qty(500, 's')

// --- mission state ---

let currentFuel = new Qty(fuel)
let currentSpeed = new Qty(0, 'km/h')
let averageSpeed = new Qty(0, 'km/h')
let distanceTraveled = new Qty(0, 'km')
let timeElapsed = new Qty(0, 's')

let timer = null // holds the timeout object for our update loop

// --- calculations ---

const calcTimeToDestination = () =>
  averageSpeed.scalar
    ? distance.sub(distanceTraveled).div(averageSpeed)
    : new Qty(0, 's')

const calcAverageSpeed = () => {
  let samples = timeElapsed.div(new Qty(updateInterval, 'ms'))
  return averageSpeed
    .mul(samples)
    .add(currentSpeed)
    .div(samples.add('1'))
}

const calcMass = () => payload.add(currentFuel.mul(fuelDensity))

const calcThrust = () => impulse.mul(burnRate.mul(fuelDensity).mul('1 gee'))

// --- output formatting ---

const startMission = state => {
  console.log(`
Welcome to Mission Control!
Mission plan:
  Travel distance:  ${distance}
  Payload capacity: ${payload}
  Fuel capacity:    ${fuel}
  Target burn rate: ${burnRate}
  Target speed:     ${targetSpeed}
  Random seed:      12
`)
}

const missionStatus = () => {
  console.log(`
Mission status:
  Elapsed time:        ${timeElapsed.toPrec(1)}
  Fuel burn rate:      ${burnRate}
  Current speed:       ${currentSpeed.toPrec(0.1)}
  Average speed:       ${averageSpeed.toPrec(0.1)}
  Distance traveled:   ${distanceTraveled.toPrec(0.1)}
  Time to destination: ${calcTimeToDestination()
    .to('s')
    .toPrec(0.01)}
  ---
  Mass: ${calcMass()}
  Thrust: ${calcThrust()}
`)
}

// --- loop ---

const runMission = () => {
  startMission()

  timer = setInterval(() => {
    let interval = new Qty(updateInterval, 'ms')

    currentSpeed = currentSpeed.add(new Qty(10, 'm/s'))
    averageSpeed = calcAverageSpeed()
    distanceTraveled = distanceTraveled.add(currentSpeed.mul(interval))

    timeElapsed = timeElapsed.add(interval)
    currentFuel = currentFuel.sub(burnRate.mul(interval))

    missionStatus()

    if (distanceTraveled.gte(distance) || currentFuel.lte('0 l')) clearInterval(timer)
  }, updateInterval)
}

runMission()
