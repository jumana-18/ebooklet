import { BOOKS } from '../constants';
import { BookCard } from './BookCard';
import { useNavigate } from 'react-router-dom';

export const TrendingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6">
      <div className="px-6 flex items-center justify-between mb-5">
        <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">Popular Ebooks 🍃</h2>
        <button 
          onClick={() => navigate('/category/trending')}
          className="text-xs font-sans text-earth-brown/60 dark:text-dark-muted font-medium"
        >
          View all
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6">
        {BOOKS.filter(book => book.bookType === 'ebook').slice(0, 10).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};
