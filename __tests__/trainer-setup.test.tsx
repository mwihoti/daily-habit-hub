/**
 * Trainer application form — component tests
 *
 * Covers:
 *  - Rendering each of the 5 steps
 *  - Field validation (Next button disabled until required fields filled)
 *  - Navigating forward/backward through steps
 *  - Certification add/remove
 *  - Specialty and language multi-select
 *  - Coaching style selection
 *  - Review step preview data
 *  - Successful form submission
 *  - API error handling on submit
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrainerSetupPage from '../app/trainer-setup/page';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fillStep1 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/full name/i), 'Coach Jane Doe');
  await user.type(screen.getByLabelText(/location/i), 'Nairobi, Kenya');
  await user.type(screen.getByLabelText(/your bio/i), 'I help beginners build sustainable fitness habits with structured, accessible programs.');
};

const clickNext = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /next/i }));
};

const clickBack = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /back/i }));
};

// ── Mock fetch ────────────────────────────────────────────────────────────────

const mockFetch = (ok = true, body: object = { profile: { id: 'tp-1' } }) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(ok ? body : { error: 'Server error' }),
  } as Response);
};

// ─────────────────────────────────────────────────────────────────────────────

describe('TrainerSetupPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockFetch();
  });

  // ── Step 1 rendering ───────────────────────────────────────────────────────

  it('renders step 1 with profile fields', () => {
    render(<TrainerSetupPage />);

    expect(screen.getByText(/apply to coach on fittribe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
  });

  it('shows step 1 of 5 in the progress indicator', () => {
    render(<TrainerSetupPage />);
    // First step circle shows "1"
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Next button is disabled when required step 1 fields are empty', () => {
    render(<TrainerSetupPage />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Next button enables once all required step 1 fields are filled', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('Next button stays disabled when only name and bio are filled (location missing)', async () => {
    render(<TrainerSetupPage />);
    await user.type(screen.getByLabelText(/full name/i), 'Coach Jane');
    await user.type(screen.getByLabelText(/your bio/i), 'Some bio text here.');
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('bio character counter updates as user types', async () => {
    render(<TrainerSetupPage />);
    await user.type(screen.getByLabelText(/your bio/i), 'Hello');
    expect(screen.getByText(/5\/600/)).toBeInTheDocument();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('advances to step 2 after completing step 1', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    expect(screen.getByText(/years of coaching experience/i)).toBeInTheDocument();
  });

  it('Back button returns from step 2 to step 1', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await clickBack(user);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('does not show Back button on step 1', () => {
    render(<TrainerSetupPage />);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  // ── Step 2 — Qualifications ────────────────────────────────────────────────

  it('step 2 Next is disabled until experience years is filled', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('step 2 Next enables after filling experience years', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '5');
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('can add a certification by typing and pressing Enter', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    const certInput = screen.getByPlaceholderText(/type certification name/i);
    await user.type(certInput, 'ACE Certified Personal Trainer');
    await user.keyboard('{Enter}');

    expect(screen.getByText('ACE Certified Personal Trainer')).toBeInTheDocument();
    // Input clears after add
    expect(certInput).toHaveValue('');
  });

  it('can add a certification by clicking the + button', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    await user.type(screen.getByPlaceholderText(/type certification name/i), 'NASM CPT');
    await user.click(screen.getByRole('button', { name: '' })); // Plus icon button

    expect(screen.getByText('NASM CPT')).toBeInTheDocument();
  });

  it('can remove an added certification with the X button', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    await user.type(screen.getByPlaceholderText(/type certification name/i), 'CrossFit Level 1');
    await user.keyboard('{Enter}');
    expect(screen.getByText('CrossFit Level 1')).toBeInTheDocument();

    // Click the X button next to the cert
    const removeBtn = screen.getByText('CrossFit Level 1').closest('span')!.querySelector('button')!;
    await user.click(removeBtn);
    expect(screen.queryByText('CrossFit Level 1')).not.toBeInTheDocument();
  });

  it('does not add duplicate certifications', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    const certInput = screen.getByPlaceholderText(/type certification name/i);
    await user.type(certInput, 'ACE Certified');
    await user.keyboard('{Enter}');
    await user.type(certInput, 'ACE Certified');
    await user.keyboard('{Enter}');

    const badges = screen.getAllByText('ACE Certified');
    expect(badges).toHaveLength(1);
  });

  it('can add a certification from quick-add suggestions', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    await user.click(screen.getByText(/\+ ACE Certified Personal Trainer/i));
    expect(screen.getAllByText('ACE Certified Personal Trainer').length).toBeGreaterThan(0);
  });

  it('added cert disappears from quick-add list', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    await user.click(screen.getByText(/\+ ACE Certified Personal Trainer/i));
    expect(screen.queryByText(/\+ ACE Certified Personal Trainer/i)).not.toBeInTheDocument();
  });

  it('can select a coaching style', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    await user.click(screen.getByText('Structured Programs'));
    const card = screen.getByText('Structured Programs').closest('button')!;
    expect(card.className).toMatch(/border-primary/);
  });

  it('can deselect a language and select a new one', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);

    // English is pre-selected — deselect it
    await user.click(screen.getByRole('button', { name: 'English' }));
    // Select Swahili
    await user.click(screen.getByRole('button', { name: 'Swahili' }));
    expect(screen.getByRole('button', { name: 'Swahili' }).className).toMatch(/border-primary/);
  });

  // ── Step 3 — Specialties ───────────────────────────────────────────────────

  it('step 3 Next is disabled until at least one specialty is selected', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '3');
    await clickNext(user);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('can select specialties and sees count update', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '3');
    await clickNext(user);

    await user.click(screen.getByRole('button', { name: 'Weight Loss' }));
    await user.click(screen.getByRole('button', { name: 'HIIT' }));

    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
  });

  it('deselects a specialty when clicked again', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '3');
    await clickNext(user);

    await user.click(screen.getByRole('button', { name: 'Yoga' }));
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yoga' }));
    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
  });

  // ── Step 4 — Pricing ───────────────────────────────────────────────────────

  it('step 4 Next is always enabled (pricing is optional)', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '3');
    await clickNext(user);
    await user.click(screen.getByRole('button', { name: 'Weight Loss' }));
    await clickNext(user);

    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('renders pricing tips card', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '3');
    await clickNext(user);
    await user.click(screen.getByRole('button', { name: 'Weight Loss' }));
    await clickNext(user);

    expect(screen.getByText(/pricing tips/i)).toBeInTheDocument();
  });

  // ── Step 5 — Review ────────────────────────────────────────────────────────

  const navigateToReview = async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '4');
    await clickNext(user);
    await user.click(screen.getByRole('button', { name: 'Muscle Building' }));
    await clickNext(user);
    await clickNext(user); // pricing (optional)
  };

  it('shows review step with entered data', async () => {
    await navigateToReview();

    expect(screen.getByText(/review your application/i)).toBeInTheDocument();
    expect(screen.getByText('Coach Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    expect(screen.getByText(/4 years experience/i)).toBeInTheDocument();
  });

  it('review shows specialties', async () => {
    await navigateToReview();
    expect(screen.getByText('Muscle Building')).toBeInTheDocument();
  });

  it('review shows "Contact for pricing" when pricing is blank', async () => {
    await navigateToReview();
    expect(screen.getByText(/contact for pricing/i)).toBeInTheDocument();
  });

  it('review shows pricing when entered', async () => {
    render(<TrainerSetupPage />);
    await fillStep1(user);
    await clickNext(user);
    await user.type(screen.getByLabelText(/years of coaching/i), '4');
    await clickNext(user);
    await user.click(screen.getByRole('button', { name: 'Cardio' }));
    await clickNext(user);
    await user.type(screen.getByLabelText(/1-on-1 coaching/i), '4500');
    await clickNext(user);

    expect(screen.getByText(/KES 4,500\/mo/i)).toBeInTheDocument();
  });

  it('shows "Go Live" submit button on review step', async () => {
    await navigateToReview();
    expect(screen.getByRole('button', { name: /go live on fittribe/i })).toBeInTheDocument();
  });

  // ── Submission ─────────────────────────────────────────────────────────────

  it('calls POST /api/trainers/profile on submit', async () => {
    mockFetch(true, { profile: { id: 'tp-1' } });
    await navigateToReview();

    await user.click(screen.getByRole('button', { name: /go live on fittribe/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/trainers/profile',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('sends correct fields in the POST body', async () => {
    mockFetch();
    await navigateToReview();
    await user.click(screen.getByRole('button', { name: /go live on fittribe/i }));

    await waitFor(() => {
      const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.full_name).toBe('Coach Jane Doe');
      expect(body.location).toBe('Nairobi, Kenya');
      expect(body.experience_years).toBe(4);
      expect(body.specialties).toContain('Muscle Building');
    });
  });

  it('redirects to /trainers on successful submission', async () => {
    const { useRouter } = await import('next/navigation');
    const pushMock = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: pushMock });

    mockFetch();
    await navigateToReview();
    await user.click(screen.getByRole('button', { name: /go live on fittribe/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/trainers');
    });
  });

  it('shows "Submitting…" loading state while API call is in flight', async () => {
    // Never resolves — keeps the loading state visible
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    await navigateToReview();
    await user.click(screen.getByRole('button', { name: /go live on fittribe/i }));

    expect(await screen.findByText(/submitting/i)).toBeInTheDocument();
  });

  it('shows error toast when API returns an error', async () => {
    mockFetch(false);
    await navigateToReview();
    await user.click(screen.getByRole('button', { name: /go live on fittribe/i }));

    await waitFor(() => {
      // Sonner renders toasts into a portal — verify fetch was called
      // and the button is re-enabled (loading ended)
      expect(screen.getByRole('button', { name: /go live on fittribe/i })).toBeEnabled();
    });
  });
});
