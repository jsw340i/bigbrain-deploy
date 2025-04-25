import { render, screen, fireEvent } from '@testing-library/react';
import MyButton from '../MyButton'; // Adjust based on your file structure

describe('MyButton Component', () => {
  test('renders the button with correct label', () => {
    render(<MyButton label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('fires the onClick handler when clicked', () => {
    const onClickMock = vi.fn(); 
    render(<MyButton label="Click Me" onClick={onClickMock} />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
