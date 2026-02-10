# Mindfulness Labs Landing Page

Landing page website for Mindfulness Labs. (This README is in the Github and README folder.)

This site collects interest (name, email, role, optional message) and sends it to a Netlify Function, which creates/updates a contact in Wix CRM.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (comes with Node.js)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/avery-espiritu/mindfulnessLabsLanding.git
   cd mindfulnessLabsLanding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (backend)**

   Create a `.env` file in the project root for local development:

   ```bash
   WIX_SITE_ID="<your-wix-site-id>"
   WIX_API_KEY="<your-wix-api-key>"
   PORT=3001
   ```

   Important: never commit your Wix API key.

4. **Run the dev servers**

   Run the frontend with Netlify Functions locally via Netlify CLI:

   ```bash
   npx netlify dev
   ```

   - Frontend: `http://localhost:8888`
   - Function: `http://localhost:8888/.netlify/functions/subscribe`

## What the website does

- Renders a marketing/landing page for Mindfulness Labs.
- Provides a contact form for users to share their role and interest.
- Sends submissions to a backend API which stores the lead in Wix CRM.

## How the API is used (Wix CRM)

The Netlify Function lives in [netlify/functions/subscribe.js](netlify/functions/subscribe.js) and exposes:

- `POST /.netlify/functions/subscribe`: Creates a Wix CRM contact using the submitted email and name.
  - Saves the selected role into an extended field (custom field) in Wix.
  - Saves a message into a Wix extended field whose display name is **"Message**.

### “Interest from Landing Page” logic

Wix CRM is set up to filter/save contacts into a view called **"Interest from Landing Page"** based on whether a new contact has a message.

To support that flow, the backend guarantees a message is always sent:

- If the user enters a message in the form, that message is stored.
- If the user leaves the message blank, the backend stores the default value: **"Interest from Landing Page"**.
   ```bash
   npm run dev
   ```

   The site will automatically open in your browser at `http://localhost:8000`

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run server` - Start the backend API server (Express)
- `npm run dev:full` - Run frontend + backend together
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
