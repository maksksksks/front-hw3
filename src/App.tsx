import { Outlet } from 'react-router';
import './index.css';
import './App.css';

function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;