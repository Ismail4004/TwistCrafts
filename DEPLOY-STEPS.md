# 🚀 TwistCraft Deployment Steps

Follow these steps exactly to deploy your website.

---

## Step 1: Install Node.js (if not installed)

Download and install Node.js from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- Run the installer and follow the prompts

Verify installation:
```bash
node --version
npm --version
```

---

## Step 2: Install Dependencies

Open your terminal/command prompt in the `TwistCraft-main` folder and run:

```bash
npm install
```

This will install:
- Vercel CLI
- @vercel/kv (database package)

---

## Step 3: Install Vercel CLI Globally

```bash
npm install -g vercel
```

---

## Step 4: Login to Vercel

```bash
vercel login
```

This will open your browser. Choose one of these options:
- Continue with GitHub
- Continue with GitLab
- Continue with Bitbucket
- Continue with Email

---

## Step 5: Create Vercel KV Database

1. Go to https://vercel.com/dashboard
2. Click on "Storage" in the left sidebar
3. Click "Create Database"
4. Select "KV" (Key-Value Store)
5. Give it a name: `twistcraft-orders`
6. Click "Create"
7. **IMPORTANT**: Copy these two values:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

---

## Step 6: Deploy to Vercel

In your terminal, run:

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No
- **Project name?** → twistcraft (or press Enter)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

Wait for deployment to complete. You'll get a URL like:
`https://twistcraft-xxxxx.vercel.app`

---

## Step 7: Add Environment Variables

```bash
vercel env add KV_REST_API_URL
```
Paste the `KV_REST_API_URL` value you copied in Step 5

```bash
vercel env add KV_REST_API_TOKEN
```
Paste the `KV_REST_API_TOKEN` value you copied in Step 5

Select environments:
- Production: Yes
- Preview: Yes
- Development: Yes

---

## Step 8: Deploy to Production

```bash
vercel --prod
```

This will deploy your site to production with the environment variables.

You'll get your final URL: `https://twistcraft.vercel.app` (or similar)

---

## Step 9: Test Your Website

Visit your production URL and test:

1. ✅ Add items to cart
2. ✅ Click "Checkout"
3. ✅ Fill in customer information
4. ✅ Select payment method (JazzCash or Easypaisa)
5. ✅ Enter a test transaction ID (e.g., "TEST12345678")
6. ✅ Complete order
7. ✅ Verify you see the order confirmation

---

## Step 10: Configure EmailJS (Optional but Recommended)

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Add an email service (Gmail, Outlook, etc.)
4. Create an email template
5. Get your credentials:
   - Service ID
   - Template ID
   - Public Key

6. Find this code in your `index.html` (search for "emailjs"):
```javascript
emailjs.init('YOUR_PUBLIC_KEY_HERE');
```

7. Replace with your actual public key

8. Redeploy:
```bash
vercel --prod
```

---

## 🎉 You're Done!

Your website is now live at your Vercel URL!

### Your Contact Information (Already Configured):
- WhatsApp: 03289672939
- Email: muhammadismail300212@gmail.com
- JazzCash: 03289672939
- Easypaisa: 03289672939

### What's Working:
✅ Shopping cart
✅ JazzCash & Easypaisa payments
✅ Order database (saves to Vercel KV)
✅ WhatsApp integration
✅ Full accessibility
✅ Mobile responsive

---

## Troubleshooting

### Problem: "vercel: command not found"
**Solution**: Run `npm install -g vercel` again

### Problem: Orders not saving
**Solution**: 
1. Check environment variables: `vercel env ls`
2. Make sure KV database is created
3. Redeploy: `vercel --prod`

### Problem: Can't access /api/orders
**Solution**: 
1. Make sure `api/orders.js` file exists
2. Check `vercel.json` is in the root folder
3. Redeploy: `vercel --prod`

### Problem: Module import errors
**Solution**: 
1. Make sure all files in `js/` folder exist
2. Check browser console for specific errors
3. Verify `<script type="module" src="/js/app.js"></script>` is in HTML

---

## Need Help?

Contact: muhammadismail300212@gmail.com
WhatsApp: 03289672939

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls
```

---

**Estimated Time**: 15-20 minutes total
**Cost**: $0 (Vercel free tier includes KV database)

Good luck! 🚀
