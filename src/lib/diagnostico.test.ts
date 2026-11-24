import { describe, expect, it } from "vitest";
import { pontuacaoFator } from "./diagnostico";

describe("Não sei / Não se aplica", () => {
  it("conta como respondida e vale 0 ponto", () => {
    const r = pontuacaoFator({ "1.1": -1, "1.2": 2 }, "F1");
    expect(r.pontos).toBe(2);
    expect(r.respondidas).toBe(2);
  });
});
