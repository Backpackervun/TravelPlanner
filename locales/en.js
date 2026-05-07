/**
 * locales/en.js — v1.0 FINAL
 * Master dictionary. All other locale files must mirror these keys.
 * Two new keys added: loginSubtitle, signupSubtitle
 */
const en = {
  // ── App ──────────────────────────────────────────────────────────────────
  appName: "Travel Planner",
  backpackervun: "Backpackervun",
  loading: "Loading…",
  close: "Close", cancel: "Cancel", confirm: "Confirm", apply: "Apply",
  save: "Save", saving: "Saving…", saved: "Saved ✓", saveRetry: "Retry",
  delete: "Delete", edit: "Edit", back: "Back", next: "Next", done: "Done",
  yes: "Yes", no: "No", optional: "optional",

  // ── Auth ─────────────────────────────────────────────────────────────────
  signIn: "Sign in",
  signUp: "Create account",
  logout: "Logout",
  logoutConfirm: "Sign out of your account?",
  loginSubtitle: "Enter your credentials to access the planner.",
  signupSubtitle: "Fill in your details to get started.",
  email: "Email", emailPlaceholder: "you@example.com",
  password: "Password", passwordPlaceholder: "At least 6 characters",
  confirmPassword: "Confirm Password", confirmPasswordPlaceholder: "Repeat your password",
  fullName: "Full Name", fullNamePlaceholder: "e.g. Ervan Santoso",
  phoneNumber: "Phone Number", phonePlaceholder: "+62 812 3456 7890",
  dreamDestination: "Dream Trip Destination",
  dreamDestinationPlaceholder: "e.g. Japan, Seoul, Europe, Sydney…",
  dreamDestinationHint: "We'll use this to personalise your planning experience.",
  forgotPassword: "Forgot password?",
  sendResetEmail: "Send reset link",
  resetEmailSent: "Reset link sent! Check your inbox.",
  resendEmail: "Resend email",
  backToLogin: "Back to sign in",
  dontHaveAccount: "Don't have an account?",
  alreadyHaveAccount: "Already have an account?",
  createAccountLink: "Create account",
  signingIn: "Signing in…", creatingAccount: "Creating account…", sendingReset: "Sending…",

  // ── Auth errors ───────────────────────────────────────────────────────────
  errorUserNotFound: "No account found with this email address.",
  errorWrongPassword: "Incorrect password. Please try again.",
  errorInvalidEmail: "Please enter a valid email address.",
  errorTooManyRequests: "Too many attempts. Please wait before trying again.",
  errorInvalidCredential: "Email or password is incorrect.",
  errorEmailInUse: "An account with this email already exists.",
  errorWeakPassword: "Password must be at least 6 characters.",
  errorGeneric: "Something went wrong. Please try again.",

  // ── Validation ────────────────────────────────────────────────────────────
  validationNameRequired: "Full name is required.",
  validationEmailInvalid: "Please enter a valid email address.",
  validationPhoneRequired: "Phone number is required.",
  validationPasswordShort: "Password must be at least 6 characters.",
  validationPasswordMismatch: "Passwords do not match.",

  // ── Onboarding ────────────────────────────────────────────────────────────
  howToStart: "How to get started",
  howToStartStep1: "Create your account with your name, email and phone number.",
  howToStartStep2: "Enter a redeem code to unlock your Lite or Pro plan.",
  howToStartStep3: "Start planning your trip day by day in the planner.",
  howToStartStep4: "Save your itinerary securely to the cloud.",
  howToStartStep5: "Export a premium PDF itinerary to share with clients.",
  howToStartCta: "Need a redeem code? Chat us on",
  howToStartCtaWhatsApp: "WhatsApp",

  // ── Navigation ────────────────────────────────────────────────────────────
  menu: "Menu", help: "Help", preview: "Preview", exportPDF: "Export PDF",
  backToEdit: "Back to Edit", loadTrip: "Load trip", reset: "Reset",
  resetConfirm: "Clear everything and start over?",
  language: "Language", region: "Region", moreRegions: "More regions",
  exchangeRate: "Rate", currencyMode: "Input mode",
  primaryCurrency: "Primary currency", secondaryCurrency: "Secondary currency",
  inputCurrency: "Input currency", localCurrency: "Local currency",
  useLocalCurrency: "Edit local", useIDR: "Edit IDR",
  useRegionalCurrency: "Use regional currency", currencySwitcher: "Currency",
  editLocal: "Edit {code}", editIDR: "Edit IDR",
  account: "Account", preferences: "Preferences", tools: "Tools",

  // ── Setup ─────────────────────────────────────────────────────────────────
  setupTitle: "Plan a new trip",
  setupSubtitle: "Fill in the basics, choose your region, then start planning.",
  setupStep: "Setup",
  tripDetailsSection: "Trip details",
  tripDetailsSubtitle: "These appear at the top of every printed itinerary.",
  clientName: "Client Name", clientNamePlaceholder: "e.g. Aiko Tanaka & Family",
  destinations: "Destinations", destinationsPlaceholder: "e.g. Osaka — Kyoto — Tokyo",
  startDate: "Start Date", endDate: "End Date",
  duration: "Duration", durationAuto: "(auto-calculated)",
  durationPlaceholder: "e.g. 8 Days 7 Nights",
  pickStartDate: "Pick start date", pickEndDate: "Pick end date",
  startPlanning: "Start Planning",
  pickRegionFirst: "Select a region to continue.",
  whereTrip: "Where are you planning a trip?",
  whereSubtitle: "Pick a region — it sets the local currency and transport options.",

  // ── Planner ───────────────────────────────────────────────────────────────
  whoAndWhere: "Who and where",
  preparedFor: "Prepared for",
  clientNameField: "Client name",
  dayByDay: "Day-by-day plan",
  itinerarySection: "02 — Itinerary Planner",
  overviewSection: "03 — Travel Overview",

  // ── Table ─────────────────────────────────────────────────────────────────
  addRow: "+ Add row",
  noStops: "No stops yet. Click + Add row to start planning.",
  stopsCount: "{count} stops", stopCount: "{count} stop",
  day: "Day", date: "Date", time: "Time", city: "City",
  destination: "Destination", destinationPlaceholder: "Place name",
  from: "From", to: "To", transport: "Transport",
  category: "Category", notes: "Notes", budget: "Budget",
  links: "Links", actions: "Actions",
  insertAbove: "Insert above", insertBelow: "Insert below", deleteRow: "Delete row",
  mapLink: "📍 Map", routeLink: "🗺 Route",
  viewMap: "View on Google Maps", openRoute: "Open Route",
  viewFlights: "Search Flights", ticketBooking: "Book Ticket",
  bothCurrenciesEditable: "Both {local} and IDR are editable — change one and the other updates.",
  idrOnly: "Budget is in IDR.",
  budgetDisabledHint: "This field is auto-calculated.",

  // ── Categories ────────────────────────────────────────────────────────────
  catHotel: "Hotel", catFood: "Food", catAttraction: "Attraction",
  catActivity: "Activity", catTransport: "Transport",

  // ── Charts ────────────────────────────────────────────────────────────────
  budgetAtAGlance: "Budget at a glance", totalBudget: "Total budget",
  transportUsage: "Transport usage", budgetPerCategory: "Budget per category",
  leg: "leg", legs: "legs", inLocalCurrency: "In your local trip currency",
  addTransportToChart: "Pick a transport mode to see this chart.",
  addBudgetToChart: "Add budget amounts to see this chart.",

  // ── Plan system ───────────────────────────────────────────────────────────
  yourPlan: "Your plan", free: "Free", lite: "Lite", pro: "Pro",
  upgradeToPro: "Upgrade to Pro",
  redeemCode: "Enter redeem code", redeemApply: "Apply Code",
  redeemPlaceholder: "e.g. BE-3DAYSTRIAL", redeemChecking: "Checking…",
  redeemSuccess: "Plan activated successfully!",
  redeemError: "Invalid or expired code. Check for typos.",
  redeemNeedCode: "Need a code? Chat us on WhatsApp",
  lockedTitle: "Unlock the Planner",
  lockedBody: "Enter a redeem code or upgrade your plan to start creating itineraries.",
  enterCode: "Enter Redeem Code", startPlanningBtn: "Start Planning →",
  planFeatLite1: "Up to 3 itineraries", planFeatLite2: "Up to 20 rows per trip",
  planFeatLite3: "PDF export enabled", planFeatLite4: "Cloud save enabled",
  planFeatPro1: "Unlimited itineraries", planFeatPro2: "Unlimited rows",
  planFeatPro3: "Premium PDF export", planFeatPro4: "All analytics & charts",
  planFeatPro5: "Priority support",
  planActivatedUntil: "Valid until {date}",

  // ── CTA ───────────────────────────────────────────────────────────────────
  needHelp: "Need help arranging this trip?",
  ctaSubtitle: "Backpackervun handles everything.",
  chatWA: "Chat on WhatsApp", requestTrip: "Request Custom Trip",
  freeConsult: "Free consultation · No hidden fees",
  serviceHotels: "🏨 Hotels & accommodations",
  serviceTransport: "🚆 Transport & JR Pass",
  serviceFlights: "✈️ Flights & transfers",
  serviceVisa: "📄 Visa assistance",
  serviceItinerary: "🗺️ Custom itinerary",
  serviceArrangement: "🎌 Full arrangement",
  contactUs: "Contact Us",

  // ── Footer ────────────────────────────────────────────────────────────────
  termsOfUse: "Terms", privacyPolicy: "Privacy", contact: "Contact",

  // ── Trips ─────────────────────────────────────────────────────────────────
  savedTrips: "Saved trips",
  noSavedTrips: "No saved trips yet. Click Save to save your current trip.",
  savedOn: "Saved {date}", deleteTrip: "Delete trip",
  deleteTripConfirm: "Delete this trip? This cannot be undone.",
  loadingTrips: "Loading trips…",
  couldNotLoad: "Could not load trips. Check your connection.",

  // ── Preview / PDF ─────────────────────────────────────────────────────────
  previewTitle: "Preview", previewHint: "Select 'Save as PDF' in the print dialog.",
  previewLabel: "Preview",
  preparedForClient: "Prepared for client",
  itinerary: "Itinerary", tripSummary: "Trip Summary",
  noItinerary: "No itinerary entries yet.",
  totalStops: "Total stops", totalDays: "Total days",
  conversionRate: "Rate", byCategory: "By category",
  pdfFooter: "Planned with Backpackervun · backpackervun.com",
  preparedWith: "Planned with Backpackervun · backpackervun.com",

  // ── Misc ──────────────────────────────────────────────────────────────────
  unsavedChanges: "Unsaved changes",
};
export default en;
