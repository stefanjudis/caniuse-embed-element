const VALID_ATTRIBUTES = new Map([
  ['feature', { defaultValue: null }],
  ['periods', { defaultValue: 'future_1,current,past_1,past_2' }],
  [
    'showAccessibleColors',
    { defaultValue: false, attributeName: 'show-accessible-colors' },
  ],
]);

class CaniuseEmbed extends HTMLElement {
  iframeIsLoaded = false;

  feature;
  periods;
  showAccessibleColors;
  supportsWebp;

  constructor() {
    super();
  }

  connectedCallback() {
    VALID_ATTRIBUTES.forEach(({ attributeName, defaultValue }, key) => {
      this[key] = this.getAttribute(attributeName || key) || defaultValue;
    });

    if (!this.feature) {
      throw new Error(
        'Define the "feature" attribute on you <caniuse-embed> element'
      );
    }

    this.addStylesToBody();
    this.addIframeResizeListener();
    this.dataFrame = this.getDataIframe();
    this.appendChild(this.dataFrame);
  }

  addIframeResizeListener() {
    const eventMethod = window.addEventListener
      ? 'addEventListener'
      : 'attachEvent';
    const eventer = window[eventMethod];
    const messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';

    eventer(
      messageEvent,
      ({ data }) => {
        if (typeof data === 'string' && data.indexOf('ciu_embed') > -1) {
          const [, featureId, height] = data.split(':');
          console.log({ featureId, feature: this.feature });
          if (featureId === this.feature) {
            this.style.height = `${parseInt(height, 10) + 3}px`;
          }
        }
      },
      false
    );
  }

  addStylesToBody() {
    const stylesheetId = '__caniuse-embed-styles__';

    if (!document.getElementById(stylesheetId)) {
      const styles = document.createElement('style');
      styles.id = stylesheetId;
      styles.innerHTML = `
        caniuse-embed {
          --border-width: 3px;

          box-sizing: border-box;
          display: block;
          position: relative;
          min-height: 300px;
          background: #eee;
          border: var(--border-width) solid #DB5600;
        }

        caniuse-embed[feature^="mdn"] {
          border-color: #3d7e9a;
        }

        caniuse-embed iframe {
          position: absolute;
          top: calc(-1 * var(--border-width));
          left: calc(-1 * var(--border-width));
          width: calc(100% + 2 * var(--border-width));
          height: calc(100% + 2 * var(--border-width));
          opacity: 0;
          transition: opacity 0.25s ease-in;
          border: none;
        }

        caniuse-embed iframe.is-loaded {
          opacity: 1;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  getDataIframe() {
    const dataFrameTable = document.createElement('iframe');

    dataFrameTable.onload = () => {
      dataFrameTable.classList.add('is-loaded');
    };

    dataFrameTable.setAttribute(
      'src',
      'https://caniuse.bitsofco.de/embed/index.html' +
        '?feat=' +
        this.feature +
        '&periods=' +
        this.periods +
        '&accessible-colours=' +
        this.showAccessibleColors
    );

    return dataFrameTable;
  }
}

export default CaniuseEmbed;
