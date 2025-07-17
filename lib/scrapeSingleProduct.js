import puppeteer from "puppeteer";

export async function scrapeSingleProduct(slug) {
  const url = `https://www.pccomponentes.com/${slug}`;
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setUserAgent(
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 DuckDuckGo/7 Safari/605.1.15 OPR/101.0.4843.43 Edg/115.0.0.0'
  );

  await page.goto(url, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const title = document.querySelector("#pdp-title")?.innerText || "";

    const price =
      document.querySelector("#pdp-price-current-container")?.innerText || "";

    const imageEl = document.querySelector(
      'ul[data-testid="swiper__main-image"] img'
    );
    const image = imageEl?.src.startsWith("//")
      ? "https:" + imageEl.src
      : imageEl?.src || "";

    return { title, price, image, link: window.location.href };
  });

  await browser.close();
  return data;
}
