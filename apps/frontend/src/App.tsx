'use client';

import type React from 'react';
import { useState } from 'react';
import './App.css';

interface Poll {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'closed';
  endDate: string | null;
  image: string;
  action: string;
}

const polls: Poll[] = [
  {
    id: 1,
    title: 'Best Korean Food',
    description: 'Vote for your favorite Korean dish!',
    status: 'active',
    endDate: '3 days',
    image: '/test.png',
    action: 'Vote',
  },
  {
    id: 2,
    title: 'Best Dessert',
    description: 'Which dessert is the best?',
    status: 'closed',
    endDate: null,
    image: '/test.png',
    action: 'View Results',
  },
  {
    id: 3,
    title: 'Favorite Italian Food',
    description: "What's your favorite Italian dish?",
    status: 'active',
    endDate: '5 days',
    image: '/test.png',
    action: 'Vote',
  },
  {
    id: 4,
    title: 'Best Burger',
    description: 'Choose your favorite burger!',
    status: 'closed',
    endDate: null,
    image: '/test.png',
    action: 'View Results',
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tabs = ['All', 'Active', 'Closed'];

  const filteredPolls = polls.filter((poll) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Active' && poll.status === 'active') ||
      (activeTab === 'Closed' && poll.status === 'closed');

    const matchesSearch =
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon"></div>
              <span className="logo-text">FoodPoll</span>
            </div>
            <nav className="nav">
              <a href="#" className="nav-link active">
                Home
              </a>
              <a href="#" className="nav-link">
                Create Poll
              </a>
              <a href="#" className="nav-link">
                My Polls
              </a>
            </nav>
          </div>

          <div className="header-right">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <button className="notification-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div className="avatar">
              <img src="/placeholder.svg?height=32&width=32" alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="main-header">
          <h1 className="main-title">Food Polls</h1>
          <p className="main-subtitle">
            Explore the latest food polls and vote for your favorite dishes
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search for polls"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar-input"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Poll Cards */}
        <div className="polls-section">
          {filteredPolls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <div className="poll-content">
                <div className="poll-info">
                  <img
                    src={poll.image || '/placeholder.svg'}
                    alt={poll.title}
                    className="poll-image"
                  />
                  <div className="poll-details">
                    <h3 className="poll-title">{poll.title}</h3>
                    {poll.status === 'active' && poll.endDate && (
                      <p className="poll-status active">Voting ends in {poll.endDate}</p>
                    )}
                    {poll.status === 'closed' && (
                      <p className="poll-status closed">Voting closed</p>
                    )}
                    <p className="poll-description">{poll.description}</p>
                  </div>
                </div>
                <button
                  className={`poll-button ${poll.status === 'active' ? 'vote-btn' : 'results-btn'}`}
                >
                  {poll.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <span className="pagination-dots">...</span>
          <button className="pagination-btn">10</button>
          <button className="pagination-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
