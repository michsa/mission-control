const rls = require('readline-sync')
const configureSettings = require('./settings')
const runMission = require('./mission')

console.log('Welcome to Mission Control!')

const missions = []

let playAgain = true
let settings = undefined

// settings file that exports prompts returning a settngs object and a default settings object

let main = async () => {
  try {
    while (playAgain) {
      settings = configureSettings(settings)
      let missionResults = await runMission(settings)
      missions.push(missionResults)
      playAgain = rls.keyInYN('Would you like to run another mission?')
    }
  } catch (e) {
    // Deal with the fact the chain failed
    console.error(e)
  }
}

main()
