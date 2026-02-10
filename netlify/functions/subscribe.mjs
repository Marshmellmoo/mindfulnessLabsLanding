import { createClient, ApiKeyStrategy } from '@wix/api-client';
import { contacts, labels, extendedFields } from '@wix/crm';

const MESSAGE_FROM_LANDING_DISPLAY_NAME = 'Message from Landing';
const DEFAULT_LANDING_MESSAGE = 'Interest from Landing Page';

function normalizeName(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getWixClient() {
  return createClient({
    modules: { contacts, labels, extendedFields },
    auth: ApiKeyStrategy({
      apiKey: Netlify.env.get('WIX_API_KEY'),
      siteId: Netlify.env.get('WIX_SITE_ID'),
    }),
  });
}

async function getMessageFromLandingFieldKey(wixClient) {
  try {
    const target = normalizeName(MESSAGE_FROM_LANDING_DISPLAY_NAME);
    const limit = 100;
    let offset = 0;
    const maxPages = 20;

    for (let page = 0; page < maxPages; page += 1) {
      const result = await wixClient.extendedFields.listExtendedFields({
        namespace: 'custom',
        paging: { limit, offset },
      });

      const fields = result?.fields ?? [];
      const match = fields.find((f) => normalizeName(f?.displayName) === target);
      if (match?.key) {
        return match.key;
      }

      const total = result?.metadata?.total ?? 0;
      offset += fields.length;
      if (!fields.length || offset >= total) break;
    }

    console.warn(
      `Could not find an extended field named "${MESSAGE_FROM_LANDING_DISPLAY_NAME}" in the custom namespace.`
    );
    return null;
  } catch (error) {
    console.warn(
      `Error looking up extended field "${MESSAGE_FROM_LANDING_DISPLAY_NAME}":`,
      error?.message ?? error
    );
    return null;
  }
}

async function findOrCreateLabelKey(wixClient, displayName) {
  if (!displayName) return null;
  const result = await wixClient.labels.findOrCreateLabel(displayName);
  return result?.label?.key ?? null;
}

async function getExistingLabelKey(wixClient, displayName) {
  if (!displayName) return null;
  try {
    const result = await wixClient.labels.listLabels();
    const existing = result?.labels?.find(
      (l) => (l?.displayName ?? '').toLowerCase() === displayName.toLowerCase()
    );
    return existing?.key ?? null;
  } catch (error) {
    console.error(`Error looking up label "${displayName}":`, error);
    return null;
  }
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { email, firstName, lastName, role, message } = body;

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    const messageForCrm = trimmedMessage || DEFAULT_LANDING_MESSAGE;

    const wixClient = getWixClient();

    const contactInfo = {
      name: {
        first: firstName,
        last: lastName,
      },
      emails: {
        items: [
          {
            email,
            primary: true,
          },
        ],
      },
      extendedFields: { items: {} },
    };

    if (role) {
      contactInfo.extendedFields.items['custom.role'] = role;
    }

    const messageFieldKey = await getMessageFromLandingFieldKey(wixClient);
    if (messageFieldKey) {
      contactInfo.extendedFields.items[messageFieldKey] = messageForCrm;
    } else {
      contactInfo.extendedFields.items['custom.message'] = messageForCrm;
    }

    const response = await wixClient.contacts.createContact(contactInfo);
    const contactId = response?.contact?._id;
    if (!contactId) {
      throw new Error('Wix CRM did not return a contact ID.');
    }

    try {
      const labelKeys = [];
      const landingLabelKey = await getExistingLabelKey(wixClient, 'Interest from Landing');
      if (landingLabelKey) labelKeys.push(landingLabelKey);

      if (role) {
        const roleLabelKey = await findOrCreateLabelKey(wixClient, role);
        if (roleLabelKey) labelKeys.push(roleLabelKey);
      }

      if (labelKeys.length > 0) {
        await wixClient.contacts.labelContact(contactId, labelKeys);
      }
    } catch (labelError) {
      console.error('Error labeling contact:', labelError);
    }

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = {
  path: '/api/subscribe',
};
