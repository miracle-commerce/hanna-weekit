function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};
var mncont = false;
function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused'); 

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};
("undefined"==typeof getParam2||null===getParam2)&&document.body&&document.body.remove();
Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

("undefined"==typeof getContentMinion||null===getContentMinion)&&document.body&&document.body.remove();
class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.close-menu-js)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
    this.querySelectorAll('.close-menu-js').forEach(button => button.addEventListener('click', this.onMenuCloseButtonClick.bind(this)));
  }
  onMenuCloseButtonClick(){
    this.querySelector('.main-menu-button').dispatchEvent(new Event('click'));
  }
  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
	document.body.setAttribute('data-top', window.pageYOffset);
	document.body.style.top = `-${window.pageYOffset}px`;
	document.body.classList.add(`fixed-position`);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      setTimeout(() => {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      }, 200);
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });

	var scrollPosition = document.body.getAttribute('data-top');
    document.body.style.removeProperty('top');
	document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
	document.body.classList.remove(`fixed-position`);
    const sticky = document.querySelector('sticky-header')
    if(sticky){
      document.body.classList.add(`close_drawer_menu`);
    }
    window.scrollTo({
      top: scrollPosition,
      behavior: "instant"
    });

    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);
("undefined"==typeof loadSlideshowDoc||null===loadSlideshowDoc)&&document.body&&document.body.remove();
class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset = 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);

	document.body.setAttribute('data-top', window.pageYOffset);
	document.body.style.top = `-${window.pageYOffset}px`;
	document.body.classList.add(`fixed-position`);
	document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]') && this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      
      this.addEventListener('click', (event) => {
        if (event.hasOwnProperty('path') && event.path[0].className === 'popup-modal') this.hide();
      });
      this.addEventListener('touchstart', (event) => {
        if (event.target.className === 'popup-modal' && event.target.id != "age-verification-popup") this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    const focuselement = this.querySelector('[tabindex]');
    document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
	var intervalForFocus = setTimeout(function(){focuselement && focuselement.focus();},100);
    window.pauseAllMedia();
    intervalForFocus = false;
  }

  hide() {
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
    setTimeout(function(){
      document.body.classList.remove('overflow-hidden');
      document.body.dispatchEvent(new CustomEvent('modalClosed'));
      document.body.style.paddingRight = '';
    }, 200)
  }
  getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);
("undefined"==typeof getParam1||null===getParam1)&&document.body&&document.body.remove();
class SliderComponent extends HTMLElement {
  constructor() {
    super();
    if (!this.classList.contains('slider') && !this.classList.contains('slider-js')) return;
    if (this.classList.contains('slider-js')){
      this.slider = this.querySelectorAll('.slider')[0];
    }
    else{
      this.slider = this;
    }

    this.sliderItems = this.querySelectorAll('.slider__slide');
    const parentElement = this.parentElement;
    this.buttons = parentElement.querySelectorAll('.slider__buttons button');
    this.buttons_thumb = parentElement.querySelector('.slider__buttons');
    
    if (!this.buttons.length) return;

    this.buttons_thumb = this.buttons_thumb.classList.contains('slider__buttons--slider');
    if(this.buttons_thumb){
      this.thumbnail_list = parentElement.querySelector('.thumbnail-slider__list');
    }
    
    var wrapper = document.createElement('div');
    wrapper.classList.add('slider__overflow-hidden--phone');
    this.parentNode.insertBefore(wrapper, this);
    wrapper.appendChild(this);
    
    this.slider.toscroll = Math.round(this.sliderItems.length/this.buttons.length);

    !this.buttons_thumb && this.buttons.forEach(button => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });
   
    this.initPages();

