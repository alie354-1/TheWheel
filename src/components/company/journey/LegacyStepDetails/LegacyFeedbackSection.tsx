import React, { useState } from "react";

interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface FeedbackSectionProps {
  feedbackList?: Feedback[];
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting?: boolean;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbackList,
  onSubmit,
  isSubmitting,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
      setRating(0);
      setComment("");
    }
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-lg">Feedback</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-xl ${star <= rating ? "text-yellow-400" : "text-gray-400"}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="textarea textarea-bordered w-full mt-2"
            rows={2}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment (optional)"
          />
          <div className="mt-2">
            <button
              className="btn btn-primary btn-sm"
              type="submit"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
        {feedbackList && feedbackList.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Previous Feedback</h3>
            <ul className="space-y-2">
              {feedbackList.map((fb) => (
                <li key={fb.id} className="border-b pb-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= fb.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {fb.comment && <div className="text-base-content/70">{fb.comment}</div>}
                  <div className="text-xs text-base-content/50">{new Date(fb.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;
