'use babel';

import HydrogenExectimeView from './hydrogen-exectime-view';
import { CompositeDisposable, Disposable } from 'atom';


class Middleware {
  execute(
    next,
    code,
    onResults
  ) {
    console.log(typeof code);

    var header_code = `
import time as _exectime
_exectimet0 = _exectime.time()
`

    var footer_code = `
print("{:.2f} seconds".format(_exectime.time() - _exectimet0))
`

    var wrapped_code = header_code + code + footer_code
    next.execute(wrapped_code, (message, channel) => {
        onResults(message, channel);
      }
    );
  }
}


export default {

  hydrogenExectimeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {

    atom.notifications.addSuccess('activate..');
    this.hydrogenExectimeView = new HydrogenExectimeView(state.hydrogenExectimeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.hydrogenExectimeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hydrogen-Exectime:toggle': () => this.toggle()
    }));
  },

  consumeHydrogen(hydrogen) {
    atom.notifications.addSuccess('Consume hydrogen..');

    this.hydrogen = hydrogen;

    this.hydrogen.onDidChangeKernel(kernel => {
      if (!kernel) return;

      // attachMiddleware
      const middleware = new Middleware();
      kernel.addMiddleware(middleware);
    });

    atom.notifications.addSuccess('kernel attached..');

    return new Disposable(() => {
      this.hydrogen = null;
    });
  },


  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.hydrogenExectimeView.destroy();
  },

  serialize() {
    return {
      hydrogenExectimeViewState: this.hydrogenExectimeView.serialize()
    };
  },

  toggle() {
    console.log('HydrogenExectime was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
