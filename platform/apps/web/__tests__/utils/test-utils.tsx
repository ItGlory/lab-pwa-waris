import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Custom render function that wraps components with providers
 */
interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <>
      {/* Add your providers here (Theme, Auth, etc.) */}
      {children}
    </>
  );
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Override render method
export { customRender as render };
