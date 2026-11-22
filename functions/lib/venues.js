// Booking rules per venue. The opening hours here MUST match js/data.js (tools/check-hours.cjs verifies it).
export const RULES = {
  slotMinutes: 30,                 // time between bookable slots
  lastSeatingMinutesBeforeClose: 60, // assumption, confirm with the client
  minLeadMinutes: 120,             // no online bookings closer than 2 h
  maxDaysAhead: 60,
  maxPartyOnline: 10,              // larger groups go through the catering/enquiry form or by phone
  durationMinutes: (party) => (party >= 6 ? 120 : 90)
};

export const VENUES = {
  "las-palmas": {
    name: "Local Las Palmas",
    address: "C. José Franchy Roca 9, 35007 Las Palmas de Gran Canaria",
    phone: "+34 656 441 966",
    calendarVar: "CALENDAR_ID_LAS_PALMAS",
    staffVar: "STAFF_EMAIL_LAS_PALMAS",
    seats: 64, // total capacity given by the client (2026-10-19). Bookings from TheFork/Dish are not synced: lower this if they take seats too.
    hours: { 0: [["13:00", "17:00"]], 1: [], 2: [["13:00", "17:00"], ["20:00", "23:00"]], 3: [["13:00", "17:00"], ["20:00", "23:00"]],
             4: [["13:00", "16:30"], ["20:00", "23:00"]], 5: [["13:00", "16:30"], ["20:00", "23:00"]], 6: [["13:00", "17:00"], ["20:00", "23:00"]] }
  },
  "vecindario": {
    name: "Cuartango Milanesería Vecindario",
    address: "C. Granada 22, Balos, Vecindario",
    phone: null,
    calendarVar: "CALENDAR_ID_VECINDARIO",
    staffVar: "STAFF_EMAIL_VECINDARIO",
    seats: 44, // capacity given by the client (2026-11-22)
    // Real hours given by the client: Thursday to Monday 12:00-16:30 and 19:00-23:00; closed Tuesday and Wednesday. Must match js/data.js.
    hours: { 0: [["12:00", "16:30"], ["19:00", "23:00"]], 1: [["12:00", "16:30"], ["19:00", "23:00"]], 2: [], 3: [],
             4: [["12:00", "16:30"], ["19:00", "23:00"]], 5: [["12:00", "16:30"], ["19:00", "23:00"]], 6: [["12:00", "16:30"], ["19:00", "23:00"]] }
  }
};
