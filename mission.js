const { min } = require('lodash/fp')
const Qty = require('js-quantities')
const createMissionState = require('./missionState')
const { seed, updateInterval } = require('./config.js')
const { missionPlan, missionStatus, statusBanner } = require('./messages')
const rls = require('readline-sync')

let random = () => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// --- loop ---

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
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (state.distanceTraveled.gte(state.distance)) {
        resolve({ ...state, status: 'succeeded' })
        clearInterval(interval)
      } else if (state.fuel.lte('0 l') && state.distanceTraveled.lte('0 km')) {
        resolve({ ...state, status: 'crashed' })
        clearInterval(interval)
      } else if (state.status === 'exploded') {
        resolve(state)
        clearInterval(interval)
      } else {
        updateMission(state)
      }
      missionStatus(state)
    }, updateInterval)
  })
}

module.exports = async settings => {
  let state = createMissionState(settings)
  missionPlan(state)
  // runStartSequence returns false if the mission aborted
  let mission = runStartSequence(state)
    ? await runMission(state)
    : { ...state, status: 'aborted' }
  statusBanner(mission.status)
  return mission
}
