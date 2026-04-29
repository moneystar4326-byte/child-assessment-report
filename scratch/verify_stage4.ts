import { analyzeTaekwondoProgram } from '../src/utils/taekwondoEngine';

function printTaekwondoAnalysis(name: string, bands: any, age: number) {
  console.log(`\n=== 테스트 케이스: ${name} ===`);
  
  const scoring: any = {
    bands,
    needAxes: Object.keys(bands).filter(k => bands[k] === 'supportNeeded')
  };

  const taekwondoResult = analyzeTaekwondoProgram(scoring, age);

  console.log(`\n[심화 수련 안내 (Constraints)]`);
  taekwondoResult.constraints.forEach((c: string) => console.log(`- ${c}`));

  console.log(`\n[겨루기 세부 계획]`);
  const sparring = taekwondoResult.detailedPrograms.find((p: any) => p.title === "겨루기");
  console.log("Caution:", sparring?.caution);
}

const allSupportNeeded = {
  focus: 'supportNeeded',
  emotion: 'supportNeeded',
  social: 'supportNeeded',
  expression: 'supportNeeded',
  selfControl: 'supportNeeded',
  challenge: 'supportNeeded'
};

printTaekwondoAnalysis("김도빈 (전 영역 저점)", allSupportNeeded, 6);
