module.exports = {
    matchGroupOrNull: (str, reg, mapper = v => v) => {
        const match = str.match(reg);
        if (!match) {
            return null;
        }
        return mapper(match[1]);
    },
    isMagnetUri: str => str.startsWith('magnet:?'),
    convertToBoolean: str => str.toLowerCase().trim() === 'true',
    convertToNumber: str => Number(str)
}