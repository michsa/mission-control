const Qty = require('js-quantities')

// Physics formulas and constants for our simulation, used in missionState to
// calculate rocket properties. Basically these are all the pure functions that
// could be pulled out of the physics logic.

// The APIs here are not particularly well thought out - ordered arguments don't
// really make sense for physics formulas, so it'd probably be better to use an
// object argument in all of these. This works okay for now, but I'd want to
// revisit it if the app were to get any bigger.

// https://en.wikipedia.org/wiki/Earth_radius
const radiusOfEarth = new Qty(6370, 'km')

// https://en.wikipedia.org/wiki/Gravity_of_Earth#Altitude
const calcGravitationalAcceleration = height => {
  let heightModifier = radiusOfEarth.div(radiusOfEarth.add(height))
  return new Qty(1, 'gee').mul(heightModifier.mul(heightModifier))
}

const calcWeight = (mass, altitude) =>
  mass.mul(calcGravitationalAcceleration(altitude))

// specific impulse (s) = thrust (N or kgm/s^2) / weight flow rate (N/s or kgm/s^3)
// thrust (N or kgm/s^2) = impulse (s) * mass flow rate (kg/s) * gravitation acceleration (m/s^2)
// NOTE: a real thrust calculation depends on density differentials and a bunch
// of other stuff we don't care about, so instead we work backward from an
// impulse value (see the comment in missionState for more on impulse)
const calcThrust = (impulse, massFlowRate) =>
  impulse.mul(massFlowRate).mul('1 gee')

const calcForce = (thrust, weight) => thrust.sub(weight)

const calcAcceleration = (force, mass) => force.div(mass)

module.exports = { calcAcceleration, calcForce, calcThrust, calcWeight }
