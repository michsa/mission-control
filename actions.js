const rs = require('readline-sync')

const actions = {
  afterburner: false,
  supports: false,
  crossChecks: false,
  launch: false,
  sequence: [],
}

const launchStatus = () => {
  console.log(`
Launch status:
  Stage 1 afterburner: ${actions.afterburner ? 'RUNNING' : 'OFF'}
  Support structure:   ${actions.supports ? 'ENGAGED' : 'DISENGAGED'}
  Cross-check status:  ${actions.crossChecks ? 'OK' : 'UNKNOWN'}
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

//  const missionName = rs.question('What is the name of this mission? ')
