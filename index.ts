import path from "path";
import { Jimp } from "jimp";
import fs from "fs";
import { analyzeImageWithGemini } from "./gemini";
import { getDB } from "./db";
import makeFetchCookie from "fetch-cookie";
import { load } from "cheerio";

const instanceFetch = makeFetchCookie(fetch);

const getInfo = async (placa: string, captcha: string) => {
  const url = `https://www.apeseg.org.pe/php/soat/web/?placa=${placa}&captcha=${captcha.toUpperCase()}`;

  return await instanceFetch(url).then((res) => res.text());
};

const getCaptchaFile = async () => {
  const captchaImage = await instanceFetch(
    "https://www.apeseg.org.pe/php/web/captcha.php"
  )
    .then((res) => res.arrayBuffer())
    .then((buffer) => Buffer.from(buffer));

  const filePath = path.join(__dirname, "captcha.jpg");
  fs.writeFileSync(filePath, captchaImage);

  const image = await Jimp.read(filePath);
  image
    .greyscale()
    .contrast(0.5)
    .normalize()
    .threshold({ max: 150, replace: 255 }) // Cambiado de 0xffffffff a 255
    .invert();

  const outputPath = path.join(__dirname, "captcha_transformed.png");

  await image.write(outputPath as `${string}.${string}`);

  return outputPath;
};

const getTextFromCaptchaFile = async (imagePath: string) => {
  const promptText =
    "Observa esta imagen de CAPTCHA. Solo extrae los caracteres que ves. No añadas ninguna explicación, descripciones o frases adicionales. Responde únicamente con los caracteres del CAPTCHA tal como aparecen en la imagen, sin ningún otro texto. Respeta mayúsculas y minúsculas.";

  const text = await analyzeImageWithGemini(imagePath, promptText);

  // Limpieza del texto para extraer solo los caracteres del CAPTCHA
  // Nueva estrategia de limpieza más agresiva
  const cleanText = text
    .replace(/^.*captcha:?\s*/i, "") // Elimina "El captcha: "
    .replace(/^.*texto:?\s*/i, "") // Elimina "El texto: "
    .replace(/^.*es:?\s*/i, "") // Elimina "Es: "
    .replace(/^.*caracteres:?\s*/i, "") // Elimina "Los caracteres: "
    .replace(/^["'\s]*|["'\s]*$/g, "") // Elimina comillas y espacios al inicio y final
    .replace(/\.$/, "") // Elimina punto final si existe
    .replace(/\s+/g, "") // Elimina todos los espacios
    .trim();

  console.log(`Texto original de Gemini: "${text}"`);
  console.log(`Texto procesado del CAPTCHA: "${cleanText}"`);

  // Si la respuesta es muy larga, probablemente es una explicación y no solo el CAPTCHA
  // Intentemos extraer secuencias de caracteres alfanuméricos de longitud adecuada para un CAPTCHA
  if (cleanText.length > 10) {
    const captchaMatch = cleanText.match(/[A-Z0-9]{4,8}/i);
    if (captchaMatch) {
      console.log(
        `Encontrado posible CAPTCHA en texto largo: "${captchaMatch[0]}"`
      );
      return captchaMatch[0];
    }
  }

  return cleanText;
};

const getDataFromHTML = (html: string) => {
  const $ = load(html);
  const rows = [] as any[];
  
  // Verificar si hay mensaje de error (CAPTCHA incorrecto, etc.)
  const errorMessage = $('.alert-danger').text().trim();
  if (errorMessage) {
    return { error: true, message: errorMessage };
  }
  
  // Verificar si hay tabla de resultados
  if ($('table#example').length === 0) {
    return { error: true, message: "No se encontró la tabla de resultados" };
  }
  
  // Obtener los encabezados
  const headers = $('table#example thead tr th').map((i, el) => {
    return $(el).text().trim();
  }).get();
  
  // Obtener los datos de cada fila
  $('table#example tbody tr').each((index, row) => {
    const rowData = {};
    
    $(row).find('td').each((i, cell) => {
      // Usar el encabezado correspondiente como clave
      const header = headers[i] || `columna${i}`;
      rowData[header] = $(cell).text().trim();
    });
    
    rows.push(rowData);
  });
  
  return {
    success: true,
    totalRegistros: rows.length,
    datos: rows,
    fechaConsulta: new Date().toISOString()
  };
};

const main = async () => {
  const db = await getDB();
  const placas = db.data.placas;

  for await (const placa of placas.filter((placa) => !placa.result)) {
    try {
      const captchaFile = await getCaptchaFile();
      const captcha = (await getTextFromCaptchaFile(captchaFile)).trim();
      const html = await getInfo(placa.placa, captcha);
      placa.lastCaptcha = captcha; // solo porque sí xd
			placa.html = html
			const info = getDataFromHTML(html);
      placa.result = JSON.stringify(info);
    } catch (error) {
      placa.error = (error as Error).message;
    }
    await db.write();
  }

  console.log("Placas actualizadas:", placas.filter((placa) => placa.result));
};

main();
