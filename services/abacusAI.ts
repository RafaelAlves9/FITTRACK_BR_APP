/**
 * Abacus AI Service - Food Recognition from Images
 * Uses Abacus AI Vision API to identify foods and match with TACO database
 */

import { devLog, devError } from "@/utils/logger";

interface DetectedFood {
   name: string;
   category: string;
   estimated_grams: number;
   confidence: number;
   nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
   };
}

/**
 * Analyze meal image using Abacus AI
 */
export async function analyzeMealImage(
   base64Image: string
): Promise<DetectedFood[]> {
   const apiKey = process.env.EXPO_PRIVATE_ABACUS_AI_API_KEY;

   if (!apiKey || apiKey === "YOUR_ABACUS_AI_API_KEY_HERE") {
      throw new Error("Abacus AI API key not configured");
   }

   try {
      // Call Abacus AI Vision API to identify foods
      devLog("Calling Abacus AI Vision API...");

      const abacusResponse = await fetch(
         "https://routellm.abacus.ai/v1/chat/completions",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
               model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
               messages: [
                  {
                     role: "system",
                     content: `Você é uma IA nutricionista. Analise a imagem e retorne APENAS um JSON (sem texto extra) com um array de alimentos no seguinte formato exato por item:
{
  "name": "Nome do alimento em pt-BR",
  "category": "Categoria geral em pt-BR (ex: Proteína, Carboidrato, Fruta, Verdura, Laticínio, Leguminosa, Bebida, Gordura, Outros)",
  "estimated_grams": 150,
  "confidence": 0.92,
  "nutrition": { "calories": 240, "protein": 8, "carbs": 42, "fat": 4 }
}
Observações:
- nutrition são os valores TOTAIS para a porção estimada (estimated_grams), não por 100g.
- Lembre-se que os alimentos serão brasileiros, então tenha um viés brasileiro quando for identificar os alimentos.
- Não inclua comentários, markdown ou chaves fora do array JSON.
- Tente ser o mais específico possível em relação aos nomes dos alimentos.
- Tente ser o mais acertivo possível em relação aos nomes dos alimentos.
- Quando houver mais de um alimento na imagem e estiver em dúvida sobre algum deles, tente entender o contexto da refeição total da foto para ser mais acertivo. EX: Foto de feijoada: Feijao, arroz, farofa de mandioca e laranja (se estiver na dúvida sobre a laranja ser possivelmnete um limão ou uma tangerina, anilize o contexto total da foto para ser mais acertivo.)
- Tente ser o mais acertivo possível em relação aos pesos dos alimentos da imagem.
- Os alimentos não necessariamente terão o mesmo peso, então tente ser o mais acertivo possível em relação aos pesos dos alimentos da imagem.`,
                  },
                  {
                     role: "user",
                     content: [
                        {
                           type: "text",
                           text: "Identifique TODOS os alimentos visíveis e retorne SOMENTE o array JSON conforme o esquema descrito.",
                        },
                        {
                           type: "image_url",
                           image_url: {
                              url: base64Image.startsWith("data:")
                                 ? base64Image
                                 : `data:image/jpeg;base64,${base64Image}`,
                           },
                        },
                     ],
                  },
               ],
               temperature: 0.3,
            }),
         }
      );

      if (!abacusResponse.ok) {
         const errorText = await abacusResponse.text();
         devError("Abacus AI Error:", errorText);
         throw new Error(`Abacus AI request failed: ${abacusResponse.status}`);
      }

      const abacusData = await abacusResponse.json();
      const content = abacusData.choices?.[0]?.message?.content;

      if (!content) {
         throw new Error("No response from Abacus AI");
      }

      // Parse AI response
      devLog("Parsing AI response...");
      let aiDetections: Array<{
         name: string;
         category?: string;
         estimated_grams: number;
         confidence?: number;
         nutrition?: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
         };
      }>;

      try {
         const cleanContent = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
         aiDetections = JSON.parse(cleanContent);
      } catch (parseError) {
         devError("Failed to parse AI response:", content);
         throw new Error("Invalid AI response format");
      }

      if (!Array.isArray(aiDetections) || aiDetections.length === 0) {
         return []; // No foods detected
      }

      // Normalize AI detections to DetectedFood (using AI totals directly)
      const normalized: DetectedFood[] = aiDetections.map((d) => ({
         name: d.name,
         category: d.category || "Outros",
         estimated_grams: d.estimated_grams,
         confidence: typeof d.confidence === "number" ? d.confidence : 0.8,
         nutrition: d.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
         },
      }));

      devLog(`Successfully parsed ${normalized.length} foods`);
      return normalized;
   } catch (error: any) {
      devError("Error in analyzeMealImage:", error);
      throw new Error(`Failed to analyze image: ${error.message}`);
   }
}

