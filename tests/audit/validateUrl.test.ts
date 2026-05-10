import { describe, expect, it } from "vitest";
import { validateAuditUrl } from "@/lib/audit/validateUrl";

describe("validateAuditUrl", () => {
  it("accepts and normalizes a valid https URL", () => {
    expect(validateAuditUrl("https://Example.com/products")).toBe(
      "https://example.com/products",
    );
  });

  it("accepts and normalizes a valid http URL", () => {
    expect(validateAuditUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects an invalid URL", () => {
    expect(() => validateAuditUrl("not-a-url")).toThrow(
      "Please enter a full URL including http:// or https://.",
    );
  });

  it("rejects ftp URLs", () => {
    expect(() => validateAuditUrl("ftp://example.com/file.txt")).toThrow(
      "Only http and https URLs are allowed.",
    );
  });

  it("rejects localhost", () => {
    expect(() => validateAuditUrl("http://localhost:3000")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects 127.0.0.1", () => {
    expect(() => validateAuditUrl("http://127.0.0.1")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects 0.0.0.0", () => {
    expect(() => validateAuditUrl("http://0.0.0.0")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects ::1", () => {
    expect(() => validateAuditUrl("http://[::1]")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects 192.168.x.x", () => {
    expect(() => validateAuditUrl("http://192.168.1.25/dashboard")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects 10.x.x.x", () => {
    expect(() => validateAuditUrl("http://10.20.30.40")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("rejects 172.16.x.x through 172.31.x.x", () => {
    expect(() => validateAuditUrl("http://172.16.5.4")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
    expect(() => validateAuditUrl("http://172.31.255.255")).toThrow(
      "Local, loopback and private network targets are not allowed.",
    );
  });

  it("accepts a normal public domain", () => {
    expect(validateAuditUrl("https://www.example.org/about?ref=nav")).toBe(
      "https://www.example.org/about?ref=nav",
    );
  });
});
