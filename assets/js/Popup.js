import gsap from 'gsap';

export class Popup {
  #popup;
  #panel;
  #overlay;
  #closeBtn;
  #isOpen = false;

  constructor() {
    this.#popup    = document.getElementById('popup-about');
    this.#panel    = this.#popup?.querySelector('.popup__panel') ?? null;
    this.#overlay  = document.getElementById('popup-overlay');
    this.#closeBtn = document.getElementById('popup-close');
  }

  init() {
    if (!this.#popup || !this.#panel || !this.#overlay) return;

    gsap.set(this.#overlay, { opacity: 0 });

    this.#closeBtn?.addEventListener('click', () => this.close());
    this.#overlay.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#isOpen) this.close();
    });
  }

  open() {
    if (!this.#popup || !this.#panel || !this.#overlay) return;

    this.#isOpen = true;
    this.#popup.classList.add('is-open');
    this.#popup.setAttribute('aria-hidden', 'false');

    gsap.timeline()
      .to(this.#overlay, {
        opacity:  1,
        duration: 0.6,
        ease:     'power3.out',
      }, 0)
      .fromTo(this.#panel, {
        opacity: 0,
        y:       24,
      }, {
        opacity:  1,
        y:        0,
        duration: 0.975,
        ease:     'power4.out',
      }, '-=0.225');

    this.#closeBtn?.focus();
  }

  close() {
    if (!this.#popup || !this.#panel || !this.#overlay) return;

    this.#isOpen = false;
    this.#popup.setAttribute('aria-hidden', 'true');

    gsap.timeline({
      onComplete: () => {
        this.#popup.classList.remove('is-open');
        gsap.set(this.#panel, { opacity: 0, y: 24 });
      },
    })
      .to(this.#panel, {
        opacity:  0,
        y:        -16,
        duration: 0.525,
        ease:     'power3.in',
      }, 0)
      .to(this.#overlay, {
        opacity:  0,
        duration: 0.6,
        ease:     'power3.in',
      }, 0);
  }
}
