import { render, screen, fireEvent } from '@testing-library/react';
import MyInput from '../MyInput';

describe('MyInput Component', () => {
  test('renders input with correct label', () => {
    render(<MyInput label="Enter Text" />);
    expect(screen.getByLabelText('Enter Text')).toBeInTheDocument();
  });

  test('updates the value when typing', () => {
    render(<MyInput label="Enter Text" />);
    const inputElement = screen.getByLabelText('Enter Text');
    fireEvent.change(inputElement, { target: { value: 'Test input' } });
    expect(inputElement.value).toBe('Test input');
  });
});
