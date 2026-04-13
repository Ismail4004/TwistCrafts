# TwistCraft - Handmade Pipe Cleaner Gifts

A fully accessible e-commerce website for handmade pipe cleaner gifts with JazzCash/Easypaisa payment integration and Vercel KV database.

## Features

- ✅ Full accessibility (WCAG 2.1 Level AA compliant)
- ✅ JazzCash & Easypaisa payment integration
- ✅ Order persistence with Vercel KV
- ✅ Real-time form validation
- ✅ Shopping cart with localStorage
- ✅ Mobile responsive design
- ✅ WhatsApp integration
- ✅ Email notifications via EmailJS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Vercel KV
KV_REST_API_URL=your_kv_url_here
KV_REST_API_TOKEN=your_kv_token_here

# EmailJS (configure in index.html)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Set up Vercel KV

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new KV database
3. Copy the REST API URL and Token
4. Add them to your environment variables

### 4. Configure EmailJS

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service
3. Create an email template
4. Get your Service ID, Template ID, and Public Key
5. Update the EmailJS initialization in `index.html`

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
npm run deploy
```

## Contact Information

- **WhatsApp**: 03289672939
- **Email**: muhammadismail300212@gmail.com

## Payment Methods

- JazzCash: 03289672939
- Easypaisa: 03289672939

## Project Structure

```
TwistCraft-main/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Extracted CSS (to be created)
├── js/
│   ├── utils.js        # Utility functions
│   ├── accessibility.js # Accessibility features
│   ├── validation.js   # Form validation
│   ├── cart.js         # Cart management
│   ├── payment.js      # Payment handling
│   ├── database.js     # Vercel KV integration
│   ├── checkout.js     # Checkout flow (to be created)
│   └── analytics.js    # Analytics (to be created)
├── api/
│   └── orders.js       # Vercel serverless function
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies

```

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and live regions
- Focus management
- Skip links
- High contrast support
- Responsive font sizing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions, contact via WhatsApp (03289672939) or email (muhammadismail300212@gmail.com).
