const base = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(public status:number, message:string, public code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'ApiError';
  }
}
function cookie(name:string){return document.cookie.split('; ').find(v=>v.startsWith(`${name}=`))?.split('=')[1]??''}
async function parseResponse(response:Response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch { throw new ApiError(response.status, 'Server returned an invalid response', 'INVALID_RESPONSE'); }
}
async function request<T>(path:string, init:RequestInit):Promise<T> {
  let response:Response;
  try { response = await fetch(`${base}${path}`, init); }
  catch { throw new ApiError(0, 'Cannot connect to Shopora. Make sure the API and database are running.', 'NETWORK_ERROR'); }
  const json = await parseResponse(response);
  if (!response.ok) throw new ApiError(response.status, json.error?.message ?? 'Something went wrong', json.error?.code);
  return json.data as T;
}
export function api<T>(path:string, init:RequestInit={}) : Promise<T> {
  return request<T>(path,{...init,credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':decodeURIComponent(cookie('shopora_csrf')),...(init.headers??{})}});
}
export function uploadApi<T>(path:string,body:FormData):Promise<T>{
  return request<T>(path,{method:'POST',credentials:'include',headers:{'X-CSRF-Token':decodeURIComponent(cookie('shopora_csrf'))},body});
}
export function assetUrl(value?:string) {
  if (!value || /^(https?:|data:|blob:)/.test(value)) return value ?? '';
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  const origin = configured ? new URL(configured, window.location.origin).origin : window.location.origin;
  return new URL(value, origin).href;
}
export const idr=(value:string|number|bigint)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value));
