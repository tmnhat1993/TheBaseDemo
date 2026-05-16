import '../scss/main.scss';
import gsap from 'gsap';

import logoUrl from '../images/the-base-logo.png?url';
import { Loader } from './Loader.js';
import { initDrawerMenu } from './DrawerMenu.js';
import { Popup } from './Popup.js';
import { BrandPopup } from './BrandPopup.js';
import { BRANDS } from './brandContent.js';

const SECTION_COUNT = 3;
const WHEEL_THRESHOLD = 55;
const SECTION_LOCK_MS = 3200;
const GALLERY_SLIDE_INTERVAL_MS = 5200;
function applyBrandIntroCopy() {
  document.querySelectorAll('[data-section-pane]').forEach((pane, idx) => {
    const wrap = pane.querySelector('.site-intro__text-wrap');
    const paragraphs = BRANDS[idx]?.intro;
    if (!wrap || !paragraphs?.length) return;

    wrap.replaceChildren(
      ...paragraphs.map((text) => {
        const p = document.createElement('p');
        p.className = 'site-intro__text';
        p.textContent = text;
        return p;
      }),
    );
  });
}

function initChrome({ goHome, enterSection }) {
  const aboutPopup = new Popup();
  aboutPopup.init();

  const brandPopup = new BrandPopup({ onGoHome: goHome });
  brandPopup.init();

  const drawer = initDrawerMenu({
    onGoSection: (idx) => {
      enterSection?.(idx);
    },
  });

  const drawerEl = document.getElementById('drawer-menu');
  const openAboutModal = () => {
    const drawerWasOpen = drawerEl?.classList.contains('is-open');
    drawer.close();
    window.setTimeout(() => aboutPopup.open(), drawerWasOpen ? 630 : 0);
  };

  const openBrandModal = (index) => {
    const drawerWasOpen = drawerEl?.classList.contains('is-open');
    drawer.close();
    window.setTimeout(() => brandPopup.open(index), drawerWasOpen ? 630 : 0);
  };

  document.getElementById('btn-about')?.addEventListener('click', () => {
    openAboutModal();
  });

  document.querySelectorAll('[data-open-brand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-brand') ?? 0);
      openBrandModal(index);
    });
  });

  document.querySelectorAll('[data-go-home]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goHome?.();
    });
  });

  applyBrandIntroCopy();
}

class SectionExperience {
  #index = 0;
  #onHub = true;
  #locked = false;
  #accum = 0;
  #galleryTimer = null;
  #gallerySlideBusy = false;

  #hub;
  #main;
  #experience;

