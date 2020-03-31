const Qty = require('js-quantities')
const { min } = require('lodash/fp')
const process = require('process')
const random = require('random')
const rls = require('readline-sync')
const seedrandom = require('seedrandom')
const {
  countdownLength,
  debug,
  disableRngEvents,
  disableStartSequence,
  updateInterval
} = require('./config')
const { missionStatus, statusBanner } = require('./messages')
const createMissionState = require('./missionState')
const { rollRandomEvent } = require('./utils')

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
  return rls.keyInYN('Launch?')
}

// prints a countdown that stops at a random time if we roll to abort
const runLaunchSequence = async abortAt =>
  new Promise(resolve => {
    process.stdout.write('Launching in ')
    let time = countdownLength
    let second
    let interval = setInterval(() => {
      // print the second when it changes and a period otherwise
      let currentSecond = Math.ceil(time / 1000)
      if (second !== currentSecond) {
        second = currentSecond
        process.stdout.write(second.toFixed(0))
      } else process.stdout.write('.')
      // update and possibly exit our loop
      time -= 200
      let shouldAbort = abortAt && time / countdownLength < abortAt
      if (time <= 0 || shouldAbort) {
        clearInterval(interval)
        // only say launch if this is definitely not an aborted mission
        if (time <= 0 && !abortAt) console.log('LAUNCH!')
        resolve()
      }
    }, 200)
  })

// executes for each interval of the mission update loop
const updateMission = state => {
  let interval = new Qty(updateInterval, 'ms')
  // stop burning when we run out of fuel (100% accurate true physics)
  if (state.fuelRemaining.scalar <= 0) state.burnRate.scalar = 0
  else
    state.burnRate = state.burnRate.add(
      state.targetBurnRate.sub(state.burnRate).div(4, '')
    )

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
const runMission = async (state, explodeAt) =>
  new Promise(resolve => {
    let replace = () => {}
    const interval = setInterval(() => {
      if (state.currentSpeed.lt('0 m/s') && state.distanceTraveled.lt('0 km')) {
        resolve({ ...state, status: 'crashed' })
        clearInterval(interval)
      } else if (explodeAt && state.percentFuelRemaining < explodeAt) {
        resolve({ ...state, status: 'exploded' })
        clearInterval(interval)
      } else if (state.distanceTraveled.gte(state.distance)) {
        resolve({ ...state, status: 'succeeded' })
        clearInterval(interval)
      } else updateMission(state)
      replace()
      replace = missionStatus(state)
    }, updateInterval)
  })

module.exports = async settings => {
  let state = createMissionState(settings)
  // if disableStartSequence is true, this will short-circuit.
  // runStartSequence returns false if the user discontinues.
  if (!disableStartSequence && !runStartSequence(state))
    return { ...state, status: 'aborted' }
  // execute the rest of the mission flow and roll the random event for each
  random.use(seedrandom(state.seed))
  let abortAt = rollRandomEvent(1 / 3)
  debug && console.debug('abort:', abortAt)
  await runLaunchSequence(abortAt)
  if (abortAt) return { ...state, status: 'aborted' }
  let explodeAt = rollRandomEvent(1 / 5)
  debug && console.debug('explode:', explodeAt)
  return await runMission(state, explodeAt)
}
