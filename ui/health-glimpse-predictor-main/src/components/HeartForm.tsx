
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HeartForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    chestPainType: '',
    restingBP: '',
    cholesterol: '',
    fastingBS: '',
    restingECG: '',
    maxHR: '',
    exerciseAngina: '',
    oldpeak: '',
    stSlope: ''
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
      const requiredFields = ['age', 'sex', 'chestPainType', 'restingBP', 'cholesterol', 'maxHR'];
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
          description: `Heart disease risk: ${mockResult}`,
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
          <Label htmlFor="age">Age*</Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g., 45"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sex">Sex*</Label>
          <Select onValueChange={(value) => handleInputChange('sex', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="chestPainType">Chest Pain Type*</Label>
          <Select onValueChange={(value) => handleInputChange('chestPainType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TA">Typical Angina</SelectItem>
              <SelectItem value="ATA">Atypical Angina</SelectItem>
              <SelectItem value="NAP">Non-Anginal Pain</SelectItem>
              <SelectItem value="ASY">Asymptomatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="restingBP">Resting Blood Pressure*</Label>
          <Input
            id="restingBP"
            type="number"
            placeholder="e.g., 120"
            value={formData.restingBP}
            onChange={(e) => handleInputChange('restingBP', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cholesterol">Cholesterol*</Label>
          <Input
            id="cholesterol"
            type="number"
            placeholder="e.g., 200"
            value={formData.cholesterol}
            onChange={(e) => handleInputChange('cholesterol', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="maxHR">Max Heart Rate*</Label>
          <Input
            id="maxHR"
            type="number"
            placeholder="e.g., 150"
            value={formData.maxHR}
            onChange={(e) => handleInputChange('maxHR', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fastingBS">Fasting Blood Sugar</Label>
          <Select onValueChange={(value) => handleInputChange('fastingBS', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">≤ 120 mg/dl</SelectItem>
              <SelectItem value="1">&gt; 120 mg/dl</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="exerciseAngina">Exercise Angina</Label>
          <Select onValueChange={(value) => handleInputChange('exerciseAngina', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">No</SelectItem>
              <SelectItem value="Y">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="restingECG">Resting ECG</Label>
          <Select onValueChange={(value) => handleInputChange('restingECG', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="ST">ST-T wave abnormality</SelectItem>
              <SelectItem value="LVH">Left ventricular hypertrophy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="oldpeak">ST Depression</Label>
          <Input
            id="oldpeak"
            type="number"
            step="0.1"
            placeholder="e.g., 1.0"
            value={formData.oldpeak}
            onChange={(e) => handleInputChange('oldpeak', e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={handlePredict}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 mt-6"
      >
        {isLoading ? 'Predicting...' : 'Predict Heart Disease Risk'}
      </Button>

      {result && (
        <Card className="mt-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Prediction Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${result === 'Low Risk' ? 'text-green-600' : 'text-red-600'}`}>
              {result}
            </div>
            <p className="text-gray-600 mt-2">
              {result === 'Low Risk' 
                ? 'Your heart disease risk appears to be low based on the provided parameters.'
                : 'Your heart disease risk appears to be elevated. Please consult with a healthcare professional.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeartForm;
