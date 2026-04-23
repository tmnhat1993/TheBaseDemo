import gsap from 'gsap';

const MOBILE_DRAWER_MQ = '(max-width: 768px)';

/**
 * Drawer: desktop trượt từ phải; mobile — panel căn giữa, trượt từ trên xuống.
 */
export function initDrawerMenu({ onGoSection } = {}) {
  const drawer    = document.getElementById('drawer-menu');
  const toggle    = document.querySelector('[data-menu-toggle]');
  const panel     = drawer?.querySelector('.drawer__panel') ?? null;
  const overlay   = document.getElementById('drawer-overlay');
  const closeBtn  = document.getElementById('drawer-close');
  const items     = drawer ? [...drawer.querySelectorAll('.drawer__item')] : [];
  const social    = drawer?.querySelector('.drawer__social') ?? null;

  if (!drawer || !panel || !overlay || !toggle) {
    return { close: () => {} };
  }

  let isOpen = false;
  let tl     = null;

  const isMobileDrawer = () => window.matchMedia(MOBILE_DRAWER_MQ).matches;

  const setPanelClosed = () => {
    gsap.killTweensOf(panel);
    if (isMobileDrawer()) {
      gsap.set(panel, {
        left:     '50%',
        right:    'auto',
        top:      0,
        xPercent: -50,
        x:        0,
        y:        '-100%',
        yPercent: 0,
      });
    } else {
      gsap.set(panel, {
        left:     'auto',
        right:    0,
        top:      0,
        xPercent: 0,
        x:        '100%',
        y:        0,
        yPercent: 0,
      });
    }
  };

  const setInitialState = () => {
    setPanelClosed();
    gsap.set(overlay, { opacity: 0 });
    gsap.set(items, { x: 28, opacity: 0 });
    if (social) gsap.set(social, { opacity: 0, y: 10 });
  };

  setInitialState();

  const mq = window.matchMedia(MOBILE_DRAWER_MQ);
  mq.addEventListener('change', () => {
    if (!isOpen) setInitialState();
  });

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    drawer.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');

    if (tl) tl.kill();

    const mobile = isMobileDrawer();

    tl = gsap.timeline({
      onComplete: () => {
        drawer.classList.remove('is-open');
        gsap.set(items, { x: 28, opacity: 0 });
        if (social) gsap.set(social, { opacity: 0, y: 10 });
        setPanelClosed();
      },
    });

    if (mobile) {
      tl.to(panel, {
        y:        '-100%',
        duration: 1.05,
        ease:     'power3.inOut',
      }, 0);
    } else {
      tl.to(panel, {
        x:        '100%',
        duration: 1.125,
        ease:     'power3.inOut',
      }, 0);
    }

    tl.to(overlay, {
      opacity:  0,
      duration: 0.6,
      ease:     'power3.in',
    }, 0);
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');

    if (tl) tl.kill();

    const mobile = isMobileDrawer();

    if (mobile) {
      gsap.set(panel, {
        left:     '50%',
        right:    'auto',
        top:      0,
        xPercent: -50,
        x:        0,
        y:        '-100%',
      });
    } else {
      gsap.set(panel, {
        left:     'auto',
        right:    0,
        top:      0,
        xPercent: 0,
        x:        '100%',
        y:        0,
      });
    }

    tl = gsap.timeline()
      .to(overlay, {
        opacity:  1,
        duration: 0.675,
        ease:     'power3.out',
      }, 0);

    if (mobile) {
      tl.to(panel, {
        y:        0,
        duration: 1.2,
        ease:     'power4.out',
      }, 0);
    } else {
      tl.to(panel, {
        x:        '0%',
        duration: 1.275,
        ease:     'power4.out',
      }, 0);
    }

    tl.to(items, {
      x:        0,
      opacity:  1,
      duration: 0.825,
      ease:     'power4.out',
      stagger:  0.098,
    }, '-=0.675');

    if (social) {
      tl.to(social, {
        opacity:  1,
        y:        0,
        duration: 0.6,
        ease:     'power3.out',
      }, '-=0.225');
    }
  };

  const toggleMenu = () => {
    isOpen ? close() : open();
  };

  toggle.addEventListener('click', toggleMenu);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', close);

  drawer.querySelectorAll('.drawer__link[data-go]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const raw = link.getAttribute('data-go');
      const idx = Number(raw);
      close();
      if (Number.isFinite(idx)) {
        window.setTimeout(() => onGoSection?.(idx), 720);
      }
    });
  });

  drawer.querySelectorAll('.drawer__social-link').forEach((a) => {
    a.addEventListener('click', () => {
      window.setTimeout(() => close(), 80);
    });
  });

  drawer.querySelectorAll('.drawer__contact a').forEach((a) => {
    a.addEventListener('click', () => {
      window.setTimeout(() => close(), 80);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  return { close, open, isOpen: () => isOpen };
}
