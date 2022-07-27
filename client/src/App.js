import { Routes, Route } from 'react-router-dom';
import Main from './Pages/Landing';
import Upload from './Pages/Upload';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Main />} />
      <Route path="/upload" element={<Upload />} />
    </Routes>
  );
}

export default App;
