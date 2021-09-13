/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as vscode from 'vscode';

export class CustomBuildTaskProvider implements vscode.TaskProvider {
	static CustomBuildScriptType = 'custombuildscript';
	private tasks: vscode.Task[] | undefined;

	// We use a CustomExecution task when state needs to be shared accross runs of the task or when 
	// the task requires use of some VS Code API to run.
	// If you don't need to share state between runs and if you don't need to execute VS Code API in your task, 
	// then a simple ShellExecution or ProcessExecution should be enough.
	// Since our build has this shared state, the CustomExecution is used below.
	private sharedState: string | undefined;

	constructor(private workspaceRoot: string) { }

	public async provideTasks(): Promise<vscode.Task[]> {
		return this.getTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		return this.getTask();
	}

	private getTasks(): vscode.Task[] {
		return [this.getTask()];
	}

	private getTask(): vscode.Task {
		const definition = {
			type: CustomBuildTaskProvider.CustomBuildScriptType
		};
		return new vscode.Task(definition, vscode.TaskScope.Workspace,'Test custom execution task',
			CustomBuildTaskProvider.CustomBuildScriptType, new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
				// When the task is executed, this callback will run. Here, we setup for running the task.
				vscode.window.showInformationMessage('Custom execution task started');
				return new CustomBuildTaskTerminal();
			}));
	}
}

class CustomBuildTaskTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		// Do nothing
	}

	close(): void {
		// Do nothing
	}
}