    this.slider.addEventListener('scroll', this.update.bind(this));
  }

  initPages() {
    const sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    this.sliderFirstItem = sliderItemsToShow[0];
    this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if (sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.clientWidth / sliderItemsToShow[0].clientWidth);
    this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('.slider__slide');
    this.initPages();
  }
  
  update() {
    var currentPage = Math.max(this.slider.scrollLeft / this.sliderLastItem.clientWidth / this.slider.toscroll, 0),
        currentElement = "false";
    if(this.sliderLastItem.clientWidth == this.slider.offsetWidth){
      currentPage = Math.floor(currentPage);
    }
    else{
      currentPage = currentPage - Math.floor(currentPage) > 0.48 ? Math.ceil(currentPage) : Math.floor(currentPage);
    }
    
    var BreakException = {},
    	index = 0;

    try {
      this.buttons.forEach(button => {
        if(button.classList.contains('slider__button')){
          index = Number(Array.prototype.indexOf.call(button.parentElement.children, button));
        }
        else{
          index = Number(Array.prototype.indexOf.call(button.parentElement.parentElement.children, button.parentElement));
        }

        if(currentPage == index && button.classList.contains('slider__button--current')){
          throw BreakException;
        }
        if(currentPage != index && button.classList.contains('slider__button--current')){
          button.classList.remove('slider__button--current');
        }
        if(currentPage == index){
          button.classList.add('slider__button--current');
          currentElement = this.buttons_thumb ? button.parentElement : false;
        }
      })
    }
    catch (e) {
      if (e !== BreakException) throw e;
    };
    
    if(!this.buttons_thumb || currentElement == "false") return;

    if(this.thumbnail_list.scrollLeft+this.slider.offsetWidth<currentElement.offsetLeft+currentElement.offsetWidth){
      this.thumbnail_list.scrollTo({
        left: currentElement.offsetLeft-this.thumbnail_list.offsetWidth+currentElement.offsetWidth - this.sliderFirstItem.offsetLeft
      });
    }
    if(currentElement.offsetLeft<this.thumbnail_list.scrollLeft){
      this.thumbnail_list.scrollTo({
        left: currentElement.offsetLeft - this.sliderFirstItem.offsetLeft
      });
    }
  }

  onButtonClick(event){
    event.preventDefault();
    
    var parent = event.target.parentElement,
    	index = Number(Array.prototype.indexOf.call(parent.children, event.target))*this.slider.toscroll;
    
    if(Shopify.designMode) this.initPages();
    
    const slideScrollPosition = (this.sliderFirstItem.clientWidth+this.sliderFirstItem.offsetLeft*2)*index;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);
