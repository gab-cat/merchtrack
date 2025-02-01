export const emailStyles = {
  main: {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Poppins, sans-serif',
  },

  container: {
    margin: '10px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '550px',
  },

  header: {
    textAlign: 'center' as const,
    padding: '20px 0',
    backgroundColor: '#2C59DB',
    color: '#ffffff',
    borderRadius: '7px'
  },

  logo: {
    marginBottom: '10px',
    height: '60px',
    // center the image
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
  },

  content: {
    padding: '20px',
  },

  text: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '20px',
  },

  faqSection: {
    padding: '20px',
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
  },

  subHeading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },

  list: {
    paddingLeft: '20px',
    marginBottom: '20px',
  },

  link: {
    color: '#2C59DB',
    textDecoration: 'none',
  },

  button: {
    display: 'inline-block',
    padding: '10px 20px',
    margin: '10px 0',
    backgroundColor: '#2C59DB',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '4px',
    marginRight: '10px',
  },

  footer: {
    textAlign: 'center' as const,
    padding: '20px',
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
  },

  footerText: {
    fontSize: '14px',
    color: '#666666',
  }
};

export const emailContent = {
  storeInfo: {
    address: 'Ateneo Avenue | Ateneo de Naga University, Naga City 4400',
    phone: '(555) 123-4567',
    email: 'support@merchtrack.tech',
    website: 'https://merchtrack.tech',
  },

  faqs: [
    {
      question: 'What are your store hours?',
      answer: 'Our store is open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and university holidays.'
    },
    {
      question: 'Do you offer textbook rentals?',
      answer: 'Yes, we offer textbook rentals for many of our titles. Rental periods typically last for the duration of the semester. Check our website or visit the store for more details on specific titles.'
    },
    {
      question: 'What\'s your return policy?',
      answer: 'We offer a 30-day return policy for most items, provided they are in original condition with receipt. Textbooks can be returned within the first two weeks of the semester. Some restrictions may apply to electronic items and custom orders.'
    }
  ],

  helpfulLinks: [
    { text: 'Online Catalog', url: 'https://merchtrack.tech' },
    { text: 'Textbook Lookup', url: 'https://merchtrack.tech' },
    { text: 'Store Policies', url: 'https://merchtrack.tech' },
    { text: 'Campus Map', url: 'https://merchtrack.tech' }
  ],

  buttons: [
    { text: 'Visit Our Website', url: 'https://merchtrack.tech' },
    { text: 'Track Your Order', url: 'https://merchtrack.tech' }
  ]
};
