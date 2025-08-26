import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, AlertTriangle, TrendingUp, Activity, Search, Upload, Download, Settings, X } from 'lucide-react';

// ============= COMPOSANTS RÉUTILISABLES =============

// 1. Header Component
const Header = ({ onUpload, onExport, onSettings }) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Système de Prédiction de Ré-hospitalisation
          </h1>
          <p className="text-sm text-gray-600">Analyse prédictive des patients hospitalisés</p>
        </div>
        <div className="flex space-x-3">
          <ActionButton 
            icon={Upload} 
            label="Importer" 
            onClick={onUpload}
            variant="primary"
          />
          <ActionButton 
            icon={Download} 
            label="Exporter" 
            onClick={onExport}
          />
          <ActionButton 
            icon={Settings} 
            label="Paramètres" 
            onClick={onSettings}
          />
        </div>
      </div>
    </div>
  </header>
);

// 2. Action Button Component
const ActionButton = ({ icon: Icon, label, onClick, variant = 'secondary' }) => {
  const baseClasses = "flex items-center px-4 py-2 rounded-lg transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );
};

// 3. Navigation Tabs Component
const NavigationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'analytics', label: 'Analyses', icon: TrendingUp }
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// 4. Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-blue-600" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  </div>
);

// 5. Risk Badge Component
const RiskBadge = ({ risk }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Élevé': return 'text-red-600 bg-red-100';
      case 'Moyen': return 'text-yellow-600 bg-yellow-100';
      case 'Faible': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
      {risk}
    </span>
  );
};

