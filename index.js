const puppeteer = require('puppeteer-extra');
const ObjectsToCSV = require('objects-to-csv');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

// Change These Values To Search
const CITY = 'Delhi';
const KEYWORD = 'Pediatrician';
const INITIAL_PAGE = 0;
const NUMBER_OF_PAGES = 50;

const NUMBER_CODE_MAP = {
  'icon-acb': '0',
  'icon-yz': '1',
  'icon-wx': '2',
  'icon-vu': '3',
  'icon-ts': '4',
  'icon-rq': '5',
  'icon-po': '6',
  'icon-nm': '7',
  'icon-lk': '8',
  'icon-ji': '9',
  'icon-dc': '+',
  'icon-fe': '(',
  'icon-hg': ')',
  'icon-ba': '-',
};

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, _) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const parsePage = async (pageNumber) => {
  puppeteer.use(stealthPlugin());

  let directory = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.goto(`https://www.justdial.com/${CITY}/${KEYWORD}/page-${pageNumber}`);

    await autoScroll(page);

    directory = await page.evaluate((NUMBER_CODE_MAP) => {
      const entries = [];
      const listings = document.getElementsByClassName('cntanr');

      for (const listing of listings) {
        const name = listing.getElementsByClassName('lng_cont_name')[0].textContent;
        const url = listing.attributes[1].value;
        const phoneNumberArr = Array.from(listing.getElementsByClassName('mobilesv'));
        const phoneNumber = phoneNumberArr.map((number) => NUMBER_CODE_MAP[number.classList[1]]).join('');

        entries.push({name, url, phoneNumber});
      }

      return entries;
    }, NUMBER_CODE_MAP);

    console.log('Total Listings Found:', directory.length);

    for await (const listing of directory) {
      console.log('Navigating to Listing:', listing.name);

      await page.goto(listing.url);

      const details = await page.evaluate(() => {
        const name = document.getElementsByClassName('rstotle')[0].textContent.trim();
        const rating = document.getElementsByClassName('total-rate')[0].textContent;
        const votes = document.getElementsByClassName('votes')[0].textContent.trim();
        const address = document.getElementById('fulladdress').getElementsByClassName('lng_add')[0].textContent;
        removedn('showmore');
        const categoriesArr = Array.from(document.getElementsByClassName('showmore')[0].children);
        const categories = categoriesArr.map((category) => category.textContent.trim()).join(', ');
        const servicesNode = document.getElementsByClassName('.quickinfowrp')[0];

        let details = {
          name,
          rating,
          votes,
          address,
          categories,
        };

        if (servicesNode) {
          const servicesArr = Array.from(document.getElementsByClassName('.quickinfowrp')[0].getElementsByClassName('text'));
          const services = servicesArr.map((service) => service.textContent.trim()).join(', ');

          details = {
            ...details,
            services,
          };
        }

        return details;
      });

      const listingIndex = directory.findIndex((x) => x.url === listing.url);
      directory[listingIndex] = {...directory[listingIndex], ...details};
    }
  } catch (e) {
    console.error(e);
  } finally {
    const csv = new ObjectsToCSV(directory);

    await csv.toDisk('./directory.csv', {
      allColumns: true,
      append: true,
    });

    await browser.close();
  }
};

const main = async () => {
  const pages = [...Array(NUMBER_OF_PAGES).keys()];

  try {
    for await (const page of pages) {
      const pageNumber = INITIAL_PAGE + page + 1;

      console.log('Starting with page', pageNumber);

      await parsePage(pageNumber);
    }
  } catch (e) {
    console.error(e);
  }

  console.log('Script Execution Complete');
};

main();
