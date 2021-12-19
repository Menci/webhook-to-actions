import evaljs from "evaljs";

export function createImmutableContext(context: Record<string, unknown>) {
  const json = JSON.stringify(context);
  return {
    eval(code: string): unknown {
      const environment = new evaljs.Environment([JSON.parse(json)]);
      const generatorFunction = environment.gen(code) as GeneratorFunction;
      const generator = generatorFunction();
      while (1) {
        const result = generator.next();
        if (result.done) return result.value;
      }
    }
  };
}
