
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const EgzersizlerSayfasi: React.FC = () => {
  const exerciseCategories = [
    {
      title: 'Hafıza Egzersizleri',
      description: 'Kısa ve uzun süreli hafızanızı güçlendirin',
      icon: '🧠',
      exercises: ['Kelime Listesi', 'Sayı Dizisi', 'Görsel Hafıza'],
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Dikkat Egzersizleri',
      description: 'Odaklanma ve dikkat sürenizi artırın',
      icon: '🎯',
      exercises: ['Stroop Testi', 'Görsel Arama', 'Sürekli Performans'],
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      title: 'Problem Çözme',
      description: 'Mantıksal düşünme ve problem çözme becerilerinizi geliştirin',
      icon: '🧩',
      exercises: ['Matematik Problemleri', 'Mantık Bulmacaları', 'Planlama Görevleri'],
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Yürütücü Fonksiyonlar',
      description: 'Planlama, organizasyon ve karar verme becerilerinizi güçlendirin',
      icon: '🎛️',
      exercises: ['Görev Değiştirme', 'Çalışma Hafızası', 'İnhibisyon Kontrolü'],
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bilişsel Egzersizler
        </h1>
        <p className="text-muted-foreground text-lg">
          Zihin sağlığınızı destekleyen egzersizlerle beyin gücünüzü artırın
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {exerciseCategories.map((category, index) => (
          <Card key={index} className={`transition-all duration-200 hover:shadow-lg ${category.color}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" role="img" aria-label={category.title}>
                  {category.icon}
                </span>
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {category.exercises.map((exercise, exerciseIndex) => (
                    <span 
                      key={exerciseIndex}
                      className="text-xs px-2 py-1 bg-background/80 rounded-full border text-muted-foreground"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="default"
                  disabled
                >
                  Yakında Geliyor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Egzersizler Geliştiriliyor</h3>
        <p className="text-muted-foreground">
          Bilimsel araştırmalara dayalı egzersizlerimiz yakında burada olacak. 
          Bu sürümde temel yapı ve kullanıcı deneyimi hazırlanmıştır.
        </p>
      </div>
    </div>
  )
}

export default EgzersizlerSayfasi
