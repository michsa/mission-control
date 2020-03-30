const rls = require('readline-sync')
const configureSettings = require('./settings')
const runMission = require('./mission')

console.log('Welcome to Mission Control!')

const missions = []

let playAgain = true
let settings

while (playAgain) {
  settings = configureSettings(settings)
  missions.push(runMission(settings))
  playAgain = rls.keyInYN('Play again?')
}

// settings file that exports prompts returning a settngs object and a default settings object