const Qty = require('js-quantities')
const {
  calcWeightAtAltitude,
  calcForce,
  calcAcceleration,
} = require('./formulas')

let seed = 1
let random = () => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// --- constants ---

// time interval for the update loop, in ms.
// stays a scalar because we use this directly in setInterval.
const updateInterval = 100

const state = {
  // --- parameters (TODO: these should be configurable) ---

  distance: new Qty(160, 'km'),
  // NOTE: The readme says this 50,000 kg payload includes the fuel, but that's
  // likely an error - one liter of rocket fuel (or water) weighs roughly 1 kg,
  // so our total payload including fuel would exceed 1 million kilograms!
  // That actually sounds more realistic for a rocket, so I'm going to assume
  // that the fuel is *NOT* included and that this value is the actual payload.
  payload: new Qty(50000, 'kg'),
  fuel: new Qty(1514100, 'l'),
  fuelDensity: new Qty(0.9, 'g/ml'), // https://en.wikipedia.org/wiki/RP-1
  burnRate: new Qty(168240, 'l/s'),
  targetSpeed: new Qty(1500, 'km/h'),
  // Specific impulse is a measure of the efficiency of a rocket and allows us
  // to calculate thrust from the burn rate (as mass flow rate) of our fuel.
  // https://en.wikipedia.org/wiki/Specific_impulse#Specific_impulse_in_seconds
  impulse: new Qty(250, 's'),

  // --- mission state ---

  fuelConsumed: new Qty(0, 'l'),
  currentSpeed: new Qty(0, 'km/h'),
  averageSpeed: new Qty(0, 'km/h'),
  distanceTraveled: new Qty(0, 'km'),
  timeElapsed: new Qty(0, 's'),

  // --- calculations ---

  get timeToDestination() {
    return state.averageSpeed.scalar
      ? state.distance.sub(state.distanceTraveled).div(state.averageSpeed)
      : new Qty(0, 's')
  },
  get mass() {
    return state.payload.add(
      state.fuel.sub(state.fuelConsumed).mul(state.fuelDensity)
    )
  },
  get thrust() {
    return state.impulse.mul(state.burnRate.mul(state.fuelDensity).mul('1 gee'))
  },
  get acceleration() {
    return calcAcceleration(
      calcForce(
        state.thrust,
        calcWeightAtAltitude(state.mass, state.distanceTraveled)
      ),
      state.mass
    ).to('km/h*h')
  },
}

// --- calculations ---

const calcAverageSpeed = () => {
  let samples = state.timeElapsed.div(new Qty(updateInterval, 'ms'))
  return state.averageSpeed
    .mul(samples)
    .add(state.currentSpeed)
    .div(samples.add('1'))
}

// --- output formatting ---

const startMission = () => {
  console.log(`
Welcome to Mission Control!
Mission plan:
  Travel distance:  ${state.distance}
  Payload capacity: ${state.payload}
  Fuel capacity:    ${state.fuel}
  Target burn rate: ${state.burnRate}
  Target speed:     ${state.targetSpeed}
  Random seed:      12
`)
}

const missionStatus = () => {
  console.log(`
Mission status:
  Elapsed time:        ${state.timeElapsed.toPrec(1)}
  Fuel burn rate:      ${state.burnRate}
  Current speed:       ${state.currentSpeed.toPrec(0.1)}
  Average speed:       ${state.averageSpeed.toPrec(0.1)}
  Distance traveled:   ${state.distanceTraveled.toPrec(0.1)}
  Time to destination: ${state.timeToDestination.to('s').toPrec(0.01)}
  ---
  Mass: ${state.mass}
  Thrust: ${state.thrust}
  Accel: ${state.acceleration.toPrec(0.1)}
`)
}

// --- loop ---

const runMission = () => {
  startMission()
  let timer = null
  let updateMission = () => {
    if (timer && state.distanceTraveled.gte(state.distance))
      clearInterval(timer)

    let interval = new Qty(updateInterval, 'ms')

    if (state.fuelConsumed.gte(state.fuel)) state.burnRate.scalar = 0

    state.currentSpeed = state.currentSpeed.add(state.acceleration.mul(interval))
    state.averageSpeed = calcAverageSpeed()
    state.distanceTraveled = state.distanceTraveled.add(
      state.currentSpeed.mul(interval)
    )

    state.timeElapsed = state.timeElapsed.add(interval)
    state.fuelConsumed = state.fuelConsumed.add(state.burnRate.mul(interval))

    missionStatus()
  }
  timer = setInterval(updateMission, updateInterval)
}

runMission()
