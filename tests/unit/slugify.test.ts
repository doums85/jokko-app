import { describe, it, expect } from 'vitest';
import { slugify, generateUniqueSlug } from '@/lib/utils/slugify';

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
    expect(slugify('multiple   spaces   here')).toBe('multiple-spaces-here');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('Acme Inc.')).toBe('acme-inc');
    expect(slugify('Test@#$%Company')).toBe('testcompany');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
    expect(slugify('---test---')).toBe('test');
  });

  it('should handle French characters and accents', () => {
    expect(slugify('Société Française')).toBe('socit-franaise');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle real-world company names', () => {
    expect(slugify('Acme Corporation Ltd.')).toBe('acme-corporation-ltd');
    expect(slugify('My Awesome Company, Inc.')).toBe('my-awesome-company-inc');
    expect(slugify('Tech & Solutions')).toBe('tech-solutions');
  });

  it('should replace multiple consecutive hyphens with single hyphen', () => {
    expect(slugify('hello---world')).toBe('hello-world');
    expect(slugify('test--company')).toBe('test-company');
  });
});

describe('generateUniqueSlug', () => {
  it('should append random suffix to base slug', () => {
    const baseSlug = 'test-company';
    const uniqueSlug = generateUniqueSlug(baseSlug);

    expect(uniqueSlug).toMatch(/^test-company-[a-z0-9]{6}$/);
  });

  it('should generate different slugs on consecutive calls', () => {
    const baseSlug = 'acme';
    const slug1 = generateUniqueSlug(baseSlug);
    const slug2 = generateUniqueSlug(baseSlug);

    expect(slug1).not.toBe(slug2);
    expect(slug1).toContain(baseSlug);
    expect(slug2).toContain(baseSlug);
  });

  it('should work with empty base slug', () => {
    const uniqueSlug = generateUniqueSlug('');
    expect(uniqueSlug).toMatch(/^-[a-z0-9]{6}$/);
  });
});
