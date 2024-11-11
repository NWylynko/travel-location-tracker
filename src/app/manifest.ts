import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Travel Location Tracker',
    start_url: '/',
    display: "standalone",
    icons: [
      {
        src: '/logo.png',
        sizes: '144x144',
        type: 'image/png',
      }
    ]
  }
}