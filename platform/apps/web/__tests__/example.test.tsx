import { describe, it, expect } from 'vitest';
import { render, screen } from './utils/test-utils';

/**
 * Example test file demonstrating Vitest + React Testing Library setup
 */

// Simple component for testing
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

describe('Example Tests', () => {
  it('should render greeting component', () => {
    render(<Greeting name="WARIS" />);
    expect(screen.getByText('Hello, WARIS!')).toBeInTheDocument();
  });

  it('should demonstrate basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect({ a: 1 }).toEqual({ a: 1 });
    expect([1, 2, 3]).toContain(2);
  });

  it('should demonstrate async testing', async () => {
    const fetchData = () => Promise.resolve('data');
    const result = await fetchData();
    expect(result).toBe('data');
  });
});

describe('DOM Testing', () => {
  it('should find elements by role', () => {
    render(<Greeting name="Developer" />);
    expect(screen.getByRole('heading')).toHaveTextContent('Hello, Developer!');
  });

  it('should handle element queries', () => {
    render(
      <div>
        <button>Click me</button>
        <input placeholder="Enter name" />
      </div>
    );

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });
});
