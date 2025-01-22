import fs from "node:fs/promises";
import chalk from "chalk";
import path from "node:path";
import { readFile } from "node:fs";

const IGNORE = [
    "node_modules",
    ".git",
    "package.json",
    "package-lock.json",
    "output.txt"
  ];

function formatSize(bytes) {
    if (bytes === 0) return "0 Bytes";
  
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const readableSize = (bytes / Math.pow(1024, unitIndex)).toFixed(2);
  
    return `${readableSize} ${units[unitIndex]}`;
};

  
async function processTree(directory) {
    const result = {
        name: path.basename(directory),
        type: "folder",
        content: [],
        size: 0,
    };

    try {
        const files = await fs.readdir(directory, { withFileTypes: true });

        for (const file of files) {
            if (IGNORE.includes(file.name)) continue;

            const fullPath = path.join(directory, file.name);
            const stats = await fs.stat(fullPath);

            if (file.isDirectory()) {
                const folderData = await processTree(fullPath);
                result.content.push(folderData);
            } else if (file.isFile()) {
                result.content.push({
                    name: file.name,
                    type: "file",
                    content: null,
                    size: formatSize(stats.size),
                });
            }
        }
    } catch (error) {
        console.error(`Error processing directory: ${directory}`);
        console.error(error.message);
    }

    return result;
}

async function printTree(tree,indent = 0){
    if (tree.type === "folder") {
        console.log(chalk.green(`${"  ".repeat(indent)}📂 ${tree.name}`));
        for (const elem of tree.content) {
            printTree(elem,indent+1)
        }
    } else {
        console.log(chalk.gray(`${"  ".repeat(indent)}📄 ${tree.name} ${tree.size}`))
    }
}

async function outputPrint(tree) {
    console.log(`File and folder tree for : ${tree.name}`);
    printTree(tree);
}

async function outputFile(tree) {
    return;
}

//console.log(await processTree("./cli2text_specifications/src"));
// console.log(`File and folder tree for : ${tree.name}`)
outputPrint(await processTree("./"));



