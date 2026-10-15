import { describe, expect, it } from 'vitest';
import { idr } from './api';

describe('IDR formatter', () => {
  it('formats integer amounts as Indonesian rupiah', () => expect(idr(1500000)).toMatch(/Rp\s?1\.500\.000/));
});
