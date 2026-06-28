const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
const MAX_HISTORY = 5;

let conversionRates = {};
let conversionHistory = [];
const currencyCountries = {
  USD: "United States",
  AED: "United Arab Emirates",
  AFN: "Afghanistan",
  ALL: "Albania",
  AMD: "Armenia",
  ANG: "Curaçao and Sint Maarten",
  AOA: "Angola",
  ARS: "Argentina",
  AUD: "Australia",
  AWG: "Aruba",
  AZN: "Azerbaijan",
  BAM: "Bosnia and Herzegovina",
  BBD: "Barbados",
  BDT: "Bangladesh",
  BGN: "Bulgaria",
  BHD: "Bahrain",
  BIF: "Burundi",
  BMD: "Bermuda",
  BND: "Brunei",
  BOB: "Bolivia",
  BRL: "Brazil",
  BSD: "Bahamas",
  BTN: "Bhutan",
  BWP: "Botswana",
  BYN: "Belarus",
  BZD: "Belize",
  CAD: "Canada",
  CDF: "Democratic Republic of the Congo",
  CHF: "Switzerland",
  CLP: "Chile",
  CNY: "China",
  COP: "Colombia",
  CRC: "Costa Rica",
  CUP: "Cuba",
  CVE: "Cape Verde",
  CZK: "Czech Republic",
  DJF: "Djibouti",
  DKK: "Denmark",
  DOP: "Dominican Republic",
  DZD: "Algeria",
  EGP: "Egypt",
  ERN: "Eritrea",
  ETB: "Ethiopia",
  EUR: "European Union",
  FJD: "Fiji",
  FKP: "Falkland Islands",
  FOK: "Faroe Islands",
  GBP: "United Kingdom",
  GEL: "Georgia",
  GGP: "Guernsey",
  GHS: "Ghana",
  GIP: "Gibraltar",
  GMD: "Gambia",
  GNF: "Guinea",
  GTQ: "Guatemala",
  GYD: "Guyana",
  HKD: "Hong Kong",
  HNL: "Honduras",
  HRK: "Croatia",
  HTG: "Haiti",
  HUF: "Hungary",
  IDR: "Indonesia",
  ILS: "Israel",
  IMP: "Isle of Man",
  INR: "India",
  IQD: "Iraq",
  IRR: "Iran",
  ISK: "Iceland",
  JEP: "Jersey",
  JMD: "Jamaica",
  JOD: "Jordan",
  JPY: "Japan",
  KES: "Kenya",
  KGS: "Kyrgyzstan",
  KHR: "Cambodia",
  KID: "Kiribati",
  KMF: "Comoros",
  KRW: "South Korea",
  KWD: "Kuwait",
  KYD: "Cayman Islands",
  KZT: "Kazakhstan",
  LAK: "Laos",
  LBP: "Lebanon",
  LKR: "Sri Lanka",
  LRD: "Liberia",
  LSL: "Lesotho",
  LYD: "Libya",
  MAD: "Morocco",
  MDL: "Moldova",
  MGA: "Madagascar",
  MKD: "North Macedonia",
  MMK: "Myanmar",
  MNT: "Mongolia",
  MOP: "Macau",
  MRU: "Mauritania",
  MUR: "Mauritius",
  MVR: "Maldives",
  MWK: "Malawi",
  MXN: "Mexico",
  MYR: "Malaysia",
  MZN: "Mozambique",
  NAD: "Namibia",
  NGN: "Nigeria",
  NIO: "Nicaragua",
  NOK: "Norway",
  NPR: "Nepal",
  NZD: "New Zealand",
  OMR: "Oman",
  PAB: "Panama",
  PEN: "Peru",
  PGK: "Papua New Guinea",
  PHP: "Philippines",
  PKR: "Pakistan",
  PLN: "Poland",
  PYG: "Paraguay",
  QAR: "Qatar",
  RON: "Romania",
  RSD: "Serbia",
  RUB: "Russia",
  RWF: "Rwanda",
  SAR: "Saudi Arabia",
  SBD: "Solomon Islands",
  SCR: "Seychelles",
  SDG: "Sudan",
  SEK: "Sweden",
  SGD: "Singapore",
  SHP: "Saint Helena",
  SLE: "Sierra Leone",
  SLL: "Sierra Leone",
  SOS: "Somalia",
  SRD: "Suriname",
  SSP: "South Sudan",
  STN: "São Tomé and Príncipe",
  SYP: "Syria",
  SZL: "Eswatini",
  THB: "Thailand",
  TJS: "Tajikistan",
  TMT: "Turkmenistan",
  TND: "Tunisia",
  TOP: "Tonga",
  TRY: "Turkey",
  TTD: "Trinidad and Tobago",
  TVD: "Tuvalu",
  TWD: "Taiwan",
  TZS: "Tanzania",
  UAH: "Ukraine",
  UGX: "Uganda",
  UYU: "Uruguay",
  UZS: "Uzbekistan",
  VES: "Venezuela",
  VND: "Vietnam",
  VUV: "Vanuatu",
  WST: "Samoa",
  XAF: "Central African CFA",
  XCD: "Eastern Caribbean",
  XCG: "Eastern Caribbean",
  XDR: "International Monetary Fund",
  XOF: "West African CFA",
  XPF: "French Pacific Territories",
  YER: "Yemen", 
  ZAR: "South Africa",
  ZMW: "Zambia",
  ZWL: "Zimbabwe"};

