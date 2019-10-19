module.exports = {
    matchGroupOrNull: (str, reg, mapper = v => v) => {
        const match = str.match(reg);
        if (!match) {
            return null;
        }
        return mapper(match[1]);
    }
}