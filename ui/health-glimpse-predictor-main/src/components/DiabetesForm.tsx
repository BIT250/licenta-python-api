
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DiabetesForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    glucose: '',
    bloodPressure: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigreeFunction: '',
    age: '',
    pregnancies: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    
    try {
      // Validate form data
      const requiredFields = ['glucose', 'bloodPressure', 'bmi', 'age'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Simulate API call with mock data
      setTimeout(() => {
        const mockResult = Math.random() > 0.5 ? 'Low Risk' : 'High Risk';
        setResult(mockResult);
        toast({
          title: "Prediction Complete",
          description: `Diabetes risk: ${mockResult}`,
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Demo",
        description: "This is a demo. Please connect your actual API endpoint.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="glucose">Glucose Level*</Label>
          <Input
            id="glucose"
            type="number"
            placeholder="e.g., 120"
            value={formData.glucose}
            onChange={(e) => handleInputChange('glucose', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bloodPressure">Blood Pressure*</Label>
          <Input
            id="bloodPressure"
            type="number"
            placeholder="e.g., 80"
            value={formData.bloodPressure}
            onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bmi">BMI*</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            placeholder="e.g., 25.5"
            value={formData.bmi}
            onChange={(e) => handleInputChange('bmi', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="age">Age*</Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g., 35"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="skinThickness">Skin Thickness</Label>
          <Input
            id="skinThickness"
            type="number"
            placeholder="e.g., 20"
            value={formData.skinThickness}
            onChange={(e) => handleInputChange('skinThickness', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="insulin">Insulin</Label>
          <Input
            id="insulin"
            type="number"
            placeholder="e.g., 85"
            value={formData.insulin}
            onChange={(e) => handleInputChange('insulin', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="diabetesPedigreeFunction">Diabetes Pedigree</Label>
          <Input
            id="diabetesPedigreeFunction"
            type="number"
            step="0.001"
            placeholder="e.g., 0.627"
            value={formData.diabetesPedigreeFunction}
            onChange={(e) => handleInputChange('diabetesPedigreeFunction', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pregnancies">Pregnancies</Label>
          <Input
            id="pregnancies"
            type="number"
            placeholder="e.g., 2"
            value={formData.pregnancies}
            onChange={(e) => handleInputChange('pregnancies', e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={handlePredict}
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 mt-6"
      >
        {isLoading ? 'Predicting...' : 'Predict Diabetes Risk'}
      </Button>

      {result && (
        <Card className="mt-6 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg">Prediction Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${result === 'Low Risk' ? 'text-green-600' : 'text-red-600'}`}>
              {result}
            </div>
            <p className="text-gray-600 mt-2">
              {result === 'Low Risk' 
                ? 'Your diabetes risk appears to be low based on the provided parameters.'
                : 'Your diabetes risk appears to be elevated. Please consult with a healthcare professional.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiabetesForm;
