import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard, Recipe } from '../RecipeCard';

const mockRecipe: Recipe = {
  id: '1',
  title: 'Delicious Tacos',
  description: 'Mexican street style tacos with spicy salsa.',
  meta: '20 min · 2 servings',
  image: 'test.jpg',
  images: [{ url: 'test.jpg', type: 'image' }]
};

describe('RecipeCard', () => {
  it('renders recipe details correctly', () => {
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        isLiked={false} 
        onToggleLike={() => {}} 
        onClick={() => {}}
        onShare={() => {}}
      />
    );

    expect(screen.getByText('Delicious Tacos')).toBeInTheDocument();
    expect(screen.getByText(/Mexican street style/)).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.getByText('2 servings')).toBeInTheDocument();
  });

  it('calls onToggleLike when heart button is clicked', () => {
    const onToggleLike = vi.fn();
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        isLiked={false} 
        onToggleLike={onToggleLike} 
        onClick={() => {}}
        onShare={() => {}}
      />
    );

    const likeButton = screen.getByRole('button', { name: /toggle like/i });
    fireEvent.click(likeButton);
    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });

  it('calls onShare when share button is clicked', () => {
    const onShare = vi.fn();
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        isLiked={false} 
        onToggleLike={() => {}} 
        onClick={() => {}}
        onShare={onShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: /share recipe/i });
    fireEvent.click(shareButton);
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        isLiked={false} 
        onToggleLike={() => {}} 
        onClick={onClick}
        onShare={() => {}}
      />
    );

    // The card root is the clickable element
    const card = screen.getByText('Delicious Tacos').closest('div[class*="cursor-pointer"]');
    if (card) fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
