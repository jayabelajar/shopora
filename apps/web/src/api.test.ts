import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, assetUrl, idr } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('formats integer amounts as Indonesian rupiah', () => expect(idr(1500000)).toMatch(/Rp\s?1\.500\.000/));

  it('returns the server error message and code', async () => {
    vi.stubGlobal('document',{cookie:''});
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({success:false,error:{code:'INVALID_CREDENTIALS',message:'Email or password is incorrect'}}),{status:401,headers:{'Content-Type':'application/json'}})));
    await expect(api('/auth/login',{method:'POST',body:'{}'})).rejects.toMatchObject({status:401,code:'INVALID_CREDENTIALS',message:'Email or password is incorrect'});
  });

  it('turns connection failures into a useful error', async () => {
    vi.stubGlobal('document',{cookie:''});
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(api('/auth/me')).rejects.toEqual(expect.objectContaining({status:0,code:'NETWORK_ERROR'}));
  });

  it('resolves uploaded assets against the active application origin', () => {
    vi.stubGlobal('window',{location:{origin:'https://shopora.test'}});
    expect(assetUrl('/uploads/product.webp')).toBe('https://shopora.test/uploads/product.webp');
  });
});
