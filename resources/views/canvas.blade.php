<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Tarjeta Digital — Voltaje Grabado</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700;1,900&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #050308;
            color: #e8d8c4;
            min-height: 100vh;
            padding: 32px 24px;
            display: grid;
            grid-template-columns: minmax(360px, 0.85fr) minmax(0, 1.15fr);
            gap: 36px;
            max-width: 1600px;
            margin: 0 auto;
            align-items: start;
        }

        @media (max-width: 1080px) {
            body {
                grid-template-columns: 1fr;
                padding: 20px 14px;
                gap: 24px;
            }
        }

        .prompt-section {
            position: sticky;
            top: 32px;
            display: flex;
            flex-direction: column;
        }

        @media (max-width: 1080px) {
            .prompt-section { position: static; }
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 0 2px;
        }

        .section-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 0.92rem;
            font-weight: 400;
            font-style: italic;
            color: #e8d8c4;
            letter-spacing: 0.02em;
        }

        .section-header h2 .num {
            color: #d49b3a;
            font-style: normal;
            margin-right: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.78rem;
        }

        .copy-btn {
            background: linear-gradient(135deg, #d49b3a 0%, #a85828 100%);
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.72rem;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.25s;
        }

        .copy-btn:hover { transform: translateY(-1px); }
        .copy-btn.copied { background: linear-gradient(135deg, #5a8a4a, #3a6a3a); }

        .prompt-box {
            background: #0c0a14;
            border: 1px solid #1a1620;
            border-radius: 6px;
            padding: 22px 24px;
            font-family: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
            font-size: 0.78rem;
            line-height: 1.75;
            color: #c8b89a;
            white-space: pre-wrap;
            word-wrap: break-word;
            box-shadow: 0 30px 60px -25px rgba(0,0,0,0.8);
        }

        .prompt-box .head {
            color: #d49b3a;
            font-weight: 500;
            letter-spacing: 0.04em;
        }

        .prompt-box .no-en {
            color: #e8784a;
            font-weight: 500;
            background: rgba(232,120,74,0.1);
            padding: 2px 6px;
            border-radius: 3px;
        }

        .prompt-box .meta {
            color: #6a5a4a;
            font-size: 0.72rem;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #1a1620;
        }

        .image-section {
            display: flex;
            flex-direction: column;
        }

        .artwork-wrap {
            position: relative;
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 6px;
            overflow: hidden;
            background: #050308;
            box-shadow:
                0 50px 100px -25px rgba(0,0,0,0.95),
                0 0 0 1px rgba(212,154,58,0.18),
                inset 0 0 0 1px rgba(255,255,255,0.04);
        }

        .artwork-wrap img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }

        .artwork-caption {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding: 0 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.72rem;
            color: #6a5a4a;
            letter-spacing: 0.06em;
        }

        .artwork-caption a {
            color: #d49b3a;
            text-decoration: none;
            border-bottom: 1px solid rgba(212,154,58,0.3);
            padding-bottom: 1px;
        }

        .artwork-caption a:hover { border-bottom-color: #d49b3a; }
    </style>
</head>
<body>

    <!-- SECTION 1: PROMPT -->
    <div class="prompt-section">
        <div class="section-header">
            <h2><span class="num">I.</span>Tarjeta Digital</h2>
            <button class="copy-btn" id="copyBtn" onclick="copyPrompt()">Copiar</button>
        </div>

        <div class="prompt-box"><span class="head">Render 3D fotográfico cuadrado 1:1, ultra nítido, plataforma de tarjeta digital Latinoamérica.</span>

Fondo negro tinta puro con brillo radial coral detrás del héroe. Sin desenfoque en el centro.

Centro-izquierda NÍTIDO dramático: tipografía monumental serif itálica "Tarjeta Digital" en oro fundido 3D, degradado crema→oro→coral→marrón profundo, reflejo especular vertical, sombra profunda para relieve. Halo radial atmosférico.

Abajo del héroe NÍTIDO: 6 íconos circulares grabados en línea dorada fina, trazo 2pt — pantalla monitor (WEB), burbuja con tres puntos (CHAT), calendario con check (RESERVAS), dos cabezas (EQUIPO), documento (PÁGINAS), cuatro cuadrados (PLANTILLAS). Etiquetas pequeñas abajo en español: "WEB" "CHAT" "RESERVAS" "EQUIPO" "PÁGINAS" "PLANTILLAS".

Derecha-fondo suavemente desenfocada: teléfono inteligente inclinado -7° mostrando interfaz de tarjeta de visita digital con encabezado coral. SOLO fondo, no protagonista.

Esquina inferior izquierda NÍTIDA: monospace cream "+591 71146267".
Esquina inferior derecha NÍTIDA: monospace cream "app.hostbol.lat".
Esquina superior izquierda: serif cream "PL. I — LA MARCA DORADA".
Esquina superior derecha: serif cream "Nº 001 — MMXXVI".
Esquina inferior izquierda pequeña: "MDCCCXLVI".
Esquina inferior derecha pequeña: "ED. PRIMERA — IMPRESO EN BOLIVIA".

Centro inferior tenue: monospace coral "VOLTAJE GRABADO".

Render 3D fotorrealista, iluminación cinematográfica arriba-izquierda, sombras dramáticas, placa de museo, texturas fotorrealistas, alta resolución.

<span class="no-en">TEXTO: SOLO en español. Sin palabras en inglés.</span>

<span class="meta">— MOOD: placa de museo, marca dorada, premium
— PALETA: negro tinta #050308, oro #d49b3a, coral #e8784a, crema #e8d8c4
— FILOSOFÍA: Voltaje Grabado (tarjeta de visita × era digital)
— NITIDEZ: centro y esquinas 100% nítido, solo el teléfono de fondo desenfocado</span></div>
    </div>

    <!-- SECTION 2: ARTWORK -->
    <div class="image-section">
        <div class="section-header">
            <h2><span class="num">II.</span>Simulación</h2>
        </div>

        <div class="artwork-wrap">
            <img src="/canvas-tarjeta-digital.png" alt="Tarjeta Digital — Voltaje Grabado">
        </div>

        <div class="artwork-caption">
            <span>PL.&#160;I&#160;·&#160;Nº&#160;001&#160;·&#160;MMXXVI</span>
            <span>
                <a href="/canvas-tarjeta-digital.png" download>PNG</a>
                &nbsp;·&nbsp;
                <a href="/canvas-tarjeta-digital.pdf" download>PDF</a>
                &nbsp;·&nbsp;
                <a href="/canvas-tarjeta-digital.svg" download>SVG</a>
            </span>
        </div>
    </div>

    <script>
        function copyPrompt() {
            const promptText = `Render 3D fotográfico cuadrado 1:1, ultra nítido, plataforma de tarjeta digital Latinoamérica.

Fondo negro tinta puro con brillo radial coral detrás del héroe. Sin desenfoque en el centro.

Centro-izquierda NÍTIDO dramático: tipografía monumental serif itálica "Tarjeta Digital" en oro fundido 3D, degradado crema→oro→coral→marrón profundo, reflejo especular vertical, sombra profunda para relieve. Halo radial atmosférico.

Abajo del héroe NÍTIDO: 6 íconos circulares grabados en línea dorada fina, trazo 2pt — pantalla monitor (WEB), burbuja con tres puntos (CHAT), calendario con check (RESERVAS), dos cabezas (EQUIPO), documento (PÁGINAS), cuatro cuadrados (PLANTILLAS). Etiquetas pequeñas abajo en español: "WEB" "CHAT" "RESERVAS" "EQUIPO" "PÁGINAS" "PLANTILLAS".

Derecha-fondo suavemente desenfocada: teléfono inteligente inclinado -7° mostrando interfaz de tarjeta de visita digital con encabezado coral. SOLO fondo, no protagonista.

Esquina inferior izquierda NÍTIDA: monospace cream "+591 71146267".
Esquina inferior derecha NÍTIDA: monospace cream "app.hostbol.lat".
Esquina superior izquierda: serif cream "PL. I — LA MARCA DORADA".
Esquina superior derecha: serif cream "Nº 001 — MMXXVI".
Esquina inferior izquierda pequeña: "MDCCCXLVI".
Esquina inferior derecha pequeña: "ED. PRIMERA — IMPRESO EN BOLIVIA".

Centro inferior tenue: monospace coral "VOLTAJE GRABADO".

Render 3D fotorrealista, iluminación cinematográfica arriba-izquierda, sombras dramáticas, placa de museo, texturas fotorrealistas, alta resolución.

TEXTO: SOLO en español. Sin palabras en inglés.`;

            navigator.clipboard.writeText(promptText).then(() => {
                const btn = document.getElementById('copyBtn');
                btn.textContent = '✓ Copiado';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copiar';
                    btn.classList.remove('copied');
                }, 2200);
            });
        }
    </script>
</body>
</html>