import React from 'react';
import { TestimonialCardBlock as TestimonialCardBlockType } from '../../../types/blocks.ts';

interface TestimonialCardBlockProps {
  block: TestimonialCardBlockType;
}

export const TestimonialCardBlock: React.FC<TestimonialCardBlockProps> = ({ block }) => {
  const quote = block?.quote || "Testimonial goes here.";
  const author = block?.author || "Anonymous";
  const photoUrl = block?.photoUrl;
  const logoUrl = block?.logoUrl;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <p className="italic">"{quote}"</p>
      <div className="flex items-center mt-4">
        {photoUrl && <img src={photoUrl} alt={author} className="w-12 h-12 rounded-full mr-4" />}
        <div>
          <p className="font-bold">{author}</p>
          {logoUrl && <img src={logoUrl} alt="author company logo" className="h-6 mt-1" />}
        </div>
      </div>
    </div>
  );
};
