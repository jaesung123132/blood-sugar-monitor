import type { EvidenceEntry, EvidenceSource } from './types';

const ADA_2026_S2: EvidenceSource = {
  title: 'ADA Standards of Care in Diabetes—2026, Section 2',
  url: 'https://doi.org/10.2337/dc26-S002',
};

const ADA_2026_S3: EvidenceSource = {
  title: 'ADA Standards of Care in Diabetes—2026, Section 3',
  url: 'https://doi.org/10.2337/dc26-S003',
};

const ADA_2026_S5: EvidenceSource = {
  title: 'ADA Standards of Care in Diabetes—2026, Section 5',
  url: 'https://doi.org/10.2337/dc26-S005',
};

const KDA_2025: EvidenceSource = {
  title: '대한당뇨병학회 2025 진료지침 (Diabetes Metab J 2025;49:582-783)',
  url: 'https://doi.org/10.4093/dmj.2025.0469',
};

const WHO_2020_PA: EvidenceSource = {
  title: 'Bull FC, et al. WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med 2020;54:1451-1462',
  url: 'https://bjsm.bmj.com/content/54/24/1451',
};

const KDRI_2025_NEWS: EvidenceSource = {
  title: '2025 한국인 영양소 섭취기준 발표 보도 (보건복지부, 2025-12-31)',
  url: 'https://www.ddaily.co.kr/page/view/2025123111291718936',
};

/**
 * 근거 등록부 — 앱이 쓰는(또는 쓰지 않기로 한) 의학·영양 근거의 전체 목록입니다.
 *
 * 규칙
 * 1. status가 'verified-primary'인 항목만 requireVerified()로 꺼내 앱 기준값으로 쓸 수 있습니다.
 * 2. 'verified-primary'로 바꾸려면 원문 인용(quote), 원문 위치(location), 확인일(checkedOn)을 반드시 적습니다.
 * 3. 'excluded' 항목에는 쓰지 않기로 한 이유(note)를 반드시 적습니다.
 *
 * 2026-11-27 현재: 모든 항목을 검색 색인과 2차 자료로만 확인했기 때문에
 * 'verified-primary' 항목은 하나도 없습니다. M0-b(원문 검증) 단계에서 하나씩 갱신합니다.
 */
