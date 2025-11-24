import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Check } from 'lucide-react';

export function FeedbackTab() {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({
    sentiment: '',
    rating: '',
    feedback: ''
  });

  const handleSubmit = () => {
    // Clear previous errors
    const newErrors = {
      sentiment: '',
      rating: '',
      feedback: ''
    };

    // Validate fields
    let hasError = false;
    if (sentiment === null) {
      newErrors.sentiment = 'Please select your experience';
      hasError = true;
    }
    if (rating === null) {
      newErrors.rating = 'Please provide a rating';
      hasError = true;
    }
    if (!feedback.trim()) {
      newErrors.feedback = 'Please add a comment';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setFeedback('');
      setRating(null);
      setSentiment(null);
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Tab Handle */}
      <div
    className={`absolute right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white flex items-center justify-center w-[40px] h-[100px] rounded-l-md cursor-pointer shadow-lg transition-all ${
        isOpen ? 'bg-blue-700' : ''
    }`}
    >
    <div className="flex items-center gap-1 -rotate-90 whitespace-nowrap text-xs">
        <MessageSquare className="w-3 h-3" />
        <span>Feedback</span>
    </div>
    </div>

      {/* Feedback Panel */}
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-white rounded-l-lg shadow-2xl p-6 w-80 border border-gray-200 relative">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-green-100 rounded-full p-8 mb-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-green-700 text-center">
                Thanks for your feedback!
              </p>
            </div>
          ) : (
            <>
              <h3 className="mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Share Your Feedback
              </h3>

              {/* Sentiment Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">How was your experience?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSentiment('positive');
                      setErrors(prev => ({ ...prev, sentiment: '' }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      sentiment === 'positive'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => {
                      setSentiment('negative');
                      setErrors(prev => ({ ...prev, sentiment: '' }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      sentiment === 'negative'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5 mx-auto" />
                  </button>
                </div>
                {errors.sentiment && (
                  <p className="text-red-600 text-xs mt-1">{errors.sentiment}</p>
                )}
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Rate this page</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setRating(star);
                        setErrors(prev => ({ ...prev, rating: '' }));
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating && star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-red-600 text-xs mt-1">{errors.rating}</p>
                )}
              </div>

              {/* Feedback Textarea */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Additional comments</p>
                <Textarea
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    setErrors(prev => ({ ...prev, feedback: '' }));
                  }}
                  className="resize-none h-24"
                />
                {errors.feedback && (
                  <p className="text-red-600 text-xs mt-1">{errors.feedback}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} className="w-full">
                Submit Feedback
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
