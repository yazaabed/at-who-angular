import YDomMutationObserver from "@yazanaabed/dommutationobserver";

/**
 * This is the wrapper for At.js plugin that added to our project using bower.js
 *
 * @constructor
 */
class AtWho {
  /**
   * The element need to attach At.js with it passed from draw function
   *
   * @private
   * @param {Node, jQuery}
   * @name AtWho#element
   */
  element;

  /**
   * The At.js options passed from draw function
   *
   * @private
   * @type {{callbacks: Object}}
   * @name AtWho#options
   */
  options = {};

  /**
   * To check if the plugin attached to the dom or not
   *
   * @private
   * @type {Boolean}
   * @name AtWho#initialized
   */
  initialized;

  /**
   * These our callbacks passed to this wrapper
   *
   * @private
   * @type {Object}
   * @name AtWho#otherCallbacks
   */
  otherCallbacks;

  /**
   * Dom event listener to handle any changes on the content editable div
   *
   * @private
   * @type {DomMutationObserver}
   * @name AtWho#domEventChangesListener
   */
  domEventChangesListener = new YDomMutationObserver();
  
  /**
   * Return other events to handle smart-field component
   *
   * @param {Object} otherOptions
   * @param {Function} otherOptions.focusout
   * @param {Function} otherOptions.domChanged
   * @returns {Object} needed callbacks for other
   * @private
   * @type {Function[]}
   */
  DEFAULT_OTHER_CALLBACKS(otherOptions) {
    /**
     * Events handlers
     *
     * @name DEFAULT_OTHER_CALLBACKS#handlers
     * @type Object
     */
    let callbacks = {};

    /**
     * Handle focusout when the user focus out from element
     *
     * @param e
     */
    callbacks.focusout = function (e) {
      otherOptions.focusout(e);
    };

    /**
     * This is the event triggered when the browser said the dom are changed
     * This to make sure that the model updated every time and make sure that appended elements are editable true
     * because Android devices hide the keyboard when the element is not editable
     *
     * @param {MutationRecord} records
     * @type {Function[]}
     */
    callbacks.domChanged = function (records) {
      for (let i in records) {
        let record = records[i] || {};

        if (record.target && $(record.target).hasClass('atwho-inserted')) {
          $(record.target).attr('contenteditable', true);
        }
      }

      otherOptions.domChanged(records);
    };

    return callbacks;
  };


