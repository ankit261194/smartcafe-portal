// Central API Client Utility with JWT Bearer Authentication & Configurable Server Endpoint

export function getServerBaseUrl() {
  if (typeof window === 'undefined') return '';
  const custom = localStorage.getItem('cybercafe_server_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  // If running inside Capacitor Native or file/capacitor protocol
  if (
    window.Capacitor?.isNativePlatform?.() || 
    window.location.protocol === 'capacitor:' || 
    window.location.protocol === 'file:'
  ) {
    return 'https://smartcafe.sbs';
  }
  return '';
}

export function setServerBaseUrl(url) {
  if (typeof window === 'undefined') return;
  if (url && url.trim()) {
    localStorage.setItem('cybercafe_server_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('cybercafe_server_url');
  }
}

export function getAuthToken(preferredRoleOrUrl) {
  if (typeof window === 'undefined') return null;
  const superAdminToken = sessionStorage.getItem('superadmin_token');
  const cafeToken = localStorage.getItem('cafe_token');
  let customerToken = null;
  const customerData = localStorage.getItem('cybercafe_customer');
  if (customerData) {
    try {
      const parsed = JSON.parse(customerData);
      if (parsed.token) customerToken = parsed.token;
    } catch {}
  }

  if (typeof preferredRoleOrUrl === 'string') {
    if (preferredRoleOrUrl === 'superadmin' || preferredRoleOrUrl.startsWith('/api/superadmin')) {
      return superAdminToken || cafeToken || customerToken;
    }
    if (
      preferredRoleOrUrl === 'cafe' ||
      preferredRoleOrUrl.includes('/api/cashbook') ||
      preferredRoleOrUrl.includes('/api/udhar') ||
      preferredRoleOrUrl.includes('/api/cafes')
    ) {
      return cafeToken || superAdminToken || customerToken;
    }
    if (preferredRoleOrUrl === 'customer' || preferredRoleOrUrl.includes('/api/wallet')) {
      return customerToken || cafeToken || superAdminToken;
    }
  }

  // Check active mode saved in sessionStorage
  const activeMode = sessionStorage.getItem('active_mode');
  if (activeMode === 'superadmin') {
    return superAdminToken || cafeToken || customerToken;
  }
  if (activeMode === 'admin') {
    return cafeToken || superAdminToken || customerToken;
  }
  if (activeMode === 'customer') {
    return customerToken || cafeToken || superAdminToken;
  }

  return cafeToken || superAdminToken || customerToken;
}

export async function authFetch(url, options = {}) {
  const token = options.token || getAuthToken(options.role || url);
  const headers = { ...(options.headers || {}) };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const base = getServerBaseUrl();
  const fullUrl = (base && url.startsWith('/')) ? `${base}${url}` : url;

  return fetch(fullUrl, {
    ...options,
    headers
  });
}

// Automatically intercept relative fetch calls to /api/ on native Capacitor / mobile setups
if (typeof window !== 'undefined' && !window.__cybercafe_fetch_intercepted) {
  window.__cybercafe_fetch_intercepted = true;
  const originalFetch = window.fetch;
  window.fetch = function(resource, init) {
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      const base = getServerBaseUrl();
      if (base) {
        resource = `${base}${resource}`;
      }
    }
    return originalFetch.call(this, resource, init);
  };
}
