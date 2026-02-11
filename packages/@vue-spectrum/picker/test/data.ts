export interface PickerStateFixture {
  name: string;
  abbr: string;
}

export interface PickerCountryFixture {
  name: string;
  code: string;
}

// Upstream-style fixture file for Picker parity tests.
export const states: PickerStateFixture[] = [
  { name: "Alabama", abbr: "AL" },
  { name: "Alaska", abbr: "AK" },
  { name: "American Samoa", abbr: "AS" },
  { name: "Arizona", abbr: "AZ" },
  { name: "Arkansas", abbr: "AR" },
  { name: "California", abbr: "CA" },
  { name: "Colorado", abbr: "CO" },
  { name: "Connecticut", abbr: "CT" },
  { name: "Delaware", abbr: "DE" },
  { name: "District Of Columbia", abbr: "DC" },
];

export const countries: PickerCountryFixture[] = [
  { name: "Afghanistan", code: "AF" },
  { name: "Aland Islands", code: "AX" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "American Samoa", code: "AS" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Anguilla", code: "AI" },
  { name: "Antarctica", code: "AQ" },
  { name: "Argentina", code: "AR" },
];
