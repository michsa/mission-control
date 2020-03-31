// I didn't come up with this, but when I saw it I had to use it
// source: https://stackoverflow.com/a/19303725
module.exports = seed => () => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}
