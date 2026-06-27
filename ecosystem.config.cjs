module.exports = {
    apps: [
        {
            name: 'webapp-reverb',
            script: 'php',
            args: 'artisan reverb:start --host=0.0.0.0 --port=3001',
            cwd: '/home/hostbol/web/app.hostbol.lat/public_html',
            interpreter: 'none',
            exec_mode: 'fork',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            env: {
                APP_ENV: 'production',
            },
            error_file: '/home/hostbol/.pm2/logs/app-hostbol-reverb-error.log',
            out_file: '/home/hostbol/.pm2/logs/app-hostbol-reverb-out.log',
            merge_logs: true,
            time: true,
        },
    ],
};