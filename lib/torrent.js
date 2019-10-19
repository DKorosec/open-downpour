// https://aria2.github.io/manual/en/html/aria2c.html
const { spawn } = require('child_process');
const utils = require('./utils');
const fs = require('fs-extra');

const torrentStatusType = {
    initializing: 'initializing',
    downloading: 'downloading',
    seeding: 'seeding'
};

const mandatoryBinFlags = [
    '--truncate-console-readout=false',
    '--human-readable=false',
    '--enable-color=false'
];

// TODO: find aria npm package and mount from node_modules!
class Torrent {
    constructor({ torrentPath, dirPath }) {
        this.torrentPath = torrentPath;
        this.dirPath = dirPath;
    }

    onData(data, rawData) {
        console.log('ON DATA:');
        console.log(JSON.stringify(data, 0, 2));
        console.log('RAW:');
        console.log(rawData);
        console.log('-'.repeat(12))

    }

    onError(rawData) {
        console.error('ON ERROR RAW:');
        console.error(rawData);
        console.error('-'.repeat(12))
    }

    download() {
        const proc = spawn('./binaries/aria2c', [
            this.torrentPath,
            `--dir=${this.dirPath}`,
            '--summary-interval=0',
            '--allow-overwrite=true',
            '--file-allocation=prealloc',
            ...mandatoryBinFlags
        ]);
        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        proc.stdout.on('data', data => this.onData(this._parseAria2cTorrentStatusStdout(data), data));
        proc.stderr.on('data', data => this.onError(data));
        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        return proc;
    }

    seed() {
        if (!fs.existsSync(this.dirPath)) {
            throw new Error(`Directory '${this.dirPath}' does not exists`);
        }
        const proc = spawn('./binaries/aria2c', [
            this.torrentPath,
            `--dir=${this.dirPath}`,
            '-V',
            '--seed-ratio=0.0',
            '--summary-interval=0',
            ...mandatoryBinFlags
        ]);
        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        proc.stdout.on('data', data => this.onData(this._parseAria2cTorrentStatusStdout(data), data));
        proc.stderr.on('data', data => this.onError(data));
        proc.on('close', (code) => {
            proc.removeAllListeners();
            console.log(`child process exited with code ${code}`);
        });
        return proc;
    }

    _parseAria2cTorrentStatusStdout(stdout) {
        const ts = new Date();
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
                ts,
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
                ts,
                statusType: torrentStatusType.initializing,
                bytesProcessTotal,
                completionPercentage: utils.number.truncateToDecimals(bytesProcessed / bytesProcessTotal, useDecimalPlaces)
            };
        }
        const dlSpeedBytes = utils.parser.matchGroupOrNull(dataInfo, /DL:(\d+)B/, Number);
        const dlTotalBytes = utils.parser.matchGroupOrNull(dataInfo, /(\d+)B\/\d+B/, Number)
        return {
            ts,
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

module.exports = {
    Torrent,
    torrentStatusType
};