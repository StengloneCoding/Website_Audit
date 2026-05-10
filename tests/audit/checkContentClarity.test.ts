import { describe, expect, it } from "vitest";
import { checkContentClarity } from "@/lib/audit/checkContentClarity";
import { extractSeoBasics } from "@/lib/audit/extractSeoBasics";
import { parseHtml } from "@/lib/audit/parseHtml";

function runChecks(html: string) {
  const parsed = parseHtml(html);
  const { seoBasics } = extractSeoBasics(parsed);

  return checkContentClarity(parsed, seoBasics);
}

function getCheck(html: string, checkId: string) {
  return runChecks(html).find((check) => check.id === checkId);
}

describe("checkContentClarity", () => {
  it("recognizes title, h1 and body topic alignment", () => {
    const check = getCheck(
      `
        <html>
          <head>
            <title>SEO Audit für B2B SaaS Websites</title>
          </head>
          <body>
            <h1>SEO Audit für B2B SaaS Websites</h1>
            <p>Dieses SEO Audit hilft B2B SaaS Teams, ihre Website technisch und semantisch besser verständlich zu machen.</p>
            <p>Das Audit erklärt Signale, Struktur und Inhalte für Suchmaschinen und KI-Systeme.</p>
            <p>Zusätzlich beschreibt der Bericht konkrete Maßnahmen für Content, interne Verlinkung und Struktur.</p>
          </body>
        </html>
      `,
      "content-topic-alignment",
    );

    expect(check).toMatchObject({ passed: true });
  });

  it("fails when there is too little visible text", () => {
    const check = getCheck(
      `
        <html>
          <head>
            <title>Kurze Seite</title>
          </head>
          <body>
            <h1>Kurze Seite</h1>
            <p>Nur wenig Text.</p>
          </body>
        </html>
      `,
      "content-sufficient-copy",
    );

    expect(check).toMatchObject({ passed: false });
  });

  it.each([
    [
      "email",
      `
        <html>
          <head><title>Kontakt per E-Mail</title></head>
          <body>
            <h1>Kontakt</h1>
            <p>Schreiben Sie an hallo@example.com, wenn Sie ein Audit anfragen möchten.</p>
          </body>
        </html>
      `,
    ],
    [
      "phone",
      `
        <html>
          <head><title>Kontakt per Telefon</title></head>
          <body>
            <h1>Kontakt</h1>
            <p>Rufen Sie uns unter +49 30 12345678 an.</p>
          </body>
        </html>
      `,
    ],
    [
      "link",
      `
        <html>
          <head><title>Kontaktformular</title></head>
          <body>
            <h1>Audit anfragen</h1>
            <a href="/contact">Contact us</a>
          </body>
        </html>
      `,
    ],
  ])("detects a contact option via %s", (_label, html) => {
    const check = getCheck(html, "content-contact-options");

    expect(check).toMatchObject({ passed: true });
  });

  it("recognizes faq content", () => {
    const check = getCheck(
      `
        <html>
          <head><title>FAQ zur AI Visibility Analyse</title></head>
          <body>
            <h1>FAQ zur AI Visibility Analyse</h1>
            <h2>FAQ</h2>
            <p>Was analysiert das Tool?</p>
            <p>Es bewertet technische und semantische Signale.</p>
            <p>Wie lange dauert der Audit?</p>
            <p>In der Regel nur wenige Sekunden.</p>
          </body>
        </html>
      `,
      "content-faq-signal",
    );

    expect(check).toMatchObject({ passed: true });
  });

  it("recognizes concrete services", () => {
    const check = getCheck(
      `
        <html>
          <head><title>SEO Audit und Content-Strategie</title></head>
          <body>
            <h1>SEO Audit und Content-Strategie</h1>
            <p>Wir bieten SEO Audits, Content-Strategie und technische SEO-Beratung für B2B Websites.</p>
            <p>Zusätzlich begleiten wir Relaunches, Informationsarchitektur und semantische Inhaltsmodelle.</p>
            <p>Jedes Projekt wird mit klaren Handlungsempfehlungen dokumentiert.</p>
          </body>
        </html>
      `,
      "content-concrete-services",
    );

    expect(check).toMatchObject({ passed: true });
  });
});
