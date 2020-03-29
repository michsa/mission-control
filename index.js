const rs = require('readline-sync')
const Qty = require('js-quantities')

let seed = 1
let random = () => {
    let x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
}

// --- constants ---

const actions = {
  afterburner: false,
  supports: false,
  crossChecks: false,
  launch: false,
  sequence: [],
}
const updateInterval = 100

/// --- parameters ---

let distance = new Qty(160, 'km') // km
let payload = new Qty(50000, 'kg') // kg
let fuel = new Qty(1514100, 'l') // liters
let targetBurnRate = new Qty(168240, 'l/m') // liters per minute
let targetSpeed = new Qty(1500, 'km/h') // km/h

// --- mission state ---

let currentSpeed = new Qty(0, 'km/h')
let averageSpeed = new Qty(0, 'km/h')
let currentBurnRate = new Qty(0, 'l/m')
let distanceTraveled = new Qty(0, 'km')
let timeElapsed = new Qty(0, 's')

let timer = null

// --- calculations ---

const calcTimeToDestination = () => averageSpeed.scalar ? distance.sub(distanceTraveled).div(averageSpeed) : new Qty(0, 's')

const calcAverageSpeed = () => {
  let samples = timeElapsed.div(new Qty(updateInterval, 'ms'))
  return averageSpeed.mul(samples).add(currentSpeed).div(samples.add('1'))
}

// --- output formatting ---

const startMission = () => {
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

const launchStatus = () => {
  console.log(`
Launch status:
  Stage 1 afterburner: ${actions.afterburner ? 'RUNNING' : 'OFF'}
  Support structure:   ${actions.supports ? 'ENGAGED' : 'DISENGAGED'}
  Cross-check status:  ${actions.crossChecks ? 'OK' : 'UNKNOWN'}
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
  Time to destination: ${calcTimeToDestination().to('s').toPrec(0.01)}
`)
}

// --- input handling ---

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

// --- loop ---

const runMission = () => {
  startMission()
  const missionName = rs.question('What is the name of this mission? ')

  timer = setInterval(() => {
    currentSpeed = currentSpeed.add(new Qty(10, 'm/s'))
    averageSpeed = calcAverageSpeed()
    distanceTraveled = distanceTraveled.add(currentSpeed.mul(new Qty(updateInterval, 'ms')))
    timeElapsed = timeElapsed.add(new Qty(updateInterval, 'ms'))
    missionStatus()

    if (distanceTraveled.gte(distance)) clearInterval(timer)
  }, updateInterval)
}

runMission()
