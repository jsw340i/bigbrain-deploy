import { render, screen, fireEvent } from '@testing-library/react';
import MyToggle from '../MyToggle';

describe('MyToggle Component', () => {
  test('renders button with "Off" initially', () => {
    render(<MyToggle />);
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  test('toggles to "On" when clicked', () => {
    render(<MyToggle />);
    fireEvent.click(screen.getByText('Off'));
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  test('toggles back to "Off" when clicked again', () => {
    render(<MyToggle />);
    fireEvent.click(screen.getByText('Off'));
    fireEvent.click(screen.getByText('On'));
    expect(screen.getByText('Off')).toBeInTheDocument();
  });
});
