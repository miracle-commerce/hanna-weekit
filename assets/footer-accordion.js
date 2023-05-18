class footerAccordion extends HTMLElement {
  constructor() {
    super();

    if(this.classList.contains('admin-panel--no-js')) return;

	this.toggleContent = '.footer__accordion__content';
    this.boxes = this.querySelectorAll('.footer__accordion__heading');

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
        if(window.innerWidth > 576) return false;
        var details = event.target,
            childs = _this.querySelectorAll('[open]');
        if(details.hasAttribute('open')){
          details.classList.remove('footer__accordion-opening');
        }
        else{
          details.setAttribute('open', '');
          setTimeout(function(){
            _this.resizeHandler();
            details.classList.add('footer__accordion-opening');
          }, 0);
        }
        if(childs.lenght <= 0) return false;
        childs.forEach(child => {
          child.classList.remove('footer__accordion-opening');
          setTimeout(function(){
            child.removeAttribute('open');
          }, 300);
        });
      });
    });
  }
  resizeHandler(){
   	const boxes = this.querySelectorAll('[open]+'+this.toggleContent);
	boxes.forEach(box => {
      box.style.setProperty('--scroll-height', (box.scrollHeight+1) + "px");
    });
  }
}
customElements.define('footer-accordion', footerAccordion);