const _ = require('lodash/fp')
const random = require('random')
const rl = require('readline')
const { hideFuelStats } = require('./config')

const welcomeBanner = () => {
  console.log(`
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
|                             |
* Welcome to Mission Control! *
|                             |
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*`)
}

const missionPlan = settings => {
  console.log(`
===============================
         MISSION PLAN             
-------------------------------
Dest. Altitude : ${settings.distance}
       Payload : ${settings.payload}
 Fuel capacity : ${settings.fuel}
  Fuel density : ${settings.fuelDensity}
     Burn rate : ${settings.targetBurnRate}
       Impulse : ${settings.impulse}
   Random seed : ${settings.seed}
-------------------------------
`)
}

let formatPercent = x => (x * 100).toFixed(0)

const missionStatus = state => {
  let fuelStats = !hideFuelStats || state.percentFuelRemaining > 0
  console.log(`
===============================
        MISSION STATUS             
-------------------------------
  Elapsed time : ${state.timeElapsed.toPrec(0.1)}
      Altitude : (${formatPercent(
        state.percentDistanceTraveled
      )}%) ${state.distanceTraveled.toPrec(0.01)}
Time to arrval : ${state.timeToDestination.to('s').toPrec(0.1)}
-------------------------------
 Current speed : ${state.currentSpeed.toPrec(0.1)}
 Average speed : ${state.averageSpeed.toPrec(0.1)}
  Acceleration : ${state.acceleration.to('m/s*s').toPrec(0.01)}
-------------------------------\
${
  fuelStats
    ? `
Fuel burn rate : ${state.burnRate.toPrec(1)}
Fuel remaining : (${formatPercent(
        state.percentFuelRemaining
      )}%) ${state.fuelRemaining.toPrec(1)}
    Total mass : ${state.mass.toPrec(0.1)}
        Thrust : ${state.thrust.to('N').toPrec(0.1)}
-------------------------------`
    : ''
}`)
  return () => {
    rl.moveCursor(process.stdout, 0, fuelStats ? -17 : -12)
    if (random) rl.clearScreenDown(process.stdout)
  }
}

const programSummary = missions => {
  const printStatusTotals = status => {
    let total = _.countBy({ status }, missions)[true] || 0
    let percentage = (total / _.size(missions)) * 100
    return `${total} (${percentage}%)`
  }
  const sumBy = key =>
    _.reduce((acc, x) => (acc ? acc.add(x[key]) : x[key]), undefined, missions)
  console.log(`
===============================
        PROGRAM SUMMARY             
-------------------------------
Dist. traveled : ${sumBy('distanceTraveled').toPrec(0.1)}
Total missions : ${_.size(missions)}
   # successes : ${printStatusTotals('succeeded')}
      # aborts : ${printStatusTotals('aborted')}
  # explosions : ${printStatusTotals('exploded')}
     # crashes : ${printStatusTotals('crashed')}
 Fuel consumed : ${sumBy('fuelBurned').toPrec(0.1)}
   Flight time : ${sumBy('timeElapsed').toPrec(0.1)}`)
}

// prettier-ignore
const statusBanner = status => {
  console.log('\n*******************************')
  console.log({
   succeeded: '       MISSION SUCCESS!        ',
    exploded: '   FAILURE: ROCKET EXPLODED    ',
     crashed: '    FAILURE: ROCKET CRASHED    ',
     aborted: '        MISSION ABORTED        ',
  }[status])
  console.log('*******************************')
}

module.exports = {
  welcomeBanner,
  missionPlan,
  missionStatus,
  programSummary,
  statusBanner
}
