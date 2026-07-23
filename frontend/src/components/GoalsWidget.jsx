import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const GoalsWidget = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    metricType: 'steps',
    targetValue: ''
  });

  const fetchGoals = async () => {
    try {
      const res = await axios.get('/api/goals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGoals(res.data.data || []);
    } catch (error) {
      console.error('Error fetching goals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/goals', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      setFormData({ title: '', metricType: 'steps', targetValue: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal', error);
    }
  };

  const markCompleted = async (id) => {
    try {
      await axios.put(`/api/goals/${id}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchGoals();
    } catch (error) {
      console.error('Error completing goal', error);
    }
  };

  if (loading) return <div className="p-4">Loading goals...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" /> Goals
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Plus className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <input
            type="text"
            placeholder="Goal Title (e.g. 10k Steps)"
            required
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <div className="flex gap-2">
            <select
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex-1"
              value={formData.metricType}
              onChange={(e) => setFormData({...formData, metricType: e.target.value})}
            >
              <option value="steps">Steps</option>
              <option value="weight">Weight</option>
              <option value="sleepHours">Sleep (hrs)</option>
              <option value="water">Water</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Target"
              required
              className="w-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={formData.targetValue}
              onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700 transition">
            Add Goal
          </button>
        </form>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {goals.length === 0 && !showForm ? (
          <p className="text-gray-500 text-sm">No active goals. Add one!</p>
        ) : (
          goals.map(goal => (
            <div key={goal._id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-lg">
              <div>
                <p className={`font-medium ${goal.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                  {goal.title}
                </p>
                <p className="text-xs text-gray-500 capitalize">{goal.metricType} • Target: {goal.targetValue}</p>
              </div>
              {goal.status === 'active' && (
                <button onClick={() => markCompleted(goal._id)} className="text-green-500 hover:bg-green-50 p-2 rounded-full transition">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default GoalsWidget;
