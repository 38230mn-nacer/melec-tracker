/** En-têtes de sécurité + CORS restreint aux appels de même origine. */
export async function onRequest({ request, next, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: enTetesCors(request, env) });
  }
  const reponse = await next();
  const sortie = new Response(reponse.body, reponse);
  for (const [k, v] of Object.entries(enTetesCors(request, env))) sortie.headers.set(k, v);
  sortie.headers.set('X-Content-Type-Options', 'nosniff');
  sortie.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return sortie;
}

function enTetesCors(request, env) {
  const origine = request.headers.get('Origin');
  const autorisee = env?.SITE_URL || new URL(request.url).origin;
  if (!origine || origine !== autorisee) return {};
  return {
    'Access-Control-Allow-Origin': origine,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
