module.exports = {
    truncateToDecimals: (number, decimals = 2) => Math.floor(number * 10 ** decimals) / 10 ** decimals,
}