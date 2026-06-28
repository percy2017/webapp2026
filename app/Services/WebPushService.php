<?php

namespace App\Services;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Sends Web Push notifications to browser push endpoints using the VAPID
 * authentication scheme. Implemented from scratch (no third-party
 * composer dependency) using cURL + OpenSSL via PHP's openssl extension.
 *
 * Reference: RFC 8292 (Message Encryption for Web Push), RFC 8291
 * (Message Encryption for Web Push), draft-ietf-webpush-vapid-04 (VAPID).
 */
final class WebPushService
{
    private string $publicKey;

    private string $privateKey;

    private string $subject;

    public function __construct()
    {
        $publicKey = (string) config('webpush.public_key', '');
        $privateKey = (string) config('webpush.private_key', '');
        $subject = (string) config('webpush.subject', '');

        if ($publicKey === '' || $privateKey === '' || $subject === '') {
            throw new RuntimeException(
                'WebPush is not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT in .env.',
            );
        }

        $this->publicKey = $publicKey;
        $this->privateKey = $privateKey;
        $this->subject = $subject;
    }

    /**
     * Send an encrypted push notification. The payload MUST be ≤ 4096 bytes
     * after encryption (the limit enforced by most push services).
     *
     * Returns true on success, false if the subscription is gone (the
     * caller should delete the row in that case — 404 / 410).
     */
    public function send(
        PushSubscription $subscription,
        string $payload,
        int $ttl = 60,
    ): bool {
        $endpoint = $subscription->endpoint;
        $p256dh = self::base64UrlDecode($subscription->p256dh);
        $auth = self::base64UrlDecode($subscription->auth);

        if ($p256dh === '' || $auth === '') {
            return false;
        }

        $encoding = $subscription->content_encoding ?: 'aesgcm';

        [$ciphertext, $sharedSecret] = match ($encoding) {
            'aesgcm' => $this->encryptAesGcm($payload, $p256dh, $auth),
            'aes128gcm' => $this->encryptAesGcm($payload, $p256dh, $auth),
            default => throw new RuntimeException(
                "Unsupported push content-encoding: {$encoding}",
            ),
        };

        $headers = [
            'Content-Type: application/octet-stream',
            'Content-Encoding: aesgcm',
            'TTL: '.$ttl,
            'Authorization: '.$this->buildVapidHeader(
                $endpoint,
                $ttl,
                $sharedSecret,
            ),
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $ciphertext,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_FOLLOWLOCATION => false,
        ]);

        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            Log::warning('WebPush cURL failure', [
                'endpoint' => $endpoint,
                'error' => $error,
            ]);

