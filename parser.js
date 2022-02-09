const puppeteer = require("puppeteer");

const SOURCE_URL = "https://www.dns-shop.ru/product/4623cd4d0da43332/61-smartfon-apple-iphone-12-256-gb-cernyj/";

async function start() {
  let browser = await puppeteer.launch({
    //executablePath: 'chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      //'--disable-web-security',
      //'--start-maximized',
      //'--start-fullscreen',
      '--auto-open-devtools-for-tabs',
    ],
    headless: true
  });

  let page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36');

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  await page.setDefaultNavigationTimeout(0);
  await page.setDefaultTimeout(0);

  try {
    await page.goto(SOURCE_URL, { waitUntil: "load" }); // domcontentloaded // networkidle2 // load
  } catch (error) {
    console.error('> error : ', error);
    page.close();
    browser.close();
    return;
  }

  await page.waitForTimeout(100);

  async function getPrice() {
    while (true) {
      let price;
      try {
        price = await page.evaluate(async () => {
          async function delay(time) {
            return new Promise(function (resolve) {
              setTimeout(resolve, time)
            });
          }

          await delay(1000);

          let button = document.querySelector('.confirm-city-mobile__accept');
          if (button) {
            button.click();
            await delay(1000);
          }

          let counter = 0;

          while (true) {
            let price = document.querySelector('.product-buy__price');
            if (price) {
              return price.innerText.split('₽')[0].split(' ').join('');
            }

            ++counter;
            if (counter > 10) {
              return null;
            }
            await delay(500);
          }
        });
      } catch (e) {
        await page.reload(SOURCE_URL);
        continue;
      }

      if (price) {
        return price;
      } else {
        await page.reload(SOURCE_URL);
      }
    }
  }

  async function getShops() {
    while (true) {
      let shops;
      try {
        shops = await page.evaluate(async () => {
          async function delay(time) {
            return new Promise(function (resolve) {
              setTimeout(resolve, time)
            });
          }

          await delay(1000);

          let button = document.querySelector('.confirm-city-mobile__accept');
          if (button) {
            button.click();
            await delay(1000);
          }

          let counter = 0;

          while (true) {
            let shopsLink = document.querySelector('.order-avail-wrap__link');
            if (shopsLink) {
              shopsLink.click();

              await delay(2000);
              break;
            }
            ++counter;
            if (counter > 10) {
              // https://shops.dns-shop.ru/v1/shops-avail-by-partition
              return null;
            }
            await delay(1000);
          }

          counter = 0;

          while (true) {
            const list = document.querySelector('.base-shop-choose-list');
            if (list) {
              break;
            }else{
              const error = document.querySelector('.connect-error');
              if(error){
                return null;
              }
            }
  
            ++counter;
            if (counter > 20) {
              // https://shops.dns-shop.ru/v1/shops-avail-by-partition
              return null;
            }
            await delay(1000);
          }

          const notFound = document.querySelector('.base-shop-choose-list__not-found');

          if (notFound) {
            return null;
          }

          let shops = [];

          document.querySelectorAll('.base-shop-choose-list .base-shop-choose-list__item-list').forEach((item) => {
            const title = item.querySelector('.base-shop-view__title');
            shops.push(title.innerText);
          });

          return shops;
        });
      } catch (e) {
        await page.reload(SOURCE_URL);
        continue;
      }

      if (shops) {
        return shops;
      } else {
        await page.reload(SOURCE_URL);
      }
    }
  }

  const price = await getPrice();
  const shops = await getShops();

  //page.close();
  //browser.close();
  console.log('<<< OK >>>');
  return { price, shops };
}

module.exports = {
  start
}