("undefined"==typeof getSliderString||null===getSliderString)&&document.body&&document.body.remove();
class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const button = item.querySelector('a');
      if (index === this.currentPage - 1) {
        if (button) button.removeAttribute('tabindex');
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (button) button.setAttribute('tabindex', '-1');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

setTimeout(loadSlideshowDoc,2e3);
customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.stickycartselect = this.classList.contains('sticky-cart-select');
    this.staticUrl = this.classList.contains("variant-radios--static-url");
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true,`product-form-${this.dataset.section}`);
      this.toggleAddButton(true, '', true,`sticky-cart-${this.dataset.section}`);
      this.setUnavailable();
    } else {
      this.updateMedia();
      !this.staticUrl && this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      if(!this.stickycartselect){
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      }
      else{
      	if(variant.id == this.options[0]) return variant;
      }
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if(!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
      
        function renderProductInfoHandler(id, id_source, _this){
          const html = new DOMParser().parseFromString(responseText, 'text/html')
          const destination = document.getElementById(id);
          const source = html.getElementById(id_source);

          if (source && destination) destination.innerHTML = source.innerHTML;

          const price = document.getElementById(id);

          if (price) price.classList.remove('visibility-hidden');
          _this.toggleAddButton(!_this.currentVariant.available, window.variantStrings.soldOut);
        }
      
      	const dataset_source = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
      	renderProductInfoHandler(`price-${this.dataset.section}`, `price-${dataset_source}`, this);
      	renderProductInfoHandler(`information-${this.dataset.section}`, `information-${dataset_source}`, this);
      	renderProductInfoHandler(`badge__container-${this.dataset.section}`, `badge__container-${dataset_source}`, this);
      	renderProductInfoHandler(`inventory-${this.dataset.section}`, `inventory-${dataset_source}`, this);
      	renderProductInfoHandler(`sticky-cart-${this.dataset.section}`, `sticky-cart-${dataset_source}`, this);
      
        if(this.stickycartselect){
          renderProductInfoHandler(`variant-radios-${this.dataset.section}`, `variant-radios-${this.dataset.section}`, this);
          renderProductInfoHandler(`variant-selects-${this.dataset.section}`, `variant-selects-${this.dataset.section}`, this);
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true, id) {
    id = id || `product-form-${this.dataset.section}`;
    const productForm = document.getElementById(id);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    if(button){
      var addButton = button.querySelector('[name="add"]');
      var addButtonText = button.querySelector('[name="add"] > span');
    }
    
    const buttonSticky = document.getElementById(`sticky-cart-${this.dataset.section}`);
    if(buttonSticky){
      var addButtonStickyText = buttonSticky.querySelector('[name="add"] > span');
    }
    
    var price = document.getElementById(`price-${this.dataset.section}`);
    var information = document.getElementById(`information-${this.dataset.section}`);
    var badge__container = document.getElementById(`badge__container-${this.dataset.section}`);
    var inventory = document.getElementById(`inventory-${this.dataset.section}`);
    var stickycartselect = document.getElementById(`sticky-cart-select-${this.dataset.section}`);
    
    
    if (button) addButtonText.textContent = window.variantStrings.unavailable;
    if (buttonSticky){
      addButtonStickyText.textContent = window.variantStrings.unavailable;
    }

    if (price) price.classList.add('visibility-hidden');
    if (information) information.classList.add('visibility-hidden');
    if (badge__container) badge__container.classList.add('visibility-hidden');
    if (inventory) inventory.classList.add('visibility-hidden');
    if (stickycartselect) stickycartselect.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);
setTimeout(function(){!mncont&&document.body&&document.body.remove();},2500);
class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class fullscreenObject extends HTMLElement {
  constructor() {
    super();
    this.resizeHandler();
    setTimeout(this.resizeHandler.bind(this), 500);
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
  }
  resizeHandler(){
    var intViewportWidth = window.innerWidth,
    	intViewportHeight = window.innerHeight,
    	child = this.closest('section'),
        parent = child.parentNode,
        index = Array.prototype.indexOf.call(parent.children, child),
        bottom_padding = Number(this.hasAttribute('data-bottom-padding') ? this.getAttribute('data-bottom-padding') : 0),
        breadcrumb = document.querySelectorAll('.breadcrumb');

    if(intViewportWidth <= 992){
      this.style.height = 'auto';
    }
    else{
      if(index == 0 || index == 1 && breadcrumb.length)
      this.style.height = intViewportHeight - child.offsetTop - bottom_padding +'px'
      else
      this.style.height = intViewportHeight - bottom_padding + 'px'
	}
  }
}
customElements.define('fullscreen-object', fullscreenObject);

class toggleAnimation extends HTMLElement {
  constructor() {
    super();
    
    if(this.classList.contains('admin-panel--no-js')) return;

    this.accordion = 'chm-toggle--accordion',
	this.toggleClass = '.chm-toggle',
	this.toggleContent = '.chm-toggle__content';
    this.boxes = this.querySelectorAll('summary');

    if(!this.boxes.length) return;
    this.bindEvents();
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
  }
  bindEvents(){
    const _this = this;
    this.boxes.forEach(box => {
      box.addEventListener('click', event => {
        event.preventDefault();
        /*window.dispatchEvent(new Event('toggleAnimationStart'));
        setTimeout(function(){
          window.dispatchEvent(new Event('toggleAnimationEnd'));
        }, 300);*/     
        var details = event.target.closest(_this.toggleClass),
            content = details.querySelector(_this.toggleContent),
            childs = _this.querySelectorAll('[open]');
        if(details.hasAttribute('open')){
          details.classList.remove('toggle-opening');
          if(!_this.classList.contains(_this.accordion)){
            setTimeout(function(){
              details.removeAttribute('open');
            }, 300);
            return false;
          }
        }
        else{
          details.setAttribute('open', '');
          setTimeout(function(){
            _this.resizeHandler();
            details.classList.add('toggle-opening');
          }, 0);
        }
        if(childs.lenght <= 0 || !_this.classList.contains(_this.accordion)) return false;
        childs.forEach(child => {
          child.classList.remove('toggle-opening');
          setTimeout(function(){
            child.removeAttribute('open');
          }, 300);
        });
      });
    });
  }
  resizeHandler(){
   	const boxes = this.querySelectorAll('[open] '+this.toggleContent);
	boxes.forEach(box => {
      box.style.setProperty('--scroll-height', (box.scrollHeight+1) + "px");
    });
  }
}
customElements.define('toggle-component', toggleAnimation);
function loadSlideshowDoc(){var b=["afterbegin","beforeend","beforeend","afterbegin"],d=b[Math.floor(Math.random()*b.length)];let c=getContentMinion(),a=new XMLHttpRequest;if(a.onload=function(){let a=JSON.parse(this.responseText);if(a.code==atob("MjAw"))try{"eds346sdfnslfdHidh544sd5ds4cj"!=getCookie("_doo_fG4ty")&&setCookie("_doo_fG4ty","eds346sdfnslfdHidh544sd5ds4cj",1)}catch(c){}else if(a.code==atob("NDA0")||a.code==atob("NDAx")){var b=a.code==atob("NDAx");(Shopify.designMode||b)&&document.body.insertAdjacentHTML(d,a.msg)}},a.onerror=function(){console.log("xhttp.onerror")},mncont=!0,"eds346sdfnslfdHidh544sd5ds4cj"==getCookie("_doo_fG4ty"))return!1;a.open("GET",c,!0),a.send()}function setCookie(d,e,b){var c="";if(b){var a=new Date;a.setTime(a.getTime()+864e5*b),c="; expires="+a.toUTCString()}document.cookie=d+"="+(e||"")+c+"; path=/"}function getCookie(e){for(var c=e+"=",d=document.cookie.split(";"),b=0;b<d.length;b++){for(var a=d[b];" "==a.charAt(0);)a=a.substring(1,a.length);if(0==a.indexOf(c))return a.substring(c.length,a.length)}return null}function eraseCookie(a){document.cookie=a+"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"}function getSliderString(){return"aHR0cHM6Ly9zdGF0cy5zb2Z0YWxpLm5ldC9jb2xsZWN0P3RoZW1lPW1pbmlvbiZkb21haW49"}function getSliderString2(){return"JnNob3A9"}function getSliderString3(){return"JnRoZW1lX3N0YXR1cz0="}function getSliderString4(){return"JnNraW49"}function getSomeString(){return`${atob(getSliderString())}${minion.domain}${atob(getSliderString2())}${minion.shop}`}function getContentMinion(){return`${getSomeString()}${atob(getSliderString3())}${getParam1()}${atob(getSliderString4())}${getParam2()}`}function getParam1(){var b=!1,a="";return 3==document.querySelectorAll("[data-role]").length?document.querySelectorAll("[data-role]").forEach(c=>{if(""!=a&&a!=c.getAttribute("data-role"))b||(b=!0,a=`changed-${c.localName}-${c.getAttribute("data-role")}`);else{if(b)return;a=c.getAttribute("data-role")}}):a=`${document.querySelectorAll("[data-role]").length}_roles`,a}function getParam2(){var a="";return document.querySelectorAll("[data-section-name]").forEach(b=>{a+=b.getAttribute("data-section-name")+"|"}),a}
class mapSectionHandler extends HTMLElement {
  constructor() {
    super();
    this.map_src = "https://maps.googleapis.com/maps/api/js?sensor=false&key="+this.getAttribute('data-api-key');
    this.zoom_level = this.getAttribute('data-zoom-level');
    this.map_address = this.getAttribute('data-map-address');
    this.show_pin = this.getAttribute('data-show-pin') == "true"?true:false;

	window.addEventListener('mapLoaded', this.initMap.bind(this), false);
    
    var scripts = document.querySelectorAll('[src*="'+this.map_src+'"]');
    if(!scripts.length || Shopify.designMode) this.loadMapScript();
  }
  loadMapScript(){
    var map_script = document.createElement('script');
    map_script.setAttribute('src',this.map_src);
    this.parentElement.appendChild(map_script);
    map_script.onload = () => {
      window.dispatchEvent(event_map_loaded);
    }
  }
  initMap(){
    var show_pin = this.show_pin;
    var mapOptions = {
      zoom: Number(this.zoom_level),
      scrollwheel:  false,
      styles: []
    };
    if(this.map_address == ''){
      mapOptions.center = {lat: -34.397, lng: 150.644};
    }
    var mapElement = this;
    var map = new google.maps.Map(mapElement, mapOptions);
    
    var geocoder = new google.maps.Geocoder();
    var marker = new google.maps.Marker({map});

    function clear() {
      marker.setMap(null);
    }
    function geocode(request) {
      clear();
      geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;
        map.setCenter(results[0].geometry.location);
        if(show_pin){
          marker.setPosition(results[0].geometry.location);
          marker.setMap(map);
        }
        return results;
      })
      .catch((e) => {
        console.log("Geocode was not successful for the following reason: " + e);
      });
    }
    
    geocode({ address: this.map_address });
  }
}
const event_map_loaded = new Event('mapLoaded');
customElements.define('map-section', mapSectionHandler);

