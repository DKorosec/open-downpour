const fs = require('fs-extra');
const { Aria2RPC } = require('./lib/aria2-rpc');

async function main() {

    const randomHex = len => new Array(len).fill(0).map(() => '0123456789ABCDEF'.split('')[~~(Math.random() * 16)]).join('');
    const ariaRPC = new Aria2RPC({
        port: 6866,
        secret: randomHex(10)
    });

    console.log('starting server');
    await ariaRPC.startServer();
    console.log('starting client');
    await ariaRPC.startClient();
    console.log('everything works, woow much woow, nice job dude!');

    const guids = []
    const magnets = [
        '?',
        '?',
        '?',
    ];

    for (let i = 0; i < magnets.length; i++) {
        console.log('pushing download', i)
        guids.push(await ariaRPC.downloadTorrent(
            magnets[i],
            `./downloads/ricknmorty_${i}/`
        ));
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('RPC ALL DOWNLOADS CALL:');

    const ret = await ariaRPC.getAllTellStates({ asArray: true });
    console.log('RPC RESPONSE:', JSON.stringify(ret, null, 2));

    fs.writeFileSync('./test_files/output-analyse.json', JSON.stringify(ret, null, 2), 'utf8');
    process.exit(0);



    /*
    ->use mutlicalls!
    The secret token validation in aria2 is designed to take at least 
    a certain amount of time to mitigate brute-force/dictionary 
    attacks against the RPC interface. Therefore it is recommended 
    to prefer Batch or system.multicall requests when appropriate.
    
    THINK AROUND SESSIONS AND HOW DO THEY WORK IN ARIA2C
    SESSION:
    save-session=/home/pi/Desktop/aria.txt
    input-file=/home/pi/Desktop/aria.txt
    */

    /*
    Think about how the api would work...
    every torrent instance should have a STATE, and communicate with database. Mongodb?
    so every torrent "instance" would be loaded in memory from the database, and continue from his state (last written to db) - seeding -> continue seeding, downloading -> continue downloading
    ...
    */

    /*
    const express = require('express')
    const app = express()

    app.get('/', function (req, res) {
        // aria2.getVersion([secret]) 
    })

    app.listen(3000);
    */
}

main();

