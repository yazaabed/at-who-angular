# At Who Angular
wrapper for [At.js](http://ichord.github.io/At.js/) that add mentions autocomplete to your application with angular component for using it on any AngularJS projects

## Introduction
This project done using AngularJS after need it to wrapp the autocomplete At.js nice library to use it easly on AngularJS projects.

## Getting Started
### For changes on this repo
- First you need to clone the project to start working.
- We need to install Node.js you can install it using [nvm](https://github.com/creationix/nvm).
- Run `npm install` to install all needed plugins and modules for this project.
- Run `npm run start` to run the example for this project from `./src/example/app.js`
- You can find the starting point for the application and the needed things on `app.js`
- You need to import on your project the `import 'at.js/dist/css/jquery.atwho.min.css';` to make sure the style as expected.
- You need to import on your project the `import 'jquery.caret';` because its a dependancy for `At.js`.

### For just a normal use on your project
- Use npm to install it on your project using `@yazanaabed/at-who-angular`.
- Import it on your project and start using it by pass the `AtWhoModule.name` to your main module or needed module.

### Prerequisites
- Node.js
- webpack
- webpack-cli
- webpack-dev-server
- @yazanaabed/dommutationobserver

### Examples
* Firstly, we need to include this on our module.
```javascript
const MainModule = angular
  .module('atWhoAppExample', [
    AtWhoModule.name
  ])
```
* Secondly, we need to add some data to our component or controller, and make sure to update the model using the `on-model-changed` event send from parent to children. This to prevent the two way data-binding and make sure the changes using events.
```javascript
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
```
* Add our component to our html to start working with it. Here is two examples with multiple options send to the compoent.
```html
<at-who ng-model="AppComponent.item.title"
                class="input-container"
                name="subject"
                character="'@'"
                insert-item="'${name}'"
                search-key="'name'"
                inserted-key="'code'"
                pop-up-item-template="'<li>${name}</li>'"
                data="AppComponent.smartFields"
                on-model-changed="AppComponent.onTitleChanged(value)"
                place-holder="'Message Title'"
                hide-brackets="true"></at-who>

<at-who ng-model="AppComponent.item.subject"
                class="textarea-container"
                is-text-area="true"
                name="subject"
                character="'@'"
                insert-item="'${name}'"
                search-key="'name'"
                inserted-key="'code'"
                pop-up-item-template="'<li>${name}</li>'"
                data="AppComponent.smartFields"
                place-holder="'Message Body'"
                on-model-changed="AppComponent.onSubjectChanged(value)"
                hide-brackets="true"></at-who>
```
* You can style your component as you want using the styling.
```css
.app-container {
    max-width: 1200px;
    margin: 0 auto;
}

.app-container h1 {
    text-align: center;
}

.app-container .textarea-container .textarea,
.app-container .input-container .input-field {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
}

```
* Options passed to this component
```javascript
{
    // Name for the input or field
    name: '@',
    // Class used to attach on element
    class: '<',
    // Is it an text area or simple input don't pass this if you want input
    isTextArea: '<',
    // What is the trigger char on the above example its '@'
    character: '<',
    popupHeader: '<',
    popUpItemTemplate: '<',
    insertItem: '<',
    searchKey: '<',
    maxLen: '<',
    startWithSpace: '<',
    itemsLimit: '<',
    displayTimeout: '<',
    delay: '<',
    suffix: '<',
    highlightFirst: '<',
    data: '<',
    hideWithoutSuffix: '<',
    dataAttributes: '<',
    callbacks: '<',
    leftBrackets: '<',
    rightBrackets: '<',
    hideBrackets: '<',
    ngModel: '<',
    insertedKey: '<',
    placeHolder: '<',
    disabledField: '<',
    onModelChanged: '&'
  }
```

## Built With

* [@yazanaabed/dommutationobserver](https://www.npmjs.com/package/@yazanaabed/dommutationobserver) - Component build by me.
* [At.js](http://ichord.github.io/At.js/) - Main component for this project.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Yazan Aabed** - *Initial work* - [AtWhoAngularJS](https://github.com/YazanAabeed/at-who-angular)

See also the list of [contributors](https://github.com/YazanAabeed/at-who-angular/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* This is my first component on this field to help people integrate with autocomplete At.js easily for AngularJS projects.
* I love to hear any comments to learn from people on this community.
