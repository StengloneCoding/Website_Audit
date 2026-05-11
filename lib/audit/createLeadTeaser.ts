import type {
  AuditCheck,
  AuditIssue,
  AuditResult,
  LeadTeaserCta,
  LeadTeaserPoint,
  LeadTeaserResponse,
} from "@/lib/audit/types";

const DEFAULT_CTA: LeadTeaserCta = {
  headline:
    "Möchten Sie wissen, welche Maßnahmen bei Ihrer Website wirklich sinnvoll sind?",
  text: "Ich prüfe Ihre Website kostenlos und gebe Ihnen eine klare Einschätzung, welche Punkte zuerst verbessert werden sollten.",
  buttonLabel: "Kostenfreie Ersteinschätzung anfragen",
  targetUrl: "/kostenfreie-beratung",
};

const POSITIVE_CTA: LeadTeaserCta = {
  headline: "Die Seite sendet bereits einige gute Signale.",
  text: "Wenn Sie möchten, prüfe ich im nächsten Schritt, wo noch gezielte Optimierungspotenziale für Sichtbarkeit, Struktur und Klarheit liegen.",
  buttonLabel: "Kostenfreie Ersteinschätzung anfragen",
  targetUrl: "/kostenfreie-beratung",
};

const DISCLAIMER =
  "Dieser Quick Check misst keine echten Rankings. Er bewertet technische und semantische Signale.";

const impactPriority = {
  high: 2,
  medium: 1,
} as const;

const checkPriority: Record<string, number> = {
  "seo-noindex-not-set": 100,
  "seo-h1-present": 95,
  "seo-description-present": 90,
  "structured-jsonld-present": 85,
  "structured-jsonld-valid": 80,
  "structured-organization-or-local-business": 78,
  "entity-location-signal": 75,
  "content-concrete-services": 70,
  "entity-services-signal": 68,
  "content-topic-alignment": 64,
  "content-sufficient-copy": 60,
  "entity-expertise-signal": 55,
  "structured-website": 45,
  "structured-service": 42,
  "content-contact-options": 40,
  "entity-audience-signal": 38,
  "entity-recurring-terms": 36,
  "entity-specific-terms": 34,
  "technical-response-time": 30,
  "technical-html-size": 28,
  "technical-https": 26,
};

const pointCopy: Record<
  string,
  LeadTeaserPoint & {
    group: string;
  }
