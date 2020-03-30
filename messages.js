const { seed } = require('./config')
const _ = require('lodash/fp')

const missionPlan = settings => {
  console.log(`
===============================
         MISSION PLAN             
-------------------------------
  Travel dist. : ${settings.distance}
       Payload : ${settings.payload}
 Fuel capacity : ${settings.fuel}
  Fuel density : ${settings.fuelDensity}
     Burn rate : ${settings.burnRate}
       Impulse : ${settings.impulse}
   Random seed : ${seed}
-------------------------------
`)
}

const missionStatus = state => {
  console.log(`
===============================
        MISSION STATUS             
-------------------------------
  Elapsed time : ${state.timeElapsed.toPrec(0.1)}
Dist. traveled : ${state.distanceTraveled.toPrec(0.01)}
Time to arrval : ${state.timeToDestination.to('s').toPrec(0.1)}
-------------------------------
 Current speed : ${state.currentSpeed.toPrec(0.1)}
 Average speed : ${state.averageSpeed.toPrec(0.1)}
  Acceleration : ${state.acceleration.to('m/s*s').toPrec(0.01)}
-------------------------------
Fuel burn rate : ${state.burnRate}
Fuel remaining : ${state.fuel.toPrec(0.1)}
    Total mass : ${state.mass.toPrec(0.1)}
        Thrust : ${state.thrust.to('N').toPrec(0.1)}
-------------------------------`)
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
Total distance : ${sumBy('distanceTraveled').toPrec(0.1)}
Total missions : ${_.size(missions)}
   # successes : ${printStatusTotals('succeeded')}
      # aborts : ${printStatusTotals('aborted')}
  # explosions : ${printStatusTotals('exploded')}
     # crashes : ${printStatusTotals('crashed')}
   Fuel burned : ${sumBy('fuel').toPrec(0.1)}
   Flight time : ${sumBy('timeElapsed').toPrec(0.1)}
`)
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
  console.log('*******************************\n')
}

module.exports = { missionPlan, missionStatus, programSummary, statusBanner }
