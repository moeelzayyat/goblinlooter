This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Payment Configuration

Stripe Checkout supports card and Cash App Pay checkout through:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Configure the Stripe webhook endpoint as:

```txt
https://goblinlooter.com/api/webhooks/stripe
```

The webhook must send at least `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, and `checkout.session.expired`.

BTCPay remains available for supported cryptocurrency checkout through the
existing `BTCPAY_*` environment variables.

## Product Duration Options

Products can optionally define duration-based purchase options in the admin
product editor, such as `1 Day`, `1 Week`, and `1 Month`. When options are
configured, the product page requires the customer to select one option before
checkout. Checkout charges the selected option price and stores the selected
option label on the order item.

## Product Page Media And Disclaimer

Each product can define an optional video URL and disclaimer in the admin
product editor. Product videos support YouTube, Vimeo, and direct MP4/WebM/OGG
URLs. Admins can also upload one MP4, WebM, OGG, or MOV video per product. When
a video URL is set it is used first; otherwise the uploaded video is shown. When
no video is configured, the video section is hidden.

## Protected Product Downloads

Admins can upload one private product file per product from the product editor.
Uploaded EXE, MSI, ZIP, 7Z, and RAR files are stored outside the public asset
folder and served through an authenticated order download endpoint. Customers
only receive the protected download link after the order is delivered.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
