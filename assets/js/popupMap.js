export const POPUP_MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.664348965995!2d108.0091865!3d13.978573700000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316c1f0001605749%3A0x81901e412ced13cc!2sTHE.Feine!5e0!3m2!1sen!2s!4v1778938021910!5m2!1sen!2s';

/** Google Maps embed — full width, 360px (styled via .popup__map). */
export function createPopupMapEmbed() {
  const wrap = document.createElement('div');
  wrap.className = 'popup__map-wrap';

  const iframe = document.createElement('iframe');
  iframe.className = 'popup__map';
  iframe.title = 'THE.Base trên Google Maps';
  iframe.src = POPUP_MAP_EMBED_SRC;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.setAttribute('allowfullscreen', '');

  wrap.append(iframe);
  return wrap;
}
