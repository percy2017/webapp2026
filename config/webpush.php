<?php

return [
    /*
     * VAPID public key — base64url-encoded, exported to the browser via
     * VITE_VAPID_PUBLIC_KEY at build time. Used by the browser to encrypt
     * push payloads.
     */
    'public_key' => env('VAPID_PUBLIC_KEY', ''),

    /*
     * VAPID private key — base64url-encoded raw scalar (32 bytes).
     * Never exposed to the browser. Used by WebPushService to sign the
     * Authorization JWT on every outbound push.
     */
    'private_key' => env('VAPID_PRIVATE_KEY', ''),

    /*
     * VAPID subject — typically `mailto:admin@example.com`. Some push
     * services require this; others accept any string.
     */
    'subject' => env('VAPID_SUBJECT', 'mailto:admin@example.com'),
];
