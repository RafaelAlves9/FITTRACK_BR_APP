/**
 * Food Catalog - Offline-first data with TACO Integration
 * Catálogo de alimentos com informações nutricionais baseado na Tabela TACO
 */

export interface Food {
  id: string;
  name: string;
  category: string;
  serving: {
    unit: string; // 'g', 'ml', 'colher', 'xícara', 'unidade'
    amount: number;
  };
  nutrition: {
    calories: number; // kcal
    protein: number; // gramas
    carbs: number; // gramas
    fat: number; // gramas
  };
}

// Função helper para converter alimentos TACO para nosso formato
const convertTacoFood = (tacoFood: any): Food => {
  // Função helper para converter valores TACO (que podem ser "Tr", "NA", "" ou números)
  const parseNutrient = (value: any): number => {
    if (value === "Tr" || value === "NA" || value === "" || value === null || value === undefined) {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  return {
    id: `taco-${tacoFood.id}`,
    name: tacoFood.description,
    category: tacoFood.category || 'Outros',
    serving: { unit: 'g', amount: 100 },
    nutrition: {
      calories: parseNutrient(tacoFood.energy_kcal),
      protein: parseNutrient(tacoFood.protein_g),
      carbs: parseNutrient(tacoFood.carbohydrate_g),
      fat: parseNutrient(tacoFood.lipid_g),
    }
  };
};

// Catálogo base de alimentos (já existente)
const baseFoodCatalog: Food[] = [
  {
    "id": "abacate-cru",
    "name": "Abacate, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 96,
      "protein": 1.24,
      "carbs": 6.03,
      "fat": 8.4
    }
  },
  {
    "id": "abacaxi-cru",
    "name": "Abacaxi, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 48,
      "protein": 0.86,
      "carbs": 12.33,
      "fat": 0.12
    }
  },
  {
    "id": "abacaxi-polpa-congelada",
    "name": "Abacaxi, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 31,
      "protein": 0.47,
      "carbs": 7.8,
      "fat": 0.11
    }
  },
  {
    "id": "abadejo-file-congelado-assado",
    "name": "Abadejo, filé, congelado, assado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 112,
      "protein": 23.53,
      "carbs": 0,
      "fat": 1.24
    }
  },
  {
    "id": "abadejo-file-congelado-cru",
    "name": "Abadejo, filé, congelado, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 59,
      "protein": 13.08,
      "carbs": 0,
      "fat": 0.36
    }
  },
  {
    "id": "abadejo-file-congelado-grelhado",
    "name": "Abadejo, filé, congelado, grelhado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 130,
      "protein": 27.61,
      "carbs": 0,
      "fat": 1.3
    }
  },
  {
    "id": "abadejo-file-congelado-cozido",
    "name": "Abadejo, filé, congelado,cozido",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 91,
      "protein": 19.35,
      "carbs": 0,
      "fat": 0.94
    }
  },
  {
    "id": "abiu-cru",
    "name": "Abiu, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 62,
      "protein": 0.83,
      "carbs": 14.93,
      "fat": 0.7
    }
  },
  {
    "id": "abobora-cabotian-cozida",
    "name": "Abóbora, cabotian, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 48,
      "protein": 1.44,
      "carbs": 10.76,
      "fat": 0.73
    }
  },
  {
    "id": "abobora-cabotian-crua",
    "name": "Abóbora, cabotian, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 1.75,
      "carbs": 8.36,
      "fat": 0.54
    }
  },
  {
    "id": "abobora-menina-brasileira-crua",
    "name": "Abóbora, menina brasileira, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 0.61,
      "carbs": 3.3,
      "fat": 0
    }
  },
  {
    "id": "abobora-moranga-crua",
    "name": "Abóbora, moranga, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 12,
      "protein": 0.96,
      "carbs": 2.67,
      "fat": 0.06
    }
  },
  {
    "id": "abobora-moranga-refogada",
    "name": "Abóbora, moranga, refogada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 29,
      "protein": 0.39,
      "carbs": 5.98,
      "fat": 0.8
    }
  },
  {
    "id": "abobora-pescoco-crua",
    "name": "Abóbora, pescoço, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 24,
      "protein": 0.67,
      "carbs": 6.12,
      "fat": 0.12
    }
  },
  {
    "id": "abobrinha-italiana-cozida",
    "name": "Abobrinha, italiana, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 15,
      "protein": 1.13,
      "carbs": 2.98,
      "fat": 0.2
    }
  },
  {
    "id": "abobrinha-italiana-crua",
    "name": "Abobrinha, italiana, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 1.14,
      "carbs": 4.29,
      "fat": 0.14
    }
  },
  {
    "id": "abobrinha-italiana-refogada",
    "name": "Abobrinha, italiana, refogada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 24,
      "protein": 1.07,
      "carbs": 4.19,
      "fat": 0.82
    }
  },
  {
    "id": "abobrinha-paulista-crua",
    "name": "Abobrinha, paulista, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 31,
      "protein": 0.64,
      "carbs": 7.87,
      "fat": 0.14
    }
  },
  {
    "id": "acai-polpa-com-xarope-de-guarana-e-glucose",
    "name": "Açaí, polpa, com xarope de guaraná e glucose",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 110,
      "protein": 0.72,
      "carbs": 21.46,
      "fat": 3.66
    }
  },
  {
    "id": "acai-polpa-congelada",
    "name": "Açaí, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 58,
      "protein": 0.8,
      "carbs": 6.21,
      "fat": 3.94
    }
  },
  {
    "id": "acaraje",
    "name": "Acarajé",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 289,
      "protein": 8.35,
      "carbs": 19.11,
      "fat": 19.93
    }
  },
  {
    "id": "acelga-crua",
    "name": "Acelga, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 21,
      "protein": 1.44,
      "carbs": 4.63,
      "fat": 0.11
    }
  },
  {
    "id": "acerola-crua",
    "name": "Acerola, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 33,
      "protein": 0.91,
      "carbs": 7.97,
      "fat": 0.21
    }
  },
  {
    "id": "acerola-polpa-congelada",
    "name": "Acerola, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 22,
      "protein": 0.59,
      "carbs": 5.54,
      "fat": 0
    }
  },
  {
    "id": "achocolatado-po",
    "name": "Achocolatado, pó",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 401,
      "protein": 4.2,
      "carbs": 91.18,
      "fat": 2.17
    }
  },
  {
    "id": "acucar-cristal",
    "name": "Açúcar, cristal",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 387,
      "protein": 0.32,
      "carbs": 99.61,
      "fat": 0
    }
  },
  {
    "id": "acucar-mascavo",
    "name": "Açúcar, mascavo",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 369,
      "protein": 0.76,
      "carbs": 94.45,
      "fat": 0.09
    }
  },
  {
    "id": "acucar-refinado",
    "name": "Açúcar, refinado",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 387,
      "protein": 0.32,
      "carbs": 99.54,
      "fat": 0
    }
  },
  {
    "id": "agriao-cru",
    "name": "Agrião, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 17,
      "protein": 2.69,
      "carbs": 2.25,
      "fat": 0.24
    }
  },
  {
    "id": "aipo-cru",
    "name": "Aipo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 0.76,
      "carbs": 4.27,
      "fat": 0.07
    }
  },
  {
    "id": "alface-americana-crua",
    "name": "Alface, americana, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 9,
      "protein": 0.61,
      "carbs": 1.75,
      "fat": 0.13
    }
  },
  {
    "id": "alface-crespa-crua",
    "name": "Alface, crespa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 11,
      "protein": 1.35,
      "carbs": 1.7,
      "fat": 0.16
    }
  },
  {
    "id": "alface-lisa-crua",
    "name": "Alface, lisa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 1.69,
      "carbs": 2.43,
      "fat": 0.12
    }
  },
  {
    "id": "alface-roxa-crua",
    "name": "Alface, roxa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 13,
      "protein": 0.91,
      "carbs": 2.49,
      "fat": 0.19
    }
  },
  {
    "id": "alfavaca-crua",
    "name": "Alfavaca, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 29,
      "protein": 2.66,
      "carbs": 5.24,
      "fat": 0.48
    }
  },
  {
    "id": "alho-poro-cru",
    "name": "Alho-poró, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 32,
      "protein": 1.41,
      "carbs": 6.88,
      "fat": 0.14
    }
  },
  {
    "id": "alho-cru",
    "name": "Alho, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 113,
      "protein": 7.01,
      "carbs": 23.91,
      "fat": 0.22
    }
  },
  {
    "id": "almeirao-cru",
    "name": "Almeirão, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 18,
      "protein": 1.77,
      "carbs": 3.34,
      "fat": 0.22
    }
  },
  {
    "id": "almeirao-refogado",
    "name": "Almeirão, refogado",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 65,
      "protein": 1.7,
      "carbs": 5.7,
      "fat": 4.85
    }
  },
  {
    "id": "ameixa-calda-enlatada",
    "name": "Ameixa, calda, enlatada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 183,
      "protein": 0.41,
      "carbs": 46.89,
      "fat": 0
    }
  },
  {
    "id": "ameixa-crua",
    "name": "Ameixa, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 53,
      "protein": 0.77,
      "carbs": 13.85,
      "fat": 0
    }
  },
  {
    "id": "ameixa-em-calda-enlatada-drenada",
    "name": "Ameixa, em calda, enlatada, drenada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 177,
      "protein": 1.02,
      "carbs": 47.66,
      "fat": 0.28
    }
  },
  {
    "id": "amendoa-torrada-salgada",
    "name": "Amêndoa, torrada, salgada",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 581,
      "protein": 18.55,
      "carbs": 29.55,
      "fat": 47.32
    }
  },
  {
    "id": "amendoim-grao-cru",
    "name": "Amendoim, grão, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 544,
      "protein": 27.19,
      "carbs": 20.31,
      "fat": 43.85
    }
  },
  {
    "id": "amendoim-torrado-salgado",
    "name": "Amendoim, torrado, salgado",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 606,
      "protein": 22.48,
      "carbs": 18.7,
      "fat": 53.96
    }
  },
  {
    "id": "apresuntado",
    "name": "Apresuntado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 129,
      "protein": 13.45,
      "carbs": 2.86,
      "fat": 6.69
    }
  },
  {
    "id": "arroz-carreteiro",
    "name": "Arroz carreteiro",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 154,
      "protein": 10.83,
      "carbs": 11.58,
      "fat": 7.12
    }
  },
  {
    "id": "arroz-integral-cozido",
    "name": "Arroz, integral, cozido",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 124,
      "protein": 2.59,
      "carbs": 25.81,
      "fat": 1
    }
  },
  {
    "id": "arroz-integral-cru",
    "name": "Arroz, integral, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 360,
      "protein": 7.32,
      "carbs": 77.45,
      "fat": 1.86
    }
  },
  {
    "id": "arroz-tipo-1-cozido",
    "name": "Arroz, tipo 1, cozido",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 128,
      "protein": 2.52,
      "carbs": 28.06,
      "fat": 0.23
    }
  },
  {
    "id": "arroz-tipo-1-cru",
    "name": "Arroz, tipo 1, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 358,
      "protein": 7.16,
      "carbs": 78.76,
      "fat": 0.34
    }
  },
  {
    "id": "arroz-tipo-2-cozido",
    "name": "Arroz, tipo 2, cozido",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 130,
      "protein": 2.57,
      "carbs": 28.19,
      "fat": 0.36
    }
  },
  {
    "id": "arroz-tipo-2-cru",
    "name": "Arroz, tipo 2, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 358,
      "protein": 7.24,
      "carbs": 78.88,
      "fat": 0.28
    }
  },
  {
    "id": "atemoia-crua",
    "name": "Atemóia, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 97,
      "protein": 0.97,
      "carbs": 25.33,
      "fat": 0.3
    }
  },
  {
    "id": "atum-conserva-em-oleo",
    "name": "Atum, conserva em óleo",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 166,
      "protein": 26.19,
      "carbs": 0,
      "fat": 6
    }
  },
  {
    "id": "atum-fresco-cru",
    "name": "Atum, fresco, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 118,
      "protein": 25.68,
      "carbs": 0,
      "fat": 0.87
    }
  },
  {
    "id": "aveia-flocos-crua",
    "name": "Aveia, flocos, crua",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 394,
      "protein": 13.92,
      "carbs": 66.64,
      "fat": 8.5
    }
  },
  {
    "id": "azeite-de-dende",
    "name": "Azeite, de dendê",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "azeite-de-oliva-extra-virgem",
    "name": "Azeite, de oliva, extra virgem",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "azeitona-preta-conserva",
    "name": "Azeitona, preta, conserva",
    "category": "Outros alimentos industrializados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 194,
      "protein": 1.16,
      "carbs": 5.54,
      "fat": 20.35
    }
  },
  {
    "id": "azeitona-verde-conserva",
    "name": "Azeitona, verde, conserva",
    "category": "Outros alimentos industrializados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 137,
      "protein": 0.95,
      "carbs": 4.1,
      "fat": 14.22
    }
  },
  {
    "id": "bacalhau-salgado-cru",
    "name": "Bacalhau, salgado, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 136,
      "protein": 29.04,
      "carbs": 0,
      "fat": 1.32
    }
  },
  {
    "id": "bacalhau-salgado-refogado",
    "name": "Bacalhau, salgado, refogado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 140,
      "protein": 23.98,
      "carbs": 1.22,
      "fat": 3.61
    }
  },
  {
    "id": "baiao-de-dois-arroz-e-feijao-de-corda",
    "name": "Baião de dois, arroz e feijão-de-corda",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 136,
      "protein": 6.24,
      "carbs": 20.42,
      "fat": 3.23
    }
  },
  {
    "id": "banana-da-terra-crua",
    "name": "Banana, da terra, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 128,
      "protein": 1.43,
      "carbs": 33.67,
      "fat": 0.24
    }
  },
  {
    "id": "banana-doce-em-barra",
    "name": "Banana, doce em barra",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 280,
      "protein": 2.17,
      "carbs": 75.67,
      "fat": 0.05
    }
  },
  {
    "id": "banana-figo-crua",
    "name": "Banana, figo, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 105,
      "protein": 1.13,
      "carbs": 27.8,
      "fat": 0.14
    }
  },
  {
    "id": "banana-maca-crua",
    "name": "Banana, maçã, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 87,
      "protein": 1.75,
      "carbs": 22.34,
      "fat": 0.06
    }
  },
  {
    "id": "banana-nanica-crua",
    "name": "Banana, nanica, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 92,
      "protein": 1.4,
      "carbs": 23.85,
      "fat": 0.12
    }
  },
  {
    "id": "banana-ouro-crua",
    "name": "Banana, ouro, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 112,
      "protein": 1.48,
      "carbs": 29.34,
      "fat": 0.21
    }
  },
  {
    "id": "banana-pacova-crua",
    "name": "Banana, pacova, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 78,
      "protein": 1.23,
      "carbs": 20.31,
      "fat": 0.08
    }
  },
  {
    "id": "banana-prata-crua",
    "name": "Banana, prata, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 98,
      "protein": 1.27,
      "carbs": 25.96,
      "fat": 0.07
    }
  },
  {
    "id": "barreado",
    "name": "Barreado",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 165,
      "protein": 18.27,
      "carbs": 0.24,
      "fat": 9.53
    }
  },
  {
    "id": "batata-baroa-cozida",
    "name": "Batata, baroa, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 80,
      "protein": 0.85,
      "carbs": 18.95,
      "fat": 0.17
    }
  },
  {
    "id": "batata-baroa-crua",
    "name": "Batata, baroa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 101,
      "protein": 1.05,
      "carbs": 23.98,
      "fat": 0.17
    }
  },
  {
    "id": "batata-doce-cozida",
    "name": "Batata, doce, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 77,
      "protein": 0.64,
      "carbs": 18.42,
      "fat": 0.09
    }
  },
  {
    "id": "batata-doce-crua",
    "name": "Batata, doce, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 118,
      "protein": 1.26,
      "carbs": 28.2,
      "fat": 0.13
    }
  },
  {
    "id": "batata-frita-tipo-chips-industrializada",
    "name": "Batata, frita, tipo chips, industrializada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 543,
      "protein": 5.58,
      "carbs": 51.22,
      "fat": 36.62
    }
  },
  {
    "id": "batata-inglesa-cozida",
    "name": "Batata, inglesa, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 52,
      "protein": 1.16,
      "carbs": 11.94,
      "fat": 0
    }
  },
  {
    "id": "batata-inglesa-crua",
    "name": "Batata, inglesa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 64,
      "protein": 1.77,
      "carbs": 14.69,
      "fat": 0
    }
  },
  {
    "id": "batata-inglesa-frita",
    "name": "Batata, inglesa, frita",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 267,
      "protein": 4.97,
      "carbs": 35.64,
      "fat": 13.11
    }
  },
  {
    "id": "batata-inglesa-saute",
    "name": "Batata, inglesa, sauté",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 68,
      "protein": 1.29,
      "carbs": 14.09,
      "fat": 0.9
    }
  },
  {
    "id": "bebida-isotonica-sabores-variados",
    "name": "Bebida isotônica, sabores variados",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 26,
      "protein": 0,
      "carbs": 6.4,
      "fat": 0
    }
  },
  {
    "id": "bebida-lactea-pessego",
    "name": "Bebida láctea, pêssego",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 55,
      "protein": 2.13,
      "carbs": 7.57,
      "fat": 1.91
    }
  },
  {
    "id": "berinjela-cozida",
    "name": "Berinjela, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 0.68,
      "carbs": 4.47,
      "fat": 0.15
    }
  },
  {
    "id": "berinjela-crua",
    "name": "Berinjela, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 20,
      "protein": 1.22,
      "carbs": 4.43,
      "fat": 0.1
    }
  },
  {
    "id": "beterraba-cozida",
    "name": "Beterraba, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 32,
      "protein": 1.29,
      "carbs": 7.23,
      "fat": 0.09
    }
  },
  {
    "id": "beterraba-crua",
    "name": "Beterraba, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 49,
      "protein": 1.95,
      "carbs": 11.11,
      "fat": 0.09
    }
  },
  {
    "id": "bife-a-cavalo-com-contra-file",
    "name": "Bife à cavalo, com contra filé",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 291,
      "protein": 23.66,
      "carbs": 0,
      "fat": 21.15
    }
  },
  {
    "id": "biscoito-doce-maisena",
    "name": "Biscoito, doce, maisena",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 443,
      "protein": 8.07,
      "carbs": 75.23,
      "fat": 11.97
    }
  },
  {
    "id": "biscoito-doce-recheado-com-chocolate",
    "name": "Biscoito, doce, recheado com chocolate",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 472,
      "protein": 6.4,
      "carbs": 70.55,
      "fat": 19.58
    }
  },
  {
    "id": "biscoito-doce-recheado-com-morango",
    "name": "Biscoito, doce, recheado com morango",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 471,
      "protein": 5.72,
      "carbs": 71.01,
      "fat": 19.57
    }
  },
  {
    "id": "biscoito-doce-wafer-recheado-de-chocolate",
    "name": "Biscoito, doce, wafer, recheado de chocolate",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 502,
      "protein": 5.56,
      "carbs": 67.54,
      "fat": 24.67
    }
  },
  {
    "id": "biscoito-doce-wafer-recheado-de-morango",
    "name": "Biscoito, doce, wafer, recheado de morango",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 513,
      "protein": 4.52,
      "carbs": 67.35,
      "fat": 26.4
    }
  },
  {
    "id": "biscoito-polvilho-doce",
    "name": "Biscoito, polvilho doce",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 438,
      "protein": 1.29,
      "carbs": 80.54,
      "fat": 12.25
    }
  },
  {
    "id": "biscoito-salgado-cream-cracker",
    "name": "Biscoito, salgado, cream cracker",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 432,
      "protein": 10.06,
      "carbs": 68.73,
      "fat": 14.44
    }
  },
  {
    "id": "bolinho-de-arroz",
    "name": "Bolinho de arroz",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 274,
      "protein": 8.04,
      "carbs": 41.68,
      "fat": 8.29
    }
  },
  {
    "id": "bolo-mistura-para",
    "name": "Bolo, mistura para",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 419,
      "protein": 6.16,
      "carbs": 84.71,
      "fat": 6.13
    }
  },
  {
    "id": "bolo-pronto-aipim",
    "name": "Bolo, pronto, aipim",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 324,
      "protein": 4.42,
      "carbs": 47.86,
      "fat": 12.75
    }
  },
  {
    "id": "bolo-pronto-chocolate",
    "name": "Bolo, pronto, chocolate",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 410,
      "protein": 6.22,
      "carbs": 54.72,
      "fat": 18.47
    }
  },
  {
    "id": "bolo-pronto-coco",
    "name": "Bolo, pronto, coco",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 333,
      "protein": 5.67,
      "carbs": 52.28,
      "fat": 11.3
    }
  },
  {
    "id": "bolo-pronto-milho",
    "name": "Bolo, pronto, milho",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 311,
      "protein": 4.8,
      "carbs": 45.11,
      "fat": 12.42
    }
  },
  {
    "id": "brocolis-cozido",
    "name": "Brócolis, cozido",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 25,
      "protein": 2.13,
      "carbs": 4.37,
      "fat": 0.46
    }
  },
  {
    "id": "brocolis-cru",
    "name": "Brócolis, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 25,
      "protein": 3.64,
      "carbs": 4.03,
      "fat": 0.27
    }
  },
  {
    "id": "cacao-posta-com-farinha-de-trigo-frita",
    "name": "Cação, posta, com farinha de trigo, frita",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 208,
      "protein": 24.95,
      "carbs": 3.1,
      "fat": 9.95
    }
  },
  {
    "id": "cacao-posta-cozida",
    "name": "Cação, posta, cozida",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 116,
      "protein": 25.59,
      "carbs": 0,
      "fat": 0.75
    }
  },
  {
    "id": "cacao-posta-crua",
    "name": "Cação, posta, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 83,
      "protein": 17.85,
      "carbs": 0,
      "fat": 0.79
    }
  },
  {
    "id": "cacau-cru",
    "name": "Cacau, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 74,
      "protein": 0.95,
      "carbs": 19.41,
      "fat": 0.14
    }
  },
  {
    "id": "cafe-infusao-10",
    "name": "Café, infusão 10%",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 9,
      "protein": 0.71,
      "carbs": 1.48,
      "fat": 0.07
    }
  },
  {
    "id": "cafe-po-torrado",
    "name": "Café, pó, torrado",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 419,
      "protein": 14.7,
      "carbs": 65.75,
      "fat": 11.95
    }
  },
  {
    "id": "caja-manga-cru",
    "name": "Cajá-Manga, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 46,
      "protein": 1.28,
      "carbs": 11.43,
      "fat": 0
    }
  },
  {
    "id": "caja-polpa-congelada",
    "name": "Cajá, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 26,
      "protein": 0.59,
      "carbs": 6.37,
      "fat": 0.17
    }
  },
  {
    "id": "caju-cru",
    "name": "Caju, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 43,
      "protein": 0.97,
      "carbs": 10.29,
      "fat": 0.33
    }
  },
  {
    "id": "caju-polpa-congelada",
    "name": "Caju, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 37,
      "protein": 0.48,
      "carbs": 9.35,
      "fat": 0.15
    }
  },
  {
    "id": "caju-suco-concentrado-envasado",
    "name": "Caju, suco concentrado, envasado",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 45,
      "protein": 0.4,
      "carbs": 10.73,
      "fat": 0.2
    }
  },
  {
    "id": "caldo-de-carne-tablete",
    "name": "Caldo de carne, tablete",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 241,
      "protein": 7.82,
      "carbs": 15.05,
      "fat": 16.57
    }
  },
  {
    "id": "caldo-de-galinha-tablete",
    "name": "Caldo de galinha, tablete",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 251,
      "protein": 6.28,
      "carbs": 10.65,
      "fat": 20.42
    }
  },
  {
    "id": "camarao-a-baiana",
    "name": "Camarão à baiana",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 101,
      "protein": 7.94,
      "carbs": 3.17,
      "fat": 5.97
    }
  },
  {
    "id": "camarao-rio-grande-grande-cozido",
    "name": "Camarão, Rio Grande, grande, cozido",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 90,
      "protein": 18.97,
      "carbs": 0,
      "fat": 1
    }
  },
  {
    "id": "camarao-rio-grande-grande-cru",
    "name": "Camarão, Rio Grande, grande, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 47,
      "protein": 9.99,
      "carbs": 0,
      "fat": 0.5
    }
  },
  {
    "id": "camarao-sete-barbas-sem-cabeca-com-casca-frito",
    "name": "Camarão, Sete Barbas, sem cabeça, com casca, frito",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 231,
      "protein": 18.39,
      "carbs": 2.88,
      "fat": 15.62
    }
  },
  {
    "id": "cana-aguardente-1",
    "name": "Cana, aguardente 1",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 216,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "cana-caldo-de",
    "name": "Cana, caldo de",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 65,
      "protein": 0,
      "carbs": 18.15,
      "fat": 0
    }
  },
  {
    "id": "canjica-branca-crua",
    "name": "Canjica, branca, crua",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 358,
      "protein": 7.2,
      "carbs": 78.06,
      "fat": 0.97
    }
  },
  {
    "id": "canjica-com-leite-integral",
    "name": "Canjica, com leite integral",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 112,
      "protein": 2.36,
      "carbs": 23.63,
      "fat": 1.24
    }
  },
  {
    "id": "capuccino-po",
    "name": "Capuccino, pó",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 417,
      "protein": 11.31,
      "carbs": 73.61,
      "fat": 8.63
    }
  },
  {
    "id": "caqui-chocolate-cru",
    "name": "Caqui, chocolate, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 71,
      "protein": 0.36,
      "carbs": 19.33,
      "fat": 0.07
    }
  },
  {
    "id": "cara-cozido",
    "name": "Cará, cozido",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 78,
      "protein": 1.53,
      "carbs": 18.85,
      "fat": 0.11
    }
  },
  {
    "id": "cara-cru",
    "name": "Cará, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 96,
      "protein": 2.28,
      "carbs": 22.95,
      "fat": 0.14
    }
  },
  {
    "id": "carambola-crua",
    "name": "Carambola, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 46,
      "protein": 0.87,
      "carbs": 11.48,
      "fat": 0.18
    }
  },
  {
    "id": "caranguejo-cozido",
    "name": "Caranguejo, cozido",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 83,
      "protein": 18.48,
      "carbs": 0,
      "fat": 0.42
    }
  },
  {
    "id": "carne-bovina-acem-moido-cozido",
    "name": "Carne, bovina, acém, moído, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 212,
      "protein": 26.69,
      "carbs": 0,
      "fat": 10.92
    }
  },
  {
    "id": "carne-bovina-acem-moido-cru",
    "name": "Carne, bovina, acém, moído, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 137,
      "protein": 19.42,
      "carbs": 0,
      "fat": 5.95
    }
  },
  {
    "id": "carne-bovina-acem-sem-gordura-cozido",
    "name": "Carne, bovina, acém, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 215,
      "protein": 27.27,
      "carbs": 0,
      "fat": 10.88
    }
  },
  {
    "id": "carne-bovina-acem-sem-gordura-cru",
    "name": "Carne, bovina, acém, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 144,
      "protein": 20.82,
      "carbs": 0,
      "fat": 6.11
    }
  },
  {
    "id": "carne-bovina-almondegas-cruas",
    "name": "Carne, bovina, almôndegas, cruas",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 189,
      "protein": 12.31,
      "carbs": 9.79,
      "fat": 11.2
    }
  },
  {
    "id": "carne-bovina-almondegas-fritas",
    "name": "Carne, bovina, almôndegas, fritas",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 272,
      "protein": 18.16,
      "carbs": 14.29,
      "fat": 15.78
    }
  },
  {
    "id": "carne-bovina-bucho-cozido",
    "name": "Carne, bovina, bucho, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 133,
      "protein": 21.64,
      "carbs": 0,
      "fat": 4.5
    }
  },
  {
    "id": "carne-bovina-bucho-cru",
    "name": "Carne, bovina, bucho, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 137,
      "protein": 20.53,
      "carbs": 0,
      "fat": 5.5
    }
  },
  {
    "id": "carne-bovina-capa-de-contra-file-com-gordura-crua",
    "name": "Carne, bovina, capa de contra-filé, com gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 217,
      "protein": 19.2,
      "carbs": 0,
      "fat": 14.96
    }
  },
  {
    "id": "carne-bovina-capa-de-contra-file-com-gordura-grelhada",
    "name": "Carne, bovina, capa de contra-filé, com gordura, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 312,
      "protein": 30.69,
      "carbs": 0,
      "fat": 20.03
    }
  },
  {
    "id": "carne-bovina-capa-de-contra-file-sem-gordura-crua",
    "name": "Carne, bovina, capa de contra-filé, sem gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 131,
      "protein": 21.54,
      "carbs": 0,
      "fat": 4.33
    }
  },
  {
    "id": "carne-bovina-capa-de-contra-file-sem-gordura-grelhada",
    "name": "Carne, bovina, capa de contra-filé, sem gordura, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 239,
      "protein": 35.06,
      "carbs": 0,
      "fat": 9.95
    }
  },
  {
    "id": "carne-bovina-charque-cozido",
    "name": "Carne, bovina, charque, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 263,
      "protein": 36.36,
      "carbs": 0,
      "fat": 11.92
    }
  },
  {
    "id": "carne-bovina-charque-cru",
    "name": "Carne, bovina, charque, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 249,
      "protein": 22.71,
      "carbs": 0,
      "fat": 16.84
    }
  },
  {
    "id": "carne-bovina-contra-file-de-costela-cru",
    "name": "Carne, bovina, contra-filé de costela, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 202,
      "protein": 19.8,
      "carbs": 0,
      "fat": 13.07
    }
  },
  {
    "id": "carne-bovina-contra-file-de-costela-grelhado",
    "name": "Carne, bovina, contra-filé de costela, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 275,
      "protein": 29.88,
      "carbs": 0,
      "fat": 16.33
    }
  },
  {
    "id": "carne-bovina-contra-file-a-milanesa",
    "name": "Carne, bovina, contra-filé, à milanesa",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 352,
      "protein": 20.61,
      "carbs": 12.17,
      "fat": 24
    }
  },
  {
    "id": "carne-bovina-contra-file-com-gordura-cru",
    "name": "Carne, bovina, contra-filé, com gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 206,
      "protein": 21.15,
      "carbs": 0,
      "fat": 12.81
    }
  },
  {
    "id": "carne-bovina-contra-file-com-gordura-grelhado",
    "name": "Carne, bovina, contra-filé, com gordura, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 278,
      "protein": 32.4,
      "carbs": 0,
      "fat": 15.49
    }
  },
  {
    "id": "carne-bovina-contra-file-sem-gordura-cru",
    "name": "Carne, bovina, contra-filé, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 157,
      "protein": 24,
      "carbs": 0,
      "fat": 6
    }
  },
  {
    "id": "carne-bovina-contra-file-sem-gordura-grelhado",
    "name": "Carne, bovina, contra-filé, sem gordura, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 194,
      "protein": 35.88,
      "carbs": 0,
      "fat": 4.49
    }
  },
  {
    "id": "carne-bovina-costela-assada",
    "name": "Carne, bovina, costela, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 373,
      "protein": 28.81,
      "carbs": 0,
      "fat": 27.72
    }
  },
  {
    "id": "carne-bovina-costela-crua",
    "name": "Carne, bovina, costela, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 358,
      "protein": 16.71,
      "carbs": 0,
      "fat": 31.75
    }
  },
  {
    "id": "carne-bovina-coxao-duro-sem-gordura-cozido",
    "name": "Carne, bovina, coxão duro, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 217,
      "protein": 31.88,
      "carbs": 0,
      "fat": 8.92
    }
  },
  {
    "id": "carne-bovina-coxao-duro-sem-gordura-cru",
    "name": "Carne, bovina, coxão duro, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 148,
      "protein": 21.51,
      "carbs": 0,
      "fat": 6.22
    }
  },
  {
    "id": "carne-bovina-coxao-mole-sem-gordura-cozido",
    "name": "Carne, bovina, coxão mole, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 219,
      "protein": 32.38,
      "carbs": 0,
      "fat": 8.91
    }
  },
  {
    "id": "carne-bovina-coxao-mole-sem-gordura-cru",
    "name": "Carne, bovina, coxão mole, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 169,
      "protein": 21.23,
      "carbs": 0,
      "fat": 8.69
    }
  },
  {
    "id": "carne-bovina-cupim-assado",
    "name": "Carne, bovina, cupim, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 330,
      "protein": 28.63,
      "carbs": 0,
      "fat": 23.04
    }
  },
  {
    "id": "carne-bovina-cupim-cru",
    "name": "Carne, bovina, cupim, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 221,
      "protein": 19.54,
      "carbs": 0,
      "fat": 15.3
    }
  },
  {
    "id": "carne-bovina-figado-cru",
    "name": "Carne, bovina, fígado, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 141,
      "protein": 20.71,
      "carbs": 1.11,
      "fat": 5.36
    }
  },
  {
    "id": "carne-bovina-figado-grelhado",
    "name": "Carne, bovina, fígado, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 225,
      "protein": 29.86,
      "carbs": 4.2,
      "fat": 9.01
    }
  },
  {
    "id": "carne-bovina-file-mingnon-sem-gordura-cru",
    "name": "Carne, bovina, filé mingnon, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 143,
      "protein": 21.6,
      "carbs": 0,
      "fat": 5.61
    }
  },
  {
    "id": "carne-bovina-file-mingnon-sem-gordura-grelhado",
    "name": "Carne, bovina, filé mingnon, sem gordura, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 220,
      "protein": 32.8,
      "carbs": 0,
      "fat": 8.83
    }
  },
  {
    "id": "carne-bovina-flanco-sem-gordura-cozido",
    "name": "Carne, bovina, flanco, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 196,
      "protein": 29.38,
      "carbs": 0,
      "fat": 7.77
    }
  },
  {
    "id": "carne-bovina-flanco-sem-gordura-cru",
    "name": "Carne, bovina, flanco, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 141,
      "protein": 20,
      "carbs": 0,
      "fat": 6.22
    }
  },
  {
    "id": "carne-bovina-fraldinha-com-gordura-cozida",
    "name": "Carne, bovina, fraldinha, com gordura, cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 338,
      "protein": 24.24,
      "carbs": 0,
      "fat": 26.05
    }
  },
  {
    "id": "carne-bovina-fraldinha-com-gordura-crua",
    "name": "Carne, bovina, fraldinha, com gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 221,
      "protein": 17.58,
      "carbs": 0,
      "fat": 16.15
    }
  },
  {
    "id": "carne-bovina-lagarto-cozido",
    "name": "Carne, bovina, lagarto, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 222,
      "protein": 32.86,
      "carbs": 0,
      "fat": 9.11
    }
  },
  {
    "id": "carne-bovina-lagarto-cru",
    "name": "Carne, bovina, lagarto, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 135,
      "protein": 20.54,
      "carbs": 0,
      "fat": 5.23
    }
  },
  {
    "id": "carne-bovina-lingua-cozida",
    "name": "Carne, bovina, língua, cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 315,
      "protein": 21.37,
      "carbs": 0,
      "fat": 24.8
    }
  },
  {
    "id": "carne-bovina-lingua-crua",
    "name": "Carne, bovina, língua, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 215,
      "protein": 17.09,
      "carbs": 0,
      "fat": 15.77
    }
  },
  {
    "id": "carne-bovina-maminha-crua",
    "name": "Carne, bovina, maminha, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 153,
      "protein": 20.93,
      "carbs": 0,
      "fat": 7.03
    }
  },
  {
    "id": "carne-bovina-maminha-grelhada",
    "name": "Carne, bovina, maminha, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 153,
      "protein": 30.74,
      "carbs": 0,
      "fat": 2.42
    }
  },
  {
    "id": "carne-bovina-miolo-de-alcatra-sem-gordura-cru",
    "name": "Carne, bovina, miolo de alcatra, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 163,
      "protein": 21.61,
      "carbs": 0,
      "fat": 7.83
    }
  },
  {
    "id": "carne-bovina-miolo-de-alcatra-sem-gordura-grelhado",
    "name": "Carne, bovina, miolo de alcatra, sem gordura, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 241,
      "protein": 31.93,
      "carbs": 0,
      "fat": 11.64
    }
  },
  {
    "id": "carne-bovina-musculo-sem-gordura-cozido",
    "name": "Carne, bovina, músculo, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 194,
      "protein": 31.23,
      "carbs": 0,
      "fat": 6.7
    }
  },
  {
    "id": "carne-bovina-musculo-sem-gordura-cru",
    "name": "Carne, bovina, músculo, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 142,
      "protein": 21.56,
      "carbs": 0,
      "fat": 5.49
    }
  },
  {
    "id": "carne-bovina-paleta-com-gordura-crua",
    "name": "Carne, bovina, paleta, com gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 159,
      "protein": 21.41,
      "carbs": 0,
      "fat": 7.46
    }
  },
  {
    "id": "carne-bovina-paleta-sem-gordura-cozida",
    "name": "Carne, bovina, paleta, sem gordura, cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 194,
      "protein": 29.72,
      "carbs": 0,
      "fat": 7.4
    }
  },
  {
    "id": "carne-bovina-paleta-sem-gordura-crua",
    "name": "Carne, bovina, paleta, sem gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 141,
      "protein": 21.03,
      "carbs": 0,
      "fat": 5.67
    }
  },
  {
    "id": "carne-bovina-patinho-sem-gordura-cru",
    "name": "Carne, bovina, patinho, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 133,
      "protein": 21.72,
      "carbs": 0,
      "fat": 4.51
    }
  },
  {
    "id": "carne-bovina-patinho-sem-gordura-grelhado",
    "name": "Carne, bovina, patinho, sem gordura, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 219,
      "protein": 35.9,
      "carbs": 0,
      "fat": 7.31
    }
  },
  {
    "id": "carne-bovina-peito-sem-gordura-cozido",
    "name": "Carne, bovina, peito, sem gordura, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 338,
      "protein": 22.25,
      "carbs": 0,
      "fat": 26.99
    }
  },
  {
    "id": "carne-bovina-peito-sem-gordura-cru",
    "name": "Carne, bovina, peito, sem gordura, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 259,
      "protein": 17.56,
      "carbs": 0,
      "fat": 20.43
    }
  },
  {
    "id": "carne-bovina-picanha-com-gordura-crua",
    "name": "Carne, bovina, picanha, com gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 213,
      "protein": 18.82,
      "carbs": 0,
      "fat": 14.69
    }
  },
  {
    "id": "carne-bovina-picanha-com-gordura-grelhada",
    "name": "Carne, bovina, picanha, com gordura, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 289,
      "protein": 26.42,
      "carbs": 0,
      "fat": 19.51
    }
  },
  {
    "id": "carne-bovina-picanha-sem-gordura-crua",
    "name": "Carne, bovina, picanha, sem gordura, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 134,
      "protein": 21.25,
      "carbs": 0,
      "fat": 4.74
    }
  },
  {
    "id": "carne-bovina-picanha-sem-gordura-grelhada",
    "name": "Carne, bovina, picanha, sem gordura, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 238,
      "protein": 31.91,
      "carbs": 0,
      "fat": 11.33
    }
  },
  {
    "id": "carne-bovina-seca-cozida",
    "name": "Carne, bovina, seca, cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 313,
      "protein": 26.93,
      "carbs": 0,
      "fat": 21.93
    }
  },
  {
    "id": "carne-bovina-seca-crua",
    "name": "Carne, bovina, seca, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 313,
      "protein": 19.66,
      "carbs": 0,
      "fat": 25.37
    }
  },
  {
    "id": "caruru-cru",
    "name": "Caruru, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 34,
      "protein": 3.2,
      "carbs": 5.97,
      "fat": 0.59
    }
  },
  {
    "id": "castanha-de-caju-torrada-salgada",
    "name": "Castanha-de-caju, torrada, salgada",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 570,
      "protein": 18.51,
      "carbs": 29.13,
      "fat": 46.28
    }
  },
  {
    "id": "castanha-do-brasil-crua",
    "name": "Castanha-do-Brasil, crua",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 643,
      "protein": 14.54,
      "carbs": 15.08,
      "fat": 63.46
    }
  },
  {
    "id": "catalonha-crua",
    "name": "Catalonha, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 24,
      "protein": 1.87,
      "carbs": 4.75,
      "fat": 0.28
    }
  },
  {
    "id": "catalonha-refogada",
    "name": "Catalonha, refogada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 63,
      "protein": 1.95,
      "carbs": 4.81,
      "fat": 4.81
    }
  },
  {
    "id": "cebola-crua",
    "name": "Cebola, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 1.71,
      "carbs": 8.85,
      "fat": 0.08
    }
  },
  {
    "id": "cebolinha-crua",
    "name": "Cebolinha, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 20,
      "protein": 1.87,
      "carbs": 3.37,
      "fat": 0.35
    }
  },
  {
    "id": "cenoura-cozida",
    "name": "Cenoura, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 30,
      "protein": 0.85,
      "carbs": 6.69,
      "fat": 0.22
    }
  },
  {
    "id": "cenoura-crua",
    "name": "Cenoura, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 34,
      "protein": 1.32,
      "carbs": 7.66,
      "fat": 0.17
    }
  },
  {
    "id": "cereais-milho-flocos-com-sal",
    "name": "Cereais, milho, flocos, com sal",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 370,
      "protein": 7.29,
      "carbs": 80.83,
      "fat": 1.6
    }
  },
  {
    "id": "cereais-milho-flocos-sem-sal",
    "name": "Cereais, milho, flocos, sem sal",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 363,
      "protein": 6.88,
      "carbs": 80.45,
      "fat": 1.18
    }
  },
  {
    "id": "cereais-mingau-milho-infantil",
    "name": "Cereais, mingau, milho, infantil",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 394,
      "protein": 6.43,
      "carbs": 87.27,
      "fat": 1.09
    }
  },
  {
    "id": "cereais-mistura-para-vitamina-trigo-cevada-e-aveia",
    "name": "Cereais, mistura para vitamina, trigo, cevada e aveia",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 381,
      "protein": 8.9,
      "carbs": 81.62,
      "fat": 2.12
    }
  },
  {
    "id": "cereal-matinal-milho",
    "name": "Cereal matinal, milho",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 365,
      "protein": 7.16,
      "carbs": 83.82,
      "fat": 0.96
    }
  },
  {
    "id": "cereal-matinal-milho-acucar",
    "name": "Cereal matinal, milho, açúcar",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 377,
      "protein": 4.74,
      "carbs": 88.84,
      "fat": 0.67
    }
  },
  {
    "id": "cerveja-pilsen-2",
    "name": "Cerveja, pilsen 2",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 0.56,
      "carbs": 3.32,
      "fat": 0
    }
  },
  {
    "id": "cha-erva-doce-infusao-5",
    "name": "Chá, erva-doce, infusão 5%",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 1,
      "protein": 0,
      "carbs": 0.39,
      "fat": 0
    }
  },
  {
    "id": "cha-mate-infusao-5",
    "name": "Chá, mate, infusão 5%",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 3,
      "protein": 0,
      "carbs": 0.64,
      "fat": 0.05
    }
  },
  {
    "id": "cha-preto-infusao-5",
    "name": "Chá, preto, infusão 5%",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 2,
      "protein": 0,
      "carbs": 0.63,
      "fat": 0
    }
  },
  {
    "id": "chantilly-spray-com-gordura-vegetal",
    "name": "Chantilly, spray, com gordura vegetal",
    "category": "Outros alimentos industrializados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 315,
      "protein": 0.53,
      "carbs": 16.86,
      "fat": 27.27
    }
  },
  {
    "id": "charuto-de-repolho",
    "name": "Charuto, de repolho",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 78,
      "protein": 6.78,
      "carbs": 10.13,
      "fat": 1.12
    }
  },
  {
    "id": "chicoria-crua",
    "name": "Chicória, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 1.14,
      "carbs": 2.85,
      "fat": 0.14
    }
  },
  {
    "id": "chocolate-ao-leite",
    "name": "Chocolate, ao leite",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 540,
      "protein": 7.22,
      "carbs": 59.58,
      "fat": 30.27
    }
  },
  {
    "id": "chocolate-ao-leite-com-castanha-do-para",
    "name": "Chocolate, ao leite, com castanha do Pará",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 559,
      "protein": 7.41,
      "carbs": 55.38,
      "fat": 34.19
    }
  },
  {
    "id": "chocolate-ao-leite-dietetico",
    "name": "Chocolate, ao leite, dietético",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 557,
      "protein": 6.9,
      "carbs": 56.32,
      "fat": 33.77
    }
  },
  {
    "id": "chocolate-meio-amargo",
    "name": "Chocolate, meio amargo",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 475,
      "protein": 4.86,
      "carbs": 62.42,
      "fat": 29.86
    }
  },
  {
    "id": "chuchu-cozido",
    "name": "Chuchu, cozido",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 0.41,
      "carbs": 4.79,
      "fat": 0
    }
  },
  {
    "id": "chuchu-cru",
    "name": "Chuchu, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 17,
      "protein": 0.7,
      "carbs": 4.14,
      "fat": 0.06
    }
  },
  {
    "id": "ciriguela-crua",
    "name": "Ciriguela, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 76,
      "protein": 1.4,
      "carbs": 18.86,
      "fat": 0.36
    }
  },
  {
    "id": "cocada-branca",
    "name": "Cocada branca",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 449,
      "protein": 1.12,
      "carbs": 81.38,
      "fat": 13.59
    }
  },
  {
    "id": "coco-agua-de",
    "name": "Coco, água de",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 22,
      "protein": 0,
      "carbs": 5.28,
      "fat": 0
    }
  },
  {
    "id": "coco-cru",
    "name": "Coco, cru",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 406,
      "protein": 3.69,
      "carbs": 10.4,
      "fat": 41.98
    }
  },
  {
    "id": "coco-verde-cru",
    "name": "Coco, verde, cru",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "coentro-folhas-desidratadas",
    "name": "Coentro, folhas desidratadas",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 309,
      "protein": 20.88,
      "carbs": 47.96,
      "fat": 10.39
    }
  },
  {
    "id": "corimba-cru",
    "name": "Corimba, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 128,
      "protein": 17.37,
      "carbs": 0,
      "fat": 5.99
    }
  },
  {
    "id": "corimbata-assado",
    "name": "Corimbatá, assado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 261,
      "protein": 19.9,
      "carbs": 0,
      "fat": 19.57
    }
  },
  {
    "id": "corimbata-cozido",
    "name": "Corimbatá, cozido",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 239,
      "protein": 20.13,
      "carbs": 0,
      "fat": 16.93
    }
  },
  {
    "id": "corvina-de-agua-doce-crua",
    "name": "Corvina de água doce, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 101,
      "protein": 18.92,
      "carbs": 0,
      "fat": 2.24
    }
  },
  {
    "id": "corvina-do-mar-crua",
    "name": "Corvina do mar, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 94,
      "protein": 18.57,
      "carbs": 0,
      "fat": 1.58
    }
  },
  {
    "id": "corvina-grande-assada",
    "name": "Corvina grande, assada",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 147,
      "protein": 26.77,
      "carbs": 0,
      "fat": 3.57
    }
  },
  {
    "id": "corvina-grande-cozida",
    "name": "Corvina grande, cozida",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 100,
      "protein": 23.44,
      "carbs": 0,
      "fat": 2.56
    }
  },
  {
    "id": "couve-flor-cozida",
    "name": "Couve-flor, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 1.24,
      "carbs": 3.88,
      "fat": 0.27
    }
  },
  {
    "id": "couve-flor-crua",
    "name": "Couve-flor, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 23,
      "protein": 1.91,
      "carbs": 4.52,
      "fat": 0.21
    }
  },
  {
    "id": "couve-manteiga-crua",
    "name": "Couve, manteiga, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 27,
      "protein": 2.87,
      "carbs": 4.33,
      "fat": 0.55
    }
  },
  {
    "id": "couve-manteiga-refogada",
    "name": "Couve, manteiga, refogada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 90,
      "protein": 1.67,
      "carbs": 8.71,
      "fat": 6.59
    }
  },
  {
    "id": "coxinha-de-frango-frita",
    "name": "Coxinha de frango, frita",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 283,
      "protein": 9.61,
      "carbs": 34.52,
      "fat": 11.84
    }
  },
  {
    "id": "creme-de-arroz-po",
    "name": "Creme de arroz, pó",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 386,
      "protein": 7.03,
      "carbs": 83.87,
      "fat": 1.23
    }
  },
  {
    "id": "creme-de-leite",
    "name": "Creme de Leite",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 221,
      "protein": 1.51,
      "carbs": 4.51,
      "fat": 22.48
    }
  },
  {
    "id": "creme-de-milho-po",
    "name": "Creme de milho, pó",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 333,
      "protein": 4.82,
      "carbs": 86.15,
      "fat": 1.64
    }
  },
  {
    "id": "croquete-de-carne-cru",
    "name": "Croquete, de carne, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 246,
      "protein": 12.04,
      "carbs": 13.95,
      "fat": 15.56
    }
  },
  {
    "id": "croquete-de-carne-frito",
    "name": "Croquete, de carne, frito",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 347,
      "protein": 16.86,
      "carbs": 18.15,
      "fat": 22.67
    }
  },
  {
    "id": "cupuacu-cru",
    "name": "Cupuaçu, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 49,
      "protein": 1.16,
      "carbs": 10.43,
      "fat": 0.95
    }
  },
  {
    "id": "cupuacu-polpa-congelada",
    "name": "Cupuaçu, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 49,
      "protein": 0.84,
      "carbs": 11.39,
      "fat": 0.59
    }
  },
  {
    "id": "curau-milho-verde",
    "name": "Curau, milho verde",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 78,
      "protein": 2.36,
      "carbs": 13.94,
      "fat": 1.64
    }
  },
  {
    "id": "curau-milho-verde-mistura-para",
    "name": "Curau, milho verde, mistura para",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 402,
      "protein": 2.22,
      "carbs": 79.82,
      "fat": 13.37
    }
  },
  {
    "id": "cuscuz-de-milho-cozido-com-sal",
    "name": "Cuscuz, de milho, cozido com sal",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 113,
      "protein": 2.16,
      "carbs": 25.28,
      "fat": 0.68
    }
  },
  {
    "id": "cuscuz-paulista",
    "name": "Cuscuz, paulista",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 142,
      "protein": 2.56,
      "carbs": 22.51,
      "fat": 4.65
    }
  },
  {
    "id": "cuxa-molho",
    "name": "Cuxá, molho",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 80,
      "protein": 5.64,
      "carbs": 5.74,
      "fat": 3.59
    }
  },
  {
    "id": "dobradinha",
    "name": "Dobradinha",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 125,
      "protein": 19.77,
      "carbs": 0,
      "fat": 4.44
    }
  },
  {
    "id": "doce-de-abobora-cremoso",
    "name": "Doce, de abóbora, cremoso",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 199,
      "protein": 0.92,
      "carbs": 54.61,
      "fat": 0.21
    }
  },
  {
    "id": "doce-de-leite-cremoso",
    "name": "Doce, de leite, cremoso",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 306,
      "protein": 5.48,
      "carbs": 59.49,
      "fat": 5.99
    }
  },
  {
    "id": "dourada-de-agua-doce-fresca",
    "name": "Dourada de água doce, fresca",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 131,
      "protein": 18.81,
      "carbs": 0,
      "fat": 5.64
    }
  },
  {
    "id": "empada-de-frango-pre-cozida-assada",
    "name": "Empada de frango, pré-cozida, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 358,
      "protein": 6.94,
      "carbs": 47.49,
      "fat": 15.61
    }
  },
  {
    "id": "empada-de-frango-pre-cozida",
    "name": "Empada, de frango, pré-cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 377,
      "protein": 7.34,
      "carbs": 35.53,
      "fat": 22.89
    }
  },
  {
    "id": "ervilha-em-vagem",
    "name": "Ervilha, em vagem",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 88,
      "protein": 7.45,
      "carbs": 14.23,
      "fat": 0.47
    }
  },
  {
    "id": "ervilha-enlatada-drenada",
    "name": "Ervilha, enlatada, drenada",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 74,
      "protein": 4.6,
      "carbs": 13.44,
      "fat": 0.38
    }
  },
  {
    "id": "espinafre-nova-zelandia-cru",
    "name": "Espinafre, Nova Zelândia, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 16,
      "protein": 2,
      "carbs": 2.57,
      "fat": 0.24
    }
  },
  {
    "id": "espinafre-nova-zelandia-refogado",
    "name": "Espinafre, Nova Zelândia, refogado",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 67,
      "protein": 2.72,
      "carbs": 4.24,
      "fat": 5.43
    }
  },
  {
    "id": "estrogonofe-de-carne",
    "name": "Estrogonofe de carne",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 173,
      "protein": 15.03,
      "carbs": 2.98,
      "fat": 10.8
    }
  },
  {
    "id": "estrogonofe-de-frango",
    "name": "Estrogonofe de frango",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 157,
      "protein": 17.55,
      "carbs": 2.59,
      "fat": 7.96
    }
  },
  {
    "id": "farinha-de-arroz-enriquecida",
    "name": "Farinha, de arroz, enriquecida",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 363,
      "protein": 1.27,
      "carbs": 85.5,
      "fat": 0.3
    }
  },
  {
    "id": "farinha-de-centeio-integral",
    "name": "Farinha, de centeio, integral",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 336,
      "protein": 12.52,
      "carbs": 73.3,
      "fat": 1.75
    }
  },
  {
    "id": "farinha-de-mandioca-crua",
    "name": "Farinha, de mandioca, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 361,
      "protein": 1.55,
      "carbs": 87.9,
      "fat": 0.28
    }
  },
  {
    "id": "farinha-de-mandioca-torrada",
    "name": "Farinha, de mandioca, torrada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 365,
      "protein": 1.23,
      "carbs": 89.19,
      "fat": 0.29
    }
  },
  {
    "id": "farinha-de-mesocarpo-de-babacu-crua",
    "name": "Farinha, de mesocarpo de babaçu, crua",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 329,
      "protein": 1.41,
      "carbs": 79.17,
      "fat": 0.2
    }
  },
  {
    "id": "farinha-de-milho-amarela",
    "name": "Farinha, de milho, amarela",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 351,
      "protein": 7.19,
      "carbs": 79.08,
      "fat": 1.47
    }
  },
  {
    "id": "farinha-de-puba",
    "name": "Farinha, de puba",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 360,
      "protein": 1.62,
      "carbs": 87.29,
      "fat": 0.47
    }
  },
  {
    "id": "farinha-de-rosca",
    "name": "Farinha, de rosca",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 371,
      "protein": 11.38,
      "carbs": 75.79,
      "fat": 1.46
    }
  },
  {
    "id": "farinha-de-trigo",
    "name": "Farinha, de trigo",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 360,
      "protein": 9.79,
      "carbs": 75.09,
      "fat": 1.37
    }
  },
  {
    "id": "farinha-lactea-de-cereais",
    "name": "Farinha, láctea, de cereais",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 415,
      "protein": 11.88,
      "carbs": 77.77,
      "fat": 5.79
    }
  },
  {
    "id": "fecula-de-mandioca",
    "name": "Fécula, de mandioca",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 331,
      "protein": 0.52,
      "carbs": 81.15,
      "fat": 0.28
    }
  },
  {
    "id": "feijao-tropeiro-mineiro",
    "name": "Feijão tropeiro mineiro",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 152,
      "protein": 10.17,
      "carbs": 19.58,
      "fat": 6.79
    }
  },
  {
    "id": "feijao-broto-cru",
    "name": "Feijão, broto, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 4.17,
      "carbs": 7.76,
      "fat": 0.1
    }
  },
  {
    "id": "feijao-carioca-cozido",
    "name": "Feijão, carioca, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 76,
      "protein": 4.78,
      "carbs": 13.59,
      "fat": 0.54
    }
  },
  {
    "id": "feijao-carioca-cru",
    "name": "Feijão, carioca, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 329,
      "protein": 19.98,
      "carbs": 61.22,
      "fat": 1.26
    }
  },
  {
    "id": "feijao-fradinho-cozido",
    "name": "Feijão, fradinho, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 78,
      "protein": 5.09,
      "carbs": 13.5,
      "fat": 0.64
    }
  },
  {
    "id": "feijao-fradinho-cru",
    "name": "Feijão, fradinho, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 339,
      "protein": 20.21,
      "carbs": 61.24,
      "fat": 2.37
    }
  },
  {
    "id": "feijao-jalo-cozido",
    "name": "Feijão, jalo, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 93,
      "protein": 6.14,
      "carbs": 16.5,
      "fat": 0.51
    }
  },
  {
    "id": "feijao-jalo-cru",
    "name": "Feijão, jalo, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 328,
      "protein": 20.1,
      "carbs": 61.48,
      "fat": 0.95
    }
  },
  {
    "id": "feijao-preto-cozido",
    "name": "Feijão, preto, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 77,
      "protein": 4.48,
      "carbs": 14.01,
      "fat": 0.54
    }
  },
  {
    "id": "feijao-preto-cru",
    "name": "Feijão, preto, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 324,
      "protein": 21.34,
      "carbs": 58.75,
      "fat": 1.24
    }
  },
  {
    "id": "feijao-rajado-cozido",
    "name": "Feijão, rajado, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 85,
      "protein": 5.54,
      "carbs": 15.27,
      "fat": 0.4
    }
  },
  {
    "id": "feijao-rajado-cru",
    "name": "Feijão, rajado, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 326,
      "protein": 17.27,
      "carbs": 62.93,
      "fat": 1.17
    }
  },
  {
    "id": "feijao-rosinha-cozido",
    "name": "Feijão, rosinha, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 68,
      "protein": 4.54,
      "carbs": 11.82,
      "fat": 0.48
    }
  },
  {
    "id": "feijao-rosinha-cru",
    "name": "Feijão, rosinha, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 337,
      "protein": 20.92,
      "carbs": 62.22,
      "fat": 1.33
    }
  },
  {
    "id": "feijao-roxo-cozido",
    "name": "Feijão, roxo, cozido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 77,
      "protein": 5.72,
      "carbs": 12.91,
      "fat": 0.54
    }
  },
  {
    "id": "feijao-roxo-cru",
    "name": "Feijão, roxo, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 331,
      "protein": 22.17,
      "carbs": 59.99,
      "fat": 1.24
    }
  },
  {
    "id": "feijoada",
    "name": "Feijoada",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 117,
      "protein": 8.67,
      "carbs": 11.64,
      "fat": 6.48
    }
  },
  {
    "id": "fermento-em-po-quimico",
    "name": "Fermento em pó, químico",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 90,
      "protein": 0.48,
      "carbs": 43.91,
      "fat": 0.07
    }
  },
  {
    "id": "fermento-biologico-levedura-tablete",
    "name": "Fermento, biológico, levedura, tablete",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 90,
      "protein": 16.96,
      "carbs": 7.7,
      "fat": 1.52
    }
  },
  {
    "id": "figo-cru",
    "name": "Figo, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 0.97,
      "carbs": 10.25,
      "fat": 0.16
    }
  },
  {
    "id": "figo-enlatado-em-calda",
    "name": "Figo, enlatado, em calda",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 184,
      "protein": 0.56,
      "carbs": 50.34,
      "fat": 0.15
    }
  },
  {
    "id": "frango-asa-com-pele-crua",
    "name": "Frango, asa, com pele, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 213,
      "protein": 18.1,
      "carbs": 0,
      "fat": 15.07
    }
  },
  {
    "id": "frango-caipira-inteiro-com-pele-cozido",
    "name": "Frango, caipira, inteiro, com pele, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 243,
      "protein": 23.88,
      "carbs": 0,
      "fat": 15.62
    }
  },
  {
    "id": "frango-caipira-inteiro-sem-pele-cozido",
    "name": "Frango, caipira, inteiro, sem pele, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 196,
      "protein": 29.58,
      "carbs": 0,
      "fat": 7.7
    }
  },
  {
    "id": "frango-com-acafrao",
    "name": "Frango, com açafrão",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 113,
      "protein": 9.7,
      "carbs": 4.06,
      "fat": 6.17
    }
  },
  {
    "id": "frango-coracao-cru",
    "name": "Frango, coração, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 222,
      "protein": 12.58,
      "carbs": 0,
      "fat": 18.6
    }
  },
  {
    "id": "frango-coracao-grelhado",
    "name": "Frango, coração, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 207,
      "protein": 22.44,
      "carbs": 0.61,
      "fat": 12.1
    }
  },
  {
    "id": "frango-coxa-com-pele-assada",
    "name": "Frango, coxa, com pele, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 215,
      "protein": 28.49,
      "carbs": 0.06,
      "fat": 10.36
    }
  },
  {
    "id": "frango-coxa-com-pele-crua",
    "name": "Frango, coxa, com pele, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 161,
      "protein": 17.09,
      "carbs": 0,
      "fat": 9.81
    }
  },
  {
    "id": "frango-coxa-sem-pele-cozida",
    "name": "Frango, coxa, sem pele, cozida",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 167,
      "protein": 26.86,
      "carbs": 0,
      "fat": 5.85
    }
  },
  {
    "id": "frango-coxa-sem-pele-crua",
    "name": "Frango, coxa, sem pele, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 120,
      "protein": 17.81,
      "carbs": 0.02,
      "fat": 4.86
    }
  },
  {
    "id": "frango-figado-cru",
    "name": "Frango, fígado, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 106,
      "protein": 17.59,
      "carbs": 0,
      "fat": 3.49
    }
  },
  {
    "id": "frango-file-a-milanesa",
    "name": "Frango, filé, à milanesa",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 221,
      "protein": 28.46,
      "carbs": 7.51,
      "fat": 7.79
    }
  },
  {
    "id": "frango-inteiro-com-pele-cru",
    "name": "Frango, inteiro, com pele, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 226,
      "protein": 16.44,
      "carbs": 0,
      "fat": 17.31
    }
  },
  {
    "id": "frango-inteiro-sem-pele-assado",
    "name": "Frango, inteiro, sem pele, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 187,
      "protein": 28.03,
      "carbs": 0,
      "fat": 7.5
    }
  },
  {
    "id": "frango-inteiro-sem-pele-cozido",
    "name": "Frango, inteiro, sem pele, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 170,
      "protein": 24.99,
      "carbs": 0,
      "fat": 7.06
    }
  },
  {
    "id": "frango-inteiro-sem-pele-cru",
    "name": "Frango, inteiro, sem pele, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 129,
      "protein": 20.59,
      "carbs": 0,
      "fat": 4.57
    }
  },
  {
    "id": "frango-peito-com-pele-assado",
    "name": "Frango, peito, com pele, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 212,
      "protein": 33.42,
      "carbs": 0,
      "fat": 7.65
    }
  },
  {
    "id": "frango-peito-com-pele-cru",
    "name": "Frango, peito, com pele, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 149,
      "protein": 20.78,
      "carbs": 0,
      "fat": 6.73
    }
  },
  {
    "id": "frango-peito-sem-pele-cozido",
    "name": "Frango, peito, sem pele, cozido",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 163,
      "protein": 31.47,
      "carbs": 0,
      "fat": 3.16
    }
  },
  {
    "id": "frango-peito-sem-pele-cru",
    "name": "Frango, peito, sem pele, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 119,
      "protein": 21.53,
      "carbs": 0,
      "fat": 3.02
    }
  },
  {
    "id": "frango-peito-sem-pele-grelhado",
    "name": "Frango, peito, sem pele, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 159,
      "protein": 32.03,
      "carbs": 0,
      "fat": 2.48
    }
  },
  {
    "id": "frango-sobrecoxa-com-pele-assada",
    "name": "Frango, sobrecoxa, com pele, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 260,
      "protein": 28.7,
      "carbs": 0,
      "fat": 15.19
    }
  },
  {
    "id": "frango-sobrecoxa-com-pele-crua",
    "name": "Frango, sobrecoxa, com pele, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 255,
      "protein": 15.46,
      "carbs": 0,
      "fat": 20.9
    }
  },
  {
    "id": "frango-sobrecoxa-sem-pele-assada",
    "name": "Frango, sobrecoxa, sem pele, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 233,
      "protein": 29.18,
      "carbs": 0,
      "fat": 12.01
    }
  },
  {
    "id": "frango-sobrecoxa-sem-pele-crua",
    "name": "Frango, sobrecoxa, sem pele, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 162,
      "protein": 17.57,
      "carbs": 0,
      "fat": 9.62
    }
  },
  {
    "id": "fruta-pao-crua",
    "name": "Fruta-pão, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 67,
      "protein": 1.08,
      "carbs": 17.17,
      "fat": 0.19
    }
  },
  {
    "id": "gelatina-sabores-variados-po",
    "name": "Gelatina, sabores variados, pó",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 380,
      "protein": 8.89,
      "carbs": 89.22,
      "fat": 0
    }
  },
  {
    "id": "geleia-mocoto-natural",
    "name": "Geléia, mocotó, natural",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 106,
      "protein": 2.13,
      "carbs": 24.23,
      "fat": 0.07
    }
  },
  {
    "id": "gergelim-semente",
    "name": "Gergelim, semente",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 584,
      "protein": 21.16,
      "carbs": 21.62,
      "fat": 50.43
    }
  },
  {
    "id": "glicose-de-milho",
    "name": "Glicose de milho",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 292,
      "protein": 0,
      "carbs": 79.38,
      "fat": 0
    }
  },
  {
    "id": "goiaba-branca-com-casca-crua",
    "name": "Goiaba, branca, com casca, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 52,
      "protein": 0.9,
      "carbs": 12.4,
      "fat": 0.49
    }
  },
  {
    "id": "goiaba-doce-em-pasta",
    "name": "Goiaba, doce em pasta",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 269,
      "protein": 0.58,
      "carbs": 74.12,
      "fat": 0
    }
  },
  {
    "id": "goiaba-doce-cascao",
    "name": "Goiaba, doce, cascão",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 286,
      "protein": 0.41,
      "carbs": 78.7,
      "fat": 0.1
    }
  },
  {
    "id": "goiaba-vermelha-com-casca-crua",
    "name": "Goiaba, vermelha, com casca, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 54,
      "protein": 1.09,
      "carbs": 13.01,
      "fat": 0.44
    }
  },
  {
    "id": "grao-de-bico-cru",
    "name": "Grão-de-bico, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 355,
      "protein": 21.23,
      "carbs": 57.88,
      "fat": 5.43
    }
  },
  {
    "id": "graviola-crua",
    "name": "Graviola, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 62,
      "protein": 0.85,
      "carbs": 15.84,
      "fat": 0.21
    }
  },
  {
    "id": "graviola-polpa-congelada",
    "name": "Graviola, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 38,
      "protein": 0.57,
      "carbs": 9.78,
      "fat": 0.14
    }
  },
  {
    "id": "guandu-cru",
    "name": "Guandu, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 344,
      "protein": 18.96,
      "carbs": 64,
      "fat": 2.13
    }
  },
  {
    "id": "hamburguer-bovino-cru",
    "name": "Hambúrguer, bovino, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 215,
      "protein": 13.16,
      "carbs": 4.15,
      "fat": 16.18
    }
  },
  {
    "id": "hamburguer-bovino-frito",
    "name": "Hambúrguer, bovino, frito",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 258,
      "protein": 19.97,
      "carbs": 6.32,
      "fat": 17.01
    }
  },
  {
    "id": "hamburguer-bovino-grelhado",
    "name": "Hambúrguer, bovino, grelhado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 210,
      "protein": 13.16,
      "carbs": 11.33,
      "fat": 12.43
    }
  },
  {
    "id": "inhame-cru",
    "name": "Inhame, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 97,
      "protein": 2.05,
      "carbs": 23.23,
      "fat": 0.21
    }
  },
  {
    "id": "iogurte-natural",
    "name": "Iogurte, natural",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 51,
      "protein": 4.06,
      "carbs": 1.92,
      "fat": 3.04
    }
  },
  {
    "id": "iogurte-natural-desnatado",
    "name": "Iogurte, natural, desnatado",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 3.83,
      "carbs": 5.77,
      "fat": 0.32
    }
  },
  {
    "id": "iogurte-sabor-abacaxi",
    "name": "Iogurte, sabor abacaxi",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "iogurte-sabor-morango",
    "name": "Iogurte, sabor morango",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 70,
      "protein": 2.71,
      "carbs": 9.69,
      "fat": 2.33
    }
  },
  {
    "id": "iogurte-sabor-pessego",
    "name": "Iogurte, sabor pêssego",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 68,
      "protein": 2.53,
      "carbs": 9.43,
      "fat": 2.34
    }
  },
  {
    "id": "jabuticaba-crua",
    "name": "Jabuticaba, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 58,
      "protein": 0.61,
      "carbs": 15.26,
      "fat": 0.13
    }
  },
  {
    "id": "jaca-crua",
    "name": "Jaca, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 88,
      "protein": 1.4,
      "carbs": 22.5,
      "fat": 0.27
    }
  },
  {
    "id": "jambo-cru",
    "name": "Jambo, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 27,
      "protein": 0.89,
      "carbs": 6.49,
      "fat": 0.07
    }
  },
  {
    "id": "jamelao-cru",
    "name": "Jamelão, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 0.55,
      "carbs": 10.63,
      "fat": 0.11
    }
  },
  {
    "id": "jilo-cru",
    "name": "Jiló, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 27,
      "protein": 1.4,
      "carbs": 6.19,
      "fat": 0.22
    }
  },
  {
    "id": "jurubeba-crua",
    "name": "Jurubeba, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 126,
      "protein": 4.41,
      "carbs": 23.06,
      "fat": 3.91
    }
  },
  {
    "id": "kiwi-cru",
    "name": "Kiwi, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 51,
      "protein": 1.34,
      "carbs": 11.5,
      "fat": 0.63
    }
  },
  {
    "id": "lambari-congelado-cru",
    "name": "Lambari, congelado, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 131,
      "protein": 16.81,
      "carbs": 0,
      "fat": 6.55
    }
  },
  {
    "id": "lambari-congelado-frito",
    "name": "Lambari, congelado, frito",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 327,
      "protein": 28.43,
      "carbs": 0,
      "fat": 22.78
    }
  },
  {
    "id": "lambari-fresco-cru",
    "name": "Lambari, fresco,cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 152,
      "protein": 15.65,
      "carbs": 0,
      "fat": 9.4
    }
  },
  {
    "id": "laranja-baia-crua",
    "name": "Laranja, baía, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 45,
      "protein": 0.98,
      "carbs": 11.47,
      "fat": 0.1
    }
  },
  {
    "id": "laranja-baia-suco",
    "name": "Laranja, baía, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 37,
      "protein": 0.65,
      "carbs": 8.7,
      "fat": 0
    }
  },
  {
    "id": "laranja-da-terra-crua",
    "name": "Laranja, da terra, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 51,
      "protein": 1.08,
      "carbs": 12.86,
      "fat": 0.19
    }
  },
  {
    "id": "laranja-da-terra-suco",
    "name": "Laranja, da terra, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 0.67,
      "carbs": 9.57,
      "fat": 0.14
    }
  },
  {
    "id": "laranja-lima-crua",
    "name": "Laranja, lima, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 46,
      "protein": 1.06,
      "carbs": 11.53,
      "fat": 0.08
    }
  },
  {
    "id": "laranja-lima-suco",
    "name": "Laranja, lima, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 0.71,
      "carbs": 9.17,
      "fat": 0.12
    }
  },
  {
    "id": "laranja-pera-crua",
    "name": "Laranja, pêra, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 37,
      "protein": 1.04,
      "carbs": 8.95,
      "fat": 0.13
    }
  },
  {
    "id": "laranja-pera-suco",
    "name": "Laranja, pêra, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 33,
      "protein": 0.74,
      "carbs": 7.55,
      "fat": 0.07
    }
  },
  {
    "id": "laranja-valencia-crua",
    "name": "Laranja, valência, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 46,
      "protein": 0.77,
      "carbs": 11.72,
      "fat": 0.16
    }
  },
  {
    "id": "laranja-valencia-suco",
    "name": "Laranja, valência, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 36,
      "protein": 0.48,
      "carbs": 8.55,
      "fat": 0.12
    }
  },
  {
    "id": "lasanha-massa-fresca-cozida",
    "name": "Lasanha, massa fresca, cozida",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 164,
      "protein": 5.81,
      "carbs": 32.52,
      "fat": 1.16
    }
  },
  {
    "id": "lasanha-massa-fresca-crua",
    "name": "Lasanha, massa fresca, crua",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 220,
      "protein": 7.01,
      "carbs": 45.06,
      "fat": 1.34
    }
  },
  {
    "id": "leite-condensado",
    "name": "Leite, condensado",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 313,
      "protein": 7.67,
      "carbs": 57,
      "fat": 6.74
    }
  },
  {
    "id": "leite-de-cabra",
    "name": "Leite, de cabra",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 66,
      "protein": 3.07,
      "carbs": 5.25,
      "fat": 3.75
    }
  },
  {
    "id": "leite-de-coco",
    "name": "Leite, de coco",
    "category": "Outros alimentos industrializados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 166,
      "protein": 1.01,
      "carbs": 2.19,
      "fat": 18.36
    }
  },
  {
    "id": "leite-de-vaca-achocolatado",
    "name": "Leite, de vaca, achocolatado",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 83,
      "protein": 2.1,
      "carbs": 14.16,
      "fat": 2.17
    }
  },
  {
    "id": "leite-de-vaca-desnatado-po",
    "name": "Leite, de vaca, desnatado, pó",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 362,
      "protein": 34.69,
      "carbs": 53.04,
      "fat": 0.93
    }
  },
  {
    "id": "leite-de-vaca-desnatado-uht",
    "name": "Leite, de vaca, desnatado, UHT",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "leite-de-vaca-integral",
    "name": "Leite, de vaca, integral",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "leite-de-vaca-integral-po",
    "name": "Leite, de vaca, integral, pó",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 497,
      "protein": 25.42,
      "carbs": 39.18,
      "fat": 26.9
    }
  },
  {
    "id": "leite-fermentado",
    "name": "Leite, fermentado",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 70,
      "protein": 1.89,
      "carbs": 15.67,
      "fat": 0.1
    }
  },
  {
    "id": "lentilha-cozida",
    "name": "Lentilha, cozida",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 93,
      "protein": 6.31,
      "carbs": 16.3,
      "fat": 0.52
    }
  },
  {
    "id": "lentilha-crua",
    "name": "Lentilha, crua",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 339,
      "protein": 23.15,
      "carbs": 62,
      "fat": 0.77
    }
  },
  {
    "id": "limao-cravo-suco",
    "name": "Limão, cravo, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 0.33,
      "carbs": 5.25,
      "fat": 0
    }
  },
  {
    "id": "limao-galego-suco",
    "name": "Limão, galego, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 22,
      "protein": 0.57,
      "carbs": 7.32,
      "fat": 0.07
    }
  },
  {
    "id": "limao-tahiti-cru",
    "name": "Limão, tahiti, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 32,
      "protein": 0.94,
      "carbs": 11.08,
      "fat": 0.14
    }
  },
  {
    "id": "linguica-frango-crua",
    "name": "Lingüiça, frango, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 218,
      "protein": 14.24,
      "carbs": 0,
      "fat": 17.44
    }
  },
  {
    "id": "linguica-frango-frita",
    "name": "Lingüiça, frango, frita",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 245,
      "protein": 18.32,
      "carbs": 0,
      "fat": 18.54
    }
  },
  {
    "id": "linguica-frango-grelhada",
    "name": "Lingüiça, frango, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 244,
      "protein": 18.19,
      "carbs": 0,
      "fat": 18.4
    }
  },
  {
    "id": "linguica-porco-crua",
    "name": "Lingüiça, porco, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 227,
      "protein": 16.06,
      "carbs": 0,
      "fat": 17.58
    }
  },
  {
    "id": "linguica-porco-frita",
    "name": "Lingüiça, porco, frita",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 280,
      "protein": 20.45,
      "carbs": 0,
      "fat": 21.31
    }
  },
  {
    "id": "linguica-porco-grelhada",
    "name": "Lingüiça, porco, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 296,
      "protein": 23.17,
      "carbs": 0,
      "fat": 21.9
    }
  },
  {
    "id": "linhaca-semente",
    "name": "Linhaça, semente",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 495,
      "protein": 14.08,
      "carbs": 43.31,
      "fat": 32.25
    }
  },
  {
    "id": "maca-argentina-com-casca-crua",
    "name": "Maçã, Argentina, com casca, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 63,
      "protein": 0.23,
      "carbs": 16.59,
      "fat": 0.25
    }
  },
  {
    "id": "maca-fuji-com-casca-crua",
    "name": "Maçã, Fuji, com casca, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 56,
      "protein": 0.29,
      "carbs": 15.15,
      "fat": 0
    }
  },
  {
    "id": "macarrao-instantaneo",
    "name": "Macarrão, instantâneo",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 436,
      "protein": 8.79,
      "carbs": 62.43,
      "fat": 17.24
    }
  },
  {
    "id": "macarrao-molho-bolognesa",
    "name": "Macarrão, molho bolognesa",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 120,
      "protein": 4.93,
      "carbs": 22.52,
      "fat": 0.89
    }
  },
  {
    "id": "macarrao-trigo-cru",
    "name": "Macarrão, trigo, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 371,
      "protein": 10,
      "carbs": 77.94,
      "fat": 1.3
    }
  },
  {
    "id": "macarrao-trigo-cru-com-ovos",
    "name": "Macarrão, trigo, cru, com ovos",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 371,
      "protein": 10.32,
      "carbs": 76.62,
      "fat": 1.97
    }
  },
  {
    "id": "macauba-crua",
    "name": "Macaúba, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 404,
      "protein": 2.08,
      "carbs": 13.95,
      "fat": 40.66
    }
  },
  {
    "id": "maionese-tradicional-com-ovos",
    "name": "Maionese, tradicional com ovos",
    "category": "Outros alimentos industrializados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 302,
      "protein": 0.58,
      "carbs": 7.9,
      "fat": 30.5
    }
  },
  {
    "id": "mamao-verde-doce-em-calda-drenado",
    "name": "Mamão verde, doce em calda, drenado",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 209,
      "protein": 0.32,
      "carbs": 57.64,
      "fat": 0.1
    }
  },
  {
    "id": "mamao-doce-em-calda-drenado",
    "name": "Mamão, doce em calda, drenado",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 196,
      "protein": 0.19,
      "carbs": 54,
      "fat": 0.07
    }
  },
  {
    "id": "mamao-formosa-cru",
    "name": "Mamão, Formosa, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 45,
      "protein": 0.82,
      "carbs": 11.55,
      "fat": 0.12
    }
  },
  {
    "id": "mamao-papaia-cru",
    "name": "Mamão, Papaia, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 40,
      "protein": 0.46,
      "carbs": 10.44,
      "fat": 0.12
    }
  },
  {
    "id": "mandioca-cozida",
    "name": "Mandioca, cozida",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 125,
      "protein": 0.57,
      "carbs": 30.09,
      "fat": 0.3
    }
  },
  {
    "id": "mandioca-crua",
    "name": "Mandioca, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 151,
      "protein": 1.13,
      "carbs": 36.17,
      "fat": 0.3
    }
  },
  {
    "id": "mandioca-farofa-temperada",
    "name": "Mandioca, farofa, temperada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 406,
      "protein": 2.06,
      "carbs": 80.3,
      "fat": 9.12
    }
  },
  {
    "id": "mandioca-frita",
    "name": "Mandioca, frita",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 300,
      "protein": 1.38,
      "carbs": 50.25,
      "fat": 11.2
    }
  },
  {
    "id": "manga-haden-crua",
    "name": "Manga, Haden, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 64,
      "protein": 0.41,
      "carbs": 16.66,
      "fat": 0.26
    }
  },
  {
    "id": "manga-palmer-crua",
    "name": "Manga, Palmer, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 72,
      "protein": 0.41,
      "carbs": 19.35,
      "fat": 0.17
    }
  },
  {
    "id": "manga-polpa-congelada",
    "name": "Manga, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 48,
      "protein": 0.38,
      "carbs": 12.52,
      "fat": 0.23
    }
  },
  {
    "id": "manga-tommy-atkins-crua",
    "name": "Manga, Tommy Atkins, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 51,
      "protein": 0.86,
      "carbs": 12.77,
      "fat": 0.22
    }
  },
  {
    "id": "manicoba",
    "name": "Maniçoba",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 134,
      "protein": 9.96,
      "carbs": 3.42,
      "fat": 8.7
    }
  },
  {
    "id": "manjericao-cru",
    "name": "Manjericão, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 21,
      "protein": 1.99,
      "carbs": 3.64,
      "fat": 0.39
    }
  },
  {
    "id": "manjuba-com-farinha-de-trigo-frita",
    "name": "Manjuba, com farinha de trigo, frita",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 344,
      "protein": 23.45,
      "carbs": 10.24,
      "fat": 22.59
    }
  },
  {
    "id": "manjuba-frita",
    "name": "Manjuba, frita",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 349,
      "protein": 30.14,
      "carbs": 0,
      "fat": 24.46
    }
  },
  {
    "id": "manteiga-com-sal",
    "name": "Manteiga, com sal",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 726,
      "protein": 0.41,
      "carbs": 0.06,
      "fat": 82.36
    }
  },
  {
    "id": "manteiga-sem-sal",
    "name": "Manteiga, sem sal",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 758,
      "protein": 0.4,
      "carbs": 0,
      "fat": 86.04
    }
  },
  {
    "id": "maracuja-cru",
    "name": "Maracujá, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 68,
      "protein": 1.99,
      "carbs": 12.26,
      "fat": 2.1
    }
  },
  {
    "id": "maracuja-polpa-congelada",
    "name": "Maracujá, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 0.81,
      "carbs": 9.6,
      "fat": 0.18
    }
  },
  {
    "id": "maracuja-suco-concentrado-envasado",
    "name": "Maracujá, suco concentrado, envasado",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 42,
      "protein": 0.77,
      "carbs": 9.64,
      "fat": 0.19
    }
  },
  {
    "id": "margarina-com-oleo-hidrogenado-com-sal-65-de-lipideos",
    "name": "Margarina, com óleo hidrogenado, com sal (65% de lipídeos)",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 596,
      "protein": 0,
      "carbs": 0,
      "fat": 67.43
    }
  },
  {
    "id": "margarina-com-oleo-hidrogenado-sem-sal-80-de-lipideos",
    "name": "Margarina, com óleo hidrogenado, sem sal (80% de lipídeos)",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 723,
      "protein": 0,
      "carbs": 0,
      "fat": 81.73
    }
  },
  {
    "id": "margarina-com-oleo-interesterificado-com-sal-65-de-lipideos",
    "name": "Margarina, com óleo interesterificado, com sal (65%de lipídeos)",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 594,
      "protein": 0,
      "carbs": 0,
      "fat": 67.25
    }
  },
  {
    "id": "margarina-com-oleo-interesterificado-sem-sal-65-de-lipideos",
    "name": "Margarina, com óleo interesterificado, sem sal (65% de lipídeos)",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 593,
      "protein": 0,
      "carbs": 0,
      "fat": 67.1
    }
  },
  {
    "id": "maria-mole",
    "name": "Maria mole",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 257,
      "protein": 9.63,
      "carbs": 2.43,
      "fat": 23.44
    }
  },
  {
    "id": "maria-mole-coco-queimado",
    "name": "Maria mole, coco queimado",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 307,
      "protein": 3.93,
      "carbs": 75.06,
      "fat": 0.09
    }
  },
  {
    "id": "marmelada",
    "name": "Marmelada",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 257,
      "protein": 0.4,
      "carbs": 70.76,
      "fat": 0.14
    }
  },
  {
    "id": "maxixe-cru",
    "name": "Maxixe, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 1.39,
      "carbs": 2.73,
      "fat": 0.07
    }
  },
  {
    "id": "mel-de-abelha",
    "name": "Mel, de abelha",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 309,
      "protein": 0,
      "carbs": 84.03,
      "fat": 0
    }
  },
  {
    "id": "melado",
    "name": "Melado",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 297,
      "protein": 0,
      "carbs": 76.62,
      "fat": 0
    }
  },
  {
    "id": "melancia-crua",
    "name": "Melancia, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 33,
      "protein": 0.88,
      "carbs": 8.14,
      "fat": 0
    }
  },
  {
    "id": "melao-cru",
    "name": "Melão, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 29,
      "protein": 0.68,
      "carbs": 7.53,
      "fat": 0
    }
  },
  {
    "id": "merluza-file-assado",
    "name": "Merluza, filé, assado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 122,
      "protein": 26.6,
      "carbs": 0,
      "fat": 0.92
    }
  },
  {
    "id": "merluza-file-cru",
    "name": "Merluza, filé, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 89,
      "protein": 16.61,
      "carbs": 0,
      "fat": 2.02
    }
  },
  {
    "id": "merluza-file-frito",
    "name": "Merluza, filé, frito",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 192,
      "protein": 26.93,
      "carbs": 0,
      "fat": 8.5
    }
  },
  {
    "id": "mexerica-murcote-crua",
    "name": "Mexerica, Murcote, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 58,
      "protein": 0.88,
      "carbs": 14.86,
      "fat": 0.13
    }
  },
  {
    "id": "mexerica-rio-crua",
    "name": "Mexerica, Rio, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 37,
      "protein": 0.65,
      "carbs": 9.34,
      "fat": 0.13
    }
  },
  {
    "id": "milho-amido-cru",
    "name": "Milho, amido, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 361,
      "protein": 0.6,
      "carbs": 87.15,
      "fat": 0
    }
  },
  {
    "id": "milho-fuba-cru",
    "name": "Milho, fubá, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 353,
      "protein": 7.21,
      "carbs": 78.87,
      "fat": 1.9
    }
  },
  {
    "id": "milho-verde-cru",
    "name": "Milho, verde, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 138,
      "protein": 6.59,
      "carbs": 28.56,
      "fat": 0.61
    }
  },
  {
    "id": "milho-verde-enlatado-drenado",
    "name": "Milho, verde, enlatado, drenado",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 98,
      "protein": 3.23,
      "carbs": 17.14,
      "fat": 2.35
    }
  },
  {
    "id": "mingau-tradicional-po",
    "name": "Mingau tradicional, pó",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 373,
      "protein": 0.58,
      "carbs": 89.34,
      "fat": 0.37
    }
  },
  {
    "id": "morango-cru",
    "name": "Morango, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 30,
      "protein": 0.89,
      "carbs": 6.82,
      "fat": 0.31
    }
  },
  {
    "id": "mortadela",
    "name": "Mortadela",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 269,
      "protein": 11.95,
      "carbs": 5.82,
      "fat": 21.65
    }
  },
  {
    "id": "mostarda-folha-crua",
    "name": "Mostarda, folha, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 18,
      "protein": 2.11,
      "carbs": 3.24,
      "fat": 0.17
    }
  },
  {
    "id": "nabo-cru",
    "name": "Nabo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 18,
      "protein": 1.2,
      "carbs": 4.15,
      "fat": 0.05
    }
  },
  {
    "id": "nespera-crua",
    "name": "Nêspera, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 43,
      "protein": 0.31,
      "carbs": 11.53,
      "fat": 0
    }
  },
  {
    "id": "nhoque-batata-cozido",
    "name": "Nhoque, batata, cozido",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 181,
      "protein": 5.86,
      "carbs": 36.78,
      "fat": 1.94
    }
  },
  {
    "id": "noz-crua",
    "name": "Noz, crua",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 620,
      "protein": 13.97,
      "carbs": 18.36,
      "fat": 59.36
    }
  },
  {
    "id": "oleo-de-babacu",
    "name": "Óleo, de babaçu",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "oleo-de-canola",
    "name": "Óleo, de canola",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "oleo-de-girassol",
    "name": "Óleo, de girassol",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "oleo-de-milho",
    "name": "Óleo, de milho",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "oleo-de-pequi",
    "name": "Óleo, de pequi",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "oleo-de-soja",
    "name": "Óleo, de soja",
    "category": "Gorduras e óleos",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 884,
      "protein": 0,
      "carbs": 0,
      "fat": 100
    }
  },
  {
    "id": "omelete-de-queijo",
    "name": "Omelete, de queijo",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 268,
      "protein": 15.57,
      "carbs": 0.44,
      "fat": 22.01
    }
  },
  {
    "id": "ovo-de-codorna-inteiro-cru",
    "name": "Ovo, de codorna, inteiro, cru",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 177,
      "protein": 13.69,
      "carbs": 0.77,
      "fat": 12.68
    }
  },
  {
    "id": "ovo-de-galinha-clara-cozida-10minutos",
    "name": "Ovo, de galinha, clara, cozida/10minutos",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 59,
      "protein": 13.45,
      "carbs": 0,
      "fat": 0.09
    }
  },
  {
    "id": "ovo-de-galinha-gema-cozida-10minutos",
    "name": "Ovo, de galinha, gema, cozida/10minutos",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 353,
      "protein": 15.9,
      "carbs": 1.56,
      "fat": 30.78
    }
  },
  {
    "id": "ovo-de-galinha-inteiro-cozido-10minutos",
    "name": "Ovo, de galinha, inteiro, cozido/10minutos",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 146,
      "protein": 13.29,
      "carbs": 0.61,
      "fat": 9.48
    }
  },
  {
    "id": "ovo-de-galinha-inteiro-cru",
    "name": "Ovo, de galinha, inteiro, cru",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 143,
      "protein": 13.03,
      "carbs": 1.64,
      "fat": 8.9
    }
  },
  {
    "id": "ovo-de-galinha-inteiro-frito",
    "name": "Ovo, de galinha, inteiro, frito",
    "category": "Ovos e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 240,
      "protein": 15.62,
      "carbs": 1.19,
      "fat": 18.59
    }
  },
  {
    "id": "pacoca-amendoim",
    "name": "Paçoca, amendoim",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 487,
      "protein": 16,
      "carbs": 52.38,
      "fat": 26.08
    }
  },
  {
    "id": "palmito-jucara-em-conserva",
    "name": "Palmito, Juçara, em conserva",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 23,
      "protein": 1.79,
      "carbs": 4.33,
      "fat": 0.4
    }
  },
  {
    "id": "palmito-pupunha-em-conserva",
    "name": "Palmito, pupunha, em conserva",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 29,
      "protein": 2.46,
      "carbs": 5.51,
      "fat": 0.45
    }
  },
  {
    "id": "pamonha-barra-para-cozimento-pre-cozida",
    "name": "Pamonha, barra para cozimento, pré-cozida",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 171,
      "protein": 2.55,
      "carbs": 30.68,
      "fat": 4.85
    }
  },
  {
    "id": "pao-aveia-forma",
    "name": "Pão, aveia, forma",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 343,
      "protein": 12.35,
      "carbs": 59.57,
      "fat": 5.69
    }
  },
  {
    "id": "pao-de-queijo-assado",
    "name": "Pão, de queijo, assado",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 363,
      "protein": 5.12,
      "carbs": 34.24,
      "fat": 24.57
    }
  },
  {
    "id": "pao-de-queijo-cru",
    "name": "Pão, de queijo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 295,
      "protein": 3.65,
      "carbs": 38.51,
      "fat": 13.99
    }
  },
  {
    "id": "pao-de-soja",
    "name": "Pão, de soja",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 309,
      "protein": 11.34,
      "carbs": 56.51,
      "fat": 3.58
    }
  },
  {
    "id": "pao-gluten-forma",
    "name": "Pão, glúten, forma",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 253,
      "protein": 11.95,
      "carbs": 44.12,
      "fat": 2.73
    }
  },
  {
    "id": "pao-milho-forma",
    "name": "Pão, milho, forma",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 292,
      "protein": 8.3,
      "carbs": 56.4,
      "fat": 3.11
    }
  },
  {
    "id": "pao-trigo-forma-integral",
    "name": "Pão, trigo, forma, integral",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 253,
      "protein": 9.43,
      "carbs": 49.94,
      "fat": 3.65
    }
  },
  {
    "id": "pao-trigo-frances",
    "name": "Pão, trigo, francês",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 300,
      "protein": 7.95,
      "carbs": 58.65,
      "fat": 3.1
    }
  },
  {
    "id": "pao-trigo-sovado",
    "name": "Pão, trigo, sovado",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 311,
      "protein": 8.4,
      "carbs": 61.45,
      "fat": 2.84
    }
  },
  {
    "id": "pastel-de-carne-cru",
    "name": "Pastel, de carne, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 289,
      "protein": 10.74,
      "carbs": 42.02,
      "fat": 8.79
    }
  },
  {
    "id": "pastel-de-carne-frito",
    "name": "Pastel, de carne, frito",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 388,
      "protein": 10.1,
      "carbs": 43.77,
      "fat": 20.14
    }
  },
  {
    "id": "pastel-de-queijo-cru",
    "name": "Pastel, de queijo, cru",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 308,
      "protein": 9.85,
      "carbs": 45.95,
      "fat": 9.63
    }
  },
  {
    "id": "pastel-de-queijo-frito",
    "name": "Pastel, de queijo, frito",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 422,
      "protein": 8.71,
      "carbs": 48.13,
      "fat": 22.67
    }
  },
  {
    "id": "pastel-massa-crua",
    "name": "Pastel, massa, crua",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 310,
      "protein": 6.9,
      "carbs": 57.38,
      "fat": 5.48
    }
  },
  {
    "id": "pastel-massa-frita",
    "name": "Pastel, massa, frita",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 570,
      "protein": 6.02,
      "carbs": 49.34,
      "fat": 40.86
    }
  },
  {
    "id": "pe-de-moleque-amendoim",
    "name": "Pé-de-moleque, amendoim",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 503,
      "protein": 13.16,
      "carbs": 54.73,
      "fat": 28.05
    }
  },
  {
    "id": "pepino-cru",
    "name": "Pepino, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 10,
      "protein": 0.87,
      "carbs": 2.04,
      "fat": 0
    }
  },
  {
    "id": "pequi-cru",
    "name": "Pequi, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 205,
      "protein": 2.34,
      "carbs": 12.97,
      "fat": 17.97
    }
  },
  {
    "id": "pera-park-crua",
    "name": "Pêra, Park, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 61,
      "protein": 0.24,
      "carbs": 16.07,
      "fat": 0.23
    }
  },
  {
    "id": "pera-williams-crua",
    "name": "Pêra, Williams, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 53,
      "protein": 0.57,
      "carbs": 14.02,
      "fat": 0.11
    }
  },
  {
    "id": "peru-congelado-assado",
    "name": "Peru, congelado, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 163,
      "protein": 26.2,
      "carbs": 0,
      "fat": 5.68
    }
  },
  {
    "id": "peru-congelado-cru",
    "name": "Peru, congelado, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 94,
      "protein": 18.08,
      "carbs": 0,
      "fat": 1.83
    }
  },
  {
    "id": "pescada-branca-crua",
    "name": "Pescada, branca, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 111,
      "protein": 16.26,
      "carbs": 0,
      "fat": 4.59
    }
  },
  {
    "id": "pescada-branca-frita",
    "name": "Pescada, branca, frita",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 223,
      "protein": 27.36,
      "carbs": 0,
      "fat": 11.78
    }
  },
  {
    "id": "pescada-file-com-farinha-de-trigo-frito",
    "name": "Pescada, filé, com farinha de trigo, frito",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 283,
      "protein": 21.44,
      "carbs": 5.03,
      "fat": 19.11
    }
  },
  {
    "id": "pescada-file-cru",
    "name": "Pescada, filé, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 107,
      "protein": 16.65,
      "carbs": 0,
      "fat": 4
    }
  },
  {
    "id": "pescada-file-frito",
    "name": "Pescada, filé, frito",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 154,
      "protein": 28.59,
      "carbs": 0,
      "fat": 3.57
    }
  },
  {
    "id": "pescada-file-molho-escabeche",
    "name": "Pescada, filé, molho escabeche",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 142,
      "protein": 11.75,
      "carbs": 5.02,
      "fat": 8.02
    }
  },
  {
    "id": "pescadinha-crua",
    "name": "Pescadinha, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 76,
      "protein": 15.48,
      "carbs": 0,
      "fat": 1.14
    }
  },
  {
    "id": "pessego-aurora-cru",
    "name": "Pêssego, Aurora, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 36,
      "protein": 0.83,
      "carbs": 9.32,
      "fat": 0
    }
  },
  {
    "id": "pessego-enlatado-em-calda",
    "name": "Pêssego, enlatado, em calda",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 63,
      "protein": 0.71,
      "carbs": 16.88,
      "fat": 0
    }
  },
  {
    "id": "pimentao-amarelo-cru",
    "name": "Pimentão, amarelo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 28,
      "protein": 1.22,
      "carbs": 5.96,
      "fat": 0.44
    }
  },
  {
    "id": "pimentao-verde-cru",
    "name": "Pimentão, verde, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 21,
      "protein": 1.05,
      "carbs": 4.89,
      "fat": 0.15
    }
  },
  {
    "id": "pimentao-vermelho-cru",
    "name": "Pimentão, vermelho, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 23,
      "protein": 1.04,
      "carbs": 5.47,
      "fat": 0.15
    }
  },
  {
    "id": "pinha-crua",
    "name": "Pinha, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 88,
      "protein": 1.49,
      "carbs": 22.45,
      "fat": 0.32
    }
  },
  {
    "id": "pinhao-cozido",
    "name": "Pinhão, cozido",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 174,
      "protein": 2.98,
      "carbs": 43.92,
      "fat": 0.75
    }
  },
  {
    "id": "pintado-assado",
    "name": "Pintado, assado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 192,
      "protein": 36.45,
      "carbs": 0,
      "fat": 3.98
    }
  },
  {
    "id": "pintado-cru",
    "name": "Pintado, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 91,
      "protein": 18.56,
      "carbs": 0,
      "fat": 1.31
    }
  },
  {
    "id": "pintado-grelhado",
    "name": "Pintado, grelhado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 152,
      "protein": 30.8,
      "carbs": 0,
      "fat": 2.29
    }
  },
  {
    "id": "pipoca-com-oleo-de-soja-sem-sal",
    "name": "Pipoca, com óleo de soja, sem sal",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 448,
      "protein": 9.93,
      "carbs": 70.31,
      "fat": 15.94
    }
  },
  {
    "id": "pitanga-crua",
    "name": "Pitanga, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 41,
      "protein": 0.93,
      "carbs": 10.24,
      "fat": 0.17
    }
  },
  {
    "id": "pitanga-polpa-congelada",
    "name": "Pitanga, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 19,
      "protein": 0.29,
      "carbs": 4.76,
      "fat": 0.12
    }
  },
  {
    "id": "polenta-pre-cozida",
    "name": "Polenta, pré-cozida",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 103,
      "protein": 2.29,
      "carbs": 23.31,
      "fat": 0.3
    }
  },
  {
    "id": "polvilho-doce",
    "name": "Polvilho, doce",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 351,
      "protein": 0.43,
      "carbs": 86.77,
      "fat": 0
    }
  },
  {
    "id": "porco-bisteca-crua",
    "name": "Porco, bisteca, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 164,
      "protein": 21.5,
      "carbs": 0,
      "fat": 8.02
    }
  },
  {
    "id": "porco-bisteca-frita",
    "name": "Porco, bisteca, frita",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 311,
      "protein": 33.75,
      "carbs": 0,
      "fat": 18.52
    }
  },
  {
    "id": "porco-bisteca-grelhada",
    "name": "Porco, bisteca, grelhada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 280,
      "protein": 28.89,
      "carbs": 0,
      "fat": 17.38
    }
  },
  {
    "id": "porco-costela-assada",
    "name": "Porco, costela, assada",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 402,
      "protein": 30.22,
      "carbs": 0,
      "fat": 30.28
    }
  },
  {
    "id": "porco-costela-crua",
    "name": "Porco, costela, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 256,
      "protein": 18,
      "carbs": 0,
      "fat": 19.82
    }
  },
  {
    "id": "porco-lombo-assado",
    "name": "Porco, lombo, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 210,
      "protein": 35.73,
      "carbs": 0,
      "fat": 6.4
    }
  },
  {
    "id": "porco-lombo-cru",
    "name": "Porco, lombo, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 176,
      "protein": 22.6,
      "carbs": 0,
      "fat": 8.77
    }
  },
  {
    "id": "porco-orelha-salgada-crua",
    "name": "Porco, orelha, salgada, crua",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 258,
      "protein": 18.52,
      "carbs": 0,
      "fat": 19.89
    }
  },
  {
    "id": "porco-pernil-assado",
    "name": "Porco, pernil, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 262,
      "protein": 32.13,
      "carbs": 0,
      "fat": 13.86
    }
  },
  {
    "id": "porco-pernil-cru",
    "name": "Porco, pernil, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 186,
      "protein": 20.13,
      "carbs": 0,
      "fat": 11.1
    }
  },
  {
    "id": "porco-rabo-salgado-cru",
    "name": "Porco, rabo, salgado, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 377,
      "protein": 15.58,
      "carbs": 0,
      "fat": 34.47
    }
  },
  {
    "id": "porquinho-cru",
    "name": "Porquinho, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 93,
      "protein": 20.49,
      "carbs": 0,
      "fat": 0.61
    }
  },
  {
    "id": "presunto-com-capa-de-gordura",
    "name": "Presunto, com capa de gordura",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 128,
      "protein": 14.37,
      "carbs": 1.4,
      "fat": 6.77
    }
  },
  {
    "id": "presunto-sem-capa-de-gordura",
    "name": "Presunto, sem capa de gordura",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 94,
      "protein": 14.29,
      "carbs": 2.15,
      "fat": 2.71
    }
  },
  {
    "id": "pupunha-cozida",
    "name": "Pupunha, cozida",
    "category": "Nozes e sementes",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 219,
      "protein": 2.52,
      "carbs": 29.57,
      "fat": 12.76
    }
  },
  {
    "id": "queijo-minas-frescal",
    "name": "Queijo, minas, frescal",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 264,
      "protein": 17.41,
      "carbs": 3.24,
      "fat": 20.18
    }
  },
  {
    "id": "queijo-minas-meia-cura",
    "name": "Queijo, minas, meia cura",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 321,
      "protein": 21.21,
      "carbs": 3.57,
      "fat": 24.61
    }
  },
  {
    "id": "queijo-mozarela",
    "name": "Queijo, mozarela",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 330,
      "protein": 22.65,
      "carbs": 3.05,
      "fat": 25.18
    }
  },
  {
    "id": "queijo-parmesao",
    "name": "Queijo, parmesão",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 453,
      "protein": 35.55,
      "carbs": 1.66,
      "fat": 33.53
    }
  },
  {
    "id": "queijo-pasteurizado",
    "name": "Queijo, pasteurizado",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 303,
      "protein": 9.36,
      "carbs": 5.68,
      "fat": 27.44
    }
  },
  {
    "id": "queijo-petit-suisse-morango",
    "name": "Queijo, petit suisse, morango",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 121,
      "protein": 5.79,
      "carbs": 18.46,
      "fat": 2.84
    }
  },
  {
    "id": "queijo-prato",
    "name": "Queijo, prato",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 360,
      "protein": 22.66,
      "carbs": 1.88,
      "fat": 29.11
    }
  },
  {
    "id": "queijo-ricota",
    "name": "Queijo, ricota",
    "category": "Leite e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 140,
      "protein": 12.6,
      "carbs": 3.79,
      "fat": 8.11
    }
  },
  {
    "id": "quiabo-cru",
    "name": "Quiabo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 30,
      "protein": 1.92,
      "carbs": 6.37,
      "fat": 0.3
    }
  },
  {
    "id": "quibe-assado",
    "name": "Quibe, assado",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 136,
      "protein": 14.59,
      "carbs": 12.86,
      "fat": 2.68
    }
  },
  {
    "id": "quibe-cru",
    "name": "Quibe, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 109,
      "protein": 12.35,
      "carbs": 10.77,
      "fat": 1.67
    }
  },
  {
    "id": "quibe-frito",
    "name": "Quibe, frito",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 254,
      "protein": 14.89,
      "carbs": 12.34,
      "fat": 15.8
    }
  },
  {
    "id": "quibebe",
    "name": "Quibebe",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 86,
      "protein": 8.56,
      "carbs": 6.64,
      "fat": 2.67
    }
  },
  {
    "id": "quindim",
    "name": "Quindim",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 411,
      "protein": 4.74,
      "carbs": 46.3,
      "fat": 24.43
    }
  },
  {
    "id": "rabanete-cru",
    "name": "Rabanete, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 14,
      "protein": 1.39,
      "carbs": 2.73,
      "fat": 0.07
    }
  },
  {
    "id": "rapadura",
    "name": "Rapadura",
    "category": "Produtos açucarados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 352,
      "protein": 0.99,
      "carbs": 90.79,
      "fat": 0.07
    }
  },
  {
    "id": "refrigerante-tipo-agua-tonica",
    "name": "Refrigerante, tipo água tônica",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 31,
      "protein": 0,
      "carbs": 7.95,
      "fat": 0
    }
  },
  {
    "id": "refrigerante-tipo-cola",
    "name": "Refrigerante, tipo cola",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 34,
      "protein": 0,
      "carbs": 8.66,
      "fat": 0
    }
  },
  {
    "id": "refrigerante-tipo-guarana",
    "name": "Refrigerante, tipo guaraná",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 0,
      "carbs": 10,
      "fat": 0
    }
  },
  {
    "id": "refrigerante-tipo-laranja",
    "name": "Refrigerante, tipo laranja",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 46,
      "protein": 0,
      "carbs": 11.79,
      "fat": 0
    }
  },
  {
    "id": "refrigerante-tipo-limao",
    "name": "Refrigerante, tipo limão",
    "category": "Bebidas (alcoólicas e não alcoólicas)",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 40,
      "protein": 0,
      "carbs": 10.26,
      "fat": 0
    }
  },
  {
    "id": "repolho-branco-cru",
    "name": "Repolho, branco, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 17,
      "protein": 0.88,
      "carbs": 3.86,
      "fat": 0.14
    }
  },
  {
    "id": "repolho-roxo-cru",
    "name": "Repolho, roxo, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 31,
      "protein": 1.91,
      "carbs": 7.2,
      "fat": 0.06
    }
  },
  {
    "id": "repolho-roxo-refogado",
    "name": "Repolho, roxo, refogado",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 42,
      "protein": 1.8,
      "carbs": 7.56,
      "fat": 1.24
    }
  },
  {
    "id": "roma-crua",
    "name": "Romã, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 56,
      "protein": 0.4,
      "carbs": 15.11,
      "fat": 0
    }
  },
  {
    "id": "rucula-crua",
    "name": "Rúcula, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 13,
      "protein": 1.77,
      "carbs": 2.22,
      "fat": 0.11
    }
  },
  {
    "id": "sal-dietetico",
    "name": "Sal, dietético",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "sal-grosso",
    "name": "Sal, grosso",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "salada-de-legumes-com-maionese",
    "name": "Salada, de legumes, com maionese",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 96,
      "protein": 1.05,
      "carbs": 8.92,
      "fat": 7.04
    }
  },
  {
    "id": "salada-de-legumes-cozida-no-vapor",
    "name": "Salada, de legumes, cozida no vapor",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 35,
      "protein": 2.01,
      "carbs": 7.09,
      "fat": 0.31
    }
  },
  {
    "id": "salame",
    "name": "Salame",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 398,
      "protein": 25.81,
      "carbs": 2.91,
      "fat": 30.64
    }
  },
  {
    "id": "salmao-file-com-pele-fresco-grelhado",
    "name": "Salmão, filé, com pele, fresco,  grelhado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 229,
      "protein": 23.92,
      "carbs": 0,
      "fat": 14.04
    }
  },
  {
    "id": "salmao-sem-pele-fresco-cru",
    "name": "Salmão, sem pele, fresco, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 170,
      "protein": 19.25,
      "carbs": 0,
      "fat": 9.71
    }
  },
  {
    "id": "salmao-sem-pele-fresco-grelhado",
    "name": "Salmão, sem pele, fresco, grelhado",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 243,
      "protein": 26.14,
      "carbs": 0,
      "fat": 14.53
    }
  },
  {
    "id": "salpicao-de-frango",
    "name": "Salpicão, de frango",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 148,
      "protein": 13.93,
      "carbs": 4.57,
      "fat": 7.84
    }
  },
  {
    "id": "salsa-crua",
    "name": "Salsa, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 33,
      "protein": 3.26,
      "carbs": 5.71,
      "fat": 0.61
    }
  },
  {
    "id": "sarapatel",
    "name": "Sarapatel",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 123,
      "protein": 18.47,
      "carbs": 1.09,
      "fat": 4.42
    }
  },
  {
    "id": "sardinha-assada",
    "name": "Sardinha, assada",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 164,
      "protein": 32.18,
      "carbs": 0,
      "fat": 2.99
    }
  },
  {
    "id": "sardinha-conserva-em-oleo",
    "name": "Sardinha, conserva em óleo",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 285,
      "protein": 15.94,
      "carbs": 0,
      "fat": 24.05
    }
  },
  {
    "id": "sardinha-frita",
    "name": "Sardinha, frita",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 257,
      "protein": 33.38,
      "carbs": 0,
      "fat": 12.69
    }
  },
  {
    "id": "sardinha-inteira-crua",
    "name": "Sardinha, inteira, crua",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 114,
      "protein": 21.08,
      "carbs": 0,
      "fat": 2.65
    }
  },
  {
    "id": "seleta-de-legumes-enlatada",
    "name": "Seleta de legumes, enlatada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 57,
      "protein": 3.42,
      "carbs": 12.67,
      "fat": 0.35
    }
  },
  {
    "id": "serralha-crua",
    "name": "Serralha, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 30,
      "protein": 2.67,
      "carbs": 4.95,
      "fat": 0.74
    }
  },
  {
    "id": "shoyu",
    "name": "Shoyu",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 61,
      "protein": 3.31,
      "carbs": 11.65,
      "fat": 0.33
    }
  },
  {
    "id": "soja-extrato-soluvel-natural-fluido",
    "name": "Soja, extrato solúvel, natural, fluido",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 39,
      "protein": 2.38,
      "carbs": 4.28,
      "fat": 1.61
    }
  },
  {
    "id": "soja-extrato-soluvel-po",
    "name": "Soja, extrato solúvel, pó",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 459,
      "protein": 35.69,
      "carbs": 28.48,
      "fat": 26.18
    }
  },
  {
    "id": "soja-farinha",
    "name": "Soja, farinha",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 404,
      "protein": 36.03,
      "carbs": 38.44,
      "fat": 14.63
    }
  },
  {
    "id": "soja-queijo-tofu",
    "name": "Soja, queijo (tofu)",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 64,
      "protein": 6.55,
      "carbs": 2.13,
      "fat": 3.95
    }
  },
  {
    "id": "tabule",
    "name": "Tabule",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 57,
      "protein": 2.05,
      "carbs": 10.58,
      "fat": 1.21
    }
  },
  {
    "id": "tacaca",
    "name": "Tacacá",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 47,
      "protein": 6.96,
      "carbs": 3.39,
      "fat": 0.36
    }
  },
  {
    "id": "taioba-crua",
    "name": "Taioba, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 34,
      "protein": 2.9,
      "carbs": 5.43,
      "fat": 0.93
    }
  },
  {
    "id": "tamarindo-cru",
    "name": "Tamarindo, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 276,
      "protein": 3.21,
      "carbs": 72.53,
      "fat": 0.46
    }
  },
  {
    "id": "tangerina-ponca-crua",
    "name": "Tangerina, Poncã, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 38,
      "protein": 0.85,
      "carbs": 9.61,
      "fat": 0.07
    }
  },
  {
    "id": "tangerina-ponca-suco",
    "name": "Tangerina, Poncã, suco",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 36,
      "protein": 0.52,
      "carbs": 8.8,
      "fat": 0
    }
  },
  {
    "id": "tapioca-com-manteiga",
    "name": "Tapioca, com manteiga",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 348,
      "protein": 0.09,
      "carbs": 63.59,
      "fat": 10.91
    }
  },
  {
    "id": "tempero-a-base-de-sal",
    "name": "Tempero a base de sal",
    "category": "Miscelâneas",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 21,
      "protein": 2.67,
      "carbs": 2.07,
      "fat": 0.26
    }
  },
  {
    "id": "tomate-com-semente-cru",
    "name": "Tomate, com semente, cru",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 15,
      "protein": 1.1,
      "carbs": 3.14,
      "fat": 0.17
    }
  },
  {
    "id": "tomate-extrato",
    "name": "Tomate, extrato",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 61,
      "protein": 2.43,
      "carbs": 14.96,
      "fat": 0.19
    }
  },
  {
    "id": "tomate-molho-industrializado",
    "name": "Tomate, molho industrializado",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 38,
      "protein": 1.38,
      "carbs": 7.71,
      "fat": 0.9
    }
  },
  {
    "id": "tomate-pure",
    "name": "Tomate, purê",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 28,
      "protein": 1.36,
      "carbs": 6.89,
      "fat": 0
    }
  },
  {
    "id": "tomate-salada",
    "name": "Tomate, salada",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 21,
      "protein": 0.81,
      "carbs": 5.12,
      "fat": 0
    }
  },
  {
    "id": "torrada-pao-frances",
    "name": "Torrada, pão francês",
    "category": "Cereais e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 377,
      "protein": 10.52,
      "carbs": 74.56,
      "fat": 3.3
    }
  },
  {
    "id": "toucinho-cru",
    "name": "Toucinho, cru",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 593,
      "protein": 11.48,
      "carbs": 0,
      "fat": 60.26
    }
  },
  {
    "id": "toucinho-frito",
    "name": "Toucinho, frito",
    "category": "Carnes e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 697,
      "protein": 27.28,
      "carbs": 0,
      "fat": 64.31
    }
  },
  {
    "id": "tremoco-cru",
    "name": "Tremoço, cru",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 381,
      "protein": 33.58,
      "carbs": 43.79,
      "fat": 10.34
    }
  },
  {
    "id": "tremoco-em-conserva",
    "name": "Tremoço, em conserva",
    "category": "Leguminosas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 121,
      "protein": 11.11,
      "carbs": 12.39,
      "fat": 3.78
    }
  },
  {
    "id": "tucuma-cru",
    "name": "Tucumã, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 262,
      "protein": 2.09,
      "carbs": 26.47,
      "fat": 19.08
    }
  },
  {
    "id": "tucunare-file-congelado-cru",
    "name": "Tucunaré, filé, congelado, cru",
    "category": "Pescados e frutos do mar",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 88,
      "protein": 17.96,
      "carbs": 0,
      "fat": 1.22
    }
  },
  {
    "id": "tucupi-com-pimenta-de-cheiro",
    "name": "Tucupi, com pimenta-de-cheiro",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 27,
      "protein": 2.06,
      "carbs": 4.74,
      "fat": 0.28
    }
  },
  {
    "id": "umbu-cru",
    "name": "Umbu, cru",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 37,
      "protein": 0.84,
      "carbs": 9.4,
      "fat": 0
    }
  },
  {
    "id": "umbu-polpa-congelada",
    "name": "Umbu, polpa, congelada",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 34,
      "protein": 0.51,
      "carbs": 8.79,
      "fat": 0.07
    }
  },
  {
    "id": "uva-italia-crua",
    "name": "Uva, Itália, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 53,
      "protein": 0.75,
      "carbs": 13.57,
      "fat": 0.2
    }
  },
  {
    "id": "uva-rubi-crua",
    "name": "Uva, Rubi, crua",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 49,
      "protein": 0.61,
      "carbs": 12.7,
      "fat": 0.16
    }
  },
  {
    "id": "uva-suco-concentrado-envasado",
    "name": "Uva, suco concentrado, envasado",
    "category": "Frutas e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 58,
      "protein": 0,
      "carbs": 14.71,
      "fat": 0
    }
  },
  {
    "id": "vaca-atolada",
    "name": "Vaca atolada",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 145,
      "protein": 5.12,
      "carbs": 10.06,
      "fat": 9.32
    }
  },
  {
    "id": "vagem-crua",
    "name": "Vagem, crua",
    "category": "Verduras, hortaliças e derivados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 25,
      "protein": 1.79,
      "carbs": 5.35,
      "fat": 0.17
    }
  },
  {
    "id": "vatapa",
    "name": "Vatapá",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 255,
      "protein": 6,
      "carbs": 9.75,
      "fat": 23.23
    }
  },
  {
    "id": "virado-a-paulista",
    "name": "Virado à paulista",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 307,
      "protein": 10.18,
      "carbs": 14.11,
      "fat": 25.59
    }
  },
  {
    "id": "yakisoba",
    "name": "Yakisoba",
    "category": "Alimentos preparados",
    "serving": {
      "unit": "g",
      "amount": 100
    },
    "nutrition": {
      "calories": 113,
      "protein": 7.52,
      "carbs": 18.25,
      "fat": 2.61
    }
  }
]

