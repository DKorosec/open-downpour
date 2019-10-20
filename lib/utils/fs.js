const fs = require('fs-extra');

module.exports = {
    ensureDirectorySync: dir => {
        fs.ensureDirSync(dir);
        return dir;
    }
};