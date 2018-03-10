import 'at.js/dist/css/jquery.atwho.min.css';
import 'jquery.caret';
import 'at.js';

import angular from 'angular';
import AtWhoModule from '../../dist/at-who-angular';

import appHtml from './app.html';
import './app.css';

let AppComponent = {
  template: appHtml,
  controller: () => new AppController(),
  controllerAs: 'AppComponent'
};

class AppController {
  constructor(){
    this.item = {
      subject: '',
      title: ''
    };

    this.smartFields = [{
      code: 'TEST_1',
      name: 'test 1'
    }, {
      code: 'TEST_2',
      name: 'test 2'
    }, {
      code: 'TEST_3',
      name: 'test 3'
    }, {
      code: 'TEST_4',
      name: 'test 4'
    }];
  }

  onSubjectChanged(value) {
    this.item.subject = value;
  }

  onTitleChanged(value) {
    this.item.title = value;
  }
}

const MainModule = angular
  .module('atWhoAppExample', [
    AtWhoModule.name
  ])
  .component('app', AppComponent);

angular
  .element(document)
  .ready(() => angular.bootstrap(document, ['atWhoAppExample']));

export default MainModule;
