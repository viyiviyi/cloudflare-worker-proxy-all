
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let url = new URL(request.url);
  if (url.pathname == '/') {
    return new Response('not found', { status: 404 })
  }
  let lastHost = url.origin;
  url = new URL(url.href.substring(url.href.indexOf('http', 4)));

  let new_request_headers = new Headers(request.headers);
  new_request_headers.set('Host', url.host);
  new_request_headers.set('Orgin', url.origin);
  new_request_headers.set('Referer', '');
  new_request_headers.set('user-agent', '');
  [...new_request_headers.keys()].forEach(key => {
    new_request_headers.set(key, new_request_headers.get(key).replace(lastHost + '/', ''))
  })
  const modifiedRequest = new Request(url.toString(), {
    headers: new_request_headers,
    method: request.method,
    body: request.body,
    redirect: 'follow'
  });
  
  let response = new Response(null,{status:200});
  if (request.method == 'OPTIONS') response = new Response(null,{status:200});
  else response = await fetch(modifiedRequest);

  const modifiedResponse = new Response(response.body, response);

  // 添加允许跨域访问的响应头
  modifiedResponse.headers.set('Access-Control-Allow-Origin', "*");
  modifiedResponse.headers.set('cache-control', 'public, max-age=14400')
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
  modifiedResponse.headers.set('access-control-allow-credentials', 'true');
  modifiedResponse.headers.delete('content-security-policy');
  modifiedResponse.headers.delete('content-security-policy-report-only');
  modifiedResponse.headers.delete('clear-site-data');
  return modifiedResponse;
}