> = {
  "seo-noindex-not-set": {
    group: "indexing",
    title: "Die Seite könnte von der Indexierung ausgeschlossen sein",
    impact: "high",
    summary:
      "Ein noindex-Signal kann verhindern, dass Suchmaschinen die Seite regulär berücksichtigen.",
    teaserRecommendation:
      "Robots-Meta und technische Seiteneinstellungen sollten geprüft werden.",
  },
  "seo-h1-present": {
    group: "headings",
    title: "Keine klare Hauptüberschrift erkennbar",
    impact: "medium",
    summary:
      "Die Seite benennt ihr Hauptthema nicht deutlich genug in einer zentralen Überschrift.",
    teaserRecommendation:
      "Eine prägnante H1 sollte das Angebot oder die Hauptleistung klar auf den Punkt bringen.",
  },
  "seo-description-present": {
    group: "meta-description",
    title: "Keine Meta Description erkennbar",
    impact: "high",
    summary:
      "Dadurch fehlt eine kurze maschinenlesbare Zusammenfassung der Seite.",
    teaserRecommendation:
      "Wichtige Seiten sollten eine präzise Description mit Thema und Nutzen erhalten.",
  },
  "structured-jsonld-present": {
    group: "structured-data",
    title: "Keine strukturierten Daten gefunden",
    impact: "high",
    summary:
      "Suchmaschinen und KI-Systeme erhalten dadurch weniger explizite Kontextsignale.",
    teaserRecommendation:
      "Für lokale Unternehmen sind Organization, LocalBusiness und Service Schema oft ein sinnvoller erster Schritt.",
  },
  "structured-jsonld-valid": {
    group: "structured-data",
    title: "Strukturierte Daten sind technisch nicht sauber eingebunden",
    impact: "high",
    summary:
      "Vorhandene Schema-Daten können dadurch nicht zuverlässig verarbeitet werden.",
    teaserRecommendation:
      "Die vorhandenen JSON-LD-Blöcke sollten technisch geprüft und korrekt eingebunden werden.",
  },
  "structured-organization-or-local-business": {
    group: "structured-data",
    title: "Unternehmenskontext ist nicht maschinenlesbar genug",
    impact: "high",
    summary:
      "Wichtige Informationen zur Organisation oder zum lokalen Angebot fehlen als strukturiertes Signal.",
    teaserRecommendation:
      "Organization- oder LocalBusiness-Schema sollte die wichtigsten Unternehmensdaten klar abbilden.",
  },
  "structured-website": {
    group: "structured-data",
    title: "Der grundlegende Website-Kontext ist kaum strukturiert",
    impact: "medium",
    summary:
      "Maschinen erhalten dadurch weniger klare Signale zum übergreifenden Zweck der Website.",
    teaserRecommendation:
      "Ein einfaches WebSite-Schema kann den übergeordneten Seitenkontext sauber abbilden.",
  },
  "structured-service": {
    group: "services",
    title: "Leistungen sind kaum strukturiert beschrieben",
    impact: "medium",
    summary:
      "Für Suchmaschinen und KI-Systeme bleibt dadurch unklarer, welche Services konkret angeboten werden.",
    teaserRecommendation:
      "Service-Schema kann helfen, die wichtigsten Leistungen maschinenlesbar zu beschreiben.",
  },
  "entity-location-signal": {
    group: "location",
    title: "Standortbezug ist kaum sichtbar",
    impact: "high",
    summary:
      "Die Website macht nicht klar genug, für welche Region das Angebot relevant ist.",
    teaserRecommendation:
      "Standort, Einzugsgebiet und lokale Leistungsseiten sollten klarer benannt werden.",
  },
  "content-concrete-services": {
    group: "services",
    title: "Leistungen sind nicht klar genug beschrieben",
    impact: "high",
    summary:
      "Für Suchmaschinen und KI-Systeme bleibt dadurch unklar, welche konkreten Services angeboten werden.",
    teaserRecommendation:
      "Leistungen, typische Anfragen und Kernangebote sollten sichtbarer und konkreter benannt werden.",
  },
  "entity-services-signal": {
    group: "services",
    title: "Leistungen sind nicht klar genug beschrieben",
    impact: "high",
    summary:
      "Die Seite nennt das Angebot noch nicht deutlich genug, um es maschinenlesbar einzuordnen.",
    teaserRecommendation:
      "Die wichtigsten Leistungen sollten mehrfach klar und verständlich benannt werden.",
  },
  "content-topic-alignment": {
    group: "topic-alignment",
    title: "Seitenthema ist nicht konsistent genug",
    impact: "high",
    summary:
      "Titel, Hauptüberschrift und Fließtext senden noch kein klares gemeinsames Thema.",
    teaserRecommendation:
      "Die wichtigsten Kernaussagen sollten in Title, H1 und Seitentext enger aufeinander abgestimmt werden.",
  },
  "content-sufficient-copy": {
    group: "content-depth",
    title: "Die Seite erklärt das Angebot nur sehr knapp",
    impact: "high",
    summary:
      "Wichtiger Kontext zu Nutzen, Leistungen und Relevanz fehlt dadurch im sichtbaren Inhalt.",
    teaserRecommendation:
      "Mehr erklärender Seitentext hilft, Angebot und thematischen Fokus klarer einzuordnen.",
  },
  "entity-expertise-signal": {
    group: "expertise",
    title: "Expertise-Signale sind kaum sichtbar",
    impact: "high",
    summary:
      "Es fehlen klare Hinweise darauf, wer hinter dem Angebot steht und warum die Seite fachlich relevant ist.",
    teaserRecommendation:
      "Team-, Gründer- oder Qualifikationshinweise können die fachliche Einordnung stärken.",
  },
  "content-contact-options": {
    group: "contact",
    title: "Ein klarer nächster Schritt ist kaum sichtbar",
    impact: "medium",
    summary:
      "Besucher und Systeme erkennen noch nicht deutlich genug, wie eine Kontaktaufnahme vorgesehen ist.",
    teaserRecommendation:
      "Eine klar sichtbare Kontaktmöglichkeit oder Handlungsoption sollte direkt auf der Seite auftauchen.",
  },
  "entity-audience-signal": {
    group: "audience",
    title: "Die Zielgruppe wird nicht klar genug benannt",
    impact: "medium",
    summary:
      "Dadurch bleibt unklarer, für wen das Angebot konkret relevant ist.",
    teaserRecommendation:
      "Zielgruppe, Einsatzfall und Nutzen sollten klarer benannt werden.",
  },
  "entity-recurring-terms": {
    group: "topic-support",
    title: "Zentrale Begriffe werden nicht deutlich genug gestützt",
    impact: "medium",
    summary:
      "Die Seite wiederholt ihre wichtigsten Themen und Leistungen noch nicht klar genug.",
    teaserRecommendation:
      "Einige relevante Begriffe sollten im sichtbaren Text natürlicher und konsistenter vorkommen.",
  },
  "entity-specific-terms": {
    group: "topic-support",
    title: "Die Sprache bleibt an einigen Stellen zu allgemein",
    impact: "medium",
    summary:
      "Sehr generische Begriffe helfen Maschinen nur begrenzt dabei, das Angebot sauber einzuordnen.",
    teaserRecommendation:
      "Spezifischere Begriffe zu Leistungen, Branchen oder Regionen schaffen mehr Klarheit.",
  },
  "technical-response-time": {
    group: "technical-performance",
    title: "Die Seite reagiert eher langsam",
    impact: "medium",
    summary:
      "Langsame Antworten können den zuverlässigen Abruf durch Suchmaschinen und andere Systeme erschweren.",
    teaserRecommendation:
      "Die wichtigsten Seiten sollten technisch auf stabile und schnellere Antwortzeiten geprüft werden.",
  },
  "technical-html-size": {
    group: "technical-performance",
    title: "Das HTML wirkt technisch eher schwergewichtig",
    impact: "medium",
    summary:
      "Ein sehr großes HTML-Dokument kann das Abrufen und Parsen unnötig erschweren.",
    teaserRecommendation:
      "Die Seitenausgabe sollte auf unnötigen Ballast und übermäßig große HTML-Mengen geprüft werden.",
  },
  "technical-https": {
    group: "technical-security",
    title: "Die finale Zielseite läuft nicht sauber über HTTPS",
    impact: "high",
    summary:
      "Ohne HTTPS fehlt ein zentrales Vertrauens- und Zugänglichkeitssignal.",
    teaserRecommendation:
      "Die bevorzugte öffentliche Version der Seite sollte konsequent über HTTPS erreichbar sein.",
  },
};

