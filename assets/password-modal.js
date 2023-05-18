class PasswordModal extends ModalDialog {
  constructor() {
    super();

    if (this.querySelector('input[aria-invalid="true"]')){
      const modal_id = '#'+this.getAttribute('id');
      document.querySelector(`[data-modal="${modal_id}"] button`).click();
    }
  }
}

customElements.define('password-modal', PasswordModal);