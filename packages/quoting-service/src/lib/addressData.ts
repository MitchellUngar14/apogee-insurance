// Country and State/Province data with postal code validation

export interface StateProvince {
  code: string;
  name: string;
}

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  postalCodeLabel: string; // "Postal Code" or "ZIP Code"
  postalCodePattern: RegExp;
  postalCodePlaceholder: string;
  postalCodeErrorMessage: string;
  stateProvinceLabel: string; // "State", "Province", etc.
  statesProvinces: StateProvince[];
}

export const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    postalCodeLabel: 'ZIP Code',
    postalCodePattern: /^\d{5}(-\d{4})?$/,
    postalCodePlaceholder: '12345 or 12345-6789',
    postalCodeErrorMessage: 'Please enter a valid ZIP code (12345 or 12345-6789)',
    stateProvinceLabel: 'State',
    statesProvinces: [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'DC', name: 'District of Columbia' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    postalCodeLabel: 'Postal Code',
    postalCodePattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    postalCodePlaceholder: 'A1A 1A1',
    postalCodeErrorMessage: 'Please enter a valid postal code (A1A 1A1)',
    stateProvinceLabel: 'Province',
    statesProvinces: [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    postalCodeLabel: 'Postcode',
    postalCodePattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?[ ]?\d[A-Za-z]{2}$/,
    postalCodePlaceholder: 'SW1A 1AA',
    postalCodeErrorMessage: 'Please enter a valid UK postcode (SW1A 1AA)',
    stateProvinceLabel: 'Country/Region',
    statesProvinces: [
      { code: 'ENG', name: 'England' },
      { code: 'SCT', name: 'Scotland' },
      { code: 'WLS', name: 'Wales' },
      { code: 'NIR', name: 'Northern Ireland' },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    postalCodeLabel: 'Postcode',
    postalCodePattern: /^\d{4}$/,
    postalCodePlaceholder: '2000',
    postalCodeErrorMessage: 'Please enter a valid 4-digit postcode',
    stateProvinceLabel: 'State/Territory',
    statesProvinces: [
      { code: 'ACT', name: 'Australian Capital Territory' },
      { code: 'NSW', name: 'New South Wales' },
      { code: 'NT', name: 'Northern Territory' },
      { code: 'QLD', name: 'Queensland' },
      { code: 'SA', name: 'South Australia' },
      { code: 'TAS', name: 'Tasmania' },
      { code: 'VIC', name: 'Victoria' },
      { code: 'WA', name: 'Western Australia' },
    ],
  },
  {
    code: 'MX',
    name: 'Mexico',
    postalCodeLabel: 'Código Postal',
    postalCodePattern: /^\d{5}$/,
    postalCodePlaceholder: '01000',
    postalCodeErrorMessage: 'Please enter a valid 5-digit postal code',
    stateProvinceLabel: 'State',
    statesProvinces: [
      { code: 'AGU', name: 'Aguascalientes' },
      { code: 'BCN', name: 'Baja California' },
      { code: 'BCS', name: 'Baja California Sur' },
      { code: 'CAM', name: 'Campeche' },
      { code: 'CHP', name: 'Chiapas' },
      { code: 'CHH', name: 'Chihuahua' },
      { code: 'CMX', name: 'Ciudad de México' },
      { code: 'COA', name: 'Coahuila' },
      { code: 'COL', name: 'Colima' },
      { code: 'DUR', name: 'Durango' },
      { code: 'GUA', name: 'Guanajuato' },
      { code: 'GRO', name: 'Guerrero' },
      { code: 'HID', name: 'Hidalgo' },
      { code: 'JAL', name: 'Jalisco' },
      { code: 'MEX', name: 'Estado de México' },
      { code: 'MIC', name: 'Michoacán' },
      { code: 'MOR', name: 'Morelos' },
      { code: 'NAY', name: 'Nayarit' },
      { code: 'NLE', name: 'Nuevo León' },
      { code: 'OAX', name: 'Oaxaca' },
      { code: 'PUE', name: 'Puebla' },
      { code: 'QUE', name: 'Querétaro' },
      { code: 'ROO', name: 'Quintana Roo' },
      { code: 'SLP', name: 'San Luis Potosí' },
      { code: 'SIN', name: 'Sinaloa' },
      { code: 'SON', name: 'Sonora' },
      { code: 'TAB', name: 'Tabasco' },
      { code: 'TAM', name: 'Tamaulipas' },
      { code: 'TLA', name: 'Tlaxcala' },
      { code: 'VER', name: 'Veracruz' },
      { code: 'YUC', name: 'Yucatán' },
      { code: 'ZAC', name: 'Zacatecas' },
    ],
  },
];

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getStatesProvinces(countryCode: string): StateProvince[] {
  const country = getCountryByCode(countryCode);
  return country?.statesProvinces || [];
}

export function validatePostalCode(countryCode: string, postalCode: string): boolean {
  const country = getCountryByCode(countryCode);
  if (!country) return true; // No validation for unknown countries
  return country.postalCodePattern.test(postalCode);
}

export function formatPostalCode(countryCode: string, postalCode: string): string {
  // Auto-format Canadian postal codes with space
  if (countryCode === 'CA' && postalCode.length === 6) {
    return `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`.toUpperCase();
  }
  // Auto-format UK postcodes
  if (countryCode === 'GB') {
    return postalCode.toUpperCase();
  }
  return postalCode;
}
