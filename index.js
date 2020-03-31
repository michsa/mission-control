const rls = require('readline-sync')
const configureSettings = require('./settings')
const runMission = require('./mission')
const { programSummary, welcomeBanner } = require('./messages')

const missions = []
let playAgain = true
let settings

// we can't await at the top level (yet!), so we wrap the code in an async
// function. (I could've used an IIFE here, but I find this syntax clearer)
let main = async () => {
  try {
    welcomeBanner()
    while (playAgain) {
      settings = configureSettings(settings)
      let missionResults = await runMission(settings)
      missions.push(missionResults)
      programSummary(missions)
      playAgain = rls.keyInYN('\nWould you like to run another mission?')
    }
  } catch (e) {
    console.error(e)
  }
}
main()
