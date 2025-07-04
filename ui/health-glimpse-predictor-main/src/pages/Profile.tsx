import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { User, Edit, History, BarChart3 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000'

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDiabetes, setShowDiabetes] = useState(true);
  const [showHeart, setShowHeart] = useState(true);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [sortField, setSortField] = useState('date_of_prediction');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    riskDistribution: [],
    monthlyTrend: [],
    latestAssessments: { diabetes: null, heart: null }
  });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    phone: '',
    dob: '',
    sex: ''
  });

  // Fetch real personal data from the database
  useEffect(() => {
    const fetchPersonalData = async () => {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`${API_BASE}/db/personal_data`, {
        headers: { Authorization: token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
          dob: data.birth_date,
          sex: data.sex,
          height: data.height,
          weight: data.weight,
          phone: data.phone
        }));
      }
    };
    fetchPersonalData();
  }, []);

  // Fetch prediction history from the database
  useEffect(() => {
    const fetchPredictionHistory = async () => {
      const token = localStorage.getItem('sessionToken');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/db/prediction_history`, {
          headers: { Authorization: token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          setPredictionHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch prediction history:', error);
      }
    };
    fetchPredictionHistory();
  }, []);

  // Fetch analytics data from the database
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const token = localStorage.getItem('sessionToken');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/db/analytics_data`, {
          headers: { Authorization: token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      }
    };
    fetchAnalyticsData();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('sessionToken');
    const payload = {
      name: userData.name,
      birth_date: userData.dob,
      sex: userData.sex,
      weight: userData.weight,
      height: userData.height,
      phone: userData.phone
    };
    const res = await fetch(`${API_BASE}/db/personal_data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || ''
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedHistory = predictionHistory
    .filter(prediction => {
      const typeMatch = filterType === 'all' || prediction.type === filterType;
      const riskMatch = filterRisk === 'all' || prediction.risk === filterRisk;
      return typeMatch && riskMatch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'date_of_prediction') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatRiskText = (risk: string | number) => {
    let key = '';
    if (typeof risk === 'string') {
      const r = risk.toLowerCase();
      key = r.includes('low') ? 'low'
          : r.includes('medium') ? 'medium'
          : r.includes('high') ? 'high'
          : '';
    } else {
      key = risk === 1 ? 'low'
          : risk === 2 ? 'medium'
          : risk === 3 ? 'high'
          : '';
    }
    switch (key) {
      case 'low': return 'Risc scăzut';
      case 'medium': return 'Risc moderat';
      case 'high': return 'Risc crescut';
      default: return 'Necunoscut';
    }
  };

  const getModelResult = (value: number) => {
    return value === 1 ? 'Pozitiv' : 'Negativ';
  };

  const handleBackToPredictions = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profilul meu</h1>
          <p className="text-gray-600">Gestionează-ți informațiile personale și vizualizează-ți predicțiile de sănătate</p>
          <Button variant="outline" onClick={handleBackToPredictions}>
            Înapoi la predicții
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informații personale
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Istoric predicții
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analiză
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Informații personale
                  <Button
                    variant="outline"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Salvează' : 'Editează'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Actualizează informațiile personale și detaliile de sănătate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nume complet</Label>
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
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height">Înălțime (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userData.height}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Greutate (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userData.weight}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Număr de telefon</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Data nașterii</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={userData.dob}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <div className="flex gap-4">
                      <label>
                        <input
                          type="radio"
                          name="sex"
                          value={1}
                          checked={userData.sex === 1}
                          disabled={!isEditing}
                          onChange={() => handleInputChange('sex', 1)}
                        />
                        <span className="ml-1">Masculin</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="sex"
                          value={0}
                          checked={userData.sex === 0}
                          disabled={!isEditing}
                          onChange={() => handleInputChange('sex', 0)}
                        />
                        <span className="ml-1">Feminin</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Istoric predicții</CardTitle>
                <CardDescription>
                  Vizualizează toate evaluările anterioare ale riscului pentru sănătate
                </CardDescription>
                <div className="flex gap-4 mt-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="all">Toate tipurile</option>
                    <option value="Diabet">Diabet</option>
                    <option value="Afecțiuni cardiace">Afecțiuni cardiace</option>
                  </select>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="all">Toate nivelurile de risc</option>
                    <option value="low">Risc scăzut</option>
                    <option value="medium">Risc moderat</option>
                    <option value="high">Risc crescut</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date_of_prediction')}
                      >
                        Dată {sortField === 'date_of_prediction' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('type')}
                      >
                        Tip evaluare {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('risk')}
                      >
                        Risc general {sortField === 'risk' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>TabPFN</TableHead>
                      <TableHead>XGBoost</TableHead>
                      <TableHead>LightGBM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedHistory.map((prediction, index) => (
                      <TableRow key={index}>
                        <TableCell>{prediction.date_of_prediction}</TableCell>
                        <TableCell>{prediction.type}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium`}
                            style={{
                              backgroundColor: `${getRiskColor(prediction.risk)}20`,
                              color: getRiskColor(prediction.risk)
                            }}
                          >
                            {formatRiskText(prediction.risk)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            prediction.tabpfn_response === 1
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getModelResult(prediction.tabpfn_response)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            prediction.xgb_response === 1
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getModelResult(prediction.xgb_response)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            prediction.lgbm_response === 1
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getModelResult(prediction.lgbm_response)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAndSortedHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nicio predicție nu corespunde filtrelor tale
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuția nivelurilor de risc</CardTitle>
                  <CardDescription>
                    Distribuția evaluărilor tale de risc pe categorii
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.riskDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="risk" tickFormatter={formatRiskText} />
                      <YAxis />
                      <Tooltip labelFormatter={formatRiskText} />
                      <Legend />
                      <Bar dataKey="diabetes" name="Evaluări Diabet">
                        {analyticsData.riskDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                      <Bar dataKey="heart" name="Evaluări Afecțiuni Cardiace">
                        {analyticsData.riskDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evoluția riscului în timp</CardTitle>
                  <CardDescription>
                    Urmărește cum au evoluat nivelurile tale de risc de-a lungul timpului
                  </CardDescription>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showDiabetes}
                        onChange={(e) => setShowDiabetes(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: '#3b82f6' }}>Risc diabet</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showHeart}
                        onChange={(e) => setShowHeart(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: '#ef4444' }}>Risc afecțiuni cardiace</span>
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        domain={[0, 4]}
                        tickFormatter={(value) => {
                          switch (value) {
                            case 1: return 'Scăzut';
                            case 2: return 'Moderat';
                            case 3: return 'Crescut';
                            default: return '';
                          }
                        }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                          formatter={(value, name) => {
                            const nivel = value === 1 ? 'Risc scăzut' : value === 2 ? 'Risc moderat' : value === 3 ? 'Risc crescut' : 'Necunoscut';
                            return [nivel, name === 'diabet' ? 'Diabet' : 'Afecțiuni cardiace'];
                          }}
                      />
                      {showDiabetes && (
                        <Line
                          type="monotone"
                          dataKey="diabetes"
                          stroke="#3b82f6"
                          name="diabet"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        />
                      )}
                      {showHeart && (
                        <Line
                          type="monotone"
                          dataKey="heart"
                          stroke="#ef4444"
                          name="afecțiuni cardiace"
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ultima evaluare</CardTitle>
                    <CardDescription>
                      Cele mai recente evaluări de risc
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analyticsData.latestAssessments.diabetes ? (
                      <div className={`flex justify-between items-center p-3 rounded-lg`}
                           style={{ backgroundColor: `${getRiskColor(analyticsData.latestAssessments.diabetes)}20` }}>
                        <span className="font-medium">Risc diabet</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: `${getRiskColor(analyticsData.latestAssessments.diabetes)}40`,
                                color: getRiskColor(analyticsData.latestAssessments.diabetes)
                              }}>
                          {formatRiskText(analyticsData.latestAssessments.diabetes)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Risc diabet</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          Fără date
                        </span>
                      </div>
                    )}

                    {analyticsData.latestAssessments.heart ? (
                      <div className={`flex justify-between items-center p-3 rounded-lg`}
                           style={{ backgroundColor: `${getRiskColor(analyticsData.latestAssessments.heart)}20` }}>
                        <span className="font-medium">Risc afecțiuni cardiace</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: `${getRiskColor(analyticsData.latestAssessments.heart)}40`,
                                color: getRiskColor(analyticsData.latestAssessments.heart)
                              }}>
                          {formatRiskText(analyticsData.latestAssessments.heart)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Risc afecțiuni cardiace</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          Fără date
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rezumat evaluări</CardTitle>
                    <CardDescription>Număr total de evaluări efectuate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{predictionHistory.length}</div>
                      <div className="text-sm text-gray-600">Total evaluări</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-blue-500">
                          {predictionHistory.filter(p => p.type === 'Diabet').length}
                        </div>
                        <div className="text-xs text-gray-600">Diabet</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-red-500">
                          {predictionHistory.filter(p => p.type === 'Afecțiuni cardiace').length}
                        </div>
                        <div className="text-xs text-gray-600">Afecțiuni cardiace</div>
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