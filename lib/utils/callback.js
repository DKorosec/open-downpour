module.exports = {
    passThroughIfStringInputNotEmpty: (callback) => str => str.trim().length !== 0 && callback(str),
};