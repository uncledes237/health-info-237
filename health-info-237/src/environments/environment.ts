// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabase: {
    url: 'https://uhcsdgjkuprmapcnioxd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoY3NkZ2prdXBybWFwY25pb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTg2NjgsImV4cCI6MjA2NDgzNDY2OH0.w4cuFuzb-9MhGZO5KAuht7gmhChKI8DkSCKJ6IMew04'
  },
  mapboxToken: 'YOUR_MAPBOX_TOKEN',
  apiUrl: 'http://localhost:3000',
  logging: {
    level: 'debug',
    enableConsole: true
  },
  monitoring: {
    enabled: true,
    endpoint: 'http://localhost:3000/monitoring'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