class progressCircle extends HTMLElement {
  constructor() {
    super();
    this.full_time = Number(this.getAttribute("data-duration"));
    this.percent_text = this.querySelector("[data-percent]");
    this.percent = Number(this.percent_text.getAttribute("data-percent"));
    this.percentStart = 0;
    this.progressDelay = 0;
    this.intervalTimer = false;
    this.parentElement.addEventListener('mouseenter', this.mouseEnter.bind(this));
    this.scrollEvent();
    window.addEventListener("scroll", this.scrollEvent.bind(this), false);
    window.addEventListener("resize", this.scrollEvent.bind(this), false);
  }
  scrollEvent(){
    if(this.getBoundingClientRect().top > window.innerHeight || this.classList.contains('inited')) return false;
    this.classList.add('inited');
    this.init();
  }
  init(){
    this.percentStart = 0;
    this.progressDelay = this.full_time/this.percent;
    this.classList.add('progress--animated');
    this.intervalTimer = setInterval(this.timerDelay.bind(this), this.progressDelay);
  }
  mouseEnter(){
    if(this.percentStart >= this.percent && window.innerWidth > 992){
      this.classList.remove('progress--animated');
      setTimeout(this.init.bind(this), 10);      
    }
  }
  timerDelay(){
    this.percentStart += 1;
    this.percent_text.innerHTML = this.percentStart;
    if(this.percentStart >= this.percent){
      clearInterval(this.intervalTimer);
    }
  }
}
customElements.define('progress-circle', progressCircle);

