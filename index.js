const Qty = require('js-quantities')
const { fuelDensity } = require('./formulas')

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
let payload = new Qty(50000, 'kg')
let fuel = new Qty(1514100, 'l')
let targetBurnRate = new Qty(168240, 'l/m')
let targetSpeed = new Qty(1500, 'km/h')

// --- mission state ---

let currentFuel = new Qty(fuel)
let currentSpeed = new Qty(0, 'km/h')
let averageSpeed = new Qty(0, 'km/h')
let currentBurnRate = new Qty(0, 'l/m')
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

const calcMass = state => payload.sub(fuel.sub(currentFuel).div(fuelDensity))

// --- output formatting ---

const startMission = state => {
  console.log(`
Welcome to Mission Control!
Mission plan:
  Travel distance:  ${distance}
  Payload capacity: ${payload}
  Fuel capacity:    ${fuel}
  Target burn rate: ${targetBurnRate}
  Target speed:     ${targetSpeed}
  Random seed:      12
`)
}

const missionStatus = () => {
  console.log(`
Mission status:
  Elapsed time:        ${timeElapsed.toPrec(1)}
  Fuel burn rate:      ${currentBurnRate}
  Current speed:       ${currentSpeed.toPrec(0.1)}
  Average speed:       ${averageSpeed.toPrec(0.1)}
  Distance traveled:   ${distanceTraveled.toPrec(0.1)}
  Time to destination: ${calcTimeToDestination()
    .to('s')
    .toPrec(0.01)}
`)
}

// --- loop ---

const runMission = () => {
  startMission()

  timer = setInterval(() => {
    currentSpeed = currentSpeed.add(new Qty(10, 'm/s'))
    averageSpeed = calcAverageSpeed()
    distanceTraveled = distanceTraveled.add(
      currentSpeed.mul(new Qty(updateInterval, 'ms'))
    )
    timeElapsed = timeElapsed.add(new Qty(updateInterval, 'ms'))

    missionStatus()

    if (distanceTraveled.gte(distance)) clearInterval(timer)
  }, updateInterval)
}

runMission()
