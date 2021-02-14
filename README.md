<a href="https://www.loom.com/share/9fbd130a6dee4ff1b3ca8a5d509f44b2">
  <img style="max-width:400px;" src="https://cdn.loom.com/sessions/thumbnails/9fbd130a6dee4ff1b3ca8a5d509f44b2-with-play.gif">
</a>

# Justdial Scraper

An automation script written in Node.js, powered by Puppeteer to scrape multiple pages of Justdial (an Indian Yellow Pages website) and exports specific information in CSV format.

> **Disclaimer**  
> It is illegal to scrape JustDial, but the code is made open-source purely for educational purposes to understand technologies like NodeJS, Puppeteer and Automation Testing.

## Installation

```sh
> npm install
```

## Usage

Change these values in line 6-7 of `index.js`:

```
const CITY = 'Delhi';
const KEYWORD = 'Clinics-in-Vasant-Kunj';
```

```sh
> npm start
```
