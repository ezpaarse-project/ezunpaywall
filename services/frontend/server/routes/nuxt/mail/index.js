/* eslint-disable no-undef */

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, subject, message } = body;

  let res;

  try {
    res = await $fetch(
      `${runtimeConfig.adminUrl}/contact`,
      {
        method: 'POST',
        body: {
          email,
          subject,
          message,
        },
        headers: {
          'x-api-key': runtimeConfig.adminApikey,
          'Content-type': 'application/json',
        },
      },
    );
  } catch (err) {
    return err;
  }

  return res;
});
