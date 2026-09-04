(function () {
  const deepFreeze = (value) => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  };

  const model = {
    visibleFilters: [
      'visual-identity',
      'creative-direction',
      'motion-animation',
      'product-3d',
      'packaging-design'
    ],
    taxonomies: {
      services: [
        { id: 'brand-strategy', label: 'Brand Strategy' },
        { id: 'creative-direction', label: 'Creative Direction' },
        { id: 'visual-identity', label: 'Visual Identity' },
        { id: 'graphic-editorial', label: 'Graphic & Editorial Design' },
        { id: 'motion-animation', label: 'Motion & Animation' },
        { id: 'product-3d', label: 'Product & 3D Design' },
        { id: 'packaging-design', label: 'Packaging Design' }
      ],
      industries: [
        { id: 'culture-entertainment', label: 'Culture & Entertainment' },
        { id: 'hospitality-food', label: 'Hospitality & Food' },
        { id: 'beauty-fashion', label: 'Beauty & Fashion' },
        { id: 'health-wellbeing', label: 'Health & Wellbeing' },
        { id: 'technology', label: 'Technology' }
      ]
    },
    projects: [
      {
        path: '/multitool/',
        title: 'Multitool',
        subtitle: 'One Tool, Many Moves',
        tableTitle: 'Multitool',
        year: '2025',
        primaryDiscipline: 'Product & 3D Design',
        services: ['product-3d'],
        industry: 'culture-entertainment',
        badge: 'product-3d',
        layout: 'portrait',
        status: 'published'
      },
      {
        path: '/maier-jewelry/',
        title: 'Maier',
        subtitle: 'Stones with Soul',
        tableTitle: 'Maier Jewelry',
        year: '2024',
        primaryDiscipline: 'Visual Identity',
        services: ['brand-strategy', 'creative-direction', 'visual-identity', 'packaging-design'],
        industry: 'beauty-fashion',
        badge: 'visual-identity',
        layout: 'portrait',
        status: 'published'
      },
      {
        path: '/walk-with-me/',
        title: 'Walk with me',
        subtitle: 'Rainy Days Sample Pack',
        tableTitle: 'Walk with me — record label',
        year: '2023',
        primaryDiscipline: 'Visual Identity',
        services: ['visual-identity', 'packaging-design'],
        industry: 'culture-entertainment',
        badge: 'packaging-design',
        layout: 'landscape',
        status: 'incomplete'
      },
      {
        path: '/marty-restaurants/',
        title: 'Marty',
        subtitle: 'For the Love of Food',
        tableTitle: 'Marty Restaurants',
        year: '2024',
        primaryDiscipline: 'Graphic & Editorial Design',
        services: ['creative-direction', 'graphic-editorial', 'motion-animation'],
        industry: 'hospitality-food',
        badge: 'graphic-editorial',
        layout: 'portrait',
        status: 'published'
      },
      {
        path: '/intermezzo/',
        title: 'Intermezzo',
        subtitle: 'Where Music Meets Form',
        tableTitle: 'Intermezzo Festival',
        year: '2025',
        primaryDiscipline: 'Visual Identity',
        services: ['creative-direction', 'visual-identity', 'motion-animation'],
        industry: 'culture-entertainment',
        badge: 'visual-identity',
        layout: 'landscape',
        status: 'published'
      },
      {
        path: '/lesser-of-two-evils/',
        title: 'Lesser',
        subtitle: 'Less Still, More Motion',
        tableTitle: 'Lesser of Two Evils',
        year: '2021',
        primaryDiscipline: 'Motion & Animation',
        services: ['creative-direction', 'graphic-editorial', 'motion-animation'],
        industry: 'culture-entertainment',
        badge: 'motion-animation',
        layout: 'landscape',
        status: 'published'
      },
      {
        path: '/friss-kakas/',
        title: 'Friss Kakas',
        subtitle: 'Fresh Moves',
        tableTitle: 'Friss Kakas',
        year: '2025',
        primaryDiscipline: 'Motion & Animation',
        services: ['creative-direction', 'graphic-editorial', 'motion-animation'],
        industry: 'culture-entertainment',
        badge: 'motion-animation',
        layout: 'landscape',
        status: 'published'
      },
      {
        path: '/re-mind/',
        title: 'RE:MIND',
        subtitle: 'A Ritual for the Mind',
        tableTitle: 'RE:MIND',
        year: '2026',
        primaryDiscipline: 'Product & 3D Design',
        services: ['brand-strategy', 'visual-identity', 'motion-animation', 'product-3d', 'packaging-design'],
        industry: 'health-wellbeing',
        badge: 'product-3d',
        layout: 'portrait',
        status: 'published'
      },
      {
        path: '/dream-ville-software/',
        title: 'Dream Ville',
        subtitle: 'Dreams Have No Titles',
        tableTitle: 'Dream Ville Software',
        year: '2023',
        primaryDiscipline: 'Visual Identity',
        services: ['brand-strategy', 'creative-direction', 'visual-identity'],
        industry: 'technology',
        badge: 'visual-identity',
        layout: 'landscape',
        status: 'published'
      },
      {
        path: '/olivo-bistro/',
        title: 'Olivo bistro',
        subtitle: 'In good company',
        tableTitle: 'Olivo Bistro',
        year: '2024',
        primaryDiscipline: 'Visual Identity',
        services: ['brand-strategy', 'creative-direction', 'visual-identity', 'graphic-editorial'],
        industry: 'hospitality-food',
        badge: null,
        layout: 'landscape',
        status: 'incomplete'
      },
      {
        path: '/shinrin/',
        title: 'Shinrin',
        subtitle: '',
        tableTitle: 'Shinrin',
        year: '—',
        primaryDiscipline: 'Visual Identity',
        services: ['visual-identity', 'packaging-design'],
        industry: 'beauty-fashion',
        badge: null,
        layout: 'portrait',
        status: 'preview'
      },
      {
        path: '/macn/',
        title: 'MACN',
        subtitle: 'Culture in Constant Motion',
        tableTitle: 'MACN',
        year: '—',
        primaryDiscipline: 'Visual Identity',
        services: ['brand-strategy', 'visual-identity'],
        industry: 'culture-entertainment',
        badge: null,
        layout: 'landscape',
        status: 'incomplete'
      }
    ]
  };

  window.MOND_WORK_TAXONOMY = deepFreeze(model);
})();
