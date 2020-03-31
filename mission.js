const Qty = require('js-quantities')
const { min } = require('lodash/fp')
const rls = require('readline-sync')

const { updateInterval } = require('./config')
const { missionStatus, statusBanner } = require('./messages')
const createMissionState = require('./missionState')
const seededRandom = require('./random')

// runs through the sequence of prompts leading up to launching the rocket.
// returns true if successful, false if aborted (determined by seeded rng)
const runStartSequence = state => {
  state.missionName = rls.question('What is the name of this mission? ')
  if (!rls.keyInYN('Would you like to proceed?')) return
  if (!rls.keyInYN('Engage afterburner?')) return
  console.log('Afterburner engaged!')
  if (!rls.keyInYN('Release support structures?')) return
  console.log('Support structures released!')
  if (!rls.keyInYN('Perform cross-checks?')) return
  console.log('Cross-checks performed!')
  if (!rls.keyInYN('Launch?')) return
  console.log('Launched!')
  // TODO: abort sometimes
  return true
}

// executes for each interval of the mission update loop
const updateMission = state => {
  let interval = new Qty(updateInterval, 'ms')

  // stop burning when we run out of fuel (100% accurate true physics)
  if (state.fuel.scalar <= 0) state.burnRate.scalar = 0

  state.currentSpeed = state.currentSpeed.add(state.acceleration.mul(interval))
  let samples = state.timeElapsed.div(new Qty(updateInterval, 'ms'))
  state.averageSpeed = state.averageSpeed
    .mul(samples)
    .add(state.currentSpeed)
    .div(samples.add('1'))
  state.distanceTraveled = state.distanceTraveled.add(
    state.currentSpeed.mul(interval)
  )

  state.timeElapsed = state.timeElapsed.add(interval)
  state.fuelBurned = state.fuelBurned.add(state.burnRate.mul(interval))
}

// starts and finishes the mission update loop
const runMission = async state => {
  const random = seededRandom(state.seed)
  let aborts = random() < 0.3
  let explodes = random() < 0.9 // adjust as necessary
  let explodesAt = random()
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (state.distanceTraveled.gte(state.distance)) {
        resolve({ ...state, status: 'succeeded' })
        clearInterval(interval)
      } else if (state.fuel.lte('0 l') && state.distanceTraveled.lte('0 km')) {
        resolve({ ...state, status: 'crashed' })
        clearInterval(interval)
      } else if (explodes && state.timeElapsed.gt(new Qty(5, 's'))) {
        resolve({ ...state, status: 'exploded' })
        clearInterval(interval)
      } else {
        updateMission(state)
      }
      missionStatus(state)
      console.log('explodes:', explodes, explodesAt)
      console.log('fuel remaining:', state.percentFuelRemaining)
    }, updateInterval)
  })
}

module.exports = async settings => {
  let state = createMissionState(settings)
  // runStartSequence returns false if the mission aborted
  let mission = runStartSequence(state)
    ? await runMission(state)
    : { ...state, status: 'aborted' }
  statusBanner(mission.status)
  return mission
}
