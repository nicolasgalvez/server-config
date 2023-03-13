#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const yargs = require('yargs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = async (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

const createCommand = async (argv) => {
    const serverName = await askQuestion('Enter the name of your server: ');
    const serverIP = await askQuestion('Enter the IP address of your server: ');
    const username = await askQuestion('Enter the username for your server: ');
    const sshKeyPath = await askQuestion('Enter the path to your SSH key file: ');
    const portNumber = await askQuestion('Enter the port number for your server (default is 22): ') || 22;
    const domainName = await askQuestion('Enter the domain name for your server: ');
    const type = argv.type;

    const config = {
        serverName,
        serverIP,
        username,
        sshKeyPath,
        portNumber,
        domainName,
        type
    };

    const configString = JSON.stringify(config, null, 2);

    const { output: outputPath } = yargs.options({
        output: {
            alias: 'o',
            description: 'Output path for the configuration file',
            type: 'string'
        }
    }).argv;

    const filename = `${serverName}-${type}-config.json`;
    const outputDir = outputPath ? path.resolve(outputPath) : process.cwd();
    const outputFilePath = path.join(outputDir, filename);

    await fs.writeFile(outputFilePath, configString);
    console.log(`Configuration file created: ${outputFilePath}`);

    rl.close();
};

const deleteCommand = async (argv) => {
    const { serverName, type } = argv;

    const filename = `${serverName}-${type}-config.json`;
    const filePath = path.join(process.cwd(), filename);

    try {
        await fs.unlink(filePath);
        console.log(`Configuration file deleted: ${filePath}`);
    } catch (error) {
        console.error(`Error deleting configuration file: ${error}`);
    }

    rl.close();
};

const argv = yargs
    .command('create', 'Create a new configuration file', (yargs) => {
        yargs.options({
            'type': {
                alias: 't',
                description: 'The type of configuration (dev, staging, or live)',
                type: 'string',
                choices: ['dev', 'staging', 'live'],
                demandOption: true
            }
        });
    }, createCommand)
    .command('delete', 'Delete an existing configuration file', (yargs) => {
        yargs.options({
            'server-name': {
                alias: 'n',
                description: 'The name of the server configuration file to delete',
                type: 'string',
                demandOption: true
            },
            'type': {
                alias: 't',
                description: 'The type of configuration (dev, staging, or live)',
                type: 'string',
                choices: ['dev', 'staging', 'live'],
                demandOption: true
            }
        });
    }, deleteCommand)
    .help()
    .alias('help', 'h')
    .argv;

if (!process.argv.slice(2).length) {
    yargs.showHelp();
    rl.close();
}
