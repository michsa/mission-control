const Qty = require('js-quantities')

/* Physics formulas and constants to make rocket go. This file should contain only pure functions. */

// https://en.wikipedia.org/wiki/RP-1
const fuelDensity = new Qty(0.9, 'g/ml')

// https://en.wikipedia.org/wiki/Earth_radius
const radiusOfEarth = new Qty(6370, 'km')

// https://en.wikipedia.org/wiki/Gravity_of_Earth#Altitude
const calcGravitationalAcceleration = height => {
  let heightModifier = radiusOfEarth.div(radiusOfEarth.add(height))
  return new Qty(1, 'gee').mul(heightModifier.mul(heightModifier))
}

const calcWeightAtAltitude = (mass, height) =>
  mass.mul(calcGravitationalAcceleration(height))

// we need a rough approximate for the rocket's thrust - the real formulas are
// too complex since they depend on all sorts of propertes of the fuel & rocket
const calcForce = (thrust, weight) => thrust.sub(weight)

const calcAcceleration = (force, mass) => force.div(mass)

module.exports = { fuelDensity }
