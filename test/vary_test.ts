import {
  assert,
  assertStrictEq,
  assertThrows,
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { vary, append } from "../mod.ts";

const { test } = Deno;

test("vary(res, field) arguments field should accept string", function () {
  const header = new Headers();
  vary(header, "foo");
  assertStrictEq(header.get("vary"), "foo");
});

test("vary(res, field) arguments field should accept array of string", function () {
  const header = new Headers();
  vary(header, ["foo", "bar"]);
  assertStrictEq(header.get("vary"), "foo, bar");
});

test("vary(res, field) arguments field should accept string that is Vary header", function () {
  const header = new Headers();
  vary(header, "foo, bar");
  assertStrictEq(header.get("vary"), "foo, bar");
});

test('vary(res, field) arguments field should not allow separator ":"', function () {
  const header = new Headers();
  assertThrows(
    () => vary(header, "invalid:header"),
    TypeError,
    "field argument contains an invalid header name `invalid:header`",
  );
});

test('vary(res, field) arguments field should not allow separator " "', function () {
  const header = new Headers();
  assertThrows(
    () => vary(header, "invalid header"),
    TypeError,
    "field argument contains an invalid header name `invalid header`",
  );
});

test("vary(res, field) when no Vary should set value", function () {
  const header = new Headers();
  vary(header, "Origin");
  assertStrictEq(header.get("vary"), "Origin");
});

test("vary(res, field) when no Vary should set value with multiple calls", function () {
  const header = new Headers();
  vary(header, ["Origin", "User-Agent"]);
  assertStrictEq(header.get("vary"), "Origin, User-Agent");
});

test("vary(res, field) when no Vary should preserve case", function () {
  const header = new Headers();
  vary(header, ["ORIGIN", "user-agent", "AccepT"]);
  assertStrictEq(header.get("vary"), "ORIGIN, user-agent, AccepT");
});

test("vary(res, field) when no Vary should not set Vary on empty array", function () {
  const header = new Headers();
  vary(header, []);
  shouldNotHaveHeader(header);
});

test("vary(res, field) when existing Vary should set value", function () {
  const header = new Headers();
  alterVary("Accept", "Origin", header);
  assertStrictEq(header.get("vary"), "Accept, Origin");
});

test("vary(res, field) when existing Vary should set value with multiple calls", function () {
  const header = new Headers([["Vary", "Accept"]]);
  vary(header, "Origin");
  vary(header, "User-Agent");
  assertStrictEq(header.get("vary"), "Accept, Origin, User-Agent");
});

test("vary(res, field) when existing Vary should not duplicate existing value", function () {
  const header = new Headers();
  alterVary("Accept", "Accept", header);
  assertStrictEq(header.get("vary"), "Accept");
});

test("vary(res, field) when existing Vary should compare case-insensitive", function () {
  const header = new Headers();
  alterVary("Accept", "accEPT", header);
  assertStrictEq(header.get("vary"), "Accept");
});

test("vary(res, field) when existing Vary should preserve case", function () {
  const header = new Headers();
  alterVary("AccepT", ["accEPT", "ORIGIN"], header);
  assertStrictEq(header.get("vary"), "AccepT, ORIGIN");
});

test("vary(res, field) when Vary: * should set value", function () {
  const header = new Headers();
  vary(header, "*");
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when Vary: * should act as if all values already set", function () {
  const header = new Headers();
  alterVary("*", ["Origin", "User-Agent"], header);
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when Vary: * should erradicate existing values", function () {
  const header = new Headers();
  alterVary("Accept, Accept-Encoding", "*", header);
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when Vary: * should update bad existing header", function () {
  const header = new Headers();
  alterVary("Accept, Accept-Encoding, *", "Origin", header);
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when field is string should set value", function () {
  const header = new Headers();
  vary(header, "Accept");
  assertStrictEq(header.get("vary"), "Accept");
});

test("vary(res, field) when field is string should set value when vary header", function () {
  const header = new Headers();
  vary(header, "Accept, Accept-Encoding");
  assertStrictEq(header.get("vary"), "Accept, Accept-Encoding");
});

test("vary(res, field) when field is string should acept LWS", function () {
  const header = new Headers();
  vary(header, "  Accept     ,     Origin    ");
  assertStrictEq(header.get("vary"), "Accept, Origin");
});

test("vary(res, field) when field is string should handle contained *", function () {
  const header = new Headers();
  vary(header, "Accept,*");
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when field is array should set value", function () {
  const header = new Headers();
  vary(header, ["Accept", "Accept-Language"]);
  assertStrictEq(header.get("vary"), "Accept, Accept-Language");
});

test("vary(res, field) when field is array should ignore double-entries", function () {
  const header = new Headers();
  vary(header, ["Accept", "Accept"]);
  assertStrictEq(header.get("vary"), "Accept");
});

test("vary(res, field) when field is array should be case-insensitive", function () {
  const header = new Headers();
  vary(header, ["Accept", "ACCEPT"]);
  assertStrictEq(header.get("vary"), "Accept");
});

test("vary(res, field) when field is array should handle contained *", function () {
  const header = new Headers();
  vary(header, ["Origin", "User-Agent", "*", "Accept"]);
  assertStrictEq(header.get("vary"), "*");
});

test("vary(res, field) when field is array should handle existing values", function () {
  const header = new Headers();
  alterVary(
    "Accept, Accept-Encoding",
    ["origin", "accept", "accept-charset"],
    header,
  );
  assertStrictEq(
    header.get("vary"),
    "Accept, Accept-Encoding, origin, accept-charset",
  );
});

test("append(header, field) arguments field should accept string", function () {
  append("", "foo");
  // assert.doesNotThrow(append.bind(null, '', 'foo'))
});

test("append(header, field) arguments field should accept string that is Vary header", function () {
  append("", "foo, bar");
  // assert.doesNotThrow(append.bind(null, '', 'foo, bar'))
});

test("append(header, field) arguments field should accept array of string", function () {
  append("", ["foo", "bar"]);
  // assert.doesNotThrow(append.bind(null, '', ['foo', 'bar']))
});

test('append(header, field) arguments field should not allow separator ":"', function () {
  assertThrows(
    () => append("", "invalid:header"),
    TypeError,
    "field argument contains an invalid header name `invalid:header`",
  );
});

test('append(header, field) arguments field should not allow separator " "', function () {
  assertThrows(
    () => append("", "invalid header"),
    TypeError,
    "field argument contains an invalid header name `invalid header`",
  );
});

test("append(header, field) arguments field should not allow non-token characters", function () {
  assertThrows(
    () => append("", "invalid\nheader"),
    TypeError,
    "invalid header name",
  );
  assertThrows(
    () => append("", "invalid\u0080header"),
    TypeError,
    "invalid header name",
  );
});

test("append(header, field) when header empty should set value", function () {
  assertStrictEq(append("", "Origin"), "Origin");
});

test("append(header, field) when header empty should set value with array", function () {
  assertStrictEq(append("", ["Origin", "User-Agent"]), "Origin, User-Agent");
});

test("append(header, field) when header empty should preserve case", function () {
  assertStrictEq(
    append("", ["ORIGIN", "user-agent", "AccepT"]),
    "ORIGIN, user-agent, AccepT",
  );
});

test("append(header, field) when header has values should set value", function () {
  assertStrictEq(append("Accept", "Origin"), "Accept, Origin");
});

test("append(header, field) when header has values should set value with array", function () {
  assertStrictEq(
    append("Accept", ["Origin", "User-Agent"]),
    "Accept, Origin, User-Agent",
  );
});

test("append(header, field) when header has values should not duplicate existing value", function () {
  assertStrictEq(append("Accept", "Accept"), "Accept");
});

test("append(header, field) when header has values should compare case-insensitive", function () {
  assertStrictEq(append("Accept", "accEPT"), "Accept");
});

test("append(header, field) when header has values should preserve case", function () {
  assertStrictEq(append("Accept", "AccepT"), "Accept");
});

test("append(header, field) when * should set value", function () {
  assertStrictEq(append("", "*"), "*");
});

test("append(header, field) when * should act as if all values already set", function () {
  assertStrictEq(append("*", "Origin"), "*");
});

test("append(header, field) when * should erradicate existing values", function () {
  assertStrictEq(append("Accept, Accept-Encoding", "*"), "*");
});

test("append(header, field) when * should update bad existing header", function () {
  assertStrictEq(append("Accept, Accept-Encoding, *", "Origin"), "*");
});

test("append(header, field) when field is string should set value", function () {
  assertStrictEq(append("", "Accept"), "Accept");
});

test("append(header, field) when field is string should set value when vary header", function () {
  assertStrictEq(
    append("", "Accept, Accept-Encoding"),
    "Accept, Accept-Encoding",
  );
});

test("append(header, field) when field is string should acept LWS", function () {
  assertStrictEq(append("", "  Accept     ,     Origin    "), "Accept, Origin");
});

test("append(header, field) when field is string should handle contained *", function () {
  assertStrictEq(append("", "Accept,*"), "*");
});

test("append(header, field) when field is array should set value", function () {
  assertStrictEq(
    append("", ["Accept", "Accept-Language"]),
    "Accept, Accept-Language",
  );
});

test("append(header, field) when field is array should ignore double-entries", function () {
  assertStrictEq(append("", ["Accept", "Accept"]), "Accept");
});

test("append(header, field) when field is array should be case-insensitive", function () {
  assertStrictEq(append("", ["Accept", "ACCEPT"]), "Accept");
});

test("append(header, field) when field is array should handle contained *", function () {
  assertStrictEq(append("", ["Origin", "User-Agent", "*", "Accept"]), "*");
});

test("append(header, field) when field is array should handle existing values", function () {
  assertStrictEq(
    append("Accept, Accept-Encoding", ["origin", "accept", "accept-charset"]),
    "Accept, Accept-Encoding, origin, accept-charset",
  );
});

function alterVary(h: string, field: string | string[], header: Headers) {
  header.set("Vary", h);
  vary(header, field);
}

function shouldNotHaveHeader(header: Headers) {
  assert(!header.has("vary"), "should not have header vary");
}
