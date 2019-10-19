// https://aria2.github.io/manual/en/html/aria2c.html
const { spawn } = require('child_process');
const { aria2cTorrentStatusStdoutParser, torrentStatusType } = require('./aria2c-stdout-parser');
const fs = require('fs-extra');



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
        proc.stdout.on('data', data => this.onData(aria2cTorrentStatusStdoutParser(data), data));
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
        proc.stdout.on('data', data => this.onData(aria2cTorrentStatusStdoutParser(data), data));
        proc.stderr.on('data', data => this.onError(data));
        proc.on('close', (code) => {
            proc.removeAllListeners();
            console.log(`child process exited with code ${code}`);
        });
        return proc;
    }
}

module.exports = {
    Torrent,
    torrentStatusType
};