  /**
   * The At.js default functions callback that needed to passed to it all time
   * you can override any of these functions
   *
   * @param otherOptions
   * @param {String} otherOptions.leftBrackets
   * @param {String} otherOptions.rightBrackets
   *
   * @returns {
         *       {
         *          beforeSave: Function,
         *          matcher: Function,
         *          filter: Function,
         *          sorter: Function,
         *          tplEval: Function,
         *          highlighter: Function,
         *          beforeInsert: Function,
         *          beforeReposition: Function,
         *          afterMatchFailed: Function
         *       }
         * }
   *
   * @private
   * @type {Function[]}
   */
  DEFAULT_CALLBACKS(otherOptions) {
    return {
      /**
       * this function called to restructure your own data
       * @param data
       * @returns {Array}
       */
      beforeSave: function (data) {
        let results = [];

        if (!Array.isArray(data)) {
          throw new Error('On before save callback data must be array from first ' + Date.now());
        }

        for (let i = 0; i < data.length; i++) {
          let item = data[i];

          if (jQuery.isPlainObject(item)) {
            results.push(item);
          } else {
            let convertItem = {};
            convertItem[options.searchKey] = item;

            results.push(convertItem);
          }
        }

        return results;
      },
      /**
       * It would be called to match the `flag`.
       * It will match at start of line or after whitespace
       * this is the function decide if the user enter the character for auto complete or not
       * after detect the character the filter function called
       *
       * @param flag
       * @param subtext
       * @param shouldStartWithSpace
       * @param acceptSpaceBar
       * @returns {null}
       */
      matcher: function (flag, subtext, shouldStartWithSpace, acceptSpaceBar) {
        flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

        if (shouldStartWithSpace) {
          flag = '(?:^|\\s)' + flag;
        }

        // latin characters
        // ÿ, À used on regular expression
        let _a = decodeURI("%C3%80");
        let _y = decodeURI("%C3%BF");

        let space = acceptSpaceBar ? "\ " : "";

        let regexp = new RegExp(flag + "([A-Za-z" + _a + "-" + _y + "0-9_" + space + "\'\.\+\-]*)$|" + flag + "([^\\x00-\\xff]*)$", 'gi');
        let match = regexp.exec(subtext);

        return match? (match[2] || match[1]) : null;
      },
      /**
       * called after the matcher function return value for the query
       * the value for this is the match on the matcher function
       *
       * @param query
       * @param data
       * @param searchKey
       * @returns {Array}
       */
      filter: function(query, data, searchKey) {
        let results = [];

        if (!Array.isArray(data)) {
          throw new Error('This is filter function the data not parsed as well on before save function its not an array ' + Date.now());
        }

        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          let searchItem = String(item[searchKey]);

          if (searchItem.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            results.push(item);
          }
        }

        return results;
      },
      /**
       * this to sort the data for what the user enter on the inputs
       * we can change how the sorter function work here
       *
       * @param query
       * @param items
       * @param searchKey
       * @returns {Array}
       */
      sorter: function(query, items, searchKey) {

        if (!query) {
          return items;
        }

        let results = [];

        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let searchItem = String(item[searchKey]);

          item.order = searchItem.toLowerCase().indexOf(query.toLowerCase());

          if (item.order > -1) {
            results.push(item);
          }
        }

        let _sorter = function(a, b) {
          return a.order - b.order;
        };

        return results.sort(_sorter);
      },
      /**
       * this function used to eval two steps
       * the first step is to eval the value on li list as 'pop-up-item-template' on our component
       * for example: pop-up-item-template="'<li>${name}</li>'"
       * replace ${name} by its own value
       * the second step is to eval the entered value after the user choose one option
       * for example: insert-item="'${code}'"
       * tpl is the string template
       * map is the data we passed after filter it on the filter function
       * you can pass the insert-item and pop-up-item-template as function
       *
       *
       * @param template
       * @param map
       * @returns {String}
       */
      tplEval: function(template, map) {

        if (typeof template === 'function') {
          return template(map);
        } else if (typeof template === 'string') {
          return template.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
            return '<span data-content-code="' + map[otherOptions.insertedKey] + '">' + map[key] + '</span>';
          });
        } else {
          throw new Error('on template eval function the template can be function or string as ${value} ' + Date.now());
        }
      },
      /**
       * this function to highlight the matched index of value on the pop up list
       * shown under the word
       *
       * @param li
       * @param query
       * @returns {String}
       */
      highlighter: function(li, query) {
        if (!query) {
          return li;
        }

        let regexp = new RegExp(">\\s*([^\<]*?)(" + query.replace("+", "\\+") + ")([^\<]*)\\s*<", 'ig');

        return li.replace(regexp, function(str, $1, $2, $3) {
          return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
        });
      },
      /**
       * This function called before insert value on the editable content
       * by default its span with atwho-inserted class
       * i added another span inside it with default class called 'highlight-selected-value'
       *
       * @param value
       * @param $li
       * @param e
       * @returns {string}
       */
      beforeInsert: function(value, $li, e) {
        let leftBrackets = otherOptions.leftBrackets || '{{';
        let rightBrackets = otherOptions.rightBrackets || '}}';

        let insertedHtml = '<span class="highlight-selected-value">';
        insertedHtml += '<span class="left-brackets ' + ((otherOptions.hideBrackets) ? 'hidden' : '') + '">' + leftBrackets + '</span>';
        insertedHtml += value;
        insertedHtml += '<span class="right-brackets ' + ((otherOptions.hideBrackets) ? 'hidden' : '') + '">' + rightBrackets + '</span>';
        insertedHtml += '</span>';

        return insertedHtml;
      },
      beforeReposition: function(offset) {
        return offset;
      },
      afterMatchFailed: function(at, el) {}
    };
  };

  /**
   * This to hide the smart-field auto complete when clicking out side the element
   * This action attached to the body dom
   *
   * @private
   * @param event
   * @name AtWho#handleDocumentClick
   */
  handleDocumentClick = function (event) {

    if (
      this.element && !this.element.is(':focus')
    ) {
      this.element.find('.atwho-query').remove();
      this.element.atwho('hide');
    }
  };

  /**
   * This events attached for the element.
   * The first one is focus out
   * The second one is dom change event
   *
   * @private
   * @param otherOptions
   * @name AtWho#handleElementEvents
   */
  handleElementEvents = function (otherOptions) {
    this.otherCallbacks = this.DEFAULT_OTHER_CALLBACKS(otherOptions);

    /**
     * Listen to focusout event with namespace as at-who.scss
     */
    this.element.on('focusout.at-who', this.otherCallbacks.focusout);

    /**
     * These params used on MutationObserver
     * At the very least, childList, attributes, or characterData must be set to true.
     */
    let domEventOptions = {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    };

    /**
     * This to send the element to this component as dom element with its options
     */
    this.domEventChangesListener.init(this.element[0], domEventOptions);

    /**
     * The dom events handler all of them call the domChanged API
     */
    this.domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHARACTER_DATA_CHANGED, this.otherCallbacks.domChanged);
    this.domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHILD_LIST_CHANGED, this.otherCallbacks.domChanged);
    this.domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHANGE, this.otherCallbacks.domChanged);

    /**
     * After attach the needed events start listening to dom changes
     */
    this.domEventChangesListener.startListening(500);

    /**
     * @private
     * @type {*|jQuery|HTMLElement}
     */
    let body = $('body');

    /**
     * Attach hide smart-field body event
     */
    body.on('click.at-who', this.handleDocumentClick);
  };

  /**
   * Used to draw the element and attach events to it and check if the element have the plugin or not
   * Then send options to plugin and start working
   *
   * @param {*|jQuery|HTMLElement} elementAttached
   * @param {Object} atWhoOptions
   * @param {Object} otherOptions
   */
  draw(elementAttached, atWhoOptions, otherOptions) {

    /**
     * make sure to hard copy the options getting from outside then check if the options are changed then
     * initialize the element another time
     */
    let checkOptions = jQuery.extend(true, {}, this.options);
    delete checkOptions.callbacks;

    if (
      JSON.stringify(atWhoOptions) !== JSON.stringify(checkOptions) ||
      otherOptions.disabledField
    ) {
      this.initialized = false;

      if (this.element) {
        this.element.atwho('destroy');
      }
    }

    /**
     * Check if the component initialized or not and if its disabled no need to initialize
     */
    if (!this.initialized && !otherOptions.disabledField) {
      this.options = jQuery.extend(true, {}, atWhoOptions);
      otherOptions = jQuery.extend(true, {}, otherOptions);

      if (!elementAttached) {
        throw new Error('Element not send with options to attach the at who with id ' + Date.now());
      }

      this.element = elementAttached;

      /**
       * handle events for the editable content area
       */
      this.handleElementEvents(otherOptions);

      /**
       * extend callbacks
       */
      let callbacks = jQuery.extend(true, {}, otherOptions.callbacks);
      let atWhoCallbacks = {};

      /**
       * mapping our callbacks with at who callbacks
       */
      let atWhoCallbacksMapping = {
        /**
         * change your data shape
         */
        onChangeDataShape: 'beforeSave',
        /**
         * get the value after character like @value
         * onMatchingValue must return value
         */
        onMatchingValue: 'matcher',
        /**
         * after get the match value start filter the value
         */
        onFilterValues: 'filter',
        /**
         * sort the result shown on pop up
         */
        onSortPopupValues: 'sorter',
        /**
         * eval string if you pass it as template like ${name}
         */
        onTemplateEval: 'tplEval',
        /**
         * highlight the matched index of value on the pop up list
         */
        onHighlightTextOnPopup: 'highlighter',
        /**
         * this function called before insert value on the editable content
         */
        onBeforeInsert: 'beforeInsert',
        onBeforeReposition: 'beforeReposition',
        onMatchFailed: 'afterMatchFailed'
      };

      /**
       * map our callbacks with at who callbacks as shown on atWhoCallbacksMapping object
       */
      for (let i in atWhoCallbacksMapping) {
        let mapping = atWhoCallbacksMapping[i];

        if (callbacks[i]) {
          atWhoCallbacks[mapping] = callbacks[i];
        }
      }

      let atWhoDefaultCallbacks = this.DEFAULT_CALLBACKS(otherOptions);

      this.options.callbacks = jQuery.extend(true, {}, atWhoDefaultCallbacks, atWhoCallbacks);

      /**
       * handle at who attach to dom element
       */
      this.element.atwho('destroy');
      this.element.atwho(this.options);

      /**
       * To handle if the element attach atWho with it or not
       *
       * @type {boolean}
       */
      this.initialized = true;
    }
  };

  /**
   * @returns {*|jQuery|HTMLElement}
   */
  getElement() {
    return this.element;
  };

  /**
   * @returns {{callbacks: Object}}
   */
  getOptions() {
    return this.options;
  };

  /**
   * @return html
   */
  getHtml() {
    return this.element.html();
  };

  /**
   * Needs to get the value for the editable content as string without any span or html elements
   * and replace name by codes
   *
   * @return string for model value
   */
  getValue(leftBrackets, rightBrackets) {
    let getEditContent = function (html) {
      let ce = $("<pre />").html(html);

      let isStringEmpty = function(str) {
        return str.length === 0 || str === " " || /^\s*$/.test(str);
      };

      if (/chrome/.test(navigator.userAgent.toLowerCase()) || /safari/.test(navigator.userAgent.toLowerCase())) {
        ce.html(ce.html().replace(/\n/g, ''));
        ce.find('br').remove();

        let i = 0;

        ce.find("div").replaceWith(function() {
          if (!isStringEmpty($(this).text())) {
            let returnData = $(this).text() + '\n';

            if (i === 0) {
              returnData = ('\n' + returnData);
            }

            i++;
            return returnData;
          }

          i++;

          return '\n';
        });
      } else if (!!navigator.userAgent.match(/MSIE/) || !!navigator.userAgent.match(/Trident\/7.0/)) {
        ce.html(ce.html().replace(/\n/g, ''));
        ce.find('br').remove();

        let i = 0;

        ce.find("p").replaceWith(function() {
          if (!isStringEmpty($(this).text())) {
            let returnData = $(this).text() + '\n';

            if (i === 0) {
              returnData = ('\n' + returnData);
            }

            i++;
            return returnData;
          }

          return '\n';
        });
      } else {
        ce.html(ce.html().replace(/\n/g, ''));
        ce.find("br").replaceWith('\n');
      }

      return ce.text().trim();
    };

    let newElement = this.element.clone();
    let codes = newElement.find('[data-content-code]');

    codes.each(function (index, codeElement) {
      let _element = $(codeElement);
      let _code = $(_element).data('contentCode');
      let _code_parent = _element.parents('.highlight-selected-value');

      leftBrackets = leftBrackets || '{{';
      rightBrackets = rightBrackets || '}}';

      _code_parent.find('.left-brackets').remove();
      _code_parent.find('.right-brackets').remove();

      _element.text(leftBrackets + _code + rightBrackets);
    });

    return getEditContent(newElement.html());
  };

  /**
   * Destroy the element and remove any handlers added to dom without remove it
   */
  destroy() {
    this.options = {};
    this.element.atwho('destroy');

    let body = $('body');
    body.off('click.at-who', handleDocumentClick);
    body.find('.atwho-container').remove();

    this.element = null;
    this.initialized = false;

    this.domEventChangesListener.destroy();
  };
}

export default AtWho;
