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
            SBI.color = 'var(--vscode-terminal-ansiRed)';
        } else if (warns.length > 0) {
            SBI.text = `$(warning) ALERT LVL YELLOW — ${warns.length} WARNING${warns.length > 1 ? 'S' : ''}`;
            SBI.color = 'var(--vscode-terminal-ansiYellow)';
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
		SBI.color = 'var(--vscode-terminal-ansiGreen)';
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
			background: var(--vscode-sideBar-background)
			color: var(--vscode-terminal-ansiGreen)
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
		.hex-bg {
			position: fixed;
			top: 0; left: 0;
			width: 100%; height: 100%;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='none' stroke='%23333333' stroke-width='0.3' opacity='0.12'%3E%3Cpolygon points='14,1 27,8 27,22 14,29 1,22 1,8'/%3E%3Cpolygon points='14,29 27,36 27,50 14,57 1,50 1,36'/%3E%3C/g%3E%3C/svg%3E");
			pointer-events: none;
			z-index: 0;
		}
		.hdr {
			position: relative;
			text-align: center;
			animation: glitch 6s infinite;
		}
		.hdr::before {
			content: 'NERV SYSTEM';
			position: absolute;
			left: 0; right: 0;
			color: var(--vscode-terminal-ansiRed);
			opacity: 0;
			animation: glitch-red 6s infinite;
		}
		@keyframes glitch {
			0%, 94%, 100% { transform: none; }
			95% { transform: translateX(-2px); }
			96% { transform: translateX(2px); }
			97% { transform: none; }
		}
		@keyframes glitch-red {
			0%, 94%, 100% { opacity: 0; }
			95% { opacity: 0.5; transform: translateX(3px); }
			97% { opacity: 0; }
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
		.sub {
			text-align: center;
			color: var(--vscode-sideBarTitle-foreground);
			font-size: 9px;
			letter-spacing: 2px;
			margin-bottom: 10px;
		}
		.ticker {
			font-size: 22px;
			text-align: center;
			letter-spacing: 4px;
			text-shadow: 0 0 10px var(--vscode-terminal-ansiGreen);
			margin: 10px 0;
		}
		.box {
			position: relative;
			border: 1px solid var(--vscode-sideBar-border);
			padding: 6px 8px;
			margin-top: 8px;
		}
		.box::before {
			content: '◤';
			position: absolute;
			top: -1px; left: -1px;
			color: var(--vscode-terminal-ansiGreen);
			font-size: 9px;
			line-height: 1;
		}
		.box::after {
			content: '◥';
			position: absolute;
			top: -1px; right: -1px;
			color: var(--vscode-terminal-ansiGreen);
			font-size: 9px;
			line-height: 1;
		}
		.log {
			margin-top: auto;
		}
		.panel {
			position: relative;
			z-index: 1;
			display: flex;
			flex-direction: column;
			min-height: 100%;
		}
		.box-lbl {
			color: var(--vscode-sideBarTitle-foreground);
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
			border: 1px solid var(--vscode-sideBar-border);
			padding: 4px;
			text-align: center;
			position: relative;
			overflow: hidden;
		}
		.node::after {
			content: '';
			position: absolute;
			top: 0; left: -100%;
			width: 100%; height: 100%;
			background: linear-gradient(90deg, transparent, rgba(0,255,136,0.1), transparent);
			animation: sweep 3s infinite;
		}
		.node:nth-child(2)::after { animation-delay: 1s; }
		.node:nth-child(3)::after { animation-delay: 2s; }
		@keyframes sweep {
			0% { left: -100%; }
			100% { left: 100%; }
		}
		.node-id { color: var(--vscode-sideBarTitle-foreground); font-size: 8px }
		.node-state { color: var(--vscode-terminal-ansiGreen); font-size: 9px }
		.row {
			display: flex;
			justify-content: space-between;
			padding: 2px 0;
			border-bottom: 1px solid var(--vscode-editor-lineHighlightBackground);
		}
		.row:last-child { border-bottom: none }
		.lbl { color: var(--vscode-sideBarTitle-foreground) }
		.err { color: var(--vscode-terminal-ansiRed) }
		.warn { color: var(--vscode-terminal-ansiYellow) }
		.ok { color: var(--vscode-terminal-ansiGreen) }

		.atf {
			height: 3px;
			background: linear-gradient(90deg, var(--vscode-terminal-ansiGreen), var(--vscode-terminal-ansiCyan), var(--vscode-terminal-ansiYellow), var(--vscode-terminal-ansiCyan), var(--vscode-terminal-ansiGreen));
			background-size: 200% 100%;
			animation: atf 2s linear infinite;
			margin: 8px 0;
		}
		@keyframes atf {
			0% { background-position: 200% 0; }
			100% { background-position: -200% 0; }
		}
		@keyframes alertblink {
			0%, 100% { border-color: var(--vscode-terminal-ansiRed); }
			50% { border-color: transparent; }
		}
		.bin {
			font-size: 7px;
			color: var(--vscode-sideBar-border);
			letter-spacing: 1px;
			overflow: hidden;
			white-space: nowrap;
			animation: bin 12s linear infinite;
		}
		@keyframes bin {
			0% { transform: translateX(100%); }
			100% { transform: translateX(-100%); }
		}
		@keyframes blink {
			0%, 100% { opacity: 1; }
			50% { opacity: 0; }
		}
		#cursor { animation: blink 1s infinite; }
		
		</style>
		</head>
		<body>
		<div class="hex-bg"></div>
		<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:60px; color:rgba(128,128,128,0.03); font-weight:bold; letter-spacing:8px; pointer-events:none; z-index:0; white-space:nowrap;">NERV</div>
		<div class="panel">
		<div class="hdr">NERV SYSTEM</div>
		<div class="sub">SPECIAL AGENCY // MAGI INTERFACE</div>
		<div style="text-align:center; color:var(--vscode-sideBar-border); font-size:8px; letter-spacing:1px; margin-top:-8px; margin-bottom:6px;">特務機関ネルフ — 人工進化研究所</div>
		<div class="ticker" id="clock">00:00:00</div>
		<div id="hex-counter" style="text-align:center; font-size:8px; color:var(--vscode-sideBar-border); letter-spacing:2px;">0x00000000</div>
		<div class="atf"></div>
		<div style="display:flex; justify-content:space-between; font-size:8px; margin-top:2px;">
			<span style="color:var(--vscode-sideBarTitle-foreground); letter-spacing:1px;">AT FIELD INTEGRITY</span>
			<span style="color:var(--vscode-terminal-ansiCyan);" id="atf-pct">100%</span>
		</div>
		<div class="bin">01001110 01000101 01010010 01010110 00100000 01010011 01011001 01010011</div>
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

		<div id="alert-box" style="display:none; border:1px solid var(--vscode-terminal-ansiRed); padding:4px 8px; background:rgba(255,34,0,0.05); animation:alertblink 1s infinite;">
			<div style="color:var(--vscode-terminal-ansiRed); font-size:9px; letter-spacing:2px; text-align:center; text-shadow:0 0 8px var(--vscode-terminal-ansiRed);">⚠ 使徒検知 — ANGEL DETECTED ⚠</div>
			<div style="color:var(--vscode-terminal-ansiRed); font-size:7px; text-align:center; opacity:0.6;">警戒レベル: レッド — ALERT LEVEL: RED</div>
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
			<div class="row" style="flex-direction:column; gap:3px;">
				<div style="display:flex; justify-content:space-between;">
					<span class="lbl">SYNC RATE</span>
					<span class="ok" id="sync">--.--%</span>
				</div>
				<div style="height:3px; background:var(--vscode-editor-lineHighlightBackground); width:100%;">
					<div id="sync-bar" style="height:100%; background:var(--vscode-terminal-ansiGreen); width:0%; transition:width 0.5s; box-shadow:0 0 6px var(--vscode-terminal-ansiGreen);"></div>
				</div>
			</div>
			<div class="row">
				<span class="lbl">PILOT</span>
				<span class="ok" id="pilot-display">IKARI, S.</span>
			</div>
			<div class="row">
				<span class="lbl">EVA UNIT</span>
				<span class="ok" id="unit-display">UNIT-01</span>
			</div>
		</div>
		<div class="box log">
			<div class="ticker">SYSTEM LOG</div>
			<div id="log" style="height:120px; overflow-y:auto; font-size:10px; l-height:1.8;">
				<div class="ok">NERV SYSTEM ONLINE</div>
				<div class="ok">MAGI: ALL UNITS NOMINAL</div>
				<div class="ok" id="cursor-line">// AWAITING INPUT<span id="cursor">_</span></div>
			</div>
		</div>
		</div>

		<script>
			setInterval(() => {
				const t = new Date().toLocaleTimeString('en-US', { hour12: false })
				document.getElementById('clock').textContent = t
			}, 1000)
			setInterval(() => {
				const sync = (70 + Math.random() * 30).toFixed(1);
				document.getElementById('sync').textContent = sync + '%';
				document.getElementById('sync-bar').style.width = sync + '%';
			}, 3000);
			setInterval(() => {
				const hex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
				document.getElementById('hex-counter').textContent = '0x' + hex;
			}, 500);
			setInterval(() => {
				const atf = (95 + Math.random() * 5).toFixed(0);
				document.getElementById('atf-pct').textContent = atf + '%';
			}, 4000);
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
					const alertBox = document.getElementById('alert-box');
					alertBox.style.display = msg.errors > 0 ? 'block' : 'none';
				}
			});
			
		</script>
		</body>
		</html>`;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
