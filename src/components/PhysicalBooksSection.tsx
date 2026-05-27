import { BOOKS } from '../constants';
import { BookCard } from './BookCard';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const PhysicalBooksSection = () => {
  const navigate = useNavigate();

  // Filter books of physical bookType
  const physicalBooks = BOOKS.filter((book) => book.bookType === 'physical');

  return (
    <section className="py-8 bg-zinc-500/[0.02] border-y border-earth-brown/[0.02] dark:border-white/[0.02] transition-colors rounded-[3rem] my-4 mx-4 px-2">
      <div className="px-4 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-earth-brown dark:text-dark-text flex items-center gap-2">
            <BookOpen size={20} className="text-moss-green" />
            Physical Printed Classics 📚
          </h2>
          <p className="text-xs text-earth-brown/50 dark:text-dark-muted font-sans font-medium mt-1">
            Real paper pages, crafted binding, and realm-wide shipping directly to your sanctuary door.
          </p>
        </div>
        <button 
          onClick={() => navigate('/category/all')}
          className="text-xs font-sans text-moss-green font-bold uppercase tracking-wider self-start md:self-center hover:underline cursor-pointer"
        >
          View Printed Books ({physicalBooks.length}) &rarr;
        </button>
      </div>
      
      <div className="flex gap-5 overflow-x-auto hide-scrollbar px-4 pb-4">
        {physicalBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};