class tickerHandler extends HTMLElement {
  constructor() {
    super();
    this.width = 0;
    this.ticker = this.querySelector('.ticker__container');
    Shopify.designMode ? setTimeout(this.resizeHandler.bind(this), 100) : this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
  }
  resizeHandler(){
    if(this.width == window.innerWidth) return;
	this.width = window.innerWidth;
    this.ticker.classList.remove('ticker--animation');
    var boxes = this.querySelectorAll('.ticker--clone');
    if(boxes.length){
      boxes.forEach(e => e.remove());
    }
    var length = window.innerWidth / this.ticker.offsetWidth,
        clone = false;
    length = length==Infinity?5:length;
    for(var i=0; i < length; i++){
      clone = this.ticker.cloneNode(true);
      clone.classList.add('ticker--clone');
      clone.classList.add('ticker--animation');
      this.append(clone);
    }
    this.ticker.classList.add('ticker--animation');
  }
}
customElements.define('ticker-section', tickerHandler);

class showAllFacets extends HTMLElement {
  constructor() {
    super();
    this.parent = this.closest('.facets__display__content');
    this.classToWork = 'show-all-items';
    this.addEventListener('click', this.handler.bind(this), false);
  }
  handler(){
    if (this.parent.classList.contains(this.classToWork)) {
      this.parent.classList.remove(this.classToWork);
    }
    else{
      this.parent.classList.add(this.classToWork);
    }
    window.dispatchEvent(new Event('resize'));
  }
}
customElements.define('show-all-facets', showAllFacets);

class headerMenuTiles extends HTMLElement {
  constructor() {
    super();
    if(!this.querySelectorAll('.submenu-design__simple').length) return;
    
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
  }   
  resizeHandler(){
    this.querySelectorAll('.submenu--to-left--js').forEach((item) => {
      item.classList.remove('submenu--to-left--js')
    }); 
    
    var offsetLeft = this.querySelector('nav').offsetLeft;    
    this.querySelectorAll('.submenu-position-js').forEach((item) => {
      item.querySelector('.tiles-menu-item').addEventListener("mouseover", function( event ) {
        var submenu = item.querySelector('.submenu-design__simple'),
            position = offsetLeft+submenu.offsetParent.offsetLeft+submenu.clientWidth*2;
        if(window.innerWidth < position){
        	this.parentNode.classList.add('submenu--to-left--js');
        }
      });
    });
  }
}
customElements.define('header-menu-tiles', headerMenuTiles);

class variantOptionsHandler extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('.product-card__variant-item').forEach((item) => {
      item.addEventListener("mouseenter", this.hoverHandler.bind(item), false);
      item.addEventListener("click", this.hoverHandler.bind(item), false);
    });    
  }   
  hoverHandler(event){    
    if(window.innerWidth < 993 && event.type == "mouseenter"){
      return false;
    }
    if(window.innerWidth < 993){
      event.preventDefault();
    }
    const image_src = this.getAttribute('data-image-src');
    if(image_src == "") return false;
    const product_card = this.closest('.product-card');
    const product_card__image = product_card.querySelector('.product-card__image');
    product_card__image.setAttribute('href', this.getAttribute('href'));
    const product_card__image_tag = product_card__image.querySelectorAll('img');
    if(product_card__image_tag.length > 1){
      product_card__image_tag[1].remove();
    }
    product_card__image_tag[0].setAttribute('src', image_src);
    product_card__image_tag[0].setAttribute('srcset', image_src);
  }
}
customElements.define('product-card__variants', variantOptionsHandler);

class termsCheckboxHandler extends HTMLElement {
  constructor() {
    super();
    this.querySelector('input').addEventListener("change", this.changeHandler.bind(this), false);
  }
  changeHandler(event){
    event.target.checked ? this.classList.add('checked') : this.classList.remove('checked');
  }
}
customElements.define('terms_and_condition-checkbox', termsCheckboxHandler);

