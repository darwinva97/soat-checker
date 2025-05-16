import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY no está configurada en el archivo .env');
  process.exit(1);
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  promptFeedback?: any;
}

/**
 * Función para enviar una consulta a la API de Gemini
 * @param prompt - El texto de la consulta a enviar a Gemini
 * @returns El texto de respuesta generado por Gemini
 */
export async function askGemini(prompt: string): Promise<string> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en API de Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    
    // Extraer el texto de la respuesta
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Formato de respuesta inesperado de Gemini');
    }
  } catch (error) {
    console.error('Error al consultar Gemini:', error);
    throw error;
  }
}

/**
 * Función para analizar imagen con Gemini Vision
 * @param imagePath - Ruta a la imagen a analizar
 * @param prompt - Instrucciones para el análisis de la imagen
 * @returns El texto de respuesta generado por Gemini Vision
 */
export async function analyzeImageWithGemini(imagePath: string, prompt: string): Promise<string> {
  try {
    // Actualizado a gemini-1.5-flash como recomienda el error
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Leer el archivo de imagen como base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log(`Enviando imagen a Gemini Vision (modelo: gemini-1.5-flash): ${imagePath}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png', // Cambiado a png ya que estamos usando captcha_transformed.png
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Gemini Vision API: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    console.log("Respuesta de Gemini Vision:", JSON.stringify(data, null, 2));
    
    // Extraer el texto de la respuesta
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Formato de respuesta inesperado de Gemini');
    }
  } catch (error) {
    console.error('Error al analizar imagen con Gemini Vision:', error);
    throw error;
  }
}

// Ejemplo de uso (comentado)
/*
async function main() {
  try {
    // Ejemplo de texto
    const respuesta = await askGemini("¿Qué es la inteligencia artificial?");
    console.log("Respuesta:", respuesta);
    
    // Ejemplo de análisis de imagen
    const textoCaption = await analyzeImageWithGemini(
      path.join(__dirname, "captcha_transformed.png"),
      "Analiza esta imagen de CAPTCHA y devuelve solo el texto que ves en ella. Responde con el texto exacto, sin explicaciones adicionales."
    );
    console.log("Texto extraído:", textoCaption);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Ejecutar el ejemplo si se llama directamente
if (require.main === module) {
  main();
}
*/

