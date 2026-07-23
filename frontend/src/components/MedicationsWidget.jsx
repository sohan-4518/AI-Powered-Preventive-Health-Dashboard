import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicationsWidget = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00']
  });

  const fetchMedications = async () => {
    try {
      const res = await axios.get('/api/medications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMedications(res.data.data || []);
    } catch (error) {
      console.error('Error fetching medications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medications', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      setFormData({ name: '', dosage: '', frequency: 'daily', times: ['08:00'] });
      fetchMedications();
    } catch (error) {
      console.error('Error adding medication', error);
    }
  };

  const deleteMedication = async (id) => {
    try {
      await axios.delete(`/api/medications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMedications();
    } catch (error) {
      console.error('Error deleting medication', error);
    }
  };

  if (loading) return <div className="p-4">Loading medications...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pill className="w-5 h-5 text-blue-500" /> Medications
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Plus className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <input
            type="text"
            placeholder="Medication Name"
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Dosage (e.g. 50mg)"
              required
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={formData.dosage}
              onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            />
            <input
              type="time"
              required
              className="w-32 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={formData.times[0]}
              onChange={(e) => setFormData({...formData, times: [e.target.value]})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
            Add Medication
          </button>
        </form>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {medications.length === 0 && !showForm ? (
          <p className="text-gray-500 text-sm">No medications added.</p>
        ) : (
          medications.map(med => (
            <div key={med._id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{med.name}</p>
                <p className="text-xs text-gray-500">{med.dosage} • {med.frequency} at {med.times.join(', ')}</p>
              </div>
              <button onClick={() => deleteMedication(med._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MedicationsWidget;
