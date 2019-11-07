'use babel';

export default class HydrogenExectimeView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
