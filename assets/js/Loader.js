import gsap from 'gsap';

/**
 * Option 2 loader: Welcome viết nét → logo từ dưới → slogan từng chữ → line.
 * Intro xong → chờ → slide ẩn.
 */
const LOADER_DEBUG_STAY_VISIBLE = false;
const LOADER_POST_INTRO_DELAY_S = 1.5;

const LOADER_TAGLINE =
  'COME FOR A SIP — STAY FOR THE VIBE';

export class Loader {
  #el;
  #welcomeStroke;
  #welcomeFill;
  #logo;
  #logoImg;
  #tagline;
  #tagChars;
  #line;
  #onDone;
  #logoUrl;

  constructor({ onDone, logoUrl } = {}) {
    this.#el            = document.getElementById('loader');
    this.#welcomeStroke = this.#el?.querySelector('.loader__welcome-stroke') ?? null;
    this.#welcomeFill   = this.#el?.querySelector('.loader__welcome-fill') ?? null;
    this.#logo          = this.#el?.querySelector('.loader__logo') ?? null;
    this.#logoImg       = this.#el?.querySelector('.loader__logo-img') ?? null;
    this.#tagline       = this.#el?.querySelector('.loader__tagline') ?? null;
    this.#tagChars      = [];
    this.#line          = this.#el?.querySelector('.loader__line') ?? null;
    this.#onDone        = onDone;
    this.#logoUrl       = logoUrl ?? '';
  }

  init() {
    if (!this.#el) {
      this.#onDone?.();
      return;
    }

    if (this.#logoUrl) {
      this.#logoImg?.setAttribute('src', this.#logoUrl);
    }

    this.#splitTagline();

    const start = () => this.#runTimeline();

    if (document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      requestAnimationFrame(start);
    }
  }

  #splitTagline() {
    const el = this.#tagline;
    if (!el) return;

    el.textContent = '';
    const frag = document.createDocumentFragment();

    for (const ch of LOADER_TAGLINE) {
      const span = document.createElement('span');
      span.className = 'loader__tagchar';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      span.setAttribute('aria-hidden', 'true');
      frag.appendChild(span);
      this.#tagChars.push(span);
    }

    el.appendChild(frag);
  }

  #runTimeline() {
    const stroke = this.#welcomeStroke;
    const fill   = this.#welcomeFill;

    let pathLen = 420;
    if (stroke && typeof stroke.getComputedTextLength === 'function') {
      const len = stroke.getComputedTextLength();
      if (len > 1) pathLen = len;
    }

    if (stroke) {
      gsap.set(stroke, {
        strokeDasharray:  pathLen,
        strokeDashoffset: pathLen,
        opacity:          0.92,
      });
    }

    if (this.#logo) {
      gsap.set(this.#logo, {
        opacity: 0,
        y:       52,
        scale:   0.96,
      });
    }

    if (this.#tagChars.length) {
      gsap.set(this.#tagChars, {
        opacity:  0,
        y:        18,
        x:        (i) => Math.round(Math.sin(i * 1.73) * 10),
        rotation: (i) => Math.round(Math.cos(i * 2.11) * 5),
      });
    }

    if (this.#line) {
      gsap.set(this.#line, { scaleX: 0, transformOrigin: 'center center' });
    }

    if (fill) gsap.set(fill, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        if (LOADER_DEBUG_STAY_VISIBLE) {
          this.#onDone?.();
          return;
        }
        gsap.delayedCall(LOADER_POST_INTRO_DELAY_S, () => this.#hide());
      },
    });

    // Welcome: viết nét (stroke reveal)
    if (stroke) {
      tl.to(
        stroke,
        {
          strokeDashoffset: 0,
          opacity:          1,
          duration:         1.92,
          ease:             'power2.inOut',
        },
        0,
      );
      if (fill) {
        tl.to(
          fill,
          { opacity: 1, duration: 0.48, ease: 'power3.out' },
          '-=0.39',
        );
        tl.to(stroke, { opacity: 0, duration: 0.33, ease: 'power2.out' }, '<0.08');
      }
    }

    // Logo THE.Base: fade + từ dưới lên, mượt
    if (this.#logo) {
      tl.fromTo(
        this.#logo,
        {
          opacity: 0,
          y:       56,
          scale:   0.94,
        },
        {
          opacity:  1,
          y:        0,
          scale:    1,
          duration: 1.575,
          ease:     'power4.out',
        },
        stroke ? '+=0.12' : 0,
      );
    }

    // Slogan: từng ký tự “sắp” vào đúng vị trí
    if (this.#tagChars.length) {
      tl.to(
        this.#tagChars,
        {
          opacity:   1,
          y:         0,
          x:         0,
          rotation:  0,
          duration:  0.78,
          stagger:   {
            each:       0.042,
            from:       'center',
            ease:       'power2.out',
          },
          ease:      'power3.out',
        },
        '-=0.93',
      );
    }

    if (this.#line) {
      tl.to(
        this.#line,
        {
          scaleX:          1,
          transformOrigin: 'center center',
          duration:        1.08,
          ease:            'power4.out',
        },
        '-=0.525',
      );
    }

    tl.to({}, { duration: 0.72 });
  }

  #hide() {
    gsap.to(this.#el, {
      yPercent:   -100,
      duration:   1.725,
      ease:       'power3.inOut',
      onComplete: () => {
        this.#el.style.display = 'none';
        this.#onDone?.();
      },
    });
  }
}
