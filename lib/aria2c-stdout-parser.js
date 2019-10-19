const utils = require('./utils');


const torrentStatusType = {
    initializing: 'initializing',
    downloading: 'downloading',
    seeding: 'seeding'
};

module.exports = {
    torrentStatusType,
    aria2cTorrentStatusStdoutParser(stdout) {
        const regFindDataInfo = /\[#\w{6} .+\]/;
        const dataInfoMatch = stdout.match(regFindDataInfo);
        const useDecimalPlaces = 3;
        if (!dataInfoMatch) {
            return null;
        }
        const dataInfo = dataInfoMatch[0];
        const isSeeding = dataInfo.includes(' SEED');
        const connections = utils.parser.matchGroupOrNull(dataInfo, /CN:(\d+)/, Number);
        const seeders = utils.parser.matchGroupOrNull(dataInfo, /SD:(\d+)/, Number);
        const sizeBytes = utils.parser.matchGroupOrNull(dataInfo, /\d+B\/(\d+)B/, Number);
        if (isSeeding) {
            return {
                statusType: torrentStatusType.seeding,
                connections,
                seeders,
                upload: {
                    speedBytes: utils.parser.matchGroupOrNull(dataInfo, /UL:(\d+)B\(\d+B\)/, Number),
                    totalBytes: utils.parser.matchGroupOrNull(dataInfo, /UL:\d+B\((\d+)B\)/, Number)
                }
            }
        }
        const isInitializing = stdout.includes('[FileAlloc:');
        const isChecksumming = stdout.includes('[Checksum:');
        if (isInitializing || isChecksumming) {
            const regCaptureBytesProgress = /\[((FileAlloc:#\w{6})|(Checksum:#\w{6})) (\d+)B\/(\d+)B/;
            const bytesProgressMatch = stdout.match(regCaptureBytesProgress);
            const [bytesProcessed, bytesProcessTotal] = [Number(bytesProgressMatch[4]), Number(bytesProgressMatch[5])];
            return {
                statusType: torrentStatusType.initializing,
                bytesProcessTotal,
                completionPercentage: utils.number.truncateToDecimals(bytesProcessed / bytesProcessTotal, useDecimalPlaces)
            };
        }
        const dlSpeedBytes = utils.parser.matchGroupOrNull(dataInfo, /DL:(\d+)B/, Number);
        const dlTotalBytes = utils.parser.matchGroupOrNull(dataInfo, /(\d+)B\/\d+B/, Number)
        return {
            statusType: torrentStatusType.downloading,
            sizeBytes,
            connections,
            seeders,
            download: {
                speedBytes: dlSpeedBytes,
                totalBytes: dlTotalBytes,
                ETASeconds: !dlSpeedBytes || !dlTotalBytes ? null : Math.round((sizeBytes - dlTotalBytes) / dlSpeedBytes),
                completionPercentage: utils.number.truncateToDecimals(dlTotalBytes / sizeBytes, useDecimalPlaces)
            }
        }
    }
}
