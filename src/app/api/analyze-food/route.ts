import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    // Validar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API key da OpenAI não configurada. Configure OPENAI_API_KEY nas variáveis de ambiente." },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um nutricionista especializado em análise de alimentos por imagem. 
          
Analise a imagem fornecida e identifique TODOS os alimentos visíveis.

Para cada alimento, forneça:
1. Nome do alimento
2. Estimativa de calorias (baseado na porção visível)
3. Descrição da porção estimada
4. Nível de confiança da estimativa (alta/média/baixa)

Retorne APENAS um JSON válido no seguinte formato:
{
  "foods": [
    {
      "name": "Nome do alimento",
      "calories": número_de_calorias,
      "portion": "descrição da porção (ex: 1 unidade média, 100g, 1 xícara)",
      "confidence": "alta/média/baixa"
    }
  ],
  "totalCalories": soma_total_de_calorias,
  "notes": "observações importantes sobre a análise ou recomendações nutricionais"
}

Seja preciso e realista nas estimativas. Se não conseguir identificar algum alimento claramente, mencione nas notas.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: image
              }
            },
            {
              type: "text",
              text: "Analise esta imagem e identifique todos os alimentos com suas respectivas calorias."
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error("Resposta vazia da API")
    }

    // Parse do JSON retornado
    const result = JSON.parse(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro na análise:", error)
    
    // Mensagem de erro mais específica
    let errorMessage = "Erro ao analisar a imagem. Tente novamente."
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Chave da API OpenAI inválida ou não configurada."
      } else if (error.message.includes("quota")) {
        errorMessage = "Limite de uso da API OpenAI excedido."
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet."
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
