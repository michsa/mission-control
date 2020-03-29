const Qty = require('js-quantities')

// Physics formulas and constants to make rocket go.
// This file should contain only pure functions.

// https://en.wikipedia.org/wiki/Earth_radius
const radiusOfEarth = new Qty(6370, 'km')

// https://en.wikipedia.org/wiki/Gravity_of_Earth#Altitude
const calcGravitationalAcceleration = height => {
  let heightModifier = radiusOfEarth.div(radiusOfEarth.add(height))
  return new Qty(1, 'gee').mul(heightModifier.mul(heightModifier))
}

const calcWeightAtAltitude = (mass, height) =>
  mass.mul(calcGravitationalAcceleration(height))

// impulse (m/s) = thrust (N or kgm/s^2) / mass flow rate (kg/s)
// specific impulse (s) = thrust (N or kgm/s^2) / weight flow rate (N/s or kgm/s^3)
// thrust (N or kgm/s^2) = impulse (s) * mass flow rate (kg/s) * gravitation acceleration (m/s^2)
const calcThrust = (impulse, massFlowRate) =>
  impulse.mul(massFlowRate).mul('1 gee')

// we need a rough approximate for the rocket's thrust - the real formulas are
// too complex since they depend on all sorts of propertes of the fuel & rocket
const calcForce = (thrust, weight) => thrust.sub(weight)

const calcAcceleration = (force, mass) => force.div(mass)

module.exports = {
  calcThrust,
  calcWeightAtAltitude,
  calcForce,
  calcAcceleration,
}
