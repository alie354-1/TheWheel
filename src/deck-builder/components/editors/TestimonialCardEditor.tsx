import React from 'react';
import { TestimonialCardBlock as TestimonialCardBlockType } from '../../types/blocks';

interface TestimonialCardEditorProps {
  block: TestimonialCardBlockType;
  onChange: (block: TestimonialCardBlockType) => void;
}

export const TestimonialCardEditor: React.FC<TestimonialCardEditorProps> = ({ block, onChange }) => {
  const testimonials = block.testimonials ?? [];

  const handleTestimonialChange = (idx: number, field: string, value: string) => {
    const updated = testimonials.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t
    );
    onChange({ ...block, testimonials: updated });
  };

  const addTestimonial = () => {
    onChange({
      ...block,
      testimonials: [...testimonials, { quote: '', author: '', title: '', photoUrl: '' }]
    });
  };

  const removeTestimonial = (idx: number) => {
    onChange({
      ...block,
      testimonials: testimonials.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={addTestimonial} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add Testimonial
        </button>
      </div>
      {testimonials.map((testimonial, idx) => (
        <div key={idx} className="border rounded p-3 mb-2 space-y-2">
          <div>
            <label className="block text-sm font-medium">Quote</label>
            <textarea
              value={testimonial.quote ?? ''}
              onChange={e => handleTestimonialChange(idx, 'quote', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Author</label>
            <input
              type="text"
              value={testimonial.author ?? ''}
              onChange={e => handleTestimonialChange(idx, 'author', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={testimonial.title ?? ''}
              onChange={e => handleTestimonialChange(idx, 'title', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Photo URL</label>
            <input
              type="text"
              value={testimonial.photoUrl ?? ''}
              onChange={e => handleTestimonialChange(idx, 'photoUrl', e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="button" onClick={() => removeTestimonial(idx)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default TestimonialCardEditor;