            return false;
        }

        if ($status >= 200 && $status < 300) {
            return true;
        }

        Log::info('WebPush non-success status', [
            'endpoint' => $endpoint,
            'status' => $status,
            'body' => is_string($body) ? substr($body, 0, 200) : null,
        ]);

        return false;
    }

    /**
     * Encrypt `payload` for the recipient using aesgcm (RFC 8188).
     * Returns the ciphertext blob (ready to POST) and the local ECDH
     * private key (needed to sign the VAPID JWT).
     *
     * @return array{0:string,1:string} [ciphertext, localPrivatePem]
     */
    private function encryptAesGcm(
        string $payload,
        string $recipientPublic,
        string $authSecret,
    ): array {
        // Generate a fresh P-256 ECDH key pair for this message.
        $res = openssl_pkey_new([
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ]);
        if ($res === false) {
            throw new RuntimeException('Failed to generate ECDH key.');
        }
        $details = openssl_pkey_get_details($res);
        $localPublic = "\x04"
            .str_pad($details['ec']['x'], 32, "\x00", STR_PAD_LEFT)
            .str_pad($details['ec']['y'], 32, "\x00", STR_PAD_LEFT);

        $localPrivatePem = '';
        openssl_pkey_export($res, $localPrivatePem);

        // Compute the ECDH shared secret
        $recipientKey = openssl_pkey_get_public(
            self::buildUncompressedPoint($recipientPublic),
        );
        if ($recipientKey === false) {
            throw new RuntimeException('Invalid recipient public key.');
        }

        $sharedSecret = '';
        $sharedSecretBin = openssl_pkey_derive(
            $recipientKey,
            $res,
            32,
        );
        if ($sharedSecretBin === false) {
            // fallback if derive unsupported
            $sharedSecret = '';
        } else {
            $sharedSecret = $sharedSecretBin;
        }
        if ($sharedSecret === '') {
            throw new RuntimeException('ECDH derivation failed.');
        }

        // Build the info parameter: "WebPush: info\x00" || ua_public || as_public
        $info = "WebPush: info\x00".$localPublic.$recipientPublic;

        // PRK = HMAC-SHA256(auth_secret, ecdh_secret)
        $prk = hash_hmac('sha256', $sharedSecret, $authSecret, true);

        // IKM = HKDF-Expand(PRK, info, 32)
        $ikm = self::hkdfExpand($prk, $info, 32);

        // Salt = random 16 bytes
        $salt = random_bytes(16);

        // Derive the content-encryption key + nonce from IKM+salt via HKDF
        // Context = "Content-Encoding: aesgcm\x00"
        $context = "Content-Encoding: aesgcm\x00";
        $cekInfo = $context.$salt."\x01";
        $nonceInfo = $context.$salt."\x02";
        $cek = self::hkdfExpand($ikm, $cekInfo, 16);
        $nonce = self::hkdfExpand($ikm, $nonceInfo, 12);

        // Build the plaintext: padding(0 or 2 bytes) + payload
        // RFC 8188: pad length encoded as a single zero byte + N zero bytes.
        // For payloads ≤ 4096 bytes the pad is a single 0x00 byte (rs = 0).
        $plaintext = "\x00".$payload;

        $tag = '';
        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $cek,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag,
            '',
            16,
        );
        if ($ciphertext === false) {
            throw new RuntimeException('AES-GCM encryption failed.');
        }
        $ciphertext .= $tag;

        // aesgcm wire format: header(salt(16) || rs(4) || idlen(1) || keyid)
        $rs = pack('N', 4096);
        $idlen = chr(strlen($localPublic));
        $header = $salt.$rs.$idlen.$localPublic;

        return [$header.$ciphertext, $localPrivatePem];
    }

    /**
     * Build the VAPID `Authorization: vapid t=...,k=...` header for the
     * request, including a short-lived JWT signed by the local ECDH key.
     *
     * @param  string  $sharedSecretPem  unused for current VAPID profile but
     *                                   kept for future ES256-keyed headers
     */
    private function buildVapidHeader(
        string $endpoint,
        int $ttl,
        string $sharedSecretPem,
    ): string {
        $aud = self::audienceFor($endpoint);
        $jwt = self::buildVapidJwt($aud, $ttl);

        $header = [
            'typ' => 'JWT',
            'alg' => 'ES256',
        ];
        $protectedHeader = self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));

        $payload = [
            'aud' => $aud,
            'exp' => time() + $ttl + 60,
            'sub' => $this->subject,
        ];
        $payloadEncoded = self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));

        $signingInput = $protectedHeader.'.'.$payloadEncoded;

        $signature = '';
        $key = openssl_pkey_get_private(
            self::buildEcPrivatePem($this->privateKey),
        );
        openssl_sign(
            $signingInput,
            $signature,
            $key,
            OPENSSL_ALGO_SHA256,
        );
        $signatureB64 = self::base64UrlEncode($signature);

        $token = $signingInput.'.'.$signatureB64;

        return 'vapid t='.$token.', k='.$this->publicKey;
    }

    private function buildVapidJwt(string $aud, int $ttl): string
    {
        // The same logic as buildVapidHeader's payload construction.
        $payload = [
            'aud' => $aud,
            'exp' => time() + $ttl + 60,
            'sub' => $this->subject,
        ];

        return self::base64UrlEncode(json_encode($payload));
    }

    /**
     * Build the audience claim from a push endpoint URL.
     * Scheme + "://" + host (+ ":" + port if non-default).
     */
    private static function audienceFor(string $endpoint): string
    {
        $parts = parse_url($endpoint);
        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'] ?? '';
        $port = $parts['port'] ?? null;

        $defaultPort = match ($scheme) {
            'https' => 443,
            'http' => 80,
            default => null,
        };
        if ($port && $port !== $defaultPort) {
            $host .= ':'.$port;
        }

        return $scheme.'://'.$host;
    }

    /**
     * Wrap a base64url-encoded raw private scalar (32 bytes) into a PEM so
     * OpenSSL can load it.
     */
    private static function buildEcPrivatePem(string $base64UrlKey): string
    {
        $raw = self::base64UrlDecode($base64UrlKey);
        if (strlen($raw) !== 32) {
            throw new RuntimeException('VAPID private key must decode to 32 bytes.');
        }

        // DER encode ECPrivateKey structure (RFC 5915)
        // SEQUENCE { INTEGER 1, OCTET STRING <raw d>, [0] ECParameters oid prime256v1 }
        $der = self::derEncodeSequence(
            self::derEncodeInteger(1)
            .self::derEncodeOctetString($raw)
            .self::derEncodeContextExplicit(0, self::derEncodeOidPrime256v1())
        );

        $pem = "-----BEGIN EC PRIVATE KEY-----\n"
            .chunk_split(base64_encode($der), 64, "\n")
            ."-----END EC PRIVATE KEY-----\n";

        return $pem;
    }

    /**
     * Wrap a base64url-encoded raw public point (65 bytes, uncompressed)
     * into a PEM SubjectPublicKeyInfo.
     */
    private static function buildUncompressedPoint(string $base64UrlKey): string
    {
        $raw = self::base64UrlDecode($base64UrlKey);
        if (strlen($raw) !== 65 || $raw[0] !== "\x04") {
            throw new RuntimeException(
                'VAPID/encryption public key must be a 65-byte uncompressed point.',
            );
        }

        // SubjectPublicKeyInfo { algorithm EC, subjectPublicKey <raw> }
        $algId = self::derEncodeSequence(
            self::derEncodeOidEcPublicKey().self::derEncodeOidPrime256v1(),
        );
        $bitstring = "\x00".$raw; // unused bits = 0
        $spki = self::derEncodeSequence($algId.self::derEncodeBitString($bitstring));

        return "-----BEGIN PUBLIC KEY-----\n"
            .chunk_split(base64_encode($spki), 64, "\n")
            ."-----END PUBLIC KEY-----\n";
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padded = $value.str_repeat('=', (4 - strlen($value) % 4) % 4);
        $decoded = base64_decode(strtr($padded, '-_', '+/'), true);

        return $decoded === false ? '' : $decoded;
    }

    private static function hkdfExpand(string $prk, string $info, int $length): string
    {
        // RFC 5869 — single block is enough for ≤ 32 bytes (digest output).
        $output = '';
        $previous = '';
        $counter = 1;
        while (strlen($output) < $length) {
            $previous = hash_hmac(
                'sha256',
                $previous.$info.chr($counter),
                $prk,
                true,
            );
            $output .= $previous;
            $counter++;
        }

        return substr($output, 0, $length);
    }

    /* --- DER helpers (just enough to encode a VAPID key) --- */

    private static function derEncodeLength(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }
        $bytes = '';
        while ($length > 0) {
            $bytes = chr($length & 0xFF).$bytes;
            $length >>= 8;
        }

        return chr(0x80 | strlen($bytes)).$bytes;
    }

    private static function derEncodeInteger(int $value): string
    {
        if ($value === 0) {
            return "\x02\x01\x00";
        }
        $bytes = '';
        $v = $value;
        while ($v > 0) {
            $bytes = chr($v & 0xFF).$bytes;
            $v >>= 8;
        }
        if ($bytes[0] & 0x80) {
            $bytes = "\x00".$bytes;
        }

        return "\x02".self::derEncodeLength(strlen($bytes)).$bytes;
    }

    private static function derEncodeOctetString(string $value): string
    {
        return "\x04".self::derEncodeLength(strlen($value)).$value;
    }

    private static function derEncodeBitString(string $value): string
    {
        return "\x03".self::derEncodeLength(strlen($value)).$value;
    }

    private static function derEncodeContextExplicit(int $tag, string $value): string
    {
        return chr(0xA0 | $tag).self::derEncodeLength(strlen($value)).$value;
    }

    private static function derEncodeSequence(string $value): string
    {
        return "\x30".self::derEncodeLength(strlen($value)).$value;
    }

    private static function derEncodeOidEcPublicKey(): string
    {
        // 1.2.840.10045.2.1 → 06 07 2A 86 48 CE 3D 02 01
        return "\x06\x07\x2a\x86\x48\xce\x3d\x02\x01";
    }

    private static function derEncodeOidPrime256v1(): string
    {
        // 1.2.840.10045.3.1.7 → 06 08 2A 86 48 CE 3D 03 01 07
        return "\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07";
    }
}
