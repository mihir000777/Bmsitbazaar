/**
 * Razorpay Payment Integration
 * 
 * Setup:
 * 1. Sign up at https://razorpay.com
 * 2. Get your Key ID from Dashboard → Settings → API Keys
 * 3. Add to .env: REACT_APP_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx
 */

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_YOUR_KEY_HERE';

/**
 * Loads Razorpay checkout script dynamically
 */
function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay checkout modal.
 *
 * @param {Object} opts
 * @param {number} opts.amount - Amount in rupees (will be converted to paise)
 * @param {string} opts.name - Display name on checkout (e.g., "BMSIT Bazaar")
 * @param {string} opts.description - Order description
 * @param {string} opts.email - Buyer's email
 * @param {string} opts.contact - Buyer's phone (optional)
 * @param {Function} opts.onSuccess - Called on successful payment with payment details
 * @param {Function} opts.onFailure - Called on failure/dismiss
 */
export async function openRazorpay({ amount, name = 'BMSIT Bazaar', description, email, contact, onSuccess, onFailure }) {
  const loaded = await loadScript();
  if (!loaded) {
    onFailure?.({ error: 'Failed to load Razorpay. Check your internet connection.' });
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    name,
    description,
    image: '/logo.svg',
    prefill: {
      email: email || '',
      contact: contact || '',
    },
    theme: {
      color: '#facc15',
    },
    handler: function (response) {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        onFailure?.({ error: 'Payment cancelled.' });
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response) {
    onFailure?.(response.error);
  });
  rzp.open();
}
