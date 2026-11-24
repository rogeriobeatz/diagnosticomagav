import { describe, expect, it } from "vitest";
import { pontuacaoFator, resultadoCompleto } from "./diagnostico";

describe("Não sei / Não se aplica", () => {
  it("fica fora da conta: reduz o máximo do fator em 2", () => {
    const r = pontuacaoFator({ "1.1": -1, "1.2": 2 }, "F1");
    expect(r.pontos).toBe(2);
    expect(r.maximo).toBe(14);
  });

  it("reduz a nota máxima geral e o percentual usa o novo máximo", () => {
    const res = resultadoCompleto({ "1.1": -1, "1.2": 2 });
    expect(res.maximo).toBe(94);
    expect(res.percentual).toBe(Math.round((2 / 94) * 100));
  });
});