interface PublicFindingCandidate {
  id: string;
  label: string;
  impact: "high" | "medium";
  weight: number;
  recommendation: string;
}

export function createLeadTeaser(result: AuditResult): LeadTeaserResponse {
  const candidates = getPublicCandidates(result);
  const criticalPoints = selectCriticalPoints(candidates);

  return {
    url: result.url,
    score: result.score,
    criticalPoints,
    cta: criticalPoints.length > 0 ? DEFAULT_CTA : POSITIVE_CTA,
    disclaimer: DISCLAIMER,
  };
}

function getPublicCandidates(result: AuditResult): PublicFindingCandidate[] {
  const failedChecks = result.checks.filter(
    (check): check is AuditCheck & { impact: "high" | "medium" } =>
      !check.passed && isPublicImpact(check.impact),
  );

  if (failedChecks.length > 0) {
    return failedChecks.map((check) => ({
      id: check.id,
      label: check.label,
      impact: check.impact,
      weight: check.weight,
      recommendation: resolveRecommendation(result, check),
    }));
  }

  return result.issues
    .filter(
      (issue): issue is AuditIssue & { impact: "high" | "medium" } =>
        isPublicImpact(issue.impact),
    )
    .map((issue) => ({
      id: issue.id,
      label: issue.label,
      impact: issue.impact,
      weight: issue.weight,
      recommendation: resolveIssueRecommendation(issue),
    }));
}

function resolveRecommendation(result: AuditResult, check: AuditCheck) {
  const linkedRecommendation = result.recommendations.find(
    (recommendation) => recommendation.sourceCheckId === check.id,
  );

  return cleanupSentence(linkedRecommendation?.text ?? check.recommendation);
}

function resolveIssueRecommendation(issue: AuditIssue) {
  return cleanupSentence(issue.recommendation);
}

function selectCriticalPoints(
  candidates: PublicFindingCandidate[],
): LeadTeaserPoint[] {
  const sortedCandidates = [...candidates].sort(compareCandidates);
  const seenGroups = new Set<string>();
  const selected: LeadTeaserPoint[] = [];

  for (const candidate of sortedCandidates) {
    const group = pointCopy[candidate.id]?.group ?? candidate.id;

    if (seenGroups.has(group)) {
      continue;
    }

    seenGroups.add(group);
    selected.push(toLeadTeaserPoint(candidate));

    if (selected.length === 2) {
      break;
    }
  }

  return selected;
}

function compareCandidates(
  left: PublicFindingCandidate,
  right: PublicFindingCandidate,
) {
  if (impactPriority[right.impact] !== impactPriority[left.impact]) {
    return impactPriority[right.impact] - impactPriority[left.impact];
  }

  if ((checkPriority[right.id] ?? 0) !== (checkPriority[left.id] ?? 0)) {
    return (checkPriority[right.id] ?? 0) - (checkPriority[left.id] ?? 0);
  }

  if (right.weight !== left.weight) {
    return right.weight - left.weight;
  }

  return left.label.localeCompare(right.label, "de");
}

function toLeadTeaserPoint(candidate: PublicFindingCandidate): LeadTeaserPoint {
  const mappedPoint = pointCopy[candidate.id];

  if (mappedPoint) {
    return {
      title: mappedPoint.title,
      impact: candidate.impact,
      summary: mappedPoint.summary,
      teaserRecommendation: mappedPoint.teaserRecommendation,
    };
  }

  return {
    title: cleanupSentence(candidate.label),
    impact: candidate.impact,
    summary:
      "Hier fehlen noch technische oder semantische Signale, die Suchmaschinen und KI-Systemen die Einordnung der Seite erleichtern können.",
    teaserRecommendation: cleanupSentence(candidate.recommendation),
  };
}

function cleanupSentence(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isPublicImpact(
  impact: AuditCheck["impact"] | AuditIssue["impact"],
): impact is "high" | "medium" {
  return impact === "high" || impact === "medium";
}
