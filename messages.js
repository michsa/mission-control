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

const missionSummary = missions => {
  const printStatusTotals = status => {
    let total = _.countBy({ status }, missions)
    let percentage = (total / _.size(missions)) * 100
    return `${total} (${percentage}%)`
  }
  console.log(`
===============================
        MISSION SUMMARY             
-------------------------------
Total distance : 160.36 km
Total missions : 123
   # successes : ${printStatusTotals('succeeded')}
      # aborts : ${printStatusTotals('aborted')}
  # explosions : ${printStatusTotals('exploded')}
     # crashes : ${printStatusTotals('crashed')}
   Fuel burned : ${_.sumBy('fuelBurned', missions)}
   Flight time : 0:06:25
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

module.exports = {
  missionPlan,
  missionStatus,
  missionSummary,
  statusBanner,
}
