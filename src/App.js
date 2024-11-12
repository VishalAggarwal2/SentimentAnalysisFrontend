import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2'; // Import Pie chart
import Chart from 'chart.js/auto'; // Import chart.js for chart rendering
import './App.css'; // Custom CSS for themes and UI improvements

const App = () => {
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sentimentReport, setSentimentReport] = useState([]);
  const [finalVerdict, setFinalVerdict] = useState('');
  const [detailedVerdict, setDetailedVerdict] = useState('');
  const [chartData, setChartData] = useState({
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: 'Sentiments Count',
        data: [0, 0, 0],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      },
    ],
  });
  
  const [isDarkMode, setIsDarkMode] = useState(true); // For toggling themes
  const [filter, setFilter] = useState('All'); // Filter for sentiments (All, Positive, Negative, Neutral)

  // Toggle dark/light theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Clear any previous errors

    try {
      const response = await fetch('https://backendsentimentanalysis.onrender.com/generate_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statement }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Set sentiment report and verdicts
      setSentimentReport(data.data); // Assuming 'data' contains sentiment_report
      setFinalVerdict(data.verdict);
      setDetailedVerdict(data.detailed_verdict);

      // Ensure sentiment_report is an array before using reduce
      if (Array.isArray(data.data)) {
        const sentimentCounts = data.data.reduce((acc, { sentiment }) => {
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {});

        // Update chart data for both Bar and Pie charts
        setChartData({
          labels: ['Positive', 'Negative', 'Neutral'],
          datasets: [
            {
              label: 'Sentiments Count',
              data: [
                sentimentCounts['Positive'] || 0,
                sentimentCounts['Negative'] || 0,
                sentimentCounts['Neutral'] || 0,
              ],
              backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
            },
          ],
        });
      } else {
        console.error('Sentiment report is not an array:', data.data);
        setErrorMessage('Sentiment report data is invalid.');
      }
    } catch (error) {
      setErrorMessage(`Failed to generate sentiment report: ${error.message}`);
      console.error('Error generating sentiment report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (sentiment) => {
    setFilter(sentiment);
  };

  // Filter sentiment report based on selected sentiment
  const filteredSentimentReport = sentimentReport.filter((item) => {
    if (filter === 'All') return true;
    return item.sentiment === filter;
  });

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <header className="header">
        <h1>Sentiment Analysis</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Enter the text for sentiment analysis"
          rows="6"
          cols="50"
          className="textarea"
        />
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {sentimentReport.length > 0 && (
        <div className="report-container">
          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button onClick={() => handleFilterChange('All')} className={`filter-btn ${filter === 'All' ? 'active' : ''}`}>All</button>
            <button onClick={() => handleFilterChange('Positive')} className={`filter-btn ${filter === 'Positive' ? 'active' : ''}`}>Positive</button>
            <button onClick={() => handleFilterChange('Negative')} className={`filter-btn ${filter === 'Negative' ? 'active' : ''}`}>Negative</button>
            <button onClick={() => handleFilterChange('Neutral')} className={`filter-btn ${filter === 'Neutral' ? 'active' : ''}`}>Neutral</button>
          </div>

          <div className="chart-container">
            {/* Display Bar Chart */}
            <div className="chart">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            {/* Display Pie Chart */}
            <div className="pie-chart">
              <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="verdict-container">
            <h3>Final Verdict: {finalVerdict}</h3>
            <p>{detailedVerdict}</p>
          </div>

          <div className="sentiment-report">
            <h2>Sentiment Report</h2>
            <ul>
              {filteredSentimentReport.map((item, index) => (
                <li key={index} className="report-item">
                  <strong>{item.heading}</strong>
                  <p>{item.combined_text}</p>
                  <p>Sentiment: {item.sentiment}</p>
                  <p>Polarity: {item.polarity}</p>
                  <p>Subjectivity: {item.subjectivity}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
