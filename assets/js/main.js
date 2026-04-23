import '../scss/main.scss';
import gsap from 'gsap';

import logoUrl from '../images/the-base-logo.png?url';
import headerLogoFeineWhite from '../images/the-feine-logo-white.png?url';
import headerLogoHomeWhite from '../images/the-home-logo-white.png?url';
import headerLogoFizzWhite from '../images/the-fizz-logo-white.png?url';
import { Loader } from './Loader.js';
import { initDrawerMenu } from './DrawerMenu.js';
import { Popup } from './Popup.js';

const SECTION_COUNT = 3;
const WHEEL_THRESHOLD = 55;
/** Khóa tương tác — khớp fade-out ngắn + intro chậm hơn */
const SECTION_LOCK_MS = 3200;
const GALLERY_SLIDE_INTERVAL_MS = 5200;
const HEADER_LOGO_FADE_OUT = 0.24;
const HEADER_LOGO_FADE_IN = 0.38;

const HEADER_LOGO_BY_SECTION = [
  { src: headerLogoFeineWhite, alt: 'THE.Feine', label: 'THE.Feine – Trang chủ' },
  { src: headerLogoHomeWhite, alt: 'THE.Home', label: 'THE.Home – Trang chủ' },
  { src: headerLogoFizzWhite, alt: 'THE.Fizz', label: 'THE.Fizz – Trang chủ' },
];

function initChrome() {
  const popup = new Popup();
  popup.init();

  const drawer = initDrawerMenu({
    onGoSection: (idx) => {
      window.dispatchEvent(new CustomEvent('option2:go-section', { detail: { index: idx } }));
    },
  });

  const drawerEl = document.getElementById('drawer-menu');
  const openAboutModal = () => {
    const drawerWasOpen = drawerEl?.classList.contains('is-open');
    drawer.close();
    window.setTimeout(() => popup.open(), drawerWasOpen ? 630 : 0);
  };

  document.getElementById('btn-about')?.addEventListener('click', () => {
    openAboutModal();
  });

  document.querySelectorAll('[data-open-about]').forEach((btn) => {
    btn.addEventListener('click', () => openAboutModal());
  });
}

class SectionExperience {
  #index = 0;
  #locked = false;
  #accum = 0;
  #galleryTimer = null;
  #gallerySlideBusy = false;
  #headerLogoAnimGen = 0;

  constructor() {
    this.panes = [...document.querySelectorAll('[data-section-pane]')];
    this.stacks = [...document.querySelectorAll('[data-section-gallery]')];

    window.addEventListener('option2:go-section', (e) => {
      const idx = e.detail?.index;
      if (Number.isFinite(idx)) this.goTo(idx);
    });

    this.panes.forEach((p, idx) => {
      const on = idx === 0;
      gsap.set(p, {
        autoAlpha:     on ? 1 : 0,
        y:             on ? 0 : 20,
        zIndex:        on ? 2 : 1,
        pointerEvents: on ? 'auto' : 'none',
      });
    });
    this.stacks.forEach((s, idx) => {
      gsap.set(s, { autoAlpha: idx === 0 ? 1 : 0 });
    });
    this.stacks.forEach((stack) => {
      this.#setGallerySlideStates(stack, 0);
    });

    this.#syncHeaderTheme(0, false);
    this.#bindWheel();
    this.#bindTouch();
    this.#bindElevator();
    this.#restartGalleryTimer();
  }

  /** Nền header + logo âm bản trắng; đổi section: fade out → đổi src → fade in */
  #syncHeaderTheme(index, animate = true) {
    const header = document.getElementById('header');
    if (header) header.dataset.headerTheme = String(index);

    const meta = HEADER_LOGO_BY_SECTION[index];
    if (!meta) return;

    const link = header?.querySelector('.logo');
    const img = header?.querySelector('.logo__img');
    if (!img) return;

    const applyAria = () => {
      img.alt = meta.alt;
      if (link) link.setAttribute('aria-label', meta.label);
    };

    if (!animate) {
      gsap.killTweensOf(img);
      img.src = meta.src;
      applyAria();
      gsap.set(img, { autoAlpha: 1 });
      return;
    }

    const gen = ++this.#headerLogoAnimGen;
    gsap.killTweensOf(img);