/**
 * Analyze meal textual description using Abacus AI
 * Keeps the same return schema used by analyzeMealImage
 */
export async function analyzeMealDescription(
   description: string
): Promise<DetectedFood[]> {
   const apiKey = process.env.EXPO_PRIVATE_ABACUS_AI_API_KEY;

   if (!apiKey || apiKey === "YOUR_ABACUS_AI_API_KEY_HERE") {
      throw new Error("Abacus AI API key not configured");
   }

   if (!description || description.trim().length < 3) {
      throw new Error("Descrição muito curta para análise");
   }

   try {
      const body = {
         model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
         messages: [
            {
               role: "system",
               content: `Você é uma IA nutricionista brasileira e precisa transformar uma descrição textual de refeição em um array JSON de alimentos.
Regras IMPORTANTES:
- Responda SOMENTE com um array JSON (sem markdown, sem comentários, sem texto antes/depois).
- Cada item do array deve seguir exatamente essa tipagem de valores:
{
  "name": "Nome do alimento em pt-BR",
  "category": "Categoria geral em pt-BR (ex: Proteína, Carboidrato, Fruta, Verdura, Laticínio, Leguminosa, Bebida, Gordura, Outros)",
  "estimated_grams": 180,
  "confidence": 0.9,
  "nutrition": { "calories": 250, "protein": 10, "carbs": 40, "fat": 5 }
}
- Os valores de nutrition DEVEM ser os TOTAIS para a porção estimada (estimated_grams) e não por 100g.
- Se a descrição informar quantidades (ex: 2 ovos, 1 colher de sopa, 1 copo, 1 fatia, 200ml), converta para gramas de forma consistente com o contexto brasileiro.
- Se a descrição NÃO informar quantidade, estime gramas realistas considerando contexto, horário comum (café, almoço, jantar), e porções típicas no Brasil.
- Seja específico no "name" (ex: "arroz branco cozido", "feijão carioca cozido", "peito de frango grelhado").
- Tente usar valores nutricionais compatíveis com a base TACO/porções típicas brasileiras.
- Quando houver dúvida, use o contexto da refeição inteira para ser mais assertivo.
- Não inclua duplicatas; normalize itens semelhantes.
- Retorne pelo menos um item quando plausível.
`,
            },
            {
               role: "user",
               content: `Descrição da refeição (português do Brasil):\n${description}\n\nTransforme a descrição acima no array JSON solicitado.`,
            },
         ],
         temperature: 0.25,
      };

      const response = await fetch(
         "https://routellm.abacus.ai/v1/chat/completions",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
         }
      );

      if (!response.ok) {
         const errorText = await response.text();
         devError("Abacus AI Text Error:", errorText);
         throw new Error(`Abacus AI request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
         throw new Error("No response from Abacus AI");
      }

      let aiDetections: Array<{
         name: string;
         category?: string;
         estimated_grams: number;
         confidence?: number;
         nutrition?: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
         };
      }>;

      try {
         const cleanContent = content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
         aiDetections = JSON.parse(cleanContent);
      } catch (parseError) {
         devError("Failed to parse AI text response:", content);
         throw new Error("Invalid AI response format");
      }

      if (!Array.isArray(aiDetections) || aiDetections.length === 0) {
         return [];
      }

      const normalized: DetectedFood[] = aiDetections.map((d) => ({
         name: d.name,
         category: d.category || "Outros",
         estimated_grams: Math.max(1, Number(d.estimated_grams) || 0),
         confidence: typeof d.confidence === "number" ? d.confidence : 0.85,
         nutrition: d.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
         },
      }));

      return normalized;
   } catch (error: any) {
      devError("Error in analyzeMealDescription:", error);
      throw new Error(`Failed to analyze description: ${error.message}`);
   }
}
