import {mkdir, writeFile, rm, readFile} from 'fs/promises';
import {join} from 'path';
import {Resolver} from 'dns/promises';

let quit = () => {
    console.error('Usage: superwho <domain>');
    process.exit(1);
};
let domain: string = process.argv[2] || quit();
let api = await fetch('https://api.github.com/repos/zonedb/zonedb/commits?path=zones.txt');
// @ts-ignore
let latestCommit: string = (await api.json())[0].sha;
let zoneFile = join(import.meta.dirname, 'zone', latestCommit + '.txt');
let read;
try {
    read = await readFile(zoneFile, {encoding: 'utf-8'});
} catch {
    await rm(join(import.meta.dirname, 'zone'), {recursive: true, force: true});
    let api = await fetch(`https://raw.githubusercontent.com/zonedb/zonedb/${latestCommit}/zones.txt`);
    await mkdir(join(import.meta.dirname, 'zone'), {recursive: true});
    await writeFile(zoneFile, await api.text());
    read = await readFile(zoneFile, {encoding: 'utf-8'});
}
let zones = read.split('\n');
let resolver = new Resolver();
resolver.setServers(['8.8.8.8']);
for (let tld of zones) {
    let hostname = domain + '.' + tld;
    await new Promise(resolve => setTimeout(resolve, 29));
    resolver.resolveAny(hostname).catch((err) => {
        if (err.code == 'ENOTFOUND') {
            console.log(hostname + "\t\t" + 'https://tld-list.com/tld/' + tld);
        }
    });
}
