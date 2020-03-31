const Qty = require('js-quantities')
const {
  calcAcceleration,
  calcForce,
  calcThrust,
  calcWeight
} = require('./formulas')

// Returns an object that contains all the mutable and computed properties for
// our mission, along with all the mission settings. This state object is
// returned from every mission regardless of how it ended and is saved in order
// to generate program totals.

module.exports = settings => ({
  // NOTE: The values in `settings` are references to Qty objects, so mutating
  // them here will mutate the settings themselves. Now that we carry settings
  // between missions, we probably want to make sure they're not being mutated
  // inappropriately (eg, by deep cloning this instead of just spreading it).
  ...settings,

  // --- mutated externally ---

  currentSpeed: new Qty(0, 'km/h'),
  averageSpeed: new Qty(0, 'km/h'),
  _distanceTraveled: new Qty(0, 'km'),
  get distanceTraveled() {
    return this._distanceTraveled
  },
  // clamp this to 0 so we don't clip through the earth if we run out of speed
  set distanceTraveled(x) {
    if (x.scalar < 0) x.scalar = 0
    else if (x.gt(this.distance)) x = this.distance
    this._distanceTraveled = x
  },
  timeElapsed: new Qty(0, 's'),
  _fuelBurned: new Qty(0, 'l'),
  get fuelBurned() {
    return this._fuelBurned
  },
  set fuelBurned(x) {
    if (x.gt(this.fuel)) x = this.fuel
    this._fuelBurned = x
  },
  burnRate: new Qty(0, 'l/s'),

  // --- computed ---

  get fuelRemaining() {
    return this.fuel.sub(this.fuelBurned)
  },
  get percentFuelRemaining() {
    return this.fuelRemaining.div(this.fuel).scalar
  },
  get percentDistanceTraveled() {
    return this.distanceTraveled.div(this.distance).scalar
  },
  get timeToDestination() {
    return this.averageSpeed.scalar
      ? this.distance.sub(this.distanceTraveled).div(this.averageSpeed)
      : new Qty(0, 's')
  },
  get mass() {
    return this.payload.add(this.fuel.mul(this.fuelDensity))
  },
  get fuelMassFlowRate() {
    return this.burnRate.mul(this.fuelDensity)
  },
  get thrust() {
    return calcThrust(this.impulse, this.fuelMassFlowRate)
  },
  get acceleration() {
    return calcAcceleration(
      calcForce(this.thrust, calcWeight(this.mass, this.distanceTraveled)),
      this.mass
    ).to('km/h*h')
  }
})