// Dados TACO - Integração completa da base de dados brasileira
const tacoFoods = [{"id":99,"description":"Biscoito, polvilho doce","category":"Verduras, hortaliças e derivados","humidity_percents":5.43733333333333,"energy_kcal":437.549,"energy_kj":1830.705016,"protein_g":1.29166666666667,"lipid_g":12.249,"cholesterol_mg":9.385,"carbohydrate_g":80.5353333333333,"fiber_g":1.159,"ashes_g":0.486666666666667,"calcium_mg":30.4543333333333,"magnesium_mg":5.845,"manganese_mg":0.081333333333333,"phosphorus_mg":23.319,"iron_mg":1.76633333333333,"sodium_mg":97.8013333333333,"potassium_mg":53.5793333333333,"copper_mg":0.035,"zinc_mg":0.145,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":"Tr","riboflavin_mg":0.03,"pyridoxine_mg":0.066666666666667,"niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":2.4,"monounsaturated_g":4.3,"polyunsaturated_g":0.6,"12:0_g":"","14:0_g":0.03,"16:0_g":1.48,"18:0_g":0.8,"20:0_g":0.05,"22:0_g":0.05,"24:0_g":0.02,"14:1_g":"","16:1_g":"","18:1_g":4.25,"20:1_g":0.01,"18:2 n-6_g":0.56,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":4.05,"18:2t_g":0.4,"tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""},{"id":100,"description":"Biscoito, polvilho salgado","category":"Verduras, hortaliças e derivados","humidity_percents":1.27133333333333,"energy_kcal":502.335333333333,"energy_kj":2101.79880746667,"protein_g":0.488333333333333,"lipid_g":24.37,"cholesterol_mg":"NA","carbohydrate_g":72.5866666666667,"fiber_g":0.65,"ashes_g":1.28333333333333,"calcium_mg":15.5266666666667,"magnesium_mg":2.89333333333333,"manganese_mg":0.028,"phosphorus_mg":12.4,"iron_mg":0.63,"sodium_mg":325.333333333333,"potassium_mg":37.2333333333333,"copper_mg":0.014666666666667,"zinc_mg":0.089,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":"Tr","riboflavin_mg":"Tr","pyridoxine_mg":"Tr","niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":5.9,"monounsaturated_g":8.8,"polyunsaturated_g":1.3,"12:0_g":"","14:0_g":0.06,"16:0_g":3.47,"18:0_g":2.09,"20:0_g":0.1,"22:0_g":0.1,"24:0_g":0.04,"14:1_g":"","16:1_g":"","18:1_g":8.66,"20:1_g":0.02,"18:2 n-6_g":1.19,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":8.24,"18:2t_g":0.82,"tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""},{"id":101,"description":"Biscoito, rosca","category":"Verduras, hortaliças e derivados","humidity_percents":5.49533333333333,"energy_kcal":451.253666666667,"energy_kj":1888.03393706667,"protein_g":8.91166666666667,"lipid_g":14.6243333333333,"cholesterol_mg":"NA","carbohydrate_g":69.0453333333333,"fiber_g":1.86833333333333,"ashes_g":1.92333333333333,"calcium_mg":24.0766666666667,"magnesium_mg":10.3433333333333,"manganese_mg":0.295,"phosphorus_mg":64.53,"iron_mg":0.969,"sodium_mg":318.903333333333,"potassium_mg":96.5266666666667,"copper_mg":0.058,"zinc_mg":0.479,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":"Tr","riboflavin_mg":0.047,"pyridoxine_mg":"Tr","niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":3.6,"monounsaturated_g":5.1,"polyunsaturated_g":0.9,"12:0_g":"","14:0_g":0.04,"16:0_g":2.12,"18:0_g":1.24,"20:0_g":0.07,"22:0_g":0.07,"24:0_g":0.03,"14:1_g":"","16:1_g":"","18:1_g":5.01,"20:1_g":0.02,"18:2 n-6_g":0.82,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":4.76,"18:2t_g":0.57,"tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""},{"id":102,"description":"Biscoito, wafer, recheado de chocolate","category":"Verduras, hortaliças e derivados","humidity_percents":1.20566666666667,"energy_kcal":499.066333333333,"energy_kj":2088.12157626667,"protein_g":5.70066666666667,"lipid_g":24.2506666666667,"cholesterol_mg":"NA","carbohydrate_g":67.0586666666667,"fiber_g":2.59333333333333,"ashes_g":1.78466666666667,"calcium_mg":119.146666666667,"magnesium_mg":40.3566666666667,"manganese_mg":0.441333333333333,"phosphorus_mg":130.053333333333,"iron_mg":2.23266666666667,"sodium_mg":101.276666666667,"potassium_mg":251.426666666667,"copper_mg":0.282,"zinc_mg":0.781333333333333,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":0.063,"riboflavin_mg":0.072,"pyridoxine_mg":"Tr","niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":13.6,"monounsaturated_g":7.3,"polyunsaturated_g":1.8,"12:0_g":0.15,"14:0_g":1.97,"16:0_g":8.59,"18:0_g":2.58,"20:0_g":"","22:0_g":"","24:0_g":"","14:1_g":"","16:1_g":"","18:1_g":7.2,"20:1_g":"","18:2 n-6_g":1.77,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":"","18:2t_g":"","tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""},{"id":103,"description":"Biscoito, wafer, recheado de morango","category":"Verduras, hortaliças e derivados","humidity_percents":1.034,"energy_kcal":506.7,"energy_kj":2120.0748,"protein_g":4.11666666666667,"lipid_g":24.8366666666667,"cholesterol_mg":"NA","carbohydrate_g":67.4633333333333,"fiber_g":0.686666666666667,"ashes_g":2.04666666666667,"calcium_mg":40.0933333333333,"magnesium_mg":9.96333333333333,"manganese_mg":0.154,"phosphorus_mg":52.66,"iron_mg":1.11833333333333,"sodium_mg":232.983333333333,"potassium_mg":102.733333333333,"copper_mg":0.067,"zinc_mg":0.257,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":"Tr","riboflavin_mg":"Tr","pyridoxine_mg":"Tr","niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":13.9,"monounsaturated_g":7.5,"polyunsaturated_g":1.9,"12:0_g":0.16,"14:0_g":2.02,"16:0_g":8.81,"18:0_g":2.65,"20:0_g":"","22:0_g":"","24:0_g":"","14:1_g":"","16:1_g":"","18:1_g":7.39,"20:1_g":"","18:2 n-6_g":1.82,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":"","18:2t_g":"","tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""},{"id":104,"description":"Bolo, mistura para bolo, chocolate, cru","category":"Verduras, hortaliças e derivados","humidity_percents":6.01933333333333,"energy_kcal":431.416333333333,"energy_kj":1805.04731546667,"protein_g":5.66566666666667,"lipid_g":15.261,"cholesterol_mg":"NA","carbohydrate_g":70.7953333333333,"fiber_g":3.04466666666667,"ashes_g":2.25866666666667,"calcium_mg":248.55,"magnesium_mg":58.77,"manganese_mg":0.424,"phosphorus_mg":541.95,"iron_mg":3.60866666666667,"sodium_mg":641.333333333333,"potassium_mg":349.533333333333,"copper_mg":0.283333333333333,"zinc_mg":1.16733333333333,"retinol_mcg":"Tr","re_mcg":"","rae_mcg":"","thiamine_mg":0.234666666666667,"riboflavin_mg":0.211333333333333,"pyridoxine_mg":0.186666666666667,"niacin_mg":"Tr","vitaminC_mg":"Tr","saturated_g":8.5,"monounsaturated_g":4.8,"polyunsaturated_g":1.2,"12:0_g":0.1,"14:0_g":1.24,"16:0_g":5.39,"18:0_g":1.6,"20:0_g":"","22:0_g":"","24:0_g":"","14:1_g":"","16:1_g":"","18:1_g":4.73,"20:1_g":"","18:2 n-6_g":1.16,"18:3 n-3_g":"","20:4_g":"","20:5_g":"","22:5_g":"","22:6_g":"","18:1t_g":"","18:2t_g":"","tryptophan_g":"","threonine_g":"","isoleucine_g":"","leucine_g":"","lysine_g":"","methionine_g":"","cystine_g":"","phenylalanine_g":"","tyrosine_g":"","valine_g":"","arginine_g":"","histidine_g":"","alanine_g":"","aspartic_g":"","glutamic_g":"","glycine_g":"","proline_g":"","serine_g":""}];

// Combinar catálogos
export const foodCatalog: Food[] = [
  ...baseFoodCatalog,
  ...tacoFoods.map(convertTacoFood)
];

// Helper para buscar alimento por ID
export const getFoodById = (id: string): Food | undefined => {
  return foodCatalog.find(food => food.id === id);
};

// Helper para categorias
export const foodCategories = Array.from(new Set(foodCatalog.map(f => f.category)));

// Helper para buscar por nome
export const searchFoods = (query: string): Food[] => {
  const lowerQuery = query.toLowerCase();
  return foodCatalog.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  );
};
