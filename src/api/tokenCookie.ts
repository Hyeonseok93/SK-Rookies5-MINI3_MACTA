const ACCESS_TOKEN_COOKIE = 'macta_access_token';

const isHttps = window.location.protocol === 'https:';

export function setAccessTokenCookie(token: string) {
  const maxAgeSeconds = 60 * 60;
  const secure = isHttps ? '; Secure' : '';

  document.cookie = [
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'SameSite=Lax',
    secure,
  ].join('; ');
}

export function getAccessTokenCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

export function clearAccessTokenCookie() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
