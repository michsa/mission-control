## Mission Control

Thank you for taking the time to complete this assignment. We believe this to be an effective way to showcase your skills, on your own time, without the pressure of someone looking over your shoulder. Your code will help us decide if we'd like to proceed with the interview process. Please understand that completing this assignment doesn't guarantee follow up interviews. We will keep you posted either way.

_Even though there is no strict time limit, it should take you 3-5 hours to complete the assignment. Have fun!_


## Launch Requirements

1. Create a Github **FORK** of this repository on your own Github account. Create a new branch and pull-request to **your own fork**. Do not create a pull-request against the original repository doximity/mission-control **NOTE: this is the default when creating the pull-request so pay close attention.** 
2. **Use Ruby**, a style guide can be found [here](https://github.com/bbatsov/ruby-style-guide), use 2 soft-tabs.
3. Use proper object orientation, abstraction and design patterns.
3. Your application should run as a CLI (command line interface) and should flow like a text based game. In memory data store is perfectly fine. The player should be able to play as many missions as they would like. At the end of each mission you should output a summary of the mission. At the end of all missions, output the final summary.
4. Once completed, email your point of contact at Doximity a link to your respository.

## Your Mission

_Your mission, should you choose to accept it, is to launch the rocket into low earth orbit._

### Specifications

#### You will be responsible for conducting the flight into low earth orbit:

    1. Travel Distance: 160 kilometers
    2. Payload capacity: 50,000 kilograms including rocket itself
    3. Fuel capacity: 1,514,100 liters of fuel, already included in the payload total
    4. Burn rate: 168,233 liters per minute
    5. Average speed: 1500 kilometers/hr

#### The rocket launch system is comprised of 4 stages which must happen in this precise order:

    1. Enable stage 1 afterburner
    2. Disengaging release structure
    3. Cross-checks
    4. Launch

#### Active mission controls:

    1. Manually transition between launch stages in the expected order
    2. Mission control should be able to safely abort launch after stage 1 and retry
    3. One in every 3rd launch will require an abort and retry after stage 1 randomize when it actually happens
    4. One in every 5th launch will explode, randomize when it actually happens

#### Necessary instrumentation information to be provided at the end of each mission

    1. Total distance traveled (if aborted this would be 0, if exploded, pick a random spot in the timeline). 
    2. Total travel time (same as above)

#### Final Summary to be provided at end of all attempted missions.

    1. Total distance traveled (for all missions combined)
    2. Number of abort and retries (for all missions combined)
    3. Number of explosions (for all missions combined)
    4. Total fuel burned (for all missions combined)
    5. Total flight time (for all missions combined)

#### Sample Output

![image](resources/output-1.png)
![image](resources/output-2.png)
