import gsap from 'gsap';
import { BRANDS, SHARED_ADDRESS, SHARED_PHONE, SHARED_PHONE_TEL } from './brandContent.js';

export class BrandPopup {
  #popup;
  #panel;
  #overlay;
  #closeBtn;
  #logoLink;
  #logoImg;
  #textRoot;
  #metaRoot;
  #isOpen = false;
  #onGoHome;

  constructor({ onGoHome } = {}) {
    this.#onGoHome = onGoHome;
    this.#popup = document.getElementById('popup-brand');
    this.#panel = this.#popup?.querySelector('.popup__panel') ?? null;
    this.#overlay = document.getElementById('popup-brand-overlay');
    this.#closeBtn = document.getElementById('popup-brand-close');
    this.#logoLink = this.#popup?.querySelector('[data-popup-go-home]') ?? null;
    this.#logoImg = this.#popup?.querySelector('.popup__logo img') ?? null;
    this.#textRoot = this.#popup?.querySelector('[data-brand-text]') ?? null;
    this.#metaRoot = this.#popup?.querySelector('[data-brand-meta]') ?? null;
  }

  init() {
    if (!this.#popup || !this.#panel || !this.#overlay) return;

    gsap.set(this.#overlay, { opacity: 0 });

    this.#closeBtn?.addEventListener('click', () => this.close());
    this.#overlay.addEventListener('click', () => this.close());

    this.#logoLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
      this.#onGoHome?.();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#isOpen) this.close();
    });
  }

  #buildMetaRow(label, value, href) {
    const row = document.createElement('div');
    row.className = 'popup__meta-item';

    const labelEl = document.createElement('span');
    labelEl.className = 'popup__meta-label';
    labelEl.textContent = label;

    if (href) {
      const link = document.createElement('a');
      link.className = 'popup__meta-value popup__meta-link';
      link.href = href;
      link.textContent = value;
      row.append(labelEl, link);
    } else {
      const val = document.createElement('span');
      val.className = 'popup__meta-value';
      val.textContent = value;
      row.append(labelEl, val);
    }

    return row;
  }

  #render(index) {
    const brand = BRANDS[index];
    if (!brand || !this.#textRoot || !this.#metaRoot) return;

    if (this.#logoImg) {
      this.#logoImg.src = brand.logo;
      this.#logoImg.alt = brand.logoAlt;
    }

    this.#textRoot.replaceChildren(
      ...brand.detail.map((paragraph) => {
        const p = document.createElement('p');
        p.className = 'popup__text';
        p.textContent = paragraph;
        return p;
      }),
    );

    const metaItems = [
      { label: 'Địa chỉ', value: SHARED_ADDRESS, href: null },
      { label: 'Điện thoại', value: SHARED_PHONE, href: `tel:${SHARED_PHONE_TEL}` },
      ...brand.hours.map((h) => ({ label: h.label, value: h.value, href: null })),
    ];

    this.#metaRoot.replaceChildren(
      ...metaItems.map(({ label, value, href }) => this.#buildMetaRow(label, value, href)),
    );
  }

  open(index) {
    if (!this.#popup || !this.#panel || !this.#overlay) return;

    const i = Math.max(0, Math.min(BRANDS.length - 1, index));
    this.#render(i);

    this.#isOpen = true;
    this.#popup.classList.add('is-open');
    this.#popup.setAttribute('aria-hidden', 'false');

    gsap.timeline()
      .to(this.#overlay, {
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
      }, 0)
      .fromTo(this.#panel, {
        opacity: 0,
        y: 24,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.975,
        ease: 'power4.out',
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
        opacity: 0,
        y: -16,
        duration: 0.525,
        ease: 'power3.in',
      }, 0)
      .to(this.#overlay, {
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in',
      }, 0);
  }
}
