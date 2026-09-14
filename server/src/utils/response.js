/** Every successful response uses the same envelope: { success: true, data }. */
export function sendSuccess(res, data, statusCode = 200, meta = undefined) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export default sendSuccess;