    gsap.to(img, {
      autoAlpha: 0,
      duration: HEADER_LOGO_FADE_OUT,
      ease: 'power2.in',
      onComplete: () => {
        if (gen !== this.#headerLogoAnimGen) return;

        img.src = meta.src;
        applyAria();

        const fadeIn = () => {
          if (gen !== this.#headerLogoAnimGen) return;
          gsap.to(img, {
            autoAlpha: 1,
            duration: HEADER_LOGO_FADE_IN,
            ease: 'power2.out',
          });
        };

        if (img.complete && img.naturalWidth > 0) {
          requestAnimationFrame(fadeIn);
        } else {
          img.addEventListener('load', fadeIn, { once: true });
          img.addEventListener('error', fadeIn, { once: true });
        }
      },
    });
  }

  #bindWheel() {
    window.addEventListener(
      'wheel',
      (e) => {
        if (document.getElementById('drawer-menu')?.classList.contains('is-open')) return;

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

  /** Nút thang máy: cùng luồng next/prev như lăn chuột. */
  #bindElevator() {
    const intro = document.querySelector('.site-intro');
    if (!intro) return;

    intro.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-elevator-next], [data-elevator-prev]');
      if (!btn || !intro.contains(btn)) return;
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
    if (this.#index >= SECTION_COUNT - 1) return;
    this.goTo(this.#index + 1);
  }

  prev() {
    if (this.#index <= 0) return;
    this.goTo(this.#index - 1);
  }

  /** Desktop: label + title + copy + CTA. Mobile: logo + CTA (copy ẩn CSS). */
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
    if (i === this.#index) return;

    const prev = this.#index;
    this.#index = i;
    this.#lock();
    this.#syncHeaderTheme(i, true);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const prevPane = this.panes[prev];
    const nextPane = this.panes[i];
    const prevLines = this.#introLines(prevPane);
    const nextLines = this.#introLines(nextPane);
    if (prevPane && nextPane) {
      gsap.killTweensOf([prevPane, nextPane, ...prevLines, ...nextLines]);

      // Section cũ fade nhanh; section mới chờ xong mới vào (chậm, rõ hơn)
      const fadeOut = 0.48;
      const revealAt = fadeOut;

      gsap.set(prevPane, { zIndex: 3, y: 0 });
      gsap.set(nextPane, { autoAlpha: 0, y: 0, zIndex: 2 });
      gsap.set(nextLines, { autoAlpha: 0, y: 36 });

      tl.to(
        prevPane,
        { autoAlpha: 0, y: -10, duration: fadeOut, ease: 'power2.out' },
        0,
      );

      tl.set(nextPane, { autoAlpha: 1, zIndex: 4 }, revealAt);

      tl.fromTo(
        nextLines,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y:         0,
          duration:  1.25,
          stagger:   0.42,
          ease:      'power3.out',
        },
        revealAt,
      );
    }

    const prevStack = this.stacks[prev];
    const nextStack = this.stacks[i];
    if (prevStack && nextStack) {
      gsap.killTweensOf([prevStack, nextStack]);
      const fadeOut = 0.48;
      const revealAt = fadeOut;
      tl.to(prevStack, { autoAlpha: 0, duration: fadeOut, ease: 'power2.out' }, 0);
      tl.fromTo(
        nextStack,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
        revealAt,
      );
    }

    tl.add(() => {
      this.panes.forEach((p, idx) => {
        const on = idx === i;
        gsap.set(p, {
          pointerEvents: on ? 'auto' : 'none',
          zIndex:        on ? 2 : 1,
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

  /** Chỉ tiến (index + 1) % n — infinite; stack slides, không dùng xPercent. */
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
        scale:     1,
        zIndex:    on ? 2 : 1,
      });
    });
  }

  #resetGalleryTrack(sectionIndex) {
    const stack = this.stacks[sectionIndex];
    this.#setGallerySlideStates(stack, 0);
  }

  #advanceGallerySlide() {
    if (this.#gallerySlideBusy) return;

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
      .to(outgoing, {
        autoAlpha: 0,
        scale:     0.97,
        duration:  0.72,
        ease:      'power2.inOut',
      }, 0)
      .fromTo(
        incoming,
        { autoAlpha: 0, scale: 1.06 },
        {
          autoAlpha: 1,
          scale:     1,
          duration:  0.88,
          ease:      'power3.out',
        },
        0.1,
      );
  }

  #restartGalleryTimer() {
    if (this.#galleryTimer != null) {
      window.clearInterval(this.#galleryTimer);
      this.#galleryTimer = null;
    }
    this.#galleryTimer = window.setInterval(() => {
      this.#advanceGallerySlide();
    }, GALLERY_SLIDE_INTERVAL_MS);
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
  initChrome();

  const app = document.getElementById('app');

  const loader = new Loader({
    logoUrl,
    onDone: () => {
      app?.classList.add('is-ready');
      new SectionExperience();
    },
  });

  loader.init();
});
