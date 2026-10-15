const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export class ApiError extends Error { constructor(public status:number, message:string){super(message)} }
export async function api<T>(path:string, init:RequestInit={}) : Promise<T> { const response=await fetch(`${base}${path}`,{credentials:'include',headers:{'Content-Type':'application/json',...(init.headers??{})},...init}); const json=await response.json(); if(!response.ok) throw new ApiError(response.status,json.error?.message??'Something went wrong'); return json.data as T; }
export const idr=(value:string|number|bigint)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value));

