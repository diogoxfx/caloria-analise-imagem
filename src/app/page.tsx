"use client"

import { useState, useRef } from "react"
import { Camera, Upload, Loader2, Utensils, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FoodItem {
  name: string
  calories: number
  portion: string
  confidence: string
}

interface AnalysisResult {
  foods: FoodItem[]
  totalCalories: number
  notes: string
}

export default function CalorIA() {
  const [image, setImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar a imagem")
      }
      
      setResult(data)
    } catch (error) {
      console.error("Erro ao analisar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao analisar a imagem. Tente novamente."
      setError(errorMessage)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Utensils className="w-10 h-10 text-orange-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
              CalorIA
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Descubra as calorias dos seus alimentos com inteligência artificial
          </p>
        </div>

        {/* Upload Area */}
        {!image && (
          <Card className="p-8 mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-all">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  Adicione uma foto do seu prato
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tire uma foto ou escolha da galeria
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Tirar Foto
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Escolher da Galeria
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </Card>
        )}

        {/* Image Preview & Analysis */}
        {image && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl">
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img
                  src={image}
                  alt="Alimento para análise"
                  className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5 mr-2" />
                      Analisar Calorias
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => {
                    setImage(null)
                    setResult(null)
                    setError(null)
                  }}
                  variant="outline"
                  size="lg"
                  className="border-2"
                >
                  Nova Foto
                </Button>
              </div>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                      Erro na análise
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    {error.includes("API key") && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        💡 Configure sua chave da OpenAI nas variáveis de ambiente (OPENAI_API_KEY)
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Results */}
            {result && (
              <Card className="p-6 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border-2 border-orange-200 dark:border-orange-800">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      Análise Nutricional
                    </h2>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                        {result.totalCalories} kcal
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {result.foods.map((food, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                            {food.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {food.portion}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {food.calories}
                          </p>
                          <p className="text-xs text-gray-500">kcal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full transition-all"
                            style={{ width: `${(food.calories / result.totalCalories) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {food.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {result.notes && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Observações:</strong> {result.notes}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>💡 Dica: Para melhores resultados, tire fotos claras e bem iluminadas</p>
        </div>
      </div>
    </div>
  )
}
