/* eslint-disable no-undef */

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, subject, message } = body;

  const { data, error } = await $fetch(
    `${runtimeConfig.mailHost}/contact`,
    {
      method: 'POST',
      body: {
        email,
        subject,
        message,
      },
      headers: {
        'x-api-key': runtimeConfig.apikeyMail,
        'Content-type': 'application/json',
      },
    },
  );
  console.log(error);
  return data;
});
