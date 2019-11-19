'use babel';

import HydrogenExectimeView from './hydrogen-exectime-view';
import { CompositeDisposable, Disposable } from 'atom';


class PythonMiddleware {
  static active = false;
  execute(
    next,
    code,
    onResults
  ) {
    var header_code = `
import time as _exectime
_exectimet0 = _exectime.time()
`
    var footer_code = `
print("{:.2f} seconds".format(_exectime.time() - _exectimet0))
`

    if (PythonMiddleware.active) {
      var wrapped_code = header_code + code + footer_code;
    } else {
        var wrapped_code = code;
    }

    next.execute(wrapped_code, (message, channel) => {
        onResults(message, channel);
      }
    );
  }
}


export default {

  hydrogenExectimeView: null,
  subscriptions: null,

  activate(state) {
    this.hydrogenExectimeView = new HydrogenExectimeView(state.hydrogenExectimeViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add(
        'atom-workspace',
        {
          'hydrogen-exectime:activate': () => {
            this.turnOn();
          },
          'hydrogen-exectime:deactivate': () => {
            this.turnOff();
          },
        }
      )
    );
  },

  consumeHydrogen(hydrogen) {
    this.hydrogen = hydrogen;

    this.hydrogen.onDidChangeKernel(kernel => {
      if (!kernel) return;

      var alreadyAttached = false;
      for (let kn of kernel._kernel.middleware) {
          if (kn._middleware instanceof PythonMiddleware){
            alreadyAttached = true;
          }
      }

      // Python kernel
      if (!alreadyAttached & kernel.language === 'python'){
        kernel.addMiddleware(new PythonMiddleware());
        atom.notifications.addSuccess('New python kernel attached to hydrogen-exectime.');
      }

      // TODO: add others languages
    });

    return new Disposable(() => {
      this.hydrogen = null;
    });
  },

  deactivate() {
    PythonMiddleware.active = false;
    this.subscriptions.dispose();
    this.hydrogenExectimeView.destroy();
  },

  serialize() {
    return {
      hydrogenExectimeViewState: this.hydrogenExectimeView.serialize()
    };
  },

  turnOn() {
    PythonMiddleware.active = true;
  },

  turnOff() {
    PythonMiddleware.active = false;
  }
};