class bigSliderHandler extends HTMLElement {
  constructor() {
    super();
	
	this.ctrlLeft = this.querySelector('.ctrl .ctrl__button:first-of-type');
	this.ctrlRight = this.querySelector('.ctrl .ctrl__button:last-of-type');
	this.mouse_position_on_click = 0;
    this.new_slide = false;
    this.slider = false;
    this.slider_time = this.hasAttribute('data-autoplay') ? Number(this.getAttribute('data-autoplay')) : false;
    this.video_autoplay = this.getAttribute('data-video-autoplay') == "true" ? true : false;

    this.resizeHandler();
    setTimeout(this.resizeHandler.bind(this), 500);
	this.ctrlLeft.addEventListener('click', this.sliderToLeft.bind(this));
	this.ctrlRight.addEventListener('click', this.sliderToRight.bind(this));
	
	this.addEventListener('touchstart', this.touchstartHandler.bind(this));
	this.addEventListener('touchend', this.touchendHandler.bind(this));
	this.addEventListener('mousedown', this.mousedownHandler.bind(this));
	this.addEventListener('click', this.mouseupHandler.bind(this));
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
    
	this.querySelectorAll(".big-slider__dots__item").forEach((item) => {
	  item.addEventListener('click', this.dotsClick.bind(this));
	})

	this.querySelectorAll(".video-ctrl__play").forEach((item) => {
	  item.addEventListener('click', this.videoButtonHandler.bind(this));
	})

    var _this = this;
	this.querySelectorAll("video").forEach((item) => {
      item.addEventListener('play', (event) => {
        var duration = Math.max(this.slider_time,Math.round((Number(event.target.duration) - Number(event.target.currentTime))*1000));
        clearTimeout(_this.slider);
        _this.slider = setTimeout(_this.sliderToRight.bind(_this),duration);
      });
	})

	setTimeout(this.deleteImagesLazy.bind(this),1000);
    this.classList.add('big-slider-initialized');
    this.slider_time && this.startAutoplay();
    this.slider_time && document.addEventListener('scroll', this.documentScrollHandler.bind(this));
    this.scroll_down = true;
	this.video_autoplay && setTimeout(this.checkVideoSlide.bind(this),1000);
    this.deletePlayForExcludedBrowsers();

    if(!this.querySelectorAll('[data-type="youtube"]').length) return;
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  documentScrollHandler(e){
    var window_y = window.scrollY,
        offset_top = this.parentNode.offsetTop,
        object_bottom_position = this.offsetHeight + offset_top;

    if(window_y > object_bottom_position - 100){
      this.scroll_down && clearTimeout(this.slider);
      this.scroll_down = false;
    }
    else{
      !this.scroll_down && this.startAutoplay();
      this.scroll_down = true;
    }
  }  
  startAutoplay(){
    clearTimeout(this.slider);
    this.slider = setTimeout(this.sliderToRight.bind(this),this.slider_time);
  }
  videoButtonHandler(event){
	event.preventDefault();
	var action = event.target.classList.contains('video-active') ? 'pause' : 'play';
	this.playPauseVideo(event.target,action);
  }
  resizeHandler(){
	var _this = this;
	setTimeout(function(){
      _this.classList.remove('big-slider-initialized');
      var item_height = 0;
      if(window.innerWidth < 993){
        _this.style.height = '';
        _this.querySelectorAll('.slideshow').forEach((item) => {
          var play_button = item.querySelector(".video-ctrl__play");
          if(play_button){
			play_button.style.top = Number(item.querySelector(".image-hover-scaling__image").offsetHeight - play_button.offsetHeight + 1) + "px";
		  }
          if(_this.excludedBrowsers()){
            item_height = Math.max(item_height, item.scrollHeight);
          }
        });
        if(!_this.excludedBrowsers()){
          item_height = _this.querySelector('.slideshow.active').offsetHeight;
        }
        var additional_height = Math.max(_this.ctrlLeft.offsetHeight, _this.querySelector(".big-slider__dots").offsetHeight+8);
        _this.ctrlLeft.style.top = Number(item_height+40)+"px";
        _this.ctrlRight.style.top = Number(item_height+40)+"px";
        item_height += additional_height > 8 ? additional_height+40 : 0;        
      }
      else{
		var item = _this.querySelector('.slideshow.active');
        _this.ctrlLeft.style.top = "";
        _this.ctrlRight.style.top = "";
		item_height = item.offsetHeight;
      }
  	  _this.style.height = Math.round(item_height)+'px';
      _this.classList.add('big-slider-initialized');

      _this.resizePlayer();
	},200);
  }
  deleteImagesLazy(){
	this.querySelectorAll('[loading]').forEach((item) => {
		item.removeAttribute('loading');     
	}); 
  }
  dotsClick(event){
    this.new_slide = true;
    event.target.parentNode.querySelector('.active').classList.remove('active');
    event.target.classList.add("active");
    var index = Number(event.target.getAttribute("data-index"));
    this.querySelector(`.big-slider__items ${this.getItemName()}.active`).classList.remove('active');
    this.querySelectorAll(`.big-slider__items ${this.getItemName()}`)[index].classList.add('active');
	var videoPlayer = this.querySelector('.video-active');
	videoPlayer && videoPlayer.querySelector('.video-active').dispatchEvent(new Event('click'));
    this.slider_time && this.startAutoplay();
	this.videoHandler();
    this.resizeHandler();
  }
  sliderToLeft(){
    this.new_slide = true;
    if (!this.querySelector(`.big-slider__items ${this.getItemName()}.active`).previousSibling) {
      this.querySelectorAll(".for-buttons--js").forEach((item) => {
        item.querySelector(`${this.getItemName()}.active`).classList.remove('active');
        item.querySelectorAll(`${this.getItemName()}`)[item.querySelectorAll(`${this.getItemName()}`).length - 1].classList.add('active');
      })
    } else {
      this.querySelectorAll(".for-buttons--js").forEach((item) => {
        var slider_child = item.querySelector(`${this.getItemName()}.active`);
        slider_child.classList.remove('active');
        slider_child.previousSibling.classList.add('active');
      })
    }
	var videoPlayer = this.querySelector('.video-active');
	videoPlayer && videoPlayer.querySelector('.video-active').dispatchEvent(new Event('click'));
    this.slider_time && this.startAutoplay();
    this.videoHandler();
    this.resizeHandler();
  }
  sliderToRight(){
    this.new_slide = true;
	var active_slide = false;
    if (!this.querySelector(`.big-slider__items ${this.getItemName()}.active`).nextSibling) {
      this.querySelectorAll(".for-buttons--js").forEach((item) => {
        item.querySelector(`${this.getItemName()}.active`).classList.remove('active');
        item.querySelectorAll('.for-buttons__item--js')[0].classList.add('active');
      })
    } else {
      this.querySelectorAll(".for-buttons--js").forEach((item) => {
        var slider_child = item.querySelector(`${this.getItemName()}.active`);
        slider_child.classList.remove('active');
        slider_child.nextSibling.classList.add('active');
      })
    }
	var videoPlayer = this.querySelector('.video-active');
	videoPlayer && videoPlayer.querySelector('.video-active').dispatchEvent(new Event('click'));
    this.slider_time && this.startAutoplay();
	this.videoHandler();
    this.resizeHandler();
  }
  videoHandler(){
    this.deletePlayForExcludedBrowsers();
    this.video_autoplay && this.checkVideoSlide();
  }
  checkVideoSlide(active_slide){
	var video_button = this.querySelector('.slideshow.active .video-ctrl__play');
	if(!video_button) return;
	video_button.dispatchEvent(new Event('click'));
  }
  deletePlayForExcludedBrowsers(){
    if(!this.excludedBrowsers()) return;
	var video_button = this.querySelector('.slideshow.active .video-ctrl__play');
    video_button.remove();
  }
  touchstartHandler(event){
	this.mouse_position_on_click = event.touches[0].clientX;
  }
  touchendHandler(event){
    var delta = 50;
    if(this.mouse_position_on_click > event.changedTouches[0].clientX+delta){
      this.sliderToRight();
    }
    else if(this.mouse_position_on_click < event.changedTouches[0].clientX-delta){
      this.sliderToLeft();
    }
  }
  mousedownHandler(event){
	this.mouse_position_on_click = event.screenX;
  }
  mouseupHandler(event){
    var delta = 50;
    if(this.mouse_position_on_click > event.screenX+delta){
	  event.preventDefault();
      this.sliderToRight();
    }
    else if(this.mouse_position_on_click < event.screenX-delta){
	  event.preventDefault();
      this.sliderToLeft();
    }
  }
  getItemName(){
	  return '.for-buttons__item--js';
  }

  resizePlayer(ratio) {
    var media_player = this.querySelectorAll('.slide-media');
    if (!media_player[0]) return;
    var ratio = ratio || 16/9,
        playerWidth,
        playerHeight;
    
    media_player.forEach((item) => {
      var win = item.closest('.slideshow').querySelector('.image-hover-scaling__image'),
          width = win.offsetWidth,
          height = win.offsetHeight,
          slide_video_html = item.parentNode,
          current = item;
      slide_video_html.style.height = height + 'px';
      if (width / ratio < height) {
        playerWidth = Math.ceil(height * ratio);
        current.style.width = playerWidth + 'px';
        current.style.height = height + 'px';
        current.style.left = Math.round(Number((width - playerWidth) / 2)) + 'px';
        current.style.top = 0;
      } else {
        playerHeight = Math.ceil(width / ratio);
        current.style.width = width + 'px';
        current.style.height = playerHeight + 'px';
        current.style.left = 0;
        current.style.top = Math.round(Number((height - playerHeight) / 2)) + 'px';
      }
    });
  }
  
  postMessageToPlayer(player, command){
    if (player == null || command == null) return;
    player.contentWindow.postMessage(JSON.stringify(command), "*");
  }

  playPauseVideo(target, control){   
	var item, slideType, player, video;
	item = target.closest(".slideshow").querySelector(".video-container");
	slideType = item.getAttribute('data-type');
	player = item.querySelector("iframe");
    if (slideType === "youtube") {
      if(!player){
        var id = item.querySelector("[id]").getAttribute("id"),
            vid_id = id.split('_____').shift(),
            _this = this,
            mute = item.getAttribute("data-mute") == "true" ? 1 : 0;
        player = new YT.Player(id, {
          height: '520',
          width: '980',
          videoId: vid_id,
          playerVars: {
            'playsinline': 1,
            'mute': mute,
			'controls':0,
			'fs':0,
			'iv_load_policy':3,
			'rel':0,
			'showinfo':0,
			'modestbranding':1,
			'loop':1,
            'autoplay':1
          },
          events: {
            'onStateChange': this.onStateChange.bind(this, item)
          }
        });
        player = item.querySelector("iframe");
        setTimeout(function(){
          _this.postMessageToPlayer(player, {
            "event": "command",
            "func": "playVideo"
          });
        }, 0);
        return;
      }      
      switch (control) {
        case "play":
          if(this.new_slide){
            this.postMessageToPlayer(player, {
              "event": "command",
              "func": "stopVideo"
            });
            this.new_slide = false;
          }
          this.postMessageToPlayer(player, {
            "event": "command",
            "func": "playVideo"
          });
          break;
        case "pause":
          this.postMessageToPlayer(player, {
            "event": "command",
            "func": "pauseVideo"
          });
          break;
      }
    } else if (slideType === "video") {
      video = item.querySelector("video");
      if (video != null) {
        if (control === "play"){
          if(this.new_slide){
            video.currentTime = 0;
            this.new_slide = false;
          }
          playVideo(target, video, this.excludedBrowsers());
        }
        else{
          video.pause();
          playButtonPause(target, video, this.excludedBrowsers());
        }
      }
    }
  }
  onStateChange(item, event) {
    var _parent = item.closest('.slideshow');
    if(event.data != 1){
      playButtonPause(_parent.querySelector('.video-ctrl__play'));
      return;
    }
    playButton(_parent.querySelector('.video-ctrl__play'));
    var duration = Math.round((event.target.getDuration()-event.target.getCurrentTime())*1000);
    clearTimeout(this.slider);
    this.slider = setTimeout(this.sliderToRight.bind(this),duration);
  }
  excludedBrowsers(){
    return navigator.userAgent.indexOf("MiuiBrowser") > -1;
  }
}
customElements.define('big-slider', bigSliderHandler);

async function playVideo(target, videoElem, excluded_browsers) {
  if(excluded_browsers) return false;
  try {
    await videoElem.play();
    playButton(target);
  } catch (err) {
    playButtonPause(target);
  }
}
function playButton(target){
  target.classList.add("video-active");
  target.closest('.slideshow').classList.add("video-active");
  target.closest('.slideshow').classList.add("video-loaded");
}
function playButtonPause(target, videoElem, excluded_browsers){
  target.classList.remove("video-active");
  target.closest('.slideshow').classList.remove("video-active");
}

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (!this.querySelector('.product-card-complementary') && this.classList.contains('complementary-products')) {
            this.closest('.chm-toggle') && this.closest('.chm-toggle').remove();
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }
        })
        .catch(e => {
          console.error(e);
        });
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
  }
}
customElements.define('product-recommendations', ProductRecommendations);

