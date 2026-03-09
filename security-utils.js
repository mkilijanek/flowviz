import dns from 'node:dns/promises';
import net from 'node:net';
import rateLimit from 'express-rate-limit';
import { logger } from './src/shared/utils/logger.js';

function normalizeAddress(address) {
  const normalized = address.toLowerCase();
  return normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
}

function isPrivateOrUnsafeIp(address) {
  const normalized = normalizeAddress(address);
  const ipVersion = net.isIP(normalized);

  if (!ipVersion) {
    return false;
  }

  if (ipVersion === 4) {
    if (normalized === '127.0.0.1') {
      return 'Localhost access is not allowed';
    }
    if (/^10\./.test(normalized) || /^192\.168\./.test(normalized) || /^172\.(1[6-9]|2\d|3[01])\./.test(normalized)) {
      return 'Private IP ranges are not allowed';
    }
    if (/^(0\.|169\.254\.|224\.|240\.)/.test(normalized)) {
      return 'Invalid IP range';
    }
    return false;
  }

  if (['::1', '::', '0:0:0:0:0:0:0:1'].includes(normalized)) {
    return 'Localhost access is not allowed';
  }
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return 'Private IP ranges are not allowed';
  }
  if (normalized.startsWith('fe80:')) {
    return 'Invalid IP range';
  }
  if (normalized.startsWith('ff')) {
    return 'Invalid IP range';
  }

  return false;
}

function validateHostname(hostname) {
  const normalized = hostname.toLowerCase();

  if (['localhost', '::1', '[::1]'].includes(normalized)) {
    throw new Error('Localhost access is not allowed');
  }

  const unsafeIpMessage = isPrivateOrUnsafeIp(normalized);
  if (unsafeIpMessage) {
    throw new Error(unsafeIpMessage);
  }
}

// Shared URL validation to prevent SSRF attacks
export function validateUrl(urlString) {
  try {
    const url = new URL(urlString);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    validateHostname(url.hostname);
    return url;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}

export async function resolveAndValidateUrl(urlString, lookup = dns.lookup) {
  const url = validateUrl(urlString);

  if (net.isIP(url.hostname)) {
    return url;
  }

  try {
    const results = await lookup(url.hostname, { all: true, verbatim: true });
    if (!results.length) {
      throw new Error('Hostname did not resolve to any addresses');
    }

    for (const result of results) {
      const unsafeIpMessage = isPrivateOrUnsafeIp(result.address);
      if (unsafeIpMessage) {
        throw new Error(unsafeIpMessage);
      }
    }

    return url;
  } catch (error) {
    if (error.message.includes('Localhost access is not allowed') || error.message.includes('Private IP ranges are not allowed') || error.message.includes('Invalid IP range')) {
      throw new Error(`Invalid URL: ${error.message}`);
    }

    throw new Error(`Invalid URL: DNS resolution failed for ${url.hostname}`);
  }
}

// Shared secure fetch with common security headers and limits
export async function secureFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);
  
  const defaultHeaders = {
    'User-Agent': 'FlowViz/1.0 (+https://github.com/flowviz/flowviz)',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
  };
  
  try {
    const response = await fetch(url.href, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      signal: controller.signal,
      size: options.maxSize || 10 * 1024 * 1024, // 10MB default limit
    });
    
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// Rate limiting configurations
export const createRateLimit = (options) => rateLimit({
  windowMs: options.windowMs,
  max: options.max,
  message: {
    error: options.message
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Predefined rate limits with environment variable support
export const rateLimits = {
  articles: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_ARTICLES) || 10,
    message: 'Too many article fetch requests from this IP, please try again later.'
  }),
  
  images: createRateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes  
    max: parseInt(process.env.RATE_LIMIT_IMAGES) || 50,
    message: 'Too many image fetch requests from this IP, please try again later.'
  }),
  
  streaming: createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: parseInt(process.env.RATE_LIMIT_STREAMING) || 5, // Very strict for expensive AI calls
    message: 'Too many streaming analysis requests from this IP, please try again later.'
  })
};

// Common error handler for fetch operations
export function handleFetchError(error, context = 'resource') {
  logger.error(`Error fetching ${context}:`, error);
  
  if (error.name === 'AbortError') {
    return { status: 408, error: 'Request timeout' };
  }
  
  if (error.message.includes('Invalid URL')) {
    return { status: 400, error: error.message };
  }
  
  if (error.code === 'ENOTFOUND') {
    return { status: 404, error: `${context} not found` };
  }
  
  return { 
    status: 500, 
    error: `Failed to fetch ${context}`, 
    details: error.message 
  };
}
