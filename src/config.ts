export const DBPATH = process.env.DBPATH || './tmp/test.db';
export const SECRET = process.env.SECRET || 'very secret';
export const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 1 *24*60*60*1000; // 1 day in ms
export const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 1 *24*60*60*1000; // 1 day in ms
export const PORT = parseInt(process.env.PORT) || 8080;

// These are used to limit registrations to around 5 per 10 minutes per IP
export const REGISTER_MAX_PER_IP = parseInt(process.env.REGISTER_MAX_PER_IP) || 5;
export const REGISTER_MAX_TIMEOUT = parseInt(process.env.REGISTER_MAX_TIMEOUT) || 1000*60*10;
