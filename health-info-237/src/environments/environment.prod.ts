declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

export const environment = {
  production: true,
  supabase: {
    url: process.env['SUPABASE_URL'] || 'https://uhcsdgjkuprmapcnioxd.supabase.co',
    anonKey: process.env['SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoY3NkZ2prdXBybWFwY25pb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTg2NjgsImV4cCI6MjA2NDgzNDY2OH0.w4cuFuzb-9MhGZO5KAuht7gmhChKI8DkSCKJ6IMew04'
  },
  mapboxToken: process.env['MAPBOX_TOKEN'] || 'YOUR_MAPBOX_TOKEN',
  apiUrl: process.env['API_URL'] || 'https://api.health-info-237.com',
  logging: {
    level: 'error',
    enableConsole: false
  },
  monitoring: {
    enabled: true,
    endpoint: process.env['MONITORING_ENDPOINT'] || 'https://api.health-info-237.com/monitoring'
  }
};
