"use server";

export async function POST(req: Request) {
  const { captchaToken } = await req.json();

  const secretKey = process.env.NEXT_PUBLIC_TURNSTILE_SECRET_KEY;

  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${secretKey}&response=${captchaToken}`,
  });

  const data = await response.json();

  if (data.success) {
    return Response.json({ success: true });
  } else {
    return Response.json({ success: false, error: data["error-codes"] });
  }
}
