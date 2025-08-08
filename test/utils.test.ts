import { parseISODateParamToUTC, parseStringArrayParam } from '../src/utils';

describe('parseISODateParamToUTC', () => {
  it('should return undefined if param is not a string', () => {
    expect(parseISODateParamToUTC(undefined)).toBeUndefined();
    expect(parseISODateParamToUTC(123)).toBeUndefined();
    expect(parseISODateParamToUTC({})).toBeUndefined();
  });

  it('should return a Date object if the string is a valid ISO date', () => {
    const iso = new Date().toISOString();
    const encoded = encodeURIComponent(iso);
    const result = parseISODateParamToUTC(encoded);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe(iso);
  });

  it('should return undefined for an invalid ISO string', () => {
    const encoded = encodeURIComponent('not-a-date');
    expect(parseISODateParamToUTC(encoded)).toBeUndefined();
  });
});

describe('parseStringArrayParam', () => {
  it('should return array from comma-separated string', () => {
    expect(parseStringArrayParam('a,b,c')).toEqual(['a', 'b', 'c']);
    expect(parseStringArrayParam(' a , b , c ')).toEqual(['a', 'b', 'c']);
  });

  it('should remove empty strings and trim whitespace', () => {
    expect(parseStringArrayParam('a, , b,,c ,')).toEqual(['a', 'b', 'c']);
  });

  it('should return undefined if input is not string or array', () => {
    expect(parseStringArrayParam(123)).toBeUndefined();
    expect(parseStringArrayParam(null)).toBeUndefined();
    expect(parseStringArrayParam(undefined)).toBeUndefined();
  });

  it('should process array of strings and filter/trim', () => {
    expect(parseStringArrayParam(['x', ' y ', ' ', '', 'z'])).toEqual(['x', 'y', 'z']);
  });

  it('should ignore non-string items in array', () => {
  expect(parseStringArrayParam(['a', 123 as any, 'b'])).toEqual(['a', 'b']);
  expect(parseStringArrayParam(['a', null as any, 'b'])).toEqual(['a', 'b']);
});

  it('should return empty array if all entries are empty or non-strings', () => {
    expect(parseStringArrayParam([null, undefined, '', '  '])).toEqual([]);
  });
});
