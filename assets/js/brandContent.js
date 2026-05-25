import logoFeine from '../images/the-feine-logo.png?url';
import logoHome from '../images/the-home-logo.png?url';
import logoFizz from '../images/the-fizz-logo.png?url';

export const HUB_INTRO =
  'THE.Base — Một mô hình kết hợp giữa café, homestay và pub, được tạo nên như một hệ sinh thái trải nghiệm nơi con người có thể gặp gỡ, nghỉ ngơi, kết nối và tận hưởng những khoảnh khắc đời thường theo cách nhẹ nhàng, tinh tế và đầy cảm hứng.';

export const SHARED_ADDRESS =
  'Số 101, đường Phùng Hưng, Phường Pleiku, Tỉnh Gia Lai, Việt Nam.';
export const SHARED_PHONE = '083 719 6368';
export const SHARED_PHONE_TEL = '+84837196368';

/** @type {readonly { intro: string[], detail: string[], logo: string, logoAlt: string, hours: { label: string, value: string }[] }[]} */
export const BRANDS = [
  {
    logo: logoFeine,
    logoAlt: 'THE.Feine',
    intro: [
      'THE.Feine là một không gian cà phê và bánh thủ công mang tinh thần tối giản — nơi những tách cà phê chỉn chu, matcha thanh vị, nước ép tươi mát và hương bánh mới ra lò tạo nên trải nghiệm nhẹ nhàng, tinh tế và đầy cảm hứng cho mỗi cuộc gặp gỡ.',
      'Không chỉ là một quán cà phê, THE.Feine sẽ là điểm chạm mở đầu cho hành trình THE.Base — nơi mọi không gian được kết nối để tạo nên một nhịp sống trọn vẹn, gần gũi và đầy cảm xúc.',
    ],
    detail: [
      'THE.Feine theo đuổi trải nghiệm café tối giản — nơi menu không quá nhiều lựa chọn, nhưng mỗi món đều được chăm chút để giữ trọn hương vị và cảm xúc riêng.',
      'Từ một tách cà phê đậm vị, ly matcha thanh nhẹ đến nước ép tươi mát và bánh mới ra lò, mọi thứ tại đây được tạo nên để phù hợp với những buổi trò chuyện, làm việc hoặc những khoảng thời gian muốn chậm lại giữa ngày.',
      'Không gian mở, ánh sáng ấm và thiết kế tối giản giúp THE.Feine trở thành một điểm dừng nhẹ nhàng giữa nhịp sống Pleiku.',
    ],
    hours: [{ label: 'Giờ mở cửa', value: '07:00 — 21:00 hằng ngày' }],
  },
  {
    logo: logoHome,
    logoAlt: 'THE.Home',
    intro: [
      'THE.Home — Không chỉ là nơi lưu trú, THE.Home được tạo nên như một “ngôi nhà” đúng nghĩa — ấm áp, thư thái và gần gũi, dành cho những ai tìm kiếm cảm giác chữa lành giữa nhịp sống hiện đại.',
      'Là mảnh ghép mang tinh thần nghỉ ngơi và kết nối trong hành trình THE.Base, THE.Home hướng đến những trải nghiệm khiến con người cảm thấy được thư giãn, thuộc về và tận hưởng trọn vẹn từng khoảnh khắc nghỉ ngơi của riêng mình.',
    ],
    detail: [
      'THE.Home theo đuổi trải nghiệm lưu trú tối giản — nơi không gian được giữ vừa đủ để mỗi người có thể tận hưởng sự yên tĩnh, riêng tư và nhịp nghỉ ngơi thật tự nhiên.',
      'Từ ánh sáng dịu, chất liệu ấm đến cách bài trí tối giản, mọi chi tiết tại THE.Home đều hướng đến cảm giác nhẹ nhàng và thoải mái, phù hợp cho những chuyến đi muốn tìm lại sự cân bằng giữa nhịp sống thường ngày.',
      'Không gian mở, tinh thần chậm rãi và cảm giác gần gũi giúp THE.Home trở thành một điểm dừng thư thái giữa Pleiku — nơi người ta có thể nghỉ ngơi, kết nối và tận hưởng khoảng thời gian của riêng mình.',
    ],
    hours: [
      { label: 'Check out', value: '12:00' },
      { label: 'Check in', value: '14:00' },
    ],
    maps: {
      label: 'Địa chỉ Google Maps Homestay',
      url: 'https://maps.app.goo.gl/2yZuydTJmawXuyg8A',
    },
  },
  {
    logo: logoFizz,
    logoAlt: 'THE.Fizz',
    intro: [
      'THE.Fizz — Một không gian pub & cocktail mang tinh thần trẻ trung, nơi âm nhạc, ánh sáng và cảm xúc hòa vào nhau để tạo nên những cuộc gặp gỡ đầy năng lượng và cảm hứng.',
      'Là mảnh ghép mang màu sắc nightlife trong hành trình THE.Base, THE.Fizz được tạo nên để kết nối con người qua những buổi tối thư giãn, những cuộc trò chuyện kéo dài và những khoảnh khắc tận hưởng theo cách tự do nhất.',
    ],
    detail: [
      'THE.Fizz theo đuổi trải nghiệm pub hiện đại — nơi những ly bia tươi, âm nhạc và không gian được kết hợp để tạo nên một nhịp cảm xúc trẻ trung nhưng vẫn đủ tinh tế để thư giãn và kết nối.',
      'Từ những ly cocktail sáng tạo, menu đồ uống mang cá tính riêng đến ánh sáng, âm nhạc và không khí về đêm, mọi thứ tại THE.Fizz đều hướng đến cảm giác tự do, thoải mái và đầy năng lượng cho những buổi gặp gỡ cùng bạn bè hoặc những cuộc trò chuyện kéo dài sau một ngày bận rộn.',
      'Không gian mang tinh thần hiện đại, gần gũi và có chiều sâu giúp THE.Fizz trở thành điểm hẹn nightlife đặc trưng trong hệ sinh thái THE.Base — nơi mỗi trải nghiệm đều được kết nối bằng cảm xúc và sự tận hưởng trọn vẹn.',
    ],
    hours: [{ label: 'Giờ mở cửa', value: '20:00 — 23:00 hàng ngày' }],
    maps: {
      label: 'Địa chỉ Google Maps The Fizz',
      url: 'https://maps.app.goo.gl/sCfk4k7nAGgFVHrq8',
    },
  },
];
