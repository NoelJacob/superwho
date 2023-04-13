#!/usr/bin/env node
// index.ts
import {mkdir, writeFile, rm, readFile} from "fs/promises";
import {join} from "path";
import {Resolver} from "dns/promises";
var quit = () => {
  console.error("Usage: superwho <domain>");
  process.exit(1);
};
var domain = process.argv[2] || quit();
var api = await fetch("https://api.github.com/repos/zonedb/zonedb/commits?path=zones.txt");
var latestCommit = (await api.json())[0].sha;
var zoneFile = join(import.meta.dirname, "zone", latestCommit + ".txt");
var read;
try {
  read = await readFile(zoneFile, { encoding: "utf-8" });
} catch {
  await rm(join(import.meta.dirname, "zone"), { recursive: true, force: true });
  let api2 = await fetch(`https://raw.githubusercontent.com/zonedb/zonedb/${latestCommit}/zones.txt`);
  await mkdir(join(import.meta.dirname, "zone"), { recursive: true });
  await writeFile(zoneFile, await api2.text());
  read = await readFile(zoneFile, { encoding: "utf-8" });
}
var zones = read.split("\n");
var resolver = new Resolver;
resolver.setServers(["8.8.8.8"]);
for (let tld of zones) {
  let hostname = domain + "." + tld;
  await new Promise((resolve) => setTimeout(resolve, 29));
  resolver.resolveAny(hostname).catch((err) => {
    if (err.code == "ENOTFOUND") {
      console.log(hostname + "\t\thttps://tld-list.com/tld/" + tld);
    }
  });
}
