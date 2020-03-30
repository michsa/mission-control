const { min } = require('lodash/fp')
const Qty = require('js-quantities')
const createMissionState = require('./missionState')
const { seed, updateInterval } = require('./config.js')
const { printMissionPlan, printMissionStatus } = require('./messages')
const rls = require('readline-sync')

let random = () => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// --- loop ---

const runStartSequence = state => {
  // What is the name of this mission? Minerva II
  // Would you like to proceed? (Y/n) Y
  // Engage afterburner? (Y/n) Y
  // Afterburner engaged!
  // Release support structures? (Y/n) Y
  // Support structures released!
  // Perform cross-checks? (Y/n) Y
  // Cross-checks performed!
  // Launch? (Y/n) Y

  state.missionName = rls.question('What is the name of this mission? ')

  if (!rls.keyInYN('Would you like to proceed?')) return
  if (!rls.keyInYN('Engage afterburner?')) return
  console.log('Afterburner engaged!')
  if (!rls.keyInYN('Engage afterburner?')) return

  return true
}

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
  state.fuel = state.fuel.sub(state.burnRate.mul(interval))
}

const runMission = async state => {
  console.log('run mission')
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (state.distanceTraveled.gte(state.distance)) {
        resolve({ ...state, status: 'succeeded' })
        clearInterval(interval)
      }
      if (state.fuel.lte('0 l') && state.distanceTraveled.lte('0 km')) {
        resolve({ ...state, status: 'crashed' })
        clearInterval(interval)
      }
      // todo: exploded
      updateMission(state)
      printMissionStatus(state)
    }, updateInterval)
  })
}

module.exports = async settings => {
  let state = createMissionState(settings)
  printMissionPlan(state)
  // runStartSequence returns false if the mission aborted
  let result = runStartSequence(state)
    ? await runMission(state)
    : { ...state, status: 'aborted' }

  console.log('result', result)
  return result
}
