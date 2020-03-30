const Qty = require('js-quantities')
const {
  calcAcceleration,
  calcForce,
  calcThrust,
  calcWeight,
} = require('./formulas')

module.exports = settings => ({
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
  _fuelBurned: new Qty(settings.fuel),
  get fuelBurned() {
    return this._fuelBurned
  },
  set fuelBurned(x) {
    if (x.gt(this.fuel)) x = this.fuel
    this._fuelBurned = x
  },
  

  // --- computed ---

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
      calcForce(
        this.thrust,
        calcWeight(this.mass, this.distanceTraveled)
      ),
      this.mass
    ).to('km/h*h')
  },
})
