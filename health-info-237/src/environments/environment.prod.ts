export const environment = {
  production: true,
  supabase: {
    url: 'https://uhcsdgjkuprmapcnioxd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoY3NkZ2prdXBybWFwY25pb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTg2NjgsImV4cCI6MjA2NDgzNDY2OH0.w4cuFuzb-9MhGZO5KAuht7gmhChKI8DkSCKJ6IMew04'
  },
  mapboxToken: 'YOUR_MAPBOX_TOKEN',
  apiUrl: 'https://api.health-info-237.com',
  logging: {
    level: 'error',
    enableConsole: false
  },
  monitoring: {
    enabled: true,
    endpoint: 'https://api.health-info-237.com/monitoring'
  }
};
