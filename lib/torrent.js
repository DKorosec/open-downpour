// https://aria2.github.io/manual/en/html/aria2c.html
const fs = require('fs-extra');
const utils = require('./utils');
const util = require('util');
const path = require('path');
const { spawn, execFile } = require('child_process');
const aria2cPath = require('get-aria2').aria2cPath();
const { aria2cTorrentStatusStdoutParser, torrentStatusType } = require('./aria2c-stdout-parser');
const execFileAsync = util.promisify(execFile);

const mandatoryBinFlags = [
    '--truncate-console-readout=false',
    '--human-readable=false',
    '--enable-color=false'
];

class Torrent {
    constructor({ torrentId, dirPath }) {
        this.torrentId = torrentId;
        this.dirPath = dirPath;
    }

    get torrentPath() {
        return path.join(this.dirPath, this.torrentId);
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

    async startDownload() {
        if (utils.parser.isMagnetUri(this.torrentId)) {
            this.torrentId = await Torrent.MagnetUri2Torrent(this.torrentId, this.dirPath);
        }
        const proc = spawn(aria2cPath, [
            this.torrentPath,
            `--dir=${this.dirPath}`,
            '-V',
            '--summary-interval=0',
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
    }

    stopDownload() {
        throw new Error('Not implemented');
    }

    startSeed() {
        if (utils.parser.isMagnetUri(this.torrentPath)) {
            throw new Error('magnet uri not allowed as torrentPath in seed() method');
        }
        if (!fs.existsSync(this.dirPath)) {
            throw new Error(`Directory '${this.dirPath}' does not exists`);
        }
        const proc = spawn(aria2cPath, [
            this.torrentPath,
            `--dir=${this.dirPath}`,
            '-V',
            '--summary-interval=0',
            '--seed-ratio=0.0',
            ...mandatoryBinFlags
        ]);
        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        proc.stdout.on('data', data => this.onData(aria2cTorrentStatusStdoutParser(data), data));
        proc.stderr.on('data', data => this.onError(data));
        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    stopSeed() {
        throw new Error('Not implemented');
    }

    static async MagnetUri2Torrent(magnetUri, dirPath) {
        fs.ensureDirSync(dirPath);
        const { stdout, stderr } = await execFileAsync(aria2cPath, [
            magnetUri,
            `--dir=${dirPath}`,
            '--bt-metadata-only=true',
            '--bt-save-metadata=true',
            ...mandatoryBinFlags
        ]);
        const debugErrorMsg = `stdout:\n${stdout}.\nstderr:\n${stderr}`;
        const createdTorrentMatch = stdout.match(/\w+\.torrent/);
        if (!createdTorrentMatch) {
            throw new Error(`Could not convert magnetUri to torrent.\n${debugErrorMsg}`);
        }
        const desiredTorrentFile = createdTorrentMatch[0];
        const torrentFile = fs.readdirSync(dirPath).find(entry => entry === desiredTorrentFile);
        if (!torrentFile) {
            throw new Error(`Could not find the torrent file '${desiredTorrentFile}'.\n${debugErrorMsg}`);
        }
        return torrentFile;
    }
}

module.exports = {
    Torrent,
    torrentStatusType
};