async function initializeCurrencies() {
    try {
        showLoading();
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === 'error') throw new Error(data['error-type']);

        conversionRates = data.conversion_rates;

        const lastUpdate = data.time_last_update_utc;
        document.getElementById('update-info').textContent = `Rates updated: ${lastUpdate}`;

        const supportedCurrencies = Object.keys(conversionRates);
        populateCurrencyDropdowns(supportedCurrencies);
    } catch (error) {
        showError('Failed to load currencies. Please try again later.');
        console.error('Currency initialization error:', error);
    } finally {
        hideLoading();
    }
}

function populateCurrencyDropdowns(codes) {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const toSelect2 = document.getElementById('to-currency-2');

    codes.forEach(code => {
        const country = currencyCountries[code] || 'Unknown';
        const label = `${code} (${country})`;
        fromSelect.appendChild(new Option(label, code));
        toSelect.appendChild(new Option(label, code));
        toSelect2.appendChild(new Option(label, code));
    });

    fromSelect.value = 'USD';
    toSelect.value = 'INR';
    toSelect2.value = 'EUR';
}

function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const toCurrency2 = document.getElementById('to-currency-2').value;

    if (!amount || amount <= 0) {
        showError('Enter a valid amount.');
        return;
    }

    showLoading();
    setTimeout(() => {
        const usdAmount = amount / conversionRates[fromCurrency];
        const convertedAmount = usdAmount * conversionRates[toCurrency];
        const convertedAmount2 = usdAmount * conversionRates[toCurrency2];
        document.getElementById('converted-amount').value = convertedAmount.toFixed(2);
        document.getElementById('converted-amount-2').value = convertedAmount2.toFixed(2);

        document.getElementById('rate-info').textContent = `1 ${fromCurrency} = ${(conversionRates[toCurrency] / conversionRates[fromCurrency]).toFixed(4)} ${toCurrency}, ${(conversionRates[toCurrency2] / conversionRates[fromCurrency]).toFixed(4)} ${toCurrency2}`;

        updateHistory(fromCurrency, toCurrency, toCurrency2, amount, convertedAmount.toFixed(2), convertedAmount2.toFixed(2));
        hideLoading();
        showError('');
    }, 500);
}

function updateHistory(from, to1, to2, input, result1, result2) {
    const historyList = document.getElementById('history-list');

    const entry = `${input} ${from} → ${result1} ${to1}, ${result2} ${to2}`;

    if (conversionHistory[0] === entry) return;

    conversionHistory.unshift(entry);
    if (conversionHistory.length > MAX_HISTORY) {
        conversionHistory.pop();
    }

    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    conversionHistory.forEach((item, index) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item;
        const del = document.createElement('button');
        del.innerHTML = '<i class="fas fa-times"></i>';
        del.className = 'history-del';
        del.onclick = () => {
            conversionHistory.splice(index, 1);
            renderHistory();
        };
        li.appendChild(span);
        li.appendChild(del);
        historyList.appendChild(li);
    });
}

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'inline-block';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
}

// Event listeners
document.getElementById('convert-btn').addEventListener('click', convertCurrency);
document.getElementById('swap-btn').addEventListener('click', () => {
    const from = document.getElementById('from-currency');
    const to = document.getElementById('to-currency');
    [from.value, to.value] = [to.value, from.value];
});

// Initialize on load
window.addEventListener('DOMContentLoaded', initializeCurrencies);
