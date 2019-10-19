const fs = require('fs-extra');
const { Torrent } = require('./lib/torrent');

const torrentId = '?'
const dirPath = './test_files/sometorrent';
//fs.removeSync(dirPath);

// todo every torrent must have its directory ready
/*
torrents:
    TORRENT_A:
        - some_torrent_hash.torrent
        - torrent files...
*/
const torrent = new Torrent({
    torrentId,
    dirPath
});
async function main() {
    await torrent.startDownload();
}
main();

/*
Think about how the api would work...
every torrent instance should have a STATE, and communicate with database. Mongodb?
so every torrent "instance" would be loaded in memory from the database, and continue from his state (last written to db) - seeding -> continue seeding, downloading -> continue downloading
...
*/