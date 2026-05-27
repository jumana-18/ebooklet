import { NEW_ARRIVALS } from '../constants';
import { BookCard } from './BookCard';
import { useNavigate } from 'react-router-dom';

export const NewArrivals = () => {
  const navigate = useNavigate();

  return (
    <section className="py-6 px-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-serif font-bold text-earth-brown dark:text-dark-text">New Ebook Arrivals 🍃</h2>
        <button 
          onClick={() => navigate('/category/new-arrivals')}
          className="text-xs font-sans text-earth-brown/60 dark:text-dark-muted font-medium"
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {NEW_ARRIVALS.filter(book => book.bookType === 'ebook').map((book) => (
          <BookCard key={book.id} book={book} variant="new-arrival" />
        ))}
      </div>
    </section>
  );
};
