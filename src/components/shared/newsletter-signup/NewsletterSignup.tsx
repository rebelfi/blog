'use client';

import { useState } from 'react';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://rebelfi.io/api/core/marketing/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Successfully subscribed! Thank you for joining our newsletter.');
        setIsSuccess(true);
        setEmail('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || 'Something went wrong. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm md:p-12">
      <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
        Stay Updated with RebelFi
      </h3>
      <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600">
        Get the latest DeFi insights, platform updates, and exclusive content delivered to your
        inbox.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto max-w-md">
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition-colors duration-150 focus:border-rebel-purple-500 focus:outline-none focus:ring-2 focus:ring-rebel-purple-500 focus:ring-offset-2 disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};
