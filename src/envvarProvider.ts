import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'fast-glob';
import * as fs from 'fs';
import { EOL } from 'os';

const findProjectDir = (fileName: string): string | null => {
    const dir = path.dirname(fileName);

    if (fs.existsSync(dir + '/package.json')) {
        return dir;
    } else {
        return dir === '/' ? null : findProjectDir(dir);
    }
};

const provider = {
    provideCompletionItems: async (
        document: vscode.TextDocument,
        position: vscode.Position
    ) => {
        console.debug('started providing');

        const linePrefix = document
            .lineAt(position)
            .text.slice(0, position.character);
        if (!linePrefix.endsWith('process.env.')) {
            return undefined;
        }

        console.log('we are there');

        // Directory path must be normalized for Glob to work on Windows.
        // See: https://github.com/isaacs/node-glob#windows
        const projectDir = findProjectDir(document.fileName)
            ?.split(path.sep)
            .join('/');
        let envvars = Object.entries(process.env);

        if (projectDir) {
            const files = await glob(`${projectDir}/**/.env?(.*)`, {
                dot: true,
            });

            files.forEach(file => {
                let fileContent;
                try {
                    fileContent = fs.readFileSync(file, { encoding: 'utf8' });
                } catch (err) {
                    // this is usually because the file doesn't exist,
                    // which may occur if the file is deleted between
                    // globbing and here.
                    return; // out of forEach callback
                }
                fileContent
                    .split(EOL)
                    // filter out comments
                    .filter(line => !line.trim().startsWith('#'))
                    .forEach(envvarLitteral => {
                        const splitted = envvarLitteral.split('=');
                        if (splitted.length > 1) {
                            envvars.push([splitted[0], splitted[1]]);
                        }
                    });
            });
        }

        return envvars.map(envvar => {
            const completion = new vscode.CompletionItem(
                envvar[0].trim(),
                vscode.CompletionItemKind.Variable
            );
            completion.documentation = envvar[1]?.trim();

            return completion;
        });
    },
};

export default provider;
