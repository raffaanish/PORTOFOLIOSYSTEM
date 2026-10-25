// Data awal. Dipakai selama admin belum pernah menyimpan apa pun.
export const SEED = {
  settings: {
    name: 'Rasya Ghatfan',
    role: '3D Artist',
    bio: [
      'Yo, I’m Rasya Ghatfan, but most people know me as ERGE. Based in Jakarta, Indonesia 🇮🇩',
      'I started my journey as a 3D artist back in 2024, coming from a background in designing party flyers. Since then, I’ve been learning, experimenting, and pushing my skills to a whole new level.',
      'Now, I’m exploring different sides of the creative world, from 3D art, graphic design, video editing, logo design, and many more. I’m always down to learn new things, try different styles, and turn random ideas into something dope.',
      'Still growing, still creating, and always looking for the next level.'
    ],
    email: 'raffaanish@gmail.com',
    instagram: 'rasyaaghatfan',
    whatsapp: '',
    currency: 'IDR',
    shopIntro: 'Assets, presets, and prints made by ERGE. Pick something and order directly.',
    workCategories: ['3D Flyer', 'Stage Visual', 'Animation', 'Graphic Design', 'Social Media', 'Video Edit']
  },
  works: [
    { id: 'seed-work-1', title: 'All Around 2.0', category: '3D Flyer', type: 'video', src: '/img/work-vid-1.mp4', poster: '/img/work-vid-1-poster.jpg', width: 1080, height: 1920, software: '', metaLabel: 'Format', metaValue: '1080x1920, 19 sec, 30 fps' },
    { id: 'seed-work-2', title: 'Untitled 02', category: '3D Flyer', type: 'image', src: '/img/work-2.jpg', poster: '', width: 1080, height: 1920, software: '', metaLabel: 'Format', metaValue: '1080x1920' },
    { id: 'seed-work-3', title: 'Untitled 03', category: '3D Flyer', type: 'image', src: '/img/work-3.jpg', poster: '', width: 1080, height: 1920, software: '', metaLabel: 'Format', metaValue: '1080x1920' },
    { id: 'seed-work-4', title: 'Untitled 04', category: '3D Flyer', type: 'image', src: '/img/work-4.jpg', poster: '', width: 1920, height: 1080, software: '', metaLabel: 'Format', metaValue: '1920x1080' }
  ],
  products: []
};