// 6. Progress Bar Component
const ProgressBar = ({ value, max = 1, color = 'blue' }) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500'
  };

  const getColor = () => {
    if (percentage > 70) return 'red';
    if (percentage > 30) return 'yellow';
    return 'green';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${colorClasses[getColor()]}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// 7. Patient Card Component
const PatientCard = ({ patient, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onClick(patient)}
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-gray-800">{patient.name}</h3>
        <p className="text-sm text-gray-600">ID: {patient.id} • Âge: {patient.age} ans</p>
      </div>
      <RiskBadge risk={patient.risk} />
    </div>
    <div className="space-y-2">
      <p className="text-sm"><strong>Condition:</strong> {patient.condition}</p>
      <p className="text-sm"><strong>Score de risque:</strong> {(patient.riskScore * 100).toFixed(1)}%</p>
      <ProgressBar value={patient.riskScore} />
    </div>
  </div>
);

// 8. Search Bar Component
const SearchBar = ({ searchTerm, onSearchChange, onFilterChange }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select 
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="">Tous les risques</option>
        <option value="Élevé">Risque élevé</option>
        <option value="Moyen">Risque moyen</option>
        <option value="Faible">Risque faible</option>
      </select>
    </div>
  </div>
);

// 9. Chart Container Component
const ChartContainer = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

// 10. Modal Component
const Modal = ({ isOpen, onClose, title, children, className = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl shadow-xl ${className} w-full m-4 max-h-[90vh] overflow-y-auto`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// 11. Patient Detail Component
const PatientDetail = ({ patient }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold text-gray-800">{patient.name}</h3>
        <p className="text-gray-600">ID: {patient.id}</p>
      </div>
      <div className="text-right">
        <RiskBadge risk={patient.risk} />
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold text-gray-800">{patient.age}</p>
        <p className="text-sm text-gray-600">Âge</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">{(patient.riskScore * 100).toFixed(1)}%</p>
        <p className="text-sm text-gray-600">Score de Risque</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">3</p>
        <p className="text-sm text-gray-600">Jours restants</p>
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-800 mb-3">Facteurs de Risque Identifiés</h4>
      <div className="space-y-2">
        {patient.factors.map((factor, index) => (
          <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800">{factor}</span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-gray-800 mb-3">Recommandations</h4>
      <RecommendationsList recommendations={[
        "Suivi cardiologique dans les 48h après la sortie",
        "Contrôle glycémique strict", 
        "Programme d'éducation thérapeutique"
      ]} />
    </div>
  </div>
);

// 12. Recommendations List Component
const RecommendationsList = ({ recommendations }) => (
  <ul className="space-y-2">
    {recommendations.map((recommendation, index) => (
      <li key={index} className="flex items-start">
        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
        <span className="text-gray-700">{recommendation}</span>
      </li>
    ))}
  </ul>
);

// 13. Dashboard Stats Component
const DashboardStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
    <StatCard
      icon={Users}
      title="Total Patients"
      value={stats.totalPatients}
      color="text-blue-600"
    />
    <StatCard
      icon={AlertTriangle}
      title="Risque Élevé"
      value={stats.highRisk}
      color="text-red-600"
    />
    <StatCard
      icon={AlertTriangle}
      title="Risque Moyen"
      value={stats.mediumRisk}
      color="text-yellow-600"
    />
    <StatCard
      icon={Users}
      title="Risque Faible"
      value={stats.lowRisk}
      color="text-green-600"
    />
    <StatCard
      icon={TrendingUp}
      title="Précision Modèle"
      value={`${stats.accuracy}%`}
      color="text-purple-600"
    />
  </div>
);

// 14. Charts Grid Component
const ChartsGrid = ({ riskDistribution, riskFactors, monthlyTrends }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <ChartContainer title="Distribution des Risques">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={riskDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {riskDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>

    <ChartContainer title="Facteurs de Risque Principaux">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={riskFactors}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="impact" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  </div>
);

// 15. Monthly Trends Chart Component
const MonthlyTrendsChart = ({ data }) => (
  <ChartContainer title="Tendances Mensuelles">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="predictions" stroke="#3b82f6" name="Prédictions" />
        <Line type="monotone" dataKey="actual" stroke="#ef4444" name="Réel" />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// 16. Patients Grid Component
const PatientsGrid = ({ patients, onPatientClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {patients.map(patient => (
      <PatientCard 
        key={patient.id} 
        patient={patient} 
        onClick={onPatientClick}
      />
    ))}
  </div>
);

// 17. Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// 18. Empty State Component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center p-8">
    <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action && action}
  </div>
);

// ============= COMPOSANT PRINCIPAL =============

const HospitalReadmissionDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Données simulées (remplacer par des appels API)
  const dashboardStats = {
    totalPatients: 1247,
    highRisk: 89,
    mediumRisk: 156,
    lowRisk: 1002,
    accuracy: 87.5
  };

  const riskDistribution = [
    { name: 'Risque Élevé', value: 89, color: '#ef4444' },
    { name: 'Risque Moyen', value: 156, color: '#f59e0b' },
    { name: 'Risque Faible', value: 1002, color: '#10b981' }
  ];

  const monthlyTrends = [
    { month: 'Jan', predictions: 85, actual: 82 },
    { month: 'Fév', predictions: 92, actual: 89 },
    { month: 'Mar', predictions: 78, actual: 76 },
    { month: 'Avr', predictions: 95, actual: 98 },
    { month: 'Mai', predictions: 88, actual: 85 },
    { month: 'Jun', predictions: 89, actual: 87 }
  ];

  const riskFactors = [
    { factor: 'Âge > 65 ans', impact: 0.85 },
    { factor: 'Diabète', impact: 0.72 },
    { factor: 'Hospitalisations précédentes', impact: 0.68 },
    { factor: 'Durée de séjour > 7j', impact: 0.61 },
    { factor: 'Insuffisance cardiaque', impact: 0.58 }
  ];

  const patientsList = [
    {
      id: 'P001',
      name: 'Ahmed Benali',
      age: 72,
      risk: 'Élevé',
      riskScore: 0.89,
      condition: 'Insuffisance cardiaque',
      admissionDate: '2025-08-20',
      factors: ['Âge > 65', 'Diabète', '3 hospitalisations récentes']
    },
    {
      id: 'P002',
      name: 'Fatima Khelif',
      age: 58,
      risk: 'Moyen',
      riskScore: 0.45,
      condition: 'Pneumonie',
      admissionDate: '2025-08-21',
      factors: ['Historique respiratoire', 'Hypertension']
    },
    {
      id: 'P003',
      name: 'Mohamed Saidi',
      age: 34,
      risk: 'Faible',
      riskScore: 0.12,
      condition: 'Appendicectomie',
      admissionDate: '2025-08-22',
      factors: ['Aucun facteur majeur']
    }
  ];

  // Filtrer les patients
  const filteredPatients = patientsList.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = !riskFilter || patient.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Gestionnaires d'événements
  const handleUpload = () => {
    console.log('Upload clicked');
    // Implémenter la logique d'upload
  };

  const handleExport = () => {
    console.log('Export clicked');
    // Implémenter la logique d'export
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // Implémenter la logique des paramètres
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onUpload={handleUpload}
        onExport={handleExport}
        onSettings={handleSettings}
      />

      <NavigationTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <LoadingSpinner />}
        
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardStats stats={dashboardStats} />
            <ChartsGrid 
              riskDistribution={riskDistribution}
              riskFactors={riskFactors}
              monthlyTrends={monthlyTrends}
            />
            <MonthlyTrendsChart data={monthlyTrends} />
          </div>
        )}

        {!loading && activeTab === 'patients' && (
          <div className="space-y-6">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onFilterChange={setRiskFilter}
            />
            {filteredPatients.length > 0 ? (
              <PatientsGrid 
                patients={filteredPatients}
                onPatientClick={setSelectedPatient}
              />
            ) : (
              <EmptyState
                icon={Users}
                title="Aucun patient trouvé"
                description="Essayez de modifier vos critères de recherche"
              />
            )}
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <EmptyState
            icon={TrendingUp}
            title="Module d'Analyses Avancées"
            description="Cette section contiendra des analyses détaillées, des rapports de performance du modèle, et des insights statistiques approfondis."
            action={
              <ActionButton
                icon={TrendingUp}
                label="Générer Rapport Complet"
                variant="primary"
                onClick={() => console.log('Generate report')}
              />
            }
          />
        )}
      </main>

      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Détails du Patient"
      >
        {selectedPatient && <PatientDetail patient={selectedPatient} />}
      </Modal>
    </div>
  );
};

export default HospitalReadmissionDashboard;