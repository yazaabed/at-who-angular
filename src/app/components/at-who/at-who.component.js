/**
 * import component style
 */
import './at-who.component.css';

/**
 * Import template for this component
 */
import AtWhoTemplate from './at-who.component.html';
import AtWho from './helpers/at-who-wrapper.object';

/**
 * This to return instance from AtWho
 *
 * @constructor
 */
var AtWhoWrapper = function () {

  var Public = {};
  var Instance;

  /**
   * @returns {AtWho}
   */
  Public.getInstance = function () {
    return Instance = new AtWho();
  };

  return Public;
}();

/**
 * @typedef {Object} AtWhoWrapperComponentController
 * at-who component controller
 */

/**
 * Construct a new AtWhoWrapperComponentController
 * @param $scope
 * @param $element
 * @param $timeout
 * @constructor
 * @private
 */
var AtWhoWrapperComponentController = function ($scope, $element, $timeout) {
  var self = this;

  /**
   * @name AtWhoWrapperComponentController#isDestroyed
   * @type {boolean}
   * @private
   */
  var isDestroyed;

  /**
   * @name AtWhoWrapperComponentController#atWhoWrapper
   * @type {AtWho}
   * @private
   */
  var atWhoWrapper;

  /**
   * @name AtWhoWrapperComponentController#atWhoOptions
   * @type {{
         *    at: String,
         *    alias: String,
         *    data: Array,
         *    displayTpl: String,
         *    insertTpl: String,
         *    headerTpl: String,
         *    callbacks: Object,
         *    functionOverrides: Object,
         *    searchKey: String,
         *    suffix: String,
         *    hideWithoutSuffix: Boolean,
         *    startWithSpace: Boolean,
         *    acceptSpaceBar: Boolean,
         *    highlightFirst: Boolean,
         *    limit: Number,
         *    maxLen: Number,
         *    minLen: Number,
         *    displayTimeout: Number,
         *    delay: Number,
         *    spaceSelectsMatch: Boolean,
         *    tabSelectsMatch: Boolean,
         *    editableAtwhoQueryAttrs: Object,
         *    scrollDuration: Number,
         *    suspendOnComposing: Number,
         *    lookUpOnClick: Boolean
         * }}
   * @private
   */
  var atWhoOptions = {};

  /**
   * default other options as shown on at who code
   * These attributes not all used these just to give short show what we used here
   * @private
   */
  var otherOptions = {
    character: '@',
    class: '',
    data: null,
    dataAttributes: null,
    delay: null,
    displayTimeout: 300,
    hideWithoutSuffix: undefined,
    highlightFirst: true,
    insertItem: '${your_own_shown_attribute}',
    isTextArea: false,
    itemsLimit: 5,
    maxLen: 20,
    name: null,
    popUpItemTemplate: '<li>${your_own_shown_attribute_on_your_object}</li>',
    popupHeader: null,
    searchKey: 'your_own_searchable_attribute_on_your_object',
    startWithSpace: true,
    suffix: undefined,
    leftBrackets: '{{',
    rightBrackets: '}}',
    insertedKey: 'code'
  };

  /**
   * Element created on this component
   *
   * @private
   * @param {Node, jQuery}
   * @name AtWhoWrapperComponentController#element
   * @private
   */
  var element;

  /**
   * Random id using timestamp
   *
   * @type {null, string}
   * @private
   */
  var id = 'smart-field-' + Date.now();

  /**
   * Starting point for this component
   * @private
   */
  var onInit = function () {
    atWhoWrapper = atWhoWrapper || AtWhoWrapper.getInstance();

    element = $element.find('.editable-content');
    element.attr('id', id);

    var otherCopyOptions = jQuery.extend(true, {}, otherOptions);

    /**
     * Update model on parent scope using onModelChanged Events
     * @private
     */
    var ngModelChanged = function () {
      var newValue = atWhoWrapper.getValue(otherCopyOptions.leftBrackets, otherCopyOptions.rightBrackets);
      var modelValue = self.ngModel || "";

      if (modelValue !== newValue) {
        self.ngModel = newValue;
        self.onModelChanged({value: newValue});
        $scope.$apply();
      }
    };

    /**
     * @return input element to trigger the validation when needed
     */
    var getInputField = function () {
      var inputField = 'textarea';

      if (!otherCopyOptions.isTextArea) {
        inputField = 'input';
      }

      return element.parents('.at-who').find(inputField + '[name="' + self.name + '"]');
    };

    /**
     * editable content events
     * this to sync hidden fields with model values using ng-model
     *
     * @param e
     */
    otherCopyOptions.focusout = function (e) {
      var field = getInputField();
      field.trigger('change');
    };

    /**
     * DOM change event
     *
     * @param records
     */
    otherCopyOptions.domChanged = function (records) {
      ngModelChanged();
    };

    /**
     * @type {*|string}
     */
    var model = self.ngModel || '';

    /**
     * Start fill the model on the content editable div
     */
    if (model) {
      var rightBrackets = otherCopyOptions.rightBrackets;
      var leftBrackets = otherCopyOptions.leftBrackets;

      /**
       * Get all lines on the string to converted to div or p or br
       * @type {Array}
       */
      model = model.split(/\n/g);

      var isStringEmpty = function(str) {
        return str.length === 0 || str === " " || /^\s*$/.test(str);
      };

      for (var i in model) {
        if (/chrome/.test(navigator.userAgent.toLowerCase()) || /safari/.test(navigator.userAgent.toLowerCase())) {
          model[i] = "<div>" + (isStringEmpty(model[i]) ?  '<br />' : model[i]) + "</div>";
        } else if (!!navigator.userAgent.match(/MSIE/) || !!navigator.userAgent.match(/Trident\/7.0/)) {
          model[i] = "<p>" + model[i] + "</p>";
        } else {
          model[i] = model[i] + "<br />";
        }
      }

      model = model.join('');

      /**
       * Get all elements inside {{ }} on the string to replace it with write data
       * The replace is using the insertedKey options
       * @type {Array}
       */
      var matchedData = model.match(/\{{.+?\}}/g) || [];
      var data = self.data || [];

      /**
       * Loop through the smart-field inside this component
       */
      for (var i in matchedData) {
        var match = matchedData[i];

        /**
         * Replace the brackets between each smart-field by empty to attach them to view to show
         * them as at-who wrapped by span with blue color
         */
        match = match.replace(rightBrackets, '');
        match = match.replace(leftBrackets, '');

        /**
         * Get the code value from the data and attach them to the view
         * Example: {BRAND_NAME} replaced by Brand Name and set the BRAND_NAME on the span as
         * data-content-code="BRAND_NAME" to replace it when save the model value
         */
        var codeValue;

        /**
         * To get the code from send data
         */
        for (var j in data) {
          var item = data[j];

          if (item[otherCopyOptions.insertedKey] && item[otherCopyOptions.insertedKey].toLowerCase() === match.toLowerCase()) {
            codeValue = match;
            match = item[atWhoOptions.searchKey];
            break;
          }
        }

        /**
         * Replace code by name then attache it to view model
         */
        if (codeValue) {
          var insertedValue = '';

          if (!otherCopyOptions.disabledField) {
            insertedValue = '<span class="atwho-inserted" data-atwho-at-query="' + atWhoOptions.at + '" contenteditable="true">';
          }

          insertedValue += '<span class="highlight-selected-value">';
          insertedValue += '<span class="left-brackets ' + ((otherOptions.hideBrackets) ? 'hidden' : '') + '">' + leftBrackets + '</span>';
          insertedValue += '<span data-content-code="' + codeValue + '">' + match + '</span>';
          insertedValue += '<span class="right-brackets ' + ((otherOptions.hideBrackets) ? 'hidden' : '') + '">' + rightBrackets + '</span>';
          insertedValue += '</span>';

          if (!otherCopyOptions.disabledField) {
            insertedValue += '</span>';
          }

          /**
           * Add space at the end of any smart fields to fix duplication on code when click enter after edit
           * @type {string}
           */
          var indexOfMatchedData = model.indexOf(matchedData[i]) + matchedData[i].length + 1;

          if (!/\s/.test(model[indexOfMatchedData])) {
            insertedValue += '&#160';
          }

          model = model.replace(matchedData[i], insertedValue);
        }
      }
    }

    /**
     * Get the element to check if its rendered or not to update the html value on it
     * It shows as work around to not update the div element when the model is equal to the old value
     * because the onInit function called every time the model changed, but we don't need to updated when
     * its updated inside this component
     *
     * @type {*|jQuery|HTMLElement}
     * @private
     */
    var _ele = atWhoWrapper.getElement();

    if (_ele) {
      var nowHtml = atWhoWrapper.getValue(otherCopyOptions.leftBrackets, otherCopyOptions.rightBrackets) || '';

      if (!model) {
        element.empty();
      } else if (nowHtml.trim() !== self.ngModel.trim()) {
        element.html(model);
      }
    } else {
      element.html('');
    }

    /**
     * Stop click event on searchable content
     *
     * @type {boolean}
     */
    atWhoOptions.lookUpOnClick = false;

    /**
     * Draw element
     */
    $timeout(function () {
      atWhoWrapper.draw(element, atWhoOptions, otherCopyOptions);
    }, 100);
  };


  /**
   * Called on each controller after all the controllers on an element
   * Get needed options for this component
   *
   * @type {Function[]}
   */
  self.$onInit = function () {

    if (typeof (self.character) !== 'undefined') {
      atWhoOptions.at = self.character;
    }

    if (typeof (self.data) !== 'undefined') {
      atWhoOptions.data = angular.copy(self.data);
    }

    if (typeof (self.popupHeader) !== 'undefined') {
      atWhoOptions.headerTpl = self.popupHeader;
    }

    if (typeof (self.popUpItemTemplate) !== 'undefined') {
      atWhoOptions.displayTpl = self.popUpItemTemplate;
    }

    if (typeof (self.insertItem) !== 'undefined') {
      atWhoOptions.insertTpl = self.insertItem;
    }

    if (typeof (self.searchKey) !== 'undefined') {
      atWhoOptions.searchKey = self.searchKey;
    }

    if (typeof (self.itemsLimit) !== 'undefined') {
      atWhoOptions.limit = self.itemsLimit;
    }

    if (typeof (self.maxLen) !== 'undefined') {
      atWhoOptions.maxLen = self.maxLen;
    }

    if (typeof (self.startWithSpace) !== 'undefined') {
      atWhoOptions.startWithSpace = self.startWithSpace;
    }

    if (typeof (self.displayTimeout) !== 'undefined') {
      atWhoOptions.displayTimeout = self.displayTimeout;
    }

    if (typeof (self.highlightFirst) !== 'undefined') {
      atWhoOptions.highlightFirst = self.highlightFirst;
    }

    if (typeof (self.delay) !== 'undefined') {
      atWhoOptions.delay = self.delay;
    }

    if (typeof (self.suffix) !== 'undefined') {
      atWhoOptions.suffix = self.suffix;
    }

    if (typeof (self.hideWithoutSuffix) !== 'undefined') {
      atWhoOptions.hideWithoutSuffix = self.hideWithoutSuffix;
    }

    if (typeof (self.dataAttributes) === 'object') {
      atWhoOptions.editableAtwhoQueryAttrs = self.dataAttributes;
    }

    if (typeof (self.callbacks) === 'object') {
      otherOptions.callbacks = self.callbacks;
    }

    if (typeof (self.isTextArea) !== 'undefined') {
      otherOptions.isTextArea = self.isTextArea;
    }

    if (typeof (self.leftBrackets) !== 'undefined') {
      otherOptions.leftBrackets = self.leftBrackets;
    }

    if (typeof (self.rightBrackets) !== 'undefined') {
      otherOptions.rightBrackets = self.rightBrackets;
    }

    if (typeof (self.hideBrackets) !== 'undefined') {
      otherOptions.hideBrackets = self.hideBrackets;
    }

    if (typeof (self.insertedKey) !== 'undefined') {
      otherOptions.insertedKey = self.insertedKey;
    }

    if (typeof (self.disabledField) !== 'undefined') {
      otherOptions.disabledField = self.disabledField;
    }

    if (
      Object.keys(atWhoOptions).length &&
      atWhoOptions.data &&
      atWhoOptions.data.length
    ) {
      onInit();
    }
  };

  /**
   * Called whenever one-way bindings are updated
   *
   * @type {Function[]}
   * @param changes
   * @param {String} changes.character
   * @param {Array} changes.data
   * @param {Array} changes.data
   * @param {String} changes.popupHeader
   * @param {String} changes.popUpItemTemplate
   * @param {String} changes.insertItem
   * @param {String} changes.searchKey
   * @param {String} changes.searchKey
   * @param {Number} changes.itemsLimit
   * @param {Number} changes.maxLen
   * @param {Boolean} changes.startWithSpace
   * @param {Boolean} changes.displayTimeout
   * @param {Boolean} changes.highlightFirst
   * @param {Boolean} changes.delay
   * @param {String} changes.suffix
   * @param {Boolean} changes.hideWithoutSuffix
   * @param {Object} changes.dataAttributes
   * @param {Object} changes.callbacks
   * @param {Boolean} changes.isTextArea
   * @param {Boolean} changes.disabledField
   * @param {String} changes.leftBrackets
   * @param {String} changes.rightBrackets
   * @param {Boolean} changes.hideBrackets
   * @param {String} changes.insertedKey
   * @param {Object} changes.ngModel
   */
  self.$onChanges = function (changes) {
    var newOptions = {};

    if (
      typeof (changes.character) !== 'undefined' &&
      !changes.character.isFirstChange() &&
      JSON.stringify(changes.character.currentValue) !== JSON.stringify(changes.character.previousValue)
    ) {
      newOptions.at = changes.character.currentValue;
    }

    if (
      typeof (changes.data) !== 'undefined' &&
      !changes.data.isFirstChange() &&
      JSON.stringify(changes.data.currentValue) !== JSON.stringify(changes.data.previousValue)
    ) {
      newOptions.data = angular.copy(changes.data.currentValue);
    }

    if (
      typeof (changes.popupHeader) !== 'undefined' &&
      !changes.popupHeader.isFirstChange() &&
      JSON.stringify(changes.popupHeader.currentValue) !== JSON.stringify(changes.popupHeader.previousValue)
    ) {
      newOptions.headerTpl = changes.popupHeader.currentValue;
    }

    if (
      typeof (changes.popUpItemTemplate) !== 'undefined' &&
      !changes.popUpItemTemplate.isFirstChange() &&
      JSON.stringify(changes.popUpItemTemplate.currentValue) !== JSON.stringify(changes.popUpItemTemplate.previousValue)
    ) {
      newOptions.displayTpl = changes.popUpItemTemplate.currentValue;
    }

    if (
      typeof (changes.insertItem) !== 'undefined' &&
      !changes.insertItem.isFirstChange() &&
      JSON.stringify(changes.insertItem.currentValue) !== JSON.stringify(changes.insertItem.previousValue)
    ) {
      newOptions.insertTpl = changes.insertItem.currentValue;
    }

    if (
      typeof (changes.searchKey) !== 'undefined' &&
      !changes.searchKey.isFirstChange() &&
      JSON.stringify(changes.searchKey.currentValue) !== JSON.stringify(changes.searchKey.previousValue)
    ) {
      newOptions.searchKey = changes.searchKey.currentValue;
    }

    if (
      typeof (changes.itemsLimit) !== 'undefined' &&
      !changes.itemsLimit.isFirstChange() &&
      JSON.stringify(changes.itemsLimit.currentValue) !== JSON.stringify(changes.itemsLimit.previousValue)
    ) {
      newOptions.limit = changes.itemsLimit.currentValue;
    }

    if (
      typeof (changes.maxLen) !== 'undefined' &&
      !changes.maxLen.isFirstChange() &&
      JSON.stringify(changes.maxLen.currentValue) !== JSON.stringify(changes.maxLen.previousValue)
    ) {
      newOptions.maxLen = changes.maxLen.currentValue;
    }

    if (
      typeof (changes.startWithSpace) !== 'undefined' &&
      !changes.startWithSpace.isFirstChange() &&
      JSON.stringify(changes.startWithSpace.currentValue) !== JSON.stringify(changes.startWithSpace.previousValue)
    ) {
      newOptions.startWithSpace = changes.startWithSpace.currentValue;
    }

    if (
      typeof (changes.displayTimeout) !== 'undefined' &&
      !changes.displayTimeout.isFirstChange() &&
      JSON.stringify(changes.displayTimeout.currentValue) !== JSON.stringify(changes.displayTimeout.previousValue)
    ) {
      newOptions.displayTimeout = changes.displayTimeout.currentValue;
    }

    if (
      typeof (changes.highlightFirst) !== 'undefined' &&
      !changes.highlightFirst.isFirstChange() &&
      JSON.stringify(changes.highlightFirst.currentValue) !== JSON.stringify(changes.highlightFirst.previousValue)
    ) {
      newOptions.highlightFirst = changes.highlightFirst.currentValue;
    }

    if (
      typeof (changes.delay) !== 'undefined' &&
      !changes.delay.isFirstChange() &&
      JSON.stringify(changes.delay.currentValue) !== JSON.stringify(changes.delay.previousValue)
    ) {
      newOptions.delay = changes.delay.currentValue;
    }

    if (
      typeof (changes.suffix) !== 'undefined' &&
      !changes.suffix.isFirstChange() &&
      JSON.stringify(changes.suffix.currentValue) !== JSON.stringify(changes.suffix.previousValue)
    ) {
      newOptions.suffix = changes.suffix.currentValue;
    }

    if (
      typeof (changes.hideWithoutSuffix) !== 'undefined' &&
      !changes.hideWithoutSuffix.isFirstChange() &&
      JSON.stringify(changes.hideWithoutSuffix.currentValue) !== JSON.stringify(changes.hideWithoutSuffix.previousValue)
    ) {
      newOptions.hideWithoutSuffix = changes.hideWithoutSuffix.currentValue;
    }

    if (
      typeof (changes.dataAttributes) !== 'undefined' &&
      !changes.dataAttributes.isFirstChange() &&
      JSON.stringify(changes.dataAttributes.currentValue) !== JSON.stringify(changes.dataAttributes.previousValue)
    ) {
      newOptions.editableAtwhoQueryAttrs = changes.dataAttributes.currentValue;
    }

    if (
      typeof (changes.callbacks) !== 'undefined' &&
      !changes.callbacks.isFirstChange() &&
      JSON.stringify(changes.callbacks.currentValue) !== JSON.stringify(changes.callbacks.previousValue)
    ) {
      otherOptions.callbacks = changes.callbacks.currentValue;
    }

    if (
      typeof (changes.isTextArea) !== 'undefined' &&
      !changes.isTextArea.isFirstChange() &&
      JSON.stringify(changes.isTextArea.currentValue) !== JSON.stringify(changes.isTextArea.previousValue)
    ) {
      otherOptions.isTextArea = changes.isTextArea.currentValue;
    }

    if (
      typeof (changes.disabledField) !== 'undefined' &&
      !changes.disabledField.isFirstChange() &&
      JSON.stringify(changes.disabledField.currentValue) !== JSON.stringify(changes.disabledField.previousValue)
    ) {
      otherOptions.disabledField = changes.disabledField.currentValue;
    }

    if (
      typeof (changes.leftBrackets) !== 'undefined' &&
      !changes.leftBrackets.isFirstChange() &&
      JSON.stringify(changes.leftBrackets.currentValue) !== JSON.stringify(changes.isTextArea.previousValue)
    ) {
      otherOptions.leftBrackets = changes.leftBrackets.currentValue;
    }

    if (
      typeof (changes.rightBrackets) !== 'undefined' &&
      !changes.rightBrackets.isFirstChange() &&
      JSON.stringify(changes.rightBrackets.currentValue) !== JSON.stringify(changes.rightBrackets.previousValue)
    ) {
      otherOptions.rightBrackets = changes.rightBrackets.currentValue;
    }

    if (
      typeof (changes.hideBrackets) !== 'undefined' &&
      !changes.hideBrackets.isFirstChange() &&
      JSON.stringify(changes.hideBrackets.currentValue) !== JSON.stringify(changes.hideBrackets.previousValue)
    ) {
      otherOptions.hideBrackets = changes.hideBrackets.currentValue;
    }

    if (
      typeof (changes.insertedKey) !== 'undefined' &&
      !changes.insertedKey.isFirstChange() &&
      JSON.stringify(changes.insertedKey.currentValue) !== JSON.stringify(changes.insertedKey.previousValue)
    ) {
      otherOptions.insertedKey = changes.insertedKey.currentValue;
    }

    var modelChanged;

    if (
      typeof (changes.ngModel) !== 'undefined' &&
      !changes.ngModel.isFirstChange() &&
      JSON.stringify(changes.ngModel.currentValue) !== JSON.stringify(changes.ngModel.previousValue)
    ) {
      self.ngModel = changes.ngModel.currentValue;
      modelChanged = true;
    }

    var thereIsData = (newOptions.data && newOptions.data.length) || (atWhoOptions.data && atWhoOptions.data.length);

    if (
      thereIsData &&
      (
        JSON.stringify(newOptions) !== JSON.stringify(atWhoOptions) ||
        modelChanged
      )
    ) {
      atWhoOptions = jQuery.extend(true, atWhoOptions, newOptions);
      onInit();
    }
  };

  /**
   * Make sure to destroy every not needed attached things
   */
  self.$onDestroy = function () {
    if (!isDestroyed) {
      atWhoWrapper.destroy();
      atWhoOptions = {};
      atWhoWrapper = null;
      element.remove();
      element = null;
      id = null;
      isDestroyed = true;
    }
  };

  /**
   * This need to clear data when the element removed from dom
   */
  $element.on('$destroy', function () {
    self.$onDestroy();
  });
};

/**
 *
 * @type {Object}
 * @name AtWhoWrapperComponent#
 */
var AtWhoWrapperComponent = {
  bindings: {
    name: '@',
    class: '<',
    isTextArea: '<',
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
  },
  transclude: true,
  template: AtWhoTemplate,
  controller: [
    '$scope',
    '$element',
    '$timeout',
    AtWhoWrapperComponentController
  ],
  controllerAs: 'AtWho'
};

export default AtWhoWrapperComponent;
