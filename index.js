const rls = require('readline-sync')
const configureSettings = require('./settings')
const runMission = require('./mission')

console.log('Welcome to Mission Control!')

const missions = []

let playAgain = true
let settings = undefined

// settings file that exports prompts returning a settngs object and a default settings object

// we can't await at the top level (yet!), so we wrap the code in an async
// function. (I could've used an IIFE here, but I find this syntax clearer)
let main = async () => {
  try {
    while (playAgain) {
      settings = configureSettings(settings)
      let missionResults = await runMission(settings)
      missions.push(missionResults)
      playAgain = rls.keyInYN('Would you like to run another mission?')
    }
  } catch (e) {
    console.error(e)
  }
}

main()
