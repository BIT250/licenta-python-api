
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DiabetesForm from '@/components/DiabetesForm';
import HeartForm from '@/components/HeartForm';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Health Prediction Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get instant AI-powered predictions for diabetes and heart disease risk based on your health parameters
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/profile">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <User className="mr-2 h-5 w-5" />
                Visit My Profile
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Login / Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Diabetes Prediction Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Diabetes Risk Assessment</CardTitle>
              <CardDescription className="text-red-100">
                Enter your health parameters to assess diabetes risk
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DiabetesForm />
            </CardContent>
          </Card>

          {/* Heart Disease Prediction Form */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Heart Disease Risk Assessment</CardTitle>
              <CardDescription className="text-blue-100">
                Enter your cardiac parameters to assess heart disease risk
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <HeartForm />
            </CardContent>
          </Card>
        </div>

        {/* Footer Section */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-600">
            * This tool provides risk assessments for informational purposes only. 
            Always consult with healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
