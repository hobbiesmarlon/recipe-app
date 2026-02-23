import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { DesktopNav } from '../DesktopNav';
import { useAuthStore } from '../../store/useAuthStore';

// Mock the auth store
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('DesktopNav', () => {
  it('renders correctly for guests', () => {
    (useAuthStore as any).mockReturnValue({ user: null });
    
    render(
      <BrowserRouter>
        <DesktopNav />
      </BrowserRouter>
    );

    expect(screen.getByText('Recipefy')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search recipes/)).toBeInTheDocument();
    // Guest profile icon (default svg)
    expect(screen.getByRole('link', { name: '' })).toBeInTheDocument(); 
  });

  it('renders correctly for logged in users', () => {
    (useAuthStore as any).mockReturnValue({ 
      user: { display_name: 'John Doe', profile_picture_url: 'test.jpg' } 
    });
    
    render(
      <BrowserRouter>
        <DesktopNav />
      </BrowserRouter>
    );

    const profileImg = screen.getByAltText('John Doe');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', 'test.jpg');
  });

  it('updates search query on input change', () => {
    (useAuthStore as any).mockReturnValue({ user: null });
    
    render(
      <BrowserRouter>
        <DesktopNav />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/Search recipes/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'chicken' } });
    expect(input.value).toBe('chicken');
  });
});
