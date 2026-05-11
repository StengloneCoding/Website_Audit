import { NextResponse } from "next/server";
import { z } from "zod";
import { createLeadTeaser } from "@/lib/audit/createLeadTeaser";
import { runAudit } from "@/lib/audit/runAudit";
import { AuditError, type LeadTeaserResponse } from "@/lib/audit/types";

const requestSchema = z.object({
  url: z.string().trim().min(1),
});

const genericFetchErrorMessage = "Die Website konnte nicht geprüft werden.";
const genericUnexpectedErrorMessage =
  "Der Quick Check konnte nicht abgeschlossen werden.";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      throw new AuditError("Der Request-Body muss valides JSON sein.", 400);
    }

    const body = requestSchema.parse(payload);

    // TODO: Add rate limiting before exposing this endpoint broadly in production.
    const leadTeaser = createLeadTeaser(await runAudit(body.url));
    const publicResponse: LeadTeaserResponse = {
      url: leadTeaser.url,
      score: leadTeaser.score,
      criticalPoints: leadTeaser.criticalPoints.slice(0, 2),
      cta: leadTeaser.cta,
      disclaimer: leadTeaser.disclaimer,
    };

    return NextResponse.json(publicResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Bitte sende eine gültige URL im Request-Body." },
        { status: 400 },
      );
    }

    if (error instanceof AuditError) {
      if (error.statusCode === 400) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (error.statusCode === 408 || error.statusCode === 504) {
        return NextResponse.json({ error: error.message }, { status: 408 });
      }

      return NextResponse.json(
        { error: genericFetchErrorMessage },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: genericUnexpectedErrorMessage },
      { status: 500 },
    );
  }
}
