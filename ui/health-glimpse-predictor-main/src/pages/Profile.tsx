
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { User, Edit, History, BarChart3 } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: '35',
    height: '180',
    weight: '75',
    phone: '+1234567890'
  });

  // Mock prediction history data
  const predictionHistory = [
    { id: 1, date: '2024-01-15', type: 'Diabetes', result: 'Low Risk', confidence: '85%' },
    { id: 2, date: '2024-01-10', type: 'Heart Disease', result: 'High Risk', confidence: '92%' },
    { id: 3, date: '2024-01-05', type: 'Diabetes', result: 'Low Risk', confidence: '78%' },
    { id: 4, date: '2023-12-28', type: 'Heart Disease', result: 'Low Risk', confidence: '88%' },
  ];

  // Mock chart data with risk levels
  const riskDistributionData = [
    { risk: 'Low Risk', diabetes: 3, heart: 2, fill: '#22c55e' },
    { risk: 'Average Risk', diabetes: 1, heart: 1, fill: '#f59e0b' },
    { risk: 'High Risk', diabetes: 0, heart: 1, fill: '#ef4444' },
  ];

  const monthlyRiskData = [
    { month: 'Jan', diabetes: 'Low Risk', heart: 'High Risk' },
    { month: 'Feb', diabetes: 'Low Risk', heart: 'High Risk' },
    { month: 'Mar', diabetes: 'Low Risk', heart: 'Average Risk' },
    { month: 'Apr', diabetes: 'Average Risk', heart: 'Low Risk' },
    { month: 'May', diabetes: 'Low Risk', heart: 'Average Risk' },
    { month: 'Jun', diabetes: 'Low Risk', heart: 'Low Risk' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return '#22c55e';
      case 'Average Risk': return '#f59e0b';
      case 'High Risk': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskValue = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 1;
      case 'Average Risk': return 2;
      case 'High Risk': return 3;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and view your health predictions</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Prediction History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Personal Information
                  <Button
                    variant="outline"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Update your personal information and health details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userData.age}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userData.height}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userData.weight}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>
                  View all your previous health risk assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Assessment Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictionHistory.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell>{prediction.date}</TableCell>
                        <TableCell>{prediction.type}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prediction.result === 'Low Risk' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {prediction.result}
                          </span>
                        </TableCell>
                        <TableCell>{prediction.confidence}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                  <CardDescription>
                    Distribution of your risk assessments by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="risk" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="diabetes" name="Diabetes Assessments">
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`diabetes-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Bar dataKey="heart" name="Heart Disease Assessments">
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`heart-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Trend Over Time</CardTitle>
                  <CardDescription>
                    Track how your risk levels have changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRiskData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        domain={[0, 4]}
                        tickFormatter={(value) => {
                          switch (value) {
                            case 1: return 'Low';
                            case 2: return 'Average';
                            case 3: return 'High';
                            default: return '';
                          }
                        }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          const riskLevel = name === 'diabetes' ? 
                            monthlyRiskData.find(d => d.month === value)?.diabetes :
                            monthlyRiskData.find(d => d.month === value)?.heart;
                          return [riskLevel, name === 'diabetes' ? 'Diabetes Risk' : 'Heart Disease Risk'];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={(data) => getRiskValue(data.diabetes)}
                        stroke="#ef4444" 
                        name="diabetes"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={(data) => getRiskValue(data.heart)}
                        stroke="#3b82f6" 
                        name="heart"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Assessment</CardTitle>
                    <CardDescription>Your most recent risk assessments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Diabetes Risk</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Low Risk
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Heart Disease Risk</span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        High Risk
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Summary</CardTitle>
                    <CardDescription>Total assessments completed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">8</div>
                      <div className="text-sm text-gray-600">Total Assessments</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-red-500">4</div>
                        <div className="text-xs text-gray-600">Diabetes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-blue-500">4</div>
                        <div className="text-xs text-gray-600">Heart Disease</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