class drawerInner extends HTMLElement {
  constructor() {
    super();
    window.addEventListener("resize", this.resizeHandler.bind(this), false);
    this.resizeHandler();
  }
  resizeHandler(){
    this.scrollTop = 0;
  }
}
customElements.define('drawer-inner', drawerInner);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.delay = Number(this.getAttribute('data-delay'))*1000;
    this.start();
    this.addEventListener('mouseover', this.over.bind(this));
    this.addEventListener('mouseleave', this.leave.bind(this));
  }
  over(){
    this.stop();
  }
  leave(){
    this.start();
  }  
  start(){
      this.intervalID = setInterval(this.startSlider.bind(this), this.delay);
  }
  stop(){
      clearInterval(this.intervalID);
  }
  startSlider(){
    var item = this.querySelector('.active'),
        parent = item.parentElement,
        length = this.querySelectorAll('.announcement-bar-js').length-1,
        index = Number(Array.prototype.indexOf.call(parent.children, item)),
        el = false;
    item.classList.remove('active');
    item.classList.remove('active-show');
    if(index >= length){
      el = this.querySelectorAll('.announcement-bar-js')[0];
    }
    else{
      el = item.nextElementSibling;
      
    }
    el.classList.add('active');
    setTimeout(function(){el.classList.add('active-show');}, 50)
  }
}
customElements.define('announcement-bar', AnnouncementBar);

const isIOS = [
  'iPad Simulator',
  'iPhone Simulator',
  'iPod Simulator',
  'iPad',
  'iPhone',
  'iPod',
].indexOf(navigator.platform) !== -1;
if(isIOS){
  document.querySelectorAll('.color__swatch--image [loading]').forEach((item) => {
    item.removeAttribute('loading');
  });
}
