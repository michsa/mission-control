const rs = require('readline-sync')
const Qty = require('js-quantities')

// constants

const actions = {
  afterburner: false,
  supports: false,
  crossChecks: false,
  launch: false,
  sequence: [],
}
const updateInterval = 100

/// parameters

let distance = 160 // km
let payload = 50000 // kg
let fuel = 1514100 // liters
let targetBurnRate = 168240 // liters per minute
let targetSpeed = 1500 // km/h

// mission state

let currentSpeed = 0
let averageSpeed = 0
let currentBurnRate = 0
let timeElapsed = 0
let distanceTraveled = 0

let timer = null

// ---

const startMission = () => {
  console.log(`
Welcome to Mission Control!
Mission plan:
  Travel distance:  ${distance} km
  Payload capacity: ${payload} kg
  Fuel capacity:    ${fuel} liters
  Target burn rate: ${targetBurnRate} liters/minute
  Target speed:     ${targetSpeed} km/h
  Random seed:      12
`)
}

const performAction = action => {
  actions[action] = true
  actions.sequence.push(action)
  console.log(
    {
      afterburner: 'Afterburner engaged!',
      supports: 'Support structures released!',
      crossChecks: 'Cross-checks performed!',
      launch: 'Launched!',
    }[action]
  )
}

const launchStatus = () => {
  console.log(`
Launch status:
  Stage 1 afterburner: ${actions.afterburner ? 'RUNNING' : 'OFF'}
  Support structure:   ${actions.supports ? 'ENGAGED' : 'DISENGAGED'}
  Cross-check status:  ${actions.crossChecks ? 'OK' : 'UNKNOWN'}
`)
}

const calcTimeToDestination = () => (distance - distanceTraveled) / averageSpeed

const calcAverageSpeed = () => {
  let samples = timeElapsed / updateInterval
  return (averageSpeed * samples + currentSpeed) / (samples + 1)
}

const missionStatus = () => {
  console.log(`
Mission status:
  Elapsed time: ${timeElapsed}
  Current fuel burn rate: ${currentBurnRate} liters/min
  Current speed: ${currentSpeed} km/h
  Average speed: ${averageSpeed} km/h
  Current distance traveled: ${distanceTraveled} km
  Time to destination: ${calcTimeToDestination()}
`)
}

const runMission = () => {
  startMission()
  const missionName = rs.question('What is the name of this mission? ')

  timer = setInterval(() => {
    currentSpeed += 300
    averageSpeed = calcAverageSpeed()
    distanceTraveled += currentSpeed.to('') / 1000) * updateInterval
    timeElapsed += updateInterval
    missionStatus()

    if (timeElapsed > 2000) clearInterval(timer)
  }, updateInterval)
}

runMission()
