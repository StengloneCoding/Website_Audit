import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { runAudit } from "@/lib/audit/runAudit";
import { AuditError } from "@/lib/audit/types";

const requestSchema = z.object({
  url: z.string().trim().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedInternalAuditRequest(request)) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  try {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      throw new AuditError("Der Request-Body muss valides JSON sein.", 400);
    }

    const body = requestSchema.parse(payload);
    const result = await runAudit(body.url);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Bitte sende eine gültige URL im Request-Body." },
        { status: 400 },
      );
    }

    if (error instanceof AuditError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Ein unerwarteter Fehler hat das Audit verhindert." },
      { status: 500 },
    );
  }
}

function isAuthorizedInternalAuditRequest(request: Request) {
  const configuredSecret = process.env.INTERNAL_AUDIT_SECRET?.trim();

  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const providedSecret = request.headers.get("x-internal-audit-secret")?.trim();

  if (!providedSecret) {
    return false;
  }

  const configuredBuffer = Buffer.from(configuredSecret);
  const providedBuffer = Buffer.from(providedSecret);

  if (configuredBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(configuredBuffer, providedBuffer);
}