export const EVIDENCE: readonly EvidenceEntry[] = [
  // ── 현재 상태와 진단 기준 ──
  {
    id: 'ada-prediabetes-a1c',
    claim: '당화혈색소 5.7~6.4%는 당뇨병 전단계 범위이다.',
    sources: [ADA_2026_S2],
    status: 'secondary',
  },
  {
    id: 'kda-prediabetes-a1c',
    claim: '대한당뇨병학회 기준에서도 당화혈색소 5.7~6.4%를 당뇨병 전단계로 본다.',
    sources: [KDA_2025],
    status: 'unverified',
  },
  {
    id: 'ada-diabetes-thresholds',
    claim:
      '당화혈색소 6.5% 이상 또는 공복혈당 126 mg/dL 이상은 당뇨병 진단 기준 범위이다. (앱은 안내만 하고 판정하지 않는다)',
    sources: [ADA_2026_S2],
    status: 'unverified',
  },
  {
    id: 'ada-ifg-range',
    claim: '공복혈당 100~125 mg/dL은 당뇨병 전단계 범위이다.',
    sources: [ADA_2026_S2],
    status: 'unverified',
  },
  {
    id: 'a1c-reflects-months',
    claim: '당화혈색소는 지난 약 2~3개월의 평균 혈당을 반영한다.',
    sources: [ADA_2026_S2],
    status: 'unverified',
  },

  // ── 생활습관 교정의 효과 ──
  {
    id: 'dpp-2002',
    claim:
      'DPP(3,234명, 평균 2.8년): 생활습관 프로그램(체중 7% 이상 감량, 주 150분 이상 신체활동 목표)이 당뇨병 발생을 위약 대비 58%, 메트포르민은 31% 줄였다.',
    sources: [
      {
        title: 'Knowler WC, et al. N Engl J Med 2002;346:393-403',
        url: 'https://pubmed.ncbi.nlm.nih.gov/11832527/',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'ada2026-activity-alone',
    claim: 'DPP에서 체중 목표를 달성하지 못해도 주 150분 이상 신체활동만으로 당뇨병 발생이 44% 줄었다.',
    sources: [ADA_2026_S3],
    status: 'secondary',
  },
  {
    id: 'kda2023-prediabetes-lifestyle',
    claim:
      '당뇨병 전단계 성인은 중강도 이상 신체활동을 주 150분 이상 하고, 과체중이나 비만이면 초기 체중의 5% 이상 감량을 유지한다.',
    sources: [
      {
        title: '대한당뇨병학회 2023 진료지침 전문판 (Diabetes Metab J 2024)',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11307112/',
      },
    ],
    status: 'secondary',
  },

  // ── 운동 권장량 ──
  {
    id: 'who2020-aerobic',
    claim: '고령자는 주 150~300분의 중강도 유산소 활동(또는 이에 해당하는 고강도 활동)을 한다.',
    sources: [WHO_2020_PA],
    status: 'secondary',
  },
  {
    id: 'who2020-strength',
    claim: '주요 근육을 모두 쓰는 근력 활동을 주 2일 이상 한다.',
    sources: [WHO_2020_PA],
    status: 'secondary',
  },
  {
    id: 'who2020-multicomponent',
    claim: '고령자는 균형과 근력을 강조한 복합 신체활동을 주 3일 이상 한다.',
    sources: [WHO_2020_PA],
    status: 'secondary',
  },
  {
    id: 'who2020-gradual',
    claim: '적은 양부터 시작해 빈도, 강도, 시간을 점차 늘린다.',
    sources: [WHO_2020_PA],
    status: 'unverified',
  },
  {
    id: 'ada-spread-days',
    claim: '유산소 활동은 주 3일 이상에 나누어 하고, 쉬는 날이 연속 2일을 넘지 않게 한다. (당뇨병 대상 권고 — 전단계 적용 여부 확인 필요)',
    sources: [ADA_2026_S5],
    status: 'unverified',
  },
  {
    id: 'ada2016-sitting',
    claim: '오래 앉아 있을 때는 30분마다 3분 이상 가볍게 움직인다.',
    sources: [
      {
        title: 'Colberg SR, et al. ADA position statement on physical activity/exercise and diabetes (2016) — 보도 자료',
        url: 'https://www.ajmc.com/view/american-diabetes-association-issues-recommendations-for-physical-activity-exercise',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'cdc-talk-test',
    claim: '중강도 활동은 대화는 할 수 있지만 노래는 어려운 정도이다(토크 테스트).',
    sources: [
      {
        title: 'CDC. Measuring Physical Activity Intensity',
        url: 'https://www.cdc.gov/physical-activity-basics/measuring/index.html',
      },
    ],
    status: 'unverified',
  },

  // ── 식후 걷기 ──
  {
    id: 'reynolds2016-postmeal-walk',
    claim:
      '제2형 당뇨병 41명 교차시험: 식사 후 5분 안에 시작한 10분 걷기(하루 3회)가 하루 한 번 30분 걷기보다 식후 혈당을 평균 12%, 저녁 식사 후에는 22% 더 낮췄다.',
    sources: [
      {
        title: 'Reynolds AN, et al. Diabetologia 2016',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27747394/',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'dipietro2013-postmeal-walk',
    claim:
      '당뇨병 위험이 있는 60세 이상 10명: 식후 15분 걷기(3 METs)를 하루 3회 한 경우 45분 연속 걷기보다 저녁 식후 3시간 혈당이 더 낮았다.',
    sources: [
      {
        title: 'DiPietro L, et al. Diabetes Care 2013;36(10):3262-3268',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23761134',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'buffey2022-walking-breaks',
    claim:
      '오래 앉아 있는 중간에 가볍게 걸으면 계속 앉아 있을 때보다 식후 혈당과 인슐린이 낮아지고, 서 있기보다 효과가 크다(교차시험 7편 메타분석).',
    sources: [
      {
        title: 'Buffey AJ, et al. Sports Med 2022',
        url: 'https://link.springer.com/article/10.1007/s40279-022-01649-4',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'exercise-timing-2023',
    claim: '식전보다 식후에 운동할 때 식후 혈당 상승 폭이 더 줄었다(메타분석).',
    sources: [
      {
        title: 'Sports Med 2023 메타분석',
        url: 'https://pubmed.ncbi.nlm.nih.gov/36715875/',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'postmeal-cardiac-caution',
    claim: '식후에는 심장 부담이 늘 수 있어 심장 질환이 있으면 식후 운동 전에 주치의와 상의가 필요하다(전문가 의견 보도).',
    sources: [
      {
        title: 'UPI 보도 (2016-10-18)',
        url: 'https://www.upi.com/Health_News/2016/10/18/Have-type-2-diabetes-Try-walking-after-eating/9621476807286/',
      },
    ],
    status: 'secondary',
    note: '전문가 의견이므로 수치 근거로는 쓰지 않고, 주치의 상담을 권하는 보수적 안내에만 쓴다.',
  },

  // ── 식사 ──
  {
    id: 'carbs-postprandial',
    claim: '탄수화물은 식후 혈당에 가장 큰 영향을 주는 영양소이다.',
    sources: [
      {
        title: 'Evert AB, et al. Nutrition Therapy for Adults With Diabetes or Prediabetes: A Consensus Report. Diabetes Care 2019',
        url: 'https://doi.org/10.2337/dci19-0014',
      },
    ],
    status: 'unverified',
  },
  {
    id: 'kdri2025-ranges',
    claim:
      '2025 한국인 영양소 섭취기준: 탄수화물은 에너지의 50~65%, 총당류는 20% 이내, 첨가당은 10% 이내로 제한하고, 가당 음료는 가능한 한 줄인다.',
    sources: [KDRI_2025_NEWS],
    status: 'secondary',
  },
  {
    id: 'kdri2025-fiber',
    claim: '2025 한국인 영양소 섭취기준의 성인 식이섬유 충분섭취량 (수치 미확인 — 확인 전까지 목표선 없이 g만 표시)',
    sources: [
      {
        title: '보건복지부 2025 한국인 영양소 섭취기준 원문 (확인 필요)',
        url: 'https://www.mohw.go.kr/',
      },
    ],
    status: 'unverified',
  },
  {
    id: 'who2015-free-sugars',
    claim: 'WHO: 유리당은 총 에너지의 10% 미만(강력 권고), 가능하면 5% 미만, 약 25 g(조건부 권고)으로 줄인다.',
    sources: [
      {
        title: 'WHO. Guideline: Sugars intake for adults and children (2015)',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK285538/',
      },
    ],
    status: 'secondary',
    note: '식약처 DB는 대부분 총당류만 제공하므로 유리당 계산에는 쓰지 않고 교육 문구로만 쓴다.',
  },
  {
    id: 'ada2026-eating-patterns',
    claim: '당뇨병 전단계에는 지중해식이나 저탄수화물 같은 근거 기반 식사 패턴을 권고한다.',
    sources: [ADA_2026_S3],
    status: 'secondary',
  },
  {
    id: 'kda-exchange-grain',
    claim:
      '식품교환표 곡류군 1교환단위는 탄수화물 23 g, 단백질 2 g, 100 kcal이며 밥 70 g(1/3공기)에 해당한다. 2023년 제4판에서도 기준이 유지되었다.',
    sources: [
      {
        title: '대한당뇨병학회 식품교환표 제4판(2023) 개정 관련 자료',
        url: 'https://synapse.koreamed.org/articles/1516086657',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'atwater-carbohydrate',
    claim: '탄수화물 1 g은 약 4 kcal로 환산한다(에너지 비율 계산에 사용).',
    sources: [
      {
        title: 'FAO. Food energy – methods of analysis and conversion factors (2003)',
        url: 'https://www.fao.org/3/y5022e/y5022e00.htm',
      },
    ],
    status: 'unverified',
  },

  // ── 안전 ──
  {
    id: 'exercise-warning-signs',
    claim: '운동 중 가슴 통증이나 압박감, 심한 숨참, 어지러움, 식은땀은 즉시 멈추고 도움을 받아야 하는 경고 증상이다.',
    sources: [
      {
        title: 'American Heart Association. Warning Signs of a Heart Attack',
        url: 'https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack',
      },
    ],
    status: 'unverified',
  },
  {
    id: 'hypoglycemia-meds-exercise',
    claim: '인슐린이나 일부 혈당약(인슐린 분비 촉진제)을 쓰는 사람은 운동할 때 저혈당에 주의해야 한다.',
    sources: [ADA_2026_S5],
    status: 'unverified',
  },

  // ── AI 사진 분석과 데이터 출처 ──
  {
    id: 'llm-photo-accuracy-2025',
    claim: '음식 사진 52장에서 ChatGPT-4o와 Claude 3.5 Sonnet의 중량 추정 평균 오차는 36.3%, 37.3%, 열량은 35.8%였다.',
    sources: [
      {
        title: 'Fridolfsson J, et al. Curr Dev Nutr 2025',
        url: 'https://doi.org/10.1016/j.cdnut.2025.107556',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'diabot-gpt4o-2025',
    claim: '맞춤형 GPT-4o의 탄수화물 추정 오차는 실제 계량 기록 대비 ±15~20% 수준이었다.',
    sources: [
      {
        title: 'Diabot-GPT-4o validation against weighed food records. Am J Clin Nutr 2025',
        url: 'https://pubmed.ncbi.nlm.nih.gov/41138916/',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'claude-vision-limits',
    claim: 'Claude의 이미지 개수 세기는 근사치이고, 의료 판단을 대신할 수 없으며, 정밀도가 필요한 작업은 사람이 확인해야 한다.',
    sources: [
      {
        title: 'Anthropic. Vision (Claude 공식 문서)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/vision',
      },
    ],
    status: 'secondary',
  },
  {
    id: 'mfds-kfind',
    claim:
      '식약처 식품영양성분 DB(K-FIND)는 약 32.7만 건, 영양성분 130여 종을 공공데이터포털 Open API로 제공하며 이용 허락 범위에 제한이 없다.',
    sources: [
      {
        title: '식약처 K-FIND 출범 보도 (2026-07-16)',
        url: 'https://www.news1.kr/bio/healthcare/6237199',
      },
      {
        title: '공공데이터포털 식품영양성분 DB 메타데이터',
        url: 'https://www.data.go.kr/biz/dcat/metadata/15127578.do',
      },
    ],
    status: 'secondary',
  },

  // ── 쓰지 않기로 한 것 ──
  {
    id: 'excluded-meal-to-a1c',
    claim: '한 끼 식사를 당화혈색소 상승분(%)으로 환산하기',
    sources: [],
    status: 'excluded',
    note: '당화혈색소는 수개월의 평균 혈당을 반영하고 개인차가 있어, 한 끼의 기여도를 수치로 분리하는 검증된 모델이 없다.',
  },
  {
    id: 'excluded-exercise-offset',
    claim: '음식을 상쇄하는 운동 시간 공식',
    sources: [],
    status: 'excluded',
    note: '식사량과 운동량의 혈당 상쇄 관계를 수치로 만든 검증 공식이 없다. 식후 걷기 연구는 정해진 처방의 효과만 보여 준다.',
  },
  {
    id: 'excluded-burn-off-minutes',
    claim: '식사 열량을 "걷기 N분"으로 환산해 표시하기',
    sources: [
      {
        title: 'Willis EA, et al. Older Adult Compendium of Physical Activities. J Sport Health Sci 2024;13:13-17',
        url: 'https://research.bond.edu.au/en/publications/older-adult-compendium-of-physical-activities-energy-costs-of-hum/',
      },
    ],
    status: 'excluded',
    note: '계산식은 있지만 "먹은 만큼 운동으로 갚아야 한다"는 오해와 과한 운동을 부를 수 있어 쓰지 않기로 했다(2026-11-27 사용자 확인).',
  },
  {
    id: 'excluded-eag',
    claim: '당화혈색소를 개인 평균혈당(eAG)으로 환산하기',
    sources: [
      {
        title: 'Nathan DM, et al. Diabetes Care 2008;31(8):1473-1478',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18540046/',
      },
    ],
    status: 'excluded',
    note: '환산 공식은 있지만 후속 연구(2010, 2013)에서 개인 단위로는 오차가 크다는 지적이 있다.',
  },
  {
    id: 'excluded-mixed-meal-gi',
    claim: '혼합 식사의 GI(혈당지수)나 GL(혈당부하) 점수',
    sources: [
      {
        title: 'Atkinson FS, et al. International tables of glycemic index and glycemic load values 2021. Am J Clin Nutr 2021',
        url: 'https://nutrition.org/ajcn-publishes-international-tables-of-glycemic-index-and-glycemic-load-values-2021-a-systematic-review/',
      },
    ],
    status: 'excluded',
    note: '국제 GI 표도 지역 음식 자료가 부족하다고 밝히고 있고, 한식 혼합 식사의 값은 불확실하다.',
  },
];
