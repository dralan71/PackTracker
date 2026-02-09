import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    custom: vi.fn(),
  },
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe('ToastContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export customToast functions', async () => {
    const { customToast } = await import('../ToastContext');
    expect(customToast).toBeDefined();
    expect(typeof customToast.addItem).toBe('function');
    expect(typeof customToast.increaseQuantity).toBe('function');
    expect(typeof customToast.removeItem).toBe('function');
    expect(typeof customToast.addBaggage).toBe('function');
    expect(typeof customToast.deleteBaggage).toBe('function');
    expect(typeof customToast.clearAll).toBe('function');
    expect(typeof customToast.exportCSV).toBe('function');
    expect(typeof customToast.importCSV).toBe('function');
  });

  it('should call toast.custom when customToast functions are used', async () => {
    const { toast } = await import('react-hot-toast');
    const { customToast } = await import('../ToastContext');

    customToast.addItem('Test Item', 'PiCube');
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );

    customToast.addBaggage('carry-on');
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );

    customToast.removeItem('Test Item');
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );
  });
});

describe('App with Toaster', () => {
  it('should render Toaster component', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
