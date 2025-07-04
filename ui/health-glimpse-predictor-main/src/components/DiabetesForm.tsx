import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = 'http://127.0.0.1:5000';

const DiabetesForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    bmi: '',
    skinThickness: '',
    insulin: '',
    diabetesPedigree: '',
    testDate: today
  });
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    const fetchAge = async () => {
      const token = localStorage.getItem('sessionToken');
      try {
        const res = await fetch(`${API_BASE}/db/personal_data`, {
          headers: { Authorization: token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.birth_date) {
            const birth = new Date(data.birth_date);
            const todayDate = new Date();
            let diff = todayDate.getFullYear() - birth.getFullYear();
            const m = todayDate.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && todayDate.getDate() < birth.getDate())) diff--;
            setAge(diff.toString());
          }
        }
      } catch (err) {
        console.error('Eroare la preluarea vârstei', err);
      }
    };
    fetchAge();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const requiredFields: (keyof typeof formData)[] = [
        'pregnancies',
        'glucose',
        'bloodPressure',
        'bmi',
        'testDate'
      ];
      const missingFields = requiredFields.filter(f => !formData[f]);
      if (missingFields.length > 0) {
        toast({
          title: "Informații lipsă",
          description: "Te rog completează toate câmpurile obligatorii",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('sessionToken');
      const payload = {
        pregnancies: Number(formData.pregnancies),
        glucose: Number(formData.glucose),
        blood_pressure: Number(formData.bloodPressure),
        skin_thickness: formData.skinThickness ? Number(formData.skinThickness) : 0,
        insulin: formData.insulin ? Number(formData.insulin) : 0,
        bmi: Number(formData.bmi),
        diabetes_pedigree_function: Number(formData.diabetesPedigree),
        age: age ? Number(age) : 0,
        test_date: formData.testDate
      };

      const res = await fetch(`${API_BASE}/ai/predict_diabetes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || ""
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const risk = data.risk;
        const prediction =
          risk === "high" ? "Diabet detectat"
          : risk === "medium" ? "Risc moderat"
          : "Fără risc de diabet";
        setResult(prediction);
        toast({
          title: "Predicție completă",
          description: `Risc diabet: ${prediction}`
        });
      } else {
        toast({
          title: "Predicție eșuată",
          description: "Nu s-a putut obține predicția de la API",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Eroare predicție:", error);
      toast({
        title: "Eroare la predicție",
        description: "A apărut o eroare în timpul predicției",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Date */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="testDate">Data colectării analizelor</Label>
          <Input
            id="testDate"
            type="date"
            value={formData.testDate}
            onChange={e => handleInputChange('testDate', e.target.value)}
          />
        </div>
      </div>
      {/* Pregnancies and Glucose */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pregnancies">Numărul de sarcini anterioare*</Label>
          <Input
            id="pregnancies"
            type="number"
            placeholder="ex. 2"
            value={formData.pregnancies}
            onChange={e => handleInputChange('pregnancies', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="glucose">Concentrația plasmatică de glucoză*</Label>
          <Input
            id="glucose"
            type="number"
            placeholder="ex. 120"
            value={formData.glucose}
            onChange={e => handleInputChange('glucose', e.target.value)}
          />
        </div>
      </div>
      {/* Blood Pressure and BMI */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bloodPressure">Tensiunea arterială diastolică (mmHg)*</Label>
          <Input
            id="bloodPressure"
            type="number"
            placeholder="ex. 80"
            value={formData.bloodPressure}
            onChange={e => handleInputChange('bloodPressure', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bmi">Indicele de masă corporală (kg/m²)*</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            placeholder="ex. 25.5"
            value={formData.bmi}
            onChange={e => handleInputChange('bmi', e.target.value)}
          />
        </div>
      </div>
      {/* Skin Thickness and Insulin */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="skinThickness">Grosimea pliului cutanat triiceps (mm)</Label>
          <Input
            id="skinThickness"
            type="number"
            placeholder="ex. 20"
            value={formData.skinThickness}
            onChange={e => handleInputChange('skinThickness', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="insulin">Nivelul insulinei serice la 2 ore (µU/ml)</Label>
          <Input
            id="insulin"
            type="number"
            placeholder="ex. 85"
            value={formData.insulin}
            onChange={e => handleInputChange('insulin', e.target.value)}
          />
        </div>
      </div>
      {/* Family History Slider */}
      <div>
        <Label htmlFor="diabetesPedigree">
          Cât de sever este istoricul de diabet în familie? (1 = niciunul, 5 = foarte sever)
        </Label>
        <input
          id="diabetesPedigree"
          type="range"
          min="1"
          max="5"
          step="1"
          value={formData.diabetesPedigree}
          onChange={e => handleInputChange('diabetesPedigree', e.target.value)}
          className="w-full"
          list="tickmarks"
        />
        <datalist id="tickmarks">
          <option value="1" label="1"></option>
          <option value="2"></option>
          <option value="3"></option>
          <option value="4"></option>
          <option value="5" label="5"></option>
        </datalist>
        <div className="flex justify-between text-sm text-gray-600 px-2">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
      {/* Predict Button */}
      <Button
        onClick={handlePredict}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 mt-6"
      >
        {isLoading ? 'Se prezice...' : 'Evaluează riscul de diabet'}
      </Button>
      {/* Response Card */}
      {result && (
        <Card className="mt-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Rezultat predicție</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                result === "Diabet detectat"
                  ? "text-red-600"
                  : result === "Risc moderat"
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {result}
            </div>
            <p className="text-gray-600 mt-2">
              {result === "Diabet detectat"
                ? "Risc crescut de diabet. Te rugăm să consulți un specialist."
                : result === "Risc moderat"
                  ? "Risc moderat de diabet. Ia în considerare pași de prevenție."
                  : "Risc scăzut de diabet pe baza parametrilor furnizați."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiabetesForm;