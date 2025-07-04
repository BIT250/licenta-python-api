import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = 'http://127.0.0.1:5000';

const HeartForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [formData, setFormData] = useState({
    testDate: today,
    chestPainType: '',
    restingBP: '',
    cholesterol: '',
    maxHR: '',
    fastingBS: '',
    restingECG: '',
    exerciseAngina: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });

  useEffect(() => {
    const fetchPersonal = async () => {
      const token = localStorage.getItem('sessionToken');
      try {
        const res = await fetch(`${API_BASE}/db/personal_data`, {
          headers: { Authorization: token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.birth_date) {
            const b = new Date(data.birth_date);
            const now = new Date();
            let diff = now.getFullYear() - b.getFullYear();
            const m = now.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < b.getDate())) diff--;
            setAge(diff.toString());
          }
          if (data.sex != null) {
            setSex(data.sex.toString());
          }
        }
      } catch (err) {
        console.error('Eroare la preluarea datelor personale', err);
      }
    };
    fetchPersonal();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    const required = ['chestPainType','restingBP','cholesterol','maxHR'] as (keyof typeof formData)[];
    const missing = required.filter(f => !formData[f]);
    if (missing.length) {
      toast({
        title: 'Informații lipsă',
        description: 'Te rog completează toate câmpurile obligatorii',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('sessionToken');
      const payload = {
        age: Number(age),
        sex: Number(sex),
        cp: Number(formData.chestPainType),
        trestbps: Number(formData.restingBP),
        chol: Number(formData.cholesterol),
        fbs: Number(formData.fastingBS),
        restecg: Number(formData.restingECG),
        thalach: Number(formData.maxHR),
        exang: Number(formData.exerciseAngina),
        oldpeak: parseFloat(formData.oldpeak) || 0,
        slope: Number(formData.slope),
        ca: Number(formData.ca),
        thal: Number(formData.thal),
        test_date: formData.testDate
      };
      const res = await fetch(`${API_BASE}/ai/predict_heart_disease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token||'' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const risk = data.risk;
        const message = risk === 'high'
          ? 'Risc ridicat de afecțiune cardiacă.'
          : risk === 'medium'
            ? 'Risc moderat de afecțiune cardiacă.'
            : 'Risc scăzut de afecțiune cardiacă.';
        setResult(message);
        toast({
          title: 'Predicție completă',
          description: message
        });
      } else {
        toast({
          title: 'Predicție eșuată',
          description: 'Nu s-a putut obține predicția',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Eroare la predicție', err);
      toast({
        title: 'Eroare la predicție',
        description: 'A apărut o eroare în timpul predicției',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Label htmlFor="testDate">Data testului</Label>
        <Input
          id="testDate"
          type="date"
          value={formData.testDate}
          onChange={e => handleInputChange('testDate', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="chestPainType">Tipul durerii toracice*</Label>
        <Select onValueChange={v => handleInputChange('chestPainType', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează tip"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Angină tipică</SelectItem>
            <SelectItem value="2">Angină atipică</SelectItem>
            <SelectItem value="3">Durere non-anginoasă</SelectItem>
            <SelectItem value="4">Asimptomatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="restingBP">Tensiune arterială în repaus (mmHg)*</Label>
          <Input
            id="restingBP"
            type="number"
            placeholder="120"
            value={formData.restingBP}
            onChange={e => handleInputChange('restingBP', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cholesterol">Colesterol seric total (mg/dl)*</Label>
          <Input
            id="cholesterol"
            type="number"
            placeholder="200"
            value={formData.cholesterol}
            onChange={e => handleInputChange('cholesterol', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxHR">Frecvență cardiacă maximă (bpm)*</Label>
          <Input
            id="maxHR"
            type="number"
            placeholder="150"
            value={formData.maxHR}
            onChange={e => handleInputChange('maxHR', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fastingBS">Glicemie pe nemâncate &gt;120 mg/dl</Label>
          <Select onValueChange={v => handleInputChange('fastingBS', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">≤ 120 mg/dl</SelectItem>
              <SelectItem value="1">> 120 mg/dl</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="restingECG">Rezultate ECG în repaus</Label>
          <Select onValueChange={v => handleInputChange('restingECG', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Normal</SelectItem>
              <SelectItem value="1">Anomalii ST-T</SelectItem>
              <SelectItem value="2">Hipertrofie ventriculară</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="exerciseAngina">Angină indusă de efort</Label>
          <Select onValueChange={v => handleInputChange('exerciseAngina', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Nu</SelectItem>
              <SelectItem value="1">Da</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="oldpeak">Depresie ST indusă de efort (mm)</Label>
          <Input
            id="oldpeak"
            type="number"
            step="0.1"
            placeholder="1.0"
            value={formData.oldpeak}
            onChange={e => handleInputChange('oldpeak', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="slope">Panta segmentului ST în efort</Label>
          <Select onValueChange={v => handleInputChange('slope', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Ascendentă</SelectItem>
              <SelectItem value="2">Plată</SelectItem>
              <SelectItem value="3">Descendentă</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ca">Număr vase colorate (0–3)</Label>
          <Input
            id="ca"
            type="number"
            min="0"
            max="3"
            placeholder="0"
            value={formData.ca}
            onChange={e => handleInputChange('ca', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="thal">Tipul thalassemiei</Label>
          <Select onValueChange={v => handleInputChange('thal', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selectează"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Normal</SelectItem>
              <SelectItem value="2">Fix</SelectItem>
              <SelectItem value="3">Reversibil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handlePredict}
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 mt-6"
      >
        {isLoading ? 'Se prezice...' : 'Evaluează riscul de boală afecțiune cardiacă'}
      </Button>

      {result && (
        <Card className="mt-6 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle>Rezultatul predicției</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                result.includes('ridicat')
                  ? 'text-red-600'
                  : result.includes('moderat')
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}
            >
              {result}
            </div>
            <p className="text-gray-600 mt-2">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeartForm;