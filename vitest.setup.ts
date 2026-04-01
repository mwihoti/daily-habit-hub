import '@testing-library/jest-dom';

// Stub Next.js font loaders (they run network calls at build time, not in tests)
vi.mock('next/font/google', () => {
  const mockFont = () => ({ className: 'mock-font', variable: '--mock-font', style: { fontFamily: 'mock' } });
  return {
    Space_Grotesk: mockFont,
    Nunito:        mockFont,
    Inter:         mockFont,
    Roboto:        mockFont,
  };
});

// ── Stub browser APIs used by wagmi / RainbowKit ─────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Silence Next.js router warnings inside tests
vi.mock('next/navigation', () => ({
  useRouter:       vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams:       vi.fn().mockReturnValue({}),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  usePathname:     vi.fn().mockReturnValue('/'),
}));

// Stub Supabase client — tests for the UI layer; DB calls are mocked per-test
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    storage: {
      from: () => ({
        upload:       vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      }),
    },
  }),
}));

// Stub wagmi hooks
vi.mock('wagmi', () => ({
  useAccount:       () => ({ address: undefined, isConnected: false }),
  useReadContract:  () => ({ data: undefined, isLoading: false }),
  useWriteContract: () => ({ writeContract: vi.fn(), isPending: false }),
  useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
  WagmiProvider:    ({ children }: { children: React.ReactNode }) => children,
  http:             vi.fn().mockReturnValue({}),
  createConfig:     vi.fn().mockReturnValue({}),
}));

// Stub RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => null,
  getDefaultConfig: vi.fn().mockReturnValue({}),
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => children,
}));
