import { TextEncoder, TextDecoder } from 'text-encoding';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

import $ from 'jquery';

export default class GLTerminal {
  constructor(options = {}) {
    // Use polyfilled text-encoding if not available
    this.TextDecoder = window.TextDecoder || TextDecoder;
    this.TextEncoder = window.TextEncoder || TextEncoder;

    if (!Object.prototype.hasOwnProperty.call(this.options, 'cursorBlink')) {
      this.options.cursorBlink = true;
    }

    if (!Object.prototype.hasOwnProperty.call(this.options, 'screenKeys')) {
      this.options.screenKeys = true;
    }

    this.container = document.querySelector(options.selector);

    this.setSocketUrl();
    this.createTerminal();
    $(window).off('resize.terminal').on('resize.terminal', () => {
      this.terminal.fit();
    });
  }

  setSocketUrl() {
    const { protocol, hostname, port } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss://' : 'ws://';
    const path = this.container.dataset.projectPath;

    this.socketUrl = `${wsProtocol}${hostname}:${port}${path}`;
  }

  createTerminal() {
    Terminal.applyAddon(fit);
    this.terminal = new Terminal(this.options);
    this.socket = new WebSocket(this.socketUrl, ['terminal.gitlab.com']);
    this.socket.binaryType = 'arraybuffer';

    this.terminal.open(this.container);
    this.socket.onopen = () => { this.runTerminal(); };
    this.socket.onerror = () => { this.handleSocketFailure(); };
  }

  runTerminal() {
    const decoder = new this.TextDecoder('utf-8');
    const encoder = new this.TextEncoder('utf-8');

    this.terminal.on('data', (data) => {
      this.socket.send(encoder.encode(data));
    });

    this.socket.addEventListener('message', (ev) => {
      this.terminal.write(decoder.decode(ev.data));
    });

    this.isTerminalInitialized = true;
    this.terminal.fit();
  }

  handleSocketFailure() {
    this.terminal.write('\r\nConnection failure');
  }
}
