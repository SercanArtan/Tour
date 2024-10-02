import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('sk_test_51PxUARJK4xtl0sXVLcaS7y7m0gHgXyE9VuKdeHBIGxlQYruKJDaqxPHkJsVWdYdx6R10SmtazCyulpMgNDrvWmwh00b81DQjrn')

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/v1/api/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    const checkoutPageUrl = session.data.session.url;
    window.location.assign(checkoutPageUrl);
  } catch (error) {
    showAlert('error', error);
  }
};
