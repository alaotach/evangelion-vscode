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
		magiPanel.postMessage({
			type: 'update',
			errors: errs.length,
			warnings: warns.length,
			fileName: editor.document.fileName.split(/[\\/]/).pop()
		});
	}
	vscode.languages.onDidChangeDiagnostics(() => update());
	vscode.window.onDidChangeActiveTextEditor(() => update());
	vscode.workspace.onDidSaveTextDocument((doc) => {
		const fileName = doc.fileName.split(/[\\/]/).pop();
		SBI.text = `$(check) FILE SECURED — ${fileName}`;
		SBI.color = '#00FF88';
		magiPanel.postMessage({
			type: 'update',
			errors: 0,
			warnings: 0,
			fileName: doc.fileName.split(/[\\/]/).pop()
		});
		setTimeout(() => update(), 2000);
	});
	ctx.subscriptions.push(SBI);
}

class MagiPanel implements vscode.WebviewViewProvider {
	public static readonly viewType = 'nerv-view';
	private _view?: vscode.WebviewView;

	public postMessage(msg: object) {
		if (this._view) {
			this._view.webview.postMessage(msg);
		}
	}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = {enableScripts: true};
		webviewView.webview.html = `<!DOCTYPE html>
		<html>
		<head>
		<style>
		body {
			background: #000d0d;
			color: #00FF88;
			font-family: 'Courier New', monospace;
			margin: 0;
			padding: 10px;
			display: flex;
			flex-direction: column;
			min-height: 100vh;
			box-sizing: border-box;
			position: relative;
			overflow: hidden;
			animation: flick 0.16s infinite;
		}
		body::before {
			content: '';
			position: fixed;
			top: 0; left:0;
			width: 100%; height: 100%;
			background: repeating-linear-gradient( 0deg, rgba(0, 255, 136, 0.04) 0px, rgba(0, 255, 136, 0.04) 1px, transparent 2px, transparent 4px),linear-gradient(	0deg, transparent 0%, rgba(255, 255, 255, 0.07) 48%, transparent 52%, transparent 100%);
			pointer-events: none;
			z-index: 999;
			opacity: 0.55;
			background-size: 100% 4px, 100% 180px;
			animation: scan 6s linear infinite;
		}
		body::after {
			content: '';
			position: fixed;
			inset: 0;
			pointer-events: none;
			z-index: 998;
			background: radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.35) 100%), rgba(0, 255, 136, 0.03);
			mix-blend-mode: screen;
			animation: pulse 3.8s ease-in-out infinite;
		}
		@keyframes scan {
			0% { background-position: 0 0, 0 -180px; }
			100% { background-position: 0 0, 0 180px; }
		}
		@keyframes flick {
			0% { opacity: 0.98; }
			4% { opacity: 0.96; }
			8% { opacity: 0.99; }
			15% { opacity: 0.94; }
			20% { opacity: 1; }
			55% { opacity: 0.97; }
			80% { opacity: 0.95; }
			100% { opacity: 0.98; }
		}
		@keyframes pulse {
			0% { opacity: 0.35; }
			50% { opacity: 0.5; }
			100% { opacity: 0.35; }
		}
		.hdr {
			text-align: center;
			letter-spacing: 3px;
			font-size: 13px;
			font-weight: bold;
			text-shadow: 0 0 8px #00ff88;
			border-bottom: 1px solid #003322;
			padding-bottom: 8px;
			margin-bottom: 4px;
		}
		.sub {
			text-align: center;
			color: #004433;
			font-size: 9px;
			letter-spacing: 2px;
			margin-bottom: 10px;
		}
		.ticker {
			font-size: 22px;
			text-align: center;
			letter-spacing: 4px;
			text-shadow: 0 0 10px #00ff88;
			margin: 10px 0;
		}
		.box {
			border: 1px solid #003322;
			padding: 6px 8px;
			margin-top: 8px;
		}
		.log {
			margin-top: auto;
		}
		.box-lbl {
			color: #004433;
			font-size: 9px;
			letter-spacing: 2px;
			margin-bottom: 6px;
		}
		.three-col {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 4px;
		}
		.node {
			border: 1px solid #003322;
			padding: 4px;
			text-align: center;
		}
		.node-id { color: #004433; font-size: 8px }
		.node-state { color: #00ff88; font-size: 9px }
		.row {
			display: flex;
			justify-content: space-between;
			padding: 2px 0;
			border-bottom: 1px solid #001a0f;
		}
		.row:last-child { border-bottom: none }
		.lbl { color: #004433 }
		.err { color: #ff2200 }
		.warn { color: #ffaa00 }
		.ok { color: #00ff88 }
		
		</style>
		</head>
		<body>
		<div class="hdr">NERV SYSTEM</div>
		<div class="sub">SPECIAL AGENCY // MAGI INTERFACE</div>
		<div class="ticker" id="clock">00:00:00</div>
		<div class="box">
			<div class="box-lbl">MAGI SUPERCOMPUTER</div>
			<div class="three-col">
				<div class="node">
					<div class="node-id">MELCHIOR</div>
					<div class="node-state">ONLINE</div>
				</div>
				<div class="node">
					<div class="node-id">BALTHASAR</div>
					<div class="node-state">ONLINE</div>
				</div>
				<div class="node">
					<div class="node-id">CASPER</div>
					<div class="node-state">ONLINE</div>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="box-lbl">UNIT STATUS</div>
			<div class="row">
				<span class="lbl">ERRORS</span>
				<span class="err" id="errors">0</span>
			</div>
			<div class="row">
				<span class="lbl">WARNINGS</span>
				<span class="warn" id="warnings">0</span>
			</div>
			<div class="row">
				<span class="lbl">ACTIVE FILE</span>
				<span class="ok" id="file">NONE</span>
			</div>
		</div>
		<div class="box log">
			<div class="ticker">SYSTEM LOG</div>
			<div id="log" style="height:120px; overflow-y:auto; font-size:10px; l-height:1.8;">
				<div class="ok">NERV SYSTEM ONLINE</div>
				<div class="ok">MAGI: ALL UNITS NOMINAL</div>
			</div>
		</div>

		<script>
			setInterval(() => {
				const t = new Date().toLocaleTimeString('en-US', { hour12: false })
				document.getElementById('clock').textContent = t
			}, 1000)
			const log = document.getElementById('log');
			const maxll = 40;

			function pushLog(level, text) {
				const l = document.createElement('div');
				l.className = level;
				const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
				l.textContent = '[' + ts + '] ' + text;
				log.appendChild(l);
				while (log.children.length > maxll) {
					log.removeChild(log.firstElementChild);
				}
				log.scrollTop = log.scrollHeight;
			}

			window.addEventListener('message', e => {
				const msg = e.data;
				if (msg.type === 'update') {
					document.getElementById('errors').textContent = msg.errors;
					document.getElementById('warnings').textContent = msg.warnings;
					document.getElementById('file').textContent = msg.fileName || 'NONE';
					if (msg.errors > 0) {
						pushLog('err', ' ANGEL DETECTED IN ' + (msg.fileName || 'UNKNOWN'));
					} else if (msg.warnings > 0) {
						pushLog('warn', ' WARNING IN ' + (msg.fileName || 'UNKNOWN'));
					} else {
						pushLog('ok', ' ' + (msg.fileName || 'NONE') + ': NOMINAL');
					}
				}
			});
		</script>
		</body>
		</html>`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
