# MAKA - Consulta Educativa de SOAT por Placa

## Descargo de Responsabilidad

**Este proyecto se ha desarrollado exclusivamente con fines educativos y de investigación.** Su propósito es servir como ejemplo práctico de:

- Implementación de OCR (Reconocimiento Óptico de Caracteres) con IA
- Automatización de procesos web
- Manejo de CAPTCHAs en entornos controlados
- Procesamiento y análisis de datos públicos

La información obtenida a través de este proyecto está disponible públicamente a través del portal de APESEG y solo se accede a datos que cualquier ciudadano puede consultar legalmente.

## Descripción

MAKA es una herramienta educativa que demuestra cómo se puede automatizar la consulta de información del SOAT (Seguro Obligatorio de Accidentes de Tránsito) a partir del número de placa de un vehículo. El sistema:

1. Captura y resuelve CAPTCHAs utilizando técnicas de procesamiento de imágenes y reconocimiento con IA
2. Extrae información estructurada de páginas web
3. Almacena los resultados para análisis

## Requisitos Previos

- Node.js v16+
- API Key de Google Gemini (para OCR)
- Dependencias (instalables vía pnpm/npm):
  - jimp (procesamiento de imágenes)
  - cheerio (análisis HTML)
  - lowdb (almacenamiento local)
  - dotenv (gestión de variables de entorno)
  - fetch-cookie (manejo de sesiones HTTP)

## Configuración

1. Clona este repositorio
2. Instala las dependencias: `pnpm install`
3. Crea un archivo `.env` con las claves API necesarias:
   ```
   GEMINI_API_KEY=tu_clave_api_gemini
   ```
4. Configura las placas a consultar en el archivo db.ts o mediante la API

## Uso

```bash
# Ejecutar la aplicación
pnpm tsx index.ts
```

## Consideraciones Éticas y Legales

- Este proyecto no debe utilizarse para consultas masivas o automatizadas que puedan afectar el rendimiento del servicio público de APESEG
- Respete siempre los términos de servicio de los sitios web consultados
- No utilice la información obtenida para fines comerciales o que violen la privacidad
- Solo consulte placas de vehículos con los que tenga relación legítima o para fines educativos específicos

## Funcionamiento

El sistema funciona de la siguiente manera:

1. Solicita la imagen del CAPTCHA del portal de APESEG
2. Preprocesa la imagen para mejorar la legibilidad (umbralización, inversión, etc.)
3. Utiliza Gemini para interpretar el texto del CAPTCHA
4. Realiza la consulta con el CAPTCHA resuelto
5. Analiza el HTML de respuesta para extraer la información de forma estructurada
6. Almacena los resultados en una base de datos local

## Limitaciones

- La precisión del reconocimiento de CAPTCHA puede variar
- No garantiza disponibilidad continua si el portal de APESEG cambia su estructura
- Limitado por las restricciones de la API de Google Gemini
- Limitado por el máximo de consultas del servicio de soat

---

Desarrollado únicamente con propósitos educativos y de investigación.
