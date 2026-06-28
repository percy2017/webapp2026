<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Peluquería &amp; Barbería — Voltaje Grabado</title>
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
            padding: 48px 32px 80px;
        }

        .container {
            max-width: 1480px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            border-bottom: 1px solid rgba(212,154,58,0.3);
            padding-bottom: 24px;
            margin-bottom: 56px;
            gap: 24px;
            flex-wrap: wrap;
        }

        .header h1 {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-weight: 400;
            font-size: 2.4rem;
            line-height: 1.1;
            color: #e8d8c4;
        }

        .header h1 .accent {
            color: #d49b3a;
        }

        .header-meta {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            color: #6a5a4a;
            text-align: right;
            letter-spacing: 0.08em;
        }

        .header-meta .num {
            color: #d49b3a;
        }

        .intro {
            max-width: 720px;
            margin-bottom: 56px;
            color: #c8b89a;
            font-size: 0.95rem;
            line-height: 1.7;
        }

        .intro strong {
            color: #e8784a;
            font-weight: 500;
        }

        .group {
            margin-bottom: 64px;
        }

        .group-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            margin-bottom: 28px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(212,154,58,0.18);
        }

        .group-header h2 {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-weight: 400;
            font-size: 1.4rem;
            color: #e8d8c4;
        }

        .group-header h2 .num {
            font-family: 'JetBrains Mono', monospace;
            font-style: normal;
            font-size: 0.8rem;
            color: #d49b3a;
            margin-right: 12px;
        }

        .group-header .count {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            color: #6a5a4a;
            letter-spacing: 0.1em;
        }

        .grid {
            display: grid;
            gap: 28px;
        }

        .grid-team { grid-template-columns: repeat(3, 1fr); }
        .grid-services { grid-template-columns: repeat(3, 1fr); }
        .grid-beforeafter { grid-template-columns: repeat(2, 1fr); }

        @media (max-width: 980px) {
            .grid-team, .grid-services { grid-template-columns: repeat(2, 1fr); }
            .grid-beforeafter { grid-template-columns: 1fr; }
        }

        @media (max-width: 620px) {
            .grid-team, .grid-services, .grid-beforeafter { grid-template-columns: 1fr; }
        }

        .card {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .card .frame {
            position: relative;
            overflow: hidden;
            border-radius: 4px;
            background: #0c0a14;
            box-shadow:
                0 30px 60px -25px rgba(0,0,0,0.9),
                0 0 0 1px rgba(212,154,58,0.18);
        }

        .card.team .frame { aspect-ratio: 4 / 5; }
        .card.service .frame { aspect-ratio: 4 / 3; }
        .card.beforeafter .frame { aspect-ratio: 4 / 3; }

        .card .frame img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }

        .card .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            color: #6a5a4a;
            letter-spacing: 0.08em;
        }

        .card .meta .tag {
            color: #d49b3a;
            text-transform: uppercase;
        }

        .card .meta a {
            color: #d49b3a;
            text-decoration: none;
            border-bottom: 1px solid rgba(212,154,58,0.3);
            padding-bottom: 1px;
        }

        .card .meta a:hover { border-bottom-color: #d49b3a; }

        .prompt-card {
            background: #0c0a14;
            border: 1px solid rgba(212,154,58,0.18);
            border-radius: 6px;
            padding: 20px 22px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.78rem;
            line-height: 1.7;
            color: #c8b89a;
            white-space: pre-wrap;
            word-wrap: break-word;
            margin-top: 14px;
        }

        .prompt-card .head {
            color: #d49b3a;
            font-weight: 500;
            letter-spacing: 0.04em;
            margin-bottom: 8px;
            display: block;
        }

        .prompt-card .meta {
            color: #6a5a4a;
            font-size: 0.72rem;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid rgba(212,154,58,0.12);
            display: block;
        }

        .footer {
            margin-top: 80px;
            padding-top: 24px;
            border-top: 1px solid rgba(212,154,58,0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            color: #6a5a4a;
            letter-spacing: 0.08em;
        }

        .footer .accent {
            color: #d49b3a;
        }

        .copy-btn {
            background: linear-gradient(135deg, #d49b3a 0%, #a85828 100%);
            color: white;
            border: none;
            padding: 10px 22px;
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
    </style>
</head>
<body>
    <div class="container">

        <!-- HEADER -->
        <header class="header">
            <h1>Peluquería <span class="accent">&amp;</span> Barbería<br><span style="font-size: 1.2rem; color: #d49b3a;">— Voltaje Grabado —</span></h1>
            <div class="header-meta">
                PL.&nbsp;IV · SIMULACIÓN<br>
                <span class="num">Nº 013 — MMXXVI</span><br>
                13&nbsp;artefactos
            </div>
        </header>

        <p class="intro">
            Trece piezas simuladas en SVG para el preset <strong>Peluquería &amp; Barbería</strong>: equipo, catálogo de servicios y comparativos antes/después. Cada una está construida siguiendo la filosofía <strong>Embossed Voltage</strong> — paleta cerrada de tinta, oro y coral, geometría exacta, tipografía como marca.
        </p>

        <!-- TEAM -->
        <section class="group">
            <div class="group-header">
                <h2><span class="num">I.</span>Equipo · Staff</h2>
                <span class="count">3 piezas</span>
            </div>

            <div class="grid grid-team">
                <div class="card team">
                    <div class="frame">
                        <img src="/canvas/peluqueria/team-camila.svg" alt="Camila M. — Directora y Colorista">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 001 — Camila M.</span>
                        <a href="/canvas/peluqueria/team-camila.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card team">
                    <div class="frame">
                        <img src="/canvas/peluqueria/team-lucia.svg" alt="Lucía R. — Estilista">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 002 — Lucía R.</span>
                        <a href="/canvas/peluqueria/team-lucia.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card team">
                    <div class="frame">
                        <img src="/canvas/peluqueria/team-diego.svg" alt="Diego S. — Barber">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 003 — Diego S.</span>
                        <a href="/canvas/peluqueria/team-diego.svg" download>SVG</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- SERVICES -->
        <section class="group">
            <div class="group-header">
                <h2><span class="num">II.</span>Servicios · Catálogo</h2>
                <span class="count">6 piezas</span>
            </div>

            <div class="grid grid-services">
                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-corte.svg" alt="Corte de cabello">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 004 — Corte</span>
                        <a href="/canvas/peluqueria/service-corte.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-color.svg" alt="Coloración">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 005 — Color</span>
                        <a href="/canvas/peluqueria/service-color.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-barba.svg" alt="Barba y Perfilado">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 006 — Barba</span>
                        <a href="/canvas/peluqueria/service-barba.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-peinado.svg" alt="Peinado y Eventos">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 007 — Peinado</span>
                        <a href="/canvas/peluqueria/service-peinado.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-tratamientos.svg" alt="Tratamientos">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 008 — Tratamientos</span>
                        <a href="/canvas/peluqueria/service-tratamientos.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card service">
                    <div class="frame">
                        <img src="/canvas/peluqueria/service-novias.svg" alt="Novias">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 009 — Novias</span>
                        <a href="/canvas/peluqueria/service-novias.svg" download>SVG</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- BEFORE/AFTER -->
        <section class="group">
            <div class="group-header">
                <h2><span class="num">III.</span>Antes / Después</h2>
                <span class="count">4 piezas · 2 pares</span>
            </div>

            <div class="grid grid-beforeafter">
                <div class="card beforeafter">
                    <div class="frame">
                        <img src="/canvas/peluqueria/ba-balayage-before.svg" alt="Antes — balayage">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 010 · ANTES</span>
                        <a href="/canvas/peluqueria/ba-balayage-before.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card beforeafter">
                    <div class="frame">
                        <img src="/canvas/peluqueria/ba-balayage-after.svg" alt="Después — balayage y corte">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 011 · DESPUÉS</span>
                        <a href="/canvas/peluqueria/ba-balayage-after.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card beforeafter">
                    <div class="frame">
                        <img src="/canvas/peluqueria/ba-color-before.svg" alt="Antes — color opaco">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 012 · ANTES</span>
                        <a href="/canvas/peluqueria/ba-color-before.svg" download>SVG</a>
                    </div>
                </div>

                <div class="card beforeafter">
                    <div class="frame">
                        <img src="/canvas/peluqueria/ba-color-after.svg" alt="Después — color fantasía">
                    </div>
                    <div class="meta">
                        <span class="tag">Nº 013 · DESPUÉS</span>
                        <a href="/canvas/peluqueria/ba-color-after.svg" download>SVG</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- PROMPT BASE -->
        <section class="group">
            <div class="group-header">
                <h2><span class="num">IV.</span>Prompt base · Regenerar con IA</h2>
                <span class="count">para <code>MinimaxImageService</code></span>
            </div>

            <div class="prompt-card">
<span class="head">Render 3D fotográfico, ultra nítido, plataforma peluquería &amp; barbería Latinoamérica.</span>

Fondo negro tinta puro con brillo radial coral detrás del sujeto. Sin desenfoque en el centro.

Centro NÍTIDO: retrato de staff de peluquería / ilustración simbólica de servicio / par antes-después de transformación capilar. Paleta cerrada: tinta #050308, oro #d49b3a, coral #e8784a, crema #e8d8c4.

Esquinas NÍTIDAS en tipografía itálica serif: nombre del servicio / persona, número de placa, fecha romana. Tipo monospace cream para metadatos.

Bordes del marco en línea dorada fina, trazo 0.5pt.

Render 3D fotorrealista, iluminación cinematográfica arriba-izquierda, sombras dramáticas, placa de museo, texturas fotorrealistas, alta resolución.

<span class="meta">— MOOD: placa de museo, marca dorada, premium
— PALETA: negro tinta #050308, oro #d49b3a, coral #e8784a, crema #e8d8c4
— FILOSOFÍA: Voltaje Grabado (tarjeta de visita × era digital)
— NITIDEZ: centro y esquinas 100% nítido
— PROPORCIÓN: 4:5 para staff, 4:3 para servicios y antes/después</span>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="footer">
            <span>Embossed Voltage · Simulación 13 piezas</span>
            <span class="accent">Peluquería &amp; Barbería — Estudio Camila · La Paz, BO</span>
        </footer>
    </div>
</body>
</html>