  constructor() {
    this.panes = [...document.querySelectorAll('[data-section-pane]')];
    this.stacks = [...document.querySelectorAll('[data-section-gallery]')];
    this.#hub = document.getElementById('site-hub');
    this.#main = document.getElementById('site-main');
    this.#experience = document.getElementById('site-experience');

    window.addEventListener('option2:go-section', (e) => {
      const idx = e.detail?.index;
      if (Number.isFinite(idx)) this.enterSection(idx);
    });

    this.panes.forEach((p) => {
      gsap.set(p, {
        autoAlpha: 0,
        y: 0,
        zIndex: 1,
        pointerEvents: 'none',
      });
      gsap.set(this.#introLines(p), { autoAlpha: 0, y: 36 });
    });

    this.stacks.forEach((s) => {
      gsap.set(s, { autoAlpha: 0, pointerEvents: 'none' });
    });
    this.stacks.forEach((stack) => {
      this.#setGallerySlideStates(stack, 0);
    });

    gsap.set(this.#hub, { autoAlpha: 1 });
    this.#initHeaderLogo();
    this.#bindHub();
    this.#bindWheel();
    this.#bindTouch();
    this.#bindElevator();
  }

  get onHub() {
    return this.#onHub;
  }

  showHub(animate = true) {
    if (this.#onHub) return;

    this.#onHub = true;
    this.#stopGalleryTimer();

    this.#main?.classList.remove('is-experience');
    this.#main?.classList.add('is-hub');

    if (this.#experience) {
      this.#experience.hidden = true;
      this.#experience.setAttribute('aria-hidden', 'true');
    }

    this.panes.forEach((p) => {
      gsap.set(p, { autoAlpha: 0, pointerEvents: 'none', zIndex: 1 });
      gsap.set(this.#introLines(p), { autoAlpha: 0, y: 36 });
    });
    this.stacks.forEach((s) => {
      gsap.set(s, { autoAlpha: 0, pointerEvents: 'none' });
    });

    gsap.killTweensOf(this.#hub);
    gsap.set(this.#hub, { visibility: 'visible', pointerEvents: 'auto' });

    if (animate) {
      gsap.fromTo(this.#hub, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power3.out' });
    } else {
      gsap.set(this.#hub, { autoAlpha: 1 });
    }

  }

  enterSection(nextIndex, animate = true) {
    const i = Math.max(0, Math.min(SECTION_COUNT - 1, nextIndex));

    if (!this.#onHub) {
      this.goTo(i);
      return;
    }

    this.#onHub = false;
    this.#index = i;
    this.#lock();

    this.#main?.classList.remove('is-hub');
    this.#main?.classList.add('is-experience');

    if (this.#experience) {
      this.#experience.hidden = false;
      this.#experience.setAttribute('aria-hidden', 'false');
    }

    const pane = this.panes[i];
    const stack = this.stacks[i];
    const lines = this.#introLines(pane);

    this.panes.forEach((p, idx) => {
      const on = idx === i;
      gsap.set(p, {
        autoAlpha: on ? 1 : 0,
        y: 0,
        zIndex: on ? 2 : 1,
        pointerEvents: on ? 'auto' : 'none',
      });
      if (on) gsap.set(this.#introLines(p), { autoAlpha: 1, y: 0 });
      else gsap.set(this.#introLines(p), { autoAlpha: 0, y: 36 });
    });

    this.stacks.forEach((s, idx) => {
      const on = idx === i;
      gsap.set(s, { autoAlpha: on ? 1 : 0, pointerEvents: on ? 'auto' : 'none' });
    });
    this.#resetGalleryTrack(i);

    const tl = gsap.timeline({
      onComplete: () => this.#restartGalleryTimer(),
    });

    if (animate) {
      tl.to(this.#hub, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(this.#hub, { visibility: 'hidden', pointerEvents: 'none' });
        },
      }, 0);

      if (this.#experience) {
        gsap.set(this.#experience, { autoAlpha: 0 });
        tl.to(this.#experience, { autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.12);
      }

      if (lines.length) {
        gsap.set(lines, { autoAlpha: 0, y: 28 });
        tl.fromTo(
          lines,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.35, ease: 'power3.out' },
          0.35,
        );
      }

      if (stack) {
        gsap.set(stack, { autoAlpha: 0 });
        tl.to(stack, { autoAlpha: 1, duration: 1, ease: 'power3.out' }, 0.28);
      }
    } else {
      gsap.set(this.#hub, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' });
      if (this.#experience) gsap.set(this.#experience, { autoAlpha: 1 });
      this.#restartGalleryTimer();
    }
  }

  #bindHub() {
    document.querySelectorAll('[data-enter-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (document.getElementById('drawer-menu')?.classList.contains('is-open')) return;
        const idx = Number(btn.getAttribute('data-enter-section'));
        if (Number.isFinite(idx)) this.enterSection(idx);
      });
    });
  }

  #initHeaderLogo() {
    const img = document.querySelector('.logo__img');
    const link = document.querySelector('.logo');
    if (img) {
      img.src = logoUrl;
      img.alt = 'THE.Base';
    }
    link?.setAttribute('aria-label', 'THE.Base – Trang chủ');
  }

  #bindWheel() {
    window.addEventListener(
      'wheel',
      (e) => {
        if (this.#onHub) return;
        if (document.getElementById('drawer-menu')?.classList.contains('is-open')) return;
        if (document.querySelector('.popup.is-open')) return;

        e.preventDefault();
        if (this.#locked) return;

        this.#accum += e.deltaY;
        if (this.#accum > WHEEL_THRESHOLD) {
          this.#accum = 0;
          this.next();
        } else if (this.#accum < -WHEEL_THRESHOLD) {
          this.#accum = 0;
          this.prev();
        }
      },
      { passive: false },
    );
  }

  #bindTouch() {
    let y0 = 0;
    window.addEventListener('touchstart', (e) => {
      y0 = e.touches[0]?.clientY ?? 0;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.#onHub) return;
      if (document.getElementById('drawer-menu')?.classList.contains('is-open')) return;
      if (this.#locked) return;
      const y1 = e.changedTouches[0]?.clientY ?? y0;
      const dy = y0 - y1;
      if (dy > 60) this.next();
      else if (dy < -60) this.prev();
    }, { passive: true });
  }

  #syncElevatorLocked() {
    document.querySelectorAll('.elevator-btn').forEach((el) => {
      const on = this.#locked;
      el.classList.toggle('is-locked', on);
      if (on) el.setAttribute('aria-disabled', 'true');
      else el.removeAttribute('aria-disabled');
    });
  }

  #bindElevator() {
    const intro = document.querySelector('.site-intro');
    if (!intro) return;

    intro.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-elevator-next], [data-elevator-prev]');
      if (!btn || !intro.contains(btn)) return;
      if (this.#onHub) return;
      if (document.getElementById('drawer-menu')?.classList.contains('is-open')) return;
      if (this.#locked) return;

      const plate = btn.querySelector('.elevator-btn__plate');
      if (plate) {
        gsap.killTweensOf(plate);
        gsap.fromTo(
          plate,
          { scale: 1 },
          { scale: 0.9, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.out' },
        );
      }

      if (btn.hasAttribute('data-elevator-next')) this.next();
      else this.prev();
    });
  }

  next() {
    if (this.#onHub || this.#index >= SECTION_COUNT - 1) return;
    this.goTo(this.#index + 1);
  }

  prev() {
    if (this.#onHub || this.#index <= 0) return;
    this.goTo(this.#index - 1);
  }

  #introLines(pane) {
    if (!pane) return [];
    const compact =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches;
    const sel = compact
      ? '.site-intro__title, .site-intro__cta'
      : '.site-intro__label, .site-intro__title, .site-intro__text-wrap, .site-intro__cta';
    return [...pane.querySelectorAll(sel)];
  }

  goTo(nextIndex) {
    const i = Math.max(0, Math.min(SECTION_COUNT - 1, nextIndex));
    if (this.#onHub || i === this.#index) return;

    const prev = this.#index;
    this.#index = i;
    this.#lock();
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const prevPane = this.panes[prev];
    const nextPane = this.panes[i];
    const prevLines = this.#introLines(prevPane);
    const nextLines = this.#introLines(nextPane);
    if (prevPane && nextPane) {
      gsap.killTweensOf([prevPane, nextPane, ...prevLines, ...nextLines]);

      const fadeOut = 0.48;
      const revealAt = fadeOut;

      gsap.set(prevPane, { zIndex: 3, y: 0 });
      gsap.set(nextPane, { autoAlpha: 0, y: 0, zIndex: 2 });
      gsap.set(nextLines, { autoAlpha: 0, y: 36 });

      tl.to(prevPane, { autoAlpha: 0, y: -10, duration: fadeOut, ease: 'power2.out' }, 0);
      tl.set(nextPane, { autoAlpha: 1, zIndex: 4 }, revealAt);
      tl.fromTo(
        nextLines,
        { autoAlpha: 0, y: 36 },
        { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.42, ease: 'power3.out' },
        revealAt,
      );
    }

    const prevStack = this.stacks[prev];
    const nextStack = this.stacks[i];
    if (prevStack && nextStack) {
      gsap.killTweensOf([prevStack, nextStack]);
      const fadeOut = 0.48;
      const revealAt = fadeOut;
      tl.to(prevStack, { autoAlpha: 0, pointerEvents: 'none', duration: fadeOut, ease: 'power2.out' }, 0);
      tl.fromTo(
        nextStack,
        { autoAlpha: 0, pointerEvents: 'none' },
        { autoAlpha: 1, pointerEvents: 'auto', duration: 1.2, ease: 'power3.out' },
        revealAt,
      );
    }

    tl.add(() => {
      this.panes.forEach((p, idx) => {
        const on = idx === i;
        gsap.set(p, {
          pointerEvents: on ? 'auto' : 'none',
          zIndex: on ? 2 : 1,
        });
        if (!on) {
          gsap.set(p, { autoAlpha: 0, y: 0 });
          gsap.set(this.#introLines(p), { autoAlpha: 0, y: 36 });
        }
      });
      this.#resetGalleryTrack(i);
      this.#restartGalleryTimer();
    });
  }

  #setGallerySlideStates(stack, activeIndex) {
    const track = stack?.querySelector('[data-gallery-track]');
    if (!track) return;
    const slides = [...track.querySelectorAll('.site-gallery__slide')];
    if (!slides.length) return;

    track.dataset.slideIndex = String(activeIndex);
    gsap.killTweensOf(slides);
    gsap.set(track, { clearProps: 'transform' });

    slides.forEach((el, j) => {
      const on = j === activeIndex;
      gsap.set(el, {
        autoAlpha: on ? 1 : 0,
        scale: 1,
        zIndex: on ? 2 : 1,
      });
    });
  }

  #resetGalleryTrack(sectionIndex) {
    const stack = this.stacks[sectionIndex];
    this.#setGallerySlideStates(stack, 0);
  }

  #advanceGallerySlide() {
    if (this.#gallerySlideBusy || this.#onHub) return;

    const stack = this.stacks[this.#index];
    const track = stack?.querySelector('[data-gallery-track]');
    if (!track) return;

    const slides = [...track.querySelectorAll('.site-gallery__slide')];
    const count = slides.length;
    if (count < 2) return;

    const current = Number(track.dataset.slideIndex || 0);
    const next = (current + 1) % count;

    const outgoing = slides[current];
    const incoming = slides[next];
    if (!outgoing || !incoming) return;

    this.#gallerySlideBusy = true;
    track.dataset.slideIndex = String(next);

    gsap.set(incoming, { zIndex: 4 });
    gsap.set(outgoing, { zIndex: 3 });

    gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        this.#gallerySlideBusy = false;
        gsap.set(outgoing, { autoAlpha: 0, scale: 1, zIndex: 1 });
        gsap.set(incoming, { zIndex: 2 });
        slides.forEach((el, j) => {
          if (j !== next) gsap.set(el, { autoAlpha: 0, scale: 1, zIndex: 1 });
        });
      },
    })
      .to(outgoing, { autoAlpha: 0, scale: 0.97, duration: 0.72, ease: 'power2.inOut' }, 0)
      .fromTo(
        incoming,
        { autoAlpha: 0, scale: 1.06 },
        { autoAlpha: 1, scale: 1, duration: 0.88, ease: 'power3.out' },
        0.1,
      );
  }

  #restartGalleryTimer() {
    this.#stopGalleryTimer();
    this.#galleryTimer = window.setInterval(() => {
      this.#advanceGallerySlide();
    }, GALLERY_SLIDE_INTERVAL_MS);
  }

  #stopGalleryTimer() {
    if (this.#galleryTimer != null) {
      window.clearInterval(this.#galleryTimer);
      this.#galleryTimer = null;
    }
  }

  #lock() {
    this.#locked = true;
    this.#syncElevatorLocked();
    window.setTimeout(() => {
      this.#locked = false;
      this.#accum = 0;
      this.#syncElevatorLocked();
    }, SECTION_LOCK_MS);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  let sectionExperience = null;

  const goHome = () => {
    sectionExperience?.showHub(true);
  };

  const enterSection = (idx) => {
    sectionExperience?.enterSection(idx);
  };

  initChrome({ goHome, enterSection });

  const loader = new Loader({
    logoUrl,
    onDone: () => {
      app?.classList.add('is-ready');
      sectionExperience = new SectionExperience();
    },
  });

  loader.init();
});
