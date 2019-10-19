const assert = require('assert');
const { aria2cTorrentStatusStdoutParser } = require('../lib/aria2c-stdout-parser');
const makeStruct = (input, output) => ({ input, output });

const inputsAndExpectedOutputs = [
    makeStruct(
        '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [FileAlloc:#b21a4e 0B/2463842304B(0%)]',
        {
            statusType: "initializing",
            sizeBytes: 2463842304,
            sizeBytesInitialization: 2463842304,
            bytesProcessed: 0,
            completionPercentage: 0
        }
    ),
    makeStruct(
        '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [FileAlloc:#b21a4e 93061120B/2463842304B(3%)]',
        {
            statusType: "initializing",
            sizeBytes: 2463842304,
            sizeBytesInitialization: 2463842304,
            bytesProcessed: 93061120,
            completionPercentage: 0.037
        }
    ),
    makeStruct(
        '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [Checksum:#f4eb9a 0B/2463842304B(0%)]',
        {
            statusType: "initializing",
            sizeBytes: 2463842304,
            sizeBytesInitialization: 2463842304,
            bytesProcessed: 0,
            completionPercentage: 0
        }
    ),
    makeStruct(
        '[#c66903 0B/2463842304B(0%) CN:0 SD:0 DL:0B] [Checksum:#f4eb9a 128974848B/2463842304B(5%)]',
        {
            statusType: "initializing",
            sizeBytes: 2463842304,
            sizeBytesInitialization: 2463842304,
            bytesProcessed: 128974848,
            completionPercentage: 0.052
        }
    ),
    makeStruct(
        '[#b21a4e 0B/2463842304B(0%) CN:0 SD:0 DL:0B]',
        {
            statusType: "downloading",
            sizeBytes: 2463842304,
            connections: 0,
            seeders: 0,
            download: {
                speedBytes: 0,
                totalBytes: 0,
                ETASeconds: null,
                completionPercentage: 0
            }
        }
    ),
    makeStruct(
        '[#1c1872 16384B/2463842304B(0%) CN:44 SD:2 DL:18919B ETA:36h10m30s]',
        {
            statusType: "downloading",
            sizeBytes: 2463842304,
            connections: 44,
            seeders: 2,
            download: {
                speedBytes: 18919,
                totalBytes: 16384,
                ETASeconds: 130230,
                completionPercentage: 0
            }
        }
    ),
    makeStruct(
        '[#1c1872 16384B/2463842304B(0%) CN:44 SD:2 DL:2260B ETA:302h49m48s]',
        {
            statusType: "downloading",
            sizeBytes: 2463842304,
            connections: 44,
            seeders: 2,
            download: {
                speedBytes: 2260,
                totalBytes: 16384,
                ETASeconds: 1090188,
                completionPercentage: 0
            }
        }
    ),
    makeStruct(
        '[#40754c 0B/2463842304B(0%) CN:40 SD:0 DL:0B]',
        {
            statusType: "downloading",
            sizeBytes: 2463842304,
            connections: 40,
            seeders: 0,
            download: {
                speedBytes: 0,
                totalBytes: 0,
                ETASeconds: null,
                completionPercentage: 0
            }
        }
    ),
    makeStruct(
        '[#40754c 63209472B/2463842304B(2%) CN:40 SD:33 DL:7213739B ETA:5m32s]',
        {
            statusType: "downloading",
            sizeBytes: 2463842304,
            connections: 40,
            seeders: 33,
            download: {
                speedBytes: 7213739,
                totalBytes: 63209472,
                ETASeconds: 333,
                completionPercentage: 0.025
            }
        }
    ),
    makeStruct(
        '[#599a25 SEED(0.0) CN:44 SD:8 UL:4345B(131072B)]',
        {
            statusType: "seeding",
            connections: 44,
            seeders: 8,
            upload: {
                speedBytes: 4345,
                totalBytes: 131072
            }
        }
    ),
    makeStruct(
        '[#599a25 SEED(0.0) CN:44 SD:0 UL:201299B(278528B)]',
        {
            statusType: "seeding",
            connections: 44,
            seeders: 0,
            upload: {
                speedBytes: 201299,
                totalBytes: 278528
            }
        }
    ),
    makeStruct(
        '[#599a25 SEED(0.0) CN:44 SD:0 UL:0B(2473984B)]',
        {
            statusType: "seeding",
            connections: 44,
            seeders: 0,
            upload: {
                speedBytes: 0,
                totalBytes: 2473984
            }
        }
    ),
    makeStruct(
        '10/18 04:00:00 [ERROR] CUID#2131 - Download aborted.',
        null
    ),
    makeStruct(
        'blablabla [NOTICE] bla bla bla',
        null
    ),
    makeStruct(
        '[#816461 SEED(0.0) CN:1 SD:0 UL:0B(60B)]',
        {
            statusType: "seeding",
            connections: 1,
            seeders: 0,
            upload: {
                speedBytes: 0,
                totalBytes: 60
            }
        }
    ),
    makeStruct(
        '[#816461 SEED(0.0) CN:1 SD:0 UL:12B(70B)]',
        {
            statusType: "seeding",
            connections: 1,
            seeders: 0,
            upload: {
                speedBytes: 12,
                totalBytes: 70
            }
        }
    ),
    makeStruct(
        '[#a189af SEED(0.0) CN:18 SD:0]',
        {
            statusType: "seeding",
            connections: 18,
            seeders: 0,
            upload: {
                speedBytes: null,
                totalBytes: null
            }
        }
    )
];

function parseStdoutToStructure() {
    console.log('testing parsing of stdout to structure');
    const pp = obj => JSON.stringify(obj, undefined, 2);
    for (const { input, output } of inputsAndExpectedOutputs) {
        const computedOutput = aria2cTorrentStatusStdoutParser(input);
        assert.deepStrictEqual(computedOutput, output, `aria2c parser is broken, fix it!\nInput:\n${input}\nOutput:\n${pp(computedOutput)}\nExpected output:\n${pp(output)}`);
    }
    console.log('ok');
}

module.exports = [
    parseStdoutToStructure
    //others
];

