
const utils = require('../utils');
const Aria2 = require('aria2');
const { spawn } = require('child_process');
const aria2cPath = require('get-aria2').aria2cPath();
const fs = require('fs-extra');
const { objectTransformer, properties } = require('./multicall-tell-mapper');

const TorrentIDType = {
    magnetUri: 'magnetUri',
    path: 'path',
    invalidPath: 'invalidPath',
    buffer: 'buffer',
    unknown: 'unknown'
}

class Aria2RPC {
    constructor(config = {}) {
        this.config = {
            ...{ secret: '', port: 6800 },
            ...config,
            ...{ secure: false, path: '/jsonrpc', host: 'localhost' }
        };
        this.arai2cProcHandle = null;
        this.rpc = new Aria2(config)
    }

    static TorrentIdToType(torrentId) {
        if (typeof torrentId === 'string') {
            if (utils.parser.isMagnetUri(torrentId)) {
                return TorrentIDType.magnetUri
            } else if (fs.pathExistsSync(torrentId)) {
                return TorrentIDType.path;
            }
            return TorrentIDType.invalidPath;
        } else if (torrentId instanceof Buffer) {
            return TorrentIDType.buffer;
        }
        return TorrentIDType.unknown;
    }

    async startServer() {
        // TODO: THIS ONE REQUIRES WORK
        /*
            what to do if server dies? setup again, .. nicer logs, (enable / disable), blablala
        */
        let resolveServerStart = null;
        const promiseServerInit = new Promise(resolve => { resolveServerStart = resolve });
        const { secret, port } = this.config;
        this.arai2cProcHandle = spawn(aria2cPath, [
            '--enable-rpc',
            '--truncate-console-readout=false',
            port ? `--rpc-listen-port=${port}` : '',
            secret ? `--rpc-secret=${secret}` : ''
        ].filter(entry => entry.length));

        this.arai2cProcHandle.stdout.setEncoding('utf8');
        this.arai2cProcHandle.stderr.setEncoding('utf8');
        this.arai2cProcHandle.stdout.on('data', utils.callback.passThroughIfStringInputNotEmpty(data => {
            console.log('ARIA2C SERVER LOG:', data);
            if ((resolveServerStart instanceof Function) && data.includes(`listening on TCP port ${port}`)) {
                resolveServerStart();
                resolveServerStart = null;
            }
        }));
        this.arai2cProcHandle.stderr.on('data', utils.callback.passThroughIfStringInputNotEmpty(data => {
            console.error('ARIA2C SERVER ERROR:', data);
        }));
        this.arai2cProcHandle.on('close', (code) => {
            console.warn(`ARIA2C SERVER DIED, HANDLE RESTART OF IT ${code}`);
        });
        return await promiseServerInit;
    }

    async downloadTorrent(torrentId, dir) {
        switch (Aria2RPC.TorrentIdToType(torrentId)) {
            case TorrentIDType.magnetUri:
                return await this.rpc.call('addUri', [torrentId], {
                    dir: utils.fs.ensureDirectorySync(dir),
                    'bt-save-metadata': 'true',
                    'allow-overwrite': 'true'
                });
            case TorrentIDType.path:
                torrentId = fs.readFileSync(torrentId, { encoding: null });
            case TorrentIDType.buffer:
                return await this.rpc.call(
                    'addTorrent', torrentId.toString('base64'), [], {
                    dir: utils.fs.ensureDirectorySync(dir),
                    'bt-save-metadata': 'true',
                    'allow-overwrite': 'true'
                });
            case TorrentIDType.invalidPath:
                throw new Error('Invalid path given as torren id');
            case TorrentIDType.unknown:
            default:
                throw new Error('Unknown torrent id given. Must be "magnetUri", "path" or "buffer"');
        }
    }

    async getAllTellStates({ asArray = false } = {}) {
        const [[tellActive], [tellWaiting], [tellStopped]] = await this.rpc
            .multicall([
                ['tellActive', properties],
                ['tellWaiting', 0, Number.MAX_SAFE_INTEGER, properties],
                ['tellStopped', 0, Number.MAX_SAFE_INTEGER, properties]
            ]);
        const data = {
            tellActive: tellActive.filter(s => !s.followedBy).map(objectTransformer),
            tellWaiting: tellWaiting.filter(s => !s.followedBy).map(objectTransformer),
            tellStopped: tellStopped.filter(s => !s.followedBy).map(objectTransformer)
        };
        if (!asArray) {
            return data;
        }
        return Object.entries(data).map(([key, value]) => {
            value.forEach(v => v.tellType = key);
            return value;
        }).reduce((acc, c) => [...acc, ...c], []);
    }

    async startClient() {
        await this.rpc.open();
    }
}

module.exports = {
    Aria2RPC,
    TorrentIDType
};