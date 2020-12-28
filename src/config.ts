export const DBPATH = process.env.DBPATH || './tmp/test.db';
export const SECRET = process.env.SECRET || 'very secret';
export const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 1 *24*60*60*1000; // 1 day in ms
export const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 1 *24*60*60*1000; // 1 day in ms
export const PORT = parseInt(process.env.PORT) || 8099;
export const ADDRESS = process.env.ADDRESS || "127.0.0.1";

// These are used to limit registrations to around 5 per 10 minutes per IP
export const REGISTER_MAX_PER_IP = parseInt(process.env.REGISTER_MAX_PER_IP) || 5;
export const REGISTER_MAX_TIMEOUT = parseInt(process.env.REGISTER_MAX_TIMEOUT) || 1000*60*10;

export const GUEST_PREFIX = process.env.GUEST_PREFIX || "Guest_";
export const GUEST_SAMPLE_TODO = process.env.GUEST_SAMPLE_TODO ||
`+work finish important project
+work find the fridge burglar
x +work start important project
+home replace light bulb
buy a new notebook
x buy a new pen
x take out the trash`

export const URL_PREFIX = process.env.URL_PREFIX || "";

// Defining both of these adds a return button to the navbar 
export const PARENT_SITE_NAME = process.env.PARENT_SITE_NAME || null;
export const PARENT_SITE_PATH = process.env.PARENT_SITE_PATH || null;
