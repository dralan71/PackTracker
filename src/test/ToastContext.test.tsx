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
    expect(toast.custom).toHaveBeenCalledTimes(1);
    expect(toast.custom).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );
    const firstRenderToast = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const firstToastView = render(firstRenderToast({}));
    expect(screen.getByText("Added item: 'Test Item'")).toBeInTheDocument();
    expect(firstToastView.container.firstChild).toHaveClass('toast--success');
    firstToastView.unmount();

    customToast.addBaggage('carry-on');
    expect(toast.custom).toHaveBeenCalledTimes(2);
    expect(toast.custom).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );
    const secondRenderToast = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[1][0];
    const secondToastView = render(secondRenderToast({}));
    expect(screen.getByText('Added new baggage: carry on')).toBeInTheDocument();
    expect(secondToastView.container.firstChild).toHaveClass('toast--success');
    secondToastView.unmount();

    customToast.removeItem('Test Item');
    expect(toast.custom).toHaveBeenCalledTimes(3);
    expect(toast.custom).toHaveBeenNthCalledWith(
      3,
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );
    const thirdRenderToast = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[2][0];
    const thirdToastView = render(thirdRenderToast({}));
    expect(screen.getByText("Removed item: 'Test Item'")).toBeInTheDocument();
    expect(thirdToastView.container.firstChild).toHaveClass('toast--success');
    thirdToastView.unmount();

    customToast.error('Something went wrong');
    expect(toast.custom).toHaveBeenCalledTimes(4);
    expect(toast.custom).toHaveBeenNthCalledWith(
      4,
      expect.any(Function),
      expect.objectContaining({ duration: 2500 })
    );
    const fourthRenderToast = (toast.custom as ReturnType<typeof vi.fn>).mock.calls[3][0];
    const fourthToastView = render(fourthRenderToast({}));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(fourthToastView.container.firstChild).toHaveClass('toast--error');
    fourthToastView.unmount();
  });
});

describe('App with Toaster', () => {
  it('should render Toaster component', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
});
