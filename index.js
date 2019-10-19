const fs = require('fs-extra');
const { Torrent } = require('./lib/torrent');


fs.removeSync('./ubuntu-download2/');

const torrent = new Torrent({
    torrentPath: './test_files/ubuntu.torrent',
    dirPath: './test_files/'
});


// TODO: MAGNETIC LINKS ARIA2c!! or magnetic link -> torrent (TPB)
// TODO CREATE TESTS FOR THIS ONE!
const stdouts = [
    '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [FileAlloc:#b21a4e 0B/2463842304B(0%)]',
    '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [FileAlloc:#b21a4e 93061120B/2463842304B(3%)]',
    '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [Checksum:#f4eb9a 0B/2463842304B(0%)]',
    '[#c66903 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [Checksum:#f4eb9a 128974848B/2463842304B(5%)]',
    '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B]',
    '[#1c1872 16384B/2463842304B(0%) CN:44 SD:2 DL:18919B ETA:36h10m30s]',
    '[#1c1872 16384B/2463842304B(0%) CN:44 SD:2 DL:2260B ETA:302h49m48s]',
    '[#40754c 0B/2463842304B(0%) CN:40 SD:0 DL:0B]',
    '[#40754c 63209472B/2463842304B(2%) CN:40 SD:33 DL:7213739B ETA:5m32s]',
    '[#599a25 SEED(0.0) CN:44 SD:8 UL:4345B(131072B)]',
    '[#599a25 SEED(0.0) CN:44 SD:0 UL:201299B(278528B)]',
    '[#599a25 SEED(0.0) CN:44 SD:0 UL:0B(2473984B)]',
    '10/18 04:00:00 [ERROR] CUID#2131 - Download aborted.',
    'blablabla [NOTICE] bla bla bla',
    '[#816461 SEED(0.0) CN:1 SD:0 UL:0B(60B)]',
    '[#816461 SEED(0.0) CN:1 SD:0 UL:12B(70B)]',
    '[#a189af SEED(0.0) CN:18 SD:0]',
]