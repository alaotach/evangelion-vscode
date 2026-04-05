// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let SBI: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(ctx: vscode.ExtensionContext) {
	SBI = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
	SBI.text = '▸ MAGI: ALL UNITS NOMINAL';
	SBI.color = '#00FFFF';
	SBI.show();
	const magiPanel = new MagiPanel();
	ctx.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MagiPanel.viewType, magiPanel)
	);
	const update = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			SBI.text = '// Standby';
			SBI.color = '#00FFFF';
			return;
		}
		const diag = vscode.languages.getDiagnostics(editor.document.uri);
		const errs = diag.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
		const warns = diag.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
		if (errs.length > 0) {
            SBI.text = `$(error) ANGEL DETECTED — ${errs.length} ERROR${errs.length > 1 ? 'S' : ''}`;
            SBI.color = '#FF2200';
        } else if (warns.length > 0) {
            SBI.text = `$(warning) ALERT LVL YELLOW — ${warns.length} WARNING${warns.length > 1 ? 'S' : ''}`;
            SBI.color = '#FFAA00';
        } else {
            SBI.text = '// MAGI SYSTEM: NOMINAL';
            SBI.color = '#00FFFF';
        }
	}
	vscode.languages.onDidChangeDiagnostics(() => update());
	vscode.window.onDidChangeActiveTextEditor(() => update());
	vscode.workspace.onDidSaveTextDocument((doc) => {
		const fileName = doc.fileName.split(/[\\/]/).pop();
		SBI.text = `$(check) FILE SECURED — ${fileName}`;
		SBI.color = '#00FF88';
		setTimeout(() => update(), 2000);
	});
	ctx.subscriptions.push(SBI);
}

class MagiPanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'nerv-view';
	private _view?: vscode.WebviewView;

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {enableScripts: true};
		webviewView.webview.html = '<h1>NERV</h1>';
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
