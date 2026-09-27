import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bekkurinn',
    short_name: 'Bekkurinn',
    description: 'Samskiptakerfi fyrir skóla og bekkjarfélög',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF9F6', // The surface color
    theme_color: '#284B31', // The primary Nordic dark green
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
