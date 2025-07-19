import puppeteer from "puppeteer";
import createError from "http-errors";

export async function scrapeSingleProduct(slug) {
  const url = `https://www.pccomponentes.com/${slug.trim()}`;
  const browser = await puppeteer.launch({ headless: "new" });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");

    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

    const data = await page.evaluate(() => {
      const title =
        document.querySelector("#pdp-title")?.innerText.trim() || "";
      const priceRaw =
        document.querySelector("#pdp-price-current-container")?.innerText || "";
      const price = priceRaw.replace(/\n/g, "");
      const imageEl = document.querySelector(
        'ul[data-testid="swiper__main-image"] img'
      );
      const image = imageEl?.src.startsWith("//")
        ? "https:" + imageEl.src
        : imageEl?.src || "";

      return { title, price, image };
    });

    return {
      title: data.title,
      price: data.price,
      image: data.image,
    };
  } catch (error) {
    console.error(" Error en scrapeSingleProduct:", error.message);
    throw createError(502, `Fallo al scrapear el producto: ${error.message}`);
  } finally {
    await browser.close();
  }
}
