import '@testing-library/jest-dom'

import { jest } from '@jest/globals'

// Mock next/navigation for client components/tests
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation') as Record<
    string,
    unknown
  >
  return {
    // Preserve actual exports
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: jest.fn(),
    notFound: jest.fn(),
  }
})

// Optional polyfills or globals for tests can go here.
