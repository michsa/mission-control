const _ = require('lodash/fp')
const random = require('random')
const rl = require('readline')
const { hideFuelStats } = require('./config')

const printLine = chars => _.padCharsEnd(chars, 31, '')

const center = _.pad(31)

const formatPercent = x => `(${(x * 100).toFixed(0)}%)`

const welcomeBanner = () => {
  console.log(`
${printLine('*-')}
|                             |
* Welcome to Mission Control! *
|                             |
${printLine('*-')}`)
}

const missionPlan = settings => {
  console.log(`
${printLine('=')}
${center('MISSION PLAN')}
${printLine('-')}
Dest. Altitude : ${settings.distance}
       Payload : ${settings.payload}
 Fuel capacity : ${settings.fuel}
  Fuel density : ${settings.fuelDensity}
     Burn rate : ${settings.targetBurnRate}
       Impulse : ${settings.impulse}
   Random seed : ${settings.seed}
${printLine('-')}
`)
}

const missionStatus = state => {
  let fuelStats = !hideFuelStats || state.percentFuelRemaining > 0
  console.log(`
${printLine('=')}
${center('MISSION STATUS')}
${printLine('-')}
  Elapsed time : ${state.timeElapsed.toPrec(0.1)}
      Altitude : ${formatPercent(
        state.percentDistanceTraveled
      )} ${state.distanceTraveled.toPrec(0.01)}
Time to arrval : ${state.timeToDestination.to('s').toPrec(0.1)}
${printLine('-')}
 Current speed : ${state.currentSpeed.toPrec(0.1)}
 Average speed : ${state.averageSpeed.toPrec(0.1)}
  Acceleration : ${state.acceleration.to('m/s*s').toPrec(0.01)}\
${
  fuelStats
    ? `
${printLine('-')}
Fuel burn rate : ${state.burnRate.toPrec(1)}
Fuel remaining : ${formatPercent(
        state.percentFuelRemaining
      )} ${state.fuelRemaining.toPrec(1)}
    Total mass : ${state.mass.toPrec(0.1)}
        Thrust : ${state.thrust.to('N').toPrec(0.1)}`
    : ''
}
${printLine('-')}`)
  return () => {
    rl.moveCursor(process.stdout, 0, fuelStats ? -17 : -12)
    if (random) rl.clearScreenDown(process.stdout)
  }
}

const programSummary = missions => {
  const printStatusTotals = status => {
    let total = _.countBy({ status }, missions)[true] || 0
    return `${total} ${formatPercent(total / _.size(missions))}`
  }
  const sumBy = key =>
    _.reduce((acc, x) => (acc ? acc.add(x[key]) : x[key]), undefined, missions)
  console.log(`
${printLine('=')}
${center('PROGRAM SUMMARY')}
${printLine('-')}
Dist. traveled : ${sumBy('distanceTraveled').toPrec(0.1)}
Total missions : ${_.size(missions)}
   # successes : ${printStatusTotals('succeeded')}
      # aborts : ${printStatusTotals('aborted')}
  # explosions : ${printStatusTotals('exploded')}
     # crashes : ${printStatusTotals('crashed')}
 Fuel consumed : ${sumBy('fuelBurned').toPrec(0.1)}
   Flight time : ${sumBy('timeElapsed').toPrec(0.1)}`)
}

const statusBanner = status => {
  let text = {
    succeeded: 'MISSION SUCCESS!',
    exploded: 'FAILURE: ROCKET EXPLODED',
    crashed: 'FAILURE: ROCKET CRASHED',
    aborted: 'MISSION ABORTED'
  }[status]
  console.log(`
${printLine('*')}
${center(text)}
${printLine('*')}`)
}

module.exports = {
  welcomeBanner,
  missionPlan,
  missionStatus,
  programSummary,
  statusBanner
}
