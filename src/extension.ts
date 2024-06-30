// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

interface SelectOptionItem {
    name: string;
    url: string;
    order?: number;
}

interface SelectOptionItem2 {
    name: string;
    url: string;
    order: number;
}

function getOpenedProjectPaths() {
    const data = fs.readFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path.txt', 'utf8');
    const dataArrStr = data.split('\n').join('');
    const dataArr = JSON.parse(dataArrStr);
    return dataArr as string[];
}

function getProjectMapPath() {
    const data = fs.readFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path-map.json', 'utf8');
    const dataArrStr = data.split('\n').join('');
    const workspacePathMap = JSON.parse(dataArrStr);
    return workspacePathMap as SelectOptionItem[];
}

function overwriteOpenedProjectPaths(newPaths: string[] = []) {
    const uniqNewPaths = Array.from(new Set(newPaths));
    fs.writeFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path.txt', JSON.stringify(uniqNewPaths), 'utf8');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
        if(vscode.workspace.workspaceFolders !== undefined) {
            const wf = vscode.workspace.workspaceFolders[0].uri.path ;
            const f = vscode.workspace.workspaceFolders[0].uri.fsPath ;

            const openedProjectPaths = getOpenedProjectPaths();
            overwriteOpenedProjectPaths([...openedProjectPaths, wf]);
            // fs.appendFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path.txt', wf + '\n', 'utf8');
        
            // const message = `YOUR-EXTENSION: folder: ${wf} - ${f}` ;
        
            // vscode.window.showInformationMessage(message);
        }

        // const options = ['1', '2', '3'];
        // const selectedItem = await vscode.window.showQuickPick(
        //     options,
        //     {
        //         canPickMany: false,
        //         ignoreFocusOut: true,
        //         matchOnDescription: true,
        //         matchOnDetail: true,
        //         placeHolder: '请选择一个空间',
        //     });

        // if (selectedItem) {
        //     vscode.window.showInformationMessage(selectedItem);
        //     // const displayName = selectedItem.split(/\s+/)[1];

        //     // if (workspaceList?.length > 0) {
        //     //     const { realPath = '' } = workspaceList.find(v => v.displayName === displayName) ?? {};
        //     //     const folderUri = vscode.Uri.file(realPath);
        //     //     vscode.commands.executeCommand('vscode.openFolder', folderUri);
        //     // }
        // }
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World!');
	// });

    const disposable = vscode.commands.registerCommand('extension.helloWorld', async function () {
        const openedProjectPaths = getOpenedProjectPaths();
        const projectMapPath = getProjectMapPath();
        const selectPath1: SelectOptionItem2[] = [];
        const selectPath2: SelectOptionItem[] = [];

        openedProjectPaths.forEach(openedProjectPath => {
            const targetMapPathIndex = projectMapPath.findIndex(item => item.url === openedProjectPath);
            if (targetMapPathIndex > -1) {
                selectPath1.push({
                    ...projectMapPath[targetMapPathIndex],
                    order: targetMapPathIndex
                });
            } else {
                const lastSlashIndex = openedProjectPath.lastIndexOf('/');
                const name = openedProjectPath.substring(lastSlashIndex + 1);
                selectPath2.push({
                    name,
                    url: openedProjectPath,
                    order: 200
                });
            }
        });

        selectPath1.sort((a, b) => a.order - b.order);
        const optionMaps = [...selectPath1, ...selectPath2];
        const options = optionMaps.map((item, index) => (index + 1) + '. ' + item.name);

        const selectedItem = await vscode.window.showQuickPick(
            options,
            {
                canPickMany: false,
                ignoreFocusOut: true,
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: '请选择一个空间',
            });

        if (selectedItem) {
            vscode.window.showInformationMessage(selectedItem);
            // const displayName = selectedItem.split(/\s+/)[1];

            // if (workspaceList?.length > 0) {
            //     const { realPath = '' } = workspaceList.find(v => v.displayName === displayName) ?? {};
            const realName = selectedItem.replace(/^\d+\.\s/, '');
            const realPath = optionMaps.find(item => item.name === realName)?.url;
            const folderUri = vscode.Uri.file(realPath!);
            vscode.commands.executeCommand('vscode.openFolder', folderUri);
            // }
        }
    });

	context.subscriptions.push(disposable);
}

export function deactivate() {
    if(vscode.workspace.workspaceFolders !== undefined) {
        const wf = vscode.workspace.workspaceFolders[0].uri.path ;
        const f = vscode.workspace.workspaceFolders[0].uri.fsPath ;
        const openedProjectPaths1 = getOpenedProjectPaths();
        const openedProjectPaths2 = openedProjectPaths1.filter(item => item !== wf);
        overwriteOpenedProjectPaths(openedProjectPaths2);
        // const data = fs.readFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path.txt', 'utf8');
        // const dataArr = data.split('\n');
        // const newData = dataArr.filter(line => line !== wf +'\n').join('\n');
        // fs.writeFileSync('/Users/haohailiang/Desktop/vscode-extension-demo/helloworld-sample/workspace-path.txt', newData + '\n', 'utf8');
    }
	// Everything is nicely registered in context.subscriptions,
	// so nothing to do for now.
}
