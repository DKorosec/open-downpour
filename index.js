const fs = require('fs-extra');
const { Torrent } = require('./lib/torrent');


fs.removeSync('./ubuntu-download2/');

const torrent = new Torrent({
    torrentPath: './test_files/ubuntu.torrent',
    dirPath: './test_files/'
});

// TODO: MAGNETIC LINKS ARIA2c!! or magnetic link -> torrent (TPB)